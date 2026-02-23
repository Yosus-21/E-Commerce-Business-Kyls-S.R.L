// Script para limpiar datos de prueba de la base de datos
require('dotenv').config();
const connectDB = require('../config/database');
const { User, Category, Product, Cart, Order } = require('./index');

const cleanupTestData = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();
        console.log('\n🧹 Limpiando datos de prueba...\n');

        // Limpiar colecciones
        const userResult = await User.deleteMany({ email: { $regex: /test|prueba/i } });
        const categoryResult = await Category.deleteMany({ name: { $regex: /prueba/i } });
        const productResult = await Product.deleteMany({ name: { $regex: /prueba/i } });
        const cartResult = await Cart.deleteMany({});
        const orderResult = await Order.deleteMany({ orderNumber: { $regex: /^ORD-/ } });

        console.log(`✓ Usuarios eliminados: ${userResult.deletedCount}`);
        console.log(`✓ Categorías eliminadas: ${categoryResult.deletedCount}`);
        console.log(`✓ Productos eliminados: ${productResult.deletedCount}`);
        console.log(`✓ Carritos eliminados: ${cartResult.deletedCount}`);
        console.log(`✓ Pedidos eliminados: ${orderResult.deletedCount}`);

        console.log('\n✅ Base de datos limpia\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
};

cleanupTestData();
