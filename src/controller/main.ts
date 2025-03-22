//main.ts
import { Application, Container} from "pixi.js";
import { BackgroundSettings } from "../scenes/background";
import { initDevtools } from '@pixi/devtools';
import { Logo } from "../components/logo"
import { Button } from "../components/button";
import { Reels } from "../components/reels";
import { AssetLoader } from "../utils/assetLoader";
import { Balance } from "../components/balance";
import { Winnings } from "../components/winnings";
import { Cynda } from "../components/cyndaquil";
import { gsap } from "gsap";

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

  await AssetLoader.init(app);

  await BackgroundSettings.create(app);
  await Logo.create(app);

  // Initialize reels
  const reels = new Reels(app, 5,3);
  await reels.initialize();

  const connectCynda = await Cynda.create(app);

  await Winnings.create(app);

  const manageBalance = await Balance.create(app);

  // Create button and connect to reels
  const button = await Button.create(app);

  button.setClickCallback(() => {
    reels.spin(() => {
      button.reset();
  });
    button.connectBalance(manageBalance);
    button.connectCynda(connectCynda);
  });

}
main().catch(console.error);
