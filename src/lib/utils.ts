import { useCallback, useState } from "preact/hooks";
import { Tuple } from "../types/meta";

export function range(n: number, b?: number): number[] {
	if(b === undefined)	{
		return Array.from({ length: n }, (_, i) => i);
	}
	return Array.from({ length: b - n }, (_, i) => i + n);
}
export function create2dArray<W extends number, H extends number, T>(w: W, h: H, value?: T): Tuple<Tuple<T, H>, W> {
	return Array.from({ length: w }, () => Array.from( { length: h }, () => value)) as Tuple<Tuple<T, H>, W>;
}
export function create36x36<T>(value?: T): Tuple<Tuple<T, 36>, 36> {
	return create2dArray(36, 36, value);
}
export function assert(condition: boolean, message: string) {
	if(!condition) {
		throw new Error(message);
	}
}
export function assertFail(message: string) {
	throw new Error(message);
}
export function joinClasses(...classes: any[]): string {
	return classes.filter(c => typeof c == "string").join(" ");
}
export function isNumber(x: any): x is number {
	return parseInt(x) === +x;
}
export function countItems<T>(arr: T[]): Map<T, number> {
	return arr.reduce((acc, item) => {
		acc.set(item, (acc.get(item) ?? 0) + 1);
		return acc;
	}, new Map<T, number>());
}