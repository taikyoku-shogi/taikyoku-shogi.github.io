import { PieceSpecies } from "../types/TaikyokuShogi";
import { initialPieceCounts, pieceKanjis, pieceNames, piecePromotionReverseLookups, piecePromotions, piecesInitiallyOnBoard } from "../lib/pieceData";
import Kanji from "./Kanji";
import styles from "./PieceInfo.module.css";
import PieceMovementDiagram from "./PieceMovementDiagram";
import { memo } from "preact/compat";

export default memo(function PieceInfo({
	pieceSpecies,
	onAnchorClick
}: {
	pieceSpecies: PieceSpecies,
	onAnchorClick?: (pieceSpecies: PieceSpecies) => void
}) {
	const initiallyOnBoard = piecesInitiallyOnBoard.has(pieceSpecies);
	const initialCount = initialPieceCounts.get(pieceSpecies);
	const promotedFrom = piecePromotionReverseLookups.get(pieceSpecies);
	
	const LinkToPiece = ({
		piece
	}: {
		piece: PieceSpecies
	}) => (
		<a href={`#${piece}`} onClick={onAnchorClick && (e => {
			onAnchorClick(piece);
			e.preventDefault();
		})}>
			{pieceNames.get(piece)}
		</a>
	);
	
	return (
		<div
			className={styles.pieceInfo}
			id={pieceSpecies}
		>
			<h3>{pieceNames.get(pieceSpecies)} (<Kanji>{pieceKanjis.get(pieceSpecies)!}</Kanji>)</h3>
			{promotedFrom && (
				<p>Promoted from: {promotedFrom.map((piece, i) => (
					<>
						<LinkToPiece piece={piece}/>
						{i < promotedFrom.length - 1 && ", "}
					</>
				))}</p>
			)}
			{piecePromotions.has(pieceSpecies)? (
				<p>Promotes to: <LinkToPiece piece={piecePromotions.get(pieceSpecies)!}/></p>
			) : (
				<p><i>Doesn't promote.</i></p>
			)}
			{initiallyOnBoard? (
				<p>Each player starts with {initialCount} of this piece.</p>
			) : (
				<p><i>This piece only appears through promotion.</i></p>
			)}
			<PieceMovementDiagram pieceSpecies={pieceSpecies}/>
		</div>
	);
});