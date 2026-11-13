import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/community', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="grid min-h-screen place-items-center px-4 py-8 sm:px-6">
    <div className="w-full max-w-[1040px]">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 text-xs text-muted motion-safe-hover hover:text-ink"><ArrowLeft size={14} /> blanc home</Link>
      <div className="auth-frame grid overflow-hidden rounded-3xl md:min-h-[600px] md:grid-cols-2">
        <motion.aside initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="auth-story hidden flex-col justify-between p-10 lg:p-14 md:flex">
          <div className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-.03em] text-ink"><span className="grid h-9 w-9 place-items-center rounded-xl border border-[#d7c3c2] bg-[#efe3e1] text-roseDark"><Dumbbell size={16} /></span>blanc<span className="-ml-2 text-rose">.</span></div>
          <div className="max-w-md"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark">Good to see you again</p><h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-.035em] text-ink lg:text-6xl">Your space<br />is still here.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-muted">Pick up where you left off. Your plan moves at your pace.</p></div>
          <p className="border-t border-[#d8c5c3] pt-4 text-xs leading-5 text-muted">MOVE WITH CARE <span className="px-1 text-roseDark">/</span> REST WITHOUT GUILT <span className="px-1 text-roseDark">/</span> BEGIN AGAIN</p>
        </motion.aside>
        <section className="auth-panel flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[380px]">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-roseDark">Welcome back</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-.035em] text-ink">Sign in to blanc.</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Your routines and daily log are right where you left them.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block text-xs font-medium text-ink">Email address<input className="field mt-2" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required /></label>
              <label className="block text-xs font-medium text-ink">Password<input className="field mt-2" type="password" name="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required /></label>
              {error && <p role="alert" className="rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-3 py-2.5 text-xs text-roseDark">{error}</p>}
              <motion.button whileTap={{ scale: .985 }} transition={spring} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-roseDark px-4 py-3.5 text-sm font-semibold text-paper motion-safe-hover hover:bg-ink disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}{!busy && <ArrowRight size={16} />}</motion.button>
            </form>
            <p className="mt-4 text-right text-xs"><Link className="font-semibold text-roseDark hover:underline" to="/forgot-password">Forgot password?</Link></p>
            <p className="mt-6 text-center text-xs text-muted">New to blanc? <Link className="font-semibold text-roseDark hover:underline" to="/register">Create an account</Link></p>
          </div>
        </section>
      </div>
      <p className="mt-5 text-center font-display text-sm font-semibold tracking-[-.03em] text-muted md:hidden">blanc<span className="text-rose">.</span></p>
    </div>
  </main>;
}
