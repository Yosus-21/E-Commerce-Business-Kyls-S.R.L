const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Obtener carrito del usuario
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
    // Buscar carrito del usuario con populate de productos
    let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images stock isActive');

    // Si no existe carrito, crear uno vacío
    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalAmount: 0
        });
    }

    // Agregar campo virtual itemCount
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    res.status(200).json({
        success: true,
        data: {
            ...cart.toObject(),
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
    const { productId, quantity } = req.body;

    // ====================================
    // VALIDAR PRODUCTO
    // ====================================
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    if (!product.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Producto no disponible'
        });
    }

    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles`
        });
    }

    // ====================================
    // BUSCAR O CREAR CARRITO
    // ====================================
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: []
        });
    }

    // ====================================
    // VERIFICAR SI PRODUCTO YA ESTÁ EN CARRITO
    // ====================================
    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Producto ya existe, actualizar cantidad
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        // Validar stock para la nueva cantidad
        if (product.stock < newQuantity) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles`
            });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
    } else {
        // Producto nuevo, agregar al carrito
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }

    // Guardar carrito (el middleware pre-save calculará el total)
    await cart.save();

    // Populate y retornar
    await cart.populate('items.product', 'name price images stock isActive');

    res.status(200).json({
        success: true,
        data: cart,
        message: 'Producto agregado al carrito'
    });
});

/**
 * @desc    Actualizar cantidad de un item del carrito
 * @route   PUT /api/cart/update/:itemId
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validar que quantity sea al moins 1
    if (!quantity || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: 'La cantidad debe ser al menos 1'
        });
    }

    // Buscar carrito del usuario
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Carrito no encontrado'
        });
    }

    // Encontrar item en el carrito
    const item = cart.items.id(itemId);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado en el carrito'
        });
    }

    // Validar stock del producto
    const product = await Product.findById(item.product);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles`
        });
    }

    // Actualizar cantidad
    item.quantity = quantity;

    // Guardar carrito
    await cart.save();

    // Populate y retornar
    await cart.populate('items.product', 'name price images stock isActive');

    res.status(200).json({
        success: true,
        data: cart,
        message: 'Cantidad actualizada'
    });
});

/**
 * @desc    Eliminar producto del carrito
 * @route   DELETE /api/cart/remove/:itemId
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Buscar carrito del usuario
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Carrito no encontrado'
        });
    }

    // Filtrar items para remover el producto
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // Guardar carrito
    await cart.save();

    // Populate y retornar
    await cart.populate('items.product', 'name price images stock isActive');

    res.status(200).json({
        success: true,
        data: cart,
        message: 'Producto eliminado del carrito'
    });
});

/**
 * @desc    Vaciar carrito completamente
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
    // Buscar carrito del usuario
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Carrito no encontrado'
        });
    }

    // Vaciar items
    cart.items = [];

    // Guardar carrito
    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Carrito vaciado exitosamente'
    });
});
