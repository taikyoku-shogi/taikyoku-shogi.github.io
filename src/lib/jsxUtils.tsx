import { JSX } from "preact/jsx-runtime";

export function joinElements(els: JSX.Element[], joiner: JSX.Element | string = ", "): JSX.Element {
	return <>{els.flatMap((el, i) => [<>{i? joiner : ""}</>, el])}</>;
}