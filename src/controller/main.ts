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
import {Howl} from 'howler';
import { WinDisplay } from "../utils/displayWins";

async function main() {
  // Create and initialize application
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: '#000000'
  });

  const music_bg = new Howl({
    src: ['./assets/audio/bg_music.m4a'],
    autoplay:true,
    loop: true,
    volume: 0.3,
  });
  music_bg.play();

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

  const winnings = await Winnings.create(app);

  const manageBalance = await Balance.create(app);

  const winDisplay = new WinDisplay(app);

  // Create button and connect to reels
  const button = await Button.create(app);

  button.setClickCallback(() => {
    winnings.resetWinnings(); // Reset winnings to 0 on spin click
    manageBalance.deductBalance(); // Deduct 5 on balance on spin click
    connectCynda.showCyndaF(); // Show pokemon on click
    winDisplay.hideWin();

    reels.spin(() => {
      button.reset(); // After reel spin, reset the button to spin
      connectCynda.showCynda(); // reset the pokemon
    },

    (wins) => {
      const totalWinAmount = wins.reduce((sum,win) => sum + win.winAmount, 0);

      if (totalWinAmount > 0) {
        // Display win information
        winDisplay.displayWin(wins[0], reels.getTextureMap());
      }
      winnings.addWinnings(totalWinAmount);
      manageBalance.addBalance(totalWinAmount);
    }
);
  });

}
main().catch(console.error);
