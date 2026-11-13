import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, ArrowLeft, Check, Plus, Trash2, Utensils, AlertTriangle, ImagePlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalorieProgressBar from '../components/CalorieProgressBar.jsx';
import GlassCard from '../components/GlassCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { localDateKey } from '../utils/dateKey.js';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
const foodCategories = ['Rice', 'Ulam', 'Other'];
const foodIdeas = [
  { name: 'Eggs', foodCategory: 'Ulam', note: 'Protein' },
  { name: 'Chicken', foodCategory: 'Ulam', note: 'Protein' },
  { name: 'Fish', foodCategory: 'Ulam', note: 'Protein' },
  { name: 'Tofu or beans', foodCategory: 'Ulam', note: 'Plant protein' },
  { name: 'Vegetables', foodCategory: 'Other', note: 'Add variety' },
  { name: 'Brown rice', foodCategory: 'Rice', note: 'Whole-grain option' }
];
const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function NutritionTracker() {
  const { user, getNutrition, addMeal, removeMeal } = useAuth();
  const date = useMemo(() => localDateKey(), []);
  const [nutrition, setNutrition] = useState(null);
  const [form, setForm] = useState({ mealType: 'Breakfast', foodCategory: 'Ulam', name: '', calories: '', proteinGrams: '', healthyChoice: false, photos: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [calorieWarning, setCalorieWarning] = useState(null);
  const warningDialog = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setNutrition(await getNutrition(date));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [date, getNutrition]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (calorieWarning && warningDialog.current && !warningDialog.current.open) warningDialog.current.showModal();
  }, [calorieWarning]);

  async function saveMeal() {
    setError('');
    setSaving(true);
    try {
      await addMeal({ ...form, calories: Number(form.calories), proteinGrams: Number(form.proteinGrams || 0), date });
      setForm(current => ({ ...current, name: '', calories: '', proteinGrams: '', healthyChoice: false, photos: [] }));
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitMeal(event) {
    event.preventDefault();
    const target = nutrition?.targetCalories || user?.targetDailyCalories || 0;
    const over = (nutrition?.caloriesConsumed || 0) + Number(form.calories) - target;
    if (target && over > 0) { setCalorieWarning({ extra: over, target, meal: form.name }); return; }
    await saveMeal();
  }

  function closeCalorieWarning() { setCalorieWarning(null); }

  async function logOverTargetMeal() { closeCalorieWarning(); await saveMeal(); }

  async function addPhotos(event) {
    const files = [...(event.target.files || [])].slice(0, 4 - form.photos.length);
    const photos = await Promise.all(files.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read that photo.')); reader.onload = () => { const image = new Image(); image.onload = () => { const scale = Math.min(1, 1100 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .72)); }; image.onerror = () => reject(new Error('Could not open that photo.')); image.src = reader.result; }; reader.readAsDataURL(file); })));
    setForm(current => ({ ...current, photos: [...current.photos, ...photos] })); event.target.value = '';
  }

  async function deleteMeal(id) {
    setError('');
    try {
      await removeMeal(id);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const meals = nutrition?.meals || [];
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

  return <div className="min-h-screen pb-28 lg:pb-16">
    <dialog ref={warningDialog} className="calorie-warning-dialog" aria-labelledby="calorie-warning-title" aria-describedby="calorie-warning-description" onCancel={event => { event.preventDefault(); closeCalorieWarning(); }} onClick={event => { if (event.target === warningDialog.current) closeCalorieWarning(); }}>
      <AnimatePresence onExitComplete={() => { if (!calorieWarning && warningDialog.current?.open) warningDialog.current.close(); }}>
        {calorieWarning && <motion.div key="calorie-warning" initial={{ opacity: 0, scale: .96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98, y: 5 }} transition={{ duration: .24, ease: [.23, 1, .32, 1] }} className="calorie-warning-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-start gap-4"><motion.span initial={{ opacity: 0, scale: .86, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .22, ease: [.23, 1, .32, 1] }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><AlertTriangle size={20} /></motion.span><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-amber-800">Daily calorie estimate</p><h2 id="calorie-warning-title" className="mt-1 font-display text-xl font-semibold leading-snug text-ink">This meal puts you over today&apos;s estimate</h2></div></div>
          <p id="calorie-warning-description" className="mt-4 text-sm leading-6 text-muted">Logging <span className="font-semibold text-ink">{calorieWarning?.meal}</span> would put you about <span className="font-semibold text-amber-900">{calorieWarning?.extra.toLocaleString()} kcal</span> over your {calorieWarning?.target.toLocaleString()} kcal estimate. Estimates can vary. Would you still like to log it?</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2"><button type="button" autoFocus onClick={closeCalorieWarning} className="rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink hover:bg-cream">Go back</button><button type="button" disabled={saving} onClick={logOverTargetMeal} className="rounded-xl bg-amber-800 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60">{saving ? 'Logging meal...' : 'Log meal anyway'}</button></div>
        </motion.div>}
      </AnimatePresence>
    </dialog>
    <Navbar />
    <main className="page-shell">
      <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-xs text-muted motion-safe-hover hover:text-ink"><ArrowLeft size={14} /> Back to your space</Link>

      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="py-10 sm:py-14">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark"><Apple size={14} /> Daily nutrition</p>
        <h1 className="font-display text-4xl font-medium tracking-[-.04em] text-ink sm:text-5xl">Eat with a little more awareness.</h1>
        <p className="mt-3 text-sm text-muted">{formattedDate} <span className="px-1 text-roseDark">/</span> {user?.username ? `@${user.username}` : user?.name}</p>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <div className="space-y-5">
          <GlassCard className="nutrition-target-card flex flex-col items-center gap-5 p-6 sm:flex-row sm:justify-between sm:p-7">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Your daily estimate</p>
              <p className="mt-2 font-display text-2xl font-medium text-ink">{Number(nutrition?.targetCalories || user?.targetDailyCalories || 0).toLocaleString()} kcal</p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-muted">A starting estimate based on your profile, activity, and goal. Your actual needs can vary.</p>
            </div>
            <CalorieProgressBar consumed={nutrition?.caloriesConsumed || 0} target={nutrition?.targetCalories || user?.targetDailyCalories || 0} size={150} />
          </GlassCard>

          <GlassCard className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Daily protein goal</p><h2 className="mt-2 font-display text-2xl font-medium text-ink">{nutrition?.proteinConsumed || 0} <span className="text-base text-muted">/ {nutrition?.proteinTarget || Math.round((user?.weightKg || 0) * (user?.goal === 'build-muscle' ? 1.6 : user?.goal === 'fat-loss' ? 1.4 : 1.2))} g</span></h2></div>
              <span className="rounded-xl bg-blush px-3 py-2 text-xs font-semibold text-roseDark">Protein</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-cream"><motion.div initial={false} animate={{ width: `${Math.min(100, Math.round(((nutrition?.proteinConsumed || 0) / Math.max(1, nutrition?.proteinTarget || 1)) * 100))}%` }} transition={{ duration: .35, ease: [.23, 1, .32, 1] }} className="h-full rounded-full bg-roseDark" /></div>
            <p className="mt-2 text-xs leading-5 text-muted">Estimated from your body weight and goal. Add protein grams to each meal to track your progress; individual needs vary.</p>
          </GlassCard>

          <GlassCard className="nutrition-form-card p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blush text-roseDark"><Plus size={18} /></span>
              <div><h2 className="font-display text-xl font-medium text-ink">Log a meal</h2><p className="mt-0.5 text-xs text-muted">Add a meal to today's total.</p></div>
            </div>
            <form onSubmit={submitMeal} className="space-y-4">
              <label className="block text-xs font-medium text-ink">Meal
                <select className="field mt-2" value={form.mealType} onChange={event => setForm(current => ({ ...current, mealType: event.target.value }))}>
                  {mealTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium text-ink">Food group
                <select className="field mt-2" value={form.foodCategory} onChange={event => setForm(current => ({ ...current, foodCategory: event.target.value }))}>
                  {foodCategories.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium text-ink">What did you have?
                <input className="field mt-2" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} maxLength={80} placeholder="e.g. Oatmeal with berries" required />
              </label>
              <label className="block text-xs font-medium text-ink">Calories
                <input className="field mt-2" type="number" inputMode="numeric" min="1" max="10000" step="1" value={form.calories} onChange={event => setForm(current => ({ ...current, calories: event.target.value }))} placeholder="350" required />
              </label>
              <label className="block text-xs font-medium text-ink">Protein (grams)
                <input className="field mt-2" type="number" inputMode="decimal" min="0" max="300" step="0.1" value={form.proteinGrams} onChange={event => setForm(current => ({ ...current, proteinGrams: event.target.value }))} placeholder="e.g. 25" />
              </label>
              <div><p className="text-xs font-medium text-ink">Meal photos <span className="font-normal text-muted">(up to 4)</span></p><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-cream/40 px-4 py-4 text-xs text-muted hover:bg-cream"><ImagePlus size={16} /> Take or upload meal photos<input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={addPhotos} disabled={form.photos.length >= 4} /></label><p className="mt-1.5 text-[11px] leading-4 text-muted">Photos are saved with the meal. Enter the calories manually above.</p>{form.photos.length > 0 && <div className="mt-3 flex gap-2">{form.photos.map((photo, index) => <div key={index} className="relative h-16 w-16 overflow-hidden rounded-lg"><img src={photo} alt={`Meal photo ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => setForm(current => ({ ...current, photos: current.photos.filter((_, i) => i !== index) }))} className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-1" aria-label="Remove photo"><X size={12} /></button></div>)}</div>}</div>
              <button type="button" role="switch" aria-checked={form.healthyChoice} onClick={() => setForm(current => ({ ...current, healthyChoice: !current.healthyChoice }))} className="flex w-full items-center justify-between rounded-xl border border-line bg-cream/55 px-4 py-3 text-left">
                <span><span className="block text-xs font-medium text-ink">Healthy choice?</span><span className="mt-1 block text-[11px] text-muted">A personal check-in, without judgment.</span></span>
                <span className={`relative h-6 w-11 rounded-full motion-safe-hover ${form.healthyChoice ? 'bg-rose' : 'bg-line'}`}>
                  <motion.span animate={{ x: form.healthyChoice ? 20 : 2 }} transition={spring} className="absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow-sm" />
                </span>
              </button>
              {error && <p role="alert" className="rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-3 py-2.5 text-xs text-roseDark">{error}</p>}
              <motion.button whileTap={{ scale: .985 }} transition={spring} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-roseDark px-4 py-3 text-sm font-semibold text-paper motion-safe-hover hover:bg-ink disabled:opacity-60">
                <Plus size={16} /> {saving ? 'Saving meal...' : 'Add meal'}
              </motion.button>
            </form>
          </GlassCard>
          <GlassCard className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">A few ideas</p>
            <h2 className="mt-1 font-display text-xl font-medium text-ink">Build a plate that works for you.</h2>
            <p className="mt-2 text-xs leading-5 text-muted">Try a protein food such as eggs, fish, chicken, tofu, beans, or lentils, alongside vegetables and a grain you enjoy.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {foodIdeas.map(idea => <button type="button" key={idea.name} onClick={() => setForm(current => ({ ...current, name: idea.name, foodCategory: idea.foodCategory }))} className="rounded-full border border-line bg-cream/70 px-3 py-2 text-left text-xs text-ink transition-colors hover:bg-blush">
                {idea.name} <span className="text-muted">&middot; {idea.note}</span>
              </button>)}
            </div>
            <a className="mt-4 inline-block text-[11px] text-roseDark underline decoration-line underline-offset-4" href="https://www.myplate.gov/sites/default/files/2024-08/MyPlate-Planning-For-Savings-Leftover-Edition.pdf" target="_blank" rel="noreferrer">More food-group ideas from USDA MyPlate</a>
          </GlassCard>
        </div>

        <GlassCard className="nutrition-log-card p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Today's log</p><h2 className="mt-1 font-display text-2xl font-medium text-ink">Meals & moments</h2></div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-muted"><Utensils size={18} /></span>
          </div>

          {loading
            ? <LoadingScreen message="Gathering today's meals..." compact />
            : foodCategories.map(category => {
              const entries = meals.filter(meal => (meal.foodCategory || 'Other') === category);
              return <section key={category} className="border-b border-line py-5 last:border-b-0">
                <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-ink">{category}</h3><span className="text-xs tabular-nums text-muted">{entries.reduce((sum, item) => sum + item.calories, 0).toLocaleString()} kcal</span></div>
                {entries.length === 0
                  ? <p className="text-xs text-muted">Nothing logged here yet.</p>
                  : <ul className="space-y-3">{entries.map(meal => <li key={meal._id} className="flex items-start gap-3 rounded-xl bg-cream/60 p-3">
                    <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${meal.healthyChoice ? 'bg-blush text-roseDark' : 'bg-paper text-muted'}`}>{meal.healthyChoice ? <Check size={14} /> : <Utensils size={13} />}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{meal.name}</p><p className="mt-1 text-xs text-muted">{meal.mealType} &middot; {meal.calories.toLocaleString()} kcal{meal.proteinGrams > 0 ? ` &middot; ${meal.proteinGrams} g protein` : ''}{meal.healthyChoice ? ' / healthy choice' : ''}</p>{meal.photos?.map((photo, index) => <img key={index} src={photo} alt={`${meal.name} photo ${index + 1}`} className="mt-2 mr-1 inline-block h-12 w-12 rounded-lg object-cover" />)}</div>
                    <button type="button" onClick={() => deleteMeal(meal._id)} aria-label={`Remove ${meal.name}`} className="rounded-lg p-2 text-muted hover:bg-blush hover:text-roseDark"><Trash2 size={14} /></button>
                  </li>)}</ul>}
              </section>;
            })}

          {!loading && <AnimatePresence initial={false}>
            {nutrition && nutrition.caloriesConsumed > nutrition.targetCalories && <motion.div key="calorie-over-limit" role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .22, ease: [.23, 1, .32, 1] }} className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-950">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><AlertTriangle size={16} /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-amber-800">Daily estimate exceeded</p><span className="rounded-full border border-amber-300/80 bg-white/60 px-2.5 py-1 text-[10px] font-semibold text-amber-900">Check-in</span></div>
                <p className="mt-1.5 text-sm font-medium leading-5">You are <span className="font-bold tabular-nums">{(nutrition.caloriesConsumed - nutrition.targetCalories).toLocaleString()} kcal</span> above today&apos;s estimate.</p>
                <p className="mt-1 text-xs leading-5 text-amber-900/80">This number is a guide, not a judgment. You can return to your usual routine whenever you are ready.</p>
              </div>
            </motion.div>}
          </AnimatePresence>}
          {!loading && meals.length === 0 && <p className="mt-3 text-xs leading-5 text-muted">Add your first meal to see it here. Your total updates as you go.</p>}
        </GlassCard>
      </section>
    </main>
  </div>;
}
