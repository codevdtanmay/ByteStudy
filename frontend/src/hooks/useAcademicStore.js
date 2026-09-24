import { useState, useEffect, useCallback } from 'react';
import { SYLLABUS, TOTAL_PROGRAM_CREDITS } from '../data/syllabus';
import { clearActiveSession, hasRemoteAuthApi, getAuthToken, updateAcademicProfile } from '../services/authApi';
import { askAdvisor } from '../services/advisorApi';

// ---- Storage Helpers (Standard hooks to keep state persisted) ----
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota overflow or private browsing block
  }
};

const PROFILE_STORE_KEY = 'bytestudy.studentProfiles.v1';
const EMPTY_SGPAS = { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '' };

const getStudentProfile = (loginId) => {
  if (!loginId) return null;
  const profiles = getStorageItem(PROFILE_STORE_KEY, {});
  return profiles[loginId] || null;
};

const saveStudentProfile = (loginId, updates) => {
  if (!loginId) return;
  const profiles = getStorageItem(PROFILE_STORE_KEY, {});
  profiles[loginId] = { ...(profiles[loginId] || {}), ...updates };
  setStorageItem(PROFILE_STORE_KEY, profiles);
};

export function useAcademicStore() {
  // ---- Profile details (type 'admin' as backdoor roll num for pyqs uploader) ----
  const [studentId, setStudentId] = useState(() => {
    try {
      return localStorage.getItem('activeStudentId') || '';
    } catch {
      return '';
    }
  });

  const initialProfile = getStudentProfile(studentId);

  const [studentName, setStudentName] = useState(() => {
    return initialProfile?.name || '';
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      return localStorage.getItem('activeUserRole') || '';
    } catch {
      return '';
    }
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return Boolean(initialProfile?.isOnboarded);
  });

  const [branch, setBranch] = useState(() => initialProfile?.branch || '');
  const [selectedSemester, setSelectedSemester] = useState(() => initialProfile?.semester || 1);

  const saveOnboardingProfile = ({ name, targetCgpa: target, pastSgpas: sgpas, semester, branch: selectedBranch }) => {
    try {
      const profile = {
        name: name?.trim() || studentName || `Scholar (${studentId})`,
        targetCgpa: target || '8.50',
        pastSgpas: sgpas || EMPTY_SGPAS,
        semester: Number(semester) || 1,
        branch: selectedBranch || 'CSE',
        isOnboarded: true,
      };
      saveStudentProfile(studentId, profile);
      setStudentName(profile.name);
      setTargetCgpa(profile.targetCgpa);
      setPastSgpas(profile.pastSgpas);
      setSelectedSemester(profile.semester);
      setBranch(profile.branch);
      setIsOnboarded(true);
      // Persist the onboarding flag on the authenticated account as well as
      // localStorage, so it survives a new browser session or device.
      updateAcademicProfile({
        name: profile.name,
        targetCgpa: Number(profile.targetCgpa),
        onboarded: true,
      }).catch((error) => console.warn('Could not sync academic profile:', error));
    } catch (e) {
      console.error(e);
    }
  };

  // ---- Dark / Light toggler ----
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'; // Dark theme is default because it looks cooler
    } catch {
      return 'dark';
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // ---- Grade logs (SGPAs earned in prior semesters) ----
  const [pastSgpas, setPastSgpas] = useState(() => {
    return initialProfile?.pastSgpas || EMPTY_SGPAS;
  });

  // ---- Desired CGPA goal ----
  const [targetCgpa, setTargetCgpa] = useState(() => {
    return initialProfile?.targetCgpa || '8.50';
  });

  // ---- Detailed daily class attendance ledger ----
  const [attendanceLogs, setAttendanceLogs] = useState(() => 
    getStorageItem('attendanceLogs', [])
  );

  // ---- Backdoor uploaded papers and resource links ----
  const [uploadedPyqs, setUploadedPyqs] = useState(() => 
    getStorageItem('uploadedPyqs', [])
  );

  // ---- Tasks and syllabus deadline tracker ----
  const [deadlines, setDeadlines] = useState(() => 
    getStorageItem('deadlines', [
      { id: '1', title: 'Mathematics I Assignment 1', dueDate: '2026-06-01', category: 'assignment', priority: 'high', status: 'pending' },
      { id: '2', title: 'Data Structures Lab File Submission', dueDate: '2026-06-05', category: 'lab', priority: 'critical', status: 'in-progress' },
      { id: '3', title: 'DBMS Mini Project Presentation', dueDate: '2026-06-12', category: 'project', priority: 'medium', status: 'pending' }
    ])
  );

  // ---- Pocket expenses manager ----
  const [expenses, setExpenses] = useState(() => 
    getStorageItem('expenses', [
      { id: '1', amount: 350, category: 'food', description: 'Snacks at campus canteen', date: new Date().toISOString().split('T')[0] },
      { id: '2', amount: 150, category: 'transport', description: 'Metro tokens', date: new Date().toISOString().split('T')[0] }
    ])
  );
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('monthlyBudget');
      return saved ? parseFloat(saved) : 3000;
    } catch {
      return 3000;
    }
  });

  // ---- Interactive SGPA Simulator grades ----
  const [simulatedGrades, setSimulatedGrades] = useState(() => 
    getStorageItem('simulatedGrades', {})
  );

  // ---- Focus zone timer history ----
  const [focusSessions, setFocusSessions] = useState(() => 
    getStorageItem('focusSessions', [])
  );

  // ---- Custom AI Advisor Chat logs ----
  const [advisorChat, setAdvisorChat] = useState(() => 
    getStorageItem('advisorChat', [
      { 
        id: '1', 
        sender: 'ai', 
        text: "Yo! I'm ByteAI, your study advisor. I've scanned your grades, attendance, and active subjects. Click one of the questions below or ask me anything — I'll write a custom study response based on your standing!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ])
  );

  // ---- End-Sem Subscription Status ----
  const [hasEndSemSubscription, setHasEndSemSubscription] = useState(() => {
    try {
      return localStorage.getItem('hasEndSemSubscription') === 'true';
    } catch {
      return false;
    }
  });

  const activateEndSemSubscription = (paymentData) => {
    try {
      localStorage.setItem('hasEndSemSubscription', 'true');
      localStorage.setItem('endSemSubscriptionData', JSON.stringify(paymentData));
      setHasEndSemSubscription(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ---- Sync states to localStorage ----
  useEffect(() => {
    if (studentId) {
      localStorage.setItem('activeStudentId', studentId);
    } else {
      localStorage.removeItem('activeStudentId');
    }
  }, [studentId]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (studentId) saveStudentProfile(studentId, { pastSgpas });
  }, [studentId, pastSgpas]);

  useEffect(() => {
    if (studentId) saveStudentProfile(studentId, { targetCgpa });
  }, [studentId, targetCgpa]);

  useEffect(() => {
    if (studentId) saveStudentProfile(studentId, { name: studentName, branch, semester: selectedSemester });
  }, [studentId, studentName, branch, selectedSemester]);

  useEffect(() => {
    setStorageItem('attendanceLogs', attendanceLogs);
  }, [attendanceLogs]);

  useEffect(() => {
    setStorageItem('uploadedPyqs', uploadedPyqs);
  }, [uploadedPyqs]);

  useEffect(() => {
    setStorageItem('deadlines', deadlines);
  }, [deadlines]);

  useEffect(() => {
    setStorageItem('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
  }, [monthlyBudget]);

  useEffect(() => {
    setStorageItem('simulatedGrades', simulatedGrades);
  }, [simulatedGrades]);

  useEffect(() => {
    setStorageItem('focusSessions', focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    setStorageItem('advisorChat', advisorChat);
  }, [advisorChat]);

  // ---- Auth handlers ----
  const handleLogin = useCallback((account) => {
    const loginId = typeof account === 'string' ? account : account?.loginId;
    const name = typeof account === 'string' ? '' : account?.name;
    const role = typeof account === 'string' ? '' : account?.role;

    if (loginId?.trim()) {
      const cleanLoginId = loginId.trim();
      const profile = getStudentProfile(cleanLoginId);
      setStudentId(cleanLoginId);
      setUserRole(role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
      localStorage.setItem('activeUserRole', role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
      setStudentName(profile?.name || name?.trim() || '');
      setTargetCgpa(profile?.targetCgpa || account?.targetCgpa || '8.50');
      setPastSgpas(profile?.pastSgpas || EMPTY_SGPAS);
      setSelectedSemester(profile?.semester || 1);
      setBranch(profile?.branch || '');
      setIsOnboarded(Boolean(profile?.isOnboarded || account?.isOnboarded));
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearActiveSession();
    setStudentId('');
    setUserRole('');
    localStorage.removeItem('activeUserRole');
  }, []);

  const updateSemesterSGPA = useCallback((semNum, val) => {
    setPastSgpas((prev) => ({ ...prev, [semNum]: val }));
  }, []);

  // ---- Portfolio calculations ----
  const completedSemesters = SYLLABUS.filter((sem) => {
    const sgpa = pastSgpas[sem.semester];
    return sgpa !== '' && sgpa !== undefined && !isNaN(parseFloat(sgpa));
  });

  const earnedCredits = completedSemesters.reduce((acc, sem) => acc + sem.totalCredits, 0);
  
  const totalQualityPoints = completedSemesters.reduce((acc, sem) => {
    const sgpa = parseFloat(pastSgpas[sem.semester]);
    return acc + (sgpa * sem.totalCredits);
  }, 0);

  const currentCgpa = earnedCredits > 0 ? (totalQualityPoints / earnedCredits).toFixed(2) : '0.00';
  const remainingCredits = TOTAL_PROGRAM_CREDITS - earnedCredits;
  
  // ---- CGPA Predictor Math Engine ----
  const cgpaPredictor = (() => {
    const target = parseFloat(targetCgpa);
    if (!target || isNaN(target) || target < 0 || target > 10) {
      return { valid: false, reason: 'Invalid target CGPA scale' };
    }

    if (remainingCredits <= 0) {
      return {
        valid: true,
        requiredSGPA: null,
        achievable: parseFloat(currentCgpa) >= target,
        message: parseFloat(currentCgpa) >= target ? '🎉 Target already achieved!' : 'Curriculum completed below target.',
      };
    }

    const pointsNeeded = target * TOTAL_PROGRAM_CREDITS - totalQualityPoints;
    const requiredSGPA = pointsNeeded / remainingCredits;
    const achievable = requiredSGPA <= 10.0;

    return {
      valid: true,
      requiredSGPA: Math.max(0, requiredSGPA).toFixed(2),
      achievable,
      message: achievable
        ? `You need an average SGPA of ${requiredSGPA.toFixed(2)} in remaining semesters.`
        : `Unreachable! You need a ${requiredSGPA.toFixed(2)} SGPA, which exceeds the 10.0 limit. Consider adjusting your goal or taking extra certifications.`,
    };
  })();

  const chartData = SYLLABUS.map((sem, idx) => {
    const sgpaRaw = pastSgpas[sem.semester];
    const sgpaVal = sgpaRaw !== '' && sgpaRaw !== undefined ? parseFloat(sgpaRaw) : null;

    let runningCGPA = null;
    const priorSems = SYLLABUS.slice(0, idx + 1).filter((s) => {
      const g = pastSgpas[s.semester];
      return g !== '' && g !== undefined && !isNaN(parseFloat(g));
    });

    if (priorSems.length > 0) {
      const totalCreditsCompleted = priorSems.reduce((acc, s) => acc + s.totalCredits, 0);
      const totalWeightedPoints = priorSems.reduce((acc, s) => acc + parseFloat(pastSgpas[s.semester]) * s.totalCredits, 0);
      runningCGPA = parseFloat((totalWeightedPoints / totalCreditsCompleted).toFixed(2));
    }

    return {
      name: `Sem ${sem.semester}`,
      sgpa: sgpaVal,
      cgpa: runningCGPA,
      target: parseFloat(targetCgpa) || null,
      credits: sem.totalCredits,
    };
  });

  const currentSemester = (() => {
    return Number(selectedSemester) || 1;
  })();

  const careerPhase = (() => {
    if (currentSemester <= 2) return '1-2';
    if (currentSemester <= 4) return '3-4';
    if (currentSemester <= 6) return '5-6';
    return '7-8';
  })();

  // ---- Attendance summary helper ----
  const calculatedAttendancePercent = (() => {
    const totalCount = attendanceLogs.length;
    if (totalCount === 0) return 'N/A';
    const presentCount = attendanceLogs.filter((log) => log.status === 'Present').length;
    return ((presentCount / totalCount) * 100).toFixed(1);
  })();

  const subjectAttendanceBreakdown = useCallback(() => {
    const codes = Array.from(new Set(attendanceLogs.map((l) => l.courseCode)));
    return codes.map((code) => {
      const courseLogs = attendanceLogs.filter((l) => l.courseCode === code);
      const presentCount = courseLogs.filter((l) => l.status === 'Present').length;
      const totalCount = courseLogs.length;
      const pct = parseFloat(((presentCount / totalCount) * 100).toFixed(1));
      return { code, present: presentCount, total: totalCount, percentage: pct };
    });
  }, [attendanceLogs]);

  // ---- Simulated grade values maps ----
  const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };

  const simulatedSgpa = (() => {
    const currentSemInfo = SYLLABUS.find((s) => s.semester === currentSemester);
    if (!currentSemInfo) return '0.00';

    let totalSimCredits = 0;
    let totalSimPoints = 0;

    currentSemInfo.courses.forEach((course) => {
      const grade = simulatedGrades[course.code] || 'O';
      const pts = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : 10;
      totalSimCredits += course.credits;
      totalSimPoints += (pts * course.credits);
    });

    return totalSimCredits > 0 ? (totalSimPoints / totalSimCredits).toFixed(2) : '0.00';
  })();

  // ---- BACKEND AI SIMULATION ENGINE (Localized Heuristic Inference) ----
  const askByteAI = useCallback((query) => {
    const lower = query.toLowerCase();
    let reply = "";
    
    // Fetch active subjects names
    const currentSemInfo = SYLLABUS.find((s) => s.semester === currentSemester);
    const activeSubjects = currentSemInfo ? currentSemInfo.courses.map(c => c.title) : [];

    if (lower.includes('attendance') || lower.includes('safe') || lower.includes('shortage')) {
      const att = parseFloat(calculatedAttendancePercent);
      if (isNaN(att)) {
        reply = "I don't see any attendance logs registered yet! Go to the 'Semesters' or 'Dashboard' page and log some classes. Remember: you need 75% to take university exams!";
      } else if (att < 75) {
        reply = `Alert! Your overall attendance is currently at ${att}%. That's below the 75% cutoff threshold! You need to attend your upcoming lectures immediately. Head over to the 'Semesters & Attendance' panel to see exactly how many consecutive lectures you need for each course.`;
      } else {
        reply = `Looking good! Your overall attendance is at ${att}%, which is safe (>= 75%). You have some leeway, but keep logging your classes to prevent sudden drops!`;
      }
    } 
    
    else if (lower.includes('study plan') || lower.includes('timetable') || lower.includes('schedule')) {
      if (activeSubjects.length === 0) {
        reply = "You've finished all 8 semesters! Time to study for placements or final dissertation packaging.";
      } else {
        const list = activeSubjects.slice(0, 3).map(s => `- **${s}**: Focus on weekly tutorials and clear past papers.`).join('\n');
        reply = `Sure! Here's your personalized **Semester ${currentSemester} Study Strategy**:\n\n${list}\n\n**Action Plan:** Use the 'Focus Zone' tab for 25-minute Pomodoro sessions. I recommend spending 45 mins/day on your highest-credit course.`;
      }
    } 
    
    else if (lower.includes('target') || lower.includes('cgpa') || lower.includes('estimate') || lower.includes('reach')) {
      const pred = cgpaPredictor;
      if (pred.requiredSGPA === null) {
        reply = pred.message;
      } else if (parseFloat(pred.requiredSGPA) > 10) {
        reply = `Honestly, a target CGPA of **${targetCgpa}** is mathematically unreachable with your remaining credits. You need a future average of **${pred.requiredSGPA}**, which is above 10.0. I recommend adjusting your target to a reachable level or logging MOOC courses.`;
      } else {
        reply = `To hit your target CGPA of **${targetCgpa}** (current standing: **${currentCgpa}**), you need to maintain a collective average SGPA of **${pred.requiredSGPA}** across your remaining **${remainingCredits}** credits. This is very achievable! Use the 'Grade Simulator' to plan your scores.`;
      }
    } 
    
    else if (lower.includes('career') || lower.includes('web') || lower.includes('job') || lower.includes('placement')) {
      if (currentSemester <= 2) {
        reply = "You are in the **Foundation Phase** (Sem 1-2). Stop worrying about placements right now! Focus on C programming basics, HTML elements, and CSS flexbox. Build clean static web pages.";
      } else if (currentSemester <= 4) {
        reply = "You are in the **Core Engineering Phase** (Sem 3-4). Learn React component architectures and bridge OOP (C++) concepts into JS hooks. Start checking standard algorithms (Data Structures).";
      } else if (currentSemester <= 6) {
        reply = "You are in the **Full-Stack Launch Phase** (Sem 5-6). Treat 'Web Technology' as your core subject. Build full-stack MERN projects, commit them to GitHub, and deploy on Vercel.";
      } else {
        reply = "You are in the **Specialization Phase** (Sem 7-8). Time to packaging flagship portfolios! Integrate AI APIs (OpenAI/Hugging Face) into your React projects, dockerize servers, and practice coding challenges.";
      }
    } 
    
    else {
      // General fallbacks
      reply = `I'm analyzing your academic portfolio. Currently in **Semester ${currentSemester}**, with a **${currentCgpa}** CGPA, targeting a **${targetCgpa}** CGPA. Active subjects include: ${activeSubjects.slice(0, 3).join(', ')}. \n\n*Pro-tip: Try asking me for a 'study plan', 'target check', or 'attendance status' for a specific breakdown!*`;
    }

    const newAiMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdvisorChat(prev => [...prev, newAiMessage]);
  }, [currentSemester, currentCgpa, targetCgpa, calculatedAttendancePercent, cgpaPredictor, remainingCredits]);

  // ---- Add User Message to Chat ----
  const addUserChat = useCallback((text) => {
    if (!text.trim()) return;
    
    const newUserMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdvisorChat(prev => [...prev, newUserMessage]);

    if (hasRemoteAuthApi() && getAuthToken()) {
      askAdvisor(text)
        .then((message) => {
          setAdvisorChat(prev => [...prev, {
            id: message.id || Date.now().toString(),
            sender: 'ai',
            text: message.text,
            timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        })
        .catch(() => {
          askByteAI(text);
        });
      return;
    }

    setTimeout(() => askByteAI(text), 600);
  }, [askByteAI]);

  // ---- Clear Chat logs ----
  const clearChatLogs = useCallback(() => {
    setAdvisorChat([
      { 
        id: '1', 
        sender: 'ai', 
        text: "Chat cleared! Let's start fresh. How can I help you with your B.Tech CS & IT subjects today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  const resetAll = useCallback(() => {
    setPastSgpas({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '' });
    setTargetCgpa('8.50');
    setAttendanceLogs([]);
    setUploadedPyqs([]);
    setDeadlines([]);
    setExpenses([]);
    setMonthlyBudget(3000);
    setSimulatedGrades({});
    setFocusSessions([]);
    clearChatLogs();
  }, [clearChatLogs]);

  return {
    // profile & settings
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    // profile & onboarding
    studentId,
    studentName,
    branch,
    selectedSemester,
    userRole,
    setStudentName,
    isOnboarded,
    saveOnboardingProfile,
    handleLogin,
    handleLogout,

    // prior grades & predictors
    pastSgpas,
    updateSemesterSGPA,
    targetCgpa,
    setTargetCgpa,
    earnedCredits,
    remainingCredits,
    currentCgpa,
    cgpaPredictor,
    chartData,
    currentSemester,
    careerPhase,

    // attendance logs
    attendanceLogs,
    setAttendanceLogs,
    calculatedAttendancePercent,
    subjectAttendanceBreakdown,

    // admin resources
    uploadedPyqs,
    setUploadedPyqs,

    // kanban deadlines
    deadlines,
    setDeadlines,

    // expense manager
    expenses,
    setExpenses,
    monthlyBudget,
    setMonthlyBudget,

    // focus study sessions
    focusSessions,
    setFocusSessions,

    // grade simulators
    simulatedGrades,
    setSimulatedGrades,
    simulatedSgpa,

    // AI Advisor
    advisorChat,
    addUserChat,
    clearChatLogs,

    // End-Sem Subscription
    hasEndSemSubscription,
    activateEndSemSubscription,

    resetAll
  };
}
