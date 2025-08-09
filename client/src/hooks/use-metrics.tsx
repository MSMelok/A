import { useMemo } from "react";
import type { Order } from "@shared/schema";

export function useMetrics(orders: Order[]) {
  return useMemo(() => {
    if (!orders.length) {
      return {
        totalQuotes: 0,
        inProcess: 0,
        dispatched: 0,
        canceled: 0,
        totalBookings: 0,
        completed: 0,
        totalLeads: 0,
        conversionRate: 0,
        totalBrokerFee: 0,
        avgBrokerFee: 0,
        dispatchRate: 0,
        cancellationRate: 0,
      };
    }

    // Count by status
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalQuotes = statusCounts.quote || 0;
    const inProcess = statusCounts.in_process || 0;
    const dispatched = statusCounts.dispatched || 0;
    const canceled = statusCounts.canceled || 0;
    const completed = statusCounts.completed || 0;

    // Total leads = all orders
    const totalLeads = orders.length;

    // "In Process" + "Dispatched" + "Completed" = booking count
    const totalBookings = inProcess + dispatched + completed;

    // Financial metrics: only dispatched orders for broker fee
    const dispatchedOrders = orders.filter(order => order.status === 'dispatched');
    const totalBrokerFee = dispatchedOrders.reduce(
      (sum, order) => sum + parseFloat(order.brokerFee),
      0
    );
    const avgBrokerFee =
      dispatchedOrders.length > 0 ? totalBrokerFee / dispatchedOrders.length : 0;

    // Percentage metrics
    const conversionRate =
      totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0;
    const dispatchRate =
      totalBookings > 0 ? (dispatched / totalBookings) * 100 : 0;
    const cancellationRate =
      totalBookings > 0 ? (canceled / totalBookings) * 100 : 0;

    return {
      totalQuotes,
      inProcess,
      dispatched,
      canceled,
      completed,
      totalLeads,
      totalBookings,
      conversionRate,
      totalBrokerFee: Math.round(totalBrokerFee),
      avgBrokerFee: Math.round(avgBrokerFee),
      dispatchRate,
      cancellationRate,
    };
  }, [orders]);
}
