/** C1 · Ünite 1-4 — Emphasis · Hypothetical · Ellipsis · Formal Register (25 ders).
 *
 *  C1'de gramer payı %23'e düşüyor ve kalan gramer artık YAPI değil RETORİK:
 *  devrik cümle bir kural değil, vurguyu istediğin yere koyma aracı. Ünite 1
 *  bunun üç biçimini öğretiyor, sonra aynı işi sessizce yapmayı (understatement).
 *
 *  Ünite 2 gerçek dışıyı `if`siz kuruyor (`were I to`, `had it not been for`,
 *  `should that happen`) ve uzun bir varsayım tartışmasını sürdürmeyi öğretiyor.
 *
 *  Ünite 3 EKSİLTİ: dinleyicinin zaten tamamlayabileceğini söylememek, ve
 *  karşındakinin söylemediğini okumak. C1'in en az öğretilen ama en çok
 *  ihtiyaç duyulan becerisi bu.
 *
 *  Ünite 4 resmî register: eylemi nesneye çevirme, faili silme, `if`siz resmî
 *  koşul ve kurumsal kelime dağarcığı. Amaç resmî konuşabilmek — donuk değil.
 *
 *  Alıştırmalar oyun bloğunda (drills, 10 Kas 2026): her öğretim maddesine ≥3 madde +
 *  ≥2 karışık; C'de durum/sohbet/dinle-seç/şıklı boşluk ağırlıklı — sıralama yalnız
 *  tek dizilim garantiliyse, hatalı kelime yalnız tek kelime düzeltiyorsa.
 */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const C1_U1_4: Authored[] = [
  // --- Ünite 1 · The Art of Emphasis -----------------------------------------
  {
    id: "c1-not-only-did-she-come",
    topic: "inversion after a negative opener",
    objectives: [
      "Invert the subject and auxiliary after a fronted negative.",
      "Choose inversion when the plain order would underplay the point.",
    ],
    goal: "Give a statement rhetorical weight by fronting the negative.",
    target: "inversion after not only, no sooner and not once",
    correction: "Rebuild the inverted clause and let the learner produce their own.",
    summary: "You learned to invert after a fronted negative and when that is worth doing.",
    minutes: 9,
    points: [
      {
        form: "not only did",
        claims: [
          "After a fronted negative the auxiliary moves in front of the subject.",
          "If there is no auxiliary, 'do', 'does' or 'did' supplies one.",
        ],
        ex: ["Not only did she come, she stayed all evening.", "Not only was it late, it was the wrong address."],
      },
      {
        form: "no sooner had",
        claims: [
          "'No sooner ... than' pairs with the past perfect in the first half.",
          "'Than' is the standard partner here, not 'when'.",
        ],
        ex: ["No sooner had we sat down than the phone rang.", "No sooner had it started than it stopped."],
      },
      {
        form: "not once did",
        claims: [
          "After a fronted 'not once' or 'never', inversion is required; the real choice is whether to front it at all.",
          "Because it draws attention, repeated use in one stretch weakens the effect.",
        ],
        ex: ["Not once did he apologise.", "Never in ten years had I seen that."],
      },
    ],
    ex: [],
    drills: [
      // p1 — not only did
      fc("p1", "Not only ___ he forget the tickets, he lost the map too.", ["did", "was", "had"]),
      sit("p1", "Your friend's party had live music, and on top of that the food was free. You want to stress both. What do you say?", [
        "Not only was there live music, the food was free too.",
        "Not only there was live music, the food was free too.",
        "Not only did there was live music, the food was free too.",
      ]),
      err("p1", "Not only did she came, she stayed all evening.", "came", "come"),
      // p2 — no sooner had
      fc("p2", "No sooner had we arrived ___ it started to rain.", ["than", "then", "so"]),
      la("p2", "No sooner had I sat down than the phone rang."),
      sit("p2", "You opened the window, and a moment later it began to rain heavily. How do you tell it with emphasis?", [
        "No sooner had I opened the window than it began to rain.",
        "No sooner I had opened the window than it began to rain.",
        "No sooner did I had opened the window than it began to rain.",
      ]),
      // p3 — not once did
      chat("p3", ["Did he ever say sorry for the mess?", null], [
        "No. Not once did he say sorry.",
        "No. Not once he said sorry.",
        "No. Not once did he said sorry.",
      ]),
      fc("p3", "Not once last year ___ they ask for my opinion.", ["did", "do", "were"]),
      lc("p3", "Not once did anyone thank us.", [
        "Not one person was there to thank us.",
        "Once again, everyone thanked us.",
      ]),
      spk("p3", "Not once did he apologise."),
      // karışık
      sit("mix", "The train was late, and the moment you got on, it broke down. Tell it with emphasis.", [
        "Not only was the train late; no sooner had we boarded than it broke down.",
        "Not only the train was late; no sooner had we boarded than it broke down.",
        "Not only was the train late; no sooner we had boarded than it broke down.",
      ]),
      lc("mix", "Not only did she call; not once did she complain.", [
        "Not only she called; once she complained.",
        "She did not call, and once she complained.",
      ]),
    ],
    success: "The learner inverts correctly after a fronted negative at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Not only was it late, it was the wrong address.",
        "Not only it was late, it was the wrong address.",
        "Not only it late was, it was the wrong address.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "No sooner had it started than it stopped again.",
        "No sooner had it started then it stopped again.",
        "No sooner it had started than it stopped again.",
      ], 0),
      qmcq("Why say 'Not once did he apologise' instead of 'He never apologised'?", [
        "to give the statement extra weight",
        "because the plain order is wrong",
        "because the tense requires it",
      ], 0),
    ],
    scenes: [
      sc("Ravenna", "a friend hearing an extraordinary account", "to get the full weight of the story",
        "Something genuinely remarkable happened and your friend has only heard fragments.",
        "Tell it with emphasis where it matters.",
        "I have heard three versions of this already. What actually happened?", "eager"),
      sc("Idris", "a colleague reviewing a difficult account", "to understand how bad it was",
        "You are recounting a difficult episode to a colleague.",
        "Give the key points rhetorical weight.",
        "The summary you sent was very flat. What was it really like?", "attentive"),
      sc("Solveig", "a fellow traveller trading extreme stories", "to hear the most striking part",
        "Travellers are comparing extraordinary experiences.",
        "Emphasise the striking parts.",
        "Everyone here has one impossible story. What is yours?", "curious"),
      sc("Professor Adeyemi", "your tutor", "to practise rhetorical inversion",
        "The seminar is looking at emphasis in spoken argument.",
        "Use inversion where it earns its place.",
        "Your team waited a year for a reply, and the moment it came, the project was cancelled. How would you tell that story?", "probing"),
      sc("Ms. Whitlock", "the examiner", "to check rhetorical control",
        "The examiner asks for a striking account.",
        "Use inversion accurately and sparingly.",
        "Could you tell me about something that genuinely surprised you?", "neutral"),
    ],
  },

  {
    id: "c1-only-then-did-i-realise",
    topic: "inversion after only and not until",
    objectives: [
      "Invert after only, not until and no sooner.",
      "Delay the main point to the end of the sentence.",
    ],
    goal: "Delay a realisation so it lands at the end.",
    target: "inversion after only and not until",
    correction: "Rebuild the sentence with the inversion in the second half and let the learner try again.",
    summary: "You learned to invert after only and not until, and why that delays the point.",
    minutes: 9,
    points: [
      {
        form: "only then did",
        claims: [
          "'Only then' or 'only later' at the front inverts the subject and the auxiliary.",
          "If there is no auxiliary, 'did' supplies one: 'Only later did we find out'.",
        ],
        ex: ["Only then did I realise what had happened.", "Only later did we find out."],
      },
      {
        form: "only after",
        claims: [
          "With 'only after' or 'only when' plus a clause, the inversion falls on the main clause, not on the clause after 'only'.",
          "Say 'only after she left did I understand', not 'did she leave I understood'.",
        ],
        ex: ["Only after she left did I understand.", "Only when it was over did anyone speak."],
      },
      {
        form: "not until then",
        claims: [
          "'Not until' works the same way: the inversion falls on the main clause.",
          "The effect is to make the listener wait for the point, which is the purpose.",
        ],
        ex: ["Not until then did I see the pattern.", "Not until the letter arrived did we believe it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — only then did
      fc("p1", "Only then ___ we understand why she had left.", ["did", "were", "have"]),
      chat("p1", ["When did you realise the shop was closed?", null], [
        "When I saw the sign. Only then did I realise.",
        "When I saw the sign. Only then I did realise.",
        "When I saw the sign. Only then did I realised.",
      ]),
      lc("p1", "Only then did I see the problem.", [
        "Even then I didn't see the problem.",
        "Only the end showed me the problem.",
      ]),
      // p2 — only after
      sit("p2", "You only understood her advice once she had gone. Which sentence is correct?", [
        "Only after she had gone did I see her point.",
        "Only after did she go I saw her point.",
        "Only after she had gone I did see her point.",
      ]),
      fc("p2", "Only after the meeting ended ___ anyone mention the budget.", ["did", "had", "was"]),
      arr("p2", "Only after the call did I relax.", ["relaxed"]),
      // p3 — not until then
      fc("p3", "Not until the results came out ___ we celebrate.", ["did", "were", "have"]),
      lc("p3", "Not until the end did she smile.", [
        "Until the end, she was smiling.",
        "Not at all did she smile.",
      ]),
      spk("p3", "Not until then did I see it."),
      // karışık
      sit("mix", "Which sentence is correct?", [
        "Only when the tests passed did we relax, and not until morning did we sleep.",
        "Only when the tests passed did we relax, and not until morning we slept.",
        "Only when the tests passed we relaxed, and not until morning did we sleep.",
      ]),
      chat("mix", ["So when did you finally tell her?", null], [
        "Not until today. Only then did I feel ready.",
        "Not until today. Only then I felt ready.",
        "Not until today. Only then did I felt ready.",
      ]),
    ],
    success: "The learner delays the main point with inversion at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Only later did we find out.",
        "Only later we did find out.",
        "Only later we found out did.",
      ], 0),
      qfill("Not until then ___ I see the pattern. (do)", ["did"]),
      qmcq("What does 'Not until the end did I understand' achieve?", [
        "It makes the listener wait for the point.",
        "It makes the sentence shorter.",
        "It changes the tense of the verb.",
      ], 0),
    ],
    scenes: [
      sc("Beatrix", "a close friend", "to hear how the penny finally dropped",
        "You understood something about a past situation only much later.",
        "Describe the delayed realisation.",
        "You said it took you years to see it. When did it finally click?", "gentle"),
      sc("Marek", "a colleague reviewing a failed project", "to learn what was missed at the time",
        "A post-mortem is looking at what nobody saw coming.",
        "Describe what became clear only afterwards.",
        "Nobody flagged it at the time. When did it become obvious?", "analytical"),
      sc("Amara", "a fellow traveller recounting a misunderstanding", "to hear how a cultural misreading unfolded",
        "A cultural misunderstanding took a while to surface.",
        "Describe the delayed understanding.",
        "So you had no idea at the time? When did you work it out?", "amused"),
      sc("Dr. Weiss", "your tutor", "to practise delayed emphasis",
        "The seminar is examining how word order controls attention.",
        "Delay the point deliberately.",
        "You only understood the theory after the final lecture. When did it finally make sense to you?", "probing"),
      sc("Mr. Bauer", "the examiner", "to check delayed emphasis",
        "The examiner asks about a late realisation.",
        "Use inversion to delay the point.",
        "Could you describe something you only understood in hindsight?", "neutral"),
    ],
  },

  {
    id: "c1-it-is-precisely-this-that",
    topic: "pinpointing one element",
    objectives: [
      "Isolate one element with a cleft structure.",
      "Sharpen the cleft with precisely or exactly.",
    ],
    goal: "Direct all the attention to one part of what you are saying.",
    target: "advanced cleft structures",
    correction: "Rebuild the cleft around the element that matters and let the learner try again.",
    summary: "You learned to pinpoint one element with a sharpened cleft structure.",
    minutes: 9,
    points: [
      {
        form: "it is precisely",
        claims: [
          "'Precisely' and 'exactly' sharpen a cleft so the focus cannot be missed.",
          "The neutral, most common position is between 'it is' and the highlighted element.",
        ],
        ex: ["It is precisely this that worries me.", "It was exactly then that things changed."],
      },
      {
        form: "what matters here is",
        claims: [
          "A what-clause delays the key element to the end of the sentence.",
          "It is common in argument because the listener hears the claim last.",
        ],
        ex: ["What matters here is the timing.", "What concerns me is the precedent."],
      },
      {
        form: "this is exactly what",
        claims: [
          "'This is exactly what I meant' points back at something already said.",
          "Pointing back is what distinguishes it from the forward-pointing cleft.",
        ],
        ex: ["This is exactly what I was afraid of.", "This is exactly what we discussed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it is precisely
      fc("p1", "It is ___ this point that I disagree with.", ["precisely", "precise", "precision"]),
      sit("p1", "A colleague thinks you object to the cost, but your real worry is the deadline. What do you say?", [
        "It is precisely the deadline that worries me.",
        "It is precisely the deadline what worries me.",
        "It is precise the deadline that worries me.",
      ]),
      err("p1", "It is precise this that worries me.", "precise", "precisely"),
      // p2 — what matters here is
      fc("p2", "What matters here ___ the timing, not the cost.", ["is", "are", "be"]),
      lc("p2", "What matters here is trust.", [
        "Trust matters here, not what we say.",
        "What does it matter here?",
      ]),
      chat("p2", ["So you think the price is the real problem?", null], [
        "Not really. What matters here is the timing.",
        "Not really. What matters here are the timing.",
        "Not really. What matter here is the timing.",
      ]),
      // p3 — this is exactly what
      fc("p3", "This is ___ what I was worried about.", ["exactly", "exact", "exactness"]),
      sit("p3", "Your friend has just described the very problem you warned about last week. What do you say?", [
        "This is exactly what I warned you about.",
        "This is exactly that I warned you about.",
        "This is exactly which I warned you about.",
      ]),
      spk("p3", "This is exactly what I meant."),
      // karışık
      fc("mix", "You said the delay was the risk, and now it has happened. '___ I was afraid of.'", ["This is exactly what", "It is precisely", "What matters here is"]),
      sit("mix", "You want to point to one thing only: the tone, not the words. What do you say?", [
        "What matters here is the tone, not the words.",
        "This is exactly what the tone, not the words.",
        "It is precisely the tone what matters, not the words.",
      ]),
    ],
    success: "The learner isolates one element with a cleft structure at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It was exactly then that things changed.",
        "It was exactly then when things changed which.",
        "It exactly was then things changed.",
      ], 0),
      qfill("What ___ me is the precedent, not the cost. (concern)", ["concerns"]),
      qmcq("Which sentence points back at something already said?", [
        "This is exactly what we discussed.",
        "What matters here is the timing.",
        "It is precisely this that worries me.",
      ], 0),
    ],
    scenes: [
      sc("Ottoline", "a friend missing your point", "to finally see what you object to",
        "A friend keeps addressing a point you are not making.",
        "Pinpoint the exact element.",
        "I still think you are objecting to the cost. Am I wrong?", "puzzled"),
      sc("Rashid", "a colleague in a design review", "to identify the real problem",
        "A review has focused on the wrong detail.",
        "Isolate what actually matters.",
        "We have spent twenty minutes on the interface. Is that the issue?", "focused"),
      sc("Yuki", "an academic contact discussing a paper", "to locate the central claim",
        "A paper's central claim is being lost among details.",
        "Pinpoint the claim.",
        "There is a lot in this paper. What is the actual argument?", "rigorous"),
      sc("Professor Osei", "your tutor", "to practise cleft structures",
        "The seminar is looking at how focus is signalled.",
        "Pinpoint one element precisely.",
        "I think the real problem with your essay is its length. Is that what bothers you?", "probing"),
      sc("Ms. Reyes", "the examiner", "to check focus structures",
        "The examiner deliberately misreads your point.",
        "Pinpoint the element that matters.",
        "So your objection is essentially financial, then?", "neutral"),
    ],
  },

  {
    id: "c1-what-struck-me-most",
    topic: "foregrounding your own reaction",
    objectives: [
      "Put your reaction at the front of an observation.",
      "Distinguish a reaction from a judgement.",
    ],
    goal: "Report an experience by leading with what it did to you.",
    target: "foregrounding a personal reaction",
    correction: "Model the reaction-first sentence and let the learner report their own.",
    summary: "You learned to lead with your reaction rather than with the facts.",
    minutes: 8,
    points: [
      {
        form: "what struck me",
        claims: [
          "'What struck me was...' reports an impression rather than a verdict.",
          "It invites agreement more easily than a flat judgement does.",
        ],
        ex: ["What struck me was how quiet it was.", "What struck me most was the scale."],
      },
      {
        form: "what stood out",
        claims: [
          "'What stood out' singles out the most noticeable detail without judging it as good or bad.",
          "It works well when you do not want to summarise everything.",
        ],
        ex: ["What stood out was the tone.", "What stood out for me was the ending."],
      },
      {
        form: "what I noticed was",
        claims: [
          "'What I noticed was' is the most neutral of the three.",
          "It reports observation without claiming the observation matters.",
        ],
        ex: ["What I noticed was how few people spoke.", "What I noticed was the change in pace."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what struck me
      fc("p1", "What ___ me was how calm everyone stayed.", ["struck", "striked", "stroke"]),
      sit("p1", "You visited a huge cathedral, and its size made a strong impression on you. Which sentence is correct?", [
        "What struck me most was its size.",
        "What struck me most it was its size.",
        "What struck to me most was its size.",
      ]),
      lc("p1", "What struck me was the silence.", [
        "It struck me as silent.",
        "What stopped us was the silence.",
      ]),
      // p2 — what stood out
      fc("p2", "Out of the whole film, what ___ out for me was the music.", ["stood", "standed", "stand"]),
      chat("p2", ["There were so many talks. Which one do you remember?", null], [
        "What stood out for me was the last one.",
        "What stood out for me were the last one.",
        "What stand out for me was the last one.",
      ]),
      spk("p2", "What stood out was the ending."),
      // p3 — what I noticed was
      fc("p3", "What I ___ was how few people spoke.", ["noticed", "notice", "noticing"]),
      sit("p3", "You want to report a detail neutrally, without claiming it was important. Which sentence fits best?", [
        "What I noticed was that nobody took notes.",
        "What struck me most was that nobody took notes.",
        "What I noticed it was that nobody took notes.",
      ]),
      lc("p3", "What I noticed was the empty room.", [
        "What I needed was an empty room.",
        "I noticed what was in the room.",
      ]),
      // karışık
      sit("mix", "A friend asks about a conference. You name one detail that stood out, then add a neutral observation. What do you say?", [
        "What stood out was the keynote. What I noticed was how short the breaks were.",
        "What stood out was the keynote. What I noticed were how short the breaks were.",
        "What stand out was the keynote. What I noticed was how short the breaks were.",
      ]),
      chat("mix", ["So how was the museum?", null], [
        "What struck me was the light, and what I noticed was how quiet it was.",
        "What struck me was the light, and what I noticed it was how quiet it was.",
        "What struck me were the light, and what I noticed was how quiet it was.",
      ]),
    ],
    success: "The learner leads with a reaction at least twice.",
    quiz: [
      qmcq("Which sentence is the most neutral?", [
        "What I noticed was the change in pace.",
        "What struck me was the change in pace.",
        "The change in pace was extraordinary.",
      ], 0),
      qfill("What ___ out for me was the ending. (stand)", ["stood"]),
      qmcq("Why lead with a reaction?", [
        "It invites agreement more easily than a verdict.",
        "It is grammatically required at C1.",
        "It shortens the sentence.",
      ], 0),
    ],
    scenes: [
      sc("Camille", "a friend who missed the event", "to hear what it was actually like",
        "You attended something your friend could not.",
        "Report it through your reactions.",
        "I am sorry I missed it. What was it actually like?", "curious"),
      sc("Stefan", "a colleague after a conference", "to compare impressions of the same event",
        "Two colleagues attended the same conference.",
        "Lead with impressions.",
        "We were in the same sessions. What stayed with you?", "reflective"),
      sc("Priya", "a fellow traveller after a shared visit", "to compare what each of you noticed",
        "Two travellers visited the same place.",
        "Report what you noticed.",
        "We saw exactly the same thing. Did it land differently for you?", "interested"),
      sc("Dr. Ferreira", "your tutor", "to practise foregrounding reactions",
        "The seminar is examining how observation is framed.",
        "Lead with reaction rather than fact.",
        "You went to the guest lecture yesterday. What stayed with you?", "probing"),
      sc("Mr. Larsen", "the examiner", "to check reaction-first reporting",
        "The examiner asks about a memorable event.",
        "Lead with reaction.",
        "Could you tell me about something that made a strong impression on you?", "neutral"),
    ],
  },

  {
    id: "c1-driving-a-point-home",
    topic: "arguing with deliberate emphasis",
    objectives: [
      "Signal that the next point is the important one.",
      "Use emphasis sparingly so it keeps its force.",
    ],
    goal: "Make sure the key point of your argument cannot be missed.",
    target: "emphatic argument markers",
    correction: "Model the emphatic marker and let the learner place their own key point.",
    summary: "You practised marking the key point of an argument so it cannot be missed.",
    minutes: 8,
    points: [
      {
        form: "let me be clear",
        claims: [
          "'Let me be clear' announces that what follows is the position, not a nuance.",
          "Repeated use can make it sound defensive and reduce its force.",
        ],
        ex: ["Let me be clear about what I am not saying.", "Let me be clear: this is not about money."],
      },
      {
        form: "make no mistake",
        claims: [
          "'Make no mistake' warns against a misreading you expect.",
          "It is strong, so it fits a genuine risk of being misunderstood.",
        ],
        ex: ["Make no mistake, this will cost us.", "Make no mistake about the timescale."],
      },
      {
        form: "I cannot stress enough",
        claims: [
          "'I cannot stress enough' marks a point as the one to remember.",
          "Because it claims maximum weight, a second use in the same stretch undercuts the first.",
        ],
        ex: ["I cannot stress enough how urgent this is.", "I cannot stress this enough."],
      },
    ],
    ex: [],
    drills: [
      // p1 — let me be clear
      chat("p1", ["So you're saying the team failed?", null], [
        "No. Let me be clear: the plan failed, not the team.",
        "No. Let me to be clear: the plan failed, not the team.",
        "No. Let me being clear: the plan failed, not the team.",
      ]),
      sit("p1", "In a meeting, you want to state your position before any nuance. Which opening is correct?", [
        "Let me be clear: we are not cutting jobs.",
        "Let me clear: we are not cutting jobs.",
        "Let me be clearly: we are not cutting jobs.",
      ]),
      spk("p1", "Let me be clear about this."),
      // p2 — make no mistake
      chat("p2", ["So the delay is just a small problem?", null], [
        "Make no mistake, this delay is serious.",
        "Make not mistake, this delay is serious.",
        "Make no mistaken, this delay is serious.",
      ]),
      sit("p2", "People will assume the change is minor, but it will affect everyone. You warn them. What do you say?", [
        "Make no mistake, this will affect everyone.",
        "Make no mistake, this won't affect anyone much.",
        "Make no mistaking, this will affect everyone.",
      ]),
      lc("p2", "Make no mistake, this will cost us.", [
        "Make a mistake, and this will cost us.",
        "No one made a mistake, so it cost us nothing.",
      ]),
      // p3 — I cannot stress enough
      fc("p3", "I cannot stress ___ how important this is.", ["enough", "so", "very"]),
      chat("p3", ["What's the one thing I must remember before the exam?", null], [
        "I cannot stress this enough: read every question twice.",
        "I cannot stressing this enough: read every question twice.",
        "I cannot to stress this enough: read every question twice.",
      ]),
      spk("p3", "I cannot stress this enough."),
      // karışık
      sit("mix", "You warn against a misreading about the timescale, then state your position on the budget. What do you say?", [
        "Make no mistake, the timescale is tight. Let me be clear: the budget is fine.",
        "Make no mistake, the timescale is tight. Let me being clear: the budget is fine.",
        "Make a no mistake, the timescale is tight. Let me be clear: the budget is fine.",
      ]),
      sit("mix", "Which sentence is correct?", [
        "I cannot stress enough how urgent this is.",
        "Make no mistake about how urgent is this.",
        "Let me be clear how urgent is this.",
      ]),
    ],
    success: "The learner marks the key point emphatically without overusing the markers.",
    quiz: [
      qmcq("Which phrase announces the position rather than a nuance?", [
        "Let me be clear:",
        "Incidentally,",
        "In passing,",
      ], 0),
      qmcq("Which sentence is correct?", [
        "Make no mistake, this will cost us.",
        "Make no mistaken, this will cost us.",
        "Make not mistake, this will cost us.",
      ], 0),
      qmcq("Why use these markers sparingly?", [
        "Repeated emphasis loses its force.",
        "They are grammatically incorrect twice.",
        "They can only open a sentence once.",
      ], 0),
    ],
    scenes: [
      sc("Njeri", "a friend who has misread you before", "to be left in no doubt this time",
        "A friend has repeatedly misunderstood your position.",
        "Make the key point unmissable.",
        "Last time I got this completely wrong. Say it plainly for me?", "attentive"),
      sc("Viktor", "a board member hearing a recommendation", "to grasp the central risk",
        "A recommendation must land with someone who will skim it.",
        "Mark the key point emphatically.",
        "I have read the paper. What is the one thing I should take away?", "brisk"),
      sc("Aiko", "a journalist likely to quote you", "to quote you accurately",
        "You are speaking to someone who will report what you say.",
        "Make the key point unambiguous.",
        "I want to get this right in print. What is your actual position?", "precise"),
      sc("Professor Anand", "your tutor", "to practise emphatic argument",
        "The seminar is examining rhetorical weight.",
        "Mark a key point emphatically.",
        "People think your paper argues for cutting jobs, but it does not. What is your actual position?", "probing"),
      sc("Ms. Boateng", "the examiner", "to check emphatic argument",
        "The examiner invites a strong argument.",
        "Mark the key point clearly.",
        "Could you argue a position where people usually misunderstand you?", "neutral"),
    ],
  },

  {
    id: "c1-understated-but-firm",
    topic: "making a strong point quietly",
    objectives: [
      "State a firm position in understated language.",
      "Close a point without escalating.",
    ],
    goal: "Hold a firm line without raising your voice.",
    target: "understatement as emphasis",
    correction: "Model the understated line and let the learner restate their position quietly.",
    summary: "You practised making a firm point quietly rather than loudly.",
    minutes: 8,
    points: [
      {
        form: "I'd simply note",
        claims: [
          "'I'd simply note' presents a strong point as a small observation.",
          "The understatement is what gives it weight in a heated exchange.",
        ],
        ex: ["I'd simply note that the figures say otherwise.", "I'd simply note the timing."],
      },
      {
        form: "it's worth remembering",
        claims: [
          "'It's worth remembering' reintroduces an inconvenient fact without accusation.",
          "It reminds without openly accusing anyone, though a sharp tone can still make it pointed.",
        ],
        ex: ["It's worth remembering who raised it first.", "It's worth remembering what was agreed."],
      },
      {
        form: "I'll leave it there",
        claims: [
          "'I'll leave it there' closes your contribution without conceding.",
          "Stopping while ahead is itself a rhetorical move.",
        ],
        ex: ["I'll leave it there.", "I'll leave it there for now."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd simply note
      fc("p1", "I'd ___ note that nobody objected at the time.", ["simply", "simple", "simplify"]),
      chat("p1", ["Your numbers are completely wrong!", null], [
        "I'd simply note that the auditors checked them.",
        "I'd simply noting that the auditors checked them.",
        "I'd simple note that the auditors checked them.",
      ]),
      lc("p1", "I'd simply note the dates.", [
        "I'd simply delete the dates.",
        "I'd like a note of the dates.",
      ]),
      // p2 — it's worth remembering
      fc("p2", "It's worth ___ what was agreed in March.", ["remembering", "to remember", "remember"]),
      sit("p2", "Someone has forgotten that they proposed the plan themselves. You remind them without accusing them. What do you say?", [
        "It's worth remembering who proposed this plan.",
        "You are lying about who proposed this plan.",
        "It's worth remember who proposed this plan.",
      ]),
      spk("p2", "It's worth remembering what was agreed."),
      // p3 — I'll leave it there
      chat("p3", ["Do you have anything else to add?", null], [
        "No, I'll leave it there.",
        "No, I'll leaving it there.",
        "No, I'll leave there it.",
      ]),
      sit("p3", "You have made your point calmly. You will not argue further, but you are not giving in. What do you say?", [
        "I'll leave it there.",
        "You're right, I give up.",
        "I'll leave it to there.",
      ]),
      spk("p3", "I'll leave it there for now."),
      // karışık
      sit("mix", "In a heated meeting, you remind everyone of the agreed budget, then stop without conceding. What do you say?", [
        "It's worth remembering the agreed budget. I'll leave it there.",
        "It's worth remembering the agreed budget. I'll leaving it there.",
        "It's worth to remember the agreed budget. I'll leave it there.",
      ]),
      chat("mix", ["This proposal is a total disaster!", null], [
        "I'd simply note that it was approved twice. I'll leave it there.",
        "I'd simple note that it was approved twice. I'll leave it there.",
        "I'd simply note that it was approved twice. I'll leave there it.",
      ]),
    ],
    success: "The learner holds a firm position in understated language.",
    quiz: [
      qmcq("Which sentence is understated but firm?", [
        "I'd simply note the timing.",
        "The timing was a disaster.",
        "You got the timing badly wrong.",
      ], 0),
      qfill("It's worth ___ who raised it first. (remember)", ["remembering"]),
      qmcq("What does 'I'll leave it there' do?", [
        "closes your contribution without conceding",
        "concedes the argument entirely",
        "asks the other person to continue",
      ], 0),
    ],
    scenes: [
      sc("Gustavo", "a friend arguing loudly", "to be met without escalation",
        "A friend has become heated in a disagreement.",
        "Hold your line quietly.",
        "You cannot seriously still believe that. Can you?", "heated"),
      sc("Halima", "a colleague attacking your proposal", "to hear a measured defence",
        "A proposal is being criticised sharply in a meeting.",
        "Defend it quietly and close.",
        "This plan has real problems. What do you say to that?", "combative"),
      sc("Emil", "a fellow guest at a tense dinner", "to keep the evening civil",
        "A dinner conversation has become tense.",
        "Make your point quietly.",
        "Nobody here agrees with you, you realise. Care to respond?", "provocative"),
      sc("Mrs. Iversen", "your tutor", "to practise understatement",
        "The seminar is examining quiet rhetoric.",
        "Make a strong point quietly.",
        "The figures support you, but I still disagree, quite loudly. What would you say to me?", "probing"),
      sc("Mr. Sasaki", "the examiner", "to check register control under pressure",
        "The examiner pushes back forcefully.",
        "Hold the position calmly.",
        "I find that argument completely unconvincing. Your response?", "neutral"),
    ],
  },

  // --- Ünite 2 · Unreal and Hypothetical -------------------------------------
  {
    id: "c1-were-i-to-suggest",
    topic: "hypotheticals built without if",
    objectives: [
      "Build a conditional by inverting instead of using if.",
      "Recognise the formality this carries.",
    ],
    goal: "Raise a hypothetical in formal or careful language.",
    target: "inverted conditionals",
    correction: "Rebuild the inverted conditional and let the learner produce their own.",
    summary: "You learned to build conditionals by inversion instead of with if.",
    minutes: 9,
    points: [
      {
        form: "were I to",
        claims: [
          "'Were I to suggest' replaces 'if I suggested' and sounds markedly more formal.",
          "The pattern is: were + subject + to + base verb.",
        ],
        ex: ["Were I to suggest an alternative, would you consider it?", "Were we to agree, what then?"],
      },
      {
        form: "were it not",
        claims: [
          "'Were it not for' names the one thing preventing an outcome.",
          "It replaces 'if it were not for' with no change of meaning; 'were it not so late' replaces 'if it were not so late'.",
        ],
        ex: ["Were it not for the cost, I would agree.", "Were it not so late, we could start now."],
      },
      {
        form: "should that happen",
        claims: [
          "'Should' at the front makes a future possibility more remote and more formal.",
          "'Should you need anything' replaces 'if you need anything'.",
        ],
        ex: ["Should that happen, we will need a plan.", "Should you need anything, do ask."],
      },
    ],
    ex: [],
    drills: [
      // p1 — were I to
      fc("p1", "___ I to accept the offer, would you be disappointed?", ["Were", "Am", "Did"]),
      sit("p1", "In a formal meeting, you float the idea of delaying the launch without committing to it. What do you say?", [
        "Were I to suggest a delay, would you consider it?",
        "Were I suggest a delay, would you consider it?",
        "Were I to suggesting a delay, would you consider it?",
      ]),
      err("p1", "Were I to suggested a change, would you agree?", "suggested", "suggest"),
      // p2 — were it not
      fc("p2", "Were it not ___ the rain, we would be outside.", ["for", "of", "to"]),
      chat("p2", ["Why aren't you taking the job? It pays well.", null], [
        "Were it not for the commute, I would.",
        "Were it not the commute, I would.",
        "Were not it for the commute, I would.",
      ]),
      lc("p2", "Were it not so expensive, I would buy it.", [
        "It was not so expensive, so I bought it.",
        "Were it cheaper, I would not buy it.",
      ]),
      // p3 — should that happen
      fc("p3", "Should that ___, we will cancel the trip.", ["happen", "happens", "happened"]),
      sit("p3", "You are writing to a client: if they have questions, they can call. You want it formal. What do you write?", [
        "Should you have any questions, please call us.",
        "Should you having any questions, please call us.",
        "Should you to have any questions, please call us.",
      ]),
      spk("p3", "Should that happen, we will need help."),
      // karışık
      sit("mix", "Which pair of sentences is correct?", [
        "Were I to leave, would you cope? Should that happen, call me.",
        "Were I to leave, would you cope? Should that happens, call me.",
        "Were I leave, would you cope? Should that happen, call me.",
      ]),
      chat("mix", ["What if the funding is cut?", null], [
        "Should that happen, we'd stop. Were it not for this grant, we'd have nothing.",
        "Should that happen, we'd stop. Were it not this grant, we'd have nothing.",
        "Should that happened, we'd stop. Were it not for this grant, we'd have nothing.",
      ]),
    ],
    success: "The learner builds at least two conditionals by inversion.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Were we to agree, what then?",
        "Were we agree, what then?",
        "Were we to agreeing, what then?",
      ], 0),
      qfill("___ you need anything, do ask. (shall)", ["Should"]),
      qmcq("What does the inverted form add?", [
        "formality and distance",
        "a change of tense",
        "a stronger certainty",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "a senior figure at a formal meeting", "to consider a proposal properly",
        "A proposal must be floated carefully in a formal setting.",
        "Raise it as a hypothetical.",
        "You indicated you had an alternative. What is it?", "formal"),
      sc("Mr. Reddy", "a client weighing options", "to explore an option without committing",
        "An option must be explored without either side committing.",
        "Frame it hypothetically.",
        "Nothing is decided today. What are you thinking?", "measured"),
      sc("Ines", "an official handling your case", "to consider a possibility formally",
        "An official process requires careful hypothetical language.",
        "Raise the possibility formally.",
        "I can note a hypothetical for the record. What would it be?", "official"),
      sc("Professor Novak", "your tutor", "to practise inverted conditionals",
        "The seminar is examining formal conditional structures.",
        "Build conditionals without if.",
        "How would you say 'if I suggested' without using if?", "probing"),
      sc("Ms. Alvarez", "the examiner", "to check formal conditionals",
        "The examiner asks for a formal hypothetical.",
        "Use inversion accurately.",
        "Could you raise a hypothetical proposal in formal English?", "neutral"),
    ],
  },

  {
    id: "c1-had-it-not-been-for-you",
    topic: "crediting or blaming a single cause",
    objectives: [
      "Name the one thing that changed an outcome.",
      "Use but for as a compact alternative.",
    ],
    goal: "Credit or blame one decisive factor.",
    target: "had it not been for and but for",
    correction: "Rebuild the sentence around the decisive cause and let the learner try again.",
    summary: "You learned to name the single cause that changed an outcome.",
    minutes: 9,
    points: [
      {
        form: "had it not been",
        claims: [
          "'Had it not been for X, Y would have happened' names the one thing that prevented Y.",
          "This is the inverted form of 'if it had not been for'.",
        ],
        ex: ["Had it not been for you, we would have missed it.", "Had it not been for the delay, everything would have gone smoothly."],
      },
        {
        form: "but for your",
        claims: [
          "'But for' is the compact version and is followed by a noun phrase.",
          "'But for your help, we would have failed' says the same in fewer words.",
        ],
        ex: ["But for your help, we would have failed.", "But for the weather, the event would have gone ahead."],
      },
      {
        form: "if it weren't for",
        claims: [
          "'If it weren't for' names a cause that is still true now; 'if it hadn't been for' names a past one.",
          "A present cause can still change a past result: 'If it weren't for you, I'd have given up.'",
        ],
        ex: ["If it weren't for the noise, this would be ideal.", "If it weren't for you, I'd have given up."],
      },
    ],
    ex: [],
    drills: [
      // p1 — had it not been
      fc("p1", "Had it not ___ for the map, we would have got lost.", ["been", "be", "being"]),
      chat("p1", ["Thank goodness the nurse was there.", null], [
        "Yes. Had it not been for her, we would have panicked.",
        "Yes. Had not it been for her, we would have panicked.",
        "Yes. Had it not been for her, we would panic have.",
      ]),
      err("p1", "Had it not being for you, we would have missed it.", "being", "been"),
      // p2 — but for your
      fc("p2", "___ for your advice, I would have given up.", ["But", "Had", "If"]),
      sit("p2", "A colleague's quick warning stopped you making a costly mistake. You thank them in a few words. What do you say?", [
        "But for your warning, I would have made a costly mistake.",
        "But for you warned me, I would have made a costly mistake.",
        "But for your warning, I would make have a costly mistake.",
      ]),
      lc("p2", "But for the weather, we'd have won.", [
        "Because of the weather, we won.",
        "Bad weather? We'd have won anyway.",
      ]),
      // p3 — if it weren't for
      fc("p3", "If it ___ for my sister, I'd be living alone.", ["weren't", "isn't", "won't"]),
      sit("p3", "Your neighbour's dog barks all day, and today that is the only thing you dislike about your flat. What do you say?", [
        "If it weren't for the dog, this flat would be perfect.",
        "If it weren't for the dog, this flat will be perfect.",
        "If it isn't for the dog, this flat would be perfect.",
      ]),
      spk("p3", "If it weren't for you, I'd give up."),
      // karışık
      sit("mix", "Which two expressions mean the same?", [
        "'Had it not been for you, I would have failed.' and 'But for you, I would have failed.'",
        "'Had it not been for you, I would have failed.' and 'If you had been there, I would have failed.'",
        "'But for you, I would have failed.' and 'Because of you, I failed.'",
      ]),
      sit("mix", "Last year a teacher saved you from failing. Today a noisy flatmate stops you studying. Which pair is correct?", [
        "Had it not been for that teacher, I would have failed. If it weren't for my flatmate, I'd study more.",
        "Had it not been for that teacher, I would fail have. If it weren't for my flatmate, I'd study more.",
        "Had it not been for that teacher, I would have failed. If it isn't for my flatmate, I'd study more.",
      ]),
    ],
    success: "The learner names a decisive cause and its alternative outcome.",
    quiz: [
      qmcq("Which sentence points at a present cause?", [
        "If it weren't for the noise, this would be ideal.",
        "Had it not been for the noise, it would have been ideal.",
        "But for the noise, it was ideal.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "But for the weather, the trip would have been perfect.",
        "But the weather, the trip would have been perfect.",
        "But for the weather, the trip would be perfect have.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "Had it not been for you, I would have failed.",
        "Had not it been for you, I would have failed.",
        "Have it not been for you, I would have failed.",
      ], 0),
    ],
    scenes: [
      sc("Delphine", "someone who helped you years ago", "to hear what their help meant",
        "You are thanking someone whose help was decisive.",
        "Name what would have happened otherwise.",
        "It was such a small thing at the time. Did it really matter?", "modest"),
      sc("Tobias", "a colleague reviewing a rescued project", "to identify what saved the project",
        "A project nearly failed and was saved by one factor.",
        "Name the decisive cause.",
        "That project should have failed. What actually saved it?", "curious"),
      sc("Sandrine", "a fellow traveller after a close call", "to recognise what prevented disaster",
        "A journey was saved by one intervention.",
        "Name the decisive factor.",
        "We were so close to being stranded. What made the difference?", "relieved"),
      sc("Dr. Dabiri", "your tutor", "to practise counterfactual attribution",
        "The seminar is examining causal claims.",
        "Name a decisive cause and its alternative.",
        "Your group nearly missed the deadline, but one classmate stepped in. What made the difference?", "probing"),
      sc("Ms. Halvorsen", "the examiner", "to check counterfactual structures",
        "The examiner asks about a decisive influence.",
        "Name the cause and the alternative.",
        "Could you tell me about someone whose help changed your direction?", "neutral"),
    ],
  },

  {
    id: "c1-its-time-you-decided",
    topic: "the unreal past after certain expressions",
    objectives: [
      "Use a past form after it's time and would rather.",
      "Recognise that the past form is not about past time.",
    ],
    goal: "Press for a decision without giving an order.",
    target: "unreal past after it's time and would rather",
    correction: "Rebuild the sentence with the past form and let the learner press again.",
    summary: "You learned that it's time and would rather take a past form for present meaning.",
    minutes: 9,
    points: [
      {
        form: "it's time you",
        claims: [
          "'It's time you decided' normally uses a past form but refers to now.",
          "It suggests the decision is already overdue, without giving an order.",
        ],
        ex: ["It's time you decided one way or the other.", "It's time we talked about it."],
      },
      {
        form: "I'd rather you",
        claims: [
          "'I'd rather you didn't' also uses a past form for present or future meaning.",
          "The distance created by the past form is what makes it polite.",
        ],
        ex: ["I'd rather you didn't mention it.", "I'd rather we waited a week."],
      },
      {
        form: "it's about time",
        claims: [
          "'It's about time' adds impatience to the same structure.",
          "'It's high time' is an equally strong variant with the same past form.",
        ],
        ex: ["It's about time someone said it.", "It's high time we reviewed this."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's time you
      fc("p1", "It's time you ___ a new phone.", ["bought", "will buy", "buying"]),
      chat("p1", ["I still haven't told my boss I'm leaving.", null], [
        "It's time you told her.",
        "It's time you will tell her.",
        "It's time you telling her.",
      ]),
      lc("p1", "It's time you went home.", [
        "It's time we left.",
        "Is it time to go home?",
      ]),
      // p2 — I'd rather you
      fc("p2", "I'd rather you ___ smoke in the car.", ["didn't", "won't", "not to"]),
      sit("p2", "Your friend wants to tell everyone your news tonight. You want them to keep it secret. What do you say?", [
        "I'd rather you didn't tell anyone yet.",
        "I'd rather you to not tell anyone yet.",
        "I'd rather you not telling anyone yet.",
      ]),
      spk("p2", "I'd rather you waited a week."),
      // p3 — it's about time
      fc("p3", "It's about time someone ___ the truth.", ["told", "will tell", "telling"]),
      chat("p3", ["The council is finally fixing the road.", null], [
        "It's about time they fixed it.",
        "It's about time they fixing it.",
        "It's about time they will fix it.",
      ]),
      lc("p3", "It's high time we reviewed this.", [
        "Is it time we reviewed this?",
        "It's a high price to review this.",
      ]),
      // karışık
      sit("mix", "Your flatmate keeps postponing paying the bills. You push politely and say you prefer them to pay today. What do you say?", [
        "It's time you paid the bills. I'd rather you did it today.",
        "It's time you paying the bills. I'd rather you did it today.",
        "It's time you paid the bills. I'd rather you to do it today.",
      ]),
      chat("mix", ["We've been talking about moving for years.", null], [
        "It's about time we decided, and I'd rather we chose soon.",
        "It's about time we deciding, and I'd rather we chose soon.",
        "It's about time we decided, and I'd rather we choosing soon.",
      ]),
    ],
    success: "The learner applies pressure using the unreal past at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It's time we talked about it.",
        "It's time we will talk about it.",
        "It's time we are talking about it.",
      ], 0),
      qfill("I'd rather we ___ a week. (wait)", ["waited"]),
      qmcq("What does the past form do here?", [
        "It refers to the present with mild pressure.",
        "It refers to a past event.",
        "It makes the sentence a question.",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend avoiding a decision", "to be pushed gently towards deciding",
        "A friend has been putting off a decision for months.",
        "Press without ordering.",
        "I know, I know. I keep saying I will decide. Are you going to nag me?", "evasive"),
      sc("Owen", "a colleague delaying a sign-off", "to be moved to a decision",
        "A sign-off has been pending too long.",
        "Apply polite pressure.",
        "I have been meaning to look at it. Is it urgent?", "vague"),
      sc("Fatima", "a family member avoiding a conversation", "to have a conversation that keeps being postponed",
        "A necessary conversation keeps being avoided.",
        "Open it without confrontation.",
        "Now is not really a good time. Can it wait?", "reluctant"),
      sc("Mr. Tremblay", "your tutor", "to practise the unreal past",
        "The seminar is examining politeness through tense.",
        "Apply pressure with the unreal past.",
        "One of my students keeps delaying his thesis topic. How would you push him to decide?", "probing"),
      sc("Ms. Petrenko", "the examiner", "to check unreal past forms",
        "The examiner asks you to press for a decision.",
        "Use the unreal past correctly.",
        "How would you push someone to decide, without ordering them?", "neutral"),
    ],
  },

  {
    id: "c1-supposing-that-were-true",
    topic: "framing an extended hypothetical",
    objectives: [
      "Open a hypothetical that will run for several turns.",
      "Signal that you are not conceding the premise.",
    ],
    goal: "Set up a hypothetical you can explore without accepting it.",
    target: "framing an extended hypothetical",
    correction: "Model the framing sentence and let the learner set up their own hypothetical.",
    summary: "You learned to frame a hypothetical without conceding it is true.",
    minutes: 8,
    points: [
      {
        form: "supposing that were",
        claims: [
          "'Supposing that were true' opens a hypothetical using an unreal past form.",
          "Using 'were' rather than 'is' keeps more distance from the premise.",
        ],
        ex: ["Supposing that were true, what would follow?", "Supposing that were the case, we would need proof."],
      },
      {
        form: "for argument's sake",
        claims: [
          "'For argument's sake' makes explicit that the premise is provisional.",
          "It protects you from being quoted as agreeing with it.",
        ],
        ex: ["Let's say, for argument's sake, that it works.", "For argument's sake, assume the worst."],
      },
      {
        form: "assuming that's so",
        claims: [
          "'Assuming that's so' accepts the premise only for the length of the argument.",
          "'That's so' points back to what the other person has just claimed.",
        ],
        ex: ["Assuming that's so, where does it lead?", "Assuming that's so, we still have a problem."],
      },
    ],
    ex: [],
    drills: [
      // p1 — supposing that were
      fc("p1", "Supposing that ___ true, who would pay for it?", ["were", "be", "been"]),
      chat("p1", ["I read that the company will close next year.", null], [
        "Supposing that were true, what would happen to the staff?",
        "Supposing that were true, what would happens to the staff?",
        "Supposing that be true, what would happen to the staff?",
      ]),
      lc("p1", "Supposing that were true, what then?", [
        "So that was true, then?",
        "Suppose we went there, what then?",
      ]),
      // p2 — for argument's sake
      fc("p2", "Let's say, for argument's ___, that the plan works.", ["sake", "sakes", "safe"]),
      sit("p2", "You doubt your colleague's figures, but you want to discuss them without seeming to agree. What do you say?", [
        "Let's say, for argument's sake, that the figures are right.",
        "Let's say, for argument sake's, that the figures are right.",
        "Let's say, for the argument's sake of, that the figures are right.",
      ]),
      spk("p2", "For argument's sake, assume it works."),
      // p3 — assuming that's so
      fc("p3", "Assuming that's ___, we still have a problem.", ["so", "such", "as"]),
      chat("p3", ["The new system will save us ten hours a week.", null], [
        "Assuming that's so, what will we do with the time?",
        "Assuming that's so, what we will do with the time?",
        "Assumed that's so, what will we do with the time?",
      ]),
      lc("p3", "Assuming that's so, we need more staff.", [
        "As soon as that's done, we need more staff.",
        "Since that's the case, we need fewer staff.",
      ]),
      // karışık
      sit("mix", "A friend claims a famous painting is fake. You explore the idea without agreeing, then accept it just for the next step. What do you say?", [
        "Supposing that were true, who painted it? And assuming that's so, where is the real one?",
        "Supposing that were true, who painted it? And assumed that's so, where is the real one?",
        "Supposing that be true, who painted it? And assuming that's so, where is the real one?",
      ]),
      chat("mix", ["Imagine robots do all the work by 2040.", null], [
        "Let's say, for argument's sake, that they do. Supposing that were so, how would people earn money?",
        "Let's say, for argument sakes, that they do. Supposing that were so, how would people earn money?",
        "Let's say, for argument's sake, that they do. Supposing that were so, how people would earn money?",
      ]),
    ],
    success: "The learner explores a premise without conceding it.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Supposing that were the case, we would need proof.",
        "Supposing that was the case, we will need proof.",
        "Supposing that is the case, we would needed proof.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "For argument's sake, assume the worst.",
        "For argument sake's, assume the worst.",
        "For the argument's sakes, assume the worst.",
      ], 0),
      qmcq("What does the past form signal?", [
        "that you keep your distance from the premise",
        "that the event happened in the past",
        "that the claim is definitely false",
      ], 0),
    ],
    scenes: [
      sc("Konstantin", "a friend making a doubtful claim", "to have the claim taken seriously",
        "A friend has made a claim you find unlikely.",
        "Explore it without conceding.",
        "I'm sure this city will ban cars within five years. You don't believe me, do you?", "insistent"),
      sc("Adaeze", "a colleague proposing a risky assumption", "to test the assumption properly",
        "A plan rests on an assumption worth testing.",
        "Explore it hypothetically.",
        "The whole plan assumes the funding lands. Shall we test that?", "analytical"),
      sc("Lasse", "an academic contact debating a claim", "to examine a claim rigorously",
        "A seminar discussion turns on a contested premise.",
        "Explore the premise without accepting it.",
        "My paper claims that homework has no effect on learning. You doubt it, but where would it take us?", "rigorous"),
      sc("Mrs. Ekwueme", "your tutor", "to practise hypothetical framing",
        "The seminar is examining provisional reasoning.",
        "Frame a hypothetical without conceding.",
        "A classmate claims that grades do not matter at all. You doubt it. How would you explore the idea?", "probing"),
      sc("Mr. Nyberg", "the examiner", "to check hypothetical framing",
        "The examiner states something contestable.",
        "Explore it without conceding.",
        "Suppose I told you that exams predict nothing at all. Your response?", "neutral"),
    ],
  },

  {
    id: "c1-on-the-assumption-that",
    topic: "stating what your argument rests on",
    objectives: [
      "Name the assumption your argument depends on.",
      "Distinguish an assumption from a claim.",
    ],
    goal: "Make the foundations of your argument explicit.",
    target: "stating assumptions openly",
    correction: "Model the assumption-naming sentence and let the learner state their own.",
    summary: "You learned to state openly what your argument rests on.",
    minutes: 8,
    points: [
      {
        form: "on the assumption",
        claims: [
          "'On the assumption that' names a premise you have not proved.",
          "Naming it protects the argument: if the premise falls, only that branch falls.",
        ],
        ex: ["On the assumption that funding continues, we can plan.", "On the assumption that nothing changes, the plan holds."],
      },
      {
        form: "taking as given",
        claims: [
          "'Taking as given' sets a premise aside rather than defending it.",
          "It signals that the premise is not what you want to argue about.",
        ],
        ex: ["Taking as given that the data is sound, the trend is clear.", "Taking that as given, what follows?"],
      },
      {
        form: "starting from the idea",
        claims: [
          "'Starting from the idea that' locates the beginning of your reasoning.",
          "It is less formal than the other two and common in discussion.",
        ],
        ex: ["Starting from the idea that people are rational, the model works.", "Starting from the idea that it matters, we should act now."],
      },
    ],
    ex: [],
    drills: [
      // p1 — on the assumption
      fc("p1", "On the ___ that prices stay the same, we can afford it.", ["assumption", "assume", "assuming"]),
      sit("p1", "Your plan only works if the bus strike ends on Monday, which nobody has confirmed. How do you present the plan?", [
        "On the assumption that the strike ends on Monday, we can travel on Tuesday.",
        "On the assumption the strike ending on Monday, we can travel on Tuesday.",
        "On the assume that the strike ends on Monday, we can travel on Tuesday.",
      ]),
      lc("p1", "On the assumption that nothing changes, we're fine.", [
        "Assume nothing changes, and we're fine.",
        "Nothing has changed, so we were fine.",
      ]),
      // p2 — taking as given
      fc("p2", "Taking ___ given that the survey is accurate, sales will rise.", ["as", "it", "for"]),
      chat("p2", ["But is the data even reliable?", null], [
        "Let's not argue about that now. Taking as given that it is, the trend is clear.",
        "Let's not argue about that now. Taking as giving that it is, the trend is clear.",
        "Let's not argue about that now. Taking as give that it is, the trend is clear.",
      ]),
      spk("p2", "Taking that as given, the plan works."),
      // p3 — starting from the idea
      fc("p3", "Starting from the idea ___ everyone wants to save money, the offer makes sense.", ["that", "what", "which"]),
      sit("p3", "In a relaxed discussion, you say where your reasoning begins: people learn best by doing. What do you say?", [
        "Starting from the idea that people learn best by doing, practice should come first.",
        "Starting from the idea what people learn best by doing, practice should come first.",
        "Starting from the idea that people learns best by doing, practice should come first.",
      ]),
      chat("p3", ["How did you build the model?", null], [
        "Starting from the idea that people are rational.",
        "Starting from the idea that people is rational.",
        "Starting the idea from that people are rational.",
      ]),
      // karışık
      sit("mix", "Your forecast rests on two premises: demand holds (not proven) and the data is sound (not up for debate). What do you say?", [
        "On the assumption that demand holds, and taking as given that the data is sound, we'll grow.",
        "On the assume that demand holds, and taking as given that the data is sound, we'll grow.",
        "On the assumption that demand holds, and taking as giving that the data is sound, we'll grow.",
      ]),
      lc("mix", "Taking as given that it's legal, and on the assumption that it's cheap, we'll do it.", [
        "Taking it as legal, and assuming it's cheap, we did it.",
        "Given that it's legal and cheap, we did it last year.",
      ]),
    ],
    success: "The learner names at least one assumption explicitly.",
    quiz: [
      qmcq("Which sentence names a premise without proving it?", [
        "On the assumption that nothing changes, this holds.",
        "Nothing will change, so this holds.",
        "This holds because nothing ever changes.",
      ], 0),
      qfill("Taking that as ___, what follows? (give)", ["given"]),
      qmcq("Why name your assumptions?", [
        "If the premise falls, only that branch falls.",
        "It makes the argument longer.",
        "It is required in formal English.",
      ], 0),
    ],
    scenes: [
      sc("Ilse", "a friend questioning your reasoning", "to see where your reasoning starts",
        "A friend cannot see how you reached your conclusion.",
        "Name your assumptions.",
        "I follow the conclusion but not how you got there. Where do you start?", "curious"),
      sc("Tomasz", "a colleague reviewing a forecast", "to test what the forecast depends on",
        "A forecast rests on unstated assumptions.",
        "Name the assumptions.",
        "This forecast looks confident. What is it resting on?", "sceptical"),
      sc("Priya", "an academic reviewing your argument", "to identify unstated premises",
        "An argument is being examined for hidden premises.",
        "State the premises openly.",
        "Every argument has a hidden premise. What is yours?", "rigorous"),
      sc("Mr. Achebe", "your tutor", "to practise naming assumptions",
        "The seminar is examining argument foundations.",
        "Name an assumption explicitly.",
        "What is your argument resting on that you have not said?", "probing"),
      sc("Ms. Berger", "the examiner", "to check argument transparency",
        "The examiner asks you to justify a position.",
        "Name your assumptions.",
        "Could you argue a position and tell me what it depends on?", "neutral"),
    ],
  },

  {
    id: "c1-a-thought-experiment",
    topic: "reasoning through an impossible scenario",
    objectives: [
      "Set up an impossible scenario deliberately.",
      "Follow its consequences step by step.",
    ],
    goal: "Use an impossible scenario to test an idea.",
    target: "constructing a thought experiment",
    correction: "Model the step that moves the scenario forward and let the learner continue.",
    summary: "You practised reasoning step by step through an impossible scenario.",
    minutes: 8,
    points: [
      {
        form: "imagine for a moment",
        claims: [
          "'Imagine for a moment' asks the listener to suspend disbelief briefly.",
          "'For a moment' limits the request, which makes it easier to grant.",
        ],
        ex: ["Imagine for a moment that money were no object.", "Imagine for a moment nobody objected."],
      },
      {
        form: "suppose instead that",
        claims: [
          "'Suppose instead that' replaces one element of the scenario and keeps the rest.",
          "Changing one variable at a time is what makes the experiment informative.",
        ],
        ex: ["Suppose instead that we had twice the time.", "Suppose instead that nobody knew."],
      },
      {
        form: "where would that leave",
        claims: [
          "'Where would that leave us?' asks for the consequence of the change.",
          "It hands the reasoning to the other person rather than concluding alone.",
        ],
        ex: ["Where would that leave the argument?", "Where would that leave us in practice?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — imagine for a moment
      chat("p1", ["Money is the only reason people work.", null], [
        "Imagine for a moment that everyone were rich. Would anyone still work?",
        "Imagine for a moment that everyone were rich. Would anyone still works?",
        "Imagining for a moment that everyone were rich. Would anyone still work?",
      ]),
      fc("p1", "___ for a moment that you could fly.", ["Imagine", "Imagined", "Imagination"]),
      spk("p1", "Imagine for a moment nobody came."),
      // p2 — suppose instead that
      sit("p2", "You imagined a world with free trains. Now you change only one thing: they are free but slow. What do you say?", [
        "Suppose instead that the trains were free but slow.",
        "Suppose instead the trains are free but slowly.",
        "Suppose instead of the trains were free but slow.",
      ]),
      fc("p2", "Suppose instead that we ___ twice the time.", ["had", "having", "to have"]),
      lc("p2", "Suppose instead that nobody noticed.", [
        "So instead, nobody noticed.",
        "Suppose we noticed nobody instead.",
      ]),
      // p3 — where would that leave
      chat("p3", ["So let's say the office closes and everyone works from home.", null], [
        "Where would that leave the junior staff?",
        "Where would that leaves the junior staff?",
        "Where that would leave the junior staff?",
      ]),
      fc("p3", "Where would that ___ us in practice?", ["leave", "left", "leaving"]),
      spk("p3", "Where would that leave us?"),
      // karışık
      sit("mix", "You imagined every shop staying open all night. Now you change one detail and ask about the result. What do you say?", [
        "Suppose instead that only the pharmacy stayed open. Where would that leave its staff?",
        "Suppose instead that only the pharmacy stayed open. Where would that leaves its staff?",
        "Suppose instead of only the pharmacy stayed open. Where would that leave its staff?",
      ]),
      chat("mix", ["Let's test my claim that homework is useless.", null], [
        "Imagine for a moment there were no homework. Where would that leave the weaker students?",
        "Imagine for a moment there were no homework. Where would that leaves the weaker students?",
        "Imagine for a moment there were no homework. Where that would leave the weaker students?",
      ]),
    ],
    success: "The learner sets up a scenario and follows at least one consequence.",
    quiz: [
      qmcq("Which sentence limits the request?", [
        "Imagine for a moment nobody objected.",
        "Imagine nobody ever objects to anything.",
        "Nobody objects, so imagine it.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "Suppose instead that nobody knew.",
        "Suppose instead of that nobody knew.",
        "Suppose instead nobody knowing.",
      ], 0),
      qmcq("Why change one variable at a time?", [
        "It makes the experiment informative.",
        "It shortens the discussion.",
        "It avoids using the past tense.",
      ], 0),
    ],
    scenes: [
      sc("Rafael", "a friend who thinks in absolutes", "to see a question from a new angle",
        "A friend is stuck on one framing of a problem.",
        "Reframe it as a thought experiment.",
        "The only way to fix traffic is to build more roads. There is no other way to look at it, surely?", "fixed"),
      sc("Ingrid", "a colleague designing a strategy", "to stress-test a strategy",
        "A strategy needs testing against extreme cases.",
        "Construct the thought experiment.",
        "Let us break this before it breaks us. Where do we start?", "analytical"),
      sc("Kofi", "an academic contact", "to explore a theoretical problem",
        "A theoretical question is under discussion.",
        "Reason through the impossible case.",
        "The realistic cases are boring. What about the impossible one?", "playful"),
      sc("Mrs. Nowak", "your tutor", "to practise thought experiments",
        "The seminar is using hypothetical reasoning.",
        "Construct and follow a scenario.",
        "Take a claim and test it with an impossible case. Which claim?", "probing"),
      sc("Mr. Delacroix", "the examiner", "to check hypothetical reasoning",
        "The examiner asks for abstract reasoning.",
        "Construct a scenario and follow it.",
        "Could you test an idea by imagining a world where it fails?", "neutral"),
    ],
  },

  {
    id: "c1-if-things-were-otherwise",
    topic: "sustained discussion of an alternative reality",
    objectives: [
      "Sustain an alternative-reality discussion over several turns.",
      "Connect the alternative back to the real situation.",
    ],
    goal: "Discuss at length how a real situation could have gone differently.",
    target: "sustained counterfactual discussion",
    correction: "Model the connecting sentence and let the learner extend the alternative.",
    summary: "You practised discussing at length how a real situation could have been different.",
    minutes: 8,
    points: [
      {
        form: "were things different",
        claims: [
          "'Were things different' opens an alternative without naming what would change.",
          "The vagueness is useful when several things would have to change at once.",
        ],
        ex: ["Were things different, we would be living abroad now.", "Were things otherwise, this would be simple."],
      },
      {
        form: "in another world",
        claims: [
          "'In another world' marks the alternative as clearly unreal.",
          "It signals that you are not proposing the alternative, only exploring it.",
        ],
        ex: ["In another world, we would have met earlier.", "In another world this would be easy."],
      },
      {
        form: "that would change everything",
        claims: [
          "'That would change everything' connects the alternative back to the real case.",
          "Without that connection, the discussion stays abstract.",
        ],
        ex: ["That would change everything for us.", "That would change the whole picture."],
      },
    ],
    ex: [],
    drills: [
      // p1 — were things different
      fc("p1", "___ things different, I would still live by the sea.", ["Were", "Was", "Are"]),
      chat("p1", ["Do you ever wish you'd stayed in your home town?", null], [
        "Sometimes. Were things different, I'd be there now.",
        "Sometimes. Were things different, I'll be there now.",
        "Sometimes. Was things different, I'd be there now.",
      ]),
      lc("p1", "Were things different, we'd live abroad.", [
        "When things were different, we lived abroad.",
        "Where things are different, we'd like to live.",
      ]),
      // p2 — in another world
      fc("p2", "In ___ world, we would have met at school.", ["another", "other", "an other"]),
      sit("p2", "You explore a life where you became a musician, and make clear it is unreal and not a plan. What do you say?", [
        "In another world, I'd be a musician.",
        "In another world, I'm be a musician.",
        "In other world, I'd be a musician.",
      ]),
      spk("p2", "In another world, this would be easy."),
      // p3 — that would change everything
      chat("p3", ["Imagine if your parents lived next door now.", null], [
        "That would change everything for us.",
        "That would changes everything for us.",
        "That will changing everything for us.",
      ]),
      fc("p3", "That would ___ everything, from where we live to what we do.", ["change", "changed", "changing"]),
      sit("p3", "You and a friend imagined a different past. Now you connect it back to your real life today. Which sentence is correct?", [
        "That would change everything about how we live now.",
        "That would changed everything about how we live now.",
        "That would change everythings about how we live now.",
      ]),
      // karışık
      sit("mix", "You imagine your life without the move abroad, mark it as unreal, and connect it to today. What do you say?", [
        "In another world, I'd never have left. That would change everything now.",
        "In another world, I'll never have left. That would change everything now.",
        "In other world, I'd never have left. That would change everything now.",
      ]),
      lc("mix", "Were things different, that would change everything.", [
        "Where things are different, that changes everything.",
        "Were things the same, nothing would change.",
      ]),
    ],
    success: "The learner sustains an alternative and links it to the real situation.",
    quiz: [
      qmcq("Which sentence connects the alternative to reality?", [
        "That would change the whole picture.",
        "In another world it is different.",
        "Were things otherwise entirely.",
      ], 0),
      qfill("___ things otherwise, this would be simple. (be)", ["Were"]),
      qmcq("Why connect the alternative back?", [
        "Otherwise the discussion stays abstract.",
        "Otherwise the grammar is wrong.",
        "Otherwise the tense cannot be formed.",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a close friend late at night", "to think through the roads not taken",
        "A long honest conversation about paths not taken.",
        "Sustain the alternative and connect it back.",
        "Do you ever run the other version of your life in your head?", "reflective"),
      sc("Ravi", "a colleague after a restructuring", "to make sense of how things went",
        "A restructuring changed several careers.",
        "Explore the alternative and its meaning now.",
        "If that decision had gone the other way, where would we all be?", "thoughtful"),
      sc("Elif", "someone met while travelling", "to trade counterfactual life stories",
        "Travellers discuss the lives they did not live.",
        "Sustain the alternative.",
        "Everyone out here left a version of themselves behind. What was yours?", "candid"),
      sc("Professor Kimura", "your tutor", "to practise sustained counterfactuals",
        "The seminar is examining extended hypothetical reasoning.",
        "Sustain and connect the alternative.",
        "If you had studied a different subject, where would you be now?", "probing"),
      sc("Ms. Bianchi", "the examiner", "to check sustained hypothetical discourse",
        "The examiner asks for an extended answer.",
        "Sustain the alternative and connect it back.",
        "Could you discuss how one different decision would have changed your life?", "neutral"),
    ],
  },

  // --- Ünite 3 · Saying Less, Meaning More -----------------------------------
  {
    id: "c1-i-would-if-i-could",
    topic: "leaving out what the listener can supply",
    objectives: [
      "Leave out a verb phrase the listener can reconstruct.",
      "Judge when the omission is clear enough.",
    ],
    goal: "Say less when the rest is already understood.",
    target: "verb-phrase ellipsis",
    correction: "Rebuild the shortened sentence and let the learner shorten their own.",
    summary: "You learned to leave out a verb phrase the listener can already supply.",
    minutes: 9,
    points: [
      {
        form: "I would if",
        claims: [
          "'I would if I could' leaves out the repeated verb phrase after 'would' and 'could'.",
          "The auxiliary stays; only the part already known is dropped.",
        ],
        ex: ["I would if I could.", "She hasn't, but she will."],
      },
      {
        form: "I'd love to but",
        claims: [
          "'I'd love to' ends with 'to' and leaves the verb unsaid.",
          "This is the standard polite refusal and rarely needs completing.",
        ],
        ex: ["I'd love to, but I can't.", "I meant to, but I forgot."],
      },
      {
        form: "I wish I could",
        claims: [
          "'I wish I could' leaves out the verb the other person has just used.",
          "Ellipsis works only when the missing part is recoverable from context.",
          "If the listener has to guess, say the whole thing instead.",
        ],
        ex: ["I wish I could.", "I would have, but nobody asked."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I would if
      fc("p1", "I would if I ___, but I'm working tonight.", ["could", "can", "would"]),
      chat("p1", ["Can you lend me your car this weekend?", null], [
        "I would if I could, but it's at the garage.",
        "I will if I could, but it's at the garage.",
        "I would if I could it, but it's at the garage.",
      ]),
      lc("p1", "He hasn't called yet, but he will.", [
        "He hasn't called, and he won't.",
        "He has called; yes, he will again.",
      ]),
      // p2 — I'd love to but
      fc("p2", "I'd love ___, but I'm away that weekend.", ["to", "for", "of"]),
      sit("p2", "A colleague invites you to dinner, but you have a deadline. Decline politely in a few words.", [
        "I'd love to, but I can't tonight.",
        "I'd love to go to, but I can't tonight.",
        "I'd love, but I can't tonight.",
      ]),
      spk("p2", "I'd love to, but I can't."),
      // p3 — I wish I could
      fc("p3", "I wish I ___, but I have to work.", ["could", "can", "will"]),
      chat("p3", ["Are you coming to the beach tomorrow?", null], [
        "I wish I could, but I'm on duty.",
        "I wish I can, but I'm on duty.",
        "I wish I could to, but I'm on duty.",
      ]),
      spk("p3", "I wish I could, but not today."),
      // karışık
      sit("mix", "A friend asks if you'll join a trip. You'd like to, but you can't afford it. Which reply is correct?", [
        "I'd love to, but I can't afford it. I would if I could.",
        "I'd love to, but I can't afford it. I would if I can.",
        "I'd love, but I can't afford it. I would if I could.",
      ]),
      chat("mix", ["Will you help me move house on Saturday?", null], [
        "I wish I could. I would if I weren't working.",
        "I wish I can. I would if I weren't working.",
        "I wish I could. I would if I wasn't work.",
      ]),
    ],
    success: "The learner omits recoverable material at least twice without losing clarity.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "She hasn't, but she will.",
        "She hasn't, but she will do it will.",
        "She hasn't, but will she.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "I meant to, but I forgot.",
        "I meant, but I forgot to it.",
        "I meant to it, but I forgot.",
      ], 0),
      qmcq("When does ellipsis fail?", [
        "when the listener has to guess",
        "when the sentence is long",
        "when there are two verbs",
      ], 0),
    ],
    scenes: [
      sc("Marisol", "a friend inviting you repeatedly", "to accept your refusals gracefully",
        "A friend keeps inviting you and you keep declining.",
        "Decline economically.",
        "Third time lucky? Come out with us tonight?", "hopeful"),
      sc("Hendrik", "a colleague asking for help", "to understand why you cannot help",
        "A colleague needs help you cannot give.",
        "Decline without over-explaining.",
        "Any chance you could take this one?", "hopeful"),
      sc("Nala", "a host offering more food", "to accept a polite refusal",
        "A host keeps offering and you must decline.",
        "Decline politely and economically.",
        "There is plenty left. Are you sure you have had enough?", "insistent"),
      sc("Mr. Villanueva", "your tutor", "to practise ellipsis",
        "The seminar is examining economical speech.",
        "Leave out what is recoverable.",
        "Can you join our study group tonight?", "probing"),
      sc("Ms. Sorensen", "the examiner", "to check ellipsis",
        "The examiner offers you something you must decline.",
        "Decline economically.",
        "Would you like to extend this session by an hour?", "neutral"),
    ],
  },

  {
    id: "c1-some-do-some-dont",
    topic: "standing in for a whole idea",
    objectives: [
      "Replace a repeated verb phrase with do, or a whole statement with so or neither.",
      "Agree or disagree without repeating the statement.",
    ],
    goal: "Respond to a statement without repeating any of it.",
    target: "substitution with do, so and neither",
    correction: "Rebuild the short response and let the learner respond again economically.",
    summary: "You learned to stand in for a whole idea with do, so and neither.",
    minutes: 9,
    points: [
      {
        form: "some do",
        claims: [
          "'Do' can stand in for a whole verb phrase: some people travel, some do not.",
          "The auxiliary carries the meaning and the rest is dropped.",
        ],
        ex: ["Some do, some don't.", "He said he would, and he did."],
      },
      {
        form: "so do I",
        claims: [
          "'So do I' agrees with a positive statement and inverts the order.",
          "'Neither do I' does the same for a negative one.",
          "The auxiliary matches the first statement: 'I enjoyed it.' 'So did I.'",
        ],
        ex: ["So do I.", "So did everyone else."],
      },
      {
        form: "neither did she",
        claims: [
          "After a negative statement, use 'neither' or 'nor' with inversion.",
          "'Me neither' is the informal spoken equivalent.",
        ],
        ex: ["Neither did she.", "Nor had anyone else."],
      },
    ],
    ex: [],
    drills: [
      // p1 — some do
      fc("p1", "Not everyone likes spicy food. Some ___, some don't.", ["do", "does", "are"]),
      chat("p1", ["Do your colleagues work from home?", null], [
        "Some do, some don't.",
        "Some does, some doesn't.",
        "Some do, some aren't.",
      ]),
      sit("p1", "You promised to call your mother, and you did. A friend asks if you called. Answer without repeating the verb.", [
        "I said I would, and I did.",
        "I said I would, and I was.",
        "I said I would, and I called did.",
      ]),
      // p2 — so do I
      fc("p2", "'I enjoyed the concert.' 'So ___ I.'", ["did", "do", "was"]),
      chat("p2", ["I love early mornings.", null], [
        "So do I.",
        "So am I.",
        "So does I.",
      ]),
      lc("p2", "So did my brother.", [
        "So my brother did it.",
        "Sadly, my brother did not.",
      ]),
      // p3 — neither did she
      fc("p3", "'Tom didn't like the film.' '___ did she.'", ["Neither", "Either", "So"]),
      sit("p3", "Your colleague says, 'I didn't get the email.' Your manager didn't get it either. What do you say?", [
        "Neither did she.",
        "Neither she did.",
        "Neither didn't she.",
      ]),
      spk("p3", "Neither did she."),
      // karışık
      sit("mix", "Which pair of replies is correct for 'I passed the test.' and then 'I didn't pass the test.'?", [
        "So did I. / Neither did I.",
        "So did I. / So didn't I.",
        "So passed I. / Neither did I.",
      ]),
      chat("mix", ["Do teachers here give homework at weekends?", null], [
        "Some do, some don't. Mine doesn't, and neither did my old one.",
        "Some does, some don't. Mine doesn't, and neither did my old one.",
        "Some do, some don't. Mine doesn't, and neither my old one did.",
      ]),
    ],
    success: "The learner responds with substitution at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Neither had anyone else.",
        "Neither anyone else had.",
        "Neither did anyone else had.",
      ], 0),
      qfill("So ___ everyone else, as it turned out. (do)", ["did"]),
      qmcq("What does 'do' stand in for?", [
        "a whole verb phrase already stated",
        "the subject of the sentence",
        "the tense of the main verb",
      ], 0),
    ],
    scenes: [
      sc("Camille", "a friend making a series of claims", "to be agreed with or contradicted",
        "A friend is making a rapid series of statements.",
        "Respond economically to each.",
        "I love winter, I hate crowds, and I never plan anything. You?", "rapid"),
      sc("Stefan", "a colleague comparing habits", "to compare working habits quickly",
        "Colleagues are comparing how they work.",
        "Respond with substitution.",
        "I work early and never check email at night. Does everyone on your team work like that?", "brisk"),
      sc("Rosa", "a fellow guest at a dinner", "to keep a fast conversation going",
        "A fast-moving dinner conversation.",
        "Respond economically.",
        "I didn't enjoy the boat trip yesterday. Did your friend like it?", "chatty"),
      sc("Mrs. Chen", "your tutor", "to practise substitution",
        "The seminar is examining economical response.",
        "Respond without repeating.",
        "I always read the notes before class. Do you?", "probing"),
      sc("Mr. Ferreira", "the examiner", "to check substitution",
        "The examiner makes several statements.",
        "Respond economically.",
        "I find long meetings useless and short ones worse. Do you?", "neutral"),
    ],
  },

  {
    id: "c1-not-that-id-mind",
    topic: "throwaway qualifications",
    objectives: [
      "Add a qualification after the main statement.",
      "Adjust what you said without withdrawing it.",
    ],
    goal: "Soften or sharpen what you just said with a short afterthought.",
    target: "post-hoc qualifications",
    correction: "Model the trailing qualification and let the learner adjust their own statement.",
    summary: "You learned to adjust a statement with a short qualification afterwards.",
    minutes: 8,
    points: [
      {
        form: "not that I'd",
        claims: [
          "'Not that I'd mind' adds a qualification after the statement is complete.",
          "It adjusts the statement without taking it back.",
        ],
        ex: ["They may cancel. Not that I'd mind.", "He might refuse. Not that I'd blame him."],
      },
      {
        form: "if anything",
        claims: [
          "'If anything' introduces a correction in the opposite direction to expected.",
          "'It wasn't worse; if anything it was better' shows the reversal.",
        ],
        ex: ["If anything, it was better than last year.", "If anything, the problem has grown."],
      },
      {
        form: "though I doubt it",
        claims: [
          "'Though I doubt it' undercuts your own statement without retracting it.",
          "It is a hedge added after the fact, not a change of position.",
        ],
        ex: ["They may come round, though I doubt it.", "It might work, though I doubt it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — not that I'd
      fc("p1", "They might cancel the party. Not ___ I'd mind.", ["that", "what", "it"]),
      chat("p1", ["I heard the trip might be shortened.", null], [
        "Not that I'd mind. I'm exhausted.",
        "Not that I mind would. I'm exhausted.",
        "Not what I'd mind. I'm exhausted.",
      ]),
      lc("p1", "He might say no. Not that I'd blame him.", [
        "He might say no, and I'd blame him.",
        "He might know. Not that I'd tell him.",
      ]),
      // p2 — if anything
      fc("p2", "The new version isn't slower. If ___, it's faster.", ["anything", "something", "nothing"]),
      sit("p2", "People expected the queue to be longer this year, but it is actually shorter. What do you say?", [
        "If anything, it's shorter this year.",
        "If anything, it's longer this year.",
        "If something, it's shorter this year.",
      ]),
      spk("p2", "If anything, it's easier now."),
      // p3 — though I doubt it
      fc("p3", "He might apologise, though I ___ it.", ["doubt", "doubting", "doubtful"]),
      chat("p3", ["Do you think the shop will refund you?", null], [
        "They might, though I doubt it.",
        "They might, though I doubt.",
        "They might, though I'm doubt it.",
      ]),
      sit("p3", "You say the team may win, then undercut your own prediction straight away. What do you say?", [
        "They may win, though I doubt it.",
        "They may win, though I doubt it not.",
        "They may win, though doubt I it.",
      ]),
      // karışık
      sit("mix", "Your manager may move you to another office. You add that you wouldn't be upset, and that the new one is actually closer. What do you say?", [
        "Not that I'd mind. If anything, the new office is closer.",
        "Not that I'd mind. If something, the new office is closer.",
        "Not that I mind would. If anything, the new office is closer.",
      ]),
      chat("mix", ["Will the meeting finish early?", null], [
        "It might, though I doubt it. Not that I'd complain.",
        "It might, though I doubt it. Not that I complain would.",
        "It might, through I doubt it. Not that I'd complain.",
      ]),
    ],
    success: "The learner adds trailing qualifications at least twice.",
    quiz: [
      qmcq("Which sentence undercuts without retracting?", [
        "They may come round, though I doubt it.",
        "They will definitely come round.",
        "They will never come round at all.",
      ], 0),
      qmcq("Which sentence is correct?", [
        "If anything, the problem has grown.",
        "If something, the problem has grown.",
        "If any, the problem has grown.",
      ], 0),
      qmcq("What does 'not that I'd mind' do?", [
        "adjusts the statement without taking it back",
        "withdraws the statement completely",
        "asks the listener a question",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "a friend reading your mood", "to work out how you really feel",
        "A friend is trying to gauge your real position.",
        "Qualify your statements as you go.",
        "They may cancel our trip. How would you feel about that?", "perceptive"),
      sc("Simone", "a colleague gauging your view", "to hear your honest but hedged opinion",
        "A colleague wants your real view on a likely change.",
        "State and qualify.",
        "They might restructure again. How do you feel about that?", "careful"),
      sc("Emil", "a fellow guest making predictions", "to compare predictions",
        "Predictions are being traded over dinner.",
        "Predict and qualify.",
        "It will all be resolved by spring, I reckon. You?", "confident"),
      sc("Mrs. Aguilar", "your tutor", "to practise trailing qualification",
        "The seminar is examining hedged assertion.",
        "Qualify a statement after making it.",
        "The seminar may be cancelled next week. Would that bother you?", "probing"),
      sc("Mr. Nakamura", "the examiner", "to check hedged assertion",
        "The examiner asks for a prediction.",
        "State and qualify it.",
        "Do you think this course will change how you work?", "neutral"),
    ],
  },

  {
    id: "c1-reading-what-isnt-said",
    topic: "naming an implication",
    objectives: [
      "State the implication behind someone's words.",
      "Distinguish what was said from what was meant.",
    ],
    goal: "Say out loud what someone has implied but not stated.",
    target: "naming implications",
    correction: "Model the implication-naming sentence and let the learner state their own reading.",
    summary: "You learned to name the implication behind what someone said.",
    minutes: 8,
    points: [
      {
        form: "what he's getting at",
        claims: [
          "'What he's getting at is...' names the point behind the words.",
          "It attributes an intention, so it can be wrong and should be offered tentatively.",
        ],
        ex: ["What he's getting at is the cost.", "What she's getting at is that nobody consulted her."],
      },
      {
        form: "she's hinting that",
        claims: [
          "'Hinting' says the speaker meant to be understood without saying it.",
          "'Implying' is relatively neutral; 'insinuating' suggests something negative is being hinted at.",
        ],
        ex: ["She's hinting that the deadline will move.", "He's implying that we knew."],
      },
      {
        form: "that implies",
        claims: [
          "'That implies' points at what the words suggest rather than at the speaker's intention.",
          "This separates what the words suggest from what the person intended.",
        ],
        ex: ["That implies the decision is already made.", "That implies we were not told."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what he's getting at
      fc("p1", "What she's getting ___ is that nobody asked her.", ["at", "in", "by"]),
      chat("p1", ["He kept saying the old supplier was 'very affordable'.", null], [
        "What he's getting at is the cost of the new one.",
        "What he's getting at are the cost of the new one.",
        "What he gets at it is the cost of the new one.",
      ]),
      lc("p1", "What he's getting at is the timing.", [
        "What he's forgetting is the timing.",
        "He's getting the time at work.",
      ]),
      // p2 — she's hinting that
      fc("p2", "He keeps mentioning the new restaurant. He's ___ that he wants to go.", ["hinting", "hint", "hinted"]),
      sit("p2", "A colleague says, 'Some of us managed to finish on time,' meaning you didn't. What do you say about her remark?", [
        "She's insinuating that I was slow.",
        "She's insinuating me that I was slow.",
        "She insinuating that I was slow.",
      ]),
      spk("p2", "She's hinting that she wants to leave."),
      // p3 — that implies
      fc("p3", "The report says sales 'held steady'. That ___ they didn't grow.", ["implies", "implying", "imply"]),
      chat("p3", ["The email says the decision 'will be shared in due course'.", null], [
        "That implies they may already have decided.",
        "That implies they may already have decide.",
        "That is implies they may already have decided.",
      ]),
      lc("p3", "That implies we were wrong.", [
        "That is why we were wrong.",
        "That simply means we were right.",
      ]),
      // karışık
      sit("mix", "Your friend's boss said, 'We'll see how things go.' You name his point, then what his words suggest. What do you say?", [
        "I think what he's getting at is no. That implies he may have decided.",
        "I think what he's getting at is no. That implying he may have decided.",
        "I think what he's getting on is no. That implies he may have decided.",
      ]),
      chat("mix", ["My landlord keeps asking when my contract ends.", null], [
        "He's hinting that he wants the flat back. That implies he may not renew.",
        "He's hinting you that he wants the flat back. That implies he may not renew.",
        "He's hinting that he wants the flat back. That implying he may not renew.",
      ]),
    ],
    success: "The learner names an implication and separates it from the words used.",
    quiz: [
      qmcq("Which sentence points at what the words suggest?", [
        "That implies we were not told.",
        "She's hinting that we were not told.",
        "He's insinuating that we lied.",
      ], 0),
      qfill("She's ___ that the deadline will move. (hint)", ["hinting"]),
      qmcq("Why offer an implication tentatively?", [
        "It attributes an intention, so it can be wrong.",
        "It is grammatically uncertain.",
        "It cannot be stated directly.",
      ], 0),
    ],
    scenes: [
      sc("Yusuf", "a friend puzzled by a message", "to decode an indirect message",
        "An indirect message needs interpreting.",
        "Name the implication.",
        "My boss wrote, 'Interesting idea, let's revisit it next year.' What is he actually saying?", "puzzled"),
      sc("Ottoline", "a colleague after a careful email", "to read a client's real position",
        "A client's email is polite and non-committal.",
        "Name what is implied.",
        "The client wrote, 'We will keep your proposal on file.' What do you read into that?", "analytical"),
      sc("Noor", "a host explaining local indirectness", "to help you read local communication",
        "Local communication relies on implication.",
        "Name what is being implied.",
        "People here rarely say no directly. My colleague said, 'We'll see next year.' What do you think she meant?", "helpful"),
      sc("Mr. Halvorsen", "your tutor", "to practise pragmatic inference",
        "The seminar is examining implicature.",
        "Name an implication precisely.",
        "A classmate said, 'Some of us actually did the reading.' What was she suggesting?", "probing"),
      sc("Ms. Cardoso", "the examiner", "to check pragmatic awareness",
        "The examiner says something deliberately indirect.",
        "Name the implication.",
        "Your written work was certainly ambitious. What do you take from that?", "neutral"),
    ],
  },

  {
    id: "c1-between-the-lines",
    topic: "discussing what someone really meant",
    objectives: [
      "Offer a reading of what someone meant.",
      "Offer an alternative reading of the same words.",
    ],
    goal: "Discuss an ambiguous message and weigh the readings.",
    target: "weighing interpretations",
    correction: "Model the alternative-reading sentence and let the learner weigh their own.",
    summary: "You practised weighing two readings of the same ambiguous message.",
    minutes: 8,
    points: [
      {
        form: "what she really meant",
        claims: [
          "'What she really meant' claims access to intention, so it needs evidence.",
          "Offering the evidence alongside makes the claim answerable.",
        ],
        ex: ["What she really meant was no.", "What she really meant was that it's already decided."],
      },
      {
        form: "reading it another way",
        claims: [
          "'Reading it another way' introduces a rival interpretation of the same words.",
          "Holding two readings at once is more useful than settling too early.",
        ],
        ex: ["Reading it another way, she was being cautious.", "Reading it another way, it's a compliment."],
      },
      {
        form: "there's more to it",
        claims: [
          "'There's more to it' says the surface reading is incomplete.",
          "It works as an opening rather than a conclusion.",
        ],
        ex: ["There's more to it than that.", "There's more to it, I suspect."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what she really meant
      chat("p1", ["She said, 'Let's not rush into anything.' What did she mean?", null], [
        "What she really meant was that she needs time.",
        "What she really mean was that she needs time.",
        "What she really meant were that she needs time.",
      ]),
      fc("p1", "What he ___ meant was that the budget is gone.", ["really", "real", "reality"]),
      spk("p1", "What she really meant was no."),
      // p2 — reading it another way
      fc("p2", "___ it another way, she was protecting you.", ["Reading", "Readed", "Reads"]),
      sit("p2", "Your friend thinks a one-word text, 'Fine.', was angry. You see a calmer possibility. What do you say?", [
        "Reading it another way, she was just busy.",
        "Reading it other way, she was just busy.",
        "Read it another ways, she was just busy.",
      ]),
      lc("p2", "Reading it another way, he was being kind.", [
        "Reading it again, he was being kind.",
        "Leaving it another day, he was kind.",
      ]),
      // p3 — there's more to it
      chat("p3", ["He just left because he was tired, right?", null], [
        "I think there's more to it than that.",
        "I think there's more to it that that.",
        "I think there's more it to than that.",
      ]),
      fc("p3", "There's more ___ it, I suspect.", ["to", "at", "by"]),
      sit("p3", "You think the official explanation is incomplete. Which sentence is correct?", [
        "There's more to it than he says.",
        "There's more to it then he says.",
        "There's more it than he says.",
      ]),
      // karışık
      sit("mix", "You give one reading of a client's short reply, then a rival reading. What do you say?", [
        "Perhaps what she really meant was no. Reading it another way, she may need time.",
        "Perhaps what she really meant was no. Reading it other way, she may need time.",
        "Perhaps what she real meant was no. Reading it another way, she may need time.",
      ]),
      chat("mix", ["So the manager's 'interesting idea' was a polite no?", null], [
        "Maybe, but there's more to it. Reading it another way, he may need more information.",
        "Maybe, but there's more to it. Reading it another ways, he may need more information.",
        "Maybe, but there's more it to. Reading it another way, he may need more information.",
      ]),
    ],
    success: "The learner offers two readings and weighs them.",
    quiz: [
      qmcq("Which phrase says the surface reading is incomplete?", [
        "There's more to it than that.",
        "That is exactly what it says.",
        "It means what it says.",
      ], 0),
      qfill("___ it another way, it's a compliment. (read)", ["Reading"]),
      qmcq("Why hold two readings at once?", [
        "It avoids settling too early.",
        "It is required in formal English.",
        "It shortens the discussion.",
      ], 0),
    ],
    scenes: [
      sc("Beatriz", "a friend upset by a message", "to decide whether to be upset",
        "A friend has taken a message badly.",
        "Offer alternative readings.",
        "She texted me, 'Nice of you to finally show up.' That's clearly an insult, isn't it?", "upset"),
      sc("Andres", "a colleague interpreting feedback", "to read feedback fairly",
        "Written feedback is ambiguous.",
        "Weigh the readings.",
        "My manager wrote, 'Your report was certainly thorough.' Is that praise or criticism?", "uncertain"),
      sc("Selin", "someone navigating a cultural difference", "to interpret an unfamiliar response",
        "A response has been read differently by two people.",
        "Weigh the interpretations.",
        "When I asked my host for a lift, she said, 'We'll see.' Where I come from that would be rude. Is it here?", "curious"),
      sc("Mr. Achebe", "your tutor", "to practise weighing interpretations",
        "The seminar is examining ambiguity.",
        "Offer and weigh two readings.",
        "A student wrote, 'The lecture was certainly memorable.' What could that mean?", "probing"),
      sc("Ms. Lindberg", "the examiner", "to check interpretive discussion",
        "The examiner presents an ambiguous statement.",
        "Weigh the readings.",
        "If someone says your work is interesting, what do they mean?", "neutral"),
    ],
  },

  {
    id: "c1-saying-no-without-saying-no",
    topic: "declining by implication",
    objectives: [
      "Decline without using a refusal word.",
      "Leave the refusal unambiguous despite the indirectness.",
    ],
    goal: "Turn something down without ever saying no.",
    target: "indirect refusal",
    correction: "Model the indirect refusal and let the learner decline without refusing outright.",
    summary: "You practised declining by implication rather than by refusing outright.",
    minutes: 8,
    points: [
      {
        form: "I'll think about it",
        claims: [
          "Depending on tone, 'I'll think about it' is often heard as a polite refusal rather than a delay.",
          "The tone and the absence of a follow-up date carry the meaning.",
        ],
        ex: ["I'll think about it.", "Let me think about it and come back to you."],
      },
      {
        form: "that's one option",
        claims: [
          "'That's one option' acknowledges a proposal without endorsing it.",
          "Naming it as one of several implies the others are still open.",
        ],
        ex: ["That's certainly one option.", "That's one option, yes."],
      },
      {
        form: "let me come back",
        claims: [
          "'Let me come back to you' promises an answer later; without a date it can signal a no.",
          "Indirect refusal is polite but risks being misread as a maybe.",
          "When the answer must be understood, a clear refusal is kinder.",
        ],
        ex: ["Let me come back to you on that.", "Let me come back to you next week."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'll think about it
      chat("p1", ["So, will you join our book club?", null], [
        "I'll think about it.",
        "I'll think it about.",
        "I'll thinking about it.",
      ]),
      fc("p1", "I'll think ___ it and let you know.", ["about", "at", "to"]),
      lc("p1", "I'll think about it and let you know.", [
        "I think about it a lot, you know.",
        "I'll thank you for it and let you go.",
      ]),
      // p2 — that's one option
      fc("p2", "That's certainly one ___.", ["option", "options", "optional"]),
      sit("p2", "A colleague proposes moving the meeting to Saturday. You don't support it, but you don't reject it outright. What do you say?", [
        "That's one option, yes.",
        "That's one of option, yes.",
        "That's an one option, yes.",
      ]),
      spk("p2", "That's certainly one option."),
      // p3 — let me come back
      fc("p3", "Let me come back ___ you next week.", ["to", "at", "for"]),
      chat("p3", ["Can you confirm the price today?", null], [
        "Let me come back to you on that.",
        "Let me come back you on that.",
        "Let me coming back to you on that.",
      ]),
      lc("p3", "Let me come back to you on that.", [
        "Let me come and get you after that.",
        "Let's go back to what you said.",
      ]),
      // karışık
      sit("mix", "A colleague suggests a team trip you would rather not go on. You avoid a flat no. What do you say?", [
        "That's one option. Let me come back to you on it.",
        "That's one option. Let me come back you on it.",
        "That one option. Let me come back to you on it.",
      ]),
      chat("mix", ["So, shall we book the expensive hotel?", null], [
        "That's one option. I'll think about it.",
        "That's one option. I'll think it about.",
        "That's one options. I'll think about it.",
      ]),
    ],
    success: "The learner declines by implication and judges when directness is better.",
    quiz: [
      qmcq("Which phrase is usually understood as a refusal?", [
        "I'll think about it.",
        "Yes, let's do it.",
        "When shall we start?",
      ], 0),
      qfill("Let me ___ back to you next week. (come)", ["come"]),
      qmcq("What is the risk of indirect refusal?", [
        "It can be misread as a maybe.",
        "It is grammatically incorrect.",
        "It is always considered rude.",
      ], 0),
    ],
    scenes: [
      sc("Ingeborg", "a friend proposing something you dislike", "to get an answer without a scene",
        "A friend has proposed something you do not want to do.",
        "Decline indirectly.",
        "A camping week in the mountains in November would be perfect, wouldn't it? Shall we book it?", "enthusiastic"),
      sc("Rashid", "a colleague pitching an idea", "to hear whether the idea will proceed",
        "A colleague has pitched something you will not support.",
        "Decline without a flat refusal.",
        "So, are we moving the whole team onto my new system next month?", "eager"),
      sc("Cecilia", "a host offering an extended stay", "to receive a graceful decline",
        "A host is pressing you to stay longer.",
        "Decline indirectly but clearly.",
        "Stay another week. What is stopping you?", "insistent"),
      sc("Mr. Steiner", "your tutor", "to practise indirect refusal",
        "The seminar is examining polite refusal.",
        "Decline by implication.",
        "Would you give a talk to the first-year students next month?", "probing"),
      sc("Ms. Coelho", "the examiner", "to check indirect refusal",
        "The examiner makes a proposal.",
        "Decline by implication.",
        "Would you be willing to take an extra examination next week?", "neutral"),
    ],
  },

  // --- Ünite 4 · Formal Register ---------------------------------------------
  {
    id: "c1-the-committee-recommends",
    topic: "turning actions into things",
    objectives: [
      "Convert a verb into a noun to sound official.",
      "Recognise when this makes writing harder to read.",
    ],
    goal: "Write in the register of an official recommendation.",
    target: "nominalisation",
    correction: "Rebuild the nominalised sentence and let the learner convert their own.",
    summary: "You learned to turn actions into nouns for official register, and its cost.",
    minutes: 9,
    points: [
      {
        form: "it is recommended",
        claims: [
          "'It is recommended that' removes both the actor and the personal voice.",
          "The verb after 'recommend that' often keeps its base form: that the policy be reviewed.",
        ],
        ex: ["It is recommended that the policy be reviewed.", "It is recommended that no action be taken."],
      },
      {
        form: "our recommendation is",
        claims: [
          "Turning 'we recommend' into 'our recommendation' converts an action into a thing.",
          "This is what makes official prose feel static.",
        ],
        ex: ["Our recommendation is to postpone.", "Our conclusion is that the risk is low."],
      },
      {
        form: "consideration was given",
        claims: [
          "Heavy nominalisation makes text harder to read, so use it deliberately.",
          "'We considered' is shorter and clearer than 'consideration was given to'.",
        ],
        ex: ["Consideration was given to several options.", "Implementation will follow approval."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it is recommended
      fc("p1", "It is recommended that the contract ___ renewed.", ["be", "been", "being"]),
      sit("p1", "You write up the board's advice to review the budget, without naming who gives it. What do you write?", [
        "It is recommended that the budget be reviewed.",
        "It is recommend that the budget be reviewed.",
        "It is recommended that the budget be review.",
      ]),
      err("p1", "It is recommendation that the fee be waived.", "recommendation", "recommended"),
      // p2 — our recommendation is
      fc("p2", "Our ___ is to postpone the launch.", ["recommendation", "recommend", "recommended"]),
      sit("p2", "You turn 'We recommend that you wait' into official prose that makes the action a thing. Which is correct?", [
        "Our recommendation is that you wait.",
        "Our recommend is that you wait.",
        "Our recommendation are that you wait.",
      ]),
      lc("p2", "Our recommendation is to wait a month.", [
        "We recommended waiting a month.",
        "Our recommendations were sent last month.",
      ]),
      // p3 — consideration was given
      fc("p3", "Careful ___ was given to the proposal.", ["consideration", "considering", "considered"]),
      chat("p3", ["Did the panel look at the cheaper option?", null], [
        "Yes, consideration was given to it.",
        "Yes, consideration was given it to.",
        "Yes, considering was given to it.",
      ]),
      spk("p3", "Consideration was given to every option."),
      // karışık
      sit("mix", "You write two lines of a report: the panel looked at three options and recommends the second. Which is correct?", [
        "Consideration was given to three options. Our recommendation is the second.",
        "Consideration was given to three options. Our recommend is the second.",
        "Consideration was give to three options. Our recommendation is the second.",
      ]),
      chat("mix", ["How should the report sum up the decision?", null], [
        "Consideration was given to all bids. It is recommended that bid two be accepted.",
        "Consideration was given to all bids. It is recommended that bid two is accept.",
        "Consideration were given to all bids. It is recommended that bid two be accepted.",
      ]),
    ],
    success: "The learner writes in official register and can name its cost.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It is recommended that no action be taken.",
        "It is recommended that no action is take.",
        "It is recommend that no action taken.",
      ], 0),
      qfill("___ will follow approval. (implement)", ["Implementation"]),
      qmcq("What is the cost of heavy nominalisation?", [
        "It makes text harder to read.",
        "It makes text grammatically wrong.",
        "It shortens every sentence.",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Petrov", "a committee secretary", "to have minutes worded correctly",
        "Committee minutes must be worded formally.",
        "Produce the official wording.",
        "The draft says, 'We think you should review the policy.' How should that read for the board?", "precise"),
      sc("Mr. Osei", "a senior manager reviewing a report", "to approve a formal report",
        "A report must meet a formal standard.",
        "Convert the wording to official register.",
        "Your report says, 'We looked at three options and we think we should wait.' How would you formalise that?", "exacting"),
      sc("Ana Lucia", "a legal officer", "to receive a properly worded submission",
        "A submission must be worded formally.",
        "Produce formal wording.",
        "The panel expects formal wording. How would you put 'we recommend reviewing the contract'?", "official"),
      sc("Professor Wickham", "your tutor", "to practise nominalisation",
        "The seminar is examining institutional prose.",
        "Convert actions into nouns and judge the effect.",
        "The panel considered three options and wants to wait. How would you write that formally?", "probing"),
      sc("Ms. Roux", "the examiner", "to check formal written register",
        "The examiner asks for official wording.",
        "Write in official register.",
        "How would you word a recommendation for a formal committee?", "neutral"),
    ],
  },

  {
    id: "c1-it-was-agreed-that",
    topic: "removing the actor entirely",
    objectives: [
      "Report a decision without naming who made it.",
      "Judge when removing the actor is appropriate.",
    ],
    goal: "Record decisions in the impersonal register of minutes.",
    target: "impersonal reporting of decisions",
    correction: "Rebuild the impersonal sentence and let the learner record the decision again.",
    summary: "You learned to record decisions without naming who made them.",
    minutes: 9,
    points: [
      {
        form: "it was agreed",
        claims: [
          "'It was agreed that' records a decision without attributing it.",
          "This is the standard register of minutes, where individual credit is not the point.",
        ],
        ex: ["It was agreed that the review would proceed.", "It was agreed to postpone the vote."],
      },
      {
        form: "it was decided",
        claims: [
          "'It was decided' and 'it was resolved' work identically, with 'resolved' more formal.",
          "'Resolved' is common in the minutes of boards and councils.",
        ],
        ex: ["It was decided that no further action was needed.", "It was resolved to accept the report."],
      },
      {
        form: "it was noted that",
        claims: [
          "'It was noted that' records a point without endorsing it.",
          "Removing the actor can also hide responsibility, so it is a choice with consequences.",
        ],
        ex: ["It was noted that concerns remain.", "It was noted that the deadline had passed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it was agreed
      fc("p1", "It was ___ that the meeting would move to Friday.", ["agreed", "agree", "agreeing"]),
      sit("p1", "Everyone at the meeting said yes to delaying the launch. You record it without naming anyone. What do you write?", [
        "It was agreed to delay the launch.",
        "It was agree to delay the launch.",
        "It was agreeing to delay the launch.",
      ]),
      lc("p1", "It was agreed that the review would continue.", [
        "We all agreed to review it again.",
        "It was a good review, we agreed.",
      ]),
      // p2 — it was decided
      fc("p2", "It was ___ to close the branch in May.", ["decided", "decide", "decision"]),
      chat("p2", ["What did the council decide about the park?", null], [
        "It was resolved to keep it open.",
        "It was resolve to keep it open.",
        "It was resolving to keep it open.",
      ]),
      spk("p2", "It was decided to wait."),
      // p3 — it was noted that
      fc("p3", "It was ___ that two members were absent.", ["noted", "note", "noting"]),
      sit("p3", "Someone raised concerns, but the meeting did not agree with them. You record that they were raised, without endorsing them.", [
        "It was noted that concerns were raised.",
        "It was noted that concerns was raised.",
        "It was noting that concerns were raised.",
      ]),
      lc("p3", "It was noted that two members left early.", [
        "We noticed that two members left early.",
        "It was not said that two members left early.",
      ]),
      // karışık
      sit("mix", "You write the minutes: everyone voted to accept the report, and a delay was mentioned without comment. Which is correct?", [
        "It was decided to accept the report. It was noted that there had been a delay.",
        "It was decide to accept the report. It was noted that there had been a delay.",
        "It was decided to accept the report. It was noting that there had been a delay.",
      ]),
      chat("mix", ["How should I minute the last item?", null], [
        "It was agreed to hire two staff, and it was noted that costs would rise.",
        "It was agreeing to hire two staff, and it was noted that costs would rise.",
        "It was agreed to hire two staff, and it was note that costs would rise.",
      ]),
    ],
    success: "The learner records decisions impersonally and can name what it conceals.",
    quiz: [
      qmcq("Which is the most formal?", [
        "It was resolved to accept the report.",
        "It was decided to accept the report.",
        "We accepted the report.",
      ], 0),
      qfill("It was ___ that the deadline had passed. (note)", ["noted"]),
      qmcq("What is the risk of removing the actor?", [
        "It can hide responsibility.",
        "It makes the sentence ungrammatical.",
        "It changes the tense.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Grant", "a committee chair", "to have decisions minuted correctly",
        "Decisions from a meeting must be minuted.",
        "Record them impersonally.",
        "Everyone voted to delay the launch, and one member raised a worry about costs. How would you record that?", "formal"),
      sc("Ilaria", "a colleague drafting board papers", "to draft papers in the right register",
        "Board papers require impersonal register.",
        "Convert the notes to formal minutes.",
        "My notes say, 'Maria and Tom decided to cut the budget.' How would you depersonalise that?", "exacting"),
      sc("Mr. Pereira", "a compliance officer", "to receive a properly worded record",
        "A regulated record must be worded impersonally.",
        "Record the decisions formally.",
        "The board chose to accept the audit report. How should the record put that, without naming anyone?", "official"),
      sc("Mrs. Berg", "your tutor", "to practise impersonal register",
        "The seminar is examining institutional voice.",
        "Record decisions impersonally and judge the effect.",
        "Everyone agreed to postpone, and one concern was raised. How would you record that?", "probing"),
      sc("Ms. Kaur", "the examiner", "to check impersonal register",
        "The examiner asks for a formal record.",
        "Record decisions impersonally.",
        "How would you minute a decision without naming anyone?", "neutral"),
    ],
  },

  {
    id: "c1-should-you-require-assistance",
    topic: "formal conditionals without if",
    objectives: [
      "Build formal conditionals with should and were.",
      "Match the level of formality to the situation.",
    ],
    goal: "Offer help or state a condition in fully formal English.",
    target: "formal inverted conditionals",
    correction: "Rebuild the formal conditional and let the learner produce their own.",
    summary: "You learned to build formal conditionals without using if.",
    minutes: 9,
    points: [
      {
        form: "should you require",
        claims: [
          "'Should you require assistance' is the formal equivalent of 'if you need help'.",
          "It is standard in official letters, notices and customer communication.",
        ],
        ex: ["Should you require assistance, please contact us.", "Should you wish to appeal, write within 14 days."],
      },
      {
        form: "should there be",
        claims: [
          "'Should there be any delay' replaces 'if there is any delay'.",
          "The inversion carries the formality; the meaning is unchanged.",
        ],
        ex: ["Should there be any delay, we will notify you.", "Should there be no reply, we will proceed."],
      },
      {
        form: "were you to need",
        claims: [
          "'Were you to' makes the possibility more remote than 'should you'.",
          "In everyday speech both sound stiff, so they belong to written and official use.",
        ],
        ex: ["Were you to need further information, please ask.", "Were the situation to change, we would review it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — should you require
      fc("p1", "Should you ___ assistance, please contact reception.", ["require", "required", "requiring"]),
      sit("p1", "A hotel notice says, 'If you need extra towels, call reception.' Make it formal.", [
        "Should you require extra towels, please call reception.",
        "Should you requiring extra towels, please call reception.",
        "Should require you extra towels, please call reception.",
      ]),
      err("p1", "Should you requires further details, please write to us.", "requires", "require"),
      // p2 — should there be
      fc("p2", "Should there ___ any problems, we will contact you.", ["be", "is", "are"]),
      chat("p2", ["What happens if the flight is delayed?", null], [
        "Should there be a delay, we will text you.",
        "Should there is a delay, we will text you.",
        "Should be there a delay, we will text you.",
      ]),
      lc("p2", "Should there be any change, we will tell you.", [
        "Should they make any change, they will tell you.",
        "There should be a change, we told you.",
      ]),
      // p3 — were you to need
      fc("p3", "Were you ___ need more time, please let us know.", ["to", "for", "in"]),
      sit("p3", "A formal letter offers a copy of a document, but suggests you are unlikely to need it. Which line fits?", [
        "Were you to need a copy, please ask.",
        "Were you to needed a copy, please ask.",
        "Were you need a copy, please ask.",
      ]),
      spk("p3", "Were you to need help, please ask."),
      // karışık
      sit("mix", "You write two lines of a formal notice: one for anyone who needs help, one for a possible delay. Which is correct?", [
        "Should you require help, call us. Should there be a delay, we will write.",
        "Should you require help, call us. Should there is a delay, we will write.",
        "Should you requiring help, call us. Should there be a delay, we will write.",
      ]),
      chat("mix", ["How should the letter end?", null], [
        "Should you have questions, or were you to need a meeting, please contact me.",
        "Should you have questions, or were you need a meeting, please contact me.",
        "Should you having questions, or were you to need a meeting, please contact me.",
      ]),
    ],
    success: "The learner builds at least two formal conditionals by inversion.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Should you wish to appeal, write within 14 days.",
        "Should you wishing to appeal, write within 14 days.",
        "Should to wish you appeal, write within 14 days.",
      ], 0),
      qfill("___ the situation to change, we would review it. (be)", ["Were"]),
      qmcq("Where do these forms belong?", [
        "written and official communication",
        "casual conversation with friends",
        "spoken instructions to children",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "a customer service manager", "to draft a formal notice",
        "A formal notice must be drafted for customers.",
        "Write the conditional lines.",
        "This notice goes to every customer. How should the conditions read?", "professional"),
      sc("Mr. Reddy", "a legal reviewer", "to check a formal clause",
        "A clause must be worded formally.",
        "Produce the formal conditional.",
        "The clause says, 'If you need help, just call us.' How would you formalise it?", "exacting"),
      sc("Ines", "a consulate officer", "to give formal instructions",
        "Official instructions must be formally worded.",
        "State the conditions formally.",
        "What should the instructions say to applicants who might need extra documents?", "official"),
      sc("Professor Bergstrom", "your tutor", "to practise formal conditionals",
        "The seminar is examining register in written English.",
        "Build formal conditionals.",
        "How would you write 'if you need help' for an official notice?", "probing"),
      sc("Ms. Whitfield", "the examiner", "to check formal conditionals",
        "The examiner asks for official wording.",
        "Use inversion accurately.",
        "How would you phrase a condition in a formal letter?", "neutral"),
    ],
  },

  {
    id: "c1-institutional-language",
    topic: "the vocabulary of official communication",
    objectives: [
      "Use the standard connectors of official prose.",
      "Judge when this vocabulary helps and when it obstructs.",
    ],
    goal: "Write in the standard vocabulary of official communication.",
    target: "institutional vocabulary",
    correction: "Model the formal connector and let the learner rewrite their own sentence.",
    summary: "You learned the standard vocabulary of official communication and its limits.",
    minutes: 8,
    points: [
      {
        form: "with regard to",
        claims: [
          "'With regard to' introduces the subject and replaces 'about'.",
          "'With regards to' is common but often marked as an error in formal writing; use 'with regard to'.",
        ],
        ex: ["With regard to your enquiry, we can confirm the following.", "With regard to the deadline, an extension applies."],
      },
      {
        form: "in accordance with",
        claims: [
          "'In accordance with' cites the rule an action follows.",
          "It is followed by a noun: a policy, a regulation, an agreement.",
        ],
        ex: ["In accordance with the policy, we have refunded the fee.", "In accordance with your request, the payment has been made."],
      },
      {
        form: "pursuant to",
        claims: [
          "'Pursuant to' is the most formal of the three and is largely legal.",
          "Outside legal or regulatory text it can obstruct rather than help.",
        ],
        ex: ["Pursuant to section four, notice is required.", "Pursuant to the agreement, notice must be given in writing."],
      },
    ],
    ex: [],
    drills: [
      // p1 — with regard to
      fc("p1", "With ___ to your letter of 3 May, we confirm receipt.", ["regard", "regardless", "regarded"]),
      chat("p1", ["What is your email about?", null], [
        "With regard to the invoice, payment is overdue.",
        "With regard of the invoice, payment is overdue.",
        "With regard to the invoice, payment are overdue.",
      ]),
      lc("p1", "With regard to your enquiry, we can help.", [
        "With your agreement, we can help.",
        "Regardless of your enquiry, we can't help.",
      ]),
      // p2 — in accordance with
      fc("p2", "In accordance ___ the policy, your refund has been issued.", ["with", "to", "of"]),
      sit("p2", "You cancel a booking and want to cite the rule you followed. What do you write?", [
        "In accordance with our terms, the booking has been cancelled.",
        "In accordance to our terms, the booking has been cancelled.",
        "In accordance with our terms, the booking has cancelled.",
      ]),
      spk("p2", "This is in accordance with the policy."),
      // p3 — pursuant to
      fc("p3", "___ to section four, written notice is required.", ["Pursuant", "Pursuing", "Pursue"]),
      sit("p3", "A contract states which clause allows the landlord to enter the property. Which line is correct?", [
        "Pursuant to clause seven, the landlord may enter the property.",
        "Pursuant with clause seven, the landlord may enter the property.",
        "Pursuant clause seven, the landlord may enter the property.",
      ]),
      lc("p3", "Pursuant to the agreement, notice must be given.", [
        "Pursue the agreement, and give notice.",
        "Prior to the agreement, notice was given.",
      ]),
      // karışık
      sit("mix", "You open a formal reply: name the subject (the complaint) and cite the policy you followed. Which is correct?", [
        "With regard to your complaint, we acted in accordance with our policy.",
        "With regard to your complaint, we acted in accordance to our policy.",
        "With regard at your complaint, we acted in accordance with our policy.",
      ]),
      chat("mix", ["Can I end the lease early?", null], [
        "With regard to your request, pursuant to clause two you must give a month's notice.",
        "With regard to your request, pursuant of clause two you must give a month's notice.",
        "With regard of your request, pursuant to clause two you must give a month's notice.",
      ]),
    ],
    success: "The learner uses institutional vocabulary correctly and judges its limits.",
    quiz: [
      qmcq("Which form is standard?", [
        "with regard to",
        "with regards to",
        "with the regard of",
      ], 0),
      qfill("In ___ with the policy, we have refunded the fee. (accord)", ["accordance"]),
      qmcq("Where does 'pursuant to' belong?", [
        "legal or regulatory text",
        "everyday email to colleagues",
        "spoken conversation",
      ], 0),
    ],
    scenes: [
      sc("Mr. Lowell", "a regulator requesting information", "to receive a properly worded reply",
        "A regulator has written formally and expects the same in return.",
        "Reply in institutional register.",
        "We wrote to you about your refund policy. How do you respond, in the prescribed form?", "official"),
      sc("Priscilla", "a colleague drafting a customer letter", "to get the register right",
        "A customer letter must be formal but readable.",
        "Balance formality against clarity.",
        "Our letter to a customer sounds like a legal contract. How would you open it instead?", "practical"),
      sc("Anouk", "a housing officer", "to handle a formal application",
        "A formal application requires official wording.",
        "Use institutional vocabulary appropriately.",
        "The form asks which policy your request follows. How would you word that line?", "procedural"),
      sc("Professor Eriksen", "your tutor", "to practise institutional register",
        "The seminar is examining bureaucratic prose.",
        "Use the vocabulary and judge its cost.",
        "You are replying to a complaint under policy six. How would you open the letter?", "probing"),
      sc("Ms. Nakagawa", "the examiner", "to check institutional register",
        "The examiner asks for an official reply.",
        "Use the register accurately.",
        "How would you reply formally to an official enquiry?", "neutral"),
    ],
  },

  {
    id: "c1-a-formal-complaint",
    topic: "raising a serious issue formally",
    objectives: [
      "State a serious complaint in fully formal English.",
      "Close with an expectation rather than a threat.",
    ],
    goal: "Raise a serious issue in writing without losing your temper.",
    target: "formal complaint register",
    correction: "Model the formal line and let the learner restate their complaint.",
    summary: "You practised raising a serious issue in fully formal English.",
    minutes: 8,
    points: [
      {
        form: "I wish to raise",
        claims: [
          "'I wish to raise' opens a formal complaint without emotion.",
          "Keeping emotion out keeps the focus on the evidence and the remedy you want.",
        ],
        ex: ["I wish to raise a serious concern.", "I wish to raise the matter formally."],
      },
      {
        form: "I would draw attention",
        claims: [
          "'I would draw your attention to' points at evidence without accusing.",
          "It lets the facts carry the accusation instead of you.",
        ],
        ex: ["I would draw your attention to the attached record.", "I would draw attention to the dates."],
      },
      {
        form: "I trust this will",
        claims: [
          "'I trust this will be resolved' states an expectation rather than a threat.",
          "It states a firm expectation without sounding openly threatening.",
        ],
        ex: ["I trust this will be addressed promptly.", "I trust this will not recur."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I wish to raise
      chat("p1", ["How can I help you today?", null], [
        "I wish to raise a formal complaint about my order.",
        "I wish raise a formal complaint about my order.",
        "I wish to raising a formal complaint about my order.",
      ]),
      sit("p1", "You open a complaint letter to your bank, calmly and formally. Which opening is correct?", [
        "I wish to raise a serious concern about my account.",
        "I wish to rise a serious concern about my account.",
        "I wishing to raise a serious concern about my account.",
      ]),
      spk("p1", "I wish to raise a complaint."),
      // p2 — I would draw attention
      fc("p2", "I would draw your ___ to the attached receipts.", ["attention", "attend", "attentive"]),
      chat("p2", ["What evidence do you have?", null], [
        "I would draw your attention to the dates on the invoice.",
        "I would draw you attention to the dates on the invoice.",
        "I would draw your attention on the dates on the invoice.",
      ]),
      lc("p2", "I would draw your attention to the dates.", [
        "I would pay more attention to the dates.",
        "I'd draw a picture of the dates.",
      ]),
      // p3 — I trust this will
      fc("p3", "I trust this ___ be resolved promptly.", ["will", "would to", "is"]),
      sit("p3", "You end your complaint with a firm expectation, not a threat. Which closing is correct?", [
        "I trust this will be resolved within a week.",
        "I trust this will resolved within a week.",
        "I trust this will be resolve within a week.",
      ]),
      spk("p3", "I trust this will not happen again."),
      // karışık
      sit("mix", "Your complaint must open formally, point to the evidence and close with an expectation. Which version is correct?", [
        "I wish to raise a complaint. I would draw your attention to the receipt. I trust this will be resolved.",
        "I wish to raise a complaint. I would draw your attention to the receipt. I trust this will resolved.",
        "I wish to raising a complaint. I would draw your attention to the receipt. I trust this will be resolved.",
      ]),
      chat("mix", ["Is there anything else before I log this?", null], [
        "Yes. I would draw your attention to the date, and I trust this will be addressed.",
        "Yes. I would draw your attention to the date, and I trust this will be address.",
        "Yes. I would draw your attention on the date, and I trust this will be addressed.",
      ]),
    ],
    success: "The learner opens, evidences and closes a formal complaint.",
    quiz: [
      qmcq("Which closing is an expectation rather than a threat?", [
        "I trust this will not recur.",
        "I will be taking this further immediately.",
        "You will regret ignoring this.",
      ], 0),
      qfill("I ___ to raise the matter formally. (wish)", ["wish"]),
      qmcq("Why keep emotion out of a formal complaint?", [
        "It keeps the focus on the evidence and the remedy requested.",
        "It makes the letter shorter.",
        "It is grammatically required.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Halloran", "a complaints manager", "to receive and act on a formal complaint",
        "A serious complaint must be made in writing.",
        "Raise it formally.",
        "I understand you wish to make a formal complaint. What is the substance of it?", "official"),
      sc("Dilek", "a supplier's director", "to answer a serious complaint",
        "A supplier has failed repeatedly and must be told formally.",
        "State the complaint formally.",
        "You asked to escalate this to me. What is the issue?", "reserved"),
      sc("Mr. Serrano", "an ombudsman", "to assess whether the complaint is well founded",
        "A complaint has been escalated to an independent body.",
        "State it formally with evidence.",
        "I have the file in front of me. How would you set out your case?", "impartial"),
      sc("Mrs. Kowalski", "your tutor", "to practise formal complaint register",
        "The seminar is examining written complaint.",
        "Raise a complaint formally.",
        "A bank charged you twice, and your statement proves it. How would you open your complaint?", "probing"),
      sc("Mr. Ozturk", "the examiner", "to check formal complaint register",
        "The examiner asks for a formal complaint.",
        "Open, evidence and close it.",
        "How would you raise a serious complaint in writing?", "neutral"),
    ],
  },

  {
    id: "c1-presenting-to-a-board",
    topic: "a short structured formal presentation",
    objectives: [
      "Signpost the structure of a short presentation.",
      "Close with a clear ask rather than a summary alone.",
    ],
    goal: "Deliver a short, structured presentation to a senior audience.",
    target: "formal presentation structure",
    correction: "Model the signposting line and let the learner move to the next section.",
    summary: "You practised structuring and signposting a short formal presentation.",
    minutes: 8,
    points: [
      {
        form: "I'd like to begin",
        claims: [
          "'I'd like to begin by...' tells the audience what the first section covers.",
          "Signposting matters most with an audience that will not interrupt.",
        ],
        ex: ["I'd like to begin by setting out the problem.", "I'd like to begin with the numbers."],
      },
      {
        form: "turning to the second",
        claims: [
          "'Turning to' marks a section boundary out loud.",
          "Explicit boundaries help an audience that will not interrupt to follow the structure.",
        ],
        ex: ["Turning to the second point, I'd like to address costs.", "Turning now to the risks."],
      },
      {
        form: "to conclude",
        claims: [
          "In a board presentation, 'to conclude' should usually lead to the decision you want, not only a summary.",
          "A presentation without an ask leaves the audience unsure what to do.",
        ],
        ex: ["To conclude, I would ask the board to approve the pilot.", "To conclude, we recommend option two."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd like to begin
      fc("p1", "I'd like to begin ___ a short summary.", ["with", "by", "from"]),
      chat("p1", ["You have five minutes. Go ahead.", null], [
        "Thank you. I'd like to begin by explaining the problem.",
        "Thank you. I'd like to begin by explain the problem.",
        "Thank you. I'd like begin by explaining the problem.",
      ]),
      lc("p1", "I'd like to begin with the numbers.", [
        "I like the numbers we began with.",
        "I'd like to be done with the numbers.",
      ]),
      // p2 — turning to the second
      fc("p2", "Turning ___ the second point, I'll address costs.", ["to", "at", "on"]),
      sit("p2", "You have finished the first section of your talk and now move on to the risks. Which sentence is correct?", [
        "Turning to the second point, I'd like to address the risks.",
        "Turning at the second point, I'd like to address the risks.",
        "Turned to the second point, I'd like to address the risks.",
      ]),
      spk("p2", "Turning to the second point, let's look at costs."),
      // p3 — to conclude
      fc("p3", "To ___, I would ask the board to approve the plan.", ["conclude", "conclusion", "concluding"]),
      chat("p3", ["So what are you asking us for?", null], [
        "To conclude, I ask you to approve the pilot.",
        "To conclude, I ask you approve the pilot.",
        "To concluding, I ask you to approve the pilot.",
      ]),
      lc("p3", "To conclude, we recommend option two.", [
        "In conclusion, we recommended option one.",
        "To include it, we need option two.",
      ]),
      // karışık
      sit("mix", "You outline a short talk: how you start, how you move on, and how you finish with an ask. Which version is correct?", [
        "I'd like to begin with the problem. Turning to the second point, I'll cover cost. To conclude, please approve it.",
        "I'd like to begin with the problem. Turning to the second point, I'll cover cost. To conclusion, please approve it.",
        "I'd like begin with the problem. Turning to the second point, I'll cover cost. To conclude, please approve it.",
      ]),
      chat("mix", ["We've heard the problem. What comes next?", null], [
        "Turning to the second point, I'll explain the solution. To conclude, I'll ask for your approval.",
        "Turning at the second point, I'll explain the solution. To conclude, I'll ask for your approval.",
        "Turning to the second point, I'll explain the solution. To concluding, I'll ask for your approval.",
      ]),
    ],
    success: "The learner signposts the structure and closes with a clear ask.",
    quiz: [
      qmcq("Which close is strongest?", [
        "To conclude, I would ask the board to approve the pilot.",
        "To conclude, that is everything I had.",
        "To conclude, thank you for listening.",
      ], 0),
      qfill("___ now to the risks. (turn)", ["Turning"]),
      qmcq("Why signpost for an audience that will not interrupt?", [
        "They cannot ask where you have got to.",
        "They cannot follow long sentences.",
        "It is required by formal grammar.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Grant", "the board chair", "to hear a clear recommendation",
        "You have three minutes in front of a board.",
        "Structure and signpost the presentation.",
        "You have three minutes and we have read the paper. What is your ask?", "brisk"),
      sc("Ilaria", "a senior partner", "to decide on your recommendation",
        "A recommendation must be presented to a decision-maker.",
        "Signpost and close with an ask.",
        "Take me through it. What are you asking for?", "decisive"),
      sc("Mr. Pereira", "a funding panel member", "to assess a short pitch",
        "A funding panel is hearing short pitches.",
        "Structure the pitch and close with an ask.",
        "Three minutes, then questions. How will you begin?", "impartial"),
      sc("Professor Berg", "your tutor", "to practise presentation structure",
        "The seminar is examining formal presentation.",
        "Signpost and close with an ask.",
        "You want the board to approve a pilot. How would you begin your presentation?", "probing"),
      sc("Ms. Roux", "the examiner", "to check presentation structure",
        "The examiner asks for a short structured presentation.",
        "Signpost and close clearly.",
        "Could you present a proposal in three parts, ending with an ask?", "neutral"),
    ],
  },
];
