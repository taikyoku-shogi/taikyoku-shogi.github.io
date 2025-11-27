// @ts-expect-error
import piecesCsv from "../../assets/pieces.csv";
import PieceInfo from "../../components/PieceInfo";
import type { PieceEntries } from "../../types/pieces.csv";
import { JumpMoveTd, RangeMoveTd, StepMoveTd } from "../../components/pieceMovementSymbols";
const pieces: PieceEntries = piecesCsv;

export default function RulesPage() {
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
					</tbody>
				</table>
				<br/>
				{pieces.map(piece => <PieceInfo pieceEntry={piece}/>)}
			</section>
		</section>
	);
}