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

  // Split discs into shelf rows (5 per shelf)
  const rows: Disc[][] = [];
  for (let i = 0; i < discs.length; i += 5) {
    rows.push(discs.slice(i, i + 5));
  }
  // Always show at least 2 shelf rows for visual effect
  while (rows.length < 2) {
    rows.push([]);
  }

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isOver ? 'ring-4 ring-stone-400/60 scale-[1.02]' : ''
      }`}
      style={{ minHeight: 300 }}
    >
      {/* Wall background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-850 to-stone-900 rounded-2xl" />
      {/* Wall texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center border border-stone-600/20">
            <svg className="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6v12M18.75 6v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-200">Hylla</h3>
            <p className="text-xs text-stone-400/60">{discs.length} discer</p>
          </div>
        </div>

        {/* Shelf rows with brackets */}
        <div className="space-y-1">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="relative">
              {/* Discs sitting on shelf */}
              <div className="flex flex-wrap gap-3 justify-start px-4 pb-2 min-h-[76px] items-end">
                {row.map((disc, i) => (
                  <motion.div
                    key={disc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (rowIdx * 5 + i) * 0.03 }}
                  >
                    <DraggableDisc
                      disc={disc}
                      onClick={() => onDiscClick(disc)}
                    />
                  </motion.div>
                ))}
                {row.length === 0 && (
                  <p className="text-stone-600 text-xs italic py-6 mx-auto">
                    {rowIdx === 0 ? 'Dra discer hit' : ''}
                  </p>
                )}
              </div>

              {/* Shelf board */}
              <div className="relative">
                {/* Main board */}
                <div className="h-[6px] bg-gradient-to-b from-stone-500/70 to-stone-700/70 rounded-sm shadow-[0_3px_6px_rgba(0,0,0,0.4)]" />
                {/* Board front edge highlight */}
                <div className="h-[1px] bg-stone-400/20" />

                {/* Left bracket */}
                <svg className="absolute -bottom-4 left-2 w-4 h-4 text-stone-500/50" viewBox="0 0 16 16">
                  <path d="M2,0 L2,12 L14,12" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                {/* Right bracket */}
                <svg className="absolute -bottom-4 right-2 w-4 h-4 text-stone-500/50" viewBox="0 0 16 16">
                  <path d="M14,0 L14,12 L2,12" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ShelfZone;
