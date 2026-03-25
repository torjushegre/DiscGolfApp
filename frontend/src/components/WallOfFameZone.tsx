import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DiscSvg from './DiscSvg';
import Confetti from './Confetti';

interface WallOfFameZoneProps {
  aces: Disc[];
  onDiscClick: (disc: Disc) => void;
}

const MEDAL_COLORS = [
  { bg: 'from-yellow-500/30 to-yellow-700/30', border: 'border-yellow-400/50', medal: '🥇', label: '1st' },
  { bg: 'from-gray-300/20 to-gray-500/20', border: 'border-gray-300/40', medal: '🥈', label: '2nd' },
  { bg: 'from-amber-700/25 to-amber-900/25', border: 'border-amber-600/40', medal: '🥉', label: '3rd' },
];

function PodiumDisc({ disc, place, onClick }: { disc: Disc; place: number; onClick: () => void }) {
  const style = MEDAL_COLORS[place];
  const size = place === 0 ? 96 : 80;
  // Podium heights: 1st tallest, 2nd medium, 3rd shortest
  const podiumH = place === 0 ? 'h-20' : place === 1 ? 'h-14' : 'h-10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 150, delay: place * 0.15 }}
      onClick={onClick}
      className="cursor-pointer group flex flex-col items-center"
    >
      {/* Medal */}
      <span className="text-2xl mb-1">{style.medal}</span>

      {/* Disc frame */}
      <div className={`relative p-2 bg-gradient-to-br ${style.bg} rounded-xl border ${style.border} shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
        <div
          className={`rounded-full overflow-hidden border-2 ${style.border} shadow-inner`}
          style={{ width: size, height: size }}
        >
          {disc.photo_url ? (
            <img src={disc.photo_url} alt={`${disc.brand} ${disc.model}`} className="w-full h-full object-cover" />
          ) : (
            <DiscSvg color={disc.color || '#f1c40f'} size={size} />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center mt-2 max-w-[110px]">
        <p className="text-sm font-bold text-yellow-200 truncate">{disc.brand} {disc.model}</p>
        {disc.ace_course && (
          <p className="text-[10px] text-yellow-300/50 truncate">{disc.ace_course} #{disc.ace_hole}</p>
        )}
      </div>

      {/* Podium block */}
      <div className={`${podiumH} w-24 mt-2 bg-gradient-to-t from-yellow-900/40 to-yellow-800/20 rounded-t-md border-x border-t border-yellow-500/20 flex items-center justify-center`}>
        <span className="text-yellow-300/40 font-bold text-lg">{style.label}</span>
      </div>
    </motion.div>
  );
}

function WallOfFameZone({ aces, onDiscClick }: WallOfFameZoneProps) {
  if (aces.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-950/50 via-slate-900/80 to-slate-900/60 rounded-2xl" />
        <div className="relative p-6 text-center">
          <h3 className="text-lg font-bold text-yellow-200/40">Wall of Fame</h3>
          <p className="text-yellow-300/20 text-sm mt-1">Dine aces vises her</p>
        </div>
      </motion.div>
    );
  }

  // Top 3 for podium, rest below
  const podiumAces = aces.slice(0, 3);
  const restAces = aces.slice(3);

  // Podium order: 2nd | 1st | 3rd (classic podium layout)
  const podiumOrder = podiumAces.length >= 3
    ? [{ disc: podiumAces[1], place: 1 }, { disc: podiumAces[0], place: 0 }, { disc: podiumAces[2], place: 2 }]
    : podiumAces.length === 2
      ? [{ disc: podiumAces[1], place: 1 }, { disc: podiumAces[0], place: 0 }]
      : [{ disc: podiumAces[0], place: 0 }];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden"
    >
      <Confetti />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/60 via-amber-950/70 to-slate-900/80 rounded-2xl" />
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.05) 60px, rgba(255,255,255,0.05) 61px)',
        }} />
      </div>

      {/* Gold trim */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <div className="relative p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-yellow-300 tracking-wide">Wall of Fame</h3>
          <p className="text-yellow-200/50 text-sm mt-1">
            {aces.length} {aces.length === 1 ? 'ace' : 'aces'}
          </p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-4">
          {podiumOrder.map(({ disc, place }) => (
            <PodiumDisc
              key={disc.id}
              disc={disc}
              place={place}
              onClick={() => onDiscClick(disc)}
            />
          ))}
        </div>

        {/* Podium base line */}
        <div className="max-w-sm mx-auto h-[2px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent mb-6" />

        {/* Rest of aces */}
        {restAces.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5">
            {restAces.map((disc, i) => (
              <motion.div
                key={disc.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => onDiscClick(disc)}
                className="cursor-pointer group"
              >
                <div className="relative p-2 bg-gradient-to-br from-yellow-600/20 to-amber-800/20 rounded-xl border border-yellow-500/20 shadow-lg hover:scale-105 transition-all">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500/30 shadow-inner">
                    {disc.photo_url ? (
                      <img src={disc.photo_url} alt={`${disc.brand} ${disc.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <DiscSvg color={disc.color || '#f1c40f'} size={64} />
                    )}
                  </div>
                  <div className="text-center mt-1.5 px-1">
                    <p className="text-[11px] font-bold text-yellow-200 truncate max-w-[80px]">
                      {disc.brand} {disc.model}
                    </p>
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] shadow-md">
                    🏆
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default WallOfFameZone;
