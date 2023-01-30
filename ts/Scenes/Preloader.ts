import SplashScreen from "./SplashScreen";
import Utilities from "../Utilities";

export default class Preloader extends Phaser.Scene {
	public static Name = "Preloader";

	public preload(): void {
		this.load.path = "assets/";
		this.load.image("phaser_pixel_medium_flat");
		this.load.image("Phaser-Logo-Small");
		this.load.image("background");
		this.load.spritesheet('blocks', 'blocks.png', { frameWidth: 24, frameHeight: 24 });
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");
		this.scene.start(SplashScreen.Name);
	}
}
