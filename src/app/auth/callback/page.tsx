'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleSteamCallback } from '@/lib/steamAuth';
import { SteamUser } from '@/types';

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const user = await handleSteamCallback();
        
        if (user) {
          // Успешная авторизация
          console.log('Steam auth successful:', user);
          router.push('/');
        } else {
          // Ошибка авторизации
          setError('Failed to authenticate with Steam');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing Steam authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}