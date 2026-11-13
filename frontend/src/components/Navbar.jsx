import { motion } from 'framer-motion';
import { Apple, ArrowUpRight, Dumbbell, Home as HomeIcon, LogOut, Menu, MessageCircle, Newspaper, Play, Search, UserRound, Users, X } from 'lucide-react';
import { useState } from 'react';
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
  { key: 'videos', to: '/training', label: 'Videos', icon: Play },
  { key: 'messages', to: '/friends?tab=messages', label: 'Messages', icon: MessageCircle },
  { key: 'search', to: '/friends?tab=search', label: 'Search', icon: Search },
  { key: 'profile', to: '/profile', label: 'Profile', icon: UserRound }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    navigate('/login');
  }

  return <><header className="nav-shell sticky top-3 z-40">
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
        <NavLink to="/profile" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-blush">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</span>Hi, {user?.username || user?.name?.split(' ')[0]}</NavLink>
        <button onClick={signOut} className="motion-safe-hover flex items-center gap-2 rounded-full border border-line bg-cream/70 px-3 py-2 text-xs text-muted hover:bg-cream hover:text-ink">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 lg:hidden">
        <NavLink to="/profile" aria-label={`Signed in as ${user?.username || user?.name || 'user'}`} className="flex min-w-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 text-ink">
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-roseDark">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</span>
          <span className="max-w-[72px] truncate text-[11px] font-semibold">{user?.username || user?.name?.split(' ')[0]}</span>
        </NavLink>
        <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-ink">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>

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
            : location.pathname === item.to || (item.key === 'videos' && ['/gym', '/home'].includes(location.pathname));
        return <NavLink key={item.key} to={item.to} aria-current={active ? 'page' : undefined} className={`flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium ${active ? 'text-roseDark' : 'text-muted'}`}>
          <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${active ? 'bg-blush' : ''}`}><item.icon size={19} strokeWidth={active ? 2.3 : 1.8} /></span>
          <span>{item.label}</span>
        </NavLink>;
      })}
    </div>
  </nav></>;
}
