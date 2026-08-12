import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}) {
  const variants = {
    default: 'bg-gray-900 text-gray-50',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-gray-200 text-gray-900',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
