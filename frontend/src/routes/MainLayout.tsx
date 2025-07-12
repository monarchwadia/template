import { Link, Outlet } from "react-router-dom";
import { UserProfileIndicator } from "../components/UserProfileButton";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-base-200 p-6 flex flex-col gap-4">
        <h2 className="mb-8 text-xl font-bold">Menu</h2>
        <Link className="btn btn-ghost justify-start" to="/login">Login</Link>
        <Link className="btn btn-ghost justify-start" to="/register">Register</Link>
        <Link className="btn btn-ghost justify-start" to="/profile">Profile</Link>
        <UserProfileIndicator />
      </aside>
      <main className="flex-1 p-8 bg-base-100">
        <Outlet />
      </main>
    </div>
  );
}
