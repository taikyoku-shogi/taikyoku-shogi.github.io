import { memo } from "preact/compat";

import ShogiPiece from "./ShogiPiece";
import Piece from "../lib/Piece";
import { HTMLAttributes } from "preact";

export default memo(function BoardSquare({
	piece,
	pieceClassName,
	...props
}: {
	piece: Piece | null,
	pieceClassName?: string | undefined,
} & HTMLAttributes<HTMLDivElement>) {
	return (
		<div {...props}>
			{piece && <ShogiPiece
				piece={piece}
				className={pieceClassName}
			/>}
		</div>
	);
});