interface LoadingSpinnerProps {
  size?: 'sm' | 'md';
  overlay?: boolean;
}

export function LoadingSpinner({ size = 'md', overlay = false }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-5 w-5';
  const colorClass = size === 'sm' ? 'border-muted-foreground' : 'border-primary';

  const spinner = (
    <span
      className={`${colorClass} ${sizeClass} animate-spin rounded-full border-2 border-t-transparent`}
    />
  );

  if (overlay) {
    return (
      <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-xl">
        {spinner}
      </div>
    );
  }

  return spinner;
}
