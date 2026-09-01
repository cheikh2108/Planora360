import { HTMLAttributes } from 'react';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
  ...props
}: LoadingStateProps) {
  if (variant === 'spinner') {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 ${className}`}
        role="status"
        aria-live="polite"
        aria-label="Chargement en cours"
        {...props}
      >
        <svg
          className={`animate-spin text-brand ${sizeClasses[size]}`}
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
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
        aria-label="Chargement en cours"
        {...props}
      >
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // Skeleton variant is handled by separate Skeleton component
  return null;
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Chargement du contenu">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 rounded ${i === lines - 1 ? 'w-4/5' : 'w-full'} ${className}`}
            {...props}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Chargement du contenu"
      {...props}
    />
  );
}

// Skeleton presets for common layouts
export function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl space-y-4">
      <Skeleton variant="text" lines={1} className="w-2/3" />
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="rectangular" width="20%" height={40} />
          <Skeleton variant="rectangular" width="30%" height={40} />
          <Skeleton variant="rectangular" width="25%" height={40} />
          <Skeleton variant="rectangular" width="25%" height={40} />
        </div>
      ))}
    </div>
  );
}
