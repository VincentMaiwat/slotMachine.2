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