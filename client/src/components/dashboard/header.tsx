import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth";

interface HeaderProps {
  onAddOrder: () => void;
  onExport: () => void;
}

export function Header({ onAddOrder, onExport }: HeaderProps) {
  const { user } = useAuth();
  const isAdmin = authService.isAdmin(user);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back, {user?.name}</h1>
          <p className="text-slate-400 text-sm">Here's your web leads overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onAddOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Order/Quote</span>
          </Button>
          {isAdmin && (
            <Button
              onClick={onExport}
              variant="outline"
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors border-slate-600"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
