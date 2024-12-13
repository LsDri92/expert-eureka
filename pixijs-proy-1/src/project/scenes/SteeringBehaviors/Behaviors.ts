import { Point } from "@pixi/core";

/**
 * Representa un boid (entidad de simulación de comportamiento de enjambre).
 */
export interface IBoid {
	/** Posición actual del boid en el espacio. */
	posi: Point;

	/** Velocidad actual del boid. */
	velocity: Point;

	/** Velocidad máxima permitida para el boid. */
	maxSpeed: number;

	/** Método para actualizar el estado del boid según el delta de tiempo. */
	update(delta: number): void;
}

/**
 * Limita un vector a una magnitud máxima.
 *
 * @param vector - El vector a limitar.
 * @param max - La magnitud máxima permitida.
 * @returns Un nuevo vector con la magnitud ajustada.
 */
export function limitVector(vector: Point, max: number): Point {
	const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
	if (length > max) {
		return new Point((vector.x / length) * max, (vector.y / length) * max);
	}
	return vector;
}

/**
 * Genera una fuerza para que un boid persiga un objetivo.
 *
 * @param boid - El boid que ejecutará el comportamiento.
 * @param target - El punto objetivo a alcanzar.
 * @returns Un vector de fuerza para mover el boid hacia el objetivo.
 */
export function seek(boid: IBoid, target: Point): Point {
	const desired = new Point(target.x - boid.posi.x, target.y - boid.posi.y);
	const desiredNormalized = limitVector(desired, boid.maxSpeed);
	const steering = new Point(desiredNormalized.x - boid.velocity.x, desiredNormalized.y - boid.velocity.y);
	return limitVector(steering, boid.maxSpeed);
}

/**
 * Genera una fuerza para que un boid se aleje de una amenaza.
 *
 * @param boid - El boid que ejecutará el comportamiento.
 * @param threat - El punto que representa la amenaza.
 * @returns Un vector de fuerza para alejar al boid de la amenaza.
 */
export function flee(boid: IBoid, threat: Point): Point {
	const desired = new Point(boid.posi.x - threat.x, boid.posi.y - threat.y);
	const desiredNormalized = limitVector(desired, boid.maxSpeed);
	const steering = new Point(desiredNormalized.x - boid.velocity.x, desiredNormalized.y - boid.velocity.y);
	return limitVector(steering, boid.maxSpeed);
}

/**
 * Genera una fuerza para que un boid llegue a un objetivo, desacelerando al acercarse.
 *
 * @param boid - El boid que ejecutará el comportamiento.
 * @param target - El punto objetivo a alcanzar.
 * @param slowingRadius - El radio en el que comienza a desacelerar.
 * @returns Un vector de fuerza para mover el boid hacia el objetivo.
 */
export function arrive(boid: IBoid, target: Point, slowingRadius: number): Point {
	const desired = new Point(target.x - boid.posi.x, target.y - boid.posi.y);
	const distance = Math.sqrt(desired.x ** 2 + desired.y ** 2);

	let speed = boid.maxSpeed;
	if (distance < slowingRadius) {
		speed *= distance / slowingRadius;
	}

	const desiredNormalized = limitVector(desired, speed);
	const steering = new Point(desiredNormalized.x - boid.velocity.x, desiredNormalized.y - boid.velocity.y);
	return limitVector(steering, boid.maxSpeed);
}

/**
 * Genera una fuerza para que un boid deambule de forma aleatoria.
 *
 * @param boid - El boid que ejecutará el comportamiento.
 * @param wanderRadius - El radio de exploración aleatoria.
 * @param wanderDistance - La distancia desde el boid donde ocurre el deambular.
 * @param wanderJitter - El rango de variación aleatoria.
 * @returns Un vector de fuerza para generar el deambular.
 */
export function wander(boid: IBoid, wanderRadius: number, wanderDistance: number, wanderJitter: number): Point {
	if (!boid.velocity) {
		boid.velocity = new Point(0, 0); // Asignar velocidad inicial si no está definida
	}

	const circleCenter = limitVector(boid.velocity, wanderDistance);
	const displacement = new Point((Math.random() - 0.5) * wanderJitter, (Math.random() - 0.5) * wanderJitter);

	displacement.x *= wanderRadius;
	displacement.y *= wanderRadius;

	const wanderForce = new Point(circleCenter.x + displacement.x, circleCenter.y + displacement.y);
	return limitVector(wanderForce, boid.maxSpeed);
}

/**
 * Genera una fuerza para que un boid siga a un líder mientras evita colisiones y mantiene separación con otros boids.
 *
 * @param boid - El boid que ejecutará el comportamiento.
 * @param leader - El boid líder a seguir.
 * @param followDistance - La distancia deseada para seguir al líder.
 * @param separationDistance - La distancia mínima de separación entre boids.
 * @param allBoids - Lista de todos los boids en la simulación.
 * @returns Un vector de fuerza para seguir al líder.
 */
export function leaderFollow(boid: IBoid, leader: IBoid, followDistance: number, separationDistance: number, allBoids: IBoid[]): Point {
	const leaderVelocityNormalized =
		leader.velocity.x === 0 && leader.velocity.y === 0
			? new Point(1, 0) 
			: limitVector(leader.velocity, 1);
	const followTarget = new Point(leader.posi.x - leaderVelocityNormalized.x * followDistance, leader.posi.y - leaderVelocityNormalized.y * followDistance);

	const seekForce = seek(boid, followTarget);
	const fleeForce = flee(boid, leader.posi);

	let separationForce = new Point(0, 0);
	for (const other of allBoids) {
		if (other !== boid) {
			const distance = Math.sqrt((other.posi.x - boid.posi.x) ** 2 + (other.posi.y - boid.posi.y) ** 2);

			if (distance < separationDistance) {
				const diff = new Point(boid.posi.x - other.posi.x, boid.posi.y - other.posi.y);
				const scale = 1 - distance / separationDistance;
				const scaledDiff = limitVector(diff, scale);

				separationForce.x += scaledDiff.x;
				separationForce.y += scaledDiff.y;
			}
		}
	}
	separationForce = limitVector(separationForce, boid.maxSpeed);

	const combinedForce = new Point(seekForce.x * 1.2 + fleeForce.x * 0.5 + separationForce.x * 2, seekForce.y * 1.2 + fleeForce.y * 0.5 + separationForce.y * 2);
	return limitVector(combinedForce, boid.maxSpeed);
}
