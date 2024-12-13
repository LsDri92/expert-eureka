import { Container, Sprite, Graphics, Point } from "pixi.js";
import { PixiScene } from "src/engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "src/engine/utils/ScaleHelper";
import { wander, leaderFollow } from "./Behaviors";
import { Boid } from "./Boids";

export class BoidsScene extends PixiScene {
	public static readonly BUNDLES = ["big_placeholder"];
	private gameContainer: Container = new Container();
	private bg: Sprite;
	private leaderBoid: Boid;
	private boids: Array<Boid> = [];
	private leaderGraph: Graphics;
	private boidsGraphics: Graphics[] = [];

	constructor() {
		super();
		this.addChild(this.gameContainer);
		this.bg = Sprite.from("img/big_placeholder/background-1.jpg");
		this.bg.width = 1000;
		this.bg.height = 1000;
		this.gameContainer.addChild(this.bg);
		this.leaderBoid = new Boid(new Point(300, 300), 10);
		this.boids = [
			new Boid(new Point(200, 200), 5),
			new Boid(new Point(250, 250), 5),
			new Boid(new Point(220, 220), 5),
			new Boid(new Point(100, 100), 5),
			new Boid(new Point(150, 150), 5),
			new Boid(new Point(120, 120), 5),
		];
		// Líder
		this.leaderGraph = new Graphics();
		this.leaderGraph.beginFill(0xff0000, 0.8);
		this.leaderGraph.drawCircle(0, 0, 15);
		this.leaderGraph.endFill();
		this.gameContainer.addChild(this.leaderGraph);

		// Seguidores
		for (let i = 0; i < this.boids.length; i++) {
			const boidGraph = new Graphics();
			boidGraph.beginFill(0x0000ff, 0.8);
			boidGraph.drawCircle(0, 0, 8);
			boidGraph.endFill();
			this.boidsGraphics.push(boidGraph);
			this.gameContainer.addChild(boidGraph);
		}
	}

	public override update(_dt: number): void {
		const wanderForce = wander(this.leaderBoid, 500, 500, 1);
		this.leaderBoid.applyForce(wanderForce); // Aplica la fuerza de wander
		this.leaderBoid.update(_dt / 60);

		// Actualizar posición del líder
		this.leaderGraph.position.copyFrom(this.leaderBoid.posi);

		// Actualizar posiciones de los seguidores
		this.boids.forEach((follower, index) => {
			const followForce = leaderFollow(follower, this.leaderBoid, 50, 50, this.boids);
			follower.applyForce(followForce);
			follower.update(_dt / 60);

			// Renderiza el gráfico correspondiente
			this.boidsGraphics[index].position.copyFrom(follower.posi);
		});
	}

	public override onResize(_newW: number, _newH: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.gameContainer, _newW, _newH, 1, 1, ScaleHelper.FILL);
	}
}
