/** A2 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { A2_U1_2 } from "./a2-u1-2.js";
import { A2_U3_5 } from "./a2-u3-5.js";
import { A2_U6_7 } from "./a2-u6-7.js";
import { A2_U8_9 } from "./a2-u8-9.js";

export const LESSONS: Authored[] = [...A2_U1_2, ...A2_U3_5, ...A2_U6_7, ...A2_U8_9];
