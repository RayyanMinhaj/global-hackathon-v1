import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentPage, useAuth, useTheme, useSidebar } from '../hooks';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useCurrentPage();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [theme, setTheme] = useTheme();
  const [sidebarOpen, setSidebarOpen] = useSidebar();

  // Update current page when location changes
  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'home';
    setCurrentPage(path);
  }, [location, setCurrentPage]);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogin = () => {
    // Example login
    login({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <nav className={`navigation ${theme}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            Hackathon App
          </Link>
          <button onClick={toggleSidebar} className="sidebar-toggle">
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <div className="nav-controls">
          <span className="current-page">Current: {currentPage}</span>
          
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={logout} className="auth-btn">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="auth-btn">Login</button>
          )}
          
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
