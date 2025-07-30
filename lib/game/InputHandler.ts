export class InputHandler {
  private keys: Set<string> = new Set();
  private actionPressed: boolean = false;
  private actionKey: string = 'Space';

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
      
      if (event.code === this.actionKey) {
        this.actionPressed = true;
      }
      
      // Prevent default for game keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      
      if (event.code === this.actionKey) {
        this.actionPressed = false;
      }
    });

    // Prevent losing focus
    document.addEventListener('blur', () => {
      this.keys.clear();
      this.actionPressed = false;
    });
  }

  public isPressed(keyCode: string): boolean {
    return this.keys.has(keyCode);
  }

  public isActionPressed(): boolean {
    const wasPressed = this.actionPressed;
    this.actionPressed = false; // Reset after checking
    return wasPressed;
  }

  public update() {
    // This can be used for any per-frame input processing
  }
}