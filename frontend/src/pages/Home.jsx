import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Dumbbell, Heart, House, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import capybaraImage from '../assets/capybara-transparent.png';
import homeWorkout from '../assets/home-workout.jpg';
import gymStrength from '../assets/gym-strength.jpg';
import gymDumbbell from '../assets/gym-dumbbell.jpg';

const spring = { type: 'spring', stiffness: 400, damping: 30 };
const guides = [
  { to: '/training', icon: BookOpen, label: 'Move well', detail: 'Warm-ups and form cues' },
  { to: '/gym', icon: Dumbbell, label: 'At the gym', detail: 'Strength, shaped around you' },
  { to: '/home', icon: House, label: 'At home', detail: 'Good movement, less equipment' }
];

export default function Home() {
  const reduceMotion = useReducedMotion();
  return <main className="page-shell min-h-screen py-6 sm:py-8">
    <header className="flex items-center justify-between border-b border-line pb-5">
      <Link to="/" className="font-display text-xl font-semibold tracking-[-.03em] text-ink">blanc<span className="text-rose">.</span></Link>
      <nav aria-label="Account" className="flex items-center gap-2 sm:gap-4">
        <Link to="/login" className="rounded-lg px-3 py-2 text-xs font-medium text-muted hover:text-ink">Sign in</Link>
        <Link to="/register" className="rounded-xl bg-roseDark px-4 py-2.5 text-xs font-semibold text-paper motion-safe-hover hover:bg-ink">Start your plan</Link>
      </nav>
    </header>

    <section className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[.94fr_1.06fr] lg:gap-10 lg:py-16" aria-labelledby="home-title">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : spring}
      >
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[.17em] text-roseDark">Movement for real life</p>
        <h1 id="home-title" className="max-w-2xl font-display text-5xl font-medium leading-[1.04] tracking-[-.045em] text-ink sm:text-7xl">Strength can feel <span className="text-roseDark">softer.</span></h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-muted">A personal space for movement, food, and progress without the pressure to be perfect.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-roseDark px-5 py-3.5 text-sm font-semibold text-paper motion-safe-hover hover:bg-ink">Build your starting plan <ArrowRight size={16} /></Link>
          <span className="text-xs text-muted">Four short steps. Yours to shape.</span>
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted"><Heart size={14} className="fill-rose/15 text-rose" /> Your body, your pace.</div>
      </motion.div>

      <div className="relative mx-auto h-[390px] w-full max-w-[520px] sm:h-[470px]" aria-label="Workout inspiration">
        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: .98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { ...spring, delay: .12 }}
          className="group absolute left-[4%] top-[4%] z-10 h-[79%] w-[60%] overflow-hidden rounded-[28px] border border-white/75 bg-blush shadow-[0_22px_55px_rgba(75,51,56,.15)] sm:rounded-[34px]"
        >
          <motion.img src={homeWorkout} alt="A woman doing a lunge on a yoga mat at home" className="h-full w-full object-cover" whileHover={reduceMotion ? undefined : { scale: 1.035 }} transition={spring} />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#302729]/75 via-[#302729]/25 to-transparent px-4 pb-4 pt-16 text-paper sm:px-5 sm:pb-5">
            <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-paper/80">At your own pace</span>
            <span className="mt-1 block font-display text-lg font-medium sm:text-xl">Make room to move.</span>
          </figcaption>
        </motion.figure>

        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, x: 12, scale: .97 }}
          animate={reduceMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, x: 0, scale: 1, y: [0, -8, 0] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { ...spring, delay: .24 }, x: { ...spring, delay: .24 }, scale: { ...spring, delay: .24 }, y: { duration: 4.6, ease: 'easeInOut', repeat: Infinity, delay: .35 } }}
          className="group absolute right-[1%] top-[12%] z-20 h-[45%] w-[38%] overflow-hidden rounded-[24px] border-[5px] border-[#fdfbf7] bg-paper shadow-[0_18px_42px_rgba(75,51,56,.13)] sm:rounded-[28px]"
        >
          <motion.img src={gymStrength} alt="A woman training with a barbell at the gym" className="h-full w-full object-cover" whileHover={reduceMotion ? undefined : { scale: 1.04 }} transition={spring} />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#302729]/70 to-transparent px-3 pb-3 pt-10 text-xs font-medium text-paper">At the gym</figcaption>
        </motion.figure>

        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: .96 }}
          animate={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, 7, 0], scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { ...spring, delay: .34 }, scale: { ...spring, delay: .34 }, y: { duration: 5, ease: 'easeInOut', repeat: Infinity, delay: .4 } }}
          className="group absolute bottom-[2%] right-[5%] z-30 h-[37%] w-[38%] overflow-hidden rounded-[24px] border-[5px] border-[#fdfbf7] bg-paper shadow-[0_18px_42px_rgba(75,51,56,.13)] sm:rounded-[28px]"
        >
          <motion.img src={gymDumbbell} alt="A woman lifting a dumbbell overhead" className="h-full w-full object-cover" whileHover={reduceMotion ? undefined : { scale: 1.04 }} transition={spring} />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#302729]/70 to-transparent px-3 pb-3 pt-10 text-xs font-medium text-paper">Find your strength</figcaption>
        </motion.figure>

        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? { y: 0 } : { y: [0, -6, 0] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 3.8, ease: 'easeInOut', repeat: Infinity }}
          className="absolute bottom-[-2%] left-[-4%] z-40 h-[92px] w-[170px] sm:bottom-[-3%] sm:left-[-1%] sm:h-[112px] sm:w-[208px]"
        >
          <img src={capybaraImage} alt="" className="h-full w-full object-contain" />
        </motion.div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { ...spring, delay: .5 }}
          className="absolute bottom-[2%] left-[48%] z-40 rounded-2xl border border-rose/20 bg-[#fffdf7]/95 px-3 py-2 text-[11px] font-medium text-roseDark shadow-sm backdrop-blur-xl sm:bottom-[1%] sm:left-[38%]"
        >
          You got this <Sparkles size={12} className="ml-1 inline-block" aria-hidden="true" />
        </motion.div>
      </div>
    </section>

    <section aria-label="Workout guides" className="grid gap-3 border-t border-line py-7 sm:grid-cols-3 sm:gap-4">
      {guides.map(({ to, icon: Icon, label, detail }, index) => <motion.div
        key={to}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { ...spring, delay: .16 + index * .06 }}
      >
        <Link to={to} className="group flex h-full items-center gap-3 rounded-2xl border border-line/80 bg-[#fffdf9]/70 p-4 transition-colors hover:bg-paper">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blush/75 text-roseDark"><Icon size={17} /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-1 block text-xs text-muted">{detail}</span></span>
          <ArrowRight size={15} className="text-soft transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>)}
    </section>

    <footer className="flex flex-col gap-2 border-t border-line pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>Made for the way you move.</span>
      <span className="flex flex-wrap gap-x-1.5">Photos: <a className="underline decoration-line underline-offset-2" href="https://unsplash.com/photos/woman-exercising-on-yoga-mat-in-living-room-funsezUxxe4" target="_blank" rel="noreferrer">Vitaly Gariev</a>, <a className="underline decoration-line underline-offset-2" href="https://unsplash.com/photos/woman-in-black-sports-bra-EuwD039Svug" target="_blank" rel="noreferrer">Sven Mieke</a>, <a className="underline decoration-line underline-offset-2" href="https://unsplash.com/photos/woman-exercising-with-dumbbell-inside-gym-YFJn6-GZVuw" target="_blank" rel="noreferrer">Jahir Martinez</a> / Unsplash</span>
    </footer>
  </main>;
}
