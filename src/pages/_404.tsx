import { randomItem } from "../lib/utils";

export default function NotFound() {
	return (
		<section>
			<h1>404: Not Found</h1>
			<p><i>~ {randomItem("大橋家文書", "京都の博物館")}のように、見つからない ~</i></p>
		</section>
	);
}