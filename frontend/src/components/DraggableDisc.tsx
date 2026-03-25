import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DiscSvg from './DiscSvg';

interface DraggableDiscProps {
  disc: Disc;
  onClick?: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

function DraggableDisc({ disc, onClick, isDragging = false, compact = false }: DraggableDiscProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: disc.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const size = compact ? 56 : 72;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-80 scale-110 z-50' : ''}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {/* Disc image or SVG */}
      <div
        className="rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-black/20"
        style={{ width: size, height: size }}
      >
        {disc.photo_url ? (
          <img
            src={disc.photo_url}
            alt={`${disc.brand} ${disc.model}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <DiscSvg color={disc.color || '#e74c3c'} size={size} />
        )}
      </div>

      {/* Ace badge */}
      {disc.is_ace && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] shadow-md border border-yellow-500 leading-none">
          🏆
        </div>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <p className="font-bold">{disc.brand} {disc.model}</p>
          <p className="text-gray-300">
            {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default DraggableDisc;
