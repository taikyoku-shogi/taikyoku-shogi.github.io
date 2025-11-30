import { PieceEntry } from "../types/pieces.csv";
import { Move, PieceMovements, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import { directions } from "./betzaNotationParser";
import Game from "./Game";
import { pieceMovements, piecePromotions, pieceRanks, piecesInitiallyOnBoard, rangeCapturingPieces } from "./pieceData";
import * as vec2 from "./vec2";

enum SquareStatus {
	Empty,
	CanCapture,
	Blocked
}

export default class Piece {
	readonly species: PieceSpecies;
	readonly promoted: boolean;
	readonly owner: Player;
	readonly isRangeCapturing: boolean;
	readonly rank: number;
	
	readonly #movements: PieceMovements;
	
	constructor(species: PieceSpecies, promoted: boolean, owner: Player) {
		this.species = species;
		this.promoted = promoted;
		this.owner = owner;
		this.isRangeCapturing = rangeCapturingPieces.has(species);
		this.rank = pieceRanks.get(species) ?? 0;
		
		this.#movements = pieceMovements.get(species)!;
	}
	static fromPieceEntry(pieceEntry: PieceEntry): Piece {
		return new Piece(pieceEntry.code, !piecesInitiallyOnBoard.has(pieceEntry.code), Player.Sente);
	}
	
	canPromote(): boolean {
		return !this.promoted && piecePromotions.has(this.species);
	}
	promote(): Piece {
		if(this.promoted) {
			throw new Error(`Cannot promote ${this.species}: Already promoted`);
		}
		if(!piecePromotions.has(this.species)) {
			throw new Error(`Cannot promote ${this.species}: Doesn't promote to anything`);
		}
		const promotedSpecies = piecePromotions.get(this.species)!;
		return new Piece(promotedSpecies, true, this.owner);
	}
	getMovesAndAttackingSquares(pos: Vec2, game: Game): [Move[], Vec2[]] {
		const attackingSquares = new vec2.Set();
		const validMoveLocations = new vec2.Set();
		
		Object.entries(this.#movements.slides).forEach(([dir, range]) => {
			const rawStep = directions[dir];
			const step = this.#movementPosToBoardPos(rawStep);
			let target = vec2.add(pos, step);
			for(let i = 0; i < range; i++) {
				if(!vec2.isWithinBounds(target, [0, 0], [36, 36])) {
					break;
				}
				const status = this.#getSquareStatus(game, target, this.isRangeCapturing && range == Infinity);
				attackingSquares.add(target);
				if(status != SquareStatus.Blocked) {
					validMoveLocations.add(target);
				}
				if(status != SquareStatus.Empty) {
					break;
				}
				target = vec2.add(target, step);
			}
		});
		this.#movements.jumps.forEach(rawJump => {
			const jump = this.#movementPosToBoardPos(rawJump);
			const target = vec2.add(pos, jump);
			attackingSquares.add(target);
			if(this.#getSquareStatus(game, target) != SquareStatus.Blocked) {
				validMoveLocations.add(target);
			}
		});
		
		const moves = validMoveLocations.values.map(end => ({
			start: pos,
			end
		}));
		
		return [moves, attackingSquares.values];
	}
	
	#movementPosToBoardPos(movement: Vec2): Vec2 {
		return this.owner == Player.Sente? [movement[0], -movement[1]] : [-movement[0], movement[1]];
	}
	#getSquareStatus(game: Game, square: Vec2, isRangeCapturingMove: boolean = false): SquareStatus {
		if(!vec2.isWithinBounds(square, [0, 0], [36, 36])) {
			return SquareStatus.Blocked;
		}
		const pieceAhead = game.getSquare(square);
		if(!pieceAhead || (isRangeCapturingMove && pieceAhead.rank < this.rank)) {
			return SquareStatus.Empty;
		}
		return pieceAhead.owner == this.owner || isRangeCapturingMove? SquareStatus.Blocked : SquareStatus.CanCapture;
	}
}