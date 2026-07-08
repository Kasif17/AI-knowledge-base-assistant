import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/documents", label: "Documents" },
  { to: "/ask", label: "Ask" },
  { to: "/history", label: "History" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-ink/10 bg-paper/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="font-display text-xl font-semibold tracking-tight">
            Archive
          </span>
          <nav className="hidden md:flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-soft text-accent-dark"
                      : "text-ink/60 hover:text-ink hover:bg-ink/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-ink/50">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm py-1.5 flex items-center gap-1.5"
          >
            <FiLogOut size={14} /> Log out
          </button>
        </div>
      </div>
      <nav className="md:hidden flex overflow-x-auto px-4 pb-2 gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
                isActive ? "bg-accent-soft text-accent-dark" : "text-ink/60"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
