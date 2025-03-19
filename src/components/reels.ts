//reels.ts
import {
    Application,
    Assets,
    BlurFilter,
    Container,
    Graphics,
    Sprite,
    Texture
} from 'pixi.js';
import { AssetLoader } from '../utils/assetLoader';

// Reel propoerties
interface Reel {
    container: Container;
    symbols: Sprite[];
    position: number;
    previousPosition: number;
    blur: BlurFilter;
}

export class Reels {
    private app: Application;
    private reels: Reel[] = [];
    private containerGrid: Container;
    private slotTextures: Texture[] = [];
    private widthReel: number = 170;
    private sizeSymbol: number = 130;
    private numberOfReels: number = 5;
    private symbolsPerReel: number = 3;
    private isRunning: boolean = false;
    private tweening: any[] = [];

    private mask?: Graphics;


    constructor(app: Application, numberOfReels: number = 5, symbolsPerReel: number = 3) {
        this.app = app;
        this.numberOfReels = numberOfReels;
        this.symbolsPerReel = symbolsPerReel;
        this.containerGrid = new Container();

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    async initialize(): Promise<void> {
        this.setupContainerGrid();
        // await AssetLoader.init(this.app);

        this.slotTextures = AssetLoader.getTextures();
        this.createReels();
        this.app.stage.addChild(this.containerGrid);

        // Setup animation ticker
        this.setupTicker();
    }
    private setupContainerGrid(): void {
        const containerWidth = 900;
        const containerHeight = 500;

        const rectangle = new Graphics()
            .roundRect(0, 0, containerWidth, containerHeight)
            .fill({
                color: '#ffffff',
                alpha: 0.4
            });

        this.containerGrid.addChild(rectangle);
        this.app.stage.addChild(this.containerGrid);

        // Create mask with the same dimensions as the container
        this.mask = new Graphics()
            .roundRect(0, 0, containerWidth, containerHeight)
            .fill({
                color: '#ffffff',
                alpha: 0.4
            });

        this.app.stage.addChild(this.mask);
        // Apply mask to container
        this.containerGrid.mask = this.mask;
        this.handleResize();
    }

    private handleResize(): void {
        const baseWidth = 1920;
        const baseHeight = 920;

        function getWindowScale(): number {
            const scaleX = window.innerWidth / baseWidth;
            const scaleY = window.innerHeight / baseHeight;
            return Math.min(scaleX, scaleY); // Maintain aspect ratio
        }

        if (!this.containerGrid || !this.mask) return;
        const scale = getWindowScale();
        this.containerGrid.scale.set(scale);

        // Original size of container
        const containerWidth = 900;
        const containerHeight = 500;

        // Calculate scaled dimensions
        const scaledWidth = containerWidth * scale;
        const scaledHeight = containerHeight * scale;

        this.containerGrid.x = (window.innerWidth - scaledWidth) / 2;
        this.containerGrid.y = (window.innerHeight - scaledHeight) / 2;

        // Ensure mask is positioned exactly the same and scaled
        this.mask.x = this.containerGrid.x;
        this.mask.y = this.containerGrid.y;
        this.mask.scale.set(scale);
    }

    private createReels(): void {
        for (let i = 0; i < this.numberOfReels; i++) {
            const containerRow = new Container();

            containerRow.x = i * this.widthReel + 43.5; // Spacing between rows
            containerRow.y = 190 ;
            this.containerGrid.addChild(containerRow);

            const reel: Reel = {
                container: containerRow,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new BlurFilter()
            };

            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            containerRow.filters = [reel.blur];

            // Build the symbols
            for (let j = 0; j < this.symbolsPerReel; j++) {
                const symbol = new Sprite(this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)]);

                // Scale the symbol to fit symbol area
                symbol.y = j * this.sizeSymbol;
                symbol.scale.x = symbol.scale.y = Math.min(
                    this.sizeSymbol / symbol.width,
                    this.sizeSymbol / symbol.height
                );
                symbol.x = Math.round((this.sizeSymbol - symbol.width) / 2);

                reel.symbols.push(symbol);
                containerRow.addChild(symbol);
            }

            this.reels.push(reel);
        }
    }

    // Method to spin the reels
    spin(onComplete?: () => void): void {
        if (this.isRunning) return;
        this.isRunning = true;

        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const target = reel.position + 10 + i * 5  ;
            const time = 1500 + i * 600;

            this.tweenTo(reel, 'position', target, time, this.backout(0.5), null,
                i === this.reels.length - 1 ? () => this.reelsComplete(onComplete) : null);
        }
    }

    reelsComplete(callback?: () => void): void {
        this.isRunning = false; // Fix the assignment (was using == instead of =)
        if (callback) callback();
    }

    private setupTicker(): void {
        // Ticker for updating the reels
        this.app.ticker.add(() => {
            // Update the slots.
            for (let i = 0; i < this.reels.length; i++) {
                const reel = this.reels[i];
                // Update blur filter y amount based on speed.
                reel.blur.blurY = (reel.position - reel.previousPosition) * 8;
                reel.previousPosition = reel.position;

                // Update symbol positions on reel.
                for (let j = 0; j < reel.symbols.length; j++) {
                    const symbol = reel.symbols[j];
                    const prevy = symbol.y;

                    symbol.y = ((reel.position + j) % reel.symbols.length) * this.sizeSymbol - this.sizeSymbol;
                    if (symbol.y < 0 && prevy > this.sizeSymbol) {
                        // Detect going over and swap a texture.
                        symbol.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
                        symbol.scale.x = symbol.scale.y = Math.min(
                            this.sizeSymbol / symbol.texture.width,
                            this.sizeSymbol / symbol.texture.height
                        );
                        symbol.x = Math.round((this.sizeSymbol - symbol.width) / 2);
                    }
                }
            }
        });

        // Ticker for tweening
        this.app.ticker.add(() => {
            const now = Date.now();
            const remove: any[] = [];

            for (let i = 0; i < this.tweening.length; i++) {
                const t = this.tweening[i];
                const phase = Math.min(1, (now - t.start) / t.time);

                t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
                if (t.change) t.change(t);
                if (phase === 1) {
                    t.object[t.property] = t.target;
                    if (t.complete) t.complete(t);
                    remove.push(t);
                }
            }
            for (let i = 0; i < remove.length; i++) {
                this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
            }
        });
    }

    // Utility method for tweening
    private tweenTo(object: any, property: string, target: number, time: number, easing: Function,
                    onchange: Function | null, oncomplete: Function | null): any {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        this.tweening.push(tween);
        return tween;
    }

    // Basic linear interpolation function
    private lerp(a1: number, a2: number, t: number): number {
        return a1 * (1 - t) + a2 * t;
    }

    // Backout easing function
    private backout(amount: number): Function {
        return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
    }

    // Method to get the reels array (in case you need to access it from outside)
    getReels(): Reel[] {
        return this.reels;
    }

    // Method to get the container (in case you need to manipulate it from outside)
    getContainer(): Container {
        return this.containerGrid;
    }

}