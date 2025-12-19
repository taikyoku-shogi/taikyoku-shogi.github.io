import { useEffect, useRef, useState } from "preact/hooks";
import Button from "./Button";
import WebSocketClient from "../lib/atsi/WebSocketClient";
import { Player } from "../types/TaikyokuShogi";

export default function EngineSelector({
	player,
	onConnect
}: {
	player: Player,
	onConnect?: (client: WebSocketClient) => void
}) {
	const [engineUrl, setEngineUrl] = useState("");
	const [connected, setConnected] = useState(false);
	const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
	const [error, setError] = useState(false);
	
	const engineUrlFormRef = useRef<HTMLFormElement | null>(null);
	useEffect(() => {
		const submitHandler = (e: SubmitEvent) => {
			e.preventDefault();
			setError(false);
			const formData = new FormData(engineUrlFormRef.current!);
			const engineUrl = formData.get("engineUrl") as string;
			setEngineUrl(engineUrl);
			if(engineUrl) {
				setWsClient(new WebSocketClient(engineUrl, wsClient => {
					setConnected(true);
					console.log(wsClient)
					onConnect?.(wsClient!);
				}, () => {
					setEngineUrl("");
					setError(true);
				}));
			}
		};
		engineUrlFormRef.current?.addEventListener("submit", submitHandler);
		
		return () => engineUrlFormRef.current?.removeEventListener("submit", submitHandler);
	}, [engineUrlFormRef.current]);
	
	return (
		<div>
			<h3>Player {player + 1}</h3>
			{engineUrl? connected? (
				<>
					<p>Connected to remote engine at <code>{engineUrl}</code></p>
					{/* <Button onLeftMouseDown={() => {
						setEngineUrl("");
						setConnected(false);
						setWsClient(null);
					}}>Disconnect</Button> */}
				</>
			) : (
				<>
					<p>Connecting....</p>
				</>
			) : (
				<>
					<p>Enter remote engine URL:</p>
					<form action="javascript:void(0)" ref={engineUrlFormRef}>
						<input type="text" placeholder="wss://server.com/engine" pattern="^wss?://.+" name="engineUrl"/>
					</form>
					{error && <p style={{color: "red"}}>Couldn't connect to remote engine.</p>}
				</>
			)}
		</div>
	);
}