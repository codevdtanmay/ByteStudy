import React from 'react';
import { Menu, Sun, Moon, LogOut, Search, Brain, Sparkles } from 'lucide-react';

const TAB_TITLES = {
  dashboard: { title: 'Overview' },
  advisor: { title: 'ByteAI Advisor' },
  semesters: { title: 'Semesters & Attendance' },
  predictor: { title: 'Target Estimator' },
  pyqs: { title: 'Syllabus & PYQs' },
  focus: { title: 'Focus Zone' },
  deadlines: { title: 'Deadline Planner' },
  expenses: { title: 'Pocket Budget' },
  gradesim: { title: 'Grade Simulator' },
  career: { title: 'Career Roadmap' },
  admin: { title: 'Admin Console' }
};

export default function TopHeader({ activeTab, studentId, currentCgpa, theme, setTheme, handleLogout, onOpenSidebar, onOpenSearch, isByteAiOpen, onToggleByteAi }) {
  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="product-header">
      <div className="flex min-h-[82px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onOpenSidebar} className="md:hidden icon-button" aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="mt-1 truncate font-serif text-[26px] leading-none tracking-[-0.03em] text-stone-900 dark:text-stone-100 sm:text-[30px]">{tabInfo.title}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onOpenSearch} className="secondary-button hidden sm:flex">
            <Search size={15} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={onToggleByteAi}
            className={`byteai-navbar-button ${isByteAiOpen ? 'byteai-navbar-button-open' : ''}`}
            aria-expanded={isByteAiOpen}
            aria-label={isByteAiOpen ? 'Close ByteAI assistant' : 'Open ByteAI assistant'}
          >
            {isByteAiOpen ? <Brain size={15} /> : <Sparkles size={15} />}
            <span>{isByteAiOpen ? 'RestAI' : 'ByteAI'}</span>
          </button>
          <div className="hidden border-l border-stone-200 pl-3 text-right dark:border-stone-700 lg:block">
            <p className="eyebrow">Student ID</p>
            <p className="mt-1 font-mono text-[11px] text-stone-600 dark:text-stone-300">{studentId}</p>
          </div>
          {parseFloat(currentCgpa) > 0 && (
            <div className="metric-chip hidden sm:block">
              <span>CGPA</span>
              <strong>{currentCgpa}</strong>
            </div>
          )}
          <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="icon-button" title="Toggle theme" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" onClick={handleLogout} className="icon-button text-[#a65337] dark:text-[#d99579]" title="Sign out" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
