import { PieceEntry } from "../types/pieces.csv";
import { Move, PieceMovements, PieceMovementsOnlySlidesJumps, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import { directions } from "./betzaNotationParser";
import Game from "./Game";
import { pieceMovements, piecePromotions, pieceRanks, piecesInitiallyOnBoard, rangeCapturingPieces, royalPieces } from "./pieceData";
import { JSONSet } from "./utils";
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
	readonly isRoyal: boolean;
	
	readonly #movements: PieceMovements;
	
	constructor(species: PieceSpecies, promoted: boolean, owner: Player) {
		this.species = species;
		this.promoted = promoted;
		this.owner = owner;
		this.isRangeCapturing = rangeCapturingPieces.has(species);
		this.rank = pieceRanks.get(species) ?? 0;
		this.isRoyal = royalPieces.has(species);
		
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
		return this.#getMovesAndAttackingSquaresFromMovements(pos, game, this.#movements);
	}
	#getMovesAndAttackingSquaresFromMovements(pos: Vec2, game: Game, movements: PieceMovements | PieceMovementsOnlySlidesJumps, definitelyEmptySquare: Vec2 = [NaN, NaN]): [Move[], Vec2[]] {
		const attackingSquares = new vec2.Set([], {
			bounds: [[0, 0], [36, 36]]
		});
		const validMoveLocations = new vec2.Set();
		const validMoveLocationsWithintermediateSteps = new JSONSet<{ end: Vec2, intermediateSteps: Vec2[] }>();
		
		Object.entries(movements.slides).forEach(([dir, range]) => {
			const rawStep = directions[dir];
			const step = this.#movementDirToBoardDir(rawStep);
			let target = vec2.add(pos, step);
			for(let i = 0; i < range; i++) {
				if(!vec2.isWithinBounds(target, [0, 0], [36, 36])) {
					break;
				}
				const status = vec2.equals(definitelyEmptySquare, target)? SquareStatus.Empty : this.#getSquareStatus(game, target, this.isRangeCapturing && range == Infinity);
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
		movements.jumps.forEach(rawJump => {
			const jump = this.#movementDirToBoardDir(rawJump);
			const target = vec2.add(pos, jump);
			attackingSquares.add(target);
			if(this.#getSquareStatus(game, target) != SquareStatus.Blocked) {
				validMoveLocations.add(target);
			}
		});
		if("compoundMoves" in movements) {
			movements.compoundMoves.forEach(([mv1, mv2]) => {
				const move1s = this.#getMovesAndAttackingSquaresFromMovements(pos, game, mv1)[0];
				move1s.map(move1 => {
					if(!mv1.canContinueAfterCapture && this.#getSquareStatus(game, move1.end) != SquareStatus.Empty) {
						return;
					}
					const [moves, attacks] = this.#getMovesAndAttackingSquaresFromMovements(move1.end, game, mv2, pos);
					attacks.forEach(pos => attackingSquares.add(pos));
					if(mv1.canContinueAfterCapture) {
						moves.forEach(move => validMoveLocationsWithintermediateSteps.add({
							end: move.end,
							intermediateSteps: [move1.end]
						}));
					} else {
						moves.forEach(move => {
							if(move.intermediateSteps?.some(step => Game.isPosInPromotionZone(step, this.owner))) {
								validMoveLocationsWithintermediateSteps.add({
									end: move.end,
									intermediateSteps: [move1.end]
								});
							}
							validMoveLocations.add(move.end);
						});
					}
				});
			});
		}
		if("tripleSlashedArrowDirs" in movements) {
			movements.tripleSlashedArrowDirs.forEach(dir => {
				const rawStep = directions[dir];
				const step = this.#movementDirToBoardDir(rawStep);
				let jumpedOverPiecesCount = 0;
				for(let i = 0, target = vec2.add(pos, step); vec2.isWithinBounds(target, [0, 0], [36, 36]); i++, target = vec2.add(target, step)) {
					const status = this.#getSquareStatus(game, target);
					attackingSquares.add(target);
					if(status != SquareStatus.Blocked) {
						validMoveLocations.add(target);
					}
					if(status != SquareStatus.Empty) {
						if(jumpedOverPiecesCount == 3) {
							break;
						}
						jumpedOverPiecesCount++;
					}
				}
			});
		}
		
		const moves = [...validMoveLocations.values.map(end => ({
			start: pos,
			end
		})), ...[...validMoveLocationsWithintermediateSteps].map(move => ({
			start: pos,
			...move
		}))];
		
		return [moves, attackingSquares.values];
	}
	
	#movementDirToBoardDir(movement: Vec2): Vec2 {
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