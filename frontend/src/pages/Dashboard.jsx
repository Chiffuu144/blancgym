import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Dumbbell, Heart, House, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import GlassCard from '../components/GlassCard.jsx';
import CalorieProgressBar from '../components/CalorieProgressBar.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { localDateKey } from '../utils/dateKey.js';

const modules = [
  { to: '/training', number: '01', icon: BookOpen, category: 'MOBILITY + RECOVERY', title: 'Stretching', description: 'A day-by-day plan for mobility, gentle stretches, and recovery.', tag: 'Stretching guide', tone: 'bg-blush text-roseDark' },
  { to: '/gym', number: '02', icon: Dumbbell, category: 'EQUIPMENT + STRENGTH', title: 'At the gym', description: 'Equipment-based sessions, organized by muscle group and level.', tag: 'Gym guide', tone: 'bg-[#e6e8df] text-sage' },
  { to: '/home', number: '03', icon: House, category: 'SMALL SPACE, BIG ENERGY', title: 'At home', description: 'Bodyweight and minimal-equipment routines that fit your day.', tag: 'Home guide', tone: 'bg-[#e7e2e9] text-[#66566f]' }
];

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function Dashboard() {
  const { user, getNutrition } = useAuth();
  const [nutrition, setNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState('');
  const firstName = user?.name?.split(' ')[0] || 'friend';
  const loadNutrition = useCallback(() => {
    setNutritionLoading(true);
    getNutrition(localDateKey())
      .then(data => { setNutrition(data); setNutritionError(''); })
      .catch(error => setNutritionError(error.message))
      .finally(() => setNutritionLoading(false));
  }, [getNutrition]);

  useEffect(() => { loadNutrition(); }, [loadNutrition]);

  return <div className="min-h-screen pb-16">
    <Navbar />
    <main className="page-shell">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="grid gap-8 py-12 md:grid-cols-2 md:items-end md:py-16"
      >
        <div>
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark">
            <Sparkles size={14} /> YOUR SPACE TO FEEL GOOD
          </p>
          <h1 className="max-w-xl font-display text-5xl font-medium leading-[1.04] tracking-[-.045em] text-ink sm:text-6xl">
            A little stronger,<br /><span className="text-roseDark">every day.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-muted">
            Welcome, {firstName}. Find a movement that feels right for you today.
          </p>
        </div>

        <GlassCard className="p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blush text-roseDark"><Heart size={18} /></span>
            <span className="rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-muted">{user?.gender} profile</span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">A note for you</p>
          <p className="mt-2 font-display text-2xl font-medium leading-snug tracking-[-.025em]">Consistency can be gentle.</p>
          <p className="mt-2 text-sm leading-6 text-muted">Your guides use your profile to shape your workout recommendations.</p>
        </GlassCard>
      </motion.section>

      <section aria-labelledby="daily-fuel-title" className="mb-12">
        <GlassCard className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="order-2 sm:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Your daily rhythm</p>
            <h2 id="daily-fuel-title" className="mt-2 font-display text-2xl font-medium tracking-[-.025em] text-ink">A little fuel, thoughtfully tracked.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">Your estimated target is {Number(user?.targetDailyCalories || 0).toLocaleString()} kcal. Log meals and see how today is adding up.</p>
            {nutritionError && <p role="status" className="mt-2 text-xs text-roseDark">{nutritionError}</p>}
            <Link to="/nutrition" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-roseDark px-4 py-3 text-sm font-semibold text-paper motion-safe-hover hover:bg-ink">Open nutrition tracker <ArrowUpRight size={15} /></Link>
            <p className="mt-3 text-[11px] leading-5 text-muted">Calorie target is an estimate from your profile, not medical advice.</p>
          </div>
          <div className="order-1 flex justify-center sm:order-2">
            {nutritionLoading
              ? <LoadingScreen message="Finding your daily rhythm..." compact />
              : <CalorieProgressBar consumed={nutrition?.caloriesConsumed || 0} target={nutrition?.targetCalories || user?.targetDailyCalories || 0} size={152} />}
          </div>
        </GlassCard>
      </section>

      <section aria-labelledby="movement-title" className="mt-1">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-muted">A good place to begin</p>
            <h2 id="movement-title" className="mt-1 font-display text-2xl font-medium tracking-[-.025em] text-ink">Your movement menu</h2>
          </div>
          <span className="hidden text-xs text-muted sm:block">Choose what feels right today</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((module, index) => <motion.div
            key={module.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: index * .06 }}
          >
            <Link to={module.to} aria-label={`${module.title}: ${module.description}`}>
              <GlassCard interactive className="group h-full p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${module.tone}`}><module.icon size={19} /></span>
                  <span className="font-sans text-xs font-medium tabular-nums text-muted">{module.number}</span>
                </div>
                <p className="mt-8 text-[10px] font-semibold tracking-[.14em] text-roseDark">{module.category}</p>
                <h3 className="mt-2 font-display text-[25px] font-medium tracking-[-.025em] text-ink">{module.title}</h3>
                <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted">{module.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-xs font-medium text-muted">{module.tag}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-roseDark transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ArrowUpRight size={15} /></span>
                </div>
              </GlassCard>
            </Link>
          </motion.div>)}
        </div>
      </section>

      <footer className="mt-14 flex items-center justify-between border-t border-line pt-5 text-xs text-muted">
        <span>Made for the way you move.</span>
        <span className="font-display text-base font-semibold tracking-[-.03em]">blanc<span className="text-rose">.</span></span>
      </footer>
    </main>
  </div>;
}
