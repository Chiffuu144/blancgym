import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Play, Plus, Send, UserRound, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const reactions = [{ type: 'like', emoji: '👍' }, { type: 'heart', emoji: '❤️' }, { type: 'haha', emoji: '😂' }, { type: 'sad', emoji: '😢' }, { type: 'angry', emoji: '😡' }];
const idOf = value => String(value?._id || value?.id || value || '');

function readVideo(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Choose a video first.'));
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) return reject(new Error('Use an MP4, WebM, or MOV video.'));
    if (file.size > 5 * 1024 * 1024) return reject(new Error('Keep your reel under 5 MB so it uploads reliably.'));
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); if (video.duration > 60) return reject(new Error('Reels can be up to 60 seconds long.')); const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read that video.')); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not open that video.')); };
    video.src = url;
  });
}

function Avatar({ person }) {
  return <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark">{person?.profileImage ? <img src={person.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={16} />}</span>;
}

export default function Reels() {
  const { user, getReels, createPost, reactToPost, addPostComment } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [video, setVideo] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try { setReels(await getReels()); setError(''); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [getReels]);
  useEffect(() => { refresh(); }, [refresh]);

  async function chooseVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setVideo(await readVideo(file)); setVideoPreview(URL.createObjectURL(file)); setError(''); }
    catch (requestError) { setError(requestError.message); }
    event.target.value = '';
  }

  async function publish(event) {
    event.preventDefault(); if (!video) return;
    setBusy(true); setError('');
    try { await createPost({ text: caption, images: [], video }); setCaption(''); setVideo(''); setVideoPreview(''); await refresh(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function react(reel, type) {
    try { const updated = await reactToPost(reel._id, type); setReels(current => current.map(item => item._id === updated._id ? updated : item)); }
    catch (requestError) { setError(requestError.message); }
  }

  async function comment(event, reel) {
    event.preventDefault(); const text = (commentDrafts[reel._id] || '').trim(); if (!text) return;
    try { const updated = await addPostComment(reel._id, text); setReels(current => current.map(item => item._id === updated._id ? updated : item)); setCommentDrafts(current => ({ ...current, [reel._id]: '' })); }
    catch (requestError) { setError(requestError.message); }
  }

  return <div className="min-h-screen pb-28 lg:pb-16"><Navbar /><main className="page-shell max-w-[720px]">
    <Link to="/community" className="mt-7 inline-flex items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={14} /> Back to your feed</Link>
    <header className="py-7 sm:py-9"><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark"><Play size={14} /> Reels</p><h1 className="font-display text-4xl font-medium tracking-[-.04em] text-ink sm:text-5xl">Real moves, shared by friends.</h1><p className="mt-3 text-sm leading-6 text-muted">Only videos uploaded by you and your friends show up here.</p></header>

    {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-[#e2a7ae] bg-[#fbebeb] px-4 py-4 text-sm text-roseDark"><Video size={18} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">{error.includes('not on the Render backend') ? 'Community is waiting for the backend update' : 'Something needs attention'}</p><p className="mt-1 text-xs leading-5">{error}</p>{error.includes('not on the Render backend') && <button type="button" onClick={refresh} className="mt-2 text-xs font-semibold underline underline-offset-4">Try again</button>}</div></div>}

    <GlassCard className="mb-5 p-4 sm:p-5"><div className="mb-3 flex items-center gap-3"><Avatar person={user} /><div><p className="text-sm font-semibold text-ink">Share a reel</p><p className="text-xs text-muted">MP4, WebM, or MOV · up to 60 seconds · 5 MB</p></div></div><form onSubmit={publish} className="space-y-3"><textarea className="field min-h-20 resize-y" value={caption} onChange={event => setCaption(event.target.value)} maxLength={1000} placeholder="Add a caption for your movement..." />
      {videoPreview && <div className="relative mx-auto max-w-[280px] overflow-hidden rounded-2xl bg-ink"><video src={videoPreview} controls playsInline className="max-h-[380px] w-full object-contain" /><button type="button" aria-label="Remove video" onClick={() => { setVideo(''); setVideoPreview(''); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"><X size={14} /></button></div>}
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted hover:bg-cream hover:text-roseDark"><Video size={16} />{video ? 'Choose another video' : 'Choose video'}<input type="file" accept="video/mp4,video/webm,video/quicktime" capture="environment" className="sr-only" onChange={chooseVideo} /></label><span className="mr-2 text-[10px] text-muted">{caption.length}/1000</span><button disabled={busy || !video} className="inline-flex items-center gap-2 rounded-full bg-roseDark px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? 'Uploading...' : 'Post reel'}<Send size={14} /></button></div>
    </form></GlassCard>

    {loading ? <LoadingScreen message="Finding your friends' reels..." compact /> : reels.length === 0 ? <GlassCard className="p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blush text-roseDark"><Play size={23} /></span><h2 className="mt-4 font-display text-xl font-medium text-ink">No reels yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Upload your first workout clip above, or add a friend to see their videos here.</p><Link to="/friends?tab=search" className="mt-5 inline-flex items-center gap-2 rounded-full bg-roseDark px-4 py-2.5 text-xs font-semibold text-white"><Plus size={14} /> Find friends</Link></GlassCard> : <div className="space-y-5">{reels.map(reel => {
      const ownReaction = reel.reactions?.find(item => idOf(item.user) === String(user?.id))?.type;
      const reactionCount = reel.reactions?.length || 0;
      return <GlassCard key={reel._id} className="overflow-hidden p-0"><div className="flex items-center gap-3 px-4 py-4 sm:px-5"><Link to={`/u/${reel.author?.username}`}><Avatar person={reel.author} /></Link><div className="min-w-0 flex-1"><Link to={`/u/${reel.author?.username}`} className="block truncate text-sm font-semibold text-ink">{reel.author?.name || `@${reel.author?.username}`}</Link><p className="text-[11px] text-muted">@{reel.author?.username}</p></div></div><video src={reel.video} controls playsInline preload="metadata" className="mx-auto max-h-[70vh] w-full bg-black object-contain" />{reel.text && <p className="whitespace-pre-wrap px-4 pt-4 text-sm leading-6 text-ink sm:px-5">{reel.text}</p>}
        <div className="flex flex-wrap items-center gap-1 px-3 py-3 sm:px-4">{reactions.map(option => <button key={option.type} type="button" onClick={() => react(reel, option.type)} aria-label={option.type} aria-pressed={ownReaction === option.type} className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm ${ownReaction === option.type ? 'bg-blush' : 'hover:bg-cream'}`}>{option.emoji}</button>)}<span className="ml-1 text-[11px] text-muted">{reactionCount} reactions</span><span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted"><MessageCircle size={14} /> {reel.comments?.length || 0}</span></div>
        {reel.comments?.length > 0 && <div className="max-h-40 space-y-2 overflow-y-auto border-t border-line px-4 py-3">{reel.comments.map(item => <p key={item._id} className="break-words text-xs leading-5"><span className="font-semibold text-ink">{item.author?.username || 'friend'}</span><span className="ml-2 text-muted">{item.text}</span></p>)}</div>}
        <form onSubmit={event => comment(event, reel)} className="flex items-center gap-2 border-t border-line px-4 py-3"><input className="field h-10 min-w-0 flex-1 rounded-full bg-cream/60 px-4 text-xs" value={commentDrafts[reel._id] || ''} onChange={event => setCommentDrafts(current => ({ ...current, [reel._id]: event.target.value }))} maxLength={500} placeholder="Comment on this reel..." /><button disabled={!(commentDrafts[reel._id] || '').trim()} aria-label="Send comment" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-roseDark hover:bg-blush disabled:opacity-40"><Send size={15} /></button></form>
      </GlassCard>;
    })}</div>}
  </main></div>;
}
