import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { AgentAnalytics } from "@/components/dashboard/agent-analytics";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { AddOrderModal } from "@/components/modals/add-order-modal";
import { ExportModal } from "@/components/modals/export-modal";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useMetrics } from "@/hooks/use-metrics";
import { authService } from "@/lib/auth";
import type { Order, InsertOrder } from "@shared/schema";

export function Dashboard() {
  const { user } = useAuth();
  const { orders, isLoading, createOrder, updateOrder, deleteOrder, deleteAllOrders } = useOrders();
  const metrics = useMetrics(orders);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const isAdmin = authService.isAdmin(user);

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowAddModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowAddModal(true);
  };

  const handleSubmitOrder = async (data: InsertOrder) => {
    if (editingOrder) {
      await updateOrder({ 
        ...data, 
        id: editingOrder.id,
        totalAmount: String(data.totalAmount),
        brokerFee: String(data.brokerFee),
        date: new Date(data.date)
      });
    } else {
      await createOrder({
        ...data,
        totalAmount: String(data.totalAmount),
        brokerFee: String(data.brokerFee)
      });
    }
  };

  const handleExport = () => {
    if (isAdmin) {
      setShowExportModal(true);
    }
  };

  const handleEraseData = async () => {
    await deleteAllOrders();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Orders & Quotes</h1>
              <p className="text-slate-400">Manage all your orders and quotes</p>
            </div>
            <OrdersTable
              orders={orders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={deleteOrder}
              isLoading={isLoading}
              maxRows={25}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
              <p className="text-slate-400">Detailed performance analytics</p>
            </div>
            <MetricsGrid metrics={metrics} />
            
            {/* Admin-only Agent Analytics */}
            {isAdmin && orders.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Agent Performance</h3>
                <AgentAnalytics orders={orders} />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <MetricsGrid metrics={metrics} />
            
            {/* Orders Table */}
            <OrdersTable
              orders={orders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={deleteOrder}
              isLoading={isLoading}
              maxRows={10}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header onAddOrder={handleAddOrder} onExport={handleExport} />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <AddOrderModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingOrder(null);
        }}
        onSubmit={handleSubmitOrder}
        editingOrder={editingOrder}
      />

      {isAdmin && (
        <ExportModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          orders={orders}
          onEraseData={handleEraseData}
        />
      )}
    </div>
  );
}
