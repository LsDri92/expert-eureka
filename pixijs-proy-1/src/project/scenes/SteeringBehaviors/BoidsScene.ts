import { Container, Graphics, Point, TilingSprite, Texture, Sprite } from "pixi.js";
import { PixiScene } from "src/engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "src/engine/utils/ScaleHelper";
import { orbitAndFollowLeader, wander } from "./Behaviors";
import { Boid } from "./Boids";
import { Parallax } from "src/utils/Parallax";

export class BoidsScene extends PixiScene {
	// public static BUNDLES = ["engine"];
	private gameContainer: Container = new Container();
	private parallax: Parallax;
	private leaderBoid: Boid;
	private boids: Array<Boid> = [];
	private leaderGraph: Graphics;
	private boidsGraphics: Graphics[] = [];
	private boidsSprite: Sprite[] = [];
	private playerSprite: Sprite;
	private elapsedTime: number;

	constructor() {
		super();
		this.addChild(this.gameContainer);

		this.parallax = new Parallax([
			{ sprite: new TilingSprite(Texture.from("./img/forest_sky.png")), speed: 10.2 },
			{ sprite: new TilingSprite(Texture.from("./img/forest_mountain.png")), speed: 20 },
			{ sprite: new TilingSprite(Texture.from("./img/forest_moon.png")), speed: 0 },
			{ sprite: new TilingSprite(Texture.from("./img/forest_back.png")), speed: 20.8 },
			{ sprite: new TilingSprite(Texture.from("./img/forest_mid.png")), speed: 20.2 },
			{ sprite: new TilingSprite(Texture.from("./img/forest_short.png")), speed: 30.3 },
		]);
		this.gameContainer.addChild(this.parallax);

		// Líder y seguidores
		this.leaderBoid = new Boid(new Point(500, 500), 8);
		this.boids = [
			new Boid(new Point(0, 200), 5),
			new Boid(new Point(0, 250), 5),
			new Boid(new Point(0, 220), 5),
			new Boid(new Point(0, 100), 5),
			new Boid(new Point(0, 150), 5),
			new Boid(new Point(0, 120), 5),
		];

		// Líder
		this.leaderGraph = new Graphics();
		this.leaderGraph.beginFill(0xff0000, 0.8);
		this.leaderGraph.drawCircle(0, 0, 15);
		this.leaderGraph.endFill();
		this.playerSprite = Sprite.from("./img/engine/spaceship/0.png");
		this.playerSprite.anchor.set(0.5);
		this.gameContainer.addChild(this.leaderGraph, this.playerSprite);

		for (let i = 0; i < this.boids.length; i++) {
			const boidGraph = new Graphics();
			boidGraph.beginFill(0x0000ff, 0.8);
			boidGraph.drawCircle(0, 0, 8);
			boidGraph.endFill();

			const enemy = Sprite.from("./img/engine/enemy-z.png");
			enemy.anchor.set(0.5);
			enemy.scale.x = -1;
			this.boidsSprite.push(enemy);
			this.boidsGraphics.push(boidGraph);
			this.gameContainer.addChild(boidGraph, enemy);
		}
		this.elapsedTime = 0;
		this.elapsedTime;
	}

	public override update(_dt: number): void {
		this.elapsedTime += _dt / 100;
		const wanderForce = wander(this.leaderBoid, 50, 50, 1, ScaleHelper.IDEAL_WIDTH - 100, ScaleHelper.IDEAL_HEIGHT - 100);
		this.leaderBoid.applyForce(wanderForce);
		this.leaderBoid.update(_dt / 60);

		this.parallax.update(_dt / 60);

		this.leaderGraph.position.copyFrom(this.leaderBoid.posi);
		this.playerSprite.position.copyFrom(this.leaderBoid.posi);

		orbitAndFollowLeader(this.boids, this.leaderBoid, 250, 0.1, this.elapsedTime);
		this.boids.forEach((follower, index) => {
			// follower.applyForce(followForce);
			// follower.update(_dt / 60);

			this.boidsGraphics[index].position.copyFrom(follower.posi);
			this.boidsSprite[index].position.copyFrom(follower.posi);
		});
	}

	public override onResize(_newW: number, _newH: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.gameContainer, _newW, _newH, 1, 1, ScaleHelper.FIT);
		ScaleHelper.setScaleRelativeToScreen(this.parallax, _newW, _newH, 1, 1, ScaleHelper.FILL);
		this.parallax.position.set(0, 0);
	}
}
