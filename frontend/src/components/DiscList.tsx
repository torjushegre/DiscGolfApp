import { useEffect, useState } from 'react';
import { getDiscs } from '../services/discs';
import type { Disc } from '../services/discs';
import DiscCard from './DiscCard';
import Confetti from './Confetti';

interface DiscListProps {
  status: 'bag' | 'shelf' | 'wall_of_fame';
  title: string;
  emptyMessage: string;
  emptyHint: string;
  showConfetti?: boolean;
  headerClassName?: string;
}

function DiscList({
  status,
  title,
  emptyMessage,
  emptyHint,
  showConfetti = false,
  headerClassName,
}: DiscListProps) {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscs();
  }, [status]);

  const fetchDiscs = async () => {
    try {
      const { data, error: fetchError } = await getDiscs(status);
      if (fetchError) throw fetchError;
      setDiscs(data || []);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load ${title.toLowerCase()}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  const isHighlight = status === 'wall_of_fame';

  return (
    <div className="max-w-6xl mx-auto relative">
      {showConfetti && <Confetti />}

      {headerClassName ? (
        <div className={`${headerClassName} mb-8`}>
          <h2 className="text-4xl font-bold text-white mb-2">{title}</h2>
          <p className="text-amber-100 text-lg">
            {discs.length === 0
              ? 'No aces yet - go throw some!'
              : 'Celebrating your ace throws!'}
          </p>
        </div>
      ) : (
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
      )}

      {discs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
          <p className="text-gray-400 text-sm mt-2">{emptyHint}</p>
        </div>
      ) : (
        <div
          className={
            isHighlight
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {discs.map((disc) => (
            <DiscCard
              key={disc.id}
              disc={disc}
              onStatusChange={fetchDiscs}
              variant={isHighlight ? 'highlight' : 'default'}
              showAceInfo={isHighlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscList;
