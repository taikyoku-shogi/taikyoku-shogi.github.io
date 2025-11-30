import { HTMLAttributes } from "preact";
import Piece from "../lib/Piece";
import { pieceKanjis } from "../lib/pieceData";
import { joinClasses } from "../lib/utils";
import { Player } from "../types/TaikyokuShogi";
import styles from "./ShogiPiece.module.css";
import Kanji from "./Kanji";
import { kanjiStringLength } from "../lib/kanjiIds";

export default function ShogiPiece({
	piece,
	className = "",
	...props
}: {
	piece: Piece,
} & HTMLAttributes<HTMLSpanElement>) {
	const kanji = getPieceKanji(piece);
	const kanjiLength = kanjiStringLength(kanji);
	return (
		<span
			className={joinClasses(
				styles.piece,
				piece.promoted && styles.promoted,
				kanjiLength == 1 && styles.singleKanji,
				kanjiLength == 2 && styles.doubleKanji,
				kanjiLength == 3 && styles.tripleKanji,
				kanjiLength > 3 && function(){console.log('FAILFAILFAIL',kanji);return styles.singleKanji}(),
				piece.owner == Player.Sente? styles.sente : styles.gote,
				className
			)}
			{...props}
		>
			<span>
				<Kanji vertical>{kanji}</Kanji>
			</span>
		</span>
	)
}

function getPieceKanji(piece: Piece) {
	if(piece.owner == Player.Sente && piece.species == "K" && !piece.promoted) {
		return "玉将";
	} else if(piece.species == "GLG" && piece.promoted) {
		return "と金";
	} else {
		return pieceKanjis.get(piece.species)!
			.replaceAll("𠵇", "⿰口奇") // these pieces aren't in the fonts used so they have to be "constructed" from constituent characters
			.replaceAll("䳇", "⿰母鳥")
			.replaceAll("䳲", "⿱振鳥")
			.replaceAll("歬", "⿱止舟");
	}
}