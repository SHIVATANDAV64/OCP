import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-[#FDFCF9] border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-gray-800" />
            <span className="text-xl font-semibold text-gray-900">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-gray-900 transition-colors">
              Courses
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  {(user as any).avatar ? (
                    <img
                      src={(user as any).avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-300">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} variant="outline" className="border-gray-300">
                  Login
                </Button>
                <Button onClick={() => navigate('/auth')} className="bg-gray-900 hover:bg-gray-800">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/courses" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
              Courses
            </Link>
            {user && (
              <Link to="/dashboard" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            )}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-700 text-sm py-2">
                    {(user as any).avatar ? (
                      <img
                        src={(user as any).avatar}
                        alt={user.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span>Logged in as {user.name}</span>
                  </div>
                  <Button onClick={() => { setIsOpen(false); navigate('/profile'); }} variant="outline" className="w-full border-gray-300">
                    Profile
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full border-gray-300">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/auth')} variant="outline" className="w-full border-gray-300">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-gray-900 hover:bg-gray-800">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}