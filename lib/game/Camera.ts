import * as PIXI from 'pixi.js';

export class Camera {
  private gameContainer: PIXI.Container;
  private target: PIXI.DisplayObject | null = null;
  private screenWidth: number;
  private screenHeight: number;
  private followSpeed: number = 0.1;

  constructor(gameContainer: PIXI.Container, screenWidth: number, screenHeight: number) {
    this.gameContainer = gameContainer;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  public followTarget(target: PIXI.DisplayObject) {
    this.target = target;
  }

  public update() {
    if (!this.target) return;
    
    // Calculate target camera position (center the target on screen)
    const targetX = -this.target.x + this.screenWidth / 2;
    const targetY = -this.target.y + this.screenHeight / 2;
    
    // Smooth camera movement
    this.gameContainer.x += (targetX - this.gameContainer.x) * this.followSpeed;
    this.gameContainer.y += (targetY - this.gameContainer.y) * this.followSpeed;
    
    // Optional: Add camera bounds
    // this.gameContainer.x = Math.max(-1000, Math.min(this.gameContainer.x, 100));
    // this.gameContainer.y = Math.max(-800, Math.min(this.gameContainer.y, 100));
  }

  public resize(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  public setPosition(x: number, y: number) {
    this.gameContainer.x = x;
    this.gameContainer.y = y;
  }
}