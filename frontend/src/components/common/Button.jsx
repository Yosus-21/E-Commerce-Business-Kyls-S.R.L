import { forwardRef } from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button Component
 * Botón reutilizable con múltiples variantes y estados
 */
const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false,
    ...props
}, ref) => {

    // Estilos base
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 transform rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    // Variantes de color
    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white focus:ring-purple-500 shadow-purple-500/30 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] border-none',
        secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-900 focus:ring-secondary-400 hover:scale-[1.02] hover:shadow-md',
        outline: 'border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 focus:ring-primary-500 hover:shadow-lg hover:scale-[1.02]',
        danger: 'bg-danger-600 hover:bg-danger-500 text-white focus:ring-danger-500 shadow-md hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5',
        ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500 hover:scale-105',
    };

    // Tamaños
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
    };

    const classes = clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
    );

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={classes}
            {...props}
        >
            {isLoading && (
                <LoadingSpinner size="sm" className="mr-2" />
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
