import clsx from 'clsx';

/**
 * LoadingSpinner Component
 * Spinner de carga animado
 */
const LoadingSpinner = ({
    size = 'md',
    color = 'primary',
    className = '',
    ...props
}) => {

    // Tamaños
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4',
    };

    // Colores
    const colors = {
        primary: 'border-primary-600 border-t-transparent',
        secondary: 'border-secondary-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        success: 'border-success-600 border-t-transparent',
    };

    const spinnerClasses = clsx(
        'inline-block rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
    );

    return (
        <div className={spinnerClasses} role="status" aria-label="Cargando" {...props}>
            <span className="sr-only">Cargando...</span>
        </div>
    );
};

/**
 * LoadingOverlay - Overlay con spinner centrado
 */
export const LoadingOverlay = ({ message = 'Cargando...', className = '' }) => {
    return (
        <div className={clsx('flex flex-col items-center justify-center min-h-[200px]', className)}>
            <LoadingSpinner size="lg" />
            {message && (
                <p className="mt-4 text-secondary-600 text-sm font-medium">
                    {message}
                </p>
            )}
        </div>
    );
};

/**
 * FullPageLoader - Loader de pantalla completa
 */
export const FullPageLoader = ({ message = 'Cargando...' }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
                <LoadingSpinner size="xl" />
                {message && (
                    <p className="mt-4 text-secondary-700 text-lg font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
