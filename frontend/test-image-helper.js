/**
 * TEST SCRIPT - Image URL Construction
 * Run this in browser console to verify image helper works correctly
 */

// Simular el helper
const VITE_API_URL = 'http://localhost:5000/api';

function getProductImage(imagePath) {
    // Handle undefined, null, or empty string
    if (!imagePath) {
        return 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen';
    }

    // Si ya es una URL completa (Cloudinary/externa), retornarla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Reemplazar backslashes de Windows con slashes normales
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // Obtener la URL base del servidor (sin /api)
    const apiUrl = VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remover /api si existe

    // Asegurar que la ruta empiece con /uploads
    let cleanPath = normalizedPath;
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    if (!cleanPath.startsWith('/uploads')) {
        cleanPath = '/uploads/' + cleanPath.replace(/^\//, '');
    }

    return `${baseUrl}${cleanPath}`;
}

// CASOS DE PRUEBA
console.log('=== TEST CASES - Image URL Construction ===\n');

// Caso 1: Path con /uploads al inicio
const test1 = getProductImage('/uploads/products/1234-laptop.jpg');
console.log('Test 1 (with /uploads):');
console.log('  Input:  /uploads/products/1234-laptop.jpg');
console.log('  Output:', test1);
console.log('  Expected: http://localhost:5000/uploads/products/1234-laptop.jpg');
console.log('  ✓', test1 === 'http://localhost:5000/uploads/products/1234-laptop.jpg' ? 'PASS' : 'FAIL');
console.log('');

// Caso 2: Path sin / al inicio
const test2 = getProductImage('uploads/products/5678-mouse.png');
console.log('Test 2 (without leading /):');
console.log('  Input:  uploads/products/5678-mouse.png');
console.log('  Output:', test2);
console.log('  Expected: http://localhost:5000/uploads/products/5678-mouse.png');
console.log('  ✓', test2 === 'http://localhost:5000/uploads/products/5678-mouse.png' ? 'PASS' : 'FAIL');
console.log('');

// Caso 3: Path solo con products/ (sin uploads)
const test3 = getProductImage('products/9999-keyboard.jpg');
console.log('Test 3 (without uploads prefix):');
console.log('  Input:  products/9999-keyboard.jpg');
console.log('  Output:', test3);
console.log('  Expected: http://localhost:5000/uploads/products/9999-keyboard.jpg');
console.log('  ✓', test3 === 'http://localhost:5000/uploads/products/9999-keyboard.jpg' ? 'PASS' : 'FAIL');
console.log('');

// Caso 4: Windows backslashes
const test4 = getProductImage('uploads\\products\\1111-monitor.jpg');
console.log('Test 4 (Windows backslashes):');
console.log('  Input:  uploads\\\\products\\\\1111-monitor.jpg');
console.log('  Output:', test4);
console.log('  Expected: http://localhost:5000/uploads/products/1111-monitor.jpg');
console.log('  ✓', test4 === 'http://localhost:5000/uploads/products/1111-monitor.jpg' ? 'PASS' : 'FAIL');
console.log('');

// Caso 5: URL externa (Cloudinary)
const test5 = getProductImage('https://res.cloudinary.com/demo/image/upload/sample.jpg');
console.log('Test 5 (External URL - Cloudinary):');
console.log('  Input:  https://res.cloudinary.com/demo/image/upload/sample.jpg');
console.log('  Output:', test5);
console.log('  Expected: https://res.cloudinary.com/demo/image/upload/sample.jpg');
console.log('  ✓', test5 === 'https://res.cloudinary.com/demo/image/upload/sample.jpg' ? 'PASS' : 'FAIL');
console.log('');

// Caso 6: Null/undefined
const test6 = getProductImage(null);
console.log('Test 6 (null input):');
console.log('  Input:  null');
console.log('  Output:', test6);
console.log('  Expected: https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen');
console.log('  ✓', test6 === 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen' ? 'PASS' : 'FAIL');
console.log('');

// Caso 7: Empty string
const test7 = getProductImage('');
console.log('Test 7 (empty string):');
console.log('  Input:  ""');
console.log('  Output:', test7);
console.log('  Expected: https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen');
console.log('  ✓', test7 === 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen' ? 'PASS' : 'FAIL');
console.log('');

console.log('=== END OF TESTS ===');
