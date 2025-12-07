import { InputHTMLAttributes } from "preact";
import { forwardRef, useId } from "preact/compat";
import styles from "./FileInput.module.css";
import buttonStyles from "./Button.module.css";
import { joinClasses } from "../lib/utils";

export default forwardRef<HTMLInputElement, InputHTMLAttributes>(function FileInput({
	className,
	children,
	...props
}, ref) {
	return (
		<>
			<label
				className={joinClasses(className, buttonStyles.button, styles.label)}
			>
				<input
					ref={ref}
					type="file"
					className={styles.fileInput}
					{...props}
				/>
				{children ?? "Upload file"}
			</label>
		</>
	);
});