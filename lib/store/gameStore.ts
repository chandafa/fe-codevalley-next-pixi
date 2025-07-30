import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  currentMap: string;
  stats: {
    level: number;
    exp: number;
    coins: number;
    energy: number;
    maxEnergy: number;
  };
  skills: {
    frontend: number;
    backend: number;
    problemSolving: number;
  };
  inventory: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'tool' | 'consumable' | 'material' | 'code';
  quantity: number;
  equipped?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  position: { x: number; y: number };
  currentMap: string;
  dialogue: any[];
  relationship: number;
  schedule: any[];
}

export interface GameTime {
  gameYear: number;
  gameSeason: string;
  gameDay: number;
  gameHour: number;
  gameMinute: number;
  isNight: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'active' | 'completed';
  progress: number;
  maxProgress: number;
  rewards: {
    coins: number;
    exp: number;
    items?: InventoryItem[];
  };
}

export interface GameState {
  // Game status
  isInitialized: boolean;
  isLoading: boolean;
  currentScene: 'menu' | 'game' | 'inventory' | 'dialogue';
  
  // Player data
  player: Player | null;
  otherPlayers: Player[];
  
  // World data
  currentMap: string;
  npcs: NPC[];
  gameTime: GameTime;
  
  // Game systems
  quests: Quest[];
  activeDialogue: any | null;
  
  // UI state
  showInventory: boolean;
  showQuestLog: boolean;
  showSkillTree: boolean;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentScene: (scene: string) => void;
  setPlayer: (player: Player) => void;
  updatePlayerPosition: (x: number, y: number, direction: string) => void;
  setOtherPlayers: (players: Player[]) => void;
  setCurrentMap: (map: string) => void;
  setNPCs: (npcs: NPC[]) => void;
  setGameTime: (time: GameTime) => void;
  setQuests: (quests: Quest[]) => void;
  setActiveDialogue: (dialogue: any) => void;
  toggleInventory: () => void;
  toggleQuestLog: () => void;
  toggleSkillTree: () => void;
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  updatePlayerStats: (stats: Partial<Player['stats']>) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isInitialized: false,
    isLoading: true,
    currentScene: 'game',
    
    player: null,
    otherPlayers: [],
    
    currentMap: 'village',
    npcs: [],
    gameTime: {
      gameYear: 1,
      gameSeason: 'spring',
      gameDay: 1,
      gameHour: 6,
      gameMinute: 0,
      isNight: false,
    },
    
    quests: [],
    activeDialogue: null,
    
    showInventory: false,
    showQuestLog: false,
    showSkillTree: false,
    
    // Actions
    setInitialized: (initialized) => set({ isInitialized: initialized }),
    setLoading: (loading) => set({ isLoading: loading }),
    setCurrentScene: (scene: any) => set({ currentScene: scene }),
    
    setPlayer: (player) => set({ player }),
    updatePlayerPosition: (x, y, direction: any) => {
      const { player } = get();
      if (player) {
        set({
          player: {
            ...player,
            position: { x, y },
            direction,
          },
        });
      }
    },
    
    setOtherPlayers: (players) => set({ otherPlayers: players }),
    setCurrentMap: (map) => set({ currentMap: map }),
    setNPCs: (npcs) => set({ npcs }),
    setGameTime: (time) => set({ gameTime: time }),
    setQuests: (quests) => set({ quests }),
    setActiveDialogue: (dialogue) => set({ activeDialogue: dialogue }),
    
    toggleInventory: () => set((state) => ({ showInventory: !state.showInventory })),
    toggleQuestLog: () => set((state) => ({ showQuestLog: !state.showQuestLog })),
    toggleSkillTree: () => set((state) => ({ showSkillTree: !state.showSkillTree })),
    
    addToInventory: (item) => {
      const { player } = get();
      if (player) {
        const existingItem = player.inventory.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          player.inventory.push(item);
        }
        set({ player: { ...player } });
      }
    },
    
    removeFromInventory: (itemId, quantity) => {
      const { player } = get();
      if (player) {
        const item = player.inventory.find(i => i.id === itemId);
        if (item) {
          item.quantity -= quantity;
          if (item.quantity <= 0) {
            player.inventory = player.inventory.filter(i => i.id !== itemId);
          }
        }
        set({ player: { ...player } });
      }
    },
    
    updatePlayerStats: (stats) => {
      const { player } = get();
      if (player) {
        set({
          player: {
            ...player,
            stats: { ...player.stats, ...stats },
          },
        });
      }
    },
  }))
);