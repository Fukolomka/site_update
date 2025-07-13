'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Wallet, 
  Package, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">CS2 Cases</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/cases" className="hover:text-blue-400 transition-colors">
              Cases
            </Link>
            {user && (
              <Link href="/inventory" className="hover:text-blue-400 transition-colors">
                Inventory
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="hover:text-blue-400 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span className="font-semibold">${user.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.avatar && (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>{user.username}</span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={onLogin}
                className="bg-green-600 hover:bg-green-700"
              >
                Login with Steam
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium hover:bg-gray-700 rounded-md"
              >
                Home
              </Link>
              <Link
                href="/cases"
                className="block px-3 py-2 text-base font-medium hover:bg-gray-700 rounded-md"
              >
                Cases
              </Link>
              {user && (
                <Link
                  href="/inventory"
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-700 rounded-md"
                >
                  Inventory
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-700 rounded-md"
                >
                  Admin
                </Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    {user.avatar && (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{user.username}</div>
                    <div className="text-sm text-gray-400">${user.balance.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="px-5">
                  <Button
                    onClick={onLogin}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Login with Steam
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}