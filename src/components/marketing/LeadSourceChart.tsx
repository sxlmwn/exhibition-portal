'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';
import { MarketingCampaign } from '../../types';

interface LeadSourceChartProps {
  campaigns: MarketingCampaign[];
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ campaigns }) => {
  // Aggregate leads by platform
  const platformMap: Record<string, { platform: string; leads: number; spend: number }> = {};

  campaigns.forEach((cmp) => {
    if (!platformMap[cmp.platform]) {
      platformMap[cmp.platform] = { platform: cmp.platform, leads: 0, spend: 0 };
    }
    platformMap[cmp.platform].leads += cmp.leadsGenerated;
    platformMap[cmp.platform].spend += cmp.amountSpent;
  });

  const chartData = Object.values(platformMap);

  const colors = ['#4A5D4A', '#8FA68E', '#B7C9B6', '#CFC5B2', '#687368'];

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Attribution Analytics
          </span>
          <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
            Lead Source by Platform
          </h3>
        </div>
        <span className="text-xs font-semibold bg-sage-50 text-sage-800 px-3.5 py-1.5 rounded-full border border-sage-200">
          Total Leads: {campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0)}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(143, 166, 142, 0.15)" />
            <XAxis 
              dataKey="platform" 
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/98 dark:bg-[#14171E] backdrop-blur-2xl p-4 rounded-2xl shadow-2xl border border-sage-200 dark:border-white/15 text-xs">
                      <p className="font-sans font-extrabold text-charcoal dark:text-white mb-1.5">{label}</p>
                      <div className="flex items-center justify-between gap-4 text-sage-800 dark:text-sage-300 font-bold">
                        <span>Leads Acquired:</span>
                        <span className="font-extrabold">{payload[0].value} brands</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="leads" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-sage-100 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-muted">
        <span>Average Cost per Lead: <strong>Rs. 5,200</strong></span>
        <span>Best Conversion: <strong>Instagram Studio Reels (42%)</strong></span>
      </div>
    </div>
  );
};
