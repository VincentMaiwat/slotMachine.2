import {
    Application,
    Sprite,
    Texture,
    Container,
    Assets,
    TickerCallback
} from 'pixi.js';

export class Button {
    private app: Application;
    private sprite?: Sprite;
    private texture?: Texture;
    private imagePath: string = 'assets/images/spin.png';
    private altImagePath: string = 'assets/images/gl.png';
    private container: Container;
    private tickerCallback?: TickerCallback;
    private onClickCallback?: () => void;

    private width: number = 100;
    private height: number = 60;
    private xPosition: number = 0;
    private yPosition: number = 780;
    private isInteractive: boolean = true;
    private isPulsing: boolean = true;

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private handleResize(): void {
        if (this.sprite) {
            this.sprite.x = this.xPosition || this.app.screen.width / 2;
        }
    }

    static async create(app: Application): Promise<Button> {
        const button = new Button(app);
        await button.initialize();
        return button;
    }

    async initialize(): Promise<void> {
        try {
            this.texture = await Assets.load(this.imagePath);
            this.sprite = Sprite.from(this.texture);
            this.applyConfigurations();
            this.container.addChild(this.sprite);
            return Promise.resolve();
        } catch (error) {
            console.error("Failed to load logo:", error);
            return Promise.reject(error);
        }
    }

    private applyConfigurations(): void {
        if (!this.sprite) return;

        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.anchor.set(0.5);

        this.sprite.x = (this.xPosition || this.app.screen.width) / 2;
        this.sprite.y = (this.yPosition || this.app.screen.height );

        // Set interactivity
        if (this.isInteractive) {
            this.sprite.eventMode = 'static';
            this.sprite.cursor = 'pointer';
            this.sprite.on('pointerdown', this.onClick.bind(this));
        } else {
            this.sprite.eventMode = 'none';
            this.sprite.cursor = 'default';
        }
        // Set blinking animation if pulsing is enabled
        if (this.isPulsing) {
            this.setupPulsingEffect();
        }
    }

    private setupPulsingEffect(): void {
        let blinkSpeed = 0.01;
        let increasing = false;

        // Remove any existing ticker callback
        if (this.tickerCallback) {
            this.app.ticker.remove(this.tickerCallback);
        }

        // Create and store the new ticker callback
        this.tickerCallback = (delta: number) => {
            if (!this.sprite) return;

            if (increasing) {
                this.sprite.alpha += blinkSpeed;
                if (this.sprite.alpha >= 1) increasing = false;
            } else {
                this.sprite.alpha -= blinkSpeed;
                if (this.sprite.alpha <= 0.2) increasing = true;
            }
        };

        // Add the ticker callback
        this.app.ticker.add(this.tickerCallback);
    }

    // Method to set click callback
    public setClickCallback(callback: () => void): void {
        this.onClickCallback = callback;
    }

    private onClick = async () => {
        if (this.onClickCallback) {
            this.onClickCallback();
        }
        // Change interactivity
        this.isInteractive = false;

        this.isPulsing = false;
        if (this.tickerCallback) {
            this.app.ticker.remove(this.tickerCallback);
            this.tickerCallback = undefined;
        }
        if (this.sprite) {
            this.sprite.alpha = 1;
        }
        // Change image to good luck
        try {
            const newTexture = await Assets.load(this.altImagePath);
            if (this.sprite) {
                this.sprite.texture = newTexture;
                this.sprite.width = this.sprite.width = 190;
                this.sprite.height = this.sprite.height = 70;

                // Update interactivity settings
                this.sprite.eventMode = 'none';
                this.sprite.cursor = 'default';
            }
        } catch (error) {
            console.error("Failed to load alternative button image:", error);
        }
    };

    // Method to reset button to initial state
    public reset = async (): Promise<void> => {
        this.isInteractive = true;
        this.isPulsing = true;

        try {
            // Load original image
            const originalTexture = await Assets.load(this.imagePath);

            if (this.sprite) {
                this.sprite.texture = originalTexture;
                this.applyConfigurations();
            }
        } catch (error) {
            console.error("Failed to reset button:", error);
        }
    };
}