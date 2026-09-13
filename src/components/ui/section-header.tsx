import { Link } from '@/i18n/navigation';

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeader({ title, viewAllHref, viewAllLabel }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
