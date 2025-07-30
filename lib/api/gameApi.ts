import axios from "axios";
import { io, Socket } from "socket.io-client";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && !token.startsWith("demo_")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn("Authentication failed - token may be invalid");
      // Don't clear token immediately, let the game handle it
      return Promise.resolve({
        success: false,
        error: "Unauthorized",
        status: 401,
      });
    }

    if (error.response?.status === 404) {
      console.warn("Resource not found");
      return Promise.resolve({
        success: false,
        error: "Not Found",
        status: 404,
      });
    }

    // For network errors or server unavailable
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      console.warn("Server unavailable - check if backend is running");
      return Promise.resolve({
        success: false,
        error: "Server Unavailable",
        status: 0,
      });
    }

    return Promise.resolve({
      success: false,
      error: error.message || "Unknown error",
      status: error.response?.status || 0,
    });
  }
);

export class GameAPI {
  private static socket: Socket | null = null;

  // Authentication
  static async login(email: string, password: string) {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.success && response.data?.token) {
        localStorage.setItem("auth_token", response.data.token);
        console.log("Login successful");
      }
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Login failed" };
    }
  }

  static async register(email: string, username: string, password: string) {
    try {
      const response = await api.post("/auth/register", {
        email,
        username,
        password,
      });
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: "Registration failed" };
    }
  }

  static async getProfile() {
    try {
      const response = await api.get("/auth/me");

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            level: response.data.level || 1,
            exp: response.data.exp || 0,
            coins: response.data.coins || 100,
            energy: response.data.energy || 100,
            max_energy: response.data.max_energy || 100,
            pos_x: response.data.pos_x || 400,
            pos_y: response.data.pos_y || 300,
            current_map: response.data.current_map || "village",
            frontend_skill: response.data.frontend_skill || 1,
            backend_skill: response.data.backend_skill || 1,
            problem_solving_skill: response.data.problem_solving_skill || 1,
          },
        };
      }

      return { success: false, error: "Invalid profile data" };
    } catch (error) {
      console.error("Failed to get profile:", error);
      return {
        success: false,
        error: "Profile fetch failed",
        demoMode: true,
      };
    }
  }

  static logout() {
    localStorage.removeItem("auth_token");
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // World & Map System
  static async getMapState(mapName: string) {
    try {
      const response = await api.get(`/world/maps/${mapName}/state`);
      return response;
    } catch (error) {
      console.error("Failed to get map state:", error);
      // Return demo map data when API fails
      return {
        success: false,
        error: "Map fetch failed",
        demoMode: true,
      };
    }
  }

  static async getPlayerPosition() {
    try {
      return await api.get("/world/position");
    } catch (error) {
      console.error("Failed to get player position:", error);
      return { success: false, error: "Position fetch failed" };
    }
  }

  static async teleportPlayer(mapName: string, posX: number, posY: number) {
    try {
      return await api.post("/world/teleport", {
        map_name: mapName,
        pos_x: posX,
        pos_y: posY,
      });
    } catch (error) {
      console.error("Failed to teleport player:", error);
      return { success: false, error: "Teleport failed" };
    }
  }

  static async getGameTime() {
    try {
      return await api.get("/world/time");
    } catch (error) {
      console.error("Failed to get game time:", error);
      return { success: false, error: "Time fetch failed" };
    }
  }

  // Quest System
  static async getQuests(page = 1, perPage = 10) {
    try {
      return await api.get(`/quests?page=${page}&per_page=${perPage}`);
    } catch (error) {
      console.error("Failed to get quests:", error);
      return { success: false, error: "Quests fetch failed" };
    }
  }

  static async startQuest(questId: string) {
    try {
      return await api.post(`/quests/${questId}/start`);
    } catch (error) {
      console.error("Failed to start quest:", error);
      return { success: false, error: "Quest start failed" };
    }
  }

  static async completeQuest(questId: string, submittedItems: any) {
    try {
      return await api.post(`/quests/${questId}/complete`, {
        submitted_items: submittedItems,
      });
    } catch (error) {
      console.error("Failed to complete quest:", error);
      return { success: false, error: "Quest completion failed" };
    }
  }

  static async getQuestProgress() {
    try {
      return await api.get("/quests/progress");
    } catch (error) {
      console.error("Failed to get quest progress:", error);
      return { success: false, error: "Quest progress fetch failed" };
    }
  }

  // Inventory System
  static async getInventory() {
    try {
      return await api.get("/inventory");
    } catch (error) {
      console.error("Failed to get inventory:", error);
      return { success: false, error: "Inventory fetch failed" };
    }
  }

  static async useItem(itemId: string) {
    try {
      return await api.post(`/inventory/use/${itemId}`);
    } catch (error) {
      console.error("Failed to use item:", error);
      return { success: false, error: "Item use failed" };
    }
  }

  static async equipItem(itemId: string) {
    try {
      return await api.post(`/inventory/equip/${itemId}`);
    } catch (error) {
      console.error("Failed to equip item:", error);
      return { success: false, error: "Item equip failed" };
    }
  }

  // Code Farming System
  static async getCodeFarms() {
    try {
      return await api.get("/farming/");
    } catch (error) {
      console.error("Failed to get code farms:", error);
      return { success: false, error: "Farms fetch failed" };
    }
  }

  static async plantCode(plotX: number, plotY: number, codeType: string) {
    try {
      return await api.post("/farming/plant", {
        plot_x: plotX,
        plot_y: plotY,
        code_type: codeType,
      });
    } catch (error) {
      console.error("Failed to plant code:", error);
      return { success: false, error: "Code planting failed" };
    }
  }

  static async waterCode(farmId: string) {
    try {
      return await api.post(`/farming/${farmId}/water`);
    } catch (error) {
      console.error("Failed to water code:", error);
      return { success: false, error: "Code watering failed" };
    }
  }

  static async harvestCode(farmId: string) {
    try {
      return await api.post(`/farming/${farmId}/harvest`);
    } catch (error) {
      console.error("Failed to harvest code:", error);
      return { success: false, error: "Code harvest failed" };
    }
  }

  // Skills System
  static async getSkills() {
    try {
      return await api.get("/skills");
    } catch (error) {
      console.error("Failed to get skills:", error);
      return { success: false, error: "Skills fetch failed" };
    }
  }

  static async upgradeSkill(skillId: string) {
    try {
      return await api.post(`/skills/${skillId}/upgrade`);
    } catch (error) {
      console.error("Failed to upgrade skill:", error);
      return { success: false, error: "Skill upgrade failed" };
    }
  }

  // WebSocket Connection
  static connectWebSocket(onMessage: (event: string, data: any) => void) {
    const token = localStorage.getItem("auth_token");

    // If no token or demo token, skip WebSocket connection
    if (!token || token.startsWith("demo_")) {
      console.warn("No valid auth token - skipping WebSocket connection");
      return null;
    }

    try {
      // Use WebSocket URL from backend documentation
      const wsUrl = `ws://localhost:8000/ws?token=${token}`;

      this.socket = io(WS_URL, {
        query: { token },
        transports: ["websocket"],
        timeout: 5000,
        forceNew: true,
      });

      // Connection events
      this.socket.on("connect", () => {
        console.log("Connected to Code Valley game server");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from game server:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.warn("WebSocket connection failed:", error.message);
        // Don't throw error - just log and continue in offline mode
      });

      // Game events from backend documentation
      this.socket.on("player_position_update", (data) =>
        onMessage("player_position_update", data)
      );
      this.socket.on("world_object_update", (data) =>
        onMessage("world_object_update", data)
      );
      this.socket.on("npc_position_update", (data) =>
        onMessage("npc_position_update", data)
      );
      this.socket.on("time_update", (data) => onMessage("time_update", data));
      this.socket.on("season_change", (data) =>
        onMessage("season_change", data)
      );
      this.socket.on("interaction_result", (data) =>
        onMessage("interaction_result", data)
      );
      this.socket.on("quest_update", (data) => onMessage("quest_update", data));
      this.socket.on("friend_request", (data) =>
        onMessage("friend_request", data)
      );
      this.socket.on("achievement_unlocked", (data) =>
        onMessage("achievement_unlocked", data)
      );
      this.socket.on("level_up", (data) => onMessage("level_up", data));
      this.socket.on("user_status", (data) => onMessage("user_status", data));
      this.socket.on("event_broadcast", (data) =>
        onMessage("event_broadcast", data)
      );
      this.socket.on("dm_message", (data) => onMessage("dm_message", data));
      this.socket.on("guild_invitation", (data) =>
        onMessage("guild_invitation", data)
      );
      this.socket.on("notification", (data) => onMessage("notification", data));

      return this.socket;
    } catch (error) {
      console.warn("Failed to connect WebSocket:", error);
      return null;
    }
  }

  static sendPlayerMove(x: number, y: number, direction: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("player_move", { x, y, direction });
    }
  }

  static sendPlayerInteract(targetX: number, targetY: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("player_interact", {
        target_x: targetX,
        target_y: targetY,
      });
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
