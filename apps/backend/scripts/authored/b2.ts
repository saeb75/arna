/** B2 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { B2_U1_4 } from "./b2-u1-4.js";
import { B2_U5_8 } from "./b2-u5-8.js";
import { B2_U9_11 } from "./b2-u9-11.js";

export const LESSONS: Authored[] = [...B2_U1_4, ...B2_U5_8, ...B2_U9_11];
