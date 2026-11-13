const poses = {
  'push-up': { body: 'M22 51 Q42 45 65 41', arms: 'M32 48 L24 65 M48 44 L43 63', legs: 'M64 41 L79 51 L91 51', head: [76, 37] },
  plank: { body: 'M22 51 Q42 45 65 41', arms: 'M32 48 L24 65 M48 44 L43 63', legs: 'M64 41 L79 51 L91 51', head: [76, 37] },
  lunge: { body: 'M50 38 L50 58', arms: 'M50 43 L38 54 M50 43 L62 54', legs: 'M50 58 L37 74 L29 74 M50 58 L64 69 L73 69', head: [50, 26] },
  bridge: { body: 'M25 59 Q48 38 70 57', arms: 'M32 57 L25 67 M68 57 L75 67', legs: 'M26 59 L24 73 M69 57 L73 73', head: [19, 58] },
  stretch: { body: 'M50 38 L50 58', arms: 'M50 43 L35 30 M50 43 L65 30', legs: 'M50 58 L40 74 M50 58 L60 74', head: [50, 26] },
  hinge: { body: 'M50 39 Q55 49 65 55', arms: 'M52 43 L69 58 M54 44 L73 53', legs: 'M65 55 L59 74 M65 55 L73 74', head: [44, 34] },
  march: { body: 'M50 38 L50 57', arms: 'M50 43 L40 53 M50 43 L61 33', legs: 'M50 57 L39 70 L31 70 M50 57 L61 67 L68 67', head: [50, 26] },
  press: { body: 'M50 38 L50 58', arms: 'M50 43 L38 30 M50 43 L62 30', legs: 'M50 58 L42 74 M50 58 L58 74', head: [50, 26] },
  row: { body: 'M50 39 Q58 48 67 54', arms: 'M55 44 L42 55 M58 46 L72 55', legs: 'M67 54 L59 74 M67 54 L76 74', head: [45, 34] }
};

export default function ExerciseIllustration({ type = 'squat', label = 'Exercise demonstration' }) {
  const pose = poses[type] || { body: 'M50 38 L50 58', arms: 'M50 43 L38 54 M50 43 L62 54', legs: 'M50 58 L41 74 M50 58 L59 74', head: [50, 26] };
  return <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-[#f7e9e5] sm:h-32 sm:w-32" role="img" aria-label={label}>
    <svg viewBox="0 0 100 84" className="h-full w-full" fill="none" aria-hidden="true">
      <ellipse cx="50" cy="74" rx="30" ry="5" fill="#d9b8b6" opacity=".45" />
      <path d={pose.body} stroke="#96576a" strokeWidth="7" strokeLinecap="round" />
      <path d={pose.arms} stroke="#c78d72" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pose.legs} stroke="#62474a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pose.head[0]} cy={pose.head[1]} r="8" fill="#d9a17d" stroke="#62474a" strokeWidth="2" />
      <path d="M15 16c6-5 10-5 15-2" stroke="#d98a9d" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      <circle cx="81" cy="17" r="3" fill="#d98a9d" opacity=".7" />
    </svg>
  </div>;
}
