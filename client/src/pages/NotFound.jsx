import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-paper flex items-center justify-center px-4">
    <div className="text-center">
      <p className="label-eyebrow mb-2">404</p>
      <h1 className="font-display text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-ink/50 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-block">
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
