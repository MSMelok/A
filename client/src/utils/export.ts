import type { Order } from "@shared/schema";
import { convertFromUTC } from "./timezone";

export function exportToCSV(orders: Order[], filename: string) {
  const headers = [
    "Order/Quote ID",
    "Date (Central Time)",
    "Status", 
    "Agent Name",
    "Total Amount",
    "Broker Fee",
    "Created At"
  ];

  const csvContent = [
    headers.join(","),
    ...orders.map(order => [
      `"${order.orderQuoteId}"`,
      `"${convertFromUTC(order.date).toLocaleString()}"`,
      `"${order.status}"`,
      `"${order.agentName}"`,
      `"${order.totalAmount}"`,
      `"${order.brokerFee}"`,
      `"${convertFromUTC(order.createdAt).toLocaleString()}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
