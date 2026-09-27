import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, ExternalLink, Search, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, Award, Clock, FileText, ArrowUpRight, Filter
} from 'lucide-react';

const GATE_DATA = {
  cs: {
    name: 'Computer Science & Information Technology (CS/IT)',
    code: 'CS',
    description: 'Covers core software theory, hardware architecture, systems programming, and algorithmic mathematics.',
    weightageNotes: 'Engg Math (13-15 marks), General Aptitude (15 marks), Core CS (70-72 marks).',
    sections: [
      {
        category: 'Section 1: General Aptitude (15 Marks)',
        subjects: [
          {
            title: 'Verbal Aptitude',
            weight: '5-6 Marks',
            topics: ['English grammar, vocabulary, sentence completion, critical reasoning, narrative sequencing, analogies.'],
            studyLinks: [
              { label: 'NPTEL Verbal Practice', url: 'https://nptel.ac.in/courses/109104030' },
              { label: 'Gate Overflow Aptitude PYQs', url: 'https://gateoverflow.in/questions/general-aptitude' },
              { label: 'Practice on Google', url: 'https://www.google.com/search?q=GATE+Verbal+Aptitude+Practice+Questions+PDF' }
            ]
          },
          {
            title: 'Quantitative & Analytical Aptitude',
            weight: '9-10 Marks',
            topics: ['Data interpretation, 2D/3D geometry, ratios, percentages, permutations & combinations, series, spatial aptitude.'],
            studyLinks: [
              { label: 'GeeksforGeeks Aptitude Prep', url: 'https://www.geeksforgeeks.org/engineering-mathematics-tutorials/' },
              { label: 'Gate Overflow Quant Section', url: 'https://gateoverflow.in/questions/general-aptitude' },
              { label: 'Formulas & Shortcuts', url: 'https://www.google.com/search?q=GATE+Quantitative+Aptitude+Formulas+Cheat+Sheet' }
            ]
          }
        ]
      },
      {
        category: 'Section 2: Engineering Mathematics (13-15 Marks)',
        subjects: [
          {
            title: 'Discrete Mathematics',
            weight: '6-8 Marks',
            topics: ['Propositional & first-order logic, sets, relations, functions, partial orders, lattices, groups, combinatorics, graph theory (connectivity, coloring, matching).'],
            studyLinks: [
              { label: 'NPTEL Discrete Math', url: 'https://nptel.ac.in/courses/106106094' },
              { label: 'Gate Overflow Discrete Math', url: 'https://gateoverflow.in/questions/discrete-mathematics' },
              { label: 'Rosen Textbook Solutions', url: 'https://www.google.com/search?q=Discrete+Mathematics+Kenneth+Rosen+GATE+Notes+PDF' }
            ]
          },
          {
            title: 'Linear Algebra & Calculus',
            weight: '4-6 Marks',
            topics: ['Matrices, determinants, system of linear equations, eigenvalues & eigenvectors, LU decomposition, limits, continuity, differentiability, maxima & minima.'],
            studyLinks: [
              { label: 'Gilbert Strang MIT Lectures', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/' },
              { label: 'Gate Overflow Linear Algebra', url: 'https://gateoverflow.in/questions/linear-algebra' }
            ]
          },
          {
            title: 'Probability & Statistics',
            weight: '3-4 Marks',
            topics: ['Random variables, uniform, normal, exponential, Poisson, binomial distributions, mean, median, mode, standard deviation, conditional probability, Bayes theorem.'],
            studyLinks: [
              { label: 'Gate Overflow Probability', url: 'https://gateoverflow.in/questions/probability' },
              { label: 'GeeksforGeeks Probability Notes', url: 'https://www.geeksforgeeks.org/probability-gq/' }
            ]
          }
        ]
      },
      {
        category: 'Section 3: Core Computer Science (70-72 Marks)',
        subjects: [
          {
            title: 'Programming & Data Structures',
            weight: '8-10 Marks',
            topics: ['Programming in C, recursion, arrays, stacks, queues, linked lists, trees, binary search trees, binary heaps, graphs.'],
            studyLinks: [
              { label: 'GeeksforGeeks GATE DS', url: 'https://www.geeksforgeeks.org/data-structures/' },
              { label: 'Gate Overflow C & DS', url: 'https://gateoverflow.in/questions/programming-in-c' },
              { label: 'Abdul Bari DS Lectures', url: 'https://www.youtube.com/results?search_query=abdul+bari+data+structures' }
            ]
          },
          {
            title: 'Algorithms & Complexity',
            weight: '8-10 Marks',
            topics: ['Searching, sorting, hashing, asymptotic analysis, divide-and-conquer, greedy, dynamic programming, graph traversals, minimum spanning trees, shortest paths.'],
            studyLinks: [
              { label: 'CLRS Solutions & Summary', url: 'https://www.google.com/search?q=CLRS+Algorithms+GATE+Notes+PDF' },
              { label: 'Abdul Bari Algorithms Playlist', url: 'https://www.youtube.com/results?search_query=abdul+bari+algorithms' },
              { label: 'Gate Overflow Algorithms', url: 'https://gateoverflow.in/questions/algorithms' }
            ]
          },
          {
            title: 'Theory of Computation (TOC)',
            weight: '7-9 Marks',
            topics: ['Regular expressions, finite automata, context-free grammars, pushdown automata, pumping lemma, Turing machines, decidability, Halting problem.'],
            studyLinks: [
              { label: 'NPTEL Theory of Computation', url: 'https://nptel.ac.in/courses/106104028' },
              { label: 'Ravindrababu Ravula TOC', url: 'https://www.youtube.com/results?search_query=theory+of+computation+gate' },
              { label: 'Gate Overflow TOC', url: 'https://gateoverflow.in/questions/theory-of-computation' }
            ]
          },
          {
            title: 'Compiler Design',
            weight: '4-6 Marks',
            topics: ['Lexical analysis, parsing (LL, LR, LALR), syntax-directed translation, runtime environments, intermediate code generation, data flow analysis.'],
            studyLinks: [
              { label: 'Gate Overflow Compiler Design', url: 'https://gateoverflow.in/questions/compiler-design' },
              { label: 'NPTEL Compiler Lectures', url: 'https://nptel.ac.in/courses/106108052' }
            ]
          },
          {
            title: 'Operating Systems',
            weight: '7-9 Marks',
            topics: ['Processes, threads, CPU scheduling, synchronization, semaphores, deadlocks, virtual memory, paging, page replacement, file systems, disk scheduling.'],
            studyLinks: [
              { label: 'Galvin OS Summary Notes', url: 'https://www.google.com/search?q=Silberschatz+Galvin+OS+Notes+GATE' },
              { label: 'Gate Overflow Operating Systems', url: 'https://gateoverflow.in/questions/operating-system' },
              { label: 'NPTEL OS Course', url: 'https://nptel.ac.in/courses/106106144' }
            ]
          },
          {
            title: 'Databases (DBMS)',
            weight: '6-8 Marks',
            topics: ['ER-model, relational algebra, tuple calculus, SQL, normalization (1NF, 2NF, 3NF, BCNF), transactions, ACID, concurrency control, B/B+ trees.'],
            studyLinks: [
              { label: 'Navathe DBMS Notes', url: 'https://www.google.com/search?q=DBMS+Navathe+GATE+Revision+Notes' },
              { label: 'Gate Overflow Databases', url: 'https://gateoverflow.in/questions/databases' }
            ]
          },
          {
            title: 'Computer Networks',
            weight: '7-9 Marks',
            topics: ['OSI & TCP/IP stack, framing, error control, flow control, routing algorithms, IPv4/IPv6, CIDR, ARP, DHCP, TCP/UDP, sockets, congestion control, HTTP, DNS, SMTP.'],
            studyLinks: [
              { label: 'Kurose & Ross Networking Notes', url: 'https://www.google.com/search?q=Kurose+Ross+Computer+Networks+GATE+Notes' },
              { label: 'Gate Overflow Networks', url: 'https://gateoverflow.in/questions/computer-networks' }
            ]
          },
          {
            title: 'Digital Logic & Computer Organization',
            weight: '8-10 Marks',
            topics: ['Boolean algebra, combinational circuits, sequential circuits, machine instructions, addressing modes, ALU, pipelining, cache memory, cache mapping.'],
            studyLinks: [
              { label: 'Morris Mano Architecture', url: 'https://www.google.com/search?q=Morris+Mano+Computer+Architecture+GATE+Notes' },
              { label: 'Gate Overflow COA', url: 'https://gateoverflow.in/questions/computer-organization' }
            ]
          }
        ]
      }
    ]
  },
  ece: {
    name: 'Electronics & Communication Engineering (ECE)',
    code: 'EC',
    description: 'Covers semiconductor devices, circuits, signals & systems, communications, and electromagnetic fields.',
    weightageNotes: 'Engg Math (13-15 marks), General Aptitude (15 marks), Core ECE (70-72 marks).',
    sections: [
      {
        category: 'Core ECE Subjects',
        subjects: [
          {
            title: 'Signals & Systems and Networks',
            weight: '12-14 Marks',
            topics: ['Network solution methods, Laplace transform, continuous & discrete-time Fourier series/transforms, sampling theorem, Z-transform, LTI systems.'],
            studyLinks: [
              { label: 'NPTEL Signals and Systems', url: 'https://nptel.ac.in/courses/108104100' },
              { label: 'Gate Overflow EC PYQs', url: 'https://gateoverflow.in' }
            ]
          },
          {
            title: 'Electronic Devices (EDC) & Analog Circuits',
            weight: '14-16 Marks',
            topics: ['Carrier transport, P-N junction, Zener diode, BJT, MOSFET, small signal models, operational amplifiers, active filters, feedback amplifiers, oscillators.'],
            studyLinks: [
              { label: 'Sedra & Smith Microelectronics', url: 'https://www.google.com/search?q=Sedra+Smith+Analog+Electronics+GATE+Notes' },
              { label: 'NPTEL Semiconductor Devices', url: 'https://nptel.ac.in/courses/117106091' }
            ]
          },
          {
            title: 'Communications & Control Systems',
            weight: '16-18 Marks',
            topics: ['Analog communications (AM, FM), digital communications (PCM, DPCM, PSK, FSK, QAM), information theory, SNR, transfer functions, Routh-Hurwitz, Nyquist, Bode plots.'],
            studyLinks: [
              { label: 'B.P. Lathi Communication Systems', url: 'https://www.google.com/search?q=BP+Lathi+Communication+Systems+Notes' },
              { label: 'NPTEL Control Engineering', url: 'https://nptel.ac.in/courses/108101037' }
            ]
          },
          {
            title: 'Electromagnetics (EMFT)',
            weight: '8-10 Marks',
            topics: ['Maxwell equations, wave propagation in free space and dielectrics, transmission lines, Smith chart, waveguides, antenna basics.'],
            studyLinks: [
              { label: 'Sadiku Electromagnetics', url: 'https://www.google.com/search?q=Sadiku+Electromagnetics+GATE+Notes' }
            ]
          }
        ]
      }
    ]
  },
  ee: {
    name: 'Electrical Engineering (EE)',
    code: 'EE',
    description: 'Electric circuits, electrical machines, power systems, power electronics, and control systems.',
    weightageNotes: 'Engg Math (13-15 marks), Aptitude (15 marks), Core EE (70-72 marks).',
    sections: [
      {
        category: 'Core Electrical Engineering',
        subjects: [
          {
            title: 'Electrical Machines & Power Systems',
            weight: '18-20 Marks',
            topics: ['Single phase & three phase transformers, induction motors, DC machines, synchronous machines, transmission lines, load flow, fault analysis, power system protection.'],
            studyLinks: [
              { label: 'NPTEL Electrical Machines', url: 'https://nptel.ac.in/courses/108105017' },
              { label: 'Nagrath & Kothari Power Systems', url: 'https://www.google.com/search?q=Nagrath+Kothari+Power+Systems+GATE+Notes' }
            ]
          },
          {
            title: 'Power Electronics & Drives',
            weight: '10-12 Marks',
            topics: ['Thyristors, MOSFETs, IGBTs, buck/boost converters, single and three phase inverters, harmonics, DC/AC drives.'],
            studyLinks: [
              { label: 'P.S. Bimbhra Power Electronics', url: 'https://www.google.com/search?q=PS+Bimbhra+Power+Electronics+Notes' }
            ]
          },
          {
            title: 'Circuits, Signals & Measurements',
            weight: '14-16 Marks',
            topics: ['Network theorems, transient analysis, balanced 3-phase circuits, bridge measurements, digital multimeters, oscilloscope, transducers.'],
            studyLinks: [
              { label: 'NPTEL Circuit Analysis', url: 'https://nptel.ac.in/courses/108102042' }
            ]
          }
        ]
      }
    ]
  },
  me: {
    name: 'Mechanical Engineering (ME)',
    code: 'ME',
    description: 'Thermal engineering, fluid mechanics, machine design, manufacturing, and industrial engineering.',
    weightageNotes: 'Applied Mechanics (15%), Fluid & Thermal (34%), Materials & Manufacturing (35%), Math & Aptitude (28%).',
    sections: [
      {
        category: 'Core Mechanical Subjects',
        subjects: [
          {
            title: 'Thermodynamics & Heat Transfer',
            weight: '14-16 Marks',
            topics: ['Laws of thermodynamics, thermodynamic cycles (Otto, Diesel, Rankine, Brayton), conduction, convection, radiation, heat exchangers.'],
            studyLinks: [
              { label: 'P.K. Nag Thermodynamics', url: 'https://www.google.com/search?q=PK+Nag+Thermodynamics+GATE+Notes' },
              { label: 'NPTEL Heat Transfer', url: 'https://nptel.ac.in/courses/112101097' }
            ]
          },
          {
            title: 'Fluid Mechanics & Hydraulic Machines',
            weight: '8-10 Marks',
            topics: ['Fluid properties, manometry, buoyancy, Bernoulli equation, viscous flow through pipes, boundary layer theory, Pelton & Francis turbines.'],
            studyLinks: [
              { label: 'R.K. Bansal Fluid Mechanics', url: 'https://www.google.com/search?q=RK+Bansal+Fluid+Mechanics+Notes' }
            ]
          },
          {
            title: 'Strength of Materials & Machine Design',
            weight: '12-14 Marks',
            topics: ['Stress-strain, Mohr circle, bending and shear stress, deflection of beams, torsion, columns, theories of failure, fatigue strength, gears, bearings.'],
            studyLinks: [
              { label: 'Bhandari Machine Design Notes', url: 'https://www.google.com/search?q=Bhandari+Machine+Design+GATE+Notes' }
            ]
          },
          {
            title: 'Manufacturing & Industrial Engineering',
            weight: '14-16 Marks',
            topics: ['Casting, forming, welding, machining and machine tool operations, metrology, linear programming, inventory control, PERT/CPM.'],
            studyLinks: [
              { label: 'Kalpakjian Manufacturing Notes', url: 'https://www.google.com/search?q=Manufacturing+Engineering+Kalpakjian+GATE' }
            ]
          }
        ]
      }
    ]
  },
  ce: {
    name: 'Civil Engineering (CE)',
    code: 'CE',
    description: 'Structural engineering, geotechnical engineering, water resources, environmental, and transportation engineering.',
    weightageNotes: 'Geotechnical (15%), Environmental (12%), Structures (20%), Transportation (9%), Math & Aptitude (28%).',
    sections: [
      {
        category: 'Core Civil Subjects',
        subjects: [
          {
            title: 'Geotechnical Engineering (Soil Mechanics)',
            weight: '14-16 Marks',
            topics: ['Origin of soils, phase relationships, soil classification, permeability, effective stress, consolidation, shear strength, earth pressure, shallow & deep foundations.'],
            studyLinks: [
              { label: 'Gopal Ranjan Soil Mechanics', url: 'https://www.google.com/search?q=Gopal+Ranjan+Soil+Mechanics+GATE+Notes' }
            ]
          },
          {
            title: 'Environmental & Water Resources Engineering',
            weight: '12-14 Marks',
            topics: ['Water requirements, quality standards, water treatment, wastewater treatment, BOD, air pollution, hydrology, hydrograph, flood routing, irrigation.'],
            studyLinks: [
              { label: 'NPTEL Environmental Engineering', url: 'https://nptel.ac.in/courses/105105048' }
            ]
          },
          {
            title: 'Structural Analysis & Design (RCC & Steel)',
            weight: '12-15 Marks',
            topics: ['Statically determinate and indeterminate structures, slope deflection, moment distribution, limit state design of beams and slabs, prestressed concrete, steel connections.'],
            studyLinks: [
              { label: 'B.C. Punmia RCC Design', url: 'https://www.google.com/search?q=BC+Punmia+RCC+Design+Notes' }
            ]
          }
        ]
      }
    ]
  }
};

export default function GatePrepPanel() {
  const [selectedBranch, setSelectedBranch] = useState('cs');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);

  const activeBranchData = GATE_DATA[selectedBranch] || GATE_DATA.cs;

  return (
    <div className="gate-page max-w-6xl mx-auto space-y-7 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="gate-hero glass-card p-6 sm:p-8 border border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-600/15 via-zinc-500/10 to-stone-500/15 text-white rounded-3xl shadow-xl relative overflow-hidden dark:bg-black dark:bg-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-stone-500/10 rounded-full blur-3xl pointer-events-none dark:hidden" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-indigo-200 border border-white/20 mb-2 dark:bg-white/10 dark:text-white dark:border-white/20">
              <GraduationCap size={13} className="text-amber-300 dark:text-white" />
              <span>National Examination Navigator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              GATE Preparation & Syllabus Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Master the Graduate Aptitude Test in Engineering with official syllabi, topic-wise marks weightage, and direct verified study notes from NPTEL, Gate Overflow & standard authors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://gateoverflow.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800"
            >
              <span>Gate Overflow</span>
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://nptel.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all dark:bg-white dark:bg-none dark:text-black dark:hover:bg-neutral-200"
            >
              <span>NPTEL Portal</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Branch Selector Tabs */}
        <div className="gate-branch-tabs grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/15 dark:border-neutral-800">
          {Object.entries(GATE_DATA).map(([key, data]) => {
            const isSelected = selectedBranch === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedBranch(key)}
                className={`gate-branch-tab ${isSelected ? 'gate-branch-tab-active' : 'gate-branch-tab-inactive'} py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-md font-black scale-[1.02] dark:bg-white dark:text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800'
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider text-amber-300 dark:text-neutral-300 font-mono">GATE {data.code}</span>
                <span className="truncate block mt-0.5">{data.code} Engineering</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-indigo-950/20">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Award size={14} /> Target Discipline
          </div>
          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
            {activeBranchData.name}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            {activeBranchData.description}
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-indigo-950/20">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Clock size={14} /> Exam Pattern (100 Marks)
          </div>
          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
            65 Questions · 180 Minutes
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            MCQs (1/3rd negative), MSQs (No negative), NAT numericals (No negative).
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-indigo-950/20">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Marks Distribution
          </div>
          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
            Core 70% · GA 15% · Math 15%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeBranchData.weightageNotes}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeBranchData.code} topics (e.g. Algorithms, Paging, Fourier, Thermodynamics)...`}
          className="app-input pl-11 py-3 text-xs sm:text-sm rounded-2xl shadow-sm"
        />
      </div>

      {/* Syllabus Sections & Subjects */}
      <div className="space-y-6">
        {activeBranchData.sections.map((section, sIndex) => {
          const filteredSubjects = section.subjects.filter(subj => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return subj.title.toLowerCase().includes(q) ||
                   subj.topics.some(t => t.toLowerCase().includes(q));
          });

          if (filteredSubjects.length === 0) return null;

          return (
            <div key={sIndex} className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 rounded-3xl space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                <BookOpen size={16} />
                <span>{section.category}</span>
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {filteredSubjects.map((subj, subjIdx) => {
                  const isExpanded = expandedSubject === `${sIndex}-${subjIdx}`;
                  return (
                    <div
                      key={subjIdx}
                      className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950 transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedSubject(isExpanded ? null : `${sIndex}-${subjIdx}`)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-neutral-900 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-white/10 dark:text-white flex items-center justify-center shrink-0 font-black text-xs">
                            {subjIdx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                              {subj.title}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-neutral-400">
                              Approx. Weightage: {subj.weight}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-400 hidden sm:inline">
                            {isExpanded ? 'Hide Details' : 'View Syllabus & Links'}
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="dark:text-white" /> : <ChevronDown size={16} className="dark:text-white" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-slate-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-black">
                          {/* Topics Covered */}
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-1">
                              Detailed Official Topics
                            </span>
                            <ul className="space-y-1">
                              {subj.topics.map((t, tIdx) => (
                                <li key={tIdx} className="text-xs text-slate-700 dark:text-neutral-300 flex items-start gap-2 leading-relaxed">
                                  <span className="text-indigo-500 dark:text-white font-bold shrink-0">•</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Curated Study Resources & Redirects */}
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-1.5">
                              Free Curated Study Material & Solutions
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {subj.studyLinks.map((link, lIdx) => (
                                <a
                                  key={lIdx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-50/60 dark:bg-neutral-900 dark:border-neutral-800 text-indigo-700 dark:text-white font-bold text-[11px] hover:bg-indigo-100/70 dark:hover:bg-neutral-800 transition-all hover:scale-105"
                                >
                                  <span>{link.label}</span>
                                  <ExternalLink size={11} />
                                </a>
                              ))}

                              {/* Google Direct Search Fallback */}
                              <a
                                href={`https://www.google.com/search?q=GATE+${encodeURIComponent(activeBranchData.code)}+${encodeURIComponent(subj.title)}+lecture+notes+pyq+pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <Search size={11} />
                                <span>Search on Google</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
