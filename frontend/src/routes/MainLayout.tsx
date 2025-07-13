
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { UserProfileIndicator } from "../components/UserProfileButton";
import { HiBars3, HiHome } from "react-icons/hi2";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed z-50 md:static top-0 left-0 h-full w-64 bg-base-300 shadow-xl border-r border-base-content/10 flex flex-col transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ minWidth: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-base-content/10 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:text-primary-focus transition-colors">
            Coolproject
          </Link>
          <button
            className="md:hidden btn btn-ghost btn-sm ml-2"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-lg">×</span>
          </button>
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
                onClick={() => setSidebarOpen(false)}
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
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar for mobile */}
        <header className="md:hidden flex items-center justify-between bg-base-100/80 backdrop-blur-sm border-b border-base-content/10 p-4 shadow-sm sticky top-0 z-30">
          <button
            className="btn btn-ghost btn-sm"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <HiBars3 className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-primary">Coolproject</span>
          <div />
        </header>
        {/* Main Content Header */}
        <header className="hidden md:block bg-base-100/80 backdrop-blur-sm border-b border-base-content/10 p-6 shadow-sm">
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
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
