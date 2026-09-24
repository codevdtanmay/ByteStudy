import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Minus, Plus, Search } from 'lucide-react';
import { SYLLABUS } from '../data/syllabus';

function CourseBadge({ type }) { return <span className="course-type">{type}</span>; }

function AttendanceState({ percentage }) {
  if (percentage === null) return <span className="attendance-empty">No classes logged</span>;
  return <span className={percentage >= 75 ? 'attendance-state attendance-state-good' : 'attendance-state attendance-state-low'}>{percentage}%</span>;
}

function SemesterCard({ semInfo, sgpa, onUpdateSgpa, attendanceLogs, onLogAttendance, isExpanded, onToggle }) {
  const sgpaNum = parseFloat(sgpa);
  const hasSgpa = sgpa !== '' && sgpa !== undefined && !Number.isNaN(sgpaNum);
  const courseCodes = semInfo.courses.map(course => course.code);
  const semesterLogs = attendanceLogs.filter(log => courseCodes.includes(log.courseCode));
  const totalPresent = semesterLogs.filter(log => log.status === 'Present').length;
  const semesterPercentage = semesterLogs.length ? Math.round((totalPresent / semesterLogs.length) * 100) : null;
  const StatusIcon = hasSgpa ? CheckCircle2 : Circle;

  return (
    <section className={`semester-record ${isExpanded ? 'semester-record-open' : ''}`}>
      <button type="button" onClick={onToggle} className="semester-record-header">
        <span className={`semester-number ${hasSgpa ? 'semester-number-complete' : ''}`}><small>SEM</small>{semInfo.semester}</span>
        <span className="semester-record-main"><span className="semester-record-title">Semester {semInfo.semester}</span><span className="semester-record-meta"><span className={`semester-status ${hasSgpa ? 'semester-status-complete' : 'semester-status-open'}`}><StatusIcon size={13} /> {hasSgpa ? 'Completed' : 'Active / pending'}</span><span>{semInfo.totalCredits} credits</span><span>{semInfo.courses.length} courses</span></span></span>
        <span className="semester-record-stats"><span className="semester-stat"><small>Attendance</small><strong>{semesterPercentage === null ? '—' : `${semesterPercentage}%`}</strong></span><span className="semester-stat"><small>SGPA</small><strong>{hasSgpa ? sgpaNum.toFixed(2) : '—'}</strong></span><span className="semester-chevron">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span></span>
      </button>

      {isExpanded && <div className="semester-record-body">
        <div className="semester-outcome"><div><span className="eyebrow">Semester outcome</span><p>Save the SGPA once the semester is complete.</p></div><label className="semester-sgpa-field" htmlFor={`sgpa-input-${semInfo.semester}`}><span>SGPA</span><input id={`sgpa-input-${semInfo.semester}`} type="number" min="0" max="10" step="0.01" placeholder="e.g. 8.65" value={sgpa || ''} onChange={event => onUpdateSgpa(semInfo.semester, event.target.value)} /></label></div>
        <div className="attendance-table" role="table" aria-label={`Semester ${semInfo.semester} attendance`}>
          <div className="attendance-table-head" role="row"><span>Course</span><span>Type</span><span>Attendance</span><span>Log class</span></div>
          {semInfo.courses.map(course => {
            const logs = attendanceLogs.filter(log => log.courseCode === course.code);
            const present = logs.filter(log => log.status === 'Present').length;
            const total = logs.length;
            const percentage = total ? Number(((present / total) * 100).toFixed(1)) : null;
            const progress = percentage === null ? 0 : Math.min(percentage, 100);
            let tip = 'Start logging classes to track this subject.';
            if (percentage !== null && percentage < 75) tip = `Attend ${Math.ceil(3 * total - 4 * present)} more to reach 75%`;
            else if (percentage !== null) { const safeToSkip = Math.floor((4 * present - 3 * total) / 3); tip = safeToSkip > 0 ? `You can miss ${safeToSkip} class${safeToSkip === 1 ? '' : 'es'}` : 'Keep attending to stay above 75%'; }
            return <div className="attendance-row" role="row" key={course.code}>
              <div className="attendance-course" role="cell"><span className="course-code">{course.code}</span><strong className="course-title">{course.title}</strong><small>{course.credits} credit{course.credits === 1 ? '' : 's'}</small></div>
              <div role="cell"><CourseBadge type={course.type} /></div>
              <div className="attendance-cell" role="cell"><div className="attendance-value"><AttendanceState percentage={percentage} /><span>{total ? `${present}/${total} classes` : 'Awaiting first class'}</span></div><div className="attendance-progress"><span style={{ width: `${progress}%` }} /></div><small className="attendance-tip">{tip}</small></div>
              <div className="attendance-actions" role="cell"><button type="button" className="attendance-action attendance-action-present" onClick={() => onLogAttendance(course.code, 'Present')}><Plus size={16} /> Present</button><button type="button" className="attendance-action attendance-action-absent" onClick={() => onLogAttendance(course.code, 'Absent')}><Minus size={16} /> Absent</button></div>
            </div>;
          })}
        </div>
      </div>}
    </section>
  );
}

export default function SemestersPanel({ pastSgpas, updateSemesterSGPA, attendanceLogs, setAttendanceLogs }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSem, setExpandedSem] = useState(1);
  const totalClasses = attendanceLogs.length;
  const totalPresent = attendanceLogs.filter(log => log.status === 'Present').length;
  const overallAttendance = totalClasses ? Math.round((totalPresent / totalClasses) * 100) : null;
  const completedSemesters = Object.values(pastSgpas).filter(value => value !== '' && value !== undefined).length;

  const handleQuickLog = (courseCode, status) => {
    const semester = SYLLABUS.find(sem => sem.courses.some(course => course.code === courseCode))?.semester || 1;
    setAttendanceLogs(prev => [{ id: Date.now().toString() + Math.random().toString(36).slice(2, 7), date: new Date().toISOString().split('T')[0], semester, courseCode, status }, ...prev]);
  };

  const filteredSemesters = SYLLABUS.filter(sem => {
    const isDone = pastSgpas[sem.semester] !== '' && pastSgpas[sem.semester] !== undefined;
    const filterMatch = filter === 'all' || (filter === 'complete' ? isDone : !isDone);
    if (!filterMatch) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return sem.courses.some(course => course.title.toLowerCase().includes(term) || course.code.toLowerCase().includes(term));
  });

  return <div className="attendance-page animate-fade-in">
    <div className="attendance-intro"><div><span className="eyebrow">Academic record</span><h2>Attendance & semester records</h2><p>Keep your attendance honest and your academic progress easy to scan.</p></div><div className="attendance-summary-stats"><div><span>Overall attendance</span><strong>{overallAttendance === null ? '—' : `${overallAttendance}%`}</strong><small>{totalClasses ? `${totalPresent} present of ${totalClasses}` : 'No classes logged yet'}</small></div><div><span>Semesters complete</span><strong>{completedSemesters}<em> / {SYLLABUS.length}</em></strong><small>SGPA records saved</small></div><div><span>Active record</span><strong>Semester {expandedSem || '—'}</strong><small>Open a semester to update</small></div></div></div>
    <div className="record-toolbar"><div className="record-filters"><span className="toolbar-label">Show</span>{[['all', 'All semesters'], ['complete', 'Completed'], ['upcoming', 'Active / pending']].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`filter-button ${filter === value ? 'filter-button-active' : ''}`}>{label}</button>)}</div><label className="record-search"><Search size={15} /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search courses" /><span>{completedSemesters}/{SYLLABUS.length}</span></label></div>
    <div className="semester-record-list">{filteredSemesters.map(semInfo => <SemesterCard key={semInfo.semester} semInfo={semInfo} sgpa={pastSgpas[semInfo.semester]} onUpdateSgpa={updateSemesterSGPA} attendanceLogs={attendanceLogs} onLogAttendance={handleQuickLog} isExpanded={expandedSem === semInfo.semester} onToggle={() => setExpandedSem(expandedSem === semInfo.semester ? null : semInfo.semester)} />)}{!filteredSemesters.length && <div className="empty-record">No semesters or courses match your search.</div>}</div>
  </div>;
}
