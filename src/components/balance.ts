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

    private sprWins?: Sprite;
    private textureWins?: Texture;
    private txtWins: Text;
    private containerWins: Container;
    private plus: string = 'assets/images/plus.png';
    private rectWins = new Graphics();

    private balance: { value: number } = { value: 1000 };
    private winnings: { value: number } = { value: 0 };

    constructor (app: Application){
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

        // Add container for winnings
        this.containerWins = new Container();
        this.app.stage.addChild(this.containerWins);

        this.txtWins = new Text({
            text: this.winnings.value.toString(),
            style: textStyle
        });

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // Add these methods to update balance
    public deductBalance(amount: number): void {
        this.balance.value -= amount;
        console.log(this.balance.value);
        // Update the displayed text
        this.txtCoins.text = this.balance.value.toString();

    }

    public addBalance(amount: number): void {
        this.balance.value += amount;
        // Update the displayed text
        this.txtCoins.text = this.balance.value.toString();
    }

    public addWinnings(amount: number): void {
        this.winnings.value += amount;
        // Update the displayed text
        this.txtWins.text = this.winnings.value.toString();
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

            this.textureWins = await Assets.load(this.plus);
            this.sprWins = Sprite.from(this.textureWins);

            this.applySettings();
            this.containerCoins.addChild(this.rectCoins,this.sprBall,this.txtCoins);
            this.containerWins.addChild(this.rectWins,this.sprWins,this.txtWins);

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
        if (this.containerCoins){
            this.containerCoins.x = (window.innerWidth/1.5);
        }
    }

}