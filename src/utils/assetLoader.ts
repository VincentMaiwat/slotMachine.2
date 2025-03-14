import { Assets } from 'pixi.js';

// Define types for game assets
export type GameAssets = {
  [key: string]: any;
};

// Define asset manifest - add all your game assets here
export const assetManifest = {
  bundles: [
    {
      name: 'game-assets',
      assets: [
        // Background assets
        {
          name: 'bgBack',
          srcs: 'assets/images/back.png'
        },
        {
          name: 'bgMiddle',
          srcs: 'assets/images/middle.png'
        },
        {
          name: 'bgFront',
          srcs: 'assets/images/front.png'
        },
        // Logo assets
        {
          name: 'logo',
          srcs: 'assets/images/SLOT.png'
        },
        // Button assets
        {
          name: 'spin',
          srcs: 'assets/images/spin.png'
        },
        {
          name: 'goodluck',
          srcs: 'assets/images/gl.png'
        },
        {
          name: 'button-hover',
          srcs: 'assets/images/button-hover.png'
        },
        // Reel assets
        {
          name: 'symbol-1',
          srcs: 'assets/images/symbol-1.png'
        },
        {
          name: 'symbol-2',
          srcs: 'assets/images/symbol-2.png'
        },
        {
          name: 'symbol-3',
          srcs: 'assets/images/symbol-3.png'
        },
        // Add more assets as needed
      ]
    }
  ]
};

export class AssetLoader {
  private static instance: AssetLoader;
  private assets: GameAssets = {};
  private isLoaded = false;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  // Load all assets
  public async loadAssets(): Promise<void> {
    if (this.isLoaded) return;

    console.log('Loading assets...');

    // Initialize Assets with manifest
    await Assets.init({ manifest: assetManifest });

    // Load the asset bundle
    const gameAssets = await Assets.loadBundle('game-assets');

    // Store loaded assets
    this.assets = gameAssets;
    this.isLoaded = true;

    console.log('All assets loaded successfully!');
  }

  // Get a loaded asset by name
  public getAsset(name: string): any {
    if (!this.isLoaded) {
      console.warn('Assets not loaded yet. Call loadAssets() first.');
      return null;
    }

    if (!this.assets[name]) {
      console.warn(`Asset "${name}" not found.`);
      return null;
    }

    return this.assets[name];
  }

  // Check if specific asset exists
  public hasAsset(name: string): boolean {
    return this.isLoaded && !!this.assets[name];
  }

  // Get all loaded assets
  public getAllAssets(): GameAssets {
    return this.assets;
  }
}

// Export a default instance
export default AssetLoader.getInstance();


// import {Assets, Texture} from "pixi.js";

// export const assetManifest = {
//     bundles: [
//         {
//             name:"button",
//             assets: {
//                 spin: "assets/images/spin.png",
//                 gl: "assets/images/gl.png",
//             },
//         },
//     ],
// };

// export async function loadAssets(): Promise<void> {
//     await Assets.init({manifest: assetManifest});
//     await Assets.loadBundle("button");
//     await loadAssets();
// }

// export function getTexture(name:string): Texture{
//     const texture = Assets.get(name);
//     if (!texture){
//         throw new Error('Texture  "&{name}" not found!');
//     }
//     return Texture;
// }
