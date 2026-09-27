import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  Calendar, 
  DollarSign, 
  Shield, 
  FileText,
  Brain,
  Building2
} from 'lucide-react';
import { isAdminAccount } from '../services/authApi';

const TABS = [
  // Academic Group
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Academic' },
  { id: 'advisor', label: 'ByteAI Advisor 🤖', icon: Brain, category: 'Academic' },
  { id: 'semesters', label: 'Semesters & Attendance', icon: BookOpen, category: 'Academic' },
  { id: 'pyqs', label: 'Syllabus & PYQs', icon: FileText, category: 'Academic' },
  // Student Life Group
  { id: 'focus', label: 'Focus Zone ⏱️', icon: Clock, category: 'Student Life' },
  { id: 'deadlines', label: 'Deadline Planner 📅', icon: Calendar, category: 'Student Life' },
  { id: 'expenses', label: 'Pocket Budget 💰', icon: DollarSign, category: 'Student Life' },
  // Administration & Governance
  { id: 'about', label: 'Administration & Founders 🏛️', icon: Building2, category: 'Administration' },
  { id: 'admin', label: 'Admin Console ⚙️', icon: Shield, category: 'Control', adminOnly: true },
];

export default function TabNav({ activeTab, setActiveTab, studentId, userRole }) {
  const isAdmin = isAdminAccount({ role: userRole });

  return (
    <nav className="sticky top-[73px] z-40 bg-white/95 dark:bg-[#111b2e]/95 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {TABS.map(({ id, label, icon: Icon, adminOnly }) => {
              if (adminOnly && !isAdmin) return null;
              
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold
                    whitespace-nowrap transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'tab-active' 
                      : 'tab-inactive border-slate-100 dark:border-surface-600/10'
                    }
                  `}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
