import {
    // Application,
    // Assets,
    // BlurFilter,
    // Color,
    // FillGradient,
    // Sprite,
    // TextStyle,
    // Texture,
    // TilingSprite,
    Graphics,
    Text,
    Container,
} from 'pixi.js';

export class Button extends Container {
    private background: Graphics;
    private labelBtn: Text;

    constructor(text: string, x:number, y:number){
        super();

        this.background = new Graphics;
        this.background.fill(0x3498db);
        this.background.drawRoundedRect(0,0,150,50,10);
        this.background.endFill();
        this.addChild(this.background);

        this.labelBtn = new Text(text, {
            fontSize:20,
            fill: 0xffffff,
            align:"center",
        });

        this.labelBtn.anchor.set(0.5);
        this.labelBtn.x =75;
        this.labelBtn.y =25;
        this.addChild(this.labelBtn);

        this.x = x;
        this.y = y;

        this.interactive = true;
        this.on("pointerdown", this.onClick);
    }

    private onClick = () => {
        console.log("button clicked!");
    };
}