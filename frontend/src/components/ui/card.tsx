import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all';

    const variantStyles = {
      default: 'bg-white dark:bg-gray-800',
      bordered: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      elevated:
        'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl dark:shadow-gray-900/50',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ children, className = '', ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-600 dark:text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-4 flex items-center gap-2 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
