const StatCard = ({ label, value, icon }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="label-eyebrow mb-2">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
    </div>
    {icon && (
      <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center text-lg">
        {icon}
      </div>
    )}
  </div>
);

export default StatCard;
