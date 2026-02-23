import clsx from 'clsx';

/**
 * Badge Component
 * Etiquetas pequeñas para estados, categorías, etc.
 */
const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    rounded = false,
    className = '',
    ...props
}) => {

    // Variantes de color
    const variants = {
        primary: 'bg-primary-100 text-primary-800 border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
        success: 'bg-success-100 text-success-800 border-success-200',
        warning: 'bg-warning-100 text-warning-800 border-warning-200',
        danger: 'bg-danger-100 text-danger-800 border-danger-200',
    };

    // Tamaños
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const badgeClasses = clsx(
        'inline-flex items-center font-medium border',
        rounded ? 'rounded-full' : 'rounded-md',
        variants[variant],
        sizes[size],
        className
    );

    return (
        <span className={badgeClasses} {...props}>
            {children}
        </span>
    );
};

/**
 * Dot Badge - Badge con punto de color (para notificaciones)
 */
export const DotBadge = ({ variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-primary-600',
        secondary: 'bg-secondary-600',
        success: 'bg-success-600',
        warning: 'bg-warning-600',
        danger: 'bg-danger-600',
    };

    return (
        <span className={clsx('inline-block w-2 h-2 rounded-full', variants[variant], className)} />
    );
};

export default Badge;
