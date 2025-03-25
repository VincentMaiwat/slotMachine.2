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

// For winning
interface WinResult {
    isWin: boolean;
    winningSymbols: string[];
    winAmount: number;
    winningPayline: number;
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

    // For winning
    private payTable = {
        "lv1": { 3: 10, 4: 25, 5: 50 },   // A
        "lv2": { 3: 5, 4: 10, 5: 25 },    // J
        "lv3": { 3: 5, 4: 10, 5: 15 },    // K
        "lv4": { 3: 5, 4: 10, 5: 15 },    // 10
        "hv1": { 3: 50, 4: 100, 5: 250 }, // green onion/BULBASAUR
        "hv2": { 3: 25, 4: 50, 5: 100 },  // blue croc/TOTODILE
        "hv3": { 3: 25, 4: 50, 5: 75 },  // violet spiky/GENGAR
        "hv4": { 3: 25, 4: 50, 5: 75 }   // orange pig/TEPIG
    };

    // Current position index for each reel
    private reelPositions: number[] = [];

    // Target position for each reel
    private targetReelPositions: number[] = [];

    // Visible symbols on screen
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

        this.createReels();

        this.app.stage.addChild(this.containerGrid);

        this.updateScreenArray();
    }

    // Set initial state based on the instructions
    private setInitialState(): void {
        this.reelPositions = [];
        for (let i = 0; i < this.numberOfReels; i++) {
            this.reelPositions.push(0);
        }
        // Set initial target positions same as current positions
        this.targetReelPositions = [...this.reelPositions];
    }

    // Set up container for the whole reels
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

    // Create symbols and push it on reels
    private createReels(): void {
        for (let i = 0; i < this.numberOfReels; i++) {
            const containerCol = new Container();

            containerCol.x = i * this.widthReel + 43.5; // Spacing between rows
            containerCol.y = 60;
            this.containerGrid.addChild(containerCol);

            const reel: Reel = {
                container: containerCol,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new BlurFilter()
            };

            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            containerCol.filters = [reel.blur];

            // Create a mask for this reel column
            const reelMask = new Graphics()
                .rect(0, 0, this.sizeSymbol, this.symbolsPerReel * this.sizeSymbol)
                .fill({ color: 0xFFFFFF });
                containerCol.addChild(reelMask);

            // Create a container for the symbols and apply the mask
            const symbolsContainer = new Container();
            symbolsContainer.mask = reelMask;
            containerCol.addChild(symbolsContainer);

            // Build all symbols for this reel based on reelSet
            const totalSymbolsInReel = this.reelSet[i].length;

            for (let j = 0; j < totalSymbolsInReel; j++) {
                const symbolCode = this.reelSet[i][j];
                const texture = this.textureMap.get(symbolCode);

                if (!texture) {return;}

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

            // Calculate the visual position
            let visualPos = (j - currentPosition + totalSymbols) % totalSymbols; // Module makes it wrap to top again

            // Set the Y position
            symbol.y = visualPos * this.sizeSymbol;
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

        // Display current screen
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

        let reelsCompleted = 0;

        // uncomment this to check if pay line 1 works
        this.targetReelPositions = [1, 18, 10, 7, 3];

        // Generate a random outcome before spin starts
        // this.targetReelPositions = this.generateRandomOutcome();

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
            const reelIndex = i;

            gsap.to(reel.blur, {
                blurY: 5,
                duration: 0.1
            });

            // Calculate the exact position needed to show target symbols
            const currentPosition = this.reelPositions[i];
            const targetPosition = this.targetReelPositions[i];

            // Set the rotation to increment per reel
            const spinRotations = 1 + i ;

            // Create duplicate symbols array to track final positions
            const symbolPositions = [];
            for (let j = 0; j < reel.symbols.length; j++) {
                symbolPositions.push({
                    symbol: reel.symbols[j],
                    initialY: reel.symbols[j].y,
                    finalY: 0,
                });
            }

            // Calculate final positions for each symbol
            for (let j = 0; j < symbolPositions.length; j++) {
                const symbolData = symbolPositions[j];
                const symbolIndex = j;

                // Current visual position of the symbols
                const currentVisualPos = (symbolIndex - currentPosition + totalSymbols) % totalSymbols;

                // target position of the symbols after spinning
                const targetVisualPos = (symbolIndex - targetPosition + totalSymbols) % totalSymbols;

                // Calculate how many positions down it needs to move
                let positionsToMove;
                // Move down if target is greater than current, else, move down one full rotation.
                if (targetVisualPos >= currentVisualPos) {
                    positionsToMove = targetVisualPos - currentVisualPos;
                } else {
                    positionsToMove = targetVisualPos + totalSymbols - currentVisualPos;
                }

                // Add full rotations
                positionsToMove += spinRotations * totalSymbols;

                // Calculate the final Y position
                symbolData.finalY = symbolData.initialY + (positionsToMove * this.sizeSymbol);
            }

            // Animate each symbol to its final position
            for (let j = 0; j < symbolPositions.length; j++) {
                const symbolData = symbolPositions[j];

                gsap.to(symbolData.symbol, {
                    y: symbolData.finalY,
                    duration: 2 + i * 0.2, // Sequential timing
                    ease: "back.out(0.5)",
                    modifiers: {
                        // Wrap the y position when it exceeds the reel length
                        y: y => {
                            const totalReelHeight = totalSymbols * this.sizeSymbol;
                            return ((parseFloat(y) % totalReelHeight) + totalReelHeight) % totalReelHeight;
                        }
                    },
                    onComplete: () => {
                        // Only do this once per reel (on the last symbol)
                        if (j === symbolPositions.length - 1) {
                            // Remove blur when the reel stops
                            gsap.to(reel.blur, {
                                blurY: 0,
                                duration: 0
                            });

                            // Update the reel position
                            this.reelPositions[reelIndex] = targetPosition;

                            // Make sure symbols are in correct positions
                            this.positionSymbolsInReel(reel, reelIndex);

                            // Increment the counter of completed reels
                            reelsCompleted++;

                            // If all reels have completed, update the game state
                            if (reelsCompleted === this.reels.length) {
                                this.isRunning = false;

                                // Update the screen array
                                this.updateScreenArray();

                                // FOR WINNING
                                // Check for winnings
                                const payLine1 = this.payLine1();
                                const payLine3 = this.payLine3();
                                const payLine2 = this.payLine2();

                                // Log win information
                                if (payLine1.isWin) {
                                    console.log("WIN!");
                                    console.log("Winning Symbols:", payLine1.winningSymbols);
                                    console.log("Win Amount:", payLine1.winAmount);
                                }
                                if(payLine3.isWin){
                                    console.log("WIN!");
                                    console.log("Winning Symbols:", payLine3.winningSymbols);
                                    console.log("Win Amount:", payLine3.winAmount);
                                }
                                if(payLine2.isWin) {
                                    console.log("WIN!");
                                    console.log("Winning Symbols:", payLine2.winningSymbols);
                                    console.log("Win Amount:", payLine2.winAmount);
                                }

                                // Call the completion callback if provided
                                // if (onComplete) onComplete();
                            }
                        }
                    }
                });
            }
        }
    }

     // FOR WINNING
     payLine2(): WinResult {
        // Default result: no win
        const defaultResult: WinResult = {
            isWin: false,
            winningSymbols: [],
            winAmount: 0,
            winningPayline: -1
        };

        // Get the top row
        const topRow = this.screen[0];

        // get the left-most symbol
        let consecutiveSymbols: string[] = [topRow[0]];

        // Check for consecutive matching symbols from left to right
        for (let i = 1; i < topRow.length; i++) {
            if (topRow[i] === consecutiveSymbols[0]) {
                consecutiveSymbols.push(topRow[i]);
            }else {
                break;
            }
        }
        // Check if 3 consecutive symbol is present
        if (consecutiveSymbols.length >= 3) {
            const winSymbol = consecutiveSymbols[0];
            const winAmount = (this.payTable[winSymbol] && this.payTable[winSymbol][consecutiveSymbols.length]) || 0;

            return {
                isWin: true,
                winningSymbols: consecutiveSymbols,
                winAmount: winAmount,
                winningPayline: 2
            };
        }
        return defaultResult;
    }

     payLine1(): WinResult {
        const defaultResult: WinResult = {
            isWin: false,
            winningSymbols: [],
            winAmount: 0,
            winningPayline: -1
        };

        const middleRow = this.screen[1];

        let consecutiveSymbols: string[] = [middleRow[0]];

        for (let i = 1; i < middleRow.length; i++) {
            if (middleRow[i] === consecutiveSymbols[0]) {
                consecutiveSymbols.push(middleRow[i]);
            }else {
                break;
            }
        }
        if (consecutiveSymbols.length >= 3) {
            const winSymbol = consecutiveSymbols[0];
            const winAmount = (this.payTable[winSymbol] && this.payTable[winSymbol][consecutiveSymbols.length]) || 0;

            return {
                isWin: true,
                winningSymbols: consecutiveSymbols,
                winAmount: winAmount,
                winningPayline: 1 // middle row
            };
        }
        return defaultResult;
    }

    payLine3(): WinResult {
        const defaultResult: WinResult = {
            isWin: false,
            winningSymbols: [],
            winAmount: 0,
            winningPayline: -1
        };

        const bottomRow = this.screen[2];

        let consecutiveSymbols: string[] = [bottomRow[0]];

        for (let i = 1; i < bottomRow.length; i++) {
            if (bottomRow[i] === consecutiveSymbols[0]) {
                consecutiveSymbols.push(bottomRow[i]);
            }else {
                break;
            }
        }

        if (consecutiveSymbols.length >= 3) {
            const winSymbol = consecutiveSymbols[0];
            const winAmount = (this.payTable[winSymbol] && this.payTable[winSymbol][consecutiveSymbols.length]) || 0;

            return {
                isWin: true,
                winningSymbols: consecutiveSymbols,
                winAmount: winAmount,
                winningPayline: 3 // middle row
            };
        }
        return defaultResult;
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
    getPayTable(): { [key: string]: { [key: number]: number } } {
        return this.payTable;
    }
}