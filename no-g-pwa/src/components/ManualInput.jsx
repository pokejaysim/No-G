import React, { useState } from 'react';
import { analyzeText, retryWithBackoff } from '../services/openai';
import { saveCheck } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

const ManualInput = ({ selectedAllergens, onCheckComplete }) => {
  const [ingredientText, setIngredientText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ingredientText.trim()) {
      setError('Please enter some ingredients to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await retryWithBackoff(() => 
        analyzeText(ingredientText, selectedAllergens)
      );
      
      setResult(analysis);
      
      // Save to history if user is logged in
      if (user) {
        await saveCheck(user.uid, {
          checkType: 'manual',
          ingredientText: ingredientText,
          allergens: selectedAllergens,
          results: {
            safe: analysis.status === 'SAFE',
            flaggedIngredients: analysis.flaggedIngredients,
            explanation: analysis.explanation
          }
        });
      }
      
      if (onCheckComplete) {
        onCheckComplete(analysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze ingredients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIngredientText('');
    setResult(null);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SAFE':
        return 'text-green-600 bg-green-100';
      case 'UNSAFE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SAFE':
        return '✓';
      case 'UNSAFE':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card">
            <label htmlFor="ingredients" className="block text-lg font-semibold text-gray-800 mb-3">
              Paste or Type Ingredients
            </label>
            <textarea
              id="ingredients"
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
              placeholder="Enter ingredients list here... (e.g., Wheat flour, sugar, eggs, milk, salt)"
              className="input-field min-h-[200px] resize-none"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Tip: Include the complete ingredient list for accurate analysis
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !ingredientText.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Ingredients'
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full btn-secondary"
            disabled={isLoading}
          >
            Clear
          </button>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className={`p-6 rounded-2xl ${getStatusColor(result.status)} shadow-lg`}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl font-bold shadow-md">
                {getStatusIcon(result.status)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">
              {result.status === 'SAFE' ? 'Safe to Consume' : 
               result.status === 'UNSAFE' ? 'Contains Allergens' : 
               'Uncertain - Review Needed'}
            </h3>
            <p className="text-center opacity-90">{result.explanation}</p>
          </div>

          {result.flaggedIngredients && result.flaggedIngredients.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-lg mb-3 text-gray-800">Flagged Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {result.flaggedIngredients.map((ingredient, index) => (
                  <span key={index} className="badge badge-danger">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">Analyzed Ingredients:</h4>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{ingredientText}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 btn-secondary"
            >
              Check Another
            </button>
            {user && (
              <button
                onClick={() => {/* Add to favorites logic */}}
                className="btn-secondary px-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualInput;