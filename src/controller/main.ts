import { Application, Container} from "pixi.js";
import { BackgroundSettings } from "../scenes/background.ts";
import { initDevtools } from '@pixi/devtools';
import { Logo } from "../components/logo.ts"

async function main() {
  // Create PixiJS application
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: '#000000'
  });
  document.body.appendChild(app.canvas);
  app.canvas.style.position = "absolute";
  initDevtools({ app });

  // Create and initialize background with default settings
  await BackgroundSettings.create(app);

  await Logo.create(app);
}
main().catch(console.error);