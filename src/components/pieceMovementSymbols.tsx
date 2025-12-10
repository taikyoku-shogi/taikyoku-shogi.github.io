import { sign } from "../lib/math";
import styles from "./pieceMovementSymbols.module.css";

export const StepMoveTd = () => <td className={styles.stepMove}>○</td>;
export const RangeMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.rangeMove}>{getLineCharForRangeMove(x, y)}</td>;
export const RangeCaptureMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.rangeCaptureMove}>{getLineCharForRangeMove(x, y)}</td>;
export const JumpMoveTd = () => <td className={styles.jumpMove}>☆</td>;
export const StepAfterJumpMoveTd = () => <td className={styles.jumpMove}>○</td>;
export const RangeAfterJumpMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.jumpMove}>{getLineCharForRangeMove(x, y)}</td>;
export const TripleSlashedArrowJumpMoveTd = () => <td className={styles.jumpMove}>3</td>;
export const IguiMoveTd = () => <td className={styles.iguiMove}>!</td>;
export const StepAndCaptureMoveTd = () => <td className={styles.stepMove}>✖</td>;
export const HookMoveTd = ({ x, y }: { x: number, y: number }) => <td className={styles.rangeMove}>{getCrossCharForHookMove(x, y)}</td>;

function getLineCharForRangeMove(x: number, y: number): string {
	if(x && !y) return "─";
	if(y && !x) return "│";
	if(sign(x) == sign(y)) return "╱";
	return "╲";
}
function getCrossCharForHookMove(x: number, y: number): string {
	if(!x || !y) return "┼";
	return "╳";
}