'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Oct 2025', revenue: 2400000, expenses: 1800000, bookings: 32 },
  { month: 'Nov 2025', revenue: 3100000, expenses: 2100000, bookings: 45 },
  { month: 'Dec 2025', revenue: 4950000, expenses: 3410000, bookings: 60 },
  { month: 'Jan 2026', revenue: 1800000, expenses: 950000, bookings: 24 },
  { month: 'Feb 2026', revenue: 2900000, expenses: 1650000, bookings: 38 },
  { month: 'Mar 2026 (Est)', revenue: 4250000, expenses: 2400000, bookings: 52 },
];

export const RevenueChart: React.FC = () => {
  const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');

  const formatCurrency = (val: number) => {
    return `Rs. ${(val / 100000).toFixed(1)}L`;
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Financial & Stall Traction
          </span>
          <h3 className="font-sans text-2xl font-bold text-charcoal tracking-tight">
            Revenue & Booking Trajectory
          </h3>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center gap-2 bg-cream-200/80 p-1.5 rounded-full border border-sage-200/50 self-start sm:self-auto">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              metric === 'revenue'
                ? 'bg-sage-800 text-cream shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Revenue (PKR)
          </button>
          <button
            onClick={() => setMetric('bookings')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              metric === 'bookings'
                ? 'bg-sage-800 text-cream shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Stalls Booked
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8FA68E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8FA68E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EDE9DF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EDE9DF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(143, 166, 142, 0.15)" />
            <XAxis 
              dataKey="month" 
              stroke="#687368" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#687368" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={metric === 'revenue' ? formatCurrency : (v) => `${v}`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-soft-lg border border-sage-200 text-xs">
                      <p className="font-sans font-bold text-charcoal mb-1.5">{label}</p>
                      {metric === 'revenue' ? (
                        <>
                          <div className="flex items-center justify-between gap-4 text-sage-800 font-semibold">
                            <span>Stall Revenue:</span>
                            <span>Rs. {(payload[0].value as number).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-charcoal-muted mt-1">
                            <span>Logged Costs:</span>
                            <span>Rs. {(payload[1]?.value as number || 0).toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between gap-4 text-sage-800 font-bold">
                          <span>Confirmed Stalls:</span>
                          <span>{payload[0].value} units</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {metric === 'revenue' ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4A5D4A" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#revenueGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#A89F91" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#expenseGrad)" 
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#4A5D4A" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#revenueGrad)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Stats */}
      <div className="mt-6 pt-4 border-t border-sage-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-charcoal-muted font-normal block">Average Stall Rate</span>
          <span className="font-sans text-base font-extrabold text-sage-deep">Rs. 82,500</span>
        </div>
        <div>
          <span className="text-charcoal-muted font-normal block">Net Margin Ratio</span>
          <span className="font-sans text-base font-extrabold text-emerald-800">+34.8%</span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center justify-start sm:justify-end">
          <div className="flex items-center gap-1.5 text-[11px] text-sage-800 font-medium bg-sage-50 px-3 py-1.5 rounded-full border border-sage-200/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>On track for Q2 targets</span>
          </div>
        </div>
      </div>
    </div>
  );
};
