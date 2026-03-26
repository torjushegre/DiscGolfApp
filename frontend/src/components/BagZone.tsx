import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import SortableDisc from './SortableDisc';

interface BagZoneProps {
  lidDiscs: Disc[];
  mainDiscs: Disc[];
  onDiscClick: (disc: Disc) => void;
}

function BagDropZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`transition-all duration-200 ${isOver ? 'bg-white/5 rounded-lg' : ''}`}>
      {children}
    </div>
  );
}

function BagZone({ lidDiscs, mainDiscs, onDiscClick }: BagZoneProps) {
  const totalDiscs = lidDiscs.length + mainDiscs.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
          <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Bagen</h3>
          <p className="text-xs text-gray-400">{totalDiscs} discer</p>
        </div>
      </div>

      {/* Bag shape */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 420 }}>
        {/* Bag body - black fabric */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 rounded-2xl" />

        {/* Fabric texture - canvas weave */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.2) 1px, rgba(255,255,255,0.2) 2px),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.2) 1px, rgba(255,255,255,0.2) 2px)`,
          backgroundSize: '4px 4px',
        }} />

        {/* === TOP: Handle & Straps === */}
        <div className="relative">
          {/* Handle */}
          <div className="flex justify-center pt-2">
            <div className="w-20 h-4 bg-neutral-700 rounded-b-lg border-x-2 border-b-2 border-neutral-600/50 shadow-md relative">
              <div className="absolute inset-x-2 top-1 h-[2px] bg-neutral-500/30 rounded" />
            </div>
          </div>
          {/* Straps */}
          <svg className="absolute top-0 left-0 w-full h-12 pointer-events-none" viewBox="0 0 400 48" preserveAspectRatio="none">
            <path d="M90,0 Q75,20 80,48" stroke="rgba(115,115,115,0.3)" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M310,0 Q325,20 320,48" stroke="rgba(115,115,115,0.3)" strokeWidth="7" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* === LID POCKET (Lokket) === */}
        <div className="relative mx-3 mt-4">
          {/* Pocket frame */}
          <div className="relative rounded-xl overflow-hidden border border-neutral-700/60">
            {/* Pocket background - slightly lighter */}
            <div className="absolute inset-0 bg-neutral-800/80" />

            {/* Orange zipper line at top */}
            <div className="relative h-[3px] bg-gradient-to-r from-neutral-700 via-orange-500/60 to-neutral-700">
              {/* Zipper pull */}
              <div className="absolute right-8 -top-1 w-3 h-5 bg-orange-500/70 rounded-sm shadow-sm" />
            </div>

            {/* Lid label */}
            <div className="relative px-4 pt-2 pb-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">Lokket</span>
            </div>

            {/* Lid disc area */}
            <BagDropZone id="bag-lid">
              <SortableContext items={lidDiscs.map((d) => d.id)} strategy={rectSortingStrategy}>
                <div className="relative px-4 pb-3 min-h-[80px]">
                  {lidDiscs.length === 0 ? (
                    <p className="text-neutral-600 text-xs italic text-center py-5">Dra discer hit</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-start">
                      {lidDiscs.map((disc) => (
                        <SortableDisc key={disc.id} disc={disc} onClick={() => onDiscClick(disc)} size={60} />
                      ))}
                    </div>
                  )}
                </div>
              </SortableContext>
            </BagDropZone>
          </div>
        </div>

        {/* === DIVIDER - bag opening with orange pulls === */}
        <div className="relative mx-3 my-2">
          <div className="h-[3px] bg-gradient-to-r from-neutral-700 via-orange-500/50 to-neutral-700 rounded">
            <div className="absolute left-6 -top-1 w-2 h-5 bg-orange-500/60 rounded-sm" />
            <div className="absolute right-6 -top-1 w-2 h-5 bg-orange-500/60 rounded-sm" />
          </div>
        </div>

        {/* === MAIN COMPARTMENT === */}
        <div className="relative mx-3 mb-3">
          <div className="relative rounded-xl overflow-hidden border border-neutral-700/60">
            <div className="absolute inset-0 bg-neutral-850/90 bg-gradient-to-b from-neutral-800/50 to-neutral-900/80" />

            {/* Main label */}
            <div className="relative px-4 pt-2 pb-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">Hovedrom</span>
            </div>

            {/* Main disc area */}
            <BagDropZone id="bag-main">
              <SortableContext items={mainDiscs.map((d) => d.id)} strategy={rectSortingStrategy}>
                <div className="relative px-4 pb-4 min-h-[140px]">
                  {mainDiscs.length === 0 ? (
                    <p className="text-neutral-600 text-xs italic text-center py-10">Dra discer hit</p>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-start">
                      {mainDiscs.map((disc) => (
                        <SortableDisc key={disc.id} disc={disc} onClick={() => onDiscClick(disc)} />
                      ))}
                    </div>
                  )}
                </div>
              </SortableContext>
            </BagDropZone>
          </div>
        </div>

        {/* === SIDE POCKETS visual hints === */}
        <svg className="absolute top-20 left-0 bottom-16 w-3 pointer-events-none" viewBox="0 0 12 200" preserveAspectRatio="none">
          <rect x="0" y="20" width="10" height="160" rx="4" fill="rgba(82,82,82,0.15)" />
          <circle cx="5" cy="50" r="3" fill="rgba(234,88,12,0.25)" />
        </svg>
        <svg className="absolute top-20 right-0 bottom-16 w-3 pointer-events-none" viewBox="0 0 12 200" preserveAspectRatio="none">
          <rect x="2" y="20" width="10" height="160" rx="4" fill="rgba(82,82,82,0.15)" />
          <circle cx="7" cy="50" r="3" fill="rgba(234,88,12,0.25)" />
        </svg>

        {/* === BOTTOM - reinforced base === */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-6 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-1 left-3 right-3 h-[2px] bg-neutral-600/20 rounded" />
        </div>
      </div>
    </motion.div>
  );
}

export default BagZone;
