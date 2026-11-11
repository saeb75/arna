// Öğretmen persona'yı oynar — ad değişimi saf ve deterministik (tutor/cast.ts). LLM'siz, anlık.
import assert from "node:assert/strict";
import { castLessonContent, castNameFor, castPersona, swapName } from "../src/modules/tutor/cast.js";

assert.equal(swapName("Hi! I'm Marta. What's your name?", "Marta", "Lena"), "Hi! I'm Lena. What's your name?");
assert.equal(swapName("Marta'ya kendini tanıt", "Marta", "Kai"), "Kai'ya kendini tanıt");
assert.equal(swapName("Martha and Marta", "Marta", "Lena"), "Martha and Lena", "tam kelime");
assert.equal(swapName("Şimdi Ana ile konuş", "Ana", "Theo"), "Şimdi Theo ile konuş");
assert.equal(swapName("banana", "Ana", "Theo"), "banana", "kelime içi eşleşmez");

const scene = { persona: { name: "Priya", role: "a barista", goal: "serve Priya's queue" }, scene: "Priya's cafe", avatarOpening: "Hi there!" };
const cast = castPersona(scene, "Kai");
assert.equal(cast.persona.name, "Kai");
assert.equal(cast.scene, "Kai's cafe");
assert.equal(cast.persona.goal, "serve Kai's queue");
assert.deepEqual(castPersona(scene, null), scene, "öğretmen kaydı yok → dokunma");

const content = {
  practice: { persona: { name: "Tom", role: "garson" }, scenario: "Tom ile konuş", userGoal: "Tom'a sor", avatarOpening: "Hi, I'm Tom!", mustUse: ["Tom said"] },
};
const c2 = castLessonContent(content, "Lena");
assert.equal(c2.practice.persona.name, "Lena");
assert.equal(c2.practice.avatarOpening, "Hi, I'm Lena!");
assert.deepEqual(c2.practice.mustUse, ["Tom said"], "ölçülen hedef kalıplar değişmez");

assert.equal(castNameFor({ id: null, name: "Emma" }), null);
assert.equal(castNameFor({ id: "lena", name: "Lena" }), "Lena");
assert.equal(castNameFor(undefined), null);
console.log("test-tutor-cast: OK");
