import React from 'react';

export const Card = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';
