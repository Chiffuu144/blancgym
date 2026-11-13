import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import WorkoutList from './WorkoutList.jsx';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

const copy = {
  training: { eyebrow: 'Mobility & recovery', title: 'Stretch at your own pace.', intro: 'A gentle weekly mobility plan for your back, hips, and whole body. Keep each stretch comfortable and let your breathing set the pace.' },
  gym: { eyebrow: 'Strength, your way', title: 'Make the gym yours.', intro: 'Equipment-based sessions shaped around your profile and ready for your next gym visit.' },
  home: { eyebrow: 'Right where you are', title: 'A good workout fits home.', intro: 'Minimal-equipment routines that make a small space feel like enough. Start easy and build at your own rhythm.' }
};

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function GuidePage({ category }) {
  const { getWorkouts, user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(today);
  const content = copy[category];
  const dayWorkout = workouts.find(workout => workout.dayOfWeek === selectedDay);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getWorkouts(category)
      .then(data => { if (active) setWorkouts(data.workouts); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, getWorkouts]);

  return <div className="min-h-screen pb-28 lg:pb-16">
    <Navbar />
    <main className="page-shell">
      <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-xs text-muted motion-safe-hover hover:text-ink">
        <ArrowLeft size={14} /> Back to your space
      </Link>

      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="py-12 sm:py-16">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark"><Sparkles size={14} /> {content.eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-[-.04em] text-ink sm:text-6xl">{content.title}</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted">{content.intro}</p>
        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-4 py-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-rose" /> Recommendations for your {user?.gender?.toLowerCase()} profile
        </div>
      </motion.section>

      <section aria-labelledby="guide-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-muted">Your plan</p>
            <h2 id="guide-title" className="mt-1 font-display text-2xl font-medium tracking-[-.025em] text-ink">{dayWorkout?.targetArea || 'Weekly workout plan'}</h2>
          </div>
          <span className="rounded-full border border-line bg-paper/70 px-3 py-1.5 text-xs text-muted">{dayWorkout?.level || (user?.experience === '2-years' ? 'Advanced' : user?.experience === '6-months' ? 'Intermediate' : 'Beginner')} plan</span>
        </div>
        <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7" role="tablist" aria-label="Choose a workout day">
          {weekDays.map(day => <button key={day} type="button" role="tab" aria-selected={selectedDay === day} onClick={() => setSelectedDay(day)} className={`rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${selectedDay === day ? 'border-rose bg-blush text-roseDark' : 'border-line bg-paper/65 text-muted hover:bg-blush/50'}`}>
            <span className="block sm:hidden">{day.slice(0, 3)}</span><span className="hidden sm:block">{day}</span>
          </button>)}
        </div>
        <WorkoutList workouts={dayWorkout ? [dayWorkout] : []} loading={loading} error={error} />
      </section>
    </main>
  </div>;
}
