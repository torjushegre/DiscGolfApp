import { useEffect, useState } from 'react';
import { getBag, moveDisc } from '../services/discs';
import type { Disc } from '../services/discs';

function Bag() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscs();
  }, []);

  const fetchDiscs = async () => {
    try {
      const { data, error: fetchError } = await getBag();
      if (fetchError) throw fetchError;
      setDiscs(data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load discs');
      setLoading(false);
    }
  };

  const handleStatusChange = async (discId: number, newStatus: string) => {
    try {
      const { error: moveError } = await moveDisc(discId, newStatus);
      if (moveError) throw moveError;
      fetchDiscs();
    } catch (err) {
      setError('Failed to update disc status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bag...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Disc Bag</h2>
      {discs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Your bag is empty</p>
          <p className="text-gray-400 text-sm mt-2">Add discs from the Shelf</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discs.map((disc) => (
            <div key={disc.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {disc.photo_url && (
                <img
                  src={disc.photo_url}
                  alt={`${disc.brand} ${disc.model}`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {disc.brand} {disc.model}
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {disc.disc_type}
                  </span>
                  <span className="text-sm text-gray-600">
                    {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <select
                    className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={disc.status}
                    onChange={(e) => handleStatusChange(disc.id, e.target.value)}
                  >
                    <option value="bag">Bag</option>
                    <option value="shelf">Shelf</option>
                    <option value="wall_of_fame">Wall of Fame</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bag;
