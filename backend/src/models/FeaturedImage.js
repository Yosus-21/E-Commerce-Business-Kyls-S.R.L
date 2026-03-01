const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class FeaturedImage extends Model { }

FeaturedImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        subtitle: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'La URL de la imagen es requerida' }
            }
        },
        linkUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'FeaturedImage',
        tableName: 'FeaturedImages',
        timestamps: true,
        indexes: [
            { fields: ['isActive'] },
            { fields: ['order'] }
        ]
    }
);

module.exports = FeaturedImage;
