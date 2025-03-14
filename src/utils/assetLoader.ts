// assets.ts
import { Assets } from 'pixi.js';

// Define your asset manifest
export const assetManifest = {
  bundles: [
    {
      name: 'images',
      assets: [
        {
          name: 'cyndaquil',
          srcs: './assets/images/cyndaquil.png'
        }
      ]
    }
  ]
};

// Initialize assets
export async function initializeAssets() {
  // Add the manifest to the asset resolver
  await Assets.init({ manifest: assetManifest });

  // Preload the basic bundle
  await Assets.loadBundle('game-assets');

  console.log('All assets loaded!');
}

// Helper to get a specific asset
export function getAsset(name: string) {
  return Assets.get(name);
}