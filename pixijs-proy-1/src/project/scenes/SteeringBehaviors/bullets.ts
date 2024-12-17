import type { Texture, Resource, Point } from "pixi.js";
import { AnimatedSprite, Graphics } from "pixi.js";
import { HitCircle } from "src/engine/collision/HitCircle";
import { PhysicsContainer } from "src/utils/PhysicsContainer";

export class Bullets extends PhysicsContainer {
	private bullet: AnimatedSprite;
	public bulletHit: HitCircle;

	constructor(bullet: Texture<Resource>[], spd: number, boidPosition: Point) {
		super();

		this.speed.x = spd;
		this.speed.y = 0;

		this.position.copyFrom(boidPosition);

		const aux = new Graphics();
		aux.beginFill(0xfff000, 0.8);
		aux.drawCircle(0, 0, 10);
		aux.endFill();

		this.bullet = new AnimatedSprite(bullet);
		this.bullet.anchor.set(0.5);
		this.bullet.play();

		this.bulletHit = new HitCircle(this.bullet.width / 20);
		this.bulletHit.position = this.bullet.position.clone();

		this.addChild(this.bullet, this.bulletHit, aux);
	}

	public override update(dt: number): void {
		super.update(dt);

		this.bulletHit.position.copyFrom(this.bullet.position);
	}

	public onHit(): void {
		this.destroy();
	}
}
