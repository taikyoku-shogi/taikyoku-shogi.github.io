import { useRef } from "preact/hooks"
import Button from "./Button"
import { sleep } from "../lib/utils";

export default function CopyToClipboardButton({
	text,
	label = "Copy",
	successLabel = "Copied!",
	successTime = 2000
}: {
	text: string,
	label?: string,
	successLabel?: string,
	successTime?: number
}) {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	
	return (
		<Button
			ref={buttonRef}
			onLeftMouseDown={async () => {
				await navigator.clipboard.writeText(text);
				buttonRef.current!.innerText = successLabel;
				await sleep(successTime);
				buttonRef.current!.innerText = label;
			}}
		>{label}</Button>
	);
}