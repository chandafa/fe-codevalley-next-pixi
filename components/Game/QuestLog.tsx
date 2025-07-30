'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { X, Book, CheckCircle, Clock, Star } from 'lucide-react';

export default function QuestLog() {
  const { quests, toggleQuestLog } = useGameStore();

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const availableQuests = quests.filter(q => q.status === 'available');

  const getQuestIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Star className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Book className="w-6 h-6 mr-2" />
            Quest Log
          </h2>
          <button
            onClick={toggleQuestLog}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Active Quests</h3>
              <div className="space-y-3">
                {activeQuests.map((quest) => (
                  <div key={quest.id} className="bg-slate-700 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getQuestIcon(quest.status)}
                          <h4 className="text-white font-medium ml-2">{quest.title}</h4>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{quest.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {quest.progress} / {quest.maxProgress}
                        </div>
                      </div>
                    </div>
                    
                    {/* Rewards */}
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-yellow-400">+{quest.rewards.coins} coins</span>
                        <span className="text-blue-400">+{quest.rewards.exp} EXP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Quests */}
          {availableQuests.length > 0 && (
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Available Quests</h3>
              <div className="space-y-3">
                {availableQuests.map((quest) => (
                  <div key={quest.id} className="bg-slate-700/50 rounded-lg p-3 border border-yellow-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getQuestIcon(quest.status)}
                          <h4 className="text-white font-medium ml-2">{quest.title}</h4>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                        <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors">
                          Accept Quest
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Completed Quests</h3>
              <div className="space-y-2">
                {completedQuests.map((quest) => (
                  <div key={quest.id} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center">
                      {getQuestIcon(quest.status)}
                      <span className="text-gray-300 ml-2">{quest.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {quests.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No quests available</p>
              <p className="text-sm mt-2">Talk to NPCs to find new quests!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}