'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ToolCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // OAuth callback - notify the parent window and close
    const timer = setTimeout(() => {
      try {
        if (window.opener) {
          window.opener.postMessage({ type: 'composio-auth-complete' }, '*');
        }
        setStatus('success');
        setTimeout(() => window.close(), 1500);
      } catch {
        setStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
            <p className="text-[#A1A1AA] text-sm">Completing connection...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <p className="text-[#F2F2F2] text-sm font-serif">Connected successfully!</p>
            <p className="text-[#71717A] text-xs mt-2">This window will close automatically.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-[#F2F2F2] text-sm font-serif">Connection failed</p>
            <p className="text-[#71717A] text-xs mt-2">Please close this window and try again.</p>
          </>
        )}
      </div>
    </div>
  );
}
