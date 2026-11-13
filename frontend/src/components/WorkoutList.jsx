import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock3, Dumbbell, Sparkles, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard.jsx';
import LoadingScreen from './LoadingScreen.jsx';
import ExerciseIllustration from './ExerciseIllustration.jsx';
import AnimatedExercise from './AnimatedExercise.jsx';

const spring = { type: 'spring', stiffness: 400, damping: 30 };

function MovementDemo({ exercise }) {
  const [active, setActive] = useState(false); const [seconds, setSeconds] = useState(10);
  const [voiceOn, setVoiceOn] = useState(true); const speechTimers = useRef([]);
  useEffect(() => { if (!active) return undefined; const timer = setInterval(() => setSeconds(value => { if (value <= 1) { clearInterval(timer); setActive(false); return 0; } return value - 1; }), 1000); return () => clearInterval(timer); }, [active]);
  useEffect(() => () => { speechTimers.current.forEach(clearTimeout); window.speechSynthesis?.cancel(); }, []);
  function start() {
    setSeconds(10); setActive(true); speechTimers.current.forEach(clearTimeout); speechTimers.current = [];
    if (voiceOn && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const say = text => { const line = new SpeechSynthesisUtterance(text); line.rate = 0.92; line.pitch = 1.03; const voices = window.speechSynthesis.getVoices(); line.voice = voices.find(voice => /female|woman|samantha|zira|aria/i.test(voice.name)) || voices.find(voice => /^en[-_]/i.test(voice.lang)) || null; window.speechSynthesis.speak(line); };
      say(`${exercise.name}. Get ready. ${exercise.cue} Keep the movement smooth and breathe steadily.`);
      speechTimers.current.push(setTimeout(() => say("Halfway there. Keep your form steady."), 5000));
      speechTimers.current.push(setTimeout(() => say("And relax. Nice work."), 8500));
    }
  }
  function stop() { setActive(false); speechTimers.current.forEach(clearTimeout); speechTimers.current = []; window.speechSynthesis?.cancel(); }
  return <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={active ? stop : start} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-medium text-roseDark hover:bg-blush"><Play size={12} /> {active ? `Stop guide · ${seconds}s` : seconds === 0 ? "Replay 10-second guide" : "Start 10-second guide"}</button><button type="button" onClick={() => setVoiceOn(value => !value)} aria-pressed={voiceOn} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] text-muted hover:bg-blush">{voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}{voiceOn ? "Voice on" : "Voice off"}</button>{active && <div className="mt-1 w-full overflow-hidden rounded-xl bg-[#f7e9e5] p-3"><div className="relative mx-auto h-56 max-w-[300px]"><AnimatedExercise type={exercise.visual} name={exercise.name} /><span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-roseDark">{seconds}s · {exercise.name}</span></div><p className="text-center text-[11px] leading-4 text-ink">{exercise.cue}<span className="mt-1 block text-muted">Watch the movement and follow the spoken cues.</span></p></div>}</div>;
}

export default function WorkoutList({ workouts = [], loading, error }) {
  if (loading) return <LoadingScreen message="Finding your next session..." compact />;
  if (error) return <div role="alert" className="glass rounded-2xl p-6 text-sm text-roseDark">{error}</div>;
  if (!workouts.length) return <div className="glass rounded-2xl p-6 text-sm text-muted">No sessions are available yet. Check back soon.</div>;

  return <div className="grid gap-4 md:grid-cols-2">
    {workouts.map((workout, index) => <GlassCard key={workout._id || workout.title} interactive className="p-6 sm:p-7">
      <div className="mb-6 flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blush text-roseDark"><Dumbbell size={18} /></span>
        <span className="flex items-center gap-1.5 rounded-full border border-line bg-cream/75 px-3 py-1.5 text-xs text-muted"><Clock3 size={13} />{workout.duration}</span>
      </div>

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-roseDark">{workout.muscleGroup || 'Your session'}</p>
      <h2 className="font-display text-2xl font-medium tracking-[-.025em] text-ink">{workout.title}</h2>
      <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted">{workout.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(workout.equipment || []).map(item => <span key={item} className="rounded-full border border-line bg-cream/70 px-3 py-1 text-[11px] text-muted">{item}</span>)}
      </div>

      <div className="my-6 border-t border-line" />

      <div className="space-y-4">
        {workout.exercises?.map((exercise, exerciseIndex) => <motion.div
          key={exercise.name}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: Math.min(index * .05 + exerciseIndex * .04, .22) }}
          className="flex flex-col gap-3 rounded-2xl border border-line/80 bg-paper/55 p-3 sm:flex-row sm:items-center"
        >
          <ExerciseIllustration type={exercise.visual || workout.visual} label={`${exercise.name} illustration`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Check size={14} className="shrink-0 text-roseDark" />{exercise.name}</p>
              <span className="shrink-0 text-right text-xs font-medium text-roseDark">{exercise.sets}{exercise.repsOrDuration && <span className="block font-normal text-muted">{exercise.repsOrDuration}</span>}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">{exercise.cue}</p>
            {exercise.youtubeLink && <a href={exercise.youtubeLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-roseDark underline decoration-line underline-offset-4">Watch exercise video <ArrowUpRight size={12} /></a>}
            <MovementDemo exercise={exercise} />
          </div>
        </motion.div>)}
      </div>

      {workout.isRestDay && <div className="mt-5 rounded-2xl bg-cream/70 p-5"><p className="text-sm font-semibold text-ink">Recovery day</p><p className="mt-1 text-xs leading-5 text-muted">Rest is part of your schedule. Take the day off, or choose gentle movement if that feels good.</p></div>}

      <div className="mt-7 flex items-center gap-2 border-t border-line pt-4 text-xs font-medium text-roseDark">
        <Sparkles size={14} /> Take it at your own pace <ArrowUpRight size={13} className="ml-auto" />
      </div>
    </GlassCard>)}
  </div>;
}
