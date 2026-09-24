import React, { useState } from 'react';
import { Landmark, Plus, Trash2, AlertTriangle, TrendingUp, DollarSign, Calendar, Info } from 'lucide-react';

export default function ExpenseTracker({ expenses, setExpenses, monthlyBudget, setMonthlyBudget }) {
  // Input fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food'); // 'food' | 'academics' | 'transport' | 'entertainment' | 'subscriptions' | 'misc'
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Budget settings input
  const [budgetVal, setBudgetVal] = useState(monthlyBudget);

  const handleAddExpense = (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }
    if (!description.trim()) {
      alert("Please specify a description.");
      return;
    }

    const newExpense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      amount: numAmt,
      category,
      description: description.trim(),
      date: expenseDate || new Date().toISOString().split('T')[0]
    };

    setExpenses(prev => [newExpense, ...prev]);
    
    // reset form
    setAmount('');
    setDescription('');
  };

  const handleDeleteExpense = (id) => {
    if (confirm("Delete this expense log?")) {
      setExpenses(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const numBudg = parseFloat(budgetVal);
    if (isNaN(numBudg) || numBudg <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    setMonthlyBudget(numBudg);
    alert("Monthly pocket money budget updated!");
  };

  // Date heuristics: filter expenses for current month
  const currentMonthString = new Date().toISOString().substring(0, 7); // YYYY-MM
  const thisMonthExpensesList = expenses.filter(e => e.date.substring(0, 7) === currentMonthString);
  const totalSpentThisMonth = thisMonthExpensesList.reduce((acc, e) => acc + e.amount, 0);

  // Budget calculations
  const pctUsed = monthlyBudget > 0 ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const isHighSpending = pctUsed >= 80;
  const isOverBudget = totalSpentThisMonth > monthlyBudget;

  // Category values summary
  const CATEGORY_CFG = {
    food: { label: '🍔 Food & Snacks', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    academics: { label: '📖 Books & Stationeries', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    transport: { label: '🚌 Transit Metro', color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    entertainment: { label: '🍿 Cinema & Fun', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
    subscriptions: { label: '⚡ Hostings & Subs', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    misc: { label: '⚙️ Miscellaneous', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
  };

  const categoryTotals = thisMonthExpensesList.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Column: Form Forms */}
      <div className="space-y-6">
        
        {/* Budget Setup form */}
        <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white">
              <Landmark size={15} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Set Monthly Allowance</h3>
          </div>
          
          <form onSubmit={handleSaveBudget} className="flex gap-2">
            <div className="relative flex-1">
              <span className="currency-symbol absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input 
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="app-input pl-7 font-mono font-bold text-sm"
                placeholder="Monthly Budget"
                required
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Update
            </button>
          </form>
        </div>

        {/* Log Expense Form */}
        <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white">
              <Plus size={15} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Log Pocket Expense</h3>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1">
                Cost Amount
              </label>
              <div className="relative">
                <span className="currency-symbol absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input 
                  type="number"
                  placeholder="e.g. 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="app-input pl-8 font-mono font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1">
                Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600/20 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="food">Food & Cafe Snacks</option>
                <option value="academics">Syllabus Books & Prints</option>
                <option value="transport">Metro Bus Travel</option>
                <option value="entertainment">Hangouts & Cinema</option>
                <option value="subscriptions">Hosting & Server Subs</option>
                <option value="misc">Miscellaneous Fees</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1">
                Description / Memo
              </label>
              <input 
                type="text"
                placeholder="e.g. Printing DBMS lab reports"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="app-input shadow-sm text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 mb-1">
                Date
              </label>
              <input 
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="app-input shadow-sm font-semibold text-sm"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary flex items-center justify-center gap-1.5 cursor-pointer mt-2 text-xs"
            >
              <Plus size={14} />
              <span>Register Expense</span>
            </button>
          </form>
        </div>

      </div>

      {/* Middle & Right: Budget Health & Ledger Logs */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Budget Health indicator and Warnings */}
        <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500">Monthly Pocket Allowance Health</span>
              <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white mt-1">
                <span className="currency-symbol">₹</span>{totalSpentThisMonth} <span className="text-sm font-medium text-slate-500">spent of <span className="currency-symbol">₹</span>{monthlyBudget}</span>
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-mono
              ${isOverBudget 
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse' 
                : isHighSpending 
                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }
            `}>
              {pctUsed.toFixed(0)}% Used
            </span>
          </div>

          {/* Progress bar health gauge */}
          <div className="w-full bg-slate-100 dark:bg-surface-650 h-3.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${Math.min(pctUsed, 100)}%`, 
                background: isOverBudget 
                  ? 'var(--gradient-danger)' 
                  : isHighSpending 
                  ? 'var(--gradient-accent)' 
                  : 'var(--gradient-success)' 
              }}
            />
          </div>

          {/* Trigger Alert Notification Banner */}
          {isHighSpending && (
            <div className={`p-4 rounded-xl border flex gap-3 animate-slide-up
              ${isOverBudget 
                ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-455' 
                : 'bg-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-455'
              }
            `}>
              <AlertTriangle size={18} className="shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs">
                <p className="font-extrabold">
                  {isOverBudget ? 'Critical Allowance Shortage!' : 'Pocket Money Nearing Threshold Alert'}
                </p>
                <p className="opacity-90 leading-relaxed mt-1">
                  {isOverBudget 
                    ? `You have exceeded your set monthly allowance by INR ${totalSpentThisMonth - monthlyBudget}! Limit pocket spendings for academic health.` 
                    : `You have exhausted ${pctUsed.toFixed(0)}% of your pocket money allowance! Plan remaining stationery/mess costs carefully.`}
                </p>
              </div>
            </div>
          )}

          {/* Categories breakdown bubbles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-indigo-950/20">
            {Object.keys(CATEGORY_CFG).map(catKey => {
              const total = categoryTotals[catKey] || 0;
              const cfg = CATEGORY_CFG[catKey];
              return (
                <div key={catKey} className={`rounded-xl p-3 border text-center ${cfg.color}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 truncate">{cfg.label}</div>
                  <div className="text-base font-extrabold font-mono mt-1.5"><span className="currency-symbol">₹</span>{total}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ledger Transaction History List */}
        <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Expense Ledger Book ({thisMonthExpensesList.length} items this month)
          </h3>

          {thisMonthExpensesList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-indigo-950/10 rounded-2xl">
              No transactions logged for {currentMonthString}.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-indigo-950/15 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-surface-700/10">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Memo</th>
                    <th className="py-2.5 px-3 text-center">Amount</th>
                    <th className="py-2.5 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-indigo-950/10">
                  {thisMonthExpensesList.map(item => {
                    const cfg = CATEGORY_CFG[item.category] || CATEGORY_CFG.misc;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-700/5">
                        <td className="py-3 px-3 font-mono text-slate-500">{item.date}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-lg border font-bold text-[9px] ${cfg.color.split(' ')[0]} ${cfg.color.split(' ')[1]} ${cfg.color.split(' ')[2]}`}>
                            {cfg.label.split(' ')[1]}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[150px]" title={item.description}>
                          {item.description}
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold font-mono text-slate-800 dark:text-slate-200"><span className="currency-symbol">₹</span>{item.amount}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteExpense(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-transparent hover:border-rose-250/20"
                            title="Delete transaction"
                          >
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
