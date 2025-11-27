import { memo } from "preact/compat";

import ShogiPiece from "./ShogiPiece";
import Piece from "../lib/Piece";

export default memo(function BoardSquare({
	x,
	y,
	piece,
	className
}: {
	x: number,
	y: number,
	piece: Piece | null,
	className: string
}) {
	return (
		<div
			className={className}
			data-x={x}
			data-y={y}
		>
			{piece && <ShogiPiece
				piece={piece}
			/>}
		</div>
	);
});