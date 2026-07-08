import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import Alert from "../components/Alert";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const expired = searchParams.get("expired");

  const onSubmit = async (values) => {
    setServerError("");
    const result = await login(values.email, values.password);
    if (result.success) {
      toast.success("Welcome back");
      navigate("/dashboard");
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="card p-6">
      {expired && (
        <div className="mb-4">
          <Alert type="info">Your session expired. Please log in again.</Alert>
        </div>
      )}
      {serverError && (
        <div className="mb-4">
          <Alert type="error">{serverError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-xs text-clay mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input-field"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-xs text-clay mt-1">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-ink/50 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-accent font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
