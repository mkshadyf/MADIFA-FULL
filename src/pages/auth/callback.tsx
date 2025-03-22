import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No code provided in callback URL');
        return;
      }

      try {
        const supabase = createClient();
        
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          setError(error.message);
          return;
        }
        
        // Redirect to browse page
        navigate('/browse', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Authentication Error
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="ml-2 text-gray-600">Completing authentication...</p>
    </div>
  );
}
