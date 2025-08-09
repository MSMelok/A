import React from "react";
import { User, TrendingUp, DollarSign, Target, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import type { Order } from "@shared/schema";

interface AgentAnalyticsProps {
  orders: Order[];
}

interface AgentStats {
  agentName: string;
  totalLeads: number;
  totalQuotes: number;
  inProcessOrders: number;
  dispatchedOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
}

export function AgentAnalytics({ orders }: AgentAnalyticsProps) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>();
  const [toDate, setToDate] = React.useState<Date | undefined>();

  // Filter orders by date range
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const isAfterFromDate = !fromDate || orderDate >= fromDate;
      const isBeforeToDate = !toDate || orderDate <= toDate;
      return isAfterFromDate && isBeforeToDate;
    });
  }, [orders, fromDate, toDate]);

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  // Group orders by agent and calculate stats
  const agentStats = React.useMemo(() => {
    const agentGroups = filteredOrders.reduce((groups, order) => {
      const agentName = order.agentName;
      if (!groups[agentName]) {
        groups[agentName] = [];
      }
      groups[agentName].push(order);
      return groups;
    }, {} as Record<string, Order[]>);

    return Object.entries(agentGroups).map(([agentName, agentOrders]): AgentStats => {
      const totalLeads = agentOrders.length;
      const totalQuotes = agentOrders.filter(order => order.status === 'quote').length;
      const inProcessOrders = agentOrders.filter(order => order.status === 'in_process').length;
      const dispatchedOrders = agentOrders.filter(order => order.status === 'dispatched').length;
      const completedOrders = agentOrders.filter(order => order.status === 'completed').length;
      const canceledOrders = agentOrders.filter(order => order.status === 'canceled').length;
      
      // Calculate revenue excluding canceled orders
      const revenueOrders = agentOrders.filter(order => order.status !== 'canceled');
      const totalRevenue = revenueOrders.reduce((sum, order) => sum + parseFloat(order.brokerFee), 0);
      const avgOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;
      
      // Total bookings = in_process + dispatched + completed
      const totalBookings = inProcessOrders + dispatchedOrders + completedOrders;
      const conversionRate = totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0;

      return {
        agentName,
        totalLeads,
        totalQuotes,
        inProcessOrders,
        dispatchedOrders,
        completedOrders,
        canceledOrders,
        totalRevenue,
        avgOrderValue,
        conversionRate,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue descending
  }, [filteredOrders]);

  if (agentStats.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        No agent data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Date Range:</span>
          </div>
          
          <DatePicker
            date={fromDate}
            onSelect={setFromDate}
            placeholder="From date"
            className="w-full sm:w-auto"
          />
          
          <DatePicker
            date={toDate}
            onSelect={setToDate}
            placeholder="To date"
            className="w-full sm:w-auto"
          />
          
          <Button
            variant="outline"
            onClick={clearDateFilters}
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-slate-200"
          >
            Clear Dates
          </Button>
          
          <div className="text-sm text-slate-400">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Agents</p>
              <p className="text-2xl font-bold text-white">{agentStats.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Top Performer</p>
              <p className="text-lg font-semibold text-white">{agentStats[0]?.agentName || 'N/A'}</p>
              <p className="text-sm text-green-400">${Math.round(agentStats[0]?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Conversion</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(agentStats.reduce((sum, agent) => sum + agent.conversionRate, 0) / agentStats.length || 0)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left px-4 py-3 text-slate-300 font-medium">Agent</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Total Leads</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Quotes</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">In Process</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Dispatched</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Completed</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Canceled</th>
              <th className="text-right px-4 py-3 text-slate-300 font-medium">Revenue</th>
              <th className="text-right px-4 py-3 text-slate-300 font-medium">Avg Order</th>
              <th className="text-center px-4 py-3 text-slate-300 font-medium">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {agentStats.map((agent, index) => (
              <tr key={agent.agentName} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{agent.agentName}</p>
                      <p className="text-sm text-slate-400">#{index + 1} by revenue</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-slate-200">{agent.totalLeads}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400">
                    {agent.totalQuotes}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-600/20 text-orange-400">
                    {agent.inProcessOrders}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-600/20 text-emerald-400">
                    {agent.dispatchedOrders}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400">
                    {agent.completedOrders}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-600/20 text-red-400">
                    {agent.canceledOrders}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  ${Math.round(agent.totalRevenue).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  ${Math.round(agent.avgOrderValue).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`font-medium ${
                      agent.conversionRate >= 70 ? 'text-green-400' :
                      agent.conversionRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(agent.conversionRate)}%
                    </span>
                    <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          agent.conversionRate >= 70 ? 'bg-green-400' :
                          agent.conversionRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(agent.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}