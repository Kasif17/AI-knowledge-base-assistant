import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const AppLayout = () => (
  <div className="min-h-screen bg-paper">
    <Navbar />
    <main className="max-w-6xl mx-auto px-6 py-8">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
