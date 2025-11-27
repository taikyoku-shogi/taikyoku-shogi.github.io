import { LocationProvider, Router, Route, hydrate, prerender as ssr, ErrorBoundary } from "preact-iso";

import "@fontsource/catamaran/400.css";
import "@fontsource/catamaran/700.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/700.css";

import Header from "./components/Header";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import RulesPage from "./pages/Rules";
import PlayPage from "./pages/Play";
import NotFound from "./pages/_404";
import "./globalStyles.css";

export function App() {
	return (
		<LocationProvider>
			<ErrorBoundary onError={e => console.error(e)}>
				<Header/>
				<main>
					<Router>
						<Route path="/" component={HomePage}/>
						<Route path="/about" component={AboutPage}/>
						<Route path="/rules" component={RulesPage}/>
						<Route path="/play" component={PlayPage}/>
						<Route default component={NotFound}/>
					</Router>
				</main>
			</ErrorBoundary>
		</LocationProvider>
	);
}

if(typeof window !== "undefined") {
	hydrate(<App/>, document.getElementById("app")!);
}

export async function prerender(data) {
	return await ssr(<App {...data}/>);
}