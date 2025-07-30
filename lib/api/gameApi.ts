import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export class GameAPI {
  private static socket: Socket | null = null;

  // Authentication
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  }

  static async register(email: string, username: string, password: string) {
    return await api.post('/auth/register', { email, username, password });
  }

  static async getProfile() {
    return await api.get('/auth/me');
  }

  static logout() {
    localStorage.removeItem('auth_token');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // World & Map System
  static async getMapState(mapName: string) {
    return await api.get(`/world/maps/${mapName}/state`);
  }

  static async getPlayerPosition() {
    return await api.get('/world/position');
  }

  static async teleportPlayer(mapName: string, posX: number, posY: number) {
    return await api.post('/world/teleport', {
      map_name: mapName,
      pos_x: posX,
      pos_y: posY,
    });
  }

  static async getGameTime() {
    return await api.get('/world/time');
  }

  // Quest System
  static async getQuests(page = 1, perPage = 10) {
    return await api.get(`/quests?page=${page}&per_page=${perPage}`);
  }

  static async startQuest(questId: string) {
    return await api.post(`/quests/${questId}/start`);
  }

  static async completeQuest(questId: string, submittedItems: any) {
    return await api.post(`/quests/${questId}/complete`, { submitted_items: submittedItems });
  }

  static async getQuestProgress() {
    return await api.get('/quests/progress');
  }

  // Inventory System
  static async getInventory() {
    return await api.get('/inventory');
  }

  static async useItem(itemId: string) {
    return await api.post(`/inventory/use/${itemId}`);
  }

  static async equipItem(itemId: string) {
    return await api.post(`/inventory/equip/${itemId}`);
  }

  // Code Farming System
  static async getCodeFarms() {
    return await api.get('/farming/');
  }

  static async plantCode(plotX: number, plotY: number, codeType: string) {
    return await api.post('/farming/plant', {
      plot_x: plotX,
      plot_y: plotY,
      code_type: codeType,
    });
  }

  static async waterCode(farmId: string) {
    return await api.post(`/farming/${farmId}/water`);
  }

  static async harvestCode(farmId: string) {
    return await api.post(`/farming/${farmId}/harvest`);
  }

  // Skills System
  static async getSkills() {
    return await api.get('/skills');
  }

  static async upgradeSkill(skillId: string) {
    return await api.post(`/skills/${skillId}/upgrade`);
  }

  // WebSocket Connection
  static connectWebSocket(onMessage: (event: string, data: any) => void) {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    this.socket = io(WS_URL, {
      query: { token },
      transports: ['websocket'],
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });

    // Game events
    this.socket.on('player_position_update', (data) => onMessage('player_position_update', data));
    this.socket.on('world_object_update', (data) => onMessage('world_object_update', data));
    this.socket.on('npc_position_update', (data) => onMessage('npc_position_update', data));
    this.socket.on('time_update', (data) => onMessage('time_update', data));
    this.socket.on('quest_update', (data) => onMessage('quest_update', data));
    this.socket.on('notification', (data) => onMessage('notification', data));

    return this.socket;
  }

  static sendPlayerMove(x: number, y: number, direction: string) {
    if (this.socket) {
      this.socket.emit('player_move', { x, y, direction });
    }
  }

  static sendPlayerInteract(targetX: number, targetY: number) {
    if (this.socket) {
      this.socket.emit('player_interact', { target_x: targetX, target_y: targetY });
    }
  }

  static disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default GameAPI;