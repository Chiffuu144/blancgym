import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Grid3X3, UserRound, UserRoundPlus, UserRoundX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Avatar({ profile }) {
  return <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rose/40 bg-blush text-roseDark sm:h-28 sm:w-28">{profile?.profileImage ? <img src={profile.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={36} />}</div>;
}

export default function SocialProfile() {
  const { username = '' } = useParams();
  const { getSocialProfile, followUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await getSocialProfile(username)); setError(''); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [getSocialProfile, username]);
  useEffect(() => { refresh(); }, [refresh]);

  async function toggleFollow() {
    setBusy(true); setError('');
    try { await followUser(username); await refresh(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen pb-28 lg:pb-16"><Navbar /><main className="page-shell max-w-[900px]">
    <Link to="/community" className="mt-8 inline-flex items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={14} /> Back to your feed</Link>
    {loading ? <div className="mt-8"><LoadingScreen message="Opening profile..." compact /></div> : error ? <p role="alert" className="mt-6 rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-4 py-3 text-sm text-roseDark">{error}</p> : data && <>
      <GlassCard className="mt-6 p-5 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><Avatar profile={data.profile} /><div className="min-w-0 flex-1"><h1 className="truncate font-display text-2xl font-medium text-ink">{data.profile.name || `@${data.profile.username}`}</h1><p className="mt-1 text-sm text-muted">@{data.profile.username}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span><strong>{data.stats.posts}</strong> <span className="text-muted">posts</span></span><span><strong>{data.stats.followers}</strong> <span className="text-muted">followers</span></span><span><strong>{data.stats.following}</strong> <span className="text-muted">following</span></span></div></div>{!data.isOwnProfile && <button type="button" disabled={busy || data.isFriend || data.hasSentFriendRequest || data.hasIncomingFriendRequest} onClick={toggleFollow} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold disabled:opacity-65 ${data.isFriend || data.hasSentFriendRequest || data.hasIncomingFriendRequest ? 'border border-line bg-cream text-ink' : 'bg-roseDark text-white'}`}>{data.isFriend ? <UserRoundX size={15} /> : <UserRoundPlus size={15} />}{data.isFriend ? 'Friends' : data.hasSentFriendRequest ? 'Request sent' : data.hasIncomingFriendRequest ? 'Respond in Friends' : 'Add friend'}</button>}</div>
        {data.profile.featuredPhotos?.length > 0 && <div className="mt-6 border-t border-line pt-5"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.15em] text-roseDark">Featured photos</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{data.profile.featuredPhotos.map((photo, index) => <img key={index} src={photo} alt={`Featured moment ${index + 1}`} className="aspect-square w-full rounded-2xl bg-cream object-cover" />)}</div></div>}
      </GlassCard>
      <section className="mt-6"><div className="mb-4 flex items-center gap-2"><Grid3X3 size={16} className="text-roseDark" /><h2 className="font-display text-xl font-medium text-ink">Posts</h2></div>{data.posts.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{data.posts.map(post => <Link key={post._id} to={post.video ? '/reels' : '/community'} className="relative aspect-square overflow-hidden rounded-2xl bg-paper">{post.images?.[0] ? <img src={post.images[0]} alt={`Post by ${data.profile.username}`} className="h-full w-full object-cover" /> : post.video ? <video src={post.video} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <p className="grid h-full place-items-center overflow-hidden p-4 text-center text-xs leading-5 text-ink">{post.text}</p>}{post.video && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white">Reel</span>}</Link>)}</div> : <GlassCard className="p-8 text-center text-sm text-muted">No posts yet.</GlassCard>}</section>
    </>}
  </main></div>;
}
