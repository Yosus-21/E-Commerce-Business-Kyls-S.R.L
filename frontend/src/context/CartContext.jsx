import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';

/**
 * Context del Carrito de Compras
 */
const CartContext = createContext(null);

/**
 * Estados iniciales del carrito
 */
const initialState = {
    cart: {
        items: [],
        totalAmount: 0,
        itemCount: 0,
    },
    loading: false,
    error: null,
};

/**
 * Reducer para manejar las acciones del carrito
 */
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case 'SET_CART':
            return {
                ...state,
                cart: {
                    items: action.payload.items || [],
                    totalAmount: action.payload.totalAmount || 0,
                    itemCount: action.payload.itemCount || 0,
                },
                loading: false,
                error: null,
            };

        case 'CLEAR_CART':
            return {
                ...state,
                cart: {
                    items: [],
                    totalAmount: 0,
                    itemCount: 0,
                },
                loading: false,
                error: null,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

/**
 * Provider del Carrito de Compras
 * Sincroniza con el estado de autenticación
 */
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { isAuthenticated, user } = useAuth();

    /**
     * Obtener carrito del backend
     */
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            dispatch({ type: 'CLEAR_CART' });
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await cartService.getCart();
            dispatch({ type: 'SET_CART', payload: response.data });
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar carrito' });
        }
    }, [isAuthenticated]);

    /**
     * Sincronizar carrito cuando cambia el estado de autenticación
     */
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [isAuthenticated, fetchCart]);

    /**
     * Agregar producto al carrito
     * @param {string} productId - ID del producto
     * @param {number} quantity - Cantidad a agregar
     */
    const addItem = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            // TODO: Toast notification - "Debes iniciar sesión para agregar productos al carrito"
            throw new Error('Debes iniciar sesión para agregar productos al carrito');
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await cartService.addToCart(productId, quantity);
            dispatch({ type: 'SET_CART', payload: response.data });

            // TODO: Toast notification - "Producto agregado al carrito"
            return response.data;
        } catch (error) {
            const errorMessage = error.message || 'Error al agregar producto al carrito';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });

            // TODO: Toast notification - errorMessage (puede ser "Stock insuficiente")
            throw error;
        }
    };

    /**
     * Actualizar cantidad de un item
     * @param {string} itemId - ID del item en el carrito
     * @param {number} quantity - Nueva cantidad
     */
    const updateQuantity = async (itemId, quantity) => {
        if (!isAuthenticated) {
            throw new Error('No autenticado');
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await cartService.updateCartItem(itemId, quantity);
            dispatch({ type: 'SET_CART', payload: response.data });

            // TODO: Toast notification - "Cantidad actualizada"
            return response.data;
        } catch (error) {
            const errorMessage = error.message || 'Error al actualizar cantidad';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });

            // TODO: Toast notification - errorMessage
            throw error;
        }
    };

    /**
     * Eliminar un item del carrito
     * @param {string} itemId - ID del item en el carrito
     */
    const removeItem = async (itemId) => {
        if (!isAuthenticated) {
            throw new Error('No autenticado');
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await cartService.removeFromCart(itemId);
            dispatch({ type: 'SET_CART', payload: response.data });

            // TODO: Toast notification - "Producto eliminado del carrito"
            return response.data;
        } catch (error) {
            const errorMessage = error.message || 'Error al eliminar producto';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });

            // TODO: Toast notification - errorMessage
            throw error;
        }
    };

    /**
     * Vaciar el carrito completo
     */
    const clear = async () => {
        if (!isAuthenticated) {
            throw new Error('No autenticado');
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            await cartService.clearCart();
            dispatch({ type: 'CLEAR_CART' });

            // TODO: Toast notification - "Carrito vaciado"
        } catch (error) {
            const errorMessage = error.message || 'Error al vaciar carrito';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });

            // TODO: Toast notification - errorMessage
            throw error;
        }
    };

    /**
     * Refrescar el carrito manualmente
     */
    const refreshCart = async () => {
        await fetchCart();
    };

    /**
     * Limpiar errores
     */
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Valor derivado: número total de items en el carrito
    const cartCount = state.cart.itemCount || state.cart.items.reduce((total, item) => total + item.quantity, 0);

    const value = {
        // Estado
        cart: state.cart,
        loading: state.loading,
        error: state.error,
        cartCount, // Valor derivado para badge en navbar

        // Funciones
        addItem,
        updateQuantity,
        removeItem,
        clear,
        refreshCart,
        clearError,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

/**
 * Hook personalizado para consumir el contexto del carrito
 * @returns {Object} Contexto del carrito
 */
export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }

    return context;
};

export default CartContext;
