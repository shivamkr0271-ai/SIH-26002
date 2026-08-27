import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = React.ComponentProps<"div"> & {
  noPadding?: boolean;
};

export function Card({ children, className, onClick, noPadding = false, ...props }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden shadow-xl transition-all",
        onClick && "cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 hover:-translate-y-0.5",
        !noPadding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold text-slate-100 tracking-wide", className)}>
      {children}
    </h3>
  );
}
