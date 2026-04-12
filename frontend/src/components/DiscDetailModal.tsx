import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateDisc, deleteDisc, markDiscAsLost, DISC_TYPE_LABELS, DISC_COLORS, safeImageUrl } from '../services/discs';
import type { Disc, DiscType, DiscStatus } from '../services/discs';
import DiscSvg from './DiscSvg';

const TYPE_ORDER: DiscType[] = ['distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'];

interface DiscDetailModalProps {
  disc: Disc;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedDisc: Disc) => void;
  onDelete: (discId: number) => void;
}

function DiscDetailModal({ disc, isOpen, onClose, onUpdate, onDelete }: DiscDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLostConfirm, setShowLostConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [brand, setBrand] = useState(disc.brand);
  const [model, setModel] = useState(disc.model);
  const [discType, setDiscType] = useState<DiscType>(disc.disc_type);
  const [speed, setSpeed] = useState(disc.speed);
  const [glide, setGlide] = useState(disc.glide);
  const [turn, setTurn] = useState(disc.turn);
  const [fade, setFade] = useState(disc.fade);
  const [status, setStatus] = useState<DiscStatus>(disc.status);
  const [color, setColor] = useState(disc.color || '#e74c3c');
  const [comment, setComment] = useState(disc.comment || '');
  const [isAce, setIsAce] = useState(disc.is_ace);
  const [aceCourse, setAceCourse] = useState(disc.ace_course || '');
  const [aceHole, setAceHole] = useState(disc.ace_hole || 1);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        brand,
        model,
        disc_type: discType,
        speed,
        glide,
        turn,
        fade,
        status,
        color,
        comment: comment || undefined,
        is_ace: isAce,
        ...(isAce && {
          ace_course: aceCourse || undefined,
          ace_hole: aceHole,
        }),
        ...(!isAce && {
          ace_course: undefined,
          ace_hole: undefined,
        }),
      };

      const { data, error: updateError } = await updateDisc(disc.id, updateData);
      if (updateError) throw updateError;
      if (data) {
        onUpdate(data);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Klarte ikke å oppdatere');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error: deleteError } = await deleteDisc(disc.id);
      if (deleteError) throw deleteError;
      onDelete(disc.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Klarte ikke å slette');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLost = async () => {
    setLoading(true);
    try {
      const { error: lostError } = await markDiscAsLost(disc.id);
      if (lostError) throw lostError;
      onDelete(disc.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Klarte ikke å markere som mistet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Rediger disc' : `${disc.brand} ${disc.model}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* Photo or SVG */}
          <div className="flex justify-center mb-6">
            {safeImageUrl(disc.photo_url) ? (
              <img
                src={safeImageUrl(disc.photo_url)!}
                alt={`${disc.brand} ${disc.model}`}
                className="w-48 h-48 object-cover rounded-full border-4 border-slate-600"
              />
            ) : (
              <DiscSvg color={disc.color || '#e74c3c'} size={160} />
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">Merke</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="">Velg merke...</option>
                    <option value="Discraft">Discraft</option>
                    <option value="Innova">Innova</option>
                    <option value="Discmania">Discmania</option>
                    <option value="MVP">MVP</option>
                    <option value="Latitude 64">Latitude 64</option>
                    <option value="Dynamic Discs">Dynamic Discs</option>
                    <option value="Prodigy">Prodigy</option>
                    <option value="Kastaplast">Kastaplast</option>
                    <option value="Westside Discs">Westside Discs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">Modell</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPE_ORDER.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiscType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        discType === type
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {DISC_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Flight Numbers</label>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Speed', value: speed, set: setSpeed, min: 0, max: 15 },
                    { name: 'Glide', value: glide, set: setGlide, min: 0, max: 7 },
                    { name: 'Turn', value: turn, set: setTurn, min: -5, max: 5 },
                    { name: 'Fade', value: fade, set: setFade, min: 0, max: 5 },
                  ].map((field) => (
                    <div key={field.name}>
                      <select
                        value={field.value}
                        onChange={(e) => field.set(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-center text-white"
                      >
                        {Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i).map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500 text-center block mt-1">{field.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Plassering</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('bag')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'bag' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-300'
                    }`}
                  >
                    Bag
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('shelf')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'shelf' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-300'
                    }`}
                  >
                    Hylle
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Farge</label>
                <div className="flex gap-2 flex-wrap">
                  {DISC_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        color === c.hex ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Ace toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsAce(!isAce)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isAce ? 'bg-yellow-500' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        isAce ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-gray-300 text-sm font-bold">Ace! 🏆</span>
                </label>
              </div>

              {isAce && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-yellow-900/20 rounded-xl border border-yellow-500/20">
                  <div>
                    <label className="block text-yellow-200 text-sm font-bold mb-2">Bane</label>
                    <input
                      type="text"
                      value={aceCourse}
                      onChange={(e) => setAceCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Banenavn"
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-200 text-sm font-bold mb-2">Hull</label>
                    <input
                      type="number"
                      value={aceHole}
                      onChange={(e) => setAceHole(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min={1}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Kommentar</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Valgfri kommentar..."
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <p className="font-medium text-white">{DISC_TYPE_LABELS[disc.disc_type]}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Flight Numbers</span>
                  <p className="font-medium font-mono text-white">
                    {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Plassering</span>
                <p className="font-medium text-white">
                  {disc.status === 'bag' ? 'I bagen' : disc.status === 'shelf' ? 'På hylla' : 'Mistet'}
                </p>
              </div>

              {disc.is_ace && disc.ace_course && (
                <div className="p-3 bg-yellow-900/20 rounded-xl border border-yellow-500/20">
                  <span className="text-sm text-yellow-300">🏆 Ace</span>
                  <p className="font-medium text-yellow-200">
                    {disc.ace_course} - Hull {disc.ace_hole}
                  </p>
                </div>
              )}

              {disc.comment && (
                <div>
                  <span className="text-sm text-gray-500">Kommentar</span>
                  <p className="italic text-gray-300">"{disc.comment}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-700">
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-400 hover:text-red-300 font-medium"
              >
                Slett
              </button>
              {disc.status !== 'lost' && (
                <button
                  onClick={() => setShowLostConfirm(true)}
                  className="px-4 py-2 text-amber-400 hover:text-amber-300 font-medium"
                >
                  Marker som mistet
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 ml-auto">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Lagrer...' : 'Lagre'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                Rediger
              </button>
            )}
          </div>
        </div>

        {/* Lost Confirmation */}
        {showLostConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Marker som mistet?</h3>
              <p className="text-gray-400 mb-6">
                Marker {disc.brand} {disc.model} som mistet? Du finner den igjen under "Mistet" i Alle discer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLostConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleMarkLost}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? 'Lagrer...' : 'Marker som mistet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Slette disc?</h3>
              <p className="text-gray-400 mb-6">
                Er du sikker på at du vil slette {disc.brand} {disc.model}? Dette kan ikke angres.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Sletter...' : 'Slett'}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default DiscDetailModal;
