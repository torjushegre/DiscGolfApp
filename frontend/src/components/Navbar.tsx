import { Link } from 'react-router-dom';

function Navbar() {
  const navItems = [
    { name: 'Bag', path: '/bag' },
    { name: 'Shelf', path: '/shelf' },
    { name: 'Wall of Fame', path: '/wall-of-fame' },
    { name: 'Add Disc', path: '/add-disc' },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
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
                className="px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
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
