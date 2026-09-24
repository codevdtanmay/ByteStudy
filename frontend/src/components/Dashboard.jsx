import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { ArrowUpRight, Award, BookOpen, FileText, Sliders, Target, TrendingUp } from 'lucide-react';
import { TOTAL_PROGRAM_CREDITS, SYLLABUS } from '../data/syllabus';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="eyebrow">{label}</p>
      {payload.map((entry) => entry.value === null ? null : (
        <div key={entry.dataKey} className="mt-2 flex items-center justify-between gap-5 text-xs">
          <span className="text-stone-500">{entry.name}</span>
          <strong className="font-mono text-stone-800 dark:text-stone-100">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, note, icon: Icon, onClick, accent = false }) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component type={onClick ? 'button' : undefined} onClick={onClick} className={`academic-metric ${onClick ? 'cursor-pointer hover:bg-[#f4eee9] dark:hover:bg-[#34302b]' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">{label}</span>
        <Icon size={16} className={accent ? 'text-[#a65337] dark:text-[#d99579]' : 'text-stone-400'} />
      </div>
      <p className={`mt-3 text-[26px] font-semibold tracking-[-0.04em] ${accent ? 'text-[#a65337] dark:text-[#d99579]' : 'text-stone-900 dark:text-stone-100'}`}>{value}</p>
      <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{note}</p>
    </Component>
  );
}

export default function Dashboard({
  chartData,
  currentCgpa,
  targetCgpa,
  earnedCredits,
  remainingCredits,
  calculatedAttendancePercent,
  setActiveTab
}) {
  const creditsPct = Math.min((earnedCredits / TOTAL_PROGRAM_CREDITS) * 100, 100);
  const hasData = chartData.some((entry) => entry.sgpa !== null);

  const academicActions = [
    { label: 'Update semester record', description: 'Record SGPA and attendance', tab: 'semesters', icon: BookOpen },
    { label: 'Estimate target CGPA', description: 'Plan the SGPA you need next', tab: 'predictor', icon: Target },
    { label: 'Review syllabus', description: 'Browse courses and PYQs', tab: 'pyqs', icon: FileText },
    { label: 'Simulate final SGPA', description: 'Project grades for current courses', tab: 'gradesim', icon: Sliders }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-7 dark:border-stone-700 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow text-[#a65337] dark:text-[#d99579]">Academic record / 2026</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight tracking-[-0.04em] text-stone-900 dark:text-stone-100 sm:text-4xl">Stay close to the numbers that shape your degree.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 dark:text-stone-400">Track your semester standing, understand your remaining credits, and make the next academic decision with confidence.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="primary-button" onClick={() => setActiveTab('semesters')}>Update record <ArrowUpRight size={14} /></button>
          <button type="button" className="secondary-button" onClick={() => setActiveTab('predictor')}>Plan target</button>
        </div>
      </section>

      <section className="grid grid-cols-2 border-y border-stone-200 dark:border-stone-700 sm:grid-cols-4">
        <Metric label="Current CGPA" value={currentCgpa || '—'} note={`Across ${earnedCredits} completed credits`} icon={Award} onClick={() => setActiveTab('semesters')} accent />
        <Metric label="Target CGPA" value={targetCgpa || '8.50'} note="Your current academic aim" icon={Target} onClick={() => setActiveTab('predictor')} />
        <Metric label="Credits earned" value={`${earnedCredits} / ${TOTAL_PROGRAM_CREDITS}`} note={`${remainingCredits} credits remaining`} icon={BookOpen} onClick={() => setActiveTab('semesters')} />
        <Metric label="Attendance" value={calculatedAttendancePercent !== 'N/A' ? `${calculatedAttendancePercent}%` : '—'} note="Recommended minimum: 75%" icon={TrendingUp} onClick={() => setActiveTab('semesters')} />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <div className="editorial-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-700">
            <div>
              <p className="eyebrow">Performance history</p>
              <h3 className="mt-2 font-serif text-2xl tracking-[-0.03em] text-stone-900 dark:text-stone-100">SGPA and CGPA trajectory</h3>
            </div>
            <div className="flex gap-4 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5"><i className="legend-dot bg-[#a65337]" /> SGPA</span>
              <span className="flex items-center gap-1.5"><i className="legend-dot bg-[#2f5d50]" /> CGPA</span>
              <span className="flex items-center gap-1.5"><i className="legend-line bg-stone-400" /> Target</span>
            </div>
          </div>
          {!hasData ? (
            <div className="flex min-h-[290px] flex-col items-center justify-center border-b border-dashed border-stone-300 px-6 text-center dark:border-stone-600">
              <p className="eyebrow">No record yet</p>
              <h4 className="mt-3 font-serif text-xl text-stone-800 dark:text-stone-100">Begin with your first semester</h4>
              <p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">Add your semester SGPA and attendance to make this academic history meaningful.</p>
              <button type="button" onClick={() => setActiveTab('semesters')} className="mt-5 text-xs font-semibold text-[#a65337] hover:underline dark:text-[#d99579]">Add semester grades <ArrowUpRight size={13} className="inline" /></button>
            </div>
          ) : (
            <div className="h-[290px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="academicArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a65337" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#a65337" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 5" stroke="#deddd6" />
                  <XAxis dataKey="name" tick={{ fill: '#85867f', fontSize: 11 }} axisLine={{ stroke: '#deddd6' }} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: '#85867f', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {targetCgpa && <ReferenceLine y={parseFloat(targetCgpa)} stroke="#a9aaa2" strokeDasharray="4 4" strokeWidth={1} />}
                  <Area name="SGPA" type="monotone" dataKey="sgpa" stroke="#a65337" strokeWidth={2} fill="url(#academicArea)" fillOpacity={1} />
                  <Line name="CGPA" type="monotone" dataKey="cgpa" stroke="#2f5d50" strokeWidth={2.5} dot={{ fill: '#2f5d50', r: 3 }} activeDot={{ r: 5, fill: '#2f5d50' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <aside className="editorial-panel p-5 sm:p-7">
          <p className="eyebrow">Degree progress</p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <span className="font-serif text-5xl tracking-[-0.06em] text-stone-900 dark:text-stone-100">{creditsPct.toFixed(0)}<small className="ml-1 text-2xl">%</small></span>
            <span className="pb-1 text-right text-[11px] leading-4 text-stone-500">of the<br />curriculum</span>
          </div>
          <div className="mt-5 h-2 bg-stone-200 dark:bg-stone-700"><div className="h-full bg-[#a65337] dark:bg-[#d99579]" style={{ width: `${creditsPct}%` }} /></div>
          <div className="mt-2 flex justify-between text-[11px] text-stone-500 dark:text-stone-400"><span>{earnedCredits} completed</span><span>{remainingCredits} remaining</span></div>

          <div className="mt-8 border-t border-stone-200 pt-5 dark:border-stone-700">
            <p className="eyebrow">Semester map</p>
            <div className="mt-4 space-y-2">
              {SYLLABUS.map((semester) => {
                const cumulative = SYLLABUS.slice(0, semester.semester).reduce((sum, item) => sum + item.totalCredits, 0);
                const complete = earnedCredits >= cumulative;
                return <div key={semester.semester} className="flex items-center gap-3 text-xs"><span className={`semester-marker ${complete ? 'semester-marker-complete' : ''}`}>{semester.semester}</span><span className="text-stone-600 dark:text-stone-300">Semester {semester.semester}</span><span className="ml-auto font-mono text-[10px] text-stone-400">{semester.totalCredits} cr</span></div>;
              })}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Next actions</p><h3 className="mt-2 font-serif text-2xl text-stone-900 dark:text-stone-100">Keep your record current</h3></div></div>
          <div className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-stone-700 dark:border-stone-700">
            {academicActions.map(({ label, description, tab, icon: Icon }) => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-[#f4eee9] dark:hover:bg-[#34302b]"><span className="flex h-9 w-9 items-center justify-center border border-stone-300 text-[#a65337] dark:border-stone-600 dark:text-[#d99579]"><Icon size={16} /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</strong><small className="mt-1 block text-xs text-stone-500">{description}</small></span><ArrowUpRight size={15} className="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#a65337]" /></button>)}
          </div>
        </div>

        <div className="editorial-panel p-5 sm:p-7">
          <h3 className="mt-2 font-serif text-2xl text-stone-900 dark:text-stone-100">Grade value scale</h3>
          <p className="mt-3 text-xs leading-5 text-stone-500">Your SGPA and CGPA use the standard 10-point credit-weighted scale.</p>
          <div className="mt-6 grid grid-cols-4 gap-px border border-stone-200 bg-stone-200 dark:border-stone-700 dark:bg-stone-700 sm:grid-cols-8">
            {[['O', '10'], ['A+', '9'], ['A', '8'], ['B+', '7'], ['B', '6'], ['C', '5'], ['P', '4'], ['F', '0']].map(([grade, point]) => <div key={grade} className="bg-[#fffefa] p-2.5 text-center dark:bg-[#292d28]"><div className="text-sm font-semibold text-stone-800 dark:text-stone-100">{grade}</div><div className="mt-1 font-mono text-[10px] text-stone-500">{point} pts</div></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
