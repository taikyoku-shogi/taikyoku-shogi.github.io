import { useLocation } from "preact-iso";
import styles from "./Header.module.css";

export default function Header() {
	const { url } = useLocation();
	
	return (
		<header className={styles.header}>
			<nav>
				<a href="/" class={url == "/" && styles.active}>Home</a>
				<LinkToPage page="About"/>
				<LinkToPage page="Rules"/>
				<LinkToPage page="Play"/>
			</nav>
		</header>
	);
}

function LinkToPage({
	page
}: {
	page: string
}) {
	const { url } = useLocation();
	const pageUrl = `/${page.toLowerCase()}`;
	
	return <a href={pageUrl} class={url == pageUrl && styles.active}>{page}</a>;
}