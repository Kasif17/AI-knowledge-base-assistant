import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen bg-paper flex items-center justify-center px-4">
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <p className="label-eyebrow mb-2">Archive</p>
        <h1 className="font-display text-2xl font-semibold">
          AI Knowledge Base Assistant
        </h1>
      </div>
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
