const EmptyState = ({ icon, title, description, action }) => (
  <div className="card border-dashed text-center py-16 px-6">
    {icon && <div className="flex justify-center mb-3 text-ink/30 text-3xl">{icon}</div>}
    <p className="font-display text-lg font-semibold mb-1">{title}</p>
    {description && (
      <p className="text-ink/50 text-sm max-w-sm mx-auto mb-4">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
