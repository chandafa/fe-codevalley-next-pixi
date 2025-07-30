import * as PIXI from "pixi.js";

export class Map {
  public container: PIXI.Container;
  public name: string;
  public width: number = 1200;
  public height: number = 800;
  private renderer: PIXI.Renderer | null;

  constructor(name: string, mapData?: any, renderer?: PIXI.Renderer) {
    this.name = name;
    this.container = new PIXI.Container();
    this.renderer = renderer || null;

    if (mapData) {
      this.loadFromData(mapData);
    } else {
      this.createDefaultMap();
    }
  }

  private loadFromData(mapData: any) {
    // Load map from API data
    console.log("Loading map from data:", mapData);
    // TODO: Implement map loading from API data
    this.createDefaultMap();
  }

  private createDefaultMap() {
    // Create a simple grass background
    const background = new PIXI.Graphics();
    background.beginFill(0x4ade80); // Grass green
    background.drawRect(0, 0, this.width, this.height);
    background.endFill();

    this.container.addChild(background);

    // Add some simple environment objects
    this.createEnvironmentObjects();
  }

  private createEnvironmentObjects() {
    // Add trees
    for (let i = 0; i < 10; i++) {
      const tree = this.createTree();
      tree.x = Math.random() * (this.width - 100) + 50;
      tree.y = Math.random() * (this.height - 100) + 50;
      this.container.addChild(tree);
    }

    // Add rocks
    for (let i = 0; i < 5; i++) {
      const rock = this.createRock();
      rock.x = Math.random() * (this.width - 100) + 50;
      rock.y = Math.random() * (this.height - 100) + 50;
      this.container.addChild(rock);
    }

    // Add quest board
    const questBoard = this.createQuestBoard();
    questBoard.x = 200;
    questBoard.y = 150;
    this.container.addChild(questBoard);

    // Add code farm area
    const farmArea = this.createFarmArea();
    farmArea.x = 600;
    farmArea.y = 400;
    this.container.addChild(farmArea);
  }

  private createTree() {
    const tree = new PIXI.Graphics();

    // Tree trunk
    tree.beginFill(0x8b4513);
    tree.drawRect(-4, 0, 8, 20);
    tree.endFill();

    // Tree leaves
    tree.beginFill(0x228b22);
    tree.drawCircle(0, -10, 15);
    tree.endFill();

    return tree;
  }

  private createRock() {
    const rock = new PIXI.Graphics();
    rock.beginFill(0x696969);
    rock.drawCircle(0, 0, 12);
    rock.endFill();
    return rock;
  }

  private createQuestBoard() {
    const board = new PIXI.Graphics();

    // Board background
    board.beginFill(0x8b4513);
    board.drawRect(-30, -40, 60, 80);
    board.endFill();

    // Add text
    const text = new PIXI.Text("Quest\nBoard", {
      fontSize: 12,
      fill: 0xffffff,
      align: "center",
      fontFamily: "Arial",
    });
    text.anchor.set(0.5, 0.5);
    board.addChild(text);

    return board;
  }

  private createFarmArea() {
    const farmArea = new PIXI.Graphics();

    // Farm background
    farmArea.beginFill(0x8b4513);
    farmArea.drawRect(-50, -50, 100, 100);
    farmArea.endFill();

    // Farm plots
    farmArea.beginFill(0x654321);
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        farmArea.drawRect(-40 + x * 25, -40 + y * 25, 20, 20);
      }
    }
    farmArea.endFill();

    // Add label
    const text = new PIXI.Text("Code Farm", {
      fontSize: 12,
      fill: 0xffffff,
      fontFamily: "Arial",
    });
    text.anchor.set(0.5, 1);
    text.position.set(0, -60);
    farmArea.addChild(text);

    return farmArea;
  }

  public destroy() {
    // Destroy all children
    this.container.children.forEach((child) => {
      if (child instanceof PIXI.Graphics) {
        child.destroy();
      } else if (child instanceof PIXI.Sprite) {
        if (child.texture) {
          child.texture.destroy(true);
        }
        child.destroy();
      } else if (child instanceof PIXI.Text) {
        child.destroy();
      }
    });

    // Destroy container
    this.container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}
