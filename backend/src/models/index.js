/**
 * src/models/index.js
 * =============================================
 * Punto central de inicialización de todos los modelos Sequelize.
 * Define todas las asociaciones (FK, relaciones) y ejecuta la sincronización.
 * Este archivo debe ser importado desde server.js ANTES de iniciar el servidor.
 * =============================================
 */

const { sequelize } = require('../config/database');

// ====================================
// IMPORTAR TODOS LOS MODELOS
// ====================================
const User = require('./User');
const UserAddress = require('./UserAddress');
const Category = require('./Category');
const Brand = require('./Brand');
const Product = require('./Product');
const Service = require('./Service');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Quote = require('./Quote');
const QuoteItem = require('./QuoteItem');
const FeaturedImage = require('./FeaturedImage');
const Partner = require('./Partner');

// ====================================
// DEFINIR ASOCIACIONES
// ====================================

// --- Usuario y Direcciones ---
// Un usuario tiene muchas direcciones
User.hasMany(UserAddress, {
    foreignKey: 'userId',
    as: 'addresses',
    onDelete: 'CASCADE'
});
UserAddress.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// --- Usuario y Carrito ---
// Un usuario tiene un único carrito (1:1)
User.hasOne(Cart, {
    foreignKey: 'userId',
    as: 'cart',
    onDelete: 'CASCADE'
});
Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// --- Usuario y Cotizaciones ---
// Un usuario puede tener muchas cotizaciones
User.hasMany(Quote, {
    foreignKey: 'userId',
    as: 'quotes',
    onDelete: 'RESTRICT' // No eliminar cotizaciones si se borra el usuario
});
Quote.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// --- Categoría (auto-referencia para subcategorías) ---
Category.hasMany(Category, {
    foreignKey: 'parentId',
    as: 'children',
    onDelete: 'SET NULL'
});
Category.belongsTo(Category, {
    foreignKey: 'parentId',
    as: 'parent'
});

// --- Categoría y Productos ---
// Una categoría puede tener muchos productos
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
    onDelete: 'RESTRICT'
});
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// --- Marca y Productos ---
// Una marca puede tener muchos productos (opcional)
Brand.hasMany(Product, {
    foreignKey: 'brandId',
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Brand, {
    foreignKey: 'brandId',
    as: 'brand'
});

// --- Carrito e Items ---
// Un carrito tiene muchos items
Cart.hasMany(CartItem, {
    foreignKey: 'cartId',
    as: 'CartItems',
    onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
    foreignKey: 'cartId',
    as: 'cart'
});

// --- CartItem y Producto ---
// ✅ SET NULL (no CASCADE): si se elimina el producto, el CartItem queda con productId=null
// en lugar de desaparecer — el controlador filtrará los items sin producto válido
Product.hasMany(CartItem, {
    foreignKey: 'productId',  // allowNull:true para SET NULL
    as: 'cartItems',
    onDelete: 'SET NULL'
});
CartItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// --- Cotización e Items ---
// Una cotización tiene muchos items
Quote.hasMany(QuoteItem, {
    foreignKey: 'quoteId',
    as: 'items',
    onDelete: 'CASCADE'
});
QuoteItem.belongsTo(Quote, {
    foreignKey: 'quoteId',
    as: 'quote'
});

// --- QuoteItem y Producto ---
// Cada item de cotización referencia un producto (nullable: puede haberse eliminado)
Product.hasMany(QuoteItem, {
    foreignKey: 'productId',
    as: 'quoteItems',
    onDelete: 'SET NULL'
});
QuoteItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// --- Categoría y Servicios ---
Category.hasMany(Service, {
    foreignKey: 'categoryId',
    as: 'services',
    onDelete: 'RESTRICT'
});
Service.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// --- Producto e Imágenes Destacadas ---
Product.hasMany(FeaturedImage, {
    foreignKey: 'productId',
    as: 'featuredImages',
    onDelete: 'SET NULL'
});
FeaturedImage.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// --- Partner y Productos ---
Partner.hasMany(Product, {
    foreignKey: 'partnerId',
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Partner, {
    foreignKey: 'partnerId',
    as: 'partner'
});

// ====================================
// FUNCIÓN DE SINCRONIZACIÓN
// ====================================
/**
 * Sincroniza todos los modelos con la base de datos MySQL.
 * - En development: alter:true → actualiza columnas sin borrar datos
 * - En production: NO sincronizar automáticamente (usar migraciones)
 */
const syncModels = async () => {
    try {
        if (process.env.NODE_ENV === 'production') {
            // En producción no sincronizar automáticamente
            console.log('⚡ Producción: Sincronización automática desactivada. Usar migraciones.');
            return;
        }

        // [Migración PostgreSQL]: Se usa { alter: true } para actualizar la estructura sin borrar datos
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con PostgreSQL (alter: true)');
        console.log('📋 Tablas disponibles: Users, UserAddresses, Categories, Brands, Products, Services, Carts, CartItems, Quotes, QuoteItems, FeaturedImages, Partners');
    } catch (error) {
        console.error('❌ Error al sincronizar modelos:', error.message);
        throw error;
    }
};

// ====================================
// EXPORTAR TODO
// ====================================
module.exports = {
    sequelize,
    syncModels,
    // Modelos
    User,
    UserAddress,
    Category,
    Brand,
    Product,
    Service,
    Cart,
    CartItem,
    Quote,
    QuoteItem,
    FeaturedImage,
    Partner
};
