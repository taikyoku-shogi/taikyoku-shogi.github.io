// @ts-expect-error
import piecesCsv from "../../assets/pieces.csv";
const pieceEntries: PieceEntries = piecesCsv;

import PieceInfo from "../../components/PieceInfo";
import type { PieceEntries } from "../../types/pieces.csv";
import { IguiMoveTd, JumpMoveTd, RangeAfterJumpMoveTd, RangeCaptureMoveTd, RangeMoveTd, StepAfterJumpMoveTd, StepAndCaptureMoveTd, StepMoveTd, TripleSlashedArrowJumpMoveTd } from "../../components/pieceMovementSymbols";
import SearchInput from "../../components/SearchInput";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
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
							<StepAfterJumpMoveTd/>
							<td>After making a jump marked by ☆, steps a limited number of squares along a straight line.</td>
						</tr>
						<tr>
							<RangeAfterJumpMoveTd x={0} y={1}/>
							<td rowSpan={4}>After making a jump marked by ☆, slides along a straight line.</td>
						</tr>
						<tr>
							<RangeAfterJumpMoveTd x={1} y={0}/>
						</tr>
						<tr>
							<RangeAfterJumpMoveTd x={1} y={-1}/>
						</tr>
						<tr>
							<RangeAfterJumpMoveTd x={1} y={1}/>
						</tr>
						<tr>
							<TripleSlashedArrowJumpMoveTd/>
							<td>Slides along a straight line, then jumps up to three squares in the same direction, then continues sliding.<br/>Pieces may stop moving after the first slide or after the jump.</td>
						</tr>
						<tr>
							<IguiMoveTd/>
							<td>Can move to or capture this square then immediately return in a single move, effectively staying put.<br/>Capturing without moving is known as <i>igui</i> (居食い, stationary feeding).<br/>Moving to an empty square then immediately returning can be used to pass a turn, which is known as <i>jitto</i> (じっと).</td>
						</tr>
						<tr>
							<StepAndCaptureMoveTd/>
							<td>Steps to this square and can capture a piece here before continuing with the rest of the compound move.</td>
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