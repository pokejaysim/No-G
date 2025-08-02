import React, { useState, useRef } from 'react';
import { analyzeImage, retryWithBackoff } from '../services/openai';
import { saveCheck } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

const ImageScanner = ({ selectedAllergens, onCheckComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      analyzeIngredients(file);
    }
  };

  const analyzeIngredients = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await retryWithBackoff(() => 
        analyzeImage(file, selectedAllergens)
      );
      
      setResult(analysis);
      
      // Save to history if user is logged in
      if (user) {
        await saveCheck(user.uid, {
          checkType: 'image',
          ingredientText: analysis.extractedText || 'Image analysis',
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
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl && !result && (
        <div 
          onClick={handleCameraClick}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-1 cursor-pointer group"
        >
          <div className="bg-white rounded-3xl p-12 text-center transition-transform group-hover:scale-[0.99] group-active:scale-[0.98]">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-glow animate-pulse-slow">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Scan Ingredients</h3>
            <p className="text-gray-600">Tap to take a photo or select from gallery</p>
          </div>
        </div>
      )}

      {previewUrl && !result && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={previewUrl} 
              alt="Ingredient preview" 
              className="w-full h-auto max-h-96 object-contain bg-gray-100"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 font-medium">Analyzing ingredients...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isLoading && (
            <button
              onClick={handleReset}
              className="w-full btn-secondary"
            >
              Take Another Photo
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
          <p className="text-red-700 text-center">{error}</p>
          <button
            onClick={handleReset}
            className="mt-3 w-full text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4 animate-fade-in">
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

          {result.extractedText && (
            <div className="card">
              <h4 className="font-semibold text-lg mb-3 text-gray-800">Extracted Ingredients:</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{result.extractedText}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 btn-secondary"
            >
              Scan Another
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

export default ImageScanner;