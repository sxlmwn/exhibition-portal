'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckSquare, 
  Square,
  Sparkles,
  Phone,
  Building2,
  Tag,
  Send,
  HelpCircle,
  ExternalLink,
  Gift,
  Mail
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CRMContact, ContactStatus } from '../../types';
import { ContactDrawer } from '../../components/crm/ContactDrawer';
import { ContactFormModal } from '../../components/crm/ContactFormModal';
import { BulkWhatsAppModal } from '../../components/crm/BulkWhatsAppModal';
import { BulkEmailModal } from '../../components/crm/BulkEmailModal';
import { buildWhatsAppUrl, formatWhatsAppNumber } from '../../lib/whatsapp';

export default function CRMPage() {
  const { contacts, exhibitions, deleteContact, currentUser } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExhibitionId, setSelectedExhibitionId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // WhatsApp Message Template State
  const [waTemplate, setWaTemplate] = useState<string>(
    `Hello {Name}! 👋 We are reaching out from the Curation Desk regarding {Exhibition}. Please let us know if you'd like to reserve your booth slot!`
  );

  // Modals & Drawer State
  const [drawerContact, setDrawerContact] = useState<CRMContact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<CRMContact | null>(null);
  const [isBulkWAOpen, setIsBulkWAOpen] = useState(false);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

  const categories = [
    'All',
    'Haute Couture & Fine Jewelry',
    'Home, Decor & Wellness',
    'Lifestyle & Artisan Craft',
    'Contemporary Art & Design',
    'Textile & Apparel',
    'Studio Ceramics',
    'Beauty & Skincare',
    'Leather & Accessories',
    'Referral Partner'
  ];

  const statuses: { label: string; value: string }[] = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Confirmed Booked', value: 'booked' },
    { label: 'Enquiry / Lead', value: 'enquired' },
    { label: 'Waitlisted', value: 'waitlisted' },
    { label: 'Past Client', value: 'past-client' },
    { label: 'Referral Partner (10% Credit)', value: 'referral' }
  ];

  const sources: { label: string; value: string }[] = [
    { label: 'All Sources', value: 'All' },
    { label: 'Referral Program (10% Credit)', value: 'referral' },
    { label: 'Exhibitor Application', value: 'Exhibitor Application' },
    { label: 'Website Lead', value: 'Website Lead' },
    { label: 'Direct / Manual Entry', value: 'Direct' }
  ];

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (c.fullName || '').toLowerCase().includes(q) ||
                          (c.name || '').toLowerCase().includes(q) ||
                          (c.businessName || '').toLowerCase().includes(q) ||
                          (c.email || '').toLowerCase().includes(q) ||
                          (c.phone || '').includes(q) ||
                          (c.source || '').toLowerCase().includes(q) ||
                          (c.tags || []).some(t => t.toLowerCase().includes(q));
    const matchesExh = selectedExhibitionId === 'All' || c.exhibitionId === selectedExhibitionId;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const matchesSource = selectedSource === 'All' ||
                          (c.source || '').toLowerCase().includes(selectedSource.toLowerCase()) ||
                          (selectedSource === 'referral' && (c.status === 'referral' || (c.source || '').toLowerCase() === 'referral' || (c.tags || []).some(t => t.toLowerCase().includes('referral'))));
    const matchesCategory = selectedCategory === 'All' || (c.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesExh && matchesStatus && matchesSource && matchesCategory;
  });

  const referralCount = contacts.filter(c => c.status === 'referral' || (c.source || '').toLowerCase() === 'referral').length;

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

  const selectedContactsList = contacts.filter(c => selectedContactIds.includes(c.id));
  const activeDispatchList = selectedContactsList.length > 0 ? selectedContactsList : filteredContacts;

  // Open Bulk WhatsApp Dispatch Modal
  const handleOpenBulkWhatsApp = () => {
    if (activeDispatchList.length === 0) {
      alert('No contacts available to message.');
      return;
    }
    setIsBulkWAOpen(true);
  };

  // Open Single Contact WhatsApp
  const handleOpenSingleWhatsApp = (contact: CRMContact) => {
    const { url } = buildWhatsAppUrl(waTemplate, {
      fullName: contact.fullName,
      name: contact.name,
      businessName: contact.businessName,
      exhibitionName: contact.exhibitionName,
      phone: contact.phone,
    });
    window.open(url, '_blank');
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    const targetList = selectedContactsList.length > 0 ? selectedContactsList : filteredContacts;
    if (targetList.length === 0) {
      alert('No contacts to export.');
      return;
    }

    const headers = ['Full Name', 'Phone', 'Email', 'Category', 'Status', 'Source', 'Linked Exhibition', 'Notes'];
    const rows = targetList.map(c => [
      `"${c.fullName || c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.category || ''}"`,
      `"${c.status || ''}"`,
      `"${c.source || ''}"`,
      `"${c.exhibitionName || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
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

  const handleDelete = (contact: CRMContact) => {
    if (confirm(`Are you sure you want to delete "${contact.fullName || contact.name}" from the CRM directory?`)) {
      deleteContact(contact.id);
      setSelectedContactIds(prev => prev.filter(id => id !== contact.id));
    }
  };

  const getStatusBadge = (status: CRMContact['status']) => {
    switch (status) {
      case 'booked': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40';
      case 'enquired': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40';
      case 'waitlisted': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/40';
      case 'past-client': return 'bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white/80 border-sage-300 dark:border-white/15';
      case 'referral': return 'bg-sage-100 dark:bg-sage-900/40 text-sage-900 dark:text-sage-200 border-sage-300 dark:border-sage-700/50';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            VENDOR DIRECTORY
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Vendor Directory & Contacts
          </h2>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {/* Shared WhatsApp Template Banner */}
      <div className="glass-card p-5 rounded-2xl border border-sage-200/80 dark:border-white/10 space-y-3 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>WhatsApp Message Template</span>
          </div>
          <span className="text-[11px] text-charcoal-muted dark:text-white/60">
            Variables: <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Name}'}</code>, <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Business}'}</code>, <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Exhibition}'}</code>
          </span>
        </div>

        <textarea
          rows={2}
          value={waTemplate}
          onChange={(e) => setWaTemplate(e.target.value)}
          placeholder="Type message template to send to vendors..."
          className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5 font-sans leading-relaxed"
        />
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setSelectedStatus('All');
            setSelectedSource('All');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            selectedStatus === 'All' && selectedSource === 'All'
              ? 'bg-sage-800 text-cream dark:bg-sage-600 dark:text-white shadow-xs'
              : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
          }`}
        >
          All Contacts ({contacts.length})
        </button>

        <button
          onClick={() => {
            setSelectedSource('referral');
            setSelectedStatus('All');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            selectedSource === 'referral'
              ? 'bg-sage-800 text-cream dark:bg-sage-600 dark:text-white shadow-xs'
              : 'bg-white/80 dark:bg-white/5 text-sage-800 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Source: Referral Program ({referralCount})</span>
        </button>

        <button
          onClick={() => {
            setSelectedStatus('booked');
            setSelectedSource('All');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            selectedStatus === 'booked' && selectedSource === 'All'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
          }`}
        >
          Booked ({contacts.filter(c => c.status === 'booked').length})
        </button>

        <button
          onClick={() => {
            setSelectedStatus('waitlisted');
            setSelectedSource('All');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            selectedStatus === 'waitlisted' && selectedSource === 'All'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
          }`}
        >
          Waitlisted ({contacts.filter(c => c.status === 'waitlisted').length})
        </button>
      </div>

      {/* Filter Bar, Search & Bulk Actions */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-sage-200/80 dark:border-white/10">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-sage-600 dark:text-sage-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, brand, phone, referral tag..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 font-bold glass-select cursor-pointer"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Exhibition Filter */}
          <select
            value={selectedExhibitionId}
            onChange={(e) => setSelectedExhibitionId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 font-bold glass-select cursor-pointer"
          >
            <option value="All">All Exhibitions</option>
            {exhibitions.map((exh) => (
              <option key={exh.id} value={exh.id}>
                {exh.title} ({exh.city})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 font-bold glass-select cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 capitalize font-bold glass-select cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Bulk WhatsApp Action */}
          <button
            onClick={handleOpenBulkWhatsApp}
            className="btn-primary glass-rise-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            title="Open WhatsApp message queue"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send WhatsApp ({selectedContactIds.length > 0 ? selectedContactIds.length : filteredContacts.length})</span>
          </button>

          {/* Bulk Email Action */}
          <button
            onClick={() => setIsBulkEmailOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-sage-800 dark:bg-sage-700 hover:bg-sage-900 text-cream text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all glass-rise-btn"
            title="Compose and send bulk email blast via Gmail SMTP"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email ({activeDispatchList.filter(c => c.email && c.email.includes('@')).length})</span>
          </button>

          {/* Export CSV Action */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 glass-rise-btn transition-colors"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

        </div>

      </div>

      {/* Contacts Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-soft border border-sage-200/80 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/80 dark:bg-white/5 border-b border-sage-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted dark:text-white/60">
              <tr>
                <th className="py-4 px-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 text-charcoal-muted hover:text-charcoal dark:hover:text-white"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-sage-800 dark:text-sage-300" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Contact / Brand</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Event / Program</th>
                <th className="py-4 px-4">Phone / WhatsApp</th>
                <th className="py-4 px-4">Status & Source</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-white/5">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted dark:text-white/50">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No contacts found</p>
                    <p className="text-xs">Try adjusting your search criteria or add a new contact.</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  const isReferral = contact.status === 'referral' || (contact.source || '').toLowerCase() === 'referral';

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setDrawerContact(contact)}
                      className={`glass-rise-row hover:bg-white/90 dark:hover:bg-white/5 transition-all cursor-pointer ${
                        isSelected ? 'bg-sage-50/80 dark:bg-sage-950/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleContact(contact.id)}
                          className="p-1 text-charcoal-muted hover:text-charcoal dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sage-800 dark:text-sage-300" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Full Name & Brand */}
                      <td className="py-4 px-4">
                        <span className="font-sans font-bold text-sm text-charcoal dark:text-white block tracking-tight">
                          {contact.fullName || contact.name}
                        </span>
                        <span className="text-charcoal-muted dark:text-white/60 text-[11px] font-normal block">
                          {contact.businessName && contact.businessName !== contact.fullName ? contact.businessName : 'Exhibitor Contact'}
                          {contact.source && ` • source: ${contact.source}`}
                        </span>
                        {isReferral && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sage-800 dark:text-sage-300 bg-sage-100/90 dark:bg-sage-900/40 px-2 py-0.5 rounded border border-sage-300/80 dark:border-sage-700/50 mt-1">
                            <Sparkles className="w-3 h-3 text-sage-700 dark:text-sage-400" />
                            10% Credit Eligible
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-charcoal-light dark:text-white/80 font-medium">
                        {contact.category}
                      </td>

                      {/* Linked Exhibition */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-charcoal dark:text-white block">
                          {contact.exhibitionName || 'General / All Exhibitions'}
                        </span>
                        <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-light">
                          {contact.exhibitionId ? `ID #${contact.exhibitionId}` : 'Program Wide'}
                        </span>
                      </td>

                      {/* Contact details */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenSingleWhatsApp(contact)}
                          className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
                          title="Open WhatsApp with pre-filled message"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>{contact.phone || 'No phone'}</span>
                        </button>
                        {contact.email && (
                          <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-normal block mt-0.5 truncate max-w-[140px]">
                            {contact.email}
                          </span>
                        )}
                      </td>

                      {/* Status & Tag */}
                      <td className="py-4 px-4">
                        <span className={`status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDrawerContact(contact)}
                            className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setContactToEdit(contact);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
                            title="Edit Contact"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {currentUser.permissions.canDeleteRecords && (
                            <button
                              onClick={() => handleDelete(contact)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 hover:text-rose-800 transition-colors"
                              title="Delete Contact"
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
          contacts={activeDispatchList}
          initialTemplate={waTemplate}
          onClose={() => setIsBulkWAOpen(false)}
        />
      )}

      {/* Bulk Email Modal */}
      {isBulkEmailOpen && (
        <BulkEmailModal
          contacts={activeDispatchList}
          onClose={() => setIsBulkEmailOpen(false)}
        />
      )}

    </div>
  );
}
