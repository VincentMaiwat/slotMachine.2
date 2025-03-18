//assetloader.ts

import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export class AssetLoader {
    private static textures: Texture[] = [];
    private static coinTexture: Texture;
    private static logoTexture: Texture;
    private static spinTexture: Texture;
    private static glTexture: Texture;
    private static backTexture: Texture;
    private static middleTexture: Texture;
    private static frontTexture: Texture;

    private static app: Application;
    private static progressBar: Graphics;
    private static progressText: Text;
    private static loadingContainer: Container;

    public static async init(app: Application): Promise<void> {
        this.app = app;
        this.setupLoadingScreen();
        await this.loadAllAssets();
        this.hideLoadingScreen();
    }

    private static setupLoadingScreen(): void {
        // Create container for loading elements
        this.loadingContainer = new Container();
        this.app.stage.addChild(this.loadingContainer);

        // Create background
        const background = new Graphics();
        background.beginFill(0x000000, 0.7);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.loadingContainer.addChild(background);

        // Create title text
        const titleText = new Text("Loading Game Assets", {
            fontFamily: "Arial",
            fontSize: 36,
            fill: 0xffffff,
            align: "center"
        });
        titleText.anchor.set(0.5);
        titleText.x = this.app.screen.width / 2;
        titleText.y = this.app.screen.height / 2 - 50;
        this.loadingContainer.addChild(titleText);

        // Create progress bar background
        const progressBarBg = new Graphics();
        progressBarBg.beginFill(0x333333);
        progressBarBg.drawRoundedRect(
            this.app.screen.width / 2 - 200,
            this.app.screen.height / 2,
            400,
            30,
            15
        );
        progressBarBg.endFill();
        this.loadingContainer.addChild(progressBarBg);

        // Create progress bar
        this.progressBar = new Graphics();
        this.progressBar.beginFill(0xff9900);
        this.progressBar.drawRoundedRect(
            this.app.screen.width / 2 - 200,
            this.app.screen.height / 2,
            0, // Initial width is 0
            30,
            15
        );
        this.progressBar.endFill();
        this.loadingContainer.addChild(this.progressBar);

        // Create progress text
        this.progressText = new Text("0%", {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0xffffff,
            align: "center"
        });
        this.progressText.anchor.set(0.5);
        this.progressText.x = this.app.screen.width / 2;
        this.progressText.y = this.app.screen.height / 2 + 60;
        this.loadingContainer.addChild(this.progressText);
    }

    private static updateProgress(progress: number): void {
        // Update progress bar width
        const width = Math.floor(400 * progress);
        this.progressBar.clear();
        this.progressBar.fill(0xff9900);
        this.progressBar.rect(
            this.app.screen.width / 2 - 200,
            this.app.screen.height / 2,
            width,
            30,
        );
        this.progressBar.endFill();

        // Update progress text
        const percentage = Math.floor(progress * 100);
        this.progressText.text = `${percentage}%`;
    }

    private static hideLoadingScreen(): void {
        if (this.loadingContainer && this.loadingContainer.parent) {
            this.app.stage.removeChild(this.loadingContainer);
        }
    }

    private static async loadAllAssets(): Promise<void> {
        // Configure Assets to track progress
        Assets.init();

        // Register all assets
        const texturePaths = [
            'assets/images/9.png',
            'assets/images/A.png',
            'assets/images/J.png',
            'assets/images/K.png',
            'assets/images/Q.png',
            'assets/images/10.png',
            'assets/images/wild.png',
            'assets/images/bonus.png',
            'assets/images/s1.png',
            'assets/images/s2.png',
            'assets/images/s3.png',
            'assets/images/s4.png',
            'assets/images/SLOT.png',
            'assets/images/spin.png',
            'assets/images/gl.png',
            'assets/images/back.png',
            'assets/images/front.png',
            'assets/images/middle.png',
        ];

        const bundleId = "gameAssets";

        // Fix: Properly type the bundle object with an index signature
        Assets.addBundle(bundleId, texturePaths.reduce<Record<string, string>>((bundle, path) => {
            // Extract the filename from the path as the asset name
            const name = path.split('/').pop()!.split('.')[0];
            bundle[name] = path;
            return bundle;
        }, {}));

        // Load all assets at once with progress tracking
        const bundle = await Assets.loadBundle(bundleId, (progress) => {
            this.updateProgress(progress);
        });

        // Store textures for later use
        this.textures = [
          bundle["9"],
          bundle["A"],
          bundle["J"],
          bundle["K"],
          bundle["Q"],
          bundle["10"],
          bundle["wild"],
          bundle["bonus"],
          bundle["s1"],
          bundle["s2"],
          bundle["s3"],
          bundle["s4"]
        ];

        this.logoTexture = bundle["SLOT"];
        this.spinTexture = bundle["spin"];
        this.glTexture = bundle["gl"];
        this.frontTexture = bundle["front"];
        this.middleTexture = bundle["middle"];
        this.backTexture = bundle["back"];
    }

    public static getTextures(): Texture[] {
        return this.textures;
    }

    public static getSpinTexture(): Texture {
        return this.spinTexture;
    }

    public static getGlTexture(): Texture {
        return this.glTexture;
    }

    public static getCoinTexture(): Texture {
        return this.coinTexture;
    }

    public static getLogoTexture(): Texture {
      return this.logoTexture;
  }
}