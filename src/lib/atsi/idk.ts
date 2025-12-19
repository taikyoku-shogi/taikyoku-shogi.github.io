import { Move, Player } from "../../types/TaikyokuShogi";
import { boardPosToVec } from "./atsiUtils";
import Game from "../Game";

const PROTOCOL_VERSION = "v0";

export default class WebSocketClient {
	readonly url: string;
	connected: boolean = false;
	#ws: WebSocket;
	
	constructor(url: string) {
		this.url = url;
		
		this.#ws = new WebSocket(url);
		this.#ws.addEventListener("open", () => {
			console.log(`Established WebSocket connection to engine at ${this.url}`);
			this.connected = true;
			this.#ws.send(`atsiinit ${PROTOCOL_VERSION}`);
		});
		this.#ws.addEventListener("close", () => {
			console.log(`WebSocket connection to engine at ${this.url} was closed`);
			this.connected = false;
			this.initialised = false;
		});
		this.#ws.addEventListener("error", e => {
			console.error(`Error with WebSocket connection to engine at ${this.url}:`, e);
			this.connected = false;
			this.initialised = false;
		});
		this.#ws.addEventListener("message", e => {
			const message: string = e.data;
			const args = message.split(" ").slice(1);
			if(message == "atsiok") {
				this.initialised = true;
				this.#ws.send("identify");
				this.#ws.send(`player ${this.player}`);
			}
			if(message == "info") {
				[this.name, this.description, this.version, this.author] = args;
			}
			if(message == "param") {
				const [paramName, paramType] = args;
				this.params.push([paramName, paramType]);
			}
			if(message == "move") {
				const startPos = args[0];
				const endPos = args.at(-1)!;
				const steps = args.slice(1, -1);
				const move: Move = {
					start: boardPosToVec(startPos),
					end: boardPosToVec(endPos),
					intermediateSteps: steps.map(step => boardPosToVec(step))
				};
				this.game.makeMove(move);
				this.onGameUpdate();
			}
			if(message == "resign") {
				this.game.resign(this.player);
			}
		});
	}
}