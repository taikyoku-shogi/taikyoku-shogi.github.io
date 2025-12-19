import Game from "../../lib/Game";
import { useMemo, useRef, useState } from "preact/hooks";
import { initialTsfen } from "../../lib/pieceData";
import { GameStatus, PieceSpecies, Player, Vec2 } from "../../types/TaikyokuShogi";
import ShogiBoard, { ShogiBoardHandle } from "../../components/ShogiBoard";

import pieceClickAudio from "../../assets/pieceClick.mp3";
import styles from "./index.module.css";
import { exportTsfen } from "../../lib/tsfen";
import PieceIndex, { PieceIndexHandle } from "../../components/PieceIndex";
import Button from "../../components/Button";
import { randomItem, swal } from "../../lib/utils";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";
import DownloadFileButton from "../../components/DownloadFileButton";
import FileInput from "../../components/FileInput";
import Swal from "sweetalert2";
import Piece from "../../lib/Piece";
import { useForceRerender, useToggle } from "../../lib/hooks";
import { useLocation } from "preact-iso";
import EngineSelector from "../../components/EngineSelector";
import GameHost from "../../lib/atsi/GameHost";

enum Gamemode {
	Pvp,
	Pvai,
	Aivp,
	Aivai
};

export default function PlayPage() {
	const [game, setGame] = useState(() => new Game(initialTsfen));
	
	const forceRerender = useForceRerender();
	const rerenderAll = () => {
		forceRerender();
		shogiBoardRef.current?.forceRerender();
	};
	
	const shogiBoardRef = useRef<ShogiBoardHandle | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const pieceIndexRef = useRef<PieceIndexHandle | null>(null);
	const tsfenTextboxRef = useRef<HTMLTextAreaElement | null>(null);
	const tsfenFileInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedSquare, setSelectedSquare] = useState<Vec2 | null>(null);
	
	const setPieceInfoPiece = (pieceSpecies: PieceSpecies) => {
		pieceIndexRef.current!.currentPiece = pieceSpecies;
	};
	const [bottomPlayer, setBottomPlayer] = useState(Player.Sente);
	
	const [destroyHax, toggleDestroyHax] = useToggle(false);
	const [creativeHax, toggleCreativeHax] = useToggle(false);
	const creativeHaxPromotedCheckboxRef = useRef<HTMLInputElement | null>(null);
	const creativeHaxPlayerDropdownRef = useRef<HTMLSelectElement | null>(null);
	const [debug, toggleDebug] = useToggle(false);
	
	// const [wsClients, setWsClients] = useState<[WebSocketClient | null, WebSocketClient | null]>([null, null]);
	
	const gameHost = useMemo(() => new GameHost(game, {
		timeControls: [900, 1]
	}, rerenderAll), [game]);
	
	const { path } = useLocation();
	
	const gamemode = path == "/play/pvp"? Gamemode.Pvp : path == "/play/pvai"? Gamemode.Pvai : path == "/play/aivp"? Gamemode.Aivp : path == "/play/aivai"? Gamemode.Aivai : null;
	
	return (
		<div class={styles.gameWrapper}>
			<audio
				ref={audioRef}
				src={pieceClickAudio}
			></audio>
			<div>
				<ShogiBoard
					ref={shogiBoardRef}
					game={game}
					bottomPlayer={bottomPlayer}
					interactive={path == "/play/pvp"}
					selectedSquare={selectedSquare}
					setSelectedSquare={selectedSquare => {
						setSelectedSquare(selectedSquare);
						const selectedPiece = selectedSquare && game.getSquare(selectedSquare);
						if(selectedPiece) {
							setPieceInfoPiece(selectedPiece.species);
						}
					}}
					onPieceHover={piece => {
						if(!selectedSquare && piece.species) {
							setPieceInfoPiece(piece.species);
						}
					}}
					onMove={() => audioRef.current!.play()}
					debug={debug}
					destroyHax={destroyHax}
					getCreativeHaxPiece={creativeHax? () => {
						const pieceSpecies = pieceIndexRef.current!.currentPiece;
						return pieceSpecies? new Piece(pieceSpecies, creativeHaxPromotedCheckboxRef.current!.checked, creativeHaxPlayerDropdownRef.current!.value == "Sente"? Player.Sente : Player.Gote) : null;
					} : null}
				/>
			</div>
			<div>
				<div class={styles.sidebar}>
					{gamemode !== null? (
						<>
							<h2>{getGamemodeName(gamemode)}</h2>
							{(gamemode == Gamemode.Aivp || gamemode == Gamemode.Aivai) && (
								<EngineSelector player={0} onConnect={client => {
									gameHost.connectClient(client, 0);
								}}/>
							)}
							{(gamemode == Gamemode.Pvai || gamemode == Gamemode.Aivai) && (
								<EngineSelector player={1} onConnect={client => {
									gameHost.connectClient(client, 1);
								}}/>
							)}
							{gameHost.bothClientsAreInitialised() && !gameHost.gameHasStarted && (
								<Button onLeftMouseDown={() => gameHost.startGame()}>Start game</Button>
							)}
							<p>Move {game.moveCounter}</p>
							<p>Player {game.getCurrentPlayer() + 1}'s turn</p>
							{game.getStatus() != GameStatus.Playing && <h3>Player {game.getStatus()} wins!</h3>}
							<Button onLeftMouseDown={() => setBottomPlayer(bottomPlayer == Player.Sente? Player.Gote : Player.Sente)}>Flip board</Button>
							<Button onLeftMouseDown={() => {
								const tsfen = exportTsfen(game);
								const tsfenFile = new File([tsfen], "game.tsfen");
								swal({
									title: "TSFEN exported!",
									html: <>
										<textarea
											ref={tsfenTextboxRef}
											className={styles.tsfenTextbox}
											readOnly
											rows={randomItem(6, 7)}
											cols={30}
											onFocus={() => {
												tsfenTextboxRef.current?.setSelectionRange(0, tsfen.length)
											}}
										>{tsfen}</textarea>
										<br/>
										<CopyToClipboardButton text={tsfen}/>
										<DownloadFileButton file={tsfenFile} label="Download .tsfen"/>
									</>,
									confirmButtonText: "Close"
								});
							}}>Export .TSFEN</Button>
							<Button onLeftMouseDown={async () => {
								const popup = await swal({
									title: "Enter TSFEN",
									html: <>
										<textarea
											ref={tsfenTextboxRef}
											className={styles.tsfenTextbox}
											placeholder="Paste in TSFEN here..."
											rows={randomItem(6, 7)}
											cols={30}
										></textarea>
										<span>or</span>
										<FileInput
											ref={tsfenFileInputRef}
											accept=".tsfen"
											onInput={Swal.clickConfirm}
										/>
									</>,
									showCancelButton: true,
									preConfirm() {
										return tsfenFileInputRef.current?.files?.[0] ?? tsfenTextboxRef.current?.value;
									}
								});
								const tsfen = popup.value instanceof File? await popup.value.text() : typeof popup.value == "string"? popup.value : null;
								if(tsfen) {
									try {
										console.log(tsfen)
										setGame(new Game(tsfen));
									} catch(e) {
										swal({
											title: "Invalid TSFEN",
											text: String(e),
											icon: "error"
										});
									}
								}
							}}>Import TSFEN</Button>
							<br/>
							{(import.meta.env.DEV || import.meta.env.MODE == "devbuild") && (
								<div>
									<Button onLeftMouseDown={() => toggleDestroyHax()}>Destroy hax: {destroyHax? "On" : "Off"}</Button>
									<Button onLeftMouseDown={() => toggleCreativeHax()}>Creative hax: {creativeHax? "On" : "Off"}</Button>
									{creativeHax && <div>
										<label>Creative hax &gt; Promoted: <input ref={creativeHaxPromotedCheckboxRef} type="checkbox"/></label>
										<br/>
										<label>Creative hax &gt; Player: <select ref={creativeHaxPlayerDropdownRef}><option>Sente</option><option>Gote</option></select></label>
									</div>}
									<Button onLeftMouseDown={() => (toggleDebug(), debug && setSelectedSquare(null))}>Debug attack map: {debug? "On" : "Off"}</Button>
								</div>
							)}
						</>
					) : (
						<>
							<h2>Select a game mode</h2>
							<a href="/play/pvp"><Button>{getGamemodeName(Gamemode.Pvp)}</Button></a>
							<br/>
							{/* <a href="/play/pvai"><Button>{getGamemodeName(Gamemode.Pvai)}</Button></a>
							<br/>
							<a href="/play/aivp"><Button>{getGamemodeName(Gamemode.Aivp)}</Button></a>
							<br/> */}
							<a href="/play/aivai"><Button>{getGamemodeName(Gamemode.Aivai)}</Button></a>
						</>
					)}
					<PieceIndex ref={pieceIndexRef}/>
				</div>
			</div>
		</div>
	);
}

function getGamemodeName(gamemode: Gamemode): string {
	switch(gamemode) {
		case Gamemode.Pvp: return "Player vs player";
		case Gamemode.Pvai: return "Player vs AI";
		case Gamemode.Aivp: return "AI vs Player";
		case Gamemode.Aivai: return "AI vs AI";
	}
}