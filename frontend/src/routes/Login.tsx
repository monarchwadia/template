import { useState } from "react";
import { trpcClient } from "../clients/trpcClient";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUtils } from "../utils/auth.utils";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TRPCClientError } from "@trpc/client";
import { GuardMustBeLoggedOut } from "../guards/GuardMustBeLoggedOut";

export default function Login() {
  const tanstackQueryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  type LoginFormInputs = {
    email: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      const result = await trpcClient.auth.login.mutate({
        email: data.email,
        password: data.password,
      });
      
      try {
        AuthUtils.setToken(result.token);
      } catch (e: unknown) {
        console.error("Failed to store authentication token:", e);
        setServerError("Failed to store authentication token. Please check your browser settings.");
        return;
      }
      
      await tanstackQueryClient.invalidateQueries({ queryKey: ['user-profile'] });
      await tanstackQueryClient.refetchQueries({ queryKey: ['user-profile'] });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
        setServerError("Invalid email or password. Please try again.");
        return;
      }

      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again later.";
      setServerError(errorMessage);
    }
  };

  // Dev mode quick login handlers
  const handleDevLogin = (email: string, password: string) => {
    setValue("email", email, { shouldTouch: true, shouldValidate: true });
    setValue("password", password, { shouldTouch: true, shouldValidate: true });
    setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 0);
  };

  return (
    <GuardMustBeLoggedOut>
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm bg-base-200 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-describedby={serverError ? "login-error" : undefined}>
          <input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="username"
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
              autoComplete="current-password"
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          {serverError && (
            <div
              id="login-error"
              className="text-error text-sm mt-2"
              role="alert"
              tabIndex={-1}
            >
              {serverError}
            </div>
          )}
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-base-content/60">Don't have an account?</span>
          <a href="/register" className="ml-1 link link-primary text-sm">Register</a>
        </div>
      </div>
      {import.meta.env.DEV && (
        <div className="flex flex-col gap-2 mt-6 w-full max-w-sm">
          <div className="text-center mb-2">
            <span className="font-semibold text-base-content/80">Demo Credentials</span>
          </div>
          <button
            className="btn btn-outline btn-info w-full"
            type="button"
            onClick={() => handleDevLogin('owner@owner.com', 'password')}
          >
            Login as owner of communities
          </button>
          <button
            className="btn btn-outline btn-secondary w-full"
            type="button"
            onClick={() => handleDevLogin('user@user.com', 'password')}
          >
            Login as normal member
          </button>
        </div>
      )}
    </div>
    </GuardMustBeLoggedOut>
  );
}
