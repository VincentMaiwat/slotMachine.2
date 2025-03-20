// Cyndaquil.ts
import { Application, Assets, Container, Sprite, Texture} from "pixi.js";
import { AssetLoader } from "../utils/assetLoader";

export class Cynda{
    private app: Application;
    // Left side sprites
    private sprCyndaLeft?: Sprite;
    private sprCyndaFireLeft?: Sprite;
    // Right side sprites
    private sprCyndaRight?: Sprite;
    private sprCyndaFireRight?: Sprite;

    private textureCynda?: Texture;
    private textureCyndaFire?: Texture;
    // Containers
    private leftContainer: Container;
    private rightContainer: Container;

    constructor(app:Application){
        this.app = app;
        this.leftContainer = new Container();
        this.app.stage.addChild(this.leftContainer);

        this.rightContainer = new Container();
        this.app.stage.addChild(this.rightContainer);

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    static async create(app:Application): Promise<Cynda>{
        const cynda = new Cynda(app);
        await cynda.initialize();
        return cynda;
    }

    async initialize(): Promise<void>{
        try{
            // Load textures
            this.textureCynda = AssetLoader.getCyndaTexture();
            this.textureCyndaFire = AssetLoader.getCyndaFTexture();

            // Create sprites for left side
            this.sprCyndaLeft = Sprite.from(this.textureCynda);
            this.sprCyndaFireLeft = Sprite.from(this.textureCyndaFire);

            // Create sprites for right side
            this.sprCyndaRight = Sprite.from(this.textureCynda);
            this.sprCyndaFireRight = Sprite.from(this.textureCyndaFire);

            this.applyConfig();

            this.leftContainer.addChild(this.sprCyndaLeft, this.sprCyndaFireLeft);
            this.rightContainer.addChild(this.sprCyndaRight, this.sprCyndaFireRight);
            this.handleResize();
            return Promise.resolve();
        } catch (error){
            console.log('Error initializing Cynda:', error);
            return Promise.reject(error);
        }
    }

    private applyConfig(): void {
        if (!this.sprCyndaFireLeft) return;
        if (!this.sprCyndaLeft) return;
        if (!this.sprCyndaFireRight) return;
        if (!this.sprCyndaRight) return;

        // Left Sprites
        this.sprCyndaLeft.setSize(290, 300);
        this.sprCyndaLeft.anchor.set(0.5, 0.5);
        this.sprCyndaLeft.position.set(300,580);
        this.sprCyndaLeft.scale.x *= -1 ;
        this.sprCyndaLeft.visible = true ;

        this.sprCyndaFireLeft.setSize(400, 400);
        this.sprCyndaFireLeft.anchor.set(0.5, 0.5);
        this.sprCyndaFireLeft.position.set(270, 530);
        this.sprCyndaFireLeft.scale.x *= -1 ;
        this.sprCyndaFireLeft.visible = false ;

        // Right sprites
        this.sprCyndaRight.setSize(290, 300);
        this.sprCyndaRight.anchor.set(0.5, 0.5);
        this.sprCyndaRight.position.set(1620,580);
        this.sprCyndaRight.visible = true ;

        this.sprCyndaFireRight.setSize(400, 400);
        this.sprCyndaFireRight.anchor.set(0.5, 0.5);
        this.sprCyndaFireRight.position.set(1650, 530);
        this.sprCyndaFireRight.visible = false ;

        console.log(this.rightContainer.x, this.rightContainer.y);
        console.log(this.leftContainer.x, this.leftContainer.y);

    }

    private handleResize(): void {
        if(this.leftContainer){
            // Calculate a scale based on window width/height
            const scaleAmount = Math.min(window.innerWidth / 1920, window.innerHeight / 920);
            this.leftContainer.scale.set(scaleAmount);

            // position of the container from the center
            const offsetX = -980;
            const offsetY = -460;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.leftContainer.x = centerX + (offsetX * scaleAmount);
            this.leftContainer.y = centerY + (offsetY * scaleAmount);

        }

        if(this.rightContainer){
            // Calculate a scale based on window width/height
            const scaleAmount = Math.min(window.innerWidth / 1920, window.innerHeight / 920);
            this.rightContainer.scale.set(scaleAmount);

            // position of the container from the center
            const offsetX = -980;
            const offsetY = -460;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.rightContainer.x = (centerX + offsetX * scaleAmount);
            this.rightContainer.y = (centerY + offsetY * scaleAmount);

        }
    }

    public showCynda(): void {
        if (this.sprCyndaLeft) this.sprCyndaLeft.visible = true;
        if (this.sprCyndaRight) this.sprCyndaRight.visible = true;
        if (this.sprCyndaFireLeft) this.sprCyndaFireLeft.visible = false;
        if (this.sprCyndaFireRight) this.sprCyndaFireRight.visible = false;
    }

    public showCyndaF(): void {
        if (this.sprCyndaLeft) this.sprCyndaLeft.visible = false;
        if (this.sprCyndaRight) this.sprCyndaRight.visible = false;
        if (this.sprCyndaFireLeft) this.sprCyndaFireLeft.visible = true;
        if (this.sprCyndaFireRight) this.sprCyndaFireRight.visible = true;
    }

}