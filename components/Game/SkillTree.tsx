'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { X, Monitor, Server, Brain, Plus } from 'lucide-react';

export default function SkillTree() {
  const { player, toggleSkillTree } = useGameStore();

  if (!player) return null;

  const skills = [
    {
      name: 'Frontend Development',
      level: player.skills.frontend,
      icon: <Monitor className="w-8 h-8" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      description: 'Master HTML, CSS, JavaScript, and modern frameworks',
    },
    {
      name: 'Backend Development',
      level: player.skills.backend,
      icon: <Server className="w-8 h-8" />,
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      description: 'Learn server-side programming, databases, and APIs',
    },
    {
      name: 'Problem Solving',
      level: player.skills.problemSolving,
      icon: <Brain className="w-8 h-8" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      description: 'Improve algorithmic thinking and debugging skills',
    },
  ];

  const getUpgradeCost = (currentLevel: number) => {
    return currentLevel * 50; // Example cost calculation
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            Skill Tree
          </h2>
          <button
            onClick={toggleSkillTree}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {skills.map((skill, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`${skill.color}`}>
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{skill.name}</h3>
                    <p className="text-gray-300 text-sm">Level {skill.level}</p>
                  </div>
                </div>
                
                <button
                  className={`p-2 ${skill.bgColor} hover:opacity-80 text-white rounded-full transition-opacity`}
                  title={`Upgrade (Cost: ${getUpgradeCost(skill.level)} coins)`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-3">{skill.description}</p>
              
              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progress to Level {skill.level + 1}</span>
                  <span className="text-gray-400">75%</span>
                </div>
                <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${skill.bgColor} transition-all`}
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
              
              {/* Upgrade Cost */}
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Upgrade Cost:</span>
                  <span className="text-yellow-400">{getUpgradeCost(skill.level)} coins</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Available Skill Points: 3</div>
            <div className="text-xs text-gray-500">
              Complete quests and projects to earn skill points!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}