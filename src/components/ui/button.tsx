import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
>(({ className, variant = 'default', size = 'default', asChild, ...props }, ref) => {
  const variants = {
    default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/90',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    destructive: 'bg-red-500 text-white hover:bg-red-500/90',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const classes = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<{ className?: string }>, {
      className: classes,
      ...props,
    });
  }

  return <button ref={ref} className={classes} {...props} />;
});
Button.displayName = 'Button';

export { Button };
