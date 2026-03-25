import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DraggableDisc from './DraggableDisc';

interface BagZoneProps {
  discs: Disc[];
  onDiscClick: (disc: Disc) => void;
}

function BagZone({ discs, onDiscClick }: BagZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'bag-zone' });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isOver ? 'ring-4 ring-emerald-400/60 scale-[1.02]' : ''
      }`}
      style={{ minHeight: 280 }}
    >
      {/* Background - sporty bag look */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* Stitching detail */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bagen</h3>
            <p className="text-xs text-gray-400">{discs.length} discer</p>
          </div>
        </div>

        {/* Disc slots */}
        {discs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 text-sm italic">
              Dra discer hit for å legge dem i bagen
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-start">
            {discs.map((disc, i) => (
              <motion.div
                key={disc.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <DraggableDisc
                  disc={disc}
                  onClick={() => onDiscClick(disc)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default BagZone;
