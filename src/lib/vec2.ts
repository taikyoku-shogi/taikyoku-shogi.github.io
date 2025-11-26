import { Vec2 } from "../types/TaikyokuShogi";

export function add(a: Vec2, b: Vec2): Vec2 {
	return [a[0] + b[0], a[1] + b[1]];
}
export function sub(a: Vec2, b: Vec2): Vec2 {
	return [a[0] - b[0], a[1] - b[1]];
}
export function sign(v: Vec2): Vec2 {
	return [Math.sign(v[0]), Math.sign(v[1])];
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