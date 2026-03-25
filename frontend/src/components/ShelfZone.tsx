import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DraggableDisc from './DraggableDisc';

interface ShelfZoneProps {
  discs: Disc[];
  onDiscClick: (disc: Disc) => void;
}

function ShelfZone({ discs, onDiscClick }: ShelfZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'shelf-zone' });

  // Split discs into shelf rows (6 per row)
  const rows: Disc[][] = [];
  for (let i = 0; i < discs.length; i += 6) {
    rows.push(discs.slice(i, i + 6));
  }

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isOver ? 'ring-4 ring-amber-400/60 scale-[1.02]' : ''
      }`}
      style={{ minHeight: 280 }}
    >
      {/* Background - wooden shelf look */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 rounded-2xl" />
      {/* Wood grain texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.05) 20px, rgba(0,0,0,0.05) 21px)',
        }} />
      </div>

      {/* Top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-700/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-100">Hylla</h3>
            <p className="text-xs text-amber-300/60">{discs.length} discer</p>
          </div>
        </div>

        {/* Shelf rows */}
        {discs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-amber-300/40 text-sm italic">
              Dra discer hit for å legge dem på hylla
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx}>
                <div className="flex flex-wrap gap-3 justify-start pb-3">
                  {row.map((disc, i) => (
                    <motion.div
                      key={disc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (rowIdx * 6 + i) * 0.03 }}
                    >
                      <DraggableDisc
                        disc={disc}
                        onClick={() => onDiscClick(disc)}
                      />
                    </motion.div>
                  ))}
                </div>
                {/* Shelf board line */}
                <div className="h-[3px] bg-gradient-to-r from-amber-800/60 via-amber-700/80 to-amber-800/60 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ShelfZone;
