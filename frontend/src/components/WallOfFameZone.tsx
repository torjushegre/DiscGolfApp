import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import SortableDisc from './SortableDisc';
import Confetti from './Confetti';

interface WallOfFameZoneProps {
  podiumSlots: (Disc | null)[];
  restAces: Disc[];
  onDiscClick: (disc: Disc) => void;
}

const MEDALS = [
  { medal: '🥇', label: '1.', bg: 'from-yellow-500/30 to-yellow-700/30', border: 'border-yellow-400/50', podiumH: 'h-16', ring: 'ring-yellow-400/50' },
  { medal: '🥈', label: '2.', bg: 'from-gray-300/20 to-gray-500/20', border: 'border-gray-300/40', podiumH: 'h-11', ring: 'ring-gray-300/40' },
  { medal: '🥉', label: '3.', bg: 'from-amber-700/25 to-amber-900/25', border: 'border-amber-600/40', podiumH: 'h-8', ring: 'ring-amber-600/40' },
];

function PodiumSlot({ rank, disc, onDiscClick }: { rank: number; disc: Disc | null; onDiscClick: (disc: Disc) => void }) {
  const style = MEDALS[rank];
  const { isOver, setNodeRef } = useDroppable({ id: `podium-${rank + 1}` });

  return (
    <div className="flex flex-col items-center">
      {/* Medal */}
      <span className="text-2xl mb-1">{style.medal}</span>

      {/* Slot - droppable */}
      <div
        ref={setNodeRef}
        className={`relative p-2 bg-gradient-to-br ${style.bg} rounded-xl border ${style.border} shadow-lg transition-all duration-200 ${
          isOver ? `ring-2 ${style.ring} scale-105` : ''
        }`}
      >
        {disc ? (
          <SortableContext items={[disc.id]} strategy={rectSortingStrategy}>
            <SortableDisc
              disc={disc}
              onClick={() => onDiscClick(disc)}
              size={rank === 0 ? 88 : 72}
            />
          </SortableContext>
        ) : (
          <div
            className={`rounded-full border-2 border-dashed ${style.border} flex items-center justify-center opacity-30`}
            style={{ width: rank === 0 ? 88 : 72, height: rank === 0 ? 88 : 72 }}
          >
            <span className="text-yellow-300/50 text-xs font-bold">{style.label}</span>
          </div>
        )}
      </div>

      {/* Label */}
      {disc && (
        <div className="text-center mt-2 max-w-[100px]">
          <p className="text-xs font-bold text-yellow-200 truncate">{disc.brand} {disc.model}</p>
          {disc.ace_course && (
            <p className="text-[10px] text-yellow-300/40 truncate">{disc.ace_course} #{disc.ace_hole}</p>
          )}
        </div>
      )}

      {/* Podium block */}
      <div className={`${style.podiumH} w-24 mt-2 bg-gradient-to-t from-yellow-900/40 to-yellow-800/20 rounded-t-md border-x border-t border-yellow-500/20 flex items-center justify-center`}>
        <span className="text-yellow-300/30 font-bold text-lg">{style.label}</span>
      </div>
    </div>
  );
}

function WallOfFameZone({ podiumSlots, restAces, onDiscClick }: WallOfFameZoneProps) {
  const totalAces = podiumSlots.filter(Boolean).length + restAces.length;
  const hasAnyAces = totalAces > 0;
  const { isOver: isOverRest, setNodeRef: setRestRef } = useDroppable({ id: 'wall-rest' });

  if (!hasAnyAces) {
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

  // Podium display order: 2nd | 1st | 3rd
  const podiumOrder = [
    { rank: 1, disc: podiumSlots[1] },
    { rank: 0, disc: podiumSlots[0] },
    { rank: 2, disc: podiumSlots[2] },
  ];

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

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <div className="relative p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-yellow-300 tracking-wide">Wall of Fame</h3>
          <p className="text-yellow-200/50 text-sm mt-1">{totalAces} {totalAces === 1 ? 'ace' : 'aces'}</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-4">
          {podiumOrder.map(({ rank, disc }) => (
            <PodiumSlot key={rank} rank={rank} disc={disc} onDiscClick={onDiscClick} />
          ))}
        </div>

        {/* Podium base */}
        <div className="max-w-sm mx-auto h-[2px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent mb-4" />

        {/* Rest of aces - droppable area */}
        <div
          ref={setRestRef}
          className={`min-h-[60px] rounded-xl p-3 transition-all duration-200 border border-dashed ${
            isOverRest
              ? 'border-yellow-400/40 bg-yellow-900/20'
              : restAces.length > 0 ? 'border-yellow-500/10 bg-yellow-900/5' : 'border-yellow-500/10'
          }`}
        >
          {restAces.length > 0 ? (
            <SortableContext items={restAces.map((d) => d.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap justify-center gap-4">
                {restAces.map((disc) => (
                  <motion.div
                    key={disc.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex flex-col items-center">
                      <SortableDisc disc={disc} onClick={() => onDiscClick(disc)} size={64} />
                      <p className="text-[10px] font-bold text-yellow-200/60 truncate max-w-[80px] mt-1 text-center">
                        {disc.brand} {disc.model}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SortableContext>
          ) : (
            <p className="text-yellow-300/20 text-xs text-center py-2">
              Dra aces hit, eller opp til podiet
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default WallOfFameZone;
