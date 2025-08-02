import React from 'react';

const AllergenToggles = ({ selectedAllergens, onToggle }) => {
  const allergens = [
    { id: 'gluten', name: 'Gluten', icon: '🌾', locked: true },
    { id: 'caffeine', name: 'Caffeine', icon: '☕' },
    { id: 'chocolate', name: 'Chocolate', icon: '🍫' },
    { id: 'dairy', name: 'Dairy', icon: '🥛', comingSoon: true },
    { id: 'soy', name: 'Soy', icon: '🌱', comingSoon: true },
    { id: 'nuts', name: 'Nuts', icon: '🥜', comingSoon: true },
  ];

  const handleToggle = (allergenId) => {
    if (selectedAllergens.includes(allergenId)) {
      onToggle(selectedAllergens.filter(id => id !== allergenId));
    } else {
      onToggle([...selectedAllergens, allergenId]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Checking for Allergens</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allergens.map(allergen => {
            const isSelected = selectedAllergens.includes(allergen.id);
            const isDisabled = allergen.locked || allergen.comingSoon;
            
            return (
              <button
                key={allergen.id}
                onClick={() => !isDisabled && handleToggle(allergen.id)}
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-md transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  ${allergen.locked ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-2xl">{allergen.icon}</span>
                  <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                    {allergen.name}
                  </span>
                  {allergen.locked && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Always On
                    </span>
                  )}
                  {allergen.comingSoon && (
                    <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                
                {/* Toggle indicator */}
                {!isDisabled && (
                  <div className={`
                    absolute bottom-2 right-2 w-5 h-5 rounded-full transition-all duration-200
                    ${isSelected ? 'bg-primary' : 'bg-gray-300'}
                  `}>
                    {isSelected && (
                      <svg className="w-5 h-5 text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <p className="mt-4 text-sm text-gray-500 text-center">
          Select allergens to check for in addition to gluten
        </p>
      </div>
    </div>
  );
};

export default AllergenToggles;