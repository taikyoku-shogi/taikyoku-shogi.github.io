import type { Tuple } from "../../types/meta";
import { GameStatus, Move, Player, Vec2 } from "../../types/TaikyokuShogi";
import { boardPosToVec } from "./atsiUtils";
import { directions } from "../betzaNotationParser";
import Game from "../Game";
import { pieceMovements } from "../pieceData";
import * as vec2 from "../vec2";
import type { Client, GameSettings, MsgFunc } from "./atsi";

const PROTOCOL_VERSION = "v0";

export default class GameHost {
	game: Game;
	readonly settings;
	readonly #rerenderGui: () => void;
	#clientOut: [MsgFunc | undefined, MsgFunc | undefined] = [undefined, undefined];
	#timeLeft: Vec2;
	#lastMoveTime: number = -1;
	
	#gameHasStarted = false;
	get gameHasStarted() {
		return this.#gameHasStarted;
	}
	
	#initialised: [boolean, boolean] = [false, false];
	
	#info: [Tuple<string | undefined, 5> | [], Tuple<string | undefined, 5> | []] = [[], []];
	
	constructor(game: Game, settings: GameSettings, rerenderGui: () => void) {
		this.game = game;
		this.settings = settings;
		this.#timeLeft = [settings.timeControls[0], settings.timeControls[0]];
		this.#rerenderGui = rerenderGui;
	}
	connectClient(client: Client, player: Player) {
		this.#clientOut[player] = (message: string) => [console.log(`Sending message to player ${player+1}:`, message), client.sendMessage(message)];
		client.messageHost = (message: string) => [console.log(`Received message from player ${player+1}:`, message), this.#handleMessage(message, player)];
		
		this.#clientOut[player](`atsiinit ${PROTOCOL_VERSION}`);
	}
	bothClientsAreInitialised(): boolean {
		return this.#initialised[0] && this.#initialised[1];
	}
	startGame() {
		if(!this.bothClientsAreInitialised()) {
			throw new Error("Cannot start game: Not all clients are initialised yet");
		}
		this.#clientOut[0]!(`startgame ${this.settings.initialPosition ?? "initial"}`);
		this.#clientOut[1]!(`startgame ${this.settings.initialPosition ?? "initial"}`);
		this.#lastMoveTime = performance.now();
		this.#gameHasStarted = true;
		this.#rerenderGui();
	}
	
	#handleMessage(message: string, client: Player) {
		const timeSinceLastMove = performance.now() - this.#lastMoveTime;
		
		if(!this.#initialised[client]) {
			if(message == "atsiok") {
				this.#clientOut[client]!(`player ${client}`);
				this.#clientOut[client]!(`time ${this.settings.timeControls.join(" ")}`);
				this.#initialised[client] = true;
				if(this.bothClientsAreInitialised()) {
					this.#rerenderGui();
					console.log("both initialised - rerendering")
				}
			} else {
				console.error(`Client ${client} error: Not yet initialised! Cannot send message "${message}"`);
			}
			return;
		}
		const [command, ...args] = message.split(" ");
		let resigned = false;
		switch(command) {
			case "info": {
				this.#info[client] = args.slice(0, 5) as Tuple<string, 5>;
			} break;
			case "param": {
				console.error(`Client ${client}: Parameters not yet implemented. Message: "${message}"`);
				return;
			}
			case "move": {
				try {
					if(client != this.game.getCurrentPlayer()) {
						throw new AtsiError("Cannot move piece: It's not your turn!");
					}
					
					const [startPos, endPos, steps] = extractMovePositions(args);
					
					this.#validateMove(startPos, endPos, steps);
					const move: Move = {
						start: startPos,
						end: endPos,
						intermediateSteps: steps ?? []
					};
					this.game.makeMove(move);
					
					this.#timeLeft[client] -= timeSinceLastMove / 1000;
					this.#timeLeft[client] += this.settings.timeControls[1];
					this.#lastMoveTime = performance.now();
					
					this.#clientOut[1 - client]!(`opmove ${args.join(" ")} ${this.#timeLeft[1 - client]} ${this.#timeLeft[client]}`);
				} catch(e) {
					// must be invalid!!!!
					console.error(e);
					this.game.resign(client);
					resigned = true;
				}
			} break;
			case "resign": {
				this.game.resign(client);
				resigned = true;
			} break;
			case "eval": {
				console.log(`Eval from client ${client + 1}: ${args[1]}`)
			} break;
			case "quit": {
				if(this.game.getStatus() == GameStatus.Playing) {
					this.game.resign(client);
					resigned = true;
				}
			} break;
			default: {
				console.error(`Unknown command: "${command}", "${message}"`);
			}
		}
		
		this.#rerenderGui();
		
		if(resigned) {
			this.#clientOut[0]?.(client == Player.Sente? "loss" : "win");
			this.#clientOut[1]?.(client == Player.Gote? "loss" : "win");
		}
	}
	#validateMove(startPos: Vec2, endPos: Vec2, steps: Vec2[]) {
		const movingPiece = this.game.getSquare(startPos);
		
		const CannotMovePieceError = (message: string) => new AtsiError(`Cannot move piece at ${vec2.stringify(startPos)}: ${message}`);
		if(!movingPiece) {
			throw CannotMovePieceError("Square is empty");
		}
		if(movingPiece.owner != this.game.getCurrentPlayer()) {
			throw CannotMovePieceError("Piece is on the wrong team!");
		}
		const allCapturePositions = [...steps];
		if(!steps.length) {
			allCapturePositions.push(endPos); // if there are intermediate steps (i.e. lion move), the end square will ofc be occupied
		}
		const capturesOwnPiece = allCapturePositions.some(pos => this.game.getSquare(pos)?.owner == movingPiece.owner);
		if(capturesOwnPiece && !movingPiece.isRangeCapturing) {
			throw CannotMovePieceError("Cannot capture your own piece!");
		}
		
		// this first check probably catches most things... but still....
		const targetSquares = this.game.getMovesAtSquare(startPos).map(move => move.end);
		if(!targetSquares.some(pos => vec2.equals(pos, endPos))) {
			throw CannotMovePieceError(`Impossible to move to ${vec2.stringify(endPos)}`);
		}
		
		const movements = pieceMovements.get(movingPiece.species)!;
		const deltaPosition = vec2.sub(endPos, startPos);
		
		if(movements.jumps.some(jump => vec2.equals(jump, deltaPosition))) {
			return;
		}
		const dirVec = vec2.sign(deltaPosition);
		const dirName = Object.entries(directions).filter(([dir]) => dir in movements.slides).find(([, vec]) => vec2.equals(vec, dirVec))?.[0];
		if(dirName) {
			if(movingPiece.isRangeCapturing) {
				return; // no checks for range capturing pieces
			}
			let [x, y] = vec2.add(startPos, dirVec);
			const threshold = movements.tripleSlashedArrowDirs.includes(dirName)? 3 : 0;
			let piecesInTheWay = 0;
			while(!vec2.equals([x, y], endPos)) {
				if(this.game.getSquare([x, y])) {
					piecesInTheWay++;
					if(piecesInTheWay > threshold) {
						if(threshold) {
							throw CannotMovePieceError(`There is a piece at ${vec2.stringify([x, y])} in the way of the slide in the direction ${dirName} (3 pieces have already been jumped over)!`);
						}
						throw CannotMovePieceError(`There is a piece at ${vec2.stringify([x, y])} in the way of the slide in the direction ${dirName}!`);
					}
				}
			}
		}
		return;
	}
}

function extractMovePositions(args: string[]): [Vec2, Vec2, Vec2[]] {
	try {
		const startPos = boardPosToVec(args[0]);
		const endPos = boardPosToVec(args.at(-1)!);
		const steps = args.slice(1, -1)?.map(boardPosToVec) ?? [];
		return [startPos, endPos, steps];
	} catch(e) {
		throw new AtsiError(`Incorrectly formatted move command. "${JSON.stringify(args)}", ${e}`);
	}
}

class AtsiError extends Error {
	constructor(message: string) {
		super();
		this.name = "AtsiError";
		this.message = message;
	}
}