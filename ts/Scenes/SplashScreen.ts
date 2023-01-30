import Utilities from "../Utilities";
import MainGame from "./MainGame";

export default class SplashScreen extends Phaser.Scene {
	public static Name = "SplashScreen";

	public preload(): void {
		this.load.path = "assets/";
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("SplashScreen", "create");

		const titleText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 0.5, "TypeScript Tetris\nby\nAntti Alkkiomäki", { align: "center"})
			.setOrigin(0.5, 0)
			.setFontFamily("monospace").setFontSize(26).setFill("#fff");

		const poweredByText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 25, "Powered By");
		poweredByText.setOrigin(0.5, 0.5);
		poweredByText.setFontFamily("monospace").setFontSize(20).setFill("#fff");
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "phaser_pixel_medium_flat");

		this.input.setDefaultCursor("pointer");
		this.input.on("pointerdown", this.startGame, this);

		this.time.addEvent({
			delay: 5000,
			callback: this.startGame,
			callbackScope: this,
			loop: false
		});
	}

	private startGame(): void {
		this.scene.start(MainGame.Name);
	}
}
