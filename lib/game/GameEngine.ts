import * as PIXI from "pixi.js";
import { Player } from "./entities/Player";
import { Map } from "./world/Map";
import { Camera } from "./Camera";
import { InputHandler } from "./InputHandler";
import { NPCManager } from "./entities/NPCManager";
import { TimeManager } from "./TimeManager";
import { useGameStore } from "../store/gameStore";
import GameAPI from "../api/gameApi";

export class GameEngine {
  public app: PIXI.Application | null = null;
  public gameContainer: PIXI.Container;
  public uiContainer: PIXI.Container;

  public player: Player | null = null;
  public currentMap: Map | null = null;
  public camera: Camera | null = null;
  public inputHandler: InputHandler;
  public npcManager: NPCManager;
  public timeManager: TimeManager | null = null;

  private gameStore = useGameStore;
  private lastUpdate = Date.now();
  private gameLoop: boolean = true;
  private canvas: HTMLCanvasElement;
  private ticker: PIXI.Ticker | null = null;
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Initialize containers first
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();

    this.inputHandler = new InputHandler();
    this.npcManager = new NPCManager();

    console.log("Game Engine initialized");
  }

  async initialize() {
    try {
      this.gameStore.getState().setLoading(true);
      
      // Initialize PIXI Application for v8
      this.app = new PIXI.Application();
      
      await this.app.init({
        canvas: this.canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x2d3748,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Ensure app and stage are ready
      if (!this.app || !this.app.stage) {
        throw new Error("PIXI Application stage not ready");
      }

      // Add containers to stage after app is ready
      this.app.stage.addChild(this.gameContainer);
      this.app.stage.addChild(this.uiContainer);

      console.log("PIXI App initialized successfully");

      // Try to authenticate first
      await this.tryAuthentication();

      // Load initial game data
      await this.loadPlayerData();
      await this.loadMapData("village");

      // Initialize player with ready renderer
      const playerData = this.gameStore.getState().player;
      if (playerData && this.app.renderer) {
        this.player = new Player(playerData, this.app.renderer);
        this.gameContainer.addChild(this.player.sprite);

        // Initialize camera
        this.camera = new Camera(
          this.gameContainer,
          this.app.screen.width,
          this.app.screen.height
        );

        // Center camera on player
        this.camera.followTarget(this.player.sprite);
      }

      // Load NPCs
      await this.loadNPCs();

      // Initialize time manager
      this.timeManager = new TimeManager();

      // Setup WebSocket connection (only if authenticated)
      this.setupWebSocket();

      // Start game loop
      this.startGameLoop();

      this.isInitialized = true;
      this.gameStore.getState().setInitialized(true);
      this.gameStore.getState().setLoading(false);

      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.gameStore.getState().setLoading(false);
      throw error; // Re-throw to be handled by Game component
    }
  }

  private async tryAuthentication() {
    // Check if we have a stored token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No auth token found - creating demo session');
      // Create a demo token for development
      const demoToken = 'demo_' + Date.now();
      localStorage.setItem('auth_token', demoToken);
      return;
    }

    // Try to validate token with backend
    try {
      const response = await GameAPI.getProfile();
      if (response.success) {
        console.log('Authentication successful');
      } else {
        console.warn('Token invalid - creating new demo session');
        this.createDemoAuth();
      }
    } catch (error) {
      console.warn('Backend unavailable - using demo mode');
      this.createDemoAuth();
    }
  }

  private createDemoAuth() {
    const demoToken = 'demo_' + Date.now();
    localStorage.setItem('auth_token', demoToken);
  }

  private startGameLoop() {
    if (!this.app) return;

    try {
      // Use ticker from app for v8
      this.ticker = this.app.ticker;
      
      // Bind update method and add to ticker
      const updateFn = this.update.bind(this);
      this.ticker.add(updateFn);
      
      console.log("Game loop started successfully");
    } catch (error) {
      console.error("Failed to start game loop:", error);
    }
  }

  private async loadPlayerData() {
    try {
      const response = await GameAPI.getProfile();
      if (response.success && response.data) {
        const userData = response.data;
        const player = {
          id: userData.id,
          username: userData.username,
          position: { x: userData.pos_x || 400, y: userData.pos_y || 300 },
          direction: "down" as const,
          currentMap: userData.current_map || "village",
          stats: {
            level: userData.level || 1,
            exp: userData.exp || 0,
            coins: userData.coins || 100,
            energy: userData.energy || 100,
            maxEnergy: userData.max_energy || 100,
          },
          skills: {
            frontend: userData.frontend_skill || 1,
            backend: userData.backend_skill || 1,
            problemSolving: userData.problem_solving_skill || 1,
          },
          inventory: [],
        };

        this.gameStore.getState().setPlayer(player);
        console.log("Player data loaded successfully");
      } else {
        this.createDefaultPlayer();
      }
    } catch (error) {
      console.error("Failed to load player data:", error);
      // Create default player for demo
      this.createDefaultPlayer();
    }
  }

  private createDefaultPlayer() {
    const defaultPlayer = {
      id: "demo_player",
      username: "Demo Player",
      position: { x: 400, y: 300 },
      direction: "down" as const,
      currentMap: "village",
      stats: {
        level: 1,
        exp: 0,
        coins: 100,
        energy: 100,
        maxEnergy: 100,
      },
      skills: {
        frontend: 1,
        backend: 1,
        problemSolving: 1,
      },
      inventory: [],
    };

    this.gameStore.getState().setPlayer(defaultPlayer);
    console.log("Default player created");
  }

  private async loadMapData(mapName: string) {
    try {
      const response = await GameAPI.getMapState(mapName);
      if (response.success && response.data) {
        // Load map from API data
        this.currentMap = new Map(mapName, response.data, this.app?.renderer);
        this.gameContainer.addChild(this.currentMap.container);
        console.log("Map data loaded from API");
      } else {
        this.createDefaultMap(mapName);
      }
    } catch (error) {
      console.error("Failed to load map data:", error);
      // Create default map for demo
      this.createDefaultMap(mapName);
    }
  }

  private createDefaultMap(mapName: string) {
    this.currentMap = new Map(mapName, undefined, this.app?.renderer);
    this.gameContainer.addChild(this.currentMap.container);
    console.log("Default map created");
  }

  private async loadNPCs() {
    // Create demo NPCs based on backend structure
    const demoNPCs = [
      {
        id: "mentor_alice",
        name: "Alice the Mentor",
        position: { x: 300, y: 200 },
        currentMap: "village",
        dialogue: [
          {
            text: "Welcome to Code Valley! I'm Alice, your programming mentor.",
            speaker: "Alice",
          },
          {
            text: "Would you like to learn about frontend development?",
            speaker: "Alice",
            choices: ["Yes, teach me!", "Maybe later"],
          },
        ],
        relationship: 0,
        schedule: [],
      },
      {
        id: "client_bob",
        name: "Bob the Client",
        position: { x: 500, y: 250 },
        currentMap: "village",
        dialogue: [
          {
            text: "Hey there! I have some coding projects if you're interested.",
            speaker: "Bob",
          },
          { 
            text: "Check the quest board for available work!", 
            speaker: "Bob" 
          },
        ],
        relationship: 0,
        schedule: [],
      },
      {
        id: "farmer_charlie",
        name: "Charlie the Code Farmer",
        position: { x: 600, y: 400 },
        currentMap: "village",
        dialogue: [
          {
            text: "Welcome to the Code Farm! Here you can plant and grow algorithms.",
            speaker: "Charlie",
          },
          {
            text: "Plant some seeds and water them regularly for the best harvest!",
            speaker: "Charlie",
          },
        ],
        relationship: 0,
        schedule: [],
      },
    ];

    this.gameStore.getState().setNPCs(demoNPCs);
    this.npcManager.loadNPCs(demoNPCs, this.gameContainer, this.app?.renderer);
    console.log("NPCs loaded successfully");
  }

  private setupWebSocket() {
    const token = localStorage.getItem('auth_token');
    
    // Skip WebSocket if no token or demo token
    if (!token || token.startsWith('demo_')) {
      console.warn('Skipping WebSocket connection - no valid token');
      return;
    }

    try {
      GameAPI.connectWebSocket((event, data) => {
        switch (event) {
          case "player_position_update":
            this.handlePlayerPositionUpdate(data);
            break;
          case "time_update":
            this.gameStore.getState().setGameTime(data);
            break;
          case "season_change":
            console.log("Season changed:", data);
            break;
          case "npc_position_update":
            this.npcManager.updateNPCPosition(data);
            break;
          case "world_object_update":
            this.handleWorldObjectUpdate(data);
            break;
          case "interaction_result":
            this.handleInteractionResult(data);
            break;
          case "quest_update":
            this.handleQuestUpdate(data);
            break;
          case "achievement_unlocked":
            this.showNotification(`Achievement unlocked: ${data.title}`);
            break;
          case "level_up":
            this.showNotification(`Level up! You are now level ${data.level}`);
            break;
          case "notification":
            this.showNotification(data.message);
            break;
          case "friend_request":
            this.showNotification(`Friend request from ${data.username}`);
            break;
          case "dm_message":
            this.showNotification(`Message from ${data.sender}: ${data.message}`);
            break;
          case "guild_invitation":
            this.showNotification(`Guild invitation from ${data.guild_name}`);
            break;
          case "event_broadcast":
            this.showNotification(`Event: ${data.message}`);
            break;
        }
      });
    } catch (error) {
      console.warn('WebSocket setup failed:', error);
    }
  }

  private handlePlayerPositionUpdate(data: any) {
    const { otherPlayers } = this.gameStore.getState();
    const updatedPlayers = otherPlayers.map((p) =>
      p.id === data.player_id
        ? {
            ...p,
            position: { x: data.x, y: data.y },
            direction: data.direction,
          }
        : p
    );
    this.gameStore.getState().setOtherPlayers(updatedPlayers);
  }

  private handleWorldObjectUpdate(data: any) {
    console.log("World object update:", data);
    // Handle world object changes (trees chopped, rocks mined, etc.)
  }

  private handleInteractionResult(data: any) {
    console.log("Interaction result:", data);
    // Handle interaction results (item received, energy consumed, etc.)
    if (data.rewards) {
      const { player } = this.gameStore.getState();
      if (player && data.rewards.coins) {
        this.gameStore.getState().updatePlayerStats({
          coins: player.stats.coins + data.rewards.coins
        });
      }
    }
  }

  private handleQuestUpdate(data: any) {
    console.log("Quest update:", data);
    // Update quest progress in store
    const { quests } = this.gameStore.getState();
    const updatedQuests = quests.map(quest => 
      quest.id === data.quest_id 
        ? { ...quest, progress: data.progress, status: data.status }
        : quest
    );
    this.gameStore.getState().setQuests(updatedQuests);
  }

  private showNotification(message: string) {
    console.log("Notification:", message);
    // TODO: Implement in-game notification system
  }

  public update() {
    if (!this.isInitialized || !this.gameLoop) return;

    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    // Update input
    this.inputHandler.update();

    // Update player
    if (this.player) {
      this.player.update(deltaTime, this.inputHandler);

      // Send position updates via WebSocket
      if (this.player.hasMoved) {
        GameAPI.sendPlayerMove(
          this.player.sprite.x,
          this.player.sprite.y,
          this.player.direction
        );
        this.player.hasMoved = false;
      }
    }

    // Update NPCs
    this.npcManager.update(deltaTime);

    // Update camera
    if (this.camera) {
      this.camera.update();
    }

    // Check for interactions
    this.checkInteractions();
  }

  private checkInteractions() {
    if (!this.player || !this.inputHandler.isActionPressed()) return;

    const playerPos = this.player.sprite.position;
    const interactionRange = 50;

    // Check NPC interactions
    const npcs = this.gameStore.getState().npcs;
    for (const npcData of npcs) {
      const npc = this.npcManager.getNPC(npcData.id);
      if (npc) {
        const distance = Math.sqrt(
          Math.pow(playerPos.x - npc.sprite.x, 2) +
            Math.pow(playerPos.y - npc.sprite.y, 2)
        );

        if (distance < interactionRange) {
          this.startDialogue(npcData);
          return;
        }
      }
    }

    // Check object interactions via WebSocket
    GameAPI.sendPlayerInteract(playerPos.x, playerPos.y);
  }

  private startDialogue(npcData: any) {
    this.gameStore.getState().setActiveDialogue({
      npc: npcData,
      currentDialogue: 0,
      dialogues: npcData.dialogue,
    });
  }

  public resize(width: number, height: number) {
    try {
      if (this.app && this.app.renderer) {
        this.app.renderer.resize(width, height);
      }

      if (this.camera) {
        this.camera.resize(width, height);
      }
    } catch (error) {
      console.warn("Error during resize:", error);
    }
  }

  public destroy() {
    this.gameLoop = false;
    this.isInitialized = false;
    
    // Disconnect WebSocket
    GameAPI.disconnectWebSocket();

    // Destroy time manager
    if (this.timeManager) {
      this.timeManager.destroy();
      this.timeManager = null;
    }

    // Stop ticker
    if (this.ticker) {
      this.ticker.stop();
      this.ticker.remove(this.update.bind(this));
      this.ticker = null;
    }

    // Destroy player first
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    // Destroy NPCs
    if (this.npcManager) {
      this.npcManager.destroy();
    }

    // Destroy current map
    if (this.currentMap) {
      this.currentMap.destroy();
      this.currentMap = null;
    }

    // Destroy containers with proper cleanup
    if (this.gameContainer) {
      // Remove all children first
      while (this.gameContainer.children.length > 0) {
        const child = this.gameContainer.children[0];
        this.gameContainer.removeChild(child);
        if (child.destroy) {
          child.destroy();
        }
      }
      this.gameContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    }

    if (this.uiContainer) {
      // Remove all children first
      while (this.uiContainer.children.length > 0) {
        const child = this.uiContainer.children[0];
        this.uiContainer.removeChild(child);
        if (child.destroy) {
          child.destroy();
        }
      }
      this.uiContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    }

    // Destroy app with correct method for v8
    if (this.app) {
      try {
        // Remove containers from stage first
        if (this.app.stage) {
          this.app.stage.removeChildren();
        }
        
        // Destroy app without parameters for v8
        this.app.destroy();
        this.app = null;
      } catch (error) {
        console.warn("Error destroying PIXI app:", error);
        this.app = null;
      }
    }

    // Clear canvas
    if (this.canvas && this.canvas.parentNode) {
      try {
        this.canvas.parentNode.removeChild(this.canvas);
      } catch (error) {
        console.warn("Error removing canvas:", error);
      }
    }

    console.log("Game destroyed successfully");
  }
}