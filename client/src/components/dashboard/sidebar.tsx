import { BarChart3, FileText, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth";

interface SidebarProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ className, activeTab = 'dashboard', onTabChange }: SidebarProps) {
  const { user } = useAuth();

  const handleSignOut = () => {
    authService.signOut();
    window.location.reload();
  };

  return (
    <div className={cn("w-16 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col", className)}>
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white text-sm h-4 w-4" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-white">SalesPro</h1>
            <p className="text-xs text-slate-400">Web Leads Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onTabChange?.('dashboard')}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                activeTab === 'dashboard' 
                  ? "bg-slate-800 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:block font-medium">Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onTabChange?.('orders')}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                activeTab === 'orders' 
                  ? "bg-slate-800 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden lg:block">Orders & Quotes</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onTabChange?.('analytics')}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                activeTab === 'analytics' 
                  ? "bg-slate-800 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden lg:block">Analytics</span>
            </button>
          </li>

        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="text-slate-300 h-4 w-4" />
          </div>
          <div className="hidden lg:block flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="hidden lg:block text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
