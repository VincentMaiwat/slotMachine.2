import { Application, Assets, Container, Graphics, Sprite, Texture, Text, TextStyle } from "pixi.js";
import { Reels } from "./reels";

export class Winnings {
    private app: Application;
    private txtWins: Text;
    private txtLabel: Text;
    private containerWins: Container;
    private rectWins = new Graphics();
    private reels = Reels;


    private winnings: { value: number } = { value: 0 };

    constructor (app: Application){
        this.app = app;

        const textStyleLabel = new TextStyle({
            dropShadow: true,
            fill: "#56ff74",
            fontFamily: "pokemon",
            letterSpacing: 5,
            fontSize:23,
        });

        const textStyleWins = new TextStyle({
            dropShadow: true,
            fill: "#ffffff",
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
            style: textStyleWins
        });
        this.txtLabel = new Text({
            text: "Win: " ,
            style: textStyleLabel
        });

        window.addEventListener('resize', this.handleResize.bind(this));

    }

    public addWinnings(amount: number) {
        const winnings = this.winnings.value + amount;
        // Update the displayed text
        this.txtWins.text = winnings;

        return winnings;
    }

    public resetWinnings(): void{
        this.winnings.value = 0;
        this.txtWins.text = 0;
    }

    static async create(app: Application): Promise<Winnings>{
        const balance = new Winnings(app);
        await balance.initialize();
        return balance;
    }

    async initialize(): Promise<void>{
        try{

            this.applySettings();
            this.containerWins.addChild(this.rectWins,this.txtLabel,this.txtWins);
            this.handleResize();

            return Promise.resolve();
        }catch (error){
            return Promise.reject(error);
        }
    }

    private applySettings(): void {
        // Winnings component
        if(!this.rectWins) return;
        this.rectWins.roundRect(0,0,280,70,30);
        this.rectWins.fill({color:'#870303'});
        this.rectWins.stroke({width: 2, color:0x56ff74});

        this.txtWins.anchor.set(0.5);
        this.txtWins.x = 160;
        this.txtWins.y = this.rectWins.height/2;

        this.txtLabel.anchor.set(0.5);
        this.txtLabel.x =((this.rectWins.width - this.txtLabel.width) + this.txtWins.width)/2;
        this.txtLabel.y = this.rectWins.height/2 ;

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