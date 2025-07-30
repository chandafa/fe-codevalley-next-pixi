'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { Clock, User, Coins, Battery, Book, Package } from 'lucide-react';
import InventoryPanel from './InventoryPanel';
import DialogueBox from './DialogueBox';
import QuestLog from './QuestLog';
import SkillTree from './SkillTree';

export default function GameUI() {
  const { 
    player, 
    gameTime, 
    showInventory,
    showQuestLog,
    showSkillTree,
    activeDialogue,
    toggleInventory,
    toggleQuestLog,
    toggleSkillTree
  } = useGameStore();

  if (!player) return null;

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-40">
        <div className="flex justify-between items-start">
          {/* Player Info */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{player.username}</span>
                <span className="text-sm text-gray-300">Lv. {player.stats.level}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>{player.stats.coins}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-green-400" />
                <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all"
                    style={{ width: `${(player.stats.energy / player.stats.maxEnergy) * 100}%` }}
                  />
                </div>
                <span className="text-xs">{player.stats.energy}/{player.stats.maxEnergy}</span>
              </div>
            </div>
            
            {/* XP Bar */}
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 transition-all"
                  style={{ width: `${(player.stats.exp % 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">
                  {formatTime(gameTime.gameHour, gameTime.gameMinute)}
                </div>
                <div className="text-xs text-gray-300">
                  {gameTime.gameSeason} {gameTime.gameDay}, Year {gameTime.gameYear}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleInventory}
              className={`p-2 rounded-md transition-colors ${
                showInventory ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              title="Inventory (I)"
            >
              <Package className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleQuestLog}
              className={`p-2 rounded-md transition-colors ${
                showQuestLog ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              title="Quest Log (Q)"
            >
              <Book className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleSkillTree}
              className={`p-2 rounded-md transition-colors ${
                showSkillTree ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              title="Skills (K)"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 z-40">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="space-y-1">
            <div>WASD / Arrow Keys: Move</div>
            <div>Space: Interact</div>
            <div>I: Inventory</div>
            <div>Q: Quests</div>
            <div>K: Skills</div>
          </div>
        </div>
      </div>

      {/* Panels */}
      {showInventory && <InventoryPanel />}
      {showQuestLog && <QuestLog />}
      {showSkillTree && <SkillTree />}
      {activeDialogue && <DialogueBox />}
    </>
  );
}