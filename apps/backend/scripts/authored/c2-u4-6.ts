/** C2 · Ünite 4-6 — Debate · Humour and Irony · Storytelling at Length (21 ders).
 *
 *  Parti 1 incelemesinden gelen kalıcı kurallar burada baştan uygulanıyor:
 *   · İddia mutlak değil: kalıbın NEREDE işlediğini VE NEREDE düştüğünü söyler.
 *   · Görev bir cevaba tepki istiyorsa o cevabı VERİR — tek turlu bir açık uçlu
 *     adımda öğrenci karşı tarafın yanıtını bekleyemez.
 *   · Örnek cevap kendi ölçütünü karşılar ve üç kalıbın hepsini gösterir.
 *   · Vaat (`objectives`/`summary`) öğretilenle birebir aynı adı taşır.
 *   · C2 TALEBİ: görev üç kalıbı birleştirmekten fazlasını ister — iki okumayı
 *     tartmak, dinleyiciye göre seçmek, kasıt ile gerçek etkiyi ayırmak.
 *
 *  Ünite 5 hedeflerinin çoğu TERSİNİ SÖYLER (`how thrilling`, `can't wait`,
 *  `oh brilliant`). Sahne, ironinin OKUNABİLDİĞİ bir durum vermek zorunda —
 *  yoksa judge düz kullanımı da hedef sayar ve ders ölçmediği şeyi ölçer.
 *  `sarcasm-and-its-risks` `faint-praise` ile aynı sınıf: düz öğretilir, bedeli
 *  söylenir, sahne kalıbın meşru olduğu yere kurulur.
 *
 *  Ünite 6'da beceri UZUNLUĞUN KENDİSİ. `exampleAnswer` sınırı 320'ye çıkarıldığı
 *  için (c1-sustaining-a-long-turn ile aynı gerekçe) örnekler gerçekten uzun bir
 *  sıra modelleyebiliyor.
 *
 *  `fill()` yalnız gerçek çekim olan yerde: `switching-time-for-effect` zaman
 *  değiştiriyor, ünitenin tek gramer dersi ve 4 alıştırma taşıyor.
 */
import { fill, mcq, qfill, qmcq, say, sc, type Authored } from "./dsl.js";

export const C2_U4_6: Authored[] = [
  // --- Ünite 4 · Debate ------------------------------------------------------
  {
    id: "c2-framing-the-question",
    topic: "defining the terms before arguing",
    objectives: [
      "Define a contested term before the argument starts.",
      "Identify which question the disagreement actually turns on.",
    ],
    goal: "Settle what is being argued before arguing it.",
    target: "framing the question",
    correction: "Model the definition move and let the learner reframe.",
    summary: "You learned to define the terms before the argument starts.",
    minutes: 8,
    points: [
      {
        form: "before we start let's",
        claims: [
          "'Before we start, let's agree what we mean by X' puts the definition ahead of the dispute.",
          "The definition shapes what counts as evidence, so proposing one is itself a move in the argument.",
        ],
        ex: ["Before we start, let's agree what 'fair' means.", "Before we start, let's define the scope."],
      },
      {
        form: "what exactly do we mean",
        claims: [
          "'What exactly do we mean by X?' asks for the definition rather than supplying it.",
          "Asking commits you less than proposing, and it can expose a disagreement a supplied definition would conceal.",
        ],
        ex: ["What exactly do we mean by 'success'?", "What exactly do we mean here?"],
      },
      {
        form: "that's the real question",
        claims: [
          "'That's the real question' relocates the argument to the point you think decides it.",
          "It only lands if the relocation is genuine; used to dodge, it is heard as changing the subject.",
        ],
        ex: ["That's the real question, not the cost.", "That's the real question underneath it."],
      },
    ],
    ex: [
      mcq("Which move commits the speaker least?", [
        "What exactly do we mean by 'success'?",
        "Success means growth, obviously.",
        "You clearly do not understand success.",
      ], 0),
      mcq("When is 'that's the real question' heard as changing the subject?", [
        "when the relocation is a dodge rather than genuine",
        "when it comes early in the argument",
        "when the room is small",
      ], 0),
      say("before we start / let us / define / the scope", ["Before we start, let's define the scope.", "Before we start, let us define the scope."]),
    ],
    open: {
      q: "A debate is starting on whether your city's transport is 'affordable'. Frame the question, and say how a different definition would change who wins.",
      must: ["before we start let's", "what exactly do we mean", "that's the real question"],
      criteria: "The answer proposes or requests a definition and shows how a rival definition would change the outcome.",
      example: "Before we start, let's agree what 'affordable' means. What exactly do we mean: a fare below the national cap, or one costing under five per cent of a low household income? That's the real question — the current fare meets the first test and fails the second.",
    },
    success: "The learner defines the term and shows how a rival definition changes the outcome.",
    quiz: [
      qmcq("Why is proposing a definition itself a move?", [
        "The definition shapes what counts as evidence.",
        "It saves time in a debate.",
        "It is the conventional opening.",
      ], 0),
      qfill("What ___ do we mean by 'success'? (exact)", ["exactly"]),
      qmcq("What does 'that's the real question' do?", [
        "relocates the argument to the point you think decides it",
        "concedes the previous point",
        "asks for a definition",
      ], 0),
    ],
    scenes: [
      sc("Bartholomew", "a friend arguing at cross purposes", "to settle what you disagree about",
        "You and a friend have been arguing past each other for ten minutes.",
        "Frame the question before continuing.",
        "We keep saying 'fair' and getting nowhere. Why is that?", "frustrated"),
      sc("Ms. Aturu", "a colleague opening a review", "to keep a review on the real issue",
        "A review is about to argue over an undefined word.",
        "Define the term first.",
        "So — was the project a success or not?", "brisk"),
      sc("Rui", "a fellow traveller in a debate", "to have a productive argument",
        "A long journey has produced a vague argument.",
        "Frame the question.",
        "Tourism ruins places. You disagree, obviously?", "provocative"),
      sc("Professor Halvard", "your tutor", "to practise framing",
        "The seminar is examining how debates are framed.",
        "Frame the question and show the stakes.",
        "How does a definition decide what counts as evidence?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check framing control",
        "The examiner opens with an undefined term.",
        "Frame the question first.",
        "Is your country's healthcare system fair?", "neutral"),
    ],
  },

  {
    id: "c2-attacking-an-argument",
    topic: "going after the reasoning, not the person",
    objectives: [
      "Name the hidden assumption in an argument.",
      "Show that a conclusion does not follow from its premises.",
    ],
    goal: "Attack the reasoning without attacking the person.",
    target: "attacking reasoning",
    correction: "Name the assumption and let the learner attack again.",
    summary: "You learned to go after the reasoning rather than the person.",
    minutes: 8,
    points: [
      {
        form: "that assumes",
        claims: [
          "'That assumes X' surfaces a premise the other side did not state.",
          "It is only an attack if the assumption is genuinely doing work; naming a harmless one wastes the move.",
        ],
        ex: ["That assumes demand stays flat.", "That assumes everyone has a car."],
      },
      {
        form: "your premise is",
        claims: [
          "'Your premise is X, and I dispute it' attacks the starting point rather than the conclusion.",
          "Disputing a premise undermines the conclusion if that premise is necessary to it; otherwise the remaining premises may still carry it.",
        ],
        ex: ["Your premise is that cost is fixed.", "Your premise is one I'd dispute."],
      },
      {
        form: "that doesn't follow",
        claims: [
          "'That doesn't follow' says the conclusion is not supported even if the premises are true.",
          "It obliges you to show the gap; asserted alone it is just contradiction.",
        ],
        ex: ["That doesn't follow from what you said.", "Even so, that doesn't follow."],
      },
    ],
    ex: [
      mcq("When does disputing a premise undermine the conclusion?", [
        "when that premise is necessary to the argument",
        "always, whatever the argument",
        "only when the conclusion is false",
      ], 0),
      mcq("What does 'that doesn't follow' oblige you to do?", [
        "show the gap between premises and conclusion",
        "restate the other side's view",
        "concede the premises",
      ], 0),
      say("that / assume / demand / stay / flat", ["That assumes demand stays flat."]),
    ],
    open: {
      q: "Someone argues: 'Sales fell after the redesign, so the redesign failed.' Attack the reasoning three ways without attacking them.",
      must: ["that assumes", "your premise is", "that doesn't follow"],
      criteria: "The answer names a working assumption, disputes the premise and shows the conclusion does not follow.",
      example: "That assumes nothing else changed that quarter. Your premise is that sales measure the redesign, which I'd dispute. Even if sales fell, that doesn't follow — retention rose over the same period.",
    },
    success: "The learner attacks the reasoning and shows the gap rather than asserting one.",
    quiz: [
      qmcq("When does 'that assumes' waste the move?", [
        "when the assumption is harmless to the argument",
        "when the assumption is unstated",
        "when the room is hostile",
      ], 0),
      qfill("That ___ everyone has a car. (assume)", ["assumes"]),
      qmcq("What does 'that doesn't follow' claim?", [
        "the conclusion is unsupported even if the premises are true",
        "the premises are false",
        "the speaker is dishonest",
      ], 0),
    ],
    scenes: [
      sc("Bartholomew", "a friend with a shaky argument", "to defend a conclusion",
        "A friend has drawn a conclusion their reasons do not support.",
        "Attack the reasoning, not them.",
        "It is obvious when you think about it. Or isn't it?", "confident"),
      sc("Ms. Aturu", "a colleague presenting a case", "to have the case tested",
        "A colleague's case rests on an unstated assumption.",
        "Surface the assumption.",
        "The numbers speak for themselves, don't they?", "assured"),
      sc("Rui", "a fellow traveller arguing a point", "to win an argument",
        "Your companion's argument has a gap in it.",
        "Show the gap.",
        "Everyone I know agrees with me. Doesn't that settle it?", "insistent"),
      sc("Professor Halvard", "your tutor", "to practise argument analysis",
        "The seminar is examining argument structure.",
        "Attack the reasoning precisely.",
        "When does attacking a premise actually undermine the conclusion?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check analytical attack",
        "The examiner offers a flawed argument.",
        "Attack the reasoning.",
        "Crime fell after the new law, so the law worked. Agreed?", "neutral"),
    ],
  },

  {
    id: "c2-concession-as-strategy",
    topic: "giving ground in order to gain it",
    objectives: [
      "Concede a real point in order to isolate the one that matters.",
      "Concede without conceding the conclusion.",
    ],
    goal: "Give ground deliberately and keep the argument.",
    target: "strategic concession",
    correction: "Model the concession and let the learner keep their conclusion.",
    summary: "You learned to give ground deliberately in order to gain it.",
    minutes: 8,
    points: [
      {
        form: "I'll grant you that",
        claims: [
          "'I'll grant you that' concedes a point openly, which makes your remaining position look examined.",
          "Concede a less central point and the move is cheap; concede the one the decision turns on and you have lost.",
        ],
        ex: ["I'll grant you that the cost is high.", "I'll grant you that much."],
      },
      {
        form: "you're right about",
        claims: [
          "'You're right about X' names exactly what you accept, which stops the concession spreading.",
          "An unbounded 'you're right' is often heard as agreeing with the whole case.",
        ],
        ex: ["You're right about the timing.", "You're right about the first part."],
      },
      {
        form: "even accepting that",
        claims: [
          "'Even accepting that, Y' shows the conclusion survives the concession.",
          "This is where the concession pays: without it you have simply agreed with them.",
        ],
        ex: ["Even accepting that, the case holds.", "Even accepting that, I'd still delay."],
      },
    ],
    ex: [
      mcq("Why name exactly what you accept?", [
        "It stops the concession spreading to the whole case.",
        "It is more polite.",
        "It shortens the sentence.",
      ], 0),
      mcq("What does 'even accepting that' show?", [
        "that your conclusion survives the concession",
        "that the concession was insincere",
        "that the other side is wrong",
      ], 0),
      say("even / accept / that / the case / hold", ["Even accepting that, the case holds."]),
    ],
    open: {
      q: "Someone argues your plan is too expensive and too slow. Concede one, answer the other, and say why the one you conceded was the less central.",
      must: ["I'll grant you that", "you're right about", "even accepting that"],
      criteria: "The answer concedes one point, answers the other with a reason, and explains why the conceded point was the less central.",
      example: "I'll grant you that it is expensive; you're right about the first-year cost. Even accepting that, I'd still proceed, because delay costs more across three years. I gave the first-year figure because total cost is what the decision turns on.",
    },
    success: "The learner concedes deliberately and shows the conclusion surviving.",
    quiz: [
      qmcq("What happens if you concede the point the decision turns on?", [
        "You have lost the argument.",
        "The concession looks examined.",
        "The other side concedes too.",
      ], 0),
      qfill("You're ___ about the timing. (right)", ["right"]),
      qmcq("How is an unbounded 'you're right' often heard?", [
        "as agreeing with the whole case",
        "as sarcasm",
        "as a request for time",
      ], 0),
    ],
    scenes: [
      sc("Bartholomew", "a friend making two objections", "to test your plan",
        "A friend has raised two objections, one of them fair.",
        "Concede one and hold your conclusion.",
        "It is too expensive and too slow. What do you say to that?", "challenging"),
      sc("Ms. Aturu", "a colleague opposing a proposal", "to stop a costly proposal",
        "A colleague has two objections to your proposal.",
        "Concede strategically.",
        "Cost and timing both. Can you defend it?", "sceptical"),
      sc("Rui", "a fellow traveller arguing back", "to win the argument",
        "Your companion has landed one real point.",
        "Concede it and keep your case.",
        "You have to admit I am right about the price, don't you?", "triumphant"),
      sc("Professor Halvard", "your tutor", "to practise concession",
        "The seminar is examining strategic concession.",
        "Concede and hold.",
        "How does conceding a point strengthen a position?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check concession technique",
        "The examiner raises two objections.",
        "Concede one and hold your conclusion.",
        "Your view is both unrealistic and unpopular. Response?", "neutral"),
    ],
  },

  {
    id: "c2-a-formal-debate",
    topic: "arguing a motion under debate conventions",
    objectives: [
      "State your side of a motion in the conventional form.",
      "Characterise your opponent's case before answering it.",
    ],
    goal: "Argue a motion under debate conventions.",
    target: "formal debate register",
    correction: "Model the conventional form and let the learner continue the speech.",
    summary: "You practised arguing a clear motion under debate conventions.",
    minutes: 8,
    points: [
      {
        form: "I oppose the motion",
        claims: [
          "'I oppose the motion' states your side before your reasons, as most debating formats require.",
          "In a formal debate you argue the assigned side, so the phrase reports a position, not a belief.",
        ],
        ex: ["I oppose the motion before us.", "I oppose the motion on two grounds."],
      },
      {
        form: "my opponent claims",
        claims: [
          "'My opponent claims X' restates their case before you answer it.",
          "A restatement they would recognise is required; a convenient one is a straw man and is scored as such.",
        ],
        ex: ["My opponent claims the cost is trivial.", "My opponent claims this is settled."],
      },
      {
        form: "I put it to you",
        claims: [
          "'I put it to you that X' addresses the audience rather than the opponent.",
          "In formats where the audience or a panel decides, directing the strongest claim at them is deliberate.",
        ],
        ex: ["I put it to you that the reverse is true.", "I put it to you plainly."],
      },
    ],
    ex: [
      mcq("Why must you restate your opponent's case fairly?", [
        "A convenient restatement is a straw man and is scored as one.",
        "It is a courtesy to the opponent.",
        "It fills speaking time.",
      ], 0),
      mcq("Who does 'I put it to you' address?", [
        "the audience or panel rather than the opponent",
        "the opponent directly",
        "the chair",
      ], 0),
      say("I / oppose / the motion / on two grounds", ["I oppose the motion on two grounds."]),
    ],
    open: {
      q: "Oppose the motion 'social media has made public debate worse'. State your side, restate the other case fairly, and address the audience.",
      must: ["I oppose the motion", "my opponent claims", "I put it to you"],
      criteria: "The answer states the side first, restates the opposing case fairly and directs its strongest claim to the audience.",
      example: "I oppose the motion. My opponent claims debate has coarsened, and the rise in harassment supports part of that. I put it to you that 'made debate worse' is too broad: the same platforms widened access to expert correction. The result is mixed, not uniformly worse.",
    },
    success: "The learner states their side, restates the other case fairly and addresses the audience.",
    quiz: [
      qmcq("What does 'I oppose the motion' report?", [
        "a position in the debate, not necessarily a belief",
        "the speaker's private view",
        "the audience's opinion",
      ], 0),
      qfill("My ___ claims the cost is trivial. (oppose)", ["opponent"]),
      qmcq("Why state your side before your reasons?", [
        "Most debating formats require it.",
        "Reasons are weaker.",
        "It saves time.",
      ], 0),
    ],
    scenes: [
      sc("Bartholomew", "a friend in a mock debate", "to enjoy a structured argument",
        "You and a friend are staging a mock debate.",
        "Argue in the conventional form.",
        "Right, you are opposing. Opening statement?", "playful"),
      sc("Ms. Aturu", "a colleague chairing a debate", "to run a fair debate",
        "A workplace debate is being chaired formally.",
        "State your side and answer the other case.",
        "You have two minutes against the motion. Begin?", "formal"),
      sc("Rui", "a fellow traveller in a hostel debate", "to argue for sport",
        "A hostel argument has become a proper debate.",
        "Argue the assigned side.",
        "You are against, then. Make your case?", "engaged"),
      sc("Professor Halvard", "your tutor", "to practise debate conventions",
        "The seminar is examining debate conventions.",
        "Argue under the conventions.",
        "Why do debating formats require the opposing case to be restated first?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check formal argument",
        "The examiner sets a motion.",
        "Oppose it under the conventions.",
        "The motion is that exams should be abolished. You oppose?", "neutral"),
    ],
  },

  {
    id: "c2-devils-advocate",
    topic: "arguing a case you do not believe",
    objectives: [
      "Mark an argument as one you are advancing rather than holding.",
      "Argue the case properly despite not believing it.",
    ],
    goal: "Argue a position you do not hold, and be clear that you do not hold it.",
    target: "playing devil's advocate",
    correction: "Model the marking phrase and let the learner argue the case.",
    summary: "You practised arguing a case you personally did not believe.",
    minutes: 8,
    points: [
      {
        form: "for the sake of argument",
        claims: [
          "'For the sake of argument' marks the case as advanced rather than held.",
          "Without the marker a strong argument is attributed to you, and denying it later looks like retreat.",
        ],
        ex: ["For the sake of argument, suppose it works.", "For the sake of argument only, let's suppose the figures are accurate."],
      },
      {
        form: "someone has to say",
        claims: [
          "'Someone has to say it' frames an unpopular point as necessary to raise; it does not distance you from the point.",
          "It works where the point is genuinely unsaid; where others have said it, it sounds self-flattering.",
        ],
        ex: ["Someone has to say it.", "Someone has to say the obvious thing."],
      },
      {
        form: "let me push back",
        claims: [
          "'Let me push back on that' signals a challenge; extra framing is needed to show it is only a test.",
          "Paired with 'for the sake of argument' it invites the other side to strengthen their case rather than defend themselves.",
        ],
        ex: ["Let me push back on that.", "Let me push back for a moment."],
      },
    ],
    ex: [
      mcq("What happens without the marker 'for the sake of argument'?", [
        "The argument is attributed to you.",
        "The argument becomes weaker.",
        "The audience stops listening.",
      ], 0),
      mcq("When does 'someone has to say it' sound self-flattering?", [
        "when others have already said it",
        "when the point is unpopular",
        "when it opens the turn",
      ], 0),
      say("let me / push back / for / a moment", ["Let me push back for a moment."]),
    ],
    open: {
      q: "Your team agrees a plan too quickly. Argue against it as devil's advocate, marking clearly that this is testing rather than your view.",
      must: ["for the sake of argument", "someone has to say", "let me push back"],
      criteria: "The answer marks the case as advanced rather than held and still argues it properly.",
      example: "Let me push back for a moment. Someone has to say it: we agreed in four minutes. For the sake of argument, suppose the pilot data is unrepresentative — what then? I am not against the plan, I am testing it.",
    },
    success: "The learner marks the case as advanced rather than held and argues it properly.",
    quiz: [
      qmcq("What does 'let me push back' signal on its own?", [
        "a challenge, without marking it as a test",
        "final disagreement",
        "a change of subject",
      ], 0),
      qfill("For the ___ of argument, suppose it works. (sake)", ["sake"]),
      qmcq("What does 'someone has to say it' do?", [
        "frames the point as necessary to raise",
        "distances the speaker from the point",
        "concedes the argument",
      ], 0),
    ],
    scenes: [
      sc("Cordelia", "a friend who has decided too fast", "to feel confident in a decision",
        "A friend has decided something without examining it.",
        "Test it as devil's advocate.",
        "It is settled, I have decided. Unless you think otherwise?", "breezy"),
      sc("Mr. Nkemdirim", "a colleague in a room that agreed too fast", "to make a robust decision",
        "A team has agreed unanimously in minutes.",
        "Argue against it, marked as testing.",
        "Everyone agrees. Shall we move on?", "hurried"),
      sc("Beatriks", "a fellow traveller with a firm plan", "to check the plan holds",
        "A travel plan has not been questioned at all.",
        "Push back as a test.",
        "The plan is fine. Any objections?", "casual"),
      sc("Professor Halvard", "your tutor", "to practise advocacy without belief",
        "The seminar is examining devil's advocacy.",
        "Argue a case you do not hold.",
        "Why must you mark an argument you do not believe?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check advocacy technique",
        "The examiner states a view you privately share.",
        "Argue against it as a test.",
        "Public transport should be free. Push back on that?", "neutral"),
    ],
  },

  {
    id: "c2-the-uncomfortable-question",
    topic: "answering what you would rather avoid",
    objectives: [
      "Acknowledge a question as fair before answering it.",
      "Admit the limit of what you know without deflecting.",
    ],
    goal: "Answer the question you would rather not have been asked.",
    target: "answering the hard question",
    correction: "Model the direct answer and let the learner answer again.",
    summary: "You practised answering the question you would rather avoid.",
    minutes: 8,
    points: [
      {
        form: "that's a fair question",
        claims: [
          "'That's a fair question' grants the question rather than resenting it.",
          "Said and then not answered, it becomes the most obvious deflection available.",
        ],
        ex: ["That's a fair question.", "That's a fair question and I'll answer it."],
      },
      {
        form: "I won't pretend",
        claims: [
          "'I won't pretend X' concedes the difficulty before anyone forces you to.",
          "Conceding first costs less than being caught concealing, and it buys credit for the rest of the answer.",
        ],
        ex: ["I won't pretend it went well.", "I won't pretend we saw it coming."],
      },
      {
        form: "honestly I don't know",
        claims: [
          "'Honestly, I don't know' is an answer, and often a better one than a manufactured explanation.",
          "Where finding the answer is your responsibility, follow it with what you will do; otherwise it can sound disengaged.",
        ],
        ex: ["Honestly, I don't know yet.", "Honestly, I don't know, and I'll find out."],
      },
    ],
    ex: [
      mcq("What does 'that's a fair question' become if you then do not answer?", [
        "the most obvious deflection available",
        "a stronger answer",
        "a request for time",
      ], 0),
      mcq("When should 'honestly, I don't know' be followed by a next step?", [
        "when finding the answer is your responsibility",
        "in every case, without exception",
        "only in writing",
      ], 0),
      say("I / not pretend / it / go / well", ["I won't pretend it went well.", "I will not pretend it went well."]),
    ],
    open: {
      q: "You are asked why a project you led overran by a year. Grant the question, concede the difficulty, and be honest about what you still do not know.",
      must: ["that's a fair question", "I won't pretend", "honestly I don't know"],
      criteria: "The answer grants the question, concedes the difficulty and pairs any admission of ignorance with a next step.",
      example: "That's a fair question. I won't pretend we managed it well — we rescoped twice. Why the second estimate was as wrong as the first, honestly I don't know; the review will be completed next month and I'll bring it to you.",
    },
    success: "The learner grants the question and answers it without deflecting.",
    quiz: [
      qmcq("Why concede a difficulty first?", [
        "It costs less than being caught concealing it.",
        "It shortens the answer.",
        "It is the polite convention.",
      ], 0),
      qfill("I ___ pretend we saw it coming. (will not)", ["won't", "will not"]),
      qmcq("When can 'I don't know' sound disengaged?", [
        "when the answer is your job to find and no next step follows",
        "when it is said early",
        "when the question is hostile",
      ], 0),
    ],
    scenes: [
      sc("Cordelia", "a friend asking something you avoid", "to hear an honest answer",
        "A friend asks the question you have been avoiding.",
        "Answer it without deflecting.",
        "You have dodged this twice now. What actually happened?", "direct"),
      sc("Mr. Nkemdirim", "a board member asking about an overrun", "to understand the failure",
        "A board wants to know why a project overran.",
        "Grant the question and answer it.",
        "A year late. How did that happen?", "exacting"),
      sc("Beatriks", "an official asking about a gap in your account", "to establish the facts",
        "An official has spotted a gap in your account.",
        "Answer honestly.",
        "There are three months unaccounted for. Where were you?", "procedural"),
      sc("Professor Halvard", "your tutor", "to practise answering hard questions",
        "The seminar is examining difficult questions.",
        "Grant and answer.",
        "Why does 'that's a fair question' so often precede a dodge?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check candour",
        "The examiner asks something awkward.",
        "Answer without deflecting.",
        "What is the weakest part of your own English?", "neutral"),
    ],
  },

  {
    id: "c2-when-youre-wrong",
    topic: "conceding an argument without losing standing",
    objectives: [
      "Withdraw a claim cleanly and specifically.",
      "Credit the argument that changed your mind.",
    ],
    goal: "Concede an argument cleanly while preserving your credibility.",
    target: "conceding well",
    correction: "Model the clean withdrawal and let the learner concede again.",
    summary: "You practised conceding an argument without losing standing.",
    minutes: 8,
    points: [
      {
        form: "I was mistaken",
        claims: [
          "'I was mistaken about X' withdraws a specific claim rather than a general position.",
          "Naming the specific error limits the concession to the claim actually disproved; a vague apology leaves its scope unclear.",
        ],
        ex: ["I was mistaken about the figures.", "I was mistaken, and you were right."],
      },
      {
        form: "you've changed my mind",
        claims: [
          "'You've changed my mind' credits the argument, which costs nothing and is often remembered well.",
          "It is only credible if you then act differently; said and ignored, it reads as a way to end the conversation.",
        ],
        ex: ["You've changed my mind on this.", "You've changed my mind about the timing."],
      },
      {
        form: "I withdraw that",
        claims: [
          "'I withdraw that' removes a claim from the record in one move, which suits a formal setting.",
          "It is narrower than an apology: it retracts the claim without conceding bad faith.",
        ],
        ex: ["I withdraw that point.", "I withdraw that; it was unfair."],
      },
    ],
    ex: [
      mcq("Why name specifically what you were wrong about?", [
        "It limits the concession to the claim actually disproved.",
        "It is more polite.",
        "It shortens the concession.",
      ], 0),
      mcq("What does 'I withdraw that' concede?", [
        "the claim, but not bad faith",
        "the whole argument",
        "the other side's conclusion",
      ], 0),
      say("I / be / mistake / about / the figures", ["I was mistaken about the figures."]),
    ],
    open: {
      q: "You argued a competitor's growth was invented; the figures are audited. Concede specifically, credit the argument, and say what still stands.",
      must: ["I was mistaken", "you've changed my mind", "I withdraw that"],
      criteria: "The answer withdraws the specific claim, credits the argument and preserves what genuinely still stands.",
      example: "I was mistaken about the figures — they are audited. I withdraw that. You've changed my mind on the growth, though not on whether it can continue at that rate, which is a separate question.",
    },
    success: "The learner withdraws the specific claim and preserves the rest of their position.",
    quiz: [
      qmcq("When is 'you've changed my mind' not credible?", [
        "when nothing you do afterwards changes",
        "when the argument was long",
        "when it is said in public",
      ], 0),
      qfill("I ___ that point. (withdraw)", ["withdraw"]),
      qmcq("What does a vague apology leave unclear?", [
        "the scope of what you have conceded",
        "whether you were wrong at all",
        "who won the argument",
      ], 0),
    ],
    scenes: [
      sc("Cordelia", "a friend who has just won the point", "to be acknowledged",
        "A friend has proved you wrong on one specific claim.",
        "Concede cleanly and keep the rest.",
        "So you admit I was right about the numbers?", "gracious"),
      sc("Mr. Nkemdirim", "a colleague who corrected you publicly", "to settle the record",
        "You were corrected in front of the team.",
        "Withdraw the claim cleanly.",
        "The figures are audited. Do you accept that?", "even"),
      sc("Beatriks", "a fellow traveller who was right", "to move on",
        "Your companion was right and you were not.",
        "Concede and move on.",
        "I did say the earlier train. Shall we leave it there?", "generous"),
      sc("Professor Halvard", "your tutor", "to practise conceding",
        "The seminar is examining concession.",
        "Withdraw specifically.",
        "Why does a vague apology leave the concession unclear?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check graceful concession",
        "The examiner refutes one of your claims.",
        "Concede specifically.",
        "Your first figure was simply wrong. Do you accept that?", "neutral"),
    ],
  },

  // --- Ünite 5 · Humour and Irony --------------------------------------------
  {
    id: "c2-dry-and-deadpan",
    topic: "humour delivered flat",
    objectives: [
      "Deliver an ironic line without marking it as a joke.",
      "Judge when a flat delivery will not be read as irony.",
    ],
    goal: "Say the opposite of what you mean and be understood.",
    target: "deadpan irony",
    correction: "Model the flat line in a situation where it reads, and let the learner try one.",
    summary: "You learned to deliver humour flat, without signalling it.",
    minutes: 8,
    points: [
      {
        form: "how thrilling",
        claims: [
          "'How thrilling' said about something tedious relies entirely on the situation being obvious.",
          "With a listener who does not know the thing is tedious, the same words are read as enthusiasm.",
        ],
        ex: ["A four-hour meeting. How thrilling.", "How thrilling for you."],
      },
      {
        form: "can't wait",
        claims: [
          "'Can't wait' is the flattest of the three, so it carries no signal at all beyond the context.",
          "In writing it is routinely misread, which is why it works best face to face.",
        ],
        ex: ["Another form to fill in. Can't wait.", "Can't wait for that."],
      },
      {
        form: "delighted I'm sure",
        claims: [
          "'Delighted, I'm sure' can sound arch in the right context, though it can also be sincere; delivery and shared knowledge still decide.",
          "It is the most visibly performed of the three, which makes the irony easier to see and harder to deny.",
        ],
        ex: ["Delighted, I'm sure.", "They were delighted, I'm sure."],
      },
    ],
    ex: [
      mcq("Which of these is the most visibly performed?", [
        "Delighted, I'm sure.",
        "Can't wait.",
        "How thrilling.",
      ], 0),
      mcq("Why does deadpan work best face to face?", [
        "In writing there is nothing to separate it from enthusiasm.",
        "It is a spoken-only construction.",
        "It requires a long pause.",
      ], 0),
      say("another form / to fill in / can not wait", ["Another form to fill in. Can't wait.", "Another form to fill in. Cannot wait."]),
    ],
    open: {
      q: "You are told about a four-hour mandatory meeting. Pick ONE deadpan line for a colleague who knows it is tedious, and say why you rejected the other two.",
      must: ["how thrilling", "can't wait", "delighted I'm sure"],
      criteria: "The answer chooses one line for the listener and gives a reason for rejecting the alternatives.",
      example: "Four hours. Can't wait. I wouldn't risk that line in an email, though — without the shared context it reads as enthusiasm. 'Delighted, I'm sure' would make the irony visible but theatrical, and 'how thrilling' needs the tedium to be obvious.",
    },
    success: "The learner chooses one line for the listener and justifies rejecting the others.",
    quiz: [
      qmcq("What does 'how thrilling' rely on entirely?", [
        "the situation being obviously tedious",
        "a long pause before it",
        "the listener's sense of humour",
      ], 0),
      qfill("Another form to fill in. ___ wait. (can not)", ["Can't", "Cannot"]),
      qmcq("What still decides whether 'delighted, I'm sure' reads as irony?", [
        "delivery and shared knowledge",
        "the archaism alone",
        "the word order",
      ], 0),
    ],
    scenes: [
      sc("Gwendolen", "a friend who finds the same things tedious", "to share the joke",
        "A friend has just told you about something tediously long.",
        "React deadpan.",
        "Four-hour meeting on Friday afternoon. Thoughts?", "dry"),
      sc("Mr. Oyelaran", "a colleague who knows the meeting is dull", "to commiserate",
        "A pointless meeting has been announced to both of you.",
        "React deadpan.",
        "It is mandatory this time. Pleased?", "resigned"),
      sc("Sanna", "a fellow traveller facing another delay", "to keep it light",
        "A third delay has been announced.",
        "React deadpan.",
        "Another two hours. How are you feeling about that?", "weary"),
      sc("Dr. Weatherby", "your tutor", "to practise deadpan",
        "The seminar is examining unmarked irony.",
        "Deliver irony flat and name the risk.",
        "How does a flat line get read as irony at all?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check ironic control",
        "The examiner reports something tedious.",
        "React deadpan.",
        "Your exam has a two-hour written section. Reaction?", "neutral"),
    ],
  },

  {
    id: "c2-self-deprecation",
    topic: "making yourself the joke",
    objectives: [
      "Make yourself the joke without inviting reassurance.",
      "Judge when self-deprecation stops being funny.",
    ],
    goal: "Be self-deprecating without fishing for reassurance.",
    target: "self-deprecation",
    correction: "Model the light version and let the learner try again.",
    summary: "You learned to make yourself the joke without seeming to fish for reassurance.",
    minutes: 8,
    points: [
      {
        form: "I'm hopeless at",
        claims: [
          "'I'm hopeless at X' works on something small and verifiable, where nobody needs to reassure you.",
          "Said about something central to your competence, it invites reassurance instead of a laugh.",
        ],
        ex: ["I'm hopeless at directions.", "I'm hopeless at remembering names."],
      },
      {
        form: "typical of me",
        claims: [
          "'Typical of me' claims a pattern, which makes the failure sound familiar rather than serious.",
          "Overused it starts to describe someone genuinely unreliable, which is no longer a joke.",
        ],
        ex: ["Typical of me, wrong platform.", "Typical of me to forget."],
      },
      {
        form: "don't ask me why",
        claims: [
          "'Don't ask me why' declines to explain, which keeps a small failure light.",
          "It closes the subject, so it is unhelpful where the other person actually needs the reason.",
        ],
        ex: ["Don't ask me why I did that.", "I brought two. Don't ask me why."],
      },
    ],
    ex: [
      mcq("When does 'I'm hopeless at X' invite reassurance instead of a laugh?", [
        "when X is central to your competence",
        "when X is small and verifiable",
        "when the listener is a friend",
      ], 0),
      mcq("What does 'typical of me' claim?", [
        "a familiar pattern rather than a serious failure",
        "that the failure was someone else's fault",
        "that it will not happen again",
      ], 0),
      say("typical / of me / wrong platform", ["Typical of me, wrong platform."]),
    ],
    open: {
      q: "You arrive late at the wrong building. Be self-deprecating without fishing for reassurance, and say which version you would avoid at work.",
      must: ["I'm hopeless at", "typical of me", "don't ask me why"],
      criteria: "The answer keeps the joke small and identifies a version that would invite reassurance or sound unreliable.",
      example: "Typical of me — wrong building entirely. I'm hopeless at directions; don't ask me why I trusted the map. I wouldn't say 'typical of me' to a client, though: it stops being a joke and starts sounding unreliable.",
    },
    success: "The learner keeps the joke small and judges where it would stop working.",
    quiz: [
      qmcq("What does overusing 'typical of me' start to describe?", [
        "someone genuinely unreliable",
        "a modest person",
        "a funny person",
      ], 0),
      qfill("I'm ___ at remembering names. (hopeless)", ["hopeless"]),
      qmcq("When is 'don't ask me why' unhelpful?", [
        "when the other person needs the reason",
        "when the failure is small",
        "when it ends the sentence",
      ], 0),
    ],
    scenes: [
      sc("Gwendolen", "a friend waiting for you", "to hear why you are late",
        "You have arrived late at the wrong place.",
        "Be self-deprecating without fishing.",
        "You are half an hour late. What happened this time?", "amused"),
      sc("Mr. Oyelaran", "a colleague covering for you", "to know it will not recur",
        "A colleague covered for a small mistake of yours.",
        "Keep it light without sounding unreliable.",
        "I sent the file for you. All fine?", "easy"),
      sc("Sanna", "a fellow traveller who noticed your error", "to laugh about it",
        "You boarded the wrong train and had to come back.",
        "Make yourself the joke.",
        "You went the wrong way, didn't you?", "teasing"),
      sc("Dr. Weatherby", "your tutor", "to practise self-deprecation",
        "The seminar is examining self-deprecation.",
        "Keep the joke small.",
        "When does self-deprecation start fishing for reassurance?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check register in self-description",
        "The examiner asks about a weakness.",
        "Be self-deprecating without fishing.",
        "What are you worst at?", "neutral"),
    ],
  },

  {
    id: "c2-sarcasm-and-its-risks",
    topic: "when sarcasm works and when it wounds",
    objectives: [
      "Use sarcasm where the target is a situation rather than a person.",
      "Identify where the same line would do real damage.",
    ],
    goal: "Use sarcasm knowingly, and know what it costs.",
    target: "sarcasm and its cost",
    correction: "Name what the line does to the listener and let the learner place it.",
    summary: "You learned when sarcasm works and when it does real damage.",
    minutes: 8,
    points: [
      {
        form: "oh brilliant",
        claims: [
          "'Oh brilliant' aimed at a situation is shared frustration; aimed at a person's work it is contempt.",
          "Aiming at a shared situation is usually safer than aiming at someone's work, but tone, responsibility, audience and power all still count.",
        ],
        ex: ["Oh brilliant, the lift is out again.", "Oh brilliant. Now what?"],
      },
      {
        form: "just perfect",
        claims: [
          "'Just perfect' after a run of small disasters reads as comic exaggeration.",
          "After a genuine loss it reads as bitterness, because the scale no longer supports the joke.",
        ],
        ex: ["Rain as well. Just perfect.", "Just perfect, the third time today."],
      },
      {
        form: "that went well",
        claims: [
          "'That went well' keeps you inside the failure only if the failure is visibly shared; 'our presentation went well' makes that explicit.",
          "Said about something only the other person did, it is an accusation in a joke's clothing.",
        ],
        ex: ["Well, that went well.", "That went well, didn't it?"],
      },
    ],
    ex: [
      mcq("What affects whether sarcasm reads as shared or contemptuous?", [
        "the target, plus tone, audience and who is responsible",
        "the target and nothing else",
        "the length of the phrase",
      ], 0),
      mcq("What makes 'that went well' clearly include the speaker?", [
        "a visibly shared failure, or an explicit 'our'",
        "the past tense",
        "saying it quietly",
      ], 0),
      say("oh brilliant / the lift / be / out / again", ["Oh brilliant, the lift is out again."]),
    ],
    open: {
      q: "A meeting you both prepared for collapsed. React sarcastically about the situation, then say what the same lines would do aimed at your colleague's part.",
      must: ["oh brilliant", "just perfect", "that went well"],
      criteria: "The answer aims the sarcasm at the situation and separates that from the damage of aiming it at the person.",
      example: "Well, that went well — our presentation, I mean, not yours. Oh brilliant, the projector too. Just perfect. Aimed at your slides rather than the afternoon, and in front of the client, those same lines would be contempt.",
    },
    success: "The learner aims sarcasm at the situation and names the cost of aiming it at a person.",
    quiz: [
      qmcq("When does 'just perfect' read as bitterness?", [
        "after a genuine loss, where the scale does not support a joke",
        "after a run of small disasters",
        "when said quietly",
      ], 0),
      qfill("Rain as well. ___ perfect. (just)", ["Just"]),
      qmcq("What is 'that went well' aimed only at the other person?", [
        "an accusation in a joke's clothing",
        "shared frustration",
        "comic exaggeration",
      ], 0),
    ],
    scenes: [
      sc("Gwendolen", "a friend in the same bad situation", "to vent together",
        "You are both stuck in the same absurd situation.",
        "Aim the sarcasm at the situation.",
        "The lift is out and we are on the ninth floor. Well?", "exasperated"),
      sc("Mr. Oyelaran", "a colleague after a shared failure", "to recover the afternoon",
        "A meeting you both prepared for collapsed.",
        "Keep the sarcasm shared.",
        "That could not have gone worse, could it?", "deflated"),
      sc("Sanna", "a fellow traveller in a run of bad luck", "to keep morale up",
        "A run of small disasters has hit your trip.",
        "Use comic exaggeration.",
        "And now it is raining. What next?", "wry"),
      sc("Dr. Weatherby", "your tutor", "to practise judging sarcasm",
        "The seminar is examining sarcasm and its targets.",
        "Distinguish shared frustration from contempt.",
        "Beyond the target, what else decides how sarcasm lands?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check judgement about sarcasm",
        "The examiner describes a shared setback.",
        "Aim the sarcasm at the situation.",
        "Your group project lost a week's work. Reaction?", "neutral"),
    ],
  },

  {
    id: "c2-banter",
    topic: "fast friendly back-and-forth",
    objectives: [
      "Return a tease without escalating it.",
      "Keep banter warm by making the exchange mutual.",
    ],
    goal: "Trade teasing that stays friendly.",
    target: "banter",
    correction: "Model the return and let the learner answer the next tease.",
    summary: "You practised fast, friendly back-and-forth that stayed warm.",
    minutes: 8,
    points: [
      {
        form: "you would say that",
        claims: [
          "'You would say that' teases the person's predictability rather than their view.",
          "It needs an established pattern between you; to a stranger it is simply dismissive.",
        ],
        ex: ["You would say that.", "You would say that, wouldn't you?"],
      },
      {
        form: "takes one to know",
        claims: [
          "'Takes one to know one' returns the tease by suggesting the other person shares the quality.",
          "Among friends it keeps the teasing mutual; in a tense exchange it is a counter-accusation and escalates.",
        ],
        ex: ["Takes one to know one.", "Well, takes one to know one."],
      },
      {
        form: "very funny",
        claims: [
          "'Very funny' acknowledges the joke flatly and hands the turn back.",
          "It also works as a stop signal, so it can end banter that has gone far enough.",
        ],
        ex: ["Very funny. Now let me finish.", "Very funny — my turn."],
      },
    ],
    ex: [
      mcq("When does 'takes one to know one' escalate rather than defuse?", [
        "in a tense exchange, where it is a counter-accusation",
        "among close friends",
        "when said first",
      ], 0),
      mcq("What does 'very funny' do besides acknowledge the joke?", [
        "It can act as a stop signal.",
        "It escalates the exchange.",
        "It concedes the point.",
      ], 0),
      say("you / would say / that / would not you", ["You would say that, wouldn't you?", "You would say that, would you not?"]),
    ],
    open: {
      q: "A friend teases you for always being late and then for being predictable. Return both, and mark where you would stop it.",
      must: ["you would say that", "takes one to know", "very funny"],
      criteria: "The answer returns the teasing without escalating and shows where it would be closed off.",
      example: "Very funny — late again, am I? Takes one to know one; you missed the first half last week. And you would say that, given your record. I'd stop if it moved from lateness to someone's competence.",
    },
    success: "The learner returns the teasing warmly and marks where it should stop.",
    quiz: [
      qmcq("When is 'you would say that' simply dismissive?", [
        "with a stranger, where no pattern is established",
        "with a close friend",
        "when it ends in a question",
      ], 0),
      qfill("___ one to know one. (take)", ["Takes"]),
      qmcq("What does teasing predictability avoid?", [
        "attacking the person's view itself",
        "any risk at all",
        "using their name",
      ], 0),
    ],
    scenes: [
      sc("Gwendolen", "an old friend who teases constantly", "to enjoy the exchange",
        "An old friend has started teasing you.",
        "Return it without escalating.",
        "Late again — you have never been on time in your life, have you?", "affectionate"),
      sc("Mr. Oyelaran", "a colleague you get on well with", "to keep the mood light",
        "A colleague makes a joke at your expense in a light room.",
        "Return it and keep it warm.",
        "You did read the brief this time, didn't you?", "jocular"),
      sc("Sanna", "a fellow traveller who has become a friend", "to pass the time",
        "A friendly rivalry has developed on a long trip.",
        "Trade teasing warmly.",
        "You picked the route, so this is your fault, isn't it?", "playful"),
      sc("Dr. Weatherby", "your tutor", "to practise banter",
        "The seminar is examining banter.",
        "Return teasing without escalating.",
        "What keeps banter from turning into an argument?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check informal register",
        "The examiner makes a light joke at your expense.",
        "Return it warmly.",
        "You have prepared for exactly this question, haven't you?", "neutral"),
    ],
  },

  {
    id: "c2-reading-a-joke-that-fell-flat",
    topic: "recovering when humour lands badly",
    objectives: [
      "Recognise that a joke has landed badly and stop.",
      "Withdraw a remark without making it the new subject.",
    ],
    goal: "Recover when a joke does not land.",
    target: "recovering from a failed joke",
    correction: "Model the brief withdrawal and let the learner move on.",
    summary: "You practised recovering when humour landed badly.",
    minutes: 8,
    points: [
      {
        form: "too soon",
        claims: [
          "'Too soon' names timing as the reason, so it fits a joke that was merely premature.",
          "Where the subject itself was the problem, timing is the wrong diagnosis and a plain apology is owed instead.",
        ],
        ex: ["Too soon, sorry.", "Too soon — my fault."],
      },
      {
        form: "ignore me",
        claims: [
          "'Ignore me' withdraws the remark in two words and hands the floor back.",
          "Brevity is the point: a long apology makes the failed joke the subject of the conversation.",
        ],
        ex: ["Ignore me — bad timing.", "Ignore me, carry on."],
      },
      {
        form: "that came out wrong",
        claims: [
          "'That came out wrong' separates what you meant from what you said.",
          "It is only honest where the wording failed; where the thought was the problem, it deflects.",
        ],
        ex: ["That came out wrong.", "Sorry, that came out wrong."],
      },
    ],
    ex: [
      mcq("Why keep the withdrawal brief?", [
        "A long apology makes the failed joke the subject.",
        "Short sentences sound more sincere.",
        "It is the conventional form.",
      ], 0),
      mcq("When does 'that came out wrong' deflect?", [
        "when the thought, not the wording, was the problem",
        "when the wording was clumsy",
        "when it is said immediately",
      ], 0),
      say("ignore me / carry on", ["Ignore me, carry on."]),
    ],
    open: {
      q: "Your joke about a colleague's new haircut lands badly. Recover briefly, and say which of the three would misdescribe what went wrong.",
      must: ["too soon", "ignore me", "that came out wrong"],
      criteria: "The answer withdraws briefly and names which phrase would misdescribe the failure.",
      example: "That came out wrong — I meant it looked deliberate. Ignore me, carry on. 'Too soon' would misdescribe it: nothing was premature, the wording simply landed as a criticism instead of a compliment.",
    },
    success: "The learner withdraws briefly and names which phrase would misdescribe the failure.",
    quiz: [
      qmcq("What does 'too soon' name as the reason?", [
        "timing",
        "the wording",
        "the subject itself",
      ], 0),
      qfill("___ me, carry on. (ignore)", ["Ignore"]),
      qmcq("When is a brief withdrawal not enough?", [
        "when the subject itself, not the timing, was the problem",
        "when the room is large",
        "when the joke was long",
      ], 0),
    ],
    scenes: [
      sc("Cassian", "a friend in a room that went quiet", "to move past an awkward moment",
        "Your joke has landed badly and the room is quiet.",
        "Recover briefly and move on.",
        "Right. Anyway. Where were we?", "awkward"),
      sc("Ms. Duflot", "a colleague after your remark misfired", "to get the meeting back",
        "A remark of yours misfired in a meeting.",
        "Withdraw briefly.",
        "Shall we get back to the agenda?", "even"),
      sc("Tarek", "a fellow guest at a dinner", "to keep the evening comfortable",
        "A joke of yours has silenced the table.",
        "Recover without dwelling.",
        "So. Has anyone been to the new place on the corner?", "smoothing"),
      sc("Dr. Weatherby", "your tutor", "to practise recovery",
        "The seminar is examining conversational repair.",
        "Withdraw briefly and honestly.",
        "Why does a long apology make things worse?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check repair strategies",
        "The examiner reports that a remark landed badly.",
        "Recover briefly.",
        "That last comment did not go down well. What now?", "neutral"),
    ],
  },

  {
    id: "c2-humour-in-a-serious-setting",
    topic: "lightening a tense moment",
    objectives: [
      "Introduce lightness without dismissing the seriousness.",
      "Ask permission before shifting the tone of a tense room.",
    ],
    goal: "Lighten a tense moment without undercutting it.",
    target: "humour under seriousness",
    correction: "Model the permission move and let the learner lighten the room.",
    summary: "You practised lightening a tense moment without undercutting it.",
    minutes: 8,
    points: [
      {
        form: "on a lighter note",
        claims: [
          "'On a lighter note' announces the shift, so nobody thinks you have missed the seriousness.",
          "It announces rather than asks: the phrase that seeks consent is 'if I may'.",
        ],
        ex: ["On a lighter note, we did find the file.", "On a lighter note, briefly."],
      },
      {
        form: "if I may",
        claims: [
          "'If I may' asks permission, which suits a room where you are not the most senior person.",
          "It is a real question, so it can be declined; treating it as a formality defeats it.",
        ],
        ex: ["If I may, one lighter thought.", "If I may say one thing."],
      },
      {
        form: "we could all use",
        claims: [
          "'We could all use a break' makes the need collective rather than yours.",
          "It presumes to speak for the room, so it fails if the room does not in fact feel it.",
        ],
        ex: ["We could all use a coffee.", "We could all use five minutes."],
      },
    ],
    ex: [
      mcq("Which phrase actually asks the room's consent?", [
        "If I may",
        "On a lighter note",
        "We could all use",
      ], 0),
      mcq("Why can 'we could all use a break' fail?", [
        "It presumes to speak for a room that may not feel it.",
        "It is too informal.",
        "It uses the first person plural.",
      ], 0),
      say("we / could / all / use / five minutes", ["We could all use five minutes."]),
    ],
    open: {
      q: "A tense meeting about redundancies has stalled after two hours. Ease it without making light of the subject, and say how you would check whether the room accepted.",
      must: ["on a lighter note", "if I may", "we could all use"],
      criteria: "The answer asks before shifting tone, keeps the subject itself serious, and checks rather than assumes the room accepted.",
      example: "If I may — we could all use five minutes. On a lighter note, that is a break I am proposing, not a change of subject. I would not try to make light of the decision itself, and if the chair says continue, I leave it there.",
    },
    success: "The learner asks before shifting tone and checks rather than assumes acceptance.",
    quiz: [
      qmcq("Why is 'if I may' a real question?", [
        "It can be declined, and treating it as a formality defeats it.",
        "It is grammatically interrogative.",
        "It is always answered aloud.",
      ], 0),
      qfill("On a ___ note, we did find the file. (light)", ["lighter"]),
      qmcq("How should you check whether the room accepted the shift?", [
        "ask, because silence is ambiguous",
        "assume it did if nobody objects",
        "repeat the remark",
      ], 0),
    ],
    scenes: [
      sc("Cassian", "a friend in a heavy conversation", "to breathe for a moment",
        "A heavy conversation has gone on a long time.",
        "Lighten it without dismissing it.",
        "We have been at this for hours. Where does that leave us?", "drained"),
      sc("Ms. Duflot", "a colleague in a tense meeting", "to get through a hard meeting",
        "A meeting about redundancies has stalled.",
        "Ask before shifting the tone.",
        "Nobody has spoken for a minute. Anything?", "tense"),
      sc("Tarek", "a fellow passenger during a long disruption", "to keep spirits from sinking",
        "A long disruption has flattened everyone's mood.",
        "Lighten it carefully.",
        "Six hours now. Are we all right?", "flat"),
      sc("Dr. Weatherby", "your tutor", "to practise tonal judgement",
        "The seminar is examining humour in serious settings.",
        "Shift tone with permission.",
        "How do you lighten a room without dismissing it?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check tonal judgement",
        "The examiner describes a tense room.",
        "Lighten it carefully.",
        "The discussion has become uncomfortable. What do you do?", "neutral"),
    ],
  },

  {
    id: "c2-telling-a-funny-story",
    topic: "building an anecdote to a laugh",
    objectives: [
      "Withhold the funniest detail until the end.",
      "Signal that more is coming so the listener waits.",
    ],
    goal: "Build an anecdote so the laugh arrives where you want it.",
    target: "comic timing in an anecdote",
    correction: "Model the withheld detail and let the learner rebuild the ending.",
    summary: "You practised building an anecdote so the laugh arrived where you wanted it.",
    minutes: 8,
    points: [
      {
        form: "you'll appreciate this",
        claims: [
          "'You'll appreciate this' tells one listener the story is aimed at them specifically.",
          "It raises expectation, so a weak ending costs more than it would without the promise.",
        ],
        ex: ["You'll appreciate this one.", "You'll appreciate this, given last week."],
      },
      {
        form: "it gets better",
        claims: [
          "'It gets better' promises escalation, which buys you time for another detail.",
          "It commits you: the next detail has to be funnier than the last, or the promise is broken.",
        ],
        ex: ["It gets better.", "And it gets better than that."],
      },
      {
        form: "and that's not all",
        claims: [
          "'And that's not all' holds the floor at the point where a listener might start reacting.",
          "Repeated use delays the payoff; without real escalation the story starts to feel padded.",
        ],
        ex: ["And that's not all.", "And that's not all — the door was locked."],
      },
    ],
    ex: [
      mcq("What does 'it gets better' commit you to?", [
        "a next detail that is funnier than the last",
        "a shorter story",
        "naming the people involved",
      ], 0),
      mcq("What happens to a story repeatedly promised more?", [
        "Without real escalation it feels padded.",
        "It becomes funnier.",
        "The listener interrupts.",
      ], 0),
      say("and / that / be / not all / the door / be / lock", ["And that's not all — the door was locked.", "And that is not all: the door was locked."]),
    ],
    open: {
      q: "Tell a short funny story about locking yourself out. Withhold the best detail, promise escalation, and land the laugh at the end.",
      must: ["you'll appreciate this", "it gets better", "and that's not all"],
      criteria: "The answer withholds the funniest detail until the end and keeps each promised escalation.",
      example: "You'll appreciate this, given last week. I locked myself out in the rain. It gets better: the spare key was inside, in the drawer I had just organised. And that's not all — my neighbour had the second key, but she was away, and I was meant to be watering her plants.",
    },
    success: "The learner withholds the best detail and lands the laugh at the end.",
    quiz: [
      qmcq("Why does a weak ending cost more after 'you'll appreciate this'?", [
        "The promise raised expectation.",
        "The story becomes longer.",
        "The listener has to reply.",
      ], 0),
      qfill("And that's not ___ — the door was locked. (all)", ["all"]),
      qmcq("What does 'and that's not all' hold?", [
        "the floor, at the point a listener might react",
        "the listener's sympathy",
        "the punchline itself",
      ], 0),
    ],
    scenes: [
      sc("Cassian", "a friend who enjoys your stories", "to hear a good story",
        "A friend has asked for the story about the keys.",
        "Build to the laugh.",
        "Go on then, tell me about the keys?", "expectant"),
      sc("Ms. Duflot", "a colleague at lunch", "to be entertained briefly",
        "Lunch has turned to funny mishaps.",
        "Tell it with timing.",
        "Worst thing that happened to you this month?", "relaxed"),
      sc("Tarek", "a fellow traveller swapping stories", "to trade good anecdotes",
        "Travellers are swapping stories.",
        "Build the anecdote properly.",
        "Everyone has a locked-out story. Yours?", "curious"),
      sc("Dr. Weatherby", "your tutor", "to practise comic structure",
        "The seminar is examining comic timing.",
        "Withhold and escalate.",
        "Why does the funniest detail belong at the end?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check narrative timing",
        "The examiner invites an anecdote.",
        "Build to the laugh.",
        "Could you tell me about something that went comically wrong?", "neutral"),
    ],
  },

  // --- Ünite 6 · Storytelling at Length --------------------------------------
  {
    id: "c2-structure-of-a-long-story",
    topic: "shaping a narrative that runs for minutes",
    objectives: [
      "Signal how far back the story begins.",
      "Delay the main event until the listener has what they need.",
    ],
    goal: "Shape a story that runs for several minutes.",
    target: "long-narrative structure",
    correction: "Model the structural signal and let the learner continue the story.",
    summary: "You learned to shape a narrative that runs for many minutes.",
    minutes: 9,
    points: [
      {
        form: "it starts years before",
        claims: [
          "'It starts years before that' tells the listener the story is long and where it begins.",
          "It buys patience, which a long story needs; without it early background sounds like digression.",
        ],
        ex: ["It starts years before I was born.", "It starts years before any of that."],
      },
      {
        form: "but first you need",
        claims: [
          "'But first you need to know X' marks background as necessary rather than as delay.",
          "Only use it for background the story genuinely fails without, or it becomes an excuse to ramble.",
        ],
        ex: ["But first you need to know about my uncle.", "But first you need one detail."],
      },
      {
        form: "and here's where",
        claims: [
          "'And here's where it turns' marks the pivot, so the listener knows the setup has ended.",
          "The pivot has to be a real change of direction; announced without one, attention drops.",
        ],
        ex: ["And here's where it goes wrong.", "And here's where I should have stopped."],
      },
    ],
    ex: [
      mcq("Why announce that the story starts years earlier?", [
        "It buys patience for background that would otherwise sound like digression.",
        "It makes the story shorter.",
        "It is the conventional opening.",
      ], 0),
      mcq("What must follow 'and here's where it turns'?", [
        "a real change of direction",
        "the end of the story",
        "an apology for the length",
      ], 0),
      say("but first / you / need / to know / about / my uncle", ["But first you need to know about my uncle."]),
    ],
    open: {
      q: "Begin a long story about how you ended up in your current job. Signal the length, justify the background, and mark the pivot.",
      must: ["it starts years before", "but first you need", "and here's where"],
      criteria: "The answer signals the length, gives only background the story needs, and marks a genuine pivot.",
      example: "It starts years before the job existed. But first you need to know that my aunt ran a print shop, because that is where I learned to set type. I did that for six years. And here's where it turns: the shop closed the same week the listing went up.",
    },
    success: "The learner signals the length and marks a genuine pivot.",
    quiz: [
      qmcq("When does 'but first you need to know' become an excuse to ramble?", [
        "when the story would work without the background",
        "when the background is short",
        "when it comes early",
      ], 0),
      qfill("It ___ years before I was born. (start)", ["starts"]),
      qmcq("What does the pivot marker tell the listener?", [
        "that the setup has ended",
        "that the story is nearly over",
        "that they may interrupt",
      ], 0),
    ],
    scenes: [
      sc("Ottavia", "a friend with time to listen", "to hear the whole story",
        "A friend has asked how you ended up where you are.",
        "Shape a long story.",
        "We have all evening. How did you end up doing this?", "settled"),
      sc("Mr. Lindqvist", "a colleague asking about your background", "to understand your path",
        "A colleague wants the long version of your career.",
        "Signal the length and shape it.",
        "You have had an unusual route into this. What was it?", "interested"),
      sc("Nadia", "a fellow traveller on a long journey", "to pass a long journey well",
        "A long journey invites a long story.",
        "Shape it properly.",
        "We have six hours. Tell me something long?", "relaxed"),
      sc("Professor Oyibo", "your tutor", "to practise narrative structure",
        "The seminar is examining long-form narrative.",
        "Signal length and mark the pivot.",
        "How does a listener stay with a story for five minutes?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check extended narration",
        "The examiner invites a long story.",
        "Shape it and mark the pivot.",
        "Could you tell me at length how you came to study English?", "neutral"),
    ],
  },

  {
    id: "c2-switching-time-for-effect",
    topic: "moving between past and present inside a story",
    objectives: [
      "Switch from the past to the present to heighten a scene.",
      "Keep the switch consistent within the scene.",
    ],
    goal: "Switch tense inside a story to put the listener in the moment.",
    target: "the narrative present",
    correction: "Model the tense switch and let the learner continue in the present.",
    summary: "You learned to move between past and present inside a story to heighten it.",
    minutes: 9,
    points: [
      {
        form: "so I'm standing there",
        claims: [
          "The present tense inside a past narrative puts the listener in the moment rather than after it.",
          "The switch marks the scene you most want them to see, so switching everywhere removes the effect.",
        ],
        ex: ["So I'm standing there with the box.", "So I'm standing there and the door opens."],
      },
      {
        form: "and he turns round",
        claims: [
          "Once you have switched, the actions that follow stay in the present within that scene.",
          "Unmotivated mixing inside one scene reads as an error; a controlled switch can still mark background or commentary.",
        ],
        ex: ["And he turns round and says nothing.", "And she turns round, absolutely furious."],
      },
      {
        form: "next thing I know",
        claims: [
          "'Next thing I know' jumps over an interval without narrating it, and stays in the narrative present.",
          "'Next thing I knew' makes the same jump in past narration, which is one way to leave the heightened scene.",
        ],
        ex: ["Next thing I know, we're outside.", "Next thing I knew, we were outside."],
      },
    ],
    ex: [
      fill("So I ___ standing there with the box. (be, present)", ["am", "'m"]),
      fill("And he ___ round and says nothing. (turn, present)", ["turns"]),
      mcq("Why not switch to the present throughout a story?", [
        "The switch marks one scene; used everywhere it marks nothing.",
        "It is grammatically incorrect.",
        "It makes the story longer.",
      ], 0),
      say("next thing / I / know / we / be / outside", ["Next thing I know, we're outside.", "Next thing I know, we are outside."]),
    ],
    open: {
      q: "Tell a short story that begins in the past, switches to the present for the key scene, and returns to the past at the end.",
      must: ["so I'm standing there", "and he turns round", "next thing I know"],
      criteria: "The answer switches to the present for one scene, keeps that scene consistent, and returns to the past afterwards.",
      example: "I had waited two hours. So I'm standing there with the box, and the office is completely silent. And he turns round, looks at it, says nothing. Next thing I know, we're both outside on the pavement. Later I went home, still not knowing what had happened.",
    },
    success: "The learner switches tense for one scene and returns to the past.",
    quiz: [
      qmcq("What does UNMOTIVATED tense mixing inside one scene read as?", [
        "an error rather than a device",
        "a deliberate effect",
        "a change of narrator",
      ], 0),
      qfill("And she ___ round, absolutely furious. (turn, present)", ["turns"]),
      qmcq("Which form makes the jump in a past-tense narrative?", [
        "next thing I knew",
        "next thing I know",
        "next thing I am knowing",
      ], 0),
    ],
    scenes: [
      sc("Ottavia", "a friend hearing a dramatic story", "to feel the moment",
        "A friend is hearing your most dramatic story.",
        "Switch tense for the key scene.",
        "What happened when you finally got in there?", "gripped"),
      sc("Mr. Lindqvist", "a colleague hearing about a difficult meeting", "to picture the scene",
        "A colleague wants to know how the meeting went.",
        "Put them in the moment.",
        "So you were in the room. What was it like?", "curious"),
      sc("Nadia", "a fellow traveller swapping dramatic stories", "to hear a vivid story",
        "Travellers are trading dramatic moments.",
        "Heighten the key scene.",
        "What is the closest call you have ever had?", "engaged"),
      sc("Professor Oyibo", "your tutor", "to practise the narrative present",
        "The seminar is examining the narrative present.",
        "Switch for one scene and return.",
        "Why does switching everywhere remove the effect?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check narrative tense control",
        "The examiner invites a dramatic story.",
        "Switch tense for the key scene.",
        "Could you describe a moment when you were completely surprised?", "neutral"),
    ],
  },

  {
    id: "c2-digression-and-return",
    topic: "going off on a tangent and coming back",
    objectives: [
      "Interrupt yourself when you have got ahead of the story.",
      "Return to the thread without recapping everything.",
    ],
    goal: "Digress and come back without losing the listener.",
    target: "digression and return",
    correction: "Model the return and let the learner pick the thread up.",
    summary: "You learned to go off on a tangent and get back cleanly.",
    minutes: 8,
    points: [
      {
        form: "but I'm getting ahead",
        claims: [
          "'But I'm getting ahead of myself' catches an out-of-order detail and marks it as premature.",
          "It preserves the surprise you were about to spoil, which is why it is worth interrupting for.",
        ],
        ex: ["But I'm getting ahead of myself.", "But I'm getting ahead — that comes later."],
      },
      {
        form: "anyway where was I",
        claims: [
          "'Anyway, where was I?' admits you lost the thread; it is usually rhetorical self-repair rather than a real request for help.",
          "It is disarming once; repeatedly it tells the listener you are not in control of the story.",
        ],
        ex: ["Anyway, where was I?", "Anyway. Where was I?"],
      },
      {
        form: "back to the point",
        claims: [
          "'Back to the point' returns straight to the thread.",
          "After a long or complex detour a brief recap can still help the listener reorient.",
        ],
        ex: ["Back to the point.", "Back to the point — the letter."],
      },
    ],
    ex: [
      mcq("Why is 'but I'm getting ahead of myself' worth interrupting for?", [
        "It preserves a surprise you were about to spoil.",
        "It makes the story shorter.",
        "It is the conventional phrase.",
      ], 0),
      mcq("When is a brief recap worth adding after 'back to the point'?", [
        "after a long or complex digression",
        "never, it always wastes time",
        "only in writing",
      ], 0),
      say("back to / the point / the letter", ["Back to the point — the letter.", "Back to the point, the letter."]),
    ],
    open: {
      q: "You are telling a story, mention the ending too early, then lose your place. Catch yourself, admit it once, and return cleanly.",
      must: ["but I'm getting ahead", "anyway where was I", "back to the point"],
      criteria: "The answer catches the premature detail, admits losing the thread once, and returns without recapping.",
      example: "And of course she had known the whole time — but I'm getting ahead of myself, that comes later. Her brother had told her in March, which is a story of its own. Anyway, where was I? Back to the point: the letter arrived on a Tuesday.",
    },
    success: "The learner catches the premature detail and returns without recapping.",
    quiz: [
      qmcq("What does repeating 'where was I?' tell the listener?", [
        "that you are not in control of the story",
        "that the story is nearly finished",
        "that they should interrupt",
      ], 0),
      qfill("But I'm ___ ahead of myself. (get)", ["getting"]),
      qmcq("What is 'anyway, where was I?' usually?", [
        "rhetorical self-repair rather than a real request for help",
        "a genuine question to the listener",
        "a way of ending the story",
      ], 0),
    ],
    scenes: [
      sc("Ottavia", "a friend following a rambling story", "to follow the story",
        "You have got ahead of yourself in a story.",
        "Catch yourself and return.",
        "Hold on — you said she knew? When did she find out?", "confused"),
      sc("Mr. Lindqvist", "a colleague hearing an account", "to get the sequence right",
        "An account has gone out of order.",
        "Return to the thread cleanly.",
        "You have jumped ahead. What happened first?", "patient"),
      sc("Nadia", "a fellow traveller listening", "to hear the whole story",
        "A story has wandered off track.",
        "Get back cleanly.",
        "We were talking about the letter, weren't we?", "helpful"),
      sc("Professor Oyibo", "your tutor", "to practise digression control",
        "The seminar is examining digression.",
        "Catch and return.",
        "When is a recap worth adding, and when does it just repeat the detour?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check narrative control",
        "The examiner notes you have got ahead.",
        "Catch yourself and return.",
        "You mentioned the ending already. Where were you?", "neutral"),
    ],
  },

  {
    id: "c2-a-life-story",
    topic: "telling your own history with shape",
    objectives: [
      "Select which parts of your history the story needs.",
      "Name what a period changed rather than only what happened.",
    ],
    goal: "Tell your own history at length and with shape.",
    target: "shaped autobiography",
    correction: "Model the selection and let the learner continue their account.",
    summary: "You practised telling your own history at length and with shape.",
    minutes: 9,
    points: [
      {
        form: "I grew up",
        claims: [
          "'I grew up X' opens with the setting rather than with a birth date.",
          "One or two revealing details usually open better than an exhaustive chronology; order alone is not shape.",
        ],
        ex: ["I grew up between two towns.", "I grew up with my grandparents."],
      },
      {
        form: "that shaped everything",
        claims: [
          "'That shaped everything after it' names consequence; selection, emphasis and consequence are what give a chronology shape.",
          "Claiming it for several separate events weakens each claim, so choose one.",
        ],
        ex: ["That shaped everything after it.", "That one year shaped everything."],
      },
      {
        form: "looking at it now",
        claims: [
          "'Looking at it now' separates what you thought then from what you think now.",
          "The gap between the two is often the most interesting part of a life story.",
        ],
        ex: ["Looking at it now, it was the right call.", "Looking at it now, I understand why."],
      },
    ],
    ex: [
      mcq("What gives a chronological account narrative shape?", [
        "selection, emphasis and consequence",
        "the order of events alone",
        "the number of years covered",
      ], 0),
      mcq("What does 'looking at it now' separate?", [
        "what you thought then from what you think now",
        "your childhood from your adulthood",
        "fact from opinion",
      ], 0),
      say("I / grow up / between / two towns", ["I grew up between two towns."]),
    ],
    open: {
      q: "Tell your own history at length: open with a setting, name the one period that changed things, and say how you read it differently now.",
      must: ["I grew up", "that shaped everything", "looking at it now"],
      criteria: "The answer selects rather than lists, claims consequence for one period only, and shows the change in the speaker's own reading.",
      example: "I grew up between two towns and belonged to neither. The year we moved for the third time, I stopped trying to keep friends — that shaped everything after it. Looking at it now, I understand why I still find it easy to leave places and hard to arrive in them.",
    },
    success: "The learner selects rather than lists and names one turning point.",
    quiz: [
      qmcq("What happens if you claim 'that shaped everything' for several events?", [
        "Each claim is weakened.",
        "The story becomes longer.",
        "The listener stops believing you.",
      ], 0),
      qfill("I ___ up with my grandparents. (grow)", ["grew"]),
      qmcq("What does order alone fail to provide?", [
        "shape",
        "accuracy",
        "chronology",
      ], 0),
    ],
    scenes: [
      sc("Ottavia", "a close friend who has never heard it", "to know you better",
        "A close friend has never heard your history.",
        "Tell it with shape.",
        "I have known you for years and never asked. Where are you from?", "warm"),
      sc("Mr. Lindqvist", "an interviewer asking about your path", "to understand your route",
        "An interview has turned to your background.",
        "Select and shape.",
        "Take me back to the beginning. How did this start?", "attentive"),
      sc("Nadia", "a fellow traveller on a night train", "to hear a real story",
        "A night train has produced a real conversation.",
        "Tell it with shape.",
        "We have all night. Where did you grow up?", "unhurried"),
      sc("Professor Oyibo", "your tutor", "to practise autobiographical shape",
        "The seminar is examining life narrative.",
        "Select and name consequence.",
        "What does a chronology need before it becomes a story?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check extended personal narrative",
        "The examiner invites your history.",
        "Tell it with shape.",
        "Could you tell me about where you come from?", "neutral"),
    ],
  },

  {
    id: "c2-someone-elses-story",
    topic: "retelling a story that is not yours",
    objectives: [
      "Attribute a retold story to its source.",
      "Mark which parts you are unsure of.",
    ],
    goal: "Retell someone else's story without distorting it.",
    target: "attributed retelling",
    correction: "Model the attribution and let the learner retell with sources marked.",
    summary: "You practised retelling a story that was not yours without distorting it.",
    minutes: 8,
    points: [
      {
        form: "as she tells it",
        claims: [
          "'As she tells it' attributes the version to its teller rather than to the world.",
          "It leaves room for the story to be wrong without you having called anyone a liar.",
        ],
        ex: ["As she tells it, nobody warned them.", "As she tells it, it took a year."],
      },
      {
        form: "apparently what happened",
        claims: [
          "'Apparently what happened is X' marks the account as second-hand or unconfirmed.",
          "It does not remove your responsibility: you still chose to repeat it.",
        ],
        ex: ["Apparently what happened was a mix-up.", "Apparently what happened is still disputed."],
      },
      {
        form: "I've only heard",
        claims: [
          "'I've only heard one side of it' states the limit of what you know.",
          "Stating the limit helps the listener judge how much confidence to place in the rest.",
        ],
        ex: ["I've only heard one side of it.", "I've only heard the short version."],
      },
    ],
    ex: [
      mcq("What does 'apparently' NOT do?", [
        "remove your responsibility for repeating it",
        "mark the account as unconfirmed",
        "signal the account is second-hand",
      ], 0),
      mcq("Why state the limit of what you know?", [
        "It helps the listener judge how much to rely on it.",
        "It shortens the story.",
        "It avoids naming anyone.",
      ], 0),
      say("I / have / only heard / one side / of it", ["I've only heard one side of it.", "I have only heard one side of it."]),
    ],
    open: {
      q: "Retell a dispute between two colleagues that you heard about from one of them. Attribute it, mark what is second-hand, and state your limit.",
      must: ["as she tells it", "apparently what happened", "I've only heard"],
      criteria: "The answer attributes the version to its teller, marks second-hand detail and states the limit of the speaker's knowledge.",
      example: "As she tells it, the brief changed twice without anyone telling her. Apparently what happened was a mix-up over which version was live. I've only heard one side of it, so I would not want to say who was at fault.",
    },
    success: "The learner attributes the account and marks the limit of what they know.",
    quiz: [
      qmcq("What does 'as she tells it' leave room for?", [
        "the story being wrong without calling anyone a liar",
        "a shorter retelling",
        "naming the other party",
      ], 0),
      qfill("I've only ___ the short version. (hear)", ["heard"]),
      qmcq("What does 'apparently what happened' mark?", [
        "the account as second-hand",
        "the account as certain",
        "the speaker's own view",
      ], 0),
    ],
    scenes: [
      sc("Perpetua", "a friend asking about a dispute", "to understand what happened",
        "A friend asks about a dispute you only heard about.",
        "Retell it with sources marked.",
        "What actually happened between those two?", "curious"),
      sc("Mr. Dimitrov", "a colleague asking for context", "to handle a situation fairly",
        "A colleague needs context on a dispute.",
        "Attribute and mark the limits.",
        "I am walking into this blind. What should I know?", "cautious"),
      sc("Aurore", "a fellow traveller hearing local gossip", "to understand a story",
        "You are passing on a story you were told locally.",
        "Mark what is second-hand.",
        "Someone said there was trouble here last year. True?", "interested"),
      sc("Professor Oyibo", "your tutor", "to practise attributed retelling",
        "The seminar is examining second-hand accounts.",
        "Attribute and mark limits.",
        "Does marking something second-hand remove your responsibility for it?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check attribution",
        "The examiner asks about something you heard.",
        "Retell it with attribution.",
        "Tell me about something you have only heard second-hand?", "neutral"),
    ],
  },

  {
    id: "c2-a-story-with-a-point",
    topic: "narrative that exists to argue something",
    objectives: [
      "Tell a story whose details serve the argument.",
      "Connect the story back to the claim it supports.",
    ],
    goal: "Use a story to argue something rather than only to entertain.",
    target: "narrative as argument",
    correction: "Model the connection back and let the learner land the point.",
    summary: "You practised narrative that existed to argue something.",
    minutes: 8,
    points: [
      {
        form: "and that's exactly why",
        claims: [
          "'And that's exactly why X' converts the story into evidence for a claim.",
          "The story has to actually support the claim; asserted, the connection is heard as a leap.",
        ],
        ex: ["And that's exactly why we check twice.", "And that's exactly why I asked."],
      },
      {
        form: "which brings me back",
        claims: [
          "'Which brings me back to X' returns to the argument the story was told to serve.",
          "Without the return the listener has an anecdote and no idea what it was for.",
        ],
        ex: ["Which brings me back to the budget.", "Which brings me back to my point."],
      },
      {
        form: "that's what I mean",
        claims: [
          "'That's what I mean by X' uses the story to define a term you used earlier.",
          "A single case shows what the term means without showing how often it applies, which is the limit of the move.",
        ],
        ex: ["That's what I mean by careless.", "That's what I mean by too late."],
      },
    ],
    ex: [
      mcq("What happens if a story never returns to the argument?", [
        "The listener has an anecdote and no idea what it was for.",
        "The story becomes more persuasive.",
        "The argument is conceded.",
      ], 0),
      mcq("What is the limit of defining a term with one story?", [
        "It shows what the term means, not how often it applies.",
        "It cannot define a term at all.",
        "It only works in writing.",
      ], 0),
      say("which / bring / me / back / to the budget", ["Which brings me back to the budget."]),
    ],
    open: {
      q: "Argue that your team needs a second reviewer, using one short story as your evidence. Connect it back, and name what the story does not prove.",
      must: ["and that's exactly why", "which brings me back", "that's what I mean"],
      criteria: "The answer uses the story as evidence, returns to the claim and states what a single case cannot establish.",
      example: "One typo in a price field cost us four thousand pounds. That's what I mean when I say this risk is cheap to prevent. And that's exactly why I want a second reviewer, which brings me back to the request. One case shows the cost, not how often it happens.",
    },
    success: "The learner uses the story as evidence and names its limit.",
    quiz: [
      qmcq("What must be true for 'and that's exactly why' to land?", [
        "The story actually supports the claim.",
        "The story is entertaining.",
        "The claim comes first.",
      ], 0),
      qfill("Which ___ me back to my point. (bring)", ["brings"]),
      qmcq("What does 'that's what I mean by X' use the story for?", [
        "showing what a term used earlier means",
        "proving a general rule",
        "changing the subject",
      ], 0),
    ],
    scenes: [
      sc("Perpetua", "a friend who wants the point", "to see what you are getting at",
        "A friend is waiting for the point of your story.",
        "Connect it to the claim.",
        "Good story, but what are you getting at?", "patient"),
      sc("Mr. Dimitrov", "a manager deciding on resources", "to decide about a second reviewer",
        "A resourcing decision needs an argument.",
        "Use the story as evidence.",
        "Make the case for another pair of eyes?", "evaluative"),
      sc("Aurore", "a fellow traveller in a discussion", "to be persuaded",
        "A discussion needs a concrete example.",
        "Argue with a story.",
        "That is all very abstract. Can you give me a case?", "sceptical"),
      sc("Professor Oyibo", "your tutor", "to practise narrative argument",
        "The seminar is examining narrative as evidence.",
        "Connect the story to the claim.",
        "What does a single story prove, and what does it not?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check argumentative narrative",
        "The examiner asks for a case in point.",
        "Argue with a story.",
        "Why should anyone learn a second language? Give me a case?", "neutral"),
    ],
  },

  {
    id: "c2-holding-an-audience",
    topic: "sustaining a turn nobody interrupts",
    objectives: [
      "Ask for a stretch of uninterrupted time and use it.",
      "Tell the listener why the detail matters before giving it.",
    ],
    goal: "Hold a long turn that nobody wants to interrupt.",
    target: "holding the floor",
    correction: "Model the promise and let the learner keep the audience.",
    summary: "You practised sustaining a long turn that nobody wanted to interrupt.",
    minutes: 9,
    points: [
      {
        form: "bear with me",
        claims: [
          "'Bear with me' asks for patience explicitly, which is easier to grant than to assume.",
          "It creates an expectation that the relevance will become clear soon.",
        ],
        ex: ["Bear with me, this connects.", "Bear with me for one minute."],
      },
      {
        form: "this is the part",
        claims: [
          "'This is the part that matters' tells the listener where to spend their attention.",
          "Repeated use weakens its ability to mark any one point as the central one.",
        ],
        ex: ["This is the part that matters.", "This is the part I keep thinking about."],
      },
      {
        form: "you'll see why",
        claims: [
          "'You'll see why in a moment' justifies a detail whose relevance is not yet clear.",
          "It is a promise about the near future, so a long delay before the payoff breaks it.",
        ],
        ex: ["You'll see why in a moment.", "You'll see why that matters."],
      },
    ],
    ex: [
      mcq("What expectation does 'bear with me' create?", [
        "that the relevance will become clear soon",
        "that the turn will be short",
        "that questions are welcome",
      ], 0),
      mcq("What does repeating 'this is the part that matters' weaken?", [
        "its ability to mark any one point as central",
        "The audience listens harder.",
        "The turn becomes shorter.",
      ], 0),
      say("bear with me / this / connect", ["Bear with me, this connects."]),
    ],
    open: {
      q: "Hold a long turn explaining a decision nobody agrees with yet. Ask for the time, justify one unclear detail, and mark the part that matters.",
      must: ["bear with me", "this is the part", "you'll see why"],
      criteria: "The answer asks for time, justifies a detail whose relevance is not yet clear, and marks one central part only.",
      example: "Bear with me, this connects. In March we lost two suppliers in a fortnight — you'll see why that matters. We rebuilt the schedule around a single source. This is the part that matters: that source is the one we are now being asked to drop.",
    },
    success: "The learner asks for the time and directs attention to one central part.",
    quiz: [
      qmcq("Why is asking for patience better than assuming it?", [
        "Patience is easier to grant than to assume.",
        "It is more formal.",
        "It shortens the turn.",
      ], 0),
      qfill("___ with me, this connects. (bear)", ["Bear"]),
      qmcq("What breaks the promise in 'you'll see why in a moment'?", [
        "a long delay before the payoff",
        "a short explanation",
        "repeating the detail",
      ], 0),
    ],
    scenes: [
      sc("Perpetua", "a friend who keeps interrupting", "to understand your reasoning",
        "A friend keeps interrupting your explanation.",
        "Ask for the time and hold it.",
        "Sorry, but why does any of that matter?", "impatient"),
      sc("Mr. Dimitrov", "a room that disagrees with you", "to hear the full reasoning",
        "A room has not yet accepted your decision.",
        "Hold the turn and direct attention.",
        "Nobody here agrees with this. Explain it properly?", "unconvinced"),
      sc("Aurore", "a fellow traveller listening to a long account", "to follow a long account",
        "A long account needs uninterrupted time.",
        "Ask for the time and use it.",
        "This sounds complicated. Start from the beginning?", "willing"),
      sc("Professor Oyibo", "your tutor", "to practise holding the floor",
        "The seminar is examining sustained turns.",
        "Ask for time and direct attention.",
        "What expectation does asking for patience create?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check sustained speech",
        "The examiner invites a long explanation.",
        "Hold the turn and mark the key part.",
        "Explain a decision of yours that others questioned?", "neutral"),
    ],
  },
];
