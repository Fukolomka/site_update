'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CaseCard } from '@/components/CaseCard';
import { Button } from '@/components/ui/button';
import { Case } from '@/types';

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
    fetchUser();
    
    // Check for auth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setAuthError(error);
      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      if (data.success) {
        setCases(data.data);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.data); // авторизованный пользователь
      } else {
        setUser(null); // гость
      }
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      setUser(null); // на всякий случай
    }
  };


  const handleLogin = () => {
    window.location.href = '/api/auth/steam';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleOpenCase = (caseId: string) => {
    window.location.href = `/open/${caseId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка кейсов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      {/* Auth Error Display */}
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-7xl mx-auto mt-4">
          <strong className="font-bold">Ошибка авторизации: </strong>
          <span className="block sm:inline">
            {authError === 'invalid_auth' && 'Неверные данные авторизации Steam'}
            {authError === 'invalid_steam_id' && 'Не удалось получить Steam ID'}
            {authError === 'steam_api_error' && 'Ошибка API Steam'}
            {authError === 'database_error' && 'Ошибка базы данных'}
            {authError === 'server_error' && 'Внутренняя ошибка сервера'}
            {!['invalid_auth', 'invalid_steam_id', 'steam_api_error', 'database_error', 'server_error'].includes(authError) && authError}
          </span>
          <button
            onClick={() => setAuthError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Закрыть</span>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Закрыть</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              CS2 Case Opening
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Open cases, win skins, and build your inventory
            </p>
            {!user && (
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                Login with Steam to Start
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cases Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Available Cases
          </h2>
          <p className="text-lg text-gray-600">
            Choose from our collection of CS2 cases
          </p>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cases available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                case={caseItem}
                onOpen={handleOpenCase}
              />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Site?
            </h2>
            <p className="text-lg text-gray-600">
              The best CS2 case opening experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Opening</h3>
              <p className="text-gray-600">
                Open cases instantly with smooth animations and real-time results
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Fair</h3>
              <p className="text-gray-600">
                All case openings are provably fair and secure with Steam authentication
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Withdrawal</h3>
              <p className="text-gray-600">
                Withdraw your items directly to Steam or sell them on our marketplace
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}