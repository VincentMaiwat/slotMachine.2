"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundSettings = void 0;
var pixi_js_1 = require("pixi.js");
var BackgroundSettings = /** @class */ (function () {
    // load textures
    function BackgroundSettings(app) {
        this.layers = [];
        this.app = app;
        this.container = new pixi_js_1.Container();
        this.app.stage.addChild(this.container);
    }
    BackgroundSettings.prototype.initialize = function (layersConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var assetPaths, textures, _i, layersConfig_1, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assetPaths = layersConfig.map(function (config) { return config.imagePath; });
                        return [4 /*yield*/, pixi_js_1.Assets.load(assetPaths)];
                    case 1:
                        textures = _a.sent();
                        _i = 0, layersConfig_1 = layersConfig;
                        _a.label = 2;
                    case 2:
                        if (!(_i < layersConfig_1.length)) return [3 /*break*/, 5];
                        config = layersConfig_1[_i];
                        return [4 /*yield*/, this.addLayer(config, textures[config.imagePath])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // animation ticker
                        this.app.ticker.add(this.update.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    BackgroundSettings.prototype.addLayer = function (config, texture) {
        return __awaiter(this, void 0, void 0, function () {
            var imagePath, speedX, _a, speedY, isTiling, sprite;
            return __generator(this, function (_b) {
                imagePath = config.imagePath, speedX = config.speedX, _a = config.speedY, speedY = _a === void 0 ? 0 : _a, isTiling = config.isTiling;
                if (isTiling) {
                    // Create a tiling sprite
                    sprite = new pixi_js_1.TilingSprite({
                        texture: texture,
                        width: this.app.screen.width,
                        height: this.app.screen.height
                    });
                    // Set tiling scale
                    sprite.tileScale.set(this.app.screen.width / texture.width, this.app.screen.height / texture.height);
                }
                else {
                    // Create a regular sprite
                    sprite = pixi_js_1.Sprite.from(texture);
                    // Resize to match screen
                    sprite.width = this.app.screen.width;
                    sprite.height = this.app.screen.height;
                }
                // Add to container
                this.container.addChild(sprite);
                // Store layer data for animation
                this.layers.push({
                    sprite: sprite,
                    speedX: speedX,
                });
                return [2 /*return*/];
            });
        });
    };
    BackgroundSettings.prototype.update = function (deltaTime) {
        // Update each layer's position
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            if (layer.sprite instanceof pixi_js_1.TilingSprite) {
                layer.sprite.tilePosition.x += layer.speedX * deltaTime;
            }
            else {
                // For non-tiling sprites, you might want to implement
                // different movement logic or wrapping behavior
            }
        }
    };
    // Optional: Methods to control background animation
    BackgroundSettings.prototype.pause = function () {
        this.app.ticker.remove(this.update.bind(this));
    };
    BackgroundSettings.prototype.resume = function () {
        this.app.ticker.add(this.update.bind(this));
    };
    // Method to resize all layers when window size changes
    BackgroundSettings.prototype.resize = function (width, height) {
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            layer.sprite.width = width;
            layer.sprite.height = height;
            if (layer.sprite instanceof pixi_js_1.TilingSprite) {
                var texture = layer.sprite.texture;
                layer.sprite.tileScale.set(width / texture.width, height / texture.height);
            }
        }
    };
    return BackgroundSettings;
}());
exports.BackgroundSettings = BackgroundSettings;
// import { Component } from '../utils/resize.ts';
// export class Background extends Component {
//     private backgroundTexture!: Texture;
//     private background!: Sprite;
//     constructor() {
//         super();
//     }
//     public async init(): Promise<void> {
//         try {
//             // Load and setup background
//             this.backgroundTexture = await Assets.load('assets/images/background-day.png');
//             this.background = new Sprite(this.backgroundTexture);
//             this.background.height = window.innerHeight;
//             this.background.width = window.innerWidth/3;
//             // this.background.anchor.set(0.5,0.5)
//             this.background.x = (window.innerWidth - this.background.width)/2;
//             const blur_filter = new BlurFilter();
//             blur_filter.strengthX = 1;
//             blur_filter.strengthY = 1;
//             this.background.filters = [blur_filter];
//             // Use explicit type to call Container methods
//             this.addChild(this.background);
//             // Set up resize listener
//             window.addEventListener('resize', this.resize);
//         } catch (error) {
//             console.error('Failed to load background:', error);
//             throw error;
//         }
//     }
//     public update(delta: number): void {
//     }
//     // Method to handle window resize events
//     public resize = (): void => {
//         if (this.background) {
//             this.background.height = window.innerHeight;
//             this.background.width = window.innerWidth;
//         }
//     }
//     public destroy(): void {
//         window.removeEventListener('resize', this.resize);
//         super.destroy();
//     }
// }
