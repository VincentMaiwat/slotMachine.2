import { Container, Sprite, Text, Graphics, Texture } from 'pixi.js';
import { Application } from 'pixi.js';
import { gsap } from 'gsap';

export interface WinResult {
    isWin: boolean;
    winningSymbols: string;
    winAmount: number;
    winningPayline: string;
    winningCoordinates: number[][];
}

export class WinDisplay {
    private container: Container;
    private textContainer: Container;
    private symbolContainer: Container;
    private background: Graphics;
    private winText: Text;
    private symbolSprite?: Sprite;
    private paylineText: Text;

    constructor(app: Application) {
        // Create the main container for the win display
        this.container = new Container();
        this.container.visible = false;
        app.stage.addChild(this.container);

        // Create a background for the win display
        this.background = new Graphics();
        this.container.addChild(this.background);

        // Create containers for text and symbols
        this.textContainer = new Container();
        this.symbolContainer = new Container();
        this.container.addChild(this.textContainer);
        this.container.addChild(this.symbolContainer);

        // Create text elements
        this.winText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 0xFFD700, // Gold color
                align: 'center'
            }
        });
        this.paylineText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFFFFFF,
                align: 'center'
            }
        });

        this.textContainer.addChild(this.winText);
        this.textContainer.addChild(this.paylineText);
    }

    displayWin(winResult: WinResult, textureMap: Map<string, Texture>) {
        // Clear previous display
        if (this.symbolSprite) {
            this.symbolContainer.removeChild(this.symbolSprite);
            this.symbolSprite.destroy();
        }

        // Setup background
        this.background.clear();
        this.background.rect(0, 0, 600, 300);
        this.background.fill(0x000000, 0.7);
        this.background.stroke(0xFFFFFF, 0);

        // Position the background
        this.background.x = (window.innerWidth - 600) / 2;
        this.background.y = (window.innerHeight - 300) / 2;

        // Set win text
        this.winText.text = `YOU WON ${winResult.winAmount} CREDITS!`;
        this.winText.x = (600 - this.winText.width) / 2;
        this.winText.y = 50;

        // Set payline text
        this.paylineText.text = `Winning Symbols: ${winResult.winningSymbols}\nPayline(s): ${winResult.winningPayline}`;
        this.paylineText.x = (600 - this.paylineText.width) / 2;
        this.paylineText.y = 150;

        // Create symbol sprite (using the first winning symbol)
        const symbolCode = winResult.winningSymbols.split(' & ')[0];
        const symbolTexture = textureMap.get(symbolCode);
        
        if (symbolTexture) {
            this.symbolSprite = Sprite.from(symbolTexture);
            
            // Scale the symbol to fit
            const maxSize = 150;
            const scale = Math.min(
                maxSize / this.symbolSprite.width,
                maxSize / this.symbolSprite.height
            );
            this.symbolSprite.scale.set(scale);
            
            // Position the symbol
            this.symbolSprite.x = (600 - this.symbolSprite.width) / 2;
            this.symbolSprite.y = 200;
            
            this.symbolContainer.addChild(this.symbolSprite);
        }

        // Position the text and symbol containers relative to the background
        this.textContainer.x = this.background.x;
        this.textContainer.y = this.background.y;
        this.symbolContainer.x = this.background.x;
        this.symbolContainer.y = this.background.y;

        // Show and animate the display
        this.container.visible = true;
        this.container.alpha = 0;

        gsap.to(this.container, {
            alpha: 1,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    hideWin() {
        gsap.to(this.container, {
            alpha: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                this.container.visible = false;
            }
        });
    }
}