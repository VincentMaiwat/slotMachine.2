import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
// import { Component } from '../utils/resize';

export class Logo {
  private app: Application;
  private sprite?: Sprite;
  private logoTexture?: Texture;
  private logoPath: string = 'assets/images/SLOT.png';
  private container: Container;

   // Default properties
   private width: number = 400;
   private height: number = 280;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.app.stage.addChild(this.container);

    // Setup resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // Handle window resize
  private handleResize(): void {
    if (this.container) {
      this.container.position.set((window.innerWidth)/2,(window.innerHeight)/7);
      // this.sprite.y = (window.innerHeight - this.sprite.height)/2;
      // this.sprite.x = (window.innerWidth - this.sprite.width)/2;
      // this.container.x = this.xPosition || this.app.screen.width / 2;
      // this.container.y = this.yPosition || this.app.screen.height / 2;
    }
  }

  static async create(app: Application): Promise<Logo> {
    const logo = new Logo(app);
    await logo.initialize();
    return logo;
  }

  // Initialize the logo with all customizations
  async initialize(): Promise<void> {
    try {
      this.logoTexture = await Assets.load(this.logoPath);
      this.sprite = Sprite.from(this.logoTexture);

      // Apply all configurations and add to container
      this.applyConfigurations();
      this.container.addChild(this.sprite);

      return Promise.resolve();
    } catch (error) {
      console.error("Failed to load logo:", error);
      return Promise.reject(error);
    }
  }

  // Apply all configurations to the sprite
  private applyConfigurations(): void {
    if (!this.sprite) return; // Check if there is sprite loaded
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.sprite.anchor.set(0.5,0.5);
    // Set position (default to center if not specified)
    this.container.position.set((window.innerWidth - this.container.width)/2,(window.innerHeight - this.container.height)/7);
   }

}