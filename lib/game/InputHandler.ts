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

      // Handle UI shortcuts
      this.handleUIShortcuts(event.code);
      
      // Prevent default for game keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyI', 'KeyQ', 'KeyK', 'KeyF', 'KeyN'].includes(event.code)) {
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

  private handleUIShortcuts(keyCode: string) {
    // Import game store dynamically to avoid circular dependencies
    import('@/lib/store/gameStore').then(({ useGameStore }) => {
      const store = useGameStore.getState();
      
      switch (keyCode) {
        case 'KeyI':
          store.toggleInventory();
          break;
        case 'KeyQ':
          store.toggleQuestLog();
          break;
        case 'KeyK':
          store.toggleSkillTree();
          break;
        case 'KeyF':
          store.toggleFriends();
          break;
        case 'KeyN':
          store.toggleNotifications();
          break;
      }
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