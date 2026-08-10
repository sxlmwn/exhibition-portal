'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Mail, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckSquare, 
  Square,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CRMContact } from '../../types';
import { ContactDrawer } from '../../components/crm/ContactDrawer';
import { ContactFormModal } from '../../components/crm/ContactFormModal';
import { BulkWhatsAppModal } from '../../components/crm/BulkWhatsAppModal';
import { BulkEmailModal } from '../../components/crm/BulkEmailModal';

export default function CRMPage() {
  const { contacts, deleteContact } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Modals & Drawer State
  const [drawerContact, setDrawerContact] = useState<CRMContact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<CRMContact | null>(null);
  const [isBulkWAOpen, setIsBulkWAOpen] = useState(false);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

  const categories = ['All', 'Apparel & Couture', 'Jewellery & Gems', 'Home & Living', 'Art & Pottery', 'Leather Goods', 'Beauty & Wellness', 'Footwear'];
  const statuses = ['All', 'booked', 'enquired', 'waitlisted', 'past-client', 'referral'];

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const isAllSelected = selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0;

  const handleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

  const handleToggleContact = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenBulkModal = (type: 'whatsapp' | 'email') => {
    if (type === 'whatsapp') setIsBulkWAOpen(true);
    if (type === 'email') setIsBulkEmailOpen(true);
  };

  const selectedContactsList = contacts.filter(c => selectedContactIds.includes(c.id));

  // Export CSV Functionality
  const handleExportCSV = () => {
    const targetList = selectedContactsList.length > 0 ? selectedContactsList : filteredContacts;
    const headers = ['Business Name', 'Contact Name', 'Phone', 'Email', 'Category', 'Status', 'Total Spend', 'Tags'];
    const rows = targetList.map(c => [
      `"${c.businessName}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.category}"`,
      `"${c.status}"`,
      `"${c.totalSpend}"`,
      `"${c.tags.join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exhibitors_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: CRMContact['status']) => {
    switch (status) {
      case 'booked': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40';
      case 'enquired': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40';
      case 'waitlisted': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/40';
      case 'past-client': return 'bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white/80 border-sage-300 dark:border-white/15';
      case 'referral': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/40';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            VENDOR RELATIONSHIPS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Vendor Directory & CRM
          </h2>
        </div>

        <button
          onClick={() => {
            setContactToEdit(null);
            setIsFormOpen(true);
          }}
          className="btn-primary glass-rise-btn px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-sage-600 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, brand, phone, email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500 font-bold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500 capitalize font-bold"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>

          {/* Bulk WhatsApp */}
          <button
            onClick={() => handleOpenBulkModal('whatsapp')}
            className="btn-primary glass-rise-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Queue ({selectedContactIds.length > 0 ? selectedContactIds.length : 'All'})</span>
          </button>

          {/* Bulk Email */}
          <button
            onClick={() => handleOpenBulkModal('email')}
            className="btn-secondary glass-rise-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Blast</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="btn-secondary glass-rise-btn p-2.5 rounded-full text-charcoal hover:bg-cream-200"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Contacts Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-soft border border-sage-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/80 border-b border-sage-200 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
              <tr>
                <th className="py-4 px-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 text-charcoal-muted hover:text-charcoal"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-sage-800" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Brand / Contact</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Tags</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Total Spend</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);

                return (
                  <tr
                    key={contact.id}
                    onClick={() => setDrawerContact(contact)}
                    className={`glass-rise-row hover:bg-white/90 transition-all cursor-pointer ${
                      isSelected ? 'bg-sage-50/80' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleContact(contact.id)}
                        className="p-1 text-charcoal-muted hover:text-charcoal"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sage-800" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Brand & Name */}
                    <td className="py-4 px-4">
                      <span className="font-sans font-bold text-sm text-charcoal block tracking-tight">
                        {contact.businessName}
                      </span>
                      <span className="text-charcoal-muted text-[11px] font-normal">
                        {contact.name}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-charcoal-light font-medium">
                      {contact.category}
                    </td>

                    {/* Contact details */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{contact.phone}</span>
                      </a>
                      <span className="text-[10px] text-charcoal-muted font-normal block mt-0.5 truncate max-w-[130px]">
                        {contact.email}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {contact.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-sage-50 dark:bg-sage-800/30 text-sage-900 dark:text-sage-200 px-2 py-0.5 rounded border border-sage-200 dark:border-sage-700/50 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 2 && (
                          <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-semibold">
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>

                    {/* Total spend */}
                    <td className="py-4 px-4 font-sans font-extrabold text-sage-deep">
                      Rs. {contact.totalSpend.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDrawerContact(contact)}
                          className="p-1.5 rounded-lg hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setContactToEdit(contact);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors"
                          title="Edit Contact"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <ContactDrawer
        contact={drawerContact}
        onClose={() => setDrawerContact(null)}
        onEdit={(c) => {
          setContactToEdit(c);
          setIsFormOpen(true);
        }}
      />

      {/* Add / Edit Modal */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contactToEdit={contactToEdit}
      />

      {/* Bulk WhatsApp Modal */}
      {isBulkWAOpen && (
        <BulkWhatsAppModal
          contacts={selectedContactsList}
          onClose={() => setIsBulkWAOpen(false)}
        />
      )}

      {/* Bulk Email Modal */}
      {isBulkEmailOpen && (
        <BulkEmailModal
          contacts={selectedContactsList}
          onClose={() => setIsBulkEmailOpen(false)}
        />
      )}

    </div>
  );
}
