import { Vec2 } from "../types/TaikyokuShogi";

export function add(a: Vec2, b: Vec2): Vec2 {
	return [a[0] + b[0], a[1] + b[1]];
}
export function sub(a: Vec2, b: Vec2): Vec2 {
	return [a[0] - b[0], a[1] - b[1]];
}
export function neg(a: Vec2): Vec2 {
	return [-a[0], -a[1]];
}
export function sign(v: Vec2): Vec2 {
	return [Math.sign(v[0]), Math.sign(v[1])];
}
export function dotProduct(a: Vec2, b: Vec2): number {
	return a[0] * b[0] + a[1] * b[1];
}
export function copy(v: Vec2): Vec2 {
	return [v[0], v[1]];
}
export function equals(a: Vec2, b: Vec2): boolean {
	return a[0] == b[0] && a[1] == b[1];
}
export function stringify(v: Vec2) {
	return `(${v[0]}, ${v[1]})`;
}
export function isWithinBounds([x, y]: Vec2, [minX, minY]: Vec2, [maxX, maxY]: Vec2): boolean {
	return x >= minX && x < maxX && y >= minY && y < maxY;
}

export class Set {
	#values: [number, number][] = [];
	#val0s: Map<number, Map<number, number>> = new Map();
	#bounds?: [Vec2, Vec2];
	constructor(values: Iterable<[number, number]> = [], { bounds }: { bounds?: [Vec2, Vec2] } = {}) {
		[...values].forEach(value => this.add(value));
		this.#bounds = bounds;
	}
	/**
	 * Adds a value and returns the index of it in the set.
	 */
	add(value: [number, number]): number {
		if(this.#bounds && !isWithinBounds(value, this.#bounds[0], this.#bounds[1])) {
			return;
		}
		let val1s = this.#val0s.get(value[0]);
		if(!val1s) {
			val1s = new Map();
			this.#val0s.set(value[0], val1s);
		}
		if(val1s.has(value[1])) {
			return val1s.get(value[1])!;
		}
		val1s.set(value[1], this.#values.length);
		this.#values.push(value);
		return this.#values.length - 1;
	}
	has(value: [number, number]): boolean {
		return !!this.#val0s.get(value[0])?.has(value[1]);
	}
	get values() {
		return this.#values;
	}
}