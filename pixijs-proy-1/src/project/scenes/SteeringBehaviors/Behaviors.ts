import { Point } from "@pixi/core";

export interface IBoid {
	posi: Point;

	velocity: Point;

	maxSpeed: number;

	update(delta: number): void;
}

export function limitVector(vector: Point, max: number): Point {
	const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
	if (length > max) {
		return new Point((vector.x / length) * max, (vector.y / length) * max);
	}
	return vector;
}

export function seek(boid: IBoid, target: Point): Point {
	const desired = new Point(target.x - boid.posi.x, target.y - boid.posi.y);
	const desiredNormalized = limitVector(desired, boid.maxSpeed);
	const steering = new Point(desiredNormalized.x - boid.velocity.x, desiredNormalized.y - boid.velocity.y);
	return limitVector(steering, boid.maxSpeed);
}

export function flee(boid: IBoid, threat: Point): Point {
	const desired = new Point(boid.posi.x - threat.x, boid.posi.y - threat.y);
	const desiredNormalized = limitVector(desired, boid.maxSpeed);
	const steering = new Point(desiredNormalized.x - boid.velocity.x, desiredNormalized.y - boid.velocity.y);
	return limitVector(steering, boid.maxSpeed);
}

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

export function wander(boid: IBoid, wanderRadius: number, wanderDistance: number, wanderJitter: number, screenWidth: number, screenHeight: number): Point {
	if (!boid.velocity) {
		boid.velocity = new Point(0, 0);
	}

	// Movimiento normal de wander
	const circleCenter = limitVector(boid.velocity, wanderDistance);
	const displacement = new Point((Math.random() - 0.5) * wanderJitter, (Math.random() - 0.5) * wanderJitter);

	displacement.x *= wanderRadius;
	displacement.y *= wanderRadius;

	let wanderForce = new Point(circleCenter.x + displacement.x, circleCenter.y + displacement.y);
	wanderForce = limitVector(wanderForce, boid.maxSpeed);

	// Limitar al tamaño de la pantalla
	const futurePosition = new Point(boid.posi.x + wanderForce.x, boid.posi.y + wanderForce.y);

	if (futurePosition.x < 0 || futurePosition.x > screenWidth) {
		wanderForce.x = -wanderForce.x; // Invierte la dirección horizontal si está fuera de los límites
	}

	if (futurePosition.y < 0 || futurePosition.y > screenHeight) {
		wanderForce.y = -wanderForce.y; // Invierte la dirección vertical si está fuera de los límites
	}

	return wanderForce;
}

export function leaderFollow(boid: IBoid, leader: IBoid, followDistance: number, separationDistance: number, allBoids: IBoid[], alwaysBehind: boolean = false): Point {
	// Normalizar la velocidad del líder
	const leaderVelocityNormalized = leader.velocity.x === 0 && leader.velocity.y === 0 ? new Point(1, 0) : limitVector(leader.velocity, 1);

	// Calcular la posición objetivo para seguir al líder
	let followTarget: Point;
	if (alwaysBehind) {
		// Mantener siempre detrás del líder
		followTarget = new Point(leader.posi.x - leaderVelocityNormalized.x * followDistance, leader.posi.y - leaderVelocityNormalized.y * followDistance);
	} else {
		// Posición relativa por defecto
		followTarget = new Point(leader.posi.x - leaderVelocityNormalized.x * followDistance, leader.posi.y - leaderVelocityNormalized.y * followDistance);
	}

	// Fuerzas de comportamiento
	const seekForce = seek(boid, followTarget);
	const fleeForce = flee(boid, leader.posi);

	// Separación entre boids
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

	// Combinar todas las fuerzas
	const combinedForce = new Point(seekForce.x * 1.2 + fleeForce.x * 0.5 + separationForce.x * 2, seekForce.y * 1.2 + fleeForce.y * 0.5 + separationForce.y * 2);

	return limitVector(combinedForce, boid.maxSpeed);
}

export function orbitAndFollowLeader(boids: IBoid[], leader: IBoid, orbitRadius: number, angularSpeed: number, elapsedTime: number): void {
	const numBoids = boids.length;

	// Distribuir y actualizar los boids
	boids.forEach((boid, index) => {
		// Ángulo base y rotación dinámica
		const angleOffset = (2 * Math.PI * index) / numBoids;
		const currentAngle = angleOffset + angularSpeed * elapsedTime;

		// Posición objetivo en la circunferencia
		const targetX = leader.posi.x + Math.cos(currentAngle) * orbitRadius;
		const targetY = leader.posi.y + Math.sin(currentAngle) * orbitRadius;
		const targetPoint = new Point(targetX, targetY);

		// Calcular fuerza seek hacia el objetivo
		const seekForce = seek(boid, targetPoint);

		// Añadir movimiento del líder para seguirlo
		boid.velocity.x += seekForce.x + leader.velocity.x * 0.1;
		boid.velocity.y += seekForce.y + leader.velocity.y * 0.1;

		// Limitar la velocidad del boid a su máximo permitido
		boid.velocity = limitVector(boid.velocity, boid.maxSpeed);

		// Actualizar la posición del boid
		boid.posi.x += boid.velocity.x;
		boid.posi.y += boid.velocity.y;
	});
}
