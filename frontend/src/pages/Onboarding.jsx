import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Dumbbell, Gauge, Heart, Scale, Sparkles, Target } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CapybaraMascot from '../components/CapybaraMascot.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const spring = { type: 'spring', stiffness: 400, damping: 30 };
const experiences = [
  { value: 'starting', label: 'Just starting' },
  { value: '6-months', label: '6+ months' },
  { value: '2-years', label: '2+ years' }
];
const frequencies = [
  { value: '1-2', label: '1-2x a week' },
  { value: '3-5', label: '3-5x a week' },
  { value: 'daily', label: 'Daily' }
];
const goals = [
  { value: 'fat-loss', label: 'Fat loss', note: 'A modest calorie deficit', icon: Gauge },
  { value: 'build-muscle', label: 'Build muscle', note: 'A modest calorie surplus', icon: Dumbbell },
  { value: 'maintain-weight', label: 'Maintain weight', note: 'Around estimated maintenance', icon: Scale }
];

function parseHeight(value) {
  const text = value.trim();
  const feetInches = text.match(/^(\d)\s*(?:'|ft)\s*(\d{1,2})?\s*(?:"|in)?$/i);
  if (feetInches) return (Number(feetInches[1]) * 12 + Number(feetInches[2] || 0)) * 2.54;
  const centimeters = text.match(/^(\d{2,3}(?:\.\d+)?)\s*(?:cm)?$/i);
  return centimeters ? Number(centimeters[1]) : NaN;
}

function ChoiceButton({ selected, onClick, children, className = '' }) {
  return <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`rounded-xl border px-4 py-3 text-left motion-safe-hover ${selected ? 'border-rose bg-blush text-roseDark' : 'border-line bg-cream/70 text-muted hover:bg-cream'} ${className}`}
  >{children}</button>;
}

export default function Onboarding() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', username: '', password: '', gender: 'Female',
    age: '', weightKg: '', height: '', experience: '', workoutFrequency: '', goal: ''
  });
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  function nextStep() {
    setError('');
    if (!formRef.current?.reportValidity()) return;
    if (step === 2 && (!form.experience || !form.workoutFrequency)) {
      setError('Choose an experience level and a weekly frequency to continue.');
      return;
    }
    if (step === 3 && !form.goal) {
      setError('Choose the goal that feels right for you.');
      return;
    }
    if (step === 1) {
      const heightCm = parseHeight(form.height);
      if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
        setError('Enter a height from 120 to 230 cm, such as 168 cm or 5\'6".');
        return;
      }
    }
    setStep(value => Math.min(3, value + 1));
  }

  function previousStep() {
    setError('');
    setStep(value => Math.max(0, value - 1));
  }

  async function submit(event) {
    event.preventDefault();
    if (step < 3) { nextStep(); return; }
    if (!form.goal) { setError('Choose the goal that feels right for you.'); return; }
    setError('');
    setBusy(true);
    try {
      await register({
        ...form,
        username: form.username.trim(),
        heightCm: parseHeight(form.height),
        age: Number(form.age),
        weightKg: Number(form.weightKg)
      });
      navigate('/community', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    { eyebrow: '01 / Account', title: 'First, the basics.' },
    { eyebrow: '02 / Your stats', title: 'A little about you.' },
    { eyebrow: '03 / Your rhythm', title: 'How do you like to move?' },
    { eyebrow: '04 / Your goal', title: 'What feels right now?' }
  ];

  return <main className="page-shell grid min-h-screen items-center gap-8 py-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-16 lg:py-12">
    <aside className="hidden lg:block">
      <Link to="/" className="inline-flex items-center gap-2 font-serif text-2xl font-semibold tracking-[-.04em] text-ink">
        blanc<span className="-ml-2 text-rose">.</span>
      </Link>
      <p className="mt-20 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark">A softer kind of strong</p>
      <h1 className="mt-4 max-w-md font-serif text-5xl font-medium leading-[1.08] tracking-[-.035em] text-ink xl:text-6xl">Four small steps.<br />A plan that fits.</h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-muted">Tell us a little about you. We will make a starting point that feels personal, flexible, and yours.</p>
      <div className="mt-10 flex items-center gap-2 text-xs font-medium tracking-wide text-muted"><Heart size={15} className="fill-rose/15 text-rose" /> Your body, your pace.</div>
    </aside>

    <section className="mx-auto w-full max-w-[560px]">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <Link to="/" className="font-serif text-xl font-semibold text-ink">blanc<span className="text-rose">.</span></Link>
        <span className="text-[11px] font-medium uppercase tracking-[.14em] text-roseDark">A softer kind of strong</span>
      </div>

      <div className="glass relative z-10 min-h-[610px] rounded-3xl border border-white/70 bg-[#fffdfb]/80 px-5 pb-5 pt-[146px] shadow-[0_18px_55px_rgba(92,57,66,.08)] backdrop-blur-xl sm:px-8 sm:pb-7">
        <div className="pointer-events-none absolute -top-[20px] left-1/2 z-20 h-[220px] w-full max-w-[440px] -translate-x-1/2">
          <CapybaraMascot />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-roseDark">Current step · {steps[step].eyebrow}</p>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-[-.03em] text-ink sm:text-[28px]">{steps[step].title}</h2>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted">{step + 1} / 4</span>
        </div>

        <div className="mt-5 h-1 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full origin-left rounded-full bg-rose" animate={{ width: `${((step + 1) / 4) * 100}%` }} transition={spring} />
        </div>

        <form ref={formRef} onSubmit={submit} className="mt-6 flex min-h-[420px] flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={spring}
                className="min-h-[360px]"
              >
                {step === 0 && <div className="space-y-4">
                  <label className="block text-xs font-medium text-ink">Email address
                    <input className="field mt-2" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={event => update('email', event.target.value)} required />
                  </label>
                  <label className="block text-xs font-medium text-ink">Username
                    <input className="field mt-2" autoComplete="username" placeholder="Choose a username" value={form.username} onChange={event => update('username', event.target.value)} pattern="[A-Za-z0-9_]{3,32}" minLength={3} maxLength={32} title="Use 3-32 letters, numbers, or underscores." required />
                  </label>
                  <label className="block text-xs font-medium text-ink">Password
                    <input className="field mt-2" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={event => update('password', event.target.value)} minLength={8} required />
                  </label>
                  <fieldset>
                    <legend className="text-xs font-medium text-ink">Gender <span className="font-normal text-muted">(for tailored workouts)</span></legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {['Female', 'Male'].map(gender => <ChoiceButton key={gender} selected={form.gender === gender} onClick={() => update('gender', gender)}>{gender}</ChoiceButton>)}
                    </div>
                  </fieldset>
                </div>}

                {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-ink">Age
                    <input className="field mt-2" type="number" min="18" max="100" step="1" placeholder="21" value={form.age} onChange={event => update('age', event.target.value)} required />
                    <span className="mt-1 block text-[11px] font-normal text-muted">Adults 18 and over</span>
                  </label>
                  <label className="block text-xs font-medium text-ink">Weight (kg)
                    <input className="field mt-2" type="number" min="30" max="350" step="0.1" placeholder="64" value={form.weightKg} onChange={event => update('weightKg', event.target.value)} required />
                  </label>
                  <label className="block text-xs font-medium text-ink sm:col-span-2">Height
                    <input className="field mt-2" type="text" inputMode="text" placeholder={'5\'6"'} value={form.height} onChange={event => update('height', event.target.value)} required />
                    <span className="mt-1 block text-[11px] font-normal text-muted">Enter feet and inches or centimeters.</span>
                  </label>
                  <div className="sm:col-span-2 rounded-xl border border-line bg-cream/65 p-4 text-xs leading-5 text-muted">
                    <span className="font-semibold text-ink">Just for your starting estimate.</span> These details help calculate an approximate daily energy target.
                  </div>
                </div>}

                {step === 2 && <div className="space-y-6">
                  <fieldset>
                    <legend className="mb-2 text-xs font-medium text-ink">How long have you been working out?</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {experiences.map(item => <ChoiceButton key={item.value} selected={form.experience === item.value} onClick={() => update('experience', item.value)} className="text-center">{item.label}</ChoiceButton>)}
                    </div>
                    <input className="sr-only" tabIndex={-1} aria-hidden="true" value={form.experience} required readOnly />
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-xs font-medium text-ink">How often do you plan to work out?</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {frequencies.map(item => <ChoiceButton key={item.value} selected={form.workoutFrequency === item.value} onClick={() => update('workoutFrequency', item.value)} className="text-center">{item.label}</ChoiceButton>)}
                    </div>
                    <input className="sr-only" tabIndex={-1} aria-hidden="true" value={form.workoutFrequency} required readOnly />
                  </fieldset>
                  <p className="text-xs leading-5 text-muted">Choose what is realistic for an average week. You can always change your routine.</p>
                </div>}

                {step === 3 && <div className="space-y-3">
                  {goals.map(item => {
                    const Icon = item.icon;
                    return <ChoiceButton key={item.value} selected={form.goal === item.value} onClick={() => update('goal', item.value)} className="flex w-full items-center gap-3 p-4">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${form.goal === item.value ? 'bg-paper text-roseDark' : 'bg-blush text-roseDark'}`}><Icon size={17} /></span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{item.note}</span>
                      </span>
                      {form.goal === item.value && <span className="h-2 w-2 rounded-full bg-rose" />}
                    </ChoiceButton>;
                  })}
                  <input className="sr-only" tabIndex={-1} aria-hidden="true" value={form.goal} required readOnly />
                  <p className="pt-2 text-[11px] leading-5 text-muted">Calorie targets are estimates based on a predictive equation and activity factor, not medical advice.</p>
                </div>}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && <p role="alert" className="mb-3 rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-3 py-2.5 text-xs text-roseDark">{error}</p>}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            {step === 0
              ? <Link to="/login" className="text-xs font-medium text-muted hover:text-ink">Already a member? Sign in</Link>
              : <button type="button" onClick={previousStep} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted hover:bg-cream"><ArrowLeft size={14} /> Back</button>}
            {step < 3
              ? <motion.button type="button" whileTap={{ scale: .985 }} transition={spring} onClick={nextStep} className="inline-flex items-center gap-2 rounded-xl bg-roseDark px-4 py-3 text-sm font-semibold text-paper hover:bg-ink">Continue <ArrowRight size={15} /></motion.button>
              : <motion.button type="submit" whileTap={{ scale: .985 }} transition={spring} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-roseDark px-4 py-3 text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60">{busy ? 'Creating your plan...' : 'Create account'} {!busy && <Sparkles size={15} />}</motion.button>}
          </div>
        </form>
      </div>
    </section>
  </main>;
}
