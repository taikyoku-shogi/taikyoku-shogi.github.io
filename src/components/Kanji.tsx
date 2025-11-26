import { JSX } from "preact/jsx-runtime";
import { getNextKanjiI, idsChars } from "../lib/kanjiIds";
import styles from "./Kanji.module.css";

const idsToClassNames = {
	"⿱": "verticalStack",
	"⿰": "horizontalStack"
};

export default function Kanji({
	children: kanji,
	depth = 0
}: {
	children: string,
	depth?: number
}) {
	const chars = [...kanji]; // get full Unicode characters
	if(chars.length <= 1) {
		return kanji;
	}
	if(depth > 15) {
		throw new Error(`Likely recursion when rendering <Kanji>${kanji}</Kanji>`);
	}
	let res: JSX.Element;
	if(idsChars.has(chars[0])) {
		const nextKanjiI = getNextKanjiI(chars);
		const idsClassName = idsToClassNames[chars[0]];
		res = (
			<>
				<span className={styles[idsClassName]}>
					<span>{chars[1]}</span>
					<span><Kanji depth={depth + 1}>{chars.slice(2, nextKanjiI).join("")}</Kanji></span>
				</span>
				<Kanji depth={depth + 1}>{chars.slice(nextKanjiI).join("")}</Kanji>
			</>
		);
	} else {
		res = (
			<>
				{chars[0]}
				<Kanji depth={depth + 1}>{chars.slice(1).join("")}</Kanji>
			</>
		);
	}
	
	return !depth? (
		<span className={styles.resetLineHeight}>
			{res}
		</span>
	) : res;
}