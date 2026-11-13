import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Grid3X3, ImagePlus, Plus, Save, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import GlassCard from '../components/GlassCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const goals = [['fat-loss', 'Lose weight'], ['build-muscle', 'Build muscle'], ['maintain-weight', 'Maintain weight']];

function readImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Choose an image file.'));
    const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => { const image = new Image(); image.onerror = () => reject(new Error('Could not open that image.')); image.onload = () => { const scale = Math.min(1, maxSize / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .72)); }; image.src = reader.result; };
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, updateProfile, getSocialProfile } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', gender: user?.gender || 'Female', age: user?.age || '', weightKg: user?.weightKg || '', heightCm: user?.heightCm || '', experience: user?.experience || 'starting', workoutFrequency: user?.workoutFrequency || '1-2', goal: user?.goal || 'maintain-weight' });
  const [photo, setPhoto] = useState(user?.profileImage || '');
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [overview, setOverview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refreshOverview = useCallback(async () => {
    try { const result = await getSocialProfile(user?.username); setOverview(result); setFeaturedPhotos(result.profile.featuredPhotos || []); setPhoto(result.profile.profileImage || ''); }
    catch (requestError) { if (requestError.message !== 'Profile not found.') setError(requestError.message); }
  }, [getSocialProfile, user?.username]);
  useEffect(() => { refreshOverview(); }, [refreshOverview]);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await updateProfile({ ...form, age: Number(form.age), weightKg: Number(form.weightKg), heightCm: Number(form.heightCm), profileImage: photo, featuredPhotos });
      setMessage('Your profile and featured photos have been saved.'); await refreshOverview();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function choosePhoto(event) { try { setPhoto(await readImage(event.target.files?.[0], 900)); setError(''); } catch (requestError) { setError(requestError.message); } event.target.value = ''; }
  async function addFeatured(event) {
    const files = [...(event.target.files || [])].slice(0, 4 - featuredPhotos.length);
    try { const images = await Promise.all(files.map(file => readImage(file, 1000))); setFeaturedPhotos(current => [...current, ...images].slice(0, 4)); setError(''); }
    catch (requestError) { setError(requestError.message); }
    event.target.value = '';
  }
  const field = (label, key, type = 'text') => <label className="block text-xs font-medium text-ink">{label}<input className="field mt-2" type={type} value={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} required /></label>;
  const posts = overview?.posts || [];

  return <div className="min-h-screen pb-28 lg:pb-16"><Navbar /><main className="page-shell">
    <Link to="/community" className="mt-8 inline-flex items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={14} /> Back to your feed</Link>
    <header className="py-8 sm:py-10"><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark">Your account</p><h1 className="mt-2 font-display text-4xl font-medium tracking-[-.04em] text-ink">Your profile</h1><p className="mt-2 text-sm text-muted">See your community profile and update your details.</p></header>

    <GlassCard className="mb-6 p-5 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rose/40 bg-blush text-roseDark sm:h-28 sm:w-28">{photo ? <img src={photo} alt="Your profile" className="h-full w-full object-cover" /> : <UserRound size={36} />}</div>
        <div className="min-w-0 flex-1"><h2 className="truncate font-display text-2xl font-medium text-ink">{user?.name || user?.username}</h2><p className="mt-1 text-sm text-muted">@{user?.username}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span><strong className="text-ink">{overview?.stats?.posts ?? '—'}</strong> <span className="text-muted">posts</span></span><span><strong className="text-ink">{overview?.stats?.followers ?? '—'}</strong> <span className="text-muted">followers</span></span><span><strong className="text-ink">{overview?.stats?.following ?? '—'}</strong> <span className="text-muted">following</span></span></div></div>
        <Link to="/community#post-composer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-roseDark px-4 py-2.5 text-xs font-semibold text-white"><Plus size={15} /> Create post</Link>
      </div>
      <div className="mt-6 border-t border-line pt-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-roseDark">Featured photos</p><p className="mt-1 text-xs text-muted">Pin up to 4 moments to your profile.</p></div><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-cream"><ImagePlus size={14} /> Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={addFeatured} disabled={featuredPhotos.length >= 4} /></label></div>
        {featuredPhotos.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{featuredPhotos.map((image, index) => <div key={`${index}-${image.slice(-20)}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream"><img src={image} alt={`Featured moment ${index + 1}`} className="h-full w-full object-cover" /><button type="button" aria-label="Remove featured photo" onClick={() => setFeaturedPhotos(current => current.filter((_, i) => i !== index))} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><X size={14} /></button></div>)}</div> : <div className="rounded-2xl bg-cream/50 px-4 py-5 text-center text-xs text-muted">Your featured photos will show up here.</div>}
      </div>
    </GlassCard>

    <GlassCard className="mb-6 p-5 sm:p-7"><div className="mb-4 flex items-center gap-2"><Grid3X3 size={16} className="text-roseDark" /><h2 className="font-display text-xl font-medium text-ink">Your posts</h2></div>
      {overview ? posts.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{posts.map(post => <Link key={post._id} to={post.video ? '/reels' : '/community'} className="relative aspect-square overflow-hidden rounded-2xl bg-cream">{post.images?.[0] ? <img src={post.images[0]} alt="Your post" className="h-full w-full object-cover" /> : post.video ? <video src={post.video} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center p-4 text-center text-xs text-muted">{post.text}</span>}{post.video && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white">Reel</span>}{post.images?.length > 1 && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white">+{post.images.length - 1}</span>}</Link>)}</div> : <div className="rounded-2xl bg-cream/50 px-4 py-8 text-center"><p className="text-sm font-medium text-ink">No posts yet.</p><Link to="/community#post-composer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-roseDark"><Plus size={14} /> Create your first post</Link></div> : <LoadingScreen message="Loading your posts..." compact />}
    </GlassCard>

    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><GlassCard className="flex flex-col items-center p-8"><div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border border-line bg-blush text-roseDark">{photo ? <img src={photo} alt="Profile preview" className="h-full w-full object-cover" /> : <UserRound size={40} />}</div><label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-medium text-ink hover:bg-cream"><Camera size={15} /> Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto} /></label><p className="mt-3 text-center text-xs text-muted">Your photo stays with your profile.</p></GlassCard>
      <GlassCard className="space-y-5 p-6 sm:p-8"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-roseDark">Edit your details</p><p className="mt-1 text-xs text-muted">Your daily calorie estimate refreshes when profile details or goals change.</p></div>{field('Username', 'username')}<div className="grid gap-4 sm:grid-cols-2">{field('Age', 'age', 'number')}{field('Weight (kg)', 'weightKg', 'number')}{field('Height (cm)', 'heightCm', 'number')}<label className="block text-xs font-medium">Gender<select className="field mt-2" value={form.gender} onChange={event => setForm(current => ({ ...current, gender: event.target.value }))}><option>Female</option><option>Male</option></select></label></div><div><p className="text-xs font-semibold text-ink">Current goal</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{goals.map(([value, label]) => <button type="button" key={value} aria-pressed={form.goal === value} onClick={() => setForm(current => ({ ...current, goal: value }))} className={`rounded-xl border px-3 py-3 text-left text-xs ${form.goal === value ? 'border-rose bg-blush font-semibold text-roseDark' : 'border-line bg-cream/50 text-muted'}`}>{label}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-medium">Experience<select className="field mt-2" value={form.experience} onChange={event => setForm(current => ({ ...current, experience: event.target.value }))}><option value="starting">Just starting</option><option value="6-months">6+ months</option><option value="2-years">2+ years</option></select></label><label className="block text-xs font-medium">Weekly movement<select className="field mt-2" value={form.workoutFrequency} onChange={event => setForm(current => ({ ...current, workoutFrequency: event.target.value }))}><option value="1-2">1–2 days</option><option value="3-5">3–5 days</option><option value="daily">Daily</option></select></label></div>{error && <p role="alert" className="rounded-xl bg-blush px-3 py-2.5 text-xs text-roseDark">{error}</p>}{message && <p role="status" className="rounded-xl bg-cream px-3 py-2.5 text-xs text-roseDark">{message}</p>}<button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-roseDark px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{busy ? 'Saving...' : 'Save changes'}</button></GlassCard>
    </form>
  </main></div>;
}
