import Piece from "../lib/Piece";
import { Tuple } from "./meta";

export type PieceSpecies = "K" | "CP" | "GG" | "GLG" | "FCH" | "RIG" | "RA" | "LG" | "LA" | "RS" | "CST" | "FK" | "FDE" | "WDV" | "CDV" | "ED" | "RDM" | "FDM" | "RH" | "BC" | "BO" | "T" | "RME" | "FLE" | "LME" | "FD" | "FF" | "W" | "GWH" | "RR" | "TF" | "WT" | "DTG" | "TS" | "DT" | "IC" | "WF" | "RVC" | "FEL" | "EK" | "WE" | "TD" | "GD" | "FSW" | "FWO" | "F" | "GDR" | "FOD" | "TR" | "MS" | "GS" | "RP" | "FL" | "RSR" | "FSR" | "SSP" | "GSH" | "RTG" | "FT" | "RBE" | "FBE" | "NS" | "HT" | "BD" | "GOG" | "SWR" | "SVG" | "VM" | "DE" | "NK" | "FST" | "GCH" | "PC" | "SD" | "RUD" | "RUS" | "FSG" | "RW" | "FW" | "AG" | "RAD" | "FLG" | "FCR" | "RIT" | "LTG" | "RDR" | "BDR" | "LDR" | "VSP" | "BB" | "WID" | "FRD" | "FP" | "FDG" | "RBI" | "OK" | "PCK" | "WD" | "PHM" | "FDR" | "KM" | "COG" | "SM" | "SVC" | "GW" | "VB" | "CH" | "SS" | "PIG" | "FPI" | "CG" | "FRC" | "PG" | "HG" | "FH" | "OG" | "FRO" | "SBO" | "FBO" | "SR" | "GOS" | "L" | "FFI" | "FWC" | "FID" | "WDM" | "SP" | "VG" | "SC" | "WH" | "CLE" | "SE" | "AM" | "DH" | "DK" | "SW" | "FLC" | "MH" | "HHW" | "VT" | "S" | "CV" | "LS" | "CLD" | "CPC" | "CE" | "RC" | "CAC" | "RHS" | "TGS" | "FIO" | "FLO" | "AD" | "GBI" | "FBI" | "DS" | "BS" | "DV" | "KT" | "WC" | "WST" | "GF" | "LHD" | "LED" | "RHD" | "RID" | "PS" | "SQM" | "WO" | "GDE" | "FIL" | "FIE" | "FLD" | "PSR" | "HM" | "FGO" | "SWW" | "SCR" | "FHW" | "BDG" | "FIS" | "WG" | "FG" | "PH" | "KR" | "LT" | "TT" | "GT" | "ST" | "C" | "TC" | "RT" | "VW" | "SO" | "DO" | "FLH" | "FB" | "GBE" | "AB" | "EW" | "PW" | "WIH" | "HH" | "FC" | "RHW" | "OM" | "MW" | "HC" | "WS" | "NB" | "SB" | "WB" | "LD" | "EB" | "RSB" | "FIW" | "BE" | "MC" | "CM" | "PM" | "EC" | "RB" | "DSP" | "DD" | "EBG" | "H" | "SWO" | "CMK" | "CSW" | "GSW" | "BM" | "FLS" | "BT" | "OC" | "PO" | "SF" | "BBE" | "OR" | "BP" | "STC" | "CS" | "CD" | "RD" | "FE" | "LH" | "CHS" | "HTK" | "VS" | "WIG" | "FWI" | "RG" | "HR" | "MG" | "MT" | "GST" | "HS" | "WOG" | "OS" | "RO" | "EG" | "BOS" | "RBO" | "SG" | "LPS" | "RL" | "TG" | "BES" | "STB" | "IG" | "GM" | "RCH" | "RIC" | "LC" | "LIC" | "SMK" | "FO" | "LBS" | "LBG" | "VP" | "LK" | "VH" | "CAS" | "CAG" | "SWS" | "SWG" | "GH" | "GE" | "SPS" | "SPG" | "VL" | "GL" | "FIT" | "GTG" | "CBS" | "CBG" | "RDG" | "GEL" | "D" | "MUG" | "GB" | "P";

export enum Player {
	Sente,
	Gote
}
export enum GameOutcome {
	SenteWin,
	GoteWin,
	Draw
}
export type Vec2 = [number, number];
export type BoardSquares = Tuple<Tuple<Piece | null, 36>, 36>;
export interface Move {
	start: Vec2;
	end: Vec2;
	intermediateSteps?: Vec2[];
}