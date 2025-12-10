import Kanji from "../../components/Kanji";
import sekaiNoShogiGreatEagle from "../../assets/sekaiNoShogiGreatEagle.png";
import sekaiNoShogiTreacherousFox from "../../assets/sekaiNoShogiTreacherousFox.png";
import sekaiNoShogiMountainCrane from "../../assets/sekaiNoShogiMountainCrane.png";
import sekaiNoShogiAncientDragon from "../../assets/sekaiNoShogiAncientDragon.png";
import { pieceNames } from "../../lib/pieceData";
import { PieceSpecies } from "../../types/TaikyokuShogi";

export default function AboutPage() {
	return (
		<section>
			<h1>About</h1>
			<p>This website is dedicated to the ancient Japanese board game of Taikyoku Shogi (<Kanji>大局将棋</Kanji>), a variant of shogi (often known as Japanese chess) played on a 36 &times; 36 board. Very little information about this game exists, and it was only discovered in 1997 when researchers were looking through the ancient family documents of the Ohashi family, a great Shogi and Go family. Only one primary source, <i>Taikyoku Shogi Koma</i> (<Kanji>大局将棋駒</Kanji>, Taikyoku Shogi Pieces) has been confirmed to exist, and was transcribed by Isao Umebayashi (<Kanji>梅林 勲</Kanji>) and Shin Okano (<Kanji>岡野 伸</Kanji>) and included in their book <i>Sekai no Shogi</i> (<Kanji>世界の将棋</Kanji>, Shogi of the World). Scans of relevant pages were uploaded to <a href="https://www.chessvariants.com/shogivariants.dir/taikyoku_english.html" target="_blank">The Chess Variant Pages</a> alongside with translations by L. Lynn Smith. These translations made it onto Wikipedia, from where the rules used on this website were derived.</p>
			<p>An alternative set of translations were also published by George Hodges, the leading Shogi expert in the West, in his book <a href="https://web.archive.org/web/20221207220452/http://katakas.org/documents/TSV.pdf" target="_blank">Ten Shogi Variants</a>, along with the additional mention of two other sources: another from the Ohashi family documents, and one from a museum in Kyoto. He claims that all three sources have differing piece names, and most likely conflicting piece movements. Apart from here, there are no other mentions to these other two sources. Hence, <i>Sekai no Shogi</i> is the only source we currently have available for information about the game.</p>
			<p>The rules used on this website were derived from the English Wikipedia article, which we improved by looking through <i>Sekai no Shogi</i> and ensuring there were no errors from the copying process. However, there were instances where <i>Sekai no Shogi</i> did not explain something and hence varying interpretations have arisen. Importantly, the interpretations used on this website may differ from other sources such as English Wikipedia, Japanese Wikipedia or other Taikyoku Shogi software. Our interpretations and the decisions behind these are explained below.</p>
			<p>Additionally, translating piece names into English has proven a difficult task. The English piece names used on this website have been derived from L. Lynn Smith's, and improved to be more consistent in how individual kanji (characters) are translated, making it easier for players to learn how to read the piece names from the Japanese. Furthermore, modern technology (Google Translate, LLMs) as well as the abundance of information online regarding niche topics which would not have been available when L. Lynn Smith or George Hodges published their translations, has been used and referenced in order to produce what we believe is the most accurate set of translations. Contentious translations and our decisions are also listed below.</p>
			<h2>Interpretation</h2>
			<h3>Jumping pieces</h3>
			<p><i>Sekai no Shogi</i> uses circles to represent a step to a square, and arrows to represent unlimited slides. Hence, putting a circle over an arrow would be redundant. However, the {pieceName("HTK")}, {pieceName("GH")}, {pieceName("RD")} and {pieceName("GE")} have diagrams such as these:</p>
			<img src={sekaiNoShogiGreatEagle}/>
			<p>They are accompanied by a description saying they can run and jump over pieces in such directions. We have interpreted this as being able to jump over the piece marked by the ○ and then optionally continue sliding in that direction.</p>
			<p>However, the {pieceName("TF")} and {pieceName("MC")} present further complications. Their movement diagrams are shown below:</p>
			<img src={sekaiNoShogiTreacherousFox}/>
			<img src={sekaiNoShogiMountainCrane}/>
			<p><small>(Note that in the case of the {pieceName("MC")}, the 3 ○ is an abbrevation for ○ ○ ○. This notation is explained clearly in the book.)</small></p>
			<p>Unlike the four pieces with a single intersecting circle, both the {pieceName("TF")} and {pieceName("MC")} lack any explanation. The interpretation on this website is that, in addition to sliding normally, they are able to jump over up to two and three pieces respectively in that direction, then optionally continue sliding.</p>
			<h3>Triple slashed arrow</h3>
			<p><i>Sekai no Shogi</i> also uses an arrow with three slashes/bars through it to describe piece movements, such as with the {pieceName("AD")}:</p>
			<img src={sekaiNoShogiAncientDragon}/>
			<p>The authors note that with regards to this symbol, there is no explanation in the original text (i.e. <i>Taikyoku Shogi Koma</i>), but that it is thought they can jump over up to three pieces and slide. We have interpreted it as being able to slide, (optionally) jump over up to 3 consecutive squares, then (optionally) continue sliding.</p>
			<p>This symbol can also been seen in the description of Maka Dai Dai Shogi, another large-board shogi variant, in <a href="https://dl.ndl.go.jp/pid/1869566/1/109" target="_blank"><i>Shogi Rokushu no Zushiki</i></a> (<Kanji>象棋六種之圖式</Kanji>, Diagrams of Six Types of Shogi), a source written in classical Japanese oftentimes conflicting with other sources. Dr. Eric Silverman presented <a href="https://drericsilverman.com/2021/04/22/shogi-variants-translation-notes-i/" target="_blank">an argument on his blog</a> that this symbol implies the piece can move as a combination of the {pieceName("LD")} and the {pieceName("FK")}. However, the {pieceName("LD")} in Maka Dai Dai Shogi as described in <i>Shogi Rokushu no Zushiki</i> moves differently to the {pieceName("LD")} in Taikyoku Shogi, having a special move which could either be translated as jumping or being able to perform the moves of a {pieceName("L")} in that direction. Even though this is the only other usage of this symbol, due to the source's conflicts with other sources, the difficulty in interpreting it, as well as the fact that it isn't even about Taikyoku Shogi, we have decided against basing our interpretation off of it.</p>
			<h2>Translation notes</h2>
			<p>Coming up with names for 301 unique pieces is no easy feat! Furthermore, many pieces are named after Buddhist or occasionally Shinto objects or concepts, most of which have no easy English translation. We have tried our best to make translations as literal, accurate and consistent as possible. This means we rejected most of the translations used for pieces in regular Shogi, such as using "{pieceName("FK")}" instead of "queen" and "{pieceName("FCH")}" instead of "rook". However, there were many issues we faced, as described below.</p>
			<h3>- todo -</h3>
			<h2>Protocol</h2>
			<p>- todo -</p>
			<h2>Credits</h2>
			<p>A massive thank you to George Hodges, Isao Umebayashi, Shin Okano, L. Lynn Smith, Dr. Eric Silverman and the Wikipedia editors for helping make this website possible.</p>
			<h3>External links:</h3>
			<ul>
				<li><a href="https://en.wikipedia.org/wiki/Taikyoku_shogi" target="_blank">Taikyoku shogi on Wikipedia</a></li>
				<li><a href="https://en.wikipedia.org/wiki/Taikyoku_shogi#/media/File:TaikyokuShogiSente.svg" target="_blank">TaikyokuShogiSente.svg</a> by <a href="https://en.wikipedia.org/wiki/User:TKR101010" target="_blank">TKR101010</a>, used under <a href="https://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Modified from original.</li>
			</ul>
		</section>
	);
}

function pieceName(pieceSpecies: PieceSpecies): string {
	return pieceNames.get(pieceSpecies)!.toLocaleLowerCase();
}