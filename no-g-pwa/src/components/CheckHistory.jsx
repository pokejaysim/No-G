import React, { useState, useEffect } from 'react';
import { getUserChecks, toggleFavorite, deleteCheck } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

const CheckHistory = () => {
  const [checks, setChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChecks();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadChecks = async () => {
    try {
      setIsLoading(true);
      const userChecks = await getUserChecks(user.uid);
      setChecks(userChecks);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (checkId, currentStatus) => {
    try {
      await toggleFavorite(checkId, currentStatus);
      setChecks(checks.map(check => 
        check.id === checkId 
          ? { ...check, isFavorite: !currentStatus }
          : check
      ));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (checkId) => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      try {
        await deleteCheck(checkId);
        setChecks(checks.filter(check => check.id !== checkId));
      } catch (err) {
        console.error('Failed to delete check:', err);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (safe) => {
    return safe ? (
      <span className="badge badge-success">Safe</span>
    ) : (
      <span className="badge badge-danger">Unsafe</span>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign in to view history</h3>
        <p className="text-gray-600">Your check history will be saved when you're signed in</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={loadChecks} className="mt-4 btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (checks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No checks yet</h3>
        <p className="text-gray-600">Start scanning ingredients to build your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checks.map(check => (
        <div key={check.id} className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(check.results?.safe)}
                <span className="badge bg-gray-100 text-gray-700">
                  {check.checkType === 'image' ? '📷 Image' : '⌨️ Manual'}
                </span>
                {check.isFavorite && (
                  <span className="text-yellow-500">★</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatDate(check.timestamp)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFavorite(check.id, check.isFavorite)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={check.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className={`w-5 h-5 ${check.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(check.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Delete check"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              {check.results?.explanation || 'No explanation available'}
            </p>
            
            {check.results?.flaggedIngredients?.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Flagged ingredients:</p>
                <div className="flex flex-wrap gap-1">
                  {check.results.flaggedIngredients.map((ingredient, idx) => (
                    <span key={idx} className="badge badge-danger text-xs">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {check.ingredientText && (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  View ingredients
                </summary>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {check.ingredientText}
                </p>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CheckHistory;