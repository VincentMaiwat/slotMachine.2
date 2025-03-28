import { Container, Sprite, Text, Graphics, Texture, TextStyle } from 'pixi.js';
import { Application } from 'pixi.js';
import { gsap } from 'gsap';
import { WinResult } from '../components/reels';

export class WinDisplay {
    private creditsContainer: Container;
    private textContainer: Container;
    private symbolContainer: Container;
    private winText: Text;
    private symbolSprites: Sprite[] = [];
    private paylineText: Text;
    private symbolText: Text;
    private currentTextShowing?: 'win' | 'payline' | 'symbol';
    private textSwitchTimeline?: gsap.core.Timeline;

    constructor(app: Application) {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.creditsContainer = new Container();
        this.creditsContainer.visible = false;
        app.stage.addChild(this.creditsContainer);

        this.textContainer = new Container();
        this.symbolContainer = new Container();
        this.creditsContainer.addChild(this.textContainer);


        const textStyle = new TextStyle({
            dropShadow: true,
            fill: "#fec702",
            fontFamily: "arial",
            fontWeight: 'bold',
            letterSpacing: 2,
            fontSize: 23,
            stroke: {color: "#154c79", width:3},
        });

        this.winText = new Text({
            text: '',
            style: textStyle
        });
        this.paylineText = new Text({
            text: '',
            style: textStyle
        });
        this.symbolText = new Text({
            text: '',
            style: textStyle
        });

        this.textContainer.addChild(this.winText);
        this.textContainer.addChild(this.paylineText);
        this.textContainer.addChild(this.symbolText, this.symbolContainer);

        this.paylineText.alpha = 0;
        this.symbolText.alpha = 0;
        this.symbolContainer.alpha = 0;
    }

    displayWin(winResult: WinResult, textureMap: Map<string, Texture>) {
        this.handleResize();

        // Stop existing timeline
        if (this.textSwitchTimeline) {
            this.textSwitchTimeline.kill();
            this.textSwitchTimeline = undefined;
        }

        // Clear previous symbol containers and sprites
        this.symbolContainer.removeChildren();
        this.symbolSprites = [];

        // Split winning symbols
        const winningSymbols = winResult.winningSymbols.split(' and ');

        // Create a container for symbols
        const symbolDisplayContainer = new Container();

        // Create sprite for each winning symbol
        winningSymbols.forEach((symbolCode, index) => {
            const texture = textureMap.get(symbolCode.trim());
            if (texture) {
                const symbolSprite = new Sprite(texture);
                symbolSprite.anchor.set(0.5);

                // Scale the sprite to fit within a reasonable size
                const maxSize = 50;
                const scale = Math.min(
                    maxSize / texture.width,
                    maxSize / texture.height
                );
                symbolSprite.scale.set(scale);

                // Position sprites next to each other
                symbolSprite.x = index * 60;
                symbolDisplayContainer.addChild(symbolSprite);

                this.symbolSprites.push(symbolSprite);
            }
        });

        // Add symbol display container to symbol container
        this.symbolContainer.addChild(symbolDisplayContainer);
        this.symbolContainer.alpha = 0;
        this.symbolContainer.x = 150;

        // Set win text
        this.winText.anchor.set(0.5);
        this.winText.text = `YOU WON ${winResult.winAmount} CREDITS!`;
        this.winText.alpha = 1;

        // Set payline text
        this.paylineText.anchor.set(0.5);
        this.paylineText.text = `Payline(s): ${winResult.winningPayline}`;
        this.paylineText.alpha = 0;

        // Set symbol text
        this.symbolText.anchor.set(0.5);
        this.symbolText.text = ' Winning Symbol(s): ';
        this.symbolText.alpha = 0;

        // Show and animate the display
        this.creditsContainer.visible = true;
        this.creditsContainer.alpha = 0;

        gsap.to(this.creditsContainer, {
            alpha: 1,
            duration: 0.5,
            ease: 'power2.out'
        });

        this.setupTextSwitching();
    }

    // Rest of the methods remain the same as in the previous implementation
    private setupTextSwitching() {
        // Ensure any existing timeline is killed first
        if (this.textSwitchTimeline) {
            this.textSwitchTimeline.kill();
        }

        // Create a new timeline for text switching
        this.textSwitchTimeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 1
        });

        this.textSwitchTimeline
        .to(this.winText, {
            alpha: 0,
            duration: 0.5,
            delay: 1,
        })
        .to(this.winText, {
            alpha: 0,
            duration: 0.5,
            onComplete: () => {
                this.currentTextShowing = 'payline';
            }
        })
        .to(this.paylineText, {
            alpha: 1,
            duration: 0.5
        })
        .to(this.paylineText, {
            alpha: 0,
            duration: 0.5,
            delay: 2,
            onComplete: () => {
                this.currentTextShowing = 'symbol';
            }
        })
        .to([this.symbolText, this.symbolContainer], {
            alpha: 1,
            duration: 0.5
        })
        .to([this.symbolText, this.symbolContainer], {
            alpha: 0,
            duration: 0.5,
            delay: 2,
            onComplete: () => {
                this.currentTextShowing = 'win';
            }
        })
        .to(this.winText, {
            alpha: 1,
            duration: 0.5
        });
    }

    hideWin() {
        // Kill the timeline if it exists
        if (this.textSwitchTimeline) {
            this.textSwitchTimeline.kill();
            this.textSwitchTimeline = undefined;
        }

        // Reset text states
        this.winText.alpha = 0;
        this.paylineText.alpha = 0;
        this.symbolText.alpha = 0;

        gsap.to(this.creditsContainer, {
            alpha: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                this.creditsContainer.visible = false;
            }
        });
    }

    public handleResize(): void {
        if (this.creditsContainer) {
            const scaleAmount = Math.min(window.innerWidth / 1920, window.innerHeight / 920);
            this.creditsContainer.scale.set(scaleAmount);
            const offsetX = 0;
            const offsetY = 300;
            // Position at the bottom of the screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight /2 ;
            this.creditsContainer.x = centerX + (offsetX * scaleAmount);
            this.creditsContainer.y = centerY + (offsetY * scaleAmount);
        }
    }
}