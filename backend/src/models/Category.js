const { DataTypes, Model } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');

class Category extends Model { }

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: { msg: 'Ya existe una categoría con ese nombre' },
            validate: {
                notEmpty: { msg: 'El nombre de la categoría es requerido' },
                len: { args: [1, 100], msg: 'El nombre no puede exceder 100 caracteres' }
            }
        },
        slug: {
            type: DataTypes.STRING(120),
            unique: true,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: { args: [0, 500], msg: 'La descripción no puede exceder 500 caracteres' }
            }
        },
        // parentId FK → auto-referencia definida en index.js
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'Category',
        tableName: 'Categories',
        timestamps: true,
        indexes: [
            { fields: ['slug'], unique: true },
            { fields: ['isActive'] }
        ]
    }
);

// ====================================
// HOOK: Auto-generar slug desde name con verificación de unicidad
// ====================================
Category.addHook('beforeValidate', async (category) => {
    if (category.name && !category.slug) {
        let base = slugify(category.name, {
            lower: true,
            strict: true,
            locale: 'es'
        });
        const existing = await Category.findOne({ where: { slug: base } });
        if (existing && existing.id !== category.id) {
            category.slug = `${base}-${Date.now()}`;
        } else {
            category.slug = base;
        }
    }
});

module.exports = Category;
