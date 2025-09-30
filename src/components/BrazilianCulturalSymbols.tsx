import React from 'react';

// Brazilian cultural symbols as inline SVG components for performance
export const BrazilianSymbols = {
  // Açaí berry symbol
  Acai: () => (
    <div className="relative inline-block">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-purple-300" />
      </div>
      <div className="absolute -top-1 -right-1 w-2 h-3 bg-green-500 rounded-full transform rotate-45" />
    </div>
  ),

  // Brigadeiro symbol
  Brigadeiro: () => (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center relative">
      <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-1 left-2" />
      <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-2 right-1" />
      <div className="w-1 h-1 bg-yellow-300 rounded-full absolute bottom-1 left-1" />
    </div>
  ),

  // Coxinha symbol
  Coxinha: () => (
    <div className="w-6 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-full relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-t-full" />
    </div>
  ),

  // Brazilian flag colors pattern
  BrazilFlag: () => (
    <div className="w-8 h-6 relative bg-green-500 rounded">
      <div className="absolute inset-1 bg-yellow-400 transform rotate-45 rounded-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-2 bg-blue-600 rounded-full" />
    </div>
  ),

  // Carnival mask
  CarnavalMask: () => (
    <div className="w-8 h-6 relative">
      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
      <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-yellow-400 rounded-b" />
    </div>
  ),

  // Football symbol
  Football: () => (
    <div className="w-6 h-6 rounded-full bg-white border-2 border-black relative">
      <div className="absolute inset-1 border border-black rounded-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-black rounded-full" />
    </div>
  ),

  // Christ the Redeemer silhouette
  Cristo: () => (
    <div className="w-6 h-8 relative flex flex-col items-center">
      <div className="w-4 h-1 bg-gray-600 rounded" />
      <div className="w-1 h-4 bg-gray-600" />
      <div className="w-2 h-2 bg-gray-600 rounded-t" />
    </div>
  )
};

// Component to display random Brazilian symbol
export const RandomBrazilianSymbol: React.FC<{ className?: string }> = ({ className = "" }) => {
  const symbols = Object.values(BrazilianSymbols);
  const RandomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <RandomSymbol />
    </div>
  );
};

// Component for Brazilian flag colors decoration
export const BrazilianColorStripe: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-blue-600 ${className}`} />
);

// Component for subtle Brazilian theming
export const BrazilianThemeOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
    </div>
  </div>
);