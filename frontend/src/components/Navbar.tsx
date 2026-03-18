import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Bag', path: '/bag' },
    { name: 'Shelf', path: '/shelf' },
    { name: 'Wall of Fame', path: '/wall-of-fame' },
    { name: 'Add Disc', path: '/add-disc' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold mb-4 md:mb-0">
            Disc Golf Collection
          </Link>
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  isActive(item.path)
                    ? 'bg-gray-700 ring-1 ring-gray-500'
                    : 'hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
