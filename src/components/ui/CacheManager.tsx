import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw } from 'lucide-react';

interface CacheManagerProps {
  onClearCache: () => Promise<void>;
  onGetStats: () => Promise<{
    totalEntries: number;
    expiredEntries: number;
    totalSize: number;
  }>;
}

const CacheManager: React.FC<CacheManagerProps> = ({ onClearCache, onGetStats }) => {
  const [stats, setStats] = useState({
    totalEntries: 0,
    expiredEntries: 0,
    totalSize: 0
  });
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const newStats = await onGetStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await onClearCache();
      await loadStats(); // Refresh stats after clearing
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Cache Manager</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-blue-600 font-medium">Total Entries</div>
          <div className="text-2xl font-bold text-blue-800">
            {loading ? '...' : stats.totalEntries}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-yellow-600 font-medium">Expired Entries</div>
          <div className="text-2xl font-bold text-yellow-800">
            {loading ? '...' : stats.expiredEntries}
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-600 font-medium">Cache Size</div>
          <div className="text-2xl font-bold text-green-800">
            {loading ? '...' : formatSize(stats.totalSize)}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
        
        <button
          onClick={handleClearCache}
          disabled={clearing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {clearing ? 'Clearing...' : 'Clear Cache'}
        </button>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <p>
          <strong>Cache TTL:</strong> 48 hours • 
          <strong> Storage:</strong> IndexedDB • 
          <strong> Auto-cleanup:</strong> On app start
        </p>
      </div>
    </div>
  );
};

export default CacheManager; 