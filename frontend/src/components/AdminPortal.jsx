import React, { useState, useEffect } from 'react';
import { SYLLABUS } from '../data/syllabus';
import { Shield, Plus, Trash2, Video, File, Check } from 'lucide-react';
import { isAdminAccount } from '../services/authApi';
import { deleteStudyResource, getStudyResources, uploadStudyFile } from '../services/resourceApi';

export default function AdminPortal({ uploadedPyqs, setUploadedPyqs, studentId, userRole }) {
  const isAdmin = isAdminAccount({ role: userRole });

  // Form states
  const [adminSem, setAdminSem] = useState(1);
  const [adminCourseCode, setAdminCourseCode] = useState('');
  const [adminResName, setAdminResName] = useState('');
  const [adminResType, setAdminResType] = useState('Mid-Sem PYQ');
  const [adminExamYear, setAdminExamYear] = useState(new Date().getFullYear());
  const [adminFileData, setAdminFileData] = useState(null);
  const [adminFileName, setAdminFileName] = useState('');
  const [adminYoutubeUrl, setAdminYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    getStudyResources()
      .then(remoteResources => {
        setUploadedPyqs(previous => {
          const byId = new Map(previous.map(item => [String(item.id), item]));
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
  }, [isAdmin, setUploadedPyqs]);

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
          The Admin Portal is locked. Sign in with the dedicated administrator credentials to publish mock exams and video recommendations.
        </p>
      </div>
    );
  }

  // Keep the File object in memory; upload it directly to private R2 storage.
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

  // Submit resource upload
  const handleSubmit = async (e) => {
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
    } catch (error) {
      alert(error.message || 'Resource upload failed.');
      return;
    } finally {
      setIsUploading(false);
    }

    // Reset Form
    setAdminResName('');
    setAdminFileData(null);
    setAdminFileName('');
    setAdminYoutubeUrl('');
    e.target.reset();
    alert("Resource published successfully!");
  };

  // Delete resource
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteStudyResource(id);
        setUploadedPyqs(prev => prev.filter(item => String(item.id) !== String(id)));
        alert('Resource deleted successfully.');
      } catch (error) {
        alert(error.message || 'The resource could not be deleted.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Admin Upload Control Console</h2>
            <p className="text-xs text-slate-500">Publish resources and recommended study videos to specific semester syllabus items</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Semester selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">Exam Year</label>
                <input type="number" min="2000" max="2100" value={adminExamYear} onChange={e => setAdminExamYear(e.target.value)} className="app-input shadow-sm text-sm" required />
              </div>
            )}

            {/* Course Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1.5">
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
      <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20">
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
                        onClick={() => handleDelete(item.id)}
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
  );
}
