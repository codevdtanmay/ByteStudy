import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { submitFeedback } from '../services/feedbackApi';

const FEEDBACK_TYPES = [
  ['ERROR', 'Getting an error'],
  ['UPLOAD_NEEDED', 'Upload needed'],
  ['FEATURE_NEEDED', 'Feature needed'],
  ['IMPROVEMENT', 'Improvement / suggestion'],
  ['OTHER', 'Something else'],
];

export default function FeedbackModal({ isOpen, onClose }) {
  const [type, setType] = useState(FEEDBACK_TYPES[0][0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await submitFeedback({ type, message: message.trim() });
      setMessage('');
      onClose();
      alert('Thank you! Your feedback has been sent to the ByteStudy team.');
    } catch (error) {
      alert(error.message || 'Feedback could not be submitted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-surface-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">Testing phase</p>
            <h2 id="feedback-title" className="mt-1 text-xl font-bold text-slate-800 dark:text-white">Help shape ByteStudy</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-700" aria-label="Close feedback form"><X size={18} /></button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          This website is currently being tested. You have an opportunity to help build a platform that students of SOET can use for a long time. Please share your valuable feedback.
        </p>
        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">Feedback type</label>
        <select value={type} onChange={event => setType(event.target.value)} className="app-input mt-2 text-sm">
          {FEEDBACK_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="feedback-message">Your feedback</label>
        <textarea id="feedback-message" value={message} onChange={event => setMessage(event.target.value)} maxLength={3000} rows={5} required placeholder="Tell us what happened, what you need, or what would make ByteStudy better..." className="app-input mt-2 resize-y text-sm" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">{message.length}/3000</span>
          <button type="submit" disabled={isSubmitting || !message.trim()} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            <Send size={14} /> {isSubmitting ? 'Sending...' : 'Submit feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
