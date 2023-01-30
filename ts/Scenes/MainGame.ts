import Utilities from "../Utilities";
import Block from "../Block";
import Config from "../Config";

export default class MainGame extends Phaser.Scene {
	public static Name = "MainGame";

	private gameArea: number[][] = [];
	private currentBlock = new Block(-1, 0, 0, 0, 0, this);
	private nextBlock: [Block, Block, Block] = [null, null, null];
	private nextShape: [number, number, number] = [0, 0, 0];
	private nextColor: [number, number, number] = [0, 0, 0];
	private lastMoveTime: number;
	private moveUpdateDelay = 300;
	private fallSpeed = 0;
	private isGameOver = true;
	private leftTimer = 0.0;
	private rightTimer = 0.0; 
	private score = 0;
	private previousScore = 0;
	private highscore = 0;  
	private layer: Phaser.Tilemaps.TilemapLayer;
	private scoreText: Phaser.GameObjects.Text;
	private highscoreText: Phaser.GameObjects.Text;
	private gameOverText: Phaser.GameObjects.Text;
	private restartText: Phaser.GameObjects.Text;

	private enterKey: Phaser.Input.Keyboard.Key;
	private leftKey: Phaser.Input.Keyboard.Key;
	private rightKey: Phaser.Input.Keyboard.Key;
	private upKey: Phaser.Input.Keyboard.Key;
	private downKey: Phaser.Input.Keyboard.Key;
	
	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "background");
		this.createTileMap();
		this.createTexts();
		this.currentBlock.init();
		this.initGame();

		this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	}
	
	private createTileMap(): void {
		const offset = this.getTileMapOffset();

		const map = this.make.tilemap({ width: Config.width + 2, height: Config.height + 1, tileWidth: Config.blockSize, tileHeight: Config.blockSize });
		const tiles = map.addTilesetImage('blocks', null, Config.blockSize, Config.blockSize);
		this.layer = map.createBlankLayer('layer1', tiles, offset.x, offset.y);
		
		// fill borders
		this.layer.fill(Config.borderBlockIx, 0, 0, 1, Config.height);
		this.layer.fill(Config.borderBlockIx, Config.width + 1, 0, 1, Config.height);
		this.layer.fill(Config.borderBlockIx, 0, Config.height, Config.width + 2, 1);
		
		// fill game area with empty blocks
		this.layer.fill(Config.emptyBlockIx, 1, 0, Config.width, Config.height);	
		
		//this.layer.randomize(0, 0, map.width, map.height, [ 0, 1, 2, 3, 4 ]);
	}

	private createTexts(): void {
		const x = 600;
		const y = 180;

		this.highscoreText = this.add.text(x, y, "HI-SCORE\n" + this.highscore, { align: "left"})
			.setFontFamily("monospace").setFontSize(22).setFill("#fedb4f");

		this.scoreText = this.add.text(x, y + 70, "SCORE\n0", { align: "left"})
			.setFontFamily("monospace").setFontSize(22).setFill("#fff");

		this.gameOverText = this.add.text(x, y + 140, "", { align: "left"})
			.setFontFamily("monospace").setFontSize(22).setFill("#ff1a6b");

		this.restartText = this.add.text(400, 570, "", { align: "center"})
			.setOrigin(0.5, 0.5)
			.setFontFamily("monospace").setFontSize(22).setFill("#676767");
	}

	public getTileMapOffset(): { x: number, y:number } {
		return { 
			x: this.cameras.main.centerX - Config.width * Config.blockSize / 2 - Config.blockSize,
			y: this.cameras.main.centerY - (Config.height + 1) * Config.blockSize / 2
		};
	}

	private initGame(): void {
		this.loadHighscore();
	
		this.gameOverText.setText("");
		this.restartText.setText("");

		this.currentBlock.setShape(-1, 0);
		this.lastMoveTime = Date.now();
		this.isGameOver = false;
		this.score = 0;

		for (let i = 0; i < 3; ++i) {
			this.nextShape[i] = Utilities.getRandomShape();
			this.nextColor[i] = Utilities.getRandomColor();
		}
		this.refreshNextBlocks();
	
		for (let x = 0; x < Config.width; ++x) {
			this.gameArea[x] = [];
			for (let y = 0; y < Config.height; ++y) {
				this.changeBlock(x, y, -1);
			}
		}	
	}

	public update(): void {
		this.updateInput();

		if (this.isGameOver)
			return;

		if (this.currentBlock.shape == -1)
			this.createNewBlock();

		// increase fall speed to make game more difficult as time progress
		this.fallSpeed = 10 + Math.floor(this.score / 200) * 10

		if (Date.now() - this.lastMoveTime > this.moveUpdateDelay) {
			this.lastMoveTime = Date.now();
			this.tryMoveCurrentBlock();
		}

		this.tryRemoveFullRows();

		if (this.previousScore != this.score) {
			this.scoreText.setText("SCORE\n" + this.score);
			this.previousScore = this.score;
		}
	}

	private createNewBlock(): void {
		this.currentBlock.setShape(this.nextShape[0], 0);
		this.currentBlock.setPosition(Config.width / 2, Config.height + 1);
		this.currentBlock.setColor(this.nextColor[0]);

		this.nextShape[0] = this.nextShape[1];
		this.nextShape[1] = this.nextShape[2];
		this.nextShape[2] = Utilities.getRandomShape();
		
		this.nextColor[0] = this.nextColor[1];
		this.nextColor[1] = this.nextColor[2];
		this.nextColor[2] = Utilities.getRandomColor();

		this.refreshNextBlocks();
	}
	
	private refreshNextBlocks(): void {
		for (let i = 0; i < 3; ++i) {
			if (this.nextBlock[i] == null) {
				this.nextBlock[i] = new Block(this.nextShape[i], 0, 13 + i * 3, Config.height - 3, this.nextColor[i], this);				
				this.nextBlock[i].init();
			}
			else {
				this.nextBlock[i].setShape(this.nextShape[i], 0); 
				this.nextBlock[i].setColor(this.nextColor[i]);
			}
		}
	}

	private updateInput(): void {
		if (this.isGameOver)
		{
			if (Phaser.Input.Keyboard.JustDown(this.enterKey))
				this.initGame();

			return;
		}

		const isPressLeft = Phaser.Input.Keyboard.JustDown(this.leftKey);
		const isPressRight = Phaser.Input.Keyboard.JustDown(this.rightKey);
		const isPressUp = Phaser.Input.Keyboard.JustDown(this.upKey);

		if (isPressLeft || (this.leftKey.isDown && Date.now() - this.leftTimer > 120)) {
			this.leftTimer = Date.now();
			if (!this.isBlockCollide(this.currentBlock.x - 1, this.currentBlock.y, this.currentBlock.shape, this.currentBlock.rotation))
				this.currentBlock.setPosition(this.currentBlock.x - 1, this.currentBlock.y);
		}
			
		if (isPressRight || (this.rightKey.isDown && Date.now() - this.rightTimer > 120)) {
			this.rightTimer = Date.now();
			if (!this.isBlockCollide(this.currentBlock.x + 1, this.currentBlock.y, this.currentBlock.shape, this.currentBlock.rotation))
				this.currentBlock.setPosition(this.currentBlock.x + 1, this.currentBlock.y);
		}
			
		if (isPressUp) {
			if (!this.isBlockCollide(this.currentBlock.x, this.currentBlock.y, this.currentBlock.shape, this.currentBlock.rotation + 1))
				this.currentBlock.setShape(this.currentBlock.shape, (this.currentBlock.rotation + 1) % 4);
		}
			
		if (this.downKey.isDown)
			this.moveUpdateDelay = 50;
		else 
			this.moveUpdateDelay = Math.max(500 - this.fallSpeed, 50);
	}

	private tryMoveCurrentBlock(): void {
		if (!this.isBlockCollide(this.currentBlock.x, this.currentBlock.y - 1, this.currentBlock.shape, this.currentBlock.rotation))
			this.currentBlock.setPosition(this.currentBlock.x, this.currentBlock.y - 1);
		else
			this.handleCollision();
	}

	private handleCollision(): void {
		for (let dx = -2; dx < 2; ++dx) {
			for (let dy = -2; dy < 2; ++dy) {
				if (Block.shapes[this.currentBlock.shape][this.currentBlock.rotation][dx+2][dy+2] != 0)
				{
					if (this.currentBlock.x + dx < 0 ||
						this.currentBlock.x + dx >= Config.width ||
						this.currentBlock.y + dy < 0)
						continue;
					
					if (this.currentBlock.y + dy >= Config.height) {
						this.gameOver();
						continue;
					}								
					
					this.changeBlock(this.currentBlock.x+dx, this.currentBlock.y+dy, this.currentBlock.color + 4);
				}
			}
		}

		this.currentBlock.shape = -1;
		if (!this.isGameOver)
			this.score += 10;
	}

	private gameOver(): void {
		this.isGameOver = true;
		this.updateHighscore();
		this.gameOverText.setText("GAME OVER");
		this.restartText.setText("Press ENTER to restart");
	}

	private isBlockCollide(x: number, y: number, shape: number, rotation: number): boolean
	{
		if (rotation > 3) 
			rotation = 0;

		for (let dx = -2; dx < 2; ++dx) {
			for (let dy = -2; dy < 2; ++dy) {
				if (Block.shapes[shape][rotation][dx+2][dy+2] == 0)
					continue;
				
				// check if outside
				if (x + dx < 0 ||
					x + dx > Config.width - 1 ||
					y + dy < 0)
					return true;
				
				// check if collide to already existing blocks
				if (y + dy < Config.height && this.gameArea[x + dx][y + dy] != -1)
					return true;
			}
		}
		return false;
	}	

	private tryRemoveFullRows(): void {
		let completeRowCount = 0;
		for (let y = 0; y < Config.height; ++y)
		{
			let isRowComplete = true;
			for (let x = 0; x < Config.width; ++x)
			{
				if (this.gameArea[x][y] == -1)
					isRowComplete = false;
			}
			if (!isRowComplete)
				continue;
			
			++completeRowCount;

			// move rows down
			for (let iy = y; iy < Config.height; ++iy) {
				for (let  ix = 0; ix < Config.width; ++ix) {
					if (iy == Config.height - 1)
						this.changeBlock(ix, iy, -1);
					else
						this.changeBlock(ix, iy, this.gameArea[ix][iy+1]);
				}
			}
		}

		if (completeRowCount == 1)
			this.score += 100;
		else if (completeRowCount == 2)
			this.score += 300;
		else if (completeRowCount == 3)
			this.score += 600;
		else if (completeRowCount >= 4)
			this.score += 1000;
	}

	private changeBlock(x: number, y: number, changeTo: number) {
		this.gameArea[x][y] = changeTo;
		if (changeTo == -1)
			this.layer.putTileAt(Config.emptyBlockIx, x + 1, Config.height - y - 1);
		else
			this.layer.putTileAt(changeTo, x + 1, Config.height - y - 1);
	}

	private loadHighscore(): void {
		// TODO: load score from save file
	}

	private updateHighscore(): void {
		if (this.highscore < this.score) {
			this.highscore = this.score;
			this.highscoreText.setText("HI-SCORE\n" + this.highscore);
		}
	}	
}
