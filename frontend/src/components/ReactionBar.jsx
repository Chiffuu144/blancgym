import { useRef, useState } from 'react';
import { ThumbsUp, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const options = [
  { type: 'like', emoji: '\u{1F44D}', label: 'Like' },
  { type: 'heart', emoji: '\u{2764}\u{FE0F}', label: 'Heart' },
  { type: 'haha', emoji: '\u{1F602}', label: 'Haha' },
  { type: 'sad', emoji: '\u{1F622}', label: 'Sad' },
  { type: 'angry', emoji: '\u{1F621}', label: 'Angry' }
];

function Avatar({ person }) {
  return <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-paper bg-blush text-roseDark">{person?.profileImage ? <img src={person.profileImage} alt="" className="h-full w-full object-cover" /> : <UserRound size={13} />}</span>;
}

export default function ReactionBar({ reactions = [], myReaction, onReact }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const holdTimer = useRef(null);
  const suppressTap = useRef(false);
  const selected = options.find(option => option.type === myReaction);

  function beginHold(event) {
    if (event.pointerType !== 'touch') return;
    suppressTap.current = false;
    holdTimer.current = window.setTimeout(() => { suppressTap.current = true; setPickerOpen(true); }, 480);
  }
  function endHold() { window.clearTimeout(holdTimer.current); }
  function like() {
    if (suppressTap.current) { suppressTap.current = false; return; }
    onReact('like');
  }

  return <div className="relative min-w-0 flex-1" onPointerLeave={event => { if (event.pointerType === 'mouse') setPickerOpen(false); }}>
    {pickerOpen && <div role="toolbar" aria-label="Choose a reaction" className="absolute bottom-full left-0 z-30 flex items-center gap-1 rounded-full border border-line bg-white p-1.5 shadow-lg">
      {options.map(option => <button key={option.type} type="button" aria-label={option.label} title={option.label} onClick={event => { event.stopPropagation(); onReact(option.type); setPickerOpen(false); }} className={`grid h-10 w-10 place-items-center rounded-full text-xl transition-transform hover:-translate-y-1 hover:scale-110 ${myReaction === option.type ? 'bg-blush' : 'hover:bg-cream'}`}>{option.emoji}</button>)}
    </div>}
    <div className="flex min-w-0 items-center gap-2">
      <button type="button" onPointerEnter={event => { if (event.pointerType === 'mouse') setPickerOpen(true); }} onPointerDown={beginHold} onPointerUp={endHold} onPointerCancel={endHold} onPointerLeave={endHold} onKeyDown={event => { if (event.key === 'ArrowDown') setPickerOpen(true); }} onClick={like} aria-pressed={Boolean(selected)} aria-expanded={pickerOpen} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${selected ? 'bg-blush text-roseDark' : 'text-muted hover:bg-cream hover:text-ink'}`}><span>{selected ? selected.emoji : <ThumbsUp size={15} />}</span>{selected ? selected.label : 'Like'}</button>
      {reactions.length > 0 && <button type="button" onClick={() => setListOpen(open => !open)} aria-expanded={listOpen} className="flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-muted hover:bg-cream"><span className="flex -space-x-2">{reactions.slice(0, 3).map((reaction, index) => <Avatar key={`${reaction.user?._id || index}-${reaction.type}`} person={reaction.user} />)}</span><span className="truncate">{reactions.length} {reactions.length === 1 ? 'reaction' : 'reactions'}</span></button>}
    </div>
    {listOpen && <div className="absolute bottom-full left-0 z-20 mb-2 max-h-56 w-64 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-xl">
      {reactions.map((reaction, index) => <div key={`${reaction.user?._id || index}-${reaction.type}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5"><Avatar person={reaction.user} /><span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{reaction.user?.name || `@${reaction.user?.username || 'user'}`}</span><span className="text-base" aria-label={reaction.type}>{options.find(option => option.type === reaction.type)?.emoji}</span></div>)}
    </div>}
  </div>;
}
