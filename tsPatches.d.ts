export {};
declare global {
	interface ObjectConstructor {
		fromEntries<K extends PropertyKey, T = any>(entries: Iterable<readonly [K, T]>): { [Key in K]: T; };
		entries<K extends string, T>(o: Record<K, T>): [K, T][];
		entries<K extends string, T>(o: Partial<Record<K, T>>): [K, T][];
	}
	interface Array<T> {
		map<U extends any[], This extends readonly unknown[]>(this: This, callbackfn: (value: T, index: number, array: This) => [...U]): { [K in keyof This]: K extends number | `${number}`? U : never };
		map<U, This extends readonly unknown[]>(this: This, callbackfn: (value: T, index: number, array: This) => U): { [K in keyof This]: K extends number | `${number}`? U : never };
	}
	interface Function {
		bind<This, NewThis>(this: This, thisArg: NewThis): This;
		bind<This, NewThis, A extends any[]>(this: This, thisArg: NewThis, ...argArray: A): This extends (this: NewThis, ...args: [...A, ...infer B]) => infer C? (...args: B) => C : never;
	}
}