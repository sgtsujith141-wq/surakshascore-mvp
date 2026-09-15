import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

const variants = {
  primary: 'bg-cyber-neon text-white hover:bg-cyber-neon/80 shadow-[0_0_15px_rgba(255,42,66,0.3)]',
  secondary: 'bg-cyber-surface text-white hover:bg-cyber-surface/80 border border-cyber-neon/30',
  outline: 'border border-cyber-neon/30 bg-transparent text-white hover:bg-cyber-neon/10',
  ghost: 'text-cyber-textMuted hover:bg-cyber-neon/10 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
};
const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-3 text-base' };

export function Button({ children, className = '', variant = 'primary', size = 'md', fullWidth, ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>{children}</button>;
}
