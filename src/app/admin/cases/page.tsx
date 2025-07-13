'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { getCurrentUser } from '@/lib/steamAuth';
import { SteamUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ImageUpload';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ToggleLeft,
  ToggleRight,
  DollarSign
} from 'lucide-react';

interface Case {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export default function AdminCasesPage() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    isActive: true
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }

    checkAdminStatus(currentUser.steamid);
    fetchCases();
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

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/admin/cases');
      const data = await response.json();
      
      if (data.success) {
        setCases(data.data);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const filteredCases = cases.filter(caseItem => 
    caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = async (caseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/cases/${caseId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchCases(); // Обновляем список
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = data.message || `Case ${!currentStatus ? 'activated' : 'deactivated'} successfully!`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        alert(data.error || 'Failed to toggle case status');
      }
    } catch (error) {
      console.error('Error toggling case status:', error);
      alert('Error toggling case status');
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cases/${caseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchCases(); // Обновляем список
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = data.message || 'Case deleted successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        alert(data.error || 'Failed to delete case');
      }
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Error deleting case');
    }
  };

  const handleCreateCase = async () => {
    if (!createForm.name || !createForm.image || createForm.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          image: '',
          price: 0,
          isActive: true
        });
        fetchCases(); // Обновляем список
        
        // Показываем уведомление об успехе
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = 'Case created successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        alert(data.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Error creating case');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cases...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Cases</h1>
              <p className="text-gray-600">Create and edit cases</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Case
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Back to Admin Panel
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cases by name or description..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      caseItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {caseItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleActive(caseItem.id, caseItem.isActive)}
                    >
                      {caseItem.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteCase(caseItem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <img
                    src={caseItem.image}
                    alt={caseItem.name}
                    className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                  />
                  <h3 className="text-lg font-semibold mb-2">{caseItem.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{caseItem.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">${caseItem.price.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-600">
                    {caseItem.itemsCount} items
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(caseItem.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first case.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Case
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Case</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Name *
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter case name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter case description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Image *
                </label>
                <ImageUpload
                  onImageSelect={(url) => handleInputChange('image', url)}
                  currentImage={createForm.image}
                  placeholder="Upload case image or enter URL below"
                />
                <div className="mt-2">
                  <Input
                    value={createForm.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Or enter image URL manually"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <Input
                  type="number"
                  value={createForm.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="Enter price"
                  className="w-full"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={createForm.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    name: '',
                    description: '',
                    image: '',
                    price: 0,
                    isActive: true
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCase}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}