import { Point } from "@pixi/core";
import { limitVector, type IBoid } from "./Behaviors";

export class Boid implements IBoid {
	public posi: Point;
	public velocity: Point;
	public maxSpeed: number;

	private acceleration: Point = new Point(0, 0);

	constructor(initialPosition: Point, maxSpeed = 5) {
		this.posi = initialPosition;
		this.velocity = new Point(Math.random() * 2 - 1, Math.random() * 2 - 1);
		this.maxSpeed = maxSpeed;
	}

	public applyForce(force: Point): void {
		this.acceleration.x += force.x;
		this.acceleration.y += force.y;
	}

	public update(delta: number): void {
		this.velocity.x += this.acceleration.x * delta;
		this.velocity.y += this.acceleration.y * delta;
		this.velocity = limitVector(this.velocity, this.maxSpeed);

		this.posi.x += this.velocity.x * delta;
		this.posi.y += this.velocity.y * delta;

		this.acceleration.set(0, 0); // Reset acceleration
	}
}
