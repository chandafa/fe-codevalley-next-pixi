'use client';

import { useEffect, useRef } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import GameUI from './GameUI';
import { useGameStore } from '@/lib/store/gameStore';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { isInitialized, isLoading } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const gameEngine = new GameEngine(canvasRef.current);
    gameEngineRef.current = gameEngine;

    // Initialize game
    gameEngine.initialize();

    // Handle window resize
    const handleResize = () => {
      gameEngine.resize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      gameEngine.destroy();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-slate-800"
        style={{ display: 'block' }}
      />
      
      {isInitialized && <GameUI />}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p>Loading Code Valley...</p>
          </div>
        </div>
      )}
    </div>
  );
}