'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ItemCard } from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Case, Item, CaseOpeningResult } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function CaseOpeningPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<CaseOpeningResult | null>(null);
  const [animationItems, setAnimationItems] = useState<Item[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchCaseData();
    fetchUser();
  }, []);

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setCaseData(data.data);
      }
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleOpenCase = async () => {
    if (!user) {
      alert('Please login to open cases');
      return;
    }

    if (!caseData) return;

    if (user.balance < caseData.price) {
      alert('Insufficient balance');
      return;
    }

    setOpening(true);
    setShowResult(false);

    try {
      const response = await fetch(`/api/cases/${params.id}/open`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        setAnimationItems(data.data.animationData.items);
        
        // Start animation
        setTimeout(() => {
          setShowResult(true);
        }, 3000);
        
        // Update user balance
        setUser(prev => prev ? { ...prev, balance: prev.balance - caseData.price } : null);
      } else {
        alert(data.error || 'Failed to open case');
      }
    } catch (error) {
      console.error('Error opening case:', error);
      alert('Failed to open case');
    } finally {
      setOpening(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/steam';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Case not found</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{caseData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <img 
                src={caseData.image} 
                alt={caseData.name}
                className="w-48 h-48 object-cover mx-auto mb-4 rounded-lg"
              />
              <p className="text-gray-600 mb-4">{caseData.description}</p>
              <p className="text-2xl font-bold text-blue-600 mb-6">
                {formatCurrency(caseData.price)}
              </p>
              
              {user ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your Balance: {formatCurrency(user.balance)}
                  </p>
                  <Button
                    onClick={handleOpenCase}
                    disabled={opening || user.balance < caseData.price}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg"
                  >
                    {opening ? 'Opening...' : 'Open Case'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                >
                  Login with Steam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Animation Area */}
        {opening && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Opening Case...</h3>
              </div>
              <div className="relative overflow-hidden h-32 bg-gray-200 rounded-lg">
                <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
                <div className="flex items-center h-full animate-pulse">
                  {animationItems.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-24 h-24 mx-2">
                      <ItemCard item={item} size="md" showPrice={false} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {showResult && result && (
          <Card className="mb-8 border-green-500 border-2">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-green-600">
                  Congratulations!
                </h3>
                <p className="text-lg mb-4">You won:</p>
                <div className="flex justify-center mb-4">
                  <ItemCard item={result.item} size="lg" />
                </div>
                <p className="text-xl font-semibold mb-6">
                  {result.item.name}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => router.push('/inventory')}>
                    View Inventory
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Open Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Case Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Case Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {caseData.items?.map((caseItem) => (
                <div key={caseItem.id} className="text-center">
                  <ItemCard item={caseItem.item} size="md" />
                  <p className="text-xs text-gray-500 mt-1">
                    {caseItem.dropRate}% chance
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}