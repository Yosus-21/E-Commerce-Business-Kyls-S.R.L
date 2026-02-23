import clsx from 'clsx';

/**
 * Card Component
 * Contenedor de tarjeta limpio con sombras suaves
 */
const Card = ({
    children,
    className = '',
    hoverable = false,
    padding = true,
    ...props
}) => {

    const cardClasses = clsx(
        'bg-white rounded-xl shadow-sm border border-secondary-100',
        'transition-shadow duration-200',
        hoverable && 'hover:shadow-md cursor-pointer',
        padding && 'p-6',
        className
    );

    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    );
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '' }) => (
    <div className={clsx('mb-4', className)}>
        {children}
    </div>
);

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '' }) => (
    <h3 className={clsx('text-xl font-semibold text-secondary-900', className)}>
        {children}
    </h3>
);

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '' }) => (
    <div className={clsx('text-secondary-700', className)}>
        {children}
    </div>
);

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '' }) => (
    <div className={clsx('mt-4 pt-4 border-t border-secondary-100', className)}>
        {children}
    </div>
);

export default Card;
