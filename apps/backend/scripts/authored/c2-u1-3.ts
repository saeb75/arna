/** C2 · Ünite 1-3 — Nuance and Connotation · Persuasion · Negotiation (21 ders).
 *
 *  C2'nin hata sınıfı A1-B2'den FARKLI. Orada risk yanlış kuraldı; burada 43
 *  konuşma dersi var ve risk BOŞ İDDİA — "bu kalıp faydalıdır" diye yazılmış bir
 *  `claimsEn`. Kural: her iddia kalıbın NEREDE işlediğini VE NEREDE düştüğünü
 *  söyleyecek, yani yanlışlanabilir olacak.
 *
 *  Ünite 1 çağrışım: aynı şeyi söyleyen iki kelimenin farklı düşmesi. `faint-praise`
 *  ve `deliberate-vagueness` burada — işlevi incitmek veya savuşturmak olan dil DÜZ
 *  öğretilir, bedeli söylenir, sahne kalıbın MEŞRU olduğu ortama kurulur.
 *
 *  Ünite 2 ikna: akıl/duygu/itibar, retorik soru, tekrar. `persuading-without-pressure`
 *  ünitenin sınırını çiziyor — kararı gerçekten karşı tarafta bırakmak.
 *
 *  Ünite 3 müzakere: ilk teklif, takas, kilit, ve anlaşmasız ayrılmak.
 *
 *  Oyun bloğu (10 Kas 2026): her derste 11-12 madde (3 öğretim maddesi × 3 + 2
 *  karışık). C2'de beceri İŞLEV seçimi — ağırlık `sit`/`chat` (durum, tek şıkkı
 *  zorunlu kılan amacı AÇIKÇA söyler; çeldirici yanlış işlev) ve dinleme. `fc`
 *  yalnız gerçek bir biçim seçimi varsa; `arr`/`err` yalnız tek dizilim/tek kelime
 *  garantiliyse. Rol yapma açılışları sesli: olayı sözle kurar, "it/this" boşta kalmaz.
 */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const C2_U1_3: Authored[] = [
  // --- Ünite 1 · Nuance and Connotation --------------------------------------
  {
    id: "c2-the-weight-of-a-word",
    topic: "choosing between near-synonyms by connotation",
    objectives: [
      "Choose between near-synonyms by what each suggests.",
      "Decline a word without rejecting the idea behind it.",
    ],
    goal: "Pick the word whose suggestion you actually want.",
    target: "connotation over denotation",
    correction: "Offer the word with the right suggestion and let the learner choose again.",
    summary: "You learned to choose between near-synonyms by what they suggest.",
    minutes: 9,
    points: [
      {
        form: "I'd hesitate to call",
        claims: [
          "'I'd hesitate to call it X' declines a word while leaving the underlying point standing.",
          "It objects to the label, so it fails if your disagreement is really with the substance.",
        ],
        ex: ["I'd hesitate to call it a failure.", "I'd hesitate to call that generous."],
      },
      {
        form: "more accurate to say",
        claims: [
          "'It's more accurate to say Y' offers the replacement instead of only rejecting the first word.",
          "'More accurate' claims a better fit rather than the only right word, which is why it sounds precise rather than pedantic.",
        ],
        ex: ["It's more accurate to say that the project stalled.", "It would be more accurate to describe her as cautious."],
      },
      {
        form: "that carries a suggestion",
        claims: [
          "'That carries a suggestion of X' names the connotation rather than the meaning.",
          "Two words can describe the same behaviour and carry opposite suggestions: 'thrifty' praises it, 'stingy' criticises it.",
        ],
        ex: ["That carries a suggestion of blame.", "'Cheap' carries a suggestion of poor quality as well as low price."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd hesitate to call
      sit("p1", "A colleague calls your project a failure. You accept that it had problems, but you reject that word. What do you say?", [
        "I'd hesitate to call it a failure.",
        "Yes, it was a complete failure.",
        "There were no problems at all.",
      ]),
      fc("p1", "I'd hesitate to ___ it a failure.", ["call", "calling", "called"]),
      spk("p1", "I'd hesitate to call it a mistake."),
      // p2 — more accurate to say
      chat("p2", ["You said the project failed.", "Well, not exactly.", "So what happened, then?", null], [
        "It's more accurate to say it stalled.",
        "It's more accurate to say it failed.",
        "It's less accurate to say it stalled.",
      ]),
      lc("p2", "It would be more accurate to call him careful.", [
        "It would be more polite to ask him first.",
        "She would describe it as a careful plan.",
      ]),
      la("p2", "It's more accurate to say it stalled."),
      // p3 — that carries a suggestion
      sit("p3", "'Thrifty' and 'stingy' can both describe someone who spends little money. You want to point out that 'stingy' sounds like criticism. What do you say?", [
        "'Stingy' carries a suggestion of meanness.",
        "'Stingy' carries a suggestion of praise.",
        "'Stingy' suggests exactly what 'thrifty' suggests.",
      ]),
      lc("p3", "That carries a suggestion of blame.", [
        "That carries a lot of weight with me.",
        "They suggested we should leave early.",
      ]),
      fc("p3", "'Cheap' carries a ___ of poor quality.", ["suggestion", "suggest", "suggested"]),
      // karışık
      pairs("mix", [
        ["I'd hesitate to call it X.", "rejects a label"],
        ["It's more accurate to say Y.", "offers a better word"],
        ["That carries a suggestion of Z.", "names what a word implies"],
      ]),
      sit("mix", "Someone calls your plan 'risky'. You reject that word and offer 'ambitious' instead. What do you say?", [
        "I'd hesitate to call it risky. It's more accurate to say it's ambitious.",
        "I'd hesitate to call it ambitious. It's more accurate to say it's risky.",
        "I'd call it risky. It's more accurate to say it's reckless.",
      ]),
    ],
    success: "The learner declines a word, offers a closer one and names its connotation.",
    quiz: [
      qmcq("What does 'I'd hesitate to call it that' object to?", [
        "the label, not the underlying point",
        "the whole argument",
        "the speaker's motive",
      ], 0),
      qfill("It would be more ___ to describe her as cautious. (accurate)", ["accurate"]),
      qmcq("Why does 'more accurate' sound precise rather than pedantic?", [
        "It claims a better fit rather than the only right word.",
        "It is a comparative form.",
        "It is more formal than 'better'.",
      ], 0),
    ],
    scenes: [
      sc("Marisol", "a friend being blunt about your work", "to understand what actually happened",
        "A friend has used a word about your work that you think is wrong.",
        "Decline the word and offer a closer one.",
        "So the whole thing was a failure, then?", "blunt"),
      sc("Mr. Halloran", "a colleague drafting a report", "to get the wording right",
        "A report uses a word that will be read the wrong way.",
        "Name the connotation and offer a replacement.",
        "I wrote that the rollout was 'chaotic'. Fair word?", "consultative"),
      sc("Ngozi", "a fellow traveller describing a place", "to describe somewhere accurately",
        "You are both describing a place you visited.",
        "Choose words by their suggestion.",
        "I'd call that town 'shabby'. Would you?", "curious"),
      sc("Professor Lindqvist", "your tutor", "to practise connotation",
        "The seminar is examining connotation.",
        "Distinguish suggestion from meaning.",
        "In your essay you called the plan 'reckless'. Is that really the word you want?", "probing"),
      sc("Ms. Ferrante", "the examiner", "to check lexical precision",
        "The examiner offers a loaded word.",
        "Decline it and offer a closer one.",
        "Would you describe your generation as 'entitled'?", "neutral"),
    ],
  },

  {
    id: "c2-faint-praise",
    topic: "praise that is heard as criticism",
    objectives: [
      "Recognise praise whose form undercuts it.",
      "Judge where such a remark is acceptable and where it does damage.",
    ],
    goal: "Recognise faint praise, and know what it costs to use it.",
    target: "faint praise",
    correction: "Name what the remark implies and let the learner rephrase or place it.",
    summary: "You learned how faint praise works and where it does damage.",
    minutes: 8,
    points: [
      {
        form: "it's certainly different",
        claims: [
          "'It's certainly different' comments on distinctiveness while withholding any positive evaluation; in context that omission can be heard as criticism.",
          "Between friends it is a shared joke; to someone who wanted your approval it reads as a verdict.",
        ],
        ex: ["Well, it's certainly different.", "It's certainly different from the last one."],
      },
        {
        form: "not bad for",
        claims: [
          "'Not bad for a first attempt' praises against a lowered standard, and the standard is what is heard.",
          "The 'for' clause is the damage: remove it and the same sentence is a compliment.",
        ],
        ex: ["Not bad for a first attempt.", "Not bad for a Monday."],
      },
      {
        form: "you've clearly worked hard",
        claims: [
          "Praising effort alone can imply you have little to say about the result; a direct comment on the result removes that implication.",
          "It is safest where effort was the point — a learner, a volunteer — and riskiest where the result was.",
        ],
        ex: ["You've clearly worked hard on this.", "You've clearly worked hard — it shows."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's certainly different
      sit("p1", "A close friend bought a very strange hat as a joke. You want to tease them without saying you like it and without insulting them directly. What do you say?", [
        "It's certainly different, I'll give you that.",
        "It genuinely looks wonderful on you.",
        "I hate it, and you should take it back.",
      ]),
      lc("p1", "It's certainly different from the last one.", [
        "Well, it certainly made a difference.",
        "Well, it's certainly the right one.",
      ]),
      fc("p1", "Your new haircut is ___ different.", ["certainly", "certain", "certainty"]),
      // p2 — not bad for
      sit("p2", "A colleague's first presentation was weak. You want to say something positive that still signals it was weak. What do you say?", [
        "Not bad for a first attempt.",
        "That was truly excellent.",
        "That was a complete disaster.",
      ]),
      chat("p2", ["How was the new restaurant?", "The food was average, but it was their first day, so I don't want to be harsh.", "So, your verdict?", null], [
        "Not bad for a first day.",
        "It was the worst meal of my life.",
        "Not bad for a last day.",
      ]),
      spk("p2", "Not bad for a first attempt."),
      // p3 — you've clearly worked hard
      sit("p3", "A new volunteer spent all weekend on a poster. The design is weak, but the effort is what matters here. What do you say?", [
        "You've clearly worked hard on this.",
        "You clearly didn't try at all.",
        "The design is weak, I'm afraid.",
      ]),
      lc("p3", "You've clearly worked hard on this report.", [
        "You clearly work too hard these days.",
        "You should work harder on this.",
      ]),
      chat("p3", ["My director looked at my report and only said, 'You've clearly worked hard.' Was that a compliment?", null], [
        "Maybe not. Praising only the effort can mean the result was weak.",
        "Yes. It means the result was excellent.",
        "No. It means you worked too little.",
      ]),
      // karışık
      pairs("mix", [
        ["It's certainly different.", "comments only on being unusual"],
        ["Not bad for a beginner.", "sets a lower standard"],
        ["You've clearly worked hard.", "praises effort, not the result"],
      ]),
      lc("mix", "It's certainly different, and not bad for a first try.", [
        "It's certainly the best thing you've written.",
        "It's different from the first one I tried.",
      ]),
    ],
    success: "The learner uses faint praise knowingly and shows awareness of what it implies.",
    quiz: [
      qmcq("What does the 'for' clause in 'not bad for a Monday' do?", [
        "It lowers the standard the praise is measured against.",
        "It makes the praise more specific.",
        "It marks the sentence as informal.",
      ], 0),
      qfill("Well, it's ___ different. (certain)", ["certainly"]),
      qmcq("Where is 'you've clearly worked hard' safe?", [
        "where the effort was the point, as with a learner",
        "in any professional setting",
        "when speaking to a client",
      ], 0),
    ],
    scenes: [
      sc("Yevgenia", "a close friend who enjoys teasing", "to get your honest reaction",
        "A close friend wants your view and expects teasing.",
        "Use faint praise as the shared joke.",
        "Imagine my first painting: a purple cow on a beach. Be honest, what would you say about it?", "teasing"),
      sc("Mr. Dunne", "a colleague showing you his new slides", "to hear your reaction",
        "A colleague has made very unusual slides and wants your view.",
        "React with faint praise and notice what it implies.",
        "Imagine my slides are all bright pink, with music on each one. What would you tell me?", "hopeful"),
      sc("Amara", "a fellow guest at a dinner", "to gossip discreetly about the food",
        "A dinner has produced an unusual dish.",
        "Use faint praise knowingly.",
        "That main course was fish in chocolate sauce. What did you make of it?", "conspiratorial"),
      sc("Dr. Ferreira", "your tutor", "to practise implicature",
        "The seminar is examining faint praise.",
        "Explain the mechanism and its cost.",
        "A classmate's first essay is weak but very unusual. What would you say to them?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check pragmatic awareness",
        "The examiner plays a writer showing you their first story.",
        "Respond with faint praise and say what it implies.",
        "Imagine a friend's first story is about a toaster that falls in love. What would you say to them?", "neutral"),
    ],
  },

  {
    id: "c2-deliberate-vagueness",
    topic: "the grammar of being unspecific on purpose",
    objectives: [
      "Use vague nominals, impersonal subjects and hedged modals to avoid a specific.",
      "Distinguish declining to specify from misleading.",
    ],
    goal: "Stay responsive without committing to a detail you cannot give.",
    target: "deliberate vagueness",
    correction: "Model the vague-but-responsive answer and let the learner try again.",
    summary: "You learned to answer without committing, and where that becomes misleading.",
    minutes: 9,
    points: [
      {
        form: "something along those lines",
        claims: [
          "A vague nominal like 'something along those lines' confirms the shape of an answer without confirming the detail.",
          "It is honest when the detail genuinely is not fixed, and misleading when it is fixed and you are hiding it.",
        ],
        ex: ["Yes, something along those lines.", "A summer launch, or something along those lines."],
      },
      {
        form: "one might say",
        claims: [
          "'One might say' presents a formulation tentatively and at some distance; it does not necessarily mean you refuse to endorse it.",
          "Overused it sounds evasive rather than careful, because the listener notices you never speak in your own voice.",
        ],
        ex: ["One might say the timing was unfortunate.", "One might say it was always unlikely."],
      },
      {
        form: "in a manner of speaking",
        claims: [
          "'In a manner of speaking' concedes a claim loosely while flagging that it is not exact.",
          "The flag is what keeps it honest: without it the listener may take the loose claim more precisely than you meant.",
        ],
        ex: ["Yes, in a manner of speaking.", "We agreed, in a manner of speaking."],
      },
    ],
    ex: [],
    drills: [
      // p1 — something along those lines
      sit("p1", "A reporter asks if the launch is in June. It is planned for early summer, but the exact date is not fixed. What do you say?", [
        "Early summer, or something along those lines.",
        "Yes, the launch is on the third of June.",
        "I can't tell you anything at all.",
      ]),
      fc("p1", "A summer launch, or something ___ those lines.", ["along", "among", "across"]),
      la("p1", "We expect a delay, or something along those lines."),
      // p2 — one might say
      sit("p2", "Your manager asks what went wrong. You want to suggest the timing was bad, but say it tentatively and impersonally. What do you say?", [
        "One might say the timing was unfortunate.",
        "The timing was a total disaster, full stop.",
        "I blame you for the timing.",
      ]),
      fc("p2", "One might ___ the timing was unfortunate.", ["say", "says", "saying"]),
      spk("p2", "One might say it was always unlikely."),
      // p3 — in a manner of speaking
      chat("p3", ["I hear you and your partner only talked and nothing is signed. But you agreed, right?", null], [
        "In a manner of speaking, yes.",
        "Yes, we signed every detail yesterday.",
        "No, we have never spoken.",
      ]),
      lc("p3", "We agreed, in a manner of speaking.", [
        "We agreed on the manner of payment.",
        "We agreed to speak in a calm voice.",
      ]),
      sit("p3", "You loosely agree that the meeting 'went well', but you want the listener to know this is not exact. What do you say?", [
        "Yes, in a manner of speaking.",
        "Yes, exactly, in every way.",
        "No, the meeting never happened.",
      ]),
      // karışık
      pairs("mix", [
        ["something along those lines", "confirms the shape, not the detail"],
        ["one might say", "speaks impersonally, not as 'I'"],
        ["in a manner of speaking", "flags a claim as loose"],
      ]),
      lc("mix", "One might say we agreed, in a manner of speaking.", [
        "One day we might agree on the manner.",
        "Someone said we agreed to speak.",
      ]),
    ],
    success: "The learner answers responsively without committing to a detail that is not settled.",
    quiz: [
      qmcq("What keeps 'in a manner of speaking' honest?", [
        "It flags that the claim is not exact.",
        "It uses a formal register.",
        "It avoids the first person.",
      ], 0),
      qfill("Yes, ___ along those lines. (some thing)", ["something"]),
      qmcq("Why does overusing 'one might say' sound evasive?", [
        "You never speak in your own voice.",
        "It is grammatically incorrect.",
        "It is too short.",
      ], 0),
    ],
    scenes: [
      sc("Rosalind", "a friend pressing for details", "to find out what you know",
        "A friend wants a detail you are not free to give.",
        "Stay responsive without committing.",
        "Come on, you must know the date by now?", "insistent"),
      sc("Mr. Achterberg", "a journalist on a call", "to get a printable specific",
        "A journalist wants a date that has not been set.",
        "Answer without inventing a specific.",
        "Can you confirm a launch date for me?", "persistent"),
      sc("Leyla", "a fellow passenger asking about your plans", "to make conversation",
        "Small talk has reached plans you have not made.",
        "Answer loosely and honestly.",
        "So how long are you staying?", "friendly"),
      sc("Professor Adeyinka", "your tutor", "to practise hedged responsiveness",
        "The seminar is examining strategic imprecision.",
        "Stay responsive without committing.",
        "Your thesis results are not final yet. Can you tell me what you found?", "probing"),
      sc("Mr. Sanderson", "the examiner", "to check hedged answering",
        "The examiner presses for a specific you do not have.",
        "Answer responsively without inventing one.",
        "You don't track it exactly, but roughly how many hours a week do you study?", "neutral"),
    ],
  },

  {
    id: "c2-the-art-of-understatement",
    topic: "dialling a description down for effect",
    objectives: [
      "Understate a serious problem for effect.",
      "Judge when understatement stops being read as understatement.",
    ],
    goal: "Dial a description down and still be understood.",
    target: "understatement",
    correction: "Model the dialled version and let the learner adjust their own.",
    summary: "You learned to dial a description down so the gap does the work.",
    minutes: 8,
    points: [
      {
        form: "slightly inconvenient",
        claims: [
          "Calling a serious problem 'slightly inconvenient' works because the gap is obvious to both of you.",
          "If the listener does not know how bad it is, the same words are simply inaccurate.",
        ],
        ex: ["The fire was slightly inconvenient.", "Losing the data was slightly inconvenient."],
      },
      {
        form: "something of an issue",
        claims: [
          "'Something of an issue' understates while still marking the thing as a problem.",
          "A listener who does not share this habit of understatement may take it literally and miss how serious the problem is.",
        ],
        ex: ["The budget is something of an issue.", "That is something of an issue for us."],
      },
      {
        form: "to put it mildly",
        claims: [
          "'To put it mildly' explicitly signals that you are understating, so the gap is not left to chance.",
          "It is the safer form, though the listener may still need context to gauge the real scale.",
        ],
        ex: ["It was expensive, to put it mildly.", "He was annoyed, to put it mildly."],
      },
    ],
    ex: [],
    drills: [
      // p1 — slightly inconvenient
      sit("p1", "Your friend knows your flight was cancelled and you slept at the airport. You joke about it with deliberate understatement. What do you say?", [
        "It was slightly inconvenient.",
        "It was a total nightmare from start to finish.",
        "It was slightly convenient.",
      ]),
      lc("p1", "The fire was slightly inconvenient.", [
        "The flight was slightly delayed.",
        "The fire was put out quickly.",
      ]),
      spk("p1", "Losing the data was slightly inconvenient."),
      // p2 — something of an issue
      fc("p2", "Staffing is something ___ an issue.", ["of", "for", "in"]),
      sit("p2", "Your team has run out of money for the project. In a calm meeting, you mention it while still marking it as a problem. What do you say?", [
        "Money is something of an issue right now.",
        "Money is no issue at all right now.",
        "Money is something for an issue right now.",
      ]),
      la("p2", "Parking is something of an issue here."),
      // p3 — to put it mildly
      chat("p3", ["How much did the repairs cost?", null], [
        "A lot, to put it mildly.",
        "A lot, to put it mild.",
        "A lot, to putting it mildly.",
      ]),
      sit("p3", "Your manager asks how the client reacted. The client was furious, and your manager knows nothing yet. You speak mildly but make clear it was worse. What do you say?", [
        "They were unhappy, to put it mildly.",
        "They were unhappy, but only a little.",
        "They were delighted, to put it mildly.",
      ]),
      lc("p3", "He was annoyed, to put it mildly.", [
        "He was annoyed and put it away.",
        "He was mild and easy to talk to.",
      ]),
      // karışık
      sit("mix", "Your landlord ended your lease with one week's notice. A stranger asks about your week and knows nothing. Which answer shows them it is serious?", [
        "Finding a new flat this week is something of an issue, to put it mildly.",
        "Finding a new flat this week is slightly inconvenient.",
        "Finding a new flat this week is no issue at all.",
      ]),
      lc("mix", "It was something of an issue, to put it mildly.", [
        "It was an issue of some kind, I must admit.",
        "It was mild, so it was not an issue.",
      ]),
    ],
    success: "The learner understates appropriately and signals it where the listener needs the signal.",
    quiz: [
      qmcq("Why does 'to put it mildly' travel further than bare understatement?", [
        "It signals explicitly that you are understating.",
        "It is more formal.",
        "It is shorter.",
      ], 0),
      qfill("The budget is ___ of an issue. (some thing)", ["something"]),
      qmcq("What makes 'slightly inconvenient' work about a serious problem?", [
        "Both speakers already know the real scale.",
        "The adjective is negative.",
        "It uses an adverb of degree.",
      ], 0),
    ],
    scenes: [
      sc("Domenico", "a friend who knows what happened", "to laugh about a bad week",
        "A friend already knows how bad your week was.",
        "Understate it for effect.",
        "I heard your flat flooded on the day you moved in. How was the great disaster, then?", "amused"),
      sc("Ms. Iyer", "a colleague being briefed", "to grasp the real scale",
        "A colleague needs the real scale, not a joke.",
        "Signal the understatement.",
        "I heard the client lost all their data overnight. Give me the short version: how bad is it?", "focused"),
      sc("Tobias", "a stranger on a delayed train", "to pass the time",
        "A stranger asks about your delay.",
        "Understate with the signal.",
        "This train is four hours late. Have you been waiting long?", "sympathetic"),
      sc("Dr. Marchetti", "your tutor", "to practise register dialling",
        "The seminar is examining over- and understatement.",
        "Dial the description and justify it.",
        "Your experiment caught fire last week. How would you describe it to the class?", "probing"),
      sc("Ms. Okonjo", "the examiner", "to check register control",
        "The examiner asks about a setback.",
        "Understate and signal it.",
        "Tell me about something that went wrong recently?", "neutral"),
    ],
  },

  {
    id: "c2-describing-a-person-precisely",
    topic: "a portrait that avoids cliche",
    objectives: [
      "Describe a person by a specific quality rather than a stock adjective.",
      "Separate how someone seems from what they are.",
    ],
    goal: "Describe someone so a listener would recognise them.",
    target: "precise personal description",
    correction: "Replace the stock adjective with something specific and let the learner continue.",
    summary: "You practised describing a person without falling back on cliche.",
    minutes: 8,
    points: [
      {
        form: "what defines them is",
        claims: [
          "'What defines them is X' commits to one central quality instead of listing several.",
          "Choosing one is the difficulty; a generic list of adjectives rarely tells the listener which quality matters most.",
        ],
        ex: ["What defines them is patience.", "What defines them is how little they need to say."],
      },
      {
        form: "they come across as",
        claims: [
          "'They come across as X' reports the impression they give, not a claim about their character.",
          "The distinction matters because impressions are often wrong, and you may need to say so later.",
        ],
        ex: ["They come across as cold at first.", "They come across as certain, though they aren't."],
      },
      {
        form: "I'd describe them as",
        claims: [
          "'I'd describe them as X' marks the description as yours rather than as established fact.",
          "Owning the description makes a strong adjective usable without it becoming a verdict.",
        ],
        ex: ["I'd describe them as relentless.", "I'd describe them as generous with their time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what defines them is
      sit("p1", "A friend asks what your new manager is like. You want to name one central quality, not a list. What do you say?", [
        "What defines her is patience.",
        "She's nice, clever, funny and kind.",
        "What defines her is nice, clever and kind.",
      ]),
      fc("p1", "What ___ him is how little he needs to say.", ["defines", "define", "defining"]),
      spk("p1", "What defines her is how carefully she listens."),
      // p2 — they come across as
      sit("p2", "A new colleague seems cold in meetings, but you have not decided what he is really like. How do you describe this?", [
        "He comes across as cold.",
        "He is a cold person, and that's a fact.",
        "He comes across as warm.",
      ]),
      chat("p2", ["Is your neighbour as confident as she seems?", "Not at all. She's very nervous inside.", "So how would you describe her?", null], [
        "She comes across as confident, though she isn't.",
        "She comes across as nervous, and she is.",
        "She is truly confident, through and through.",
      ]),
      lc("p2", "They come across as shy at first.", [
        "They came back cold and tired.",
        "They come to us at first light.",
      ]),
      // p3 — I'd describe them as
      sit("p3", "You want to call your boss 'relentless', but make clear it is your own view, not a fact. What do you say?", [
        "I'd describe her as relentless.",
        "Everyone knows she's relentless.",
        "She is relentless, and that's a fact.",
      ]),
      la("p3", "I'd describe him as generous with his time."),
      fc("p3", "I'd describe them ___ quietly attentive.", ["as", "like", "for"]),
      // karışık
      sit("mix", "Your friend's core quality is loyalty. People think she is shy, but in your view she is calm. Which description fits?", [
        "What defines her is loyalty. She comes across as shy, but I'd describe her as calm.",
        "What defines her is shyness. She comes across as loyal, but I'd describe her as calm.",
        "What defines her is calm. She comes across as loyal, but I'd describe her as shy.",
      ]),
      lc("mix", "They come across as reserved, but I'd describe them as kind.", [
        "They came across a reserved table for us.",
        "I'd describe the room as kind of small.",
      ]),
    ],
    success: "The learner names a specific quality and separates impression from judgement.",
    quiz: [
      qmcq("Why does a list of four adjectives fail?", [
        "It doesn't say which quality matters most.",
        "It is grammatically incorrect.",
        "It is too informal.",
      ], 0),
      qfill("They ___ across as cold at first. (come)", ["come"]),
      qmcq("What does owning a description with 'I'd describe them as' allow?", [
        "using a strong adjective without it becoming a verdict",
        "avoiding the past tense",
        "describing more than one person",
      ], 0),
    ],
    scenes: [
      sc("Constance", "a friend who has not met the person", "to picture someone from your description",
        "You are describing someone your friend has never met.",
        "Describe them precisely.",
        "You keep mentioning him. What is he actually like?", "curious"),
      sc("Mr. Bramwell", "a colleague hiring for your team", "to judge a candidate fairly",
        "A colleague needs a real read on someone.",
        "Separate impression from judgement.",
        "You have worked with her. How would you describe her?", "evaluative"),
      sc("Paloma", "a travelling companion", "to understand a mutual acquaintance",
        "You are both describing someone you know differently.",
        "Describe precisely and own your reading.",
        "I found him hard to read. Did you?", "reflective"),
      sc("Professor Lindqvist", "your tutor", "to practise precise description",
        "The seminar is examining descriptive precision.",
        "Commit to one quality and defend it.",
        "Someone called your supervisor 'nice, clever, funny and kind'. What would you say actually defines her?", "probing"),
      sc("Ms. Ferrante", "the examiner", "to check descriptive range",
        "The examiner asks about a person.",
        "Describe them precisely.",
        "Could you describe someone who has influenced you?", "neutral"),
    ],
  },

  {
    id: "c2-the-same-fact-three-framings",
    topic: "reframing without changing the facts",
    objectives: [
      "Present one set of facts in three different framings.",
      "Keep every framing truthful.",
    ],
    goal: "Reframe an event three ways without changing what happened.",
    target: "reframing",
    correction: "Model one reframing and let the learner produce the next.",
    summary: "You practised reframing one event three ways without changing the facts.",
    minutes: 8,
    points: [
      {
        form: "put another way",
        claims: [
          "'Put another way' signals a restatement, so the listener does not hear a new claim.",
          "If the restatement adds a fact it is not a reframing, and the signal becomes misleading.",
        ],
        ex: ["Put another way, we chose caution.", "Put another way, nobody was ready."],
      },
      {
        form: "seen differently",
        claims: [
          "'Seen differently' changes the vantage point rather than the content.",
          "It works when the second view is genuinely available from the same facts.",
        ],
        ex: ["Seen differently, that was a lucky escape.", "Seen differently, the delay saved us."],
      },
      {
        form: "or you could say",
        claims: [
          "'Or you could say' offers the alternative framing without abandoning your own.",
          "Holding both is the point here: if you drop the first framing, it can sound like a retraction.",
        ],
        ex: ["Or you could say we were cautious.", "Or you could say it was never viable."],
      },
    ],
    ex: [],
    drills: [
      // p1 — put another way
      sit("p1", "You said, 'We waited until the risks were clear.' Now you restate the same fact in other words, adding nothing new. What do you say?", [
        "Put another way, we chose caution.",
        "Put another way, we also lost money.",
        "Put another way, we were never cautious.",
      ]),
      fc("p1", "Put another ___, we ran out of time.", ["way", "time", "word"]),
      spk("p1", "Put another way, we ran out of time."),
      // p2 — seen differently
      sit("p2", "The train was cancelled, so you missed a meeting that turned out to be a disaster. You present the same facts from a positive angle. What do you say?", [
        "Seen differently, the cancellation saved me from a disastrous meeting.",
        "Seen differently, the meeting was a success.",
        "Seen differently, the train was on time.",
      ]),
      lc("p2", "Seen differently, that was a lucky escape.", [
        "Seen from here, it looks a long way down.",
        "She did it differently, and she escaped.",
      ]),
      la("p2", "Seen differently, the delay saved us."),
      // p3 — or you could say
      chat("p3", ["So you think the plan was too risky?", "I do. The risk was high and the possible profit was small.", "Is there another way to see it?", null], [
        "Or you could say the profit didn't justify the risk.",
        "Or you could say it was never risky.",
        "No, I've changed my mind. It was safe.",
      ]),
      sit("p3", "You called the result 'cautious'. You want to offer a second framing but keep your own. What do you say?", [
        "Or you could say we were slow.",
        "Forget what I said. We were slow.",
        "I was wrong to call it cautious.",
      ]),
      lc("p3", "Or you could say we were cautious.", [
        "We could go, or you could stay here.",
        "You said we would be cautious.",
      ]),
      // karışık
      sit("mix", "Facts: the project was late but under budget. You give one restatement and one alternative view, adding no facts. Which works?", [
        "Put another way, we missed the deadline. Seen differently, we spent less than planned.",
        "Put another way, we finished early. Seen differently, we spent less than planned.",
        "Put another way, we missed the deadline. Seen differently, we spent more than planned.",
      ]),
      lc("mix", "Put another way, we were cautious; seen differently, we were slow.", [
        "Put it away, we were cautious and slow.",
        "Seen from the other side, we were fast.",
      ]),
    ],
    success: "The learner produces three framings without altering the facts.",
    quiz: [
      qmcq("What does 'seen differently' change?", [
        "the vantage point, not the content",
        "the facts of the case",
        "the tense of the verbs",
      ], 0),
      qfill("___ another way, nobody was ready. (put)", ["Put"]),
      qmcq("Why hold both framings?", [
        "Dropping the first can sound like a retraction.",
        "It makes the answer longer.",
        "It avoids the first person.",
      ], 0),
    ],
    scenes: [
      sc("Ivo", "a friend hearing your version", "to understand what really happened",
        "A friend has heard one version of an event.",
        "Reframe it truthfully.",
        "I heard your team's launch was six months late. Was it a disaster?", "sceptical"),
      sc("Ms. Delgado", "a colleague preparing a review", "to present a fair account",
        "A review must present one set of facts fairly.",
        "Give three truthful framings.",
        "The launch was six months late but under budget. How do we put that to the board?", "strategic"),
      sc("Hakan", "a fellow traveller comparing experiences", "to compare readings of the same trip",
        "You both experienced the same difficult trip.",
        "Reframe without changing facts.",
        "That was the worst holiday I have had. You disagree?", "wry"),
      sc("Dr. Marchetti", "your tutor", "to practise reframing",
        "The seminar is examining framing.",
        "Reframe without adding facts.",
        "Your study found that half the patients improved. How else could you put that?", "probing"),
      sc("Ms. Okonjo", "the examiner", "to check framing control",
        "The examiner gives you a set of facts.",
        "Frame them three ways, all true.",
        "Unemployment fell but wages fell further. How would you put that?", "neutral"),
    ],
  },

  {
    id: "c2-choosing-your-words-carefully",
    topic: "wording with real consequences",
    objectives: [
      "Flag that you are choosing wording deliberately.",
      "Correct your own phrasing mid-sentence without losing authority.",
    ],
    goal: "Speak in a situation where the exact wording matters.",
    target: "deliberate wording under consequence",
    correction: "Model the flagged rephrasing and let the learner restate.",
    summary: "You practised speaking where the exact wording carried real consequences.",
    minutes: 8,
    points: [
      {
        form: "I want to be careful",
        claims: [
          "'I want to be careful here' tells the listener the caution is deliberate, not evasion.",
          "Without the flag, slow careful speech is often read as hiding something.",
        ],
        ex: ["I want to be careful how I put this.", "I want to be careful not to overstate it."],
      },
      {
        form: "let me rephrase",
        claims: [
          "'Let me rephrase that' withdraws your own wording without withdrawing the point.",
          "Correcting yourself openly costs less standing than leaving a bad formulation on the record.",
        ],
        ex: ["Let me rephrase that.", "Let me rephrase — I put that badly."],
      },
      {
        form: "what I mean precisely",
        claims: [
          "'What I mean precisely is X' replaces an approximation with the exact claim.",
          "It commits you, so it only helps if the precise version is one you will stand behind.",
        ],
        ex: ["What I mean precisely is that we cannot verify it.", "What I mean precisely is nobody signed it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I want to be careful
      sit("p1", "A lawyer asks if you knew about the fault. You will answer slowly, and you want them to see the caution is deliberate, not evasion. How do you begin?", [
        "I want to be careful how I say this.",
        "I don't want to answer that.",
        "I want to be quick about this.",
      ]),
      fc("p1", "I want to be careful not ___ overstate it.", ["to", "for", "of"]),
      lc("p1", "I want to be careful how I say this.", [
        "I want you to carry this for me.",
        "I wanted to put it in the car.",
      ]),
      // p2 — let me rephrase
      chat("p2", ["Why was the report late?", "We hid it. No, that's the wrong word.", "So what do you mean?", null], [
        "Let me rephrase that. We chose to delay it for a week.",
        "We hid it on purpose, as I said.",
        "Let me rephrase that. We hid it.",
      ]),
      spk("p2", "Let me rephrase that; I put it badly."),
      sit("p2", "In a meeting you called a colleague's work 'sloppy', and it landed badly. You still think the work needs checking. What do you say?", [
        "Let me rephrase that: the work needs another check.",
        "The work is fine. Forget what I said.",
        "Yes, sloppy is exactly the right word.",
      ]),
      // p3 — what I mean precisely
      sit("p3", "You said, 'We kind of knew.' Now you replace this with the exact claim: you had seen one report, nothing more. What do you say?", [
        "What I mean precisely is that we had seen one report.",
        "What I mean precisely is that we knew everything.",
        "What I mean, roughly, is that we kind of knew.",
      ]),
      la("p3", "What I mean precisely is that nobody signed it."),
      fc("p3", "What I mean ___ is that we cannot verify it.", ["precisely", "precise", "precision"]),
      // karışık
      sit("mix", "On the record you said the team 'ignored' a risk. That word is too strong: the precise fact is that nobody escalated it. What do you say?", [
        "Let me rephrase that. What I mean precisely is that nobody escalated it.",
        "I want to be careful. We ignored it.",
        "Let me rephrase that. We ignored it completely.",
      ]),
      lc("mix", "I want to be careful, so let me rephrase that.", [
        "I want to be careful with the car I chose.",
        "Let me be careful and phone them later.",
      ]),
    ],
    success: "The learner flags deliberate caution and states the precise claim.",
    quiz: [
      qmcq("Why does correcting yourself openly cost little?", [
        "It costs less than leaving a bad formulation on the record.",
        "Nobody notices a correction.",
        "It changes the subject.",
      ], 0),
      qfill("I want to be ___ how I put this. (care)", ["careful"]),
      qmcq("When does 'what I mean precisely' help?", [
        "when the precise version is one you will stand behind",
        "whenever the question is hostile",
        "whenever you are unsure",
      ], 0),
    ],
    scenes: [
      sc("Rosalind", "a friend asking about a sensitive matter", "to understand without pushing",
        "A friend asks about something with consequences.",
        "Choose your wording deliberately.",
        "I heard there was a problem with the audit at your work. What actually happened?", "gentle"),
      sc("Mr. Achterberg", "a lawyer taking your statement", "to record an accurate statement",
        "A statement is being recorded.",
        "State the precise claim.",
        "Did your team know about the fault?", "exacting"),
      sc("Leyla", "an official asking about your documents", "to establish the facts",
        "An official needs an accurate account.",
        "Answer precisely.",
        "Were you told you needed a permit?", "procedural"),
      sc("Professor Adeyinka", "your tutor", "to practise precision under consequence",
        "The seminar is examining precision under pressure.",
        "Flag caution and state precisely.",
        "Your report says the data was 'wrong'. What exactly do you mean?", "probing"),
      sc("Mr. Sanderson", "the examiner", "to check precision",
        "The examiner asks a question with a trap in it.",
        "Answer precisely.",
        "Your project failed. So you are saying nobody was responsible?", "neutral"),
    ],
  },

  // --- Ünite 2 · Persuasion --------------------------------------------------
  {
    id: "c2-appeals-that-work",
    topic: "appealing through consequence, shared knowledge and evidence",
    objectives: [
      "Make the same case through consequence, through shared knowledge and through evidence.",
      "Match the appeal to the listener.",
    ],
    goal: "Choose the appeal that will actually move this listener.",
    target: "consequence, shared knowledge and evidence",
    correction: "Name which appeal was used and invite the learner to try another.",
    summary: "You learned to appeal through consequence, shared knowledge and evidence.",
    minutes: 8,
    points: [
      {
        form: "think about what happens",
        claims: [
          "'Think about what happens if we do nothing' appeals through consequence rather than principle.",
          "It works where the consequence is concrete; a vague threat invites the listener to discount it.",
        ],
        ex: ["Think about what happens if nobody acts.", "Think about what happens next year."],
      },
      {
        form: "you know as well",
        claims: [
          "'You know as well as I do' appeals to shared knowledge, which is hard to deny outright.",
          "It backfires if they do not in fact know it, because then it reads as pressure.",
        ],
        ex: ["You know as well as I do how this ends.", "You know as well as anyone what it costs."],
      },
      {
        form: "evidence points to",
        claims: [
          "'The evidence points to X' appeals through your reading of evidence, not through authority.",
          "'Points to' presents evidence as supporting a direction rather than proving it, so the conclusion stays provisional.",
        ],
        ex: ["The evidence points to a slowdown.", "Most of the evidence points to one cause."],
      },
    ],
    ex: [],
    drills: [
      // p1 — think about what happens
      sit("p1", "Your manager wants to delay fixing a security flaw. You want to argue through a concrete consequence. What do you say?", [
        "Think about what happens if someone else finds it first.",
        "The evidence points to a flaw in the code.",
        "Rules are rules, and we must follow them.",
      ]),
      fc("p1", "Think about what ___ next year if we wait.", ["happens", "happen", "happening"]),
      spk("p1", "Think about what happens when the repair costs double."),
      // p2 — you know as well
      sit("p2", "Your colleague has seen the same sales figures as you, and you both know the product is failing. You appeal to that shared knowledge. What do you say?", [
        "You know as well as I do how this ends.",
        "Think about what happens next spring.",
        "The evidence points to a slow year.",
      ]),
      lc("p2", "You know as well as anyone what it costs.", [
        "You know it has cost us a lot of money.",
        "Anyone can find out how much it is.",
      ]),
      fc("p2", "You know as well ___ I do how this ends.", ["as", "than", "like"]),
      // p3 — evidence points to
      sit("p3", "Survey data suggests sales will slow, but it is not proof. You want to argue from the data and keep the conclusion open. What do you say?", [
        "The evidence points to a slowdown.",
        "The evidence proves there will be a slowdown.",
        "Trust me, I'm the expert here.",
      ]),
      chat("p3", ["Is it certain that the new rule caused the drop?", null], [
        "Not certain, but most of the evidence points to it.",
        "Yes, the evidence proves it beyond doubt.",
        "Certain, because I say so.",
      ]),
      la("p3", "Most of the evidence points to one cause."),
      // karışık
      pairs("mix", [
        ["Think about what happens if...", "appeal to consequence"],
        ["You know as well as I do...", "appeal to shared knowledge"],
        ["The evidence points to...", "appeal to data"],
      ]),
      sit("mix", "You argue for a trial with a cautious manager. You name a concrete risk of doing nothing, then the data. Which fits?", [
        "Think about what happens if we wait: a rival gets there first. The evidence points to rising demand.",
        "You know as well as I do that we must wait. The data doesn't matter.",
        "Think about how I feel. The evidence points nowhere.",
      ]),
    ],
    success: "The learner uses all three appeals with something concrete behind each.",
    quiz: [
      qmcq("When does 'you know as well as I do' backfire?", [
        "when they do not in fact know it",
        "when the listener is senior",
        "when the evidence is strong",
      ], 0),
      qfill("Think about what ___ if nobody acts. (happen)", ["happens"]),
      qmcq("Why does a vague consequence fail?", [
        "It invites the listener to discount it.",
        "It is grammatically incomplete.",
        "It sounds too formal.",
      ], 0),
    ],
    scenes: [
      sc("Emmerich", "a friend resisting a decision", "to decide what to do",
        "A friend is putting off a decision.",
        "Choose the appeal that will move them.",
        "I know I should deal with my tax return. Why now, though?", "reluctant"),
      sc("Ms. Castellanos", "a cautious manager", "to hear a case worth funding",
        "A manager needs persuading to fund a trial.",
        "Use all three appeals.",
        "Why is this worth the money we do not have?", "cautious"),
      sc("Duarte", "a fellow traveller choosing a route", "to pick the better option",
        "You disagree about which route to take.",
        "Persuade with consequence and evidence.",
        "The coast road is longer. Why would we take it?", "practical"),
      sc("Dr. Ferreira", "your tutor", "to practise appeals",
        "The seminar is examining rhetorical appeal.",
        "Match the appeal to the listener.",
        "You want the department to fund your project. How would you persuade them?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasive range",
        "The examiner asks you to argue a case.",
        "Use all three appeals.",
        "Can you persuade me that cities should ban cars?", "neutral"),
    ],
  },

  {
    id: "c2-the-rhetorical-question",
    topic: "questions that make a statement",
    objectives: [
      "Form a rhetorical question whose answer is obvious.",
      "Recognise when a rhetorical question invites the wrong answer.",
    ],
    goal: "Use a question to make a point rather than to ask one.",
    target: "the rhetorical question",
    correction: "Model the question form and let the learner rebuild theirs.",
    summary: "You learned to use questions that make a statement rather than seek an answer.",
    minutes: 9,
    points: [
      {
        form: "who wouldn't want",
        claims: [
          "'Who wouldn't want X?' assumes agreement, so disagreeing means putting yourself outside 'everyone'.",
          "It fails where a reasonable person would answer 'I wouldn't', which then hands them the point.",
        ],
        ex: ["Who wouldn't want a shorter week?", "Who wouldn't want to be told the truth?"],
      },
      {
        form: "isn't that the point",
        claims: [
          "'Isn't that the point?' turns an objection into support for your own case.",
          "It only works if the objection genuinely serves you; forced, it sounds like a trick.",
        ],
        ex: ["Isn't that the point of a trial?", "Isn't that exactly the point?"],
      },
      {
        form: "why would anyone",
        claims: [
          "'Why would anyone do that?' states that no reason exists without you having to prove it.",
          "The stronger the listener's actual reason, the worse this lands, because they will supply it.",
        ],
        ex: ["Why would anyone agree to that?", "Why would anyone risk it twice?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — who wouldn't want
      arr("p1", "Who wouldn't want a shorter week?"),
      sit("p1", "You argue for free lunches at work and want a question that assumes everyone agrees. What do you say?", [
        "Who wouldn't want a free lunch?",
        "Does anyone here want a free lunch?",
        "Why would anyone want a free lunch?",
      ]),
      spk("p1", "Who wouldn't want to be told the truth?"),
      // p2 — isn't that the point
      sit("p2", "Your manager objects: 'But a trial might fail.' Finding out what fails is exactly why you run a trial. What do you say?", [
        "Isn't that the whole point of trying it?",
        "Yes, so let's cancel the trial.",
        "Why would anyone run a trial?",
      ]),
      fc("p2", "___ that exactly the point?", ["Isn't", "Doesn't", "Aren't"]),
      lc("p2", "Isn't that the whole point of testing?", [
        "Isn't this the last day of the trial?",
        "That was the point I tried to make.",
      ]),
      // p3 — why would anyone
      sit("p3", "Someone suggests signing a contract nobody has read. You want to say there is no reason to do this, using a question. What do you say?", [
        "Why would anyone sign that without reading it?",
        "Who wouldn't want to sign that?",
        "Would you like to sign that now?",
      ]),
      la("p3", "Why would anyone agree to that?"),
      err("p3", "Why would anyone risks it twice?", "risks", "risk"),
      // karışık
      sit("mix", "You argue for a four-day week. Someone objects that it is only an experiment. Which reply uses two rhetorical questions for your case?", [
        "Who wouldn't want a shorter week? And isn't that the point of an experiment?",
        "Who would want a shorter week? And isn't an experiment pointless?",
        "Why would anyone want a shorter week? Isn't that the point?",
      ]),
      chat("mix", ["Nobody needs a trial. Let's just decide.", null], [
        "Why would anyone decide without data? Isn't that the whole point of testing?",
        "Who wouldn't want to decide without data?",
        "Why would anyone run a trial? Let's decide.",
      ]),
    ],
    success: "The learner uses the question forms and spots one that could be turned against them.",
    quiz: [
      qmcq("What does 'why would anyone do that?' claim?", [
        "that no reason exists, without proving it",
        "that the reason is obvious",
        "that the speaker is uncertain",
      ], 0),
      qfill("___ that the point of a trial? (be not)", ["Isn't", "Is not"]),
      qmcq("When does a rhetorical question hand the point away?", [
        "when the listener supplies the answer you assumed away",
        "when it is too short",
        "when it is asked twice",
      ], 0),
    ],
    scenes: [
      sc("Emmerich", "a friend arguing the other side", "to test your reasoning",
        "A friend is arguing against your position.",
        "Use rhetorical questions.",
        "Go on then, why should anyone want a four-day week?", "challenging"),
      sc("Ms. Castellanos", "a manager weighing a proposal", "to be persuaded or not",
        "A manager is undecided about a proposal.",
        "Use questions that make your point.",
        "I am not against it. Why should I be for it?", "measured"),
      sc("Duarte", "a fellow traveller in a debate", "to enjoy an argument",
        "A long journey has turned into a friendly argument.",
        "Use rhetorical questions well.",
        "Nobody really wants to work less. Do they?", "provocative"),
      sc("Dr. Ferreira", "your tutor", "to practise rhetorical questions",
        "The seminar is examining rhetorical questions.",
        "Use them and name their risk.",
        "The library closes at six. Why should it stay open later?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check rhetorical control",
        "The examiner invites a case.",
        "Use rhetorical questions.",
        "Should university be free for everyone?", "neutral"),
    ],
  },

  {
    id: "c2-repetition-and-rhythm",
    topic: "repetition that makes a point stick",
    objectives: [
      "Repeat a phrase deliberately for emphasis.",
      "Judge when repetition stops adding force.",
    ],
    goal: "Use repetition so a point sticks rather than drags.",
    target: "repetition for emphasis",
    correction: "Model the repeated structure and let the learner build one.",
    summary: "You learned to use repetition so a point sticks.",
    minutes: 8,
    points: [
      {
        form: "again and again",
        claims: [
          "'Again and again' makes a pattern audible where a number would only be counted.",
          "If the listener knows it happened only twice, it sounds exaggerated and costs you credibility.",
        ],
        ex: ["We raised it again and again.", "The same fault, again and again."],
      },
      {
        form: "not once but twice",
        claims: [
          "'Not once but twice' gets its force from the exact number, so it must be exact.",
          "It is the precise alternative to 'again and again' and works where the count is small.",
        ],
        ex: ["Not once but twice this month.", "They missed it not once but twice."],
      },
      {
        form: "over and over",
        claims: [
          "'Over and over' emphasises the wearing effect rather than the count.",
          "Further repetition can build rhythm and force, but without variation or progression it becomes monotonous.",
        ],
        ex: ["We explained it over and over.", "The same question, over and over."],
      },
    ],
    ex: [],
    drills: [
      // p1 — again and again
      sit("p1", "Over a year you reported the same fault to a supplier many times. You want the pattern to be heard. What do you say?", [
        "We reported it again and again.",
        "We reported it not once but twice.",
        "We reported it only once.",
      ]),
      lc("p1", "The same fault, again and again.", [
        "The same old film on the screen.",
        "Not the same fault this time.",
      ]),
      fc("p1", "We asked them again ___ again.", ["and", "or", "but"]),
      // p2 — not once but twice
      sit("p2", "A supplier missed exactly two deadlines this month. You want the exact count to give your complaint force. What do you say?", [
        "They missed it not once but twice.",
        "They missed it again and again.",
        "They missed it not twice but once.",
      ]),
      chat("p2", ["How often did the bank lose your forms?", "Two times in one month.", "Really? Say that again.", null], [
        "Not once but twice this month.",
        "Again and again, every single day.",
        "Not twice but once this month.",
      ]),
      spk("p2", "They missed it not once but twice."),
      // p3 — over and over
      sit("p3", "You want to stress how tiring it was to explain the same thing to a client many times, not the number of times. What do you say?", [
        "We explained it over and over.",
        "We explained it not once but twice.",
        "We explained it once and then stopped.",
      ]),
      lc("p3", "The same question, over and over.", [
        "The same question was over quickly.",
        "The questions are all over the place.",
      ]),
      fc("p3", "We explained it over and ___.", ["over", "under", "out"]),
      // karışık
      sit("mix", "A courier lost your parcel exactly twice, and you had to call them many times about it. Which sentence keeps the count exact?", [
        "They lost it not once but twice, and I called again and again.",
        "They lost it again and again, and I called not once but twice.",
        "They lost it over and over, and I called only once.",
      ]),
      chat("mix", ["So they missed two deadlines, and you chased them for weeks?", null], [
        "Yes. They failed not once but twice, and we chased them over and over.",
        "Yes. They failed again and again, and we chased them not once but twice.",
        "No. They never failed, and we never chased them.",
      ]),
    ],
    success: "The learner uses repetition for emphasis without overstating the count.",
    quiz: [
      qmcq("Why must 'not once but twice' be exact?", [
        "Its force comes from the precise number.",
        "It is a formal construction.",
        "It cannot be used twice.",
      ], 0),
      qfill("We raised it ___ and again. (again)", ["again"]),
      qmcq("What does repetition without variation become?", [
        "monotonous",
        "more precise",
        "more credible",
      ], 0),
    ],
    scenes: [
      sc("Ivo", "a friend hearing your complaint", "to understand how bad it got",
        "A friend asks why you finally gave up on a supplier.",
        "Use repetition for force.",
        "Why did you finally switch suppliers?", "attentive"),
      sc("Ms. Delgado", "a colleague preparing a complaint", "to make a complaint land",
        "A written complaint needs force without exaggeration.",
        "Use repetition and keep counts exact.",
        "They missed two deadlines, and we sent ten reminders. Can you make that complaint land?", "practical"),
      sc("Hakan", "a fellow passenger after repeated delays", "to share the frustration",
        "The same delay has happened repeatedly.",
        "Use repetition for effect.",
        "Our train is late again. Third time this week, is it?", "exasperated"),
      sc("Dr. Marchetti", "your tutor", "to practise emphasis",
        "The seminar is examining repetition.",
        "Use repetition and name its limit.",
        "Your group missed two deadlines and ignored many reminders. How would you report that to me?", "probing"),
      sc("Ms. Okonjo", "the examiner", "to check rhetorical emphasis",
        "The examiner asks about a persistent problem.",
        "Use repetition for emphasis.",
        "Tell me about a problem that kept recurring?", "neutral"),
    ],
  },

  {
    id: "c2-pitching-an-idea",
    topic: "a short pitch with a clear ask",
    objectives: [
      "State the opportunity before the solution.",
      "End with a specific ask.",
    ],
    goal: "Pitch an idea so the listener knows exactly what you want.",
    target: "pitching with a clear ask",
    correction: "Model the ask and let the learner close their own pitch.",
    summary: "You practised pitching an idea with a clear ask.",
    minutes: 8,
    points: [
      {
        form: "here's the opportunity",
        claims: [
          "'Here's the opportunity' opens with the gap rather than with your solution.",
          "A solution presented before the problem can force the listener to reconstruct the problem themselves.",
        ],
        ex: ["Here's the opportunity we are missing.", "Here's the opportunity in plain terms."],
      },
      {
        form: "what this gives you",
        claims: [
          "'What this gives you is X' states the benefit in the listener's terms, not the builder's.",
          "'You' puts the listener's gain first; 'we' frames the same benefit as shared, or as your own.",
        ],
        ex: ["What this gives you is two weeks back.", "What this gives you is one place to look."],
      },
      {
        form: "imagine if we could",
        claims: [
          "'Imagine if we could X' invites the listener to picture the outcome before judging the method.",
          "Used without a concrete ask afterwards it leaves the pitch pleasant and unactionable.",
        ],
        ex: ["Imagine if we could halve that.", "Imagine if we could see it in real time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — here's the opportunity
      sit("p1", "You start a pitch to a busy director. You want to name the gap before your solution. How do you begin?", [
        "Here's the opportunity: scheduling costs us two weeks a quarter, and we could win that back.",
        "We built a brilliant scheduling tool.",
        "Let me show you our new software first.",
      ]),
      fc("p1", "Here's the ___ in plain terms.", ["opportunity", "opportune", "opportunely"]),
      lc("p1", "Here's the opportunity in plain terms.", [
        "Here are the plans for the new term.",
        "There's no opportunity for that here.",
      ]),
      // p2 — what this gives you
      sit("p2", "You describe a new tool to a manager. You want to state the benefit in the manager's own terms. What do you say?", [
        "What this gives you is two weeks back.",
        "What this gives us is a nice project.",
        "We spent months building this.",
      ]),
      chat("p2", ["So what's in it for me?", null], [
        "What this gives you is one place to look.",
        "What this gives me is a promotion.",
        "What we built is very complex.",
      ]),
      lc("p2", "What this gives you is two weeks back.", [
        "What did she give you two weeks ago?",
        "This gives us a week off in May.",
      ]),
      // p3 — imagine if we could
      sit("p3", "You want the listener to picture the outcome before judging how it works. What do you say?", [
        "Imagine if we could halve that.",
        "Here is how the system works.",
        "Imagine if we couldn't do anything.",
      ]),
      la("p3", "Imagine if we could halve that."),
      spk("p3", "Imagine if we could see it in real time."),
      // karışık
      sit("mix", "You open a pitch with the problem, then give the benefit in the listener's terms. Which works?", [
        "Here's the opportunity: reports take days, not minutes. What this gives you is answers in minutes.",
        "What this gives us is fame. Here's the opportunity for us.",
        "Here's our tool. What this gives our team is more work.",
      ]),
      chat("mix", ["You've got two minutes. Go.", null], [
        "Here's the opportunity: we waste a day a week. Imagine if we could get it back. Can I run a pilot?",
        "Imagine if I had more time. Here's my tool.",
        "We built a tool. It took months.",
      ]),
    ],
    success: "The learner opens with the opportunity and closes with a specific ask.",
    quiz: [
      qmcq("What does swapping 'you' for 'we' do to a benefit?", [
        "It describes your project instead of their gain.",
        "It makes it more polite.",
        "It shortens the sentence.",
      ], 0),
      qfill("___ the opportunity we are missing. (here be)", ["Here's", "Here is"]),
      qmcq("What happens to a pitch with no concrete ask?", [
        "It stays pleasant and unactionable.",
        "It becomes too long.",
        "It sounds aggressive.",
      ], 0),
    ],
    scenes: [
      sc("Constance", "a friend you are testing the pitch on", "to tell you if it lands",
        "You are rehearsing a pitch on a friend.",
        "Open with the opportunity, close with the ask.",
        "Right, pitch me. What have you got?", "encouraging"),
      sc("Mr. Bramwell", "a decision-maker with ten minutes", "to decide quickly",
        "A decision-maker has given you ten minutes.",
        "Pitch with a clear ask.",
        "You have ten minutes. What do you need from me?", "brisk"),
      sc("Paloma", "an investor met at a conference", "to hear something worth following up",
        "A chance meeting has become a pitch.",
        "Pitch and make the ask.",
        "I have heard four pitches today. Why yours?", "detached"),
      sc("Professor Lindqvist", "your tutor", "to practise pitching",
        "The seminar is examining pitch structure.",
        "Open with the gap and close with the ask.",
        "You have two minutes to pitch your research project to the committee. What have you got?", "probing"),
      sc("Ms. Ferrante", "the examiner", "to check persuasive structure",
        "The examiner invites a pitch.",
        "Pitch with a clear ask.",
        "Pitch me an idea for improving your city?", "neutral"),
    ],
  },

  {
    id: "c2-winning-a-sceptic",
    topic: "persuading someone who starts out against you",
    objectives: [
      "Acknowledge the listener's scepticism before answering it.",
      "Ask for a hearing rather than for agreement.",
    ],
    goal: "Get a hearing from someone who has already decided against you.",
    target: "persuading a sceptic",
    correction: "Model the acknowledgement and let the learner continue their case.",
    summary: "You practised persuading someone who started out against you.",
    minutes: 8,
    points: [
      {
        form: "I know how it sounds",
        claims: [
          "'I know how it sounds' shows you have heard your own claim from their side.",
          "It can take the force out of the objection they were assembling, because you have said it first.",
        ],
        ex: ["I know how it sounds.", "I know how it sounds, and I thought the same."],
      },
      {
        form: "hear me out",
        claims: [
          "'Hear me out' asks for a hearing rather than for agreement, which is a smaller ask.",
          "It obliges you to be brief: having asked for time, running long spends the goodwill.",
        ],
        ex: ["Hear me out for two minutes.", "Just hear me out on this."],
      },
      {
        form: "you're right to question",
        claims: [
          "'You're right to question it' grants the scepticism as reasonable rather than as an obstacle.",
          "It is only credible if you then answer the question rather than move past it.",
        ],
        ex: ["You're right to question the cost.", "You're right to question it — so did I."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I know how it sounds
      sit("p1", "You propose a four-day week. You expect your boss to call it crazy, so you name the objection first. How do you start?", [
        "I know how it sounds, but the numbers work.",
        "This is obviously a great idea.",
        "I don't care how it sounds.",
      ]),
      lc("p1", "I know how it sounds, and I thought the same.", [
        "I know how it sounds when it rains.",
        "I thought it sounded the same as before.",
      ]),
      fc("p1", "I know how it ___, but the plan is sound.", ["sounds", "sound", "sounding"]),
      // p2 — hear me out
      sit("p2", "Your colleague has already said no to your plan. You ask only for two minutes of attention, not agreement. What do you say?", [
        "Hear me out for two minutes.",
        "Agree with me for two minutes.",
        "Don't listen, just sign it.",
      ]),
      chat("p2", ["I've already decided. The answer is no.", "I'd still like you to know the numbers.", "Why should I listen?", null], [
        "Just hear me out for two minutes.",
        "You shouldn't, so I'll stop.",
        "Because you must agree with me.",
      ]),
      spk("p2", "Hear me out for two minutes."),
      // p3 — you're right to question
      sit("p3", "Your boss doubts the cost of your plan. You treat the doubt as reasonable and then answer it. What do you say?", [
        "You're right to question the cost. It pays for itself by year three.",
        "You're right to question the cost. Anyway, moving on.",
        "You're wrong to question the cost.",
      ]),
      la("p3", "You're right to question the cost."),
      lc("p3", "You're right to question it, and I did too.", [
        "You're right, it's a question of time.",
        "You wrote the questions, didn't you?",
      ]),
      // karışık
      sit("mix", "A sceptical investor says your idea sounds too good to be true. You admit how it sounds and ask for a short hearing. What do you say?", [
        "I know how it sounds. Hear me out for two minutes.",
        "It is too good to be true. Goodbye.",
        "You're right, so don't listen to me.",
      ]),
      chat("mix", ["Your plan sounds expensive and a bit mad.", null], [
        "I know how it sounds, and you're right to question the cost. It pays for itself in a year.",
        "It's not mad, and you're wrong to question it.",
        "I know how it sounds, so let's forget it.",
      ]),
    ],
    success: "The learner acknowledges the scepticism and answers it rather than moving past it.",
    quiz: [
      qmcq("What does 'I know how it sounds' disarm?", [
        "the objection they were assembling",
        "the listener's authority",
        "the need for evidence",
      ], 0),
      qfill("Just ___ me out on this. (hear)", ["hear"]),
      qmcq("Why does 'hear me out' oblige you to be brief?", [
        "Running long spends the goodwill you asked for.",
        "The phrase is informal.",
        "It cannot precede a long answer grammatically.",
      ], 0),
    ],
    scenes: [
      sc("Yevgenia", "a friend who thinks your plan is mad", "to be convinced or to talk you out of it",
        "A friend has already decided against your plan.",
        "Get a hearing and answer the objection.",
        "Quitting your job to open a bakery sounds like a terrible idea. Can you convince me?", "sceptical"),
      sc("Mr. Dunne", "a colleague opposed on cost", "to protect the budget",
        "A colleague has decided the proposal is too expensive.",
        "Acknowledge and answer the cost objection.",
        "We cannot afford this. What am I missing?", "resistant"),
      sc("Amara", "a fellow traveller doubting your route", "to avoid a bad decision",
        "Your companion thinks your plan will fail.",
        "Ask for a hearing and answer.",
        "Your route gives us only ten minutes to change trains. We will miss the connection. Why risk it?", "worried"),
      sc("Dr. Ferreira", "your tutor", "to practise persuading a sceptic",
        "The seminar is examining resistance.",
        "Acknowledge, ask, answer.",
        "I think your research topic is a waste of time. Can you convince me?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasion under resistance",
        "The examiner states a firm objection.",
        "Get a hearing and answer it.",
        "I think working from home makes teams worse. What do you say to that?", "neutral"),
    ],
  },

  {
    id: "c2-persuading-without-pressure",
    topic: "influencing while leaving the decision theirs",
    objectives: [
      "Make a case and hand the decision back explicitly.",
      "Recognise when reassurance becomes pressure.",
    ],
    goal: "Make your case and leave the decision genuinely theirs.",
    target: "influence without pressure",
    correction: "Model the hand-back and let the learner close without pressing.",
    summary: "You practised influencing someone while leaving the decision genuinely theirs.",
    minutes: 8,
    points: [
      {
        form: "it's entirely your call",
        claims: [
          "'It's entirely your call' hands the decision back after you have made your case.",
          "Said and then followed by more argument, it becomes the opposite of what it claims.",
        ],
        ex: ["It's entirely your call.", "It's entirely your call, either way."],
      },
      {
        form: "it might be worth considering",
        claims: [
          "'It might be worth considering' offers a view at low intensity, which suits an unasked-for opinion.",
          "The hedges are load-bearing; without them the same content is advice they did not request.",
        ],
        ex: ["It might be worth considering.", "It might be worth considering the September course."],
      },
      {
        form: "no obligation at all",
        claims: [
          "'No obligation at all' lowers the social cost of saying no, though saying it cannot remove that cost by itself.",
          "Repeating it starts to draw attention to the obligation you are denying.",
        ],
        ex: ["No obligation at all.", "Have a look — no obligation at all."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's entirely your call
      sit("p1", "You have told a friend why you prefer the earlier train. Now you hand the decision back and stop arguing. What do you say?", [
        "It's entirely your call.",
        "It's entirely your call, but you'd be silly not to.",
        "You should take the earlier train.",
      ]),
      chat("p1", ["So what would you do in my place?", "I told you what I think.", "And now?", null], [
        "Now it's entirely your call.",
        "Now you have to do what I said.",
        "Now it's entirely my call.",
      ]),
      err("p1", "It's entirely you call.", "you", "your"),
      // p2 — it might be worth considering
      sit("p2", "A friend has not asked for advice, but you think a September course could help. You mention it at low intensity. What do you say?", [
        "It might be worth considering the September course.",
        "You must take the September course.",
        "You'd be a fool to miss the September course.",
      ]),
      lc("p2", "It might be worth considering.", [
        "It might be worth a lot of money.",
        "It might be the one she was choosing.",
      ]),
      la("p2", "It might be worth considering the September course."),
      // p3 — no obligation at all
      sit("p3", "You offer a neighbour a free trial of your service. You want them to feel completely free to say no. What do you add?", [
        "No obligation at all.",
        "You'll have to pay if you say no.",
        "Everyone else has already said yes.",
      ]),
      spk("p3", "Have a look, no obligation at all."),
      chat("p3", ["Do I have to buy anything, now or later, if I come to the demo?", null], [
        "No obligation at all.",
        "Yes, everyone buys something.",
        "No, but you'll need to buy something after the demo.",
      ]),
      // karışık
      sit("mix", "A colleague is choosing a supplier. You suggest one option gently, then hand the decision back. Which works?", [
        "It might be worth considering the local firm. It's entirely your call.",
        "You must choose the local firm. It's entirely your call.",
        "It might be worth considering the local firm. Decide now.",
      ]),
      lc("mix", "Have a look, no obligation at all; it's entirely your call.", [
        "Have a look at all the calls you missed.",
        "It's not an obligation to call at all.",
      ]),
    ],
    success: "The learner states the view once and leaves the decision genuinely open.",
    quiz: [
      qmcq("What does 'no obligation at all' do?", [
        "lowers the social cost of saying no",
        "removes every reason to accept",
        "states the speaker's own view",
      ], 0),
      qfill("It's ___ your call. (entire)", ["entirely"]),
      qmcq("What happens if you repeat 'no obligation'?", [
        "It draws attention to the obligation you are denying.",
        "It becomes more reassuring.",
        "It sounds more formal.",
      ], 0),
    ],
    scenes: [
      sc("Emmerich", "a friend who has not asked for advice", "to be left to decide",
        "You have a view your friend did not ask for.",
        "Say it once and hand the decision back.",
        "Work has been so stressful lately, but I'm fine, honestly. Why, what are you thinking?", "guarded"),
      sc("Ms. Castellanos", "a colleague making their own decision", "to decide without being pushed",
        "A colleague must make a decision that is theirs.",
        "Offer a view without pressure.",
        "I know what you think. What would you actually do?", "considering"),
      sc("Duarte", "a fellow traveller choosing for themselves", "to make their own choice",
        "Your companion is choosing something you would not.",
        "Offer the view and step back.",
        "You think I should take the earlier train, don't you?", "independent"),
      sc("Dr. Ferreira", "your tutor", "to practise low-pressure influence",
        "The seminar is examining influence and autonomy.",
        "Make the case and hand it back.",
        "Your classmate has chosen a topic you think is too big. What would you say to them?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check restraint",
        "The examiner describes their own decision.",
        "Offer a view without pressing.",
        "I am thinking of giving up my degree. What do you think?", "neutral"),
    ],
  },

  {
    id: "c2-changing-someones-mind",
    topic: "shifting a firmly held view",
    objectives: [
      "Ask what evidence would change the other person's mind.",
      "Check for movement rather than declaring victory.",
    ],
    goal: "Make a real attempt to shift a firmly held view.",
    target: "shifting a held position",
    correction: "Model the falsification question and let the learner press again.",
    summary: "You practised making a real attempt to shift a firmly held view.",
    minutes: 8,
    points: [
      {
        form: "what would convince you",
        claims: [
          "'What would convince you?' asks what evidence would change their mind, which tests whether any would.",
          "The answer tells you whether to argue evidence or to stop arguing.",
        ],
        ex: ["What would convince you otherwise?", "What would convince you I'm right?"],
      },
      {
        form: "does that shift anything",
        claims: [
          "'Does that shift anything?' checks for movement instead of assuming it.",
          "Asking for a shift rather than agreement leaves them room to move partway.",
        ],
        ex: ["Does that shift anything for you?", "Does that shift anything at all?"],
      },
      {
        form: "I'm asking you to",
        claims: [
          "'I'm asking you to X' names the exact change you want, which prevents a vague half-agreement.",
          "A small named change is more often granted than a general request to reconsider.",
        ],
        ex: ["I'm asking you to look at the data once.", "I'm asking you to suspend judgement for a week."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what would convince you
      sit("p1", "Your manager is firmly against remote work. Before arguing, you want to find out what evidence could change their view. What do you ask?", [
        "What would convince you otherwise?",
        "Why are you so stubborn?",
        "Don't you agree with me?",
      ]),
      fc("p1", "What would ___ you otherwise?", ["convince", "convinces", "convincing"]),
      lc("p1", "What would convince you I'm right?", [
        "What would you like to drink tonight?",
        "Who told you that I'm right?",
      ]),
      // p2 — does that shift anything
      sit("p2", "You have just shown your friend new figures. You want to check if their view has moved at all, without assuming it has. What do you ask?", [
        "Does that shift anything in your view?",
        "So now you agree with me, right?",
        "That proves I'm right, doesn't it?",
      ]),
      chat("p2", ["Hm. That's an interesting number.", null], [
        "Does that shift anything at all?",
        "Great, so you've changed your mind.",
        "So you admit you were wrong.",
      ]),
      spk("p2", "So, does that shift anything?"),
      // p3 — I'm asking you to
      sit("p3", "You want your manager to read one quarter of data before deciding. You name exactly this small change. What do you say?", [
        "I'm asking you to look at one quarter of data.",
        "I'm asking you to completely change your mind.",
        "Please just reconsider everything.",
      ]),
      la("p3", "I'm asking you to read the report."),
      fc("p3", "I'm asking you ___ look at the data once.", ["to", "for", "that"]),
      // karışık
      sit("mix", "Your friend says only real cases from your town would convince her. You give one case, check for movement, and name a small request. Which works?", [
        "Does that shift anything? I'm asking you to read one more case.",
        "So you agree now. I'm asking you to admit it.",
        "What would convince you? I don't care.",
      ]),
      chat("mix", ["I've believed this for twenty years.", null], [
        "What would convince you otherwise? I'm asking you to look at one study.",
        "Twenty years of being wrong, then.",
        "Then you must agree with me now.",
      ]),
    ],
    success: "The learner tests for movement and names a specific change rather than demanding agreement.",
    quiz: [
      qmcq("What does the answer to 'what would convince you?' tell you?", [
        "whether to argue evidence or stop arguing",
        "how strongly they feel",
        "whether they like you",
      ], 0),
      qfill("Does that ___ anything for you? (shift)", ["shift"]),
      qmcq("Why name a small specific change?", [
        "It is more often granted than a general request.",
        "It is easier to say.",
        "It avoids naming evidence.",
      ], 0),
    ],
    scenes: [
      sc("Yevgenia", "a friend with a fixed view", "to defend a long-held position",
        "A friend holds a view they have never examined.",
        "Test what would move them.",
        "For twenty years I have believed cities cannot work without cars. Before you argue, what do you want to ask me?", "immovable"),
      sc("Mr. Dunne", "a manager set against remote work", "to make the right call for the team",
        "A manager believes remote work harms teams.",
        "Ask what would convince them.",
        "I am sure teams need to be in one room. Before you argue, what do you want to ask me?", "entrenched"),
      sc("Amara", "a fellow traveller with a firm opinion", "to have a real argument",
        "A long journey has produced a real disagreement.",
        "Test for movement.",
        "Nothing you say will change my mind — so why keep going?", "stubborn"),
      sc("Dr. Ferreira", "your tutor", "to practise genuine persuasion",
        "The seminar is examining belief change.",
        "Test what evidence would move them.",
        "I am sure online classes are worse than real ones. Before you argue, what would you like to ask me?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasive technique",
        "The examiner holds a firm view.",
        "Test for movement and name a change.",
        "Exams are the only fair way to assess. What would you ask me first?", "neutral"),
    ],
  },

  // --- Ünite 3 · Negotiation -------------------------------------------------
  {
    id: "c2-opening-positions",
    topic: "the first offer and the first response",
    objectives: [
      "State an opening position without closing the conversation.",
      "Respond to a first offer without accepting or rejecting it.",
    ],
    goal: "Open a negotiation so there is somewhere to go.",
    target: "opening positions",
    correction: "Model the opening and let the learner respond to it.",
    summary: "You learned the language of a first offer and a first response.",
    minutes: 8,
    points: [
      {
        form: "what we're looking for",
        claims: [
          "'What we're looking for is X' states a position as a goal rather than as a demand.",
          "A goal invites a counter-offer; a demand invites a yes or a no.",
        ],
        ex: ["What we're looking for is a three-year term.", "What we're looking for is simple."],
      },
      {
        form: "our starting point",
        claims: [
          "'Our starting point is X' marks the figure as an opening rather than a limit; movement from it can still carry a cost.",
          "It also tells the other side to expect movement, including from them.",
        ],
        ex: ["Our starting point is forty.", "That is our starting point on volume."],
      },
      {
        form: "ideally we'd want",
        claims: [
          "'Ideally we'd want X' names your best case while conceding it is the best case.",
          "It reveals your preference, which is the cost you pay to speed the negotiation up.",
        ],
        ex: ["Ideally we'd want it by June.", "Ideally we'd want both, realistically one."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what we're looking for
      sit("p1", "You open a contract negotiation. You state your aim as a goal that invites a counter-offer, not as a demand. What do you say?", [
        "What we're looking for is a five-year contract.",
        "We demand a five-year contract, no less.",
        "Five years, or we leave.",
      ]),
      lc("p1", "What we're looking for is simple.", [
        "Where we're going is not far.",
        "We're looking at a small room.",
      ]),
      spk("p1", "What we're looking for is a five-year contract."),
      // p2 — our starting point
      sit("p2", "You name forty units as your first figure, but you want it heard as an opening, not your limit. What do you say?", [
        "Our starting point is forty.",
        "Forty is our final offer.",
        "We can't go above or below forty.",
      ]),
      chat("p2", ["What's your figure?", "Forty units, but we have room to move.", "So forty is your absolute limit?", null], [
        "No, that's our starting point.",
        "Yes, that's our starting point.",
        "No, that's our final point.",
      ]),
      fc("p2", "Our ___ point is forty.", ["starting", "started", "starts"]),
      lc("p2", "That is our starting point on volume.", [
        "That is the point where we started.",
        "That's a good point about the music.",
      ]),
      // p3 — ideally we'd want
      sit("p3", "You'd love delivery by June, but you know it may not happen. You name your best case and admit it is the best case. What do you say?", [
        "Ideally we'd want it by June.",
        "We must have it by June.",
        "June is the latest we will accept.",
      ]),
      chat("p3", ["When do you need delivery?", "June would be best, but July is fine too.", "So what's your timeline?", null], [
        "Ideally we'd want it by June, but we can be flexible.",
        "Ideally we'd want it by June, and we can't move at all.",
        "We need it by June, and that's final.",
      ]),
      lc("p3", "Ideally we'd want both, realistically one.", [
        "Realistically, we can only pay for one.",
        "Ideally, it would be warm in June.",
      ]),
      // karışık
      pairs("mix", [
        ["What we're looking for is...", "states an aim, inviting an offer"],
        ["Our starting point is...", "marks a figure as an opening"],
        ["Ideally we'd want...", "admits it is the best case"],
      ]),
      sit("mix", "You open with your aim, then give forty units as a first figure that can move. Which fits?", [
        "What we're looking for is volume. Our starting point is forty units.",
        "We demand volume. Forty units is our final figure.",
        "What we're looking for is forty units, and we won't move.",
      ]),
    ],
    success: "The learner opens with a goal and marks the position as an opening.",
    quiz: [
      qmcq("What is the cost of 'ideally we'd want'?", [
        "It reveals your preference.",
        "It sounds unrealistic.",
        "It cannot be retracted.",
      ], 0),
      qfill("What we're ___ for is a three-year term. (look)", ["looking"]),
      qmcq("What does 'ideally' concede?", [
        "that this is the best case, not the requirement",
        "that the figure is negotiable",
        "that the other side is right",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a private seller", "to sell at a good price",
        "You are opening a negotiation over a private sale.",
        "Open with a goal, not a demand.",
        "I am selling my car, and I have had a lot of interest. What are you offering?", "confident"),
      sc("Mr. Vandermeer", "a supplier's negotiator", "to agree favourable terms",
        "A supply contract negotiation is opening.",
        "State your goal and mark your opening.",
        "Let us start with your numbers. Where are you?", "businesslike"),
      sc("Ines", "a host renting out a holiday flat for a month", "to let the flat on good terms",
        "Terms for a month-long holiday rental are being opened.",
        "Open without closing the conversation.",
        "My asking price is three thousand for the month. What are you looking for?", "firm"),
      sc("Professor Ashworth", "your tutor", "to practise opening moves",
        "The seminar is examining opening positions.",
        "Open with a goal and mark it as an opening.",
        "You are negotiating time in the lab with another research group. What is your opening position?", "probing"),
      sc("Ms. Roux", "the examiner", "to check negotiation openings",
        "The examiner invites your opening position.",
        "Open with a goal.",
        "You are negotiating a salary. What is your opening?", "neutral"),
    ],
  },

  {
    id: "c2-trading-and-conceding",
    topic: "giving something to get something",
    objectives: [
      "Attach a condition to every concession.",
      "Name the exchange explicitly.",
    ],
    goal: "Trade rather than give away.",
    target: "conditional concession",
    correction: "Model the conditional form and let the learner re-offer.",
    summary: "You learned to give something in order to get something.",
    minutes: 8,
    points: [
      {
        form: "if you can do",
        claims: [
          "'If you can do X, we can do Y' makes the concession conditional in the same breath.",
          "A concession offered first and conditioned afterwards has already been banked by the other side.",
        ],
        ex: ["If you can do June, we can do the higher volume.", "If you can do that, we have a deal."],
      },
      {
        form: "we could move on",
        claims: [
          "'We could move on price' puts price in play; add 'not on scope' if you want the other items to stay fixed.",
          "'Could' keeps the movement hypothetical until you get something in return.",
          "Name the item: without it, 'we could move on' means 'let's go to the next topic'.",
        ],
        ex: ["We could move on price.", "We could move on timing, not on scope."],
      },
      {
        form: "in exchange for",
        claims: [
          "'In exchange for X' states the trade openly, which makes reneging visible later.",
          "Naming the exchange also stops a concession being remembered as a gift.",
        ],
        ex: ["We could accept the later date in exchange for a longer term.", "We can reduce the price in exchange for earlier payment."],
      },
    ],
    ex: [],
    drills: [
      // p1 — if you can do
      sit("p1", "A client wants a lower price. You will only lower it if they sign for three years, and you say both in one sentence. What do you say?", [
        "If you can do three years, we can do the lower price.",
        "OK, we'll lower the price. Maybe you could sign for three years?",
        "We can't lower the price at all.",
      ]),
      fc("p1", "If you can ___ June, we can do the higher volume.", ["do", "does", "doing"]),
      spk("p1", "If you can do that, we have a deal."),
      // p2 — we could move on
      sit("p2", "You are willing to change the price, but not the scope. You name the item in play. What do you say?", [
        "We could move on price, not on scope.",
        "We could move on scope, not on price.",
        "We can't move on anything.",
      ]),
      chat("p2", ["Is the delivery date fixed?", "Not completely.", "So what are you saying?", null], [
        "We could move on timing, if you can do a longer term.",
        "Timing is completely fixed.",
        "We could move on to lunch now.",
      ]),
      lc("p2", "We could move on timing, not on scope.", [
        "We could move into town next spring.",
        "We could talk about timing at noon.",
      ]),
      // p3 — in exchange for
      sit("p3", "You accept a later date, and you want a longer contract in return. You state the trade openly. What do you say?", [
        "We can accept the later date in exchange for a longer term.",
        "We can accept the later date as a gift.",
        "We can't accept the later date.",
      ]),
      fc("p3", "We'll waive the fee in exchange ___ a longer contract.", ["for", "of", "to"]),
      chat("p3", ["Can you give us free delivery?", null], [
        "Yes, in exchange for a bigger order.",
        "Yes, in exchange of a bigger order.",
        "Yes, exchange for a bigger order.",
      ]),
      // karışık
      sit("mix", "You can move on timing if the client signs for three years. You name the item and the trade. Which fits?", [
        "We could move on timing in exchange for a three-year term.",
        "We could move on timing, and we ask for nothing.",
        "In exchange for timing, we could move on.",
      ]),
      lc("mix", "If you can do June, we could move on price.", [
        "If you can come in June, we could talk.",
        "If you can't do June, we can't move.",
      ]),
    ],
    success: "The learner conditions the concession and names the exchange.",
    quiz: [
      qmcq("Why name the exchange openly?", [
        "It makes reneging visible later.",
        "It is more polite.",
        "It shortens the negotiation.",
      ], 0),
      qfill("We could ___ on price. (move)", ["move"]),
      qmcq("What does naming the item in play imply?", [
        "that the items not named are not in play",
        "that everything is negotiable",
        "that you have no limit",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a private buyer", "to get a lower price",
        "A buyer is pressing you to drop the price.",
        "Trade rather than give away.",
        "Knock fifty off the bike and I will take it today. Deal?", "opportunistic"),
      sc("Mr. Vandermeer", "a client renegotiating terms", "to improve their terms",
        "A client wants a later date without giving anything.",
        "Condition the concession.",
        "We need September rather than June. That is fine, isn't it?", "presumptuous"),
      sc("Ines", "a market trader", "to close a sale",
        "A price is being haggled in a market.",
        "Trade explicitly.",
        "This rug is two hundred, but for you, a special price: one eighty. What do you say?", "shrewd"),
      sc("Professor Ashworth", "your tutor", "to practise conditional concession",
        "The seminar is examining trading.",
        "Condition every concession.",
        "The other group wants the lab on Mondays too. What could you offer them, and for what?", "probing"),
      sc("Ms. Roux", "the examiner", "to check negotiation trading",
        "The examiner asks for a concession.",
        "Trade rather than give.",
        "Can you lower your price at all?", "neutral"),
    ],
  },

  {
    id: "c2-deadlock-and-deadlines",
    topic: "moving a conversation that has stopped",
    objectives: [
      "Name a deadlock without blaming the other side.",
      "Set a deadline or park an item to restore movement.",
    ],
    goal: "Get a stalled negotiation moving again.",
    target: "breaking deadlock",
    correction: "Model the naming or parking move and let the learner continue.",
    summary: "You learned to move a conversation that had stopped moving.",
    minutes: 8,
    points: [
      {
        form: "we're going round in circles",
        claims: [
          "'We're going round in circles' names the deadlock as shared rather than as their fault.",
          "Naming it works once; repeated, it becomes a complaint about the other side.",
        ],
        ex: ["We're going round in circles here.", "We're going round in circles on this one point."],
      },
      {
        form: "by end of week",
        claims: [
          "A named deadline converts an open disagreement into a decision with a date; 'by end of week' is business shorthand for 'by the end of the week'.",
          "It only works if the date is real: a deadline that passes without consequence removes your leverage.",
        ],
        ex: ["Let's decide by end of week.", "I need an answer by the end of the week."],
      },
      {
        form: "let's park that",
        claims: [
          "'Let's park that' sets one blocking item aside so the rest can progress.",
          "Parked items must be picked up again; a park that is really a drop will be noticed.",
        ],
        ex: ["Let's park that and come back to it.", "Let's park the payment clause."],
      },
    ],
    ex: [],
    drills: [
      // p1 — going round in circles
      sit("p1", "A negotiation has repeated the same arguments for an hour. You name the deadlock without blaming the other side. What do you say?", [
        "We're going round in circles here.",
        "You keep repeating yourself.",
        "You are the reason we are stuck.",
      ]),
      lc("p1", "We're going round in circles on this one point.", [
        "We're going round to the shop at one.",
        "We're sitting in a circle at this point.",
      ]),
      fc("p1", "We're going round in ___ here.", ["circles", "circle", "rounds"]),
      // p2 — by end of week
      sit("p2", "A decision has been open for weeks. You set a real date so that it becomes a decision. What do you say?", [
        "Let's make a decision by end of week.",
        "Let's make a decision whenever we feel like it.",
        "Let's not make any decision yet.",
      ]),
      chat("p2", ["When do you need our answer?", null], [
        "By end of week.",
        "Until end of week.",
        "Since end of week.",
      ]),
      spk("p2", "We need an answer by end of week."),
      // p3 — let's park that
      sit("p3", "One clause is blocking everything, but four other items are ready. You set the clause aside for now. What do you say?", [
        "Let's park that and come back to it.",
        "Let's drop that clause forever.",
        "Let's not discuss anything else until it's solved.",
      ]),
      la("p3", "Let's park the payment clause."),
      fc("p3", "Let's ___ that and come back to it.", ["park", "parks", "parking"]),
      // karışık
      sit("mix", "Talks are stuck on one clause, and the deal must close soon. You name the deadlock, set the clause aside and give a date. Which fits?", [
        "We're going round in circles. Let's park that and decide it by end of week.",
        "We're going round in circles. Let's drop the deal by end of week.",
        "You're stuck. Let's park the whole deal.",
      ]),
      chat("mix", ["We've argued about this clause all morning.", null], [
        "Let's park that and decide it by end of week.",
        "Let's park that and never come back to it.",
        "Let's keep arguing until someone gives up.",
      ]),
    ],
    success: "The learner names the deadlock, parks the blocker and sets a date.",
    quiz: [
      qmcq("What does parking an item allow?", [
        "the rest of the agreement to progress",
        "the item to be dropped quietly",
        "the deadline to be extended",
      ], 0),
      qfill("Let's decide ___ end of week. (by)", ["by"]),
      qmcq("What will be noticed about a park that is really a drop?", [
        "that the item was never picked up again",
        "that the wording was informal",
        "that the deadline moved",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a friend stuck in a joint decision", "to reach a decision at last",
        "A shared decision has been going nowhere for weeks.",
        "Break the deadlock.",
        "We have had this conversation four times. What now?", "frustrated"),
      sc("Mr. Vandermeer", "a counterpart stuck on one clause", "to close the deal",
        "One clause is blocking a whole contract.",
        "Park it and set a date.",
        "Neither of us will move on this clause. Where does that leave us?", "stuck"),
      sc("Ines", "a co-organiser of a trip", "to finalise the arrangements",
        "Trip arrangements have stalled on one detail.",
        "Park the detail and set a date.",
        "We still cannot agree on the dates. Shall we just cancel?", "exasperated"),
      sc("Professor Ashworth", "your tutor", "to practise deadlock language",
        "The seminar is examining deadlock.",
        "Name it, park it, date it.",
        "Our group has argued about the report title for an hour, and four sections are still unwritten. What do we do now?", "probing"),
      sc("Ms. Roux", "the examiner", "to check deadlock handling",
        "The examiner describes a stalled negotiation.",
        "Break the deadlock.",
        "Both sides have refused to move for a month. What would you do?", "neutral"),
    ],
  },

  {
    id: "c2-a-salary-conversation",
    topic: "negotiating your own terms",
    objectives: [
      "Justify a figure by contribution rather than by need.",
      "Ask about flexibility without naming a threat.",
    ],
    goal: "Negotiate your own terms without damaging the relationship.",
    target: "negotiating your own pay",
    correction: "Model the contribution-based justification and let the learner restate.",
    summary: "You practised negotiating your own terms without damaging the relationship.",
    minutes: 8,
    points: [
      {
        form: "based on what I bring",
        claims: [
          "'Based on what I bring' justifies a figure by contribution rather than by personal need.",
          "Personal need is usually less relevant to a pay decision than contribution, which your employer can check.",
        ],
        ex: ["Based on what I bring, I'd expect more.", "Based on what I bring to the team."],
      },
      {
        form: "I was hoping for",
        claims: [
          "'I was hoping for X' names a figure at low intensity, which keeps a refusal survivable.",
          "The past tense does the softening; 'I want X' turns the same figure into a demand.",
        ],
        ex: ["I was hoping for sixty thousand.", "I was hoping for something closer to sixty thousand."],
      },
      {
        form: "is there flexibility",
        claims: [
          "'Is there flexibility?' asks about the constraint rather than pressing the person.",
          "It also gets you information: the answer tells you whether the figure or the structure can move.",
        ],
        ex: ["Is there flexibility on the base?", "Is there flexibility at all here?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — based on what I bring
      sit("p1", "In a pay review, you want to justify a higher figure by your contribution, not your personal needs. What do you say?", [
        "Based on what I bring, I'd expect more.",
        "My rent went up, so I need more.",
        "Everyone else earns more than me.",
      ]),
      fc("p1", "Based on what I ___ to the team, I'd expect more.", ["bring", "brings", "bringing"]),
      lc("p1", "Based on what I bring to the team.", [
        "Bring what you want to the party.",
        "Based on what I read in the report.",
      ]),
      // p2 — I was hoping for
      sit("p2", "You want to name sixty-five thousand at low intensity, so that a refusal is easy to survive. What do you say?", [
        "I was hoping for sixty-five thousand.",
        "I want sixty-five thousand, or I leave.",
        "Give me sixty-five thousand now.",
      ]),
      chat("p2", ["What figure did you have in mind?", "I'd like to keep this friendly, even if the answer is no.", "Of course. So, the figure?", null], [
        "I was hoping for something closer to sixty thousand.",
        "I was hoping for something closer to sixty thousand, or I quit.",
        "I hope for sixty thousand yesterday.",
      ]),
      spk("p2", "I was hoping for something closer to sixty thousand."),
      // p3 — is there flexibility
      sit("p3", "Your manager says the budget is tight. You ask whether the base salary can move, without pressing. What do you say?", [
        "Is there flexibility on the base?",
        "You must find more money.",
        "Then I'll take another offer.",
      ]),
      la("p3", "Is there flexibility on the base?"),
      fc("p3", "Is ___ flexibility at all here?", ["there", "it", "they"]),
      // karışık
      sit("mix", "You led two big accounts this year and want a raise to sixty thousand. You give the reason, the figure, and ask about room to move. Which fits?", [
        "Based on what I bring, I was hoping for sixty thousand. Is there flexibility?",
        "I need more money for my rent. I want sixty.",
        "I was hoping for sixty. If not, I'm leaving.",
      ]),
      lc("mix", "Based on what I bring, I was hoping for sixty thousand.", [
        "Based on what you said, I was going to sit.",
        "I was hoping you'd bring sixty chairs.",
      ]),
    ],
    success: "The learner justifies by contribution and asks about flexibility without threatening.",
    quiz: [
      qmcq("What does 'is there flexibility?' also get you?", [
        "information about whether the figure or the structure can move",
        "a decision on the spot",
        "a written offer",
      ], 0),
      qfill("I ___ hoping for sixty. (be)", ["was"]),
      qmcq("Why is need a weak argument here?", [
        "It is not something the employer can act on.",
        "It is too personal to mention.",
        "It cannot be quantified.",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a friend rehearsing the conversation with you", "to help you prepare",
        "A friend is helping you rehearse a pay conversation.",
        "Justify by contribution.",
        "Right, I'm your boss. What are you asking me for?", "supportive"),
      sc("Mr. Vandermeer", "your manager in a review", "to keep a good person affordably",
        "A pay review is happening now.",
        "Justify by contribution and ask about flexibility.",
        "You wanted to discuss your package. What did you have in mind?", "receptive"),
      sc("Ines", "a tour agency hiring you as a guide for the summer", "to agree a rate",
        "Your weekly rate as a tour guide is being set.",
        "Justify by contribution.",
        "Our usual weekly rate for guides is four hundred. Does that work for you?", "matter-of-fact"),
      sc("Professor Ashworth", "your tutor", "to practise self-advocacy",
        "The seminar is examining pay negotiation.",
        "Justify by contribution.",
        "The university offers you a research assistant job at eighteen an hour. What do you say?", "probing"),
      sc("Ms. Roux", "the examiner", "to check self-advocacy",
        "The examiner plays your manager.",
        "Ask and justify.",
        "Why should we pay you more than we do now?", "neutral"),
    ],
  },

  {
    id: "c2-a-difficult-client",
    topic: "holding your value under pressure",
    objectives: [
      "Acknowledge frustration without conceding the point.",
      "State what is not possible without apologising for it.",
    ],
    goal: "Hold your position under sustained pressure.",
    target: "holding value under pressure",
    correction: "Model the acknowledgement-without-concession and let the learner hold again.",
    summary: "You practised holding your value under sustained pressure.",
    minutes: 8,
    points: [
      {
        form: "I understand the frustration",
        claims: [
          "'I understand the frustration' acknowledges the feeling without agreeing with the demand.",
          "Acknowledging and then conceding can signal to the other side that pressure works.",
        ],
        ex: ["I understand the frustration.", "I understand the frustration, and the answer is still no."],
      },
      {
        form: "what I can offer",
        claims: [
          "'What I can offer is X' moves from refusal to a concrete alternative.",
          "A refusal with no alternative leaves the other side nothing to accept.",
        ],
        ex: ["What I can offer is next Tuesday.", "What I can offer is a partial refund."],
      },
      {
        form: "that's simply not possible",
        claims: [
          "'That's simply not possible' presents the point as a firm constraint rather than a preference.",
          "Use it only when you genuinely cannot offer the thing: a limit that later moves can undermine every limit you state after it.",
        ],
        ex: ["That's simply not possible this week.", "I'm afraid that's simply not possible."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I understand the frustration
      sit("p1", "A client is angry that delivery cannot happen this week. You acknowledge the feeling but keep your answer. What do you say?", [
        "I understand the frustration, and the answer is still no.",
        "I understand the frustration, so fine, we'll do it.",
        "That's not my problem.",
      ]),
      lc("p1", "I understand the frustration.", [
        "I don't understand the question.",
        "I can't stand the heat in here.",
      ]),
      spk("p1", "I understand the frustration, but the answer is no."),
      // p2 — what I can offer
      sit("p2", "You refuse to add a free extra feature, but you want to give the client a concrete alternative. What do you say?", [
        "What I can offer is the feature next month at a discount.",
        "There is nothing I can offer.",
        "What I can offer is nothing at all.",
      ]),
      chat("p2", ["So you can't deliver on Friday. What now?", null], [
        "What I can offer is next Tuesday.",
        "What I can offer is Friday, as you asked.",
        "What I can't offer is anything.",
      ]),
      fc("p2", "What I can ___ is a partial refund.", ["offer", "offers", "offering"]),
      // p3 — that's simply not possible
      sit("p3", "A client wants the full project by Friday. Your team cannot do it in that time. You state it as a firm constraint. What do you say?", [
        "That's simply not possible by Friday.",
        "I'd rather not do it by Friday.",
        "Maybe, if you ask nicely.",
      ]),
      lc("p3", "I'm afraid that's simply not possible.", [
        "I'm afraid of simple questions.",
        "It's possible, but I'm afraid to try.",
      ]),
      chat("p3", ["Your team says the work needs four more days. Can't you finish it by tomorrow?", null], [
        "I'm afraid that's simply not possible.",
        "Of course, it's simply no problem.",
        "I'm afraid that's simply possible.",
      ]),
      // karışık
      sit("mix", "A client demands same-day delivery at no extra cost. It cannot be done, but next-day delivery can. Which reply fits?", [
        "I understand the frustration. That's simply not possible, but what I can offer is next-day delivery.",
        "I understand the frustration, so we'll deliver today for free.",
        "That's simply not possible, and I have nothing else to offer.",
      ]),
      lc("mix", "I understand the frustration; what I can offer is Tuesday.", [
        "I understand the question; what I can't do is Tuesday.",
        "What I can offer you is a cup of tea.",
      ]),
    ],
    success: "The learner acknowledges the frustration, holds the limit and offers an alternative.",
    quiz: [
      qmcq("What does a limit that turns out to be movable cost you?", [
        "every future limit you state",
        "the current negotiation only",
        "nothing, if you apologise",
      ], 0),
      qfill("That's ___ not possible this week. (simple)", ["simply"]),
      qmcq("How does 'that's simply not possible' present the point?", [
        "as a firm constraint rather than a preference",
        "as a personal preference",
        "as an objective law of nature",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a friend asking for too much", "to get what they want",
        "A friend is pressing for something you cannot do.",
        "Hold the limit and offer an alternative.",
        "I need you to finish my website by tomorrow. You could do it if you really wanted to, couldn't you?", "pushy"),
      sc("Mr. Vandermeer", "a client applying sustained pressure", "to get more for the same price",
        "A client is demanding the impossible.",
        "Acknowledge, refuse, offer.",
        "We need the full order this week at the same price. We have been a good customer. Can you make this happen?", "pressing"),
      sc("Ines", "a guest demanding an upgrade", "to get a better room",
        "A guest is demanding something unavailable.",
        "Hold the limit humanely.",
        "My room faces the car park, and I want a sea view tonight. There must be something you can do, surely?", "indignant"),
      sc("Professor Ashworth", "your tutor", "to practise holding position",
        "The seminar is examining pressure.",
        "Acknowledge without conceding.",
        "Imagine I am a student who wants full marks for a very late essay. What do you say to me?", "probing"),
      sc("Ms. Roux", "the examiner", "to check composure under pressure",
        "The examiner presses you repeatedly.",
        "Hold the limit and offer an alternative.",
        "I am the client: I want the work done by tomorrow at half the price. What do you say?", "neutral"),
    ],
  },

  {
    id: "c2-multi-party-negotiation",
    topic: "one agreement among three interests",
    objectives: [
      "Speak for your own side while acknowledging the others.",
      "Test for agreement across the whole room.",
    ],
    goal: "Reach one agreement among three competing interests.",
    target: "multi-party agreement",
    correction: "Model the room-wide test and let the learner check again.",
    summary: "You practised reaching one agreement among three competing interests.",
    minutes: 8,
    points: [
      {
        form: "speaking for my side",
        claims: [
          "'Speaking for my side' marks whose interest you are stating, which matters when three are present.",
          "Unmarked, a claim in a three-way room can be misheard as a claim about what everyone wants.",
        ],
        ex: ["Speaking for my side, the date matters most.", "Speaking for my side only."],
      },
      {
        form: "can we all accept",
        claims: [
          "'Can we all accept X?' tests the whole room rather than the loudest person in it.",
          "'Accept' can frame the question as what everyone can live with rather than what they prefer, which is often all a three-way deal can reach.",
        ],
        ex: ["Can we all accept that?", "Can we all accept a phased start?"],
      },
      {
        form: "that works for us",
        claims: [
          "'That works for us' commits your side explicitly so the others know where you stand.",
          "In a multi-party room silence is ambiguous, so acceptance and refusal both have to be explicit.",
        ],
        ex: ["That works for us.", "That works for us, with the earlier review."],
      },
    ],
    ex: [],
    drills: [
      // p1 — speaking for my side
      sit("p1", "Three departments are choosing a start date. You state what your own team needs and mark it as only your team's view. What do you say?", [
        "Speaking for my side, the start date matters most.",
        "Everyone here agrees the date matters most.",
        "The date matters most to all of us.",
      ]),
      lc("p1", "Speaking for my side, the budget matters most.", [
        "Speaking of dates, mine is on Friday.",
        "Speak to my side about the date.",
      ]),
      spk("p1", "Speaking for my side, scope matters more."),
      // p2 — can we all accept
      sit("p2", "Three teams have different preferences. You test whether everyone can live with a phased start, not whether they love it. What do you ask?", [
        "Can we all accept a phased start?",
        "Does everyone love a phased start?",
        "I'll decide: a phased start.",
      ]),
      chat("p2", ["Finance wants April, and sales wants July.", null], [
        "Can we all accept a start in May?",
        "Can only finance accept a start in May?",
        "We all accept April, then.",
      ]),
      la("p2", "Can we all accept a phased start?"),
      // p3 — that works for us
      sit("p3", "The group proposes May. Your team is happy with it. In a three-way meeting, you make your position explicit. What do you say?", [
        "That works for us.",
        "Whatever.",
        "That doesn't work for us.",
      ]),
      lc("p3", "That works for us, with the earlier review.", [
        "That worked for us in the last review.",
        "Does that work for you as well?",
      ]),
      fc("p3", "That ___ for us.", ["works", "work", "working"]),
      // karışık
      sit("mix", "In a three-way meeting, your team prefers June but can live with May. You mark your view, then test the room. Which fits?", [
        "Speaking for my side, we prefer June. Can we all accept May?",
        "We all prefer June. Can we all accept June?",
        "Speaking for everyone, May is final.",
      ]),
      chat("mix", ["Can everyone accept a phased start in May?", null], [
        "Speaking for my side, that works for us.",
        "Speaking for everyone, that works for us.",
        "I'd rather not say anything about that.",
      ]),
    ],
    success: "The learner marks their own interest and tests the whole room.",
    quiz: [
      qmcq("Why confirm each party's position explicitly?", [
        "Silence does not reliably show agreement or disagreement.",
        "Silence always means agreement.",
        "Every participant must speak twice.",
      ], 0),
      qfill("___ for my side, the date matters most. (speak)", ["Speaking"]),
      qmcq("Why must declining be explicit?", [
        "Silence is ambiguous and may be taken either way.",
        "It is the polite convention.",
        "Otherwise the chair must ask again.",
      ], 0),
    ],
    scenes: [
      sc("Severina", "one of three friends planning together", "to get a plan everyone accepts",
        "Three friends want different things from one plan.",
        "Speak for yourself and test the room.",
        "One of us wants the beach, one the mountains and one the city. How do we find a plan all three of us can live with?", "impatient"),
      sc("Mr. Vandermeer", "one of three departments", "to protect their own timeline",
        "Three departments need one start date.",
        "Mark your interest and test the room.",
        "Finance wants April, we want July. What do you want?", "territorial"),
      sc("Ines", "one of three travellers", "to agree an itinerary",
        "Three travellers want different itineraries.",
        "Test for something all can accept.",
        "We cannot all get what we want. Suggestions?", "pragmatic"),
      sc("Professor Ashworth", "your tutor", "to practise multi-party language",
        "The seminar is examining three-way negotiation.",
        "Mark interest and test the room.",
        "Three student groups want the same room on Friday. How do you start the meeting?", "probing"),
      sc("Ms. Roux", "the examiner", "to check multi-party handling",
        "The examiner describes three competing interests.",
        "Speak for one and test the room.",
        "Three groups want three dates. How do you proceed?", "neutral"),
    ],
  },

  {
    id: "c2-walking-away",
    topic: "ending without a deal",
    objectives: [
      "Decline a deal without blaming the other side.",
      "Leave the relationship open for later.",
    ],
    goal: "End without a deal and keep the relationship.",
    target: "walking away well",
    correction: "Model the clean decline and let the learner close.",
    summary: "You practised ending without a deal while keeping the relationship intact.",
    minutes: 8,
    points: [
      {
        form: "I don't think we",
        claims: [
          "'I don't think we can get there' declines the deal rather than the person.",
          "Locating the failure in the gap between positions reduces direct blame and keeps the focus on the positions.",
        ],
        ex: ["I don't think we can get there on price.", "I don't think we're going to agree."],
      },
      {
        form: "no hard feelings",
        claims: [
          "'No hard feelings' can mark a refusal as non-personal in a genuinely cordial exchange.",
          "After real conflict it can sound insincere or passive-aggressive, so it fits a clean disagreement.",
        ],
        ex: ["No hard feelings at all.", "No hard feelings — it was a fair offer."],
      },
      {
        form: "let's stay in touch",
        claims: [
          "'Let's stay in touch' keeps the relationship open for a future where the terms differ.",
          "It is only worth saying if you mean it; an empty version is remembered when you call.",
        ],
        ex: ["Let's stay in touch.", "Let's stay in touch — things may change."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I don't think we
      sit("p1", "The gap on price is too wide to close. You end the deal without blaming the other side. What do you say?", [
        "I don't think we can get there on price.",
        "Your offer is ridiculous.",
        "You never wanted a deal.",
      ]),
      lc("p1", "I don't think we're going to agree.", [
        "We're going to agree to that, I think.",
        "I don't think we should go to the gym.",
      ]),
      fc("p1", "I don't think we can get ___ on price.", ["there", "their", "they"]),
      // p2 — no hard feelings
      sit("p2", "A friendly negotiation ends without a deal. Nobody argued. You want to show the refusal is not personal. What do you say?", [
        "No hard feelings; it was a fair offer.",
        "No hard feelings, but you were awful.",
        "I won't forget how badly you treated me.",
      ]),
      chat("p2", ["So, no deal this time?", "Not this time, I'm afraid.", "Fair enough. Are we still friends?", null], [
        "Of course. No hard feelings.",
        "Of course. Hard feelings, though.",
        "No. I'm still angry about this.",
      ]),
      spk("p2", "No hard feelings, it was a fair offer."),
      // p3 — let's stay in touch
      sit("p3", "You turned down a supplier, but you may genuinely need them next year. You keep the relationship open. What do you say?", [
        "Let's stay in touch; things may change.",
        "Please don't contact us again.",
        "We won't need you again.",
      ]),
      fc("p3", "Let's stay in ___.", ["touch", "touched", "touching"]),
      lc("p3", "Let's stay in touch, things may change.", [
        "Let's stay at home, it looks like rain.",
        "Let's not touch anything in here.",
      ]),
      // karışık
      sit("mix", "A calm negotiation fails on price. You end it without blame, mark it as not personal, and keep the door open. Which fits?", [
        "I don't think we can get there. No hard feelings, and let's stay in touch.",
        "You ruined this. No hard feelings, though.",
        "I don't think we can get there. Don't call us again.",
      ]),
      pairs("mix", [
        ["I don't think we can get there.", "declines the deal"],
        ["No hard feelings.", "says it isn't personal"],
        ["Let's stay in touch.", "keeps the door open"],
      ]),
    ],
    success: "The learner declines without blame and keeps the relationship open.",
    quiz: [
      qmcq("What is remembered about an empty 'let's stay in touch'?", [
        "It is recalled when you next call.",
        "Nothing, it is a formality.",
        "It makes the refusal harsher.",
      ], 0),
      qfill("___ hard feelings at all. (no)", ["No"]),
      qmcq("What does 'I don't think we can get there' decline?", [
        "the deal, not the person",
        "the relationship",
        "the other side's competence",
      ], 0),
    ],
    scenes: [
      sc("Severina", "a friend whose offer you are refusing", "to part on good terms",
        "You are turning down a friend's proposal.",
        "Decline cleanly and keep the friendship.",
        "You have heard my offer to start a business together. So that is a no, then?", "disappointed"),
      sc("Mr. Vandermeer", "a counterpart in a failed negotiation", "to end professionally",
        "A negotiation has failed on price.",
        "Walk away without blame.",
        "We are too far apart, aren't we?", "resigned"),
      sc("Ines", "a seller whose price you will not meet", "to sell if possible",
        "You cannot meet the seller's price.",
        "Decline and leave the door open.",
        "Three hundred for the carpet is my final price. Yes or no?", "final"),
      sc("Professor Ashworth", "your tutor", "to practise walking away",
        "The seminar is examining failed negotiations.",
        "Decline without blame.",
        "We cannot agree on price, but we may work together next year. How would you end the conversation?", "probing"),
      sc("Ms. Roux", "the examiner", "to check closure without agreement",
        "The examiner offers terms you must refuse.",
        "Decline cleanly.",
        "That is the best I can do. Take it or leave it?", "neutral"),
    ],
  },
];
