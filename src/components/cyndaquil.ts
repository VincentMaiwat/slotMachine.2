import { Application, Assets, Container, Sprite, Texture} from "pixi.js";
import { AssetLoader } from "../utils/assetLoader";

export class Cynda{
    private app: Application;
    private sprCynda?: Sprite;
    private textureCynda?: Texture;
    private sprCyndaFire?: Sprite;
    private textureCyndaFire?: Texture;
    private pathCynda: string = 'assets/images/cyndaquil.png';
    private pathCyndaFire: string = 'assets/images/cyndaquil-fire.png';
    private container: Container;

    constructor(app:Application){
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private handleResize(): void {
        // if (this.sprite){
        //     this.sprite.x = window.innerWidth/2;
        //     this.spri
        // }
    }

    static async create (app:Application): Promise <Cynda>{
        const cynda = new Cynda(app);
        await cynda.initialize();
        return cynda;
    }

    async initialize(): Promise <void>{
        try{
            this.textureCynda = await Assets.load(this.pathCynda);
            this.sprCynda = Sprite.from(this.textureCynda);

            this.textureCyndaFire = await Assets.load(this.pathCyndaFire);
            this.sprCyndaFire = Sprite.from(this.textureCyndaFire);

            this.applyConfig();
            this.container.addChild(this.sprCynda, this.sprCyndaFire);

            return Promise.resolve();
        }catch (error){
            console.log('error');
            return Promise.reject(error);
        }
    }
    private applyConfig(): void {
        if (!this.sprCynda) return;
            this.sprCynda.setSize(290,300) ;
            this.sprCynda.anchor.set(0.5,0.5);
            // this.container.position.set(1620,580);
            this.sprCynda.position.set((window.innerWidth - this.sprCynda.width)-10,(window.innerHeight - this.sprCynda.height)-40);

        if (!this.sprCyndaFire) return;
            this.sprCyndaFire.setSize(290,300) ;
            this.sprCyndaFire.anchor.set(0.5,0.5);
            // this.container.position.set(1620,580);
            this.sprCyndaFire.position.set((window.innerWidth - this.sprCyndaFire.width)+10,(window.innerHeight - this.sprCyndaFire.height)+40);
    }
}