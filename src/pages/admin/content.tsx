import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import type { Content } from '@/types/content';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('content')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setContent(data || []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        sentryService.captureException(err as Error, {
          context: 'Content Management page',
          extra: { location: 'fetchContent' }
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchContent();
  }, [statusFilter]);

  // Filter content based on search query
  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to delete content
  async function deleteContent(contentId: string) {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', contentId);
        
        if (error) throw error;
        
        // Update the content list by removing the deleted item
        setContent(content.filter(item => item.id !== contentId));
      } catch (error) {
        console.error('Error deleting content:', error);
        sentryService.captureException(error as Error);
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search content..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.length === 0 ? (
            <div className="col-span-full rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-500">No content found matching your criteria.</p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.description ?? 'No description'}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'published' ? 'bg-green-100 text-green-800' :
                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      onClick={() => window.location.href = `/admin/content/${item.id}`}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      onClick={() => deleteContent(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
