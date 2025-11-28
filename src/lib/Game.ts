import { Move, PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi";
import Piece from "./Piece";
import { parseTsfen } from "./tsfen";
import { TwoWayNumericalMapping } from "./utils";
import * as vec2 from "./vec2";

export default class Game {
	readonly #squares: (Piece | null)[] = Array(1296).fill(null);;
	#moveCounter: number = 0;
	get moveCounter() {
		return this.#moveCounter;
	}
	
	readonly #moveCache: Move[][] = Array(1296).fill(null).map(() => []);
	readonly twoWayAttackMap: TwoWayNumericalMapping = new TwoWayNumericalMapping();
	
	constructor(initialState?: string) {
		if(initialState) {
			const [squares, moveCounter] = parseTsfen(initialState);
			squares.forEach((col, x) => {
				col.forEach((square, y) => {
					this.setSquare([x, y], square);
				});
			});
			this.#moveCounter = moveCounter;
		}
		// this.shuffle(3805);
	}
	getSquare(pos: Vec2): Piece | null {
		return this.#squares[this.posToI(pos)] ?? null;
	}
	setSquare(pos: Vec2, piece: Piece | null) {
		if(!vec2.isWithinBounds(pos, [0, 0], [36, 36])) {
			throw new Error(`Cannot set square at (${pos[0]}, ${pos[1]}) to ${piece?.species || "empty"}: Out of bounds`);
		}
		if(piece && this.getSquare(pos)) {
			this.setSquare(pos, null); // not the best...
		}
		const posI = this.posToI(pos);
		this.#squares[posI] = piece;
		
		this.twoWayAttackMap.getBackwards(posI)?.forEach(attackingPos => {
			this.#generateMovesAndAttacks(attackingPos);
		});
		this.#generateMovesAndAttacks(posI);
	}
	makeMove(move: Move) {
		const movingPiece = this.getSquare(move.start);
		if(!movingPiece) {
			throw new Error(`Cannot make move: No piece at ${vec2.stringify(move.start)}`);
		}
		this.setSquare(move.start, null);
		this.setSquare(move.end, movingPiece);
		
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
	pieceCanMove(piecePos: Vec2): boolean {
		return this.getMovesAtSquare(piecePos).length > 0;
	}
	pieceCanMoveDisregardingCurrentPlayer(piecePos: Vec2): boolean {
		return this.getMovesAtSquareDisregardingCurrentPlayer(piecePos).length > 0;
	}
	getMovesAtSquare(piecePos: Vec2): Move[] {
		const piece = this.getSquare(piecePos);
		if(piece?.owner != this.getCurrentPlayer()) {
			// important: don't remove this piece's moves from the cache if it's the other player's turn
			return [];
		}
		return this.getMovesAtSquareDisregardingCurrentPlayer(piecePos);
	}
	getMovesAtSquareDisregardingCurrentPlayer(piecePos: Vec2): Move[] {
		const cacheKey = this.posToI(piecePos);
		return this.#moveCache[cacheKey];
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
	shuffle(shuffles: number) {
		for(let i = 0; i < shuffles; i++) {
			const x1 = ~~(Math.random() * 36);
			const y1 = ~~(Math.random() * 36);
			const x2 = ~~(Math.random() * 36);
			const y2 = ~~(Math.random() * 36);
			const t = this.getSquare([x1, y1]);
			this.setSquare([x1, y1], this.getSquare([x2, y2]));
			this.setSquare([x2, y2], t);
		}
	}
	
	#generateMovesAndAttacks(posI: number) {
		const pos = this.iToPos(posI);
		const piece = this.getSquare(pos);
		const [moves, attacks] = piece?.getMovesAndAttackingSquares(pos, this) ?? [[], []];
		this.#moveCache[posI] = moves;
		this.twoWayAttackMap.setForwards(posI, attacks.map(attack => this.posToI(attack)));
		// console.log(`calculating moves/attacks for ${piece?.species ?? "[empty]"} at`, pos, moves, attacks);
	}
	
	posToI(pos: Vec2): number {
		return pos[0] * 36 + pos[1];
	}
	iToPos(i: number): Vec2 {
		return [~~(i / 36), i % 36];
	}
}