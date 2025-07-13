import { useState } from "react";
import { GuardMustBeLoggedOut } from "../guards/GuardMustBeLoggedOut";
import { trpcClient } from "../clients/trpcClient";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  type RegisterFormInputs = {
    username: string;
    email: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await trpcClient.auth.register.mutate({
        email: data.email,
        password: data.password,
      });
      
      setSuccessMessage("Registration successful! Please log in with your new account.");
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again later.";
      setServerError(errorMessage);
    }
  };

  return (
    <GuardMustBeLoggedOut>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-sm bg-base-200 rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-describedby={serverError ? "register-error" : undefined}>
            <input
              id="username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              aria-label="Username"
              className={`input input-bordered w-full${errors.username ? " input-error" : ""}`}
              disabled={isSubmitting}
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Username must be at least 3 characters" },
              })}
            />
            {errors.username && (
              <span className="text-error text-xs" role="alert">{errors.username.message}</span>
            )}
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              aria-label="Email"
              className={`input input-bordered w-full${errors.email ? " input-error" : ""}`}
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-error text-xs" role="alert">{errors.email.message}</span>
            )}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                aria-label="Password"
                className={`input input-bordered w-full pr-12${errors.password ? " input-error" : ""}`}
                disabled={isSubmitting}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isSubmitting}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-xs" role="alert">{errors.password.message}</span>
            )}
            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
            {successMessage && (
              <div
                className="text-success text-sm mt-2"
                role="alert"
              >
                {successMessage}
              </div>
            )}
            {serverError && (
              <div
                id="register-error"
                className="text-error text-sm mt-2"
                role="alert"
                tabIndex={-1}
              >
                {serverError}
              </div>
            )}
          </form>
        </div>
      </div>
    </GuardMustBeLoggedOut>
  );
}
