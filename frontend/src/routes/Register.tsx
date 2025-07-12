import { useTrpcClient } from "../trpc/useTrpcClient";

export default function Register() {
    const trpcClient = useTrpcClient();
    
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        trpcClient.auth.login.mutate({
            email: (event.target as HTMLFormElement).email.value,
            password: (event.target as HTMLFormElement).password.value
        })
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm bg-base-200 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            required
            className="input input-bordered w-full"
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="input input-bordered w-full"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="input input-bordered w-full"
          />
          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
