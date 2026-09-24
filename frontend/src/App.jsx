import React, { useState, useEffect } from 'react';
import { useAcademicStore } from './hooks/useAcademicStore';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './components/Dashboard';
import SemestersPanel from './components/SemestersPanel';
import PredictorPanel from './components/PredictorPanel';
import SyllabusPanel from './components/SyllabusPanel';
import FocusZone from './components/FocusZone';
import DeadlineTracker from './components/DeadlineTracker';
import ExpenseTracker from './components/ExpenseTracker';
import GradeSimulator from './components/GradeSimulator';
import CareerPanel from './components/CareerPanel';
import AdminPortal from './components/AdminPortal';
import AdvisorPanel from './components/AdvisorPanel';
import OnboardingModal from './components/OnboardingModal';
import LoginPage from './components/LoginPage';
import SearchModal from './components/SearchModal';
import { consumeOAuthSession, getActiveSession } from './services/authApi';

export default function App() {
  const store = useAcademicStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Restore a previously authenticated account, including after a browser refresh.
  useEffect(() => {
    const session = consumeOAuthSession() || getActiveSession();
    if (!store.studentId && session?.loginId) {
      store.handleLogin(session);
    }
  }, [store.handleLogin, store.studentId]);

  useEffect(() => {
    if (store.activeTab === 'admin' && store.userRole !== 'ADMIN') {
      store.setActiveTab('dashboard');
    }
  }, [store.activeTab, store.setActiveTab, store.userRole]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  if (!store.studentId) {
    return <LoginPage onLoginSuccess={(account) => store.handleLogin(account)} />;
  }

  // 2. MAIN HUB APPARATUS WITH LEFT SIDEBAR LAYOUT
  return (
    <div className="min-h-screen relative bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300 overflow-x-hidden flex">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      {/* Pinned Left Sidebar Container (Holds ALL Student Info & Nav) */}
      <Sidebar 
        studentId={store.studentId}
        userRole={store.userRole}
        studentName={store.studentName}
        handleLogout={store.handleLogout}
        theme={store.theme}
        setTheme={store.setTheme}
        currentCgpa={store.currentCgpa}
        targetCgpa={store.targetCgpa}
        earnedCredits={store.earnedCredits}
        calculatedAttendancePercent={store.calculatedAttendancePercent}
        hasEndSemSubscription={store.hasEndSemSubscription}
        activeTab={store.activeTab}
        setActiveTab={store.setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Right Content Workspace */}
      <div className="flex-1 md:pl-[268px] flex flex-col min-h-screen relative z-10 transition-all duration-300 w-full">
        {/* Top Header */}
        <TopHeader 
          activeTab={store.activeTab}
          studentId={store.studentId}
          currentCgpa={store.currentCgpa}
          theme={store.theme}
          setTheme={store.setTheme}
          handleLogout={store.handleLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Dynamic Workspace Container */}
        <main id="main-content" className={`${store.activeTab === 'advisor' ? 'max-w-none px-4 sm:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'} mx-auto py-5 sm:py-6 flex-1 w-full space-y-5`} tabIndex="-1">
          {store.activeTab === 'dashboard' && (
            <Dashboard 
              chartData={store.chartData}
              currentCgpa={store.currentCgpa}
              targetCgpa={store.targetCgpa}
              earnedCredits={store.earnedCredits}
              remainingCredits={store.remainingCredits}
              calculatedAttendancePercent={store.calculatedAttendancePercent}
              setActiveTab={store.setActiveTab}
            />
          )}

          {store.activeTab === 'advisor' && (
            <AdvisorPanel 
              advisorChat={store.advisorChat}
              addUserChat={store.addUserChat}
              clearChatLogs={store.clearChatLogs}
            />
          )}

          {store.activeTab === 'semesters' && (
            <SemestersPanel 
              pastSgpas={store.pastSgpas}
              updateSemesterSGPA={store.updateSemesterSGPA}
              attendanceLogs={store.attendanceLogs}
              setAttendanceLogs={store.setAttendanceLogs}
            />
          )}

          {store.activeTab === 'predictor' && (
            <PredictorPanel 
              currentCgpa={store.currentCgpa}
              targetCgpa={store.targetCgpa}
              setTargetCgpa={store.setTargetCgpa}
              cgpaPredictor={store.cgpaPredictor}
              earnedCredits={store.earnedCredits}
              remainingCredits={store.remainingCredits}
              pastSgpas={store.pastSgpas}
            />
          )}

          {store.activeTab === 'pyqs' && (
            <SyllabusPanel 
              uploadedPyqs={store.uploadedPyqs}
              hasEndSemSubscription={store.hasEndSemSubscription}
              activateEndSemSubscription={store.activateEndSemSubscription}
              studentId={store.studentId}
              userRole={store.userRole}
            />
          )}

          {store.activeTab === 'focus' && (
            <FocusZone 
              focusSessions={store.focusSessions}
              setFocusSessions={store.setFocusSessions}
            />
          )}

          {store.activeTab === 'deadlines' && (
            <DeadlineTracker 
              deadlines={store.deadlines}
              setDeadlines={store.setDeadlines}
            />
          )}

          {store.activeTab === 'expenses' && (
            <ExpenseTracker 
              expenses={store.expenses}
              setExpenses={store.setExpenses}
              monthlyBudget={store.monthlyBudget}
              setMonthlyBudget={store.setMonthlyBudget}
            />
          )}

          {store.activeTab === 'gradesim' && (
            <GradeSimulator 
              currentSemester={store.currentSemester}
              simulatedGrades={store.simulatedGrades}
              setSimulatedGrades={store.setSimulatedGrades}
              simulatedSgpa={store.simulatedSgpa}
              currentCgpa={store.currentCgpa}
              targetCgpa={store.targetCgpa}
            />
          )}

          {store.activeTab === 'career' && (
            <CareerPanel 
              careerPhase={store.careerPhase}
              currentSemester={store.currentSemester}
            />
          )}

          {store.activeTab === 'admin' && store.userRole === 'ADMIN' && (
            <AdminPortal 
              uploadedPyqs={store.uploadedPyqs}
              setUploadedPyqs={store.setUploadedPyqs}
              studentId={store.studentId}
              userRole={store.userRole}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-stone-200 dark:border-stone-700 py-6 text-center text-[10px] uppercase tracking-[0.14em] text-stone-400 relative z-10 shrink-0 mt-auto">
          <p>Built with ❤️ by ANUJ</p>
          <p>Orchestrated & Managed with ❤️ by TANMAY</p>
        </footer>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={store.setActiveTab}
      />

      {/* First-Time Login Onboarding Modal */}
      <OnboardingModal
        isOpen={!!store.studentId && !store.isOnboarded}
        studentId={store.studentId}
        initialTargetCgpa={store.targetCgpa}
        onComplete={store.saveOnboardingProfile}
      />
    </div>
  );
}
