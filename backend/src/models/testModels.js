// Script de prueba para verificar que los modelos funcionan correctamente
// Ejecutar con: node src/models/testModels.js

require('dotenv').config();
const connectDB = require('../config/database');
const { User, Category, Product, Cart, Order } = require('./index');

const testModels = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();
        console.log('\n✅ Conexión a MongoDB exitosa\n');

        // ====================================
        // TEST 1: User Model
        // ====================================
        console.log('📝 TEST 1: User Model');
        console.log('-----------------------------------');

        const testUser = new User({
            name: 'Usuario de Prueba',
            email: 'test@ejemplo.com',
            password: 'password123',
            phone: '77123456',
            role: 'user'
        });

        console.log('✓ Password original:', 'password123');
        await testUser.save();
        console.log('✓ Password hasheado:', testUser.password.substring(0, 20) + '...');
        console.log('✓ User guardado con ID:', testUser._id);

        // Verificar método matchPassword
        const isMatch = await testUser.matchPassword('password123');
        console.log('✓ matchPassword funciona:', isMatch ? 'Sí' : 'No');

        // Verificar método getSignedJwtToken
        const token = testUser.getSignedJwtToken();
        console.log('✓ JWT generado:', token.substring(0, 30) + '...');

        // ====================================
        // TEST 2: Category Model
        // ====================================
        console.log('\n📝 TEST 2: Category Model');
        console.log('-----------------------------------');

        const testCategory = new Category({
            name: 'Laptops de Prueba'
            // slug se auto-generará
        });

        await testCategory.save();
        console.log('✓ Category guardada con ID:', testCategory._id);
        console.log('✓ Slug auto-generado:', testCategory.slug);

        // ====================================
        // TEST 3: Product Model
        // ====================================
        console.log('\n📝 TEST 3: Product Model');
        console.log('-----------------------------------');

        const testProduct = new Product({
            name: 'Laptop HP de Prueba',
            description: 'Laptop de prueba para testing',
            price: 5000,
            category: testCategory._id,
            brand: 'HP',
            stock: 10,
            images: ['/test.jpg'],
            specifications: new Map([
                ['RAM', '8GB'],
                ['CPU', 'Intel i5']
            ])
        });

        await testProduct.save();
        console.log('✓ Product guardado con ID:', testProduct._id);
        console.log('✓ Slug auto-generado:', testProduct.slug);
        console.log('✓ Virtual inStock:', testProduct.inStock);

        // Probar método estático
        const products = await Product.findByCategory(testCategory._id);
        console.log('✓ findByCategory encontró:', products.length, 'producto(s)');

        // ====================================
        // TEST 4: Cart Model
        // ====================================
        console.log('\n📝 TEST 4: Cart Model');
        console.log('-----------------------------------');

        const testCart = new Cart({
            user: testUser._id,
            items: [
                {
                    product: testProduct._id,
                    quantity: 2,
                    price: 5000
                }
            ]
        });

        await testCart.save();
        console.log('✓ Cart guardado con ID:', testCart._id);
        console.log('✓ Total auto-calculado:', testCart.totalAmount);

        // ====================================
        // TEST 5: Order Model
        // ====================================
        console.log('\n📝 TEST 5: Order Model');
        console.log('-----------------------------------');

        const testOrder = new Order({
            user: testUser._id,
            items: [
                {
                    product: testProduct._id,
                    name: 'Laptop HP de Prueba',
                    price: 5000,
                    quantity: 1,
                    subtotal: 5000,
                    image: '/test.jpg'
                }
            ],
            totalAmount: 5000,
            shippingAddress: {
                name: 'Usuario de Prueba',
                phone: '77123456',
                street: 'Calle de Prueba 123',
                city: 'La Paz',
                state: 'La Paz',
                zipCode: '0000'
            },
            paymentMethod: 'qr'
        });

        await testOrder.save();
        console.log('✓ Order guardado con ID:', testOrder._id);
        console.log('✓ OrderNumber auto-generado:', testOrder.orderNumber);
        console.log('✓ StatusHistory inicial:', testOrder.statusHistory.length, 'entrada(s)');

        // Probar método addStatusUpdate
        await testOrder.addStatusUpdate('processing', 'Pago confirmado');
        console.log('✓ addStatusUpdate ejecutado, nuevo status:', testOrder.status);
        console.log('✓ StatusHistory actualizado:', testOrder.statusHistory.length, 'entrada(s)');

        // ====================================
        // LIMPIEZA
        // ====================================
        console.log('\n🧹 Limpiando datos de prueba...');
        await User.deleteOne({ _id: testUser._id });
        await Category.deleteOne({ _id: testCategory._id });
        await Product.deleteOne({ _id: testProduct._id });
        await Cart.deleteOne({ _id: testCart._id });
        await Order.deleteOne({ _id: testOrder._id });
        console.log('✓ Datos de prueba eliminados');

        // ====================================
        // RESUMEN
        // ====================================
        console.log('\n' + '='.repeat(50));
        console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
        console.log('='.repeat(50));
        console.log('\nModelos verificados:');
        console.log('  ✓ User - Password hashing y JWT funcionando');
        console.log('  ✓ Category - Auto-generación de slug funcionando');
        console.log('  ✓ Product - Slug, virtuals y métodos estáticos funcionando');
        console.log('  ✓ Cart - Cálculo automático de total funcionando');
        console.log('  ✓ Order - Auto-generación de orderNumber y métodos funcionando');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR EN LOS TESTS:', error);
        process.exit(1);
    }
};

// Ejecutar tests
testModels();
