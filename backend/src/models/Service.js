const { DataTypes, Model } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');

class Service extends Model { }

Service.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El título del servicio es requerido' },
                len: { args: [1, 200], msg: 'El título no puede exceder 200 caracteres' }
            }
        },
        slug: {
            type: DataTypes.STRING(220),
            unique: true,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        longDescription: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        price: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        /**
         * Lista de características del servicio almacenadas como JSON
         * Ej: ["Instalación incluida", "Garantía 1 año"]
         */
        features: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Service',
        tableName: 'services',
        underscored: true,
        timestamps: true
    }
);

// ====================================
// HOOK: Auto-generar slug desde title y garantizar unicidad
// ====================================
Service.addHook('beforeValidate', async (service) => {
    // Si se acaba de asignar un title pero no un slug
    if (service.title && !service.slug) {
        let baseSlug = slugify(service.title, {
            lower: true,
            strict: true,
            locale: 'es'
        });

        // Buscar si el slug ya existe (incluyendo soft-deleted)
        const existing = await sequelize.models.Service.findOne({ where: { slug: baseSlug } });

        // Si existe un servicio con ese slug, y NO es el mismo servicio (ej: update)
        if (existing && existing.id !== service.id) {
            service.slug = `${baseSlug}-${Date.now()}`;
        } else {
            service.slug = baseSlug;
        }
    }
});

module.exports = Service;
