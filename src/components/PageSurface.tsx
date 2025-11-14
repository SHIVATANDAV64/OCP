import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageSurfaceProps {
  children: ReactNode;
  className?: string;
}

export default function PageSurface({ children, className }: PageSurfaceProps) {
  return (
    <div className={cn('relative min-h-screen pt-16', className)}>
      <div className="absolute inset-0 page-surface-bg opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 golden-grid-overlay opacity-20 pointer-events-none hidden md:block"></div>
      <div className="absolute inset-0 page-surface-fade opacity-35 pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
