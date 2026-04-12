import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Rommet', path: '/' },
    { name: 'Alle discer', path: '/all-discs' },
    { name: 'Legg til', path: '/add-disc' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    '';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
            <img src="/vaulta-logo.png" alt="" className="h-9 w-9 rounded-full" />
            Vaulta
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
            <Link
              to="/profile"
              className={`ml-4 pl-4 border-l border-slate-700/50 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'text-emerald-300'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full border border-slate-600" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-sm">👤</div>
              )}
              <span className="text-sm hidden sm:inline">{displayName}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
