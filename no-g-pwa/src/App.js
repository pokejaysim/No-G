import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ImageScanner from './components/ImageScanner';
import ManualInput from './components/ManualInput';
import CheckHistory from './components/CheckHistory';
import Favorites from './components/Favorites';
import AllergenToggles from './components/AllergenToggles';
import Settings from './components/Settings';

function App() {
  const [selectedAllergens, setSelectedAllergens] = useState(['gluten']);
  const [inputMode, setInputMode] = useState('camera');

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  // Check for action parameter (for PWA shortcut)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'scan') {
      setInputMode('camera');
    }
  }, []);

  const HomePage = () => (
    <div className="space-y-6">
      {/* Allergen Toggles */}
      <AllergenToggles 
        selectedAllergens={selectedAllergens}
        onToggle={setSelectedAllergens}
      />

      {/* Input Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setInputMode('camera')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              inputMode === 'camera' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📷 Camera
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              inputMode === 'manual' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⌨️ Manual
          </button>
        </div>
      </div>

      {/* Scanner/Input Component */}
      <div className="mt-6">
        {inputMode === 'camera' ? (
          <ImageScanner selectedAllergens={selectedAllergens} />
        ) : (
          <ManualInput selectedAllergens={selectedAllergens} />
        )}
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<CheckHistory />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
