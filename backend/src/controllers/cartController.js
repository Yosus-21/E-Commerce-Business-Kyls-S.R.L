const { Op } = require('sequelize');
const { Cart, CartItem, Product } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');

// ====================================
// HELPER: Cargar carrito con JOIN profundo
// Cart → CartItems → Product
// Equivalente al .populate('items.product') de Mongoose
// ====================================
const loadCartWithItems = async (userId) => {
    return await Cart.findOne({
        where: { userId },
        include: [
            {
                model: CartItem,
                as: 'CartItems',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'stock', 'images', 'slug', 'isActive'],
                        required: false  // LEFT JOIN: CartItem puede tener productId=null (SET NULL)
                    }
                ]
            }
        ]
    });
};

// ====================================
// HELPER: Recalcular y guardar totalAmount del carrito
// Reemplaza el hook pre('save', calculateTotal) de Mongoose
// ====================================
const recalculateCartTotal = async (cart) => {
    const freshCart = await loadCartWithItems(cart.userId);
    // ✅ Excluir items huérfanos (producto eliminado → productId SET NULL)
    const validItems = (freshCart.CartItems || []).filter(item => item.product !== null);
    const total = validItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );
    cart.totalAmount = parseFloat(total.toFixed(2));
    await cart.save();
    return cart.totalAmount;
};

/**
 * @desc    Obtener el carrito del usuario
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
    let cart = await loadCartWithItems(req.user.id);

    // Si no existe carrito, crear uno vacío (FindOrCreate pattern)
    if (!cart) {
        cart = await Cart.create({ userId: req.user.id, totalAmount: 0 });
        cart.CartItems = [];
    }

    // ✅ Filtrar items huérfanos: producto fue eliminado del catálogo (productId=null)
    const allItems = cart.CartItems || [];
    const validItems = allItems.filter(item => item.product !== null);
    const orphans = allItems.length - validItems.length;

    // Si había huérfanos, eliminarlos y recalcular el total
    if (orphans > 0) {
        const orphanIds = allItems
            .filter(item => item.product === null)
            .map(item => item.id);
        await CartItem.destroy({ where: { id: orphanIds } });
        await recalculateCartTotal(cart);
    }

    const itemCount = validItems.length;

    res.status(200).json({
        success: true,
        data: {
            id: cart.id,
            items: validItems,
            totalAmount: cart.totalAmount,
            itemCount
        }
    });
});

/**
 * @desc    Agregar producto al carrito
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res) => {
    console.log('CARRITO POST BODY:', req.body);
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: 'productId y una cantidad válida son requeridos'
        });
    }

    // 1. Verificar que el producto existe y tiene stock suficiente
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Disponible: ${product.stock}`
        });
    }

    // 2. Obtener o crear el carrito del usuario
    let [cart] = await Cart.findOrCreate({
        where: { userId: req.user.id },
        defaults: { userId: req.user.id, totalAmount: 0 }
    });

    // 3. Verificar si el producto ya está en el carrito
    //    (equivalente al cart.items.findIndex() de Mongoose)
    const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId }
    });

    if (existingItem) {
        // 4a. Item existente → validar stock total y actualizar cantidad
        const newQuantity = existingItem.quantity + parseInt(quantity);
        if (product.stock < newQuantity) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Máximo disponible: ${product.stock}`
            });
        }
        existingItem.quantity = newQuantity;
        existingItem.price = product.price; // actualizar precio por si cambió
        await existingItem.save();
    } else {
        // 4b. Item nuevo → crear registro en CartItems
        await CartItem.create({
            cartId: cart.id,
            productId: product.id,
            quantity: parseInt(quantity),
            price: product.price
        });
    }

    // 5. Recalcular total del carrito
    await recalculateCartTotal(cart);

    // 6. Retornar carrito actualizado con JOIN profundo
    const updatedCart = await loadCartWithItems(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            id: updatedCart.id,
            items: updatedCart.CartItems,
            totalAmount: updatedCart.totalAmount,
            itemCount: updatedCart.CartItems.length
        },
        message: 'Producto agregado al carrito'
    });
});

/**
 * @desc    Actualizar cantidad de un ítem del carrito
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Cantidad inválida' });
    }

    // Obtener carrito del usuario
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
        return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    // Buscar el ítem verificando que pertenece al carrito del usuario
    const cartItem = await CartItem.findOne({
        where: { id: itemId, cartId: cart.id },
        include: [{ model: Product, as: 'product', attributes: ['id', 'stock', 'price'] }]
    });

    if (!cartItem) {
        return res.status(404).json({ success: false, message: 'Ítem no encontrado en el carrito' });
    }

    // Validar stock
    if (cartItem.product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Disponible: ${cartItem.product.stock}`
        });
    }

    // Actualizar cantidad y precio (por si cambió)
    cartItem.quantity = parseInt(quantity);
    cartItem.price = cartItem.product.price;
    await cartItem.save();

    // Recalcular total
    await recalculateCartTotal(cart);

    const updatedCart = await loadCartWithItems(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            id: updatedCart.id,
            items: updatedCart.CartItems,
            totalAmount: updatedCart.totalAmount,
            itemCount: updatedCart.CartItems.length
        },
        message: 'Carrito actualizado'
    });
});

/**
 * @desc    Eliminar un ítem del carrito
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Obtener carrito del usuario
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
        return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    // Buscar ítem verificando pertenencia al carrito
    // (seguridad: evita que un usuario borre ítems ajenos)
    const cartItem = await CartItem.findOne({
        where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
        return res.status(404).json({ success: false, message: 'Ítem no encontrado en el carrito' });
    }

    // Eliminar el ítem (equivalente al cart.items.filter() + save de Mongoose)
    await cartItem.destroy();

    // Recalcular total
    await recalculateCartTotal(cart);

    const updatedCart = await loadCartWithItems(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            id: updatedCart.id,
            items: updatedCart.CartItems,
            totalAmount: updatedCart.totalAmount,
            itemCount: updatedCart.CartItems.length
        },
        message: 'Ítem eliminado del carrito'
    });
});

/**
 * @desc    Vaciar el carrito completamente
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
        return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    // Eliminar TODOS los CartItems del carrito (CASCADE también lo haría,
    // pero lo hacemos explícitamente para registrar el evento)
    await CartItem.destroy({ where: { cartId: cart.id } });

    // Resetear total a 0
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
        success: true,
        data: { id: cart.id, items: [], totalAmount: 0, itemCount: 0 },
        message: 'Carrito vaciado exitosamente'
    });
});
