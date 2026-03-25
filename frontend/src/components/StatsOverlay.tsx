import { motion } from 'framer-motion';

interface StatsOverlayProps {
  total: number;
  bag: number;
  shelf: number;
  aces: number;
}

function StatsOverlay({ total, bag, shelf, aces }: StatsOverlayProps) {
  const stats = [
    { label: 'Totalt', value: total, color: 'text-white' },
    { label: 'I bagen', value: bag, color: 'text-emerald-300' },
    { label: 'På hylla', value: shelf, color: 'text-amber-300' },
    { label: 'Aces', value: aces, color: 'text-yellow-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-4"
    >
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <motion.p
              className={`text-3xl font-bold ${stat.color}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              {stat.value}
            </motion.p>
            <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default StatsOverlay;
