import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, Copy, Eye, EyeOff, Lock, Mail, Sparkles, User, X } from 'lucide-react';
import { hasRemoteAuthApi, registerAccount, signIn, signInWithGoogleAccessToken, signInWithGoogleProfile } from '../services/authApi';
import BrandLogo from './BrandLogo';

function GoogleIcon({ className = 'h-5 w-5' }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>;
}

function StudySignal() {
  return <div className="study-signal" aria-hidden="true">
    <div className="signal-glow signal-glow-one" />
    <div className="signal-glow signal-glow-two" />
    <svg className="signal-map" viewBox="0 0 720 620" fill="none" preserveAspectRatio="xMidYMid slice">
      <path className="signal-route signal-route-back" d="M-30 450C72 376 94 520 194 420S306 178 397 276s122 197 222 104 91-179 165-232" />
      <path className="signal-route" d="M-30 450C72 376 94 520 194 420S306 178 397 276s122 197 222 104 91-179 165-232" />
      <path className="signal-route signal-route-alt" d="M-20 140c80 45 106 1 166 69s98 185 187 130 136-17 184 73 107 64 203 39" />
      <g className="signal-grid">
        <path d="M75 0v620M235 0v620M395 0v620M555 0v620M715 0v620" />
        <path d="M0 85h720M0 245h720M0 405h720M0 565h720" />
      </g>
      <g className="signal-nodes">
        <circle cx="105" cy="470" r="6" /><circle cx="194" cy="420" r="4" /><circle cx="306" cy="220" r="5" />
        <circle cx="397" cy="276" r="7" /><circle cx="520" cy="390" r="4" /><circle cx="619" cy="380" r="6" /><circle cx="692" cy="148" r="5" />
      </g>
    </svg>
    <div className="signal-badge signal-badge-top"><Sparkles size={13} /> your next chapter</div>
    <div className="signal-badge signal-badge-bottom"><span className="signal-dot" /> focus mode ready</div>
  </div>;
}

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin');
  const [identity, setIdentity] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null);
  const [copied, setCopied] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const googleClient = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;
    let ready = false;
    const init = () => {
      if (ready || !window.google?.accounts?.oauth2) return;
      ready = true;
      googleClient.current = window.google.accounts.oauth2.initTokenClient({ client_id: clientId, scope: 'openid email profile', callback: async (response) => {
        setBusy(true); setError('');
        try { if (response.error) throw new Error(response.error_description || 'Google sign-in was cancelled.'); onLoginSuccess(await signInWithGoogleAccessToken(response.access_token)); }
        catch (err) { setError(err.message || 'Google sign-in failed.'); }
        finally { setBusy(false); }
      } });
    };
    init(); const timer = window.setInterval(init, 100); window.addEventListener('load', init);
    return () => { window.clearInterval(timer); window.removeEventListener('load', init); };
  }, [onLoginSuccess]);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { if (mode === 'signup') setIssued(await registerAccount({ name, email, password })); else onLoginSuccess(await signIn({ identity, password })); }
    catch (err) { setError(err.message || 'Authentication failed. Please try again.'); }
    finally { setBusy(false); }
  };
  const googleSignIn = () => {
    if (googleClient.current) { setError(''); googleClient.current.requestAccessToken({ prompt: 'select_account' }); }
    else if (hasRemoteAuthApi()) setError('Google OAuth is not configured. Check VITE_GOOGLE_CLIENT_ID in frontend/.env.');
    else setGoogleModal(true);
  };
  const simulatedGoogle = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { setGoogleModal(false); onLoginSuccess(await signInWithGoogleProfile({ name: googleName || 'Google Scholar', email: googleEmail })); }
    catch (err) { setError(err.message || 'Google sign-in failed.'); }
    finally { setBusy(false); }
  };
  const copyId = async () => { try { await navigator.clipboard.writeText(issued.loginId); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { setError('Copy your unique ID manually.'); } };

  return <main className="auth-shell">
    <StudySignal />
    <div className="auth-layout">
      <section className="auth-intro">
        <BrandLogo showName className="auth-intro-brand" />
        <h1>Make your<br /><em>next move</em> count.</h1>
        <p>One calm space for the deadlines, grades and decisions that shape your degree.</p>
      </section>
      <section className="auth-card">
      <div className="space-y-1"><h2>{mode === 'signin' ? 'Welcome back' : 'Start your journey'}</h2><p>{mode === 'signin' ? 'Pick up where your progress left off.' : 'Build a smarter study rhythm from day one.'}</p></div>
      <form onSubmit={submit} className="space-y-4 pt-2">
        {mode === 'signup' && <div className="flex items-center gap-3 px-4 py-3.5 neu-inset"><User size={18} className="text-slate-400"/><input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-xs focus:outline-none"/></div>}
        <div className="flex items-center gap-3 px-4 py-3.5 neu-inset"><Mail size={18} className="text-slate-400"/><input required placeholder={mode === 'signup' ? 'Email address' : 'Email address or Unique ID'} value={mode === 'signup' ? email : identity} onChange={(e) => mode === 'signup' ? setEmail(e.target.value) : setIdentity(e.target.value)} className="w-full bg-transparent text-xs focus:outline-none"/></div>
        <div className="relative flex items-center gap-3 px-4 py-3.5 neu-inset"><Lock size={18} className="text-slate-400"/><input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent pr-8 text-xs focus:outline-none"/><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 text-slate-400" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
        {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs text-rose-600">{error}</div>}
        <button disabled={busy} className="mt-2 w-full py-3.5 text-xs font-bold neu-button">{busy ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
      </form>
      {issued && <div className="space-y-2 p-4 text-center neu-inset"><div className="flex justify-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={16}/> Account Issued!</div><p className="text-[11px]">Your Unique ByteStudy ID:</p><div className="flex justify-center gap-2"><code className="font-mono text-xs">{issued.loginId}</code><button type="button" onClick={copyId}>{copied ? <Check size={14}/> : <Copy size={14}/>}</button></div><button type="button" onClick={() => onLoginSuccess(issued)} className="text-xs font-bold text-emerald-600">Continue to Portal</button></div>}
      <div className="space-y-4 pt-2"><div className="flex w-full items-center gap-3"><span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700"/><span className="shrink-0 whitespace-nowrap text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">OR CONTINUE WITH</span><span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700"/></div><div className="flex justify-center"><button type="button" onClick={googleSignIn} className="flex h-12 w-12 items-center justify-center rounded-full neu-circle hover:scale-105 sm:h-14 sm:w-14" title="Sign in with Google"><GoogleIcon/></button></div></div>
      <div className="auth-mode-toggle">{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}<button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setIssued(null); }}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</button></div>
      <div className="auth-card-note">Your data stays yours <span>·</span> encrypted by default</div>
      </section>
    </div>
    {googleModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="relative w-full max-w-sm space-y-4 rounded-[18px] bg-[#fffefa] p-6 neu-flat dark:bg-[#292d28]"><button type="button" onClick={() => setGoogleModal(false)} className="absolute right-4 top-4"><X size={18}/></button><div className="flex items-center gap-3"><GoogleIcon/><strong className="text-sm">Sign in with Google</strong></div><form onSubmit={simulatedGoogle} className="space-y-2"><input required type="email" placeholder="your.email@gmail.com" value={googleEmail} onChange={(e) => setGoogleEmail(e.target.value)} className="w-full px-3 py-2 text-xs neu-inset"/><input placeholder="Your name" value={googleName} onChange={(e) => setGoogleName(e.target.value)} className="w-full px-3 py-2 text-xs neu-inset"/><button className="w-full py-2.5 text-xs font-bold neu-button">Continue with Google</button></form></div></div>}
    </main>;
}
