import {Application, Container, Graphics, Sprite, Texture, BlurFilter} from 'pixi.js';
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
export interface WinResult {
    isWin: boolean;
    winningSymbols: string;
    winAmount: number;
    winningPayline: string;
    winningCoordinates: number[][];
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

    private winningSymbolAnimations: {symbol: Sprite, animation: gsap.core.Tween}[] = []; // Array for animations

    // Predefined symbol sequences for each reel
    private reelSet: string[][] = [
        [ "hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2" ], // 0-19
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
                alpha: 0.3
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
                symbol.anchor.set(0.5);

                // Set consistent size for all symbols
                const scale = Math.min(
                    this.sizeSymbol / texture.width,
                    this.sizeSymbol / texture.height
                );
                symbol.scale.set(scale);

                // Center horizontally
                // symbol.x = Math.round((this.sizeSymbol - symbol.width) / 2);
                symbol.x = (this.sizeSymbol/2);

                // Position vertically based on index
                symbol.y = (j * this.sizeSymbol) + (this.sizeSymbol/2);

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
            symbol.y = visualPos * this.sizeSymbol + 65;
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
    spin(onComplete?: () => void, onWin?:(wins: WinResult[])=> void): void {
        this.clearWinningSymbolAnimations();
        if (this.isRunning) return;

        this.isRunning = true;

        let reelsCompleted = 0;

        // uncomment this to check if particular pay line works
        // this.targetReelPositions = [2, 19, 11, 8, 4]; // // payline 1 mid
        this.targetReelPositions = [0, 11, 1, 10, 14]; // multiple paylines
        // this.targetReelPositions = [3, 20, 12, 9, 5];         // payline 2 top
        // this.targetReelPositions = [1, 18, 10, 7, 3];         // payline 3 bot
        // this.targetReelPositions = [3, 20, 11, 7, 3];         // payline 4 up-down diagonal
        // this.targetReelPositions = [1, 18, 11, 9, 5];        // payline 5 down-up diagonal
        // this.targetReelPositions = [3, 19, 10, 8, 5];        // payline 6 V
        // this.targetReelPositions = [1, 19, 12, 8, 3];        // payline 7 inverted V


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

                                const combinedWin = this.checkAllPaylines();

                                // Handle wins
                                if (combinedWin.isWin) {
                                    if (onWin){
                                        onWin([combinedWin]);
                                    }

                                    console.log("YOU WIN!");
                                    console.log("Winning Symbols:", combinedWin.winningSymbols);
                                    console.log("Win Amount:", combinedWin.winAmount);
                                    console.log("Winning Line:", combinedWin.winningPayline);

                                    // Apply pulsing animation to winning symbols
                                    this.applyWinningSymbolAnimation(combinedWin);
                                }

                                if (onComplete) onComplete();
                            }
                        }
                    }
                });
            }
        }
    }

    // Function to set the winning requirements
    private checkAllPaylines(): WinResult {
        // Coordinates of each pattern
        const paylines = [
            { line: [[0,0], [0,1], [0,2], [0,3], [0,4]], number: 2 }, // Top row
            { line: [[1,0], [1,1], [1,2], [1,3], [1,4]], number: 1 }, // Middle row
            { line: [[2,0], [2,1], [2,2], [2,3], [2,4]], number: 3 }, // Bottom row
            { line: [[0,0], [0,1], [1,2], [2,3], [2,4]], number: 4 }, // Up-down diagonal
            { line: [[2,0], [2,1], [1,2], [0,3], [0,4]], number: 5 }, // Down-up diagonal
            { line: [[0,0], [1,1], [2,2], [1,3], [0,4]], number: 6 }, // Normal V
            { line: [[2,0], [1,1], [0,2], [1,3], [2,4]], number: 7 }  // Inverted V
        ];

        // Initiate an array for the result
        const wins: WinResult[] = [];

        for (const payline of paylines) {
            const result = this.checkPaylineWin(payline.line, payline.number);
            if (result.isWin) {
                wins.push(result);
            }
        }

        return this.combineWins(wins);
    }

    // Function to check if symbols fill the pattern
    private checkPaylineWin(payline: number[][], paylineNumber: number): WinResult {
        const defaultResult: WinResult = {
            isWin: false,
            winningSymbols: "",
            winAmount: 0,
            winningPayline: "-1",
            winningCoordinates: []
        };

        // Extract symbols along the specified payline
        const symbols = payline.map(([row, col]) => this.screen[row][col]);

        // Group consecutive identical symbols from the start
        const consecutiveSymbols: string[] = [symbols[0]];
        const winningCoordinates: number[][] = [payline[0]];

        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === consecutiveSymbols[0]) {
                consecutiveSymbols.push(symbols[i]);
                winningCoordinates.push(payline[i]);
            } else {
                break;
            }
        }

        // Check if we have at least 3 consecutive matching symbols
        if (consecutiveSymbols.length >= 3) {
            const winSymbol = consecutiveSymbols[0];
            const winAmount = (this.payTable[winSymbol][consecutiveSymbols.length]) || 0;

            return {
                isWin: true,
                winningSymbols: winSymbol,
                winAmount: winAmount,
                winningPayline: paylineNumber.toString(),
                winningCoordinates: winningCoordinates
            };
        }

        return defaultResult;
    }

    // Function to combine details of winning symbols for display purposes
    private combineWins(wins: WinResult[]): WinResult {
        if (wins.length === 0) {
            return {
                isWin: false,
                winningSymbols: "",
                winAmount: 0,
                winningPayline: "",
                winningCoordinates: []
            };
        }

        // Combine winning symbols
        const combinedSymbols = wins.map(win => win.winningSymbols).join(" and ");

        // Sum of amount
        const totalWinAmount = wins.reduce((sum, win) => sum + win.winAmount, 0);

        // Combine paylines
        const combinedPaylines = ("Line " + (wins.map(win => win.winningPayline).join(" and ")));

        // Combine winning coordinates
        const combinedCoordinates = wins.reduce((acc: number[][], win: WinResult) =>
            acc.concat(win.winningCoordinates), [] as number[][]);
        return {
            isWin: true,
            winningSymbols: combinedSymbols,
            winAmount: totalWinAmount,
            winningPayline: combinedPaylines,
            winningCoordinates: combinedCoordinates
        };
    }

    // Function to highlight winning symbols thru animation
    private applyWinningSymbolAnimation(winResult: WinResult) {
        if (!winResult.isWin) return;

        // Kill any existing animations first
        this.clearWinningSymbolAnimations();

        // Find the reel and the specific symbol within that reel
        winResult.winningCoordinates.forEach(([row, col]) => {
            const reel = this.reels[col];
            const symbolIndex = (this.reelPositions[col] + row) % reel.symbols.length;
            const winningSymbol = reel.symbols[symbolIndex];

            if (winningSymbol) {
                const animation = this.pulseSymbol(winningSymbol);
                this.winningSymbolAnimations.push({symbol: winningSymbol, animation});
            }
        });
    }

    // Function to clear animations
    private clearWinningSymbolAnimations(): void {
        this.winningSymbolAnimations.forEach(({ symbol, animation }) => {
            // Kill the animation
            animation.kill();

            // Reset the symbol's scale to original
            const originalScaleX = symbol.scale.x / 1.1;
            const originalScaleY = symbol.scale.y / 1.1;
            symbol.scale.set(originalScaleX, originalScaleY);
        });

        // Clear the animations array
        this.winningSymbolAnimations = [];
    }

    // Animation to make symbols pulse
    private pulseSymbol(sprite: Sprite): gsap.core.Timeline {
        const originalScaleX = sprite.scale.x;
        const originalScaleY = sprite.scale.y;

        return gsap.timeline({repeat: -1,
            repeatDelay: 0.7})
            .to(sprite.scale, {
                x: originalScaleX,
                y: originalScaleY,
                duration: 0.3,
                ease: "power1.out"
            })
            .to(sprite.scale, {
                x: originalScaleX * 1.1,
                y: originalScaleY * 1.1,
                duration: 1,
                ease: "power1.inOut"
            })
            .to(sprite.scale, {
                x: originalScaleX,
                y: originalScaleY,
                duration: 0.3,
                ease: "power1.in"
            });
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
    getTextureMap(): Map<string, Texture> {
        return this.textureMap;
    }
}