import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = ({
  className,
  variant = 'primary',
  size = 'default',
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 border-transparent',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-md border-transparent',
    outline: 'bg-transparent border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 border-transparent',
  };

  const sizes = {
    default: 'h-11 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-12 rounded-xl px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {children}
    </button>
  );
};

export { Button };
