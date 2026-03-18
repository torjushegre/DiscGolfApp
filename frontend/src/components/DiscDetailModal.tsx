import { useState } from 'react';
import { updateDisc, deleteDisc } from '../services/discs';
import type { Disc } from '../services/discs';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [brand, setBrand] = useState(disc.brand);
  const [model, setModel] = useState(disc.model);
  const [discType, setDiscType] = useState(disc.disc_type);
  const [speed, setSpeed] = useState(disc.speed);
  const [glide, setGlide] = useState(disc.glide);
  const [turn, setTurn] = useState(disc.turn);
  const [fade, setFade] = useState(disc.fade);
  const [status, setStatus] = useState(disc.status);
  const [comment, setComment] = useState(disc.comment || '');
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
        comment: comment || undefined,
        ...(status === 'wall_of_fame' && {
          ace_course: aceCourse || undefined,
          ace_hole: aceHole,
        }),
      };

      const { data, error: updateError } = await updateDisc(disc.id, updateData);

      if (updateError) throw updateError;
      if (data) {
        onUpdate(data);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Failed to update disc:', err);
      setError(err?.message || 'Failed to update disc');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await deleteDisc(disc.id);
      if (deleteError) throw deleteError;
      onDelete(disc.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete disc:', err);
      setError(err?.message || 'Failed to delete disc');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Disc' : `${disc.brand} ${disc.model}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Photo */}
          {disc.photo_url && (
            <div className="flex justify-center mb-6">
              <img
                src={disc.photo_url}
                alt={`${disc.brand} ${disc.model}`}
                className="w-48 h-48 object-cover rounded-full border-4 border-gray-200"
              />
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select brand...</option>
                    <option value="Discraft">Discraft</option>
                    <option value="Innova">Innova</option>
                    <option value="Discmania">Discmania</option>
                    <option value="MVP">MVP</option>
                    <option value="Latitude 64">Latitude 64</option>
                    <option value="Dynamic">Dynamic</option>
                    <option value="Prodigy">Prodigy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <div className="flex gap-4">
                  {['driver', 'midrange', 'approach', 'putter'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        value={type}
                        checked={discType === type}
                        onChange={() => setDiscType(type)}
                        className="mr-2"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Flight Numbers</label>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="shelf">Shelf</option>
                  <option value="bag">Bag</option>
                  <option value="wall_of_fame">Wall of Fame</option>
                </select>
              </div>

              {status === 'wall_of_fame' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Course</label>
                    <input
                      type="text"
                      value={aceCourse}
                      onChange={(e) => setAceCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Course name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Hole</label>
                    <input
                      type="number"
                      value={aceHole}
                      onChange={(e) => setAceHole(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min={1}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Optional comment..."
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <p className="font-medium capitalize">{disc.disc_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Flight Numbers</span>
                  <p className="font-medium font-mono">
                    {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Location</span>
                <p className="font-medium capitalize">{disc.status.replace('_', ' ')}</p>
              </div>

              {disc.ace_course && (
                <div>
                  <span className="text-sm text-gray-500">Ace</span>
                  <p className="font-medium">{disc.ace_course} - Hole {disc.ace_hole}</p>
                </div>
              )}

              {disc.comment && (
                <div>
                  <span className="text-sm text-gray-500">Comment</span>
                  <p className="italic text-gray-700">"{disc.comment}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          {!isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}

          <div className="flex gap-3 ml-auto">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Disc?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {disc.brand} {disc.model}? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscDetailModal;
