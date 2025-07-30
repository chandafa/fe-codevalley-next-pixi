import { Loader2, Code } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-900">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Code className="w-16 h-16 text-green-400 mr-2" />
          <div className="text-4xl font-bold text-white">Code Valley</div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading game world...</span>
        </div>
        <div className="mt-4 text-gray-400 text-sm">
          Initializing Pixi.js engine and game assets
        </div>
      </div>
    </div>
  );
}