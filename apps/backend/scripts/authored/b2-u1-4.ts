/** B2 · Ünite 1-4 — Regret · What Might Have Been · Reporting · Causative (28 ders).
 *
 *  B2'nin açılışı geçmişe dönüp ONU DEĞİŞTİRMEK üzerine: üçüncü koşul iki derse
 *  bölündü (koşul yarısı ve sonuç yarısı ayrı ayrı), çünkü öğrenci bu seviyede
 *  `if I had known` ile `I would have` yarımlarını birbirine karıştırıyor. Karışık
 *  koşul (geçmiş sebep → şimdiki sonuç) ayrı ders, `should have` ayrı ders.
 *
 *  Ünite 2 aynı geçmişi olasılık ve tercih kipleriyle yeniden açıyor; `needn't
 *  have` ile `didn't need to` farkına kendi dersi verildi — ikisi de gereksizlik
 *  anlatır, fark eylemin YAPILIP yapılmadığındadır ve bu seviyede en sık
 *  karışan çifttir.
 *
 *  Ünite 3 haber dilini kuruyor: kişisiz aktarım, kişili aktarım, `-ing` ve `to`
 *  alan aktarma fiilleri, kaynak gösterme ve söylentiyi işaretleme.
 *
 *  Ünite 4 ettirgen yapı — kendin yapmadığın işi anlatmak. Günlük hayatta en çok
 *  ihtiyaç duyulan B2 yapısı: tamirci çağırmak, iş yaptırmak, kötü yapılan işi
 *  şikâyet etmek.
 *
 *  Gramer derslerinde 4 alıştırma, phrases/practice'te 3.
 */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const B2_U1_4: Authored[] = [
  // --- Ünite 1 · Looking Back with Regret ------------------------------------
  {
    id: "b2-if-i-had-known",
    topic: "setting up a past situation that did not happen",
    objectives: [
      "Form the if-half of a third conditional with the past perfect.",
      "Use the inverted form 'had I known' in more formal speech.",
    ],
    goal: "Explain what would have been different if you had known something earlier.",
    target: "third conditional: the if-clause",
    correction: "Say the if-half again with the past perfect and let the learner finish the sentence.",
    summary: "You learned to build the if-half of a third conditional with the past perfect.",
    minutes: 8,
    points: [
      {
        form: "if I had known",
        claims: [
          "The if-half uses the past perfect: had plus the past participle.",
          "It describes a past situation that was NOT true, so the real past was the opposite.",
        ],
        ex: ["If I had known, I would have said something.", "If we had left earlier, we wouldn't have missed it."],
      },
      {
        form: "had I known",
        claims: [
          "You can drop 'if' and put 'had' before the subject: had I known.",
          "This inverted form is formal; it is more common in writing than in everyday speech.",
        ],
        ex: ["Had I known, I would have acted differently.", "Had we booked earlier, it would have been cheaper."],
      },
      {
        form: "if only I'd",
        claims: [
          "'If only' plus the past perfect expresses regret on its own, with no result half.",
          "'I'd' here is short for 'I had', not 'I would'.",
        ],
        ex: ["If only I'd asked for help.", "If only we'd taken the earlier train."],
      },
    ],
    ex: [],
    drills: [
      // p1 — if I had known
      fc("p1", "If I ___ known about the meeting, I would have come.", ["had", "have", "would"]),
      arr("p1", "If I had known, I would have called you.", ["will"]),
      err("p1", "If I had know about it, I would have told you.", "know", "known"),
      // p2 — had I known (devrik)
      lc("p2", "Had we booked earlier, it would have been cheaper.", [
        "We had booked early, so it was cheaper.",
        "Have you booked yet? It might be cheaper.",
      ]),
      fc("p2", "___ I known, I would have acted differently.", ["Had", "If", "Would"]),
      arr("p2", "Had I known, I would have acted differently.", ["knew"]),
      // p3 — if only I'd
      chat("p3", ["You look upset. What's wrong?", null], [
        "I missed the last train. If only I'd left earlier.",
        "I missed the last train. If only I have left earlier.",
        "I missed the last train. If only I had leave earlier.",
      ]),
      fc("p3", "If only we ___ taken the earlier train.", ["had", "have", "would"]),
      spk("p3", "If only I'd asked for help."),
      // karışık
      sit("mix", "You didn't know the shop closed early, so you arrived too late. You say what you would have done, and then add a short regret. What do you say?", [
        "If I had known, I would have gone earlier. If only I'd checked!",
        "If I had known, I would have gone earlier. If only I have checked!",
        "If I would have known, I would have gone earlier. If only I'd checked!",
      ]),
      lc("mix", "If only I'd checked. Had I known, I would have stayed.", [
        "If only I could check. I know, so I will stay.",
        "I checked it. I knew, so I stayed at home.",
      ]),
    ],
    success: "The learner builds the if-half with the past perfect correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "If I had asked, someone would have helped.",
        "If I would have asked, someone would have helped.",
        "If I have asked, someone would have helped.",
      ], 0),
      qfill("If only we ___ booked earlier, the tickets would have been cheaper. (have)", ["had"]),
      qmcq("Which sentence uses the formal inverted form?", [
        "Had we known, we would have waited.",
        "If we had known, we would have waited.",
        "We had known, so we waited.",
      ], 0),
    ],
    scenes: [
      sc("Delphine", "a friend who found out before you did", "to work out how the misunderstanding happened",
        "You both missed an event because nobody passed on the message.",
        "Explain what you would have done differently.",
        "Nobody told you about the party, so you missed it. What would you have done if you had known?", "apologetic"),
      sc("Rasheed", "your manager after a missed deadline", "to understand what went wrong without blaming anyone",
        "A deadline slipped because information did not reach the right person.",
        "Explain what you would have done with better information.",
        "Nobody told you the plan had changed. In a formal report, how would you describe what you would have done differently?", "measured"),
      sc("Astrid", "a fellow traveller who took a different route", "to compare how your journeys went",
        "You took a slow route while she took a fast one.",
        "Say what you would have done with better information.",
        "I took the fast train and you took the slow bus. What would you have done if you had known about the train?", "sympathetic"),
      sc("Dr. Ferreira", "your teacher", "to practise the if-half of the third conditional",
        "The class is discussing decisions made without full information.",
        "Describe a past situation you would change.",
        "Think of something you found out too late. What do you wish you had done?", "encouraging"),
      sc("Ms. Whitlock", "the examiner", "to check the third conditional if-clause",
        "The examiner asks about a past misunderstanding.",
        "Use the past perfect after 'if' correctly.",
        "Please describe a time you were missing important information. What would you have done if you had known?", "neutral"),
    ],
  },

  {
    id: "b2-i-would-have-called",
    topic: "the result half of an unreal past sentence",
    objectives: [
      "Form the result half with would have plus the past participle.",
      "Use the contracted forms that are normal in speech.",
    ],
    goal: "Say what the result would have been if the past had been different.",
    target: "third conditional: the result clause",
    correction: "Repeat the result half with 'would have' and the past participle, then let the learner rebuild it.",
    summary: "You learned to complete an unreal past sentence with would have plus the past participle.",
    minutes: 8,
    points: [
      {
        form: "I would have",
        claims: [
          "The result half uses would have plus the past participle.",
          "In this pattern the if-half uses had plus the past participle, not would.",
        ],
        ex: ["I would have called you straight away.", "She would have understood."],
      },
      {
        form: "we'd have",
        claims: [
          "In speech 'would have' is usually contracted to 'would've' or 'we'd have'.",
          "It sounds like 'would of', but that spelling is never correct.",
        ],
        ex: ["We'd have come if you had asked.", "They'd have told us."],
      },
      {
        form: "it would have been",
        claims: [
          "With 'be' the result half becomes 'would have been'.",
          "'Could have' and 'might have' replace 'would have' when the result is less certain.",
        ],
        ex: ["It would have been much easier.", "It might have been worse."],
      },
    ],
    ex: [],
    drills: [
      // p1 — would have + V3
      fc("p1", "If you had asked, I ___ have helped you.", ["would", "will", "had"]),
      arr("p1", "We would have missed the train.", ["miss"]),
      err("p1", "If I had known, I would have call you.", "call", "called"),
      // p2 — we'd have / would've
      sit("p2", "Your friends went to the beach without inviting you and your sister. You tell them you both would have joined. What do you say?", [
        "We'd have come if you had asked.",
        "We'd have came if you had asked.",
        "We'd had come if you had asked.",
      ]),
      fc("p2", "They'd ___ told us if they had known.", ["have", "of", "had"]),
      err("p2", "We would of come if you had asked.", "of", "have"),
      // p3 — would have been / might have
      fc("p3", "It would have ___ much easier with a map.", ["been", "be", "being"]),
      lc("p3", "It might have been worse.", [
        "It would have been better.",
        "It may get worse later.",
      ]),
      spk("p3", "It would have been much easier."),
      // karışık
      chat("mix", ["I took the bus in the end. It took two hours.", null], [
        "If you'd called me, I'd have driven you. It would have been quicker.",
        "If you'd called me, I'd have drove you. It would have been quicker.",
        "If you'd called me, I'd driven you. It would have been quicker.",
      ]),
      la("mix", "We'd have helped, and it would have been easier.", ["will"]),
    ],
    success: "The learner completes the result half with would have plus a past participle at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "They would have told us if they had known.",
        "They would have tell us if they had known.",
        "They would of told us if they had known.",
      ], 0),
      qfill("It ___ have been cheaper to book online.", ["would"]),
      qmcq("Which sentence sounds less certain?", [
        "It might have been worse.",
        "It would have been worse.",
        "It was worse.",
      ], 0),
    ],
    scenes: [
      sc("Corina", "a friend who would have helped", "to point out you should have asked",
        "You struggled alone with something a friend could have helped with.",
        "Say what would have happened if you had asked.",
        "You moved house all on your own last week. If I had been free, how would it have been different?", "exasperated"),
      sc("Malik", "a colleague reviewing a difficult week", "to learn from how the work was shared",
        "The team is looking back at a week that went badly.",
        "Describe the result if the work had been shared.",
        "Last week was hard for the whole team. What would have made it easier?", "constructive"),
      sc("Freya", "a guide you did not book", "to explain what the tour would have covered",
        "You explored alone and missed most of the sights.",
        "Say what would have been different with a guide.",
        "You walked round the city without a guide. If you had booked a tour, what would you have seen?", "curious"),
      sc("Mr. Anand", "your teacher", "to practise the result half",
        "The class is completing unreal past sentences.",
        "Complete the result half correctly.",
        "Imagine you had studied a different subject. What would you have done after school?", "encouraging"),
      sc("Mrs. Boateng", "the examiner", "to check the result clause",
        "The examiner asks about an unreal past outcome.",
        "Build the result half accurately.",
        "Think of a choice you made last year. What would have happened if you had chosen differently?", "neutral"),
    ],
  },

  {
    id: "b2-i-should-have-listened",
    topic: "regret and criticism about the past",
    objectives: [
      "Use should have to express regret about your own past actions.",
      "Use shouldn't have to criticise a past action gently.",
    ],
    goal: "Admit a past mistake and say what you should have done instead.",
    target: "should have and ought to have",
    correction: "Model the sentence with 'should have' plus the past participle and invite the learner to repeat it.",
    summary: "You learned to express regret and gentle criticism with should have and ought to have.",
    minutes: 8,
    points: [
      {
        form: "I should have",
        claims: [
          "'Should have' plus the past participle says the right thing was not done.",
          "It carries regret when you use it about yourself.",
        ],
        ex: ["I should have listened to you.", "I should have checked the times."],
      },
      {
        form: "you shouldn't have",
        claims: [
          "'Shouldn't have' criticises a past action, so it lands more softly than a direct accusation.",
          "In another context the same words thank someone for a gift.",
        ],
        ex: ["You shouldn't have sent that email so quickly.", "We shouldn't have left it so late."],
      },
      {
        form: "ought to have",
        claims: [
          "'Ought to have' means the same as 'should have' but sounds a little more formal.",
          "Unlike 'should', it keeps 'to' before 'have'.",
        ],
        ex: ["We ought to have asked first.", "They ought to have warned us."],
      },
    ],
    ex: [],
    drills: [
      // p1 — should have
      fc("p1", "I ___ have checked the times before we left.", ["should", "ought", "had"]),
      sit("p1", "You missed your flight because you did not check the time. You regret it. What do you say?", [
        "I should have checked the time.",
        "I should checked the time.",
        "I should have check the time.",
      ]),
      arr("p1", "I should have listened to you.", ["listen"]),
      // p2 — you shouldn't have
      chat("p2", ["I sent the angry email to the whole team.", null], [
        "You shouldn't have sent it so quickly.",
        "You shouldn't have send it so quickly.",
        "You shouldn't sent it so quickly.",
      ]),
      sit("p2", "A friend gives you an expensive present for no reason. You thank them warmly. What do you say?", [
        "Oh, you shouldn't have!",
        "Oh, you shouldn't have to!",
        "Oh, you should haven't!",
      ]),
      err("p2", "We shouldn't have leave it so late.", "leave", "left"),
      // p3 — ought to have
      fc("p3", "We ought ___ have asked first.", ["to", "for", "of"]),
      lc("p3", "They ought to have warned us.", [
        "They wanted to warn us.",
        "They have warned us twice.",
      ]),
      spk("p3", "We ought to have asked first."),
      // karışık
      sit("mix", "Your colleague booked the wrong hotel in a hurry, and you forgot to check the booking. You say what each of you did wrong. What do you say?", [
        "You shouldn't have rushed, and I ought to have checked.",
        "You shouldn't have rushed, and I ought have checked.",
        "You shouldn't rushed, and I ought to have checked.",
      ]),
      la("mix", "I should have listened, and you shouldn't have shouted.", ["shout"]),
    ],
    success: "The learner uses should have and shouldn't have correctly to talk about a past decision.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I should have checked the times.",
        "I should have checking the times.",
        "I should checked the times.",
      ], 0),
      qfill("We ___ have left it so late. (should not)", ["shouldn't"]),
      qmcq("Which sentence is a gentle criticism?", [
        "You shouldn't have replied so fast.",
        "You must not reply fast.",
        "Do not reply fast.",
      ], 0),
    ],
    scenes: [
      sc("Ilse", "a friend who warned you", "to hear you admit she was right",
        "A friend advised against something and you went ahead anyway.",
        "Admit the mistake and say what you should have done.",
        "I warned you about that trip, but you went anyway. What should you have done?", "gentle"),
      sc("Tobias", "a colleague after a rushed decision", "to work out what went wrong in the process",
        "A decision was made too quickly and caused problems.",
        "Say what should have been done differently.",
        "Our new colleague sent the client the wrong price without checking. What do you think of what she did?", "even"),
      sc("Marisol", "a fellow traveller who lost her documents", "to talk through what she could have done",
        "Someone you met is upset about a mistake while travelling.",
        "Advise gently using should have.",
        "I left my passport on the train this morning. Be honest, what did I do wrong?", "regretful"),
      sc("Mr. Novak", "your teacher", "to practise regret forms",
        "The class is talking about decisions they regret.",
        "Express regret with should have.",
        "Think about this year. What should you have done differently?", "encouraging"),
      sc("Ms. Iqbal", "the examiner", "to check regret forms",
        "The examiner asks about a past decision.",
        "Express regret and criticism correctly.",
        "Please speak formally. Think of a decision you regret: what was the right thing to do at the time?", "neutral"),
    ],
  },

  {
    id: "b2-if-i-had-studied-id-be-rich-now",
    topic: "a past cause with a present result",
    objectives: [
      "Combine a past if-clause with a present result.",
      "Choose between a mixed and a standard third conditional.",
    ],
    goal: "Explain how a past decision still affects your life today.",
    target: "mixed conditional: past condition, present result",
    correction: "Contrast the two halves aloud and let the learner rebuild the sentence.",
    summary: "You learned to join a past condition to a present result in one sentence.",
    minutes: 8,
    points: [
      {
        form: "if I'd studied",
        claims: [
          "The if-half stays in the past perfect, exactly as in the third conditional.",
          "'I'd' here is short for 'I had'.",
        ],
        ex: ["If I'd studied medicine, my life would look different.", "If we'd bought that flat, we'd still be there."],
      },
      {
        form: "I'd be",
        claims: [
          "The result half uses 'would' plus the base verb, with no 'have'.",
          "That missing 'have' is what moves the result into the present.",
        ],
        ex: ["I'd be fluent by now.", "She'd be much happier today."],
      },
      {
        form: "we would be now",
        claims: [
          "Words like 'now' and 'today' make the present result explicit.",
          "Use the standard third conditional instead when the result also belongs to the past.",
        ],
        ex: ["We would be living abroad now.", "They would be finished by now.", "I often wonder where we would be now."],
      },
    ],
    ex: [],
    drills: [
      // p1 — if I'd studied (geçmiş neden)
      fc("p1", "If I ___ studied medicine, my life would look very different.", ["had", "would", "have"]),
      err("p1", "If we'd buy that flat, we'd still be there.", "buy", "bought"),
      sit("p1", "Years ago you decided not to learn to drive. Now you depend on buses. What do you say?", [
        "If I'd learned to drive, I'd have a car now.",
        "If I'd learn to drive, I'd have a car now.",
        "If I learned to drive, I'd had a car now.",
      ]),
      // p2 — I'd be (şimdiki sonuç)
      fc("p2", "If I'd stayed in that job, I ___ be a manager now.", ["would", "will", "had"]),
      chat("p2", ["You never moved to the coast in the end, did you?", null], [
        "No. If I had moved, I'd be much happier now.",
        "No. If I had moved, I'd been much happier now.",
        "No. If I had moved, I'll be much happier now.",
      ]),
      lc("p2", "She'd be much happier today.", [
        "She is much happier today.",
        "She'd have been much happier then.",
      ]),
      // p3 — now / today
      fc("p3", "If we'd bought that house, we would be living there ___.", ["now", "yesterday", "last year"]),
      sit("p3", "Last year you didn't take a job abroad. Today you think about the result. What do you say?", [
        "If I'd taken that job, I would be living abroad now.",
        "If I'd taken that job, I would living abroad now.",
        "If I'd taken that job, I will be living abroad now.",
      ]),
      spk("p3", "We would be living abroad now."),
      // karışık
      sit("mix", "Last year you didn't save any money. Today your friends are on holiday and you are at home. What do you say?", [
        "If I had saved money, I'd be on holiday now.",
        "If I had saved money, I'd have be on holiday now.",
        "If I saved money, I'd been on holiday now.",
      ]),
      la("mix", "If I'd studied harder, I'd be a doctor now.", ["been"]),
    ],
    success: "The learner joins a past condition to a present result correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "If she had left earlier, she would be here now.",
        "If she had left earlier, she would have been here now.",
        "If she left earlier, she would be here now.",
      ], 0),
      qfill("If I had saved money, I ___ own a car today.", ["would"]),
      qmcq("Which result is in the present?", [
        "I'd be fluent by now.",
        "I would have been fluent.",
        "I was fluent.",
      ], 0),
    ],
    scenes: [
      sc("Anouk", "an old schoolfriend", "to compare how differently your lives turned out",
        "Two old friends meet and compare the paths they took.",
        "Describe how a past choice shapes your life now.",
        "We went to the same school, but you chose a different path. Where would you be now if you'd studied something else?", "reflective"),
      sc("Kenji", "a colleague considering a career change", "to hear whether changing direction is worth it",
        "A colleague is deciding whether to retrain.",
        "Describe how an earlier choice affects you today.",
        "You changed careers once. Where would you be today if you hadn't?", "thoughtful"),
      sc("Larissa", "someone you meet while travelling", "to swap stories about roads not taken",
        "Two travellers talk about the lives they might have had.",
        "Describe your present life against a different past.",
        "You left your home town years ago. How would your life be different now if you had stayed?", "open"),
      sc("Mrs. Petersen", "your teacher", "to practise mixed conditionals",
        "The class is linking past choices to present situations.",
        "Build a mixed conditional.",
        "Think of a choice from ten years ago. How would today be different if you had chosen otherwise?", "encouraging"),
      sc("Mr. Larsen", "the examiner", "to check the mixed conditional",
        "The examiner asks how a past decision still matters.",
        "Link past condition and present result accurately.",
        "Please describe an earlier decision. How would your life be now if you had decided differently?", "neutral"),
    ],
  },

  {
    id: "b2-looking-back",
    topic: "expressions for hindsight",
    objectives: [
      "Introduce a reflection with looking back or with hindsight.",
      "Contrast what you knew then with what you know now.",
    ],
    goal: "Reflect on a past period and say how your view of it has changed.",
    target: "hindsight expressions",
    correction: "Model the reflective opener and let the learner continue the thought.",
    summary: "You learned to open a reflection with looking back and with hindsight.",
    minutes: 7,
    points: [
      {
        form: "looking back",
        claims: [
          "'Looking back' opens a sentence and signals that a judgement is coming.",
          "It is usually followed by a comma and the whole reflection.",
        ],
        ex: ["Looking back, it was the right decision.", "Looking back, I was far too cautious."],
      },
      {
        form: "with hindsight",
        claims: [
          "'With hindsight' means knowing now what you did not know then.",
          "It sounds slightly more formal than 'looking back'.",
        ],
        ex: ["With hindsight, we moved too fast.", "With hindsight, the warning signs were there."],
      },
      {
        form: "at the time I",
        claims: [
          "'At the time' names what you believed then, before the reflection.",
          "Pairing it with 'looking back' shows the contrast between then and now.",
        ],
        ex: ["At the time I thought it was hopeless.", "At the time it felt like a disaster."],
      },
    ],
    ex: [],
    drills: [
      // p1 — looking back
      fc("p1", "___ back, it was the right decision.", ["Looking", "Looked", "Look"]),
      arr("p1", "Looking back, I made a mistake.", ["look"]),
      lc("p1", "Looking back, I was far too cautious.", [
        "Looking ahead, I'll be more careful.",
        "At first I was very curious.",
      ]),
      // p2 — with hindsight
      fc("p2", "___ hindsight, we moved too fast.", ["With", "By", "At"]),
      sit("p2", "Your team launched a product too early. Now you know it needed more testing. You say this in a meeting. What do you say?", [
        "With hindsight, we launched it too early.",
        "With hindsight, we will launch it too early.",
        "With a hindsight, we launched it too early.",
      ]),
      err("p2", "With hindsights, the warning signs were there.", "hindsights", "hindsight"),
      // p3 — at the time I
      chat("p3", ["Were you scared when the company closed?", null], [
        "At the time I was terrified.",
        "On the time I was terrified.",
        "At the time I am terrified.",
      ]),
      fc("p3", "At the ___ I thought it was the end of the world.", ["time", "times", "timing"]),
      spk("p3", "At the time I thought it was hopeless."),
      // karışık
      sit("mix", "Years ago you turned down a job and felt relieved. Now you think it was a mistake. You describe both feelings. What do you say?", [
        "At the time I felt relieved, but looking back, it was a mistake.",
        "At the time I feel relieved, but looking back, it was a mistake.",
        "At the time I felt relieved, but look back, it was a mistake.",
      ]),
      la("mix", "With hindsight, I was wrong at the time.", ["look"]),
    ],
    success: "The learner contrasts a past view with a present judgement using at least two hindsight expressions.",
    quiz: [
      qmcq("Which phrase opens a reflection?", ["Looking back,", "Right now,", "From now on,"], 0),
      qfill("___ hindsight, we moved far too quickly.", ["With"]),
      qmcq("Which sentence describes what you believed then?", [
        "At the time it felt like a disaster.",
        "Now it feels like a disaster.",
        "It will feel like a disaster.",
      ], 0),
    ],
    scenes: [
      sc("Bettina", "an old friend", "to look back on a shared difficult year",
        "Two friends who went through a hard period together are reflecting.",
        "Describe how your view has changed.",
        "That whole year was chaos. Looking back, how do you see it now?", "warm"),
      sc("Gareth", "a colleague at a project review", "to draw honest lessons from a hard project",
        "The team is reviewing a project that nearly failed.",
        "Reflect on what you know now.",
        "The project almost failed. With hindsight, what do you think went wrong?", "candid"),
      sc("Sandrine", "a traveller ending a long trip", "to make sense of a journey that went wrong",
        "Someone is at the end of a trip that did not go to plan.",
        "Reflect on how your view changed.",
        "Your long trip is nearly over. How did you feel at the start, and how do you see it now?", "reflective"),
      sc("Mr. Dabiri", "your teacher", "to practise reflective language",
        "The class is reflecting on a difficult experience.",
        "Contrast then and now.",
        "Think of a difficult time in your past. How did you feel at the time, and how do you see it now?", "encouraging"),
      sc("Ms. Halvorsen", "the examiner", "to check reflective language",
        "The examiner asks for a reflection on the past.",
        "Contrast past belief and present judgement.",
        "Please describe something you now see differently. What did you think at the time?", "neutral"),
    ],
  },

  {
    id: "b2-the-turning-point",
    topic: "a single decision that changed everything",
    objectives: [
      "Identify the moment a direction changed.",
      "Explain what followed from that moment.",
    ],
    goal: "Tell the story of one decision that changed your direction.",
    target: "narrating a decisive moment",
    correction: "Model the sentence that names the moment and let the learner carry the story on.",
    summary: "You practised telling the story of one decision that changed your direction.",
    minutes: 7,
    points: [
      {
        form: "that's when everything",
        claims: [
          "'That's when everything changed' marks the exact turning point in a story.",
          "It usually comes after the event, not before it.",
        ],
        ex: ["That's when everything changed for me.", "That's when everything started to make sense."],
      },
      {
        form: "it all changed",
        claims: [
          "'It all changed after that' summarises the effect in one short sentence.",
          "Short sentences carry more weight after a long description.",
        ],
        ex: ["It all changed after that conversation.", "After that, it all changed very quickly."],
      },
      {
        form: "if that hadn't",
        claims: [
          "'If that hadn't happened' looks back at how differently things could have gone.",
          "It takes the past perfect, like any unreal past condition.",
        ],
        ex: ["If that hadn't happened, I would still be there.", "If that hadn't come up, I'd have stayed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — that's when everything
      chat("p1", ["So you met your old teacher by chance at the station?", null], [
        "Yes, and that's when everything changed for me.",
        "Yes, and that's when everything changing for me.",
        "Yes, and that's when everything change for me.",
      ]),
      sit("p1", "You are telling a story. After months of confusion, a friend explained the problem, and suddenly you understood. You mark that moment. What do you say?", [
        "That's when everything became clear.",
        "That's when everything become clear.",
        "That's when everything becomed clear.",
      ]),
      spk("p1", "That's when everything changed for me."),
      // p2 — it all changed
      fc("p2", "After that conversation, it all ___ very quickly.", ["changed", "change", "changing"]),
      lc("p2", "It all changed after that conversation.", [
        "It all started with a conversation.",
        "Nothing changed after that call.",
      ]),
      chat("p2", ["You were unhappy in that job for years. Then your boss left?", null], [
        "Yes, and it all changed after that.",
        "Yes, and it all change after that.",
        "Yes, and it all changing after that.",
      ]),
      // p3 — if that hadn't
      sit("p3", "A missed bus made you meet your best friend. You imagine the other past. What do you say?", [
        "If that hadn't happened, we would never have met.",
        "If that hasn't happened, we would never have met.",
        "If that hadn't happened, we would never met.",
      ]),
      err("p3", "If that hadn't come up, I'd have stay.", "stay", "stayed"),
      la("p3", "If that hadn't happened, I'd still be at home.", ["haven't"]),
      // karışık
      chat("mix", ["What made you leave the city?", "I lost my flat, and then a friend offered me a room by the sea.", "And then?", null], [
        "That's when everything changed. If that hadn't happened, I'd still be in the city.",
        "That's when everything changed. If that didn't happened, I'd still be in the city.",
        "That's when everything changed. If that hadn't happened, I still be in the city.",
      ]),
      lc("mix", "That's when everything changed. If that hadn't happened, I'd still be there.", [
        "That's when everything started. If that happens, I'll still be there.",
        "That was when nothing changed. I had been there for years.",
      ]),
    ],
    success: "The learner names a turning point and explains what followed from it.",
    quiz: [
      qmcq("Which sentence looks at the alternative past?", [
        "If that hadn't happened, I would still be there.",
        "If that happens, I will still be there.",
        "That happened and I am still here.",
      ], 0),
      qfill("It all ___ after that conversation. (change)", ["changed"]),
      qmcq("Which sentence marks the moment?", [
        "That's when everything started to make sense.",
        "Everything makes sense every day.",
        "Nothing has made sense.",
      ], 0),
    ],
    scenes: [
      sc("Njeri", "a close friend", "to hear the story properly for the first time",
        "A friend knows the outline of your story but not the detail.",
        "Tell the story of the turning point.",
        "You've never told me how all this started. What was the moment everything changed?", "attentive"),
      sc("Viktor", "a colleague who is stuck", "to hear how someone else changed direction",
        "A colleague is considering a big change and wants a real story.",
        "Describe your own turning point.",
        "I'm stuck in my job. How did you know it was time to change?", "searching"),
      sc("Paloma", "someone you meet on a long journey", "to swap life stories",
        "A long journey leads to a real conversation.",
        "Tell the story of your decisive moment.",
        "We have hours to kill. What happened that brought you out here?", "easy"),
      sc("Ms. Adeyemi", "your teacher", "to practise narrating a decisive moment",
        "The class is telling turning-point stories.",
        "Tell your story with a clear moment.",
        "What was the moment that changed your direction, and where would you be if it hadn't happened?", "encouraging"),
      sc("Mr. Castellano", "the examiner", "to check extended narration",
        "The examiner asks for a longer personal story.",
        "Narrate the decision and its consequences.",
        "Please describe a moment that changed your life. What would have happened if it hadn't?", "neutral"),
    ],
  },

  {
    id: "b2-what-id-do-differently",
    topic: "learning from a mistake",
    objectives: [
      "Say what you would change about a past action.",
      "State what you would do next time.",
    ],
    goal: "Talk about a mistake and what you took from it.",
    target: "reflecting on a mistake",
    correction: "Model the reflective sentence and let the learner state their own lesson.",
    summary: "You practised talking about a mistake and what you would do differently.",
    minutes: 7,
    points: [
      {
        form: "what I'd change",
        claims: [
          "'What I'd change is...' puts the lesson at the front of the sentence.",
          "This structure sounds considered rather than defensive.",
        ],
        ex: ["What I'd change is the timing.", "What I'd change is how I told them."],
      },
      {
        form: "next time I'd",
        claims: [
          "'Next time I'd' softens an intention: it means what you would do in that situation again.",
          "For a firm plan, use 'next time I'll' plus the base verb instead.",
        ],
        ex: ["Next time I'd ask more questions.", "Next time I'll take my time."],
      },
      {
        form: "I'd never do that",
        claims: [
          "'I'd never do that again' closes the reflection firmly.",
          "'Again' is what makes it about repeating, not about the original act.",
        ],
        ex: ["I'd never do that again.", "I'd never leave it that late again."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what I'd change is
      fc("p1", "What I'd change ___ the timing.", ["is", "are", "it is"]),
      sit("p1", "A project went badly because you told the team about the changes too late. A colleague asks what you learned. What do you say?", [
        "What I'd change is when I told the team.",
        "What I'd change it is when I told the team.",
        "What would I change is when I told the team.",
      ]),
      spk("p1", "What I'd change is the timing."),
      // p2 — next time I'd / I'll
      chat("p2", ["You rushed the interview answers. Would you do it the same way?", null], [
        "No. Next time I'd take more time to think.",
        "No. Next time I'd taking more time to think.",
        "No. Next time I'd took more time to think.",
      ]),
      sit("p2", "You have decided for certain to book earlier next year. You state this firm plan. What do you say?", [
        "Next time I'll book earlier.",
        "Next time I'll booking earlier.",
        "Next time I'll to book earlier.",
      ]),
      lc("p2", "Next time I'd ask more questions.", [
        "Last time I asked no questions.",
        "Next week I'll answer the questions.",
      ]),
      // p3 — I'd never do that again
      fc("p3", "I'd never do that ___.", ["again", "before", "yet"]),
      err("p3", "I'd never does that again.", "does", "do"),
      la("p3", "I'd never leave it that late again.", ["left"]),
      // karışık
      chat("mix", ["So, after all that, what's the lesson for you?", null], [
        "What I'd change is the plan. Next time I'd start earlier.",
        "What I'd change is the plan. Next time I'd started earlier.",
        "What I'd change is the plan. Next time I'd to start earlier.",
      ]),
      sit("mix", "You lent money to a stranger and lost it. You tell a friend what you'd do differently, and that you'd never repeat it. What do you say?", [
        "Next time I'd say no. I'd never do that again.",
        "Next time I'd say no. I'd never did that again.",
        "Next time I'd said no. I'd never do that again.",
      ]),
    ],
    success: "The learner states what they would change and what they would do differently next time.",
    quiz: [
      qmcq("Which sentence states a lesson?", [
        "What I'd change is how I told them.",
        "What I changed was the plan.",
        "What changes is the plan.",
      ], 0),
      qfill("If it ever happened again, next time I ___ take my time.", ["would", "'d"]),
      qmcq("Which sentence closes a reflection firmly?", [
        "I'd never do that again.",
        "I did that once.",
        "I might do that.",
      ], 0),
    ],
    scenes: [
      sc("Emeka", "a friend who made the same mistake", "to compare what you both learned",
        "Two friends realise they made similar mistakes.",
        "Say what you would change.",
        "I made almost the same mistake last year. What would you change if it happened again?", "wry"),
      sc("Hanne", "your mentor at work", "to turn a mistake into a lesson",
        "A mentoring conversation after something went wrong.",
        "State the lesson and the plan.",
        "That project went badly. What would you do differently next time?", "supportive"),
      sc("Diego", "a fellow traveller who lost money", "to help him see what to do next time",
        "Someone you met made an expensive travel mistake.",
        "Share your own lesson.",
        "I lost my money to a stranger, and I feel so stupid. What's a mistake you would never make again?", "embarrassed"),
      sc("Mr. Okonkwo", "your teacher", "to practise reflective planning",
        "The class is reflecting on mistakes and lessons.",
        "State what you would do differently.",
        "Think of a recent mistake. What would you change, and what would you do next time?", "encouraging"),
      sc("Ms. Rossi", "the examiner", "to check reflective language",
        "The examiner asks about learning from experience.",
        "State the change and the plan.",
        "Please describe a past mistake. What would you do differently next time?", "neutral"),
    ],
  },

  // --- Ünite 2 · What Might Have Been ----------------------------------------
  {
    id: "b2-it-might-have-been-worse",
    topic: "possibilities in the past",
    objectives: [
      "Use might have and could have for past possibilities.",
      "Say how differently something could have turned out.",
    ],
    goal: "Talk about how a past situation could have gone another way.",
    target: "might have and could have for past possibility",
    correction: "Repeat the sentence with 'might have' plus the past participle and let the learner try again.",
    summary: "You learned to talk about past possibilities with might have and could have.",
    minutes: 8,
    points: [
      {
        form: "might have been",
        claims: [
          "'Might have' plus the past participle says something possibly happened, but the speaker is not certain.",
          "For something that nearly happened, the context must say so: we might have missed it, but the train was late.",
        ],
        ex: ["It might have been much worse.", "We might have missed the flight."],
      },
      {
        form: "could have gone",
        claims: [
          "'Could have' works the same way and often describes an ability or a risk.",
          "'Could have gone wrong' is a very common way to describe a narrow escape.",
        ],
        ex: ["It could have gone badly.", "You could have hurt yourself."],
      },
      {
        form: "it could've",
        claims: [
          "In speech 'could have' is contracted to 'could've'.",
          "'Could of' is never correct in writing, however it sounds.",
        ],
        ex: ["It could've been anyone.", "The delay could've caused a serious accident."],
      },
    ],
    ex: [],
    drills: [
      // p1 — might have been
      fc("p1", "We ___ have missed the flight, but it was delayed.", ["might", "will", "had"]),
      lc("p1", "It might have been much worse.", [
        "It must be much worse now.",
        "It was much better than that.",
      ]),
      arr("p1", "We might have missed the flight.", ["miss"]),
      // p2 — could have gone
      sit("p2", "Your friend climbed onto a wet roof to get a ball. He is fine, but he took a big risk. What do you say?", [
        "You could have fallen!",
        "You could fallen!",
        "You could have fell!",
      ]),
      fc("p2", "Luckily we were fine, but it ___ have gone badly.", ["could", "can", "will"]),
      chat("p2", ["The brakes failed, but I managed to stop the car.", null], [
        "Wow, that could have gone very wrong.",
        "Wow, that could has gone very wrong.",
        "Wow, that could have go very wrong.",
      ]),
      // p3 — could've (could of değil)
      err("p3", "It could of been anyone.", "of", "have"),
      spk("p3", "The delay could've caused an accident.", ["The delay could have caused an accident."]),
      fc("p3", "That ladder was broken. You ___ been badly hurt.", ["could've", "could of", "could"]),
      // karışık
      sit("mix", "A tree fell on the road five minutes after you drove past. You tell a friend it was a risk, and that someone was possibly hurt. What do you say?", [
        "It could have gone badly. Someone might have been hurt.",
        "It could have gone badly. Someone might have be hurt.",
        "It could have went badly. Someone might have been hurt.",
      ]),
      lc("mix", "It could've gone badly. It might have been much worse.", [
        "It could go badly. It might be much worse.",
        "It went badly. It was much worse.",
      ]),
    ],
    success: "The learner describes at least two past possibilities using might have or could have.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "You could have hurt yourself.",
        "You could have hurted yourself.",
        "You could of hurt yourself.",
      ], 0),
      qfill("It ___ have been anyone in that photo. (might)", ["might", "could"]),
      qmcq("Which sentence is less certain?", [
        "It might have been worse.",
        "It would have been worse.",
        "It was worse.",
      ], 0),
    ],
    scenes: [
      sc("Solveig", "a neighbour after a near accident", "to talk through what nearly happened",
        "Something nearly went badly wrong on your street.",
        "Describe how it could have turned out.",
        "That car nearly hit you! What could have happened?", "shaken"),
      sc("Idris", "a colleague after a near miss at work", "to review a risk that was avoided",
        "A mistake was caught just in time.",
        "Describe the possible outcomes.",
        "We caught the error with an hour to spare. What could have gone wrong?", "sober"),
      sc("Camille", "a fellow passenger after a delay", "to compare how close you both came to missing it",
        "A delayed connection nearly stranded several travellers.",
        "Describe what could have happened.",
        "Ten more minutes and we would have missed the boat. What might have happened to your plans?", "relieved"),
      sc("Mr. Bergqvist", "your teacher", "to practise past possibility",
        "The class is describing near misses.",
        "Describe a past possibility.",
        "Tell us about a time something nearly went wrong. What could have happened?", "encouraging"),
      sc("Ms. Nakamura", "the examiner", "to check past possibility forms",
        "The examiner asks about a close call.",
        "Use might have and could have accurately.",
        "Please describe a narrow escape you once had. How might it have been worse?", "neutral"),
    ],
  },

  {
    id: "b2-you-neednt-have-bothered",
    topic: "unnecessary actions in the past",
    objectives: [
      "Use needn't have for something done that was not necessary.",
      "Use didn't need to for something that was not necessary and not done.",
    ],
    goal: "Say which past efforts turned out to be unnecessary.",
    target: "needn't have versus didn't need to",
    correction: "Contrast the two forms in one pair of sentences and let the learner choose.",
    summary: "You learned that needn't have means you did it anyway, and didn't need to usually means you did not.",
    minutes: 8,
    points: [
      {
        form: "you needn't have",
        claims: [
          "'Needn't have' plus the past participle means the action WAS done but was not necessary.",
          "It often carries a note of thanks or mild criticism.",
        ],
        ex: ["You needn't have brought anything.", "We needn't have queued at all."],
      },
      {
        form: "I didn't need to",
        claims: [
          "'Didn't need to' says the action was not necessary; usually it was not done either.",
          "The two forms are not interchangeable, even though both contain a negative.",
        ],
        ex: ["I didn't need to book, so I just turned up.", "She didn't need to pay."],
      },
      {
        form: "there was no need",
        claims: [
          "'There was no need to' is a softer way of saying the effort was wasted.",
          "It avoids pointing at the person who made the effort.",
        ],
        ex: ["There was no need to rush.", "There was no need to worry about it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — needn't have (yapıldı ama gereksizdi)
      fc("p1", "You ___ have brought anything, but thank you!", ["needn't", "didn't need", "don't need"]),
      sit("p1", "You queued for two hours for concert tickets. Then you saw that the hall was half empty. What do you say?", [
        "We needn't have queued at all.",
        "We needn't queued at all.",
        "We needn't to have queued at all.",
      ]),
      err("p1", "You needn't have cook so much food.", "cook", "cooked"),
      // p2 — didn't need to (genelde yapılmadı)
      sit("p2", "The museum was free, so you did not buy a ticket. What do you say?", [
        "I didn't need to buy a ticket.",
        "I needn't have bought a ticket.",
        "I didn't need buying a ticket.",
      ]),
      fc("p2", "I didn't need ___ book, so I just turned up.", ["to", "for", "have"]),
      lc("p2", "She didn't need to pay.", [
        "She had to pay twice.",
        "She didn't want to stay.",
      ]),
      // p3 — there was no need
      chat("p3", ["Sorry, I was panicking all morning about the test.", null], [
        "There was no need to panic.",
        "There was no need panic.",
        "There was no need of panic.",
      ]),
      spk("p3", "There was no need to rush."),
      fc("p3", "There was no ___ to bring so much.", ["need", "needs", "needed"]),
      // karışık
      chat("mix", ["I bought a new suit for the dinner, but everyone was in jeans.", null], [
        "You needn't have bought it. There was no need to dress up.",
        "You needn't have buy it. There was no need to dress up.",
        "You didn't need have bought it. There was no need to dress up.",
      ]),
      lc("mix", "I didn't need to book. There was no need to rush.", [
        "I needed to book. There was a need to rush.",
        "I didn't want to look. There was no time to rest.",
      ]),
    ],
    success: "The learner uses needn't have and didn't need to with the correct meanings.",
    quiz: [
      qmcq("Which sentence means the person did it anyway?", [
        "You needn't have paid for us.",
        "You didn't need to pay for us.",
        "You do not need to pay for us.",
      ], 0),
      qfill("She ___ need to bring a passport, so she left it at home. (did not)", ["didn't"]),
      qmcq("Which sentence avoids blaming anyone?", [
        "There was no need to worry about it.",
        "You worried far too much.",
        "You should not have worried.",
      ], 0),
    ],
    scenes: [
      sc("Yusuf", "a neighbour who over-prepared", "to laugh about the wasted effort",
        "Both of you prepared for something that turned out to be simple.",
        "Say what was unnecessary.",
        "I spent all morning getting ready, and the visit took ten minutes. What did you do recently that turned out to be unnecessary?", "amused"),
      sc("Ingrid", "a colleague who worked late unnecessarily", "to prevent the same waste next time",
        "Someone worked all weekend on something that was cancelled.",
        "Say what was not necessary.",
        "I finished the whole report, and then the meeting was cancelled. What would you say to me about all that work?", "frustrated"),
      sc("Rafael", "a guide explaining what you did not need", "to save you effort next time",
        "You over-prepared for a trip.",
        "Say which preparations were unnecessary.",
        "You packed for a month, but the trip is only a week. What did you bring that you didn't need?", "amused"),
      sc("Mrs. Lindqvist", "your teacher", "to practise the two negative forms",
        "The class is sorting necessary from unnecessary past actions.",
        "Use both forms correctly.",
        "Think of something you prepared for that turned out not to matter. What happened?", "encouraging"),
      sc("Mr. Ferreira", "the examiner", "to check the distinction",
        "The examiner asks about wasted effort.",
        "Distinguish the two forms clearly.",
        "Please describe a time you prepared too much for something. What was unnecessary?", "neutral"),
    ],
  },

  {
    id: "b2-id-rather-you-hadnt",
    topic: "preferences about what someone else did",
    objectives: [
      "Use would rather with a past clause about another person.",
      "Express a wish about someone's past action.",
    ],
    goal: "Tell someone politely that you wish they had acted differently.",
    target: "would rather and wish pointing at the past",
    correction: "Model the softened sentence and let the learner rephrase their own.",
    summary: "You learned to say you wish someone had acted differently, without accusing them.",
    minutes: 8,
    points: [
      {
        form: "I'd rather you",
        claims: [
          "'I'd rather you' plus the past simple is about now or the future: I'd rather you didn't tell anyone.",
          "With the past perfect it is about the past: you would have preferred the other person to act differently.",
        ],
        ex: ["I'd rather you hadn't mentioned it.", "I'd rather you had asked me first."],
      },
      {
        form: "I'd sooner",
        claims: [
          "'I'd sooner' has a similar meaning but is less common and can sound more emphatic.",
          "Both are followed by a clause when they refer to another person.",
        ],
        ex: ["I'd sooner you had told me directly.", "I'd sooner we hadn't gone at all."],
      },
      {
        form: "I wish you hadn't",
        claims: [
          "'I wish' plus the past perfect expresses regret about someone else's past action.",
          "It is more direct than 'I'd rather', so it lands harder.",
        ],
        ex: ["I wish you hadn't said that.", "I wish we hadn't left so early."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd rather you + geçmiş
      fc("p1", "I'd rather you ___ mentioned it to anyone.", ["hadn't", "haven't", "don't"]),
      sit("p1", "Yesterday your flatmate told your parents about your new job before you could. You say calmly what you would have preferred. What do you say?", [
        "I'd rather you hadn't told them.",
        "I'd rather you didn't tell them.",
        "I'd rather you haven't told them.",
      ]),
      arr("p1", "I'd rather you hadn't mentioned it.", ["haven't"]),
      // p2 — I'd sooner
      fc("p2", "I'd ___ you had told me directly.", ["sooner", "soon", "soonest"]),
      lc("p2", "I'd sooner we hadn't gone at all.", [
        "We should have gone sooner.",
        "I'd go sooner if I could.",
      ]),
      err("p2", "I'd sooner you had tell me directly.", "tell", "told"),
      // p3 — I wish you hadn't
      chat("p3", ["I told everyone at work about your new baby.", null], [
        "Oh no. I wish you hadn't told them.",
        "Oh no. I wish you didn't tell them.",
        "Oh no. I wish you haven't told them.",
      ]),
      spk("p3", "I wish we hadn't left so early."),
      fc("p3", "I wish you ___ said that in front of everyone.", ["hadn't", "wouldn't", "don't"]),
      // karışık
      sit("mix", "A colleague sent your draft to the boss without asking you. You say it directly first, and then more softly. What do you say?", [
        "I wish you hadn't sent it. I'd rather you had asked me first.",
        "I wish you hadn't sent it. I'd rather you have asked me first.",
        "I wish you didn't send it. I'd rather you had asked me first.",
      ]),
      lc("mix", "I wish you hadn't said that. I'd rather you'd asked me.", [
        "I wish you could say that. I'd ask you first.",
        "I said that to you. I'd rather you knew.",
      ]),
    ],
    success: "The learner expresses a preference about someone else's past action politely.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I wish you hadn't said that.",
        "I wish you didn't say that yesterday.",
        "I wish you not said that.",
      ], 0),
      qfill("I'd rather you ___ asked me first. (have)", ["had"]),
      qmcq("Which sentence is the most direct?", [
        "I wish you hadn't done that.",
        "I'd rather you hadn't done that.",
        "I'd sooner you hadn't done that.",
      ], 0),
    ],
    scenes: [
      sc("Marek", "a friend who shared your news", "to understand why you are upset",
        "A friend told other people something you had not announced.",
        "Say politely that you wish they hadn't.",
        "I told everyone your news before you could. What would you have preferred me to do?", "concerned"),
      sc("Priya", "a colleague who copied in the whole team", "to handle the situation without a row",
        "A private message was forwarded to a whole team.",
        "Express your preference politely.",
        "I copied the whole team into your private email. What would you have preferred?", "unaware"),
      sc("Hugo", "a travel companion who changed the booking", "to sort out a decision made without you",
        "Your companion changed a shared booking alone.",
        "Say what you would have preferred.",
        "I moved our booking forward a day without asking you. What would you rather I had done?", "breezy"),
      sc("Ms. Dubois", "your teacher", "to practise polite regret",
        "The class is practising sensitive conversations.",
        "Express regret about someone else's action politely.",
        "A friend shared your secret with the whole class. What would you say to them?", "encouraging"),
      sc("Mr. Aaltonen", "the examiner", "to check polite regret forms",
        "The examiner describes an awkward situation.",
        "Express your preference politely.",
        "Imagine a friend announced your plans too early. What would you say to them?", "neutral"),
    ],
  },

  {
    id: "b2-suppose-we-had-gone",
    topic: "playing out a past that never happened",
    objectives: [
      "Open an imaginary past scenario.",
      "Follow the scenario through to its consequences.",
    ],
    goal: "Imagine out loud how a different past would have unfolded.",
    target: "opening an unreal past scenario",
    correction: "Model the opener and let the learner continue the imagined story.",
    summary: "You learned to open and follow through an imagined version of the past.",
    minutes: 7,
    points: [
      {
        form: "suppose we had",
        claims: [
          "'Suppose' and 'supposing' open an imaginary situation and invite the other person in.",
          "With the past perfect they point at a past that never happened.",
        ],
        ex: ["Suppose we had taken the other road.", "Supposing they had said no."],
      },
      {
        form: "imagine if we'd",
        claims: [
          "'Imagine if' is the informal equivalent and is very common in speech.",
          "'We'd' after 'if' is short for 'we had', not 'we would'.",
        ],
        ex: ["Imagine if we'd stayed another week.", "Imagine if nobody had noticed."],
      },
      {
        form: "what if we had",
        claims: [
          "'What if' can open a question about the past or about the future.",
          "The past perfect after it is what makes the situation unreal.",
        ],
        ex: ["What if we had gone by train?", "What if she had never called?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — suppose / supposing
      fc("p1", "Suppose we ___ taken the other road.", ["had", "have", "would"]),
      sit("p1", "Last year your team chose plan A. In a meeting, you invite everyone to imagine the other choice. What do you say?", [
        "Suppose we had chosen plan B.",
        "Suppose we have chosen plan B.",
        "Suppose we had choose plan B.",
      ]),
      err("p1", "Supposing they had say no.", "say", "said"),
      // p2 — imagine if we'd
      chat("p2", ["We nearly stayed in Lisbon for another week.", null], [
        "Imagine if we'd stayed!",
        "Imagine if we've stayed!",
        "Imagine if we'd staying!",
      ]),
      lc("p2", "Imagine if nobody had noticed.", [
        "I imagined that nobody noticed.",
        "Imagine if somebody notices.",
      ]),
      spk("p2", "Imagine if we'd stayed another week."),
      // p3 — what if we had
      fc("p3", "What if we ___ gone by train?", ["had", "have", "were"]),
      sit("p3", "You drove to the coast and sat in traffic for hours. Now you ask your partner about the other option. What do you say?", [
        "What if we had gone by train?",
        "What if we had go by train?",
        "What if we have gone by train?",
      ]),
      arr("p3", "What if we had missed the boat?", ["has"]),
      // karışık
      chat("mix", ["We almost didn't go to the party where you met Sam.", null], [
        "Imagine if we'd stayed home! What if I had never met him?",
        "Imagine if we'd stay home! What if I had never met him?",
        "Imagine if we'd stayed home! What if I have never met him?",
      ]),
      lc("mix", "Suppose we had said no. What if they had left?", [
        "Suppose we say no. What if they leave?",
        "We said no, so they left.",
      ]),
    ],
    success: "The learner opens an unreal past scenario and develops it.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Supposing they had said no, what would we have done?",
        "Supposing they would say no, what would we have done?",
        "Supposing they say no, what would we have done then?",
      ], 0),
      qfill("What if she ___ never called that evening? (have)", ["had"]),
      qmcq("Which phrase opens an imagined past?", ["Imagine if we'd", "Imagine we will", "Imagine now"], 0),
    ],
    scenes: [
      sc("Lucia", "a friend who was there", "to imagine the evening going differently",
        "You are both replaying an evening that changed things.",
        "Imagine the alternative version.",
        "We nearly stayed home the night we met. What other version of that night can you imagine?", "playful"),
      sc("Tomasz", "a colleague reviewing a decision", "to test a decision by imagining the alternative",
        "The team is stress-testing a choice already made.",
        "Play out the alternative.",
        "We chose the cheaper supplier last year. What other choice would you test, and how might it have gone?", "analytical"),
      sc("Aiko", "a travel companion", "to imagine the trip you did not take",
        "You chose one route over another.",
        "Imagine the other route.",
        "We went south, but we could have gone north. How do you imagine the other trip?", "wistful"),
      sc("Mr. Villanueva", "your teacher", "to practise unreal past scenarios",
        "The class is imagining alternative histories.",
        "Open and develop an unreal past.",
        "Think of a subject you nearly chose at school. How would you describe that other path?", "encouraging"),
      sc("Mrs. Sorensen", "the examiner", "to check unreal past scenarios",
        "The examiner invites you to imagine an alternative.",
        "Open the scenario and follow it through.",
        "Please describe one choice in your past that could have gone the other way. How do you imagine it?", "neutral"),
    ],
  },

  {
    id: "b2-it-was-meant-to-be",
    topic: "luck, fate and coincidence",
    objectives: [
      "Comment on an outcome as lucky or fated.",
      "Say that a bad-looking outcome was actually fortunate.",
    ],
    goal: "React to a coincidence or a lucky escape.",
    target: "expressions about luck and fate",
    correction: "Model the fixed expression and let the learner use it about their own story.",
    summary: "You learned expressions for luck, fate and lucky escapes.",
    minutes: 7,
    points: [
      {
        form: "meant to be",
        claims: [
          "'It was meant to be' says an outcome feels arranged rather than accidental.",
          "'Not meant to be' is the usual way of accepting that something failed.",
        ],
        ex: ["It was meant to be, I think.", "That job just wasn't meant to be."],
      },
      {
        form: "just as well",
        claims: [
          "'It's just as well' says a bad-looking outcome turned out to be fortunate.",
          "It is usually followed by 'that' plus a clause, or by a short reason.",
        ],
        ex: ["It's just as well we left early.", "Just as well I checked the times."],
      },
      {
        form: "as luck would have",
        claims: [
          "'As luck would have it' introduces a coincidence, good or bad.",
          "The phrase is fixed; the words inside it do not change.",
        ],
        ex: ["As luck would have it, she was there too.", "As luck would have it, the shop was closed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — meant to be
      fc("p1", "We met on a train by chance. It was ___ to be.", ["meant", "mean", "meaning"]),
      sit("p1", "You did not get a flat you wanted, but you accept it calmly. What do you say?", [
        "It just wasn't meant to be.",
        "It just wasn't mean to be.",
        "It just wasn't meant be.",
      ]),
      lc("p1", "It was meant to be, I think.", [
        "It was mine to keep, I think.",
        "I meant to see you, I think.",
      ]),
      // p2 — just as well
      chat("p2", ["The trains were cancelled, but you left early. Lucky you!", null], [
        "It's just as well I left early.",
        "It's just as good I left early.",
        "It's just so well I left early.",
      ]),
      fc("p2", "It's just as ___ we left early. The roads were closed later.", ["well", "good", "better"]),
      err("p2", "It's just so well that we booked a table.", "so", "as"),
      // p3 — as luck would have it
      fc("p3", "As luck would ___ it, she was there too.", ["have", "has", "had"]),
      spk("p3", "As luck would have it, she was there too."),
      sit("p3", "You forgot your umbrella, but by coincidence your friend had a spare one. You tell the story. What do you say?", [
        "As luck would have it, my friend had a spare one.",
        "As luck would have, my friend had a spare one.",
        "As the luck would have it, my friend had a spare one.",
      ]),
      // karışık
      chat("mix", ["So you missed your flight and then met your future business partner at the airport?", null], [
        "Yes! As luck would have it, he was on the next flight. It was meant to be.",
        "Yes! As luck would have it, he was on the next flight. It was meant be.",
        "Yes! As luck has it, he was on the next flight. It was meant to be.",
      ]),
      la("mix", "As luck would have it, it was meant to be.", ["mean"]),
    ],
    success: "The learner describes a coincidence and comments on it with a fixed expression.",
    quiz: [
      qmcq("Which sentence accepts a failure calmly?", [
        "That job just wasn't meant to be.",
        "That job was terrible for me.",
        "That job will not happen again.",
      ], 0),
      qfill("___ as well I checked the times before leaving. (just)", ["Just"]),
      qmcq("Which phrase introduces a coincidence?", [
        "As luck would have it,",
        "As a result,",
        "As I said before,",
      ], 0),
    ],
    scenes: [
      sc("Beatriz", "a friend who loves a coincidence", "to swap stories about lucky timing",
        "Two friends are trading stories about strange timing.",
        "Describe a coincidence from your life.",
        "I bumped into my old best friend in another country this morning. What's the luckiest coincidence that has happened to you?", "delighted"),
      sc("Callum", "a colleague after a cancelled trip", "to see the upside of a cancellation",
        "A work trip was cancelled at the last minute.",
        "Comment on how it turned out.",
        "Our trip fell through, and then a storm hit the island. How do you see it now?", "philosophical"),
      sc("Noor", "a traveller with a story of missed connections", "to compare travel luck",
        "Two travellers compare journeys that went strangely.",
        "Comment on a lucky escape.",
        "I missed three connections and still got here first. What's the strangest bit of luck you've had on a trip?", "amused"),
      sc("Mrs. Grant", "your teacher", "to practise fixed expressions",
        "The class is telling coincidence stories.",
        "Use a fixed expression about luck.",
        "Tell us about a coincidence. How did it change your plans?", "encouraging"),
      sc("Mr. Haddad", "the examiner", "to check idiomatic reactions",
        "The examiner asks about luck and timing.",
        "React with an appropriate fixed expression.",
        "Please describe a plan that failed but turned out well. How do you feel about it now?", "neutral"),
    ],
  },

  {
    id: "b2-was-it-worth-it",
    topic: "judging whether a decision paid off",
    objectives: [
      "Weigh the costs and benefits of a past decision.",
      "Reach a considered judgement about it.",
    ],
    goal: "Decide out loud whether a past decision was worth it.",
    target: "evaluating a past decision",
    correction: "Model the balancing sentence and let the learner complete the judgement.",
    summary: "You practised weighing a past decision and reaching a considered judgement.",
    minutes: 7,
    points: [
      {
        form: "was it worth",
        claims: [
          "'Was it worth it?' asks whether the benefits outweighed the costs.",
          "'Worth' is followed by a noun or by a verb with -ing: worth the money, worth doing.",
        ],
        ex: ["Was it worth the money?", "It was worth doing, even so."],
      },
      {
        form: "on balance",
        claims: [
          "'On balance' signals that you have weighed both sides before answering.",
          "It usually comes before your conclusion, not after it.",
        ],
        ex: ["On balance, I'd say yes.", "On balance, it cost more than it gave."],
      },
      {
        form: "I don't regret",
        claims: [
          "'I don't regret it' states the judgement without claiming the decision was perfect.",
          "It is often followed by a concession beginning with 'even though'.",
        ],
        ex: ["I don't regret it at all.", "I don't regret it, even though it was hard."],
      },
    ],
    ex: [],
    drills: [
      // p1 — was it worth
      fc("p1", "The course was expensive, but it was worth ___.", ["doing", "to do", "do"]),
      chat("p1", ["I spent all my savings on that trip to Japan.", null], [
        "Was it worth the money?",
        "Was it worth of the money?",
        "Was it worthy the money?",
      ]),
      err("p1", "The film was worth watch.", "watch", "watching"),
      // p2 — on balance
      sit("p2", "Your new job pays less, but you are much happier. Someone asks if it was a good move. You weigh both sides and say yes. What do you say?", [
        "On balance, I'd say yes.",
        "In balance, I'd say yes.",
        "On the balances, I'd say yes.",
      ]),
      lc("p2", "On balance, I'd do it again.", [
        "On Monday, I'll do it again.",
        "In the end, I didn't do it.",
      ]),
      spk("p2", "On balance, I'd say it was worth it."),
      // p3 — I don't regret
      fc("p3", "I don't regret ___, even though it cost a lot.", ["it", "to", "about"]),
      chat("p3", ["Moving abroad was a huge risk. Any regrets?", null], [
        "None. I don't regret it at all.",
        "None. I don't regret at all it.",
        "None. I don't regretting it at all.",
      ]),
      la("p3", "I don't regret it, even though it was tough.", ["regrets"]),
      // karışık
      sit("mix", "You paid a lot for a cooking course. It was hard work, but you learned a lot. A friend asks if it was worth it. You weigh both sides and answer. What do you say?", [
        "On balance, it was worth it. I don't regret it.",
        "On balance, it was worth it. I not regret it.",
        "On balance, it was worthy it. I don't regret it.",
      ]),
      lc("mix", "Was it worth it? On balance, yes, and I don't regret it.", [
        "Was it worth it? On Monday, yes, but I really regret it.",
        "Is it worth it? I'm not sure, and I regret it.",
      ]),
    ],
    success: "The learner weighs both sides and states a clear judgement.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It was worth doing, even so.",
        "It was worth to do, even so.",
        "It was worth do, even so.",
      ], 0),
      qfill("___ balance, it cost more than it gave. (on)", ["On"]),
      qmcq("Which sentence admits difficulty but keeps the judgement?", [
        "I don't regret it, even though it was hard.",
        "I regret it because it was hard.",
        "It was not hard at all.",
      ], 0),
    ],
    scenes: [
      sc("Stefan", "a friend considering the same thing", "to hear an honest verdict before deciding",
        "A friend is about to make a decision you already made.",
        "Give an honest weighed judgement.",
        "I've just come back from a very expensive trip. What would you ask me to find out if the cost was justified?", "serious"),
      sc("Aditi", "a colleague reviewing an investment", "to judge whether a project paid off",
        "The team is reviewing whether a costly project was justified.",
        "Weigh the costs and benefits.",
        "The numbers for the new software are in. Weighing everything up, what's your view?", "analytical"),
      sc("Mateus", "a traveller who spent a lot", "to compare whether the expense was justified",
        "Two travellers compare an expensive experience.",
        "Judge whether it was worth it.",
        "That excursion cost me a fortune. What would you ask to find out if it paid off?", "unsure"),
      sc("Ms. Kowalski", "your teacher", "to practise evaluative language",
        "The class is evaluating past decisions.",
        "Weigh both sides and conclude.",
        "Think of something expensive you did. Weighing up the good and the bad, how do you feel about it now?", "encouraging"),
      sc("Mr. Ozturk", "the examiner", "to check evaluative language",
        "The examiner asks for a judgement on a past decision.",
        "Weigh both sides clearly.",
        "Please describe a costly decision you made. Weighing it all up, how do you feel about it now?", "neutral"),
    ],
  },

  {
    id: "b2-an-alternative-life",
    topic: "imagining the path you did not take",
    objectives: [
      "Describe in detail a life you might have had.",
      "Accept that the alternative is unknowable.",
    ],
    goal: "Describe the life you might have led if things had gone differently.",
    target: "sustained speculation about an alternative past",
    correction: "Model the speculative sentence and let the learner extend the picture.",
    summary: "You practised describing in detail a life you might have led.",
    minutes: 7,
    points: [
      {
        form: "I might have ended",
        claims: [
          "'I might have ended up' describes where an alternative path would have led.",
          "'End up' suggests the result was not planned.",
        ],
        ex: ["I might have ended up abroad.", "I might have ended up doing something completely different."],
      },
      {
        form: "who knows where",
        claims: [
          "'Who knows where I'd be now' accepts that the alternative cannot be known.",
          "It softens speculation so it does not sound like a claim.",
        ],
        ex: ["Who knows where I'd be now.", "Who knows what would have happened."],
      },
      {
        form: "things would be",
        claims: [
          "'Things would be very different' moves the speculation into the present.",
          "This is the mixed pattern: past cause, present result.",
        ],
        ex: ["Things would be very different now.", "Things would be much simpler."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I might have ended up
      fc("p1", "If I hadn't met her, I might have ___ up abroad.", ["ended", "end", "ending"]),
      sit("p1", "Ten years ago you almost accepted a job in Canada. You imagine where that path could have led. What do you say?", [
        "I might have ended up in Canada.",
        "I might have end up in Canada.",
        "I might ended up in Canada.",
      ]),
      spk("p1", "I might have ended up doing something completely different."),
      // p2 — who knows where
      chat("p2", ["What if you had studied music instead of law?", null], [
        "Who knows where I'd be now.",
        "Who knows where would I be now.",
        "Who know where I'd be now.",
      ]),
      lc("p2", "Who knows where I'd be now.", [
        "Who knows where I was then.",
        "Nobody knew where I went.",
      ]),
      fc("p2", "Who knows where I ___ be now.", ["would", "will", "had"]),
      // p3 — things would be
      sit("p3", "You never moved to the big city. You imagine your life today if you had. What do you say?", [
        "Things would be very different now.",
        "Things will be very different now.",
        "Things would have be very different now.",
      ]),
      err("p3", "Things would been much simpler now.", "been", "be"),
      la("p3", "If I'd stayed, things would be very different.", ["been"]),
      // karışık
      chat("mix", ["Do you ever think about the job you turned down?", null], [
        "Sometimes. I might have ended up rich. Who knows where I'd be now.",
        "Sometimes. I might have end up rich. Who knows where I'd be now.",
        "Sometimes. I might have ended up rich. Who knows where would I be now.",
      ]),
      sit("mix", "You almost studied medicine. You imagine where it could have led, and how today would look. What do you say?", [
        "I might have ended up a doctor, and things would be very different now.",
        "I might have ended up a doctor, and things would have be very different now.",
        "I might ended up a doctor, and things would be very different now.",
      ]),
    ],
    success: "The learner sustains a detailed speculation about an alternative life.",
    quiz: [
      qmcq("Which sentence describes an unplanned result?", [
        "I might have ended up abroad.",
        "I planned to go abroad.",
        "I go abroad every year.",
      ], 0),
      qfill("Things ___ be much simpler now.", ["would"]),
      qmcq("Which sentence softens the speculation?", [
        "Who knows what would have happened.",
        "I know what would have happened.",
        "Nothing would have happened.",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a close friend late at night", "to imagine other lives together",
        "A long, honest conversation between old friends.",
        "Describe the life you might have had.",
        "Imagine you had never moved here. Where might you have ended up?", "thoughtful"),
      sc("Ravi", "a colleague at a career crossroads", "to hear how someone else thinks about paths not taken",
        "A colleague is weighing a major change.",
        "Describe your own alternative path.",
        "Think of the job you didn't take. How would things be now if you had taken it?", "searching"),
      sc("Elif", "someone you meet on a long trip", "to trade stories about other possible lives",
        "Travellers often talk about the lives they left behind.",
        "Describe an alternative life.",
        "Everyone out here took a different road. What life might you have had with one different choice?", "candid"),
      sc("Mr. Delacroix", "your teacher", "to practise extended speculation",
        "The class is imagining alternative lives.",
        "Describe your alternative in detail.",
        "If one big thing had gone differently, where might you have ended up?", "encouraging"),
      sc("Ms. Bianchi", "the examiner", "to check sustained speculation",
        "The examiner asks for an extended imagined answer.",
        "Speculate in detail and accept the uncertainty.",
        "Please describe the life you might have had with one different choice. How would things be now?", "neutral"),
    ],
  },

  // --- Ünite 3 · Reporting and Rumour ----------------------------------------
  {
    id: "b2-it-is-said-that",
    topic: "reporting without naming a source",
    objectives: [
      "Report a widely held belief impersonally.",
      "Avoid claiming the statement as your own.",
    ],
    goal: "Report what people generally say without taking responsibility for it.",
    target: "impersonal reporting with it is said",
    correction: "Repeat the impersonal pattern and let the learner report the claim again.",
    summary: "You learned to report general beliefs impersonally with it is said and it is believed.",
    minutes: 8,
    points: [
      {
        form: "it is said",
        claims: [
          "'It is said that' reports a claim without saying who makes it.",
          "The pattern is: it + is + past participle + that + clause.",
        ],
        ex: ["It is said that the building is haunted.", "It is said that he never gave interviews."],
      },
      {
        form: "it is believed",
        claims: [
          "'It is believed', 'it is thought' and 'it is reported' follow the same pattern.",
          "They are common in news writing, where the source is protected or unknown.",
        ],
        ex: ["It is believed that talks will continue.", "It is reported that no one was hurt."],
      },
      {
        form: "it's thought that",
        claims: [
          "In speech the contracted 'it's thought that' is normal.",
          "Using this form does not commit you to the claim being true.",
        ],
        ex: ["It's thought that the cause was electrical.", "It's thought that she left the country."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it is said that
      fc("p1", "It is ___ that the building is haunted.", ["said", "say", "saying"]),
      err("p1", "It is say that the lake has no bottom.", "say", "said"),
      sit("p1", "Many people in your town tell a story about a hidden tunnel, but nobody knows who started it. You tell a visitor. What do you say?", [
        "It is said that there is a hidden tunnel.",
        "It is said to there is a hidden tunnel.",
        "Is said that there is a hidden tunnel.",
      ]),
      // p2 — it is believed / reported
      fc("p2", "It is ___ that no one was hurt.", ["reported", "report", "reporting"]),
      lc("p2", "It is reported that the bridge is closed.", [
        "They reported that the bridge is open.",
        "It is important that the road is clear.",
      ]),
      chat("p2", ["Why are the police outside the bank?", null], [
        "It is believed that someone broke in last night.",
        "It believes that someone broke in last night.",
        "It is believe that someone broke in last night.",
      ]),
      // p3 — it's thought that
      spk("p3", "It's thought that the cause was electrical."),
      fc("p3", "It's thought ___ the fire started in the kitchen.", ["that", "what", "which"]),
      sit("p3", "You heard that a famous singer is moving to your town, but you are not sure it is true. You tell a friend without claiming it as a fact. What do you say?", [
        "It's thought that she's moving here.",
        "She's definitely moving here.",
        "It's think that she's moving here.",
      ]),
      // karışık
      chat("mix", ["What do people know about the old mill?", null], [
        "It is said that it's haunted, and it is believed that a miller died there.",
        "It is say that it's haunted, and it is believed that a miller died there.",
        "It is said that it's haunted, and it believes that a miller died there.",
      ]),
      lc("mix", "It is said that he was rich. It's thought that he lost it all.", [
        "He said that he was rich. He thought he lost it all.",
        "It was clear that he was poor. Nobody lost anything.",
      ]),
    ],
    success: "The learner reports at least two claims impersonally.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It is said that he never gave interviews.",
        "It is said he never give interviews.",
        "It says that he never gave interviews.",
      ], 0),
      qfill("It is ___ that talks will continue tomorrow. (believe)", ["believed"]),
      qmcq("Which sentence does NOT commit the speaker?", [
        "It's thought that she left the country.",
        "I know she left the country.",
        "She definitely left the country.",
      ], 0),
    ],
    scenes: [
      sc("Rosalind", "a neighbour repeating local stories", "to pass on what people say about the area",
        "A neighbour is telling you the local legends.",
        "Report the claims without endorsing them.",
        "There are all sorts of stories about this street. What do people say about it?", "chatty"),
      sc("Anders", "a colleague briefing on a rumour", "to summarise unconfirmed information",
        "Unconfirmed news is circulating at work.",
        "Report it impersonally.",
        "Nothing is official yet. What is being said about the merger?", "careful"),
      sc("Selin", "a guide telling local history", "to share stories whose truth is uncertain",
        "A guide is describing a site with uncertain history.",
        "Report the claims impersonally.",
        "Not all of this is proven, of course. What have you heard about this castle?", "engaging"),
      sc("Mr. Achebe", "your teacher", "to practise impersonal reporting",
        "The class is reporting widely held beliefs.",
        "Report a claim impersonally.",
        "What is said about your home town that may or may not be true?", "encouraging"),
      sc("Ms. Berger", "the examiner", "to check impersonal reporting",
        "The examiner asks about local beliefs.",
        "Report them without endorsing them.",
        "Please tell me what people believe about the place you come from. What is said about it?", "neutral"),
    ],
  },

  {
    id: "b2-he-is-thought-to-be",
    topic: "reporting about a specific person",
    objectives: [
      "Report a belief with the person as the subject.",
      "Choose between the impersonal and personal patterns.",
    ],
    goal: "Report what is believed about a particular person.",
    target: "personal reporting with is thought to be",
    correction: "Rebuild the sentence with the person as subject and let the learner repeat it.",
    summary: "You learned to report beliefs with the person as the subject of the sentence.",
    minutes: 8,
    points: [
      {
        form: "he is thought",
        claims: [
          "The person becomes the subject and 'to be' follows: he is thought to be.",
          "This says the same as 'it is thought that he is', in fewer words.",
        ],
        ex: ["He is thought to be in his sixties.", "The painting is thought to be genuine."],
      },
      {
        form: "she is said",
        claims: [
          "'Is said to' and 'is believed to' work the same way.",
          "For an earlier action, use 'to have' plus the past participle: is said to have left.",
        ],
        ex: ["She is said to speak five languages.", "He is said to have left the country."],
      },
      {
        form: "they are believed",
        claims: [
          "The verb agrees with the person, not with 'it': they are believed.",
          "This pattern is very common in news reports about named people.",
        ],
        ex: ["They are believed to be safe.", "The company is believed to be expanding."],
      },
    ],
    ex: [],
    drills: [
      // p1 — he is thought to be
      fc("p1", "He is thought ___ in his sixties.", ["to be", "being", "that is"]),
      arr("p1", "He is thought to be in Spain.", ["being"]),
      err("p1", "He is think to be the owner.", "think", "thought"),
      // p2 — is said to / to have + V3
      fc("p2", "He is said to have ___ the country last year.", ["left", "leave", "leaving"]),
      sit("p2", "People say a famous writer lived in your street long ago, but nobody is sure. You tell a visitor. What do you say?", [
        "She is said to have lived here.",
        "She is said to live here.",
        "She is said to lived here.",
      ]),
      lc("p2", "She is said to speak five languages.", [
        "She has visited five countries.",
        "She is learning to speak two languages.",
      ]),
      // p3 — they are believed
      fc("p3", "The climbers ___ believed to be safe.", ["are", "is", "be"]),
      spk("p3", "They are believed to be safe."),
      chat("p3", ["Is there any news about the missing sailors?", null], [
        "Yes, they are believed to be alive.",
        "Yes, they believe to be alive.",
        "Yes, they are believed being alive.",
      ]),
      // karışık
      sit("mix", "A news report says two things about a company boss: people think he is in France now, and people say he sold his shares last month. You repeat both. What do you say?", [
        "He is thought to be in France, and he is said to have sold his shares.",
        "He is thought to be in France, and he is said to sell his shares.",
        "He is thought to being in France, and he is said to have sold his shares.",
      ]),
      la("mix", "They are said to have sold the house.", ["sell"]),
    ],
    success: "The learner uses the personal reporting pattern correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The painting is thought to be genuine.",
        "The painting is thought that it is genuine.",
        "The painting thinks to be genuine.",
      ], 0),
      qfill("The company is ___ to be expanding. (believe)", ["believed"]),
      qmcq("Which sentence is about an earlier action?", [
        "She is believed to have moved abroad.",
        "She is believed to move abroad.",
        "She believes she moved abroad.",
      ], 0),
    ],
    scenes: [
      sc("Marguerite", "a friend who follows the news", "to discuss a story you both half-know",
        "A story is in the news and neither of you has the facts.",
        "Report what is believed.",
        "Nobody knows where the missing director is. What do the reports say about him?", "curious"),
      sc("Hendrik", "a colleague preparing a briefing", "to summarise what is known about a person",
        "A briefing needs careful wording about an individual.",
        "Report the beliefs precisely.",
        "We need to word this carefully. What can we say about where the director is now?", "precise"),
      sc("Ines", "a guide describing a historical figure", "to describe someone whose life is uncertain",
        "A guide is talking about a figure with a disputed biography.",
        "Report the claims with the person as subject.",
        "Very little about this old king is certain. What is believed about him?", "measured"),
      sc("Mrs. Osei", "your teacher", "to practise personal reporting",
        "The class is reporting on well-known figures.",
        "Use the personal pattern.",
        "Tell us about someone well known. What is said about them?", "encouraging"),
      sc("Mr. Lindberg", "the examiner", "to check the personal pattern",
        "The examiner asks about a public figure.",
        "Report with the person as subject.",
        "Please describe a famous person from your country. What are they believed to have done?", "neutral"),
    ],
  },

  {
    id: "b2-she-denied-taking-it",
    topic: "reporting verbs followed by an -ing word",
    objectives: [
      "Use deny, admit and suggest with an -ing form.",
      "Report what someone said without quoting them.",
    ],
    goal: "Report what people said in a dispute, using precise reporting verbs.",
    target: "reporting verbs plus -ing",
    correction: "Repeat the reporting verb with the -ing form and let the learner report again.",
    summary: "You learned to report speech with deny, admit and suggest plus an -ing word.",
    minutes: 8,
    points: [
      {
        form: "denied taking",
        claims: [
          "'Deny' is followed by an -ing form, not by 'to'.",
          "'She denied taking it' reports a denial without quoting the words.",
        ],
        ex: ["She denied taking the money.", "He denied knowing anything about it."],
      },
      {
        form: "admitted knowing",
        claims: [
          "'Admit' also takes an -ing form, or 'that' plus a clause.",
          "Both are correct: admitted knowing, or admitted that he knew.",
        ],
        ex: ["He admitted knowing about the problem.", "She admitted making a mistake."],
      },
      {
        form: "suggested waiting",
        claims: [
          "When 'suggest' is followed directly by another verb, use an -ing form or a 'that' clause, not a to-infinitive.",
          "Say 'suggested waiting' or 'suggested that we wait', not 'suggested to wait'.",
        ],
        ex: ["He suggested waiting until Monday.", "She suggested that we wait."],
      },
    ],
    ex: [],
    drills: [
      // p1 — deny + -ing
      fc("p1", "She denied ___ the money.", ["taking", "to take", "take"]),
      err("p1", "He denied know anything about it.", "know", "knowing"),
      sit("p1", "A manager asked a worker if he broke the printer. He said, 'No, I didn't break it.' You report this. What do you say?", [
        "He denied breaking it.",
        "He denied to break it.",
        "He denied break it.",
      ]),
      // p2 — admit + -ing / that
      fc("p2", "He admitted ___ about the problem.", ["knowing", "to know", "know"]),
      chat("p2", ["Did Tom say anything about the broken window?", null], [
        "Yes, he admitted breaking it.",
        "Yes, he admitted to break it.",
        "Yes, he admitted break it.",
      ]),
      lc("p2", "He admitted that he knew.", [
        "He said that he didn't know.",
        "He asked if they knew.",
      ]),
      // p3 — suggest + -ing / that
      fc("p3", "He suggested ___ until Monday.", ["waiting", "to wait", "wait"]),
      err("p3", "She suggested leave before the rain.", "leave", "leaving"),
      spk("p3", "He suggested waiting until Monday."),
      // karışık
      sit("mix", "In a meeting, Anna said, 'I didn't send the email.' Ben said, 'Yes, I forgot the deadline.' You report both. What do you say?", [
        "Anna denied sending the email, and Ben admitted forgetting the deadline.",
        "Anna denied to send the email, and Ben admitted forgetting the deadline.",
        "Anna denied sending the email, and Ben admitted to forget the deadline.",
      ]),
      la("mix", "She denied taking it but suggested asking him.", ["take"]),
    ],
    success: "The learner reports speech with at least two of these verbs correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "She denied knowing anything about it.",
        "She denied to know anything about it.",
        "She denied know anything about it.",
      ], 0),
      qfill("He admitted ___ a mistake in the report. (make)", ["making"]),
      qmcq("Which sentence is correct?", [
        "She suggested that we wait.",
        "She suggested us to wait.",
        "She suggested we waiting.",
      ], 0),
    ],
    scenes: [
      sc("Konstantin", "a friend who heard a different version", "to piece together what was actually said",
        "Two friends heard different accounts of an argument.",
        "Report what each person said.",
        "I heard a completely different version of the argument. What did each of them say?", "puzzled"),
      sc("Adaeze", "your manager investigating a problem", "to establish what people said",
        "A workplace problem needs a factual account.",
        "Report the statements precisely.",
        "I need the account, not opinions. What did each person say about the missing money?", "formal"),
      sc("Lasse", "a fellow guest who witnessed a dispute", "to compare what you both heard",
        "A dispute at a hotel was overheard by several people.",
        "Report what was said.",
        "You were closer to the argument than me. What did each of them say, and what did the manager suggest doing?", "discreet"),
      sc("Ms. Ekwueme", "your teacher", "to practise reporting verbs",
        "The class is reporting a disagreement.",
        "Use the correct form after each verb.",
        "Someone denied something and someone admitted something. How would you report that?", "encouraging"),
      sc("Mr. Nyberg", "the examiner", "to check reporting verbs",
        "The examiner asks about a disagreement.",
        "Report it with precise verbs.",
        "Please describe a disagreement you saw. What did each person say, and what did someone suggest doing?", "neutral"),
    ],
  },

  {
    id: "b2-he-refused-to-comment",
    topic: "reporting verbs followed by to",
    objectives: [
      "Use refuse, agree and promise with to plus a verb.",
      "Choose the reporting verb that carries the right meaning.",
    ],
    goal: "Report commitments and refusals precisely.",
    target: "reporting verbs plus to",
    correction: "Repeat the verb with 'to' plus the base verb and let the learner report again.",
    summary: "You learned to report commitments and refusals with refuse, agree and promise.",
    minutes: 8,
    points: [
      {
        form: "refused to",
        claims: [
          "'Refuse' is followed by 'to' plus the base verb.",
          "'Refused to comment' is the standard way of reporting a declined question.",
        ],
        ex: ["He refused to comment.", "She refused to sign anything."],
      },
      {
        form: "agreed to",
        claims: [
          "'Agree' takes 'to' plus a verb, or 'that' plus a clause.",
          "'Agreed to meet' reports a commitment; 'agreed that' reports an opinion.",
        ],
        ex: ["They agreed to meet on Friday.", "We agreed that it was too risky."],
      },
      {
        form: "promised to send",
        claims: [
          "'Promise', 'offer' and 'threaten' all take 'to' plus the base verb.",
          "The choice of verb carries the meaning, so no extra explanation is needed.",
        ],
        ex: ["He promised to send it today.", "She offered to help."],
      },
    ],
    ex: [],
    drills: [
      // p1 — refuse to
      fc("p1", "He refused ___ comment.", ["to", "for", "on"]),
      sit("p1", "A reporter asked the minister a question. The minister said, 'No comment.' You report this. What do you say?", [
        "He refused to comment.",
        "He refused commenting.",
        "He refused to commenting.",
      ]),
      err("p1", "She refused to signed the contract.", "signed", "sign"),
      // p2 — agree to / agree that
      fc("p2", "They agreed ___ meet on Friday.", ["to", "for", "with"]),
      chat("p2", ["What happened in the meeting with the landlord?", null], [
        "He agreed to fix the heating.",
        "He agreed fixing the heating.",
        "He agreed for fix the heating.",
      ]),
      lc("p2", "We agreed that the price was too high.", [
        "We agreed to pay a higher price.",
        "They said the plan was too slow.",
      ]),
      // p3 — promise / offer / threaten to
      fc("p3", "She offered ___ me with the move.", ["to help", "helping", "help"]),
      spk("p3", "He promised to send it today."),
      sit("p3", "Your neighbour said, 'I'll call the police if you play loud music again.' You tell a friend. What do you say?", [
        "He threatened to call the police.",
        "He threatened calling the police.",
        "He threatened to calling the police.",
      ]),
      // karışık
      chat("mix", ["So what did the company say about your refund?", null], [
        "They refused to pay, but they agreed to look at it again.",
        "They refused paying, but they agreed to look at it again.",
        "They refused to pay, but they agreed looking at it again.",
      ]),
      lc("mix", "He refused to comment but promised to call later.", [
        "He refused to call but promised to comment.",
        "He wanted to comment and called later.",
      ]),
    ],
    success: "The learner reports at least two commitments or refusals correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "She refused to sign anything.",
        "She refused signing anything.",
        "She refused sign anything.",
      ], 0),
      qfill("He ___ to send the file today. (promise)", ["promised"]),
      qmcq("Which sentence reports an opinion rather than a commitment?", [
        "We agreed that it was too risky.",
        "We agreed to meet at six.",
        "We promised to be there.",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend waiting on an answer", "to find out what was decided",
        "A decision was made in a meeting your friend missed.",
        "Report who agreed and who refused.",
        "So what came out of the meeting? Who promised to do what?", "impatient"),
      sc("Owen", "a colleague writing up minutes", "to record commitments accurately",
        "Meeting notes must record who committed to what.",
        "Report the commitments precisely.",
        "I need the exact details for the minutes. Who agreed to what, and who refused?", "precise"),
      sc("Fatima", "a fellow traveller after a dispute with staff", "to explain how the complaint was resolved",
        "A complaint at a hotel ended in a partial agreement.",
        "Report the refusals and agreements.",
        "You argued with the hotel staff for ages. What did they say they would do?", "curious"),
      sc("Mr. Tremblay", "your teacher", "to practise reporting commitments",
        "The class is reporting negotiations.",
        "Report with the correct verbs.",
        "Someone agreed to something and someone refused. How would you report both?", "encouraging"),
      sc("Ms. Petrenko", "the examiner", "to check reporting verbs",
        "The examiner asks about a negotiation.",
        "Report commitments and refusals precisely.",
        "Please describe a discussion where people disagreed. What did each person agree or refuse to do?", "neutral"),
    ],
  },

  {
    id: "b2-sources-and-hedging",
    topic: "quoting a source without committing to it",
    objectives: [
      "Attribute information to a source.",
      "Signal that you are not vouching for it.",
    ],
    goal: "Pass on information while making clear where it came from.",
    target: "attributing information to a source",
    correction: "Model the attribution and let the learner pass the claim on again.",
    summary: "You learned to attribute information to a source without vouching for it.",
    minutes: 7,
    points: [
      {
        form: "according to",
        claims: [
          "'According to' names the source and is not followed by 'me' in standard use.",
          "Say 'in my opinion' for your own view, not 'according to me'.",
        ],
        ex: ["According to the report, sales are up.", "According to her, nothing was agreed."],
      },
      {
        form: "sources say",
        claims: [
          "'Sources say' attributes a claim to people who are not named.",
          "It is a news convention, so it sounds formal in everyday conversation.",
        ],
        ex: ["Sources say a decision is close.", "Sources say the meeting was tense."],
      },
      {
        form: "it has emerged",
        claims: [
          "'It has emerged that' introduces information that has just become known.",
          "The phrase presents the information as newly discovered or newly made public.",
        ],
        ex: ["It has emerged that the deal collapsed.", "It has emerged that nobody was told."],
      },
    ],
    ex: [],
    drills: [
      // p1 — according to
      fc("p1", "___ to the report, sales are up.", ["According", "Accorded", "Accord"]),
      sit("p1", "You want to give your own view about a new law. What do you say?", [
        "In my opinion, it's a good law.",
        "According to me, it's a good law.",
        "According me, it's a good law.",
      ]),
      err("p1", "According for her, nothing was agreed.", "for", "to"),
      // p2 — sources say
      chat("p2", ["Is there any news about the merger?", null], [
        "Sources say a decision is close.",
        "Sources says a decision is close.",
        "Source say a decision is close.",
      ]),
      lc("p2", "Sources say the meeting was tense.", [
        "Sources say the meeting was cancelled.",
        "Some people enjoyed the meeting.",
      ]),
      fc("p2", "Sources ___ the minister will resign.", ["say", "says", "saying"]),
      // p3 — it has emerged that
      fc("p3", "It has ___ that the deal collapsed.", ["emerged", "emerge", "emerging"]),
      sit("p3", "A newspaper has just found out that the mayor knew about the problem months ago. You report this new information. What do you say?", [
        "It has emerged that the mayor knew months ago.",
        "It has emerged the mayor knows months ago.",
        "It is emerged that the mayor knew months ago.",
      ]),
      spk("p3", "It has emerged that the plan was never approved."),
      // karışık
      sit("mix", "A news article names the police as one source, and also quotes people who will not give their names. You sum it up. What do you say?", [
        "According to the police, nobody was hurt, but sources say it was close.",
        "According the police, nobody was hurt, but sources say it was close.",
        "According to the police, nobody was hurt, but sources says it was close.",
      ]),
      la("mix", "According to sources, it has emerged that nobody knew.", ["emerge"]),
    ],
    success: "The learner attributes at least two claims to a source.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "According to her, nothing was agreed.",
        "According to me, nothing was agreed.",
        "According her, nothing was agreed.",
      ], 0),
      qfill("It has ___ that nobody was told. (emerge)", ["emerged"]),
      qmcq("Which phrase introduces newly known information?", [
        "It has emerged that",
        "It is always the case that",
        "It used to be that",
      ], 0),
    ],
    scenes: [
      sc("Gustavo", "a neighbour who heard something", "to compare what you have both heard",
        "Local news is circulating and neither of you is sure.",
        "Attribute what you have heard.",
        "Nobody can tell me anything solid about the factory. What have you heard, and from whom?", "uncertain"),
      sc("Priyanka", "a colleague preparing an update", "to word an update carefully",
        "An internal update must not overstate what is known.",
        "Attribute the claims carefully.",
        "We cannot state this as fact. How should we word it in the update?", "cautious"),
      sc("Bram", "a fellow traveller repeating local news", "to share news of a disruption",
        "Travellers are sharing unconfirmed news about a strike.",
        "Attribute what you have heard.",
        "Everyone at the station is talking about a train strike. What have you heard?", "concerned"),
      sc("Mrs. Farrow", "your teacher", "to practise attribution",
        "The class is passing on news carefully.",
        "Attribute the claim clearly.",
        "How would you pass on news that you cannot confirm?", "encouraging"),
      sc("Mr. Ibrahim", "the examiner", "to check attribution language",
        "The examiner asks about a news story.",
        "Attribute and hedge appropriately.",
        "Please tell me about a news story you have heard. Where did the information come from?", "neutral"),
    ],
  },

  {
    id: "b2-rumour-has-it",
    topic: "passing on unverified news",
    objectives: [
      "Flag information clearly as a rumour.",
      "Distance yourself from what you are repeating.",
    ],
    goal: "Repeat something you have heard while flagging it as unconfirmed.",
    target: "marking information as rumour",
    correction: "Model the rumour marker and let the learner repeat the claim with it.",
    summary: "You learned to pass on rumours while flagging them as unconfirmed.",
    minutes: 7,
    points: [
      {
        form: "rumour has it",
        claims: [
          "'Rumour has it that' is a fixed phrase and the words inside do not change.",
          "It marks the claim as unverified before you say it.",
        ],
        ex: ["Rumour has it they are moving offices.", "Rumour has it the decision is already made."],
      },
      {
        form: "word is that",
        claims: [
          "'Word is that' is the informal equivalent and is common in speech.",
          "'Apparently' at the start of a sentence does the same job in one word.",
        ],
        ex: ["Word is that nobody was consulted.", "Apparently the deal fell through."],
      },
      {
        form: "so I'm told",
        claims: [
          "'So I'm told' at the end distances you from the claim you have just made.",
          "'Don't quote me on this' does the same thing before the claim.",
        ],
        ex: ["They are hiring again, so I'm told.", "It was her idea, so I'm told."],
      },
    ],
    ex: [],
    drills: [
      // p1 — rumour has it
      fc("p1", "Rumour ___ it they are moving offices.", ["has", "have", "gives"]),
      sit("p1", "People at work say the boss is leaving, but nothing is official. You tell a colleague. What do you say?", [
        "Rumour has it the boss is leaving.",
        "Rumours has it the boss is leaving.",
        "The rumour has it the boss is leaving.",
      ]),
      lc("p1", "Rumour has it they are hiring again.", [
        "Rumour has it they are moving offices.",
        "Remember, they open again at nine.",
      ]),
      // p2 — word is that / apparently
      fc("p2", "Word is ___ the shop is closing.", ["that", "what", "it"]),
      chat("p2", ["Why is the cafe so empty today?", null], [
        "Apparently the owner sold it.",
        "Apparent the owner sold it.",
        "Apparently the owner sell it.",
      ]),
      spk("p2", "Word is that nobody was told."),
      // p3 — so I'm told
      sit("p3", "A friend asks if the new cafe is good. You have not been there, but people say it is. You answer without vouching for it. What do you say?", [
        "It's very good, so I'm told.",
        "It's very good, so I told.",
        "It's very good, so I'm telling.",
      ]),
      fc("p3", "They are hiring again, so I'm ___.", ["told", "telling", "tell"]),
      chat("p3", ["Is it true the manager is leaving?", null], [
        "Don't quote me on this, but I think so.",
        "Don't quote me in this, but I think so.",
        "Don't quoting me on this, but I think so.",
      ]),
      // karışık
      sit("mix", "You heard two rumours: the company is moving, and the boss is unhappy. You share both, but you keep your distance from them. What do you say?", [
        "Rumour has it we're moving, and the boss is unhappy, so I'm told.",
        "Rumour have it we're moving, and the boss is unhappy, so I'm told.",
        "Rumour has it we're moving, and the boss is unhappy, so I told.",
      ]),
      la("mix", "Apparently they're hiring again, so I'm told.", ["telling"]),
    ],
    success: "The learner passes on a claim while clearly marking it as unconfirmed.",
    quiz: [
      qmcq("Which sentence flags a rumour?", [
        "Rumour has it the decision is already made.",
        "The decision is already made.",
        "I made the decision already.",
      ], 0),
      qfill("___ is that nobody was consulted. (word)", ["Word"]),
      qmcq("Which phrase goes at the END of a claim?", ["so I'm told", "rumour has it", "apparently"], 0),
    ],
    scenes: [
      sc("Ottoline", "a neighbour with local gossip", "to trade unconfirmed news",
        "Local rumours are circulating about a new development.",
        "Pass one on while flagging it.",
        "There's talk about the old factory site again. What have you heard?", "gossipy"),
      sc("Sebastian", "a colleague after a closed meeting", "to share what leaked from the meeting",
        "Something was discussed behind closed doors.",
        "Pass it on carefully.",
        "Nothing is official yet, but people are talking. What's the word in your team?", "guarded"),
      sc("Noemi", "another guest at a hostel", "to share news about a local event",
        "Travellers are trading unconfirmed news.",
        "Flag what you pass on.",
        "Someone said the festival is cancelled. What have you heard about it?", "doubtful"),
      sc("Mr. Halvorsen", "your teacher", "to practise flagging rumours",
        "The class is practising careful repetition of claims.",
        "Flag the claim clearly.",
        "How would you repeat something you heard without vouching for it?", "encouraging"),
      sc("Ms. Cardoso", "the examiner", "to check hedging language",
        "The examiner asks about unconfirmed news.",
        "Flag it clearly as a rumour.",
        "Please tell me something you have heard but cannot confirm. How would you say it?", "neutral"),
    ],
  },

  {
    id: "b2-the-story-behind-the-headline",
    topic: "judging how far a story can be trusted",
    objectives: [
      "Separate what is established from what is claimed.",
      "Question the source of a story.",
    ],
    goal: "Discuss a news story and judge how much of it to believe.",
    target: "evaluating a news story",
    correction: "Model the sceptical question and let the learner apply it to their own story.",
    summary: "You practised separating established facts from claims in a news story.",
    minutes: 7,
    points: [
      {
        form: "what's actually happened",
        claims: [
          "'What's actually happened is...' separates the established facts from the framing.",
          "'Actually' here marks a correction of an impression, not surprise.",
        ],
        ex: ["What's actually happened is less dramatic than the headline suggests.", "What's actually happened is still unclear."],
      },
      {
        form: "I'd take that with",
        claims: [
          "'I'd take that with a pinch of salt' expresses doubt without calling anyone a liar.",
          "The phrase is fixed and usually shortened to 'a pinch of salt'.",
        ],
        ex: ["I'd take that with a pinch of salt.", "I'd take those numbers with a pinch of salt."],
      },
      {
        form: "who's saying this",
        claims: [
          "'Who's saying this?' questions the source rather than the claim.",
          "Asking about the source is often more useful than arguing about the content.",
        ],
        ex: ["Who's saying this, though?", "Who's actually reporting it?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — what's actually happened
      chat("p1", ["The headline says the whole company is closing!", null], [
        "What's actually happened is that one office is closing.",
        "What's actually happen is that one office is closing.",
        "What actually's happened is that one office is closing.",
      ]),
      fc("p1", "What's actually ___ is less dramatic than the headline.", ["happened", "happen", "happens"]),
      spk("p1", "What's actually happened is less dramatic."),
      // p2 — I'd take that with a pinch of salt
      sit("p2", "A friend says a website claims coffee cures every illness. You doubt it, but you don't want to call anyone a liar. What do you say?", [
        "I'd take that with a pinch of salt.",
        "I'd take that with a pinch of sugar.",
        "I'd take that for a pinch of salt.",
      ]),
      fc("p2", "I'd take those numbers with a pinch of ___.", ["salt", "pepper", "sugar"]),
      lc("p2", "I'd take that with a pinch of salt.", [
        "I'd take that with a cup of tea.",
        "I'll make that with a bit of salt.",
      ]),
      // p3 — who's saying this
      chat("p3", ["Apparently the bank will close all its branches.", null], [
        "Really? Who's saying this, though?",
        "Really? Who's say this, though?",
        "Really? Whose saying this, though?",
      ]),
      sit("p3", "A colleague shares a shocking story from social media. You want to question the source, not the story. What do you ask?", [
        "Who's saying this?",
        "What's saying this?",
        "Who's say this?",
      ]),
      la("p3", "Who's saying this, and where did it come from?", ["whose"]),
      // karışık
      chat("mix", ["Look! It says here the river is poisoned!", null], [
        "Who's saying this? What's actually happened is a small leak.",
        "Who's saying this? What's actually happen is a small leak.",
        "Whose saying this? What's actually happened is a small leak.",
      ]),
      sit("mix", "A headline says a famous actor has lost all his money. You doubt it and want to know the source. What do you say?", [
        "I'd take that with a pinch of salt. Who's saying this?",
        "I'd take that with a pinch of salt. Who's says this?",
        "I'd take that with a pinch of salts. Who's saying this?",
      ]),
    ],
    success: "The learner separates fact from claim and questions the source.",
    quiz: [
      qmcq("Which sentence expresses doubt politely?", [
        "I'd take that with a pinch of salt.",
        "That is a complete lie.",
        "They are lying to everyone.",
      ], 0),
      qfill("___ actually happened is still unclear. (what is)", ["What's"]),
      qmcq("Which question is about the source?", [
        "Who's actually reporting it?",
        "When did it happen?",
        "Where did it happen?",
      ], 0),
    ],
    scenes: [
      sc("Teodor", "a friend who believes the headline", "to test how much of the story is solid",
        "A friend is repeating a dramatic headline as fact.",
        "Separate the facts from the framing.",
        "This headline says the whole town will be under water in ten years! What do you make of it?", "excited"),
      sc("Amara", "a colleague preparing a summary", "to decide what can be stated as fact",
        "A summary must not repeat unverified claims.",
        "Judge what can be stated.",
        "We cannot repeat this story if it isn't solid. What do you make of it?", "careful"),
      sc("Felipe", "a fellow traveller reading local news", "to work out what a local story really says",
        "A local story is being widely shared.",
        "Judge how far to trust it.",
        "Everyone here is talking about a shark in the harbour. What do you think really happened?", "sceptical"),
      sc("Ms. Sandoval", "your teacher", "to practise critical discussion",
        "The class is discussing how to read news critically.",
        "Separate fact from claim.",
        "A post says chocolate makes you live longer. How would you react to a claim like that?", "encouraging"),
      sc("Mr. Kaufmann", "the examiner", "to check critical discussion",
        "The examiner asks about media reliability.",
        "Discuss a story critically.",
        "Please tell me about a news story you doubted. What made you doubt it?", "neutral"),
    ],
  },

  // --- Ünite 4 · Getting Things Done by Others -------------------------------
  {
    id: "b2-i-had-my-hair-cut",
    topic: "arranging for someone else to do something",
    objectives: [
      "Use have something done for a service you arrange.",
      "Put the past participle after the object.",
    ],
    goal: "Talk about work you arranged rather than did yourself.",
    target: "have something done",
    correction: "Rebuild the sentence with the object before the past participle and let the learner repeat it.",
    summary: "You learned to say that someone else did a job for you, using have something done.",
    minutes: 8,
    points: [
      {
        form: "I had my hair cut",
        claims: [
          "The order is: have + the thing + the past participle.",
          "Strictly, 'I cut my hair' says you did it yourself; 'I had my hair cut' makes it clear someone else did it.",
        ],
        ex: ["I had my hair cut yesterday.", "We had the kitchen painted last year."],
      },
      {
        form: "have it cleaned",
        claims: [
          "The pattern works in every tense: I have it cleaned, I had it cleaned, I'll have it cleaned.",
          "The person doing the work is usually not mentioned.",
          "In everyday speech 'get' can replace 'have': I got it done.",
        ],
        ex: ["I'm having the car serviced on Friday.", "We'll have it cleaned before we leave.", "I got it done last week."],
      },
      {
        form: "who did it",
        claims: [
          "Add 'by' plus the person only when it matters who did the work.",
          "Most of the time the point is the result, not the worker.",
        ],
        ex: ["I had it repaired by the shop that sold it.", "She had the photos framed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — have + nesne + V3
      fc("p1", "I had my hair ___ yesterday.", ["cut", "cutting", "to cut"]),
      lc("p1", "We had the kitchen painted last year.", [
        "We painted the kitchen ourselves last year.",
        "We're having the kitchen painted next year.",
      ]),
      sit("p1", "Last week a painter painted your living room. You did not do it yourself. What do you say?", [
        "I had my living room painted.",
        "I painted my living room.",
        "I had painted my living room.",
      ]),
      // p2 — her zamanda (+ get)
      fc("p2", "I'm ___ the car serviced on Friday.", ["having", "have", "had"]),
      err("p2", "We're having the windows wash tomorrow.", "wash", "washed"),
      lc("p2", "I got it done last week.", [
        "I did it all last week.",
        "I'll get it done next week.",
      ]),
      spk("p2", "We'll have it cleaned before we leave."),
      // p3 — by + kişi
      fc("p3", "I had it repaired ___ the shop that sold it.", ["by", "from", "with"]),
      chat("p3", ["Your photos look amazing. Did you frame them yourself?", null], [
        "No, I had them framed by a friend.",
        "No, I had them frame by a friend.",
        "No, I had framed them by a friend.",
      ]),
      sit("p3", "A famous designer made your wedding dress, and you want to mention who made it. What do you say?", [
        "I had it made by a famous designer.",
        "I had it made from a famous designer.",
        "I had a famous designer made it.",
      ]),
      // karışık
      sit("mix", "Tomorrow a mechanic will repair your car, and yesterday a hairdresser cut your hair. You tell a friend. What do you say?", [
        "I'm having my car repaired tomorrow, and I had my hair cut yesterday.",
        "I'm having my car repair tomorrow, and I had my hair cut yesterday.",
        "I'm repairing my car tomorrow, and I had my hair cut yesterday.",
      ]),
      la("mix", "We had the roof repaired by a local firm.", ["repair"]),
    ],
    success: "The learner describes arranged work with the object before the past participle at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "She had the photos framed.",
        "She had framed the photos by the shop.",
        "She had the photos frame.",
      ], 0),
      qfill("We are having the roof ___ next month. (repair)", ["repaired"]),
      qmcq("Which sentence means you did it yourself?", [
        "I cut my hair.",
        "I had my hair cut.",
        "I got my hair cut.",
      ], 0),
    ],
    scenes: [
      sc("Rosa", "a neighbour who noticed the work", "to find out who did the work and whether they were good",
        "Work has clearly been done on your home.",
        "Explain what you had done.",
        "Your flat looks completely different! What did you have done?", "impressed"),
      sc("Bastien", "a colleague moving into a new flat", "to get recommendations for work",
        "A colleague needs several jobs done.",
        "Describe what you had done and by whom.",
        "I have a long list of jobs for my new flat. What did you get done in yours?", "overwhelmed"),
      sc("Aditi", "a hotel receptionist", "to arrange a service for you",
        "You need something cleaned or repaired while you stay.",
        "Ask to have the work done.",
        "Good morning. We offer laundry, cleaning and car services. What would you like done today?", "helpful"),
      sc("Mr. Hassan", "your teacher", "to practise the causative",
        "The class is describing work they arranged.",
        "Describe arranged work correctly.",
        "What is something you had done recently instead of doing it yourself?", "encouraging"),
      sc("Mrs. Clark", "the examiner", "to check the causative",
        "The examiner asks about services you use.",
        "Describe arranged work accurately.",
        "Please tell me about jobs you pay other people to do. What do you have done regularly?", "neutral"),
    ],
  },

  {
    id: "b2-we-got-the-roof-fixed",
    topic: "the informal alternative to have something done",
    objectives: [
      "Use get something done in informal speech.",
      "Notice when get suggests effort or difficulty.",
    ],
    goal: "Describe work you organised, in everyday informal language.",
    target: "get something done",
    correction: "Model the sentence with 'get' and let the learner rebuild their own.",
    summary: "You learned to use get something done, and when it sounds different from have.",
    minutes: 8,
    points: [
      {
        form: "we got it fixed",
        claims: [
          "'Get something done' follows the same order as 'have something done'.",
          "It is more informal and very common in speech.",
        ],
        ex: ["We got the roof fixed in the end.", "I got my phone repaired for almost nothing.", "We got it fixed the same day."],
      },
      {
        form: "getting it repaired",
        claims: [
          "'Get' often suggests that arranging the work took effort.",
          "'We finally got it fixed' carries relief that 'we had it fixed' does not.",
        ],
        ex: ["We're getting it repaired next week.", "It took months to get it sorted."],
      },
      {
        form: "had it replaced",
        claims: [
          "'Have' sounds slightly more neutral and is preferred in formal writing.",
          "In most everyday sentences either verb is acceptable.",
        ],
        ex: ["We had it replaced under guarantee.", "They had the whole system checked."],
      },
    ],
    ex: [],
    drills: [
      // p1 — get + nesne + V3
      fc("p1", "We got the roof ___ in the end.", ["fixed", "fix", "fixing"]),
      arr("p1", "I got my phone repaired.", ["repair"]),
      err("p1", "We got the car wash before the trip.", "wash", "washed"),
      // p2 — get = uğraş, rahatlama
      sit("p2", "Your washing machine was broken for months. You called many times, and at last someone repaired it. You feel relieved. What do you say?", [
        "We finally got it fixed!",
        "We finally got fixed it!",
        "We finally got it fix!",
      ]),
      fc("p2", "It took months to ___ it sorted.", ["get", "make", "do"]),
      lc("p2", "We're getting it repaired next week.", [
        "We repaired it ourselves last week.",
        "We're getting a new one next week.",
      ]),
      // p3 — had it replaced (nötr)
      chat("p3", ["What happened to your broken laptop screen?", null], [
        "We had it replaced under guarantee.",
        "We had it replace under guarantee.",
        "We had it replacing under guarantee.",
      ]),
      fc("p3", "We had the boiler ___ by an engineer.", ["serviced", "service", "servicing"]),
      spk("p3", "They had the whole system checked."),
      // karışık
      chat("mix", ["Is your kitchen finished yet?", null], [
        "Yes, we finally got it done, and we're having the floor replaced next.",
        "Yes, we finally got it done, and we're having the floor replace next.",
        "Yes, we finally got done it, and we're having the floor replaced next.",
      ]),
      lc("mix", "We finally got it fixed, and we had the walls painted.", [
        "We fixed it ourselves, and we painted the walls.",
        "We'll get it fixed when the walls are painted.",
      ]),
    ],
    success: "The learner describes arranged work using get or have correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I got my phone repaired for almost nothing.",
        "I got repaired my phone for almost nothing.",
        "I got my phone repair for almost nothing.",
      ], 0),
      qfill("We had it ___ under guarantee. (replace)", ["replaced"]),
      qmcq("Which sentence is more formal?", [
        "We had the system checked.",
        "We got the system checked.",
        "We finally got it sorted.",
      ], 0),
    ],
    scenes: [
      sc("Emeka", "a neighbour with the same problem", "to find out who you used and what it cost",
        "Both flats have the same recurring problem.",
        "Describe how you got it fixed.",
        "My roof has leaked twice this month. How did you get yours fixed?", "fed up"),
      sc("Chiara", "a colleague dealing with office repairs", "to get the repair moving",
        "An office repair has dragged on for weeks.",
        "Describe how similar work was arranged.",
        "Three weeks and the office heating still isn't fixed. How did you get yours done?", "impatient"),
      sc("Ferran", "your host during a stay", "to arrange a repair in the flat",
        "Something has broken in the flat where you are staying.",
        "Explain what needs doing.",
        "You said your bike broke last week. How did you get it repaired?", "responsive"),
      sc("Mrs. Iversen", "your teacher", "to practise get something done",
        "The class is describing repairs and services.",
        "Use get and have correctly.",
        "Tell us about something that was hard to get fixed. How did you get it done in the end?", "encouraging"),
      sc("Mr. Sasaki", "the examiner", "to check the causative with get",
        "The examiner asks about a difficult repair.",
        "Describe it accurately.",
        "Please describe something you had repaired recently. How did you get it done?", "neutral"),
    ],
  },

  {
    id: "b2-i-need-this-sorted",
    topic: "stating the result you need",
    objectives: [
      "Use need and want with a finished result.",
      "State a requirement without naming who will do it.",
    ],
    goal: "Say clearly what you need done, without saying who should do it.",
    target: "need and want plus a past participle",
    correction: "Model the short result-focused sentence and let the learner restate their need.",
    summary: "You learned to state what you need done in a short, result-focused way.",
    minutes: 8,
    points: [
      {
        form: "I need this",
        claims: [
          "'I need this sorted' names the result you want, not the work involved.",
          "The pattern is: need + the thing + the past participle.",
        ],
        ex: ["I need this sorted by Friday.", "We need the report finished today."],
      },
      {
        form: "I want it done",
        claims: [
          "'Want' works the same way but sounds more demanding than 'need'.",
          "'I'd like it done' is the polite version of the same request.",
        ],
        ex: ["I want it done properly this time.", "I'd like it done before the weekend."],
      },
      {
        form: "we need it fixed",
        claims: [
          "This pattern is common at work because it focuses on the outcome.",
          "Add 'by' plus a time to make the requirement concrete.",
        ],
        ex: ["We need it fixed by Monday.", "They need the figures checked first."],
      },
    ],
    ex: [],
    drills: [
      // p1 — need + nesne + V3
      fc("p1", "I need this ___ by Friday.", ["sorted", "sort", "to sorted"]),
      err("p1", "I need these letters send today.", "send", "sent"),
      sit("p1", "Your boss has a meeting tomorrow, and the slides are not ready. You ask a colleague for help and focus on the result. What do you say?", [
        "I need the slides finished by tomorrow.",
        "I need finished the slides by tomorrow.",
        "I need the slides finish by tomorrow.",
      ]),
      // p2 — want it done / I'd like it done
      fc("p2", "I'd like it ___ before the weekend.", ["done", "do", "doing"]),
      sit("p2", "You are speaking politely to a hotel receptionist. You want your room cleaned before lunch. What do you say?", [
        "I'd like it cleaned before lunch, please.",
        "I want it cleaned before lunch, now.",
        "I'd like cleaned it before lunch, please.",
      ]),
      lc("p2", "I'd like it done by Friday.", [
        "I'd like to do it by Friday.",
        "I'll have a day off on Friday.",
      ]),
      // p3 — need it fixed + by
      chat("p3", ["When do you need the website working again?", null], [
        "We need it fixed by Monday.",
        "We need it fix by Monday.",
        "We need fixed it by Monday.",
      ]),
      spk("p3", "They need the figures checked first."),
      fc("p3", "We need it fixed ___ Monday at the latest.", ["by", "until", "since"]),
      // karışık
      sit("mix", "You manage a project. You say politely what you would like, and then firmly what you need and by when. What do you say?", [
        "I'd like it checked today, and we need it finished by Friday.",
        "I'd like it check today, and we need it finished by Friday.",
        "I'd like it checked today, and we need finished it by Friday.",
      ]),
      lc("mix", "I'd like it checked, but I need it finished by Friday.", [
        "I'd like to check it, but I need to finish by Friday.",
        "I liked it, but I finished it on Friday.",
      ]),
    ],
    success: "The learner states at least two required results with a past participle.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We need the report finished today.",
        "We need finish the report today.",
        "We need the report finish today.",
      ], 0),
      qfill("I need this ___ before the meeting. (check)", ["checked"]),
      qmcq("Which sentence sounds most demanding?", [
        "I want it done properly this time.",
        "I'd like it done properly this time.",
        "Could we have it done properly?",
      ], 0),
    ],
    scenes: [
      sc("Viktor", "a contractor taking your instructions", "to understand exactly what you need",
        "You are briefing someone on several jobs.",
        "State the results you need.",
        "Right, talk me through it. What do you need done in the flat?", "businesslike"),
      sc("Halima", "your team leader delegating work", "to hand over three tasks clearly",
        "Work is being handed over before leave.",
        "State what needs finishing and when.",
        "You're away from Thursday. What do you need finished before then?", "organised"),
      sc("Elodie", "a hotel manager handling your request", "to arrange what you need during your stay",
        "You need several things arranged at short notice.",
        "State your requirements clearly.",
        "You said it was urgent. What exactly do you need done, and by when?", "attentive"),
      sc("Mr. Boateng", "your teacher", "to practise result-focused requests",
        "The class is practising clear requests.",
        "State a required result.",
        "How do you say what you need done without saying who should do it?", "encouraging"),
      sc("Ms. Aaltonen", "the examiner", "to check result-focused language",
        "The examiner asks you to delegate.",
        "State requirements with a deadline.",
        "Imagine you are leaving tomorrow. What would you need finished first?", "neutral"),
    ],
  },

  {
    id: "b2-make-let-help",
    topic: "obliging, allowing and helping",
    objectives: [
      "Use make and let with a base verb and no to.",
      "Use help with or without to.",
    ],
    goal: "Describe who obliged you, allowed you or helped you do something.",
    target: "make, let and help plus a verb",
    correction: "Repeat the sentence without 'to' after make or let and let the learner say it again.",
    summary: "You learned that make and let take a base verb with no to, while help takes either.",
    minutes: 8,
    points: [
      {
        form: "they made me",
        claims: [
          "'Make someone do something' takes the base verb with no 'to'.",
          "In the passive, 'to' comes back: I was made to wait.",
        ],
        ex: ["They made me wait an hour.", "She made us rewrite the whole thing."],
      },
      {
        form: "she let me",
        claims: [
          "'Let someone do something' also takes the base verb with no 'to'.",
          "'Allow' means the same but takes 'to': she allowed me to leave.",
        ],
        ex: ["She let me leave early.", "They let us take photographs."],
      },
      {
        form: "he helped me",
        claims: [
          "'Help' works with or without 'to': he helped me carry it, or to carry it.",
          "The version without 'to' is more common in speech.",
        ],
        ex: ["He helped me carry the boxes.", "She helped me to understand it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — make + yalın fiil; edilgen made to
      fc("p1", "They made me ___ an hour.", ["wait", "to wait", "waiting"]),
      err("p1", "They made me waited outside.", "waited", "wait"),
      sit("p1", "At the airport, the staff forced you to open your bag. You describe it in the passive. What do you say?", [
        "I was made to open my bag.",
        "I was made open my bag.",
        "I was made opening my bag.",
      ]),
      // p2 — let + yalın fiil; allow + to
      fc("p2", "She let me ___ early.", ["leave", "to leave", "leaving"]),
      chat("p2", ["Did your parents let you go to the concert?", null], [
        "Yes, they let me go.",
        "Yes, they let me to go.",
        "Yes, they let me going.",
      ]),
      sit("p2", "Your teacher gave you permission to use a dictionary. You describe it with 'allow'. What do you say?", [
        "She allowed me to use a dictionary.",
        "She allowed me use a dictionary.",
        "She allowed me using a dictionary.",
      ]),
      // p3 — help (+ to)
      arr("p3", "He helped me carry the boxes.", ["carrying"]),
      lc("p3", "She helped me to understand it.", [
        "She asked me to understand it.",
        "She helped me find it.",
      ]),
      spk("p3", "She helped me fix my bike.", ["She helped me to fix my bike."]),
      // karışık
      chat("mix", ["How was your first week at the new job?", null], [
        "They made me work late, but they let me leave early on Friday.",
        "They made me to work late, but they let me leave early on Friday.",
        "They made me work late, but they let me to leave early on Friday.",
      ]),
      lc("mix", "She let me stay and helped me cook dinner.", [
        "She made me stay and cook dinner.",
        "She asked me to stay for dinner.",
      ]),
    ],
    success: "The learner uses make, let and help with the correct verb forms at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "They made us rewrite the whole thing.",
        "They made us to rewrite the whole thing.",
        "They made us rewriting the whole thing.",
      ], 0),
      qfill("I was made ___ wait outside. (to)", ["to"]),
      qmcq("Which sentence is correct?", [
        "She allowed me to leave.",
        "She allowed me leave.",
        "She allowed me leaving.",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "a friend after a frustrating day", "to hear how badly the day went",
        "A day of bureaucracy has gone badly.",
        "Describe who obliged and who helped.",
        "You look exhausted. What did they make you do today?", "sympathetic"),
      sc("Simone", "a colleague comparing old workplaces", "to compare how strict past jobs were",
        "Two colleagues compare rules at previous jobs.",
        "Describe what you were made and allowed to do.",
        "My last boss was very strict. What did your old managers make you do, and what did they let you do?", "curious"),
      sc("Emil", "a border official you dealt with", "to explain what happened at the checkpoint",
        "A long process at a checkpoint has just ended.",
        "Describe what you were made to do.",
        "You waited a long time today. What did my colleagues make you do in there?", "matter-of-fact"),
      sc("Mrs. Aguilar", "your teacher", "to practise make, let and help",
        "The class is describing rules and favours.",
        "Use the three verbs correctly.",
        "Think about when you were a child. What did your parents make you do, and what did they let you do?", "encouraging"),
      sc("Mr. Nakamura", "the examiner", "to check these verb patterns",
        "The examiner asks about rules and help.",
        "Use make, let and help accurately.",
        "Please describe a strict school or workplace. What did they make you do?", "neutral"),
    ],
  },

  {
    id: "b2-arranging-services",
    topic: "booking work and chasing it up",
    objectives: [
      "Book a visit from a tradesperson.",
      "Ask about timing and cost before agreeing.",
    ],
    goal: "Arrange for someone to come and do a job.",
    target: "booking a service",
    correction: "Model the booking question and let the learner arrange the visit again.",
    summary: "You learned to book work and ask about timing and cost before agreeing.",
    minutes: 7,
    points: [
      {
        form: "could you come out",
        claims: [
          "'Could you come out to...' is the standard way of asking a tradesperson to visit.",
          "'Come out' means travel to the customer, not leave a building.",
        ],
        ex: ["Could you come out and look at the boiler?", "Could someone come out this week?"],
      },
      {
        form: "when could you",
        claims: [
          "'When could you fit us in?' asks about availability without pressing.",
          "'Fit someone in' means find a space in a full schedule.",
        ],
        ex: ["When could you fit us in?", "When could someone come round?"],
      },
      {
        form: "how much would that be",
        claims: [
          "Ask about cost before agreeing, not after the work.",
          "'Roughly' makes the question easier to answer: roughly how much would that be?",
          "A call-out charge is the fee a tradesperson charges just for coming to you.",
        ],
        ex: ["How much would that be, roughly?", "Is there a call-out charge?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — could you come out
      fc("p1", "Could you come ___ and look at the boiler?", ["out", "off", "away"]),
      sit("p1", "Your heating is broken. You call a plumber and ask them to visit your home. What do you say?", [
        "Could you come out and look at the heating?",
        "Could you come out of the heating?",
        "Could you come out to look the heating?",
      ]),
      lc("p1", "Could you come out tomorrow morning?", [
        "Could you call me tomorrow morning?",
        "Can you go out tomorrow evening?",
      ]),
      // p2 — when could you fit us in
      chat("p2", ["We're very busy at the moment, I'm afraid.", null], [
        "I understand. When could you fit us in?",
        "I understand. When could you fit us on?",
        "I understand. When could you fit in us?",
      ]),
      fc("p2", "When could you ___ us in?", ["fit", "fitting", "fitted"]),
      spk("p2", "When could someone come round?"),
      // p3 — how much would that be
      sit("p3", "The electrician says the job will take two hours. You want an approximate price before you agree. What do you ask?", [
        "Roughly how much would that be?",
        "Roughly how much would be that?",
        "Roughly how many would that be?",
      ]),
      fc("p3", "Roughly how ___ would that be?", ["much", "many", "more"]),
      err("p3", "How much would that being, roughly?", "being", "be"),
      // karışık
      chat("mix", ["Hello, Ace Plumbing. How can I help?", "Hi, my boiler has stopped working.", "I'm sorry to hear that.", null], [
        "Could you come out today? And roughly how much would that be?",
        "Could you come out today? And roughly how many would that be?",
        "Could you come off today? And roughly how much would that be?",
      ]),
      la("mix", "When could you come out to look at it?", ["off"]),
    ],
    success: "The learner books a visit and asks about timing and cost.",
    quiz: [
      qmcq("Which sentence books a visit?", [
        "Could someone come out this week?",
        "Someone came out this week.",
        "Somebody is coming out.",
      ], 0),
      qfill("Is there a call-out ___ before the work starts? (charge)", ["charge"]),
      qmcq("Which question is about cost?", [
        "How much would that be, roughly?",
        "When could you come?",
        "Who will come out?",
      ], 0),
    ],
    scenes: [
      sc("Dilek", "a plumber taking the call", "to book a visit and quote a price",
        "You are calling about a problem at home.",
        "Book the visit and ask about cost.",
        "Hello, you've reached the workshop. What's the problem, and what would you like us to do?", "brisk"),
      sc("Mr. Lowell", "a facilities contractor", "to schedule work at the office",
        "Office work needs booking and a quote.",
        "Arrange the visit and ask about cost.",
        "We're fully booked this week, I'm afraid. What would you like to do?", "professional"),
      sc("Anouk", "a hotel maintenance manager", "to arrange a repair during your stay",
        "Something needs fixing where you are staying.",
        "Arrange the repair and ask about timing.",
        "Our engineer is busy today, I'm afraid. What would you like to ask about his visit to your room?", "efficient"),
      sc("Ms. Kaur", "your teacher", "to practise booking services",
        "The class is role-playing service calls.",
        "Book a visit and ask about cost.",
        "Your boiler has stopped working. How would you start the call to a plumber?", "encouraging"),
      sc("Mr. Eriksen", "the examiner", "to check service booking language",
        "The examiner plays a tradesperson.",
        "Book the work and ask the right questions.",
        "Let's role-play. I run a repair company, and you need something fixed at home. How do you start the call?", "neutral"),
    ],
  },

  {
    id: "b2-when-it-goes-wrong",
    topic: "complaining about badly done work",
    objectives: [
      "Say what is still wrong after work was done.",
      "Refer back to what was promised.",
    ],
    goal: "Complain effectively about work that was not done properly.",
    target: "complaining about work",
    correction: "Model the firm but polite complaint and let the learner make it again.",
    summary: "You learned to complain about badly done work by referring to what was promised.",
    minutes: 7,
    points: [
      {
        form: "it still isn't",
        claims: [
          "'It still isn't working' states the current problem plainly.",
          "'Still' is what shows the problem has survived an attempt to fix it.",
        ],
        ex: ["It still isn't working properly.", "The pipe is still leaking."],
      },
      {
        form: "you said you'd",
        claims: [
          "'You said you'd...' refers back to what was promised, without accusing.",
          "It is more effective than describing how annoyed you are.",
        ],
        ex: ["You said you'd replace the part.", "You said you'd be here by ten."],
      },
      {
        form: "I'd like it redone",
        claims: [
          "State the outcome you want: redone, refunded or replaced.",
          "A specific request is harder to refuse than a general complaint.",
        ],
        ex: ["I'd like it redone at no extra cost.", "I'd like someone to come back and finish."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it still isn't
      fc("p1", "I had it repaired, but it ___ isn't working properly.", ["still", "yet", "ever"]),
      sit("p1", "A technician fixed your internet yesterday, but today it is not working again. You call them. What do you say?", [
        "It still isn't working.",
        "It still isn't work.",
        "It yet isn't working.",
      ]),
      lc("p1", "The pipe is still leaking.", [
        "The pipe isn't leaking now.",
        "The sink was blocked a bit.",
      ]),
      // p2 — you said you'd
      chat("p2", ["Sorry, I couldn't come yesterday.", null], [
        "You said you'd come on Monday.",
        "You said you'll came on Monday.",
        "You said you'd came on Monday.",
      ]),
      fc("p2", "You said you'd ___ the part.", ["replace", "replaced", "replacing"]),
      spk("p2", "You said you'd finish it this week."),
      // p3 — I'd like it redone
      sit("p3", "The painter did a bad job on your kitchen. You want the work done again for free. What do you say?", [
        "I'd like it redone at no extra cost.",
        "I'd like it redo at no extra cost.",
        "I'd like redone it at no extra cost.",
      ]),
      fc("p3", "The new phone is broken. I'd like it ___.", ["replaced", "replace", "replacing"]),
      err("p3", "I'd like my money refund.", "refund", "refunded"),
      // karışık
      chat("mix", ["Hello, how can I help you?", null], [
        "The heating still isn't working. You said you'd fix it last week.",
        "The heating still isn't working. You said you'll fix it last week.",
        "The heating still not working. You said you'd fix it last week.",
      ]),
      lc("mix", "It still isn't right, so I'd like it redone.", [
        "It's all right now, so I'm happy with it.",
        "It isn't ready, so I'll come back later.",
      ]),
    ],
    success: "The learner states the problem, the promise and a specific request.",
    quiz: [
      qmcq("Which sentence states a specific request?", [
        "I'd like someone to come back and finish.",
        "This is not good enough at all.",
        "I am very unhappy about this.",
      ], 0),
      qfill("The leak still ___ been fixed. (have not)", ["hasn't", "has not"]),
      qmcq("Which sentence refers to what was agreed?", [
        "You said you'd be here by ten.",
        "You are here now.",
        "You will be here soon.",
      ], 0),
    ],
    scenes: [
      sc("Priscilla", "the contractor who did the work", "to defend the work that was done",
        "Work was completed but the problem remains.",
        "Complain and request a specific outcome.",
        "My colleague says the job was signed off. What's the issue?", "defensive"),
      sc("Mr. Osei", "a supplier's manager", "to resolve a badly completed job",
        "A supplier's work has failed twice.",
        "State the problem and the request.",
        "This is the second complaint on this job. What exactly went wrong, and what do you want us to do?", "serious"),
      sc("Lucia", "a hotel manager", "to fix a repair that did not work",
        "A repair in your room was not successful.",
        "Complain politely and ask for a solution.",
        "I understand the repair didn't solve the problem. What's happening now?", "apologetic"),
      sc("Mr. Wickham", "your teacher", "to practise effective complaints",
        "The class is practising complaints about services.",
        "Complain with a specific request.",
        "Work you paid for was done badly. What would you say to the company?", "encouraging"),
      sc("Ms. Roux", "the examiner", "to check complaint language",
        "The examiner plays a service provider.",
        "Complain clearly and request an outcome.",
        "You asked to speak to me about the work. What's the problem, and what would you like us to do?", "neutral"),
    ],
  },

  {
    id: "b2-sorting-out-the-house",
    topic: "organising several jobs at once",
    objectives: [
      "Explain several pieces of work in one call.",
      "Agree an order and a start date.",
    ],
    goal: "Organise several jobs over the phone in one conversation.",
    target: "coordinating multiple jobs",
    correction: "Model the sentence that opens or closes the arrangement and let the learner continue.",
    summary: "You practised organising several jobs and agreeing when the work will start.",
    minutes: 7,
    points: [
      {
        form: "I'm calling about",
        claims: [
          "Open with the reason for the call before listing the jobs.",
          "Naming the property or the job number early saves time.",
        ],
        ex: ["I'm calling about some work on the flat.", "I'm calling about the quote you sent."],
      },
      {
        form: "we'd like to get",
        claims: [
          "'We'd like to get the bathroom done' lists the work as a result, not a task.",
          "This is the same causative pattern used for single jobs.",
        ],
        ex: ["We'd like to get the bathroom redone.", "We'd like to get the windows replaced."],
      },
      {
        form: "when can you start",
        claims: [
          "Agree the start date before discussing the details of each job.",
          "'What sort of timescale are we looking at?' asks the same thing more formally.",
        ],
        ex: ["When can you start?", "What sort of timescale are we looking at?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm calling about
      chat("p1", ["Good morning, Hill Builders.", null], [
        "Hi, I'm calling about some work on our flat.",
        "Hi, I'm calling for some work about our flat.",
        "Hi, I calling about some work on our flat.",
      ]),
      fc("p1", "Hello, I'm ___ about the job on Elm Street.", ["calling", "call", "called"]),
      spk("p1", "I'm calling about some work on the flat."),
      // p2 — we'd like to get ... done
      sit("p2", "You want a builder to replace your old windows. You say what you want done. What do you say?", [
        "We'd like to get the windows replaced.",
        "We'd like to get replaced the windows.",
        "We'd like to get the windows replace.",
      ]),
      lc("p2", "We'd like to get the kitchen painted.", [
        "We'd like to paint the kitchen ourselves.",
        "We need a new kitchen table.",
      ]),
      fc("p2", "We'd like to get the roof ___.", ["repaired", "repair", "repairing"]),
      // p3 — when can you start
      chat("p3", ["So, that's the price for all three jobs.", null], [
        "That sounds fine. When can you start?",
        "That sounds fine. When can you starting?",
        "That sounds fine. When you can start?",
      ]),
      la("p3", "When can you start on the bathroom?", ["starting"]),
      fc("p3", "When can you ___?", ["start", "starting", "to start"]),
      // karışık
      sit("mix", "You call a builder. You give the reason for the call, say you want the kitchen redone, and ask about the start date. What do you say?", [
        "I'm calling about our kitchen. We'd like to get it redone. When can you start?",
        "I'm calling about our kitchen. We'd like to get it redo. When can you start?",
        "I'm calling about our kitchen. We'd like to get it redone. When you can start?",
      ]),
      chat("mix", ["Hello, Park Renovations.", null], [
        "Hi, I'm calling about the flat. We'd like to get the floors replaced.",
        "Hi, I'm calling about the flat. We'd like to get replace the floors.",
        "Hi, I'm call about the flat. We'd like to get the floors replaced.",
      ]),
    ],
    success: "The learner opens the call, lists the work and agrees a start date.",
    quiz: [
      qmcq("Which sentence opens the call?", [
        "I'm calling about the quote you sent.",
        "I called about the quote you sent.",
        "Call me about the quote.",
      ], 0),
      qfill("We'd like to ___ the bathroom redone. (get)", ["get"]),
      qmcq("Which question asks about timing?", [
        "What sort of timescale are we looking at?",
        "What sort of tiles do you use?",
        "What sort of payment do you take?",
      ], 0),
    ],
    scenes: [
      sc("Sinead", "a builder taking the call", "to understand the scope and quote for it",
        "Several jobs need doing in one property.",
        "List the work and agree a start.",
        "Hello, Sinead speaking. How can I help?", "practical"),
      sc("Omar", "an office manager coordinating refurbishment", "to plan the order of the work",
        "Several trades must be scheduled in the right order.",
        "Explain the work and agree the sequence.",
        "We have three trades and one week. Which jobs do you want done first?", "organised"),
      sc("Lena", "a landlord abroad", "to agree work on a property you rent",
        "Work is needed on a property in another country.",
        "Explain the work and agree timing.",
        "You mentioned several problems in your message. Which ones do you want fixed?", "cooperative"),
      sc("Mrs. Dube", "your teacher", "to practise coordinating jobs",
        "The class is role-playing a longer service call.",
        "Coordinate several jobs in one call.",
        "You have three jobs to arrange in one call. How do you begin?", "encouraging"),
      sc("Mr. Ellery", "the examiner", "to check extended transactional language",
        "The examiner plays a contractor.",
        "Open, list and agree timing.",
        "Let's role-play. I'm a builder, and you need three jobs done at home. What do you say when I answer?", "neutral"),
    ],
  },
];
