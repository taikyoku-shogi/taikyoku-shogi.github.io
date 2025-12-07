import { useRef } from "preact/hooks"
import Button from "./Button"
import { downloadFile, sleep } from "../lib/utils";

export default function DownloadFileButton({
	file,
	label = "Download",
	successLabel = "Downloaded!",
	successTime = 2000
}: {
	file: File,
	label?: string,
	successLabel?: string,
	successTime?: number
}) {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	return (
		<Button
			ref={buttonRef}
			onLeftMouseDown={async () => {
				downloadFile(file);
				buttonRef.current!.innerText = successLabel;
				await sleep(successTime);
				buttonRef.current!.innerText = label;
			}}
		>{label}</Button>
	);
}