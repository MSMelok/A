import { useState } from "react";
import { Shield, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportToCSV } from "@/utils/export";
import type { Order } from "@shared/schema";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  onEraseData: () => Promise<void>;
}

const ADMIN_PASSWORD = "Flix@1053";

export function ExportModal({ open, onClose, orders, onEraseData }: ExportModalProps) {
  const [password, setPassword] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const handleExport = async () => {
    if (password !== ADMIN_PASSWORD) {
      setError("Invalid password");
      return;
    }

    setIsExporting(true);
    setError("");

    try {
      exportToCSV(orders, `sales-data-${new Date().toISOString().split('T')[0]}.csv`);
      setLastExportTime(new Date());
      setPassword("");
      onClose();
    } catch (error) {
      setError("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEraseData = async () => {
    if (password !== ADMIN_PASSWORD) {
      setError("Invalid password");
      return;
    }

    if (!lastExportTime || Date.now() - lastExportTime.getTime() > 24 * 60 * 60 * 1000) {
      setError("You must export data within the last 24 hours before erasing");
      return;
    }

    setIsErasing(true);
    setError("");

    try {
      await onEraseData();
      setPassword("");
      onClose();
    } catch (error) {
      setError("Failed to erase data");
    } finally {
      setIsErasing(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="bg-slate-700/50 border-slate-600">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-slate-300">
              <strong>Admin Access Required</strong>
              <br />
              Enter the admin password to proceed with data export or deletion.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="password" className="text-slate-300 mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExport();
                }
              }}
            />
          </div>

          {error && (
            <Alert className="bg-red-900/20 border-red-600/30">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {lastExportTime && (
            <Alert className="bg-green-900/20 border-green-600/30">
              <AlertDescription className="text-green-400">
                Last export: {lastExportTime.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !password}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
            <Button
              type="button"
              onClick={handleEraseData}
              disabled={isErasing || !password}
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              {isErasing ? "Erasing..." : "Erase Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
