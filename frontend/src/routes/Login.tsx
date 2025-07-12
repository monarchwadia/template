import React from "react";
import { trpcClient } from "../trpc/trpcClient";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUtils } from "../utils/auth.utils";

export default function Login() {
    const tanstackQueryClient = useQueryClient();
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await trpcClient.auth.login.mutate({
            email: (event.target as HTMLFormElement).email.value,
            password: (event.target as HTMLFormElement).password.value
        });

        if (result) {
            AuthUtils.setToken(result.token);
            // invalidate the user profile tanstack query to refresh user data
            tanstackQueryClient.invalidateQueries({ queryKey: ['user-profile'] });
            tanstackQueryClient.refetchQueries({ queryKey: ['user-profile'] });
            alert("Login successful!");
        
        } else {
            alert("Login failed. Please check your credentials.");
        }
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm bg-base-200 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input id="email" name="email" type="email" placeholder="Email" required className="input input-bordered w-full" />
          <input id="password" name="password" type="password" placeholder="Password" required className="input input-bordered w-full" />
          <button type="submit" className="btn btn-primary w-full mt-2">Login</button>
        </form>
      </div>
    </div>
  );
}
