import { initialPieceCounts, pieceNames, piecePromotionReverseLookups, piecesInitiallyOnBoard } from "../lib/pieceData";
import { PieceEntry } from "../types/pieces.csv";
import { PieceSpecies } from "../types/TaikyokuShogi";
import Kanji from "./Kanji";
import styles from "./PieceInfo.module.css";
import PieceMovementDiagram from "./PieceMovementDiagram";

export default function PieceInfo({
	pieceEntry: pieceEntry
}: {
	pieceEntry: PieceEntry
}) {
	const initiallyOnBoard = piecesInitiallyOnBoard.has(pieceEntry.code);
	const initialCount = initialPieceCounts.get(pieceEntry.code);
	const promotedFrom = piecePromotionReverseLookups.get(pieceEntry.code);
	
	return (
		<div className={styles.pieceInfo} id={pieceEntry.code}>
			<h3>{pieceEntry.name} (<Kanji>{pieceEntry.kanji}</Kanji>)</h3>
			{promotedFrom && (
				<p>Promoted from: {promotedFrom.map((piece, i) => (
					<>
						<LinkToPiece piece={piece}/>
						{i < promotedFrom.length - 1 && ", "}
					</>
				))}</p>
			)}
			{pieceEntry.promotion != "-"? (
				<p>Promotes to: <LinkToPiece piece={pieceEntry.promotion}/></p>
			) : (
				<p><i>Doesn't promote.</i></p>
			)}
			{initiallyOnBoard? (
				<p>Each player starts with {initialCount} of this piece.</p>
			) : (
				<p><i>This piece only appears through promotion.</i></p>
			)}
			<PieceMovementDiagram pieceEntry={pieceEntry}/>
		</div>
	);
}

function LinkToPiece({
	piece
}: {
	piece: PieceSpecies
}) {
	return (
		<a href={`#${piece}`}>
			{pieceNames.get(piece)}
		</a>
	);
}