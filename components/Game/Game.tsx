'use client';

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import GameUI from './GameUI';
import { useGameStore } from '@/lib/store/gameStore';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDestroying, setIsDestroying] = useState(false);
  const { isInitialized, isLoading } = useGameStore();

  useEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      if (!canvasRef.current || isDestroying) return;

      try {
        // Initialize game engine
        const gameEngine = new GameEngine(canvasRef.current);
        gameEngineRef.current = gameEngine;

        // Initialize game
        await gameEngine.initialize();

        if (!mounted) {
          // Component unmounted during initialization
          gameEngine.destroy();
          return;
        }

      } catch (error) {
        console.error('Failed to initialize game:', error);
        if (mounted) {
          setError(`Failed to initialize game: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (gameEngineRef.current && !isDestroying) {
        try {
          gameEngineRef.current.resize(window.innerWidth, window.innerHeight);
        } catch (error) {
          console.warn('Error during resize:', error);
        }
      }
    };
    
    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Initialize game
    initializeGame();

    // Cleanup function
    return () => {
      mounted = false;
      setIsDestroying(true);
      
      window.removeEventListener('resize', handleResize);
      
      if (gameEngineRef.current) {
        try {
          gameEngineRef.current.destroy();
        } catch (error) {
          console.warn('Error during game cleanup:', error);
        }
        gameEngineRef.current = null;
      }
    };
  }, []);

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Game Initialization Error</h2>
          <p className="text-gray-300 mb-6 max-w-md">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Retry Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-slate-800 block"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      
      {isInitialized && !isDestroying && <GameUI />}
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p>Loading Code Valley...</p>
            <p className="text-sm text-gray-400 mt-2">Initializing PIXI.js renderer...</p>
          </div>
        </div>
      )}
    </div>
  );
}