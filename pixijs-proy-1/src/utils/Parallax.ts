import type { TilingSprite } from "pixi.js";
import { Container } from "pixi.js";

export class Parallax extends Container {
	private backgrounds: Array<{ sprite: TilingSprite; speed: number }> = [];

	constructor(imgs: Array<{ sprite: TilingSprite; speed: number }>) {
		super();

		for (let i = 0; i < imgs.length; i++) {
			const bg = imgs[i].sprite;
			bg.width = 1920;
			bg.height = 720;
			bg.position.set(0, 0);
			this.backgrounds.push({ sprite: bg, speed: imgs[i].speed });
			this.addChild(bg);
		}
	}

	public update(dt: number): void {
		for (const bg of this.backgrounds) {
			bg.sprite.tilePosition.x -= bg.speed * dt;
		}
	}
}
