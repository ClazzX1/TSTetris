import Preloader from "./Preloader";
import Utilities from "../Utilities";

export default class Boot extends Phaser.Scene {
	public static Name = "Boot";

	public preload(): void {
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Boot", "create");
		this.scene.start(Preloader.Name);
	}
}
