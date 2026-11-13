import { motion } from 'framer-motion';
import { Apple, ArrowUpRight, Dumbbell, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/training', label: 'Stretching' },
  { to: '/gym', label: 'At the gym' },
  { to: '/home', label: 'At home' },
  { to: '/nutrition', label: 'Nutrition', icon: Apple }
];

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    navigate('/login');
  }

  return <header className="nav-shell sticky top-3 z-40">
    <nav className="glass flex min-h-[64px] items-center justify-between rounded-2xl px-4 sm:px-6" aria-label="Main navigation">
      <NavLink to="/dashboard" className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-.04em]" onClick={() => setOpen(false)}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blush text-roseDark"><Dumbbell size={16} /></span>
        blanc<span className="-ml-2 text-rose">.</span>
      </NavLink>

      <div className="hidden items-center gap-1 md:flex">
        {links.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] motion-safe-hover ${isActive ? 'bg-blush font-semibold text-roseDark' : 'text-muted hover:bg-cream hover:text-ink'}`}>
          {link.icon && <link.icon size={14} />}{link.label}
        </NavLink>)}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <NavLink to="/profile" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-blush">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</span>Hi, {user?.username || user?.name?.split(' ')[0]}</NavLink>
        <button onClick={signOut} className="motion-safe-hover flex items-center gap-2 rounded-full border border-line bg-cream/70 px-3 py-2 text-xs text-muted hover:bg-cream hover:text-ink">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-cream text-ink md:hidden">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
    </nav>

    {open && <motion.div
      initial={{ opacity: 0, scale: .98, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
      className="glass mt-2 grid origin-top gap-1 rounded-2xl p-3 md:hidden"
    >
      {links.map(link => <NavLink onClick={() => setOpen(false)} key={link.to} to={link.to} className={({ isActive }) => `flex items-center justify-between rounded-xl px-4 py-3 text-sm motion-safe-hover ${isActive ? 'bg-blush text-roseDark' : 'text-muted hover:bg-cream hover:text-ink'}`}>
        {link.label}<ArrowUpRight size={15} />
      </NavLink>)}
      <NavLink to="/profile" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-muted hover:bg-cream">Edit profile<UserRound size={15} /></NavLink>
      <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-muted hover:bg-cream">
        <LogOut size={15} /> Sign out
      </button>
    </motion.div>}
  </header>;
}
