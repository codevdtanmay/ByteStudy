import React, { useState } from 'react';
import { GraduationCap, Target, BookOpen, ArrowRight, Sparkles, Check, Sun, Moon } from 'lucide-react';
import { SYLLABUS } from '../data/syllabus';

export default function OnboardingModal({
  isOpen,
  studentId,
  onComplete,
  initialTargetCgpa = '8.50',
  initialTheme = 'dark',
  onThemePreview
}) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState(initialTargetCgpa);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [branch, setBranch] = useState('CSE');
  const [completedSems, setCompletedSems] = useState(1);
  const [theme, setTheme] = useState(initialTheme);
  const [semSgpas, setSemSgpas] = useState({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''
  });

  const showPastResults = currentSemester > 2;
  const maxCompletedSems = Math.max(1, currentSemester - 1);

  React.useEffect(() => {
    if (currentSemester <= 2) {
      setCompletedSems(0);
      setSemSgpas({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '' });
    } else {
      setCompletedSems(previous => Math.min(Math.max(previous, 1), maxCompletedSems));
    }
  }, [currentSemester, maxCompletedSems]);

  if (!isOpen) return null;

  const handleSgpaChange = (sem, val) => {
    // Validate number between 0 and 10
    if (val === '' || (!isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
      setSemSgpas(prev => ({ ...prev, [sem]: val }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      name: name.trim() || `Scholar (${studentId})`,
      targetCgpa: target || '8.50',
      pastSgpas: semSgpas,
      semester: currentSemester,
      branch,
      theme
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-xl glass-card p-6 sm:p-8 border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#172033] shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Ambient background blur circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-500/30">
            <GraduationCap size={28} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles size={11} /> First-Time Setup
          </div>
          <h2 className="text-2xl font-black gradient-text tracking-tight">
            Welcome to ByteStudy!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Choose your semester and branch, then add your academic details to set up your profile.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto scrollbar-none pr-1 space-y-5 flex-1">
          
          {/* 1. Name & Target CGPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dhairya Pardhi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="app-input text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Target CGPA Goal</span>
                <span className="text-amber-500 font-extrabold">Scale: 0-10</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="e.g. 8.50"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="app-input text-sm font-bold pr-10"
                />
                <Target size={16} className="absolute right-3 top-3 text-amber-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 2. Current semester & branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Current Semester
              </label>
              <select value={currentSemester} onChange={(e) => setCurrentSemester(Number(e.target.value))} className="app-input text-sm font-semibold">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Branch
              </label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="app-input text-sm font-semibold">
                {['CSE', 'IT', 'ECE', 'ME', 'IE'].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>

          {/* 3. Theme preference */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Choose your appearance</label>
            <div className="grid grid-cols-2 gap-3">
              {[['light', 'Light mode', Sun], ['dark', 'Dark mode', Moon]].map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setTheme(value); onThemePreview?.(value); }}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${theme === value ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 dark:border-indigo-950/40 dark:bg-surface-700/40 dark:text-slate-300'}`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Number of Completed Semesters */}
          {showPastResults && <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" />
                How many semesters have you completed?
              </label>
              <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {completedSems} Semester{completedSems > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: maxCompletedSems }, (_, index) => index + 1).map(sem => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setCompletedSems(sem)}
                  className={`flex-1 min-w-[38px] py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    completedSems >= sem
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-white dark:bg-surface-700 text-slate-400 border border-slate-200 dark:border-indigo-950/40'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>}

          {/* 5. Semester-Wise SGPA Inputs */}
          {showPastResults && <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Enter SGPA for Completed Semesters:
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SYLLABUS.slice(0, completedSems).map(sem => (
                <div key={sem.semester} className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-700/30 border border-slate-200 dark:border-indigo-950/30 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">
                    Sem {sem.semester} ({sem.totalCredits} cr)
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.2"
                    value={semSgpas[sem.semester]}
                    onChange={(e) => handleSgpaChange(sem.semester, e.target.value)}
                    className="app-input text-center text-xs font-bold p-1.5 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>}

          {/* Submit Action */}
          <div className="pt-3 shrink-0">
            <button
              type="submit"
              className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-indigo-500/30 cursor-pointer"
            >
              <Check size={18} />
              <span>Save Academic Profile & Launch Hub</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
