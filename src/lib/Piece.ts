import { Move, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import Game from "./Game";
import { pieceMovementBetzaNotations, piecePromotions, rangeCapturingPieces } from "./pieceData";

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
		if(game.getCurrentPlayer() != this.owner) {
			return false;
		}
		const betza = pieceMovementBetzaNotations.get(this.species);
		// console.log(betza)
		if(pos[1] < 35) {
			const end: [number, number] = [pos[0],pos[1] + (game.getCurrentPlayer()? 1 : -1)];
			const pieceAhead = game.getSquare(end);
			if(!pieceAhead || pieceAhead.owner != this.owner) {
				return true;
			}
		}
		return false;
	}
	getMoves(pos: Vec2, game: Game): Move[] {
		if(game.getCurrentPlayer() != this.owner) {
			return [];
		}
		const betza = pieceMovementBetzaNotations.get(this.species);
		// console.log(betza)
		if(pos[1] < 35) {
			const end: [number, number] = [pos[0],pos[1] + (game.getCurrentPlayer()? 1 : -1)];
			const pieceAhead = game.getSquare(end);
			if(!pieceAhead || pieceAhead.owner != this.owner) {
				return [
					{
						start: pos,
						end
					}
				]
			}
		}
		return [];
	}
	isRangeCapturing(): boolean {
		return rangeCapturingPieces.has(this.species);
	}
}