'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ToolCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract app name from various possible query params that Composio might send
    const appName = searchParams.get('app') ||
                    searchParams.get('appName') ||
                    searchParams.get('integration') ||
                    searchParams.get('toolkit') ||
                    null;

    // OAuth callback - notify the parent window and close
    const timer = setTimeout(() => {
      try {
        if (window.opener) {
          window.opener.postMessage({
            type: 'composio-auth-complete',
            appName: appName,
            success: true
          }, '*');
        }
        setStatus('success');
        setTimeout(() => window.close(), 1500);
      } catch {
        setStatus('error');
        if (window.opener) {
          window.opener.postMessage({
            type: 'composio-auth-complete',
            success: false,
            error: 'Failed to complete connection'
          }, '*');
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">Completing connection...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-sm font-medium">Connected successfully!</p>
            <p className="text-zinc-500 text-xs mt-2">This window will close automatically.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-white text-sm font-medium">Connection failed</p>
            <p className="text-zinc-500 text-xs mt-2">Please close this window and try again.</p>
          </>
        )}
      </div>
    </div>
  );
}
