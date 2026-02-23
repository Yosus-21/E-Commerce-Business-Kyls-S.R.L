const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Service = require('../models/Service');

exports.generateCatalog = async (req, res) => {
    try {
        const { type = 'all', brand } = req.query;

        // 1. Configurar Respuesta
        const filename = `catalogo-${type}-${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // 2. Crear Documento PDF con bufferPages para editar footer después
        const doc = new PDFDocument({
            margin: 0,
            size: 'A4',
            bufferPages: true,
            autoFirstPage: true
        });

        // Manejo de error de stream
        doc.on('error', (err) => {
            console.error('PDF Stream Error:', err);
        });

        doc.pipe(res);

        // Variables de Layout
        const config = {
            margin: 40,
            headerHeight: 130,
            cardHeight: 280,
            colWidth: 240,
            gutter: 35,
            primaryColor: '#9333ea', // Morado Business Kyla
            accentColor: '#22d3ee',  // Cian Neón
            secondaryColor: '#1f2937', // Gris Oscuro
            grayColor: '#9ca3af'
        };

        // Helper para inicializar página con header
        const initPage = (title = 'Catálogo Digital') => {
            generatePremiumHeader(doc, config, title);
            doc.y = config.headerHeight + 20;
            return doc.y;
        };

        // 3. Generar Primera Página
        let currentY = initPage();

        // 4. Obtener Datos
        let products = [];
        let services = [];

        // Filtros
        const productQuery = {};
        if (brand) productQuery.brand = brand;

        if (type === 'products' || type === 'all') {
            products = await Product.find(productQuery).populate('brand category');
        }

        if (type === 'services' || type === 'all') {
            services = await Service.find();
        }

        // 5. Renderizar Productos (Grid 2 Columnas)
        if (products.length > 0) {
            generateSectionTitle(doc, 'Nuestros Productos', config);
            currentY = doc.y;

            for (let i = 0; i < products.length; i++) {
                const item = products[i];
                const colIndex = i % 2; // 0 = Izquierda, 1 = Derecha

                // Si es columna izquierda, verificar espacio
                if (colIndex === 0) {
                    if (currentY + config.cardHeight > doc.page.height - config.margin) {
                        doc.addPage();
                        currentY = initPage();
                        generateSectionTitle(doc, 'Productos (Continuación)', config);
                        currentY = doc.y;
                    }
                }

                // Calcular X según columna
                const x = config.margin + (colIndex * (config.colWidth + config.gutter));

                await drawProductCard(doc, item, x, currentY, config);

                // Si es columna derecha, o es el último ítem, avanzar Y
                if (colIndex === 1 || i === products.length - 1) {
                    currentY += config.cardHeight + 25; // Espacio vertical
                    doc.y = currentY;
                }
            }
        }

        // 6. Renderizar Servicios (Grid 2 Columnas)
        if (services.length > 0) {
            if (products.length > 0) doc.addPage();
            currentY = initPage('Nuestros Servicios');
            generateSectionTitle(doc, 'Servicios Profesionales', config);
            currentY = doc.y;

            for (let i = 0; i < services.length; i++) {
                const item = services[i];
                const colIndex = i % 2;

                if (colIndex === 0) {
                    if (currentY + config.cardHeight > doc.page.height - config.margin) {
                        doc.addPage();
                        currentY = initPage('Nuestros Servicios');
                        generateSectionTitle(doc, 'Servicios (Continuación)', config);
                        currentY = doc.y;
                    }
                }

                const x = config.margin + (colIndex * (config.colWidth + config.gutter));
                await drawProductCard(doc, item, x, currentY, config, true);

                if (colIndex === 1 || i === services.length - 1) {
                    currentY += config.cardHeight + 25;
                    doc.y = currentY;
                }
            }
        }

        // 7. Pie de Página
        generateGlobalFooter(doc, config);

        // Finalizar
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generando el catálogo');
        }
    }
};

// ==========================================
// Funciones Helper de Diseño
// ==========================================

function generatePremiumHeader(doc, config, subTitle) {
    const width = doc.page.width;
    const height = 100;

    // 1. Fondo Morado
    doc.rect(0, 0, width, height).fill(config.primaryColor);

    // 2. Patrón Geométrico Sutil (Círculos Decorativos)
    doc.save(); // Guardar estado para clipping
    doc.circle(width - 50, 0, 100).fillOpacity(0.1).fill('white');
    doc.circle(width - 150, -20, 60).fillOpacity(0.05).fill('white');
    doc.restore();

    // 3. Texto Principal
    doc.fillColor('white').fillOpacity(1); // Restaurar opacidad
    doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('BUSINESS KYLA', config.margin, 35);

    doc
        .fontSize(10)
        .font('Helvetica')
        .text('SOLUCIONES TECNOLÓGICAS INTEGRALES', config.margin, 65, { characterSpacing: 2 });

    // 4. Datos de Contacto (Derecha)
    doc.fontSize(9)
        .text('Av. San Martín, Manzana 40', 0, 35, { align: 'right', width: width - config.margin })
        .text('+591 796 69569', 0, 50, { align: 'right', width: width - config.margin })
        .text('belen.torrico@kyla.com.bo', 0, 65, { align: 'right', width: width - config.margin });

    // 5. Línea de Acento (Cyan)
    doc.rect(0, height, width, 4).fill(config.accentColor);
}

function generateSectionTitle(doc, title, config) {
    doc.moveDown(1.5);
    doc.fontSize(18)
        .fillColor(config.secondaryColor)
        .font('Helvetica-Bold')
        .text(title, config.margin, doc.y);

    // Subrayado moderno corto
    doc.rect(config.margin, doc.y + 5, 40, 3).fill(config.accentColor);
    doc.moveDown(0.8);
}

function resolveImagePath(item) {
    let relativePath = null;

    // Caso 1: Array de imágenes (Productos)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        relativePath = item.images[0];
    }
    // Caso 2: String simple (Servicios/Marcas)
    else if (item.image && typeof item.image === 'string') {
        relativePath = item.image;
    }

    if (!relativePath) return null;

    // Normalizar ruta (quitar slash inicial si existe)
    if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
    }

    // Construir ruta absoluta al sistema de archivos
    // Backend root está 2 niveles arriba de controllers
    const absolutePath = path.join(__dirname, '../../', relativePath);

    return fs.existsSync(absolutePath) ? absolutePath : null;
}

async function drawProductCard(doc, item, x, y, config, isService = false) {
    const cardWidth = config.colWidth;
    const cardHeight = config.cardHeight;
    const padding = 15;

    // 1. Sombra Suave (Rectángulo gris desplazado)
    doc.roundedRect(x + 4, y + 4, cardWidth, cardHeight, 8)
        .fill('#f3f4f6');

    // 2. Tarjeta Blanca
    doc.roundedRect(x, y, cardWidth, cardHeight, 8)
        .fill('white')
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();

    // 3. Imagen
    const imagePath = resolveImagePath(item);
    const imageH = 140;
    const imageY = y + padding;

    try {
        if (imagePath) {
            doc.image(imagePath, x + padding, imageY, {
                fit: [cardWidth - (padding * 2), imageH],
                align: 'center',
                valign: 'center'
            });
        } else {
            // Placeholder si no hay imagen
            doc.roundedRect(x + padding + 60, imageY + 40, 80, 60, 4).fill('#f9fafb');
            doc.fillColor(config.grayColor).fontSize(9).text('Sin Foto', x, imageY + 65, { align: 'center', width: cardWidth });
        }
    } catch (e) {
        // En caso de error de formato de imagen
        doc.fillColor(config.grayColor).fontSize(9).text('Error Img', x, imageY + 65, { align: 'center', width: cardWidth });
    }

    // 4. Texto
    const textY = y + imageH + padding;

    // Título
    doc.fillColor(config.secondaryColor)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(item.name || item.title, x + padding, textY, {
            width: cardWidth - (padding * 2),
            height: 28,
            ellipsis: true
        });

    // Descripción
    doc.font('Helvetica')
        .fontSize(9)
        .fillColor(config.grayColor)
        .text(item.description || '', x + padding, textY + 32, {
            width: cardWidth - (padding * 2),
            height: 26,
            ellipsis: true
        });

    // Precio / Etiqueta
    if (!isService && item.price) {
        // Fondo de precio (Pill shape)
        doc.roundedRect(x + padding, textY + 70, 80, 24, 12)
            .fill('#f3f4f6');

        doc.fillColor(config.primaryColor)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text(`${item.price} Bs`, x + padding, textY + 76, { width: 80, align: 'center' });

        // Stock
        if (item.stock > 0) {
            doc.fillColor('#10b981').fontSize(9).text(`${item.stock} en stock`, x + padding + 90, textY + 78);
        } else {
            doc.fillColor('#ef4444').fontSize(9).text('Agotado', x + padding + 90, textY + 78);
        }

    } else if (isService) {
        doc.roundedRect(x + padding, textY + 70, 100, 24, 12).fill('#f0f9ff');
        doc.fillColor(config.accentColor)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Servicio Profesional', x + padding, textY + 77, { width: 100, align: 'center' });
    }
}

function generateGlobalFooter(doc, config) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        // Línea separadora
        doc.strokeColor('#e5e7eb').lineWidth(1)
            .moveTo(config.margin, doc.page.height - 40)
            .lineTo(doc.page.width - config.margin, doc.page.height - 40)
            .stroke();

        // Texto
        doc.fillColor(config.grayColor)
            .fontSize(8)
            .text(
                `Catálogo ${new Date().getFullYear()} — Business Kyla SRL`,
                config.margin,
                doc.page.height - 25,
                { align: 'left' }
            );

        doc.text(
            `Página ${i + 1} de ${pages.count}`,
            0,
            doc.page.height - 25,
            { align: 'right', width: doc.page.width - config.margin }
        );
    }
}
