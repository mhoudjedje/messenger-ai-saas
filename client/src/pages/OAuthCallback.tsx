import { useEffect } from 'react';
import { useSearch } from 'wouter';

/**
 * OAuthCallback page - This page is loaded INSIDE the OAuth popup
 * after Facebook redirects back. It communicates the result to the
 * parent window and closes itself.
 */
export default function OAuthCallback() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const success = params.get('oauth_success') === 'true';
  const pagesCount = params.get('pages') || '0';
  const error = params.get('oauth_error');

  useEffect(() => {
    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'OAUTH_CALLBACK',
          success,
          pagesCount: parseInt(pagesCount),
          error: error || null,
        },
        window.location.origin
      );
      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If no opener (direct navigation), redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, [success, pagesCount, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connected!</h2>
            <p className="text-gray-500">Closing this window...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-500">{error || 'Connection failed'}</p>
            <p className="text-gray-400 text-sm mt-2">Closing this window...</p>
          </>
        )}
      </div>
    </div>
  );
}
