import { Container, Graphics, Point, TilingSprite, Texture, Sprite } from "pixi.js";
import { PixiScene } from "src/engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "src/engine/utils/ScaleHelper";
import { orbitAndFollowLeader, wander } from "./Behaviors";
import { Boid } from "./Boids";
import { Parallax } from "src/utils/Parallax";
import { Bullets } from "./bullets";
import { Keyboard } from "src/engine/input/Keyboard";
import { Key } from "src/engine/input/Key";
import { Timer } from "src/engine/tweens/Timer";

export class BoidsScene extends PixiScene {
	public static BUNDLES = ["package-1"];
	private gameContainer: Container = new Container();
	private parallax: Parallax;
	private leaderBoid: Boid;
	private boids: Array<Boid> = [];
	private leaderGraph: Graphics;
	private boidsGraphics: Graphics[] = [];
	private boidsSprite: Sprite[] = [];
	private playerSprite: Sprite;
	private elapsedTime: number;

	private bullets: Bullets[];
	private canShoot: boolean = true;
	private bulletType: "1" | "2" | "3" | "4" = "1";

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
		this.playerSprite.scale.set(0.5);
		this.gameContainer.addChild(this.leaderGraph, this.playerSprite);

		for (let i = 0; i < this.boids.length; i++) {
			const boidGraph = new Graphics();
			boidGraph.beginFill(0x0000ff, 0.8);
			boidGraph.drawCircle(0, 0, 8);
			boidGraph.endFill();

			const enemy = Sprite.from("./img/engine/enemy-z.png");
			enemy.anchor.set(0.5);
			enemy.scale.x = -0.5;
			enemy.scale.y = 0.5;
			this.boidsSprite.push(enemy);
			this.boidsGraphics.push(boidGraph);
			this.gameContainer.addChild(boidGraph, enemy);
		}
		this.elapsedTime = 0;

		this.bullets = [];

		this.interactive = true;
		this.on("pointerdown", this.onShooting);
	}

	public override update(_dt: number): void {
		this.elapsedTime += _dt / 100;
		const wanderForce = wander(this.leaderBoid, 50, 50, 1, ScaleHelper.IDEAL_WIDTH - 200, ScaleHelper.IDEAL_HEIGHT - 200);
		this.leaderBoid.applyForce(wanderForce);
		this.leaderBoid.update(_dt / 60);

		this.parallax.update(_dt / 60);

		this.leaderGraph.position.copyFrom(this.leaderBoid.posi);
		this.playerSprite.position.copyFrom(this.leaderBoid.posi);

		orbitAndFollowLeader(this.boids, this.leaderBoid, 200, 0.1, this.elapsedTime);
		this.boids.forEach((follower, index) => {
			// follower.applyForce(followForce);
			// follower.update(_dt / 60);

			this.boidsGraphics[index].position.copyFrom(follower.posi);
			this.boidsSprite[index].position.copyFrom(follower.posi);
		});

		this.bullets.forEach((bullet, index) => {
			bullet.update(_dt);

			if (bullet.position.x > ScaleHelper.IDEAL_WIDTH || bullet.position.x < 0) {
				this.gameContainer.removeChild(bullet);
				this.bullets.splice(index, 1);
			}
		});

		if (Keyboard.shared.isDown("Space")) {
			this.onShooting();
		}

		if (Keyboard.shared.isDown(Key.KEY_1)) {
			this.bulletType = "1";
		}

		if (Keyboard.shared.isDown(Key.KEY_2)) {
			this.bulletType = "2";
		}
		if (Keyboard.shared.isDown(Key.KEY_3)) {
			this.bulletType = "3";
		}
	}

	private onShooting(): void {
		if (this.canShoot) {
			this.canShoot = false;

			switch (this.bulletType) {
				case "1":
					const singlebullet = new Bullets(
						[
							Texture.from("package-1/bullets/single/01.png"),
							Texture.from("package-1/bullets/single/02.png"),
							Texture.from("package-1/bullets/single/03.png"),
							Texture.from("package-1/bullets/single/04.png"),
							Texture.from("package-1/bullets/single/05.png"),
							Texture.from("package-1/bullets/single/06.png"),
							Texture.from("package-1/bullets/single/07.png"),
							Texture.from("package-1/bullets/single/08.png"),
							Texture.from("package-1/bullets/single/09.png"),
							Texture.from("package-1/bullets/single/10.png"),
						],
						0.5,
						this.boids[2].posi
					);
					singlebullet.scale.set(0.5, 0.5);
					this.gameContainer.addChild(singlebullet);
					this.bullets.push(singlebullet);

					Timer.delay(500, () => (this.canShoot = true));

					break;
				case "2":
					const largebullet = new Bullets(
						[
							Texture.from("package-1/bullets/single/11.png"),
							Texture.from("package-1/bullets/single/12.png"),
							Texture.from("package-1/bullets/single/13.png"),
							Texture.from("package-1/bullets/single/14.png"),
							Texture.from("package-1/bullets/single/15.png"),
							Texture.from("package-1/bullets/single/16.png"),
							Texture.from("package-1/bullets/single/17.png"),
							Texture.from("package-1/bullets/single/18.png"),
							Texture.from("package-1/bullets/single/19.png"),
							Texture.from("package-1/bullets/single/20.png"),
						],
						0.3,
						this.boids[4].posi
					);
					largebullet.scale.set(0.5, 0.5);

					this.gameContainer.addChild(largebullet);
					this.bullets.push(largebullet);

					Timer.delay(500, () => (this.canShoot = true));
					break;

				case "3":
					const smokebullet = new Bullets(
						[
							Texture.from("package-1/bullets/single/30.png"),
							Texture.from("package-1/bullets/single/31.png"),
							Texture.from("package-1/bullets/single/32.png"),
							Texture.from("package-1/bullets/single/33.png"),
							Texture.from("package-1/bullets/single/34.png"),
							Texture.from("package-1/bullets/single/35.png"),
							Texture.from("package-1/bullets/single/36.png"),
							Texture.from("package-1/bullets/single/37.png"),
							Texture.from("package-1/bullets/single/38.png"),
						],
						0.8,
						this.boids[0].posi
					);
					smokebullet.scale.set(0.5, 0.5);

					this.gameContainer.addChild(smokebullet);
					this.bullets.push(smokebullet);

					Timer.delay(500, () => {
						this.canShoot = true;
					});
					break;
			}
		}
	}

	public override onResize(_newW: number, _newH: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.gameContainer, _newW, _newH, 1, 1, ScaleHelper.FIT);
		ScaleHelper.setScaleRelativeToScreen(this.parallax, _newW, _newH, 1, 1, ScaleHelper.FILL);
		this.parallax.position.set(0, 0);
	}
}
