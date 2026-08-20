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
 *  `fill()` BU SEVİYEDE SINIRLI. Çekilecek yapı yokken boşluk doldurma kalıbın
 *  kendisini hatırlatmaya dönüşür — `test-blank-fit`in yakalamadığı ama boş bir
 *  madde. Yalnız gerçek bir çekim varsa kullanıldı; yerine `mcq` (hangi durum uyar)
 *  ve `say` (üretim).
 *
 *  Gramer 4 alıştırma, phrases/practice 3.
 */
import { fill, mcq, qfill, qmcq, say, sc, type Authored } from "./dsl.js";

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
          "Two words can share a definition and still carry different suggestions: 'thrifty' and 'stingy'.",
        ],
        ex: ["That carries a suggestion of blame.", "'Cheap' carries a suggestion of poor quality as well as low price."],
      },
    ],
    ex: [
      mcq("Which sentence declines the word but keeps the point?", [
        "I'd hesitate to call it a failure, though it clearly stalled.",
        "That is completely untrue.",
        "You have misunderstood the whole project.",
      ], 0),
      mcq("Which word can suggest poor quality in addition to low price?", [
        "cheap",
        "inexpensive",
        "affordable",
      ], 0),
      say("it / be / more accurate / to say / it / stall", ["It's more accurate to say it stalled.", "It is more accurate to say it stalled."]),
    ],
    open: {
      q: "Someone calls a project of yours 'a failure'. Decline the word, offer a better one, and say what a listener could reasonably take from each of the two.",
      must: ["I'd hesitate to call", "more accurate to say", "that carries a suggestion"],
      criteria: "The answer rejects the label, supplies a better one, and weighs what each of the two words would suggest to a listener.",
      example: "I'd hesitate to call it a failure — that carries a suggestion that nothing was achieved. It's more accurate to say it stalled when the funding changed. A listener hears 'failure' as a verdict on us; 'stalled' as a fact about the money.",
    },
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
        "Two words can share a definition and still differ. How?", "probing"),
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
    ex: [
      mcq("Which remark praises against a lowered standard?", [
        "Not bad for a first attempt.",
        "This is genuinely good work.",
        "I thought this was excellent.",
      ], 0),
      mcq("Why can 'you've clearly worked hard' land badly?", [
        "Praising effort alone can imply you have little to say about the result.",
        "It is grammatically incorrect.",
        "It is too formal for most settings.",
      ], 0),
      say("well / it / be / certainly different", ["Well, it's certainly different.", "Well, it is certainly different."]),
    ],
    open: {
      q: "A close friend shows you a painting you dislike. Use faint praise as the joke it is between you, then say what the same three remarks would do to a colleague who wanted your approval.",
      must: ["it's certainly different", "not bad for", "you've clearly worked hard"],
      criteria: "The answer uses the remarks as shared irony and then separates that intent from the effect the same words would have on someone seeking approval.",
      example: "Well, it's certainly different. You've clearly worked hard, and not bad for a first attempt — I'm being awful, aren't I? To a colleague who wanted my approval, those same three lines would read as a verdict, not a joke.",
    },
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
        "Be honest. What do you actually think of it?", "teasing"),
      sc("Mr. Dunne", "a colleague quoting someone else's remark", "to work out what was meant",
        "A colleague repeats a remark and cannot read it.",
        "Explain what the remark implies.",
        "The director said my deck was 'certainly different'. Good or bad?", "uncertain"),
      sc("Amara", "a fellow guest at a dinner", "to gossip discreetly about the food",
        "A dinner has produced an unusual dish.",
        "Use faint praise knowingly.",
        "So — what did you make of that main course?", "conspiratorial"),
      sc("Dr. Ferreira", "your tutor", "to practise implicature",
        "The seminar is examining faint praise.",
        "Explain the mechanism and its cost.",
        "How does praise end up being heard as criticism?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check pragmatic awareness",
        "The examiner quotes a faintly praising remark.",
        "Explain what it implies and where it belongs.",
        "A reviewer wrote that a novel was 'certainly ambitious'. Praise?", "neutral"),
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
          "The flag is what keeps it honest: without it the loose claim is heard as a precise one.",
        ],
        ex: ["Yes, in a manner of speaking.", "We agreed, in a manner of speaking."],
      },
    ],
    ex: [
      mcq("When is 'something along those lines' misleading rather than careful?", [
        "when the detail is fixed and you are concealing it",
        "when the detail is genuinely not decided",
        "when the question is about timing",
      ], 0),
      mcq("What does 'one might say' do to a formulation?", [
        "presents it tentatively and at some distance",
        "attributes it to a named source",
        "marks it as certainly false",
      ], 0),
      fill("___ might say the timing was unfortunate. (one)", ["One"]),
      say("we / agree / in a manner of speaking", ["We agreed, in a manner of speaking."]),
    ],
    open: {
      q: "A journalist asks when your product launches. The date is genuinely not fixed. Answer responsively without inventing one.",
      must: ["something along those lines", "one might say", "in a manner of speaking"],
      criteria: "The answer stays responsive, declines the specific, and does not imply a decision that has not been made.",
      example: "Later in the year, or something along those lines — one might say the date depends on testing. We have a plan, in a manner of speaking, but nothing is fixed.",
    },
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
        "Where is the line between declining to specify and misleading?", "probing"),
      sc("Mr. Sanderson", "the examiner", "to check hedged answering",
        "The examiner presses for a specific you do not have.",
        "Answer responsively without inventing one.",
        "Exactly how many hours a week do you study?", "neutral"),
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
          "In British English this register is common enough that a listener may take it literally.",
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
    ex: [
      mcq("Which form signals to the listener that you are understating?", [
        "He was annoyed, to put it mildly.",
        "He was slightly irritated.",
        "It was something of an issue.",
      ], 0),
      mcq("Why can understatement fail?", [
        "The listener may not know how bad the thing actually is.",
        "It is grammatically ambiguous.",
        "It requires the passive voice.",
      ], 0),
      say("it / be / expensive / to put it mildly", ["It was expensive, to put it mildly.", "It is expensive, to put it mildly."]),
    ],
    open: {
      q: "Describe something that went badly wrong to a colleague who already knows the scale, then to a stranger who does not.",
      must: ["slightly inconvenient", "something of an issue", "to put it mildly"],
      criteria: "The answer understates with the informed listener and signals the understatement to the uninformed one.",
      example: "To my colleague: losing the servers was slightly inconvenient. To a stranger: the budget is something of an issue — it went badly wrong, to put it mildly.",
    },
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
        "So how was the great disaster, then?", "amused"),
      sc("Ms. Iyer", "a colleague being briefed", "to grasp the real scale",
        "A colleague needs the real scale, not a joke.",
        "Signal the understatement.",
        "Give me the short version. How bad is it?", "focused"),
      sc("Tobias", "a stranger on a delayed train", "to pass the time",
        "A stranger asks about your delay.",
        "Understate with the signal.",
        "Have you been waiting long?", "sympathetic"),
      sc("Dr. Marchetti", "your tutor", "to practise register dialling",
        "The seminar is examining over- and understatement.",
        "Dial the description and justify it.",
        "When does understatement stop working?", "probing"),
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
          "Choosing one is the difficulty; a list of four adjectives describes nobody in particular.",
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
    ex: [
      mcq("Which description commits to one central quality?", [
        "What defines them is patience.",
        "They are nice, clever, funny and kind.",
        "They are a really good person.",
      ], 0),
      mcq("What does 'comes across as' report?", [
        "the impression someone gives",
        "an established fact about them",
        "the speaker's own feelings",
      ], 0),
      say("I / would describe / them / as / relentless", ["I'd describe them as relentless.", "I would describe them as relentless."]),
    ],
    open: {
      q: "Describe someone you know well so that a stranger would recognise them: one defining quality, the impression they give, and your own reading.",
      must: ["what defines them is", "they come across as", "I'd describe them as"],
      criteria: "The answer names a specific quality and separates the impression given from the speaker's own reading.",
      example: "What defines them is how carefully they listen. They come across as reserved at first, though I'd describe them as quietly attentive rather than distant.",
    },
    success: "The learner names a specific quality and separates impression from judgement.",
    quiz: [
      qmcq("Why does a list of four adjectives fail?", [
        "It describes nobody in particular.",
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
        "Why does naming four qualities describe nobody?", "probing"),
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
          "If the restatement adds a fact it is not a reframing, and the signal becomes a lie.",
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
          "Holding both is the point: dropping the first framing turns reframing into retraction.",
        ],
        ex: ["Or you could say we were cautious.", "Or you could say it was never viable."],
      },
    ],
    ex: [
      mcq("What turns a reframing into something dishonest?", [
        "adding a fact that was not there",
        "using the passive voice",
        "keeping the original framing too",
      ], 0),
      mcq("Which phrase offers an alternative without dropping your own view?", [
        "Or you could say we were cautious.",
        "I was wrong about that.",
        "Forget what I said before.",
      ], 0),
      say("put another way / we / choose / caution", ["Put another way, we chose caution."]),
    ],
    open: {
      q: "A launch was delayed by six months and cost twice the budget. Frame it three ways, all true.",
      must: ["put another way", "seen differently", "or you could say"],
      criteria: "The answer gives three framings of the same facts without adding or removing any.",
      example: "The launch was six months late at twice the planned cost. Put another way, we delivered, but on neither the schedule nor the budget. Seen differently, that is a half-year delay and a 100% overrun. Or you could say both targets were missed.",
    },
    success: "The learner produces three framings without altering the facts.",
    quiz: [
      qmcq("What does 'seen differently' change?", [
        "the vantage point, not the content",
        "the facts of the case",
        "the tense of the verbs",
      ], 0),
      qfill("___ another way, nobody was ready. (put)", ["Put"]),
      qmcq("Why hold both framings?", [
        "Dropping the first turns reframing into retraction.",
        "It makes the answer longer.",
        "It avoids the first person.",
      ], 0),
    ],
    scenes: [
      sc("Ivo", "a friend hearing your version", "to understand what really happened",
        "A friend has heard one version of an event.",
        "Reframe it truthfully.",
        "I heard it was a disaster. Was it?", "sceptical"),
      sc("Ms. Delgado", "a colleague preparing a review", "to present a fair account",
        "A review must present one set of facts fairly.",
        "Give three truthful framings.",
        "The board will hear this two ways. How do we put it?", "strategic"),
      sc("Hakan", "a fellow traveller comparing experiences", "to compare readings of the same trip",
        "You both experienced the same difficult trip.",
        "Reframe without changing facts.",
        "That was the worst holiday I have had. You disagree?", "wry"),
      sc("Dr. Marchetti", "your tutor", "to practise reframing",
        "The seminar is examining framing.",
        "Reframe without adding facts.",
        "Where does reframing become misrepresentation?", "probing"),
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
    ex: [
      mcq("Why flag deliberate caution?", [
        "Unflagged careful speech is often read as hiding something.",
        "It is grammatically required.",
        "It shortens the answer.",
      ], 0),
      mcq("What does 'let me rephrase that' withdraw?", [
        "the wording, not the point",
        "the whole argument",
        "the previous speaker's claim",
      ], 0),
      say("let me / rephrase / I / put / that / badly", ["Let me rephrase — I put that badly.", "Let me rephrase, I put that badly."]),
    ],
    open: {
      q: "You are asked on the record whether your team knew about a fault. You knew of a risk, not the fault. Answer precisely.",
      must: ["I want to be careful", "let me rephrase", "what I mean precisely"],
      criteria: "The answer flags the caution, corrects its own wording once, and states the precise claim.",
      example: "I want to be careful here. We were aware of a risk — let me rephrase, we had seen one report. What I mean precisely is that nobody had confirmed a fault.",
    },
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
        "You can tell me. What actually happened?", "gentle"),
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
        "Why is unflagged caution read as evasion?", "probing"),
      sc("Mr. Sanderson", "the examiner", "to check precision",
        "The examiner asks a question with a trap in it.",
        "Answer precisely.",
        "So you are saying nobody was responsible?", "neutral"),
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
    ex: [
      mcq("Which appeal rests on consequence?", [
        "Think about what happens if nobody acts.",
        "The evidence points to a slowdown.",
        "You know as well as I do.",
      ], 0),
      mcq("What does 'points to' claim about the evidence?", [
        "that it supports a direction rather than proving a conclusion",
        "that it is conclusive",
        "that it comes from an authority",
      ], 0),
      say("you / know / as well / as I / do / how this / end", ["You know as well as I do how this ends."]),
    ],
    open: {
      q: "Persuade a cautious manager to fund a trial using all three appeals, then say which one you would drop with a listener who distrusts you, and why.",
      must: ["think about what happens", "you know as well", "evidence points to"],
      criteria: "The answer uses all three appeals and justifies dropping one for a listener who distrusts the speaker.",
      example: "The evidence points to demand we cannot meet. You know as well as I do what a stockout costs. Think about what happens if a competitor gets there first. With someone who distrusts me I would drop the shared-knowledge appeal — it would read as pressure.",
    },
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
        "I know I should deal with it. Why now, though?", "reluctant"),
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
        "Which appeal works on someone who distrusts you?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasive range",
        "The examiner asks you to argue a case.",
        "Use all three appeals.",
        "Persuade me that cities should ban cars?", "neutral"),
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
    ex: [
      fill("Who ___ want a shorter week? (would not)", ["wouldn't", "would not"]),
      mcq("When does 'who wouldn't want X?' fail?", [
        "when a reasonable person would answer 'I wouldn't'",
        "when the listener agrees with you",
        "when the sentence is long",
      ], 0),
      mcq("What does 'isn't that the point?' do to an objection?", [
        "turns it into support for your case",
        "concedes it entirely",
        "changes the subject",
      ], 0),
      say("why / would / anyone / risk / it / twice", ["Why would anyone risk it twice?"]),
    ],
    open: {
      q: "Argue for a four-day week using all three question forms, and say where a listener could turn one against you.",
      must: ["who wouldn't want", "isn't that the point", "why would anyone"],
      criteria: "The answer uses all three forms and identifies one that a listener could answer against the speaker.",
      example: "Who wouldn't want a shorter working week? Why would anyone reject a trial before seeing the results? Of course, a shift worker might have good reasons to object — but isn't that the point of testing different models first?",
    },
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
        "Go on then, make the case for a four-day week?", "challenging"),
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
        "How does a rhetorical question hand the point away?", "probing"),
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
    ex: [
      mcq("Which phrase depends on the count being exact?", [
        "not once but twice",
        "again and again",
        "over and over",
      ], 0),
      mcq("What does 'over and over' emphasise?", [
        "the wearing effect rather than the count",
        "the precise number",
        "the speaker's authority",
      ], 0),
      say("they / miss / it / not once but twice", ["They missed it not once but twice."]),
    ],
    open: {
      q: "Complain about a supplier who has failed repeatedly. Use repetition for force, and be exact where you claim a number.",
      must: ["again and again", "not once but twice", "over and over"],
      criteria: "The answer uses repetition for emphasis and keeps any stated count accurate.",
      example: "We raised the same fault again and again. We explained the impact over and over. And they missed the deadline not once but twice this quarter.",
    },
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
        "This draft reads flat. Can you make it land?", "practical"),
      sc("Hakan", "a fellow passenger after repeated delays", "to share the frustration",
        "The same delay has happened repeatedly.",
        "Use repetition for effect.",
        "Third time this week, is it?", "exasperated"),
      sc("Dr. Marchetti", "your tutor", "to practise emphasis",
        "The seminar is examining repetition.",
        "Use repetition and name its limit.",
        "When does repetition stop adding force?", "probing"),
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
          "A solution presented before the problem forces the listener to reconstruct the problem themselves.",
        ],
        ex: ["Here's the opportunity we are missing.", "Here's the opportunity in plain terms."],
      },
      {
        form: "what this gives you",
        claims: [
          "'What this gives you is X' states the benefit in the listener's terms, not the builder's.",
          "'You' is the work: the same sentence with 'we' describes your project instead of their gain.",
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
    ex: [
      mcq("Why open with the opportunity rather than the solution?", [
        "Otherwise the listener must reconstruct the problem themselves.",
        "It is the conventional order in English.",
        "It makes the pitch shorter.",
      ], 0),
      mcq("Which sentence states the benefit in the listener's terms?", [
        "What this gives you is two weeks back.",
        "We have built a scheduling tool.",
        "Our team worked on this for months.",
      ], 0),
      say("imagine / if / we / could / halve / that", ["Imagine if we could halve that."]),
    ],
    open: {
      q: "Pitch a tool that saves your team two weeks a quarter. Open with the opportunity, give the benefit, and end with a specific ask.",
      must: ["here's the opportunity", "what this gives you", "imagine if we could"],
      criteria: "The answer opens with the gap, states the benefit in the listener's terms and ends with a concrete ask.",
      example: "Here's the opportunity: we lose two weeks a quarter to scheduling. Imagine if we could halve that. What this gives you is two weeks of team capacity back each quarter. I'm asking for approval to run a six-week trial.",
    },
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
        "Why does a pitch fail without an ask?", "probing"),
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
          "It disarms the objection they were assembling, because you have said it first.",
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
    ex: [
      mcq("Why is 'hear me out' a smaller ask than 'agree with me'?", [
        "It asks for a hearing, not a decision.",
        "It is shorter.",
        "It is more formal.",
      ], 0),
      mcq("What makes 'you're right to question it' credible?", [
        "answering the question rather than moving past it",
        "saying it early",
        "repeating it twice",
      ], 0),
      say("I / know / how / it / sound / and I / think / the same", ["I know how it sounds, and I thought the same."]),
    ],
    open: {
      q: "Someone has already decided your proposal is too expensive. Acknowledge the scepticism, ask for a hearing, and answer the cost objection.",
      must: ["I know how it sounds", "hear me out", "you're right to question"],
      criteria: "The answer acknowledges the objection, asks for a hearing and then actually answers the objection.",
      example: "I know how it sounds. Hear me out for two minutes. You're right to question the cost — it is high in year one and lower than the current spend by year three.",
    },
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
        "This sounds like a terrible idea. Convince me?", "sceptical"),
      sc("Mr. Dunne", "a colleague opposed on cost", "to protect the budget",
        "A colleague has decided the proposal is too expensive.",
        "Acknowledge and answer the cost objection.",
        "We cannot afford this. What am I missing?", "resistant"),
      sc("Amara", "a fellow traveller doubting your route", "to avoid a bad decision",
        "Your companion thinks your plan will fail.",
        "Ask for a hearing and answer.",
        "We will miss the connection. Why risk it?", "worried"),
      sc("Dr. Ferreira", "your tutor", "to practise persuading a sceptic",
        "The seminar is examining resistance.",
        "Acknowledge, ask, answer.",
        "Why say the objection out loud before they do?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasion under resistance",
        "The examiner states a firm objection.",
        "Get a hearing and answer it.",
        "I think working from home makes teams worse. Well?", "neutral"),
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
    ex: [
      mcq("What undoes 'it's entirely your call'?", [
        "following it with more argument",
        "saying it after your case",
        "saying it quietly",
      ], 0),
      mcq("Why are the hedges in 'it might be worth considering' load-bearing?", [
        "Without them it becomes advice that was not requested.",
        "They make the sentence grammatical.",
        "They shorten the sentence.",
      ], 0),
      say("have / a look / no obligation / at all", ["Have a look — no obligation at all.", "Have a look, no obligation at all."]),
    ],
    open: {
      q: "A friend has not asked for advice, but you think a professional course would help them. Mention it once and leave the decision with them.",
      must: ["it's entirely your call", "it might be worth considering", "no obligation at all"],
      criteria: "The answer states the view once, hands the decision back, and does not argue after handing it back.",
      example: "It might be worth considering the short course they run in September. Have a look if you want — no obligation at all, and I won't raise it again. It's entirely your call.",
    },
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
        "I'm fine, honestly. Why do you keep looking at me like that?", "guarded"),
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
        "When does reassurance become pressure?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check restraint",
        "The examiner describes their own decision.",
        "Offer a view without pressing.",
        "I am thinking of giving up my degree. Thoughts?", "neutral"),
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
    ex: [
      mcq("What does 'what would convince you?' test?", [
        "whether any evidence would change their mind",
        "how much they know",
        "whether they are listening",
      ], 0),
      mcq("Why ask for a shift rather than agreement?", [
        "It leaves room to move partway.",
        "It is more polite.",
        "It avoids the conditional.",
      ], 0),
      say("I / be / ask / you / to / look at / the data / once", ["I'm asking you to look at the data once.", "I am asking you to look at the data once."]),
    ],
    open: {
      q: "Someone says remote work harms teams. You ask what would convince them; they answer 'evidence from our own team'. Respond, check for movement, and name one small change.",
      must: ["what would convince you", "does that shift anything", "I'm asking you to"],
      criteria: "The answer tests what evidence would move them, checks for movement, and names a specific small change.",
      example: "What would convince you otherwise? If our own team's evidence would: retention rose twelve per cent during the trial. Does that shift anything? I'm asking you to look at one quarter of data before deciding.",
    },
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
        "I have thought this for twenty years. What could possibly change it?", "immovable"),
      sc("Mr. Dunne", "a manager set against remote work", "to make the right call for the team",
        "A manager believes remote work harms teams.",
        "Ask what would convince them.",
        "Teams need to be in a room. Surely you agree?", "entrenched"),
      sc("Amara", "a fellow traveller with a firm opinion", "to have a real argument",
        "A long journey has produced a real disagreement.",
        "Test for movement.",
        "Nothing you say will change my mind — so why keep going?", "stubborn"),
      sc("Dr. Ferreira", "your tutor", "to practise genuine persuasion",
        "The seminar is examining belief change.",
        "Test what evidence would move them.",
        "Why ask what would convince someone before arguing?", "probing"),
      sc("Ms. Whitmore", "the examiner", "to check persuasive technique",
        "The examiner holds a firm view.",
        "Test for movement and name a change.",
        "Exams are the only fair way to assess. Change my mind?", "neutral"),
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
    ex: [
      mcq("Why does a goal invite more than a demand does?", [
        "A goal invites a counter-offer rather than a yes or no.",
        "A goal is more polite.",
        "A demand is grammatically stronger.",
      ], 0),
      mcq("What does calling a figure 'our starting point' signal?", [
        "that it is an opening rather than a limit",
        "that the figure is final",
        "that you cannot afford more",
      ], 0),
      say("that / be / our starting point / on volume", ["That is our starting point on volume.", "That's our starting point on volume."]),
    ],
    open: {
      q: "Open a negotiation for a supply contract: state your goal, mark your figure as an opening, and name your best case.",
      must: ["what we're looking for", "our starting point", "ideally we'd want"],
      criteria: "The answer opens with a goal, marks the figure as an opening and distinguishes the best case from the requirement.",
      example: "What we're looking for is a three-year term. Our starting point is forty units a month. Ideally we'd want delivery by June.",
    },
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
        "I have had a lot of interest. What are you offering?", "confident"),
      sc("Mr. Vandermeer", "a supplier's negotiator", "to agree favourable terms",
        "A supply contract negotiation is opening.",
        "State your goal and mark your opening.",
        "Let us start with your numbers. Where are you?", "businesslike"),
      sc("Ines", "a landlord discussing a lease", "to let the property on good terms",
        "Lease terms are being opened.",
        "Open without closing the conversation.",
        "The advertised rent is the rent. Or is it?", "firm"),
      sc("Professor Ashworth", "your tutor", "to practise opening moves",
        "The seminar is examining opening positions.",
        "Open with a goal and mark it as an opening.",
        "Why does an opening demand cost you the negotiation?", "probing"),
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
          "'We could move on price' names which item is in play and, by omission, which are not.",
          "'Could' keeps the movement hypothetical until you get something in return.",
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
    ex: [
      mcq("What happens to a concession offered before its condition?", [
        "The other side has already banked it.",
        "It becomes more persuasive.",
        "It must be repeated.",
      ], 0),
      mcq("What does 'could' do in 'we could move on price'?", [
        "keeps the movement hypothetical until you get something back",
        "makes the offer final",
        "signals uncertainty about the figure",
      ], 0),
      say("if / you / can do / June / we / can do / the higher volume", ["If you can do June, we can do the higher volume."]),
    ],
    open: {
      q: "You can accept a later date if you get a longer contract. Offer the trade without giving the date away first.",
      must: ["if you can do", "we could move on", "in exchange for"],
      criteria: "The answer conditions the concession in the same breath and names the exchange.",
      example: "We could move on timing, not on scope. If you can do a three-year term, we could accept September in exchange for the longer commitment.",
    },
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
        "Knock something off and I will take it today. Deal?", "opportunistic"),
      sc("Mr. Vandermeer", "a client renegotiating terms", "to improve their terms",
        "A client wants a later date without giving anything.",
        "Condition the concession.",
        "We need September rather than June. That is fine, isn't it?", "presumptuous"),
      sc("Ines", "a market trader", "to close a sale",
        "A price is being haggled in a market.",
        "Trade explicitly.",
        "For you, a special price. What do you say?", "shrewd"),
      sc("Professor Ashworth", "your tutor", "to practise conditional concession",
        "The seminar is examining trading.",
        "Condition every concession.",
        "Why must the condition come in the same breath?", "probing"),
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
        ex: ["Let's park that and come back to it.", "Let's park the indemnity clause."],
      },
    ],
    ex: [
      mcq("Why does naming a deadlock work only once?", [
        "Repeated, it becomes a complaint about the other side.",
        "It is grammatically awkward.",
        "The phrase is too informal.",
      ], 0),
      mcq("What removes the leverage of a deadline?", [
        "letting it pass without consequence",
        "setting it in writing",
        "naming it early",
      ], 0),
      say("let us / park / that / and / come back / to it", ["Let's park that and come back to it.", "Let us park that and come back to it."]),
    ],
    open: {
      q: "A negotiation has stalled on one clause with four items still open. Name the deadlock, park the clause and set a date.",
      must: ["going round in circles", "by end of week", "let's park that"],
      criteria: "The answer names the deadlock without blame, parks the blocking item and sets a real date.",
      example: "We're going round in circles on this clause. Let's park that and deal with the other four items. We decide the clause by end of week, either way.",
    },
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
        "Why must a parked item be picked up again?", "probing"),
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
          "Need is not an argument your employer can act on; contribution is one they can check.",
        ],
        ex: ["Based on what I bring, I'd expect more.", "Based on what I bring to the team."],
      },
      {
        form: "I was hoping for",
        claims: [
          "'I was hoping for X' names a figure at low intensity, which keeps a refusal survivable.",
          "The past tense does the softening; 'I want X' turns the same figure into a demand.",
        ],
        ex: ["I was hoping for sixty.", "I was hoping for something closer to sixty."],
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
    ex: [
      mcq("Why justify a figure by contribution rather than need?", [
        "Contribution is something the employer can check and act on.",
        "Need is impolite to mention.",
        "Contribution is easier to describe.",
      ], 0),
      mcq("What does the past tense in 'I was hoping for' do?", [
        "lowers the intensity so a refusal is survivable",
        "places the request in the past",
        "makes the figure negotiable",
      ], 0),
      say("be / there / flexibility / on the base", ["Is there flexibility on the base?"]),
    ],
    open: {
      q: "Ask for a rise. Justify the figure by what you contribute, name it softly, and ask about flexibility.",
      must: ["based on what I bring", "I was hoping for", "is there flexibility"],
      criteria: "The answer justifies by contribution, names a figure at low intensity and asks about the constraint.",
      example: "Based on what I bring — two accounts and the onboarding rewrite — I was hoping for something closer to sixty. Is there flexibility on the base, or is the structure fixed?",
    },
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
        "You wanted to discuss your package. Go ahead?", "receptive"),
      sc("Ines", "a client setting your day rate", "to agree a rate",
        "A freelance rate is being set.",
        "Justify by contribution.",
        "Our usual rate is four hundred. Does that work?", "matter-of-fact"),
      sc("Professor Ashworth", "your tutor", "to practise self-advocacy",
        "The seminar is examining pay negotiation.",
        "Justify by contribution.",
        "Why is need a weak argument in a pay conversation?", "probing"),
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
          "Acknowledging and then conceding teaches the other side that pressure works.",
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
          "Use it only when you genuinely cannot offer the thing: a limit that later moves costs you every future limit.",
        ],
        ex: ["That's simply not possible this week.", "I'm afraid that's simply not possible."],
      },
    ],
    ex: [
      mcq("What does acknowledging and then conceding teach?", [
        "that pressure works",
        "that you are reasonable",
        "that the limit is real",
      ], 0),
      mcq("Why offer an alternative with a refusal?", [
        "A refusal alone leaves nothing to accept.",
        "It sounds more apologetic.",
        "It shortens the conversation.",
      ], 0),
      say("what / I / can offer / be / next Tuesday", ["What I can offer is next Tuesday."]),
    ],
    open: {
      q: "A client demands delivery this week at the same price. It cannot be done. Acknowledge, refuse and offer an alternative.",
      must: ["I understand the frustration", "what I can offer", "that's simply not possible"],
      criteria: "The answer acknowledges the feeling, holds the limit and offers a concrete alternative.",
      example: "I understand the frustration, but delivery this week at that price — that's simply not possible. The full scope takes four days. What I can offer is Tuesday delivery, or a reduced scope by Friday.",
    },
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
        "You could do it if you really wanted to, couldn't you?", "pushy"),
      sc("Mr. Vandermeer", "a client applying sustained pressure", "to get more for the same price",
        "A client is demanding the impossible.",
        "Acknowledge, refuse, offer.",
        "We have been a good customer. Make this happen?", "pressing"),
      sc("Ines", "a guest demanding an upgrade", "to get a better room",
        "A guest is demanding something unavailable.",
        "Hold the limit humanely.",
        "There must be something you can do. Well?", "indignant"),
      sc("Professor Ashworth", "your tutor", "to practise holding position",
        "The seminar is examining pressure.",
        "Acknowledge without conceding.",
        "What does conceding after acknowledging teach the other side?", "probing"),
      sc("Ms. Roux", "the examiner", "to check composure under pressure",
        "The examiner presses you repeatedly.",
        "Hold the limit and offer an alternative.",
        "I am not accepting that answer. Try again?", "neutral"),
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
          "Unmarked, a claim in a three-way room is heard as a claim about what everyone wants.",
        ],
        ex: ["Speaking for my side, the date matters most.", "Speaking for my side only."],
      },
      {
        form: "can we all accept",
        claims: [
          "'Can we all accept X?' tests the whole room rather than the loudest person in it.",
          "'Accept' asks for less than 'agree', which is often what a three-way deal can actually reach.",
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
    ex: [
      mcq("Why mark whose interest you are stating?", [
        "Unmarked, it is heard as a claim about what everyone wants.",
        "It is more formal.",
        "It shortens the discussion.",
      ], 0),
      mcq("Why does 'accept' ask for less than 'agree'?", [
        "Accepting allows someone to live with a deal they do not prefer.",
        "It is a shorter word.",
        "It is the legal term.",
      ], 0),
      say("can / we / all / accept / a phased start", ["Can we all accept a phased start?"]),
    ],
    open: {
      q: "Three departments want different start dates. Speak for yours, test the room, and commit or decline explicitly.",
      must: ["speaking for my side", "can we all accept", "that works for us"],
      criteria: "The answer marks its own interest, tests the whole room and commits or declines explicitly.",
      example: "Speaking for my side, the date matters more than the scope. Can we all accept a phased start in May? If the review moves earlier, that works for us.",
    },
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
        "So that is three different answers. Who is going to decide?", "impatient"),
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
        "Why does a two-way habit fail in a three-way room?", "probing"),
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
          "Locating the failure in the gap between positions leaves nobody to blame.",
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
    ex: [
      mcq("Why locate the failure in the gap between positions?", [
        "It leaves nobody to blame.",
        "It is more formal.",
        "It avoids naming the price.",
      ], 0),
      mcq("When can 'no hard feelings' sound insincere?", [
        "after a genuinely acrimonious negotiation",
        "when it is said first",
        "when the deal was large",
      ], 0),
      say("I / not think / we / can get / there / on price", ["I don't think we can get there on price.", "I do not think we can get there on price."]),
    ],
    open: {
      q: "Decline a deal you cannot make work. Blame neither side, keep it clean, and leave the door open.",
      must: ["I don't think we", "no hard feelings", "let's stay in touch"],
      criteria: "The answer declines without blame and leaves the relationship genuinely open.",
      example: "I don't think we can get there on price — the gap is too wide this year. No hard feelings at all; it was a fair offer. Let's stay in touch, because things may change.",
    },
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
        "So that is a no, then?", "disappointed"),
      sc("Mr. Vandermeer", "a counterpart in a failed negotiation", "to end professionally",
        "A negotiation has failed on price.",
        "Walk away without blame.",
        "We are too far apart, aren't we?", "resigned"),
      sc("Ines", "a seller whose price you will not meet", "to sell if possible",
        "You cannot meet the seller's price.",
        "Decline and leave the door open.",
        "That is my final price. Yes or no?", "final"),
      sc("Professor Ashworth", "your tutor", "to practise walking away",
        "The seminar is examining failed negotiations.",
        "Decline without blame.",
        "Why does walking away well matter more than the deal?", "probing"),
      sc("Ms. Roux", "the examiner", "to check closure without agreement",
        "The examiner offers terms you must refuse.",
        "Decline cleanly.",
        "That is the best I can do. Take it or leave it?", "neutral"),
    ],
  },
];
