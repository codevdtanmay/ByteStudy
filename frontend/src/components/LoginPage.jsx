import React, { useEffect, useRef, useState } from 'react';
import { Github, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { hasRemoteAuthApi, signInWithGoogleAccessToken, startGithubSignIn } from '../services/authApi';
import BrandLogo from './BrandLogo';

function GoogleIcon({ className = 'h-5 w-5' }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.97 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>;
}

function StudySignal() {
  return <div className="study-signal" aria-hidden="true"><div className="signal-glow signal-glow-one"/><div className="signal-glow signal-glow-two"/><svg className="signal-map" viewBox="0 0 720 620" fill="none" preserveAspectRatio="xMidYMid slice"><path className="signal-route signal-route-back" d="M-30 450C72 376 94 520 194 420S306 178 397 276s122 197 222 104 91-179 165-232"/><path className="signal-route" d="M-30 450C72 376 94 520 194 420S306 178 397 276s122 197 222 104 91-179 165-232"/><path className="signal-route signal-route-alt" d="M-20 140c80 45 106 1 166 69s98 185 187 130 136-17 184 73 107 64 203 39"/><g className="signal-grid"><path d="M75 0v620M235 0v620M395 0v620M555 0v620M715 0v620"/><path d="M0 85h720M0 245h720M0 405h720M0 565h720"/></g><g className="signal-nodes"><circle cx="105" cy="470" r="6"/><circle cx="194" cy="420" r="4"/><circle cx="306" cy="220" r="5"/><circle cx="397" cy="276" r="7"/><circle cx="520" cy="390" r="4"/><circle cx="619" cy="380" r="6"/><circle cx="692" cy="148" r="5"/></g></svg><div className="signal-badge signal-badge-top"><Sparkles size={13}/> your next chapter</div><div className="signal-badge signal-badge-bottom"><span className="signal-dot"/> focus mode ready</div></div>;
}

export default function LoginPage({ onLoginSuccess }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const googleClient = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;
    let ready = false;
    const init = () => {
      if (ready || !window.google?.accounts?.oauth2) return;
      ready = true;
      googleClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          setBusy(true); setError('');
          try {
            if (response.error) throw new Error(response.error_description || 'Google sign-in was cancelled.');
            onLoginSuccess(await signInWithGoogleAccessToken(response.access_token));
          } catch (err) { setError(err.message || 'Google sign-in failed.'); }
          finally { setBusy(false); }
        },
      });
    };
    init();
    const timer = window.setInterval(init, 100);
    window.addEventListener('load', init);
    return () => { window.clearInterval(timer); window.removeEventListener('load', init); };
  }, [onLoginSuccess]);

  const googleSignIn = () => {
    if (!googleClient.current) {
      setError(import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Google is still loading. Please try again.' : 'Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    setError(''); setBusy(true);
    googleClient.current.requestAccessToken({ prompt: 'select_account' });
  };

  const githubSignIn = () => {
    if (!hasRemoteAuthApi()) { setError('The authentication service is not configured.'); return; }
    setError(''); setBusy(true); startGithubSignIn();
  };

  return <main className="auth-shell">
    <StudySignal/>
    <div className="auth-layout">
      <section className="auth-intro"><BrandLogo showName className="auth-intro-brand"/><h1>Make your<br/><em>next move</em> count.</h1><p>One calm space for the deadlines, grades and decisions that shape your degree.</p></section>
      <section className="auth-card">
        <div className="space-y-1"><h2>Welcome to ByteStudy</h2><p>Sign in securely and keep your momentum.</p></div>
        <div className="mt-7 space-y-3">
          {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600"><AlertCircle size={16} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
          <button type="button" disabled={busy} onClick={googleSignIn} className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60"><GoogleIcon/>Continue with Google<ArrowRight size={15} className="absolute right-4 text-slate-400"/></button>
          <button type="button" disabled={busy} onClick={githubSignIn} className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292f] py-3.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1f2328] hover:shadow-md disabled:cursor-wait disabled:opacity-60"><Github size={19} fill="currentColor"/>Continue with GitHub<ArrowRight size={15} className="absolute right-4 text-slate-400"/></button>
        </div>
        <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700"/><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">OAuth secured</span><span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700"/></div>
      </section>
    </div>
  </main>;
}
