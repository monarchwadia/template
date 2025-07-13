import { Link, Outlet } from "react-router-dom";
import { UserProfileIndicator } from "../components/UserProfileButton";
import { HiBars3, HiArrowRightOnRectangle, HiUserPlus, HiUser, HiHome } from "react-icons/hi2";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-base-100 to-base-200">
      <aside className="w-64 bg-base-300 shadow-xl border-r border-base-content/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-base-content/10">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:text-primary-focus transition-colors">
            <HiBars3 className="w-6 h-6" />
            Coolproject
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-3 px-3">
              Navigation
            </h2>
            <div className="space-y-1">
              <Link 
                className="btn btn-ghost justify-start w-full text-left hover:bg-primary/10 hover:text-primary transition-all duration-200 group" 
                to="/"
              >
                <HiHome className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Home
              </Link>
            </div>
          </div>
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-base-content/10 bg-base-200/50">
          <UserProfileIndicator />
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col">
        {/* Main Content Header */}
        <header className="bg-base-100/80 backdrop-blur-sm border-b border-base-content/10 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-base-content">Dashboard</h2>
              <p className="text-base-content/60 mt-1">Welcome to your Coolproject dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary badge-outline">v1.0.0</div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
