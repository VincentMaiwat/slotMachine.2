// import { Container } from 'pixi.js';

// export abstract class Component extends Container {
//     constructor() {
//         super();

//         // Bind the resize handler to the class instance
//         this.onResize = this.onResize.bind(this);

//         // Add a resize event listener
//         window.addEventListener('resize', this.onResize);
//     }
//     // Abstract methods
//     public abstract init(): Promise<void>;
//     public abstract update(delta: number): void;

//     // Resize handler
//     protected onResize(): void {
//         // Recalculate positions, sizes, or scales based on the new window dimensions
//         this.recalculateLayout(window.innerWidth, window.innerHeight);
//     }
//     // Method to recalculate layout
//     protected recalculateLayout(width: number, height: number): void {
//         // Override this method in child classes to implement specific responsive behavior
//     }
//     // Cleanup method
//     public destroy(): void {
//         // Remove the resize event listener
//         window.removeEventListener('resize', this.onResize);

//         // Destroy the container and its children
//         super.destroy();
//     }
// }