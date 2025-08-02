import React, { useState, useEffect } from 'react';
import { getUserFavorites, toggleFavorite, deleteCheck } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const userFavorites = await getUserFavorites(user.uid);
      setFavorites(userFavorites);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (checkId) => {
    try {
      await toggleFavorite(checkId, true);
      setFavorites(favorites.filter(fav => fav.id !== checkId));
    } catch (err) {
      console.error('Failed to remove from favorites:', err);
    }
  };

  const handleDelete = async (checkId) => {
    if (window.confirm('Are you sure you want to delete this favorite?')) {
      try {
        await deleteCheck(checkId);
        setFavorites(favorites.filter(fav => fav.id !== checkId));
      } catch (err) {
        console.error('Failed to delete favorite:', err);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign in to save favorites</h3>
        <p className="text-gray-600">Keep track of your safe products</p>
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
        <button onClick={loadFavorites} className="mt-4 btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h3>
        <p className="text-gray-600">Save your safe products for quick reference</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Favorites</h2>
        <p className="text-gray-600">Quick access to your safe products</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map(favorite => (
          <div key={favorite.id} className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                  ✓ Safe
                </span>
                <p className="text-sm text-gray-500">{formatDate(favorite.timestamp)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavorite(favorite.id)}
                  className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                  aria-label="Remove from favorites"
                >
                  <svg className="w-5 h-5 text-yellow-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(favorite.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Delete favorite"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-700 font-medium mb-3">
              {favorite.results?.explanation || 'Safe to consume'}
            </p>

            {favorite.ingredientText && (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  View ingredients
                </summary>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                  {favorite.ingredientText}
                </p>
              </details>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Checked for: {favorite.allergens?.join(', ') || 'Gluten'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;