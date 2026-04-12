import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDiscs, DISC_TYPE_LABELS, safeImageUrl } from '../services/discs';
import type { Disc, DiscType } from '../services/discs';
import DiscSvg from './DiscSvg';
import DiscDetailModal from './DiscDetailModal';

const TYPE_ORDER: DiscType[] = ['distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'];

function AllDiscs() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);
  const [filterType, setFilterType] = useState<DiscType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'bag' | 'shelf' | 'lost'>('all');

  useEffect(() => {
    fetchDiscs();
  }, []);

  const fetchDiscs = async () => {
    try {
      const { data } = await getDiscs();
      if (data) setDiscs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filtered = discs.filter((d) => {
    if (filterType !== 'all' && d.disc_type !== filterType) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    label: DISC_TYPE_LABELS[type],
    discs: filtered.filter((d) => d.disc_type === type),
  })).filter((g) => g.discs.length > 0);

  const handleDiscUpdate = (updatedDisc: Disc) => {
    setDiscs((prev) => prev.map((d) => (d.id === updatedDisc.id ? updatedDisc : d)));
  };

  const handleDiscDelete = (discId: number) => {
    setDiscs((prev) => prev.filter((d) => d.id !== discId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white">Alle discer</h2>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DiscType | 'all')}
            className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 text-sm"
          >
            <option value="all">Alle typer</option>
            {TYPE_ORDER.map((type) => (
              <option key={type} value={type}>{DISC_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'bag' | 'shelf' | 'lost')}
            className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 text-sm"
          >
            <option value="all">Alle steder</option>
            <option value="bag">I bagen</option>
            <option value="shelf">På hylla</option>
            <option value="lost">Mistet</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Ingen discer funnet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <motion.div
              key={group.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-300 mb-3 flex items-center gap-2">
                {group.label}
                <span className="text-sm font-normal text-gray-500">({group.discs.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.discs.map((disc) => (
                  <motion.div
                    key={disc.id}
                    onClick={() => setSelectedDisc(disc)}
                    className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700/60 transition-colors border border-slate-700/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-600 shrink-0">
                      {safeImageUrl(disc.photo_url) ? (
                        <img
                          src={safeImageUrl(disc.photo_url)!}
                          alt={`${disc.brand} ${disc.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DiscSvg color={disc.color || '#e74c3c'} size={56} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">
                        {disc.brand} {disc.model}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          disc.status === 'bag'
                            ? 'bg-emerald-900/50 text-emerald-300'
                            : disc.status === 'shelf'
                            ? 'bg-amber-900/50 text-amber-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {disc.status === 'bag' ? 'Bag' : disc.status === 'shelf' ? 'Hylle' : 'Mistet'}
                        </span>
                        {disc.is_ace && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-yellow-900/50 text-yellow-300">
                            Ace
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedDisc && (
          <DiscDetailModal
            disc={selectedDisc}
            isOpen={true}
            onClose={() => setSelectedDisc(null)}
            onUpdate={handleDiscUpdate}
            onDelete={handleDiscDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AllDiscs;
