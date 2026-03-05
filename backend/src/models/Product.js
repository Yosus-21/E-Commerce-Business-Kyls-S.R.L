const { DataTypes, Model } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');

class Product extends Model {
    // ====================================
    // GETTERS (equivalentes a Virtuals en Mongoose)
    // ====================================

    /** Retorna true si hay stock disponible */
    get inStock() {
        return this.stock > 0;
    }

    /** Retorna el precio con descuento aplicado */
    get discountedPrice() {
        if (this.discountPercentage > 0) {
            return parseFloat((this.price * (1 - this.discountPercentage / 100)).toFixed(2));
        }
        return this.price;
    }
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El nombre del producto es requerido' },
                len: { args: [1, 200], msg: 'El nombre no puede exceder 200 caracteres' }
            }
        },
        slug: {
            type: DataTypes.STRING(220),
            unique: true,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'La descripción es requerida' }
            }
        },
        longDescription: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'El precio no puede ser negativo' }
            }
        },
        // categoryId FK → definida en index.js
        // brandId FK → definida en index.js (nullable)
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: { args: [0], msg: 'El stock no puede ser negativo' }
            }
        },
        /**
         * Array de rutas de imágenes almacenadas como JSON
         * Ej: ["/uploads/products/img1.jpg", "/uploads/products/img2.jpg"]
         */
        images: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        /**
         * Especificaciones técnicas como objeto JSON
         * Ej: { "RAM": "8GB", "Procesador": "Intel i5" }
         */
        specifications: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        discountPercentage: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: {
                min: { args: [0], msg: 'El descuento no puede ser negativo' },
                max: { args: [100], msg: 'El descuento no puede exceder 100%' }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        partnerId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        underscored: true,
        timestamps: true,
        // Incluir getters virtuales en toJSON()
        getterMethods: {
            inStock() {
                return this.stock > 0;
            },
            discountedPrice() {
                if (this.discountPercentage > 0) {
                    return parseFloat((this.price * (1 - this.discountPercentage / 100)).toFixed(2));
                }
                return this.price;
            }
        }
    }
);

// ====================================
// HOOK: Auto-generar slug desde name
// ====================================
Product.addHook('beforeValidate', async (product) => {
    if (product.name && !product.slug) {
        let base = slugify(product.name, { lower: true, strict: true, locale: 'es' });
        // Garantizar unicidad del slug añadiendo timestamp si es necesario
        const existing = await Product.findOne({ where: { slug: base } });
        if (existing) {
            product.slug = `${base}-${Date.now()}`;
        } else {
            product.slug = base;
        }
    }
});

module.exports = Product;
