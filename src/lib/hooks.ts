import { MutableRef, useCallback, useEffect, useRef, useState } from "preact/hooks";

export function useCounter(initial: number = 0): [number, () => void] {
	const [count, setCount] = useState(initial);
	const increment = useCallback(() => setCount(count + 1), []);
	return [count, increment];
}
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit): [MutableRef<T | null>, boolean] {
	const ref = useRef<T | null>(null);
	const [visible, setVisible] = useState(false);
	
	useEffect(() => {
		if(!ref.current) {
			return;
		}
		
		const observer = new IntersectionObserver(([entry]) => {
			setVisible(entry.isIntersecting);
		}, options);
		observer.observe(ref.current);
		
		return () => observer.disconnect();
	}, [visible]);
	
	return [ref, visible];
}