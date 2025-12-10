// @ts-expect-error
import piecesCsv from "../assets/pieces.csv";
const pieceEntries: PieceEntries = piecesCsv;

import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "preact/hooks";
import { PieceSpecies } from "../types/TaikyokuShogi";
import SearchInput from "./SearchInput";
import { forwardRef } from "preact/compat";
import PieceInfo from "./PieceInfo";
import { PieceEntries } from "../types/pieces.csv";
import Kanji from "./Kanji";
import styles from "./PieceIndex.module.css";
import Button from "./Button";
import { css, joinClasses } from "../lib/utils";
import { useToggle } from "../lib/hooks";

export type PieceIndexHandle = {
	get currentPiece(): PieceSpecies | null,
	set currentPiece(currentPiece: PieceSpecies | null)
};

export default forwardRef<PieceIndexHandle>(function PieceIndex(_, ref) {
	const [rawSearchString, setRawSearchString] = useState("");
	const [currentPiece, setCurrentPiece] = useState<PieceSpecies | null>(null);
	const [outlineCurrentPiece, toggleOutlineCurrentPiece] = useToggle();
	
	const searchInputRef = useRef<HTMLInputElement | null>(null);
	const isFirstRender = useRef(true);
	useEffect(() => {
		if(isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const searchInput = searchInputRef.current;
		if(!searchInput) {
			return;
		}
		const rangeEnd = searchInput.value.length; // Infinity doesn't work (at least on Firefox)
		searchInput.focus();
		searchInput.setSelectionRange(rangeEnd, rangeEnd);
	}, [currentPiece === null]);
	
	const searchString = rawSearchString.trim().toLocaleLowerCase();
	const visiblePieceEntries = useMemo(() => searchString? pieceEntries.filter(piece => piece.name.toLocaleLowerCase().includes(searchString) || piece.kanji.includes(searchString)) : pieceEntries, [searchString]);
	
	useImperativeHandle(ref, () => ({
		get currentPiece() {
			return currentPiece;
		},
		set currentPiece(currentPiece: PieceSpecies | null) {
			setCurrentPiece(currentPiece);
		}
	}));
	
	return (
		<>
			<h3>Piece index</h3>
			{currentPiece? (
				<>
					<div>
						<Button onLeftMouseDown={() => setCurrentPiece(null)}>Back</Button>
						<Button onLeftMouseDown={() => toggleOutlineCurrentPiece()}>Outline: {outlineCurrentPiece? "On" : "Off"}</Button>
					</div>
					<PieceInfo
						pieceSpecies={currentPiece}
						onAnchorClick={setCurrentPiece}
					/>
				</>
			) : (
				<>
					<SearchInput
						ref={searchInputRef}
						defaultValue={rawSearchString}
						onInput={e => {
							const rawSearchString = (e.target as HTMLInputElement).value;
							setRawSearchString(rawSearchString);
						}}
					/>
					{searchString && <p className={styles.searchResultInfo}>
						{visiblePieceEntries.length || "No"} piece{visiblePieceEntries.length != 1 && "s"} {!visiblePieceEntries.length && "were"} found.
					</p>}
				</>
			)}
			<div className={joinClasses(
				styles.pieceNameList,
				// instead of removing it, setting display: none makes it keep its scroll position
				currentPiece && "hidden"
			)}>
				{visiblePieceEntries.map(({ code, name, kanji }) => (
					<Button
						onLeftMouseDown={() => setCurrentPiece(code)}
					>
						{name} (<Kanji>{kanji}</Kanji>)
					</Button>
				))}
			</div>
			{outlineCurrentPiece && <style>{css`
				.${currentPiece} {
					outline: calc(4 * var(--border-width)) solid red;
					outline-offset: calc(var(--border-width) * -1);
					z-index: 1;
				}
			`}</style>}
		</>
	);
});