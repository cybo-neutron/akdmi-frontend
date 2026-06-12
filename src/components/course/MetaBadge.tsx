export function MetaBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-muted rounded-sm uppercase tracking-wide">
      {icon}
      {label}
    </span>
  );
}