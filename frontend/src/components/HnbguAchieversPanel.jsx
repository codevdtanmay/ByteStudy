import React, { useState, useEffect } from 'react';
import { getAchievers } from '../services/achieverApi';
import logger from '../utils/logger';

export default function HnbguAchieversPanel() {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNominateModal, setShowNominateModal] = useState(false);

  useEffect(() => {
    loadAchievers();
  }, []);

  const loadAchievers = async () => {
    try {
      setLoading(true);
      const data = await getAchievers();
      setAchievers(data || []);
    } catch (err) {
      logger.error('Failed to load achievers', err);
    } finally {
      setLoading(false);
    }
  };

  const branches = [
    { id: 'ALL', label: 'All Branches' },
    { id: 'CSE', label: 'Computer Science (CSE)' },
    { id: 'IT', label: 'Information Tech (IT)' },
    { id: 'ECE', label: 'Electronics & Comm (ECE)' },
    { id: 'EE', label: 'Electrical Engg (EE)' },
    { id: 'ME', label: 'Mechanical Engg (ME)' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Achievements' },
    { id: 'GATE', label: 'GATE Top Rankers' },
    { id: 'PLACEMENT', label: 'Top Tier Placements' },
    { id: 'HACKATHON', label: 'SIH & Hackathons' },
    { id: 'RESEARCH', label: 'Research & Academics' },
  ];

  const filteredAchievers = achievers.filter(item => {
    const matchBranch = selectedBranch === 'ALL' || item.branch === selectedBranch;
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      item.name?.toLowerCase().includes(query) ||
      item.achievementTitle?.toLowerCase().includes(query) ||
      item.branch?.toLowerCase().includes(query) ||
      item.studentQuote?.toLowerCase().includes(query);
    return matchBranch && matchCategory && matchQuery;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'GATE':
        return { label: 'GATE Top Rank', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-neutral-900 dark:text-white dark:border-neutral-700' };
      case 'PLACEMENT':
        return { label: 'Top Tier Placement', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-neutral-900 dark:text-white dark:border-neutral-700' };
      case 'HACKATHON':
        return { label: 'SIH Winner', bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-neutral-900 dark:text-white dark:border-neutral-700' };
      default:
        return { label: 'Excellence', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-neutral-900 dark:text-white dark:border-neutral-700' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-stone-500/15 p-6 md:p-8 border border-amber-500/30 dark:border-neutral-800 dark:bg-black dark:bg-none shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none dark:hidden" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-stone-500/15 rounded-full blur-3xl pointer-events-none dark:hidden" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/20 text-amber-700 dark:text-white dark:bg-white/10 dark:border-white/20 border border-amber-500/30 mb-3">
              <span>🌟 Hall of Fame</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-white animate-pulse" />
              <span>H.N.B. Garhwal Central University</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Achievers of HNBGU 🏆
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Celebrating our students and alumni who cracked high GATE ranks, secured top tier placements (Google, Microsoft, ISRO), won national hackathons, and set high benchmarks. Read their words of advice for juniors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowNominateModal(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center dark:bg-white dark:bg-none dark:text-black dark:hover:bg-neutral-200 dark:shadow-none"
            >
              + Nominate an Achiever
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-black backdrop-blur-md rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, rank..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-black font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Branch Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-slate-100 dark:border-neutral-800 pt-3">
          <span className="text-slate-400 dark:text-neutral-500 font-medium shrink-0">Branch:</span>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                selectedBranch === b.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-10 h-10 border-4 border-amber-500 dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm">Fetching HNBGU Achievers...</p>
        </div>
      ) : filteredAchievers.length === 0 ? (
        <div className="text-center py-16 bg-white/50 dark:bg-black backdrop-blur rounded-2xl border border-slate-200 dark:border-neutral-800">
          <span className="text-4xl mb-3 block">🎓</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Achievers Found</h3>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Try clearing filters or search with another term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievers.map((achiever) => {
            const badge = getCategoryBadge(achiever.category);
            return (
              <div
                key={achiever.id}
                className="group relative bg-white dark:bg-black rounded-2xl border border-slate-200/90 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Top Banner accent */}
                <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:bg-white dark:bg-none" />

                <div className="p-5 md:p-6 space-y-4">
                  {/* Avatar & Badges Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={achiever.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(achiever.name)}`}
                        alt={achiever.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 dark:border-neutral-700 shadow-md bg-slate-100 dark:bg-neutral-900"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(achiever.name)}`;
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 dark:bg-white text-white dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        ★
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {achiever.cgpa && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800">
                            CGPA: {achiever.cgpa}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-amber-500 dark:group-hover:text-white transition-colors truncate">
                        {achiever.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        {achiever.branch} • Batch of {achiever.batch}
                      </p>
                    </div>
                  </div>

                  {/* Main Achievement */}
                  <div className="bg-amber-50/70 dark:bg-neutral-900 border border-amber-200/60 dark:border-neutral-800 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-neutral-400 uppercase tracking-wider block">
                      Key Milestone
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {achiever.achievementTitle}
                    </p>
                  </div>

                  {/* Student Quote / Advice */}
                  {achiever.studentQuote && (
                    <div className="relative pl-3.5 border-l-2 border-slate-300 dark:border-neutral-800">
                      <p className="text-xs italic text-slate-600 dark:text-neutral-300 line-clamp-3">
                        "{achiever.studentQuote}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link / Info */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-neutral-500 font-medium">HNBGU Verified Alumni</span>
                  {achiever.linkedinUrl ? (
                    <a
                      href={achiever.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-white hover:underline"
                    >
                      Connect
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0-.01-3.33 1.67 1.67 0 0 0 .01 3.33m1.4 9.74V9.97H5.06v8.53h2.8z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-emerald-500 dark:text-white font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nominate Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNominateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <span className="text-4xl block">✨</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nominate an HNBGU Achiever</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Know someone from HNBGU (or yourself) who achieved a high GATE rank, off-campus placement, or major award?
              </p>
            </div>

            <div className="mt-5 space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <p className="font-semibold text-slate-800 dark:text-slate-200">How to get featured:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Submit your Name, Roll Number, Branch & Passing Year.</li>
                <li>Proof of achievement (GATE Scorecard, Offer Letter, or Certificate).</li>
                <li>A high-resolution photo and a brief 2-sentence advice for juniors.</li>
              </ul>
              <p className="pt-2 text-slate-500 dark:text-slate-400">
                Admins review all submissions and feature verified students in this Hall of Fame.
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href="mailto:admin@bytepath.local?subject=HNBGU Achiever Nomination"
                className="flex-1 py-2.5 px-4 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                Email Details to Admin
              </a>
              <button
                onClick={() => setShowNominateModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
