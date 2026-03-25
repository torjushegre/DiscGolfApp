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
      style={{ minHeight: 300 }}
    >
      {/* Bag body */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-2xl" />

      {/* Bag texture - fabric weave */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
      }} />

      {/* Bag top flap / opening */}
      <div className="absolute top-0 left-0 right-0">
        {/* Handle/strap */}
        <div className="flex justify-center">
          <div className="w-24 h-3 bg-slate-600 rounded-b-lg border-x-2 border-b-2 border-slate-500/30 shadow-md" />
        </div>
        {/* Zipper line */}
        <div className="mt-1 mx-4 h-[2px] bg-gradient-to-r from-transparent via-slate-500/40 to-transparent" />
        {/* Open bag edge - curved */}
        <svg className="w-full h-6 mt-1" viewBox="0 0 400 24" preserveAspectRatio="none">
          <path d="M0,0 Q200,24 400,0 L400,24 L0,24 Z" fill="rgba(30,41,59,0.6)" />
        </svg>
      </div>

      {/* Side pockets hint */}
      <div className="absolute left-0 top-16 bottom-8 w-3">
        <div className="h-full bg-gradient-to-r from-slate-600/20 to-transparent rounded-r" />
      </div>
      <div className="absolute right-0 top-16 bottom-8 w-3">
        <div className="h-full bg-gradient-to-l from-slate-600/20 to-transparent rounded-l" />
      </div>

      <div className="relative px-5 pt-12 pb-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bagen</h3>
            <p className="text-xs text-gray-400">{discs.length} discer</p>
          </div>
        </div>

        {/* Disc slots inside the bag */}
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

      {/* Bag bottom - reinforced base */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-slate-950 to-transparent" />
      <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-slate-600/30 rounded-full" />
    </motion.div>
  );
}

export default BagZone;
