import { Application, Container} from "pixi.js";
import { BackgroundSettings } from "../scenes/background";
import { initDevtools } from '@pixi/devtools';
import { Logo } from "../components/logo"
import { Button } from "../components/button";
import { Reels } from "../components/reels";
import { initializeAssets } from "../utils/assetLoader";
import { Balance } from "../components/balance";


async function main() {
  // Create and initialize application
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: '#000000'
  });
  document.body.appendChild(app.canvas);
  app.canvas.style.position = "absolute";
  initDevtools({ app });

  await BackgroundSettings.create(app);
  await Logo.create(app);

  // Initialize reels
  const reels = new Reels(app);
  await reels.initialize();

  const manageBalance = await Balance.create(app);

  // Create button and connect to reels
  const button = await Button.create(app);

  button.setClickCallback(() => {
    reels.spin();
    button.connectBalance(manageBalance);
    // Reset Button after 4 seconds
    setTimeout(() => {
      button.reset();
    }, 4000);
  });
}
main().catch(console.error);