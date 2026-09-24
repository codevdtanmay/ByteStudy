import React from 'react';
import { SYLLABUS } from '../data/syllabus';
import { Sliders, Award, Star, Compass, HelpCircle } from 'lucide-react';

const GRADE_OPTIONS = [
  { grade: 'O', point: 10, label: 'Outstanding' },
  { grade: 'A+', point: 9, label: 'Excellent' },
  { grade: 'A', point: 8, label: 'Very Good' },
  { grade: 'B+', point: 7, label: 'Good' },
  { grade: 'B', point: 6, label: 'Above Avg' },
  { grade: 'C', point: 5, label: 'Average' },
  { grade: 'P', point: 4, label: 'Pass' },
  { grade: 'F', point: 0, label: 'Fail' }
];

export default function GradeSimulator({ 
  currentSemester, 
  simulatedGrades, 
  setSimulatedGrades, 
  simulatedSgpa,
  currentCgpa,
  targetCgpa
}) {
  const currentSemInfo = SYLLABUS.find(s => s.semester === currentSemester) || SYLLABUS[0];
  const courses = currentSemInfo.courses;

  const handleGradeChange = (courseCode, grade) => {
    setSimulatedGrades(prev => ({
      ...prev,
      [courseCode]: grade
    }));
  };

  // Quick preset: Set all subjects to A+ or O
  const applyPreset = (grade) => {
    const updated = { ...simulatedGrades };
    courses.forEach(c => {
      updated[c.code] = grade;
    });
    setSimulatedGrades(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview stats header */}
      <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white shadow-lg">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Active Semester Grade Simulator</h2>
            <p className="text-xs text-slate-500">Simulate grades for Semester {currentSemester} courses to predict your exact SGPA</p>
          </div>
        </div>

        {/* Calculated Simulation output */}
        <div className="flex items-center gap-4 bg-slate-55/30 dark:bg-surface-700/20 px-4 py-3 rounded-xl border border-slate-200/50 dark:border-indigo-950/15">
          <div className="text-center border-r border-slate-200 dark:border-indigo-950/15 pr-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Simulated SGPA</span>
            <span className="text-2xl font-black gradient-text font-mono tracking-tight">{simulatedSgpa}</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Target CGPA</span>
            <span className="text-base font-bold text-orange-500 dark:text-orange-450 font-mono">{targetCgpa}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Simulator Controls */}
        <div className="lg:col-span-2 glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Star size={14} className="text-indigo-500" />
              Course Grade Selectors ({courses.length} subjects)
            </h3>
            
            {/* Presets */}
            <div className="flex gap-2">
              <button 
                onClick={() => applyPreset('O')}
                className="px-2 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
              >
                Set All Outstanding (O)
              </button>
              <button 
                onClick={() => applyPreset('A+')}
                className="px-2 py-1 bg-indigo-500/10 text-indigo-650 hover:bg-indigo-650 hover:text-white dark:text-indigo-400 dark:hover:text-white text-[10px] font-bold rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
              >
                Set All Excellent (A+)
              </button>
            </div>
          </div>

          {/* Courses selection list */}
          <div className="space-y-3">
            {courses.map(course => {
              const selectedGrade = simulatedGrades[course.code] || 'O';
              return (
                <div 
                  key={course.code} 
                  className="bg-slate-50 dark:bg-surface-700/25 border border-slate-200 dark:border-surface-600/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-indigo-950/30 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{course.code}</span>
                    <h4 className="font-bold text-sm text-slate-855 dark:text-slate-250 leading-tight truncate">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Course Weight: <strong className="font-bold text-slate-600 dark:text-slate-400">{course.credits} Credits</strong></p>
                  </div>

                  {/* Selector options */}
                  <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:self-center">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Predict Grade:</span>
                    <select
                      value={selectedGrade}
                      onChange={(e) => handleGradeChange(course.code, e.target.value)}
                      className="w-full min-w-0 max-w-full p-2 border rounded-xl bg-white dark:bg-surface-700 border-slate-250 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm sm:w-auto"
                    >
                      {GRADE_OPTIONS.map(opt => (
                        <option key={opt.grade} value={opt.grade}>
                          {opt.grade} ({opt.point} pts) - {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Simulation Insights & Guidelines */}
        <div className="space-y-6">
          
          {/* GPA Analysis report */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-4">
            <h3 className="font-bold text-sm text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-orange-500" />
              Simulation Report
            </h3>
            
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              If you achieve the simulated SGPA of <strong>{simulatedSgpa}</strong> this semester, it will contribute to your cumulative portfolio.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Current CGPA Standing:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-white">{currentCgpa}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Simulated SGPA Target:</span>
                <span className="font-mono font-bold text-indigo-500">{simulatedSgpa}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Desirable Target CGPA:</span>
                <span className="font-mono font-bold text-orange-500">{targetCgpa}</span>
              </div>
            </div>

            {/* Micro guidance box */}
            <div className="bg-slate-50 dark:bg-surface-700/20 border border-slate-200 dark:border-indigo-950/10 p-3.5 rounded-xl text-xs text-slate-500 leading-relaxed flex gap-2">
              <HelpCircle size={15} className="text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Simulated SGPA is credit-weighted. High-credit subjects (like 4-credit Core courses) affect your SGPA outcome twice as much as 2-credit Skill courses. Focus study energies on high-credit subjects first!
              </span>
            </div>
          </div>

          {/* Grade reference values */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Grade Point Index Guide
            </h4>
            <div className="space-y-2 text-xs">
              {GRADE_OPTIONS.map(opt => (
                <div key={opt.grade} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-indigo-950/10 last:border-b-0">
                  <span className="font-mono font-bold text-slate-750 dark:text-slate-300">{opt.grade} ({opt.label})</span>
                  <span className="font-bold text-slate-550 dark:text-slate-500">{opt.point} Grade Points</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
