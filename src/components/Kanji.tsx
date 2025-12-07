import { JSX } from "preact/jsx-runtime";
import { getNextKanjiI, idsChars } from "../lib/kanjiIds";
import styles from "./Kanji.module.css";
import { joinClasses } from "../lib/utils";

const idsToClassNames = {
	"⿱": "verticalStack",
	"⿰": "horizontalStack"
};

export default function Kanji({
	children: kanji,
	vertical = false,
	depth = 0
}: {
	children: string,
	vertical?: boolean,
	depth?: number
}) {
	kanji = kanji.replaceAll("𠵇", "⿰口奇"); // this character isn't supported in Noto Sans JP either :(
	const chars = [...kanji]; // get full Unicode characters
	if(depth > 15) {
		throw new Error(`Likely recursion when rendering <Kanji>${kanji}</Kanji>`);
	}
	let res: JSX.Element;
	if(chars.length <= 1) {
		res = <>{kanji}</>;
	} else if(isIdsChar(chars[0])) {
		const nextKanjiI = getNextKanjiI(chars);
		const idsClassName = idsToClassNames[chars[0]];
		res = (
			<>
				<span className={joinClasses(
					styles[idsClassName],
					vertical && styles.verticalText
				)}>
					<span>{chars[1]}</span>
					<span>
						<Kanji
							vertical={vertical}
							depth={depth + 1}
						>
							{chars.slice(2, nextKanjiI).join("")}
						</Kanji>
					</span>
				</span>
				<Kanji
					vertical={vertical}
					depth={depth + 1}
				>
					{chars.slice(nextKanjiI).join("")}
				</Kanji>
			</>
		);
	} else {
		res = (
			<>
				{chars[0]}
				<Kanji
					vertical={vertical}
					depth={depth + 1}
				>
					{chars.slice(1).join("")}
				</Kanji>
			</>
		);
	}
	
	return depth == 0? (
		<span className={styles.resetLineHeight} translate={false}>
			{res}
		</span>
	) : res;
}

function isIdsChar(char: string): char is keyof typeof idsToClassNames {
	return idsChars.has(char);
}