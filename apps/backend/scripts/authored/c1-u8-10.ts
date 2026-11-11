/** C1 · Ünite 8-10 — Professional · Culture and Idiom · Extended Discussion (21 ders).
 *
 *  Ünite 8'de gramer dersi yok: itiraz etmek, müzakere etmek, kötü haberi vermek
 *  ve zor geri bildirimde bulunmak yapı sorunu değil, hasar kontrolü sorunu.
 *  Ünite krizde konuşmayla kapanıyor — bilgi eksikken açık kalabilmek.
 *
 *  Ünite 9 kültür ve deyim: tek gramer dersi eşdizim (`heavy rain`, ama `strong
 *  argument`), gerisi deyim, ironi işareti, kötü düşen ifadeler ve ortamı okumak.
 *  Öğretilen şey kelime değil, NEREDE hangi kelimenin düştüğü.
 *
 *  Ünite 10 C1'in ve külliyatın kapanışı: 8 dersin 6'sı konuşma. Uzun sırayı
 *  taşımak, haritalamak, temiz cevabı olmayan soruyu tartışmak, derinlemesine
 *  bildiğin ve hiç bilmediğin konuda konuşmak. Son ders bir tartışmayı iki tarafa
 *  da hakkını vererek kapatmak — seviyenin son becerisi bu.
 *
 *  OYUN BLOĞU (10 Kas 2026): her derste 11-12 madde (3 öğretim maddesi × 3 + karışık),
 *  ağırlık durum/sohbet/boşluk/dinleme; çeldiriciler BİÇİM hatasıdır (kalıbın işlev
 *  çeldiricisi C1'de bağlamda çoğu zaman doğru da olabiliyor). Açılışlar yalnız sesle kurulur.
 *
 *  PARTİ 2 İNCELEMESİNDEN: iddia ile örnek çelişemez; "şu iki şeye cevap ver"
 *  diyen görev o iki şeyi VERİR; iddialar mutlak değil ("usually", "tends to");
 *  dolaysız aktarım tırnak alır.
 */
import { chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const C1_U8_10: Authored[] = [
  // --- Ünite 8 · Professional Communication ----------------------------------
  {
    id: "c1-diplomatic-disagreement",
    topic: "objecting without damaging the relationship",
    objectives: [
      "State a clear objection in non-adversarial language.",
      "Separate the disagreement from the person.",
    ],
    goal: "Disagree clearly without turning it into a conflict.",
    target: "diplomatic disagreement",
    correction: "Model the softened objection and let the learner object again.",
    summary: "You learned to state a clear objection without making it personal.",
    minutes: 8,
    points: [
      {
        form: "I see it differently",
        claims: [
          "'I see it differently' locates the disagreement in perspective rather than in error.",
          "It leaves both positions standing, which keeps the exchange open.",
        ],
        ex: ["I see it differently, and here is why.", "I see it differently on the timing."],
      },
      {
        form: "with respect I'd argue",
        claims: [
          "'With respect' signals disagreement with someone senior or in public.",
          "In British English the tone matters: said flatly it can read as sharp.",
        ],
        ex: ["With respect, I'd argue the opposite.", "With respect, I'd argue the data says otherwise."],
      },
      {
        form: "I'm not entirely convinced",
        claims: [
          "'I'm not entirely convinced' withholds agreement without asserting the opposite.",
          "'Entirely' is what softens it; without that word it lands much harder.",
        ],
        ex: ["I'm not entirely convinced by that.", "I'm not entirely convinced the risk is covered."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I see it differently
      sit("p1", "Your manager says the launch should be in May. You think June is better, and you want to show it is a matter of view, not a mistake. What do you say?", [
        "I see it differently, and here is why.",
        "I see differently it, and here is why.",
        "I see it in a differently way, and here is why.",
      ]),
      fc("p1", "I see it ___ on the timing.", ["differently", "difference", "differ"]),
      la("p1", "I see it differently, and here is why.", ["sees"]),
      // p2 — with respect I'd argue
      sit("p2", "In a public meeting, a senior director says the plan is safe. You think the data shows the opposite. What do you say?", [
        "With respect, I'd argue the data says otherwise.",
        "With respect, I'd arguing the data says otherwise.",
        "With respectful, I'd argue the data says otherwise.",
      ]),
      fc("p2", "With ___, I'd argue the opposite.", ["respect", "respected", "respectful"]),
      chat("p2", ["As your director, I think we should cut the training budget.", null], [
        "With respect, I'd argue that is where we'll lose people.",
        "With respect, I'd to argue that is where we'll lose people.",
        "With respect, I'd argued that is where we'll lose people.",
      ]),
      // p3 — I'm not entirely convinced
      sit("p3", "A colleague says the new plan covers every risk. You doubt it, but you don't want to claim the opposite. What do you say?", [
        "I'm not entirely convinced it covers everything.",
        "I'm not entire convinced it covers everything.",
        "I'm entirely not convinced it covers everything.",
      ]),
      spk("p3", "I'm not entirely convinced by that."),
      lc("p3", "I'm not entirely convinced it will work.", [
        "I'm entirely convinced it will work.",
        "I'm not convinced it will work at all.",
      ]),
      // karışık
      chat("mix", ["The director wants to launch in May. Thoughts?", null], [
        "I see it differently. I'm not entirely convinced May is realistic.",
        "I see it differently. I'm not entire convinced May is realistic.",
        "I see it difference. I'm not entirely convinced May is realistic.",
      ]),
      sit("mix", "A senior manager says in a meeting that remote work hurts results. You disagree, politely and clearly. What do you say?", [
        "With respect, I'd argue remote work can improve results. I see the evidence differently.",
        "With respect, I'd argue remote work can improve results. I see the evidence difference.",
        "With respecting, I'd argue remote work can improve results. I see the evidence differently.",
      ]),
    ],
    success: "The learner objects clearly without making the disagreement personal.",
    quiz: [
      qmcq("Which phrase locates disagreement in perspective?", [
        "I see it differently.",
        "You are mistaken.",
        "That is an error.",
      ], 0),
      qfill("I'm not ___ convinced the risk is covered. (entire)", ["entirely"]),
      qmcq("Why does 'entirely' matter?", [
        "Without it the sentence lands much harder.",
        "It is grammatically required.",
        "It makes the sentence formal.",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "an older neighbour chairing the residents' meeting", "to hear whether anyone disagrees",
        "At a residents' meeting, a respected neighbour states a view you think is wrong.",
        "Object clearly and impersonally.",
        "I think we should close the shared garden to save money. Does anyone see it another way?", "authoritative"),
      sc("Rashid", "a colleague defending a decision", "to be challenged constructively",
        "A colleague is defending a decision you doubt.",
        "Object without making it personal.",
        "I've decided to cancel the training week to hit the deadline, and I stand by it. Any objection?", "defensive"),
      sc("Ines", "a tour guide with a firm plan", "to hear a traveller's counterview",
        "A guide insists on a plan for tomorrow that you think will cause problems.",
        "Disagree diplomatically.",
        "We always start the mountain walk at noon, in the heat. Would you do something different?", "settled"),
      sc("Professor Osei", "your tutor", "to practise diplomatic objection",
        "In a seminar, your tutor states a view you disagree with.",
        "Object clearly and impersonally.",
        "In my view, group projects teach students nothing. Who sees it another way?", "probing"),
      sc("Ms. Reyes", "the examiner", "to check diplomatic register",
        "The examiner states a view you should challenge.",
        "Object diplomatically.",
        "I think written exams are the only fair assessment. Do you agree?", "neutral"),
    ],
  },

  {
    id: "c1-chairing-a-discussion",
    topic: "running a conversation with several people",
    objectives: [
      "Bring in someone who has not spoken.",
      "Return a wandering discussion to the point.",
    ],
    goal: "Run a discussion so everyone is heard and the time holds.",
    target: "chairing language",
    correction: "Model the chairing move and let the learner run the next turn.",
    summary: "You learned to bring people in, return to the point and manage the time.",
    minutes: 8,
    points: [
      {
        form: "let's hear from",
        claims: [
          "'Let's hear from' invites someone in by name, which is harder to decline than a general invitation.",
          "Naming the person also makes it less likely that the loudest voice fills the gap.",
        ],
        ex: ["Let's hear from Maya on this.", "Let's hear from someone who hasn't spoken."],
      },
      {
        form: "coming back to",
        claims: [
          "'Coming back to' returns to a point that was left, rather than cutting someone off.",
          "It frames the return as picking up rather than correcting.",
        ],
        ex: ["Coming back to the budget question.", "Coming back to what Ana raised earlier."],
      },
      {
        form: "we're running short",
        claims: [
          "'We're running short of time' manages the clock without blaming a speaker.",
          "Naming the constraint rather than the person keeps the room calm.",
        ],
        ex: ["We're running short of time.", "We're running short, so briefly if you can."],
      },
    ],
    ex: [],
    drills: [
      // p1 — let's hear from
      sit("p1", "You are chairing a meeting. One colleague, Ana, has not said anything for twenty minutes. What do you say?", [
        "Let's hear from Ana on this.",
        "Let's hear Ana from on this.",
        "Let's hearing from Ana on this.",
      ]),
      fc("p1", "Let's hear ___ someone who hasn't spoken.", ["from", "at", "with"]),
      lc("p1", "Let's hear from someone who hasn't spoken.", [
        "Let's hear from someone who has spoken twice.",
        "Let's wait for someone who hasn't arrived.",
      ]),
      // p2 — coming back to
      sit("p2", "The meeting has drifted to holiday plans, but the budget question was never finished. What do you say?", [
        "Coming back to the budget question, where are we?",
        "Coming back the budget question, where are we?",
        "Coming backs to the budget question, where are we?",
      ]),
      chat("p2", ["Sorry, I think we've drifted a bit. Where were we?", null], [
        "Coming back to the staffing point.",
        "Coming backed to the staffing point.",
        "Coming back of the staffing point.",
      ]),
      la("p2", "Coming back to the point about timing."),
      // p3 — we're running short
      sit("p3", "Your meeting must end in five minutes and two people still want to speak. You don't want to blame anyone. What do you say?", [
        "We're running short of time, so briefly if you can.",
        "We're running shortly of time, so briefly if you can.",
        "We're run short of time, so briefly if you can.",
      ]),
      fc("p3", "We're running ___ of time.", ["short", "shortly", "shortage"]),
      spk("p3", "We're running short, so please keep it brief."),
      // karışık
      chat("mix", ["I have a lot more to say about the logo, if that's all right?", null], [
        "We're running short of time. Let's hear from Ana first.",
        "We're running short of time. Let's hear Ana from first.",
        "We're running shortly of time. Let's hear from Ana first.",
      ]),
      sit("mix", "Two people keep talking about the logo. The budget is still undecided and only ten minutes remain. What do you say?", [
        "We're running short of time. Coming back to the budget, where are we?",
        "We're running short of time. Coming back the budget, where are we?",
        "We're running shortly of time. Coming back to the budget, where are we?",
      ]),
    ],
    success: "The learner brings someone in and manages the time without blame.",
    quiz: [
      qmcq("Why name the person you invite in?", [
        "It is harder to decline than a general invitation.",
        "It is grammatically required.",
        "It shortens the meeting.",
      ], 0),
      qmcq("Which line returns to an earlier point without cutting anyone off?", [
        "Coming back to what Ana raised earlier.",
        "Stop talking about that now.",
        "That is not relevant at all.",
      ], 0),
      qmcq("Why name the constraint rather than the person?", [
        "It keeps the room calm.",
        "It saves time.",
        "It is more formal.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Reddy", "a neighbour who dominates the residents' meeting", "to be managed without offence",
        "At a residents' meeting you are chairing, one neighbour is filling all the time.",
        "Manage the room.",
        "Sorry, one more thing on this — may I just finish my point?", "insistent"),
      sc("Halima", "a quiet participant", "to be brought into the discussion",
        "Someone has said nothing for twenty minutes.",
        "Bring them in.",
        "Oh — did you want me to say something?", "hesitant"),
      sc("Anders", "a member of your travel group", "to plan tomorrow on time",
        "Your travel group is choosing tomorrow's route and the talk is overrunning.",
        "Manage the time and the room.",
        "Dinner is in fifteen minutes and we still have three routes to discuss. How do you want to run this?", "practical"),
      sc("Mrs. Berg", "your tutor playing a talkative student", "to practise chairing",
        "You are chairing a seminar discussion and one speaker keeps going.",
        "Bring people in and manage the clock.",
        "Can I add one more long point about the reading before anyone else speaks?", "probing"),
      sc("Mr. Eriksen", "the examiner", "to check facilitation language",
        "The examiner plays a difficult participant.",
        "Chair the discussion.",
        "Imagine you are chairing and I am the participant who keeps talking. I have a great deal more to say. May I continue?", "neutral"),
    ],
  },

  {
    id: "c1-negotiating-position",
    topic: "signalling where you can and cannot move",
    objectives: [
      "Signal flexibility on one point and firmness on another.",
      "Propose a mutual concession.",
    ],
    goal: "Make clear what is negotiable without giving it away.",
    target: "signalling negotiating positions",
    correction: "Model the flexibility signal and let the learner mark their own limits.",
    summary: "You learned to signal where you can move and where you cannot.",
    minutes: 8,
    points: [
      {
        form: "there's room on",
        claims: [
          "'There's room on price' signals flexibility on one item only.",
          "Naming one flexible item can imply that the others are fixed, without saying so.",
        ],
        ex: ["There's room on the timeline.", "There's room on price, within limits."],
      },
      {
        form: "that's not something we",
        claims: [
          "'That's not something we can move on' marks a limit without ending the talk.",
          "'We' rather than 'I' makes the limit institutional rather than personal.",
        ],
        ex: ["That's not something we can move on.", "That's not something we would consider."],
      },
      {
        form: "what if we both",
        claims: [
          "'What if we both...' proposes a mutual concession rather than a one-sided one.",
          "A mutual proposal frames the agreement as reciprocal because both sides concede something.",
        ],
        ex: ["What if we both moved a little?", "What if we both took part of the risk?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — there's room on
      sit("p1", "A client asks for changes. You can move the delivery date, but nothing else. What do you say first?", [
        "There's room on the delivery date.",
        "There's rooms on the delivery date.",
        "There room on the delivery date.",
      ]),
      fc("p1", "There's ___ on price, within limits.", ["room", "rooms", "roomy"]),
      lc("p1", "There's room on the timeline, not on price.", [
        "There's no room on the timeline or on price.",
        "There's a room on the second floor.",
      ]),
      // p2 — that's not something we
      sit("p2", "A supplier asks you to drop the safety checks to save money. You can't agree, but you want to keep talking. What do you say?", [
        "That's not something we can move on.",
        "That's not something we can moving on.",
        "That's not something we can to move on.",
      ]),
      chat("p2", ["Could you cut the price by half?", null], [
        "That's not something we would consider.",
        "That's not something we would considering.",
        "That's not something we would considered.",
      ]),
      lc("p2", "That's not something we can change.", [
        "That's something we can change.",
        "That's not something we need to discuss.",
      ]),
      // p3 — what if we both
      sit("p3", "You and a client both want the deal. You suggest that each side gives a little. What do you say?", [
        "What if we both moved a little?",
        "What if we both moving a little?",
        "What if both we moved a little?",
      ]),
      fc("p3", "What if we both ___ the cost?", ["shared", "sharing", "shares"]),
      spk("p3", "What if we both moved a little?"),
      // karışık
      chat("mix", ["We need a lower price and a faster delivery.", null], [
        "There's room on delivery. On price, that's not something we can move on.",
        "There's rooms on delivery. On price, that's not something we can move on.",
        "There's room on delivery. On price, that's not something we can moving on.",
      ]),
      sit("mix", "You can move on the start date but not on the price. You also suggest that both sides give a little. What do you say?", [
        "There's room on the date. What if we both moved a little?",
        "There's room on the date. What if we both moving a little?",
        "There's rooms on the date. What if we both moved a little?",
      ]),
    ],
    success: "The learner signals flexibility and a limit, and proposes a mutual concession.",
    quiz: [
      qmcq("Why say 'we' rather than 'I' about a limit?", [
        "It makes the limit institutional rather than personal.",
        "It is more grammatical.",
        "It sounds more polite in every context.",
      ], 0),
      qfill("What if we ___ took part of the risk? (both)", ["both"]),
      qmcq("What does a mutual proposal do?", [
        "It frames the agreement as reciprocal.",
        "It is shorter.",
        "It avoids the conditional.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Lowell", "a neighbour buying your old car", "to find a deal that works",
        "A neighbour wants your old car but is pushing hard on price.",
        "Signal your limits and propose a mutual move.",
        "I like the car, but I need movement on price. Can you do that?", "firm"),
      sc("Priscilla", "a client renegotiating scope", "to reach a workable agreement",
        "A client wants more for the same money.",
        "Mark what is negotiable.",
        "The scope has grown a bit. That is manageable, isn't it?", "optimistic"),
      sc("Kemal", "a host renting you a holiday flat", "to agree terms both sides accept",
        "You are agreeing the terms for a month in a holiday flat.",
        "Signal flexibility and limits.",
        "I can be flexible on some things. What matters most to you?", "businesslike"),
      sc("Professor Villanueva", "your tutor", "to practise negotiation signals",
        "In a seminar negotiation exercise, your tutor plays the other side.",
        "Signal position precisely.",
        "I want the whole budget for my team and a later deadline. What can you offer?", "probing"),
      sc("Ms. Sorensen", "the examiner", "to check negotiation language",
        "The examiner presses on one item.",
        "Signal flexibility and limits.",
        "I need a lower figure. What can you do?", "neutral"),
    ],
  },

  {
    id: "c1-delivering-bad-news",
    topic: "announcing something unwelcome",
    objectives: [
      "State the decision before the reasons.",
      "Acknowledge the impact without softening the message.",
    ],
    goal: "Deliver bad news clearly and humanely.",
    target: "delivering bad news",
    correction: "Model the clear announcement and let the learner deliver it again.",
    summary: "You learned to deliver bad news clearly, without burying or softening it.",
    minutes: 8,
    points: [
      {
        form: "I'm afraid we've decided",
        claims: [
          "State the decision promptly and explain afterwards; leading with lengthy reasons can bury it.",
          "'I'm afraid' acknowledges the news is unwelcome without hedging the content.",
        ],
        ex: ["I'm afraid we've decided not to proceed.", "I'm afraid we've decided to end the trial."],
      },
      {
        form: "this wasn't easy",
        claims: [
          "'This wasn't an easy decision' signals that it was considered carefully; on its own it does not acknowledge the impact on the listener.",
          "To acknowledge the impact you have to name it, so add what it will mean for them.",
        ],
        ex: ["This wasn't an easy decision.", "This wasn't easy and I want to explain it."],
      },
      {
        form: "I want to be straight",
        claims: [
          "'I want to be straight with you' signals that no further softening is coming.",
          "Following it with a hedge undermines the whole message.",
        ],
        ex: ["I want to be straight with you about why.", "I want to be straight: the funding has gone."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm afraid we've decided
      sit("p1", "You must tell your team the project is cancelled. You want to give the decision first. How do you start?", [
        "I'm afraid we've decided to cancel the project.",
        "I'm afraid we've decide to cancel the project.",
        "I'm afraid we've decided cancel the project.",
      ]),
      fc("p1", "I'm afraid we've ___ to end the trial.", ["decided", "decide", "deciding"]),
      lc("p1", "I'm afraid we've decided not to proceed.", [
        "I'm afraid we haven't decided yet.",
        "We've decided to proceed as planned.",
      ]),
      // p2 — this wasn't easy
      sit("p2", "You have told a colleague that her team will move offices. You want to show the decision was carefully considered. What do you add?", [
        "This wasn't an easy decision for anyone.",
        "This wasn't a easy decision for anyone.",
        "This weren't an easy decision for anyone.",
      ]),
      chat("p2", ["Did anyone even think about this before deciding?", null], [
        "Yes. This wasn't easy, and I want to explain it.",
        "Yes. This wasn't easily, and I want to explain it.",
        "Yes. This wasn't easy, and I want explaining it.",
      ]),
      spk("p2", "This wasn't an easy decision."),
      // p3 — I want to be straight
      sit("p3", "Someone asks why their funding stopped. You want to show you won't soften the truth. What do you say first?", [
        "I want to be straight with you.",
        "I want be straight with you.",
        "I want to be straightly with you.",
      ]),
      fc("p3", "I want to be ___: the funding has gone.", ["straight", "straightly", "straighten"]),
      la("p3", "I want to be straight about the money.", ["straightly"]),
      // karışık
      chat("mix", ["You asked to see me. Is it about my contract?", null], [
        "Yes. I'm afraid we've decided not to renew it. I want to be straight with you.",
        "Yes. I'm afraid we've decided not to renew it. I want to be straightly with you.",
        "Yes. I'm afraid we've deciding not to renew it. I want to be straight with you.",
      ]),
      sit("mix", "You must tell a supplier their contract won't be renewed, and you want to be fully honest about why. What do you say?", [
        "I'm afraid we've decided not to renew. I want to be straight about why.",
        "I'm afraid we've decided not to renew. I want to be straightly about why.",
        "I'm afraid we've deciding not to renew. I want to be straight about why.",
      ]),
    ],
    success: "The learner states the decision first and names the impact on the listener.",
    quiz: [
      qmcq("Why state the decision promptly?", [
        "Leading with lengthy reasons can bury it.",
        "It is grammatically required.",
        "It shortens the conversation.",
      ], 0),
      qfill("I want to be ___ with you about why. (straight)", ["straight"]),
      qmcq("What undermines 'I want to be straight with you'?", [
        "following it with a hedge",
        "following it with a reason",
        "saying it after the decision",
      ], 0),
    ],
    scenes: [
      sc("Dilek", "your flatmate", "to hear the decision clearly",
        "You and your partner have decided to give up the shared flat, and your flatmate does not know yet.",
        "Deliver the news clearly.",
        "You wanted to talk? Is this about the flat?", "hopeful"),
      sc("Mr. Osei", "a supplier losing a contract", "to be told plainly",
        "A contract is not being renewed.",
        "Deliver the news plainly.",
        "We assumed we would be renewed. Is that not happening?", "wary"),
      sc("Lucia", "a guest whose booking has failed", "to be told without runaround",
        "A booking cannot be honoured.",
        "Deliver the news clearly.",
        "I have travelled a long way. There is a room, isn't there?", "tired"),
      sc("Mrs. Kowalski", "a student whose exchange you coordinate", "to hear the decision clearly",
        "You coordinate exchanges at your university, and this student's exchange place has been cancelled.",
        "State the decision first.",
        "You asked me to come in. Is there news about my exchange place?", "probing"),
      sc("Mr. Ozturk", "the examiner playing an applicant whose application you rejected", "to check bad-news delivery",
        "The examiner plays the affected person.",
        "Deliver the news clearly and humanely.",
        "I have been waiting to hear. What is the decision?", "neutral"),
    ],
  },

  {
    id: "c1-giving-difficult-feedback",
    topic: "candid feedback that stays constructive",
    objectives: [
      "Describe behaviour rather than character.",
      "Invite the other person's account before concluding.",
    ],
    goal: "Give candid feedback that the other person can act on.",
    target: "constructive candid feedback",
    correction: "Model the observation and let the learner give their own feedback.",
    summary: "You practised giving candid feedback that describes behaviour rather than character.",
    minutes: 8,
    points: [
      {
        form: "what I've observed is",
        claims: [
          "'What I've observed is...' describes behaviour rather than judging the person.",
          "Behaviour can be changed; a character verdict leaves nowhere to go.",
        ],
        ex: ["What I've observed is that deadlines slip.", "What I've observed is a pattern, not one incident."],
      },
      {
        form: "how do you see it",
        claims: [
          "'How do you see it?' invites their account before you conclude.",
          "Asking after the observation but before the conclusion keeps the conversation two-way.",
        ],
        ex: ["How do you see it?", "How do you see it from where you sit?"],
      },
      {
        form: "I'd like us to",
        claims: [
          "'I'd like us to agree on...' proposes a shared next step rather than issuing an instruction.",
          "'Us' makes the follow-up joint rather than imposed.",
        ],
        ex: ["I'd like us to agree on a check-in.", "I'd like us to find a way through this."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what I've observed is
      sit("p1", "A colleague has missed the last three deadlines. You want to describe what happened, not judge him. How do you start?", [
        "What I've observed is that the last three deadlines were missed.",
        "What I've observe is that the last three deadlines were missed.",
        "What I observed it is that the last three deadlines were missed.",
      ]),
      fc("p1", "What I've ___ is a pattern, not one incident.", ["observed", "observe", "observing"]),
      lc("p1", "What I've observed is that reports arrive late.", [
        "What I've heard is that reports arrive late.",
        "What I've observed is that reports arrive early.",
      ]),
      // p2 — how do you see it
      sit("p2", "You have described the problem. Before you suggest anything, you want to hear their side. What do you ask?", [
        "How do you see it?",
        "How do you see it is?",
        "How do you seeing it?",
      ]),
      chat("p2", ["I know the reports have been late.", null], [
        "How do you see it from where you sit?",
        "How do you see it from where you sitting?",
        "How do you saw it from where you sit?",
      ]),
      spk("p2", "How do you see it from your side?"),
      // p3 — I'd like us to
      sit("p3", "You want to propose a weekly meeting as a shared next step, not as an order. What do you say?", [
        "I'd like us to agree on a weekly check-in.",
        "I'd like us agree on a weekly check-in.",
        "I'd like we to agree on a weekly check-in.",
      ]),
      fc("p3", "I'd like ___ to find a way through this.", ["us", "we", "our"]),
      la("p3", "I'd like us to agree on a check-in.", ["we"]),
      // karışık
      chat("mix", ["You wanted a word? Is something wrong?", null], [
        "What I've observed is that deadlines are slipping. How do you see it?",
        "What I've observed is that deadlines are slipping. How do you saw it?",
        "What I've observe is that deadlines are slipping. How do you see it?",
      ]),
      sit("mix", "You have heard your colleague's side. Now you sum up the problem, late reports, and propose a joint plan. What do you say?", [
        "What I've observed is late reports, so I'd like us to agree on a plan.",
        "What I've observed is late reports, so I'd like us agree on a plan.",
        "What I've observed is late reports, so I'd like we to agree on a plan.",
      ]),
    ],
    success: "The learner describes behaviour, invites an account and proposes a next step.",
    quiz: [
      qmcq("Why describe behaviour rather than character?", [
        "Behaviour can be changed; a verdict leaves nowhere to go.",
        "It is more polite in every culture.",
        "It is grammatically simpler.",
      ], 0),
      qfill("How do you ___ it from where you sit? (see)", ["see"]),
      qmcq("Why say 'I'd like us to'?", [
        "It makes the follow-up joint rather than imposed.",
        "It is more formal.",
        "It sounds more urgent.",
      ], 0),
    ],
    scenes: [
      sc("Ottoline", "a friend who organises your club's events", "to understand and respond",
        "A friend who runs your club's events keeps missing deadlines.",
        "Give candid, constructive feedback.",
        "You said you wanted a word. Is something wrong?", "guarded"),
      sc("Viktor", "a team member you manage", "to receive actionable feedback",
        "A team member needs honest feedback.",
        "Describe behaviour and agree a step.",
        "I know the last few weeks have been rough. What did you want to discuss?", "open"),
      sc("Selin", "your travel partner", "to accept feedback from an equal",
        "Your travel partner has been late every morning and you have missed two tours.",
        "Give feedback without authority.",
        "You look annoyed. What's up?", "resistant"),
      sc("Mr. Achebe", "your study-group partner", "to receive constructive feedback",
        "Your study-group partner has sent the last three drafts late.",
        "Describe behaviour, invite an account, agree a step.",
        "I know my last three drafts were late. Is that what you wanted to talk about?", "probing"),
      sc("Ms. Berger", "the examiner", "to check feedback language",
        "The examiner plays the person receiving feedback.",
        "Give candid, constructive feedback.",
        "In this role play, my last three reports were late. What did you want to discuss?", "defensive"),
    ],
  },

  {
    id: "c1-a-negotiation",
    topic: "reaching an agreement neither side resents",
    objectives: [
      "State what you can accept and where your limit is.",
      "Close the agreement explicitly.",
    ],
    goal: "Reach a deal both sides can live with.",
    target: "closing a negotiation",
    correction: "Model the acceptance or limit and let the learner move the deal on.",
    summary: "You practised reaching an agreement that neither side resents.",
    minutes: 8,
    points: [
      {
        form: "I could live with",
        claims: [
          "'I could live with' accepts something without pretending to like it.",
          "Overstating your enthusiasm invites the other side to push further.",
        ],
        ex: ["I could live with that.", "I could live with the later date."],
      },
      {
        form: "that's my limit",
        claims: [
          "'That's my limit' is only useful if it is true; a bluff that is called costs you the next round.",
          "Stating a limit once, clearly, is stronger than repeating it.",
        ],
        ex: ["That's my limit, honestly.", "That's my limit on the timeline."],
      },
      {
        form: "do we have a deal",
        claims: [
          "'Do we have a deal?' closes explicitly rather than letting the talk drift.",
          "An unclosed negotiation tends to reopen at the worst moment.",
        ],
        ex: ["So do we have a deal?", "Do we have a deal on that basis?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I could live with
      sit("p1", "The seller offers a later delivery date. You don't love it, but you can accept it. What do you say?", [
        "I could live with the later date.",
        "I could living with the later date.",
        "I could live of the later date.",
      ]),
      fc("p1", "I could live ___ that.", ["with", "at", "of"]),
      la("p1", "I could live with a smaller discount.", ["living"]),
      // p2 — that's my limit
      sit("p2", "You can pay nine hundred euros and not one euro more. You want to say this once, clearly. What do you say?", [
        "Nine hundred. That's my limit.",
        "Nine hundred. That's my limits.",
        "Nine hundred. That my limit.",
      ]),
      chat("p2", ["Could you go to three weeks?", null], [
        "No, two weeks. That's my limit, honestly.",
        "No, two weeks. That are my limit, honestly.",
        "No, two weeks. That's my limiting, honestly.",
      ]),
      spk("p2", "Two weeks is fine, but that's my limit."),
      // p3 — do we have a deal
      sit("p3", "You and the other side have agreed on price and date. You want to close clearly now. What do you ask?", [
        "So do we have a deal?",
        "So do we have deal?",
        "So do we having a deal?",
      ]),
      fc("p3", "Do we have a ___ on that basis?", ["deal", "dealing", "dealt"]),
      lc("p3", "So do we have a deal?", [
        "So what do we do now?",
        "So did we lose the deal?",
      ]),
      // karışık
      chat("mix", ["I can do the later date, but only at full price.", null], [
        "I could live with that. Do we have a deal?",
        "I could live with that. Do we having a deal?",
        "I could living with that. Do we have a deal?",
      ]),
      sit("mix", "You accept the later date, but nine hundred euros is the most you can pay. What do you say?", [
        "I could live with the date. Nine hundred, that's my limit.",
        "I could live with the date. Nine hundred, that's my limits.",
        "I could live of the date. Nine hundred, that's my limit.",
      ]),
    ],
    success: "The learner accepts, marks a limit and closes explicitly.",
    quiz: [
      qmcq("What is the risk of overstating enthusiasm?", [
        "It invites the other side to push further.",
        "It ends the negotiation.",
        "It is considered rude.",
      ], 0),
      qfill("That's my ___ on the timeline. (limit)", ["limit"]),
      qmcq("Why close explicitly?", [
        "An unclosed negotiation tends to reopen badly.",
        "It is required in formal English.",
        "It shortens the meeting.",
      ], 0),
    ],
    scenes: [
      sc("Mr. Grant", "a neighbour buying your bike", "to reach a deal today",
        "A neighbour wants your bike and you want to settle it today.",
        "Accept, limit and close.",
        "I like the bike, but the price is high. What would it take to finish this today?", "businesslike"),
      sc("Ilaria", "a supplier's negotiator", "to settle terms",
        "Terms are nearly agreed and need closing.",
        "Mark limits and close.",
        "Price and date are agreed. One item is left, the payment terms. Where are you on them?", "focused"),
      sc("Sunita", "a market seller", "to agree a price",
        "A price is being haggled.",
        "Accept, limit and close.",
        "This rug is two hundred euros, but I can talk. What is your offer?", "shrewd"),
      sc("Mr. Wickham", "your tutor", "to practise closing",
        "In a seminar negotiation exercise, your tutor plays a client.",
        "Accept, limit and close.",
        "I'll accept your price if you finish a week earlier. What do you say?", "probing"),
      sc("Ms. Roux", "the examiner", "to check negotiation language",
        "The examiner negotiates with you.",
        "Accept, limit and close.",
        "I want a shorter timeline and a lower price. Both?", "neutral"),
    ],
  },

  {
    id: "c1-handling-a-crisis-call",
    topic: "staying clear while information is incomplete",
    objectives: [
      "Separate what is known from what is not.",
      "Commit to a next update rather than an answer.",
    ],
    goal: "Speak clearly in a crisis without pretending to know more than you do.",
    target: "communicating under uncertainty",
    correction: "Model the separation of known from unknown and let the learner continue.",
    summary: "You practised staying clear and calm while information was still incomplete.",
    minutes: 8,
    points: [
      {
        form: "here's what we know",
        claims: [
          "'Here's what we know' fences off the confirmed facts from everything else.",
          "The fence is what stops speculation being heard as fact.",
        ],
        ex: ["Here's what we know so far.", "Here's what we know, and what we don't."],
      },
      {
        form: "what we're doing now",
        claims: [
          "'What we're doing now' reports action, which is often what the listener needs most.",
          "Action can be reported honestly even when the cause is still unknown.",
        ],
        ex: ["What we're doing now is checking every site.", "What we're doing now is containing it."],
      },
      {
        form: "I'll update you",
        claims: [
          "'I'll update you at four' commits to a time rather than to an answer.",
          "Missing a promised update can damage trust further, even when there is still no final answer.",
        ],
        ex: ["I'll update you at four.", "I'll update you as soon as we know more."],
      },
    ],
    ex: [],
    drills: [
      // p1 — here's what we know
      sit("p1", "A client calls during an outage. Three sites are down and the cause is unknown. How do you start?", [
        "Here's what we know: three sites are down.",
        "Here's what we knows: three sites are down.",
        "Here's what do we know: three sites are down.",
      ]),
      fc("p1", "Here's what we ___ so far.", ["know", "known", "knowing"]),
      lc("p1", "Here's what we know, and what we don't.", [
        "Here's what we knew before the outage.",
        "We don't know anything yet.",
      ]),
      // p2 — what we're doing now
      sit("p2", "The cause is still unknown, but your team is checking every site. You want to report this action. What do you say?", [
        "What we're doing now is checking every site.",
        "What we're doing now is check every site.",
        "What we doing now is checking every site.",
      ]),
      chat("p2", ["Are you doing anything about it?", null], [
        "Yes. What we're doing now is containing it.",
        "Yes. What we're doing now is contain it.",
        "Yes. What we're do now is containing it.",
      ]),
      spk("p2", "What we're doing now is restarting the servers."),
      // p3 — I'll update you
      sit("p3", "You can't give the cause yet, but you can call back in an hour. What do you promise?", [
        "I'll update you in an hour.",
        "I'll updating you in an hour.",
        "I'll update to you in an hour.",
      ]),
      fc("p3", "I'll ___ you at four, even if we don't know more.", ["update", "updating", "updated"]),
      la("p3", "I'll update you at four.", ["updated"]),
      // karışık
      chat("mix", ["Our orders have stopped. What's happening?", null], [
        "Here's what we know: payments are down. I'll update you at noon.",
        "Here's what we know: payments are down. I'll updating you at noon.",
        "Here's what we knows: payments are down. I'll update you at noon.",
      ]),
      sit("mix", "A journalist asks about the outage. One site is down, and your team is moving customers to a backup. What do you say?", [
        "Here's what we know: one site is down. What we're doing now is moving customers to a backup.",
        "Here's what we know: one site is down. What we're doing now is move customers to a backup.",
        "Here's what we knows: one site is down. What we're doing now is moving customers to a backup.",
      ]),
    ],
    success: "The learner separates known from unknown and commits to an update time.",
    quiz: [
      qmcq("Why fence off what is known?", [
        "It stops speculation being heard as fact.",
        "It shortens the call.",
        "It avoids the passive voice.",
      ], 0),
      qfill("I'll ___ you as soon as we know more. (update)", ["update"]),
      qmcq("What can damage trust further during an incident?", [
        "missing a promised update",
        "a long explanation",
        "an early apology",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Petrov", "a neighbour in your building", "to know what is happening",
        "A pipe has burst somewhere in your building and nobody knows where yet. You are the building's contact person.",
        "Report clearly under uncertainty.",
        "There's water coming through my ceiling. What is going on?", "alarmed"),
      sc("Mr. Reddy", "an executive demanding answers", "to get a straight status",
        "An executive wants answers nobody has yet.",
        "Separate known from unknown.",
        "I need the cause, not a process update. What is it?", "pressing"),
      sc("Kwame", "a passenger on a delayed flight", "to get an accurate update",
        "You work for the airline. A flight is held at the gate and the cause is not yet known.",
        "Report only what is confirmed.",
        "Our plane has been sitting here for an hour. What is happening?", "persistent"),
      sc("Professor Berg", "your tutor", "to practise crisis communication",
        "In a seminar simulation, your tutor plays a client during an outage.",
        "Separate known from unknown.",
        "Our booking system has just stopped. What can you tell me?", "probing"),
      sc("Ms. Kaur", "the examiner", "to check clarity under uncertainty",
        "The examiner presses for answers you do not have.",
        "Report clearly and commit to an update.",
        "In this role play, two of our systems are down and engineers are checking them. I am your manager. What can you tell me?", "neutral"),
    ],
  },

  // --- Ünite 9 · Culture and Idiom -------------------------------------------
  {
    id: "c1-idioms-worth-knowing",
    topic: "fixed expressions and where they fit",
    objectives: [
      "Use a few common idioms in the right situation.",
      "Judge when an idiom would be out of place.",
    ],
    goal: "Use idiom naturally rather than decoratively.",
    target: "common fixed expressions",
    correction: "Model the idiom in its natural situation and let the learner use it.",
    summary: "You learned a few common idioms and where they belong.",
    minutes: 8,
    points: [
      {
        form: "it's a long shot",
        claims: [
          "'It's a long shot' means success is unlikely; it is often used when an attempt is still being considered.",
          "It fits a suggestion rather than a flat refusal, because the attempt is still on the table.",
        ],
        ex: ["It's a long shot, but worth asking.", "It's a long shot at this stage."],
      },
      {
        form: "that ship has sailed",
        claims: [
          "'That ship has sailed' means the opportunity has gone for good.",
          "It closes a topic, so it can sound dismissive if the other person is still hoping.",
        ],
        ex: ["That ship has sailed, I'm afraid.", "That ship sailed months ago."],
      },
      {
        form: "off the top of",
        claims: [
          "'Off the top of my head' marks an answer as immediate rather than researched or carefully considered.",
          "It warns the listener that the figure may need checking before anyone relies on it.",
        ],
        ex: ["Off the top of my head, about thirty.", "Off the top of my head, I'd say Tuesday."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's a long shot
      sit("p1", "A friend asks if you can still get tickets for a sold-out show. It's very unlikely, but you'll try. What do you say?", [
        "It's a long shot, but I'll ask.",
        "It's a long shoot, but I'll ask.",
        "It's a long shots, but I'll ask.",
      ]),
      fc("p1", "It's a long ___ at this stage, but worth trying.", ["shot", "shoot", "shut"]),
      la("p1", "It's a long shot, but worth asking.", ["shoot"]),
      // p2 — that ship has sailed
      sit("p2", "A colleague wants to revive a deal from last year. The client has already signed with someone else. What do you say?", [
        "That ship has sailed, I'm afraid.",
        "That ship has sailing, I'm afraid.",
        "That ship has sail, I'm afraid.",
      ]),
      chat("p2", ["The course closed in March. Could we still apply?", null], [
        "No, that ship sailed months ago.",
        "No, that ship sail months ago.",
        "No, that ship sailed months before ago.",
      ]),
      spk("p2", "That ship has sailed, I'm afraid."),
      // p3 — off the top of my head
      sit("p3", "Someone asks how many people came to last year's event. You haven't checked, but you think about thirty. What do you say?", [
        "Off the top of my head, about thirty.",
        "Off the top of my mind, about thirty.",
        "Off the tops of my head, about thirty.",
      ]),
      fc("p3", "Off the ___ of my head, it costs about fifty.", ["top", "tip", "back"]),
      lc("p3", "Off the top of my head, about twenty.", [
        "At the top of the hill, about twenty.",
        "On the back of the bus, about twenty.",
      ]),
      // karışık
      chat("mix", ["Can we still join the trip that left last week? And roughly what did it cost?", null], [
        "That ship has sailed. Off the top of my head, about two hundred.",
        "That ship has sailed. Off the top of my mind, about two hundred.",
        "That ship has sail. Off the top of my head, about two hundred.",
      ]),
      sit("mix", "A friend asks two things: can he still return a jacket he bought a year ago, and can he get a seat on tonight's full train?", [
        "The jacket? That ship has sailed. The train? It's a long shot.",
        "The jacket? That ship has sail. The train? It's a long shot.",
        "The jacket? That ship has sailed. The train? It's a long shoot.",
      ]),
    ],
    success: "The learner uses at least two idioms in fitting situations.",
    quiz: [
      qmcq("What does 'it's a long shot' imply?", [
        "success is unlikely but an attempt is being considered",
        "the attempt has already been refused",
        "success is certain",
      ], 0),
      qfill("Off the top of my ___, I'd say Tuesday. (head)", ["head"]),
      qmcq("When can 'that ship has sailed' sound dismissive?", [
        "when the other person is still hoping",
        "when the topic is formal",
        "when it opens a conversation",
      ], 0),
    ],
    scenes: [
      sc("Beatriz", "a friend asking for a favour", "to hear whether it is possible",
        "A friend is asking for something unlikely.",
        "Use idiom where it fits.",
        "The concert on Saturday is sold out. Any chance you could still get me a ticket?", "hopeful"),
      sc("Andres", "a colleague raising an old idea", "to learn the moment has passed",
        "A colleague is reviving an idea whose moment has gone.",
        "Close the topic without dismissiveness.",
        "The client signed with another firm in May. Could we not revisit our proposal from last spring?", "persistent"),
      sc("Rafael", "a fellow traveller planning the route", "to get a rough figure",
        "A fellow traveller wants a distance you have not checked.",
        "Flag the answer as unchecked.",
        "Roughly how far is it to the next town, do you think?", "casual"),
      sc("Mrs. Nowak", "your tutor", "to practise idiom in context",
        "Your tutor fires quick questions at the seminar group.",
        "Use idiom where it fits.",
        "Roughly how many sources did you use in your essay?", "probing"),
      sc("Mr. Delacroix", "the examiner", "to check idiomatic range",
        "The examiner asks a series of quick questions.",
        "Use idiom naturally.",
        "Applications for the course closed yesterday, but one place may become available. Is there any chance for you?", "neutral"),
    ],
  },

  {
    id: "c1-words-that-go-together",
    topic: "which words habitually pair",
    objectives: [
      "Choose the collocation a native speaker would expect.",
      "Recognise that grammatical alternatives can still sound wrong.",
    ],
    goal: "Choose word pairings that sound native rather than merely correct.",
    target: "collocation",
    correction: "Give the expected pairing and let the learner use it.",
    summary: "You learned that words pair by habit, not only by grammar.",
    minutes: 9,
    points: [
      {
        form: "heavy rain",
        claims: [
          "'Heavy rain' is the usual pairing; 'strong rain' is grammatical but unidiomatic.",
          "Collocation is a matter of habit, so it has to be learned pair by pair.",
        ],
        ex: ["We had heavy rain all week.", "There was heavy traffic on the motorway."],
      },
      {
        form: "strong argument",
        claims: [
          "'Strong' pairs with argument, opinion and coffee; 'heavy' does not.",
          "The same adjective changes partner depending on the noun.",
        ],
        ex: ["She made a strong argument.", "He has strong opinions about it."],
      },
      {
        form: "deeply grateful",
        claims: [
          "'Deeply' pairs with feeling words such as grateful, concerned and regret; with an ordinary adjective such as 'tall' it does not work.",
          "'Very grateful' is also correct; 'deeply' raises the register.",
        ],
        ex: ["I'm deeply grateful for your help.", "We are deeply concerned about it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — heavy rain
      fc("p1", "We were late because of ___ traffic on the motorway.", ["heavy", "strong", "deep"]),
      sit("p1", "It rained hard all day yesterday. What is the usual way to describe the weather?", [
        "There was heavy rain all day.",
        "There was strong rain all day.",
        "There was deep rain all day.",
      ]),
      lc("p1", "We had heavy rain all week.", [
        "We had strong rain all week.",
        "We had heavy snow all week.",
      ]),
      // p2 — strong argument
      fc("p2", "She made a ___ argument for waiting.", ["strong", "heavy", "deep"]),
      chat("p2", ["What does your uncle think about the new law?", null], [
        "He has strong opinions about it.",
        "He has heavy opinions about it.",
        "He has deep opinions about it.",
      ]),
      spk("p2", "He made a strong argument against it."),
      // p3 — deeply grateful
      fc("p3", "I'm ___ grateful for everything you did.", ["deeply", "heavily", "strongly"]),
      sit("p3", "A colleague worked all weekend to help you. You thank her in a formal email. What do you write?", [
        "I'm deeply grateful for your help.",
        "I'm heavily grateful for your help.",
        "I'm deep grateful for your help.",
      ]),
      err("p3", "I deep regret what I said.", "deep", "deeply"),
      // karışık
      pairs("mix", [["strong", "coffee"], ["heavy", "traffic"], ["deeply", "grateful"]]),
      sit("mix", "It rained hard all day, but a colleague still defended your plan well. You thank her formally. What do you write?", [
        "Despite the heavy rain, you made a strong argument. I'm deeply grateful.",
        "Despite the deep rain, you made a strong argument. I'm deeply grateful.",
        "Despite the heavy rain, you made a heavy argument. I'm deeply grateful.",
      ]),
      chat("mix", ["How was the drive?", null], [
        "Awful. Heavy rain and heavy traffic the whole way.",
        "Awful. Heavy rain and deep traffic the whole way.",
        "Awful. Heavy rain and strong traffic the whole way.",
      ]),
    ],
    success: "The learner chooses idiomatic collocations at least twice.",
    quiz: [
      qmcq("Which pairing is idiomatic?", [
        "heavy traffic",
        "strong traffic",
        "deep traffic",
      ], 0),
      qfill("We are ___ concerned about the delay. (deep)", ["deeply"]),
      qmcq("Why must collocation be learned pair by pair?", [
        "It is a matter of habit rather than rule.",
        "The grammar changes with each noun.",
        "The words change meaning entirely.",
      ], 0),
    ],
    scenes: [
      sc("Ilse", "a friend also learning English", "to compare which pairings sound right",
        "Two learners are comparing word choices.",
        "Choose the expected pairings.",
        "I said 'strong rain' and everyone laughed. What should I have said?", "puzzled"),
      sc("Tomasz", "a colleague proofreading your text", "to make a text sound native",
        "A text is grammatical but reads oddly.",
        "Correct the pairings.",
        "My report says 'strong traffic' and 'a heavy argument'. Nothing is wrong grammatically, but it sounds odd. What would you change?", "helpful"),
      sc("Aiko", "a fellow traveller writing a hotel review", "to make wording idiomatic",
        "A fellow traveller's hotel review needs idiomatic wording.",
        "Choose native pairings.",
        "I wrote that we had 'strong rain' all week and that I'm 'heavily grateful' to the staff. Does that sound right?", "precise"),
      sc("Professor Novak", "your tutor", "to practise collocation",
        "The seminar is examining collocation.",
        "Choose expected pairings.",
        "Why is 'strong rain' unusual in standard English when nothing in the grammar forbids it?", "probing"),
      sc("Ms. Alvarez", "the examiner", "to check collocational range",
        "The examiner asks you to describe things.",
        "Choose idiomatic pairings.",
        "Could you describe last winter's weather to me?", "neutral"),
    ],
  },

  {
    id: "c1-humour-and-irony",
    topic: "signalling that you do not mean it literally",
    objectives: [
      "Signal irony so it is not taken at face value.",
      "Recognise the risk when the signal is missed.",
    ],
    goal: "Use irony without being misunderstood.",
    target: "signalling irony",
    correction: "Model the ironic line with its signal and let the learner try one.",
    summary: "You learned to signal irony and to notice when the signal may be missed.",
    minutes: 8,
    points: [
      {
        form: "well that went well",
        claims: [
          "'Well, that went well' says the opposite of its words, carried by tone.",
          "In writing the tone is missing, so irony there needs a clearer marker.",
        ],
        ex: ["Well, that went well.", "Well, that could have gone better."],
      },
      {
        form: "just what I needed",
        claims: [
          "'Just what I needed' is ironic when the thing is plainly unwelcome.",
          "The situation carries the irony, so it works only when the situation is obvious.",
        ],
        ex: ["Rain again — just what I needed.", "Another meeting, just what I needed."],
      },
      {
        form: "no pressure then",
        claims: [
          "'No pressure then' names an obvious pressure by denying it.",
          "If irony has to be explained, it has failed to communicate in that context.",
        ],
        ex: ["Due tomorrow? No pressure then.", "Everyone is watching. No pressure then."],
      },
    ],
    ex: [],
    drills: [
      // p1 — well that went well
      sit("p1", "Your presentation crashed twice and the client left early. Walking out, you joke with a colleague. What do you say?", [
        "Well, that went well.",
        "Well, that gone well.",
        "Well, that going well.",
      ]),
      lc("p1", "Well, that went well, didn't it?", [
        "Well, that went wrong, didn't it?",
        "Well, that one took long, didn't it?",
      ]),
      spk("p1", "Well, that went really well."),
      // p2 — just what I needed
      sit("p2", "You wake up with a cold on the morning of your big exam. You joke to a friend. What do you say?", [
        "A cold on exam day. Just what I needed.",
        "A cold on exam day. Just what I need it.",
        "A cold on exam day. Just that I needed.",
      ]),
      fc("p2", "Another delay. Just ___ I needed.", ["what", "that", "which"]),
      chat("p2", ["Bad news: the printer is broken again.", null], [
        "Just what I needed today.",
        "Just what I need it today.",
        "Just that I needed today.",
      ]),
      // p3 — no pressure then
      sit("p3", "Your boss says the CEO will watch your first presentation tomorrow. You smile and joke. What do you say?", [
        "The CEO is coming? No pressure then.",
        "The CEO is coming? No pressures then.",
        "The CEO is coming? Not pressure then.",
      ]),
      fc("p3", "Your parents are coming too? No ___ then.", ["pressure", "pressured", "press"]),
      lc("p3", "The boss is coming? No pressure then.", [
        "The boss is coming? Then let's get ready.",
        "The boss is leaving? No meeting then.",
      ]),
      // karışık
      chat("mix", ["The train is cancelled, the next one is full, and your talk starts in an hour.", null], [
        "Just what I needed. No pressure then.",
        "Just what I needed. No pressures then.",
        "Just what I need it. No pressure then.",
      ]),
      sit("mix", "A meeting just went badly, and now your boss adds another one tonight. You joke with a colleague. What do you say?", [
        "Well, that went well. And another meeting, just what I needed.",
        "Well, that gone well. And another meeting, just what I needed.",
        "Well, that went well. And another meeting, just what I need it.",
      ]),
    ],
    success: "The learner signals irony clearly and judges when it is risky.",
    quiz: [
      qmcq("Why is irony riskier in writing?", [
        "The tone that carries it is missing.",
        "The grammar changes.",
        "It cannot be written down.",
      ], 0),
      qfill("Everyone is watching. No ___ then. (pressure)", ["pressure"]),
      qmcq("What is true of irony that has to be explained?", [
        "It has failed to communicate in that context.",
        "It becomes funnier.",
        "It becomes more formal.",
      ], 0),
    ],
    scenes: [
      sc("Yusuf", "a friend having a bad day", "to share the absurdity",
        "A series of small disasters has piled up.",
        "React ironically.",
        "The car would not start, and then it rained. Perfect, isn't it?", "wry"),
      sc("Ottoline", "a colleague after a bad meeting", "to share a reaction quietly",
        "A meeting went badly and you are both leaving it.",
        "React ironically but discreetly.",
        "Well. The client walked out halfway through. What did you make of it?", "dry"),
      sc("Noor", "a fellow traveller after a delay", "to keep spirits up",
        "A third delay has been announced.",
        "React ironically.",
        "Delayed again. Three hours this time. Thoughts?", "resigned"),
      sc("Mr. Halvorsen", "your tutor", "to practise irony",
        "In a seminar on irony, your tutor gives you situations to react to.",
        "Signal irony clearly.",
        "Your laptop dies five minutes before your presentation. How do you react?", "probing"),
      sc("Ms. Cardoso", "the examiner", "to check control of irony",
        "The examiner reports something unwelcome.",
        "React ironically and appropriately.",
        "Your exam has been moved to tomorrow morning. Reaction?", "neutral"),
    ],
  },

  {
    id: "c1-what-not-to-say",
    topic: "expressions that land badly",
    objectives: [
      "Recognise phrasing that causes offence unintentionally.",
      "Offer a safer alternative for the same meaning.",
    ],
    goal: "Say the same thing without the phrasing that lands badly.",
    target: "avoiding phrasing that offends",
    correction: "Offer the safer alternative and let the learner rephrase.",
    summary: "You learned which phrasings land badly and how to say the same thing safely.",
    minutes: 8,
    points: [
      {
        form: "I'd avoid saying",
        claims: [
          "'I'd avoid saying that' flags a phrasing without accusing the speaker of bad intent.",
          "Most phrasing that offends is chosen without any intention to offend.",
        ],
        ex: ["I'd avoid saying 'you people'.", "I'd avoid saying that in a first meeting."],
      },
      {
        form: "that could be taken",
        claims: [
          "'That could be taken as...' names the risk rather than the intention.",
          "Naming the reading rather than the motive keeps the correction usable.",
        ],
        ex: ["That could be taken as a criticism.", "That could be taken the wrong way."],
      },
      {
        form: "safer to say",
        claims: [
          "'It's safer to say...' offers the replacement rather than only the warning.",
          "A warning without an alternative tends to make the speaker say nothing at all.",
        ],
        ex: ["It's safer to say 'I'm not sure I follow'.", "It's safer to say it differently."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd avoid saying
      sit("p1", "A colleague plans to call a client group 'you people'. You want to flag it without accusing him. What do you say?", [
        "I'd avoid saying 'you people'.",
        "I'd avoid to say 'you people'.",
        "I'd avoiding saying 'you people'.",
      ]),
      fc("p1", "I'd avoid ___ that in a first meeting.", ["saying", "to say", "say"]),
      la("p1", "I'd avoid saying that to a client.", ["say"]),
      // p2 — that could be taken
      sit("p2", "A friend wants to tell his host the food is 'interesting'. You think the host may hear criticism. What do you say?", [
        "That could be taken as a criticism.",
        "That could be take as a criticism.",
        "That could taken as a criticism.",
      ]),
      chat("p2", ["I told the new team their old system was 'simple'. Was that OK?", null], [
        "That could be taken as an insult.",
        "That could be taking as an insult.",
        "That could be took as an insult.",
      ]),
      lc("p2", "That could be taken as a complaint.", [
        "That could be a good idea.",
        "That was taken as a joke.",
      ]),
      // p3 — safer to say
      sit("p3", "Someone wants to tell a client 'Your explanation is confusing.' You offer a better line. What do you say?", [
        "It's safer to say 'Could you go over that again?'",
        "It's more safer to say 'Could you go over that again?'",
        "It's safer to saying 'Could you go over that again?'",
      ]),
      fc("p3", "It's ___ to say 'I'm not sure I follow'.", ["safer", "safely", "safety"]),
      spk("p3", "It's safer to say it differently."),
      // karışık
      chat("mix", ["I'm going to tell her the plan is 'naive'. Fine?", null], [
        "That could be taken as an insult. It's safer to say 'risky'.",
        "That could be taken as an insult. It's safer to saying 'risky'.",
        "That could be take as an insult. It's safer to say 'risky'.",
      ]),
      sit("mix", "A colleague wants to call a client's idea 'old-fashioned'. You flag the word and offer another. What do you say?", [
        "I'd avoid saying 'old-fashioned'. It's safer to say 'traditional'.",
        "I'd avoid to say 'old-fashioned'. It's safer to say 'traditional'.",
        "I'd avoid saying 'old-fashioned'. It's safer to saying 'traditional'.",
      ]),
    ],
    success: "The learner flags the phrasing and offers a usable alternative.",
    quiz: [
      qmcq("Why name the reading rather than the motive?", [
        "It keeps the correction usable.",
        "It is grammatically required.",
        "It shortens the sentence.",
      ], 0),
      qfill("That could be ___ the wrong way. (take)", ["taken"]),
      qmcq("What happens with a warning and no alternative?", [
        "The speaker tends to say nothing at all.",
        "The speaker repeats the phrase.",
        "The correction becomes formal.",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend writing to her landlord", "to avoid a misstep with her landlord",
        "A friend's message to her landlord contains phrasing that will land badly.",
        "Flag it and offer an alternative.",
        "I'm about to text my landlord: 'Your repairs are useless.' Does that sound all right?", "hurried"),
      sc("Owen", "a team member new to the culture", "to learn what lands badly here",
        "A new colleague is unfamiliar with local norms.",
        "Flag the phrasing kindly.",
        "In the meeting I told the client 'you people always change your minds', and the room went quiet. What did I do?", "worried"),
      sc("Fatima", "a travel companion about to complain at reception", "to avoid a phrase that will cost her",
        "Your travel companion is about to complain to the hotel with a risky phrase.",
        "Flag it and replace it.",
        "I'm going to tell reception their hotel is a dump. Good idea?", "nervous"),
      sc("Mr. Tremblay", "your tutor", "to practise flagging phrasing",
        "Your tutor reads out phrases that students wrote to clients.",
        "Flag and replace phrasing.",
        "One student wrote 'Your question makes no sense.' What would you tell him?", "probing"),
      sc("Ms. Petrenko", "the examiner", "to check pragmatic awareness",
        "The examiner uses a risky phrase deliberately.",
        "Flag it and offer an alternative.",
        "I would say your generation simply does not want to work. Fair?", "neutral"),
    ],
  },

  {
    id: "c1-reading-the-room",
    topic: "adjusting to the company you are in",
    objectives: [
      "Judge when a subject or register does not fit the room.",
      "Adjust mid-conversation, explaining the change only as far as the room allows.",
    ],
    goal: "Adjust how you speak to the room you are actually in.",
    target: "reading and adjusting to the room",
    correction: "Model the adjustment and let the learner change course.",
    summary: "You practised judging what fits a room and changing course when it does not.",
    minutes: 8,
    points: [
      {
        form: "maybe not here",
        claims: [
          "'Maybe not here' postpones a subject rather than dropping it.",
          "Postponing signals judgement about the setting, not about the subject.",
        ],
        ex: ["Maybe not here — I'll tell you after.", "Maybe not here, with this crowd."],
      },
      {
        form: "I'll keep it short",
        claims: [
          "'I'll keep it short' adjusts length when the room's attention is thin.",
          "Saying it and then talking at length is worse than not saying it.",
        ],
        ex: ["I'll keep it short.", "I'll keep it short, since we're nearly done."],
      },
      {
        form: "reading the mood",
        claims: [
          "'Reading the mood' names the skill and can be used to explain a change of course.",
          "Naming it out loud is itself a choice: when naming it would draw attention to the problem, the adjustment should be invisible.",
        ],
        ex: ["Reading the mood, I'll leave that there.", "Reading the mood, now is not the time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — maybe not here
      sit("p1", "At a family dinner, someone asks about your salary. You'll tell them later, in private. What do you say?", [
        "Maybe not here. I'll tell you later.",
        "Maybe no here. I'll tell you later.",
        "Maybe not here. I'll telling you later.",
      ]),
      fc("p1", "Maybe not ___, with this crowd.", ["here", "hear", "heard"]),
      lc("p1", "Maybe not here. Let's talk outside.", [
        "Maybe not now. Let's talk tomorrow.",
        "Maybe here is better. Let's talk inside.",
      ]),
      // p2 — I'll keep it short
      sit("p2", "It's late, the meeting is nearly over and people look tired. You still need to make one point. How do you start?", [
        "I'll keep it short.",
        "I'll keep it shortly.",
        "I'll keeping it short.",
      ]),
      chat("p2", ["We've only got two minutes left. Anything else?", null], [
        "Just one thing. I'll keep it short.",
        "Just one thing. I'll keep it shortly.",
        "Just one thing. I'll keep short it.",
      ]),
      spk("p2", "I'll keep it short, I promise."),
      // p3 — reading the mood
      sit("p3", "You start a joke, then notice the room has gone quiet and serious. You drop it and say why. What do you say?", [
        "Reading the mood, I'll stop there.",
        "Reading the mood, I'll stopping there.",
        "Readed the mood, I'll stop there.",
      ]),
      fc("p3", "___ the mood, I think we should move on.", ["Reading", "Readed", "Reads"]),
      chat("p3", ["Go on, finish the story about the boss!", null], [
        "Reading the mood, now is not the time.",
        "Reading the mood, now not is the time.",
        "Reads the mood, now is not the time.",
      ]),
      // karışık
      chat("mix", ["You were saying something about the money?", null], [
        "Reading the mood, maybe not here. I'll tell you after.",
        "Reading the mood, maybe no here. I'll tell you after.",
        "Readed the mood, maybe not here. I'll tell you after.",
      ]),
      sit("mix", "The meeting is almost over and people are restless, so you drop your long story and say why. What do you say?", [
        "Reading the mood, I'll keep it short.",
        "Reading the mood, I'll keep it shortly.",
        "Reading the mood, I'll keeping it short.",
      ]),
    ],
    success: "The learner changes course and keeps any explanation of it brief.",
    quiz: [
      qmcq("What does postponing signal?", [
        "judgement about the setting, not the subject",
        "that the subject is forbidden",
        "that the speaker has finished",
      ], 0),
      qfill("I'll keep it ___, since we're nearly done. (short)", ["short"]),
      qmcq("When should the adjustment be invisible?", [
        "when naming it would draw attention to the problem",
        "whenever the room is formal",
        "whenever more than three people are present",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "a friend in mixed company", "to avoid an awkward moment",
        "You have started a subject that does not suit the company.",
        "Adjust course smoothly.",
        "Go on, you were saying something about the money?", "oblivious"),
      sc("Simone", "a colleague at a client dinner", "to keep the evening on track",
        "A client dinner is not the place for an internal issue.",
        "Postpone without awkwardness.",
        "You wanted to raise something about the contract?", "alert"),
      sc("Emil", "a fellow guest at a tour group dinner", "to keep the dinner comfortable",
        "At a tour group dinner, someone asks your honest opinion of the guide, who is sitting at the table.",
        "Adjust course.",
        "Everyone's listening. Go on, what did you really think of our guide?", "watchful"),
      sc("Mrs. Aguilar", "your tutor", "to practise situational judgement",
        "A seminar is about to end and everyone is packing up.",
        "Adjust course convincingly.",
        "We have one minute before the break. What did you want to tell the group?", "probing"),
      sc("Mr. Nakamura", "the examiner", "to check situational judgement",
        "The examiner raises something inappropriate for the setting.",
        "Adjust course.",
        "We are in a full waiting room and everyone can hear us. Tell me, what do you actually earn?", "neutral"),
    ],
  },

  {
    id: "c1-talking-across-cultures",
    topic: "when unspoken assumptions differ",
    objectives: [
      "Name your own assumption rather than presenting it as normal.",
      "Ask how something works instead of guessing.",
    ],
    goal: "Handle a conversation where the unspoken rules differ.",
    target: "navigating differing assumptions",
    correction: "Model the assumption-naming move and let the learner ask rather than guess.",
    summary: "You practised naming your own assumptions instead of treating them as normal.",
    minutes: 8,
    points: [
      {
        form: "where I'm from",
        claims: [
          "'Where I'm from' marks a practice as local rather than universal.",
          "It presents your norm as one option among several.",
        ],
        ex: ["Where I'm from, you would call first.", "Where I'm from, that would be unusual."],
      },
      {
        form: "how does that work",
        claims: [
          "'How does that work here?' asks rather than guesses.",
          "Asking directly is usually received better than guessing wrong.",
        ],
        ex: ["How does that work here?", "How does that usually work?"],
      },
      {
        form: "I don't want to assume",
        claims: [
          "'I don't want to assume' flags that you know your default may not apply.",
          "It invites correction before the mistake rather than after it.",
        ],
        ex: ["I don't want to assume anything.", "I don't want to assume it is the same."],
      },
    ],
    ex: [],
    drills: [
      // p1 — where I'm from
      sit("p1", "A new colleague drops by your home without calling first. In your country people always call first. You explain gently. What do you say?", [
        "Where I'm from, people usually call first.",
        "Where I from, people usually call first.",
        "Where I'm from it, people usually call first.",
      ]),
      fc("p1", "___ I'm from, that would be unusual.", ["Where", "What", "When"]),
      lc("p1", "Where I'm from, dinner starts at nine.", [
        "Where I live now, dinner starts at six.",
        "Where are you from, and when is dinner?",
      ]),
      // p2 — how does that work
      sit("p2", "You don't know if people tip in restaurants here, and you don't want to guess. What do you ask?", [
        "How does that work here?",
        "How does that works here?",
        "How do that work here?",
      ]),
      chat("p2", ["People here split the bill in a special way.", null], [
        "Really? How does that usually work?",
        "Really? How does that usually works?",
        "Really? How that usually works?",
      ]),
      spk("p2", "How does that work in your office?"),
      // p3 — I don't want to assume
      sit("p3", "You are meeting a client from another market and don't know if gifts are expected. You say so before acting. What do you say?", [
        "I don't want to assume anything.",
        "I don't want assume anything.",
        "I don't want to assuming anything.",
      ]),
      fc("p3", "I don't want to ___, so can I ask?", ["assume", "assuming", "assumed"]),
      la("p3", "I don't want to assume, so I'll ask.", ["assuming"]),
      // karışık
      chat("mix", ["Here we eat dinner at ten.", null], [
        "Where I'm from, it's earlier. How does that work with children?",
        "Where I'm from, it's earlier. How does that works with children?",
        "Where I from, it's earlier. How does that work with children?",
      ]),
      sit("mix", "A colleague arrives an hour late to a party here, and you don't know the local rule. What do you say?", [
        "I don't want to assume. How does that work here?",
        "I don't want to assume. How does that works here?",
        "I don't want assume. How does that work here?",
      ]),
    ],
    success: "The learner names an assumption as local and asks rather than guessing.",
    quiz: [
      qmcq("What does 'where I'm from' do?", [
        "marks a practice as local rather than universal",
        "claims the practice is correct",
        "asks a question",
      ], 0),
      qfill("I don't want to ___ it is the same. (assume)", ["assume"]),
      qmcq("Why ask rather than guess?", [
        "Asking is usually received better than guessing wrong.",
        "It is grammatically simpler.",
        "It takes less time.",
      ], 0),
    ],
    scenes: [
      sc("Aditi", "a new neighbour from another country", "to work out the local conventions",
        "Two neighbours from different countries are working out each other's norms.",
        "Name your assumptions and ask.",
        "When people invite me for dinner here, I bring wine and they look surprised. Is there a rule I'm missing?", "open"),
      sc("Ferran", "a colleague in your new office abroad", "to help you avoid a misstep",
        "A colleague is explaining how things are done in your new office.",
        "Ask rather than assume.",
        "People here never book meetings before ten. Does that surprise you?", "helpful"),
      sc("Chiara", "the host of your guesthouse abroad", "to explain the house customs",
        "House customs differ from what you are used to.",
        "Name your assumption and ask.",
        "Here we take our shoes off before we go inside. Is it different where you live?", "professional"),
      sc("Professor Iversen", "your tutor", "to practise intercultural pragmatics",
        "In a seminar role play, your tutor plays an exchange student.",
        "Name assumptions and ask.",
        "In my country, students never question the professor. What is it like in yours?", "probing"),
      sc("Mr. Sasaki", "the examiner", "to check intercultural awareness",
        "The examiner describes an unfamiliar convention.",
        "Name your assumption and ask.",
        "Here it would be rude to arrive on time. How would you handle that?", "neutral"),
    ],
  },

  // --- Ünite 10 · Extended Discussion ----------------------------------------
  {
    id: "c1-sustaining-a-long-turn",
    topic: "holding the floor coherently",
    objectives: [
      "Announce the shape of a long answer before giving it.",
      "Return to your thread after a digression.",
    ],
    goal: "Speak at length without losing your listener or your thread.",
    target: "sustaining a long turn",
    correction: "Model the structural marker and let the learner continue the turn.",
    summary: "You learned to hold the floor coherently for more than a few sentences.",
    minutes: 8,
    points: [
      {
        form: "there are three things",
        claims: [
          "Announcing a number tells the listener how long the turn will be.",
          "It also commits you: three announced and two delivered is noticeable.",
        ],
        ex: ["There are three things worth saying.", "There are three reasons for that."],
      },
      {
        form: "before I get to",
        claims: [
          "'Before I get to that' marks a digression as deliberate rather than accidental.",
          "A listener is more likely to wait through a digression they know is temporary.",
        ],
        ex: ["Before I get to the cost, one point on scope.", "Before I get to that, some background."],
      },
      {
        form: "coming back to my",
        claims: [
          "'Coming back to my second point' returns to the announced thread.",
          "A digression you never return from reads as losing your place.",
        ],
        ex: ["Coming back to my second point.", "Coming back to my earlier point about cost."],
      },
    ],
    ex: [],
    drills: [
      // p1 — there are three things
      sit("p1", "You're asked a big question and plan to give three reasons. You want the listener to know how long you'll speak. How do you start?", [
        "There are three things worth saying.",
        "There are three thing worth saying.",
        "There are three things worth say.",
      ]),
      fc("p1", "There are three ___ for that.", ["reasons", "reason", "reasoning"]),
      lc("p1", "There are three things I want to say.", [
        "There are two things I want to say.",
        "There were three places I wanted to see.",
      ]),
      // p2 — before I get to
      sit("p2", "You'll talk about cost, but first you need to give some background. You show the detour is deliberate. What do you say?", [
        "Before I get to the cost, some background.",
        "Before I gets to the cost, some background.",
        "Before I getting to the cost, some background.",
      ]),
      chat("p2", ["So, what about the price?", null], [
        "Before I get to that, one point on scope.",
        "Before I getting to that, one point on scope.",
        "Before I gets to that, one point on scope.",
      ]),
      spk("p2", "Before I get to that, some background."),
      // p3 — coming back to my
      sit("p3", "During your long answer you told a short story. Now you return to your second reason. What do you say?", [
        "Coming back to my second point.",
        "Coming back of my second point.",
        "Coming back to mine second point.",
      ]),
      fc("p3", "___ back to my earlier point about cost.", ["Coming", "Came", "Comes"]),
      la("p3", "Coming back to my point about cost.", ["came"]),
      // karışık
      chat("mix", ["How has technology changed work? Take your time.", null], [
        "There are three things. Before I get to them, some background.",
        "There are three thing. Before I get to them, some background.",
        "There are three things. Before I gets to them, some background.",
      ]),
      sit("mix", "You marked a detour before your second point and gave the background. Now you return. Which pair of lines fits?", [
        "Before I get to that, some background. ... Coming back to my second point.",
        "Before I gets to that, some background. ... Coming back to my second point.",
        "Before I get to that, some background. ... Coming back of my second point.",
      ]),
    ],
    success: "The learner announces a shape, digresses deliberately and returns.",
    quiz: [
      qmcq("What does announcing a number commit you to?", [
        "delivering that many points",
        "speaking for a set time",
        "using formal register",
      ], 0),
      qfill("___ I get to the cost, one point on scope. (before)", ["Before"]),
      qmcq("What does an unreturned digression read as?", [
        "losing your place",
        "a formal choice",
        "a change of topic",
      ], 0),
    ],
    scenes: [
      sc("Ravenna", "a friend who asked a big question", "to get a full answer without getting lost",
        "A friend has asked something that needs a long answer.",
        "Announce the shape and hold the thread.",
        "What has changed most in your life in the last ten years? It is a huge question, I know. Where do you even start?", "curious"),
      sc("Idris", "a panel expecting a full answer", "to hear a structured long answer",
        "A panel has asked a broad question.",
        "Sustain the turn coherently.",
        "Take as long as you need. How will new technology change our industry?", "attentive"),
      sc("Solveig", "a fellow traveller on a long train ride", "to get a full answer",
        "Six hours on a train leave time for a long, coherent answer.",
        "Announce the shape and hold it.",
        "We have six hours on this train. Why did you decide to travel alone?", "relaxed"),
      sc("Professor Adeyemi", "your tutor", "to practise sustained turns",
        "In a seminar, your tutor asks a broad question and wants a long answer.",
        "Announce and hold the thread.",
        "Why do some cities grow while others decline? Can you give us a full answer?", "probing"),
      sc("Ms. Whitlock", "the examiner", "to check sustained speech",
        "The examiner asks a broad question.",
        "Sustain a long coherent turn.",
        "Could you tell me at length how your field has changed?", "neutral"),
    ],
  },

  {
    id: "c1-signposting-where-youre-going",
    topic: "mapping a long answer",
    objectives: [
      "Map the sections of a long answer at the start.",
      "Mark the final section explicitly.",
    ],
    goal: "Let the listener follow a long answer without effort.",
    target: "signposting a long answer",
    correction: "Model the signpost and let the learner move to the next section.",
    summary: "You learned to map a long answer so the listener can follow it.",
    minutes: 8,
    points: [
      {
        form: "I'll start with",
        claims: [
          "'I'll start with' names the first section, which sets the listener's expectation.",
          "Naming the order also commits you publicly, so changing it halfway through is noticeable.",
        ],
        ex: ["I'll start with the background.", "I'll start with what changed."],
      },
      {
        form: "then I'll turn to",
        claims: [
          "'Then I'll turn to' names the next section before you reach it.",
          "Announcing sections in advance is what separates a map from a list.",
        ],
        ex: ["Then I'll turn to the consequences.", "Then I'll turn to what it means now."],
      },
      {
        form: "finally I want to",
        claims: [
          "'Finally I want to' marks the last section, so the listener knows the end is coming.",
          "Using 'finally' and then adding a further section costs the listener's trust.",
        ],
        ex: ["Finally I want to say something about cost.", "Finally I want to come back to the question."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'll start with
      sit("p1", "You'll explain the history of a project before anything else. You announce this first. What do you say?", [
        "I'll start with the history of the project.",
        "I'll starting with the history of the project.",
        "I'll start of the history of the project.",
      ]),
      fc("p1", "I'll ___ with what changed.", ["start", "starting", "started"]),
      la("p1", "I'll start with the background.", ["starting"]),
      // p2 — then I'll turn to
      sit("p2", "After the background, you plan to talk about the consequences. You name that section in advance. What do you say?", [
        "Then I'll turn to the consequences.",
        "Then I'll turning to the consequences.",
        "Then I'll turn the to consequences.",
      ]),
      chat("p2", ["And after the background?", null], [
        "Then I'll turn to what it means now.",
        "Then I'll turned to what it means now.",
        "Then I'll turn to what does it mean now.",
      ]),
      spk("p2", "Then I'll turn to the costs."),
      // p3 — finally I want to
      sit("p3", "You've covered two sections and want to show this is the last one. What do you say?", [
        "Finally, I want to say something about cost.",
        "Finally, I want say something about cost.",
        "Finally, I wanting to say something about cost.",
      ]),
      fc("p3", "___ I want to come back to the question.", ["Finally", "Final", "Finalise"]),
      lc("p3", "Finally, I want to talk about cost.", [
        "First, I want to talk about cost.",
        "Finally, we can cut the cost.",
      ]),
      // karışık
      chat("mix", ["How will you organise your answer?", null], [
        "I'll start with the background, then I'll turn to the costs.",
        "I'll start with the background, then I'll turning to the costs.",
        "I'll starting with the background, then I'll turn to the costs.",
      ]),
      sit("mix", "You map the rest of your answer: next the consequences, and last the cost. What do you say?", [
        "Then I'll turn to the consequences, and finally I want to discuss cost.",
        "Then I'll turning to the consequences, and finally I want to discuss cost.",
        "Then I'll turn to the consequences, and finally I want discuss cost.",
      ]),
    ],
    success: "The learner maps the sections in advance and marks the last one.",
    quiz: [
      qmcq("What does naming the order do?", [
        "It commits you publicly, so a change halfway is noticeable.",
        "It makes the answer shorter.",
        "It removes the need for examples.",
      ], 0),
      qfill("Then I'll ___ to the consequences. (turn)", ["turn"]),
      qmcq("What costs the listener's trust?", [
        "saying 'finally' and then adding another section",
        "mapping the answer in advance",
        "marking the final section",
      ], 0),
    ],
    scenes: [
      sc("Marek", "a friend asking a complicated question", "to follow a long answer easily",
        "A friend has asked something with several parts.",
        "Map the answer before giving it.",
        "Why did you move to this city? It is a long story, isn't it? How will you tell it?", "patient"),
      sc("Renata", "a colleague in a briefing", "to follow a briefing without notes",
        "A briefing must be followed without notes.",
        "Map the sections.",
        "Brief me on the merger. I have no notes, so can you make it easy to follow?", "practical"),
      sc("Kofi", "a tourist on your walking tour", "to follow the tour easily",
        "You are guiding a walking tour of your city.",
        "Map the tour clearly.",
        "I know nothing about this city. What will you show us today?", "attentive"),
      sc("Mrs. Nowak", "your tutor", "to practise signposting",
        "Your tutor asks you to present the plan of your essay.",
        "Map and mark the sections.",
        "Before you present your essay, how will you organise it?", "probing"),
      sc("Mr. Delacroix", "the examiner", "to check discourse organisation",
        "The examiner asks a broad question.",
        "Map the answer in advance.",
        "Why do people travel more than they used to? Could you set out how you will answer first?", "neutral"),
    ],
  },

  {
    id: "c1-an-abstract-question",
    topic: "a question with no clean answer",
    objectives: [
      "Define the terms before answering.",
      "Distinguish two senses of the question.",
    ],
    goal: "Discuss a question that has no single answer without evading it.",
    target: "handling abstract questions",
    correction: "Model the defining move and let the learner take the question apart.",
    summary: "You practised taking apart a question that has no clean answer.",
    minutes: 8,
    points: [
      {
        form: "it depends what we mean",
        claims: [
          "'It depends what we mean by X' defines before answering rather than evading.",
          "Said without then answering, it reads as evasion; said and followed, it is precision.",
        ],
        ex: ["It depends what we mean by success.", "It depends what we mean by fair."],
      },
      {
        form: "I'd distinguish between",
        claims: [
          "'I'd distinguish between X and Y' separates two senses that were being conflated.",
          "Many abstract questions become easier to discuss once the different senses are separated.",
        ],
        ex: ["I'd distinguish between cause and blame.", "I'd distinguish between two senses of it."],
      },
      {
        form: "there's no clean answer",
        claims: [
          "'There's no clean answer' admits the limit honestly rather than inventing one.",
          "Admitting it before giving your best answer is more convincing than after.",
        ],
        ex: ["There's no clean answer, but here is mine.", "There's no clean answer to that."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it depends what we mean
      sit("p1", "Someone asks if your city is a 'successful' city. You want to define the word before you answer. What do you say?", [
        "It depends what we mean by successful.",
        "It depend what we mean by successful.",
        "It depends what we meaning by successful.",
      ]),
      fc("p1", "It depends what we ___ by fair.", ["mean", "meaning", "means"]),
      lc("p1", "It depends what we mean by freedom.", [
        "It depends what we need for freedom.",
        "It doesn't matter what we call freedom.",
      ]),
      // p2 — I'd distinguish between
      sit("p2", "A friend asks who is to blame for an accident. You think the cause and the blame are two separate questions. What do you say?", [
        "I'd distinguish between cause and blame.",
        "I'd distinguishing between cause and blame.",
        "I'd distinguish cause between blame.",
      ]),
      chat("p2", ["Is it better to be respected or liked?", null], [
        "I'd distinguish between being respected and being liked.",
        "I'd to distinguish between being respected and being liked.",
        "I'd distinguish between being respected and be liked.",
      ]),
      spk("p2", "I'd distinguish between two senses of it."),
      // p3 — there's no clean answer
      sit("p3", "Someone asks if progress always makes life better. You admit it isn't simple, then you give your view. What do you say first?", [
        "There's no clean answer, but I'll try.",
        "There's no clean answers, but I'll try.",
        "There's not clean answer, but I'll try.",
      ]),
      fc("p3", "There's no clean ___ to that.", ["answer", "answers", "answering"]),
      la("p3", "There's no clean answer, but here is mine.", ["answers"]),
      // karışık
      chat("mix", ["Is anyone ever really free?", null], [
        "It depends what we mean by free. There's no clean answer.",
        "It depends what we mean by free. There's no clean answers.",
        "It depend what we mean by free. There's no clean answer.",
      ]),
      sit("mix", "Asked whether a good leader must be liked, you define 'good' and separate two meanings of it. What do you say?", [
        "It depends what we mean by good. I'd distinguish between effective and kind.",
        "It depends what we mean by good. I'd distinguishing between effective and kind.",
        "It depends what we meaning by good. I'd distinguish between effective and kind.",
      ]),
    ],
    success: "The learner defines, distinguishes and still gives a position.",
    quiz: [
      qmcq("When does 'it depends what we mean' read as evasion?", [
        "when it is not followed by an answer",
        "when the question is abstract",
        "when it opens the answer",
      ], 0),
      qfill("I'd ___ between two senses of it. (distinguish)", ["distinguish"]),
      qmcq("When is admitting there is no clean answer most convincing?", [
        "before giving your best answer",
        "after refusing to answer",
        "instead of answering",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a friend asking a big question late at night", "to have a real conversation about it",
        "A late conversation has turned to an abstract question.",
        "Take the question apart and answer it.",
        "Honestly, would you rather be respected or liked?", "thoughtful"),
      sc("Ravi", "a colleague in a values discussion", "to reach something usable",
        "A values discussion at work risks becoming vague.",
        "Define, distinguish and answer.",
        "We keep saying 'fairness' and meaning different things. What do you mean by it?", "rigorous"),
      sc("Elif", "someone met while travelling", "to have a genuine philosophical exchange",
        "A long journey has led to a real exchange.",
        "Take the question apart.",
        "I am serious about this: is anyone ever really free?", "earnest"),
      sc("Professor Kimura", "your tutor", "to practise abstract discussion",
        "Your tutor opens the seminar with a hard conceptual question.",
        "Define, distinguish and commit.",
        "Let's start with a hard one: is a lie ever the right thing to do?", "probing"),
      sc("Ms. Bianchi", "the examiner", "to check abstract discussion",
        "The examiner asks a question with no clean answer.",
        "Define, distinguish and answer.",
        "Is progress always an improvement?", "neutral"),
    ],
  },

  {
    id: "c1-a-subject-you-know-deeply",
    topic: "going into real depth",
    objectives: [
      "Say what non-specialists usually get wrong.",
      "Distinguish your own experience from established fact.",
    ],
    goal: "Talk about something you know well without either simplifying or showing off.",
    target: "speaking with expertise",
    correction: "Model the depth marker and let the learner go further.",
    summary: "You practised going into real depth on something you know well.",
    minutes: 8,
    points: [
      {
        form: "what most people miss",
        claims: [
          "'What most people miss is...' introduces an overlooked aspect, though without context it can sound superior.",
          "Naming the aspect rather than the people keeps it from becoming a verdict on the listener.",
        ],
        ex: ["What most people miss is how slow it is.", "What most people miss is the cost of maintenance."],
      },
      {
        form: "in my experience",
        claims: [
          "'In my experience' marks a claim as personal rather than established.",
          "Presenting experience as fact is the fastest way to lose a specialist audience.",
        ],
        ex: ["In my experience, it never works first time.", "In my experience, that is the exception."],
      },
      {
        form: "what's interesting is",
        claims: [
          "'What's interesting is...' selects one aspect rather than covering everything.",
          "Selecting is what separates depth from a lecture.",
        ],
        ex: ["What's interesting is why it fails.", "What's interesting is the exception."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what most people miss
      sit("p1", "You're a nurse. A friend thinks the hard part is the medicine, but you know it's the paperwork. What do you say?", [
        "What most people miss is the paperwork.",
        "What most people misses is the paperwork.",
        "What most of people miss is the paperwork.",
      ]),
      fc("p1", "What most ___ miss is how long the training takes.", ["people", "person", "peoples"]),
      lc("p1", "What most people miss is the cost.", [
        "What most people know is the price.",
        "What most people miss is the train.",
      ]),
      // p2 — in my experience
      sit("p2", "You want to say that projects in your field usually run late, but this is your own view, not a proven fact. What do you say?", [
        "In my experience, projects usually run late.",
        "At my experience, projects usually run late.",
        "In mine experience, projects usually run late.",
      ]),
      chat("p2", ["Does the new software always work the first time?", null], [
        "In my experience, it never works first time.",
        "In my experience, it never work first time.",
        "In experience my, it never works first time.",
      ]),
      spk("p2", "In my experience, that is the exception."),
      // p3 — what's interesting is
      sit("p3", "You could explain everything about bridges, but you choose one point: why some of them fail. What do you say?", [
        "What's interesting is why some fail.",
        "What's interesting is why do some fail.",
        "What interesting is why some fail.",
      ]),
      fc("p3", "What's ___ is the exception.", ["interesting", "interested", "interest"]),
      la("p3", "What's interesting is why it fails.", ["interested"]),
      // karışık
      chat("mix", ["Our listeners know the basics of teaching. Take us further?", null], [
        "What most people miss is the planning. In my experience, it takes longer than the lesson.",
        "What most people misses is the planning. In my experience, it takes longer than the lesson.",
        "What most people miss is the planning. At my experience, it takes longer than the lesson.",
      ]),
      sit("mix", "You explain your job as a chef. You pick one surprising point and mark it as your own view. What do you say?", [
        "What's interesting is the timing. In my experience, it matters more than the recipe.",
        "What interesting is the timing. In my experience, it matters more than the recipe.",
        "What's interesting is the timing. In mine experience, it matters more than the recipe.",
      ]),
    ],
    success: "The learner offers depth and separates experience from established fact.",
    quiz: [
      qmcq("Why mark a claim as personal?", [
        "Presenting experience as fact loses a specialist audience.",
        "It is grammatically required.",
        "It shortens the claim.",
      ], 0),
      qfill("What most people ___ is the cost of maintenance. (miss)", ["miss"]),
      qmcq("What separates depth from a lecture?", [
        "selecting one aspect rather than covering everything",
        "speaking for longer",
        "using technical vocabulary",
      ], 0),
    ],
    scenes: [
      sc("Rashid", "a friend outside your field", "to understand what you actually do",
        "A friend has never understood your work.",
        "Go into depth without simplifying it away.",
        "I have never really understood what you do. Explain it properly?", "genuine"),
      sc("Halima", "a colleague from another department", "to grasp why something is hard",
        "Another department underestimates the difficulty.",
        "Explain what they are missing.",
        "Your team says moving the data will take three months. It cannot be that complicated, surely?", "sceptical"),
      sc("Anders", "a fellow traveller curious about your work", "to draw out real depth",
        "A long journey gives time to explain your field properly.",
        "Go deep and mark your claims.",
        "I've never really understood your field. What do people like me get wrong about it?", "informed"),
      sc("Professor Osei", "your tutor", "to practise expert register",
        "Your tutor asks you to present your specialist topic to the group.",
        "Offer depth without showing off.",
        "Tell the group about your specialist topic. What would surprise them most?", "probing"),
      sc("Ms. Reyes", "the examiner", "to check depth of discussion",
        "The examiner asks about your specialism.",
        "Go into real depth.",
        "Could you tell me about something you know better than most people?", "neutral"),
    ],
  },

  {
    id: "c1-a-subject-you-know-nothing-about",
    topic: "coping when you are out of your depth",
    objectives: [
      "Admit the limit of your knowledge without withdrawing.",
      "Contribute from partial knowledge honestly.",
    ],
    goal: "Stay in a conversation about something you do not know.",
    target: "operating beyond your knowledge",
    correction: "Model the honest admission and let the learner keep contributing.",
    summary: "You practised staying in a conversation about something you do not know.",
    minutes: 8,
    points: [
      {
        form: "I'm out of my depth",
        claims: [
          "'I'm out of my depth here' admits the limit without leaving the conversation.",
          "Admitting it early is usually cheaper than being found out later.",
        ],
        ex: ["I'm out of my depth here, honestly.", "I'm out of my depth on the technical side."],
      },
      {
        form: "correct me if",
        claims: [
          "'Correct me if I'm wrong' invites correction before you commit to a claim.",
          "It lets you contribute a guess without asserting it.",
        ],
        ex: ["Correct me if I'm wrong, but aren't they the same?", "Correct me if I've misunderstood."],
      },
      {
        form: "from what little I",
        claims: [
          "'From what little I know' scales the claim to the knowledge behind it.",
          "A scaled claim can still be useful; an unscaled guess is a liability.",
        ],
        ex: ["From what little I know, it is a trade-off.", "From what little I understand, it is slower."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm out of my depth
      sit("p1", "Engineers ask your view on a technical detail you don't understand. You admit it but stay in the talk. What do you say?", [
        "I'm out of my depth here, honestly.",
        "I'm out of my deep here, honestly.",
        "I'm out my depth here, honestly.",
      ]),
      fc("p1", "I'm out of my ___ on the technical side.", ["depth", "deep", "deepness"]),
      lc("p1", "I'm out of my depth on this one.", [
        "I'm out of my mind on this one.",
        "I'm out of time on this one.",
      ]),
      // p2 — correct me if
      sit("p2", "You think two systems are the same, but you're not sure. You want to be corrected before you go on. What do you say?", [
        "Correct me if I'm wrong, but aren't they the same?",
        "Correct me if I wrong, but aren't they the same?",
        "Correct me if I'm wrong, but aren't they same?",
      ]),
      chat("p2", ["So that's how the cooling works.", null], [
        "Correct me if I'm wrong, but does it use sea water?",
        "Correct me if I'm wrong, but does it uses sea water?",
        "Correct me if am wrong, but does it use sea water?",
      ]),
      spk("p2", "Correct me if I'm wrong."),
      // p3 — from what little I
      sit("p3", "You know a little about electric cars. You want to make a modest claim about their batteries. What do you say?", [
        "From what little I know, battery cost is one of the main problems.",
        "From what few I know, battery cost is one of the main problems.",
        "From what little I knows, battery cost is one of the main problems.",
      ]),
      fc("p3", "From what ___ I understand, it is slower.", ["little", "few", "less"]),
      chat("p3", ["What do you think of the new tax?", null], [
        "From what little I've read, it helps small firms.",
        "From what little I've read, it help small firms.",
        "From what few I've read, it helps small firms.",
      ]),
      // karışık
      chat("mix", ["You follow all this, don't you?", null], [
        "I'm out of my depth, honestly. Correct me if I'm wrong, but is it about cost?",
        "I'm out of my deep, honestly. Correct me if I'm wrong, but is it about cost?",
        "I'm out of my depth, honestly. Correct me if I wrong, but is it about cost?",
      ]),
      sit("mix", "At a medical conference, someone asks your view. You admit you're no expert and offer a modest guess. What do you say?", [
        "I'm out of my depth here, but from what little I know, it's a cost issue.",
        "I'm out of my deep here, but from what little I know, it's a cost issue.",
        "I'm out of my depth here, but from what few I know, it's a cost issue.",
      ]),
    ],
    success: "The learner admits the limit and still contributes usefully.",
    quiz: [
      qmcq("Why admit the limit early?", [
        "It is cheaper than being found out later.",
        "It ends the conversation politely.",
        "It is grammatically required.",
      ], 0),
      qfill("Correct me if I've ___. (misunderstand)", ["misunderstood"]),
      qmcq("What does scaling a claim achieve?", [
        "It stays useful without becoming a liability.",
        "It shortens the claim.",
        "It makes the claim certain.",
      ], 0),
    ],
    scenes: [
      sc("Priya", "a friend who is an engineer", "to include you in the discussion",
        "Your friend's explanation of tidal power is beyond your knowledge.",
        "Admit the limit and contribute.",
        "So the tides turn the blades, and the gearbox does the rest. You're following all this, aren't you?", "assuming"),
      sc("Hugo", "a colleague from a technical team", "to get useful input from a non-specialist",
        "A technical team wants your view anyway.",
        "Contribute from partial knowledge.",
        "I know this is not your area, but what is your instinct?", "inclusive"),
      sc("Camille", "a wine expert on your vineyard tour", "to have a real conversation anyway",
        "On a vineyard tour, an expert talks about soil and grapes.",
        "Stay in the conversation honestly.",
        "This wine grows on volcanic soil, which changes everything. You know about soil, right?", "welcoming"),
      sc("Mr. Boateng", "your tutor", "to practise operating beyond your knowledge",
        "Your tutor asks you about a topic from another department.",
        "Admit the limit and contribute.",
        "You study history, but what do you make of the new physics paper everyone is discussing?", "probing"),
      sc("Ms. Aaltonen", "the examiner", "to check honesty under pressure",
        "The examiner raises an unfamiliar technical subject.",
        "Admit the limit and contribute.",
        "What is your view on the economics of desalination?", "neutral"),
    ],
  },

  {
    id: "c1-pet-peeves",
    topic: "complaining elegantly about small things",
    objectives: [
      "Complain about something trivial without becoming tedious.",
      "Keep the complaint proportionate to the offence.",
    ],
    goal: "Complain entertainingly about something small.",
    target: "elegant complaint",
    correction: "Model the proportionate complaint and let the learner add their own.",
    summary: "You practised complaining about small irritations without becoming tedious.",
    minutes: 8,
    points: [
      {
        form: "what really gets me",
        claims: [
          "'What really gets me is...' puts the specific irritation at the end for effect.",
          "The specificity is what makes a small complaint entertaining rather than dull.",
        ],
        ex: ["What really gets me is the queueing.", "What really gets me is people who stop dead."],
      },
      {
        form: "I can't stand",
        claims: [
          "'I can't stand' expresses strong dislike, so tone and context decide whether it sounds playful or genuinely angry.",
          "With a trivial subject the mismatch of scale is the joke; with a serious one it reads as real anger.",
        ],
        ex: ["I can't stand slow walkers.", "I can't stand it when nobody replies."],
      },
      {
        form: "drives me up the wall",
        claims: [
          "'Drives me up the wall' expresses intense irritation; with a trivial subject and playful delivery it reads as deliberate exaggeration.",
          "Delivered flatly about something serious, it reads as a real grievance instead.",
        ],
        ex: ["It drives me up the wall.", "That noise drives me up the wall."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what really gets me
      sit("p1", "You're joking with a friend about supermarkets. What annoys you most is the queueing. What do you say?", [
        "What really gets me is the queueing.",
        "What really get me is the queueing.",
        "What really gets me is the queue it.",
      ]),
      fc("p1", "What really ___ me is people who stop dead.", ["gets", "get", "getting"]),
      lc("p1", "What really gets me is loud phone calls.", [
        "What really helps me is quiet phone calls.",
        "What I really like is long phone calls.",
      ]),
      // p2 — I can't stand
      sit("p2", "You joke about something small: people who walk slowly on busy streets. What do you say?", [
        "I can't stand people who walk slowly.",
        "I can't stand people who walks slowly.",
        "I can't stood people who walk slowly.",
      ]),
      chat("p2", ["Do you mind when people don't answer messages?", null], [
        "Honestly? I can't stand waiting for replies.",
        "Honestly? I can't stand wait for replies.",
        "Honestly? I can't stands waiting for replies.",
      ]),
      spk("p2", "I can't stand slow walkers."),
      // p3 — drives me up the wall
      sit("p3", "Your neighbour's dog barks every morning at six. You complain playfully to a friend. What do you say?", [
        "That dog drives me up the wall.",
        "That dog drives me up to the wall.",
        "That dog drive me up the wall.",
      ]),
      fc("p3", "That noise drives me ___ the wall.", ["up", "on", "into"]),
      la("p3", "Loud chewing drives me up the wall.", ["drive"]),
      // karışık
      chat("mix", ["Go on, what annoys you about this office?", null], [
        "What really gets me is the printer. It drives me up the wall.",
        "What really gets me is the printer. It drive me up the wall.",
        "What really get me is the printer. It drives me up the wall.",
      ]),
      sit("mix", "In a long queue, you joke about two things: people pushing in, and the slow ticket machine. What do you say?", [
        "I can't stand people pushing in, and that machine drives me up the wall.",
        "I can't stand people pushing in, and that machine drive me up the wall.",
        "I can't stands people pushing in, and that machine drives me up the wall.",
      ]),
    ],
    success: "The learner complains specifically and proportionately.",
    quiz: [
      qmcq("Why is specificity important in a small complaint?", [
        "It makes the complaint entertaining rather than dull.",
        "It shortens the complaint.",
        "It is grammatically required.",
      ], 0),
      qfill("I can't ___ it when nobody replies. (stand)", ["stand"]),
      qmcq("What decides whether 'drives me up the wall' sounds playful?", [
        "the subject and the delivery",
        "the tense of the verb",
        "the length of the sentence",
      ], 0),
    ],
    scenes: [
      sc("Ottoline", "a friend who enjoys a good moan", "to trade small complaints",
        "Two friends are enjoying complaining about trivia.",
        "Complain entertainingly.",
        "Right, your turn: what small things annoy you most?", "playful"),
      sc("Viktor", "a colleague on a coffee break", "to pass the time entertainingly",
        "A coffee break turns to office irritations.",
        "Complain proportionately.",
        "What is the most annoying thing about this building?", "amused"),
      sc("Noor", "a fellow traveller in a long queue", "to make a queue bearable",
        "A long queue invites shared complaining.",
        "Complain entertainingly.",
        "We are going to be here a while. What annoys you most about travelling?", "resigned"),
      sc("Mr. Halvorsen", "your tutor", "to practise proportionate complaint",
        "In a seminar on register, your tutor asks everyone for one small irritation.",
        "Complain proportionately.",
        "Everyone gets one small complaint today. What's yours?", "probing"),
      sc("Ms. Cardoso", "the examiner", "to check register control in complaint",
        "The examiner invites complaints about trivia.",
        "Complain proportionately.",
        "What small everyday thing irritates you most?", "neutral"),
    ],
  },

  {
    id: "c1-overhyped-or-worth-it",
    topic: "judging against a reputation",
    objectives: [
      "Judge something against what was claimed for it.",
      "Separate the thing from the hype around it.",
    ],
    goal: "Say whether something lived up to its reputation.",
    target: "judging against expectation",
    correction: "Model the judgement against expectation and let the learner assess their own.",
    summary: "You practised judging whether something lived up to its reputation.",
    minutes: 8,
    points: [
      {
        form: "worth the hype",
        claims: [
          "'Worth the hype' judges the thing against what was claimed, not in isolation.",
          "Something can be good and still not worth the hype.",
        ],
        ex: ["It was worth the hype, actually.", "It wasn't quite worth the hype."],
      },
      {
        form: "lives up to",
        claims: [
          "'Lives up to its reputation' is the neutral version of the same judgement.",
          "'Hype' suggests intense and possibly exaggerated publicity, where 'reputation' is more neutral.",
        ],
        ex: ["It lives up to its reputation.", "It doesn't quite live up to it."],
      },
      {
        form: "falls short of",
        claims: [
          "'Falls short of' names the gap without dismissing the thing entirely.",
          "Naming what it falls short OF keeps the judgement answerable.",
        ],
        ex: ["It falls short of the claims made for it.", "It falls short of the earlier work."],
      },
    ],
    ex: [],
    drills: [
      // p1 — worth the hype
      sit("p1", "Everyone praised a new cafe, and you finally went. It really was as good as people said. What do you say?", [
        "It was worth the hype, actually.",
        "It was worth of the hype, actually.",
        "It was worthy the hype, actually.",
      ]),
      fc("p1", "It wasn't quite ___ the hype.", ["worth", "worthy", "worthwhile"]),
      lc("p1", "It wasn't worth the hype.", [
        "It was better than the hype.",
        "It wasn't worth the price.",
      ]),
      // p2 — lives up to
      sit("p2", "You visited a famous museum and it was as good as its reputation. You say so in a neutral way. What do you say?", [
        "The museum lives up to its reputation.",
        "The museum lives up its reputation.",
        "The museum lives up to it reputation.",
      ]),
      chat("p2", ["Was the new film as good as the first one?", null], [
        "Not really. It doesn't quite live up to it.",
        "Not really. It doesn't quite lives up to it.",
        "Not really. It doesn't quite live up it.",
      ]),
      spk("p2", "It lives up to its reputation."),
      // p3 — falls short of
      sit("p3", "A phone promised a two-day battery, but it lasts one day. You name the gap. What do you say?", [
        "It falls short of the claims made for it.",
        "It falls short the claims made for it.",
        "It fall short of the claims made for it.",
      ]),
      fc("p3", "The hotel falls ___ of what the photos promised.", ["short", "shortly", "shortage"]),
      lc("p3", "The service falls short of what the price suggests.", [
        "The service is better than the price suggests.",
        "The food falls short of what the photos suggest.",
      ]),
      // karışık
      chat("mix", ["So, the famous restaurant. Was it good?", null], [
        "The view lives up to its reputation, but the food falls short of the hype.",
        "The view lives up to its reputation, but the food fall short of the hype.",
        "The view lives up its reputation, but the food falls short of the hype.",
      ]),
      sit("mix", "A famous beach was as beautiful as everyone said, but the hotel is not as good as its ads. What do you say?", [
        "The beach was worth the hype, but the hotel falls short of its ads.",
        "The beach was worthy the hype, but the hotel falls short of its ads.",
        "The beach was worth the hype, but the hotel falls shortly of its ads.",
      ]),
    ],
    success: "The learner judges against expectation and names the gap.",
    quiz: [
      qmcq("How does 'hype' differ from 'reputation'?", [
        "'Hype' suggests exaggerated publicity; 'reputation' is more neutral.",
        "'Hype' is more neutral than 'reputation'.",
        "'Hype' is only used in writing.",
      ], 0),
      qmcq("Which sentence names the gap without dismissing the work entirely?", [
        "It falls short of the earlier work.",
        "It is completely worthless.",
        "Nobody should read it.",
      ], 0),
      qmcq("Why name what something falls short of?", [
        "It keeps the judgement answerable.",
        "It shortens the sentence.",
        "It avoids the passive.",
      ], 0),
    ],
    scenes: [
      sc("Beatriz", "a friend about to try the same thing", "to decide whether to bother",
        "A friend is deciding whether something famous is worth it.",
        "Judge it against its reputation.",
        "Everyone says the new cafe on the corner is incredible. Is it, though?", "sceptical"),
      sc("Andres", "a colleague assessing a much-praised tool", "to judge a tool fairly",
        "A widely praised tool is being evaluated.",
        "Judge it against the claims.",
        "Everyone is praising the new project app, and you have used it for a month. Does it actually deliver?", "analytical"),
      sc("Selin", "a fellow traveller at a famous site", "to compare impressions honestly",
        "You are both at a famous, heavily promoted place.",
        "Judge it honestly.",
        "Two hours in line for the famous tower. Was it as good as everyone said?", "wry"),
      sc("Mr. Achebe", "your tutor", "to practise evaluative judgement",
        "Your tutor asks about a famous novel you have both read.",
        "Judge against the claims.",
        "Everyone calls the novel we just read a masterpiece. Do you agree?", "probing"),
      sc("Ms. Lindberg", "the examiner", "to check evaluative discussion",
        "The examiner asks about something famous.",
        "Judge against its reputation.",
        "Could you tell me about something famous that disappointed you?", "neutral"),
    ],
  },

  {
    id: "c1-closing-the-loop",
    topic: "summarising a long discussion fairly",
    objectives: [
      "Summarise both positions fairly, including the one you reject.",
      "Close without claiming a victory.",
    ],
    goal: "Close a long discussion so both sides recognise their own position.",
    target: "fair closing summary",
    correction: "Model the fair summary and let the learner close their own discussion.",
    summary: "You practised closing a long discussion so both sides recognise their position.",
    minutes: 8,
    points: [
      {
        form: "so where we've landed",
        claims: [
          "'So where we've landed is...' reports the outcome, including what stays unresolved.",
          "'We' rather than 'I' makes it a joint summary rather than a verdict.",
        ],
        ex: ["So where we've landed is a trial.", "So where we've landed is that we disagree on timing."],
      },
      {
        form: "to bring it together",
        claims: [
          "'To bring it together' signals synthesis rather than repetition.",
          "A summary that only repeats your own side is not a summary.",
        ],
        ex: ["To bring it together, both concerns are real.", "To bring it together, the remaining issues are cost and timing."],
      },
      {
        form: "that's where I'll stop",
        claims: [
          "'That's where I'll stop' closes your contribution without demanding agreement.",
          "Stopping without claiming victory leaves the other side room to move later.",
        ],
        ex: ["That's where I'll stop.", "That's where I'll stop, for today at least."],
      },
    ],
    ex: [],
    drills: [
      // p1 — so where we've landed
      sit("p1", "After a long meeting, the team agreed to run a small trial first. You report the outcome. What do you say?", [
        "So where we've landed is a trial.",
        "So where we've land is a trial.",
        "So where we've landing is a trial.",
      ]),
      fc("p1", "So where we've ___ is that we disagree on timing.", ["landed", "land", "landing"]),
      lc("p1", "So where we've landed is a short trial.", [
        "So where we've started is a short trial.",
        "So we've signed a long contract.",
      ]),
      // p2 — to bring it together
      sit("p2", "You want to combine both sides' points, not just repeat your own. How do you begin?", [
        "To bring it together, cost and safety both matter.",
        "To bring it together, cost and safety both matters.",
        "To bringing it together, cost and safety both matter.",
      ]),
      chat("p2", ["We've covered a lot. Can you sum it up?", null], [
        "To bring it together, the open issues are cost and timing.",
        "To bring it together, the open issue are cost and timing.",
        "To bring together it, the open issues are cost and timing.",
      ]),
      spk("p2", "To bring it together, both sides have a point."),
      // p3 — that's where I'll stop
      sit("p3", "You've summarised the discussion and don't want to push for agreement. You end your turn. What do you say?", [
        "That's where I'll stop.",
        "That's where I'll stopping.",
        "That's where I'll stopped.",
      ]),
      fc("p3", "That's where I'll ___, for today at least.", ["stop", "stopping", "stopped"]),
      la("p3", "And that's where I'll stop.", ["stopped"]),
      // karışık
      chat("mix", ["We've argued for an hour. Where are we?", null], [
        "So where we've landed is a trial. That's where I'll stop.",
        "So where we've landed is a trial. That's where I'll stopped.",
        "So where we've landing is a trial. That's where I'll stop.",
      ]),
      sit("mix", "At the end of a long debate, you combine both views and report the agreed outcome: a later launch. What do you say?", [
        "To bring it together, both sides worried about risk. So where we've landed is a later launch.",
        "To bring it together, both sides worried about risk. So where we've land is a later launch.",
        "To bringing it together, both sides worried about risk. So where we've landed is a later launch.",
      ]),
    ],
    success: "The learner summarises both positions fairly and closes without claiming victory.",
    quiz: [
      qmcq("Why say 'we' rather than 'I' in the summary?", [
        "It makes it a joint summary rather than a verdict.",
        "It is more formal.",
        "It is grammatically required.",
      ], 0),
      qfill("To bring it ___, both concerns are real. (together)", ["together"]),
      qmcq("What does stopping without claiming victory allow?", [
        "It leaves the other side room to move later.",
        "It shortens the discussion.",
        "It ends the relationship.",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "a friend after a long disagreement", "to end well despite disagreeing",
        "A long disagreement has run its course without resolution.",
        "Close it fairly.",
        "We are not going to agree tonight, are we? How do we leave it?", "tired"),
      sc("Simone", "a colleague after a difficult meeting", "to close a meeting fairly",
        "A meeting must close with both positions recorded.",
        "Summarise both fairly.",
        "We are out of time and still split. Can you sum it up?", "even"),
      sc("Emil", "a fellow traveller you have debated with all evening", "to part on good terms",
        "A long evening debate must end.",
        "Close it generously.",
        "That was the best argument I have lost all year. Shall we stop?", "warm"),
      sc("Mrs. Aguilar", "your tutor", "to practise fair closure",
        "At the end of a seminar debate, your tutor asks you to close it.",
        "Summarise fairly and close.",
        "We've debated longer school days for an hour. Can you close the discussion for us?", "probing"),
      sc("Mr. Nakamura", "the examiner", "to check fair summarising",
        "The examiner has argued against you at length.",
        "Summarise both positions fairly.",
        "We have disagreed for some time. How would you sum it up?", "neutral"),
    ],
  },
];
