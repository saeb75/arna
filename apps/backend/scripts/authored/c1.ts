/** C1 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { C1_U1_4 } from "./c1-u1-4.js";
import { C1_U5_7 } from "./c1-u5-7.js";
import { C1_U8_10 } from "./c1-u8-10.js";

export const LESSONS: Authored[] = [...C1_U1_4, ...C1_U5_7, ...C1_U8_10];
