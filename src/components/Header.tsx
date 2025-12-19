import { useLocation } from "preact-iso";
import styles from "./Header.module.css";

export default function Header() {
	return (
		<header className={styles.header}>
			<nav>
				<LinkToPage page="/" text="Home"/>
				<LinkToPage page="About"/>
				<LinkToPage page="Rules"/>
				<LinkToPage page="Play"/>
			</nav>
		</header>
	);
}

function LinkToPage({
	page,
	text
}: {
	page: string,
	text?: string
}) {
	const { url } = useLocation();
	const pageUrl = `/${page.toLowerCase()}`;
	
	return <a href={pageUrl} class={url.startsWith(pageUrl)? styles.active : undefined}>{text ?? page}</a>;
}