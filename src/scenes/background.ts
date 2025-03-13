import { Application, Assets, Container, Sprite, TilingSprite, Texture } from 'pixi.js';

export interface BackgroundLayerConfig {
  imagePath: string;
  speedX: number;
  isTiling: boolean;
}

export class BackgroundSettings {
  private app: Application;
  private container: Container;
  private layers: Array<{
    sprite: Sprite | TilingSprite;
    speedX: number;
    isTiling: boolean;
  }> = [];

  // Default background configuration
  private static defaultLayers: BackgroundLayerConfig[] = [
    {
      imagePath: 'assets/images/back.png',
      speedX: 0,
      isTiling: false
    },
    {
      imagePath: 'assets/images/middle.png',
      speedX: 0.5,
      isTiling: true
    },
    {
      imagePath: 'assets/images/front.png',
      speedX: 1,
      isTiling: true
    }
  ];

  // Store the ticker callback as a property
  private tickerCallback: () => void;
  private isRunning: boolean = false;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.app.stage.addChild(this.container);

    // Create the ticker callback once
    this.tickerCallback = () => {
      this.update(this.app.ticker.deltaTime);
    };

    // Set up window resize handler
    window.addEventListener('resize', () => {
      this.resize(this.app.screen.width, this.app.screen.height);
    });
  }

  // Static method to create and initialize a background
  static async create(app: Application, customLayers?: BackgroundLayerConfig[]): Promise<BackgroundSettings> {
    const background = new BackgroundSettings(app);
    await background.initialize(customLayers || this.defaultLayers);
    return background;
  }

  async initialize(layersConfig: BackgroundLayerConfig[]): Promise<void> {
    try {
      // Load all textures first
      const assetPaths = layersConfig.map(config => config.imagePath);
      const textures = await Assets.load(assetPaths);

      // Create layers in the specified order
      for (const config of layersConfig) {
        await this.addLayer(config, textures[config.imagePath]);
      }

      // Start the animation
      this.resume();

      return Promise.resolve();
    } catch (error) {
      console.error("Failed to initialize background:", error);
      return Promise.reject(error);
    }
  }

  private async addLayer(config: BackgroundLayerConfig, texture: Texture): Promise<void> {
    const { imagePath, speedX, isTiling } = config;

    let sprite: Sprite | TilingSprite;

    if (isTiling) {
      // Create a tiling sprite
      sprite = new TilingSprite({
        texture,
        width: this.app.screen.width,
        height: this.app.screen.height
      });

      // Set tiling scale
      (sprite as TilingSprite).tileScale.set(
        this.app.screen.width / texture.width,
        this.app.screen.height / texture.height
      );
    } else {
      // Create a regular sprite
      sprite = Sprite.from(texture);

      // Resize to match screen
      sprite.width = this.app.screen.width;
      sprite.height = this.app.screen.height;
    }

    // Add to container
    this.container.addChild(sprite);

    // Store layer data for animation
    this.layers.push({
      sprite,
      speedX,
      isTiling,
    });
  }

  private update(deltaTime: number): void {
    // Update each layer's position
    for (const layer of this.layers) {
      if (layer.sprite instanceof TilingSprite) {
        layer.sprite.tilePosition.x += layer.speedX * deltaTime;
      } else {
        // For non-tiling sprites, you might want to implement
        // different movement logic or wrapping behavior
      }
    }
  }

  // Pause the background animation
  pause(): void {
    if (this.isRunning) {
      this.app.ticker.remove(this.tickerCallback);
      this.isRunning = false;
    }
  }

  // Resume or start the background animation
  resume(): void {
    if (!this.isRunning) {
      this.app.ticker.add(this.tickerCallback);
      this.isRunning = true;
    }
  }

  // Method to resize all layers when window size changes
  resize(width: number, height: number): void {
    for (const layer of this.layers) {
      layer.sprite.width = width;
      layer.sprite.height = height;

      if (layer.sprite instanceof TilingSprite) {
        const texture = layer.sprite.texture;
        layer.sprite.tileScale.set(
          width / texture.width,
          height / texture.height
        );
      }
    }
  }
}