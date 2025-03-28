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
    private static cyndaTexture: Texture;
    private static cyndaFTexture: Texture;

    private static app: Application;
    private static progressBar: Graphics;
    private static progressText: Text;
    private static loadingContainer: Container;
    private static logoSprite: Sprite;


    public static async init(app: Application): Promise<void> {
        this.app = app;

        const logoTexture = await Assets.load('assets/images/mLogo.jpg');

        this.setupLoadingScreen(logoTexture);

        await this.loadAllAssets();

        this.hideLoadingScreen();
    }

    private static setupLoadingScreen(logoTexture: Texture): void {
        // Create container for loading elements
        this.loadingContainer = new Container();
        this.app.stage.addChild(this.loadingContainer);

        // Create background
        const background = new Graphics();
        background.beginFill(0x000000, 0.7);
        background.rect(0, 0, window.innerWidth, window.innerHeight);
        background.endFill();
        this.loadingContainer.addChild(background);

        // Create logo with the already loaded texture
        this.logoSprite = new Sprite(logoTexture);
        this.logoSprite.position.set(
            window.innerWidth / 2,
            window.innerHeight / 3
        );
        this.logoSprite.anchor.set(0.5);

        const desiredWidth = window.innerWidth/3.5;
        const desiredHeight = window.innerHeight/2;
        this.logoSprite.scale.set(
            desiredWidth / logoTexture.width,
            desiredHeight / logoTexture.height
        );

        this.loadingContainer.addChild(this.logoSprite);

        // Create title text
        const titleText = new Text("Loading Game Assets", {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0xffffff,
            align: "center"
        });
        titleText.anchor.set(0.5);
        titleText.x = window.innerWidth / 2;
        titleText.y = window.innerHeight / 2 + 250;
        this.loadingContainer.addChild(titleText);

        // Create progress bar background
        const progressBarBg = new Graphics();
        progressBarBg.fill(0x333333);
        progressBarBg.roundRect(
            window.innerWidth / 2 - 200,
            window.innerHeight / 2 + 300,
            400,
            30,
            15
        );
        progressBarBg.endFill();
        this.loadingContainer.addChild(progressBarBg);

        // Create progress bar
        this.progressBar = new Graphics();
        this.progressBar.fill(0xff9900);
        this.progressBar.roundRect(
            window.innerWidth / 2 - 200,
            window.innerHeight / 2 + 300,
            0,
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
        this.progressText.x = window.innerWidth / 2;
        this.progressText.y = window.innerHeight / 2 + 350;
        this.loadingContainer.addChild(this.progressText);
    }


    private static updateProgress(progress: number): void {
        // Update progress bar width
        const width = Math.floor(400 * progress);
        this.progressBar.clear();
        this.progressBar.fill(0xF6EDB0);
        this.progressBar.roundRect(
            window.innerWidth / 2 - 200,
            window.innerHeight / 2 + 300,
            width,
            30,
            15
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
            'assets/images/9.png',  //0
            'assets/images/A.png',  //1
            'assets/images/J.png',  //2
            'assets/images/K.png',  //3
            'assets/images/Q.png',  //4
            'assets/images/10.png', //5
            'assets/images/wild.png', //6
            'assets/images/bonus.png', //7
            'assets/images/s1.png', //8
            'assets/images/s2.png', //9
            'assets/images/s3.png', //10
            'assets/images/s4.png', //11
            'assets/images/SLOT.png',
            'assets/images/spin.png',
            'assets/images/gl.png',
            'assets/images/back.png',
            'assets/images/front.png',
            'assets/images/middle.png',
            'assets/images/cyndaquil.png',
            'assets/images/cyndaquil-fire.png',
            'assets/images/pokeball.png',

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
        this.cyndaTexture = bundle["cyndaquil"];
        this.cyndaFTexture = bundle["cyndaquil-fire"];

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
    public static getFrontTexture(): Texture {
        return this.frontTexture;
    }
    public static getMiddleTexture(): Texture {
        return this.middleTexture;
    }
    public static getBackTexture(): Texture {
        return this.backTexture;
    }
    public static getCyndaTexture(): Texture {
        return this.cyndaTexture;
    }
    public static getCyndaFTexture(): Texture {
        return this.cyndaFTexture;
    }

}