/** C2 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { C2_U1_3 } from "./c2-u1-3.js";
import { C2_U4_6 } from "./c2-u4-6.js";
import { C2_U7_9 } from "./c2-u7-9.js";

export const LESSONS: Authored[] = [...C2_U1_3, ...C2_U4_6, ...C2_U7_9];
