import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, MessageCircle, Plus, Search, Send, UserMinus, Users, UserRound, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';
import Navbar from '../components/Navbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Avatar({ person, size = 'h-11 w-11' }) {
  return <span className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark`}>{person?.profileImage ? <img src={person.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={18} />}</span>;
}

export default function Friends() {
  const { user, getFriends, getFriendRequests, searchUsers, addFriend, respondFriendRequest, removeFriend, getMessages, sendMessage } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef(null);

  const refreshFriends = useCallback(async () => {
    try {
      const [list, social] = await Promise.all([getFriends(), getFriendRequests()]);
      setFriends(list); setRequests(social.requests); setSentRequests(social.sent); setSuggestions(social.suggestions);
      setSelected(current => current ? list.find(person => person.id === current.id) || null : null);
    }
    catch (requestError) { setError(requestError.message); }
  }, [getFriends, getFriendRequests]);

  useEffect(() => { refreshFriends(); }, [refreshFriends]);
  useEffect(() => { if (tab === 'messages' && friends.length && !selected) setSelected(friends[0]); }, [tab, friends, selected]);

  useEffect(() => {
    let active = true;
    if (!selected) { setMessages([]); return () => { active = false; }; }
    const load = async () => {
      try { const latest = await getMessages(selected.id); if (active) { setMessages(current => current.length === latest.length && current.at(-1)?._id === latest.at(-1)?._id ? current : latest); setError(''); } }
      catch (requestError) { if (active) setError(requestError.message); }
    };
    load();
    const timer = window.setInterval(load, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [selected?.id, getMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  async function findPeople(event) {
    event.preventDefault();
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true); setError('');
    try { setResults(await searchUsers(query.trim())); } catch (requestError) { setError(requestError.message); }
    finally { setSearching(false); }
  }

  async function handleAdd(person) {
    setBusy(true); setError('');
    try { await addFriend(person.id); setResults(current => current.filter(result => result.id !== person.id)); await refreshFriends(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function handleRequest(person, action) {
    setBusy(true); setError('');
    try { await respondFriendRequest(person.id, action); await refreshFriends(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function handleRemove(person) {
    setConfirmation({ title: `Unfriend ${displayName(person)}?`, message: 'You will no longer see each other in your friend feeds or send messages here.', confirmLabel: 'Unfriend', action: async () => { await removeFriend(person.id); if (selected?.id === person.id) setSelected(null); await refreshFriends(); } });
  }

  async function confirmAction() {
    if (!confirmation?.action) return;
    setBusy(true); setError('');
    try { await confirmation.action(); setConfirmation(null); }
    catch (requestError) { setError(requestError.message); setConfirmation(null); }
    finally { setBusy(false); }
  }

  async function submitMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!selected || !text || busy) return;
    setBusy(true); setError('');
    try { const saved = await sendMessage(selected.id, text); setMessages(current => [...current.filter(item => item._id !== saved._id), saved]); setDraft(''); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  const displayName = person => person.name && person.name !== person.username ? person.name : `@${person.username}`;

  return <div className="min-h-screen pb-28 lg:pb-16">
    <Navbar />
    <main className="page-shell">
      <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={14} /> Back to your space</Link>
      <section className="py-9 sm:py-12"><p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-roseDark"><Users size={15} /> Your community</p><h1 className="font-display text-4xl font-medium tracking-[-.04em] text-ink sm:text-5xl">Friends make the journey lighter.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Find people by username, add them as a friend, and send messages while you encourage each other.</p></section>
      {error && <p role="alert" className="mb-4 rounded-xl border border-[#d9a9ae] bg-[#f3e4e3] px-4 py-3 text-sm text-roseDark">{error}</p>}
      {requests.length > 0 && <GlassCard className="mb-5 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Waiting for you</p><h2 className="mt-1 font-display text-xl font-medium text-ink">Friend requests</h2></div><span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-roseDark">{requests.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{requests.map(person => <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-cream/60 p-3"><Avatar person={person} size="h-10 w-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{displayName(person)}</p><p className="text-xs text-muted">@{person.username} wants to be friends</p></div><button type="button" disabled={busy} onClick={() => handleRequest(person, 'accept')} title="Confirm request" className="grid h-9 w-9 place-items-center rounded-full bg-roseDark text-white disabled:opacity-50"><Check size={16} /></button><button type="button" disabled={busy} onClick={() => handleRequest(person, 'remove')} title="Remove request" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:bg-white disabled:opacity-50"><X size={16} /></button></div>)}</div></GlassCard>}
      <section className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-5">
          <GlassCard id="find-friends" className="p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blush text-roseDark"><Search size={17} /></span><div><h2 className="font-display text-xl font-medium text-ink">Find a friend</h2><p className="text-xs text-muted">Search by username.</p></div></div>
            <form onSubmit={findPeople} className="mt-5 flex gap-2"><input autoFocus={tab === 'search'} className="field min-w-0 flex-1" value={query} onChange={event => setQuery(event.target.value)} placeholder="Type a username" minLength={2} maxLength={32} /><button disabled={searching || query.trim().length < 2} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-roseDark text-white disabled:opacity-50" aria-label="Search"><Search size={17} /></button></form>
            <div className="mt-4 space-y-2">{searching && <p className="text-xs text-muted">Looking for people...</p>}{results.map(person => <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-cream/60 p-3"><Avatar person={person} size="h-10 w-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{displayName(person)}</p><p className="text-xs text-muted">@{person.username}</p></div><button type="button" disabled={busy} onClick={() => handleAdd(person)} className="flex items-center gap-1.5 rounded-full bg-blush px-3 py-2 text-xs font-semibold text-roseDark disabled:opacity-50"><Plus size={14} /> Add</button></div>)}{!searching && query.trim().length >= 2 && results.length === 0 && <p className="rounded-xl bg-cream/60 px-3 py-4 text-xs leading-5 text-muted">No new accounts found for that username.</p>}</div>
          </GlassCard>
          {sentRequests.length > 0 && <GlassCard className="p-5 sm:p-6"><div className="mb-3"><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Your invites</p><h2 className="mt-1 font-display text-xl font-medium text-ink">Sent requests</h2></div><div className="space-y-2">{sentRequests.map(person => <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-cream/60 p-3"><Avatar person={person} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{displayName(person)}</p><p className="text-xs text-muted">@{person.username}</p></div><span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-muted">Pending</span></div>)}</div></GlassCard>}
          {suggestions.length > 0 && <GlassCard className="p-5 sm:p-6"><div className="mb-3"><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">People to meet</p><h2 className="mt-1 font-display text-xl font-medium text-ink">Suggestions</h2></div><div className="space-y-2">{suggestions.map(person => <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-cream/60 p-3"><Avatar person={person} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{displayName(person)}</p><p className="text-xs text-muted">@{person.username}</p></div><button type="button" disabled={busy} onClick={() => handleAdd(person)} className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-2 text-xs font-semibold text-roseDark disabled:opacity-50"><Plus size={13} /> Add</button></div>)}</div></GlassCard>}
          <GlassCard className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-roseDark">Your people</p><h2 className="mt-1 font-display text-xl font-medium text-ink">Friends</h2></div><span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-roseDark">{friends.length}</span></div>
            {friends.length === 0 ? <div className="rounded-2xl bg-cream/60 p-5 text-center"><Users size={20} className="mx-auto text-roseDark" /><p className="mt-2 text-sm font-medium text-ink">Your list is ready when you are.</p><p className="mt-1 text-xs leading-5 text-muted">Search for a username above to add your first friend.</p></div> : <ul className="space-y-2">{friends.map(person => <li key={person.id} className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${selected?.id === person.id ? 'bg-blush/70' : 'bg-cream/50'}`}><button type="button" onClick={() => setSelected(person)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><Avatar person={person} size="h-10 w-10" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{displayName(person)}</span><span className="block text-xs text-muted">@{person.username}</span></span><MessageCircle size={15} className="shrink-0 text-roseDark" /></button><button type="button" disabled={busy} title={`Unfriend @${person.username}`} onClick={() => handleRemove(person)} className="rounded-lg p-2 text-muted hover:bg-white hover:text-roseDark disabled:opacity-50"><UserMinus size={15} /></button></li>)}</ul>}
          </GlassCard>
        </div>
        <GlassCard className="flex min-h-[540px] flex-col overflow-hidden p-0">
          {selected ? <>
            <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6"><Avatar person={selected} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{displayName(selected)}</p><p className="text-xs text-muted">@{selected.username}</p></div><span className="ml-auto rounded-full bg-blush px-3 py-1 text-[10px] font-semibold text-roseDark">Friend</span></div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-cream/30 px-4 py-5 sm:px-6">{messages.length === 0 && <div className="grid min-h-[350px] place-items-center"><div className="max-w-xs text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blush text-roseDark"><MessageCircle size={21} /></span><p className="mt-3 text-sm font-medium text-ink">Say hello to {selected.username}</p><p className="mt-1 text-xs leading-5 text-muted">Your conversation appears here. Keep it kind and encouraging.</p></div></div>}
              <AnimatePresence initial={false}>{messages.map(message => { const own = String(message.sender) === String(user?.id); return <motion.div key={message._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${own ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${own ? 'rounded-br-md bg-roseDark text-white' : 'rounded-bl-md border border-line bg-white text-ink'}`}><p className="whitespace-pre-wrap break-words text-sm leading-5">{message.text}</p><time className={`mt-1 block text-right text-[10px] ${own ? 'text-white/70' : 'text-muted'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div></motion.div>; })}</AnimatePresence><div ref={bottomRef} /></div>
            <form onSubmit={submitMessage} className="flex items-end gap-2 border-t border-line bg-white/70 p-4 sm:p-5"><textarea className="field min-h-[48px] max-h-32 resize-y py-3" value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message @${selected.username}`} maxLength={2000} rows={1} aria-label="Message" /><button disabled={!draft.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-roseDark text-white disabled:opacity-45" aria-label="Send message"><Send size={17} /></button></form>
          </> : <div className="grid flex-1 place-items-center p-6"><div className="max-w-sm text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blush text-roseDark"><MessageCircle size={23} /></span><h2 className="mt-4 font-display text-xl font-medium text-ink">A little encouragement goes a long way.</h2><p className="mt-2 text-sm leading-6 text-muted">Choose someone from your friends list to start a conversation.</p></div></div>}
        </GlassCard>
      </section>
    </main>
    <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} confirmLabel={confirmation?.confirmLabel} danger={confirmation?.danger} busy={busy} onConfirm={confirmAction} onCancel={() => setConfirmation(null)} />
  </div>;
}
