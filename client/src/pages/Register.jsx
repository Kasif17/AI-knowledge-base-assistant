import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import Alert from "../components/Alert";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    const result = await registerUser(
      values.firstName,
      values.lastName,
      values.email,
      values.password
    );
    if (result.success) {
      toast.success("Account created");
      navigate("/dashboard");
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="card p-6">
      {serverError && (
        <div className="mb-4">
          <Alert type="error">{serverError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              className="input-field"
              {...register("firstName", { required: "Required", minLength: 2 })}
            />
            {errors.firstName && (
              <p className="text-xs text-clay mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              className="input-field"
              {...register("lastName", { required: "Required", minLength: 2 })}
            />
            {errors.lastName && (
              <p className="text-xs text-clay mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          {errors.password && (
            <p className="text-xs text-clay mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="input-field"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-clay mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-ink/50 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-accent font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
