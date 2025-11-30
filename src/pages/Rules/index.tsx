// @ts-expect-error
import piecesCsv from "../../assets/pieces.csv";
const pieceEntries: PieceEntries = piecesCsv;

import PieceInfo from "../../components/PieceInfo";
import type { PieceEntries } from "../../types/pieces.csv";
import { JumpMoveTd, RangeCaptureMoveTd, RangeMoveTd, StepMoveTd } from "../../components/pieceMovementSymbols";
import SearchInput from "../../components/SearchInput";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { joinClasses } from "../../lib/utils";
import styles from "./index.module.css";
import { PieceSpecies } from "../../types/TaikyokuShogi";

export default function RulesPage() {
	const searchInputRef = useRef<HTMLInputElement | null>(null);
	const [searchString, setSearchString] = useState("");
	
	const visiblePieceEntries = useMemo(() => searchString? pieceEntries.filter(piece => piece.name.toLocaleLowerCase().includes(searchString) || piece.kanji.includes(searchString)) : pieceEntries, [searchString]);
	const visiblePieces = new Set(visiblePieceEntries.map(piece => piece.code));
	
	const goToPieceInfo = useCallback((pieceSpecies: PieceSpecies) => {
		setSearchString("");
		searchInputRef.current!.value = "";
		// this must happen after it re-renders and the element is visible again
		queueMicrotask(() => location.hash = pieceSpecies);
	}, []);
	
	return (
		<section>
			<h1>Rules (WIP)</h1>
			<section>
				<h2>General</h2>
				@VinayR-GitHub please add these sometime
			</section>
			<section>
				<h2>Piece movements</h2>
				<h3>Movement legend</h3>
				<table>
					<thead>
						<tr>
							<th colSpan={2}>Movements</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<StepMoveTd/>
							<td>Steps a limited number of squares along a straight line.</td>
						</tr>
						<tr>
							<RangeMoveTd x={0} y={1}/>
							<td rowSpan={4}>Slides along a straight line.</td>
						</tr>
						<tr>
							<RangeMoveTd x={1} y={0}/>
						</tr>
						<tr>
							<RangeMoveTd x={1} y={-1}/>
						</tr>
						<tr>
							<RangeMoveTd x={1} y={1}/>
						</tr>
						<tr>
							<JumpMoveTd/>
							<td>Jumps directly to this square.</td>
						</tr>
						<tr>
							<RangeCaptureMoveTd x={0} y={1}/>
							<td rowSpan={4}>Flies along a straight line, capturing all pieces it jumps over.<br/>Pieces on the same team can also be captured if jumped over.<br/>All pieces captured must be of a lower rank.</td>
						</tr>
						<tr>
							<RangeCaptureMoveTd x={1} y={0}/>
						</tr>
						<tr>
							<RangeCaptureMoveTd x={1} y={-1}/>
						</tr>
						<tr>
							<RangeCaptureMoveTd x={1} y={1}/>
						</tr>
					</tbody>
				</table>
				<br/>
				<SearchInput
					ref={searchInputRef}
					onInput={e => {
						const searchString = (e.target as HTMLInputElement).value.trim().toLocaleLowerCase();
						setSearchString(searchString);
					}}
				/>
				<p className={styles.searchResultInfo}>
					{searchString? <>{visiblePieces.size || "No"} piece{visiblePieces.size != 1 && "s"} {!visiblePieces.size && "were"} found.</> : <>&nbsp;</>}
				</p>
				{pieceEntries.map(pieceEntry => (
					<div
						className={joinClasses(
							styles.pieceInfoWrapper,
							visiblePieces.has(pieceEntry.code) || "hidden"
						)}
					>
						<PieceInfo
							pieceSpecies={pieceEntry.code}
							onAnchorClick={goToPieceInfo}
						/>
					</div>
				))}
			</section>
		</section>
	);
}