import { useEffect, useRef } from "preact/hooks";
import { pieceNames } from "../../lib/pieceData";
import { PieceSpecies } from "../../types/TaikyokuShogi";
import Content from "./index.mdx";

export default function AboutPage() {
	const sectionRef = useRef<HTMLElement | null>(null);
	
	useEffect(() => {
		const section = sectionRef.current!;
		const handleClick = (e: Event) => {
			const a = (e.target as HTMLElement).closest("a");
			if(a) {
				e.preventDefault();
				open(a.href, "_blank", "noreferrer");
			}
		}
		section.addEventListener("click", handleClick);
		
		return () => section.removeEventListener("click", handleClick);
	}, []);
	
	return (
		<section ref={sectionRef}>
			<Content/>
		</section>
	);
}

export function pieceName(pieceSpecies: PieceSpecies): string {
	return pieceNames.get(pieceSpecies)!.toLocaleLowerCase();
}