import { Tuple } from "../types/meta";

export function range(n: number, b?: number): number[] {
	if(b === undefined) {
		return Array.from({ length: n }, (_, i) => i);
	}
	return Array.from({ length: b - n }, (_, i) => i + n);
}
export function create2dArray<W extends number, H extends number, T>(w: W, h: H, value?: T): Tuple<Tuple<T, H>, W> {
	return Array.from({ length: w }, () => Array.from({ length: h }, () => value)) as Tuple<Tuple<T, H>, W>;
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
export function cacheUnaryFunc<T extends string | number | boolean, R>(f: (x: T) => R): (x: T) => Readonly<R> {
	const cache = new Map<T, R>();
	return x => {
		if(!cache.has(x)) {
			cache.set(x, f(x));
		}
		return cache.get(x)!;
	};
}
export class TwoWayNumericalMapping {
	#forwards: (Set<number> | null)[] = [];
	#backwards: (Set<number> | null)[] = [];
	
	set(a: number, b: number) {
		if(!this.#forwards[a]) this.#forwards[a] = new Set();
		this.#forwards[a]!.add(b);
		
		if(!this.#backwards[b]) this.#backwards[b] = new Set();
		this.#backwards[b]!.add(a);
	}
	delete(a: number, b: number) {
		const fwd = this.#forwards[a];
		if(fwd) {
			fwd.delete(b);
			if(fwd.size === 0) this.#forwards[a] = null;
		}
		
		const bwd = this.#backwards[b];
		if(bwd) {
			bwd.delete(a);
			if(bwd.size === 0) this.#backwards[b] = null;
		}
	}
	
	getForwards(a: number): Set<number> | null {
		return this.#forwards[a];
	}
	getBackwards(b: number): Set<number> | null {
		return this.#backwards[b];
	}
	
	setForwards(a: number, newBs: number[]) {
		const oldBs = this.#forwards[a] ?? new Set();
		const newBsSet = new Set(newBs);
		
		newBsSet.forEach(b => {
			if(!oldBs.has(b)) this.set(a, b);
		});
		
		oldBs.forEach(b => {
			if(!newBsSet.has(b)) this.delete(a, b);
		});
	}
	
	/* Unused methods
	setBackwards(b: number, newAs: number[]) {
		const oldAs = this.#backwards[b] ?? new Set();
		const newAsSet = new Set(newAs);
		
		newAsSet.forEach(a => {
			if(!oldAs.has(a)) this.set(a, b);
		});
		
		oldAs.forEach(a => {
			if(!newAsSet.has(a)) this.delete(a, b);
		});
	}
	
	deleteForwards(a: number) {
		this.#forwards[a]?.forEach(b => {
			this.delete(a, b);
		});
	}
	deleteBackwards(b: number) {
		this.#backwards[b]?.forEach(a => {
			this.delete(a, b);
		});
	}
	*/
}