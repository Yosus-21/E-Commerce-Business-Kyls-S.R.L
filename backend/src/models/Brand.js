const { DataTypes, Model } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');

class Brand extends Model { }

Brand.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: { msg: 'Ya existe una marca con ese nombre' },
            validate: {
                notEmpty: { msg: 'El nombre de la marca es requerido' }
            }
        },
        slug: {
            type: DataTypes.STRING(120),
            unique: true,
            allowNull: true
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'Brand',
        tableName: 'Brands',
        timestamps: true,
        indexes: [
            { fields: ['slug'], unique: true },
            { fields: ['isActive'] }
        ]
    }
);

// ====================================
// HOOK: Auto-generar slug desde name con verificación de unicidad
// Igual que Product.js: garantiza que no haya colisiones de slug
// ====================================
Brand.addHook('beforeValidate', async (brand) => {
    if (brand.name && !brand.slug) {
        let base = slugify(brand.name, {
            lower: true,
            strict: true,
            locale: 'es'
        });
        // Verificar si el slug ya existe (puede pasar si el nombre ya tiene tilde o acento especial)
        const existing = await Brand.findOne({ where: { slug: base } });
        if (existing && existing.id !== brand.id) {
            brand.slug = `${base}-${Date.now()}`;
        } else {
            brand.slug = base;
        }
    }
});

module.exports = Brand;
