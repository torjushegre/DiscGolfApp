import { moveDisc } from '../services/discs';
import type { Disc } from '../services/discs';

interface DiscCardProps {
  disc: Disc;
  onStatusChange: () => void;
  variant?: 'default' | 'highlight';
  showAceInfo?: boolean;
  children?: React.ReactNode;
}

function DiscCard({
  disc,
  onStatusChange,
  variant = 'default',
  showAceInfo = false,
  children,
}: DiscCardProps) {
  const handleStatusChange = async (discId: number, newStatus: string) => {
    const { error } = await moveDisc(discId, newStatus);
    if (!error) {
      onStatusChange();
    }
  };

  const cardClasses =
    variant === 'highlight'
      ? 'bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200'
      : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

  const typeClasses =
    variant === 'highlight'
      ? 'px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800'
      : disc.status === 'shelf'
        ? 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
        : 'px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';

  return (
    <div key={disc.id} className={cardClasses}>
      {disc.photo_url && (
        <img
          src={disc.photo_url}
          alt={`${disc.brand} ${disc.model}`}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {disc.brand} {disc.model}
          </h3>
          {variant === 'highlight' && (
            <span className="text-2xl font-bold text-amber-500">Ace!</span>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className={typeClasses}>{disc.disc_type}</span>
          <span className="text-sm text-gray-600 font-mono">
            {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
          </span>
        </div>

        {showAceInfo && disc.ace_course && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
            <p className="text-green-800 font-medium">
              <strong>{disc.ace_course}</strong> - Hole {disc.ace_hole}
            </p>
          </div>
        )}

        {children || (
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
        )}
      </div>
    </div>
  );
}

export default DiscCard;
