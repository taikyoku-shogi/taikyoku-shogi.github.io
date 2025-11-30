import { sign } from "../lib/math";
import styles from "./pieceMovementSymbols.module.css";

export const StepMoveTd = () => <td className={styles.stepMove}>○</td>;
export const RangeMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.rangeMove}>{getLineCharForRangeMove(x, y)}</td>;
export const RangeCaptureMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.rangeCaptureMove}>{getLineCharForRangeMove(x, y)}</td>;
export const JumpMoveTd = () => <td className={styles.jumpMove}>☆</td>;

function getLineCharForRangeMove(x: number, y: number): string {
	if(x && !y) return "─";
	if(y && !x) return "│";
	if(sign(x) == sign(y)) return "╱";
	return "╲";
}