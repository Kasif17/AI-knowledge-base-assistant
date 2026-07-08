const styles = {
  error: "bg-clay-soft border-clay/30 text-clay",
  success: "bg-accent-soft border-accent/30 text-accent-dark",
  info: "bg-ink/5 border-ink/15 text-ink/70",
};

const Alert = ({ type = "info", children }) => (
  <div className={`border rounded-md px-4 py-3 text-sm ${styles[type]}`} role="alert">
    {children}
  </div>
);

export default Alert;
