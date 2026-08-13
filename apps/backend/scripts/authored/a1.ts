/** A1 elle yazılmış dersler — ünite dosyalarının birleşimi (author-cores.ts bunu okur). */
import type { Authored } from "./dsl.js";
import { A1_U1_2 } from "./a1-u1-2.js";
import { A1_U3_4 } from "./a1-u3-4.js";
import { A1_U5_8 } from "./a1-u5-8.js";

export const LESSONS: Authored[] = [...A1_U1_2, ...A1_U3_4, ...A1_U5_8];
