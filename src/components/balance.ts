//balance.ts
import { Application, Assets, Container, Graphics, Sprite, Texture, Text, TextStyle } from "pixi.js";

export class Balance {
    private app: Application;

    private sprBall?: Sprite;
    private textureBall?: Texture;
    private txtCoins: Text;
    private containerCoins: Container;
    private pokeball: string = 'assets/images/pokeball.png';
    private rectCoins = new Graphics();
    private currentBal?: number;

    private balance: { value: number } = { value: 1000 };

    constructor (app: Application){
        console.log("check ");
        this.app = app;

        // Container for balance
        this.containerCoins = new Container();
        this.app.stage.addChild(this.containerCoins);

        const textStyle = new TextStyle({
            dropShadow: true,
            fill: "#fec702",
            fontFamily: "pokemon",
            letterSpacing: 5,
            fontSize:23,
        });
        this.txtCoins = new Text({
            text: this.balance.value.toString(),
            style: textStyle
        });

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private setBalance(amount:number): void {
        this.balance.value = amount;
    }

    public deductBalance() {
        this.currentBal = this.balance.value - 5;
        // Update the displayed text
        this.txtCoins.text = this.currentBal;
        this.setBalance(this.currentBal);

        return this.currentBal;
    }

    public addBalance(amount: number) {
        this.currentBal = this.balance.value + amount;
        // Update the displayed text
        this.txtCoins.text = this.currentBal;

        this.setBalance(this.currentBal)
        return this.currentBal;
    }
    // Getter for current balance
    public getBalance(): number {
        return this.balance.value;
    }
    static async create(app: Application): Promise<Balance>{
        const balance = new Balance(app);
        await balance.initialize();
        return balance;
    }

    async initialize(): Promise<void>{
        try{
            this.textureBall = await Assets.load(this.pokeball);
            this.sprBall = Sprite.from(this.textureBall);

            this.applySettings();
            this.containerCoins.addChild(this.rectCoins,this.sprBall,this.txtCoins);
            this.handleResize();

            return Promise.resolve();
        }catch (error){
            console.error("Failed to load pokeball", error);
            return Promise.reject(error);
        }
    }

    private applySettings(): void {
        // Balance Component
        if(!this.sprBall) return;
        this.rectCoins.roundRect(0,0,280,70,30);
        this.rectCoins.fill({color:'#870303'});
        this.rectCoins.stroke({width: 2, color:0xFFCB00});

        this.txtCoins.anchor.set(0.5);
        this.txtCoins.x = 150;
        this.txtCoins.y = this.rectCoins.height/2;

        this.sprBall.setSize(30,30);
        this.sprBall.x = 80;
        this.sprBall.y = ((this.rectCoins.width - this.txtCoins.width)/12) ;

        this.containerCoins.position.set(1490,280);
    }
    private handleResize(): void {
        if (this.containerCoins) {
            // Calculate a scale based on window width/height
            const scaleAmount = Math.min(window.innerWidth / 1920, window.innerHeight / 920);
            this.containerCoins.scale.set(scaleAmount);

            // position of the container from the center
            const offsetX = 550;
            const offsetY = -180;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.containerCoins.x = centerX + (offsetX * scaleAmount);
            this.containerCoins.y = centerY + (offsetY * scaleAmount);

        }
    }

}