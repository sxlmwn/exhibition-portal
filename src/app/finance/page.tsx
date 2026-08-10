'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ExpenseItem, ExpenseCategory } from '../../types';
import { ExpenseFormModal } from '../../components/finance/ExpenseFormModal';
import { ReceiptViewerModal } from '../../components/finance/ReceiptViewerModal';

export default function FinancePage() {
  const { expenses, exhibitions, currentRole, updateExpenseStatus, deleteExpense } = useAdmin();

  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>(exhibitions[0]?.id || 'exh-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<ExpenseItem | null>(null);

  const currentExhibition = exhibitions.find(e => e.id === selectedExhibitionId) || exhibitions[0];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesExh = selectedExhibitionId === 'All' || exp.exhibitionId === selectedExhibitionId;
    const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.enteredByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExh && matchesCat && matchesSearch;
  });

  // Calculate exhibition financial snapshot
  const totalAllocated = currentExhibition ? currentExhibition.budgetAllocated : 0;
  const totalSpent = filteredExpenses.filter(e => e.status === 'approved').reduce((acc, e) => acc + e.amount, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const stallRevenue = currentExhibition ? currentExhibition.stallRevenueBooked : 0;
  const spendPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const handleExportReport = () => {
    const headers = ['ID', 'Exhibition', 'Category', 'Amount (PKR)', 'Date', 'Description', 'Entered By', 'Role', 'Status', 'Payment Method'];
    const rows = filteredExpenses.map(e => [
      `"${e.id}"`,
      `"${e.exhibitionName}"`,
      `"${e.category}"`,
      `"${e.amount}"`,
      `"${e.date}"`,
      `"${e.description}"`,
      `"${e.enteredByName}"`,
      `"${e.enteredByRole}"`,
      `"${e.status}"`,
      `"${e.paymentMethod}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Report_${currentExhibition?.city || 'All'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ExpenseItem['status']) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'pending_approval': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Financial Ledger
          </span>
          <h2 className="font-sans text-3xl font-extrabold text-charcoal tracking-tight">
            Finance & Cost Management
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportReport}
            className="btn-secondary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Per-Exhibition Selector & Summary Panel */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sage-200 relative overflow-hidden">
        
        {/* Exhibition Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-sage-800 block mb-1">
              Select Exhibition Scope
            </span>
            <select
              value={selectedExhibitionId}
              onChange={(e) => setSelectedExhibitionId(e.target.value)}
              className="font-sans text-xl sm:text-2xl font-extrabold text-charcoal bg-transparent border-b-2 border-sage-300 focus:border-sage-700 outline-none pb-0.5 cursor-pointer tracking-tight"
            >
              <option value="All">All Editions Consolidated</option>
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id} className="text-sm font-sans font-bold">
                  {exh.title} ({exh.city})
                </option>
              ))}
            </select>
          </div>

          {currentRole === 'staff' && (
            <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-full font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Staff Mode: Logged expenses require Owner/Admin approval.</span>
            </div>
          )}
        </div>

        {/* 4 Financial KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          
          <div className="p-4 rounded-2xl bg-white/70 border border-sage-100">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block mb-1 font-bold">
              Allocated Budget / Funding
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Rs. {(totalAllocated / 100000).toFixed(1)}L
            </span>
            <span className="text-[11px] text-charcoal-muted block mt-1 font-normal">
              Approved sponsor/organizer capital
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-sage-100">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block mb-1 font-bold">
              Total Approved Spent
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-extrabold text-rose-900 tracking-tight">
              Rs. {(totalSpent / 100000).toFixed(1)}L
            </span>
            <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-rose-600 rounded-full" style={{ width: `${Math.min(100, spendPct)}%` }} />
            </div>
            <span className="text-[10px] text-charcoal-muted block mt-1 font-semibold">
              {spendPct}% of allocated budget utilized
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-sage-100">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block mb-1 font-bold">
              Remaining Budget
            </span>
            <span className={`font-sans text-2xl sm:text-3xl font-extrabold tracking-tight ${remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              Rs. {(remainingBudget / 100000).toFixed(1)}L
            </span>
            <span className="text-[11px] text-charcoal-muted block mt-1 font-normal">
              Liquidity buffer remaining
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50/80 border border-sage-200">
            <span className="text-[11px] text-sage-900 uppercase tracking-wider font-bold block mb-1">
              Stall Revenue Booked
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-extrabold text-sage-deep tracking-tight">
              Rs. {(stallRevenue / 100000).toFixed(1)}L
            </span>
            <span className="text-[11px] text-sage-800 block mt-1 font-semibold">
              Net Surplus: Rs. {((stallRevenue - totalSpent) / 100000).toFixed(1)}L
            </span>
          </div>

        </div>

      </div>

      {/* Filters */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-sage-600 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memo, vendor, category..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-sage-200 bg-white/80 text-xs font-medium text-charcoal outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Venue Rent">Venue Rent</option>
            <option value="Marketing & Ads">Marketing & Ads</option>
            <option value="Staff & Labour">Staff & Labour</option>
            <option value="Logistics & Freight">Logistics & Freight</option>
            <option value="Setup, Decor & Lighting">Setup, Decor & Lighting</option>
            <option value="Security & Protocol">Security & Protocol</option>
            <option value="Refreshments">Refreshments</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-sage-200/80 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/90 border-b border-sage-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
              <tr>
                <th className="py-4 px-5">Category & Memo</th>
                <th className="py-4 px-4">Amount (PKR)</th>
                <th className="py-4 px-4">Exhibition</th>
                <th className="py-4 px-4">Incurred Date</th>
                <th className="py-4 px-4">Entered By</th>
                <th className="py-4 px-4">Receipt</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/80 transition-colors">
                  
                  {/* Category & Memo */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-charcoal block">
                      {exp.category}
                    </span>
                    <span className="text-charcoal-muted text-[11px] font-light block max-w-sm leading-tight mt-0.5">
                      {exp.description}
                    </span>
                    <span className="text-[10px] text-sage-800 font-medium mt-0.5 block">
                      Method: {exp.paymentMethod}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-sans text-sm font-extrabold text-charcoal">
                    Rs. {exp.amount.toLocaleString()}
                  </td>

                  {/* Exhibition */}
                  <td className="py-4 px-4 text-charcoal font-medium">
                    {exp.exhibitionName}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-charcoal-muted font-light">
                    {exp.date}
                  </td>

                  {/* Entered by */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-charcoal block">
                      {exp.enteredByName}
                    </span>
                    <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider">
                      {exp.enteredByRole}
                    </span>
                  </td>

                  {/* Receipt Scan Preview */}
                  <td className="py-4 px-4">
                    {exp.receiptUrl ? (
                      <button
                        onClick={() => setViewingReceiptExpense(exp)}
                        className="p-1 rounded-lg border border-sage-200 hover:border-sage-400 overflow-hidden group block"
                        title="View Receipt"
                      >
                        <img src={exp.receiptUrl} alt="Thumb" className="w-10 h-7 object-cover rounded" />
                      </button>
                    ) : (
                      <span className="text-charcoal-muted text-[10px]">None</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(exp.status)}`}>
                      {exp.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Actions (Role restricted) */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {currentRole !== 'staff' && exp.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                            title="Approve Expense"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
                            title="Reject Expense"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setViewingReceiptExpense(exp)}
                        className="p-1.5 rounded-lg hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors"
                        title="View Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {currentRole !== 'staff' && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this expense record?')) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-charcoal-muted hover:text-rose-700 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        defaultExhibitionId={selectedExhibitionId !== 'All' ? selectedExhibitionId : undefined}
      />

      <ReceiptViewerModal
        expense={viewingReceiptExpense}
        onClose={() => setViewingReceiptExpense(null)}
      />

    </div>
  );
}
