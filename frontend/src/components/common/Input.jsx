import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Input Component
 * Campo de entrada reutilizable con soporte para labels, errores y diferentes tipos
 */
const Input = forwardRef(({
    label,
    error,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    ...props
}, ref) => {

    const inputClasses = clsx(
        'w-full px-4 py-2 border rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'placeholder:text-secondary-400',
        error
            ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
            : 'border-secondary-300 hover:border-secondary-400',
        'disabled:bg-secondary-50 disabled:cursor-not-allowed disabled:text-secondary-500',
        className
    );

    return (
        <div className={clsx('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <input
                ref={ref}
                type={type}
                className={inputClasses}
                {...props}
            />

            {error && (
                <p className="mt-1.5 text-sm text-danger-600">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
