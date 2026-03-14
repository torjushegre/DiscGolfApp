import { useEffect, useState } from 'react';
import { getWallOfFame } from '../services/discs';
import type { Disc } from '../services/discs';
import Confetti from './Confetti';

function WallOfFame() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscs();
  }, []);

  const fetchDiscs = async () => {
    try {
      const { data, error: fetchError } = await getWallOfFame();
      if (fetchError) throw fetchError;
      setDiscs(data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load Wall of Fame');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading Wall of Fame...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      <Confetti />
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg p-8 text-center mb-8 shadow-lg">
        <h2 className="text-4xl font-bold text-white mb-2">Wall of Fame</h2>
        <p className="text-amber-100 text-lg">Celebrating your ace throws!</p>
      </div>

      {discs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No aces yet</p>
          <p className="text-gray-400 text-sm mt-2">Add discs to the Wall of Fame after an ace</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discs.map((disc) => (
            <div key={disc.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
              {disc.photo_url && (
                <img
                  src={disc.photo_url}
                  alt={`${disc.brand} ${disc.model}`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {disc.brand} {disc.model}
                  </h3>
                  <span className="text-3xl font-bold text-amber-500">Ace!</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {disc.disc_type}
                  </span>
                  <span className="text-sm text-gray-600 font-mono">
                    {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </span>
                </div>
                {disc.ace_course && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800 font-medium">
                      <strong>{disc.ace_course}</strong> - Hole {disc.ace_hole}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Added on {new Date(disc.created_at).toLocaleDateString('nb-NO')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WallOfFame;
