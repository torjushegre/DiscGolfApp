import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getDiscs, DISC_TYPE_LABELS } from '../services/discs';
import type { Disc, DiscType } from '../services/discs';

const TYPE_ORDER: DiscType[] = ['distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'];

function ProfilePage() {
  const { user, signOut } = useAuth();

  const initialName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    '';

  const [displayName, setDisplayName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDiscs();
        if (data) setDiscs(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveName = async () => {
    const trimmed = displayName.trim().slice(0, 50);
    if (!trimmed) {
      setSaveError('Navnet kan ikke være tomt');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
      if (error) throw error;
      setDisplayName(trimmed);
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Klarte ikke å lagre';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const total = discs.length;
  const byStatus = {
    bag: discs.filter((d) => d.status === 'bag').length,
    shelf: discs.filter((d) => d.status === 'shelf').length,
    lost: discs.filter((d) => d.status === 'lost').length,
  };
  const aces = discs.filter((d) => d.is_ace).length;
  const byType = TYPE_ORDER.map((type) => ({
    type,
    label: DISC_TYPE_LABELS[type],
    count: discs.filter((d) => d.disc_type === type).length,
  })).filter((t) => t.count > 0);

  const brandCounts = discs.reduce<Record<string, number>>((acc, d) => {
    acc[d.brand] = (acc[d.brand] || 0) + 1;
    return acc;
  }, {});
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
    : '';

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const email = user?.email || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header card */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full border-2 border-slate-600" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl">
              👤
            </div>
          )}
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 text-lg"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? 'Lagrer...' : 'Lagre'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(initialName);
                      setSaveError(null);
                    }}
                    disabled={saving}
                    className="px-4 py-1.5 text-gray-400 hover:text-white text-sm"
                  >
                    Avbryt
                  </button>
                </div>
                {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white truncate">{displayName || 'Uten navn'}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    Rediger
                  </button>
                </div>
                <p className="text-gray-400 text-sm truncate">{email}</p>
                {memberSince && <p className="text-gray-500 text-xs mt-1">Medlem siden {memberSince}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Statistikk</h2>
        {loading ? (
          <p className="text-gray-400">Laster...</p>
        ) : total === 0 ? (
          <p className="text-gray-400">Du har ikke lagt til noen discer ennå.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Totalt" value={total} color="text-white" />
              <StatCard label="I bagen" value={byStatus.bag} color="text-emerald-300" />
              <StatCard label="På hylla" value={byStatus.shelf} color="text-amber-300" />
              <StatCard label="Mistet" value={byStatus.lost} color="text-red-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Aces 🏆" value={aces} color="text-yellow-300" />
              <StatCard
                label="Favoritt-brand"
                value={topBrands[0]?.[0] || '—'}
                subvalue={topBrands[0] ? `${topBrands[0][1]} discer` : undefined}
                color="text-pink-300"
              />
            </div>

            {byType.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Fordeling per type</h3>
                <div className="space-y-2">
                  {byType.map((t) => (
                    <div key={t.type} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-36 shrink-0">{t.label}</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(t.count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8 text-right">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topBrands.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Topp brands</h3>
                <div className="flex flex-wrap gap-2">
                  {topBrands.map(([brand, count]) => (
                    <span
                      key={brand}
                      className="px-3 py-1 bg-slate-900 text-gray-300 rounded-full text-sm border border-slate-700"
                    >
                      {brand} <span className="text-gray-500">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account actions */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Konto</h2>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium"
        >
          Logg ut
        </button>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  color: string;
}

function StatCard({ label, value, subvalue, color }: StatCardProps) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color} truncate`}>{value}</p>
      {subvalue && <p className="text-xs text-gray-500 mt-0.5">{subvalue}</p>}
    </div>
  );
}

export default ProfilePage;
