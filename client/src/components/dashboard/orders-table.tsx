import React, { useState } from "react";
import { Search, ArrowUpDown, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { DatePicker } from "@/components/ui/date-picker";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { convertFromUTC } from "@/utils/timezone";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  isLoading?: boolean;
  maxRows?: number;
}

const statusOptions = [
  { label: "Quote", value: "quote" },
  { label: "In Process", value: "in_process" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Canceled", value: "canceled" },
  { label: "Completed", value: "completed" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "quote":
      return "bg-blue-600/20 text-blue-400 border-blue-600/30";
    case "in_process":
      return "bg-orange-600/20 text-orange-400 border-orange-600/30";
    case "dispatched":
      return "bg-emerald-600/20 text-emerald-400 border-emerald-600/30";
    case "canceled":
      return "bg-red-600/20 text-red-400 border-red-600/30";
    case "completed":
      return "bg-green-600/20 text-green-400 border-green-600/30";
    default:
      return "bg-slate-600/20 text-slate-400 border-slate-600/30";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in_process":
      return "In Process";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export function OrdersTable({ orders, onEditOrder, onDeleteOrder, isLoading, maxRows = 25 }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Order>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = authService.isAdmin(user);

  // Get unique agents for filter
  const agentOptions = React.useMemo(() => {
    const uniqueAgents = [...new Set(orders.map(order => order.agentName))];
    return uniqueAgents.map(agent => ({ label: agent, value: agent }));
  }, [orders]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedAgents([]);
  };

// Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderQuoteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(order.status);
    
    const orderDate = new Date(order.date);
    const matchesFromDate = !fromDate || orderDate >= fromDate;
    const matchesToDate = !toDate || orderDate <= toDate;
    
    const matchesAgent = selectedAgents.length === 0 || selectedAgents.includes(order.agentName);

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate && matchesAgent;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle date fields
    if (sortField === "date" || sortField === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle numeric fields
    if (sortField === "totalAmount" || sortField === "brokerFee") {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / maxRows);
  const startIndex = (currentPage - 1) * maxRows;
  const endIndex = startIndex + maxRows;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatuses, fromDate, toDate, selectedAgents]);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-white">Orders & Quotes</h2>
          
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500 w-full sm:w-64 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Status Filter */}
            <MultiSelect
              options={statusOptions}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="All Status"
              className="w-full sm:w-auto"
            />

            {/* Agent Filter - Admin only */}
            {isAdmin && (
              <MultiSelect
                options={agentOptions}
                selected={selectedAgents}
                onChange={setSelectedAgents}
                placeholder="All Agents"
                className="w-full sm:w-auto"
              />
            )}

            {/* From Date Filter */}
            <DatePicker
              date={fromDate}
              onSelect={setFromDate}
              placeholder="From date"
              className="w-full sm:w-auto"
            />

            {/* To Date Filter */}
            <DatePicker
              date={toDate}
              onSelect={setToDate}
              placeholder="To date"
              className="w-full sm:w-auto"
            />

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-slate-200 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left px-6 py-4 text-slate-300 font-medium border-b border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("orderQuoteId")}
                  className="flex items-center space-x-1 hover:text-slate-200 transition-colors p-0 h-auto font-medium"
                >
                  <span>Order ID</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="text-left px-6 py-4 text-slate-300 font-medium border-b border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("date")}
                  className="flex items-center space-x-1 hover:text-slate-200 transition-colors p-0 h-auto font-medium"
                >
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="text-left px-6 py-4 text-slate-300 font-medium border-b border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center space-x-1 hover:text-slate-200 transition-colors p-0 h-auto font-medium"
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="text-left px-6 py-4 text-slate-300 font-medium border-b border-slate-700">Agent</th>
              <th className="text-right px-6 py-4 text-slate-300 font-medium border-b border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                  className="flex items-center justify-end space-x-1 hover:text-slate-200 transition-colors p-0 h-auto font-medium ml-auto"
                >
                  <span>Total Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="text-right px-6 py-4 text-slate-300 font-medium border-b border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("brokerFee")}
                  className="flex items-center justify-end space-x-1 hover:text-slate-200 transition-colors p-0 h-auto font-medium ml-auto"
                >
                  <span>Broker Fee</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="text-right px-6 py-4 text-slate-300 font-medium border-b border-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No orders found. {searchTerm || selectedStatuses.length > 0 || fromDate || toDate ? "Try adjusting your filters." : "Add your first order to get started."}
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 text-slate-200 font-medium">{order.orderQuoteId}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {convertFromUTC(order.date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{order.agentName}</td>
                  <td className="px-6 py-4 text-right text-slate-200 font-medium">
                    ${parseFloat(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">
                    ${parseFloat(order.brokerFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditOrder(order)}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {onDeleteOrder && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 transition-colors p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Order</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Are you sure you want to delete order "{order.orderQuoteId}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)} of {sortedOrders.length} entries
            {(searchTerm || selectedStatuses.length > 0 || fromDate || toDate || selectedAgents.length > 0) && " (filtered)"}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-slate-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-slate-400 hover:text-slate-200"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Simple info when no pagination needed */}
      {totalPages <= 1 && sortedOrders.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Showing {sortedOrders.length} of {orders.length} entries
            {(searchTerm || selectedStatuses.length > 0 || fromDate || toDate || selectedAgents.length > 0) && " (filtered)"}
          </p>
        </div>
      )}
    </div>
  );
}
