import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DiscSvg from './DiscSvg';
import Confetti from './Confetti';

interface WallOfFameZoneProps {
  aces: Disc[];
  onDiscClick: (disc: Disc) => void;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Confetti */}
      <Confetti />

      {/* Background - wall with trophy feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/60 via-amber-950/70 to-slate-900/80 rounded-2xl" />
      {/* Brick-like pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.05) 60px, rgba(255,255,255,0.05) 61px)',
        }} />
      </div>

      {/* Gold trim */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-5">
          <h3 className="text-2xl font-bold text-yellow-300 tracking-wide">Wall of Fame</h3>
          <p className="text-yellow-200/50 text-sm mt-1">
            {aces.length} {aces.length === 1 ? 'ace' : 'aces'}
          </p>
        </div>

        {/* Ace frames */}
        <div className="flex flex-wrap justify-center gap-6">
          {aces.map((disc, i) => (
            <motion.div
              key={disc.id}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, delay: i * 0.1 }}
              onClick={() => onDiscClick(disc)}
              className="cursor-pointer group"
            >
              {/* Frame */}
              <div className="relative p-2 bg-gradient-to-br from-yellow-600/30 to-amber-800/30 rounded-xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 transition-all hover:scale-105">
                {/* Inner frame */}
                <div className="p-1 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-lg">
                  {/* Disc */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500/40 shadow-inner">
                    {disc.photo_url ? (
                      <img
                        src={disc.photo_url}
                        alt={`${disc.brand} ${disc.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DiscSvg color={disc.color || '#f1c40f'} size={80} />
                    )}
                  </div>
                </div>
                {/* Label */}
                <div className="text-center mt-2 px-1">
                  <p className="text-xs font-bold text-yellow-200 truncate max-w-[90px]">
                    {disc.brand} {disc.model}
                  </p>
                  {disc.ace_course && (
                    <p className="text-[10px] text-yellow-300/50 truncate max-w-[90px]">
                      {disc.ace_course} #{disc.ace_hole}
                    </p>
                  )}
                </div>
                {/* Trophy icon */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs shadow-md">
                  🏆
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default WallOfFameZone;
