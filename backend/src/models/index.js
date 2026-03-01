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
    foreignKey: { name: 'userId', allowNull: false },
    as: 'addresses',
    onDelete: 'CASCADE'
});
UserAddress.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'user'
});

// --- Usuario y Carrito ---
// Un usuario tiene un único carrito (1:1)
User.hasOne(Cart, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'cart',
    onDelete: 'CASCADE'
});
Cart.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'user'
});

// --- Usuario y Cotizaciones ---
// Un usuario puede tener muchas cotizaciones
User.hasMany(Quote, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'quotes',
    onDelete: 'RESTRICT' // No eliminar cotizaciones si se borra el usuario
});
Quote.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'user'
});

// --- Categoría (auto-referencia para subcategorías) ---
Category.hasMany(Category, {
    foreignKey: { name: 'parentId', allowNull: true },
    as: 'children',
    onDelete: 'SET NULL'
});
Category.belongsTo(Category, {
    foreignKey: { name: 'parentId', allowNull: true },
    as: 'parent'
});

// --- Categoría y Productos ---
// Una categoría puede tener muchos productos
Category.hasMany(Product, {
    foreignKey: { name: 'categoryId', allowNull: false },
    as: 'products',
    onDelete: 'RESTRICT'
});
Product.belongsTo(Category, {
    foreignKey: { name: 'categoryId', allowNull: false },
    as: 'category'
});

// --- Marca y Productos ---
// Una marca puede tener muchos productos (opcional)
Brand.hasMany(Product, {
    foreignKey: { name: 'brandId', allowNull: true },
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Brand, {
    foreignKey: { name: 'brandId', allowNull: true },
    as: 'brand'
});

// --- Carrito e Items ---
// Un carrito tiene muchos items
Cart.hasMany(CartItem, {
    foreignKey: { name: 'cartId', allowNull: false },
    as: 'CartItems',
    onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
    foreignKey: { name: 'cartId', allowNull: false },
    as: 'cart'
});

// --- CartItem y Producto ---
// ✅ SET NULL (no CASCADE): si se elimina el producto, el CartItem queda con productId=null
// en lugar de desaparecer — el controlador filtrará los items sin producto válido
Product.hasMany(CartItem, {
    foreignKey: { name: 'productId', allowNull: true },  // allowNull:true para SET NULL
    as: 'cartItems',
    onDelete: 'SET NULL'
});
CartItem.belongsTo(Product, {
    foreignKey: { name: 'productId', allowNull: true },
    as: 'product'
});

// --- Cotización e Items ---
// Una cotización tiene muchos items
Quote.hasMany(QuoteItem, {
    foreignKey: { name: 'quoteId', allowNull: false },
    as: 'items',
    onDelete: 'CASCADE'
});
QuoteItem.belongsTo(Quote, {
    foreignKey: { name: 'quoteId', allowNull: false },
    as: 'quote'
});

// --- QuoteItem y Producto ---
// Cada item de cotización referencia un producto (nullable: puede haberse eliminado)
Product.hasMany(QuoteItem, {
    foreignKey: { name: 'productId', allowNull: true },
    as: 'quoteItems',
    onDelete: 'SET NULL'
});
QuoteItem.belongsTo(Product, {
    foreignKey: { name: 'productId', allowNull: true },
    as: 'product'
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

        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con MySQL (alter: true)');
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
