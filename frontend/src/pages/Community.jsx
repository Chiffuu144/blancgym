import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Camera, Heart, ImagePlus, MessageCircle, Newspaper, Plus, Send, Trash2, UserRound, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Navbar from '../components/Navbar.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function authorId(author) { return String(author?._id || author?.id || ''); }
function displayName(person) { return person?.name && person.name !== person.username ? person.name : `@${person?.username || 'member'}`; }
function formatTime(date) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date)); }
function Avatar({ person, size = 'h-11 w-11' }) {
  return <span className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark`}>{person?.profileImage ? <img src={person.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={18} />}</span>;
}

async function compressImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file.');
  const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read that image.')); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); });
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('Could not open that image.'));
    image.onload = () => { const scale = Math.min(1, 1280 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .72)); };
    image.src = source;
  });
}

export default function Community() {
  const { user, getFeed, createPost, deletePost, reactToPost, addPostComment, getStories, createStory } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyImage, setStoryImage] = useState('');
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [feed, day] = await Promise.all([getFeed(), getStories()]);
      setPosts(feed); setStories(day); setError('');
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [getFeed, getStories]);

  useEffect(() => { refresh(); }, [refresh]);

  const storyPeople = useMemo(() => {
    const latestByAuthor = new Map();
    stories.forEach(story => { const id = authorId(story.author); const existing = latestByAuthor.get(id); if (!existing || new Date(story.createdAt) > new Date(existing.createdAt)) latestByAuthor.set(id, story); });
    return [...latestByAuthor.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [stories]);

  async function choosePostImages(event) {
    const files = [...(event.target.files || [])].slice(0, 4 - images.length);
    try { const values = await Promise.all(files.map(compressImage)); setImages(current => [...current, ...values]); setError(''); }
    catch (requestError) { setError(requestError.message); }
    event.target.value = '';
  }

  async function choosePostVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) { setError('Choose an MP4, WebM, or MOV video.'); event.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { setError('Keep videos under 5 MB and 60 seconds.'); event.target.value = ''; return; }
    const url = URL.createObjectURL(file);
    const metadata = document.createElement('video'); metadata.preload = 'metadata';
    metadata.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (metadata.duration > 60) { setError('Videos can be up to 60 seconds long.'); return; }
      const reader = new FileReader(); reader.onerror = () => setError('Could not read that video.'); reader.onload = () => { setVideo(reader.result); setVideoPreview(URL.createObjectURL(file)); setError(''); }; reader.readAsDataURL(file);
    };
    metadata.onerror = () => { URL.revokeObjectURL(url); setError('Could not open that video.'); };
    metadata.src = url; event.target.value = '';
  }

  async function publishPost(event) {
    event.preventDefault();
    if (!text.trim() && images.length === 0 && !video) return;
    setBusy(true); setError('');
    try { await createPost({ text, images, video }); setText(''); setImages([]); setVideo(''); setVideoPreview(''); await refresh(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function chooseStoryImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setStoryImage(await compressImage(file)); setError(''); }
    catch (requestError) { setError(requestError.message); }
    event.target.value = '';
  }

  async function publishStory(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await createStory({ caption: storyCaption, image: storyImage }); setStoryCaption(''); setStoryImage(''); setShowStoryComposer(false); await refresh(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function handleReaction(post, reaction) {
    try { const updated = await reactToPost(post._id, reaction); setPosts(current => current.map(item => item._id === updated._id ? updated : item)); }
    catch (requestError) { setError(requestError.message); }
  }

  async function publishComment(event, post) {
    event.preventDefault(); const comment = (commentDrafts[post._id] || '').trim(); if (!comment) return;
    try { const updated = await addPostComment(post._id, comment); setPosts(current => current.map(item => item._id === updated._id ? updated : item)); setCommentDrafts(current => ({ ...current, [post._id]: '' })); }
    catch (requestError) { setError(requestError.message); }
  }

  async function removePost(post) {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(post._id); setPosts(current => current.filter(item => item._id !== post._id)); }
    catch (requestError) { setError(requestError.message); }
  }

  const myStory = storyPeople.find(story => authorId(story.author) === String(user?.id));

  return <div className="min-h-screen pb-28 lg:pb-16">
    <Navbar />
    <main className="page-shell max-w-[820px]">
      <Link to="/dashboard" className="mt-7 inline-flex items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={14} /> Back to your space</Link>
      <section className="py-8 sm:py-10"><p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark"><Newspaper size={15} /> Blanc community</p><h1 className="font-display text-4xl font-medium tracking-[-.04em] text-ink sm:text-5xl">A little progress, together.</h1><p className="mt-3 text-sm leading-6 text-muted">Share your movement, celebrate your friends, and check in on their day.</p></section>
      {error && (error.includes('not on the Render backend') ? <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border border-[#e2a7ae] bg-[#fbebeb] px-4 py-4 text-roseDark"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Community is waiting for the Render update</p><p className="mt-1 text-xs leading-5">The latest social API is pushed. Render needs to deploy `blancgym` with `backend` as the root directory.</p><button type="button" onClick={refresh} className="mt-2 text-xs font-semibold underline underline-offset-4">Try again</button></div></div> : <p role="alert" className="mb-4 rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-4 py-3 text-sm text-roseDark">{error}</p>)}

      <GlassCard className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3"><Avatar person={user} size="h-10 w-10" /><div><p className="text-sm font-semibold text-ink">Your day</p><p className="text-xs text-muted">Stories disappear after 24 hours.</p></div><button type="button" onClick={() => setShowStoryComposer(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-2 text-xs font-semibold text-roseDark"><Plus size={15} /> Add to my day</button></div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button type="button" onClick={() => myStory && setActiveStory(myStory)} className="w-[74px] shrink-0 text-center"><span className={`mx-auto grid h-[62px] w-[62px] place-items-center rounded-full p-[3px] ${myStory ? 'bg-gradient-to-tr from-roseDark to-rose' : 'border-2 border-dashed border-rose'}`}><span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-paper bg-blush text-roseDark">{myStory?.image ? <img src={myStory.image} alt="" className="h-full w-full object-cover" /> : user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={20} />}{!myStory && <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-roseDark text-white"><Plus size={12} /></span>}</span></span><span className="mt-1 block truncate text-[11px] text-muted">Your day</span></button>
          {storyPeople.filter(story => authorId(story.author) !== String(user?.id)).map(story => <button key={story._id} type="button" onClick={() => setActiveStory(story)} className="w-[74px] shrink-0 text-center"><span className="mx-auto grid h-[62px] w-[62px] place-items-center rounded-full bg-gradient-to-tr from-roseDark to-rose p-[3px]"><span className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-paper bg-blush"><Avatar person={story.author} size="h-full w-full" /></span></span><span className="mt-1 block truncate text-[11px] text-muted">{story.author?.username || 'Friend'}</span></button>)}
        </div>
      </GlassCard>

      <GlassCard className="mb-5 p-4 sm:p-5">
        <form id="post-composer" onSubmit={publishPost}>
          <div className="flex items-start gap-3"><Avatar person={user} size="h-10 w-10" /><label className="min-w-0 flex-1"><span className="sr-only">Write a community post</span><textarea className="field min-h-[88px] resize-y border-0 bg-cream/65 px-4 py-3 text-sm focus:ring-2 focus:ring-rose/50" value={text} onChange={event => setText(event.target.value)} maxLength={1000} placeholder="Share a workout, a small win, or a little encouragement..." /></label></div>
          {images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{images.map((image, index) => <div key={index} className="relative aspect-square overflow-hidden rounded-xl"><img src={image} alt={`Post attachment ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => setImages(current => current.filter((_, i) => i !== index))} aria-label="Remove photo" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink"><X size={14} /></button></div>)}</div>}
          {videoPreview && <div className="relative mt-3 mx-auto max-w-[260px] overflow-hidden rounded-xl bg-ink"><video src={videoPreview} controls playsInline className="max-h-80 w-full object-contain" /><button type="button" onClick={() => { setVideo(''); setVideoPreview(''); }} aria-label="Remove video" className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"><X size={14} /></button></div>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted hover:bg-cream hover:text-roseDark"><ImagePlus size={16} /> Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={choosePostImages} disabled={images.length >= 4 || Boolean(video)} /></label><label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted hover:bg-cream hover:text-roseDark"><Video size={16} /> Add reel<input type="file" accept="video/mp4,video/webm,video/quicktime" capture="environment" className="sr-only" onChange={choosePostVideo} disabled={images.length > 0} /></label><span className="ml-auto mr-2 text-[10px] text-muted">{text.length}/1000</span><button disabled={busy || (!text.trim() && images.length === 0 && !video)} className="inline-flex items-center gap-2 rounded-full bg-roseDark px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? 'Posting...' : 'Share post'}<Send size={14} /></button></div>
        </form>
      </GlassCard>

      {loading ? <LoadingScreen message="Gathering your community..." compact /> : posts.length === 0 ? <GlassCard className="p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blush text-roseDark"><Heart size={23} /></span><h2 className="mt-4 font-display text-xl font-medium text-ink">Your feed starts with a hello.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Add friends to see their workout check-ins, or share your first post above.</p><Link to="/friends" className="mt-5 inline-flex items-center gap-2 rounded-full bg-roseDark px-4 py-2.5 text-xs font-semibold text-white">Find friends <Plus size={14} /></Link></GlassCard> : <div className="space-y-5">{posts.map(post => {
        const own = authorId(post.author) === String(user?.id);
        const mine = post.reactions?.find(item => authorId(item.user) === String(user?.id))?.type;

        return <GlassCard key={post._id} className="overflow-hidden p-0">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-5"><Link to={`/u/${post.author?.username}`}><Avatar person={post.author} size="h-10 w-10" /></Link><div className="min-w-0 flex-1"><Link to={`/u/${post.author?.username}`} className="block truncate text-sm font-semibold text-ink hover:text-roseDark">{displayName(post.author)}</Link><p className="text-[11px] text-muted">@{post.author?.username} · {formatTime(post.createdAt)}</p></div>{own && <button type="button" onClick={() => removePost(post)} className="rounded-full p-2 text-muted hover:bg-blush hover:text-roseDark" aria-label="Delete post"><Trash2 size={15} /></button>}</div>
          {post.text && <p className="whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-6 text-ink sm:px-5">{post.text}</p>}
          {post.images?.length > 0 && <div className={`grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{post.images.map((image, index) => <img key={index} src={image} alt={`Photo shared by ${post.author?.username}`} className={`${post.images.length === 1 ? 'max-h-[620px]' : 'aspect-square'} w-full bg-cream object-cover`} loading="lazy" />)}</div>}
          {post.video && <video src={post.video} controls playsInline preload="metadata" className="mx-auto max-h-[75vh] w-full bg-black object-contain" />}
          <div className="px-4 pt-3 sm:px-5">
            <div className="flex items-center gap-2 border-y border-line py-2"><ReactionBar reactions={post.reactions || []} myReaction={mine} onReact={reaction => handleReaction(post, reaction)} /><span className="inline-flex shrink-0 items-center gap-1.5 px-2 text-[11px] text-muted"><MessageCircle size={14} /> {post.comments?.length || 0}</span></div>
            {post.comments?.length > 0 && <div className="max-h-60 space-y-2 overflow-y-auto py-3">{post.comments.map(comment => <div key={comment._id} className="flex items-start gap-2.5"><Link to={'/u/' + comment.author?.username} className="shrink-0"><Avatar person={comment.author} size="h-8 w-8" /></Link><p className="min-w-0 break-words pt-1 text-xs leading-5 text-ink"><Link to={'/u/' + comment.author?.username} className="font-semibold hover:text-roseDark">{displayName(comment.author)}</Link><span className="ml-2 text-muted">{comment.text}</span></p></div>)}</div>}
            <form onSubmit={event => publishComment(event, post)} className="flex items-center gap-2 py-3"><Avatar person={user} size="h-8 w-8" /><input className="field h-10 min-w-0 flex-1 rounded-full bg-cream/60 px-4 text-xs" maxLength={500} value={commentDrafts[post._id] || ''} onChange={event => setCommentDrafts(current => ({ ...current, [post._id]: event.target.value }))} placeholder="Write a kind comment..." /><button disabled={!(commentDrafts[post._id] || '').trim()} aria-label="Post comment" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-roseDark hover:bg-blush disabled:opacity-40"><Send size={15} /></button></form>
          </div>
        </GlassCard>;
      })}</div>}
    </main>

    <AnimatePresence>{showStoryComposer && <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) setShowStoryComposer(false); }}><motion.div role="dialog" aria-modal="true" aria-labelledby="story-composer-title" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} className="w-full max-w-md rounded-3xl bg-paper p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-roseDark">My day · 24 hours</p><h2 id="story-composer-title" className="mt-1 font-display text-xl font-medium text-ink">Share today's movement</h2></div><button type="button" onClick={() => setShowStoryComposer(false)} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-cream"><X size={18} /></button></div><form onSubmit={publishStory} className="mt-5 space-y-4"><label className="block text-xs font-medium text-ink">A short check-in<textarea className="field mt-2 min-h-24 resize-y" value={storyCaption} onChange={event => setStoryCaption(event.target.value)} maxLength={240} placeholder="Finished a walk, got to the gym, or showed up for myself today..." /></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-cream/50 px-4 py-4 text-xs font-medium text-muted hover:bg-blush"><Camera size={16} />{storyImage ? 'Change story photo' : 'Add a story photo'}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={chooseStoryImage} /></label>{storyImage && <img src={storyImage} alt="Story preview" className="max-h-64 w-full rounded-2xl object-cover" />}<p className="text-[11px] leading-5 text-muted">Your story is shared with your friends and expires automatically after 24 hours.</p><button disabled={busy || (!storyCaption.trim() && !storyImage)} className="w-full rounded-xl bg-roseDark px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Sharing...' : 'Share my day'}</button></form></motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{activeStory && <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/85 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) setActiveStory(null); }}><motion.article role="dialog" aria-modal="true" aria-label={`${activeStory.author?.username || 'Friend'}'s story`} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} className="relative flex max-h-[88vh] min-h-[300px] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl">{activeStory.image && <img src={activeStory.image} alt="Shared daily activity" className="min-h-0 flex-1 bg-ink object-contain" />}<div className="absolute left-0 right-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 text-white"><Avatar person={activeStory.author} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{displayName(activeStory.author)}</p><p className="text-[10px] text-white/75">{formatTime(activeStory.createdAt)}</p></div><button type="button" aria-label="Close story" onClick={() => setActiveStory(null)} className="rounded-full bg-black/25 p-2"><X size={17} /></button></div>{activeStory.caption && <p className="whitespace-pre-wrap p-5 text-sm leading-6 text-ink">{activeStory.caption}</p>}</motion.article></motion.div>}</AnimatePresence>
  </div>;
}
