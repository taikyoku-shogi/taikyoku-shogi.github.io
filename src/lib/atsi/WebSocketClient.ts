import type { Client, MsgFunc } from "./atsi";

type EventFunc = (ws: WebSocketClient) => void;

export default class WebSocketClient implements Client {
	readonly url: string;
	connected: boolean = false;
	#ws: WebSocket;
	
	messageHost?: MsgFunc;
	
	constructor(url: string, onConnect: EventFunc, onClose: EventFunc) {
		this.url = url;
		
		this.#ws = new WebSocket(url);
		this.#ws.addEventListener("open", () => {
			console.log(`Established WebSocket connection to engine at ${this.url}`);
			console.log(this.#ws)
			this.connected = true;
			onConnect(this);
		});
		this.#ws.addEventListener("close", () => {
			console.log(`WebSocket connection to engine at ${this.url} was closed`);
			this.connected = false;
			onClose(this);
		});
		this.#ws.addEventListener("error", e => {
			console.error(`Error with WebSocket connection to engine at ${this.url}:`, e);
			this.connected = false;
			onClose(this);
		});
		this.#ws.addEventListener("message", e => {
			this.messageHost?.(e.data);
		});
	}
	sendMessage(message: string) {
		this.#ws.send(message); // it's that easy
	}
}