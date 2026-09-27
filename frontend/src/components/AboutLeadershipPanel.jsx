import React from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  GraduationCap,
  Code2,
  Workflow,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Heart,
  MessageSquare,
  Compass
} from 'lucide-react';

export default function AboutLeadershipPanel({ onOpenFeedback }) {
  const founders = [
    {
      name: 'ANUJ',
      role: 'Founder & Lead System Architect',
      specialty: 'Platform Engineering, Cloud Infrastructure & AI Systems',
      avatarInitial: 'A',
      image: 'https://ibb.co/rGdCzgYk',
      bio: 'Spearheaded the engineering and architectural foundation of ByteCollege. Passionate about distributed systems, resilient web software, and crafting high-yield digital tools for university scholars.',
      tags: ['System Architecture', 'Spring Boot 3', 'PostgreSQL', 'AI RAG Engine', 'Security'],
      quote: 'ByteCollege was born to solve real student problems—fragmented notes, missing past papers, and attendance uncertainty. We engineered an all-in-one operating system for engineering scholars.',
      email: 'anjalimaurya028@gmail.com'
    },
    {
      name: 'TANMAY',
      role: 'Co-Founder & Head of Operations',
      specialty: 'Platform Orchestration, Resource Verification & Outreach',
      avatarInitial: 'T',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Orchestrates academic resource management, past question paper curation, and student community engagement across branches. Ensures every file and syllabus outline adheres strictly to university standards.',
      tags: ['University Relations', 'PYQ Verification', 'Operations', 'Academic Coordination'],
      quote: 'Every semester question paper and syllabus module on ByteCollege is meticulously cross-checked with departmental syllabi to ensure students never study outdated material.',
      email: 'myselftanmay8@gmail.com'
    }
  ];

  const pillars = [
    {
      title: 'Institutional Alignment',
      desc: 'Formulated specifically around the curriculum of School of Engineering & Technology (SOET), HNB Garhwal Central University.',
      icon: GraduationCap
    },
    {
      title: 'Zero-Distraction Policy',
      desc: '100% ad-free, pure dark & light monochrome interfaces focused solely on student productivity and study efficiency.',
      icon: ShieldCheck
    },
    {
      title: 'Verified Academic Data',
      desc: 'Hand-curated previous year examination papers, model question sets, and course objectives audited by department toppers.',
      icon: BookOpen
    },
    {
      title: 'Intelligent Advisory',
      desc: 'AI-assisted academic advisor grounded in university credit guidelines, attendance thresholds, and syllabus prerequisites.',
      icon: Sparkles
    }
  ];

  const administrativeInfo = [
    { label: 'Parent University', value: 'Hemvati Nandan Bahuguna Garhwal Central University (HNBGU)' },
    { label: 'Campus', value: 'Chauras Campus, Srinagar Garhwal, Uttarakhand — 249161' },
    { label: 'Department Coverage', value: 'School of Engineering & Technology (CSE, IT, ECE, EE, ME)' },
    { label: 'Academic Regulations', value: 'Choice Based Credit System (CBCS) & NEP Framework' },
    { label: 'Student Support Desk', value: '24/7 Digital Grievance & Resource Request Portal' },
    { label: 'Platform Release', value: 'ByteCollege Enterprise v2.1 (Production)' }
  ];

  return (
    <div className="page-stack animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-neutral-800 bg-[#fbfaf7] dark:bg-black p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-stone-200/80 dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 mb-4">
            <Building2 size={13} />
            Institutional Overview & Founders
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
            About ByteCollege & Leadership
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-neutral-400 leading-relaxed">
            ByteCollege is an autonomous academic companion built to empower B.Tech students at Hemvati Nandan Bahuguna Garhwal Central University. From syllabus tracking and verified PYQs to intelligent GATE prep and attendance monitoring, we bridge the gap between classroom teaching and semester excellence.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-stone-800 dark:text-neutral-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              500+ Active Students
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-stone-800 dark:text-neutral-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              8 Semesters Covered
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-stone-800 dark:text-neutral-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              100% Free Verified Repository
            </div>
          </div>
        </div>
      </section>

      {/* Founders & Executive Team */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-neutral-800 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <Users size={20} />
              Founders & Executive Team
            </h2>
            <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
              The visionaries behind the architecture, continuous operations, and university outreach.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-6 shadow-sm flex flex-col justify-between hover:border-stone-400 dark:hover:border-neutral-600 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xl shadow-md">
                      {founder.avatarInitial}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white leading-snug">
                        {founder.name}
                      </h3>
                      <p className="text-xs font-semibold text-stone-500 dark:text-neutral-400">
                        {founder.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-100 dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 border border-stone-200 dark:border-neutral-800">
                    CORE FOUNDER
                  </span>
                </div>

                <p className="mt-4 text-xs font-medium text-stone-600 dark:text-neutral-400 leading-relaxed">
                  {founder.bio}
                </p>

                <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-100 dark:border-neutral-800/80">
                  <p className="text-xs italic text-stone-700 dark:text-neutral-300 leading-normal">
                    "{founder.quote}"
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {founder.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border border-stone-200 dark:border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {founder.email}
                </span>
                <span className="font-semibold text-stone-800 dark:text-neutral-300">
                  HNBGU Student
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars of ByteCollege */}
      <section className="space-y-4">
        <div className="border-b border-stone-200 dark:border-neutral-800 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <Workflow size={20} />
            Platform Mission & Core Principles
          </h2>
          <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
            Designed to uphold transparency, academic rigor, and immediate access to study essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-5 shadow-sm hover:border-stone-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex items-center justify-center text-stone-800 dark:text-white mb-3">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    {pillar.title}
                  </h4>
                  <p className="mt-2 text-xs text-stone-500 dark:text-neutral-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* University Administration & Coordination Desk */}
      <section className="rounded-3xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 dark:border-neutral-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 mb-2 border border-stone-200 dark:border-neutral-800">
              <MapPin size={11} />
              University Coordination Office
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">
              Academic Administration & Official Guidelines
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-neutral-400 max-w-2xl">
              ByteCollege coordinates with student representatives and faculty advisors to reflect official syllabus revisions, examination schedules, and course objectives.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-sm"
          >
            <MessageSquare size={14} />
            Contact Administration & Support
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {administrativeInfo.map((info) => (
            <div key={info.label} className="p-4 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-100 dark:border-neutral-800/80">
              <span className="block text-[11px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">
                {info.label}
              </span>
              <span className="block mt-1 text-xs font-bold text-stone-800 dark:text-neutral-200">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Tribute */}
      <footer className="text-center py-4">
        <p className="text-xs font-medium text-stone-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
          Conceived, Engineered & Maintained with <Heart size={13} className="text-rose-500 fill-rose-500" /> by
          <strong className="text-stone-800 dark:text-white">Anuj</strong> &
          <strong className="text-stone-800 dark:text-white">Tanmay</strong> for HNBGU Student .
        </p>
      </footer>
    </div>
  );
}
