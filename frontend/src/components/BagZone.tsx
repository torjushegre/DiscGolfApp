import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import SortableDisc from './SortableDisc';

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
      style={{ minHeight: 320 }}
    >
      {/* Bag body - dark fabric */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-2xl" />

      {/* Fabric texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 5px)',
      }} />

      {/* Bag structure SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 360" preserveAspectRatio="none">
        {/* Shoulder strap left */}
        <path d="M80,0 Q60,30 70,60" stroke="rgba(100,116,139,0.4)" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Shoulder strap right */}
        <path d="M320,0 Q340,30 330,60" stroke="rgba(100,116,139,0.4)" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Top handle */}
        <path d="M160,6 Q200,-6 240,6" stroke="rgba(100,116,139,0.5)" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Bag opening / rim */}
        <path d="M40,55 Q200,75 360,55" stroke="rgba(16,185,129,0.25)" strokeWidth="3" fill="none" />
        {/* Left side seam */}
        <line x1="45" y1="55" x2="30" y2="350" stroke="rgba(100,116,139,0.15)" strokeWidth="2" />
        {/* Right side seam */}
        <line x1="355" y1="55" x2="370" y2="350" stroke="rgba(100,116,139,0.15)" strokeWidth="2" />
        {/* Side pocket left */}
        <path d="M30,120 Q15,180 30,240" stroke="rgba(100,116,139,0.2)" strokeWidth="2" fill="none" />
        <path d="M30,170 L12,170" stroke="rgba(100,116,139,0.15)" strokeWidth="1.5" />
        {/* Side pocket right */}
        <path d="M370,120 Q385,180 370,240" stroke="rgba(100,116,139,0.2)" strokeWidth="2" fill="none" />
        <path d="M370,170 L388,170" stroke="rgba(100,116,139,0.15)" strokeWidth="1.5" />
        {/* Putter pocket */}
        <rect x="145" y="10" width="110" height="40" rx="8" fill="rgba(30,41,59,0.4)" stroke="rgba(100,116,139,0.2)" strokeWidth="1.5" />
        <text x="200" y="35" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="11" fontWeight="bold">PUTTER</text>
      </svg>

      {/* Emerald accent line at bag opening */}
      <div className="absolute top-[52px] left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="relative px-6 pt-16 pb-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bagen</h3>
            <p className="text-xs text-gray-400">{discs.length} discer</p>
          </div>
        </div>

        <SortableContext items={discs.map((d) => d.id)} strategy={rectSortingStrategy}>
          {discs.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 text-sm italic">
                Dra discer hit for å legge dem i bagen
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-start">
              {discs.map((disc) => (
                <SortableDisc
                  key={disc.id}
                  disc={disc}
                  onClick={() => onDiscClick(disc)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>

      {/* Bag bottom - reinforced base */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-950 to-transparent" />
    </motion.div>
  );
}

export default BagZone;
