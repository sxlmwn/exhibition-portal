'use client';

import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ExpenseItem, ExpenseCategory } from '../../types';
import { ExpenseFormModal } from '../../components/finance/ExpenseFormModal';
import { ReceiptViewerModal } from '../../components/finance/ReceiptViewerModal';
import { ExpenseDetailModal } from '../../components/finance/ExpenseDetailModal';
import { isPdfUrl, openReceiptUrl } from '../../lib/storage';

export default function FinancePage() {
  const { 
    expenses, 
    exhibitions, 
    stalls, 
    currentUser, 
    deleteExpense 
  } = useAdmin();

  const isOwner = currentUser.permissions.canApproveExpenses || currentUser.role === 'owner';

  // Filters state
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItem | null>(null);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<ExpenseItem | null>(null);
  const [detailExpense, setDetailExpense] = useState<ExpenseItem | null>(null);

  const categories = [
    'All',
    'Venue Rent',
    'Marketing & Ads',
    'Staff & Labour',
    'Logistics & Freight',
    'Setup, Decor & Lighting',
    'Security & Protocol',
    'Refreshments',
    'Miscellaneous'
  ];

  // Selected exhibition object
  const currentExhibition = useMemo(() => {
    if (selectedExhibitionId === 'All') return null;
    return exhibitions.find(e => e.id === selectedExhibitionId) || null;
  }, [exhibitions, selectedExhibitionId]);

  // Filtered expenses list with date range & search
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesExh = selectedExhibitionId === 'All' || exp.exhibitionId === selectedExhibitionId;
        const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesStart = !filterStartDate || exp.date >= filterStartDate;
        const matchesEnd = !filterEndDate || exp.date <= filterEndDate;
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          exp.description.toLowerCase().includes(q) ||
          exp.category.toLowerCase().includes(q) ||
          (exp.exhibitionName?.toLowerCase().includes(q) ?? false);

        return matchesExh && matchesCat && matchesStart && matchesEnd && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
  }, [expenses, selectedExhibitionId, selectedCategory, filterStartDate, filterEndDate, searchQuery]);

  // Per-Exhibition Financial KPI Calculations
  const financialSummary = useMemo(() => {
    if (currentExhibition) {
      const budgetAllocated = currentExhibition.budgetAllocated ?? 0;
      const budgetReceived = currentExhibition.budgetReceived != null ? currentExhibition.budgetReceived : budgetAllocated;
      const exhExpenses = expenses.filter(e => e.exhibitionId === currentExhibition.id);
      const totalSpent = exhExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remainingBudget = budgetReceived - totalSpent;
      
      // Calculate booked stall revenue from stall_slots
      const bookedStalls = stalls.filter(s => s.exhibitionId === currentExhibition.id && s.status === 'booked');
      const stallRevenueBooked = bookedStalls.length > 0
        ? bookedStalls.reduce((sum, s) => sum + s.price, 0)
        : currentExhibition.stallRevenueBooked ?? 0;

      // Category breakdown
      const categorySpendMap: Record<string, number> = {};
      exhExpenses.forEach((e) => {
        categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
      });

      return {
        title: currentExhibition.title,
        budgetAllocated,
        budgetReceived,
        totalSpent,
        remainingBudget,
        stallRevenueBooked,
        categorySpendMap,
        spendPct: budgetReceived > 0 ? Math.round((totalSpent / budgetReceived) * 100) : 0
      };
    } else {
      // Consolidated
      const budgetAllocated = exhibitions.reduce((sum, e) => sum + (e.budgetAllocated ?? 0), 0);
      const budgetReceived = exhibitions.reduce((sum, e) => sum + (e.budgetReceived != null ? e.budgetReceived : e.budgetAllocated ?? 0), 0);
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const remainingBudget = budgetReceived - totalSpent;
      
      const bookedStalls = stalls.filter(s => s.status === 'booked');
      const stallRevenueBooked = bookedStalls.length > 0
        ? bookedStalls.reduce((sum, s) => sum + s.price, 0)
        : exhibitions.reduce((sum, e) => sum + (e.stallRevenueBooked ?? 0), 0);

      const categorySpendMap: Record<string, number> = {};
      expenses.forEach((e) => {
        categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
      });

      return {
        title: 'All Exhibitions (Consolidated)',
        budgetAllocated,
        budgetReceived,
        totalSpent,
        remainingBudget,
        stallRevenueBooked,
        categorySpendMap,
        spendPct: budgetReceived > 0 ? Math.round((totalSpent / budgetReceived) * 100) : 0
      };
    }
  }, [currentExhibition, exhibitions, expenses, stalls]);

  // Export CSV Report
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('No expense items to export under the current filters.');
      return;
    }

    const headers = ['ID', 'Exhibition Name', 'Category', 'Amount (PKR)', 'Expense Date', 'Description', 'Receipt URL'];
    const rows = filteredExpenses.map(e => [
      `"${e.id}"`,
      `"${e.exhibitionName}"`,
      `"${e.category}"`,
      `"${e.amount}"`,
      `"${e.date}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.receiptUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Ledger_${selectedExhibitionId !== 'All' ? selectedExhibitionId : 'All'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (exp: ExpenseItem) => {
    if (!isOwner) return;
    if (confirm(`Are you sure you want to delete this ${exp.category} expense of Rs. ${exp.amount.toLocaleString()}?`)) {
      deleteExpense(exp.id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            FINANCE & BUDGET
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Finance & Expenses
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-lg border border-sage-300 dark:border-white/20 bg-white/90 dark:bg-white/5 text-xs font-bold text-charcoal dark:text-white hover:bg-white dark:hover:bg-white/10 transition-all shadow-xs flex items-center justify-center gap-2 glass-rise-btn"
          >
            <Download className="w-4 h-4 text-sage-700 dark:text-sage-300" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setExpenseToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex-1 sm:flex-initial btn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-soft glass-rise-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Per-Exhibition Selector & Financial Summary Panel */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-sage-200/80 dark:border-white/10 relative overflow-hidden shadow-soft">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage-100 dark:border-white/10">
          <div>
            <span className="eyebrow-label">
              FINANCIAL OVERVIEW
            </span>
            <div className="relative inline-block mt-1">
              <select
                value={selectedExhibitionId}
                onChange={(e) => setSelectedExhibitionId(e.target.value)}
                className="font-sans text-xl sm:text-2xl font-bold text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] hover:bg-white border-2 border-sage-200 dark:border-white/15 focus:border-sage-700 outline-none px-4 py-2 rounded-lg cursor-pointer tracking-tight glass-select shadow-2xs"
              >
                <option value="All">All Exhibitions</option>
                {exhibitions.map((exh) => (
                  <option key={exh.id} value={exh.id} className="text-sm font-sans font-bold">
                    {exh.title} ({exh.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isOwner && (
            <div className="status-badge flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 rounded-full font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Staff Role: Can log expenses. Editing / Deleting ledgers is restricted to Owner.</span>
            </div>
          )}
        </div>

        {/* 5 Financial KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
          
          {/* 1. Budget Allocated */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-charcoal-muted dark:text-white/60 uppercase tracking-wider block mb-1 font-bold">
                Budget Allocated
              </span>
              <span className="font-sans text-xl sm:text-2xl font-bold text-charcoal dark:text-white tracking-tight">
                Rs. {(financialSummary.budgetAllocated / 100000).toFixed(1)}L
              </span>
            </div>
            <span className="text-[10px] text-charcoal-muted dark:text-white/50 block mt-2 font-medium">
              Planned budget ceiling
            </span>
          </div>

          {/* 2. Budget Received */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-charcoal-muted dark:text-white/60 uppercase tracking-wider block mb-1 font-bold">
                Budget Received
              </span>
              <span className="font-sans text-xl sm:text-2xl font-bold text-charcoal dark:text-white tracking-tight">
                Rs. {(financialSummary.budgetReceived / 100000).toFixed(1)}L
              </span>
            </div>
            <span className="text-[10px] text-charcoal-muted dark:text-white/50 block mt-2 font-medium">
              Funds realized in bank
            </span>
          </div>

          {/* 3. Total Spent */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-charcoal-muted dark:text-white/60 uppercase tracking-wider block mb-1 font-bold">
                Total Expenses Spent
              </span>
              <span className="font-sans text-xl sm:text-2xl font-bold text-rose-800 dark:text-rose-400 tracking-tight">
                Rs. {(financialSummary.totalSpent / 100000).toFixed(1)}L
              </span>
              <div className="w-full h-1.5 bg-cream-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-rose-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, financialSummary.spendPct)}%` }} 
                />
              </div>
            </div>
            <span className="text-[10px] text-charcoal-muted dark:text-white/50 block mt-2 font-medium">
              {financialSummary.spendPct}% of funds utilized
            </span>
          </div>

          {/* 4. Remaining Budget */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-charcoal-muted dark:text-white/60 uppercase tracking-wider block mb-1 font-bold">
                Remaining Budget
              </span>
              <span className={`font-sans text-xl sm:text-2xl font-bold tracking-tight ${financialSummary.remainingBudget >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-700'}`}>
                Rs. {(financialSummary.remainingBudget / 100000).toFixed(1)}L
              </span>
            </div>
            <span className="text-[10px] text-charcoal-muted dark:text-white/50 block mt-2 font-medium">
              Liquidity balance
            </span>
          </div>

          {/* 5. Stall Revenue Booked */}
          <div className="p-4 sm:p-5 rounded-3xl bg-sage-50/90 dark:bg-sage-950/40 border border-sage-200 dark:border-white/10 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-sage-900 dark:text-sage-300 uppercase tracking-wider font-bold block mb-1">
                Stall Revenue Booked
              </span>
              <span className="font-sans text-xl sm:text-2xl font-bold text-sage-deep dark:text-sage-200 tracking-tight">
                Rs. {(financialSummary.stallRevenueBooked / 100000).toFixed(1)}L
              </span>
            </div>
            <span className="text-[10px] text-sage-800 dark:text-sage-300 block mt-2 font-bold">
              Net: Rs. {((financialSummary.stallRevenueBooked - financialSummary.totalSpent) / 100000).toFixed(1)}L
            </span>
          </div>

        </div>

        {/* Spend by Category Breakdown Bars */}
        <div className="mt-6 pt-6 border-t border-sage-100 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="w-4 h-4 text-sage-700 dark:text-sage-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal dark:text-white">
              Category Spend Breakdown ({financialSummary.title})
            </span>
          </div>

          {Object.keys(financialSummary.categorySpendMap).length === 0 ? (
            <p className="text-xs text-charcoal-muted dark:text-white/50 italic">No expense entries recorded for this scope yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(financialSummary.categorySpendMap).map(([category, amount]) => {
                const pct = financialSummary.totalSpent > 0 ? Math.round((amount / financialSummary.totalSpent) * 100) : 0;
                return (
                  <div 
                    key={category} 
                    className="p-3.5 rounded-2xl bg-cream-50/70 dark:bg-white/5 border border-sage-200/60 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-charcoal dark:text-white truncate">{category}</span>
                      <span className="text-charcoal-muted dark:text-white/60 font-semibold">{pct}%</span>
                    </div>
                    <span className="font-sans text-sm font-extrabold text-charcoal dark:text-white block mb-1.5">
                      Rs. {amount.toLocaleString()}
                    </span>
                    <div className="w-full h-1.5 bg-sage-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sage-700 dark:bg-sage-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Filter Bar, Date Range & Search */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-sage-200/80 dark:border-white/10">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-sage-600 dark:text-sage-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search expenses by category or memo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input"
          />
        </div>

        {/* Dropdowns & Date Range */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Exhibition Filter */}
          <select
            value={selectedExhibitionId}
            onChange={(e) => setSelectedExhibitionId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none cursor-pointer glass-select"
          >
            <option value="All">All Exhibitions</option>
            {exhibitions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none cursor-pointer glass-select"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Date Range Start */}
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-sage-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted dark:text-white/50">From:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-transparent text-charcoal dark:text-white outline-none text-xs"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-sage-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted dark:text-white/50">To:</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-transparent text-charcoal dark:text-white outline-none text-xs"
            />
          </div>

          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="text-[11px] text-sage-800 dark:text-sage-300 font-bold hover:underline"
            >
              Clear Dates
            </button>
          )}

        </div>

      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-sage-200/80 dark:border-white/10 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/90 dark:bg-white/5 border-b border-sage-200 dark:border-white/10 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted dark:text-white/60">
              <tr>
                <th className="py-4 px-5">Expense / Category</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Event</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Receipt</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-muted dark:text-white/50">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No expense records found</p>
                    <p className="text-xs">Try adjusting your filters or log a new expense.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isPdf = isPdfUrl(exp.receiptUrl);

                  return (
                    <tr 
                      key={exp.id} 
                      onClick={() => setDetailExpense(exp)}
                      className="glass-rise-row hover:bg-white/90 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                      
                      {/* Category & Memo */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-charcoal dark:text-white block text-sm">
                          {exp.category}
                        </span>
                        <span className="text-charcoal-muted dark:text-white/60 text-[11px] font-normal block max-w-sm leading-tight mt-0.5">
                          {exp.description}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-sans text-sm font-extrabold text-charcoal dark:text-white">
                        Rs. {exp.amount.toLocaleString()}
                      </td>

                      {/* Exhibition */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-charcoal dark:text-white block">
                          {exp.exhibitionName}
                        </span>
                        <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-light">
                          ID #{exp.exhibitionId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-charcoal dark:text-white/80 font-medium">
                        {exp.date}
                      </td>

                      {/* Receipt Preview (Thumbnail or PDF) */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {exp.receiptUrl ? (
                          isPdf ? (
                            <button
                              type="button"
                              onClick={() => openReceiptUrl(exp.receiptUrl)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold hover:bg-rose-100 transition-colors glass-rise-btn"
                              title="Open PDF Voucher"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>PDF Voucher</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setViewingReceiptExpense(exp)}
                              className="p-1 rounded-lg border border-sage-200 dark:border-white/10 hover:border-sage-400 overflow-hidden group block shadow-2xs"
                              title="View Receipt"
                            >
                              <img src={exp.receiptUrl} alt="Thumb" className="w-10 h-7 object-cover rounded" />
                            </button>
                          )
                        ) : (
                          <span className="text-charcoal-muted dark:text-white/40 text-[11px] italic">No receipt</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Inspect View */}
                          <button
                            onClick={() => setDetailExpense(exp)}
                            className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
                            title="Inspect Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (Owner Only) */}
                          {isOwner && (
                            <button
                              onClick={() => {
                                setExpenseToEdit(exp);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
                              title="Edit Expense"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete (Owner Only) */}
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(exp)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 hover:text-rose-800 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExpenseDetailModal
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
        onEdit={(exp) => {
          setExpenseToEdit(exp);
          setIsFormOpen(true);
        }}
        onViewReceipt={(url) => {
          if (detailExpense) {
            setViewingReceiptExpense(detailExpense);
          }
        }}
      />

      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        defaultExhibitionId={selectedExhibitionId !== 'All' ? selectedExhibitionId : undefined}
      />

      <ReceiptViewerModal
        expense={viewingReceiptExpense}
        onClose={() => setViewingReceiptExpense(null)}
      />

    </div>
  );
}
