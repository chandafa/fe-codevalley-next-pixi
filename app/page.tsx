'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Dynamically import the game to avoid SSR issues with Pixi.js
const Game = dynamic(() => import('@/components/Game/Game'), { 
  ssr: false,
  loading: () => <LoadingScreen />
});

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Game />
      </Suspense>
    </main>
  );
}