import { Move, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import { directions, parseBetzaNotation } from "./betzaNotationParser";
import Game from "./Game";
import { pieceMovementBetzaNotations, piecePromotions, rangeCapturingPieces } from "./pieceData";
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
	readonly promotedFrom: PieceSpecies | null;
	
	constructor(species: PieceSpecies, promoted: boolean, owner: Player, promotedFrom: PieceSpecies | null = null) {
		this.species = species;
		this.promoted = promoted;
		this.owner = owner;
		this.promotedFrom = promotedFrom;
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
		return new Piece(promotedSpecies, true, this.owner, this.species);
	}
	canMove(pos: Vec2, game: Game): boolean {
		return game.getCurrentPlayer() == this.owner;
		// return this.getMoves(pos, game).length > 0;
	}
	getMoves(pos: Vec2, game: Game): Move[] {
		if(game.getCurrentPlayer() != this.owner) {
			return [];
		}
		const betzaNotation = pieceMovementBetzaNotations.get(this.species)!;
		const movements = parseBetzaNotation(betzaNotation);
		
		const targetLocations = new vec2.Set();
		
		Object.entries(movements.slides).forEach(([dir, range]) => {
			const rawStep = directions[dir];
			const step: Vec2 = this.owner == Player.Sente? [rawStep[0], -rawStep[1]] : [-rawStep[0], rawStep[1]];
			let target = vec2.add(pos, step);
			for(let i = 0; i < range; i++) {
				const status = this.#getSquareStatus(game, target);
				if(status == SquareStatus.Blocked) {
					break;
				}
				targetLocations.add(target);
				if(status == SquareStatus.CanCapture) {
					break;
				}
				target = vec2.add(target, step);
			}
		});
		movements.jumps.forEach(jump => {
			if(this.#getSquareStatus(game, jump) != SquareStatus.Blocked) {
				targetLocations.add(jump);
			}
		});
		
		return targetLocations.values.map(end => ({
			start: pos,
			end
		}));
	}
	isRangeCapturing(): boolean {
		return rangeCapturingPieces.has(this.species);
	}
	
	#getSquareStatus(game: Game, square: Vec2): SquareStatus {
		if(square[0] < 0 || square[0] > 35 || square[1] < 0 || square[1] > 35) {
			return SquareStatus.Blocked;
		}
		const pieceAhead = game.getSquare(square);
		if(!pieceAhead) {
			return SquareStatus.Empty;
		}
		return pieceAhead.owner == this.owner? SquareStatus.Blocked : SquareStatus.CanCapture;
	}
}