import * as PIXI from "pixi.js";
import { Player } from "./entities/Player";
import { Map } from "./world/Map";
import { Camera } from "./Camera";
import { InputHandler } from "./InputHandler";
import { NPCManager } from "./entities/NPCManager";
import { useGameStore } from "../store/gameStore";
import GameAPI from "../api/gameApi";
import { Ticker } from "@pixi/ticker";

export class GameEngine {
  public app: PIXI.Application;
  public gameContainer: PIXI.Container;
  public uiContainer: PIXI.Container;

  public player: Player | null = null;
  public currentMap: Map | null = null;
  public camera: Camera | null = null;
  public inputHandler: InputHandler;
  public npcManager: NPCManager;

  private gameStore = useGameStore;
  private lastUpdate = Date.now();
  private gameLoop: boolean = true;
  private canvas: HTMLCanvasElement; // Store canvas reference

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas; // Store canvas reference

    // Initialize Pixi Application untuk v8
    this.app = new PIXI.Application();

    // Initialize app secara async
    this.initializeApp(canvas);

    // Create main containers
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();

    this.inputHandler = new InputHandler();
    this.npcManager = new NPCManager();

    console.log("Game Engine initialized");
  }

  private async initializeApp(canvas: HTMLCanvasElement) {
    try {
      // Initialize PIXI Application untuk v8
      await this.app.init({
        canvas: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x2d3748,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Add containers to stage
      this.app.stage.addChild(this.gameContainer);
      this.app.stage.addChild(this.uiContainer);

      // Setup WebSocket connection
      this.setupWebSocket();

      // Start game loop
      const ticker = new Ticker();
      ticker.add(this.update.bind(this));
      ticker.start();

      console.log("PIXI App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PIXI app:", error);
    }
  }

  async initialize() {
    try {
      // Wait for app to be initialized
      while (!this.app.renderer) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Load initial game data
      await this.loadPlayerData();
      await this.loadMapData("village");

      // Initialize player
      const playerData = this.gameStore.getState().player;
      if (playerData) {
        this.player = new Player(playerData, this.app.renderer);
        this.gameContainer.addChild(this.player.sprite);

        // Init camera AFTER renderer ready
        this.camera = new Camera(
          this.gameContainer,
          this.app.screen.width, // Gunakan app.screen.width untuk v8
          this.app.screen.height // Gunakan app.screen.height untuk v8
        );

        // Center camera on player
        this.camera.followTarget(this.player.sprite);
      }

      // Load NPCs
      await this.loadNPCs();

      this.gameStore.getState().setInitialized(true);
      this.gameStore.getState().setLoading(false);

      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.gameStore.getState().setLoading(false);
    }
  }

  private async loadPlayerData() {
    try {
      const response = await GameAPI.getProfile();
      if (response.success) {
        const userData = response.data;
        const player = {
          id: userData.id,
          username: userData.username,
          position: { x: userData.pos_x || 100, y: userData.pos_y || 100 },
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
  }

  private async loadMapData(mapName: string) {
    try {
      const response = await GameAPI.getMapState(mapName);
      if (response.success) {
        // Load map from API data
        this.currentMap = new Map(mapName, response.data);
        this.gameContainer.addChild(this.currentMap.container);
      }
    } catch (error) {
      console.error("Failed to load map data:", error);
      // Create default map for demo
      this.createDefaultMap(mapName);
    }
  }

  private createDefaultMap(mapName: string) {
    this.currentMap = new Map(mapName);
    this.gameContainer.addChild(this.currentMap.container);
  }

  private async loadNPCs() {
    // Create demo NPCs
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
            choices: ["Yes", "No"],
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
          { text: "Check the quest board for available work!", speaker: "Bob" },
        ],
        relationship: 0,
        schedule: [],
      },
    ];

    this.gameStore.getState().setNPCs(demoNPCs);
    this.npcManager.loadNPCs(demoNPCs, this.gameContainer, this.app.renderer);
  }

  private setupWebSocket() {
    GameAPI.connectWebSocket((event, data) => {
      switch (event) {
        case "player_position_update":
          this.handlePlayerPositionUpdate(data);
          break;
        case "time_update":
          this.gameStore.getState().setGameTime(data);
          break;
        case "npc_position_update":
          this.npcManager.updateNPCPosition(data);
          break;
        case "quest_update":
          this.handleQuestUpdate(data);
          break;
        case "notification":
          this.showNotification(data.message);
          break;
      }
    });
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

  private handleQuestUpdate(data: any) {
    // Update quest progress
    console.log("Quest update:", data);
  }

  private showNotification(message: string) {
    console.log("Notification:", message);
    // TODO: Implement UI notification system
  }

  public update() {
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    if (!this.gameLoop) return;

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

    // Check object interactions
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
    // Gunakan app.renderer.resize untuk v8
    if (this.app.renderer) {
      this.app.renderer.resize(width, height);
    }

    if (this.camera) {
      this.camera.resize(width, height);
    }
  }

  public destroy() {
    this.gameLoop = false;
    GameAPI.disconnectWebSocket();

    // Destroy containers
    if (this.gameContainer) {
      this.gameContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    }

    if (this.uiContainer) {
      this.uiContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    }

    // Destroy renderer - perbaikan untuk v8
    if (this.app.renderer) {
      this.app.renderer.destroy();
    }

    // Remove canvas from DOM - perbaikan untuk v8
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    console.log("Game destroyed successfully");
  }
}
