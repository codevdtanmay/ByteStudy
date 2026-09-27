import React, { useState } from 'react';

const AI_TOOLS_DATA = [
  // Document & PDF AI
  {
    id: 'chatpdf',
    name: 'ChatPDF',
    category: 'DOCS',
    badge: 'Freemium',
    description: 'Upload textbooks, research papers, or syllabus PDFs and ask questions in natural language. Summarizes long chapters instantly.',
    bestFor: 'Question answering from PDFs, textbook summaries & exam revision',
    url: 'https://www.chatpdf.com/',
    icon: '📄',
    popular: true,
  },
  {
    id: 'humata',
    name: 'Humata AI',
    category: 'DOCS',
    badge: 'Free Tier',
    description: 'Ask questions across complex academic reports and dense scientific papers with page citations.',
    bestFor: 'Academic papers, research dissertations & citations',
    url: 'https://www.humata.ai/',
    icon: '📑',
    popular: false,
  },
  {
    id: 'ilovepdf',
    name: 'iLovePDF & PDFgear',
    category: 'DOCS',
    badge: '100% Free',
    description: 'Compress, merge, split, OCR scan and convert PDF to Word/PPT. Essential for university assignments and submissions.',
    bestFor: 'PDF compression, assignment formatting & OCR conversion',
    url: 'https://www.ilovepdf.com/',
    icon: '🗂️',
    popular: true,
  },

  // Study & Research AI
  {
    id: 'consensus',
    name: 'Consensus AI',
    category: 'RESEARCH',
    badge: 'Free Tier',
    description: 'Search engine powered by AI that extracts scientific evidence directly from 200M+ peer-reviewed papers.',
    bestFor: 'Writing literature reviews, project citations & verified facts',
    url: 'https://consensus.app/',
    icon: '🔬',
    popular: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'RESEARCH',
    badge: 'Free & Pro',
    description: 'An AI search engine that gives conversational answers with direct clickable web citations for every paragraph.',
    bestFor: 'Replacing regular Google search with direct cited summaries',
    url: 'https://www.perplexity.ai/',
    icon: '🌐',
    popular: true,
  },
  {
    id: 'elicit',
    name: 'Elicit AI',
    category: 'RESEARCH',
    badge: 'Free Tier',
    description: 'Automates research workflows: finds relevant research papers without perfect keywords, summarizes key claims and methods.',
    bestFor: 'B.Tech final year thesis & seminar research preparation',
    url: 'https://elicit.com/',
    icon: '📚',
    popular: false,
  },

  // Coding & Tech AI
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'CODING',
    badge: 'Free Tier',
    description: 'OpenAI’s conversational AI. Explains tricky code concepts, debugs compiler errors, writes boilerplate code, and explains algorithms step-by-step.',
    bestFor: 'Concept explanation, debugging code & DSA practice',
    url: 'https://chatgpt.com/',
    icon: '⚡',
    popular: true,
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    category: 'CODING',
    badge: 'Free Tier',
    description: 'Anthropic’s leading model. World-class in reading large codebases, writing bug-free logic, and generating clean UI components.',
    bestFor: 'Complex code logic, college web dev projects & essay drafting',
    url: 'https://claude.ai/',
    icon: '🧠',
    popular: true,
  },
  {
    id: 'phind',
    name: 'Phind Developer Search',
    category: 'CODING',
    badge: 'Free',
    description: 'Search engine customized specifically for developers. Reads official documentation, StackOverflow, and outputs working code solutions.',
    bestFor: 'Fixing runtime bugs, understanding library docs & API usage',
    url: 'https://www.phind.com/',
    icon: '💻',
    popular: false,
  },

  // Presentations & Visuals
  {
    id: 'gamma',
    name: 'Gamma App',
    category: 'SLIDES',
    badge: 'Free Credits',
    description: 'Generates complete presentations, webpages, and document decks from a single prompt in 30 seconds with polished themes.',
    bestFor: 'College seminar presentations, project pitch decks & report summaries',
    url: 'https://gamma.app/',
    icon: '📊',
    popular: true,
  },
  {
    id: 'napkin',
    name: 'Napkin AI',
    category: 'SLIDES',
    badge: 'Free Beta',
    description: 'Paste text or notes, and it instantly converts paragraphs into crisp visual diagrams, flowcharts, and infographics.',
    bestFor: 'Flowcharts, architecture diagrams & visual study notes',
    url: 'https://www.napkin.ai/',
    icon: '🎨',
    popular: true,
  },

  // Math, Notes & Productivity
  {
    id: 'wolfram',
    name: 'Wolfram Alpha',
    category: 'MATH',
    badge: 'Free Basic',
    description: 'Computational intelligence engine for calculus, differential equations, linear algebra, discrete math, and graph theory.',
    bestFor: 'Engineering Mathematics (M1, M2, M3, Discrete Maths)',
    url: 'https://www.wolframalpha.com/',
    icon: '📐',
    popular: true,
  },
  {
    id: 'symbolab',
    name: 'Symbolab',
    category: 'MATH',
    badge: 'Free Steps',
    description: 'Step-by-step math solver for integrals, derivatives, matrix multiplication, Fourier series, and Laplace transforms.',
    bestFor: 'Step-by-step calculus & engineering mathematics verification',
    url: 'https://www.symbolab.com/',
    icon: '✏️',
    popular: false,
  },
  {
    id: 'notionai',
    name: 'Notion AI & Notes',
    category: 'MATH',
    badge: 'Free Student',
    description: 'All-in-one workspace with AI summary capabilities to organize class notes, deadlines, semester timetable, and project trackers.',
    bestFor: 'Semester note taking, exam planners & study checklists',
    url: 'https://www.notion.so/',
    icon: '📝',
    popular: true,
  },
];

const CATEGORIES = [
  { id: 'ALL', label: 'All AI Tools', icon: '✨' },
  { id: 'DOCS', label: 'PDF & Documents', icon: '📄' },
  { id: 'CODING', label: 'Coding & DSA', icon: '💻' },
  { id: 'RESEARCH', label: 'Research & Search', icon: '🔬' },
  { id: 'SLIDES', label: 'Presentations & Slides', icon: '📊' },
  { id: 'MATH', label: 'Math & Productivity', icon: '📐' },
];

export default function UsefulAiToolsPanel() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = AI_TOOLS_DATA.filter((tool) => {
    const matchCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.bestFor.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-600/15 via-zinc-500/10 to-stone-500/15 p-6 md:p-8 border border-stone-200 dark:border-neutral-800 dark:bg-black dark:bg-none shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-stone-500/10 rounded-full blur-3xl pointer-events-none dark:hidden" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-stone-500/10 rounded-full blur-3xl pointer-events-none dark:hidden" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-stone-200/60 dark:bg-white/10 text-stone-800 dark:text-white border border-stone-300 dark:border-white/20 mb-3">
              <span>🤖 Student Productivity Suite</span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 dark:bg-white animate-pulse" />
              <span>Curated Directory</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Essential AI Tools for Students 🚀
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Supercharge your daily college life: chat with heavy textbook PDFs, generate PowerPoint seminar presentations in seconds, solve complex Engineering Math step-by-step, and debug college projects effortlessly.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm backdrop-blur text-xs space-y-1.5 shrink-0">
            <span className="font-bold text-stone-900 dark:text-white block">💡 Daily Student Pro-Tip</span>
            <p className="text-slate-600 dark:text-neutral-400 max-w-xs leading-relaxed">
              Use <strong>ChatPDF</strong> with your unit notes, and use <strong>Gamma</strong> the night before your seminar presentation!
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-black backdrop-blur-md rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. PDF, slides, math, code)..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-black font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of AI Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="group relative bg-white dark:bg-black rounded-2xl border border-slate-200/90 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-stone-400 dark:hover:border-neutral-600 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Top Accent */}
            <div className="h-1 bg-gradient-to-r from-stone-400 via-zinc-400 to-stone-500 opacity-60 group-hover:opacity-100 dark:bg-white dark:bg-none transition-opacity" />

            <div className="p-5 md:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-neutral-900 border border-stone-200/60 dark:border-neutral-800 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">
                      {tool.badge}
                    </span>
                  </div>
                </div>

                {tool.popular && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:bg-neutral-900 dark:text-white border border-amber-500/20 dark:border-neutral-700 shrink-0">
                    🔥 Popular
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed min-h-[44px]">
                {tool.description}
              </p>

              {/* Best For Tag */}
              <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-stone-700 dark:text-neutral-400 uppercase tracking-wide block">
                  Best For:
                </span>
                <p className="text-xs font-medium text-slate-700 dark:text-neutral-200 mt-0.5">
                  {tool.bestFor}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-50/70 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">Verified for Student Use</span>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Launch Tool
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
