import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Disc } from '../services/discs';
import DiscSvg from './DiscSvg';

interface SortableDiscProps {
  disc: Disc;
  onClick?: () => void;
  size?: number;
  idPrefix?: string;
}

function SortableDisc({ disc, onClick, size = 72, idPrefix = '' }: SortableDiscProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idPrefix ? `${idPrefix}${disc.id}` : disc.id,
    data: { disc },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transition }}
        className="rounded-full border-2 border-dashed border-white/30"
        {...attributes}
        {...listeners}
      >
        <div style={{ width: size, height: size }} />
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="relative group cursor-grab active:cursor-grabbing hover:z-50"
      whileHover={{ scale: 1.08 }}
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

export default SortableDisc;
