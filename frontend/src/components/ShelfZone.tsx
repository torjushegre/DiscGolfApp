import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import SortableDisc from './SortableDisc';

interface ShelfZoneProps {
  sections: Disc[][];
  onDiscClick: (disc: Disc) => void;
}

function ShelfSection({ id, discs, index, onDiscClick }: {
  id: string;
  discs: Disc[];
  index: number;
  onDiscClick: (disc: Disc) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="relative">
      {/* Discs on shelf */}
      <SortableContext items={discs.map((d) => d.id)} strategy={rectSortingStrategy}>
        <div className={`flex flex-wrap gap-3 justify-start px-5 pb-2 min-h-[80px] items-end transition-colors duration-200 rounded-lg ${
          isOver ? 'bg-white/5' : ''
        }`}>
          {discs.map((disc) => (
            <SortableDisc
              key={disc.id}
              disc={disc}
              onClick={() => onDiscClick(disc)}
            />
          ))}
          {discs.length === 0 && (
            <p className="text-stone-600 text-xs italic py-6 mx-auto">
              {index === 0 ? 'Dra discer hit' : ''}
            </p>
          )}
        </div>
      </SortableContext>

      {/* Shelf board */}
      <div className="relative">
        <div className="h-[6px] bg-gradient-to-b from-stone-500/70 to-stone-700/70 rounded-sm shadow-[0_3px_6px_rgba(0,0,0,0.4)]" />
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
  );
}

function ShelfZone({ sections, onDiscClick }: ShelfZoneProps) {
  const totalDiscs = sections.reduce((sum, s) => sum + s.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-stone-700/50 flex items-center justify-center border border-stone-600/20">
          <svg className="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6v12M18.75 6v12" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-200">Hylla</h3>
          <p className="text-xs text-stone-400/60">{totalDiscs} discer</p>
        </div>
      </div>

      {/* Shelf unit */}
      <div className="relative rounded-2xl" style={{ minHeight: 320 }}>
        {/* Wall background */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Side uprights */}
        <div className="absolute top-4 bottom-4 left-1 w-[3px] bg-gradient-to-b from-stone-600/40 via-stone-500/30 to-stone-600/40 rounded pointer-events-none" />
        <div className="absolute top-4 bottom-4 right-1 w-[3px] bg-gradient-to-b from-stone-600/40 via-stone-500/30 to-stone-600/40 rounded pointer-events-none" />

        <div className="relative p-5 space-y-6">
          {sections.map((sectionDiscs, idx) => (
            <ShelfSection
              key={idx}
              id={`shelf-${idx}`}
              discs={sectionDiscs}
              index={idx}
              onDiscClick={onDiscClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ShelfZone;
