import { forwardRef } from "preact/compat";

import SearchIcon from "./SearchIcon";
import styles from "./SearchInput.module.css";
import { InputHTMLAttributes } from "preact";

export default forwardRef<HTMLInputElement, InputHTMLAttributes>(function SearchInput({
	placeholder = "Search",
	...props
}, ref) {
	return (
		<div class={styles.searchInput}>
			<SearchIcon/>
			<input
				ref={ref}
				type="search"
				placeholder={placeholder}
				{...props}
			/>
		</div>
	);
});