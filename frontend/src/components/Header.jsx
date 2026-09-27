import React from 'react';
import { GraduationCap, Rocket, Sun, Moon, LogOut } from 'lucide-react';

export default function Header({ 
  studentId, 
  handleLogout, 
  theme, 
  setTheme, 
  currentCgpa
}) {
  return (
    <header className="relative border-b border-indigo-900/10 dark:border-indigo-900/30 bg-white/80 dark:bg-[#0a0a12]/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Ambient glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo and Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold gradient-text leading-tight">ByteCollege</h1>
            <p className="text-[10px] text-slate-500 leading-none">Curriculum Navigator & Academic Companion</p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Roll Number ID */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Student ID</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{studentId}</span>
          </div>

          {/* Current CGPA Badge */}
          {parseFloat(currentCgpa) > 0 && (
            <div className="glass-card px-3 py-1 text-center min-w-[70px]">
              <div className="text-[9px] text-slate-500 font-medium leading-none mb-0.5">CGPA</div>
              <div className="text-sm font-bold gradient-text leading-none">{currentCgpa}</div>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-surface-400 bg-white/50 dark:bg-surface-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:scale-105 transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>



          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer font-semibold"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
