import logo from "../../assets/kingPiece.png";

export default function HomePage() {
	return (
		<div class="home">
			<img src={logo} alt="Logo" height="160" width="160"/>
			<h1>大局将棋</h1>
		</div>
	);
}