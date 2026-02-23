const axios = require('axios');

// ====================================
// CONFIGURACIÓN
// ====================================
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Colores ANSI para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
};

// Variables globales para almacenar datos
let userToken = '';
let adminToken = '';
let categoryId = '';
let categoryId2 = '';
let categoryId3 = '';
let productId = '';
let productId2 = '';
let productId3 = '';
let orderId = '';
let orderNumber = '';

// Contadores
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestsList = [];

// Datos creados
const createdData = {
    users: 0,
    categories: 0,
    products: 0,
    orders: 0
};

// ====================================
// FUNCIONES AUXILIARES
// ====================================

// Esperar entre requests
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mostrar cabecera de test
function showTestHeader(testNumber, testName) {
    console.log('\n' + colors.cyan + '═'.repeat(60) + colors.reset);
    console.log(colors.cyan + `✅ TEST ${testNumber}: ${testName}` + colors.reset);
    console.log(colors.cyan + '═'.repeat(60) + colors.reset);
}

// Mostrar resultado exitoso
function showSuccess(endpoint, status, data) {
    console.log(colors.blue + `Endpoint: ${endpoint}` + colors.reset);
    console.log(colors.green + `Status: ${status}` + colors.reset);
    console.log(colors.gray + `Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...' + colors.reset);
    console.log(colors.cyan + '─'.repeat(60) + colors.reset);
}

// Mostrar error
function showError(testNumber, testName, error) {
    console.log('\n' + colors.red + '═'.repeat(60) + colors.reset);
    console.log(colors.red + `❌ TEST ${testNumber}: ${testName} FALLÓ` + colors.reset);
    console.log(colors.red + '═'.repeat(60) + colors.reset);

    if (error.response) {
        console.log(colors.red + `Status: ${error.response.status}` + colors.reset);
        console.log(colors.red + `Error:`, error.response.data + colors.reset);
    } else {
        console.log(colors.red + `Error: ${error.message}` + colors.reset);
    }

    console.log(colors.red + '─'.repeat(60) + colors.reset);
}

// Ejecutar test
async function runTest(testNumber, testName, testFn) {
    totalTests++;
    showTestHeader(testNumber, testName);

    try {
        await testFn();
        passedTests++;
    } catch (error) {
        failedTests++;
        failedTestsList.push({ number: testNumber, name: testName });
        showError(testNumber, testName, error);
    }

    await wait(500); // Esperar 500ms entre tests
}

// ====================================
// TESTS
// ====================================

// TEST 1: Verificar servidor
async function test1() {
    await runTest(1, 'Verificar servidor', async () => {
        const response = await axios.get(BASE_URL);
        showSuccess('GET /', response.status, response.data);
    });
}

// TEST 2: Registrar usuario test
async function test2() {
    await runTest(2, 'Registrar usuario test', async () => {
        const userData = {
            name: 'Usuario Test',
            email: `test${Date.now()}@test.com`,
            password: 'Test123456',
            phone: '77123456'
        };

        const response = await axios.post(`${API_URL}/auth/register`, userData);

        // Extraer token correctamente
        if (response.data && response.data.data && response.data.data.token) {
            userToken = response.data.data.token;
            createdData.users++;

            showSuccess('POST /api/auth/register', response.status, response.data);
            console.log(colors.green + `✓ Token guardado: ${userToken.substring(0, 30)}...` + colors.reset);
            console.log(colors.gray + `DEBUG - Token length: ${userToken.length}` + colors.reset);
        } else {
            throw new Error('No se recibió token en la respuesta de registro');
        }
    });
}

// TEST 3: Login con admin
async function test3() {
    await runTest(3, 'Login con admin', async () => {
        const loginData = {
            email: 'admin@businesskyla.com',
            password: 'admin123'
        };

        const response = await axios.post(`${API_URL}/auth/login`, loginData);

        // Extraer token correctamente
        if (response.data && response.data.data && response.data.data.token) {
            adminToken = response.data.data.token;

            showSuccess('POST /api/auth/login', response.status, response.data);
            console.log(colors.green + `✓ Admin Token guardado: ${adminToken.substring(0, 30)}...` + colors.reset);
            console.log(colors.gray + `DEBUG - Admin Token length: ${adminToken.length}` + colors.reset);
        } else {
            throw new Error('No se recibió token en la respuesta de login');
        }
    });
}

// TEST 4: Obtener perfil
async function test4() {
    await runTest(4, 'Obtener perfil (con token)', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('GET /api/auth/me', response.status, response.data);
    });
}

// TEST 5: Crear categoría "Laptops"
async function test5() {
    await runTest(5, 'Crear categoría "Laptops" (admin)', async () => {
        const categoryData = {
            name: 'Laptops',
            description: 'Laptops y notebooks de todas las marcas'
        };

        if (!adminToken) {
            throw new Error('Admin token no disponible');
        }

        const response = await axios.post(`${API_URL}/categories`, categoryData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        categoryId = response.data.data._id;
        createdData.categories++;

        showSuccess('POST /api/categories', response.status, response.data);
        console.log(colors.green + `✓ Category ID guardado: ${categoryId}` + colors.reset);
    });
}

// TEST 6: Crear categoría "Monitores"
async function test6() {
    await runTest(6, 'Crear categoría "Monitores" (admin)', async () => {
        const categoryData = {
            name: 'Monitores',
            description: 'Monitores y pantallas para PC'
        };

        const response = await axios.post(`${API_URL}/categories`, categoryData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        categoryId2 = response.data.data._id;
        createdData.categories++;

        showSuccess('POST /api/categories', response.status, response.data);
        console.log(colors.green + `✓ Category ID 2 guardado: ${categoryId2}` + colors.reset);
    });
}

// TEST 7: Crear categoría "Routers"
async function test7() {
    await runTest(7, 'Crear categoría "Routers" (admin)', async () => {
        const categoryData = {
            name: 'Routers',
            description: 'Routers y equipos de red'
        };

        const response = await axios.post(`${API_URL}/categories`, categoryData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        categoryId3 = response.data.data._id;
        createdData.categories++;

        showSuccess('POST /api/categories', response.status, response.data);
        console.log(colors.green + `✓ Category ID 3 guardado: ${categoryId3}` + colors.reset);
    });
}

// TEST 8: Listar categorías
async function test8() {
    await runTest(8, 'Listar categorías (público)', async () => {
        const response = await axios.get(`${API_URL}/categories`);

        showSuccess('GET /api/categories', response.status, response.data);
        console.log(colors.green + `✓ Categorías creadas: ${response.data.data.length}` + colors.reset);
    });
}

// TEST 9: Crear producto
async function test9() {
    await runTest(9, 'Crear producto "Laptop HP Pavilion 15" (admin)', async () => {
        const productData = {
            name: 'Laptop HP Pavilion 15',
            description: 'Laptop HP Pavilion 15 con procesador Intel Core i5 de 11va generación, 8GB RAM, 512GB SSD',
            price: 6500,
            category: categoryId,
            brand: 'HP',
            stock: 10,
            featured: true,
            specifications: JSON.stringify({
                'Procesador': 'Intel Core i5-1135G7',
                'RAM': '8GB DDR4',
                'Almacenamiento': '512GB SSD',
                'Pantalla': '15.6" Full HD'
            })
        };

        if (!adminToken) {
            throw new Error('Admin token no disponible');
        }

        const response = await axios.post(`${API_URL}/products`, productData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        productId = response.data.data._id;
        createdData.products++;

        showSuccess('POST /api/products', response.status, response.data);
        console.log(colors.green + `✓ Product ID guardado: ${productId}` + colors.reset);
    });
}

// TEST 10: Crear más productos
async function test10() {
    await runTest(10, 'Crear más productos (admin)', async () => {
        // Producto 2
        const product2Data = {
            name: 'Monitor LG 24" Full HD',
            description: 'Monitor LG 24 pulgadas Full HD IPS',
            price: 1200,
            category: categoryId2,
            brand: 'LG',
            stock: 15,
            featured: false,
            specifications: JSON.stringify({
                'Tamaño': '24 pulgadas',
                'Resolución': '1920x1080',
                'Tipo de Panel': 'IPS'
            })
        };

        const response2 = await axios.post(`${API_URL}/products`, product2Data, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        productId2 = response2.data.data._id;
        createdData.products++;

        await wait(300);

        // Producto 3
        const product3Data = {
            name: 'Router TP-Link AC1200',
            description: 'Router inalámbrico de doble banda AC1200',
            price: 450,
            category: categoryId3,
            brand: 'TP-Link',
            stock: 20,
            featured: false,
            specifications: JSON.stringify({
                'Velocidad': '1200 Mbps',
                'Bandas': '2.4GHz y 5GHz'
            })
        };

        const response3 = await axios.post(`${API_URL}/products`, product3Data, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        productId3 = response3.data.data._id;
        createdData.products++;

        showSuccess('POST /api/products (múltiples)', 201, {
            message: 'Productos creados',
            count: 2
        });
        console.log(colors.green + `✓ Productos adicionales creados: 2` + colors.reset);
    });
}

// TEST 11: Listar productos
async function test11() {
    await runTest(11, 'Listar productos (público)', async () => {
        const response = await axios.get(`${API_URL}/products`);

        showSuccess('GET /api/products', response.status, response.data);
        console.log(colors.green + `✓ Productos totales: ${response.data.data.pagination.totalProducts}` + colors.reset);
    });
}

// TEST 12: Obtener producto por ID
async function test12() {
    await runTest(12, 'Obtener producto por ID (público)', async () => {
        const response = await axios.get(`${API_URL}/products/${productId}`);

        showSuccess(`GET /api/products/${productId}`, response.status, response.data);
        console.log(colors.green + `✓ Producto: ${response.data.data.product.name}` + colors.reset);
    });
}

// TEST 13: Agregar producto al carrito
async function test13() {
    await runTest(13, 'Agregar producto al carrito', async () => {
        const cartData = {
            productId: productId,
            quantity: 2
        };

        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.post(`${API_URL}/cart/add`, cartData, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('POST /api/cart/add', response.status, response.data);
        console.log(colors.green + `✓ Producto agregado: 2 unidades` + colors.reset);
    });
}

// TEST 14: Ver carrito
async function test14() {
    await runTest(14, 'Ver carrito', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.get(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('GET /api/cart', response.status, response.data);
        console.log(colors.green + `✓ Total del carrito: Bs. ${response.data.data.totalAmount}` + colors.reset);
    });
}

// TEST 15: Agregar otro producto al carrito
async function test15() {
    await runTest(15, 'Agregar otro producto al carrito', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const cartData = {
            productId: productId2,
            quantity: 1
        };

        const response = await axios.post(`${API_URL}/cart/add`, cartData, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('POST /api/cart/add', response.status, response.data);
        console.log(colors.green + `✓ Segundo producto agregado: 1 unidad` + colors.reset);
    });
}

// TEST 16: Ver carrito actualizado
async function test16() {
    await runTest(16, 'Ver carrito actualizado', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.get(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('GET /api/cart', response.status, response.data);
        console.log(colors.green + `✓ Items en carrito: ${response.data.data.itemCount}` + colors.reset);
        console.log(colors.green + `✓ Total actualizado: Bs. ${response.data.data.totalAmount}` + colors.reset);
    });
}

// TEST 17: Crear orden (checkout)
async function test17() {
    await runTest(17, 'Crear orden (checkout)', async () => {
        const orderData = {
            shippingAddress: {
                name: 'Usuario Test',
                phone: '77123456',
                street: 'Av. Arce #123',
                city: 'La Paz',
                state: 'La Paz',
                zipCode: '0000'
            },
            paymentMethod: 'qr',
            notes: 'Entregar en horario de oficina'
        };

        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.post(`${API_URL}/orders`, orderData, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        orderId = response.data.data._id;
        orderNumber = response.data.data.orderNumber;
        createdData.orders++;

        showSuccess('POST /api/orders', response.status, response.data);
        console.log(colors.green + `✓ Orden creada: ${orderNumber}` + colors.reset);
        console.log(colors.green + `✓ Order ID guardado: ${orderId}` + colors.reset);
    });
}

// TEST 18: Verificar carrito vacío
async function test18() {
    await runTest(18, 'Verificar carrito vacío después de orden', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.get(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('GET /api/cart', response.status, response.data);

        if (response.data.data.items.length === 0) {
            console.log(colors.green + `✓ Carrito vacío correctamente` + colors.reset);
        } else {
            throw new Error('El carrito no se vació después de crear la orden');
        }
    });
}

// TEST 19: Ver mis órdenes
async function test19() {
    await runTest(19, 'Ver mis órdenes', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }

        const response = await axios.get(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess('GET /api/orders', response.status, response.data);
        console.log(colors.green + `✓ Órdenes totales: ${response.data.data.pagination.totalOrders}` + colors.reset);
    });
}

// TEST 20: Ver detalle de orden
async function test20() {
    await runTest(20, 'Ver detalle de orden', async () => {
        if (!userToken) {
            throw new Error('User token no disponible');
        }
        if (!orderId) {
            throw new Error('Order ID no disponible');
        }

        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess(`GET /api/orders/${orderId}`, response.status, response.data);
        console.log(colors.green + `✓ Orden: ${response.data.data.orderNumber}` + colors.reset);
        console.log(colors.green + `✓ Total: Bs. ${response.data.data.totalAmount}` + colors.reset);
    });
}

// TEST 21: Actualizar estado de orden (admin)
async function test21() {
    await runTest(21, 'Actualizar estado de orden (admin)', async () => {
        const statusData = {
            status: 'processing',
            comment: 'Preparando envío - Test automatizado'
        };

        if (!adminToken) {
            throw new Error('Admin token no disponible');
        }
        if (!orderId) {
            throw new Error('Order ID no disponible');
        }

        const response = await axios.put(`${API_URL}/orders/${orderId}/status`, statusData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        showSuccess(`PUT /api/orders/${orderId}/status`, response.status, response.data);
        console.log(colors.green + `✓ Estado actualizado a: processing` + colors.reset);
    });
}

// ====================================
// RESUMEN FINAL
// ====================================
function showSummary() {
    console.log('\n\n');
    console.log(colors.magenta + '╔═══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.magenta + '║' + colors.reset + '              ' + colors.yellow + '📊 RESUMEN DE TESTS' + colors.reset + '                      ' + colors.magenta + '║' + colors.reset);
    console.log(colors.magenta + '╚═══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    console.log(colors.blue + `Total tests ejecutados: ${totalTests}` + colors.reset);
    console.log(colors.green + `✅ Exitosos: ${passedTests}` + colors.reset);
    console.log(colors.red + `❌ Fallidos: ${failedTests}` + colors.reset);

    const percentage = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(colors.cyan + `📊 Porcentaje de éxito: ${percentage}%` + colors.reset);

    console.log('');
    console.log(colors.yellow + '📦 Datos creados durante los tests:' + colors.reset);
    console.log(colors.gray + `   - Usuarios: ${createdData.users}` + colors.reset);
    console.log(colors.gray + `   - Categorías: ${createdData.categories}` + colors.reset);
    console.log(colors.gray + `   - Productos: ${createdData.products}` + colors.reset);
    console.log(colors.gray + `   - Órdenes: ${createdData.orders}` + colors.reset);

    if (failedTests > 0) {
        console.log('');
        console.log(colors.red + '❌ Tests fallidos:' + colors.reset);
        failedTestsList.forEach(test => {
            console.log(colors.red + `   - TEST ${test.number}: ${test.name}` + colors.reset);
        });
    }

    console.log('');
    console.log(colors.magenta + '═'.repeat(60) + colors.reset);

    if (failedTests === 0) {
        console.log(colors.green + '🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE! 🎉' + colors.reset);
    } else {
        console.log(colors.yellow + '⚠️  Algunos tests fallaron. Revisa los errores arriba.' + colors.reset);
    }

    console.log(colors.magenta + '═'.repeat(60) + colors.reset);
    console.log('');
}

// ====================================
// EJECUTAR TODOS LOS TESTS
// ====================================
async function runAllTests() {
    console.log('\n');
    console.log(colors.cyan + '╔═══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.cyan + '║' + colors.reset + '         ' + colors.yellow + '🧪 TESTS AUTOMATIZADOS - BUSINESS KYLA API' + colors.reset + '      ' + colors.cyan + '║' + colors.reset);
    console.log(colors.cyan + '╚═══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log(colors.gray + `Iniciando tests contra: ${BASE_URL}` + colors.reset);
    console.log(colors.gray + `Hora de inicio: ${new Date().toLocaleString()}` + colors.reset);

    try {
        await test1();   // Verificar servidor
        await test2();   // Registrar usuario
        await test3();   // Login admin
        await test4();   // Obtener perfil
        await test5();   // Crear categoría 1
        await test6();   // Crear categoría 2
        await test7();   // Crear categoría 3
        await test8();   // Listar categorías
        await test9();   // Crear producto 1
        await test10();  // Crear productos 2 y 3
        await test11();  // Listar productos
        await test12();  // Obtener producto por ID
        await test13();  // Agregar al carrito
        await test14();  // Ver carrito
        await test15();  // Agregar otro producto
        await test16();  // Ver carrito actualizado
        await test17();  // Crear orden
        await test18();  // Verificar carrito vacío
        await test19();  // Ver mis órdenes
        await test20();  // Ver detalle de orden
        await test21();  // Actualizar estado de orden

    } catch (error) {
        console.log(colors.red + '\n❌ Error crítico en la ejecución de tests:' + colors.reset);
        console.log(colors.red + error.message + colors.reset);
    }

    showSummary();
}

// ====================================
// INICIAR
// ====================================
runAllTests().catch(error => {
    console.error(colors.red + 'Error fatal:', error.message + colors.reset);
    process.exit(1);
});
