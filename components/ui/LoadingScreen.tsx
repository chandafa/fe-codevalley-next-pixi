import React from 'react';
import { Loader2, Code, Terminal } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-lg flex items-center justify-center shadow-2xl">
              <Code className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-2">Code Valley</h1>
        <p className="text-gray-300 mb-8">RPG Life Simulation Game</p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
          <span className="text-white">Loading game world...</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
          <div className="mt-2 text-sm text-gray-400">Initializing PIXI.js renderer...</div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-xs text-gray-500 max-w-md mx-auto">
          <p>Tip: Use WASD or arrow keys to move around</p>
          <p>Press Space to interact with NPCs and objects</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;