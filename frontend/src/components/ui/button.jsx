import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * 🎯 CENATE UI – Button
 * Botón reutilizable con variantes y tamaños personalizables.
 * Compatible con modo oscuro y clases de Tailwind.
 */

export const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'default',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      default:
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 ' +
        'dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-800',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800',
    };

    const sizeClasses = {
      default: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
