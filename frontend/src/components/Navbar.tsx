import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Rommet', path: '/' },
    { name: 'Alle discer', path: '/all-discs' },
    { name: 'Legg til', path: '/add-disc' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            DiscVault
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-slate-700/50 flex items-center gap-3">
              <span className="text-sm text-gray-400 hidden sm:inline">{displayName}</span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Logg ut
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
