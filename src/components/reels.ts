import {
    Application,
    Container,
    Graphics,
    Sprite,
    Texture,
    BlurFilter
} from 'pixi.js';
import { AssetLoader } from '../utils/assetLoader';
import { gsap } from "gsap";

// Reel properties
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
    private mask?: Graphics;

    // Predefined symbol sequences for each reel
    private reelSet: string[][] = [
        [ "hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2" ],
        [ "hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2" ],
        [ "lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4" ],
        [ "hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2" ],
        [ "lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4" ],
    ];

    // Current position index for each reel
    private reelPositions: number[] = [];

    // Target position indices for each reel (predefined outcome)
    private targetReelPositions: number[] = [];

    // Visible symbols to the screen
    private screen: string[][] = [];

    // Map of symbol codes to textures
    private textureMap = new Map<string, Texture>();

    constructor(app: Application, numberOfReels: number = 5, symbolsPerReel: number = 3) {
        this.app = app;
        this.numberOfReels = numberOfReels;
        this.symbolsPerReel = symbolsPerReel;
        this.containerGrid = new Container();

        // Initialize screen array
        for (let i = 0; i < symbolsPerReel; i++) {
            this.screen.push([]);
            for (let j = 0; j < numberOfReels; j++) {
                this.screen[i].push("");
            }
        }

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    async initialize(): Promise<void> {
        this.setupContainerGrid();

        this.slotTextures = AssetLoader.getTextures();

        // Setup texture mapping for symbols
        this.textureMap.set("lv1", this.slotTextures[1]);   // A
        this.textureMap.set("lv2", this.slotTextures[2]);   // J
        this.textureMap.set("lv3", this.slotTextures[3]);   // K
        this.textureMap.set("lv4", this.slotTextures[5]);   // 10
        this.textureMap.set("hv1", this.slotTextures[8]);   // green onion/BULBASAUR
        this.textureMap.set("hv2", this.slotTextures[9]);   // blue croc/TOTODILE
        this.textureMap.set("hv3", this.slotTextures[10]);  // violet spiky/GENGAR
        this.textureMap.set("hv4", this.slotTextures[11]);  // orange pig/TEPIG

        // Initialize reel positions
        this.setInitialState();

        // Create reels
        this.createReels();

        this.app.stage.addChild(this.containerGrid);

        // Update initial screen array and ensure proper visualization
        this.updateScreenArray();
    }

    private setInitialState(): void {
        this.reelPositions = [];
        for (let i = 0; i < this.numberOfReels; i++) {
            this.reelPositions.push(0);
        }
        // Set initial target positions same as current positions
        this.targetReelPositions = [...this.reelPositions];
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
            containerRow.y = 60;
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

            // Create a mask for this reel column
            const reelMask = new Graphics()
                .rect(0, 0, this.sizeSymbol, this.symbolsPerReel * this.sizeSymbol)
                .fill({ color: 0xFFFFFF });
            containerRow.addChild(reelMask);

            // Create a container for the symbols and apply the mask
            const symbolsContainer = new Container();
            symbolsContainer.mask = reelMask;
            containerRow.addChild(symbolsContainer);

            // Build all symbols for this reel based on reelSet
            const totalSymbolsInReel = this.reelSet[i].length;

            for (let j = 0; j < totalSymbolsInReel; j++) {
                const symbolCode = this.reelSet[i][j];
                const texture = this.textureMap.get(symbolCode);

                if (!texture) {
                    console.error(`Texture not found for symbol code: ${symbolCode}`);
                    continue;
                }

                const symbol = new Sprite(texture);

                // Set consistent size for all symbols
                const scale = Math.min(
                    this.sizeSymbol / texture.width,
                    this.sizeSymbol / texture.height
                );
                symbol.scale.set(scale);

                // Center horizontally
                symbol.x = Math.round((this.sizeSymbol - symbol.width) / 2);

                // Position vertically based on index
                symbol.y = j * this.sizeSymbol;

                reel.symbols.push(symbol);
                symbolsContainer.addChild(symbol);
            }

            // Position symbols correctly for initial view
            this.positionSymbolsInReel(reel, i);

            this.reels.push(reel);
        }
    }

    // Position the symbols in a reel based on the current reel position
    private positionSymbolsInReel(reel: Reel, reelIndex: number): void {
        const totalSymbols = this.reelSet[reelIndex].length;
        const currentPosition = this.reelPositions[reelIndex];

        // Position each symbol
        for (let j = 0; j < reel.symbols.length; j++) {
            const symbol = reel.symbols[j];

            // Calculate the visual position (starting with current position at the top)
            // This ensures symbols are positioned correctly relative to the current reel position
            let visualPos = (j - currentPosition + totalSymbols) % totalSymbols;

            // Set the Y position
            symbol.y = visualPos * this.sizeSymbol ;
        }
    }

    // Update the screen array based on current reel positions
    private updateScreenArray(): void {
        for (let row = 0; row < this.symbolsPerReel; row++) {
            for (let col = 0; col < this.numberOfReels; col++) {
                const reelStop = this.reelPositions[col];
                let idx = (reelStop + row) % this.reelSet[col].length;
                this.screen[row][col] = this.reelSet[col][idx];
            }
        }

        // Display current screen for debugging
        console.log("Current Screen:");
        for (let row = 0; row < this.screen.length; row++) {
            console.log(this.screen[row].join(" "));
        }
    }

    // Generate a random outcome for the next spin
    private generateRandomOutcome(): number[] {
        const newPositions = [];
        for (let i = 0; i < this.numberOfReels; i++) {
            // Generate random position for each reel
            const randomPos = Math.floor(Math.random() * this.reelSet[i].length);
            newPositions.push(randomPos);
        }
        return newPositions;
    }

    // Method to spin the reels
    spin(onComplete?: () => void): void {
        if (this.isRunning) return;
        this.isRunning = true;

        // Track how many reels have completed spinning
        let reelsCompleted = 0;

        // Generate a random outcome before spin starts
        this.targetReelPositions = this.generateRandomOutcome();

        // Log the predetermined outcome for debugging
        console.log("Predetermined outcome positions:", this.targetReelPositions);

        // Calculate what the final screen will look like
        const finalScreen: string[][] = [];
        for (let row = 0; row < this.symbolsPerReel; row++) {
            finalScreen[row] = [];
            for (let col = 0; col < this.numberOfReels; col++) {
                const stopPosition = this.targetReelPositions[col];
                const symbolIdx = (stopPosition + row) % this.reelSet[col].length;
                finalScreen[row][col] = this.reelSet[col][symbolIdx];
            }
        }

        console.log("Final screen will be:");
        for (let row = 0; row < finalScreen.length; row++) {
            console.log(finalScreen[row].join(" "));
        }

        // Start the spin animation for each reel with sequential delays
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const totalSymbols = this.reelSet[i].length;
            const reelIndex = i; // Store the reel index for use in callbacks

            // Apply blur effect during spinning
            gsap.to(reel.blur, {
                blurY: 5,
                duration:0.2
            });

            // Calculate the displacement needed to show target symbols
            const currentIndex = this.reelPositions[i];
            const targetIndex = this.targetReelPositions[i];

            // Calculate spinning parameters
            const spinAmount = 2 + i; // Base number of complete rotations (more for later reels)
            const spinDistance = (spinAmount * totalSymbols * this.sizeSymbol);

            // Calculate the exact final position
            // We need to account for how many complete rotations plus the target position
            const targetOffset = ((targetIndex - currentIndex + totalSymbols) % totalSymbols);
            const finalDistance = spinDistance + (targetOffset * this.sizeSymbol);

            // Animate each symbol in the reel
            for (let j = 0; j < reel.symbols.length; j++) {
                const symbol = reel.symbols[j];
                const startY = symbol.y;
                const symbolIndex = j; // Store the symbol index for use in callbacks

                gsap.to(symbol, {
                    y: startY + finalDistance ,
                    duration: 2 + i * 0.5, // Sequential timing
                    ease: "expo.out",
                    modifiers: {
                        // Wrap the y position when it exceeds the reel length
                        y: y => {
                            const totalReelHeight = totalSymbols * this.sizeSymbol;
                            return ((parseFloat(y) % totalReelHeight) + totalReelHeight) % totalReelHeight;
                        }
                    },
                    onComplete: () => {
                        // Only do this once per reel (on the last symbol)
                        if (symbolIndex === reel.symbols.length - 1) {
                            // Remove blur when the reel stops
                            gsap.to(reel.blur, {
                                blurY: 0,
                                duration: 0.2
                            });

                            // Update the reel position for this specific reel only
                            this.reelPositions[reelIndex] = targetIndex;

                            // Make sure this reel's symbols are correctly positioned
                            // This ensures each reel displays the correct symbols when it stops
                            this.positionSymbolsInReel(this.reels[reelIndex], reelIndex);

                            // Increment the counter of completed reels
                            reelsCompleted++;

                            // If all reels have completed, update the game state
                            if (reelsCompleted === this.reels.length) {
                                this.isRunning = false;

                                // Update the screen array only after all reels have stopped
                                this.updateScreenArray();

                                // Call the completion callback if provided
                                if (onComplete) onComplete();
                            }
                        }
                    }
                });
            }
        }
    }

    // Method to get the reels array
    getReels(): Reel[] {
        return this.reels;
    }

    // Method to get the container
    getContainer(): Container {
        return this.containerGrid;
    }

    // Method to get the current screen result
    getScreenResult(): string[][] {
        return this.screen;
    }
}