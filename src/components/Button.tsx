import { ButtonHTMLAttributes, MouseEventHandler } from "preact";
import { forwardRef } from "preact/compat";
import styles from "./Button.module.css";
import { joinClasses, leftClickOnly } from "../lib/utils";

type ButtonAttributes = {
	block?: boolean,
	onLeftMouseDown?: MouseEventHandler<HTMLButtonElement> 
} & ButtonHTMLAttributes;

export default forwardRef<HTMLButtonElement, ButtonAttributes>(function Button({
	block = false,
	className,
	onLeftMouseDown,
	...props
}: ButtonAttributes, ref) {
	return (
		<button
			ref={ref}
			className={joinClasses(className, styles.button, block && styles.block)}
			onMouseDown={onLeftMouseDown? leftClickOnly(onLeftMouseDown) : undefined}
			{...props}
		>{props.children}</button>
	);
});