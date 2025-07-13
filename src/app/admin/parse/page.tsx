'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { getCurrentUser } from '@/lib/steamAuth';
import { SteamUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  Filter,
  Shield,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';

interface ParsedItem {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: string;
  type: string;
  price: number;
  marketPrice: number;
  isNew: boolean;
  isDuplicate: boolean;
}

interface ParseSettings {
  maxItems: number;
  minPrice: number;
  maxPrice: number;
  rarityFilter: string[];
  typeFilter: string[];
  searchQuery: string;
}

export default function AdminParsePage() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [parseSettings, setParseSettings] = useState<ParseSettings>({
    maxItems: 50,
    minPrice: 0,
    maxPrice: 1000,
    rarityFilter: [],
    typeFilter: [],
    searchQuery: ''
  });
  const [stats, setStats] = useState({
    totalFound: 0,
    newItems: 0,
    duplicates: 0,
    totalValue: 0
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }

    checkAdminStatus(currentUser.steamid);
  }, [router]);

  const checkAdminStatus = async (steamId: string) => {
    try {
      const response = await fetch(`/api/admin/check?steamid=${steamId}`);
      const data = await response.json();
      
      if (data.success && data.isAdmin) {
        setUser(getCurrentUser());
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleParseItems = async () => {
    setParsing(true);
    setParsedItems([]);
    setSelectedItems([]);
    
    try {
      const response = await fetch('/api/admin/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parseSettings),
      });

      const data = await response.json();

      if (response.ok) {
        setParsedItems(data.data);
        setStats({
          totalFound: data.data.length,
          newItems: data.data.filter((item: ParsedItem) => item.isNew).length,
          duplicates: data.data.filter((item: ParsedItem) => item.isDuplicate).length,
          totalValue: data.data.reduce((sum: number, item: ParsedItem) => sum + item.price, 0)
        });
        
        showNotification('Items parsed successfully!', 'success');
      } else {
        showNotification(data.error || 'Failed to parse items', 'error');
      }
    } catch (error) {
      console.error('Error parsing items:', error);
      showNotification('Error parsing items', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveItems = async () => {
    if (selectedItems.length === 0) {
      showNotification('Please select items to save', 'warning');
      return;
    }

    setSaving(true);
    try {
      const itemsToSave = parsedItems.filter(item => selectedItems.includes(item.id));
      
      const response = await fetch('/api/admin/parse/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToSave }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Successfully saved ${data.savedCount} items!`, 'success');
        setSelectedItems([]);
        // Обновляем статус сохраненных элементов
        setParsedItems(prev => prev.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, isNew: false }
            : item
        ));
      } else {
        showNotification(data.error || 'Failed to save items', 'error');
      }
    } catch (error) {
      console.error('Error saving items:', error);
      showNotification('Error saving items', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === parsedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(parsedItems.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer grade':
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'industrial grade':
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'mil-spec grade':
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'restricted':
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'classified':
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'covert':
      case 'mythical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'weapon': return 'bg-blue-100 text-blue-800';
      case 'knife': return 'bg-red-100 text-red-800';
      case 'gloves': return 'bg-orange-100 text-orange-800';
      case 'sticker': return 'bg-green-100 text-green-800';
      case 'case': return 'bg-purple-100 text-purple-800';
      case 'key': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading parse panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Parse CS:GO Items</h1>
              <p className="text-gray-600">Import items from CS:GO Market</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/admin')} variant="outline">
                Back to Admin Panel
              </Button>
            </div>
          </div>
        </div>

        {/* Parse Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Parse Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Items
                </label>
                <Input
                  type="number"
                  value={parseSettings.maxItems}
                  onChange={(e) => setParseSettings(prev => ({ ...prev, maxItems: parseInt(e.target.value) || 50 }))}
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price ($)
                </label>
                <Input
                  type="number"
                  value={parseSettings.minPrice}
                  onChange={(e) => setParseSettings(prev => ({ ...prev, minPrice: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price ($)
                </label>
                <Input
                  type="number"
                  value={parseSettings.maxPrice}
                  onChange={(e) => setParseSettings(prev => ({ ...prev, maxPrice: parseFloat(e.target.value) || 1000 }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query
                </label>
                <Input
                  value={parseSettings.searchQuery}
                  onChange={(e) => setParseSettings(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="e.g., AK-47, AWP"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleParseItems} 
                disabled={parsing}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {parsing ? 'Parsing...' : 'Parse Items'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {parsedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Found</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalFound}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Items</p>
                    <p className="text-2xl font-bold text-green-600">{stats.newItems}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duplicates</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.duplicates}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Parsed Items */}
        {parsedItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parsed Items</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectAll}
                    size="sm"
                  >
                    {selectedItems.length === parsedItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    onClick={handleSaveItems}
                    disabled={saving || selectedItems.length === 0}
                    size="sm"
                  >
                    {saving ? 'Saving...' : `Save Selected (${selectedItems.length})`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {parsedItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center space-x-1">
                          {item.isNew && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {item.isDuplicate && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover mx-auto rounded-lg mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <h3 className="text-sm font-semibold mb-1 truncate">{item.name}</h3>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {item.rarity}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Market: ${item.marketPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {parsedItems.length === 0 && !parsing && (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items parsed yet</h3>
            <p className="text-gray-600 mb-4">
              Configure your settings and click "Parse Items" to start importing items from CS:GO Market.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}