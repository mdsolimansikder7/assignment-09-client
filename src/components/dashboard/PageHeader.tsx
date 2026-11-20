interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
