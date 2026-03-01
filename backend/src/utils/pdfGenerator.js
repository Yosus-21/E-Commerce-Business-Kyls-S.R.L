const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generar PDF de cotización profesional
 * @param {Object} quote - Instancia de Quote de Sequelize con include de QuoteItems (as: 'items')
 * @returns {Promise<string>} - Ruta ABSOLUTA del archivo PDF generado en disco
 *
 * Relación Quote → QuoteItems:
 *   - El controller usa loadQuoteWithItems() que hace:
 *       Quote.findOne({ include: [{ model: QuoteItem, as: 'items' }] })
 *   - Por lo tanto, quote.items es un array de instancias QuoteItem
 *   - Campos de cada item: name (STRING), price (DECIMAL→string), quantity (INT),
 *     subtotal (DECIMAL→string), image (STRING nullable)
 *   - Se usa Number() para parsear los DECIMAL que Sequelize devuelve como strings
 *
 * Datos del cliente:
 *   - quote.customerData es un campo JSON guardado directamente en Quote
 *     (name, email, phone, company)
 */
exports.generateQuotePDF = async (quote) => {
    return new Promise((resolve, reject) => {
        try {
            // ── Validaciones defensivas ──────────────────────────────────────────
            if (!quote) {
                return reject(new Error('No se proporcionó la cotización para generar el PDF'));
            }

            // Sequelize devuelve quote.items como array de instancias, pero puede ser undefined
            // si el include falla. Normalizar a array plano.
            const items = Array.isArray(quote.items)
                ? quote.items.map(i => i.toJSON ? i.toJSON() : i)
                : [];

            const customerData = quote.customerData || {};

            // ── Directorios y archivo ───────────────────────────────────────────
            const fileName = `quote-${quote.quoteNumber}.pdf`;
            const uploadsDir = path.join(__dirname, '../../uploads/quotes');
            const filePath = path.join(uploadsDir, fileName);

            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // ── Crear documento PDFKit ──────────────────────────────────────────
            const doc = new PDFDocument({
                size: 'LETTER',
                margins: { top: 30, bottom: 30, left: 35, right: 35 },
                autoFirstPage: true,
                bufferPages: false
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const pageWidth = 612; // LETTER en puntos

            // ── HEADER ──────────────────────────────────────────────────────────
            const logoPath = path.join(__dirname, '../../uploads/logo.png');
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 35, 30, { width: 80 });
                } catch {
                    // Si la imagen no se puede cargar, mostrar texto
                    doc.fontSize(18).font('Helvetica-Bold').fillColor('#7c3aed').text('Business Kyla', 35, 35);
                }
            } else {
                doc.fontSize(18).font('Helvetica-Bold').fillColor('#7c3aed').text('Business Kyla', 35, 35);
            }

            // Título
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
            doc.strokeColor('#7c3aed').lineWidth(2).moveTo(35, 95).lineTo(pageWidth - 35, 95).stroke();

            // ── DATOS DEL CLIENTE ────────────────────────────────────────────────
            let y = 108;

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('DATOS DEL CLIENTE', 35, y);
            y += 15;

            doc.fontSize(8.5)
                .font('Helvetica-Bold').fillColor('#334155')
                .text('Nombre: ', 35, y, { continued: true })
                .font('Helvetica').text(customerData.name || 'N/A');
            y += 12;

            doc.font('Helvetica-Bold').text('Email: ', 35, y, { continued: true })
                .font('Helvetica').text(customerData.email || 'N/A');
            y += 12;

            doc.font('Helvetica-Bold').text('Teléfono: ', 35, y, { continued: true })
                .font('Helvetica').text(customerData.phone || 'N/A');

            if (customerData.company) {
                y += 12;
                doc.font('Helvetica-Bold').text('Empresa: ', 35, y, { continued: true })
                    .font('Helvetica').text(customerData.company);
            }

            y += 20;

            // ── TABLA DE PRODUCTOS ───────────────────────────────────────────────
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
                .text('DETALLE DE PRODUCTOS', 35, y);
            y += 16;

            // Encabezados de tabla
            const tableTop = y;
            doc.rect(35, tableTop, pageWidth - 70, 18).fillAndStroke('#7c3aed', '#7c3aed');

            doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');

            const cols = { producto: 45, cantidad: 360, precio: 430, subtotal: 500 };
            y += 5;

            doc.text('PRODUCTO', cols.producto, y)
                .text('CANT.', cols.cantidad, y)
                .text('P. UNIT.', cols.precio, y)
                .text('SUBTOTAL', cols.subtotal, y);

            y += 18;

            // ── ITEMS (desde QuoteItems de MySQL via Sequelize) ─────────────────
            // NOTA: price y subtotal son DECIMAL en MySQL → Sequelize los retorna como
            // strings o números. Usamos Number() para garantizar que .toFixed(2) funcione.
            const maxItemsPerPage = 25;
            const itemsToShow = items.slice(0, maxItemsPerPage);

            doc.fontSize(7.5).font('Helvetica').fillColor('#334155');

            if (itemsToShow.length === 0) {
                // Fallback si no hay ítems
                doc.text('No hay productos en esta cotización', cols.producto, y, { width: 295 });
                y += 14;
            }

            itemsToShow.forEach((item, index) => {
                // Fondo alterno
                if (index % 2 === 0) {
                    doc.rect(35, y - 1, pageWidth - 70, 14).fillAndStroke('#f8fafc', '#f8fafc');
                }

                const productName = (item.name || 'Producto').length > 45
                    ? (item.name || 'Producto').substring(0, 42) + '...'
                    : (item.name || 'Producto');

                // Number() parsea DECIMALs que Sequelize devuelve como strings en MySQL
                const price = Number(item.price || 0);
                const subtotal = Number(item.subtotal || 0);
                const quantity = Number(item.quantity || 0);

                doc.fillColor('#334155')
                    .text(productName, cols.producto, y, { width: 295 })
                    .text(quantity.toString(), cols.cantidad, y)
                    .text(`Bs ${price.toFixed(2)}`, cols.precio, y)
                    .text(`Bs ${subtotal.toFixed(2)}`, cols.subtotal, y);

                y += 14;
            });

            // Nota si hay más ítems de los que caben en la página
            if (items.length > maxItemsPerPage) {
                y += 5;
                doc.fontSize(7).fillColor('#64748b')
                    .text(`... y ${items.length - maxItemsPerPage} producto(s) más`, cols.producto, y);
                y += 12;
            }

            // ── TOTAL ────────────────────────────────────────────────────────────
            y += 4;
            doc.strokeColor('#7c3aed').lineWidth(1.5)
                .moveTo(360, y).lineTo(pageWidth - 35, y).stroke();
            y += 8;

            // Recuadro del total
            doc.rect(360, y - 2, 217, 22).fillAndStroke('#f8fafc', '#7c3aed');

            const totalAmount = Number(quote.totalAmount || 0);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#7c3aed')
                .text('TOTAL: ', 370, y + 2, { continued: true })
                .text(`Bs ${totalAmount.toFixed(2)}`, { align: 'right' });

            y += 26;

            // Notas (si hay)
            if (quote.notes) {
                y += 8;
                doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155')
                    .text('Notas: ', 35, y, { continued: true })
                    .font('Helvetica').fillColor('#64748b')
                    .text(quote.notes, { width: pageWidth - 70 });
                y += 20;
            }

            // ── FOOTER ───────────────────────────────────────────────────────────
            const footerY = y + 10;

            doc.strokeColor('#e2e8f0').lineWidth(1)
                .moveTo(35, footerY).lineTo(pageWidth - 35, footerY).stroke();

            doc.fontSize(8).fillColor('#475569').font('Helvetica-Bold')
                .text('Business Kyla SRL', 35, footerY + 6, { align: 'center', width: pageWidth - 70 });

            doc.fontSize(7).font('Helvetica').fillColor('#64748b')
                .text('Oficina Central: Manzana 40, Torre 2 – Piso 10, Av. San Martín | Oficina zona Sur: Radial 13 calle 5 # 3295',
                    35, footerY + 16, { align: 'center', width: pageWidth - 70 });

            doc.fillColor('#7c3aed').font('Helvetica-Bold')
                .text('Email: belen.torrico@kyla.com.bo | Tel: +591 796 69569',
                    35, footerY + 26, { align: 'center', width: pageWidth - 70 });

            // ── CERRAR DOCUMENTO ─────────────────────────────────────────────────
            doc.end();

            writeStream.on('finish', () => resolve(filePath));
            writeStream.on('error', (err) => reject(new Error(`Error al escribir PDF: ${err.message}`)));

        } catch (error) {
            reject(new Error(`Error al generar PDF de cotización: ${error.message}`));
        }
    });
};
