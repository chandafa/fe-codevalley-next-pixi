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
  bio?: string;
  avatarUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'tool' | 'consumable' | 'material' | 'code';
  quantity: number;
  equipped?: boolean;
  quality?: 'normal' | 'silver' | 'gold' | 'iridium';
}

export interface NPC {
  id: string;
  name: string;
  position: { x: number; y: number };
  currentMap: string;
  dialogue: DialogueEntry[];
  relationship: number;
  schedule: any[];
}

export interface DialogueEntry {
  text: string;
  speaker: string;
  choices?: string[];
}

export interface GameTime {
  gameYear: number;
  gameSeason: 'spring' | 'summer' | 'fall' | 'winter';
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
  requiredItems?: { [key: string]: number };
  isRepeatable?: boolean;
}

export interface CodeFarm {
  id: string;
  plotX: number;
  plotY: number;
  codeType: string;
  plantedAt: Date;
  wateredAt?: Date;
  harvestableAt: Date;
  quality: 'normal' | 'silver' | 'gold' | 'iridium';
  isReady: boolean;
}

export interface Friend {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
  relationship: number;
}

export interface Notification {
  id: string;
  type: 'quest' | 'friend' | 'achievement' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
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
  codeFarms: CodeFarm[];
  friends: Friend[];
  notifications: Notification[];
  achievements: Achievement[];
  
  // UI state
  showInventory: boolean;
  showQuestLog: boolean;
  showSkillTree: boolean;
  showFriends: boolean;
  showNotifications: boolean;
  
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
  setCodeFarms: (farms: CodeFarm[]) => void;
  setFriends: (friends: Friend[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  toggleInventory: () => void;
  toggleQuestLog: () => void;
  toggleSkillTree: () => void;
  toggleFriends: () => void;
  toggleNotifications: () => void;
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  updatePlayerStats: (stats: Partial<Player['stats']>) => void;
  updatePlayerSkills: (skills: Partial<Player['skills']>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  addQuest: (quest: Quest) => void;
  updateQuestProgress: (questId: string, progress: number, status?: Quest['status']) => void;
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
    codeFarms: [],
    friends: [],
    notifications: [],
    achievements: [],
    
    showInventory: false,
    showQuestLog: false,
    showSkillTree: false,
    showFriends: false,
    showNotifications: false,
    
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
    setCodeFarms: (farms) => set({ codeFarms: farms }),
    setFriends: (friends) => set({ friends }),
    setNotifications: (notifications) => set({ notifications }),
    setAchievements: (achievements) => set({ achievements }),
    
    toggleInventory: () => set((state) => ({ showInventory: !state.showInventory })),
    toggleQuestLog: () => set((state) => ({ showQuestLog: !state.showQuestLog })),
    toggleSkillTree: () => set((state) => ({ showSkillTree: !state.showSkillTree })),
    toggleFriends: () => set((state) => ({ showFriends: !state.showFriends })),
    toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),
    
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

    updatePlayerSkills: (skills) => {
      const { player } = get();
      if (player) {
        set({
          player: {
            ...player,
            skills: { ...player.skills, ...skills },
          },
        });
      }
    },

    addNotification: (notification) => {
      const { notifications } = get();
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      set({ notifications: [newNotification, ...notifications] });
    },

    markNotificationRead: (notificationId) => {
      const { notifications } = get();
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      set({ notifications: updatedNotifications });
    },

    addQuest: (quest) => {
      const { quests } = get();
      set({ quests: [...quests, quest] });
    },

    updateQuestProgress: (questId, progress, status) => {
      const { quests } = get();
      const updatedQuests = quests.map(quest =>
        quest.id === questId
          ? { ...quest, progress, ...(status && { status }) }
          : quest
      );
      set({ quests: updatedQuests });
    },
  }))
);