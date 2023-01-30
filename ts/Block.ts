import 'phaser';
import Config from "./Config"
import MainGame from "./Scenes/MainGame";

export default class Block {
	private images: Phaser.GameObjects.Image[][] = [];
	
	constructor(
		public shape: number,
		public rotation: number,
		public x: number,
		public y: number,
		public color: number,
		public game: MainGame
	){}
	
	public init(): void {
		for (let x = 0; x < 4; ++x) {
			this.images[x] = [];
			for (let y = 0; y < 4; ++y) {
				this.images[x][y] = this.game.add.image(x * Config.blockSize, y * Config.blockSize, "blocks");
			}
		}
		this.setPosition(this.x, this.y);
		this.setShape(this.shape, this.rotation);
		this.setColor(this.color);
	}

	public setColor(color: number) {
		this.color = color == -1 ? Config.emptyBlockIx : color;
		for (let y = 0; y < 4; ++y) {
			for (let x = 0; x < 4; ++x) {
				this.images[x][y].setFrame(this.color);
			}
		}
	}

	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
		const offset = this.game.getTileMapOffset();
		for (let dy = 0; dy < 4; ++dy) {
			for (let dx = 0; dx < 4; ++dx) {				
				this.images[dx][dy].setX((x + dx - 0.5) * Config.blockSize + offset.x);
				this.images[dx][dy].setY((Config.height - (y + dy) + 1.5) * Config.blockSize + offset.y);
			}
		}
	}

	public setShape(shape: number, rotation: number): void {
		this.shape = shape;
		this.rotation = rotation;

		if (shape < 0) {
			for (let dx = 0; dx < 4; ++dx) {
				for (let dy = 0; dy < 4; ++dy) {			
					this.images[dx][dy].setAlpha(0);
				}
			}	
			return;
		}

		for (let dx = 0; dx < 4; ++dx) {
			for (let dy = 0; dy < 4; ++dy) {			
				const isBlock = Block.shapes[this.shape][this.rotation][dx][dy] == 1 ? true : false;
				this.images[dx][dy].setAlpha(isBlock ? 1 : 0);
			}
		}
	}

	// [7][4][4][4]
	static shapes: number[][][][] = [    
	
		// O-block
		[[
			[0,0,0,0],
			[0,1,1,0],
			[0,1,1,0],
			[0,0,0,0]
		],[
			[0,0,0,0],
			[0,1,1,0],
			[0,1,1,0],
			[0,0,0,0]
		],[
			[0,0,0,0],
			[0,1,1,0],
			[0,1,1,0],
			[0,0,0,0]
		],[
			[0,0,0,0],
			[0,1,1,0],
			[0,1,1,0],
			[0,0,0,0]
		]],

		// I-block
		[[
			[0,0,0,0],
			[1,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,0],
			[0,0,1,0],
			[0,0,1,0]
		],[
			[0,0,0,0],
			[1,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,0],
			[0,0,1,0],
			[0,0,1,0]
		]],

		// S-block
		[[
			[0,0,0,0],
			[0,0,1,1],
			[0,1,1,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,1],
			[0,0,0,1],
			[0,0,0,0]
		],[
			[0,0,0,0],
			[0,0,1,1],
			[0,1,1,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,1],
			[0,0,0,1],
			[0,0,0,0]
		]],

		// Z-block
		[[
			[0,0,0,0],
			[0,1,1,0],
			[0,0,1,1],
			[0,0,0,0]
		],[
			[0,0,0,1],
			[0,0,1,1],
			[0,0,1,0],
			[0,0,0,0]
		],[
			[0,0,0,0],
			[0,1,1,0],
			[0,0,1,1],
			[0,0,0,0]
		],[
			[0,0,0,1],
			[0,0,1,1],
			[0,0,1,0],
			[0,0,0,0]
		]],

		// L-block
		[[
			[0,0,0,0],
			[0,1,1,1],
			[0,1,0,0],
			[0,0,0,0],
		],[
			[0,0,1,0],
			[0,0,1,0],
			[0,0,1,1],
			[0,0,0,0],
		],[
			[0,0,0,1],
			[0,1,1,1],
			[0,0,0,0],
			[0,0,0,0],
		],[
			[0,1,1,0],
			[0,0,1,0],
			[0,0,1,0],
			[0,0,0,0]
		]],

		// J-block
		[[
			[0,0,0,0],
			[0,1,1,1],
			[0,0,0,1],
			[0,0,0,0]
		],[
			[0,0,1,1],
			[0,0,1,0],
			[0,0,1,0],
			[0,0,0,0]
		],[
			[0,1,0,0],
			[0,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,0],
			[0,1,1,0],
			[0,0,0,0]
		]],

		// T-block
		[[
			[0,0,0,0],
			[0,1,1,1],
			[0,0,1,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,0,1,1],
			[0,0,1,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		],[
			[0,0,1,0],
			[0,1,1,0],
			[0,0,1,0],
			[0,0,0,0]
		]]
	];
}
