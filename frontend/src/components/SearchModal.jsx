import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Clock, Calendar, DollarSign, Sliders, Briefcase, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { SYLLABUS } from '../data/syllabus';

const QUICK_TOOLS = [
  { id: 'dashboard', title: 'Dashboard & SGPA Timeline', category: 'Academic', icon: BookOpen },
  { id: 'semesters', title: 'Semesters & Course Attendance', category: 'Academic', icon: BookOpen },
  { id: 'predictor', title: 'Target CGPA Estimator', category: 'Planner', icon: TrendingUp },
  { id: 'pyqs', title: 'Syllabus & Past Exam PYQs', category: 'Resources', icon: FileText },
  { id: 'focus', title: 'Focus Zone & Pomodoro Timer ⏱️', category: 'Productivity', icon: Clock },
  { id: 'deadlines', title: 'Deadline & Assignment Planner 📅', category: 'Productivity', icon: Calendar },
  { id: 'expenses', title: 'Pocket Expense Manager 💰', category: 'Student Life', icon: DollarSign },
  { id: 'gradesim', title: 'Interactive Grade Simulator 📊', category: 'Simulation', icon: Sliders },
  { id: 'career', title: 'Web Dev Career Roadmap 🚀', category: 'Career', icon: Briefcase },
];

export default function SearchModal({ isOpen, onClose, setActiveTab }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter courses from 8 semesters
  const matchedCourses = SYLLABUS.flatMap((sem) =>
    sem.courses
      .filter((c) => c.title.toLowerCase().includes(cleanQuery) || c.code.toLowerCase().includes(cleanQuery))
      .map((c) => ({ ...c, semester: sem.semester }))
  );

  // Filter quick tools
  const matchedTools = QUICK_TOOLS.filter(
    (t) => t.title.toLowerCase().includes(cleanQuery) || t.category.toLowerCase().includes(cleanQuery)
  );

  const handleSelectTool = (tabId) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleSelectCourse = () => {
    setActiveTab('semesters');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c0d20] border border-slate-200 dark:border-indigo-950/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-indigo-950/40 flex items-center gap-3">
          <Search size={20} className="text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search courses, codes (e.g. DBMS, C105), tools, or PYQs... (Press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200 p-1">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Quick Tools Section */}
          {matchedTools.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Workspace Tools & Panels
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedTools.map(({ id, title, category, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleSelectTool(id)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-surface-700/40 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-slate-200/60 dark:border-indigo-950/40 flex items-center justify-between text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
                          {title}
                        </p>
                        <p className="text-[10px] text-slate-400">{category}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Courses Section */}
          {matchedCourses.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Curriculum Courses ({matchedCourses.length})
              </p>
              <div className="space-y-1.5">
                {matchedCourses.slice(0, 8).map((course, idx) => (
                  <button
                    key={idx}
                    onClick={handleSelectCourse}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-surface-700/30 hover:bg-slate-100 dark:hover:bg-surface-700/60 border border-slate-200/50 dark:border-indigo-950/30 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">
                        Sem {course.semester}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{course.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{course.code} • {course.credits} Credits • {course.type}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-500">View in Semesters →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTools.length === 0 && matchedCourses.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-semibold">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for course names like "DBMS", "Operating System", or tools like "Focus Zone"</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-50 dark:bg-[#070814] border-t border-slate-200 dark:border-indigo-950/40 text-center text-[11px] text-slate-400 flex items-center justify-between px-5">
          <span>Tip: Navigate using quick keywords</span>
          <span>ByteStudy B.Tech CS & IT 196-Credit Navigator</span>
        </div>

      </div>
    </div>
  );
}
