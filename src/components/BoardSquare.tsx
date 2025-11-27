import { memo, useCallback } from "preact/compat";

import ShogiPiece from "./ShogiPiece";
import Piece from "../lib/Piece";

export default memo(function BoardSquare({
	x,
	y,
	piece,
	onClick,
	className
}: {
	x: number,
	y: number,
	piece: Piece | null,
	onClick?: (x: number, y: number) => void,
	className: string
}) {
	const handleClick = useCallback(() => {
		onClick?.(x, y);
	}, [onClick, x, y]);
	
	return (
		<div
			className={className}
			onMouseDown={handleClick} // touch moves hehehe
		>
			{piece && <ShogiPiece
				piece={piece}
			/>}
		</div>
	);
});