import * as PIXI from "pixi.js";
import { useGameStore } from "../../store/gameStore";
import { PixiUtils } from "../../types/pixi";

export class Player {
  public sprite: PIXI.Sprite;
  public direction: string = "down";
  public isMoving: boolean = false;
  public hasMoved: boolean = false;
  public speed: number = 2;

  private gameStore = useGameStore;
  private animationTimer: number = 0;
  private animationSpeed: number = 200; // ms per frame
  private renderer: PIXI.Renderer | null;
  private baseY: number = 0;

  constructor(playerData: any, renderer?: PIXI.Renderer) {
    this.renderer = renderer || null;

    // Create player sprite (simple colored rectangle for now)
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x4ade80); // Green color
    graphics.drawRect(-16, -24, 32, 32);
    graphics.endFill();

    // Add simple face
    graphics.beginFill(0x000000);
    graphics.drawCircle(-8, -16, 2); // Left eye
    graphics.drawCircle(8, -16, 2); // Right eye
    graphics.drawRect(-6, -8, 12, 2); // Mouth
    graphics.endFill();

    // Generate texture menggunakan utility yang aman
    const texture = PixiUtils.safeGenerateTexture(this.renderer, graphics);
    this.sprite = new PIXI.Sprite(texture);

    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.x = playerData.position.x;
    this.sprite.y = playerData.position.y;
    this.baseY = playerData.position.y;

    this.direction = playerData.direction;

    // Clean up graphics setelah texture dibuat
    PixiUtils.safeDestroy(graphics);
  }

  public update(deltaTime: number, inputHandler: any) {
    const previousX = this.sprite.x;
    const previousY = this.sprite.y;

    let dx = 0;
    let dy = 0;
    let newDirection = this.direction;

    // Handle movement input
    if (inputHandler.isPressed("KeyW") || inputHandler.isPressed("ArrowUp")) {
      dy = -this.speed;
      newDirection = "up";
    } else if (
      inputHandler.isPressed("KeyS") ||
      inputHandler.isPressed("ArrowDown")
    ) {
      dy = this.speed;
      newDirection = "down";
    } else if (
      inputHandler.isPressed("KeyA") ||
      inputHandler.isPressed("ArrowLeft")
    ) {
      dx = -this.speed;
      newDirection = "left";
    } else if (
      inputHandler.isPressed("KeyD") ||
      inputHandler.isPressed("ArrowRight")
    ) {
      dx = this.speed;
      newDirection = "right";
    }

    // Update position
    if (dx !== 0 || dy !== 0) {
      this.sprite.x += dx;
      this.sprite.y += dy;
      this.isMoving = true;

      // Update direction
      if (newDirection !== this.direction) {
        this.direction = newDirection;
        this.updateSpriteDirection();
      }

      // Check if position changed
      if (this.sprite.x !== previousX || this.sprite.y !== previousY) {
        this.hasMoved = true;
        this.gameStore
          .getState()
          .updatePlayerPosition(this.sprite.x, this.sprite.y, this.direction);
      }
    } else {
      this.isMoving = false;
    }

    // Update animation
    if (this.isMoving) {
      this.animationTimer += deltaTime;
      if (this.animationTimer > this.animationSpeed) {
        this.animationTimer = 0;
        this.animateWalk();
      }
    }

    // Keep player within bounds (simple boundary check)
    this.sprite.x = Math.max(32, Math.min(this.sprite.x, 1200));
    this.sprite.y = Math.max(32, Math.min(this.sprite.y, 800));
  }

  private updateSpriteDirection() {
    // Reset rotation first
    this.sprite.rotation = 0;

    // Simple direction indication by rotation
    switch (this.direction) {
      case "up":
        this.sprite.rotation = 0;
        break;
      case "down":
        this.sprite.rotation = Math.PI;
        break;
      case "left":
        this.sprite.rotation = -Math.PI / 2;
        break;
      case "right":
        this.sprite.rotation = Math.PI / 2;
        break;
    }
  }

  private animateWalk() {
    // Simple bobbing animation yang tidak mengubah posisi permanent
    const bobOffset = Math.sin(Date.now() * 0.01) * 1;
    // Simpan baseY saat berhenti bergerak
    if (!this.isMoving) {
      this.baseY = this.sprite.y;
    }
  }

  public teleport(x: number, y: number, mapName?: string) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.baseY = y;

    if (mapName) {
      this.gameStore.getState().setCurrentMap(mapName);
    }

    this.hasMoved = true;
  }

  public destroy() {
    try {
      // Clean up sprite dan texture dengan utilities yang aman
      if (this.sprite) {
        if (this.sprite.texture && this.sprite.texture !== PIXI.Texture.EMPTY) {
          PixiUtils.safeDestroy(this.sprite.texture, {
            texture: true,
            baseTexture: true,
          });
        }
        PixiUtils.safeDestroy(this.sprite);
      }
    } catch (error) {
      console.warn("Error destroying player:", error);
    }
  }
}
