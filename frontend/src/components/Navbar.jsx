import { motion } from 'framer-motion';
import { Apple, ArrowUpRight, Bell, Dumbbell, Home as HomeIcon, LogOut, Menu, MessageCircle, Newspaper, Play, Search, UserRound, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/training', label: 'Stretching' },
  { to: '/gym', label: 'At the gym' },
  { to: '/home', label: 'At home' },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/community', label: 'Community', icon: Newspaper },
  { to: '/friends', label: 'Friends', icon: Users }
];

const spring = { type: 'spring', stiffness: 400, damping: 30 };
const mobileLinks = [
  { key: 'home', to: '/community', label: 'Home', icon: HomeIcon },
  { key: 'videos', to: '/reels', label: 'Reels', icon: Play },
  { key: 'messages', to: '/friends?tab=messages', label: 'Messages', icon: MessageCircle },
  { key: 'search', to: '/friends?tab=search', label: 'Search', icon: Search },
  { key: 'profile', to: '/profile', label: 'Profile', icon: UserRound }
];

export default function Navbar() {
  const { user, logout, getNotifications, markNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const load = async () => {
      try { const data = await getNotifications(); if (active) { setNotifications(data.notifications || []); setUnreadCount(data.unread || 0); } }
      catch { /* Keep the navigation usable when notifications are temporarily unavailable. */ }
    };
    load(); const timer = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user?.id, getNotifications]);

  async function toggleNotifications() {
    const next = !showNotifications; setShowNotifications(next);
    if (next) {
      try { await markNotificationsRead(); setUnreadCount(0); setNotifications(current => current.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); }
      catch { /* The next refresh will retry. */ }
    }
  }

  function openNotification(item) {
    setShowNotifications(false);
    navigate(item.type === 'friend_request' || item.type === 'friend_accepted' ? '/friends' : '/community');
  }

  const bell = <button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={showNotifications} onClick={toggleNotifications} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/75 text-ink hover:bg-blush"><Bell size={17} />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#c94360] px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>;

  function signOut() {
    logout();
    navigate('/login');
  }

  return <><header className="nav-shell sticky top-3 z-40 relative">
    <nav className="glass flex min-h-[64px] items-center justify-between rounded-2xl px-4 sm:px-6" aria-label="Main navigation">
      <NavLink to="/community" className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-.04em]" onClick={() => setOpen(false)}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blush text-roseDark"><Dumbbell size={16} /></span>
        blanc<span className="-ml-2 text-rose">.</span>
      </NavLink>

      <div className="hidden items-center gap-1 lg:flex">
        {links.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] motion-safe-hover ${isActive ? 'bg-blush font-semibold text-roseDark' : 'text-muted hover:bg-cream hover:text-ink'}`}>
          {link.icon && <link.icon size={14} />}{link.label}
        </NavLink>)}
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        {bell}
        <NavLink to="/profile" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-blush">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</span>Hi, {user?.username || user?.name?.split(' ')[0]}</NavLink>
        <button onClick={signOut} className="motion-safe-hover flex items-center gap-2 rounded-full border border-line bg-cream/70 px-3 py-2 text-xs text-muted hover:bg-cream hover:text-ink">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 lg:hidden">
        {bell}
        <NavLink to="/profile" aria-label={`Signed in as ${user?.username || user?.name || 'user'}`} className="flex min-w-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 text-ink">
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</span>
          <span className="max-w-[72px] truncate text-[11px] font-semibold">{user?.username || user?.name?.split(' ')[0]}</span>
        </NavLink>
        <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-ink">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>

    {showNotifications && <section aria-label="Notifications" className="absolute right-0 top-[72px] z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_18px_50px_rgba(76,43,49,.18)]"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="font-display text-lg font-semibold text-ink">Notifications</h2><p className="text-[11px] text-muted">Friend requests and post activity</p></div><button type="button" aria-label="Close notifications" onClick={() => setShowNotifications(false)} className="rounded-full p-2 text-muted hover:bg-cream"><X size={16} /></button></div><div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">{notifications.length ? notifications.map(item => <button key={item._id} type="button" onClick={() => openNotification(item)} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-cream ${item.readAt ? '' : 'bg-blush/55'}`}><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark">{item.actor?.profileImage ? <img src={item.actor.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={16} />}</span><span className="min-w-0 flex-1"><span className="block text-xs leading-5 text-ink"><strong>{item.actor?.name || `@${item.actor?.username || 'user'}`}</strong> {item.message}</span><time className="mt-1 block text-[10px] text-muted">{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time></span>{!item.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c94360]" />}</button>) : <p className="px-4 py-8 text-center text-sm text-muted">You’re all caught up.</p>}</div></section>}

    {open && <motion.div
      initial={{ opacity: 0, scale: .98, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
      className="glass mt-2 grid origin-top gap-1 rounded-2xl p-3 lg:hidden"
    >
      {links.map(link => <NavLink onClick={() => setOpen(false)} key={link.to} to={link.to} className={({ isActive }) => `flex items-center justify-between rounded-xl px-4 py-3 text-sm motion-safe-hover ${isActive ? 'bg-blush text-roseDark' : 'text-muted hover:bg-cream hover:text-ink'}`}>
        <span className="flex items-center gap-2">{link.icon && <link.icon size={15} />}{link.label}</span><ArrowUpRight size={15} />
      </NavLink>)}
      <NavLink to="/profile" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-muted hover:bg-cream">Edit profile<UserRound size={15} /></NavLink>
      <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-muted hover:bg-cream">
        <LogOut size={15} /> Sign out
      </button>
    </motion.div>}
  </header>
  <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(76,43,49,.08)] backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid h-[62px] max-w-lg grid-cols-5 items-center px-2">
      {mobileLinks.map(item => {
        const active = item.key === 'messages' || item.key === 'search'
          ? location.pathname === '/friends' && new URLSearchParams(location.search).get('tab') === item.key
          : item.key === 'profile'
            ? location.pathname === '/profile' || location.pathname.startsWith('/u/')
            : location.pathname === item.to;
        return <NavLink key={item.key} to={item.to} aria-current={active ? 'page' : undefined} className={`flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium ${active ? 'text-roseDark' : 'text-muted'}`}>
          <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${active ? 'bg-blush' : ''}`}><item.icon size={19} strokeWidth={active ? 2.3 : 1.8} /></span>
          <span>{item.label}</span>
        </NavLink>;
      })}
    </div>
  </nav></>;
}
