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
import { chat, fc, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

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
          "'Before we start, let's agree what X means' puts the definition ahead of the dispute; 'let's agree that X means Y' goes further and proposes one.",
          "The definition shapes what counts as evidence, so proposing a specific one is itself a move in the argument.",
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
    ex: [],
    drills: [
      // p1 — before we start let's
      sit("p1", "A debate on whether the city is 'safe' is about to begin. You want to PROPOSE a definition yourself before anyone argues. What do you say?", [
        "Before we start, let's agree that 'safe' means safe to walk at night.",
        "What exactly do we mean by 'safe'?",
        "Before we started, let's agree that 'safe' means safe to walk at night.",
      ]),
      chat("p1", ["Right, let's argue about whether the new rota is fair.", null], [
        "Before we start, let's agree what 'fair' means.",
        "Before we start, let agree what 'fair' means.",
        "Before to start, let's agree what 'fair' means.",
      ]),
      lc("p1", "Before we start, let's define the scope.", ["Before we finish, let's check the budget.", "Once we begin, the scope will change."]),
      // p2 — what exactly do we mean
      chat("p2", ["We all agree the trial was a success, so let's move on.", null], [
        "Hang on. What exactly do we mean by 'success'?",
        "Hang on. What exactly do we means by 'success'?",
        "Hang on. What exact do we mean by 'success'?",
      ]),
      sit("p2", "People in a meeting keep using the word 'success', and you suspect they mean different things. You want to ASK for the definition without committing to one yourself. What do you say?", [
        "What exactly do we mean by 'success'?",
        "Before we start, let's agree that success means profit.",
        "Success means profit, and that's the real question.",
      ]),
      spk("p2", "What exactly do we mean by success?"),
      // p3 — that's the real question
      sit("p3", "Two colleagues are arguing about the price of a new system. You think the price doesn't decide anything; what decides it is whether anyone will use it. What do you say?", [
        "Whether anyone will use it, that's the real question.",
        "Before we start, let's agree what 'price' means.",
        "What exactly do we mean by 'price'?",
      ]),
      lc("p3", "That's the real question, not the cost.", ["That's a different question about the cost.", "It's not a question of money, really."]),
      chat("p3", ["You keep saying the cost is too high.", null], [
        "Forget the cost. Whether it works, that's the real question.",
        "Forget the cost. Whether it works, that's the real questions.",
        "Forget the cost. Whether it works, that's real the question.",
      ]),
      // mix
      pairs("mix", [
        ["Before we start,", "let's agree what 'fair' means."],
        ["What exactly", "do we mean by 'fair'?"],
        ["That's the real", "question, not the cost."],
      ]),
      sit("mix", "In a debate on whether exams are 'fair', you want to do two things: first offer your own definition of 'fair', then move the argument to the point you think decides it. Which does both?", [
        "Before we start, let's say fair means equal conditions. So are conditions equal? That's the real question.",
        "What exactly do we mean by fair? I'll leave that to you.",
        "Exams are unfair, obviously. That's the real question.",
      ]),
    ],
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
        "Our motion today is that tourism ruins small towns. Before anyone argues, how would you open?", "probing"),
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
    ex: [],
    drills: [
      // p1 — that assumes
      sit("p1", "A colleague says, 'If we build a car park, more customers will come.' The argument quietly depends on people wanting to come by car. You attack the reasoning, not the person. What do you say?", [
        "That assumes people want to come by car.",
        "You clearly know nothing about business.",
        "That assume people want to come by car.",
      ]),
      chat("p1", ["Prices will go up, so people will simply buy less.", null], [
        "That assumes people have a choice.",
        "That assumes people has a choice.",
        "That assuming people have a choice.",
      ]),
      lc("p1", "That assumes everyone has a car.", ["That means everyone needs a ticket.", "Not everyone wants to drive."]),
      // p2 — your premise is
      sit("p2", "Someone argues, 'Remote workers are less productive, so we should end remote work.' You accept the logic but think the starting point is false. You attack it. What do you say?", [
        "Your premise is that remote workers are less productive, and I dispute it.",
        "That doesn't follow from what you said.",
        "Your premise are that remote workers are less productive, and I dispute it.",
      ]),
      chat("p2", ["Demand will never change, so one factory is all we'll ever need.", null], [
        "Your premise is that demand will never change. I'd dispute that.",
        "Your premise is that demand will never changes. I'd dispute that.",
        "You premise is that demand will never change. I'd dispute that.",
      ]),
      spk("p2", "Your premise is one I'd dispute."),
      // p3 — that doesn't follow
      sit("p3", "Someone says, 'Crime fell after the new law, so the law caused it.' You ACCEPT that crime fell, but the cause has not been shown. What do you say?", [
        "Crime fell, I accept. But that the law caused it? That doesn't follow.",
        "Your premise is that crime fell, and I dispute it.",
        "You obviously don't understand statistics.",
      ]),
      lc("p3", "That doesn't follow from what you said.", ["I didn't hear what you said.", "That's not what you said before."]),
      chat("p3", ["Most of our users are young, so older people must dislike the app.", null], [
        "That doesn't follow. Being a minority doesn't mean they dislike it.",
        "That don't follow. Being a minority doesn't mean they dislike it.",
        "That doesn't follows. Being a minority doesn't mean they dislike it.",
      ]),
      // mix
      pairs("mix", [
        ["That assumes", "demand stays flat."],
        ["Your premise", "is one I'd dispute."],
        ["That doesn't", "follow from what you said."],
      ]),
      chat("mix", ["Sales fell after the redesign, so the redesign failed.", null], [
        "That assumes nothing else changed, and even then it doesn't follow.",
        "Well, you were never any good at design.",
        "That assume nothing else changed, and even then it doesn't follow.",
      ]),
    ],
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
        "People who work from home are lazy, so remote work should end. Obvious, isn't it?", "confident"),
      sc("Ms. Aturu", "a colleague presenting a case", "to have the case tested",
        "A colleague's case rests on an unstated assumption.",
        "Surface the assumption.",
        "Sales rose after we cut prices, so the price cut worked. The numbers speak for themselves, don't they?", "assured"),
      sc("Rui", "a fellow traveller arguing a point", "to win an argument",
        "Your companion's argument has a gap in it.",
        "Show the gap.",
        "Cities are better places to live than villages, and everyone I know agrees. Doesn't that settle it?", "insistent"),
      sc("Professor Halvard", "your tutor", "to practise argument analysis",
        "The seminar is examining argument structure.",
        "Attack the reasoning precisely.",
        "Here is an argument: young people read less, so they know less. How would you attack the reasoning?", "probing"),
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
    ex: [],
    drills: [
      // p1 — I'll grant you that
      sit("p1", "A friend says your plan is expensive. It is, but cost isn't what the decision depends on. You want to concede that point openly and keep your plan. What do you say?", [
        "I'll grant you that it's expensive.",
        "You're right, the whole plan is a mistake.",
        "I'll granting you that it's expensive.",
      ]),
      chat("p1", ["You have to admit there's some risk.", null], [
        "I'll grant you that much, but it's a small one.",
        "I'll grant to you that much, but it's a small one.",
        "I'll grants you that much, but it's a small one.",
      ]),
      lc("p1", "I'll grant you that the cost is high.", ["I'll send you the costs tonight.", "I'd like to see the figures first."]),
      // p2 — you're right about
      sit("p2", "A colleague objects to your proposal on timing and on cost. You accept the timing point ONLY, and you don't want to seem to accept anything else. What do you say?", [
        "You're right about the timing.",
        "You're right.",
        "You're right about everything.",
      ]),
      chat("p2", ["Your plan starts too late in the year, and it costs too much.", null], [
        "You're right about the start date, but not about the cost.",
        "You're right on about the start date, but not about the cost.",
        "You're rights about the start date, but not about the cost.",
      ]),
      spk("p2", "You're right about the first part."),
      // p3 — even accepting that
      sit("p3", "You have just conceded that the project will run a month late. You want to show your conclusion still stands. What do you say?", [
        "Even accepting that, it's still worth doing.",
        "So I suppose we should cancel it.",
        "Even accepted that, it's still worth doing.",
      ]),
      lc("p3", "Even accepting that, the case holds.", ["Everyone accepted the case.", "Even after that, the case was closed."]),
      chat("p3", ["Fine, the second phase will be slower. So?", null], [
        "Even accepting that, I'd still go ahead.",
        "Even accept that, I'd still go ahead.",
        "Even accepting that, I'd still going ahead.",
      ]),
      // mix
      pairs("mix", [
        ["I'll grant you", "that much."],
        ["You're right", "about the timing."],
        ["Even", "accepting that, the case holds."],
      ]),
      sit("mix", "Someone says your plan is too expensive and too slow. Only the cost point is true. You want to accept the cost point, name it exactly, and show your conclusion survives. Which answer does all three?", [
        "You're right about the cost. Even accepting that, it's worth doing.",
        "You're right. It's too expensive and too slow.",
        "I'll grant you that, so let's drop the plan.",
      ]),
    ],
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
        "Suppose a critic says your plan is costly and unpopular, and only the cost is true. How do you reply?", "probing"),
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
          "In a debate, 'I put it to you that X' puts your claim to the audience or panel for their judgement.",
          "In cross-examination the same phrase is put to a witness; in a debate, aiming it at those who decide, not at the opponent, is deliberate.",
        ],
        ex: ["I put it to you that the reverse is true.", "I put it to you plainly."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I oppose the motion
      sit("p1", "You are speaking AGAINST the motion in a formal debate. The chair asks you to begin. What is your first sentence?", [
        "I oppose the motion on two grounds.",
        "I support the motion on two grounds.",
        "I oppose to the motion on two grounds.",
      ]),
      chat("p1", ["The motion is that exams should be abolished. Speaker for the opposition?", null], [
        "Thank you. I oppose the motion.",
        "Thank you. I oppose against the motion.",
        "Thank you. I opposing the motion.",
      ]),
      lc("p1", "I oppose the motion before us.", ["I support the plan we discussed.", "I'd like to close the debate now."]),
      // p2 — my opponent claims
      sit("p2", "Your opponent said, 'Social media spreads false stories faster than corrections.' Before answering, you want to restate that case in a way your opponent would recognise. Which is fair?", [
        "My opponent claims that false stories spread faster than corrections.",
        "My opponent claims that social media should be banned.",
        "My opponent claim that false stories spread faster than corrections.",
      ]),
      chat("p2", ["Please respond to the proposition's case.", null], [
        "My opponent claims the cost is trivial. It is not.",
        "My opponent claim the cost is trivial. It is not.",
        "My opponent is claims the cost is trivial. It is not.",
      ]),
      spk("p2", "My opponent claims this is settled."),
      // p3 — I put it to you
      sit("p3", "In a formal debate the audience votes at the end. You want to put your strongest claim directly to them. What do you say?", [
        "I put it to you that the reverse is true.",
        "My opponent claims that the reverse is true.",
        "I put to you it that the reverse is true.",
      ]),
      lc("p3", "I put it to you that the reverse is true.", ["I'd like to thank the audience.", "We'll leave the vote until later."]),
      chat("p3", ["Your closing words to the house?", null], [
        "I put it to you that this motion goes too far.",
        "I put you to it that this motion goes too far.",
        "I puts it to you that this motion goes too far.",
      ]),
      // mix
      pairs("mix", [
        ["I oppose", "the motion on two grounds."],
        ["My opponent", "claims the cost is trivial."],
        ["I put it", "to you that the reverse is true."],
      ]),
      sit("mix", "You are opening for the opposition. You want to state your side first, and then restate the other side's case fairly. Which opening does both?", [
        "I oppose the motion. My opponent claims social media has made debate worse, and partly it has.",
        "My opponent is simply wrong, and everyone here knows it.",
        "I put it to you that I am right.",
      ]),
    ],
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
        "Right, the motion is that cities should ban cars, and you're opposing. Opening statement?", "playful"),
      sc("Ms. Aturu", "a colleague chairing a debate", "to run a fair debate",
        "A workplace debate is being chaired formally.",
        "State your side and answer the other case.",
        "The motion is that we move to a four-day week. You have two minutes against it. Will you begin?", "formal"),
      sc("Rui", "a fellow traveller in a hostel debate", "to argue for sport",
        "A hostel argument has become a proper debate.",
        "Argue the assigned side.",
        "The motion is that tourists should pay a city tax. You're against it, so will you make your case?", "engaged"),
      sc("Professor Halvard", "your tutor", "to practise debate conventions",
        "The seminar is examining debate conventions.",
        "Argue under the conventions.",
        "The motion is that social media has made public debate worse. You're opposing. How do you open?", "probing"),
      sc("Ms. Ilunga", "the examiner", "to check formal argument",
        "The examiner sets a motion.",
        "Oppose it under the conventions.",
        "The motion is that exams should be abolished. You are opposing it. How do you begin?", "neutral"),
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
          "'For the sake of argument' asks the listener to entertain a case for now, without committing you to it.",
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
    ex: [],
    drills: [
      // p1 — for the sake of argument
      sit("p1", "Your team loves a plan. You don't think it will fail, but you want to test it by arguing that it might, without people thinking that's your real view. What do you say?", [
        "For the sake of argument, suppose the plan fails.",
        "Honestly, I think the plan will fail.",
        "For the sake of argue, suppose the plan fails.",
      ]),
      chat("p1", ["Wait, so you actually think the figures are wrong?", null], [
        "No, I'm saying it for the sake of argument.",
        "No, I'm saying it for the sake for argument.",
        "No, I'm saying it for a sake of argument.",
      ]),
      lc("p1", "For the sake of argument, suppose it works.", ["For your own safety, make sure it works.", "I suppose it works well enough."]),
      // p2 — someone has to say
      sit("p2", "Everyone in the room is thinking the deadline is impossible, but nobody has said it yet. You decide to raise it. What do you say?", [
        "Someone has to say it: the deadline is impossible.",
        "As others have already said, the deadline is impossible.",
        "Someone have to say it: the deadline is impossible.",
      ]),
      chat("p2", ["Why are you the one bringing this up?", null], [
        "Because someone has to say it.",
        "Because someone has to saying it.",
        "Because someone have to say it.",
      ]),
      spk("p2", "Someone has to say the obvious thing."),
      // p3 — let me push back
      sit("p3", "A colleague says the plan is ready to go. You want to challenge that before anyone decides. What do you say?", [
        "Let me push back on that.",
        "Let me just agree with that.",
        "Let me back push on that.",
      ]),
      lc("p3", "Let me push back for a moment.", ["Let me think about it for a moment.", "Let me get my coat first."]),
      chat("p3", ["So we're all agreed on the budget?", null], [
        "Let me push back on that before we decide.",
        "Let me pushing back on that before we decide.",
        "Let me pushed back on that before we decide.",
      ]),
      // mix
      sit("mix", "A friend has decided on a plan too fast. You want to challenge it AND make clear you are only testing it, not attacking it. What do you say?", [
        "Let me push back, just for the sake of argument.",
        "Let me push back, because I think it's a terrible plan.",
        "For the sake of argument, I agree completely.",
      ]),
      pairs("mix", [
        ["For the sake", "of argument, suppose it works."],
        ["Someone has", "to say it."],
        ["Let me push", "back on that."],
      ]),
    ],
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
        "I've decided to quit my job and travel for a year. It's settled. Unless you think otherwise?", "breezy"),
      sc("Mr. Nkemdirim", "a colleague in a room that agreed too fast", "to make a robust decision",
        "A team has agreed unanimously in minutes.",
        "Argue against it, marked as testing.",
        "Everyone agrees we should move the whole team to the new software next week. Shall we move on?", "hurried"),
      sc("Beatriks", "a fellow traveller with a firm plan", "to check the plan holds",
        "A travel plan has not been questioned at all.",
        "Push back as a test.",
        "Our plan is to see four cities in five days. It's fine, isn't it? Any objections?", "casual"),
      sc("Professor Halvard", "your tutor", "to practise advocacy without belief",
        "The seminar is examining devil's advocacy.",
        "Argue a case you do not hold.",
        "Here is a view you probably share: reading is good for children. Can you argue against it, just as a test?", "probing"),
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
    ex: [],
    drills: [
      // p1 — that's a fair question
      sit("p1", "A journalist asks why your project went over budget. You intend to answer it fully. How do you start?", [
        "That's a fair question, and I'll answer it.",
        "That's a fair question. Next question, please.",
        "That's a fairly question, and I'll answer it.",
      ]),
      chat("p1", ["Why did you keep the delay from us?", null], [
        "That's a fair question. We hoped to catch up, and we didn't.",
        "That's a fair questions. We hoped to catch up, and we didn't.",
        "That's fair a question. We hoped to catch up, and we didn't.",
      ]),
      lc("p1", "That's a fair question and I'll answer it.", ["That's a hard one to explain.", "I'll ask the question again later."]),
      // p2 — I won't pretend
      sit("p2", "The board asks how the launch went. It went badly, and you want to admit that before anyone forces you to. What do you say?", [
        "I won't pretend it went well.",
        "It went about as well as expected.",
        "I won't to pretend it went well.",
      ]),
      chat("p2", ["Did you see the problem coming?", null], [
        "No. I won't pretend we saw it coming.",
        "No. I won't pretended we saw it coming.",
        "No. I won't pretending we saw it coming.",
      ]),
      spk("p2", "I won't pretend we saw it coming."),
      // p3 — honestly I don't know
      sit("p3", "Your manager asks why a test failed. You don't know yet, and finding out is your job. What is the best answer?", [
        "Honestly, I don't know yet, but I'll find out by Friday.",
        "It was probably the network, I imagine.",
        "Honestly, I don't knowing yet, but I'll find out by Friday.",
      ]),
      lc("p3", "Honestly, I don't know yet.", ["Honestly, I don't mind either way.", "Actually, I knew it already."]),
      chat("p3", ["So what caused the second delay?", null], [
        "Honestly, I don't know, and I'll find out.",
        "Honestly, I not know, and I'll find out.",
        "Honestly, I don't knowing, and I'll find out.",
      ]),
      // mix
      pairs("mix", [
        ["That's a fair", "question, and I'll answer it."],
        ["I won't pretend", "it went well."],
        ["Honestly, I", "don't know yet."],
      ]),
      chat("mix", ["A year late. How did that happen?", null], [
        "That's a fair question. I won't pretend we managed it well: we underestimated the work.",
        "That's a fair question. Anyway, let's talk about the good news.",
        "Next question, please. It was nobody's fault.",
      ]),
    ],
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
        "Imagine I'm chairing your project review: why did your project run a year late?", "probing"),
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
    ex: [],
    drills: [
      // p1 — I was mistaken
      sit("p1", "You said a rival's figures were invented. They are audited and correct, but your other points still stand. What do you say?", [
        "I was mistaken about the figures.",
        "I was wrong about everything, sorry.",
        "I was mistake about the figures.",
      ]),
      chat("p1", ["Those dates were from last year, not this year.", null], [
        "You're right. I was mistaken about the dates.",
        "You're right. I mistaken about the dates.",
        "You're right. I was mistaking about the dates.",
      ]),
      lc("p1", "I was mistaken, and you were right.", ["I was waiting, and you were late.", "You made a mistake, and I was right."]),
      // p2 — you've changed my mind
      sit("p2", "A colleague's argument has convinced you, and you will now delay the launch. What do you say?", [
        "You've changed my mind. Let's delay the launch.",
        "You've changed my mind, but let's launch as planned.",
        "You've change my mind. Let's delay the launch.",
      ]),
      chat("p2", ["So, do you still think we should launch in March?", null], [
        "No, you've changed my mind on that.",
        "No, you've changed mine mind on that.",
        "No, you've changing my mind on that.",
      ]),
      spk("p2", "You've changed my mind about the timing."),
      // p3 — I withdraw that
      sit("p3", "In a formal meeting you called a colleague's report 'careless'. It wasn't. You want to remove the remark from the record without suggesting you meant harm. What do you say?", [
        "I withdraw that remark.",
        "I withdrawn that remark.",
        "I withdraw from that remark.",
      ]),
      lc("p3", "I withdraw that point.", ["I agree with that point.", "I'd like to make a point."]),
      chat("p3", ["Do you stand by calling the report careless?", null], [
        "No. I withdraw that; it was unfair.",
        "No. I withdraws that; it was unfair.",
        "No. I withdraw it that; it was unfair.",
      ]),
      // mix
      sit("mix", "In a formal debate you were proved wrong about one claim. You want to remove that claim and credit the argument that convinced you. What do you say?", [
        "I withdraw that. You've changed my mind on the figures.",
        "I withdraw everything I said today.",
        "You've changed my mind, but I stand by the claim.",
      ]),
      chat("mix", ["The auditor confirmed my figures this morning. Do you accept that?", null], [
        "I do. I was mistaken, and I withdraw that claim.",
        "I do. But I still say the figures were invented.",
        "I do. I was mistaken, and I withdraw that claims.",
      ]),
    ],
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
        "Suppose you said in a meeting that a rival's growth was invented, and now it turns out to be audited. What do you say?", "probing"),
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
          "In writing, or with a listener who does not share the joke, it is easily read as real enthusiasm, which is why it works best face to face.",
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
    ex: [],
    drills: [
      // p1 — how thrilling
      sit("p1", "You want to say 'How thrilling' about a long training course and be understood as joking. Which listener is MOST likely to read it as irony?", [
        "a colleague who has done the course and found it dull",
        "a new colleague who has never heard of the course",
        "a stranger reading your message online",
      ]),
      chat("p1", ["They've added a two-hour safety video to Friday.", null], [
        "Two hours. How thrilling.",
        "Two hours. How thrilled.",
        "Two hours. So thrill.",
      ]),
      lc("p1", "A four-hour meeting. How thrilling.", ["A four-hour flight. How tiring.", "A short meeting. How lucky."]),
      // p2 — can't wait
      sit("p2", "You want to reply 'Can't wait' ironically to news of yet another form to fill in. Where is it LEAST likely to be misread?", [
        "face to face, with a colleague who hates forms",
        "in a short email to someone you have never met",
        "in a text to a manager who loves paperwork",
      ]),
      chat("p2", ["There's another form to fill in before Friday.", null], [
        "Another form. Can't wait.",
        "Another form. Can't waiting.",
        "Another form. Not can wait.",
      ]),
      spk("p2", "Can't wait for that."),
      // p3 — delighted I'm sure
      sit("p3", "A neighbour announces they are starting drum lessons at home. You want your irony to be obvious, even a little theatrical. What do you say?", [
        "Delighted, I'm sure.",
        "Delighting, I'm sure.",
        "Delight, I'm sure.",
      ]),
      lc("p3", "Delighted, I'm sure.", ["I'm sure you're right.", "Delighted to meet you."]),
      chat("p3", ["My cousin's band is going to practise in our flat every night this week.", null], [
        "Every night. Delighted, I'm sure.",
        "Every night. Delighting, I'm sure.",
        "Every night. Delighted, I sure.",
      ]),
      // mix
      pairs("mix", [
        ["How", "thrilling."],
        ["Can't", "wait."],
        ["Delighted,", "I'm sure."],
      ]),
      sit("mix", "You are writing a quick message to a new client about a long delay. Why is a deadpan 'Can't wait' or 'How thrilling' a bad idea here?", [
        "Without shared context, it may be read as real enthusiasm.",
        "Deadpan lines are too formal for clients.",
        "Both lines can only be used about meetings.",
      ]),
    ],
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
        "The Friday training is mandatory this time, all four hours of it. Pleased?", "resigned"),
      sc("Sanna", "a fellow traveller facing another delay", "to keep it light",
        "A third delay has been announced.",
        "React deadpan.",
        "Another two hours. How are you feeling about that?", "weary"),
      sc("Dr. Weatherby", "your tutor", "to practise deadpan",
        "The seminar is examining unmarked irony.",
        "Deliver irony flat and name the risk.",
        "News for you: tomorrow's seminar has become a three-hour lecture on footnotes. Your reaction?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check ironic control",
        "The examiner reports something tedious.",
        "React deadpan.",
        "Imagine a friend who hates exams tells you the test now has a two-hour written section. What would you say to them?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — I'm hopeless at
      sit("p1", "In an interview for an accounting job, you want a light joke about yourself that nobody needs to reassure you about. Which is safe?", [
        "I'm hopeless at remembering names, so forgive me.",
        "I'm hopeless at numbers, to be honest.",
        "I'm hopeful at remembering names, so forgive me.",
      ]),
      chat("p1", ["You walked straight past the station again!", null], [
        "I know. I'm hopeless at directions.",
        "I know. I'm hopelessly at directions.",
        "I know. I'm hopeless for directions.",
      ]),
      lc("p1", "I'm hopeless at remembering names.", ["I'm good at remembering faces.", "I never forget a birthday."]),
      // p2 — typical of me
      sit("p2", "You've got on the wrong bus, a small mistake you often make. You want it to sound familiar, not serious. What do you say?", [
        "Typical of me, wrong bus.",
        "This is a disaster, I can't believe it.",
        "Typical of mine, wrong bus.",
      ]),
      chat("p2", ["You're on the wrong platform, aren't you?", null], [
        "Typical of me, wrong platform.",
        "Typically of me, wrong platform.",
        "Typical of mine, wrong platform.",
      ]),
      spk("p2", "Typical of me to forget."),
      // p3 — don't ask me why
      sit("p3", "You bought two identical umbrellas by accident. A friend laughs. You don't want to explain. What do you add?", [
        "I bought two. Don't ask me why.",
        "I bought two. Let me explain exactly why.",
        "I bought two. Don't ask to me why.",
      ]),
      lc("p3", "Don't ask me why I did that.", ["Do you know why I did that?", "Don't worry, I'll do that."]),
      chat("p3", ["Why are you wearing two different shoes?", null], [
        "No idea. Don't ask me why.",
        "No idea. Don't asking me why.",
        "No idea. Not ask me why.",
      ]),
      // mix
      pairs("mix", [
        ["I'm hopeless", "at directions."],
        ["Typical", "of me to forget."],
        ["Don't ask", "me why."],
      ]),
      chat("mix", ["You're late, and you went to the wrong building?", null], [
        "Typical of me. I'm hopeless at directions.",
        "Typical of me. I'm hopeless with at directions.",
        "Typically me. I'm hopeless at directions.",
      ]),
    ],
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
        "You walked into the wrong meeting room again this morning, and everyone saw. What happened?", "easy"),
      sc("Sanna", "a fellow traveller who noticed your error", "to laugh about it",
        "You boarded the wrong train and had to come back.",
        "Make yourself the joke.",
        "You went the wrong way, didn't you?", "teasing"),
      sc("Dr. Weatherby", "your tutor", "to practise self-deprecation",
        "The seminar is examining self-deprecation.",
        "Keep the joke small.",
        "Tell me about something small that you always get wrong. What is it?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check register in self-description",
        "The examiner asks about a weakness.",
        "Be self-deprecating without fishing.",
        "What small everyday thing do you always get wrong?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — oh brilliant
      sit("p1", "The lift breaks down while you and a neighbour are carrying shopping to the ninth floor. Nobody caused it. You want to share the frustration without blaming anyone. What do you say?", [
        "Oh brilliant, the lift is out again.",
        "Oh brilliant, you broke the lift again.",
        "Oh brilliance, the lift is out again.",
      ]),
      chat("p1", ["The train's cancelled, and the next one is in two hours.", null], [
        "Oh brilliant. Now what?",
        "Oh brilliance. Now what?",
        "Oh brilliantly. Now what?",
      ]),
      lc("p1", "Oh brilliant, the lift is out again.", ["Oh good, the lift is working again.", "We'll take the stairs again."]),
      // p2 — just perfect
      sit("p2", "On a trip you miss the bus, then lose your hat, and now it starts to rain. You want comic exaggeration. What do you say?", [
        "Rain as well. Just perfect.",
        "Rain as well. Just perfectly.",
        "Rain as well. Justly perfect.",
      ]),
      chat("p2", ["Sorry, the cafe just closed, and the other one is full too.", null], [
        "Just perfect. The third time today.",
        "Just perfect. The three time today.",
        "Justly perfect. The third time today.",
      ]),
      spk("p2", "Rain as well, just perfect."),
      // p3 — that went well
      sit("p3", "A presentation you and a colleague gave together went badly, and you were both responsible. You want to make clear you are inside the failure too. What do you say?", [
        "Well, our presentation went well.",
        "Well, your presentation went well.",
        "Well, our presentation goes well.",
      ]),
      lc("p3", "Well, that went well.", ["Well, that was quick.", "That went on for hours."]),
      chat("p3", ["We forgot the slides, and the client left early.", null], [
        "Well, that went well, didn't it?",
        "Well, that gone well, didn't it?",
        "Well, that went well, wasn't it?",
      ]),
      // mix
      sit("mix", "A colleague's slides crashed in front of a client, and the crash was not your fault. Which line would sound like contempt for the colleague?", [
        "Oh brilliant, your slides again. That went well.",
        "Oh brilliant, of all days for the system to fail.",
        "Just perfect, the software has crashed again.",
      ]),
      chat("mix", ["The projector died, and then the fire alarm went off.", null], [
        "Oh brilliant. Just perfect.",
        "Oh brilliant. Just perfectly.",
        "Oh brilliantly. Just perfect.",
      ]),
    ],
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
        "Our joint presentation just crashed in front of the whole department. How do you react?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check judgement about sarcasm",
        "The examiner describes a shared setback.",
        "Aim the sarcasm at the situation.",
        "Your group's printer jammed ten minutes before the deadline. Reaction?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — you would say that
      sit("p1", "An old friend, a lifelong fan of one football team, says that team is the best in the country. You want to tease her gently for being predictable. What do you say?", [
        "You would say that.",
        "Takes one to know one.",
        "You would says that.",
      ]),
      chat("p1", ["As a baker, I think bread is the best food there is.", null], [
        "Well, you would say that, wouldn't you?",
        "Well, you would say that, would you?",
        "Well, you will say that, wouldn't you?",
      ]),
      lc("p1", "You would say that, wouldn't you?", ["What did you say about that?", "Why didn't you tell me before?"]),
      // p2 — takes one to know one
      sit("p2", "A friend jokingly calls you a terrible cook, and you know he burns everything too. You want to return the tease and keep it mutual. What do you say?", [
        "Takes one to know one.",
        "That's really hurtful, actually.",
        "Take one to knows one.",
      ]),
      chat("p2", ["You're the most stubborn person I know.", null], [
        "Well, takes one to know one.",
        "Well, takes one to knowing one.",
        "Well, take one to know ones.",
      ]),
      spk("p2", "Takes one to know one."),
      // p3 — very funny
      sit("p3", "A friend's teasing is starting to go too far. You want to end it lightly and get back to your story. What do you say?", [
        "Very funny. Now let me finish.",
        "Takes one to know one.",
        "Very fun. Now let me finish.",
      ]),
      lc("p3", "Very funny. Now let me finish.", ["Fair enough, I'll finish later.", "That was a funny film."]),
      chat("p3", ["Nice jacket. Did you borrow it from your grandad?", null], [
        "Very funny. My turn now.",
        "Very funnily. My turn now.",
        "Much funny. My turn now.",
      ]),
      // mix
      sit("mix", "An old friend teases you for always being late. You want to return the tease first, and then signal it's time to stop. Which reply does both, in that order?", [
        "Takes one to know one. Very funny, now let's eat.",
        "Very funny. Takes one to know one.",
        "You would say that. Takes one to know one.",
      ]),
      chat("mix", ["Slow service again. You chose the place, so it's your fault, like I always say.", null], [
        "Very funny. You would say that, wouldn't you?",
        "Very funny. You would saying that, wouldn't you?",
        "Very fun. You would say that, wouldn't you?",
      ]),
    ],
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
        "Imagine an old friend says to you: late again, you've never been on time in your life! What do you say back?", "probing"),
      sc("Ms. Falconer", "the examiner", "to check informal register",
        "The examiner makes a light joke at your expense.",
        "Return it warmly.",
        "Imagine a close friend teases you: you only like that band because everyone else does. How do you reply?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — too soon
      sit("p1", "The day after a friend's car was badly scratched, you joked about it and nobody laughed. The joke itself was fine; it was simply too early. What do you say?", [
        "Too soon, sorry.",
        "You're too sensitive, honestly.",
        "Too soonly, sorry.",
      ]),
      chat("p1", ["Wow. He only lost his job yesterday.", null], [
        "Too soon. My fault.",
        "Too sooner. My fault.",
        "Very soon. My fault.",
      ]),
      lc("p1", "Too soon, sorry.", ["See you soon, then.", "Not so loud, please."]),
      // p2 — ignore me
      sit("p2", "Your joke in a meeting falls flat. You want to withdraw it quickly and hand the floor back. What do you say?", [
        "Ignore me, carry on.",
        "I'm so sorry, I really didn't mean to make everyone uncomfortable, so let me explain what I meant.",
        "Ignore to me, carry on.",
      ]),
      chat("p2", ["Right. Shall we get back to the agenda?", null], [
        "Yes, ignore me. Carry on.",
        "Yes, ignoring me. Carry on.",
        "Yes, ignore at me. Carry on.",
      ]),
      spk("p2", "Ignore me, carry on."),
      // p3 — that came out wrong
      sit("p3", "You meant to praise a colleague's bold new design, but the word you used was 'strange'. Your thought was kind; the wording failed. What do you say?", [
        "Sorry, that came out wrong.",
        "Too soon, sorry.",
        "Sorry, that come out wrong.",
      ]),
      lc("p3", "Sorry, that came out wrong.", ["Sorry, I came home late.", "Sorry, that was the wrong one."]),
      chat("p3", ["Did you just call my cooking 'interesting'?", null], [
        "That came out wrong. I meant I loved it.",
        "That came wrong out. I meant I loved it.",
        "That came out wrong. I meaned I loved it.",
      ]),
      // mix
      sit("mix", "You joked about a colleague's haircut and it landed as criticism. You meant it as a compliment, and nothing was premature. Which recovery fits?", [
        "That came out wrong. Ignore me, carry on.",
        "Too soon. Ignore me, carry on.",
        "That came out wrong, but honestly, it does look strange.",
      ]),
      chat("mix", ["Er, his flat only flooded last night.", null], [
        "Too soon. Ignore me.",
        "Too soon. Ignoring me.",
        "Too soonly. Ignore me.",
      ]),
    ],
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
        "Hm. Did you mean that about my haircut as a criticism?", "awkward"),
      sc("Ms. Duflot", "a colleague after your remark misfired", "to get the meeting back",
        "A remark of yours misfired in a meeting.",
        "Withdraw briefly.",
        "Shall we get back to the agenda?", "even"),
      sc("Tarek", "a fellow guest at a dinner", "to keep the evening comfortable",
        "A joke of yours has silenced the table.",
        "Recover without dwelling.",
        "That joke about the flood was a bit early, wasn't it, with their house still drying out?", "smoothing"),
      sc("Dr. Weatherby", "your tutor", "to practise recovery",
        "The seminar is examining conversational repair.",
        "Withdraw briefly and honestly.",
        "Imagine you've just joked about my new haircut, and the room has gone quiet. What do you say?", "probing"),
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
          "'If I may' signals that you are asking leave to speak, which suits a room where you are not the most senior person.",
          "It is a polite formula rather than a full question; if you really want the room's consent, pause after it and let them answer.",
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
    ex: [],
    drills: [
      // p1 — on a lighter note
      sit("p1", "After a long, serious update, you want to ANNOUNCE that you're moving briefly to some good news, so nobody thinks you've missed the seriousness. What do you say?", [
        "On a lighter note, we did find the file.",
        "Anyway, who cares, we found the file!",
        "On a lightly note, we did find the file.",
      ]),
      chat("p1", ["That's the end of the bad news from the audit.", null], [
        "On a lighter note, the coffee machine works again.",
        "On a lighter notes, the coffee machine works again.",
        "At a lighter note, the coffee machine works again.",
      ]),
      lc("p1", "On a lighter note, we did find the file.", ["On the last page, we found a note.", "We'll write a short note about it."]),
      // p2 — if I may
      sit("p2", "You are the most junior person in a tense meeting. You want to ASK permission before saying something lighter. What do you say?", [
        "If I may, one lighter thought.",
        "On a lighter note, here's a joke.",
        "If I might may, one lighter thought.",
      ]),
      chat("p2", ["We still have three items. Any comments?", null], [
        "If I may say one thing first.",
        "If I may to say one thing first.",
        "If I can may say one thing first.",
      ]),
      spk("p2", "If I may, one lighter thought."),
      // p3 — we could all use
      sit("p3", "Everyone in a long meeting has said they are exhausted. You suggest a break as something the whole room needs. What do you say?", [
        "We could all use five minutes.",
        "I need a break, so I'm leaving.",
        "We could all using five minutes.",
      ]),
      lc("p3", "We could all use a coffee.", ["We'll all go home at five.", "Would anyone like some tea?"]),
      chat("p3", ["Two hours and still no decision. I'm exhausted.", null], [
        "We could all use a break.",
        "We could all uses a break.",
        "We could all use of a break.",
      ]),
      // mix
      sit("mix", "In a tense meeting about job cuts, you are not the most senior person. You want to ask before proposing a short break that the whole room needs. What do you say?", [
        "If I may, we could all use five minutes.",
        "On a lighter note, I need five minutes.",
        "We could all use five minutes, and that's final.",
      ]),
      chat("mix", ["We've been here for three hours and everyone looks exhausted. Any comments before the final vote?", null], [
        "If I may, we could all use a short break before the vote.",
        "If I may, we could all used a short break before the vote.",
        "If may I, we could all use a short break before the vote.",
      ]),
    ],
    success: "The learner asks before shifting tone and checks rather than assumes acceptance.",
    quiz: [
      qmcq("What should you do after 'if I may' if you really want the room's consent?", [
        "pause and let the room answer",
        "continue straight away",
        "repeat the phrase louder",
      ], 0),
      qfill("On a ___ note, we did find the file. (light)", ["lighter"]),
      qmcq("What does 'on a lighter note' do that 'if I may' does not?", [
        "announces the shift without asking",
        "asks the room's permission",
        "makes the need collective",
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
        "We've argued about the cuts for an hour, and everyone looks tense. You're the newest here. What do you say?", "probing"),
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
    ex: [],
    drills: [
      // p1 — you'll appreciate this
      sit("p1", "Your friend is a chef, and you have a funny story about a disaster in a restaurant kitchen. You want to tell her the story is aimed at her. How do you start?", [
        "You'll appreciate this, given your job.",
        "And that's not all, given your job.",
        "You'll appreciating this, given your job.",
      ]),
      chat("p1", ["Go on, what happened at the cooking class?", null], [
        "You'll appreciate this one.",
        "You'll appreciated this one.",
        "You'll appreciating this one.",
      ]),
      lc("p1", "You'll appreciate this, given last week.", ["You'll need this next week.", "I enjoyed the party last week."]),
      // p2 — it gets better
      sit("p2", "You've told the first funny detail: you locked yourself out. The next detail is even funnier. You want to promise more. What do you say?", [
        "It gets better.",
        "Anyway, that's the end.",
        "It get better.",
      ]),
      chat("p2", ["Ha! So you were locked out in the rain?", null], [
        "It gets better: the spare key was in my pocket all along.",
        "It gets more better: the spare key was in my pocket all along.",
        "It getting better: the spare key was in my pocket all along.",
      ]),
      spk("p2", "And it gets better than that."),
      // p3 — and that's not all
      sit("p3", "A listener starts laughing at your story, but you still have one more funny detail to come. You want to hold the floor. What do you say?", [
        "And that's not all.",
        "And that's all.",
        "And that not all.",
      ]),
      lc("p3", "And that's not all, the door was locked.", ["And then, of course, the door was open.", "That's not what I said at all."]),
      chat("p3", ["So the spare key was in your pocket all along. Ha!", null], [
        "And that's not all: I'd already called a locksmith.",
        "And that's no all: I'd already called a locksmith.",
        "And that's not at all: I'd already called a locksmith.",
      ]),
      // mix
      sit("mix", "You promised 'It gets better' and then 'And that's not all', but your next detail is weaker than the one before. What happens?", [
        "The listener feels the promise was broken.",
        "The story becomes funnier.",
        "The listener has to interrupt you.",
      ]),
      chat("mix", ["Worst thing that happened to you this month?", null], [
        "Oh, you'll appreciate this: I locked myself out, and it gets better.",
        "Oh, you'll appreciate this: I locked myself out, and it get better.",
        "Oh, you'll appreciated this: I locked myself out, and it gets better.",
      ]),
    ],
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
        "Tell me about a time you got locked out, or something just as silly. How does it go?", "probing"),
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
    ex: [],
    drills: [
      // p1 — it starts years before
      sit("p1", "A friend asks how you met your partner. The real story begins at school, years before you met. You want to signal that it's long and where it begins. What do you say?", [
        "It starts years before we met.",
        "And here's where it turns.",
        "It starts year before we met.",
      ]),
      chat("p1", ["So how did you end up living by the sea?", null], [
        "Well, it starts years before any of that.",
        "Well, it starting years before any of that.",
        "Well, it starts years ago before any of that.",
      ]),
      lc("p1", "It starts years before I was born.", ["I was born years after that.", "It started raining before I left."]),
      // p2 — but first you need
      sit("p2", "In a story about your uncle's shop, the ending makes no sense unless the listener knows he was once a magician. You want to give that background now. What do you say?", [
        "But first you need to know he was a magician.",
        "Anyway, that's not important.",
        "But first you need knowing he was a magician.",
      ]),
      chat("p2", ["So what happened when you got to the shop?", null], [
        "But first you need one detail.",
        "But first you needs one detail.",
        "But first need you one detail.",
      ]),
      spk("p2", "But first you need to know about my uncle."),
      // p3 — and here's where
      sit("p3", "You've finished the background of a long story. Now comes the moment where everything changes direction. What do you say?", [
        "And here's where it goes wrong.",
        "It starts years before that.",
        "And here where it goes wrong.",
      ]),
      lc("p3", "And here's where I should have stopped.", ["So here's what I should have said.", "I stopped there because I was tired."]),
      chat("p3", ["OK, so the shop closed. Then what?", null], [
        "And here's where it turns.",
        "And here's where it turn.",
        "And here where's it turns.",
      ]),
      // mix
      pairs("mix", [
        ["It starts years", "before I was born."],
        ["But first you", "need one detail."],
        ["And here's", "where it goes wrong."],
      ]),
      sit("mix", "You are starting a long story about your career. You want to warn the listener that it goes back a long way, and then give one piece of background they will need. Which opening does both?", [
        "It starts years before the job. But first you need to know about my aunt.",
        "And here's where it turns: I got the job.",
        "So I got the job. That's it, really.",
      ]),
    ],
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
        "We have six hours on this train. How did you end up in the job you do?", "relaxed"),
      sc("Professor Oyibo", "your tutor", "to practise narrative structure",
        "The seminar is examining long-form narrative.",
        "Signal length and mark the pivot.",
        "Tell me the long version of how you came to live where you live. Where does it start?", "probing"),
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
    ex: [],
    drills: [
      // p1 — so I'm standing there
      fc("p1", "So I ___ standing there, and the door opens.", ["am", "is", "being"]),
      sit("p1", "You are telling a story in the past. You want the listener to feel inside ONE key moment. What do you do?", [
        "Switch to the present for that scene only.",
        "Switch to the present for the whole story.",
        "Stay in the past and speak faster.",
      ]),
      lc("p1", "So I'm standing there and the door opens.", ["So I stood there until the door closed.", "I'm waiting by the door, so come in."]),
      // p2 — and he turns round
      fc("p2", "So I'm standing there with the box, and he ___ round.", ["turns", "turning", "turn"]),
      chat("p2", ["So what did he do when you walked in?", null], [
        "So I walk in, and he turns round and says nothing.",
        "So I walk in, and he turn round and says nothing.",
        "So I walk in, and he turns round and say nothing.",
      ]),
      spk("p2", "And he turns round and says nothing."),
      // p3 — next thing I know
      fc("p3", "He turns round, and next thing I ___, we're outside.", ["know", "knowing", "known"]),
      sit("p3", "You are telling a story in the narrative present, and you want to skip the boring hour in the waiting room. What do you say?", [
        "Next thing I know, we're outside.",
        "Next thing I knowing, we're outside.",
        "Next thing I know, we was outside.",
      ]),
      lc("p3", "Next thing I know, we're outside.", ["Next time, I'll know the way out.", "I know the next thing we need."]),
      // mix
      sit("mix", "Which version keeps the key scene consistent in the narrative present?", [
        "So I'm standing there, he turns round, and nobody speaks.",
        "So I'm standing there, he turned round, and nobody speaks.",
        "So I'm standing there, he turning round, and nobody speaks.",
      ]),
      chat("mix", ["And then? What happened after he saw you?", null], [
        "He turns round, and next thing I know, we're outside.",
        "He turns round, and next thing I knowing, we're outside.",
        "He turn round, and next thing I know, we're outside.",
      ]),
    ],
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
        "Tell me about a moment when something really surprised you. Can you put me right there in it?", "probing"),
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
    ex: [],
    drills: [
      // p1 — but I'm getting ahead
      sit("p1", "You are telling a story and accidentally start describing the surprise ending too early. You want to stop and save it. What do you say?", [
        "But I'm getting ahead of myself.",
        "Anyway, that's how it ended.",
        "But I'm get ahead of myself.",
      ]),
      chat("p1", ["Wait, she knew all along?", null], [
        "Yes, but I'm getting ahead of myself.",
        "Yes, but I'm getting ahead myself.",
        "Yes, but I'm getting a head of myself.",
      ]),
      lc("p1", "But I'm getting ahead of myself.", ["I'm going ahead without you.", "But I'll get there by myself."]),
      // p2 — anyway where was I
      sit("p2", "You've been talking about your neighbour's dog for a minute and have lost the thread of your actual story. You want to admit it once, lightly. What do you say?", [
        "Anyway, where was I?",
        "Anyway, where were you?",
        "Anyway, where am I was?",
      ]),
      chat("p2", ["So that's why the dog only eats carrots?", null], [
        "Exactly. Anyway, where was I?",
        "Exactly. Anyway, where I was?",
        "Exactly. Anyway, where were I?",
      ]),
      spk("p2", "Anyway, where was I?"),
      // p3 — back to the point
      sit("p3", "After a short, simple detour about your neighbour, you want to go straight back to your story about the letter. What do you say?", [
        "Back to the point: the letter.",
        "But I'm getting ahead of myself.",
        "Back the point: the letter.",
      ]),
      lc("p3", "Back to the point: the letter arrived on Tuesday.", ["Go back to the post office on Tuesday.", "The letter came back on Tuesday."]),
      chat("p3", ["Sorry, you were telling us about the letter?", null], [
        "Right, back to the point.",
        "Right, back to the points.",
        "Right, back at the point.",
      ]),
      // mix
      pairs("mix", [
        ["But I'm getting ahead", "of myself."],
        ["Anyway, where", "was I?"],
        ["Back to", "the point."],
      ]),
      sit("mix", "In one story you mention the ending too early, and then lose your place. Which pair of lines first catches the early detail and then admits losing the thread?", [
        "But I'm getting ahead of myself. Anyway, where was I?",
        "Anyway, where was I? Anyway, where was I?",
        "That's the ending, so the story's over.",
      ]),
    ],
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
        "We were talking about your missed train, and somehow we got onto your neighbour's dog. Where were you?", "probing"),
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
    ex: [],
    drills: [
      // p1 — I grew up
      sit("p1", "A new friend asks about your background. You want to open with a setting, not a date. What do you say?", [
        "I grew up between two towns.",
        "I was born on the third of May.",
        "I growed up between two towns.",
      ]),
      chat("p1", ["Where are you from, originally?", null], [
        "I grew up with my grandparents, by the sea.",
        "I grown up with my grandparents, by the sea.",
        "I grew with up my grandparents, by the sea.",
      ]),
      lc("p1", "I grew up with my grandparents.", ["My grandparents live near here.", "I gave up my job last year."]),
      // p2 — that shaped everything
      sit("p2", "In your life story, you want to name the ONE period that changed everything after it. What do you say?", [
        "That one year shaped everything.",
        "That shaped everything, and so did school, and my first job, and moving.",
        "That one year shape everything.",
      ]),
      chat("p2", ["And then your family moved again?", null], [
        "Yes, and that shaped everything after it.",
        "Yes, and that shaping everything after it.",
        "Yes, and that shaped everythings after it.",
      ]),
      spk("p2", "That shaped everything after it."),
      // p3 — looking at it now
      sit("p3", "As a teenager you hated moving so often. Now you think it taught you something. You want to show the difference between then and now. What do you say?", [
        "Looking at it now, it taught me to adapt.",
        "Looking at it then, it taught me to adapt.",
        "Looked at it now, it taught me to adapt.",
      ]),
      lc("p3", "Looking at it now, it was the right call.", ["Look at the time, I need to go.", "We were looking at it on the phone."]),
      chat("p3", ["Were you angry about leaving, back then?", null], [
        "Very. Looking at it now, I understand why we left.",
        "Very. Looking it at now, I understand why we left.",
        "Very. Looking at it now, I understanding why we left.",
      ]),
      // mix
      chat("mix", ["Take me back to the beginning. How did this start?", null], [
        "I grew up in a small town, and one year there shaped everything.",
        "I grew up in a small town, and one year there shape everything.",
        "I grow up in a small town, and one year there shaped everything.",
      ]),
      sit("mix", "You want to end your life story by naming the turning point and then how you see it today. Which works?", [
        "That year shaped everything. Looking at it now, I'm grateful.",
        "That year shaped everything. Looking at it then, I'm grateful.",
        "Then nothing much happened. The end.",
      ]),
    ],
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
        "Tell me where you grew up. What from those years still matters to you?", "probing"),
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
    ex: [],
    drills: [
      // p1 — as she tells it
      sit("p1", "A colleague told you her version of a dispute. You want to pass it on as HER version, without calling anyone a liar. What do you say?", [
        "As she tells it, nobody warned them.",
        "Nobody warned them, and that's a fact.",
        "As she tell it, nobody warned them.",
      ]),
      chat("p1", ["So what does your colleague say happened?", null], [
        "As she tells it, the brief changed twice.",
        "As she telling it, the brief changed twice.",
        "As she tells, the brief changed twice.",
      ]),
      lc("p1", "As she tells it, it took a year.", ["She told me it was a year ago.", "As far as I know, it took a week."]),
      // p2 — apparently what happened
      sit("p2", "A neighbour told you the shop closed because of a mix-up, but nobody has confirmed it. You want to mark it as second-hand. What do you say?", [
        "Apparently what happened was a mix-up.",
        "What happened was definitely a mix-up.",
        "Apparent what happened was a mix-up.",
      ]),
      chat("p2", ["Why was the concert cancelled?", null], [
        "Apparently what happened is still disputed.",
        "Apparently what happen is still disputed.",
        "Apparently what happened are still disputed.",
      ]),
      spk("p2", "Apparently what happened was a mix-up."),
      // p3 — I've only heard
      sit("p3", "You heard about an argument from only one of the two people involved. A friend asks who was at fault. What do you say?", [
        "I've only heard one side of it.",
        "It was clearly his fault.",
        "I've only hear one side of it.",
      ]),
      lc("p3", "I've only heard the short version.", ["I've only got a short time.", "I never heard the end of it."]),
      chat("p3", ["So who started it?", null], [
        "Hard to say. I've only heard one side of it.",
        "Hard to say. I've only heard one sides of it.",
        "Hard to say. I've only hearing one side of it.",
      ]),
      // mix
      sit("mix", "You are telling a friend about a dispute that you heard about only from one colleague. You want to attribute the version to her and state the limit of what you know. Which works?", [
        "As she tells it, he lied. But I've only heard her side.",
        "He lied, and that's that.",
        "Apparently he lied, so he's clearly guilty.",
      ]),
      pairs("mix", [
        ["As she tells", "it, nobody warned them."],
        ["Apparently what", "happened was a mix-up."],
        ["I've only", "heard one side of it."],
      ]),
    ],
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
        "Tell me a story you heard from a friend but didn't see yourself. What happened?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check attribution",
        "The examiner asks about something you heard.",
        "Retell it with attribution.",
        "What's a story you've only heard second-hand?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — and that's exactly why
      sit("p1", "You've told a story about a typo that cost your team four thousand pounds. Now you want to use it as evidence for checking work twice. What do you say?", [
        "And that's exactly why we check twice.",
        "Anyway, it was a funny week.",
        "And that's exact why we check twice.",
      ]),
      chat("p1", ["So the typo went straight to the client?", null], [
        "It did. And that's exactly why I want a second reviewer.",
        "It did. And that's exactly the why I want a second reviewer.",
        "It did. And that exactly why I want a second reviewer.",
      ]),
      lc("p1", "And that's exactly why I asked.", ["And that's why I'm late.", "I asked the same thing yesterday."]),
      // p2 — which brings me back
      sit("p2", "In a meeting about the budget, you told a short story about last year's event. Now you want to return to the budget. What do you say?", [
        "Which brings me back to the budget.",
        "So, anyway, nice story, right?",
        "Which bring me back to the budget.",
      ]),
      chat("p2", ["Ha, so the caterer never showed up?", null], [
        "Never. Which brings me back to my point.",
        "Never. Which bringing me back to my point.",
        "Never. Which brings me back on my point.",
      ]),
      spk("p2", "Which brings me back to the budget."),
      // p3 — that's what I mean
      sit("p3", "Earlier you called a contractor 'careless'. Then you told a story about him leaving the office unlocked overnight. Now you link the story to that word. What do you say?", [
        "That's what I mean by careless.",
        "And that's why we pay him so well.",
        "That's what I mean careless by.",
      ]),
      lc("p3", "That's what I mean by too late.", ["That's what I meant to say later.", "It's too late to change it now."]),
      chat("p3", ["Wait, you sent the report after the meeting?", null], [
        "Yes. That's what I mean by too late.",
        "Yes. That's what I means by too late.",
        "Yes. That's what mean I by too late.",
      ]),
      // mix
      chat("mix", ["So he left the office unlocked all weekend. And?", null], [
        "That's what I mean by careless, and that's exactly why we need checks.",
        "That's what I mean by careless, and that's exactly why we needs checks.",
        "That what I mean by careless, and that's exactly why we need checks.",
      ]),
      sit("mix", "After a story, you want to return to your argument and then turn the story into evidence for it. Which pair of lines does that?", [
        "Which brings me back to my point. And that's exactly why we need checks.",
        "Which brings me back to my point. Anyway, nice weather today.",
        "And that's exactly why. Which bring me back to my point.",
      ]),
    ],
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
        "You told me about the typo that cost four thousand pounds. What does that story show?", "evaluative"),
      sc("Aurore", "a fellow traveller in a discussion", "to be persuaded",
        "A discussion needs a concrete example.",
        "Argue with a story.",
        "You mentioned the time your ticket app crashed at the border. What was the point of that story?", "sceptical"),
      sc("Professor Oyibo", "your tutor", "to practise narrative argument",
        "The seminar is examining narrative as evidence.",
        "Connect the story to the claim.",
        "You've just told us about the typo that cost four thousand pounds. What does it prove, and what doesn't it?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check argumentative narrative",
        "The examiner asks for a case in point.",
        "Argue with a story.",
        "You told me about the friend who got a job because she spoke Spanish. What's the point of that story?", "neutral"),
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
    ex: [],
    drills: [
      // p1 — bear with me
      sit("p1", "You are about to give background that seems off-topic, but it connects soon. You want to ask your listeners for patience. What do you say?", [
        "Bear with me, this connects.",
        "Sorry, this is boring, I'll stop.",
        "Bear me with, this connects.",
      ]),
      chat("p1", ["Sorry, why are we talking about suppliers?", null], [
        "Bear with me for one minute.",
        "Bear for me with one minute.",
        "Bearing with me for one minute.",
      ]),
      lc("p1", "Bear with me for one minute.", ["Come with me for a minute.", "I'll be there in one minute."]),
      // p2 — this is the part
      sit("p2", "In a long explanation, you reach the single most important point. You want your listeners to focus here. What do you say?", [
        "This is the part that matters.",
        "This part doesn't matter much.",
        "This is the parts that matters.",
      ]),
      chat("p2", ["OK, so the schedule changed. And?", null], [
        "And this is the part that matters.",
        "And this is the part that matter.",
        "And this the part is that matters.",
      ]),
      spk("p2", "This is the part that matters."),
      // p3 — you'll see why
      sit("p3", "You mention a detail that seems irrelevant now but will matter in a moment. You want to justify mentioning it. What do you say?", [
        "You'll see why in a moment.",
        "This is irrelevant, ignore it.",
        "You'll seeing why in a moment.",
      ]),
      lc("p3", "You'll see why that matters.", ["Do you know what that means?", "I'll show you the way there."]),
      chat("p3", ["Why are you telling us about March?", null], [
        "You'll see why in a moment.",
        "You'll see why on a moment.",
        "You'll sees why in a moment.",
      ]),
      // mix
      pairs("mix", [
        ["Bear", "with me, this connects."],
        ["This is the part", "that matters."],
        ["You'll see", "why in a moment."],
      ]),
      sit("mix", "You are explaining an unpopular decision. You want to ask for patience first and then mark the one key point. Which works?", [
        "Bear with me. This is the part that matters: we have one supplier.",
        "This is the part that matters. This is the part that matters.",
        "Bear with me. Anyway, never mind.",
      ]),
    ],
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
        "Nobody here agrees with your decision to change suppliers. Can you explain it properly?", "unconvinced"),
      sc("Aurore", "a fellow traveller listening to a long account", "to follow a long account",
        "A long account needs uninterrupted time.",
        "Ask for the time and use it.",
        "This sounds complicated. Can you start from the beginning?", "willing"),
      sc("Professor Oyibo", "your tutor", "to practise holding the floor",
        "The seminar is examining sustained turns.",
        "Ask for time and direct attention.",
        "Explain to the group a decision you made that others questioned. Where do you begin?", "probing"),
      sc("Mr. Castellani", "the examiner", "to check sustained speech",
        "The examiner invites a long explanation.",
        "Hold the turn and mark the key part.",
        "Can you explain a decision of yours that others questioned?", "neutral"),
    ],
  },
];
