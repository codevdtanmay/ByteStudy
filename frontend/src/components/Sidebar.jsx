import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  Sliders,
  Shield,
  FileText,
  Sun,
  Moon,
  LogOut,
  X,
  Award,
  Target,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { isAdminAccount } from '../services/authApi';

const NAV_SECTIONS = [
  {
    title: '',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'semesters', label: 'Attendence Records', icon: BookOpen },
      { id: 'pyqs', label: 'Syllabus & PYQs', icon: FileText }
    ]
  },
  {
    title: 'More tools',
    items: [
      { id: 'predictor', label: 'Target Estimator', icon: TrendingUp },
      { id: 'gradesim', label: 'Grade Simulator', icon: Sliders },
      { id: 'focus', label: 'Focus Zone', icon: Clock },
      { id: 'deadlines', label: 'Deadline Planner', icon: Calendar },
      { id: 'expenses', label: 'Pocket Budget', icon: DollarSign },
      { id: 'career', label: 'Career Roadmap', icon: Briefcase }
    ]
  },
  {
    title: 'Administration',
    items: [{ id: 'admin', label: 'Admin Console', icon: Shield, adminOnly: true }]
  }
];

export default function Sidebar({
  studentId,
  userRole,
  studentName = '',
  handleLogout,
  theme,
  setTheme,
  currentCgpa,
  targetCgpa,
  earnedCredits = 0,
  calculatedAttendancePercent = 0,
  hasEndSemSubscription = false,
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  onOpenFeedback
}) {
  const isAdmin = isAdminAccount({ role: userRole });
  const goTo = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside className={`product-sidebar fixed inset-y-0 left-0 z-50 w-[268px] flex flex-col border-r border-stone-200 dark:border-stone-700 bg-[#fbfaf7] dark:bg-[#20241f] transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-stone-200 dark:border-stone-700">
          <button type="button" onClick={() => goTo('dashboard')} className="flex items-center gap-3 text-left">
            <BrandLogo />
            <span>
              <span className="block text-[15px] font-bold tracking-[-0.02em] text-stone-900 dark:text-stone-100">ByteStudy</span>
              <span className="block mt-0.5 text-[10px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Academic planner</span>
            </span>
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="md:hidden icon-button" aria-label="Close navigation">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="sidebar-profile mb-7 px-2">
            <div className="flex items-center justify-between gap-3">
              <div className="sidebar-profile-name min-w-0">
                <span className="sidebar-avatar">{(studentName || 'S').slice(0, 1).toUpperCase()}</span>
                <p className="truncate">{studentName || 'Student Scholar'}</p>
              </div>
              <span className="status-mark"><CheckCircle2 size={15} /></span>
            </div>

            <div className="sidebar-cgpa-grid mt-5">
              <div className="sidebar-cgpa-card">
                <span>Current CGPA</span>
                <strong>{currentCgpa > 0 ? currentCgpa : '—'}</strong>
              </div>
              <div className="sidebar-cgpa-card sidebar-cgpa-target">
                <span>Target CGPA</span>
                <strong>{targetCgpa || '8.50'}</strong>
              </div>
            </div>
          </div>

          <nav aria-label="Primary navigation" className="space-y-6">
            {NAV_SECTIONS.map((section) => {
              const visibleItems = section.items.filter(({ adminOnly }) => !adminOnly || isAdmin);
              if (!visibleItems.length) return null;
              return (
                <section key={section.title || 'primary-navigation'}>
                  {section.title && <p className="eyebrow px-3">{section.title}</p>}
                  <div className={`${section.title ? 'mt-2' : ''} space-y-0.5`}>
                    {visibleItems.map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => goTo(id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`product-nav-item ${isActive ? 'product-nav-item-active' : ''}`}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2 : 1.7} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="mt-7 flex w-full items-center gap-2 rounded-xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-2.5 text-left text-xs font-bold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
          >
            <MessageSquare size={16} />
            <span>Give feedback</span>
          </button>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-700 p-4">
          <div className="mb-3 flex items-center justify-between px-2 text-[10px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5"><Award size={13} /> Attendance {calculatedAttendancePercent}%</span>
            <span className="flex items-center gap-1.5"><Target size={13} /> {hasEndSemSubscription ? 'Pass active' : 'Standard plan'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="secondary-button">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button type="button" onClick={handleLogout} className="secondary-button text-[#a65337] dark:text-[#d99579]">
              <LogOut size={15} /> Sign out
            </button>
          </div>
      </div>
      </aside>
    </>
  );
}
