//winnings.ts
import { Application, Assets, Container, Graphics, Sprite, Texture, Text, TextStyle } from "pixi.js";

export class Winnings {
    private app: Application;
    private sprWins?: Sprite;
    private textureWins?: Texture;
    private txtWins: Text;
    private containerWins: Container;
    private plus: string = 'assets/images/plus.png';
    private rectWins = new Graphics();

    private winnings: { value: number } = { value: 0 };

    constructor (app: Application){
        this.app = app;

        const textStyle = new TextStyle({
            dropShadow: true,
            fill: "#fec702",
            fontFamily: "pokemon",
            letterSpacing: 5,
            fontSize:23,
        });

        // Add container for winnings
        this.containerWins = new Container();
        // this.containerWins.pivot.set(this.containerWins.width/2, this.containerWins.height/2);

        this.app.stage.addChild(this.containerWins);

        this.txtWins = new Text({
            text: this.winnings.value.toString(),
            style: textStyle
        });

        // window.addEventListener('load', function(){

        // });

        window.addEventListener('resize', this.handleResize.bind(this));

    }

    public addWinnings(amount: number): void {
        this.winnings.value += amount;
        // Update the displayed text
        this.txtWins.text = this.winnings.value.toString();
    }

    static async create(app: Application): Promise<Winnings>{
        const balance = new Winnings(app);
        await balance.initialize();
        return balance;
    }

    async initialize(): Promise<void>{
        try{

            this.textureWins = await Assets.load(this.plus);
            this.sprWins = Sprite.from(this.textureWins);

            this.applySettings();
            this.containerWins.addChild(this.rectWins,this.sprWins,this.txtWins);
            this.handleResize();

            return Promise.resolve();
        }catch (error){
            console.error("Failed to load pokeball", error);
            return Promise.reject(error);
        }
    }

    private applySettings(): void {
        // Winnings component
        if(!this.sprWins) return;
        this.rectWins.roundRect(0,0,280,70,30);
        this.rectWins.fill({color:'#870303'});
        this.rectWins.stroke({width: 2, color:0x56ff74});

        this.txtWins.anchor.set(0.5);
        this.txtWins.x = 150;
        this.txtWins.y = this.rectWins.height/2;

        this.sprWins.setSize(25,25);
        this.sprWins.x =((this.rectWins.width - this.txtWins.width)/2.5);
        this.sprWins.y = 20 ;

        this.containerWins.position.set(140,280);
    }
    private handleResize(): void {
        if (this.containerWins) {
            // Calculate a scale based on window width/height
            const scaleAmount = Math.min(window.innerWidth / 1920,
                window.innerHeight / 920);
            this.containerWins.scale.set(scaleAmount);

            // position of the container from the center
            const offsetX = -850;
            const offsetY = -180;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.containerWins.x = centerX + (offsetX * scaleAmount);
            this.containerWins.y = centerY + (offsetY * scaleAmount);

        }
    }
}