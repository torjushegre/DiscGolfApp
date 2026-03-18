import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDiscs } from '../services/discs';
import type { Disc } from '../services/discs';

function Dashboard() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscs();
  }, []);

  const fetchDiscs = async () => {
    try {
      const { data, error } = await getDiscs();
      if (error) throw error;
      setDiscs(data || []);
    } catch (err) {
      console.error('Failed to load discs:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDiscs = discs.length;
  const bagCount = discs.filter((d) => d.status === 'bag').length;
  const shelfCount = discs.filter((d) => d.status === 'shelf').length;
  const acesCount = discs.filter((d) => d.status === 'wall_of_fame').length;

  const recentDiscs = discs.slice(0, 3);

  const navCards = [
    {
      name: 'My Bag',
      path: '/bag',
      description: `${bagCount} discs ready to throw`,
      icon: '🎒',
      color: 'bg-blue-500',
    },
    {
      name: 'Shelf',
      path: '/shelf',
      description: `${shelfCount} discs in storage`,
      icon: '📦',
      color: 'bg-green-500',
    },
    {
      name: 'Wall of Fame',
      path: '/wall-of-fame',
      description: `${acesCount} aces celebrated`,
      icon: '🏆',
      color: 'bg-amber-500',
    },
    {
      name: 'Add Disc',
      path: '/add-disc',
      description: 'Add a new disc to your collection',
      icon: '➕',
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your collection...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          My Disc Golf Collection
        </h1>
        <p className="text-gray-600">Track, manage, and celebrate your discs</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-3xl font-bold text-gray-800">{totalDiscs}</p>
          <p className="text-sm text-gray-600 mt-1">Total Discs</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{bagCount}</p>
          <p className="text-sm text-gray-600 mt-1">In Bag</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{shelfCount}</p>
          <p className="text-sm text-gray-600 mt-1">On Shelf</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-3xl font-bold text-amber-600">{acesCount}</p>
          <p className="text-sm text-gray-600 mt-1">Aces</p>
        </div>
      </div>

      {/* Quick Navigation */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {navCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{card.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Additions */}
      {recentDiscs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recently Added</h2>
            <Link
              to="/shelf"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDiscs.map((disc) => (
              <div
                key={disc.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
              >
                {disc.photo_url ? (
                  <img
                    src={disc.photo_url}
                    alt={`${disc.brand} ${disc.model}`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                    {disc.disc_type === 'driver' && '🥏'}
                    {disc.disc_type === 'midrange' && '🎯'}
                    {disc.disc_type === 'putter' && '🕳️'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800">
                    {disc.brand} {disc.model}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{disc.disc_type}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalDiscs === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-4xl mb-4">🥏</p>
          <p className="text-gray-600 text-lg">No discs in your collection yet.</p>
          <Link
            to="/add-disc"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700"
          >
            Add Your First Disc
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
