import React, { useState, useEffect } from 'react';
import { SYLLABUS } from '../data/syllabus';
import {
  Shield, Plus, Trash2, Video, File, Check, MessageSquare, Sparkles,
  Flame, Gift, Percent, Clock, UserCheck, UserX, Search, RefreshCw, AlertCircle, Trophy, Award
} from 'lucide-react';
import { isAdminAccount } from '../services/authApi';
import { deleteStudyResource, getStudyResources, uploadStudyFile } from '../services/resourceApi';
import { getFeedback } from '../services/feedbackApi';
import {
  getActivePromotion, updatePromotion, grantSubscription,
  revokeSubscription, getRecentSubscriptions
} from '../services/promotionApi';
import { getAchievers, saveAchiever, deleteAchiever } from '../services/achieverApi';

export default function AdminPortal({ uploadedPyqs, setUploadedPyqs, studentId, userRole, onPromotionChange }) {
  const isAdmin = isAdminAccount({ role: userRole });

  // Navigation tab in Admin Portal
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'promotions' | 'subscriptions' | 'feedback'

  // Resource Upload States
  const [adminSem, setAdminSem] = useState(1);
  const [adminCourseCode, setAdminCourseCode] = useState('');
  const [adminResName, setAdminResName] = useState('');
  const [adminResType, setAdminResType] = useState('Mid-Sem PYQ');
  const [adminExamYear, setAdminExamYear] = useState(new Date().getFullYear());
  const [adminFileData, setAdminFileData] = useState(null);
  const [adminFileName, setAdminFileName] = useState('');
  const [adminYoutubeUrl, setAdminYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState([]);

  // Promotion Engine States
  const [promoConfig, setPromoConfig] = useState({
    active: true,
    bannerHeadline: 'Special Offer for You All! Up to 50% OFF on all End-Sem Passes',
    discountPercentage: 50,
    freeSemesters: '',
    freeSemesterList: [],
    freeTrialActive: false,
    freeTrialDays: 5,
    badgeText: 'LIMITED TIME OFFER',
  });
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Subscription Grant States
  const [grantEmail, setGrantEmail] = useState('');
  const [grantPlan, setGrantPlan] = useState('END_SEM_LIFETIME');
  const [grantSemester, setGrantSemester] = useState(1);
  const [grantDuration, setGrantDuration] = useState('0'); // '0' = Lifetime, '5' = 5 days, '30' = 30 days
  const [grantNote, setGrantNote] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantStatusMsg, setGrantStatusMsg] = useState({ type: '', text: '' });

  // Subscription List & Revoke States
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [searchSubEmail, setSearchSubEmail] = useState('');
  const [revokeEmail, setRevokeEmail] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  // Achievers States
  const [achieversList, setAchieversList] = useState([]);
  const [isLoadingAchievers, setIsLoadingAchievers] = useState(false);
  const [isSavingAchiever, setIsSavingAchiever] = useState(false);
  const [achieverForm, setAchieverForm] = useState({
    name: '',
    branch: 'CSE',
    batch: '2021-2025',
    cgpa: '',
    achievementTitle: '',
    category: 'GATE',
    studentQuote: '',
    photoUrl: '',
    linkedinUrl: '',
  });
  const [achieverMsg, setAchieverMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAdmin) return;

    // Load resources
    getStudyResources()
      .then(remoteResources => {
        setUploadedPyqs(previous => {
          const localVideos = previous.filter(item => item.type === 'YouTube Link' && !item.objectKey);
          const byId = new Map(localVideos.map(item => [String(item.id), item]));
          (remoteResources || []).forEach(resource => byId.set(String(resource.id), {
            ...resource,
            id: String(resource.id),
            semester: resource.semesterNumber,
            fileName: resource.originalFilename,
            type: resource.examType === 'END_SEM' ? 'End-Sem PYQ' : resource.examType === 'SYLLABUS' ? 'Syllabus' : resource.examType === 'NOTES' ? 'Notes' : 'Mid-Sem PYQ'
          }));
          return Array.from(byId.values());
        });
      })
      .catch(() => {});

    // Load feedback
    getFeedback().then(setFeedbackItems).catch(() => {});

    // Load active promotion
    getActivePromotion().then(data => {
      if (data) {
        setPromoConfig(data);
      }
    }).catch(() => {});

    // Load subscriptions
    loadSubscriptions();

    // Load achievers
    loadAchievers();
  }, [isAdmin, setUploadedPyqs]);

  const loadSubscriptions = () => {
    setIsLoadingSubs(true);
    getRecentSubscriptions()
      .then(subs => setSubscriptionsList(subs || []))
      .catch(() => {})
      .finally(() => setIsLoadingSubs(false));
  };

  const loadAchievers = () => {
    setIsLoadingAchievers(true);
    getAchievers()
      .then(data => setAchieversList(data || []))
      .catch(() => {})
      .finally(() => setIsLoadingAchievers(false));
  };

  // Update selected course code when target semester changes
  useEffect(() => {
    const semCourses = SYLLABUS.find(s => s.semester === Number(adminSem))?.courses || [];
    if (semCourses.length > 0) {
      setAdminCourseCode(semCourses[0].code);
    }
  }, [adminSem]);

  if (!isAdmin) {
    return (
      <div className="glass-card p-6 text-center max-w-md mx-auto my-12 border border-rose-500/20">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">Restricted Console</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          The Admin Portal is locked. Sign in with the administrator credentials to manage materials, subscriptions, and offers.
        </p>
      </div>
    );
  }

  // --- File Upload Handler ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds the 50MB limit. Please choose a smaller study file.");
      e.target.value = null;
      return;
    }

    setAdminFileName(file.name);
    setAdminFileData(file);
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();

    if (adminResType === 'YouTube Link') {
      if (!adminResName.trim() || !adminYoutubeUrl.trim()) {
        alert("Please enter a title and a valid YouTube URL.");
        return;
      }
    } else {
      if (!adminResName.trim() || !adminFileData) {
        alert("Please enter a title and select a document file.");
        return;
      }
    }

    setIsUploading(true);
    try {
      if (adminResType === 'YouTube Link') {
        const newPyq = {
          id: Date.now().toString(), semester: Number(adminSem), courseCode: adminCourseCode,
          title: adminResName.trim(), type: adminResType, fileName: 'YouTube Reference', fileData: adminYoutubeUrl.trim()
        };
        setUploadedPyqs(prev => [...prev, newPyq]);
      } else {
        const resource = await uploadStudyFile({
          file: adminFileData, title: adminResName.trim(), semesterNumber: adminSem, courseCode: adminCourseCode,
          examType: adminResType === 'Mid-Sem PYQ' ? 'MID_SEM' : adminResType === 'End-Sem PYQ' ? 'END_SEM' : adminResType === 'Notes' ? 'NOTES' : 'SYLLABUS', examYear: (adminResType === 'Syllabus' || adminResType === 'Notes') ? null : adminExamYear
        });
        setUploadedPyqs(prev => [...prev, {
          ...resource, id: String(resource.id), semester: resource.semesterNumber,
          fileName: resource.originalFilename, type: adminResType, examYear: resource.examYear
        }]);
      }
      setAdminResName('');
      setAdminFileData(null);
      setAdminFileName('');
      setAdminYoutubeUrl('');
      e.target.reset();
      alert("Resource published successfully!");
    } catch (error) {
      alert(error.message || 'Resource upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteStudyResource(id);
        setUploadedPyqs(prev => prev.filter(item => String(item.id) !== String(id)));
        alert('Resource deleted successfully.');
      } catch (error) {
        if (error.status === 404) {
          setUploadedPyqs(prev => prev.filter(item => String(item.id) !== String(id)));
          alert('Resource was already deleted.');
          return;
        }
        alert(error.message || 'The resource could not be deleted.');
      }
    }
  };

  // --- Promotion Handlers ---
  const handleToggleSemesterFree = (semNum) => {
    const currentList = promoConfig.freeSemesterList || [];
    let updated;
    if (currentList.includes(semNum)) {
      updated = currentList.filter(s => s !== semNum);
    } else {
      updated = [...currentList, semNum].sort((a, b) => a - b);
    }
    setPromoConfig(prev => ({
      ...prev,
      freeSemesterList: updated,
      freeSemesters: updated.join(',')
    }));
  };

  const handleSavePromotion = async (e) => {
    e.preventDefault();
    setIsSavingPromo(true);
    setPromoSuccessMsg('');
    try {
      const updated = await updatePromotion({
        active: promoConfig.active,
        bannerHeadline: promoConfig.bannerHeadline,
        discountPercentage: Number(promoConfig.discountPercentage),
        freeSemesters: (promoConfig.freeSemesterList || []).join(','),
        freeTrialActive: promoConfig.freeTrialActive,
        freeTrialDays: Number(promoConfig.freeTrialDays),
        badgeText: promoConfig.badgeText,
      });
      setPromoConfig(updated);
      if (onPromotionChange) onPromotionChange(updated);
      setPromoSuccessMsg('🎉 Promotional offer and discount rules updated successfully!');
      setTimeout(() => setPromoSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update promotion.');
    } finally {
      setIsSavingPromo(false);
    }
  };

  // --- Manual Grant Subscription Handler ---
  const handleGrantSubscription = async (e) => {
    e.preventDefault();
    if (!grantEmail.trim()) {
      alert('Please enter a student email.');
      return;
    }

    setIsGranting(true);
    setGrantStatusMsg({ type: '', text: '' });
    try {
      const planToGrant = grantPlan === 'SEMESTER' ? `SEMESTER_${grantSemester}` : grantPlan;
      const duration = Number(grantDuration);

      const res = await grantSubscription({
        email: grantEmail.trim().toLowerCase(),
        plan: planToGrant,
        semester: grantPlan === 'SEMESTER' ? grantSemester : null,
        durationDays: duration > 0 ? duration : null,
        note: grantNote.trim() || 'Admin manual grant'
      });

      setGrantStatusMsg({
        type: 'success',
        text: `✅ Subscription granted to ${res.studentName} (${res.studentEmail})! Plan: ${res.plan}${res.expiresAt ? ` (Expires: ${new Date(res.expiresAt).toLocaleDateString()})` : ' (Lifetime Pass)'}`
      });
      setGrantEmail('');
      setGrantNote('');
      loadSubscriptions();
    } catch (err) {
      setGrantStatusMsg({
        type: 'error',
        text: `❌ ${err.message || 'Failed to grant subscription. Make sure student email is registered.'}`
      });
    } finally {
      setIsGranting(false);
    }
  };

  // --- Revoke Subscription Handler ---
  const handleRevokeSubscription = async (emailToRevoke) => {
    const targetEmail = emailToRevoke || revokeEmail;
    if (!targetEmail.trim()) {
      alert('Please enter an email to revoke.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke subscription for: ${targetEmail}?`)) {
      return;
    }

    setIsRevoking(true);
    try {
      await revokeSubscription(targetEmail.trim().toLowerCase());
      alert(`Subscription revoked for ${targetEmail}.`);
      setRevokeEmail('');
      loadSubscriptions();
    } catch (err) {
      alert(err.message || 'Failed to revoke subscription.');
    } finally {
      setIsRevoking(false);
    }
  };

  // --- Achiever Management Handlers ---
  const handleCreateAchiever = async (e) => {
    e.preventDefault();
    if (!achieverForm.name.trim() || !achieverForm.achievementTitle.trim()) {
      alert('Please provide student name and key achievement.');
      return;
    }

    setIsSavingAchiever(true);
    setAchieverMsg({ type: '', text: '' });
    try {
      await saveAchiever({
        name: achieverForm.name.trim(),
        branch: achieverForm.branch,
        batch: achieverForm.batch.trim(),
        cgpa: achieverForm.cgpa ? Number(achieverForm.cgpa) : null,
        achievementTitle: achieverForm.achievementTitle.trim(),
        category: achieverForm.category,
        studentQuote: achieverForm.studentQuote.trim(),
        photoUrl: achieverForm.photoUrl.trim() || null,
        linkedinUrl: achieverForm.linkedinUrl.trim() || null,
      });
      setAchieverMsg({ type: 'success', text: '🎉 Achiever added successfully to HNBGU Hall of Fame!' });
      setAchieverForm({
        name: '',
        branch: 'CSE',
        batch: '2021-2025',
        cgpa: '',
        achievementTitle: '',
        category: 'GATE',
        studentQuote: '',
        photoUrl: '',
        linkedinUrl: '',
      });
      loadAchievers();
      setTimeout(() => setAchieverMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAchieverMsg({ type: 'error', text: `❌ ${err.message || 'Failed to save achiever'}` });
    } finally {
      setIsSavingAchiever(false);
    }
  };

  const handleDeleteAchiever = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name || 'this achiever'} from the Hall of Fame?`)) return;
    try {
      await deleteAchiever(id);
      loadAchievers();
    } catch (err) {
      alert(err.message || 'Failed to delete achiever.');
    }
  };

  const filteredSubscriptions = subscriptionsList.filter(sub => {
    if (!searchSubEmail.trim()) return true;
    const term = searchSubEmail.toLowerCase();
    return (sub.studentEmail || '').toLowerCase().includes(term) ||
           (sub.studentName || '').toLowerCase().includes(term) ||
           (sub.studentLoginId || '').toLowerCase().includes(term);
  });

  return (
    <div className="admin-portal max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Admin Portal Header */}
      <div className="admin-hero glass-card p-6 border border-slate-200 dark:border-neutral-800 bg-gradient-to-r from-slate-900 via-stone-950 to-slate-900 dark:bg-black dark:bg-none text-white rounded-3xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-700 to-stone-900 dark:bg-white flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white dark:text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">ByteCollege Admin Console</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 dark:text-neutral-400 mt-0.5">
                Control Study Materials, Manage Student Subscriptions & Broadcast Offers
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-neutral-900 backdrop-blur-md border border-white/10 dark:border-neutral-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 block">Materials</span>
              <span className="text-xs font-black text-white">{uploadedPyqs.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-neutral-900 backdrop-blur-md border border-white/10 dark:border-neutral-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 block">Subscribers</span>
              <span className="text-xs font-black text-white">{subscriptionsList.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-white/10 dark:border-neutral-800 pt-4">
          <button
            onClick={() => setActiveTab('resources')}
            className={`admin-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'resources'
                ? 'bg-indigo-600 dark:bg-white text-white dark:text-black shadow-md font-black'
                : 'text-slate-400 dark:text-neutral-400 hover:text-white hover:bg-white/5 dark:hover:bg-neutral-900'
            }`}
          >
            <File size={14} />
            <span>Study Materials & Links</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-neutral-800 dark:text-white text-[9px]">{uploadedPyqs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`admin-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'promotions'
                ? 'bg-indigo-600 dark:bg-white text-white dark:text-black shadow-md font-black'
                : 'text-slate-400 dark:text-neutral-400 hover:text-white hover:bg-white/5 dark:hover:bg-neutral-900'
            }`}
          >
            <Flame size={14} className="text-amber-400 dark:text-white" />
            <span>Offers & Promotions</span>
            {promoConfig.active && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`admin-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 dark:bg-white text-white dark:text-black shadow-md font-black'
                : 'text-slate-400 dark:text-neutral-400 hover:text-white hover:bg-white/5 dark:hover:bg-neutral-900'
            }`}
          >
            <UserCheck size={14} />
            <span>Grant Subscriptions by Email</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-neutral-800 dark:text-white text-[9px]">{subscriptionsList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`admin-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'feedback'
                ? 'bg-indigo-600 dark:bg-white text-white dark:text-black shadow-md font-black'
                : 'text-slate-400 dark:text-neutral-400 hover:text-white hover:bg-white/5 dark:hover:bg-neutral-900'
            }`}
          >
            <MessageSquare size={14} />
            <span>Student Feedback</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-neutral-800 dark:text-white text-[9px]">{feedbackItems.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('achievers')}
            className={`admin-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'achievers'
                ? 'bg-amber-600 dark:bg-white text-white dark:text-black shadow-md font-black'
                : 'text-slate-400 dark:text-neutral-400 hover:text-white hover:bg-white/5 dark:hover:bg-neutral-900'
            }`}
          >
            <Trophy size={14} className="text-amber-400 dark:text-white" />
            <span>HNBGU Achievers 🏆</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-neutral-800 dark:text-white text-[9px]">{achieversList.length}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OFFERS & PROMOTIONS ENGINE                               */}
      {/* ============================================================== */}
      {activeTab === 'promotions' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Live Offer Preview Banner */}
          <div className="glass-card p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles size={12} /> Student Live Banner Preview
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${promoConfig.active ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/20 text-slate-500'}`}>
                {promoConfig.active ? '● Broadcast Active' : '○ Banner Inactive'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-amber-200 shrink-0">
                  {promoConfig.badgeText || 'SPECIAL OFFER'}
                </span>
                <span className="font-bold truncate">{promoConfig.bannerHeadline}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-extrabold text-[10px] bg-white text-indigo-700 px-2 py-1 rounded-md">
                Claim Offer
              </div>
            </div>
          </div>

          {promoSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
              <Check size={16} />
              <span>{promoSuccessMsg}</span>
            </div>
          )}

          {/* Promotion Settings Form */}
          <div className="glass-card p-6 sm:p-8 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <Flame size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Promotions, Discounts & Free Semester Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Configure live discounts (e.g. 50% OFF), unlock entire semesters for free, or enable a 5-day free pass for all students.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePromotion} className="space-y-6">
              
              {/* Master Promotion Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-surface-700/30 border border-slate-200 dark:border-surface-600/30">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Promotional Banner & Offers Across App
                  </div>
                  <div className="text-[11px] text-slate-500">
                    When active, the top announcement banner appears and discounts/free passes are automatically applied.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoConfig.active}
                    onChange={(e) => setPromoConfig(prev => ({ ...prev, active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Banner Headline & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Announcement Banner Headline
                  </label>
                  <input
                    type="text"
                    value={promoConfig.bannerHeadline}
                    onChange={(e) => setPromoConfig(prev => ({ ...prev, bannerHeadline: e.target.value }))}
                    placeholder="e.g., Special Offer for You All! Up to 50% OFF on all End-Sem Passes"
                    className="app-input text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={promoConfig.badgeText}
                    onChange={(e) => setPromoConfig(prev => ({ ...prev, badgeText: e.target.value }))}
                    placeholder="e.g., OFFER FOR YOU ALL"
                    className="app-input text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* Discount Percentage Section */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-surface-600/30 bg-slate-50 dark:bg-surface-700/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent size={14} className="text-indigo-500" />
                    <span>Storewide Discount Percentage</span>
                  </label>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {promoConfig.discountPercentage}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={promoConfig.discountPercentage}
                    onChange={(e) => setPromoConfig(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-500">
                  <span>Quick Presets:</span>
                  {[0, 20, 30, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPromoConfig(prev => ({ ...prev, discountPercentage: pct }))}
                      className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        promoConfig.discountPercentage === pct
                          ? 'bg-indigo-600 text-white border-indigo-600 font-black'
                          : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {pct === 0 ? 'No Discount' : `${pct}% OFF`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester-Wise 100% Free Access */}
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Gift size={14} className="text-emerald-500" />
                      <span>Semester-Wise 100% Free Access</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Check any semester to make all its End-Sem PYQs and answer keys completely free to view and download.
                    </p>
                  </div>
                  {(promoConfig.freeSemesterList || []).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                      {(promoConfig.freeSemesterList || []).length} Sems Free
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                    const isChecked = (promoConfig.freeSemesterList || []).includes(sem);
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => handleToggleSemesterFree(sem)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                          isChecked
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'border-slate-200 dark:border-surface-600/30 text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-700/50 hover:border-emerald-400'
                        }`}
                      >
                        <span>Semester {sem}</span>
                        {isChecked ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px] text-slate-400">Paid</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Day Free Trial / Global Pass Mode */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-surface-600/30 bg-slate-50 dark:bg-surface-700/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock size={14} className="text-purple-500" />
                      <span>Limited-Time Free Trial for All Students</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Temporarily unlocks all 8 Semesters for all students without requiring payment.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoConfig.freeTrialActive}
                      onChange={(e) => setPromoConfig(prev => ({ ...prev, freeTrialActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {promoConfig.freeTrialActive && (
                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Trial Duration:</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={promoConfig.freeTrialDays}
                      onChange={(e) => setPromoConfig(prev => ({ ...prev, freeTrialDays: Number(e.target.value) }))}
                      className="app-input w-28 text-xs font-bold"
                    />
                    <span className="text-xs text-slate-500">Days</span>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSavingPromo}
                className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={16} />
                <span>{isSavingPromo ? 'Saving & Broadcasting Offer...' : 'Save & Broadcast Promotion to All Users'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GRANT SUBSCRIPTION TO USER BY EMAIL                     */}
      {/* ============================================================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-fade-in">

          {/* Form to Grant Subscription */}
          <div className="glass-card p-6 sm:p-8 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Manually Grant Subscription by Email
                </h2>
                <p className="text-xs text-slate-500">
                  Provide instant VIP subscription access to any student as soon as they provide their email address.
                </p>
              </div>
            </div>

            {grantStatusMsg.text && (
              <div className={`p-4 mb-6 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                grantStatusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}>
                {grantStatusMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{grantStatusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleGrantSubscription} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Student Email */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                    placeholder="e.g., student@gmail.com"
                    className="app-input text-xs font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The student will immediately gain full access across all devices once granted.
                  </p>
                </div>

                {/* Plan Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Access Plan
                  </label>
                  <select
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="END_SEM_LIFETIME">Lifetime Pass (All 8 Semesters)</option>
                    <option value="SEMESTER">Single Semester Pass</option>
                    <option value="TRIAL_5_DAYS">5-Day Trial Pass</option>
                    <option value="SPECIAL_SCHOLAR">Scholar Pass (VIP Access)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Duration / Expiry
                  </label>
                  <select
                    value={grantDuration}
                    onChange={(e) => setGrantDuration(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="0">Permanent (No Expiry)</option>
                    <option value="5">5 Days Free Trial</option>
                    <option value="30">30 Days (1 Month)</option>
                    <option value="90">90 Days (1 Semester)</option>
                    <option value="365">365 Days (1 Year)</option>
                  </select>
                </div>

                {/* Semester Picker if Single Semester */}
                {grantPlan === 'SEMESTER' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Target Semester
                    </label>
                    <select
                      value={grantSemester}
                      onChange={(e) => setGrantSemester(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Optional Note */}
                <div className={grantPlan === 'SEMESTER' ? '' : 'sm:col-span-2'}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Reason / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={grantNote}
                    onChange={(e) => setGrantNote(e.target.value)}
                    placeholder="e.g., Requested by student over WhatsApp/Email"
                    className="app-input text-xs"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={isGranting}
                className="w-full mt-4 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>{isGranting ? 'Granting Subscription...' : 'Grant Instant VIP Subscription'}</span>
              </button>
            </form>
          </div>

          {/* Subscriptions Registry Table */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Active & Granted Subscriptions ({subscriptionsList.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  All subscriptions activated through Razorpay or manual admin grants
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchSubEmail}
                    onChange={(e) => setSearchSubEmail(e.target.value)}
                    placeholder="Search email/name..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-surface-600/30 bg-slate-50 dark:bg-surface-700/50 text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <button
                  onClick={loadSubscriptions}
                  className="p-2 rounded-xl border border-slate-200 dark:border-surface-600/30 text-slate-500 hover:text-indigo-600 transition-colors"
                  title="Refresh list"
                >
                  <RefreshCw size={14} className={isLoadingSubs ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-indigo-950/10 rounded-2xl">
                {isLoadingSubs ? 'Loading subscriptions...' : 'No subscriptions recorded yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-indigo-950/15 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-surface-700/10">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Provider</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Expiry</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-indigo-950/10">
                    {filteredSubscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-700/5">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{sub.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sub.studentEmail}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-300">
                          {sub.plan}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-700/40 text-slate-600 dark:text-slate-400">
                            {sub.provider || 'SYSTEM'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500">
                          {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'Permanent'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sub.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleRevokeSubscription(sub.studentEmail)}
                              disabled={isRevoking}
                              className="p-1.5 rounded-lg text-rose-600 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                              title="Revoke subscription"
                            >
                              <UserX size={12} />
                              <span>Revoke</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STUDY MATERIALS & REPOSITORY (ORIGINAL)                 */}
      {/* ============================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Upload Form */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Admin Upload Control Console</h2>
                <p className="text-xs text-slate-500">Publish resources and recommended study videos to specific semester syllabus items</p>
              </div>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Semester selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Target Semester
                  </label>
                  <select 
                    value={adminSem}
                    onChange={(e) => setAdminSem(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                </div>
                {adminResType !== 'YouTube Link' && adminResType !== 'Syllabus' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Exam Year</label>
                    <input type="number" min="2000" max="2100" value={adminExamYear} onChange={e => setAdminExamYear(e.target.value)} className="app-input shadow-sm text-sm" required />
                  </div>
                )}

                {/* Course Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Target Course Code
                  </label>
                  <select 
                    value={adminCourseCode}
                    onChange={(e) => setAdminCourseCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  >
                    {SYLLABUS.find(s => s.semester === Number(adminSem))?.courses.map(course => (
                      <option key={course.code} value={course.code}>{course.title} ({course.code})</option>
                    )) || <option>No courses found</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resource Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Resource Display Name
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., 2024 End-Sem Exam Solved / Oneshot"
                    value={adminResName}
                    onChange={(e) => setAdminResName(e.target.value)}
                    className="app-input shadow-sm text-sm"
                    required
                  />
                </div>

                {/* Resource Classification */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Classification Type
                  </label>
                  <select 
                    value={adminResType}
                    onChange={(e) => setAdminResType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mid-Sem PYQ">Mid-Sem Prep Paper</option>
                    <option value="End-Sem PYQ">End-Sem Prep Paper</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Notes">Notes</option>
                    <option value="YouTube Link">YouTube Video Recommendation</option>
                  </select>
                </div>
              </div>

              {/* Conditional inputs */}
              {adminResType === 'YouTube Link' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    YouTube Lecture URL
                  </label>
                  <input 
                    type="url"
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    value={adminYoutubeUrl}
                    onChange={(e) => setAdminYoutubeUrl(e.target.value)}
                    className="app-input shadow-sm font-mono text-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Select Study File (PDF, Images, Docx - Max 50MB)
                  </label>
                  <input 
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileChange}
                    className="w-full p-2 rounded-lg border text-sm text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    required
                  />
                  {adminFileName && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                      <Check size={12} /> Resource Loaded: {adminFileName}
                    </p>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-4 btn-primary flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>{isUploading ? 'Uploading securely...' : 'Publish Resource'}</span>
              </button>
            </form>
          </div>

          {/* Registry Table */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Published Resource Registry ({uploadedPyqs.length})
            </h3>

            {uploadedPyqs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-indigo-950/10 rounded-2xl">
                No custom materials or study links published yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-indigo-950/15 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-surface-700/10">
                      <th className="py-2.5 px-3">Subject & Code</th>
                      <th className="py-2.5 px-3 text-center">Sem</th>
                      <th className="py-2.5 px-3">Resource Name</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-indigo-950/10">
                    {uploadedPyqs.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-700/5">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-650 dark:text-indigo-400">{item.courseCode}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-500">S{item.semester}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-250 truncate max-w-[200px]" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={item.fileName}>
                            {item.fileName}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold text-[9px]
                            ${item.type === 'YouTube Link' 
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                              : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                            }
                          `}>
                            {item.type === 'YouTube Link' ? <Video size={10} /> : <File size={10} />}
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteResource(item.id)}
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 font-bold"
                            title="Delete resource"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: STUDENT FEEDBACK                                        */}
      {/* ============================================================== */}
      {activeTab === 'feedback' && (
        <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"><MessageSquare size={20} className="text-white" /></div>
              <div><h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Student feedback</h2><p className="text-xs text-slate-500">Testing-phase suggestions and issue reports</p></div>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{feedbackItems.length} total</span>
          </div>
          {feedbackItems.length ? (
            <div className="space-y-3">
              {feedbackItems.map(item => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-surface-600/30 dark:bg-surface-700/30">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{item.type.replaceAll('_', ' ')}</span><time className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</time></div>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">{item.message}</p>
                  <p className="mt-2 text-[10px] text-slate-400">{item.studentName} · {item.studentLoginId} · {item.studentEmail}</p>
                </article>
              ))}
            </div>
          ) : <p className="text-xs text-slate-500">No feedback submitted yet.</p>}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: HNBGU ACHIEVERS MANAGEMENT                              */}
      {/* ============================================================== */}
      {activeTab === 'achievers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="glass-card p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-purple-500/10 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    HNBGU Hall of Fame Management
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      Public Showcase
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add top GATE rankers, high-package alumni placements, and national hackathon winners.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadAchievers}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                >
                  <RefreshCw size={13} className={isLoadingAchievers ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Form to Add New Achiever */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} className="text-amber-500" />
              Feature a New Achiever
            </h3>

            {achieverMsg.text && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold ${achieverMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                {achieverMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateAchiever} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Rawat"
                    value={achieverForm.name}
                    onChange={(e) => setAchieverForm({ ...achieverForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Department / Branch *
                  </label>
                  <select
                    value={achieverForm.branch}
                    onChange={(e) => setAchieverForm({ ...achieverForm, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="CSE">Computer Science & Engg (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="EE">Electrical Engg (EE)</option>
                    <option value="ME">Mechanical Engg (ME)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Graduation Batch *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2021-2025"
                    value={achieverForm.batch}
                    onChange={(e) => setAchieverForm({ ...achieverForm, batch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Achievement Category *
                  </label>
                  <select
                    value={achieverForm.category}
                    onChange={(e) => setAchieverForm({ ...achieverForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="GATE">GATE Top Rank</option>
                    <option value="PLACEMENT">Top Tier Placement</option>
                    <option value="HACKATHON">SIH & Hackathon Winner</option>
                    <option value="RESEARCH">Research / Academic Award</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    CGPA (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 9.40"
                    value={achieverForm.cgpa}
                    onChange={(e) => setAchieverForm({ ...achieverForm, cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (or leave blank for avatar)"
                    value={achieverForm.photoUrl}
                    onChange={(e) => setAchieverForm({ ...achieverForm, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Key Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIR 48 in GATE CS & Software Development Engineer @ Google"
                  value={achieverForm.achievementTitle}
                  onChange={(e) => setAchieverForm({ ...achieverForm, achievementTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Student Advice / Quote for Juniors
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Master the core subjects in Sem 4-6, solve previous 10 years GATE questions, and code daily."
                    value={achieverForm.studentQuote}
                    onChange={(e) => setAchieverForm({ ...achieverForm, studentQuote: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    LinkedIn / Contact Profile (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={achieverForm.linkedinUrl}
                    onChange={(e) => setAchieverForm({ ...achieverForm, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingAchiever}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white dark:bg-white dark:bg-none dark:text-black dark:hover:bg-neutral-200 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingAchiever ? 'Saving to Hall of Fame...' : '+ Publish Achiever to Hall of Fame'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Current Achievers */}
          <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Current Featured Achievers ({achieversList.length})
              </h3>
            </div>

            {achieversList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No achievers in database yet. Add one above!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achieversList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={item.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shrink-0 bg-slate-100 dark:bg-slate-800"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {item.branch} · {item.batch}
                          </span>
                          {item.cgpa && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              CGPA: {item.cgpa}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                          {item.achievementTitle}
                        </p>
                        {item.studentQuote && (
                          <p className="text-[10px] italic text-slate-400 line-clamp-2 mt-1">
                            "{item.studentQuote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAchiever(item.id, item.name)}
                      className="p-1.5 rounded-lg text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shrink-0"
                      title="Delete from Hall of Fame"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
