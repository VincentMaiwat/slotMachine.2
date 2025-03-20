import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { AssetLoader } from '../utils/assetLoader';
// import { asse } from '../utils/resize';

export class Logo {
  private app: Application;
  private sprite?: Sprite;
  private logoTexture?: Texture;
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
      const scaleAmount = Math.min(window.innerWidth / 1920, window.innerHeight / 920);
            this.container.scale.set(scaleAmount);

            // Offset from
            const offsetX = 0;
            const offsetY = -350;

            const centerX = window.innerWidth/2;
            const centerY = window.innerHeight/2;

            this.container.x = centerX + (offsetX * scaleAmount);
            this.container.y = centerY + (offsetY * scaleAmount);

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
      // await AssetLoader.init(this.app);
      this.logoTexture = AssetLoader.getLogoTexture();
      this.sprite = Sprite.from(this.logoTexture);

      // Apply all configurations and add to container
      this.applyConfigurations();
      this.container.addChild(this.sprite);

      this.handleResize();

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
    this.container.position.set((window.innerWidth - this.container.width)/2,120);
   }

}