'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  LayoutGrid, 
  List, 
  CalendarDays,
  Sparkles,
  Filter
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Exhibition } from '../../types';
import { ExhibitionCard } from '../../components/exhibitions/ExhibitionCard';
import { ExhibitionFormModal } from '../../components/exhibitions/ExhibitionFormModal';
import { ExhibitionDetailModal } from '../../components/exhibitions/ExhibitionDetailModal';

export default function ExhibitionsPage() {
  const { exhibitions } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exhibitionToEdit, setExhibitionToEdit] = useState<Exhibition | null>(null);
  const [detailExhibition, setDetailExhibition] = useState<Exhibition | null>(null);

  const cities = ['All', 'Lahore', 'Islamabad', 'Karachi'];
  const statuses = ['All', 'upcoming', 'ongoing', 'completed'];

  const filteredExhibitions = exhibitions.filter((exh) => {
    const matchesSearch = exh.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exh.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exh.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All' || exh.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || exh.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setExhibitionToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (exh: Exhibition) => {
    setExhibitionToEdit(exh);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Portfolio Management
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
            Exhibitions Directory
          </h2>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary glass-rise-btn px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exhibition</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-sage-600 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, venue, category..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-xs text-charcoal bg-white/80 font-medium glass-input"
          />
        </div>

        {/* Middle: City & Status Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-cream-200/80 p-1 rounded-full border border-sage-200/60">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all glass-rise-btn ${
                  selectedCity === city
                    ? 'bg-sage-800 text-cream shadow-xs'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-white/60'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-full border border-sage-200 bg-white/80 text-xs font-bold text-charcoal outline-none cursor-pointer glass-select"
          >
            <option value="All">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

      </div>

      {/* Exhibitions Grid */}
      {filteredExhibitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExhibitions.map((exh) => (
            <ExhibitionCard
              key={exh.id}
              exhibition={exh}
              onEdit={handleOpenEditModal}
              onViewDetails={(e) => setDetailExhibition(e)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-4xl text-center">
          <CalendarDays className="w-12 h-12 text-sage-400 mx-auto mb-3" />
          <h3 className="font-sans text-xl font-bold text-charcoal mb-1 tracking-tight">
            No Exhibitions Found
          </h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto mb-5 font-light">
            No editions match your current search and filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All');
              setSelectedStatus('All');
            }}
            className="text-xs font-semibold text-sage-800 underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ExhibitionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        exhibitionToEdit={exhibitionToEdit}
      />

      {/* Detail Modal */}
      <ExhibitionDetailModal
        exhibition={detailExhibition}
        onClose={() => setDetailExhibition(null)}
      />

    </div>
  );
}
