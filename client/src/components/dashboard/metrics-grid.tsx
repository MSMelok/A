import { FileText, Clock, Truck, XCircle, CheckCircle, Percent, DollarSign, TrendingUp, Zap, Ban } from "lucide-react";

interface MetricsGridProps {
  metrics: {
    totalQuotes: number;
    inProcess: number;
    dispatched: number;
    canceled: number;
    completed: number;
    totalLeads: number;
    totalBookings: number;
    conversionRate: number;
    totalBrokerFee: number;
    avgBrokerFee: number;
    dispatchRate: number;
    cancellationRate: number;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const firstRowMetrics = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      icon: FileText,
      color: "bg-indigo-600"
    },
    {
      title: "Total Quotes",
      value: metrics.totalQuotes,
      icon: FileText,
      color: "bg-blue-600"
    },
    {
      title: "In Process",
      value: metrics.inProcess,
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Dispatched",
      value: metrics.dispatched,
      icon: Truck,
      color: "bg-green-600"
    },
    {
      title: "Canceled",
      value: metrics.canceled,
      icon: XCircle,
      color: "bg-red-600"
    },
    {
      title: "Completed",
      value: metrics.completed,
      icon: CheckCircle,
      color: "bg-green-600"
    }
  ];

  const secondRowMetrics = [
    {
      title: "Total Bookings",
      value: metrics.totalBookings,
      icon: CheckCircle,
      color: "bg-emerald-600"
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: Percent,
      color: "bg-purple-600"
    },
    {
      title: "Total Broker Fee",
      value: `$${metrics.totalBrokerFee.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-blue-600"
    },
    {
      title: "Average Broker Fee",
      value: `$${metrics.avgBrokerFee.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-teal-600"
    },
    {
      title: "Dispatch Rate",
      value: `${metrics.dispatchRate.toFixed(1)}%`,
      icon: Zap,
      color: "bg-pink-600"
    },
    {
      title: "Cancellation Rate",
      value: `${metrics.cancellationRate.toFixed(1)}%`,
      icon: Ban,
      color: "bg-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* First Row: Total Leads - Quotes - In Process - Dispatched - Canceled - Completed */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        {firstRowMetrics.map((metric, index) => (
          <div
            key={metric.title}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="text-white h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-slate-400">{metric.title}</div>
          </div>
        ))}
      </div>

      {/* Second Row: Total Bookings - Conversion Rate - Total Broker Fee - Average Broker Fee - Dispatch Rate - Cancellation Rate */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        {secondRowMetrics.map((metric, index) => (
          <div
            key={metric.title}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${(index + 6) * 100}ms` }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="text-white h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-slate-400">{metric.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}