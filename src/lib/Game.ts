import { BoardSquares, Move, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import Piece from "./Piece";
import { parseTsfen } from "./tsfen";
import { create36x36 } from "./utils";
import * as vec2 from "./vec2";

export default class Game {
	#squares: BoardSquares;
	#moveCounter: number;
	get moveCounter() {
		return this.#moveCounter;
	}
	
	constructor(startingLayout?: BoardSquares | string, moveCounter?: number) {
		if(startingLayout) {
			if(typeof startingLayout == "string") {
				[this.#squares, this.#moveCounter] = parseTsfen(startingLayout);
			} else {
				this.#squares = startingLayout;
				this.#moveCounter = moveCounter ?? 0;
			}
		} else {
			this.#squares = create36x36<Piece | null>(null);
			this.#moveCounter = 0;
		};
	}
	getSquare(pos: Vec2): Piece | null {
		return this.#squares[pos[0]]?.[pos[1]] ?? null;
	}
	setSquare(pos: Vec2, piece: Piece | null) {
		if(pos[0] < 0 || pos[0] > 35 || pos[1] < 0 || pos[1] > 35) {
			throw new Error(`Cannot set square at (${pos[0]}, ${pos[1]}) to ${piece?.species || "empty"}: Out of bounds`);
		}
		this.#squares[pos[0]][pos[1]] = piece;
	}
	makeMove(move: Move) {
		const movingPiece = this.getSquare(move.start);
		if(!movingPiece) {
			throw new Error(`Cannot make move: No piece at ${vec2.stringify(move.start)}`);
		}
		this.setSquare(move.end, movingPiece);
		this.setSquare(move.start, null);
		
		if(movingPiece.canPromote()) {
			const positionsToCheck = [move.end];
			if(move.intermediateSteps) {
				positionsToCheck.push(...move.intermediateSteps);
			}
			if(positionsToCheck.some(pos => 
				movingPiece.owner == Player.Gote && pos[1] > 24 || 
				movingPiece.owner == Player.Sente && pos[1] < 11
			)) {
				const promotedPiece = movingPiece.promote();
				this.setSquare(move.end, promotedPiece);
			}
		}
		
		if(movingPiece.isRangeCapturing()) {
			const movementDir = vec2.sign(vec2.sub(move.end, move.start));
			for(let pos = vec2.add(move.start, movementDir); !vec2.equals(pos, move.end); pos = vec2.add(pos, movementDir)) {
				this.setSquare(pos, null);
			}
		}
		move.intermediateSteps?.forEach(pos => {
			this.setSquare(pos, null);
		});
		this.#moveCounter++;
	}
	getCurrentPlayer(): Player {
		return this.moveCounter % 2 == 0? Player.Sente : Player.Gote;
	}
	countPieces(species: PieceSpecies, owner: Player): number {
		let count = 0;
		for(let y = 0; y < 36; y++) {
			for(let x = 0; x < 36; x++) {
				const piece = this.getSquare([x, y]);
				if(piece && piece.species == species && piece.owner == owner) {
					count++;
				}
			}
		}
		return count;
	}
}