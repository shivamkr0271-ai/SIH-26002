import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    default: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}
