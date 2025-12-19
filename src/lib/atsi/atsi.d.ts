export type MsgFunc = (message: string) => void;
export interface Client {
	/** Sends a message to the client. */
	sendMessage: MsgFunc;
	/** Sends a message to the game host. */
	messageHost?: MsgFunc;
}
export interface GameSettings {
	timeControls: [number, number],
	/** TSFEN string */
	initialPosition?: string
}