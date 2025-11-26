import { HTMLAttributes } from "preact";
import Piece from "../lib/Piece";
import { pieceKanjis } from "../lib/pieceData";
import { joinClasses } from "../lib/utils";
import { Player } from "../types/TaikyokuShogi";
import styles from "./ShogiPiece.module.css";

export default function ShogiPiece({
	piece,
	...props
}: {
	piece: Piece
} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "className">) {
	const kanji = getPieceKanji(piece);
	return (
		<span
			className={joinClasses(
				styles.piece,
				piece.promoted && styles.promoted,
				kanji.length == 1 && styles.singleKanji,
				kanji.length == 2 && styles.doubleKanji,
				kanji.length > 2 && styles.tripleKanji,
				piece.owner == Player.Sente? styles.sente : styles.gote,
			)}
			{...props}
		>
			<span>
				{kanji}
			</span>
		</span>
	)
}

function getPieceKanji(piece: Piece) {
	if(piece.owner == Player.Sente && piece.species == "K" && !piece.promoted) {
		return "玉将";
	} else if(piece.species == "GLG" && piece.promotedFrom == "P") {
		return "と金";
	} else {
		return pieceKanjis.get(piece.species);
	}
}