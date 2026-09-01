import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** @deprecated Use leftIcon instead */
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Backward compatibility: use icon as leftIcon if provided
    const displayLeftIcon = leftIcon || icon;
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;

    const variantStyles = {
      primary: `
        bg-brand text-white
        hover:opacity-90
        focus-visible:ring-brand
      `,
      secondary: `
        bg-gray-100 text-gray-900
        hover:bg-gray-200
        dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
        focus-visible:ring-gray-400
      `,
      outline: `
        border border-gray-300 bg-transparent text-gray-700
        hover:bg-gray-50
        dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800
        focus-visible:ring-gray-400
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100
        dark:text-gray-300 dark:hover:bg-gray-800
        focus-visible:ring-gray-400
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus-visible:ring-red-500
      `,
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 rounded-md',
      md: 'text-sm px-4 py-2 rounded-lg',
      lg: 'text-base px-6 py-3 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && displayLeftIcon && <span aria-hidden="true">{displayLeftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
