/** B1 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { B1_U1_3 } from "./b1-u1-3.js";
import { B1_U4_6 } from "./b1-u4-6.js";
import { B1_U7_9 } from "./b1-u7-9.js";
import { B1_U10_11 } from "./b1-u10-11.js";

export const LESSONS: Authored[] = [...B1_U1_3, ...B1_U4_6, ...B1_U7_9, ...B1_U10_11];
