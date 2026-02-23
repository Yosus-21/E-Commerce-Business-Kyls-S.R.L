const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generar PDF de cotización profesional en UNA SOLA PÁGINA
 * @param {Object} quote - Documento de cotización de MongoDB
 * @returns {Promise<string>} - Ruta del archivo PDF generado
 */
exports.generateQuotePDF = async (quote) => {
    return new Promise((resolve, reject) => {
        try {
            // Crear documento PDF con autoPageBreak DESACTIVADO para control total
            const doc = new PDFDocument({
                size: 'LETTER',
                margins: {
                    top: 30,
                    bottom: 30,
                    left: 35,
                    right: 35
                },
                autoFirstPage: true,
                bufferPages: false // No usar buffer para evitar páginas extra
            });

            // Nombre del archivo
            const fileName = `quote-${quote.quoteNumber}.pdf`;
            const uploadsDir = path.join(__dirname, '../../uploads/quotes');
            const filePath = path.join(uploadsDir, fileName);

            // Crear directorio si no existe
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Stream de escritura
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const pageWidth = 612;
            const pageHeight = 792;

            // ===========================================
            // HEADER COMPACTO
            // ===========================================
            const logoPath = path.join(__dirname, '../../uploads/logo.png');

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 35, 30, { width: 80 });
            } else {
                doc.fontSize(20)
                    .font('Helvetica-Bold')
                    .fillColor('#7c3aed')
                    .text('Business Kyla', 35, 35);
            }

            // Título COTIZACIÓN - Más compacto
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .fillColor('#1e293b')
                .text('COTIZACIÓN', pageWidth - 220, 35);

            // Número y fecha
            doc.fontSize(9)
                .font('Helvetica')
                .fillColor('#64748b')
                .text(`Nº: ${quote.quoteNumber}`, pageWidth - 220, 62)
                .text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-BO')}`, pageWidth - 220, 75);

            // Línea separadora
            doc.strokeColor('#7c3aed')
                .lineWidth(2)
                .moveTo(35, 95)
                .lineTo(pageWidth - 35, 95)
                .stroke();

            // ===========================================
            // DATOS DEL CLIENTE - COMPACTO
            // ===========================================
            let y = 108;

            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#1e293b')
                .text('DATOS DEL CLIENTE', 35, y);

            y += 15;

            doc.fontSize(8.5)
                .font('Helvetica-Bold')
                .fillColor('#334155')
                .text('Nombre: ', 35, y, { continued: true })
                .font('Helvetica')
                .text(quote.customerData.name);

            y += 12;

            doc.font('Helvetica-Bold')
                .text('Email: ', 35, y, { continued: true })
                .font('Helvetica')
                .text(quote.customerData.email);

            y += 12;

            doc.font('Helvetica-Bold')
                .text('Teléfono: ', 35, y, { continued: true })
                .font('Helvetica')
                .text(quote.customerData.phone);

            if (quote.customerData.company) {
                y += 12;
                doc.font('Helvetica-Bold')
                    .text('Empresa: ', 35, y, { continued: true })
                    .font('Helvetica')
                    .text(quote.customerData.company);
            }

            y += 20;

            // ===========================================
            // TABLA DE PRODUCTOS - COMPACTA
            // ===========================================
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#1e293b')
                .text('DETALLE DE PRODUCTOS', 35, y);

            y += 16;

            // Encabezados de tabla
            const tableTop = y;
            doc.rect(35, tableTop, pageWidth - 70, 18)
                .fillAndStroke('#7c3aed', '#7c3aed');

            doc.fontSize(8)
                .font('Helvetica-Bold')
                .fillColor('#ffffff');

            const cols = {
                producto: 45,
                cantidad: 360,
                precio: 430,
                subtotal: 500
            };

            y += 5;

            doc.text('PRODUCTO', cols.producto, y)
                .text('CANT.', cols.cantidad, y)
                .text('P. UNIT.', cols.precio, y)
                .text('SUBTOTAL', cols.subtotal, y);

            y += 18;

            // Items - ESCALA DINÁMICA según cantidad de productos
            const maxItemsPerPage = 25;
            const itemsToShow = quote.items.slice(0, maxItemsPerPage);

            doc.fontSize(7.5)
                .font('Helvetica')
                .fillColor('#334155');

            itemsToShow.forEach((item, index) => {
                // Fondo alterno
                if (index % 2 === 0) {
                    doc.rect(35, y - 1, pageWidth - 70, 14)
                        .fillAndStroke('#f8fafc', '#f8fafc');
                }

                // Truncar nombre si es muy largo
                const productName = item.name.length > 45
                    ? item.name.substring(0, 42) + '...'
                    : item.name;

                doc.fillColor('#334155')
                    .text(productName, cols.producto, y, { width: 295 })
                    .text(item.quantity.toString(), cols.cantidad, y)
                    .text(`Bs ${item.price.toFixed(2)}`, cols.precio, y)
                    .text(`Bs ${item.subtotal.toFixed(2)}`, cols.subtotal, y);

                y += 14;
            });

            // Si hay más productos de los que caben, mostrar nota
            if (quote.items.length > maxItemsPerPage) {
                y += 5;
                doc.fontSize(7)
                    .fillColor('#64748b')
                    .text(`... y ${quote.items.length - maxItemsPerPage} producto(s) más`, cols.producto, y);
                y += 12;
            }

            // Línea antes del total
            y += 4;
            doc.strokeColor('#7c3aed')
                .lineWidth(1.5)
                .moveTo(360, y)
                .lineTo(pageWidth - 35, y)
                .stroke();

            // TOTAL
            y += 8;

            doc.rect(360, y - 2, 217, 22)
                .fillAndStroke('#f8fafc', '#7c3aed');

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#7c3aed')
                .text('TOTAL: ', 370, y + 2, { continued: true })
                .text(`Bs ${quote.totalAmount.toFixed(2)}`, { align: 'right' });

            y += 26;

            // ===========================================
            // FOOTER - JUSTO DESPUÉS DEL CONTENIDO
            // ===========================================
            const footerY = y;

            // Línea separadora
            doc.strokeColor('#e2e8f0')
                .lineWidth(1)
                .moveTo(35, footerY)
                .lineTo(pageWidth - 35, footerY)
                .stroke();

            // Business Kyla
            doc.fontSize(8)
                .fillColor('#475569')
                .font('Helvetica-Bold')
                .text('Business Kyla', 35, footerY + 6, { align: 'center', width: pageWidth - 70 });

            // Ubicaciones
            doc.fontSize(7)
                .font('Helvetica')
                .fillColor('#64748b')
                .text(
                    'Oficina Central: Manzana 40, Torre 2 – Piso 10, Av. San Martín | Oficina zona Sur: Radial 13 calle 5 # 3295',
                    35, footerY + 16,
                    { align: 'center', width: pageWidth - 70 }
                );

            // Contacto
            doc.fillColor('#7c3aed')
                .font('Helvetica-Bold')
                .text(
                    'Email: belen.torrico@kyla.com.bo | Tel: +591 796 69569',
                    35, footerY + 26,
                    { align: 'center', width: pageWidth - 70 }
                );

            // FINALIZAR DOCUMENTO - NO AGREGAR MÁS PÁGINAS
            doc.end();

            // Esperar a que termine de escribir
            writeStream.on('finish', () => {
                resolve(filePath);
            });

            writeStream.on('error', (error) => {
                reject(new Error(`Error al generar PDF: ${error.message}`));
            });

        } catch (error) {
            reject(new Error(`Error al crear documento PDF: ${error.message}`));
        }
    });
};
