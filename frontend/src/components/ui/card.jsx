import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * 🧩 Card Component System (CENATE UI)
 * Componente base reutilizable con subcomponentes semánticos.
 */

export const Card = forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ children, className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx(
      'text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clsx('px-6 py-4', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';
