'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { X, Package, Wrench, Coffee, Code, Gem } from 'lucide-react';

export default function InventoryPanel() {
  const { player, toggleInventory } = useGameStore();

  if (!player) return null;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <Wrench className="w-6 h-6" />;
      case 'consumable':
        return <Coffee className="w-6 h-6" />;
      case 'code':
        return <Code className="w-6 h-6" />;
      case 'material':
        return <Gem className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getItemColor = (type: string, quality?: string) => {
    if (quality) {
      switch (quality) {
        case 'iridium':
          return 'text-purple-400';
        case 'gold':
          return 'text-yellow-400';
        case 'silver':
          return 'text-gray-300';
        default:
          return 'text-white';
      }
    }

    switch (type) {
      case 'tool':
        return 'text-yellow-400';
      case 'consumable':
        return 'text-green-400';
      case 'code':
        return 'text-blue-400';
      case 'material':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getQualityBorder = (quality?: string) => {
    switch (quality) {
      case 'iridium':
        return 'border-purple-400';
      case 'gold':
        return 'border-yellow-400';
      case 'silver':
        return 'border-gray-300';
      default:
        return 'border-transparent';
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Package className="w-6 h-6 mr-2" />
            Inventory
          </h2>
          <button
            onClick={toggleInventory}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {player.inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your inventory is empty</p>
              <p className="text-sm mt-2">Explore the world to find items!</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {player.inventory.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer group relative border-2 ${getQualityBorder(item.quality)}`}
                  title={`${item.name}${item.quality ? ` (${item.quality})` : ''}`}
                >
                  <div className={`${getItemColor(item.type, item.quality)} group-hover:scale-110 transition-transform`}>
                    {getItemIcon(item.type)}
                  </div>
                  
                  {item.quantity > 1 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  )}
                  
                  {item.equipped && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-3 h-3" />
                  )}

                  {item.quality && (
                    <div className="absolute -top-1 -left-1">
                      <div className={`w-2 h-2 rounded-full ${
                        item.quality === 'iridium' ? 'bg-purple-400' :
                        item.quality === 'gold' ? 'bg-yellow-400' :
                        item.quality === 'silver' ? 'bg-gray-300' : 'bg-white'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 20 - player.inventory.length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-slate-700/50 rounded-lg p-3 border-2 border-dashed border-slate-600"
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-sm text-gray-400">
          <p>Click items to use or equip them</p>
          <p className="mt-1">
            Capacity: {player.inventory.length}/20
          </p>
          <div className="mt-2 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Normal</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span>Silver</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Gold</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span>Iridium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}