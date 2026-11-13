import { motion } from 'framer-motion';

const movements = {
  squat: [
    { head:[50,17], shoulder:[50,31], hip:[50,55], elbows:[[39,39],[61,39]], hands:[[34,48],[66,48]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[50,21], shoulder:[50,37], hip:[50,64], elbows:[[39,48],[61,48]], hands:[[35,59],[65,59]], knees:[[34,74],[66,74]], feet:[[40,91],[60,91]] }
  ],
  hinge: [
    { head:[50,18], shoulder:[50,32], hip:[50,54], elbows:[[39,40],[61,40]], hands:[[35,48],[65,48]], knees:[[42,72],[58,72]], feet:[[40,91],[60,91]] },
    { head:[65,31], shoulder:[60,43], hip:[48,57], elbows:[[59,52],[68,52]], hands:[[61,65],[72,65]], knees:[[42,74],[60,74]], feet:[[40,91],[64,91]] }
  ],
  lunge: [
    { head:[50,17], shoulder:[50,31], hip:[50,54], elbows:[[40,42],[60,42]], hands:[[38,53],[62,53]], knees:[[43,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[50,20], shoulder:[50,36], hip:[50,59], elbows:[[39,44],[61,44]], hands:[[37,54],[63,54]], knees:[[35,72],[66,69]], feet:[[28,91],[78,91]] }
  ],
  'push-up': [
    { head:[20,45], shoulder:[34,48], hip:[55,51], elbows:[[31,57],[43,57]], hands:[[27,69],[48,69]], knees:[[69,54],[79,54]], feet:[[88,55],[94,55]] },
    { head:[20,50], shoulder:[34,53], hip:[55,52], elbows:[[31,62],[43,62]], hands:[[27,72],[48,72]], knees:[[69,54],[79,54]], feet:[[88,55],[94,55]] }
  ],
  plank: [
    { head:[18,43], shoulder:[33,48], hip:[55,51], elbows:[[31,57],[42,57]], hands:[[27,70],[48,70]], knees:[[69,53],[79,53]], feet:[[89,54],[95,54]] },
    { head:[18,43], shoulder:[33,48], hip:[55,51], elbows:[[31,57],[42,57]], hands:[[27,70],[48,70]], knees:[[69,53],[79,53]], feet:[[89,54],[95,54]] }
  ],
  'dead-bug': [
    { head:[20,55], shoulder:[32,58], hip:[53,61], elbows:[[30,48],[39,66]], hands:[[25,37],[45,72]], knees:[[61,48],[69,50]], feet:[[69,38],[76,39]] },
    { head:[20,55], shoulder:[32,58], hip:[53,61], elbows:[[29,47],[40,67]], hands:[[22,35],[46,74]], knees:[[62,51],[69,50]], feet:[[82,77],[77,39]] }
  ],
  bridge: [
    { head:[18,66], shoulder:[29,67], hip:[48,68], elbows:[[27,71],[42,71]], hands:[[22,78],[48,78]], knees:[[61,63],[73,63]], feet:[[61,84],[76,84]] },
    { head:[18,66], shoulder:[29,65], hip:[48,52], elbows:[[27,72],[42,72]], hands:[[22,78],[48,78]], knees:[[61,56],[73,56]], feet:[[61,84],[76,84]] }
  ],
  march: [
    { head:[50,17], shoulder:[50,31], hip:[50,54], elbows:[[40,41],[60,41]], hands:[[37,51],[63,51]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[50,17], shoulder:[50,31], hip:[50,54], elbows:[[39,40],[62,37]], hands:[[36,51],[66,28]], knees:[[38,70],[63,63]], feet:[[34,91],[68,81]] }
  ],
  press: [
    { head:[50,17], shoulder:[50,31], hip:[50,55], elbows:[[37,42],[63,42]], hands:[[36,31],[64,31]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[50,17], shoulder:[50,31], hip:[50,55], elbows:[[36,27],[64,27]], hands:[[35,13],[65,13]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] }
  ],
  row: [
    { head:[50,18], shoulder:[50,32], hip:[50,55], elbows:[[39,43],[61,43]], hands:[[37,53],[63,53]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[58,25], shoulder:[55,38], hip:[49,57], elbows:[[43,43],[59,43]], hands:[[45,33],[57,33]], knees:[[42,73],[60,73]], feet:[[40,91],[62,91]] }
  ],
  stretch: [
    { head:[50,17], shoulder:[50,31], hip:[50,55], elbows:[[39,40],[61,40]], hands:[[36,50],[64,50]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] },
    { head:[50,17], shoulder:[50,31], hip:[50,55], elbows:[[35,23],[65,23]], hands:[[27,12],[73,12]], knees:[[42,71],[58,71]], feet:[[40,91],[60,91]] }
  ]
};

function AnimatedLimb({ frames, from, to, side = 0, color, width = 5 }) {
  const point = (frame, key) => Array.isArray(frame[key][0]) ? frame[key][side] : frame[key];
  const start = point(frames[0], from); const end = point(frames[0], to);
  const nextStart = point(frames[1], from); const nextEnd = point(frames[1], to);
  return <motion.line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} animate={{ x1:[start[0],nextStart[0]], y1:[start[1],nextStart[1]], x2:[end[0],nextEnd[0]], y2:[end[1],nextEnd[1]] }} transition={{ duration: 1.25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

export default function AnimatedExercise({ type = 'squat', name }) {
  const movementType = /dead bug/i.test(name || '') ? 'dead-bug' : type;
  const frames = movements[movementType] || movements.squat;
  return <div className="human-demo" role="img" aria-label={`Animated woman demonstrating ${name || type}`}>
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <ellipse cx="51" cy="94" rx="31" ry="4" fill="#d9b8b6" opacity=".55" />
      <AnimatedLimb frames={frames} from="shoulder" to="hip" color="#c7637e" width={13} />
      {[0,1].map(side => <g key={side}><AnimatedLimb frames={frames} from="shoulder" to="elbows" side={side} color="#c88d72" /><AnimatedLimb frames={frames} from="elbows" to="hands" side={side} color="#c88d72" /><AnimatedLimb frames={frames} from="hip" to="knees" side={side} color="#56434b" width={7} /><AnimatedLimb frames={frames} from="knees" to="feet" side={side} color="#56434b" width={7} /></g>)}
      <motion.circle cx={frames[0].head[0]} cy={frames[0].head[1]} r="7" animate={{ cx:[frames[0].head[0],frames[1].head[0]], cy:[frames[0].head[1],frames[1].head[1]] }} transition={{ duration:1.25, repeat:Infinity, repeatType:'reverse', ease:'easeInOut' }} fill="#d9a17d" stroke="#62474a" strokeWidth="1.5" />
      <motion.path d="M46 12 Q44 5 51 7 Q58 8 56 16 Q55 12 51 12 Q49 15 46 16Z" animate={{ x:[0,frames[1].head[0]-frames[0].head[0]], y:[0,frames[1].head[1]-frames[0].head[1]] }} transition={{ duration:1.25, repeat:Infinity, repeatType:'reverse', ease:'easeInOut' }} fill="#744858" />
      <circle cx="48" cy="16" r=".7" fill="#553f42" />
      <circle cx="53" cy="16" r=".7" fill="#553f42" />
      <path d="M45 26 Q50 29 55 26 L56 34 Q50 38 44 34Z" fill="#f8d8dc" opacity=".9" />
    </svg>
  </div>;
}
