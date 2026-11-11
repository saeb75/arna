/** B2 · Ünite 9-11 — Shades of Meaning · Formal and Informal · Real Issues (22 ders).
 *
 *  Ünite 9 ANLAM İNCELİĞİ: aynı şeyi söyleyen iki kelimenin farklı hissettirmesi.
 *  `remember to` ↔ `remember -ing` anlamı tersine çeviriyor; `slightly/fairly`
 *  gücü ayarlıyor; `barely/hardly` olumsuzu sessizce taşıyor; yüklü kelimeler
 *  aynı olayı farklı çerçeveliyor.
 *
 *  Ünite 10 REGİSTER: aynı mesajın resmî ve samimi hâli. Tek gramer dersi var
 *  (mesafe koyan dil), gerisi kalıp — çünkü buradaki beceri yapı değil, DOĞRU
 *  TONU seçebilmek. Kapanışta aynı mesaj iki kez söyleniyor.
 *
 *  Ünite 11'de HİÇ gramer dersi yok ve bu kasıtlı: B2'nin sonunda öğrenciyi
 *  kilitleyen şey yapı değil, uzun bir tartışmayı sürdürüp bitirebilmek.
 *  Ünite bir tartışmayı kapatma dersiyle bitiyor — seviyenin de kapanışı.
 *
 *  Oyun bloğu: her derste 11 madde (3 öğretim maddesi × 3 + 2 karışık); rol
 *  yapma açılışları sesli ve dersin hedef kalıbını çağırır.
 */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const B2_U9_11: Authored[] = [
  // --- Ünite 9 · Shades of Meaning -------------------------------------------
  {
    id: "b2-remember-to-do-remember-doing",
    topic: "verbs whose meaning flips with to or -ing",
    objectives: [
      "Use remember and forget with to for duties.",
      "Use remember and forget with -ing for memories.",
    ],
    goal: "Say clearly whether you mean a duty or a memory.",
    target: "remember and forget with to versus -ing",
    correction: "Contrast the two forms in one pair and let the learner choose the right one.",
    summary: "You learned that remember and forget change meaning with to and -ing.",
    minutes: 8,
    points: [
      {
        form: "remember to call",
        claims: [
          "'Remember to do' is about a duty that comes after the remembering.",
          "Depending on the tense, the action may still be ahead or already done: did you remember to call her?",
        ],
        ex: ["Remember to call her tomorrow.", "Did you remember to lock the door?"],
      },
      {
        form: "remember calling",
        claims: [
          "'Remember doing' is about a memory of something already done.",
          "'I remember calling her' means the call happened and you recall it.",
        ],
        ex: ["I remember calling her that evening.", "I don't remember saying that."],
      },
      {
        form: "I forgot to",
        claims: [
          "'I forgot to lock it' means I did not do the intended action; it says nothing about the current state.",
          "'I'll never forget meeting her' is a memory, not a duty.",
        ],
        ex: ["I forgot to lock the door.", "I'll never forget meeting her."],
      },
    ],
    ex: [],
    drills: [
      // p1 — remember to (görev)
      fc("p1", "Please remember ___ the plants while I'm away.", ["to water", "watering", "water"]),
      sit("p1", "Your flatmate is leaving for work. The rubbish must go out tonight. What do you say?", [
        "Remember to take the rubbish out tonight.",
        "Remember taking the rubbish out tonight.",
        "Remember to taking the rubbish out tonight.",
      ]),
      chat("p1", ["I'm going to the post office now.", null], [
        "Great. Remember to post my letter too.",
        "Great. Remember posting my letter too.",
        "Great. Remember to posted my letter too.",
      ]),
      // p2 — remember -ing (anı)
      fc("p2", "I clearly remember ___ the keys on the table last night.", ["leaving", "to leave", "leave"]),
      err("p2", "I remember meet her at a party years ago.", "meet", "meeting"),
      lc("p2", "I remember locking the door.", ["I remember the blue door.", "I need to lock the door."]),
      // p3 — forgot to
      sit("p3", "You planned to buy milk, but you didn't buy it. What do you tell your flatmate?", [
        "Sorry, I forgot to buy milk.",
        "Sorry, I forgot buying milk.",
        "Sorry, I forgot to bought milk.",
      ]),
      arr("p3", "I forgot to send the email.", ["sent"]),
      spk("p3", "I'll never forget visiting that city."),
      // karışık
      sit("mix", "You posted the letter yesterday and you recall it clearly. But you planned to buy stamps, and you didn't. What do you say?", [
        "I remember posting the letter, but I forgot to buy stamps.",
        "I remember to post the letter, but I forgot to buy stamps.",
        "I remember posting the letter, but I forgot buying stamps.",
      ]),
      lc("mix", "I remember paying, but I forgot to keep the receipt.", [
        "I remember paying, and I kept the receipt.",
        "I need to pay, and then keep the receipt.",
      ]),
    ],
    success: "The learner uses both forms with the correct meanings.",
    quiz: [
      qmcq("Which sentence means the speaker failed to do the intended action?", [
        "I forgot to lock the door.",
        "I forgot locking the door.",
        "I remember locking the door.",
      ], 0),
      qfill("I'll never forget ___ her for the first time. (meet)", ["meeting"]),
      qmcq("Which sentence is about a duty?", [
        "Remember to send the form.",
        "I remember sending the form.",
        "I don't remember the form.",
      ], 0),
    ],
    scenes: [
      sc("Delphine", "a friend checking on arrangements", "to make sure nothing has been forgotten",
        "Several small tasks were shared out and some may have slipped.",
        "Say what you did and what you still have to do.",
        "We split the jobs last week. Did you remember to book the restaurant?", "organised"),
      sc("Rasheed", "a colleague reconstructing a conversation", "to establish what was actually said",
        "Two people remember a meeting differently.",
        "Say what you remember and what you were meant to do.",
        "You were in that meeting. Do you remember agreeing to the new deadline?", "probing"),
      sc("Astrid", "a travel companion before departure", "to check nothing has been left behind",
        "You are about to leave and things may be forgotten.",
        "Say what you remembered and what you forgot.",
        "We leave in ten minutes. Did you remember to pack the passports?", "hurried"),
      sc("Dr. Ferreira", "your teacher", "to practise the two forms",
        "The class is sorting duties from memories.",
        "Use both forms correctly.",
        "Think about this morning. What did you remember to do, and what did you forget to do?", "encouraging"),
      sc("Ms. Whitlock", "the examiner", "to check the distinction",
        "The examiner asks about memory and duty.",
        "Distinguish the two forms clearly.",
        "Could you tell me something you must remember to do this week?", "neutral"),
    ],
  },

  {
    id: "b2-i-regret-to-tell-you",
    topic: "formal announcements",
    objectives: [
      "Announce good and bad news in formal language.",
      "Notice that regret to tell is a duty, not a memory.",
    ],
    goal: "Make a formal announcement in writing or in a meeting.",
    target: "regret to, be pleased to and be sorry to",
    correction: "Model the formal opener and let the learner announce their own news.",
    summary: "You learned to announce news formally with regret to, pleased to and sorry to.",
    minutes: 8,
    points: [
      {
        form: "I regret to",
        claims: [
          "'I regret to inform you' introduces bad news you are about to give.",
          "'Regret informing' is different: it regrets an act of telling that already happened.",
        ],
        ex: ["I regret to inform you that the post has been filled.", "We regret to say the event is cancelled."],
      },
      {
        form: "I'm pleased to",
        claims: [
          "'I'm pleased to' and 'I'm delighted to' introduce good news.",
          "'Delighted' is warmer and is common in offers and invitations.",
        ],
        ex: ["I'm pleased to confirm your booking.", "We're delighted to offer you the position."],
      },
      {
        form: "we're sorry to",
        claims: [
          "'We're sorry to' is softer than 'we regret to' and works in speech as well as writing.",
          "All three take 'to' plus a base verb; announcements usually use inform, say, confirm or announce, but others fit too.",
        ],
        ex: ["We're sorry to say there is a delay.", "We're sorry to hear about the problem."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I regret to
      fc("p1", "We regret ___ you that your application was unsuccessful.", ["to inform", "to informing", "inform"]),
      arr("p1", "I regret to say the shop is closing.", ["says"]),
      sit("p1", "You must tell a candidate formally that they did not get the job. What do you write?", [
        "I regret to tell you that we have chosen another candidate.",
        "I regret to telling you that we have chosen another candidate.",
        "I regret for telling you that we have chosen another candidate.",
      ]),
      // p2 — I'm pleased / delighted to
      fc("p2", "I'm pleased ___ that your booking is confirmed.", ["to say", "saying", "for saying"]),
      chat("p2", ["Have you heard anything about my application?", null], [
        "Yes! I'm delighted to tell you that you got the place.",
        "Yes! I'm delighted telling you that you got the place.",
        "Yes! I'm delight to tell you that you got the place.",
      ]),
      spk("p2", "I'm pleased to announce the winner."),
      // p3 — we're sorry to
      sit("p3", "A customer's parcel will arrive late. You phone them and want to sound kind, not stiff. What do you say?", [
        "We're sorry to say your parcel will be late.",
        "We're sorry saying your parcel will be late.",
        "We're sorry for say your parcel will be late.",
      ]),
      lc("p3", "We're sorry to hear about the problem.", ["We're happy to help with the problem.", "We heard there's a problem."]),
      la("p3", "We're sorry to say the shop is closed.", ["saying"]),
      // karışık
      sit("mix", "You announce two pieces of news formally: the trip is cancelled, but everyone gets a full refund. What do you say?", [
        "We regret to say the trip is cancelled, but we're pleased to offer a full refund.",
        "We regret to say the trip is cancelled, but we're pleased offering a full refund.",
        "We regret to saying the trip is cancelled, but we're pleased to offer a full refund.",
      ]),
      fc("mix", "We regret to say the course is full, but we're delighted ___ you a place next term.", ["to offer", "offering", "offer"]),
    ],
    success: "The learner announces both good and bad news in appropriate formal language.",
    quiz: [
      qmcq("Which sentence introduces bad news the speaker is about to give?", [
        "I regret to inform you of the decision.",
        "I regret informing you of the decision yesterday.",
        "I regret to informing you of the decision.",
      ], 0),
      qfill("We're ___ to offer you the position. (delight)", ["delighted", "pleased"]),
      qmcq("Which opener is softest?", [
        "We're sorry to say there is a delay.",
        "We regret to inform you of the delay.",
        "There is a delay.",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "an applicant awaiting a decision", "to hear the outcome of an application",
        "A decision must be communicated formally.",
        "Announce the news appropriately.",
        "You said you would call with a decision. Did I get the job?", "anxious"),
      sc("Mr. Reddy", "a client expecting an update", "to receive news about a delayed project",
        "A project has slipped and the client must be told.",
        "Announce the news formally.",
        "I have been waiting for an update on my order. Is there any news?", "formal"),
      sc("Ana Lucia", "a hotel guest expecting confirmation", "to have a booking confirmed or refused",
        "A booking request has an answer.",
        "Announce the outcome formally.",
        "Has my booking been confirmed for those dates?", "polite"),
      sc("Mr. Bergstrom", "your teacher", "to practise formal announcements",
        "The class is practising formal news.",
        "Announce good and bad news formally.",
        "Imagine you are a manager. One candidate got the job and one did not. What do you tell each of them?", "encouraging"),
      sc("Ms. Beaumont", "the examiner", "to check formal register",
        "The examiner asks for a formal announcement.",
        "Use the correct formal opener.",
        "Imagine you must tell a customer that their event is cancelled. What would you say?", "neutral"),
    ],
  },

  {
    id: "b2-slightly-fairly-somewhat",
    topic: "softening how strong a description is",
    objectives: [
      "Use slightly, fairly and somewhat for different degrees and registers.",
      "Choose the right softener for the register.",
    ],
    goal: "Give an honest opinion without overstating it.",
    target: "downtoners: slightly, fairly, somewhat",
    correction: "Model the softened description and let the learner grade their own opinion.",
    summary: "You learned to soften a description with slightly, fairly and somewhat.",
    minutes: 8,
    points: [
      {
        form: "slightly better",
        claims: [
          "'Slightly' marks a very small difference or degree; it is very common with comparatives.",
          "'Slightly better' means a little better, with only a small difference.",
        ],
        ex: ["It's slightly better than the old one.", "The second version is slightly clearer."],
      },
      {
        form: "fairly good",
        claims: [
          "'Fairly' usually gives a moderate assessment; its exact strength depends on the adjective and the tone.",
          "In British English 'quite' can express a similar moderate meaning, though its strength varies by context.",
        ],
        ex: ["The results are fairly good.", "It's fairly straightforward once you start."],
      },
      {
        form: "somewhat unusual",
        claims: [
          "'Somewhat' is more formal than 'fairly' and common in writing.",
          "'A bit' and 'a little' are the casual equivalents.",
        ],
        ex: ["The response was somewhat unusual.", "The figures are somewhat misleading."],
      },
    ],
    ex: [],
    drills: [
      // p1 — slightly
      fc("p1", "The new laptop costs 505 euros and the old one cost 500. It's ___ more expensive.", ["slightly", "much", "far"]),
      err("p1", "This version is slight better than the old one.", "slight", "slightly"),
      spk("p1", "It's slightly cheaper than the other one."),
      // p2 — fairly
      sit("p2", "A friend asks about your new job. It's good, but not great. What do you say?", [
        "It's fairly good, actually.",
        "It's fair good, actually.",
        "It's fairly well, actually.",
      ]),
      fc("p2", "The exam was ___ easy, but two questions were hard.", ["fairly", "fair", "fairer"]),
      lc("p2", "The results are fairly good.", ["The results are very bad.", "The rules are fair."]),
      // p3 — somewhat
      fc("p3", "The figures are ___ lower than last year.", ["somewhat", "somewhatly", "some"]),
      arr("p3", "The plan is somewhat risky.", ["riskily"]),
      sit("p3", "You are writing a formal report. You want to say the results were a little disappointing. What do you write?", [
        "The results were somewhat disappointing.",
        "The results were somewhat disappointed.",
        "The results were somewhat of disappointing.",
      ]),
      // karışık
      chat("mix", ["Is the new version better?", null], [
        "Slightly better, and fairly easy to use.",
        "Slight better, and fairly easy to use.",
        "Slightly better, and fair easy to use.",
      ]),
      la("mix", "The new design is slightly cheaper and fairly simple.", ["slight"]),
    ],
    success: "The learner softens at least two descriptions appropriately.",
    quiz: [
      qmcq("Which word marks the smallest difference?", ["slightly", "fairly", "considerably"], 0),
      qfill("It's ___ straightforward once you start. (fair)", ["fairly"]),
      qmcq("Which word is most formal?", ["somewhat", "a bit", "pretty"], 0),
    ],
    scenes: [
      sc("Corina", "a friend asking for an honest view", "to get a measured opinion",
        "A friend wants your honest but kind assessment.",
        "Soften your opinions appropriately.",
        "Imagine I rewrote one of my songs and played you both versions. Be honest, but not brutal: is the new one better?", "nervous"),
      sc("Malik", "a colleague reviewing your feedback", "to make written feedback less blunt",
        "Written feedback reads harsher than intended.",
        "Soften the descriptions.",
        "I rewrote my report and the new version is a little clearer. Is it better than the old one, do you think?", "editorial"),
      sc("Freya", "a host asking about the meal", "to hear an honest but polite reaction",
        "A host has cooked something unusual.",
        "React honestly but gently.",
        "Be honest, was the meal too spicy for you?", "curious"),
      sc("Mr. Anand", "your teacher", "to practise downtoners",
        "The class is grading opinions.",
        "Soften opinions precisely.",
        "Compare your phone with your last one. How much better is it?", "encouraging"),
      sc("Mrs. Boateng", "the examiner", "to check measured opinion",
        "The examiner asks for a balanced assessment.",
        "Grade the opinion carefully.",
        "Could you give me a measured opinion of the public transport in your city?", "neutral"),
    ],
  },

  {
    id: "b2-nearly-barely-hardly",
    topic: "near-negative words",
    objectives: [
      "Use barely and hardly to mean almost not.",
      "Avoid adding a second negative after them.",
    ],
    goal: "Say that something almost did not happen or almost is not true.",
    target: "nearly, barely and hardly",
    correction: "Rebuild the sentence with a single negative and let the learner say it again.",
    summary: "You learned that barely and hardly already carry the negative meaning.",
    minutes: 8,
    points: [
      {
        form: "barely enough",
        claims: [
          "'Barely' means only just, and it carries a negative feeling on its own.",
          "Say 'there was barely enough', not 'there wasn't barely enough'.",
        ],
        ex: ["There was barely enough time.", "I could barely hear her."],
      },
      {
        form: "hardly any",
        claims: [
          "'Hardly any' means almost none, and 'hardly ever' means almost never.",
          "The verb after them stays positive because the negative is already there.",
        ],
        ex: ["There were hardly any people.", "We hardly ever see them now."],
      },
      {
        form: "nearly finished",
        claims: [
          "'Nearly' and 'almost' do not work as negatives; they mean something came close to happening.",
          "The feeling comes from the situation, not the word: we nearly crashed is alarming, I am nearly finished is not.",
        ],
        ex: ["I'm nearly finished.", "We almost missed it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — barely
      fc("p1", "The music was so loud that I ___ hear the speaker.", ["could barely", "couldn't barely", "could barely not"]),
      sit("p1", "You caught the train, but only with seconds to spare. What do you say?", [
        "I barely caught the train.",
        "I didn't barely catch the train.",
        "I barely didn't catch the train.",
      ]),
      lc("p1", "We barely had enough time.", ["We had a lot of time.", "We need more time."]),
      // p2 — hardly any / hardly ever
      fc("p2", "There were ___ any people at the concert, so it felt empty.", ["hardly", "hard", "nearly"]),
      chat("p2", ["Do you still see your old school friends?", null], [
        "Not really. We hardly ever see each other now.",
        "Not really. We don't hardly ever see each other now.",
        "Not really. We hardly never see each other now.",
      ]),
      la("p2", "There's hardly any milk left.", ["hard"]),
      // p3 — nearly / almost
      sit("p3", "Your car almost hit a wall, but it didn't. What do you say?", [
        "We nearly crashed!",
        "We nearly didn't crash!",
        "We barely crashed!",
      ]),
      fc("p3", "We ___ missed the bus, but the driver waited for us.", ["nearly", "hardly", "barely"]),
      spk("p3", "I'm nearly finished with the report."),
      // karışık
      chat("mix", ["How was the party?", null], [
        "Quiet. There were hardly any people, and we nearly left early.",
        "Quiet. There weren't hardly any people, and we nearly left early.",
        "Quiet. There were hardly any people, and we nearly didn't left early.",
      ]),
      sit("mix", "You had very little time in the test, but you almost finished it. What do you say?", [
        "I barely had time, but I nearly finished.",
        "I didn't barely have time, but I nearly finished.",
        "I barely had time, but I nearly not finished.",
      ]),
    ],
    success: "The learner uses barely or hardly correctly without doubling the negative.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I could barely hear her.",
        "I couldn't barely hear her.",
        "I could barely not hear her.",
      ], 0),
      qfill("We ___ ever go there now. (hardly)", ["hardly"]),
      qmcq("Which word is neutral rather than negative?", ["nearly", "barely", "hardly"], 0),
    ],
    scenes: [
      sc("Priya", "a friend after a close call", "to hear how close it was",
        "Something was completed only just in time.",
        "Describe how close it was.",
        "You made your flight by minutes, didn't you? How much time did you have?", "curious"),
      sc("Gareth", "a colleague reviewing resources", "to judge whether resources were adequate",
        "A project ran on very tight resources.",
        "Describe how little there was.",
        "Did we have enough people on that job last week?", "assessing"),
      sc("Sandrine", "a fellow traveller after a tight connection", "to compare how close you both came",
        "A connection was made with almost no time to spare.",
        "Describe the margin.",
        "How much time did you actually have between flights?", "amazed"),
      sc("Mr. Dabiri", "your teacher", "to practise near-negatives",
        "The class is describing tight margins.",
        "Use barely and hardly correctly.",
        "How often do you see your old school friends these days?", "encouraging"),
      sc("Ms. Halvorsen", "the examiner", "to check near-negatives",
        "The examiner asks about a close call.",
        "Use the forms accurately.",
        "Could you tell me about a time when you only just managed something?", "neutral"),
    ],
  },

  {
    id: "b2-close-enough",
    topic: "approximating without exact facts",
    objectives: [
      "Give a usable answer when you lack exact figures.",
      "Signal clearly that the figure is approximate.",
    ],
    goal: "Answer a factual question when you do not know the exact answer.",
    target: "approximating language",
    correction: "Model the approximation and let the learner answer again.",
    summary: "You learned to answer usefully when you do not have exact facts.",
    minutes: 7,
    points: [
      {
        form: "roughly speaking",
        claims: [
          "'Roughly speaking' opens an approximate answer and warns the listener.",
          "It usually starts the sentence, before the figure.",
        ],
        ex: ["Roughly speaking, about a third.", "Roughly speaking, it takes an hour."],
      },
      {
        form: "somewhere around",
        claims: [
          "'Somewhere around' or 'somewhere in the region of' softens a figure.",
          "The second is more formal and common in writing.",
        ],
        ex: ["Somewhere around fifty.", "Somewhere in the region of two thousand."],
      },
      {
        form: "give or take ten minutes",
        claims: [
          "'Give or take' introduces the size of the possible margin: give or take ten minutes.",
          "It is informal and follows the figure; 'give or take a bit' leaves the margin vague.",
        ],
        ex: ["An hour, give or take ten minutes.", "Three hundred, give or take a bit."],
      },
    ],
    ex: [],
    drills: [
      // p1 — roughly speaking
      fc("p1", "___ speaking, about half the class passed.", ["Roughly", "Rough", "Roughness"]),
      sit("p1", "Someone asks how long the drive takes. You are not sure, but you think it's about an hour. What do you say?", [
        "Roughly speaking, it takes an hour.",
        "Rough speaking, it takes an hour.",
        "Roughly speak, it takes an hour.",
      ]),
      arr("p1", "Roughly speaking, it costs twenty euros.", ["rough"]),
      // p2 — somewhere around / in the region of
      fc("p2", "The house cost somewhere ___ the region of two million.", ["in", "on", "at"]),
      chat("p2", ["How many people came to the festival?", null], [
        "Somewhere around five thousand, I think.",
        "Somewhere about around five thousand, I think.",
        "Somewhere on five thousand, I think.",
      ]),
      lc("p2", "Somewhere in the region of two thousand.", ["It was in another region.", "About two hundred people."]),
      // p3 — give or take
      fc("p3", "The trip takes three hours, give or ___ half an hour.", ["take", "took", "get"]),
      sit("p3", "Your friend asks how many guests are coming. You expect about forty, but you are not sure. What do you say?", [
        "Forty, give or take a few.",
        "Forty, give and take a few.",
        "Forty, gave or take a few.",
      ]),
      spk("p3", "Two hours, give or take ten minutes."),
      // karışık
      chat("mix", ["How many people work there?", null], [
        "Roughly speaking, about two hundred, give or take a few.",
        "Roughly speaking, about two hundred, give and take a few.",
        "Rough speaking, about two hundred, give or take a few.",
      ]),
      la("mix", "Somewhere around sixty, give or take a few.", ["gave"]),
    ],
    success: "The learner gives at least two clearly marked approximations.",
    quiz: [
      qmcq("Which phrase opens an approximate answer?", [
        "Roughly speaking,",
        "Precisely,",
        "Exactly,",
      ], 0),
      qfill("Somewhere ___ fifty people came. (around)", ["around"]),
      qmcq("Which phrase follows the number?", [
        "give or take a bit",
        "roughly speaking",
        "somewhere around",
      ], 0),
    ],
    scenes: [
      sc("Stefan", "a friend asking about numbers", "to get a usable answer",
        "A friend wants figures you never counted.",
        "Answer approximately.",
        "How many people were actually there, roughly?", "casual"),
      sc("Aditi", "a colleague building an estimate", "to get workable figures",
        "An estimate needs numbers nobody has exactly.",
        "Give approximate figures.",
        "Nobody has the real numbers. Roughly how many customers do we get a day?", "pragmatic"),
      sc("Mateus", "a fellow traveller planning timings", "to plan a route roughly",
        "Timings must be estimated for a journey.",
        "Approximate the timings.",
        "How long does the train journey take, more or less?", "relaxed"),
      sc("Ms. Kowalski", "your teacher", "to practise approximation",
        "The class is answering without exact facts.",
        "Approximate clearly.",
        "How many hours a week do you study, roughly?", "encouraging"),
      sc("Mr. Ozturk", "the examiner", "to check approximation",
        "The examiner asks unanswerable factual questions.",
        "Approximate and mark it clearly.",
        "Roughly how many people live in your city?", "neutral"),
    ],
  },

  {
    id: "b2-loaded-words",
    topic: "words that describe similar behaviour with different evaluations",
    objectives: [
      "Choose between words that describe similar facts but carry different evaluations.",
      "Reframe something by renaming it.",
    ],
    goal: "Notice and choose the feeling a word carries.",
    target: "connotation and reframing",
    correction: "Offer the alternative wording and let the learner reframe their own description.",
    summary: "You learned that similar descriptions can frame the same behaviour positively or negatively.",
    minutes: 7,
    points: [
      {
        form: "I'd call it",
        claims: [
          "'I'd call it...' offers a different word for the same thing.",
          "It reframes without directly contradicting the other person.",
        ],
        ex: ["I'd call it careful rather than slow.", "I'd call it firm, not rude."],
      },
      {
        form: "you could say",
        claims: [
          "'You could say' introduces a milder or harsher alternative.",
          "It concedes that both words fit the same facts.",
        ],
        ex: ["You could say she's direct.", "You could say it was a mistake."],
      },
      {
        form: "that's putting it mildly",
        claims: [
          "'That's putting it mildly' says the real situation is stronger than the word used.",
          "It comments on someone else's choice of word rather than the facts.",
        ],
        ex: ["Difficult? That's putting it mildly.", "That's putting it mildly, to be honest."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd call it
      fc("p1", "Her comment wasn't rude. I'd ___ it honest.", ["call", "say", "tell"]),
      chat("p1", ["Your boss is so bossy!", null], [
        "I'd call it organised rather than bossy.",
        "I'd call organised it rather than bossy.",
        "I'd call it organised rather bossy.",
      ]),
      la("p1", "I'd call it brave rather than reckless.", ["calls"]),
      // p2 — you could say
      sit("p2", "Your friend calls a colleague 'rude'. You partly agree, but you want a milder word. What do you say?", [
        "Well, you could say she's quite firm.",
        "Well, you could to say she's quite firm.",
        "Well, you could saying she's quite firm.",
      ]),
      lc("p2", "You could say it was a mistake.", ["It wasn't a mistake at all.", "You could stay a bit longer."]),
      spk("p2", "You could say it was a bit unlucky."),
      // p3 — that's putting it mildly
      sit("p3", "Your friend says the exam was 'a bit hard'. You found it extremely hard. What do you say?", [
        "A bit hard? That's putting it mildly.",
        "A bit hard? That's put it mildly.",
        "A bit hard? That's putting it mild.",
      ]),
      fc("p3", "Expensive? That's ___ it mildly. It cost a fortune.", ["putting", "put", "puts"]),
      err("p3", "Cold? That's putting it mild. It was freezing.", "mild", "mildly"),
      // karışık
      chat("mix", ["Was the manager rude to you?", null], [
        "I'd call it firm. You could say he was strict.",
        "I'd call it firm. You could saying he was strict.",
        "I'd calling it firm. You could say he was strict.",
      ]),
      sit("mix", "A friend calls the new rules 'a little strict'. You think they are much worse than that, and the word you'd use is 'unfair'. What do you say?", [
        "That's putting it mildly. I'd call them unfair.",
        "That's putting it mildly. I'd call it them unfair.",
        "That's put it mildly. I'd call them unfair.",
      ]),
    ],
    success: "The learner reframes the same facts with at least two different words.",
    quiz: [
      qmcq("Which phrase offers a different word?", [
        "I'd call it careful.",
        "It is what it is.",
        "That is the fact.",
      ], 0),
      qfill("You could ___ she's direct rather than blunt. (say)", ["say"]),
      qmcq("Which phrase says the reality is stronger?", [
        "That's putting it mildly.",
        "That's about right.",
        "That's an exaggeration.",
      ], 0),
    ],
    scenes: [
      sc("Ilse", "a friend describing someone harshly", "to see the same person differently",
        "A friend has described someone in unkind terms.",
        "Reframe the description.",
        "My new flatmate never shares anything. He is just difficult, isn't he? Or am I being unfair?", "irritated"),
      sc("Tomasz", "a colleague drafting a reference", "to word a reference fairly",
        "A reference must be honest but not damaging.",
        "Reframe the wording.",
        "The reference says she is bossy. Is that the right word?", "careful"),
      sc("Aiko", "a fellow traveller describing a place", "to compare impressions of a place",
        "Two travellers describe the same place very differently.",
        "Reframe the description.",
        "I thought the old town was a bit run-down. What did you think?", "amused"),
      sc("Mr. Villanueva", "your teacher", "to practise connotation",
        "The class is comparing loaded and neutral words.",
        "Reframe a description.",
        "My friend says I am stubborn. Is that fair, do you think?", "encouraging"),
      sc("Mrs. Sorensen", "the examiner", "to check awareness of connotation",
        "The examiner uses a loaded word deliberately.",
        "Reframe it.",
        "Some people say young people are lazy. Would you describe them that way?", "neutral"),
    ],
  },

  {
    id: "b2-saying-it-kindly",
    topic: "delivering an unwelcome opinion",
    objectives: [
      "Prepare the listener before giving a hard opinion.",
      "Be honest without causing offence.",
    ],
    goal: "Tell someone something they will not want to hear.",
    target: "delivering unwelcome opinions",
    correction: "Model the preparing phrase and let the learner deliver their own opinion.",
    summary: "You practised giving an honest opinion without causing offence.",
    minutes: 7,
    points: [
      {
        form: "I hope you don't mind",
        claims: [
          "'I hope you don't mind me saying' warns the listener before the honesty arrives.",
          "It prepares the listener and can soften what follows, but the content and tone still have to be respectful.",
        ],
        ex: ["I hope you don't mind me saying this.", "I hope you don't mind, but it needs work."],
      },
      {
        form: "with respect",
        claims: [
          "'With respect' signals disagreement with someone senior or in public.",
          "In British English it can sound sharp, so the tone matters.",
        ],
        ex: ["With respect, I see it differently.", "With respect, the figures say otherwise."],
      },
      {
        form: "can I be frank",
        claims: [
          "'Can I be frank?' asks permission before speaking bluntly.",
          "It signals that a direct opinion is coming; it does not make an unkind comment acceptable.",
        ],
        ex: ["Can I be frank with you?", "Can I be honest? It isn't working."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I hope you don't mind
      chat("p1", ["What do you think of my presentation?", null], [
        "I hope you don't mind me saying, but it's a bit long.",
        "I hope you don't mind me to say, but it's a bit long.",
        "I hope you not mind me saying, but it's a bit long.",
      ]),
      sit("p1", "A colleague's report has several mistakes. You want to prepare them politely before you tell them. What do you say first?", [
        "I hope you don't mind me saying this, but there are a few mistakes.",
        "I hope you don't mind me say this, but there are a few mistakes.",
        "I hope you doesn't mind me saying this, but there are a few mistakes.",
      ]),
      spk("p1", "I hope you don't mind, but it needs some work."),
      // p2 — with respect
      sit("p2", "In a meeting, your manager says the plan is perfect. You disagree and want to say so politely. What do you say?", [
        "With respect, I see it differently.",
        "With respecting, I see it differently.",
        "In respect, I see it differently.",
      ]),
      lc("p2", "With respect, the figures say otherwise.", ["With these figures, we can't say.", "I respect your figures."]),
      fc("p2", "___ respect, I don't think that's quite right.", ["With", "In", "For"]),
      // p3 — can I be frank
      chat("p3", ["You look worried. What's wrong?", null], [
        "Can I be frank? I don't think the plan will work.",
        "Can I be frankly? I don't think the plan will work.",
        "Can I being frank? I don't think the plan will work.",
      ]),
      la("p3", "Can I be frank with you?", ["frankly"]),
      sit("p3", "Your friend asks your opinion of their business idea. You are about to say something direct. How do you start?", [
        "Can I be honest? I'm not sure it will work.",
        "Can I be honestly? I'm not sure it will work.",
        "Can I honest? I'm not sure it will work.",
      ]),
      // karışık
      chat("mix", ["So, what do you really think of my plan?", null], [
        "Can I be frank? I hope you don't mind me saying, but it's too risky.",
        "Can I be frank? I hope you don't mind me say, but it's too risky.",
        "Can I frank? I hope you don't mind me saying, but it's too risky.",
      ]),
      sit("mix", "At a public meeting, a senior official says the new road is a great idea. You disagree, and you want to warn her that you are going to be blunt. What do you say?", [
        "With respect, can I be frank? I think it's a mistake.",
        "With respect, can I be frankly? I think it's a mistake.",
        "With respecting, can I be frank? I think it's a mistake.",
      ]),
    ],
    success: "The learner prepares the listener and delivers the opinion honestly.",
    quiz: [
      qmcq("Which phrase prepares the listener?", [
        "I hope you don't mind me saying this.",
        "Here is what is wrong.",
        "You will not like this.",
      ], 0),
      qfill("Can I be ___ with you for a moment? (frank)", ["frank", "honest"]),
      qmcq("Which phrase signals disagreement with someone senior?", [
        "With respect,",
        "Obviously,",
        "As you know,",
      ], 0),
    ],
    scenes: [
      sc("Njeri", "a friend showing you their work", "to get an honest reaction",
        "A friend has shown you work that needs improvement.",
        "Prepare them and be honest.",
        "I have worked on my presentation for weeks. It is forty minutes long, but the limit is ten. What do you think?", "hopeful"),
      sc("Viktor", "a senior colleague you disagree with", "to hear a different view respectfully",
        "You disagree with someone more senior in a meeting.",
        "Disagree respectfully.",
        "I think the plan is sound. Does anyone see it differently?", "authoritative"),
      sc("Paloma", "a host asking about the arrangements", "to hear honest feedback about the stay",
        "A host wants genuine feedback about something imperfect.",
        "Be honest but kind.",
        "Please be honest, was everything all right for you?", "sincere"),
      sc("Ms. Adeyemi", "your teacher", "to practise diplomatic honesty",
        "The class is practising difficult feedback.",
        "Prepare and deliver honestly.",
        "My paragraph for class has no examples, but I think it is ready. Be honest, do you agree?", "encouraging"),
      sc("Mr. Castellano", "the examiner", "to check diplomatic language",
        "The examiner asks for honest criticism.",
        "Prepare the listener and be honest.",
        "Imagine a colleague's idea will not work. What would you say to them?", "neutral"),
    ],
  },

  // --- Ünite 10 · Formal and Informal ----------------------------------------
  {
    id: "b2-would-you-be-so-kind",
    topic: "formal requests",
    objectives: [
      "Make a request in formal language.",
      "Judge how formal a situation needs you to be.",
    ],
    goal: "Ask for something in a formal situation without sounding stiff.",
    target: "formal request forms",
    correction: "Model the formal request and let the learner ask again at the right level.",
    summary: "You learned to make requests in formal language and to judge how far to go.",
    minutes: 7,
    points: [
      {
        form: "would you be so kind",
        claims: [
          "'Would you be so kind as to' is at the very formal end of the scale.",
          "In everyday situations it can sound stiff or even sarcastic.",
        ],
        ex: ["Would you be so kind as to forward it?", "Would you be so kind as to confirm?"],
      },
      {
        form: "I wonder if you could",
        claims: [
          "'I wonder if you could' is formal but natural in speech and email.",
          "It is a broadly polite choice in professional or unfamiliar situations when you are unsure how formal to be.",
        ],
        ex: ["I wonder if you could check this.", "I wonder if you could spare a moment."],
      },
      {
        form: "if it's not too much",
        claims: [
          "'If it's not too much trouble' acknowledges that you are asking a favour.",
          "It can come after the request or before it.",
        ],
        ex: ["Could you send it, if it's not too much trouble?", "If it's not too much trouble, I'd appreciate it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — would you be so kind as to
      fc("p1", "Would you be so kind ___ to forward this email?", ["as", "for", "that"]),
      err("p1", "Would you be so kind as to sending me the file?", "sending", "send"),
      spk("p1", "Would you be so kind as to close the window?"),
      // p2 — I wonder if you could
      fc("p2", "I wonder if you ___ help me with this form.", ["could", "could to", "to could"]),
      sit("p2", "You call a company you don't know. You want them to check your order politely. What do you say?", [
        "I wonder if you could check my order.",
        "I wonder if could you check my order.",
        "I wonder you could check my order.",
      ]),
      arr("p2", "I wonder if you could call me back.", ["calling"]),
      // p3 — if it's not too much trouble
      chat("p3", ["Is there anything else I can do for you?", null], [
        "Could you print two copies, if it's not too much trouble?",
        "Could you print two copies, if it's not too many trouble?",
        "Could you print two copies, if it isn't too much troubles?",
      ]),
      lc("p3", "If it's not too much trouble, I'd appreciate it.", ["It's no trouble at all.", "I'd like to pay for it."]),
      la("p3", "Could you wait, if it's not too much trouble?", ["troubles"]),
      // karışık
      sit("mix", "You write to a hotel you have never used. You want them to send a map, and you know it's a small extra favour. What do you write?", [
        "I wonder if you could send a map, if it's not too much trouble.",
        "I wonder if could you send a map, if it's not too much trouble.",
        "I wonder if you could send a map, if it's not too many trouble.",
      ]),
      chat("mix", ["Good morning, reception.", null], [
        "I wonder if you could call me a taxi, if it's not too much trouble.",
        "I wonder if you could call me a taxi, if it's not too many trouble.",
        "I wonder if could you call me a taxi, if it's not too much trouble.",
      ]),
    ],
    success: "The learner makes at least two formal requests at an appropriate level.",
    quiz: [
      qmcq("Which request is safest when unsure?", [
        "I wonder if you could check this.",
        "Would you be so kind as to check this?",
        "Check this for me.",
      ], 0),
      qfill("Would you be so ___ as to forward it? (kind)", ["kind"]),
      qmcq("Which phrase acknowledges the favour?", [
        "if it's not too much trouble",
        "as soon as possible",
        "at your earliest convenience",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "a senior contact you barely know", "to consider your request",
        "You are asking a favour of someone senior and unfamiliar.",
        "Make the request at the right level.",
        "You wanted to ask me something?", "formal"),
      sc("Mr. Reddy", "a client you must not offend", "to grant a request",
        "A request must be made carefully to a client.",
        "Make it formally.",
        "You mentioned there was something you needed. What is it?", "reserved"),
      sc("Hugo", "an official at a government office", "to process your request",
        "An official process requires a formal request.",
        "Ask formally.",
        "Next, please. What can I do for you?", "brisk"),
      sc("Mr. Bergstrom", "your teacher", "to practise formal requests",
        "The class is grading requests by formality.",
        "Make requests at different levels.",
        "Imagine I am a stranger at the airport and you need me to watch your bag. What do you say?", "encouraging"),
      sc("Ms. Whitfield", "the examiner", "to check formal register",
        "The examiner plays a senior figure.",
        "Make a formal request.",
        "I understand you have a request. What is it?", "neutral"),
    ],
  },

  {
    id: "b2-give-us-a-hand",
    topic: "casual requests between people who know each other",
    objectives: [
      "Ask for help informally.",
      "Recognise where informal requests are appropriate.",
    ],
    goal: "Ask a friend or close colleague for help naturally.",
    target: "informal request forms",
    correction: "Model the casual request and let the learner ask again naturally.",
    summary: "You learned to ask for help casually between people who know each other.",
    minutes: 7,
    points: [
      {
        form: "give us a hand",
        claims: [
          "'Give us a hand' normally means help us; in informal British speech 'us' can also stand for 'me'.",
          "'Give me a hand' is the safe standard form when the help is for you alone.",
        ],
        ex: ["Give us a hand with these, would you?", "Can you give me a hand for a second?"],
      },
      {
        form: "can you grab",
        claims: [
          "'Grab' informally means fetch or get: can you grab the keys?",
          "'Can you' is enough between people who know each other well.",
        ],
        ex: ["Can you grab the keys on your way?", "Can you grab me a coffee?"],
      },
      {
        form: "do us a favour",
        claims: [
          "'Do us a favour' introduces a small request between friends.",
          "In a different tone it can mean disbelief, so context and voice matter.",
        ],
        ex: ["Do us a favour and lock up afterwards.", "Do me a favour and call them back."],
      },
    ],
    ex: [],
    drills: [
      // p1 — give me / us a hand
      fc("p1", "These boxes are heavy. Can you give me a ___?", ["hand", "hands", "handle"]),
      chat("p1", ["Are you moving the sofa on your own?", null], [
        "Yes. Can you give me a hand with it?",
        "Yes. Can you give me an hand with it?",
        "Yes. Can you giving me a hand with it?",
      ]),
      spk("p1", "Can you give me a hand for a minute?"),
      // p2 — can you grab
      sit("p2", "Your flatmate is going into the kitchen. You want a glass of water. You ask casually. What do you say?", [
        "Can you grab me a glass of water?",
        "Can you grab to me a glass of water?",
        "Can you grabbing me a glass of water?",
      ]),
      arr("p2", "Can you grab my phone from the table?", ["grabbed"]),
      lc("p2", "Can you grab my jacket?", ["Where is my jacket?", "Can you open the window?"]),
      // p3 — do me / us a favour
      sit("p3", "You are going out. You ask your friend, informally, to feed your cat later. What do you say?", [
        "Do me a favour and feed the cat later.",
        "Make me a favour and feed the cat later.",
        "Do me a favour and feeding the cat later.",
      ]),
      fc("p3", "Do us a ___ and lock up when you leave.", ["favour", "favourite", "help"]),
      la("p3", "Do me a favour and close the window.", ["make"]),
      // karışık
      chat("mix", ["I'm going to the shop. Need anything?", null], [
        "Yes, do me a favour and grab some bread.",
        "Yes, make me a favour and grab some bread.",
        "Yes, do me a favour and grabbing some bread.",
      ]),
      sit("mix", "You're painting a room and your friend arrives. You want help with the painting, and you want them to fetch a brush from the car. What do you say?", [
        "Give me a hand, would you? Can you grab the brush from the car?",
        "Give me a hand, would you? Can you grab to the brush from the car?",
        "Give me an hand, would you? Can you grab the brush from the car?",
      ]),
    ],
    success: "The learner makes at least two natural informal requests.",
    quiz: [
      qmcq("Which sentence is informal?", [
        "Do me a favour and call them back.",
        "I would be grateful if you would call them.",
        "Would you be so kind as to call them?",
      ], 0),
      qfill("Can you ___ me a coffee while you're up? (grab)", ["grab", "get"]),
      qmcq("Who would you say 'give us a hand' to?", [
        "a close colleague",
        "a new client",
        "a government official",
      ], 0),
    ],
    scenes: [
      sc("Chiara", "a flatmate", "to share small household jobs",
        "Small household jobs need sharing.",
        "Ask casually.",
        "I am heading out in a minute. Anything you need?", "casual"),
      sc("Emeka", "a close colleague", "to help you out quickly",
        "You need quick help from someone you work with daily.",
        "Ask informally.",
        "You are carrying three heavy boxes on your own. Need anything?", "friendly"),
      sc("Ferran", "a friend helping you move", "to be directed during a move",
        "A friend is helping you move furniture.",
        "Direct them informally.",
        "Right, I am here to help you move. Where do you want me?", "willing"),
      sc("Mrs. Iversen", "your teacher", "to practise informal requests",
        "The class is comparing formal and informal requests.",
        "Ask informally.",
        "You are carrying a heavy table and I am your friend. What do you say to me?", "encouraging"),
      sc("Mr. Sasaki", "the examiner", "to check register awareness",
        "The examiner asks you to adjust register.",
        "Ask informally where appropriate.",
        "Imagine I am your close friend and you need a small favour. What do you ask?", "neutral"),
    ],
  },

  {
    id: "b2-i-am-writing-to-enquire",
    topic: "the language of a formal written message",
    objectives: [
      "Open and close a formal email correctly.",
      "State your purpose in the first line.",
    ],
    goal: "Write a formal email that gets a helpful reply.",
    target: "formal written conventions",
    correction: "Model the formal line and let the learner rewrite their own.",
    summary: "You learned the standard openings and closings of a formal written message.",
    minutes: 7,
    points: [
      {
        form: "I am writing to",
        claims: [
          "'I am writing to enquire about' states the purpose in the first line.",
          "In highly formal writing the full forms are preferred; in ordinary professional email contractions are acceptable.",
        ],
        ex: ["I am writing to enquire about the course.", "I am writing to confirm our order."],
      },
      {
        form: "I would be grateful",
        claims: [
          "'I would be grateful if you could' is the standard formal request.",
          "It is followed by 'could' plus a base verb, not by 'to'.",
        ],
        ex: ["I would be grateful if you could confirm.", "I would be grateful for any information."],
      },
      {
        form: "please find attached",
        claims: [
          "'Please find attached' introduces a document in a formal message.",
          "'I have attached' is more direct and often more natural in modern professional email.",
        ],
        ex: ["Please find attached the completed form.", "Please find attached our invoice."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I am writing to
      fc("p1", "I am writing to ___ about the job you advertised.", ["enquire", "enquiring", "enquiry"]),
      sit("p1", "You are starting a formal email to a hotel. You want to ask about prices for a large group. What is your first line?", [
        "I am writing to enquire about prices for a large group.",
        "I am writing for enquire about prices for a large group.",
        "I am write to enquire about prices for a large group.",
      ]),
      arr("p1", "I am writing to confirm our booking.", ["confirming"]),
      // p2 — I would be grateful if you could
      fc("p2", "I would be grateful if you ___ send me the details.", ["could", "to", "could to"]),
      err("p2", "I would be grateful if you could replying by Friday.", "replying", "reply"),
      spk("p2", "I would be grateful if you could confirm the date."),
      // p3 — please find attached
      sit("p3", "You are sending a formal email with your CV. How do you mention the document?", [
        "Please find attached my CV.",
        "Please find attaching my CV.",
        "Please found attached my CV.",
      ]),
      lc("p3", "Please find attached the completed form.", ["Please fill in the form.", "I can't find the form."]),
      la("p3", "Please find attached the signed contract.", ["attaching"]),
      // karışık
      sit("mix", "In a formal email, you send a report and politely ask the reader to check it. What do you write?", [
        "Please find attached the report. I would be grateful if you could check it.",
        "Please find attached the report. I would be grateful if you could to check it.",
        "Please find attach the report. I would be grateful if you could check it.",
      ]),
      sit("mix", "You write to a college to ask about its evening classes and to request a brochure politely. What do you write?", [
        "I am writing to enquire about your evening classes, and I would be grateful for a brochure.",
        "I am writing to enquiring about your evening classes, and I would be grateful for a brochure.",
        "I am writing to enquire about your evening classes, and I would be grateful to a brochure.",
      ]),
    ],
    success: "The learner opens formally and makes a formal request.",
    quiz: [
      qmcq("Which opening is formal?", [
        "I am writing to enquire about the course.",
        "Just wondering about the course.",
        "Quick question about the course.",
      ], 0),
      qfill("I would be ___ for any information you can give. (grateful)", ["grateful"]),
      qmcq("Which sentence introduces a document?", [
        "Please find attached our invoice.",
        "Please see you soon.",
        "Please confirm the date.",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Petrov", "an admissions officer", "to answer a formal enquiry",
        "You are enquiring formally about a course.",
        "Make the enquiry formally.",
        "Imagine you are emailing our admissions office about a course. How does your message begin?", "professional"),
      sc("Mr. Osei", "a supplier's account team", "to process a formal request",
        "A formal written request is needed at work.",
        "State the purpose and request formally.",
        "You are emailing our accounts team and sending an invoice with the email. What do you write?", "formal"),
      sc("Ana Lucia", "a consulate officer", "to handle a formal application",
        "A formal application requires careful wording.",
        "State your purpose formally.",
        "Imagine you are emailing the consulate to ask about a visa. How would you start your email?", "official"),
      sc("Mr. Wickham", "your teacher", "to practise formal writing",
        "The class is drafting formal emails.",
        "Open and request formally.",
        "Imagine you are writing to a language school you have never contacted. How does your email begin?", "encouraging"),
      sc("Ms. Roux", "the examiner", "to check formal written register",
        "The examiner asks you to compose formally.",
        "Use formal conventions.",
        "Imagine you are writing to a company about a job. How would you begin your email?", "neutral"),
    ],
  },

  {
    id: "b2-just-a-quick-one",
    topic: "the language of a casual written message",
    objectives: [
      "Open and close a casual message naturally.",
      "Keep a short message short.",
    ],
    goal: "Write a short informal message that does not sound abrupt.",
    target: "informal written conventions",
    correction: "Model the casual line and let the learner shorten their own message.",
    summary: "You learned the conventions of a short informal written message.",
    minutes: 7,
    points: [
      {
        form: "quick one",
        claims: [
          "'Quick one' signals that the message is short and needs little effort to answer.",
          "It sets expectations, which is why it is common at work.",
        ],
        ex: ["Quick one: are we still on for Friday?", "Just a quick one about tomorrow."],
      },
      {
        form: "just checking",
        claims: [
          "'Just checking' softens a follow-up so it does not read as chasing.",
          "'Just' does the softening work here.",
        ],
        ex: ["Just checking you got my last message.", "Just checking the time hasn't changed."],
      },
      {
        form: "let me know",
        claims: [
          "'Let me know' closes an informal message without a formal sign-off.",
          "Adding a time makes it a real request: let me know by Thursday.",
        ],
        ex: ["Let me know when you can.", "Let me know either way."],
      },
    ],
    ex: [],
    drills: [
      // p1 — quick one
      fc("p1", "Quick ___: is the meeting still at ten?", ["one", "ones", "once"]),
      sit("p1", "You send a short work message. You want to show that your question is small and easy to answer. How do you start?", [
        "Quick one: do you have the file?",
        "Quickly one: do you have the file?",
        "Quick ones: do you have the file?",
      ]),
      lc("p1", "Just a quick one about the report.", ["I just finished the report.", "The report was very long."]),
      // p2 — just checking
      chat("p2", ["Hi! Was there something you needed?", null], [
        "Just checking you got my message.",
        "Just checks you got my message.",
        "Just to checking you got my message.",
      ]),
      fc("p2", "Just ___ you're still free on Friday.", ["checking", "checks", "to checking"]),
      spk("p2", "Just checking you got my last message."),
      // p3 — let me know
      sit("p3", "You end an informal message to a colleague. You need their answer by Thursday. What do you write?", [
        "Let me know by Thursday.",
        "Let me to know by Thursday.",
        "Let me knowing by Thursday.",
      ]),
      arr("p3", "Let me know either way.", ["knows"]),
      fc("p3", "Let ___ know if you need anything else.", ["me", "my", "I"]),
      // karışık
      chat("mix", ["Hey, what's up?", null], [
        "Quick one: are we still on for Friday? Let me know.",
        "Quick one: are we still on for Friday? Let me knowing.",
        "Quickly one: are we still on for Friday? Let me know.",
      ]),
      lc("mix", "Just checking you're free. Let me know either way.", [
        "Just tell me if you're free tomorrow.",
        "Let me check if I'm free.",
      ]),
    ],
    success: "The learner writes a short informal message that stays friendly.",
    quiz: [
      qmcq("Which opening is informal?", [
        "Quick one about tomorrow.",
        "I am writing to enquire about tomorrow.",
        "I would be grateful for information about tomorrow.",
      ], 0),
      qfill("Just ___ the time hasn't changed. (check)", ["checking"]),
      qmcq("Which closing is informal?", [
        "Let me know when you can.",
        "I look forward to your response.",
        "Yours faithfully.",
      ], 0),
    ],
    scenes: [
      sc("Halima", "a close colleague", "to answer a quick question",
        "A short question needs a quick answer.",
        "Write informally and briefly.",
        "You pinged me? What's up?", "casual"),
      sc("Konstantin", "a teammate on a shared task", "to confirm a small detail",
        "A small detail needs confirming quickly.",
        "Follow up casually.",
        "Sorry, I missed your message earlier. What did you need?", "apologetic"),
      sc("Lena", "a friend organising a meet-up", "to sort out the details quickly",
        "Plans need confirming between friends.",
        "Write a short casual message.",
        "Are we still doing Friday or has that changed?", "easy"),
      sc("Mrs. Dube", "your teacher", "to practise informal writing",
        "The class is comparing formal and informal messages.",
        "Write informally and briefly.",
        "Imagine I am your colleague. You need one small answer from me. What is your message?", "encouraging"),
      sc("Mr. Ellery", "the examiner", "to check informal register",
        "The examiner asks for an informal message.",
        "Keep it short and friendly.",
        "Imagine you are messaging a friend to check tonight's plan. What do you write?", "neutral"),
    ],
  },

  {
    id: "b2-softening-the-blow",
    topic: "distancing language for bad news",
    objectives: [
      "Use distancing language to make bad news land gently.",
      "Avoid stating a problem more bluntly than necessary.",
    ],
    goal: "Give bad news without making it worse.",
    target: "distancing and hedging in bad news",
    correction: "Model the softened version and let the learner deliver the news again.",
    summary: "You learned to soften bad news with distancing language.",
    minutes: 8,
    points: [
      {
        form: "unfortunately we",
        claims: [
          "'Unfortunately' signals bad news before the sentence delivers it.",
          "One signal is enough; stacking several sounds evasive.",
        ],
        ex: ["Unfortunately we can't confirm yet.", "Unfortunately the date has moved."],
      },
      {
        form: "I'm afraid there's",
        claims: [
          "'I'm afraid there's a problem' names the problem without blaming anyone.",
          "'There is' avoids naming who caused it, which lowers the temperature.",
        ],
        ex: ["I'm afraid there's been a delay.", "I'm afraid there's a small issue."],
      },
      {
        form: "it seems there may be",
        claims: [
          "'It seems there may be' adds two layers of distance: seems and may.",
          "Use it when the problem is not yet confirmed, not to avoid responsibility.",
        ],
        ex: ["It seems there may be a misunderstanding.", "It seems there may be an error."],
      },
    ],
    ex: [],
    drills: [
      // p1 — unfortunately
      fc("p1", "___ we can't offer you a refund.", ["Unfortunately", "Unfortunate", "Unfortunated"]),
      sit("p1", "You have to tell a customer that their order cannot be delivered this week. What do you say?", [
        "Unfortunately we can't deliver it this week.",
        "Unfortunate we can't deliver it this week.",
        "Unfortunately we can't to deliver it this week.",
      ]),
      err("p1", "Unfortunatly the meeting has been cancelled.", "Unfortunatly", "Unfortunately"),
      // p2 — I'm afraid there's
      fc("p2", "I'm afraid there's ___ a delay with your order.", ["been", "be", "being"]),
      chat("p2", ["Is everything ready for the launch?", null], [
        "Not quite. I'm afraid there's a problem with the website.",
        "Not quite. I afraid there's a problem with the website.",
        "Not quite. I'm afraid there are a problem with the website.",
      ]),
      la("p2", "I'm afraid there's been a mistake.", ["afraided"]),
      // p3 — it seems there may be
      sit("p3", "You think there might be a mistake in an invoice, but you haven't checked yet. What do you say?", [
        "It seems there may be a mistake in the invoice.",
        "It seems there may is a mistake in the invoice.",
        "It seem there may be a mistake in the invoice.",
      ]),
      fc("p3", "It seems there ___ be a misunderstanding.", ["may", "mays", "is"]),
      spk("p3", "It seems there may be a problem with the booking."),
      // karışık
      sit("mix", "You must tell a client two things: their order is late, which is confirmed, and there might also be a billing error, which isn't confirmed yet. What do you say?", [
        "Unfortunately your order is late, and it seems there may be a billing error.",
        "Unfortunately your order is late, and it seems there may is a billing error.",
        "Unfortunate your order is late, and it seems there may be a billing error.",
      ]),
      sit("mix", "You have checked, and the delivery is definitely late. You tell the customer without blaming anyone. What do you say?", [
        "I'm afraid there's been a delay with your delivery.",
        "It seems there may be a delay with your delivery.",
        "I'm afraid there's be a delay with your delivery.",
      ]),
    ],
    success: "The learner delivers bad news with appropriate softening at least twice.",
    quiz: [
      qmcq("Which sentence adds the most distance?", [
        "It seems there may be an error.",
        "There is an error.",
        "You made an error.",
      ], 0),
      qfill("___ the date has moved again. (unfortunate)", ["Unfortunately"]),
      qmcq("Which sentence names a problem without blame?", [
        "I'm afraid there's a small issue.",
        "You created a small issue.",
        "Your side has an issue.",
      ], 0),
    ],
    scenes: [
      sc("Priscilla", "a client expecting good news", "to receive bad news as gently as possible",
        "A client must be told about a delay.",
        "Deliver the news gently.",
        "I assume everything is on track for next week?", "expectant"),
      sc("Mr. Lowell", "a supplier you must correct", "to be told about an error without conflict",
        "A supplier has made an error you must raise.",
        "Raise it without blaming.",
        "You said there was something about the last delivery?", "open"),
      sc("Anouk", "a guest whose booking has a problem", "to be told about a problem calmly",
        "A booking problem must be explained to a guest.",
        "Deliver the news gently.",
        "I am just checking in. Everything in order?", "cheerful"),
      sc("Ms. Kaur", "your teacher", "to practise softening bad news",
        "The class is delivering difficult messages.",
        "Soften the news appropriately.",
        "I am your client. How is my order coming along?", "encouraging"),
      sc("Mr. Eriksen", "the examiner", "to check hedging in bad news",
        "The examiner plays someone expecting good news.",
        "Deliver bad news with appropriate distance.",
        "Everything is ready for tomorrow, I hope?", "neutral"),
    ],
  },

  {
    id: "b2-a-difficult-email",
    topic: "raising a delicate matter in writing",
    objectives: [
      "Introduce a sensitive subject in writing.",
      "Acknowledge the other side before making your point.",
    ],
    goal: "Write to someone about something awkward.",
    target: "raising a delicate matter",
    correction: "Model the careful opening and let the learner raise their own matter.",
    summary: "You practised raising an awkward subject in writing.",
    minutes: 7,
    points: [
      {
        form: "I wanted to raise",
        claims: [
          "'I wanted to raise something with you' introduces the subject before the detail.",
          "The past 'wanted' is a distancing device, not a real past tense here.",
        ],
        ex: ["I wanted to raise something with you.", "I wanted to raise a small concern."],
      },
      {
        form: "I appreciate that",
        claims: [
          "'I appreciate that...' acknowledges the other side before your point.",
          "The acknowledgement must be genuine or the message reads as insincere.",
        ],
        ex: ["I appreciate that you've been busy.", "I appreciate that this is difficult."],
      },
      {
        form: "would it be possible",
        claims: [
          "'Would it be possible to...' asks for a change without demanding it.",
          "It leaves the other person room to say no.",
        ],
        ex: ["Would it be possible to review it again?", "Would it be possible to move the date?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I wanted to raise
      sit("p1", "You need to tell your manager about a problem with your workload. You introduce the subject first. What do you say?", [
        "I wanted to raise something with you.",
        "I wanted raise something with you.",
        "I wanted to rise something with you.",
      ]),
      chat("p1", ["Hi! You wanted to see me?", null], [
        "Yes, I wanted to raise a problem with the schedule.",
        "Yes, I wanted to raising a problem with the schedule.",
        "Yes, I wanted to rise a problem with the schedule.",
      ]),
      spk("p1", "I wanted to raise something with you."),
      // p2 — I appreciate that
      chat("p2", ["Sorry I haven't answered your emails.", null], [
        "I appreciate that you've been busy.",
        "I appreciate that you've being busy.",
        "I appreciating that you've been busy.",
      ]),
      sit("p2", "Your colleague has a lot of work. Before asking for help, you show you understand. What do you say?", [
        "I appreciate that you're very busy.",
        "I appreciate that you very busy.",
        "I appreciate to you're very busy.",
      ]),
      lc("p2", "I appreciate that the deadline is tight.", ["The deadline is next Thursday.", "I need more time for this."]),
      // p3 — would it be possible to
      sit("p3", "You want your manager to change the time of a meeting, but you don't want to demand it. What do you say?", [
        "Would it be possible to change the time?",
        "Would it possible to change the time?",
        "Would it be possible changing the time?",
      ]),
      la("p3", "Would it be possible to review it again?", ["reviewing"]),
      chat("p3", ["So, what would you like us to do?", null], [
        "Would it be possible to extend the deadline?",
        "Would be it possible to extend the deadline?",
        "Would it be possible extend the deadline?",
      ]),
      // karışık
      chat("mix", ["What's this email about?", null], [
        "I wanted to raise a concern. Would it be possible to talk tomorrow?",
        "I wanted to raise a concern. Would it be possible talk tomorrow?",
        "I wanted to rise a concern. Would it be possible to talk tomorrow?",
      ]),
      sit("mix", "You write to a teacher who has been very busy. You recognise that first, then ask politely for more time. What do you write?", [
        "I appreciate that you've been busy. Would it be possible to have more time?",
        "I appreciate that you've been busy. Would it be possible have more time?",
        "I appreciating that you've been busy. Would it be possible to have more time?",
      ]),
    ],
    success: "The learner raises the matter, acknowledges the other side and requests a change.",
    quiz: [
      qmcq("Which sentence introduces a subject carefully?", [
        "I wanted to raise a small concern.",
        "There is a serious problem here.",
        "This needs sorting out now.",
      ], 0),
      qfill("I ___ that this is difficult for you. (appreciate)", ["appreciate"]),
      qmcq("Which request leaves room for no?", [
        "Would it be possible to move the date?",
        "Move the date, please.",
        "The date must move.",
      ], 0),
    ],
    scenes: [
      sc("Ingeborg", "a friend who owes you money", "to be reminded without embarrassment",
        "A friend has forgotten to repay something.",
        "Raise it delicately.",
        "You sounded serious on the phone. What did you want to talk about?", "unaware"),
      sc("Rashid", "a colleague missing deadlines", "to understand there is a problem",
        "A colleague's late work is affecting others.",
        "Raise it carefully.",
        "You said you wanted a word. What's on your mind?", "receptive"),
      sc("Cecilia", "a landlord who has not fixed something", "to act on a repeated request",
        "A repair has been promised and not done.",
        "Raise it politely but firmly.",
        "You have emailed a few times now. What is the issue?", "defensive"),
      sc("Mr. Steiner", "your teacher", "to practise delicate writing",
        "The class is drafting difficult messages.",
        "Raise a delicate matter carefully.",
        "Imagine I am your colleague and my work is late again. You have come to talk to me. What do you say?", "encouraging"),
      sc("Ms. Coelho", "the examiner", "to check diplomatic writing",
        "The examiner asks you to raise something awkward.",
        "Introduce, acknowledge and request.",
        "Imagine you are writing to your landlord about a broken heater. How does your email begin?", "neutral"),
    ],
  },

  {
    id: "b2-same-thing-two-ways",
    topic: "one message in two registers",
    objectives: [
      "Say the same thing formally and casually.",
      "Notice what actually changes between the two.",
    ],
    goal: "Deliver one message at two different levels of formality.",
    target: "switching register",
    correction: "Give the message in one register and let the learner produce the other.",
    summary: "You practised saying one message formally and then casually.",
    minutes: 7,
    points: [
      {
        form: "formally you'd say",
        claims: [
          "The formal version uses full forms, longer verbs and no contractions.",
          "'I am writing to inform you' rather than 'just letting you know'.",
        ],
        ex: ["Formally you'd say 'I am unable to attend'.", "Formally you'd write 'please find attached'."],
      },
      {
        form: "but you'd tell a friend",
        claims: [
          "The casual version uses contractions, phrasal verbs and shorter sentences.",
          "'I can't make it' says the same as 'I am unable to attend'.",
        ],
        ex: ["But you'd tell a friend 'I can't make it'.", "But you'd tell a friend 'here it is'."],
      },
      {
        form: "same thing really",
        claims: [
          "The basic information can stay the same, but the wording changes the social meaning: distance, warmth and urgency.",
          "Choosing the wrong register is a social error, not a grammatical one.",
        ],
        ex: ["It's the same thing really.", "Same thing really, just said differently."],
      },
    ],
    ex: [],
    drills: [
      // p1 — formal version
      sit("p1", "A friend writes 'Here's the file.' You need to say the same thing in a formal email. What do you write?", [
        "Please find attached the file.",
        "Please find attaching the file.",
        "Here's the file, mate.",
      ]),
      fc("p1", "Formally you'd ___ 'I am writing to inform you'.", ["say", "said", "saying"]),
      spk("p1", "Formally you'd say I am writing to inform you."),
      // p2 — casual version
      chat("p2", ["How would you say 'I would be grateful for your help' to a friend?", null], [
        "But you'd tell a friend 'Can you help me?'",
        "But you'd tell a friend 'I would be most grateful for your assistance.'",
        "But you'd told a friend 'Can you help me?'",
      ]),
      sit("p2", "In a formal email you wrote 'I am unable to come'. Now you text a friend the same news, casually. What do you write?", [
        "Sorry, I can't make it.",
        "Sorry, I can't making it.",
        "Sorry, I can't to make it.",
      ]),
      la("p2", "But you'd tell a friend I can't make it.", ["telling"]),
      // p3 — same thing really
      fc("p3", "Formal or casual, it's the same thing ___.", ["really", "real", "realise"]),
      sit("p3", "Your friend says the formal and casual versions mean completely different things. You think the information is the same and only the tone changes. What do you say?", [
        "It's the same thing really, just said differently.",
        "It's the same thing really, just say differently.",
        "It's a same thing really, just said differently.",
      ]),
      spk("p3", "Same thing really, just said differently."),
      // karışık
      chat("mix", ["Is 'here it is' OK in a formal email?", null], [
        "Formally you'd write 'please find attached'. Same thing really.",
        "Formally you'd writing 'please find attached'. Same thing really.",
        "Formally you'd write 'please find attaching'. Same thing really.",
      ]),
      sit("mix", "A colleague asks how to say 'Thanks for your help' in two ways. You give the formal version first, then the casual one. What do you say?", [
        "Formally you'd say 'Thank you for your assistance', but you'd tell a friend 'Thanks a lot'.",
        "Formally you'd say 'Thanks a lot', but you'd tell a friend 'Thank you for your assistance'.",
        "Formally you'd said 'Thank you for your assistance', but you'd tell a friend 'Thanks a lot'.",
      ]),
    ],
    success: "The learner delivers one message in both registers.",
    quiz: [
      qmcq("Which sentence is formal?", [
        "I am unable to attend.",
        "I can't make it.",
        "Can't come, sorry.",
      ], 0),
      qfill("___ thing really, just said differently. (same)", ["Same"]),
      qmcq("What usually changes between registers?", [
        "the wording and social tone, while the core message stays similar",
        "the basic facts only",
        "the grammar, from correct to incorrect",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend learning English with you", "to understand when to use which version",
        "A friend is confused about when to be formal.",
        "Give both versions of a message.",
        "I never know which version to use. Can you show me both?", "confused"),
      sc("Owen", "a colleague drafting two messages", "to send the right version to each person",
        "The same news must go to a client and a teammate.",
        "Produce both versions.",
        "We have to tell a client and a friend that the party is cancelled. How do we word each message?", "practical"),
      sc("Fatima", "a host curious about English registers", "to understand the difference",
        "A host is curious how English changes with formality.",
        "Demonstrate both registers.",
        "How would you say 'thank you for your help' to your boss, and then to a friend?", "curious"),
      sc("Mr. Tremblay", "your teacher", "to practise register switching",
        "The class is converting between registers.",
        "Give both versions.",
        "How would you say 'I can't come' formally, and then casually?", "encouraging"),
      sc("Ms. Petrenko", "the examiner", "to check register control",
        "The examiner asks for both versions.",
        "Switch register cleanly.",
        "How would you decline an invitation formally, and then to a friend?", "neutral"),
    ],
  },

  // --- Ünite 11 · Discussing Real Issues -------------------------------------
  {
    id: "b2-on-the-rise",
    topic: "describing how numbers move",
    objectives: [
      "Describe a rise, a fall and a period of no change.",
      "Add an adverb to say how fast the change was.",
    ],
    goal: "Describe a trend in numbers clearly.",
    target: "describing trends",
    correction: "Model the trend sentence with its adverb and let the learner describe again.",
    summary: "You learned to describe how numbers rise, fall and level off.",
    minutes: 7,
    points: [
      {
        form: "has gone up",
        claims: [
          "The present perfect connects a past change to the situation now.",
          "'Has gone up' and 'has increased' say the same thing at different formality levels.",
        ],
        ex: ["The cost has gone up again.", "Numbers have increased since spring."],
      },
      {
        form: "risen sharply",
        claims: [
          "An adverb after the verb says how fast: sharply, steadily, slightly.",
          "'Sharply' describes a rapid or large change; 'steadily' describes change continuing at a fairly consistent rate.",
        ],
        ex: ["Prices have risen sharply.", "Attendance has fallen steadily."],
      },
      {
        form: "stayed the same",
        claims: [
          "'Stayed the same' means no change over the period; 'levelled off' means an earlier rise or fall stopped.",
          "That difference matters: one describes stability throughout, the other stability after movement.",
        ],
        ex: ["Numbers have stayed the same since June.", "It levelled off after the summer."],
      },
    ],
    ex: [],
    drills: [
      // p1 — has gone up
      fc("p1", "The price of coffee has ___ up again this year.", ["gone", "went", "go"]),
      sit("p1", "Your rent was 800 euros last year. Now it is 900. What do you say?", [
        "The rent has gone up.",
        "The rent has went up.",
        "The rent has gone down.",
      ]),
      arr("p1", "The number of visitors has increased.", ["increasing"]),
      // p2 — sharply / steadily
      fc("p2", "Prices rose ___ last month: from ten euros to twenty.", ["sharply", "sharp", "slightly"]),
      sit("p2", "Over five years, sales grew by about the same small amount every year. What do you say?", [
        "Sales have risen steadily.",
        "Sales have risen sharply.",
        "Sales have rose steadily.",
      ]),
      lc("p2", "Attendance has fallen steadily.", ["Attendance has been great.", "The attendance list is ready."]),
      // p3 — stayed the same / levelled off
      sit("p3", "Prices rose quickly until June. Since June, they haven't moved. What do you say?", [
        "Prices levelled off in June.",
        "Prices stayed the same all year.",
        "Prices levelled up in June.",
      ]),
      fc("p3", "The number of members has ___ the same since January.", ["stayed", "stay", "staying"]),
      spk("p3", "Prices have stayed the same since last year."),
      // karışık
      chat("mix", ["How have ticket sales been this year?", null], [
        "They've risen sharply, but now they've levelled off.",
        "They've risen sharp, but now they've levelled off.",
        "They've rose sharply, but now they've levelled off.",
      ]),
      la("mix", "Costs have gone up steadily since March.", ["went"]),
    ],
    success: "The learner describes at least two trends with suitable adverbs.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Numbers have increased since spring.",
        "Numbers have increase since spring.",
        "Numbers has increased since spring.",
      ], 0),
      qfill("It ___ off after the summer. (level)", ["levelled"]),
      qmcq("Which adverb describes change at a consistent rate?", ["steadily", "sharply", "suddenly"], 0),
    ],
    scenes: [
      sc("Kwabena", "a neighbour discussing the cost of living", "to compare how costs have changed",
        "Everyday costs have changed noticeably.",
        "Describe the trends.",
        "Everything seems more expensive lately. What has gone up the most for you?", "concerned"),
      sc("Simone", "a colleague presenting figures", "to describe a chart clearly",
        "A chart must be described in a meeting.",
        "Describe the trends precisely.",
        "Sales rose from one thousand to fifteen hundred, then stopped changing. Can you talk us through the trend?", "focused"),
      sc("Emil", "a local explaining changes in the town", "to describe how a place has changed",
        "A town has changed measurably over years.",
        "Describe the changes.",
        "This area is unrecognisable now. How has it changed?", "reflective"),
      sc("Mrs. Aguilar", "your teacher", "to practise trend language",
        "The class is describing charts and changes.",
        "Describe a trend with an adverb.",
        "Think about prices in your town. How have they changed this year?", "encouraging"),
      sc("Mr. Nakamura", "the examiner", "to check trend description",
        "The examiner asks about change over time.",
        "Describe trends accurately.",
        "Could you describe how something has changed in your country recently?", "neutral"),
    ],
  },

  {
    id: "b2-backing-up-an-opinion",
    topic: "supporting a claim with evidence",
    objectives: [
      "Introduce an example that supports a claim.",
      "Point to evidence beyond your own experience.",
    ],
    goal: "Make an opinion convincing by supporting it.",
    target: "supporting claims with examples",
    correction: "Model the example-introducing phrase and let the learner support their own claim.",
    summary: "You learned to support a claim with examples and evidence.",
    minutes: 7,
    points: [
      {
        form: "for instance",
        claims: [
          "'For instance' and 'for example' introduce one specific case.",
          "One well-chosen example persuades more than three vague ones.",
        ],
        ex: ["For instance, the shop on the corner closed.", "For instance, look at last winter."],
      },
      {
        form: "take ... for example",
        claims: [
          "'Take... for example' puts the example itself at the front of the sentence.",
          "It works well when the example is well known to both of you.",
        ],
        ex: ["Take the bus service, for example: it now runs hourly.", "Take last year, for example."],
      },
      {
        form: "that's borne out by",
        claims: [
          "'That's borne out by' points to evidence beyond your own view.",
          "It is formal and belongs in discussion rather than casual chat.",
        ],
        ex: ["That's borne out by the figures.", "That's borne out by what we saw."],
      },
    ],
    ex: [],
    drills: [
      // p1 — for instance
      fc("p1", "Some shops are struggling. For ___, the bakery closed last month.", ["instance", "instant", "example of"]),
      chat("p1", ["Is the town really getting more expensive?", null], [
        "Yes. For instance, coffee now costs four euros.",
        "Yes. For instant, coffee now costs four euros.",
        "Yes. In instance, coffee now costs four euros.",
      ]),
      spk("p1", "For instance, look at last winter."),
      // p2 — take ... for example
      arr("p2", "Take the bus service, for example.", ["took"]),
      sit("p2", "You want to give an example you both know well: the old train station. You put the example first. What do you say?", [
        "Take the old station, for example.",
        "Taking the old station, for example.",
        "Take the old station, for examples.",
      ]),
      lc("p2", "Take my brother, for example.", ["My brother is a good example.", "Take my bag, please."]),
      // p3 — that's borne out by
      fc("p3", "That's borne out ___ the latest research.", ["by", "from", "with"]),
      sit("p3", "In a discussion, you say crime has fallen. You want to point to the official figures as evidence. What do you say?", [
        "That's borne out by the official figures.",
        "That's born out by the official figures.",
        "That's borne out from the official figures.",
      ]),
      la("p3", "That's borne out by what we saw.", ["from"]),
      // karışık
      chat("mix", ["Why do you think the new park is a success?", null], [
        "Take last weekend, for example: it was full. That's borne out by the visitor numbers.",
        "Take last weekend, for example: it was full. That's borne out from the visitor numbers.",
        "Taking last weekend, for example: it was full. That's borne out by the visitor numbers.",
      ]),
      sit("mix", "You argue that cycling is safer now. You give one specific case, then point to official evidence. What do you say?", [
        "For instance, accidents fell last year. That's borne out by the police figures.",
        "For instant, accidents fell last year. That's borne out by the police figures.",
        "For instance, accidents fell last year. That's borne out with the police figures.",
      ]),
    ],
    success: "The learner supports a claim with at least one specific example and one piece of evidence.",
    quiz: [
      qmcq("Which phrase introduces one specific case?", ["For instance,", "In general,", "On the whole,"], 0),
      qfill("That's ___ out by the figures. (bear)", ["borne"]),
      qmcq("Which sentence puts the example first?", [
        "Take last year, for example.",
        "Last year was difficult.",
        "It was difficult last year.",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a friend who wants proof", "to be persuaded by more than opinion",
        "A friend is unconvinced by opinions alone.",
        "Support your claim with examples.",
        "You keep saying our town is getting more expensive. Where is your evidence?", "sceptical"),
      sc("Ravi", "a colleague challenging a claim", "to test whether a claim is supported",
        "A claim in a meeting needs support.",
        "Support it with examples and evidence.",
        "You said working from home makes people more productive. That is a strong claim. What is it based on?", "probing"),
      sc("Elif", "a local defending their town", "to hear a fair, supported view",
        "A conversation about a town's decline needs evidence.",
        "Support your view carefully.",
        "People always say this place is going downhill. Is that fair?", "protective"),
      sc("Mr. Delacroix", "your teacher", "to practise supporting claims",
        "The class is supporting opinions with evidence.",
        "Support a claim properly.",
        "Tell me one thing that has got better in your town. What is your evidence?", "encouraging"),
      sc("Ms. Bianchi", "the examiner", "to check supported argument",
        "The examiner asks for a supported opinion.",
        "Support the claim with examples.",
        "Could you give me an opinion about your city and support it?", "neutral"),
    ],
  },

  {
    id: "b2-where-do-you-stand",
    topic: "taking and defending a position",
    objectives: [
      "State where you stand on a contested question.",
      "Defend the position when it is challenged.",
    ],
    goal: "Take a clear position on something people disagree about.",
    target: "stating and defending a position",
    correction: "Model the position statement and let the learner state and defend their own.",
    summary: "You practised taking a clear position and defending it.",
    minutes: 7,
    points: [
      {
        form: "I come down on",
        claims: [
          "'I come down on the side of' states which side you have chosen after weighing both.",
          "It implies you considered the alternative, which makes the position stronger.",
        ],
        ex: ["I come down on the side of caution.", "I come down on the side of change."],
      },
      {
        form: "where I stand is",
        claims: [
          "'Where I stand is...' states the position plainly, without hedging.",
          "It works best after a long discussion, when the other person needs a clear answer.",
        ],
        ex: ["Where I stand is simple.", "Where I stand is that we should wait."],
      },
      {
        form: "I feel strongly that",
        claims: [
          "'I feel strongly that' marks the position as important to you, not just held.",
          "Overusing it weakens it, so save it for one point.",
        ],
        ex: ["I feel strongly that it's the wrong approach.", "I feel strongly about this one."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I come down on the side of
      chat("p1", ["So, do you want to keep the old system or change it?", null], [
        "After thinking about it, I come down on the side of change.",
        "After thinking about it, I come down on the side for change.",
        "After thinking about it, I come down in the side of change.",
      ]),
      sit("p1", "You have weighed both options: working from home or in the office. You choose working from home. What do you say?", [
        "I come down on the side of working from home.",
        "I come down on the side of work from home.",
        "I come down at the side of working from home.",
      ]),
      lc("p1", "I come down on the side of safety.", ["I came down the stairs slowly.", "Safety is on our side."]),
      // p2 — where I stand is
      chat("p2", ["We've talked for an hour. Just tell me clearly: what do you think?", null], [
        "Where I stand is that we need more data.",
        "Where I stand it is that we need more data.",
        "Where do I stand is that we need more data.",
      ]),
      sit("p2", "After a long discussion, your manager needs a clear answer from you. You think the project should stop. What do you say?", [
        "Where I stand is that we should stop the project.",
        "Where I stand are that we should stop the project.",
        "Where stand I is that we should stop the project.",
      ]),
      spk("p2", "Where I stand is that we need a change."),
      // p3 — I feel strongly that
      sit("p3", "Of all the points in the debate, one really matters to you: free school meals. What do you say?", [
        "I feel strongly that school meals should be free.",
        "I feel strong that school meals should be free.",
        "I feel strongly to school meals should be free.",
      ]),
      la("p3", "I feel strongly that this is unfair.", ["strong"]),
      chat("p3", ["You seem very passionate about this topic.", null], [
        "Yes, I feel strongly about this one.",
        "Yes, I feel strongly about this ones.",
        "Yes, I feel strongly of this one.",
      ]),
      // karışık
      chat("mix", ["So, after all that, where do you stand?", null], [
        "I come down on the side of change, and I feel strongly that we should act now.",
        "I come down on the side of change, and I feel strong that we should act now.",
        "I come down on the side for change, and I feel strongly that we should act now.",
      ]),
      sit("mix", "At the end of a long debate about a new airport, you give a plain answer, and you add that this point really matters to you. What do you say?", [
        "Where I stand is that it's a mistake, and I feel strongly about it.",
        "Where I stand is that it's a mistake, and I feel strong about it.",
        "Where I stand are that it's a mistake, and I feel strongly about it.",
      ]),
    ],
    success: "The learner states a clear position and defends it.",
    quiz: [
      qmcq("Which phrase implies you weighed both sides?", [
        "I come down on the side of caution.",
        "I have always thought this.",
        "Everyone knows this already.",
      ], 0),
      qfill("Where I ___ is that we should wait. (stand)", ["stand"]),
      qmcq("Which phrase should be used sparingly?", [
        "I feel strongly that",
        "I think that",
        "It seems that",
      ], 0),
    ],
    scenes: [
      sc("Rahim", "a friend pressing for your view", "to get a straight answer",
        "A friend wants your real position, not a balanced summary.",
        "State and defend your position.",
        "Enough on the one hand and on the other. Where do you actually stand?", "direct"),
      sc("Elke", "a colleague in a decision meeting", "to hear a clear recommendation",
        "A meeting needs someone to commit to a view.",
        "State the position and defend it.",
        "Everyone is hedging. Should we launch the product now or wait?", "expectant"),
      sc("Georgios", "a fellow traveller in a real debate", "to have a genuine argument",
        "A genuine debate has started over dinner.",
        "Take a position and defend it.",
        "Nobody at this table will commit. Should cities ban cars from the centre?", "challenging"),
      sc("Mrs. Petrenko", "your teacher", "to practise taking positions",
        "The class is debating a contested topic.",
        "State and defend a position.",
        "Should homework be banned? Which side do you come down on?", "encouraging"),
      sc("Mr. Almeida", "the examiner", "to check position-taking",
        "The examiner asks for a committed view.",
        "Take a position and defend it.",
        "Should university education be free? Where do you stand?", "neutral"),
    ],
  },

  {
    id: "b2-scrolling-too-much",
    topic: "screen habits",
    objectives: [
      "Describe a habit you would like to change.",
      "Say what you are doing about it.",
    ],
    goal: "Talk honestly about your screen habits.",
    target: "discussing habits and change",
    correction: "Model the honest admission and let the learner describe their own habit.",
    summary: "You practised discussing a habit you would like to change.",
    minutes: 7,
    points: [
      {
        form: "I spend too much",
        claims: [
          "'I spend too much time on' admits the problem plainly.",
          "'Too much' already carries the judgement, so no extra criticism is needed.",
        ],
        ex: ["I spend too much time on my phone.", "I spend too much of the evening scrolling."],
      },
      {
        form: "can't help checking",
        claims: [
          "'I can't help doing' describes something you do without deciding to.",
          "It is followed by an -ing form, never by 'to'.",
        ],
        ex: ["I can't help checking it every few minutes.", "I can't help looking when it buzzes."],
      },
      {
        form: "cut down on",
        claims: [
          "'Cut down on' means reduce rather than stop completely.",
          "'Cut out' means stop entirely, which is a different claim.",
        ],
        ex: ["I'm trying to cut down on it.", "I've cut down on evening screen time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I spend too much time on
      chat("p1", ["Why are you always so tired?", null], [
        "I spend too much time on social media at night.",
        "I spend too many time on social media at night.",
        "I spend too much time at social media at night.",
      ]),
      sit("p1", "You admit a problem: you watch videos for hours every evening. What do you say?", [
        "I spend too much time watching videos.",
        "I spend too much time to watch videos.",
        "I spend too much times watching videos.",
      ]),
      spk("p1", "I spend too much of the evening scrolling."),
      // p2 — can't help -ing
      sit("p2", "Your phone buzzes during dinner. You don't want to look, but you always do. What do you say?", [
        "I can't help checking it.",
        "I can't help to check it.",
        "I can't help check it.",
      ]),
      lc("p2", "I can't help checking it every few minutes.", ["I can check it in a few minutes.", "Can you help me with it?"]),
      la("p2", "I can't help reading the news at night.", ["read"]),
      // p3 — cut down on
      sit("p3", "You don't want to stop using your phone completely. You just want to use it less. What do you say?", [
        "I'm trying to cut down on it.",
        "I'm trying to cut it out.",
        "I'm trying to cut down it.",
      ]),
      fc("p3", "I haven't stopped, but I've cut ___ on sugar.", ["down", "out", "off"]),
      chat("p3", ["Do you still play games every night?", null], [
        "Less than before. I've cut down on gaming.",
        "Less than before. I've cut out gaming.",
        "Less than before. I've cut down gaming on.",
      ]),
      // karışık
      chat("mix", ["Be honest: how much do you use your phone?", null], [
        "I spend too much time on it, so I'm trying to cut down.",
        "I spend too many time on it, so I'm trying to cut down.",
        "I spend too much time on it, so I'm trying to cut out down.",
      ]),
      sit("mix", "You check your phone without deciding to, and you want to use it less, not stop. What do you say?", [
        "I can't help checking it, so I'm cutting down on it.",
        "I can't help checking it, so I'm cutting it out.",
        "I can't help to check it, so I'm cutting down on it.",
      ]),
    ],
    success: "The learner describes a habit honestly and mentions an attempt to change it.",
    quiz: [
      qmcq("Which phrase means reduce rather than stop?", ["cut down on", "cut out", "give up"], 0),
      qfill("I can't help ___ when it buzzes. (look)", ["looking"]),
      qmcq("Which sentence admits the problem plainly?", [
        "I spend too much time on my phone.",
        "Everyone uses their phone a lot.",
        "Phones are designed to be addictive.",
      ], 0),
    ],
    scenes: [
      sc("Ana", "a friend with the same habit", "to compare habits honestly",
        "Two friends admit the same habit.",
        "Describe yours honestly.",
        "I checked my screen time this morning and nearly cried. How much time do you spend on your phone?", "rueful"),
      sc("Tomas", "a colleague discussing focus at work", "to work out how to concentrate better",
        "Concentration at work has become difficult.",
        "Describe the habit and any changes.",
        "Nobody in this office can focus any more. What distracts you most at work?", "frustrated"),
      sc("Pilar", "a host curious about your habits", "to compare habits across countries",
        "A conversation about daily life turns to phones.",
        "Describe your habits honestly.",
        "Are people glued to their phones where you come from too?", "curious"),
      sc("Mr. Adeyemi", "your teacher", "to practise discussing habits",
        "The class is discussing screen habits.",
        "Describe a habit and a change.",
        "How much time do you spend on your phone, honestly?", "encouraging"),
      sc("Ms. Novak", "the examiner", "to check extended discussion",
        "The examiner asks about modern habits.",
        "Discuss honestly and at length.",
        "Do you think people spend too much time on screens?", "neutral"),
    ],
  },

  {
    id: "b2-whats-for-dinner",
    topic: "food habits and cooking",
    objectives: [
      "Describe your general food habits.",
      "Compare cooking at home with eating out.",
    ],
    goal: "Talk at length about how you eat and cook.",
    target: "discussing food habits",
    correction: "Model the habit sentence and let the learner extend their own description.",
    summary: "You practised talking at length about food habits and cooking.",
    minutes: 7,
    points: [
      {
        form: "I tend to",
        claims: [
          "'I tend to' describes a general habit without claiming it is always true.",
          "It is softer and more accurate than 'I always'.",
        ],
        ex: ["I tend to cook at the weekend.", "I tend to eat late."],
      },
      {
        form: "eating out",
        claims: [
          "'Eating out' means eating in a restaurant; 'ordering in' means having it delivered.",
          "'Takeaway' is the British word for food collected or delivered.",
        ],
        ex: ["We only go out for special occasions.", "We eat out about once a month."],
      },
      {
        form: "cook from scratch",
        claims: [
          "'From scratch' means using raw ingredients rather than anything ready-made.",
          "'Ready meal' and 'convenience food' are the usual opposites.",
        ],
        ex: ["I cook from scratch most evenings.", "I rarely cook from scratch on weekdays."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I tend to
      chat("p1", ["When do you usually eat dinner?", null], [
        "I tend to eat around eight.",
        "I tend eating around eight.",
        "I tend to eating around eight.",
      ]),
      sit("p1", "You usually cook on Sundays, but not every Sunday. What do you say?", [
        "I tend to cook on Sundays.",
        "I always cook on Sundays.",
        "I tend cook on Sundays.",
      ]),
      spk("p1", "I tend to eat late on weekdays."),
      // p2 — eating out / ordering in / takeaway
      sit("p2", "You often go to restaurants with friends. What do you say?", [
        "We eat out quite often.",
        "We eat out of quite often.",
        "We eats out quite often.",
      ]),
      fc("p2", "We're too tired to cook tonight. Shall we order ___?", ["in", "on", "at"]),
      lc("p2", "Let's get a takeaway tonight.", ["Let's stay at home tonight.", "Let's go to bed early tonight."]),
      // p3 — from scratch
      sit("p3", "You make your own pasta sauce from fresh tomatoes, not from a jar. What do you say?", [
        "I make it from scratch.",
        "I make it from scrap.",
        "I make it with scratch.",
      ]),
      chat("p3", ["Do you buy ready meals?", null], [
        "No, I cook from scratch most evenings.",
        "No, I cook from scratches most evenings.",
        "No, I cook by scratch most evenings.",
      ]),
      la("p3", "I like cooking from scratch at the weekend.", ["scratches"]),
      // karışık
      chat("mix", ["What do you usually do for dinner?", null], [
        "I tend to cook from scratch, but we eat out on Fridays.",
        "I tend to cook from scratch, but we eat outs on Fridays.",
        "I tend cooking from scratch, but we eat out on Fridays.",
      ]),
      sit("mix", "During the week you usually have food delivered, because you're busy, but at the weekend you cook with fresh ingredients. What do you say?", [
        "I tend to order in during the week, but I cook from scratch at the weekend.",
        "I tend to order in during the week, but I cook from scrap at the weekend.",
        "I tend ordering in during the week, but I cook from scratch at the weekend.",
      ]),
    ],
    success: "The learner describes food habits at length using general tendencies.",
    quiz: [
      qmcq("Which phrase describes a general habit?", ["I tend to", "I always", "I never"], 0),
      qfill("I rarely cook from ___ on weekdays. (scratch)", ["scratch"]),
      qmcq("Which word is British for collected or delivered food?", ["takeaway", "takeout", "delivery"], 0),
    ],
    scenes: [
      sc("Camille", "a friend planning to cook for you", "to know what you eat",
        "A friend is cooking for you and wants to know your habits.",
        "Describe your food habits.",
        "I am cooking on Saturday. What do you actually eat?", "warm"),
      sc("Stefan", "a colleague organising a team meal", "to choose somewhere everyone will like",
        "A team meal must suit everyone.",
        "Describe your preferences and habits.",
        "I am booking somewhere for the team. What works for you?", "practical"),
      sc("Rosa", "a host cooking for guests", "to cook something you will enjoy",
        "A host is planning meals for your stay.",
        "Describe how you normally eat.",
        "I am shopping this afternoon. What do you usually have?", "hospitable"),
      sc("Mrs. Chen", "your teacher", "to practise extended description",
        "The class is discussing daily habits.",
        "Describe food habits at length.",
        "How do you usually eat during the week?", "encouraging"),
      sc("Mr. Ferreira", "the examiner", "to check extended everyday discussion",
        "The examiner asks about daily life.",
        "Describe habits at length.",
        "Could you tell me about how you eat and cook?", "neutral"),
    ],
  },

  {
    id: "b2-love-it-or-hate-it-tech",
    topic: "weighing what technology gives and takes",
    objectives: [
      "Say what you could not manage without.",
      "Say what you find genuinely annoying.",
    ],
    goal: "Give a balanced view of technology in your life.",
    target: "balanced discussion of technology",
    correction: "Model the strong-reaction sentence and let the learner weigh their own view.",
    summary: "You practised weighing what technology gives you against what it takes.",
    minutes: 7,
    points: [
      {
        form: "couldn't live without",
        claims: [
          "'I couldn't live without it' is a strong claim about dependence, not literal survival.",
          "Naming one specific thing is more convincing than a general statement.",
        ],
        ex: ["I couldn't live without maps on my phone.", "I couldn't live without messaging apps."],
      },
      {
        form: "drives me crazy",
        claims: [
          "'It drives me crazy' names a specific irritation strongly.",
          "'Drives me mad' is the more common British version.",
        ],
        ex: ["The notifications drive me crazy.", "Automatic updates drive me mad."],
      },
      {
        form: "best thing about",
        claims: [
          "'The best thing about it is' picks one advantage rather than listing several.",
          "'The worst thing about it is' does the same for disadvantages.",
        ],
        ex: ["The best thing about it is the convenience.", "The worst thing about it is the noise."],
      },
    ],
    ex: [],
    drills: [
      // p1 — couldn't live without
      chat("p1", ["Which app do you use most?", null], [
        "My maps app. I couldn't live without it.",
        "My maps app. I couldn't live without of it.",
        "My maps app. I couldn't living without it.",
      ]),
      sit("p1", "You use your headphones every day and would feel lost without them. What do you say?", [
        "I couldn't live without my headphones.",
        "I couldn't live with my headphones.",
        "I couldn't to live without my headphones.",
      ]),
      spk("p1", "I couldn't live without maps on my phone."),
      // p2 — drives me crazy / mad
      sit("p2", "Your laptop restarts every night to update, and it really annoys you. What do you say?", [
        "The updates drive me crazy.",
        "The updates drive me craze.",
        "The updates drive me to crazy.",
      ]),
      fc("p2", "Slow internet really drives me ___.", ["mad", "madly", "madness"]),
      lc("p2", "The notifications drive me crazy.", ["The notifications are very clear.", "I drive to work every day."]),
      // p3 — the best / worst thing about it is
      chat("p3", ["What do you like about your smartwatch?", null], [
        "The best thing about it is the battery life.",
        "The best thing of it is the battery life.",
        "The better thing about it is the battery life.",
      ]),
      sit("p3", "You like your new phone, but the camera is really bad. You name its main problem. What do you say?", [
        "The worst thing about it is the camera.",
        "The worst thing about it are the camera.",
        "The worse thing about it is the camera.",
      ]),
      la("p3", "The best thing about it is the price.", ["better"]),
      // karışık
      chat("mix", ["So, do you like your new tablet?", null], [
        "Yes. The best thing about it is the screen, but the ads drive me mad.",
        "Yes. The best thing about it is the screen, but the ads drives me mad.",
        "Yes. The best thing of it is the screen, but the ads drive me mad.",
      ]),
      sit("mix", "You use the maps on your phone every day and love them, but the battery dies quickly and that really annoys you. What do you say?", [
        "I couldn't live without the maps, but the battery drives me crazy.",
        "I couldn't live with the maps, but the battery drives me crazy.",
        "I couldn't live without the maps, but the battery drive me crazy.",
      ]),
    ],
    success: "The learner names both a specific dependence and a specific irritation.",
    quiz: [
      qmcq("Which sentence is a strong claim about dependence?", [
        "I couldn't live without messaging apps.",
        "I use messaging apps sometimes.",
        "Messaging apps exist.",
      ], 0),
      qfill("Automatic updates drive me ___. (mad)", ["mad", "crazy"]),
      qmcq("Which phrase picks one advantage?", [
        "The best thing about it is",
        "There are many good things",
        "It has various advantages",
      ], 0),
    ],
    scenes: [
      sc("Nikoletta", "a friend who dislikes technology", "to hear the other side",
        "A friend is sceptical about technology.",
        "Give a balanced view.",
        "I would throw my phone in a river. Am I mad?", "exasperated"),
      sc("Piotr", "a colleague discussing new tools", "to decide whether new tools help",
        "New tools have been introduced at work.",
        "Weigh what they give and take.",
        "Our office now has new software for everything. Is it actually helping anyone?", "sceptical"),
      sc("Hana", "a fellow traveller without a smartphone", "to compare how you each manage",
        "One traveller manages without a smartphone.",
        "Compare and weigh.",
        "I travel without a phone. Could you do that?", "curious"),
      sc("Mrs. Weber", "your teacher", "to practise balanced discussion",
        "The class is discussing technology.",
        "Weigh both sides.",
        "What could you not live without, and what drives you mad?", "encouraging"),
      sc("Mr. Ozturk", "the examiner", "to check balanced discussion",
        "The examiner asks about technology.",
        "Give a balanced view.",
        "Has technology improved daily life, in your view?", "neutral"),
    ],
  },

  {
    id: "b2-finding-common-ground",
    topic: "moving a disagreement towards agreement",
    objectives: [
      "Name what both sides already agree on.",
      "Isolate the real point of difference.",
    ],
    goal: "Move a disagreement towards something both sides can accept.",
    target: "finding common ground",
    correction: "Model the common-ground sentence and let the learner narrow the disagreement.",
    summary: "You practised moving a disagreement towards something both sides accept.",
    minutes: 7,
    points: [
      {
        form: "we both agree that",
        claims: [
          "Naming the agreement first makes the disagreement smaller than it looked.",
          "It also shows you have listened, which lowers the temperature.",
        ],
        ex: ["We both agree that something has to change.", "We both agree that the cost matters."],
      },
      {
        form: "where we differ",
        claims: [
          "'Where we differ is...' isolates the real disagreement precisely.",
          "Most disagreements are narrower than they appear once this is done.",
        ],
        ex: ["Where we differ is on the timing.", "Where we differ is on how fast we should move."],
      },
      {
        form: "can we settle on",
        claims: [
          "'Can we settle on...?' proposes a specific compromise.",
          "A concrete proposal moves a discussion further than a general appeal.",
        ],
        ex: ["Can we settle on a trial period?", "Can we settle on reviewing it in a month?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — we both agree that
      chat("p1", ["I still think the plan is too expensive.", null], [
        "Well, we both agree that something has to change.",
        "Well, we both agrees that something has to change.",
        "Well, we both are agree that something has to change.",
      ]),
      sit("p1", "You and your colleague disagree about the plan, but you both think the office needs more space. You start there. What do you say?", [
        "We both agree that the office needs more space.",
        "We both agree that the office need more space.",
        "We are both agree that the office needs more space.",
      ]),
      spk("p1", "We both agree that something has to change."),
      // p2 — where we differ is
      sit("p2", "You and your partner both want a holiday in Spain. The only disagreement is when to go. What do you say?", [
        "Where we differ is on the timing.",
        "Where we differ is on the place.",
        "Where we different is on the timing.",
      ]),
      fc("p2", "We agree on the goal. Where we ___ is the budget.", ["differ", "different", "difference"]),
      lc("p2", "Where we differ is on the details.", ["We need different details.", "Where did you find the details?"]),
      // p3 — can we settle on
      chat("p3", ["You want six months, and I want one month.", null], [
        "Can we settle on three months?",
        "Can we settled on three months?",
        "Can we settle in three months?",
      ]),
      sit("p3", "Your team can't agree on how often to meet. You suggest a specific compromise: every two weeks. What do you say?", [
        "Can we settle on meeting every two weeks?",
        "Can we settle on meet every two weeks?",
        "Can we settle to meeting every two weeks?",
      ]),
      la("p3", "Can we settle on a smaller budget?", ["settled"]),
      // karışık
      chat("mix", ["I want to start now, but you want to wait.", null], [
        "We both agree that we need it. Where we differ is the timing.",
        "We both agrees that we need it. Where we differ is the timing.",
        "We both agree that we need it. Where we different is the timing.",
      ]),
      sit("mix", "You both agree that the office is too noisy. You suggest one concrete solution: quiet mornings. What do you say?", [
        "We both agree that it's too noisy. Can we settle on quiet mornings?",
        "We both agree that it's too noisy. Can we settle in quiet mornings?",
        "We both agrees that it's too noisy. Can we settle on quiet mornings?",
      ]),
    ],
    success: "The learner names common ground and proposes a specific compromise.",
    quiz: [
      qmcq("Which sentence lowers the temperature?", [
        "We both agree that the cost matters.",
        "You never listen to anyone.",
        "This is a waste of time.",
      ], 0),
      qfill("Where we ___ is how fast to move. (differ)", ["differ"]),
      qmcq("Which sentence proposes a compromise?", [
        "Can we settle on a trial period?",
        "I refuse to change my mind.",
        "We will never agree on this.",
      ], 0),
    ],
    scenes: [
      sc("Marta", "a friend you keep arguing with", "to stop having the same argument",
        "The same disagreement keeps recurring.",
        "Find common ground and propose a compromise.",
        "We have argued three times about the holiday: you want the beach and I want the city. Can we not settle it?", "tired"),
      sc("Dimitri", "a colleague in a stuck negotiation", "to break a deadlock",
        "A negotiation has stalled.",
        "Name agreement and propose a compromise.",
        "You want a two-year contract and I want one year. We are going nowhere. What can we actually agree on?", "pragmatic"),
      sc("Yuki", "a travel companion disagreeing on plans", "to agree a plan you both accept",
        "Two travellers want different things from a trip.",
        "Find common ground.",
        "You want cities and I want mountains. What do we do?", "cooperative"),
      sc("Mrs. Larsson", "your teacher", "to practise finding common ground",
        "The class is resolving disagreements.",
        "Narrow the disagreement and propose a compromise.",
        "I want to spend the budget on computers, and you want new desks. What do we do?", "encouraging"),
      sc("Mr. Cabrera", "the examiner", "to check negotiation language",
        "The examiner disagrees with you deliberately.",
        "Find common ground and propose a compromise.",
        "I think exams should be abolished entirely. Can we find any agreement?", "neutral"),
    ],
  },

  {
    id: "b2-wrapping-up-a-discussion",
    topic: "closing a discussion cleanly",
    objectives: [
      "Summarise what was said.",
      "Close without forcing agreement.",
    ],
    goal: "End a long discussion cleanly, agreed or not.",
    target: "summarising and closing",
    correction: "Model the closing move and let the learner summarise their own discussion.",
    summary: "You practised summarising a discussion and closing it cleanly.",
    minutes: 7,
    points: [
      {
        form: "to sum up",
        claims: [
          "'To sum up' signals that you are about to condense, not add.",
          "Adding new points after it confuses the listener.",
        ],
        ex: ["To sum up, we agree on the problem.", "To sum up, nothing is decided yet."],
      },
      {
        form: "so where does that leave",
        claims: [
          "'So where does that leave us?' invites the other person to help close.",
          "It is a question, so it hands the turn over rather than ending alone.",
        ],
        ex: ["So where does that leave us?", "So where does that leave the plan?"],
      },
      {
        form: "let's leave it there",
        claims: [
          "'Let's leave it there' closes without forcing agreement.",
          "'For now' softens it further and keeps the subject open.",
        ],
        ex: ["Let's leave it there for now.", "Shall we leave it there?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — to sum up
      sit("p1", "After a long discussion, you want to condense the main points without adding new ones. How do you start?", [
        "To sum up, we agree on the problem but not the solution.",
        "To summing up, we agree on the problem but not the solution.",
        "For sum up, we agree on the problem but not the solution.",
      ]),
      chat("p1", ["We've talked about a lot today.", null], [
        "Yes. To sum up, we need more time and more money.",
        "Yes. To sum down, we need more time and more money.",
        "Yes. To sums up, we need more time and more money.",
      ]),
      spk("p1", "To sum up, nothing is decided yet."),
      // p2 — so where does that leave
      chat("p2", ["So we can't afford the new office, and we can't stay here.", null], [
        "So where does that leave the plan?",
        "So where does that leaves the plan?",
        "So where that does leave the plan?",
      ]),
      lc("p2", "So where does that leave the project?", ["So when does the project start?", "Who is leading the project?"]),
      sit("p2", "The discussion has reached a difficult point. You want the others to help decide the next step, so you ask a question. What do you say?", [
        "So where does that leave us now?",
        "So where do that leave us now?",
        "So where does that left us now?",
      ]),
      // p3 — let's leave it there
      sit("p3", "The meeting is running late and you can't agree. You want to stop without forcing a decision, and keep the topic open. What do you say?", [
        "Let's leave it there for today.",
        "Let's leaving it there for today.",
        "Let leave it there for today.",
      ]),
      la("p3", "Shall we leave it there for today?", ["leaving"]),
      chat("p3", ["We've been going round in circles for an hour.", null], [
        "You're right. Shall we leave it there?",
        "You're right. Shall we leaving it there?",
        "You're right. Shall we leave there it?",
      ]),
      // karışık
      chat("mix", ["Is there anything else, or are we done?", null], [
        "To sum up, we agree on the budget. Let's leave it there for today.",
        "To sum up, we agree on the budget. Let's leaving it there for today.",
        "To summing up, we agree on the budget. Let's leave it there for today.",
      ]),
      sit("mix", "At the end of a meeting, you condense the main point, then ask the others what happens next. What do you say?", [
        "To sum up, the cost is too high. So where does that leave us?",
        "To sum up, the cost is too high. So where does that leaves us?",
        "To sums up, the cost is too high. So where does that leave us?",
      ]),
    ],
    success: "The learner summarises the discussion and closes it cleanly.",
    quiz: [
      qmcq("Which phrase signals a summary?", ["To sum up,", "In addition,", "Furthermore,"], 0),
      qfill("So where does that ___ us? (leave)", ["leave"]),
      qmcq("Which sentence closes without forcing agreement?", [
        "Let's leave it there for now.",
        "So you agree with me then.",
        "That settles it completely.",
      ], 0),
    ],
    scenes: [
      sc("Barbara", "a friend after a long conversation", "to end the conversation well",
        "A long conversation has run its course.",
        "Summarise and close.",
        "We have talked for an hour about moving to the coast. We love the idea, but the cost worries us. Where have we got to?", "tired"),
      sc("Ivan", "a colleague chairing a meeting", "to close a meeting cleanly",
        "A meeting must end without a decision.",
        "Summarise and close.",
        "We agree the cost is too high, but not what to cut, and we are out of time. Can you pull it together for us?", "brisk"),
      sc("Zainab", "someone you met at a debate", "to end a debate on good terms",
        "A debate has been enjoyable but must end.",
        "Summarise and close warmly.",
        "We both think the city needs more trees, but we disagree about who should pay. Shall we call it?", "warm"),
      sc("Mr. Steiner", "your teacher", "to practise closing discussions",
        "The class is ending a long debate.",
        "Summarise and close.",
        "We discussed homework: you think it helps, and I think there is too much. We are nearly out of time. How would you wrap this up?", "encouraging"),
      sc("Ms. Coelho", "the examiner", "to check summarising and closing",
        "The examiner ends a long discussion.",
        "Summarise and close cleanly.",
        "We discussed online learning: it is cheap and flexible, but some students feel lonely. How would you sum it all up?", "neutral"),
    ],
  },
];
