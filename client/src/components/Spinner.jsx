const Spinner = ({ label = "Loading…" }) => (
  <div className="flex items-center gap-2 text-ink/50 text-sm py-8 justify-center">
    <span className="inline-block w-4 h-4 border-2 border-ink/20 border-t-accent rounded-full animate-spin" />
    {label}
  </div>
);

export default Spinner;
