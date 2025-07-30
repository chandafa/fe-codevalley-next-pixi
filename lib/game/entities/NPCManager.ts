import * as PIXI from "pixi.js";

export class NPC {
  public sprite: PIXI.Sprite;
  public id: string;
  public name: string;
  public dialogue: any[];
  private renderer: PIXI.Renderer | null;

  constructor(npcData: any, renderer?: PIXI.Renderer) {
    this.id = npcData.id;
    this.name = npcData.name;
    this.dialogue = npcData.dialogue;
    this.renderer = renderer || null;

    // Create NPC sprite (simple colored rectangle)
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x60a5fa); // Blue color for NPCs
    graphics.drawRect(-16, -24, 32, 32);
    graphics.endFill();

    // Add simple face
    graphics.beginFill(0x000000);
    graphics.drawCircle(-8, -16, 2); // Left eye
    graphics.drawCircle(8, -16, 2); // Right eye
    graphics.drawRect(-6, -8, 12, 2); // Mouth
    graphics.endFill();

    // Create texture
    let texture: PIXI.Texture;
    if (this.renderer) {
      texture = this.renderer.generateTexture(graphics);
    } else {
      // Fallback: create texture from graphics directly
      texture = PIXI.Texture.from(graphics);
    }

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.x = npcData.position.x;
    this.sprite.y = npcData.position.y;

    // Add name label
    const nameText = new PIXI.Text(npcData.name, {
      fontSize: 12,
      fill: 0xffffff,
      fontFamily: "Arial",
    });
    nameText.anchor.set(0.5, 1);
    nameText.position.set(0, -32);
    this.sprite.addChild(nameText);

    // Clean up graphics setelah texture dibuat
    graphics.destroy();
  }

  public update(deltaTime: number) {
    // Simple idle animation
    const time = Date.now() * 0.002;
    const idleOffset = Math.sin(time) * 0.5;
    this.sprite.y += idleOffset * 0.1;
  }

  public destroy() {
    if (this.sprite) {
      // Destroy children first
      this.sprite.children.forEach((child) => {
        if (child instanceof PIXI.Text) {
          child.destroy();
        }
      });

      // Destroy texture
      if (this.sprite.texture) {
        this.sprite.texture.destroy(true);
      }

      // Destroy sprite
      this.sprite.destroy();
    }
  }
}

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();

  public loadNPCs(
    npcData: any[],
    container: PIXI.Container,
    renderer?: PIXI.Renderer
  ) {
    // Clear existing NPCs
    this.npcs.forEach((npc) => {
      container.removeChild(npc.sprite);
      npc.destroy();
    });
    this.npcs.clear();

    // Create new NPCs
    npcData.forEach((data) => {
      const npc = new NPC(data, renderer);
      this.npcs.set(data.id, npc);
      container.addChild(npc.sprite);
    });
  }

  public getNPC(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  public update(deltaTime: number) {
    this.npcs.forEach((npc) => {
      npc.update(deltaTime);
    });
  }

  public updateNPCPosition(data: { npc_id: string; x: number; y: number }) {
    const npc = this.npcs.get(data.npc_id);
    if (npc) {
      npc.sprite.x = data.x;
      npc.sprite.y = data.y;
    }
  }

  public destroy() {
    this.npcs.forEach((npc) => {
      npc.destroy();
    });
    this.npcs.clear();
  }
}
