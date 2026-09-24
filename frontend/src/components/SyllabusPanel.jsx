import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SYLLABUS } from '../data/syllabus';
import { Download, Youtube, ExternalLink, FileText, Library, Lock, Sparkles, CheckCircle2, ShieldAlert, Eye, X } from 'lucide-react';
import EndSemSubscriptionModal from './EndSemSubscriptionModal';
import BrandLogo from './BrandLogo';
import { isAdminAccount } from '../services/authApi';
import { getProtectedStudyFile, getStudyResources } from '../services/resourceApi';

export default function SyllabusPanel({
  uploadedPyqs = [],
  hasEndSemSubscription = false,
  activateEndSemSubscription,
  studentId = '',
  userRole = ''
}) {
  const [selectedSem, setSelectedSem] = useState(1);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [remoteResources, setRemoteResources] = useState([]);
  const [examPicker, setExamPicker] = useState(null);
  const [viewer, setViewer] = useState(null);
  const isAdmin = isAdminAccount({ role: userRole });
  const hasPremiumAccess = isAdmin || hasEndSemSubscription;

  useEffect(() => {
    let cancelled = false;
    getStudyResources(selectedSem)
      .then(resources => { if (!cancelled) setRemoteResources(resources || []); })
      .catch(() => { if (!cancelled) setRemoteResources([]); });
    return () => { cancelled = true; };
  }, [selectedSem]);

  useEffect(() => {
    if (!viewer) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [viewer]);

  const openProtectedResource = async (resource) => {
    setViewer({ title: resource.title, loading: true });
    try {
      const blob = await getProtectedStudyFile(resource.id);
      setViewer({ title: resource.title, url: URL.createObjectURL(blob), loading: false });
    } catch (error) {
      setViewer(null);
      alert(error.message || 'This resource is not available yet.');
    }
  };

  const resourceYear = (resource) => resource.examYear || Number((resource.title || '').match(/20\d{2}/)?.[0]) || null;
  const resourceExamType = (resource) => resource.examType || (resource.type === 'NOTES' || /notes?/i.test(resource.title || '') ? 'NOTES' : /(syllabus|curriculum)/i.test(resource.title || '') ? 'SYLLABUS' : /(mid|internal)/i.test(resource.title || '') ? 'MID_SEM' : /(end|final)/i.test(resource.title || '') ? 'END_SEM' : 'GENERAL');
  const resourcesForExam = (courseCode, examType) => remoteResources.filter(resource =>
    resource.courseCode === courseCode && resource.status === 'READY' && resourceExamType(resource) === examType
  ).sort((a, b) => (resourceYear(b) || 0) - (resourceYear(a) || 0));

  const chooseExamFile = (resource) => {
    setExamPicker(null);
    if (resourceExamType(resource) === 'END_SEM' && !hasPremiumAccess) {
      setPendingDownload({ resource });
      setIsSubModalOpen(true);
      return;
    }
    openProtectedResource(resource);
  };

  const openExamPicker = (course, examType) => {
    const choices = resourcesForExam(course.code, examType);
    if (!choices.length) {
      const label = examType === 'MID_SEM' ? 'Mid-Sem PYQ' : examType === 'END_SEM' ? 'End-Sem PYQ' : examType === 'NOTES' ? 'notes' : 'syllabus';
      alert(`No ${label} has been uploaded for ${course.title} yet.`);
      return;
    }
    setExamPicker({ course, examType, choices });
  };

  // Trigger base64 file downloads
  const downloadBase64File = (base64String, fileName) => {
    const link = document.createElement('a');
    link.href = base64String;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEndSemClick = (courseTitle, fileData = null, fileName = null) => {
    if (!hasPremiumAccess) {
      setPendingDownload({ courseTitle, fileData, fileName });
      setIsSubModalOpen(true);
    } else {
      if (fileData && fileName) {
        downloadBase64File(fileData, fileName);
      } else {
        alert(`Downloading End-Sem official prep materials & answer keys for: ${courseTitle}`);
      }
    }
  };

  const handleSubscribeSuccess = (paymentDetails) => {
    if (activateEndSemSubscription) {
      activateEndSemSubscription(paymentDetails);
    }
    setIsSubModalOpen(false);
    alert(`🎉 Payment Verified via Razorpay! End-Sem VIP Pass Activated (Payment ID: ${paymentDetails.paymentId}). Access unlocked!`);

    if (pendingDownload?.resource) {
      openProtectedResource(pendingDownload.resource);
      setPendingDownload(null);
    } else if (pendingDownload) {
      if (pendingDownload.fileData && pendingDownload.fileName) {
        downloadBase64File(pendingDownload.fileData, pendingDownload.fileName);
      } else {
        alert(`Downloading End-Sem official prep materials & answer keys for: ${pendingDownload.courseTitle}`);
      }
      setPendingDownload(null);
    }
  };

  const currentSemData = SYLLABUS.find(sem => sem.semester === selectedSem) || SYLLABUS[0];

  return (
    <div className="page-stack syllabus-page animate-fade-in">
      
      {/* ── End-Sem VIP Pass Banner ─────────────────────────────────── */}
      <div className={`p-4 rounded-2xl glass-card border flex items-center justify-between flex-wrap gap-4 transition-all ${
        hasPremiumAccess 
          ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent' 
          : 'border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
            hasPremiumAccess ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
          }`}>
            {hasPremiumAccess ? <CheckCircle2 size={22} /> : <Lock size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {hasPremiumAccess ? (isAdmin ? 'Admin Access Active 🛡️' : 'End-Sem VIP Pass Active 🌟') : 'End-Sem Files Locked 🔒'}
              </h3>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                hasEndSemSubscription ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}>
                {hasPremiumAccess ? (isAdmin ? 'ADMIN OVERRIDE' : 'UNLOCKED VIA RAZORPAY') : 'RAZORPAY PASS'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasPremiumAccess 
                ? (isAdmin ? 'Administrator access is active, so all End-Sem materials are available without a subscription.' : 'Full 8-Semester End-Sem question papers, answer keys, and model notes unlocked.') 
                : 'Mid-Sem materials are FREE. End-Sem papers require a one-time Razorpay subscription.'
              }
            </p>
          </div>
        </div>

        {!hasPremiumAccess && !hasEndSemSubscription && (
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Unlock End-Sem Files (₹99)</span>
          </button>
        )}
      </div>

      {/* Semester selectors */}
      <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-4 border border-slate-200 dark:border-indigo-950/20">
        <div className="flex items-center gap-2 flex-wrap">
          <Library size={16} className="text-indigo-500 mr-1" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-1">Select Semester:</span>
          <div className="flex gap-1.5 flex-wrap">
            {SYLLABUS.map(sem => (
              <button
                key={sem.semester}
                onClick={() => setSelectedSem(sem.semester)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSem === sem.semester 
                    ? 'sem-btn-active' 
                    : 'sem-btn-inactive hover:border-indigo-500/20 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Sem {sem.semester}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-500 font-bold font-mono">
          Total Semester Credits: {currentSemData.totalCredits} cr
        </span>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentSemData.courses.map(course => {
          const customResources = [
            ...remoteResources.filter(r => r.courseCode === course.code && r.status === 'READY'),
            ...uploadedPyqs.filter(r => r.courseCode === course.code && !r.objectKey)
          ];
          const youtubeLinks = customResources.filter(r => r.type === 'YouTube Link');
          const dynamicYtQuery = `https://www.youtube.com/results?search_query=${encodeURIComponent(course.title + ' B.Tech CS IT One Shot Lecture')}`;

          return (
            <div 
              key={course.code} 
              className="glass-card p-5 border border-slate-200 dark:border-indigo-950/20 flex flex-col justify-between hover:border-indigo-500/30 dark:hover:border-indigo-500/40 hover:scale-[1.01] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{course.code}</span>
                  <span className="badge bg-indigo-50/50 text-indigo-500 dark:text-indigo-400 border border-indigo-500/10 text-[9px]">
                    {course.type}
                  </span>
                </div>
                <h4 className="font-bold text-base leading-snug text-slate-800 dark:text-slate-200">{course.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Course weighting: <strong className="text-slate-700 dark:text-slate-400">{course.credits} credits</strong></p>
              </div>

              {/* Resources Panel */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-indigo-950/15 space-y-4">
                
                {/* One shot lecture widget */}
                <div className="bg-slate-50 dark:bg-surface-700/20 p-3 rounded-xl border border-slate-150 dark:border-indigo-950/10 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tutorial Lectures</span>
                    <a 
                      href={dynamicYtQuery}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <Youtube size={12} />
                      <span>YouTube One-Shot</span>
                    </a>
                  </div>

                  {/* Recommended YouTube links */}
                  {youtubeLinks.length > 0 && (
                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-indigo-950/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">Recommended Videos</p>
                      {youtubeLinks.map(vid => (
                        <a 
                          key={vid.id}
                          href={vid.fileData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-white dark:bg-surface-800 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 p-2 rounded-lg border border-slate-100 dark:border-indigo-950/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-[11px] font-semibold"
                        >
                          <span className="truncate mr-2 flex items-center gap-1">
                            <ExternalLink size={10} className="shrink-0" />
                            {vid.title}
                          </span>
                          <span className="text-[9px] bg-rose-100 dark:bg-rose-950/20 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-400 font-bold shrink-0">Watch</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exam Prep Materials */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Syllabus prep:</span>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button 
                      onClick={() => openExamPicker(course, 'MID_SEM')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-surface-700 dark:text-slate-300 dark:hover:bg-surface-600 text-slate-700 rounded-lg border border-slate-200/50 dark:border-surface-600/10 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Mid-Sem PYQ</span>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-1 rounded font-bold">FREE</span>
                    </button>

                    {/* End-Sem File Button (Protected by Razorpay Subscription) */}
                    <button
                      onClick={() => openExamPicker(course, 'END_SEM')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        hasPremiumAccess
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/25'
                          : 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:scale-105'
                      }`}
                    >
                      {hasPremiumAccess ? <Download size={11} /> : <Lock size={11} className="text-amber-500" />}
                      <span>End-Sem PYQ</span>
                      {!hasPremiumAccess && (
                        <span className="text-[8px] bg-amber-500 text-white px-1 rounded font-black">VIP</span>
                      )}
                    </button>

                    <button
                      onClick={() => openExamPicker(course, 'SYLLABUS')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={11} />
                      <span>Syllabus</span>
                    </button>

                    <button
                      onClick={() => openExamPicker(course, 'NOTES')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={11} />
                      <span>Notes</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Modal Triggered via Razorpay */}
      <EndSemSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSubscribeSuccess={handleSubscribeSuccess}
        studentId={studentId}
      />

      {examPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-surface-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">{examPicker.examType === 'SYLLABUS' ? 'Choose syllabus file' : 'Choose exam year'}</p><h3 className="text-lg font-bold text-slate-800 dark:text-white">{examPicker.course.title}</h3></div>
              <button onClick={() => setExamPicker(null)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {examPicker.choices.map(resource => (
                <button key={resource.id} onClick={() => chooseExamFile(resource)} className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 p-4 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                  <span className="block text-xl font-black text-indigo-600 dark:text-indigo-300">{examPicker.examType === 'SYLLABUS' ? 'Syllabus' : (resourceYear(resource) || 'Year N/A')}</span>
                  <span className="block mt-1 text-[11px] text-slate-500 truncate">{resource.originalFilename || resource.title}</span>
                  <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-indigo-600"><Eye size={12} /> Open PDF</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewer && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 p-2 sm:p-6 flex flex-col">
          {viewer.loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-white">
              <div className="brand-loader" aria-label="Loading document" role="status">
                <BrandLogo className="brand-loader-logo brand-loader-logo-base" />
                <span className="brand-loader-fill"><BrandLogo className="brand-loader-logo" /></span>
              </div>
              <div className="text-center">
                <p className="font-semibold">Opening document</p>
                <p className="mt-1 text-xs text-slate-400">Preparing {viewer.title}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-white mb-2">
                <h3 className="font-bold truncate">{viewer.title}</h3>
                <button
                  onClick={() => { URL.revokeObjectURL(viewer.url); setViewer(null); }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Close document viewer"
                >
                  <X size={20} />
                </button>
              </div>
              <iframe title={viewer.title} src={viewer.url} className="flex-1 w-full rounded-xl bg-white" />
            </>
          )}
        </div>,
        document.body
      )}

    </div>
  );
}
