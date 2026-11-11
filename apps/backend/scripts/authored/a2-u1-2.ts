/** A2 · Ünite 1-2 — Telling Stories · Plans and Predictions (15 ders, elle yazıldı).
 *
 *  A1'de geçmiş tek cümleydi ("I went, I saw"); burada ANLATIYA dönüşüyor: arka
 *  plandaki uzun eylem (past continuous) ile onu kesen kısa eylem (past simple)
 *  birlikte çalışıyor, sonra olaylar sıraya diziliyor. Ünite 2 aynı hareketi
 *  geleceğe uyguluyor: karar (going to), tahmin (will), anlık teklif (I'll) ve
 *  takvime yazılmış randevu (present continuous) — dördü ayrı ayrı öğretiliyor,
 *  çünkü A2'de en sık karışan yer burası.
 *
 *  Gramer derslerinde 4 alıştırma, phrases/practice'te 3 (kullanıcı kararı).
 */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const A2_U1_2: Authored[] = [
  // --- Ünite 1 · Telling Stories ---------------------------------------------
  {
    id: "a2-while-i-was-waiting",
    topic: "saying what was happening at a moment in the past",
    objectives: [
      "Say what was happening at a particular moment in the past.",
      "Make negative sentences with wasn't and weren't.",
    ],
    goal: "Describe what was going on around you at a moment in the past.",
    target: "past continuous: affirmative and negative",
    correction: "Say the full past continuous sentence and let the learner repeat it.",
    summary: "You learned to use was and were with an -ing verb to say what was happening.",
    minutes: 8,
    points: [
      {
        form: "was / were + -ing",
        claims: [
          "Use 'was' with I, he, she and it, and 'were' with you, we and they.",
          "Add -ing to the verb: this says the action was in the middle of happening.",
        ],
        ex: [
          "I was waiting outside the building.",
          "We were talking about the film.",
          "They were working late last night.",
        ],
      },
      {
        form: "wasn't / weren't",
        claims: [
          "For the negative, put 'not' after was or were: wasn't, weren't.",
          "The verb keeps -ing and never changes.",
        ],
        ex: ["The lift wasn't working yesterday.", "We weren't listening to the radio."],
      },
      {
        form: "at that moment",
        claims: [
          "A past time can identify a moment or a period: at seven o'clock, at that moment, all evening.",
          "The time expression can come at the start or at the end of the sentence.",
        ],
        ex: ["At seven o'clock I was cooking dinner.", "She was studying all evening."],
      },
    ],
    ex: [],
    drills: [
      // p1 — was / were + -ing
      fc("p1", "We ___ talking about the film when you arrived.", ["were", "was", "are"]),
      fc("p1", "At eight o'clock last night she ___ cooking dinner.", ["was", "were", "is"]),
      sit("p1", "Yesterday at nine p.m. you were in the middle of watching a film. What do you say?", [
        "At nine I was watching a film.",
        "At nine I were watching a film.",
        "At nine I was watch a film.",
      ]),
      spk("p1", "I was waiting outside the building."),
      // p2 — wasn't / weren't
      fc("p2", "The lift ___ working yesterday, so we took the stairs.", ["wasn't", "weren't", "didn't"]),
      fc("p2", "We weren't ___ to the radio.", ["listening", "listen", "listened"]),
      la("p2", "It wasn't working this morning.", ["weren't"]),
      // p3 — at that moment / all evening
      arr("p3", "She was studying all evening.", ["were"]),
      chat("p3", ["The lights went out at ten last night.", null], [
        "Really? At that moment I was reading in bed.",
        "Really? At that moment I were reading in bed.",
        "Really? At that moment I was read in bed.",
      ]),
      lc("p3", "At seven o'clock I was cooking dinner.", [
        "At eleven o'clock I was cooking dinner.",
        "At seven o'clock I was cleaning the kitchen.",
      ]),
      // karışık
      sit("mix", "Last night at ten your brother was working, but your sister was not. What do you say?", [
        "My brother was working, but my sister wasn't.",
        "My brother were working, but my sister wasn't.",
        "My brother was working, but my sister weren't.",
      ]),
      spk("mix", "At midnight we weren't sleeping, but we were talking."),
    ],
    success: "The learner uses both I was and we were with an -ing verb to describe what was happening.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We were talking about you.",
        "We was talking about you.",
        "We were talk about you.",
      ], 0),
      qfill("I ___ waiting for the bus when you called. (be)", ["was"]),
      qmcq("Which sentence is correct?", [
        "The heating wasn't working.",
        "The heating weren't working.",
        "The heating didn't working.",
      ], 0),
    ],
    scenes: [
      sc("Ana", "a neighbour from the flat downstairs", "to find out what happened during the power cut",
        "The lights went out in the whole building last night and everyone is talking about it.",
        "Say what you were doing when the power went off.",
        "The lights went off at nine last night. What were you doing then?", "chatty"),
      sc("Tomas", "a colleague who was out of the office", "to hear what the team was doing when the power failed",
        "The office lost power for an hour yesterday afternoon.",
        "Describe what you and the team were doing at that time.",
        "The lights went off at the office yesterday. What were you doing?", "amused"),
      sc("Pilar", "the hotel receptionist", "to apologise and hear how the guests were affected",
        "The hotel had no electricity for two hours last night.",
        "Explain what you were doing in your room at the time.",
        "Sorry about the noise at eleven last night. Were you sleeping then?", "apologetic"),
      sc("Mr. Adeyemi", "your teacher", "to practise describing actions in progress",
        "The class is describing where they were during a storm last week.",
        "Describe what you were doing during the storm.",
        "Last Tuesday there was a big storm at six in the evening. What were you doing then?", "warm"),
      sc("Ms. Novak", "the examiner", "to check that you can describe a past moment",
        "The examiner asks about an ordinary evening in your week.",
        "Describe what was happening around you at that time.",
        "Could you tell me what you were doing at this time yesterday?", "neutral"),
    ],
  },

  {
    id: "a2-what-were-you-doing",
    topic: "asking what someone was doing",
    objectives: [
      "Ask questions about what someone was doing in the past.",
      "Give short answers with was and were.",
    ],
    goal: "Ask people where they were and what they were doing at a past moment.",
    target: "past continuous questions and short answers",
    correction: "Repeat the question in the correct word order and invite the learner to ask it again.",
    summary: "You learned to ask questions with was and were and to answer them shortly.",
    minutes: 8,
    points: [
      {
        form: "were you + -ing?",
        claims: [
          "To ask a question, put was or were before the person.",
          "The verb still takes -ing and 'did' is never used here.",
        ],
        ex: ["Were you working late yesterday?", "Was she waiting outside?"],
      },
      {
        form: "what were you doing?",
        claims: [
          "Question words come first: what, where, who, why.",
          "The order is question word, then was or were, then the person.",
        ],
        ex: ["What were you doing at ten o'clock?", "Where were you sitting?"],
      },
      {
        form: "short answers and 'just'",
        claims: [
          "Answer with was or were, not with did: Yes, I was. No, we weren't.",
          "Add 'just' when the action was small or ordinary.",
        ],
        ex: ["Yes, I was.", "No, we weren't.", "I was just reading."],
      },
    ],
    ex: [],
    drills: [
      // p1 — Were you + -ing?
      fc("p1", "___ you working late yesterday?", ["Were", "Did", "Was"]),
      arr("p1", "Was she waiting outside?", ["Did"]),
      sit("p1", "You want to know if your friend was driving when you called. What do you ask?", [
        "Were you driving when I called?",
        "Did you driving when I called?",
        "Was you driving when I called?",
      ]),
      lc("p1", "Were they working on Sunday?", ["Was he working on Sunday?", "Were they working on Monday?"]),
      // p2 — What were you doing?
      fc("p2", "What ___ you doing at ten o'clock?", ["were", "did", "was"]),
      chat("p2", ["I'm sorry, I didn't answer your call at eight.", null, "I was having a shower!"], [
        "No problem! What were you doing?",
        "No problem! What did you doing?",
        "No problem! What you were doing?",
      ]),
      arr("p2", "Where were you sitting?", ["did"]),
      // p3 — kısa cevap + just
      chat("p3", ["Were you sleeping when I called?", null], [
        "No, I wasn't. I was just reading.",
        "No, I didn't. I was just reading.",
        "No, I wasn't. I was just read.",
      ]),
      pairs("p3", [
        ["Were you working?", "Yes, I was."],
        ["Was she waiting?", "No, she wasn't."],
        ["Were they talking?", "Yes, they were."],
      ]),
      spk("p3", "I was just reading a book."),
      // karışık
      sit("mix", "Your friend asks: 'What were you doing at six?' You were cooking, nothing special. What do you say?", [
        "I was just cooking dinner.",
        "I did just cooking dinner.",
        "I was just cook dinner.",
      ]),
      la("mix", "What were you doing when I called?", ["did"]),
    ],
    success: "The learner asks three correct past continuous questions.",
    quiz: [
      qmcq("Which question is correct?", [
        "Were you sleeping when I rang?",
        "Was you sleeping when I rang?",
        "Did you sleeping when I rang?",
      ], 0),
      qfill("___ she waiting for us? (be)", ["Was"]),
      qmcq("Which answer is correct?", ["No, I wasn't.", "No, I didn't.", "No, I not was."], 0),
    ],
    scenes: [
      sc("Ruben", "a friend who could not reach you", "to find out why you did not answer the phone",
        "A friend called you three times last night and you never picked up.",
        "Ask your friend what they were doing too, and explain yourself.",
        "I called you three times last night! What were you doing?", "teasing"),
      sc("Dana", "a colleague planning the team report", "to find out who was working on what yesterday",
        "The team is reconstructing what everyone did during a busy afternoon.",
        "Ask your colleague questions about the afternoon.",
        "Nobody wrote the report yesterday. What were you working on?", "practical"),
      sc("Kwame", "a tour guide", "to find out how the group spent the free afternoon",
        "The group had a free afternoon in the city and is meeting again in the evening.",
        "Ask the others about their afternoon.",
        "Everyone was gone for four hours this afternoon! What were you doing?", "cheerful"),
      sc("Mrs. Halvorsen", "your teacher", "to practise forming questions about the past",
        "The class is interviewing each other about last weekend.",
        "Interview your partner about Saturday evening.",
        "Ask me about my Saturday evening. What do you want to know?", "encouraging"),
      sc("Mr. Laurent", "the examiner", "to check that you can ask questions correctly",
        "The examiner asks you to interview them about their week.",
        "Ask questions about what the examiner was doing.",
        "Now you ask me about last night. What do you want to know?", "neutral"),
    ],
  },

  {
    id: "a2-it-happened-while",
    topic: "a long action interrupted by a short one",
    objectives: [
      "Put a long past action and a short past action in one sentence.",
      "Use when before the short action and while before the long one.",
    ],
    goal: "Tell someone about a moment when something interrupted what you were doing.",
    target: "past simple and past continuous together, with when and while",
    correction: "Repeat the sentence with the two verbs in the right tenses and invite the learner to try again.",
    summary: "You learned to combine was doing and did in one sentence with when and while.",
    minutes: 8,
    points: [
      {
        form: "while I was ... , ... happened",
        claims: [
          "The long action in the background takes was or were plus -ing.",
          "The short action that cuts into it takes the past simple.",
        ],
        ex: ["While I was cooking, the phone rang.", "I was reading when the lights went out."],
      },
      {
        form: "when and while",
        claims: [
          "'While' usually introduces the longer background action.",
          "'When' often introduces the shorter event, but it can also introduce a background action.",
          "Use a comma when the time clause comes before the main clause.",
        ],
        ex: ["When it happened, I was standing in the kitchen.", "While we were talking, she arrived."],
      },
      {
        form: "suddenly I heard",
        claims: [
          "Words like suddenly and all of a sudden introduce the surprising short action.",
          "They usually come at the start of the clause.",
        ],
        ex: ["Suddenly I heard a loud noise.", "All of a sudden the door opened."],
      },
    ],
    ex: [],
    drills: [
      // p1 — uzun arka plan + kısa olay
      fc("p1", "While I was cooking, the phone ___.", ["rang", "ring", "rings"]),
      fc("p1", "I ___ reading when the lights went out.", ["was", "did", "am"]),
      sit("p1", "You were in the middle of a shower. The doorbell rang. What do you say?", [
        "I was having a shower when the doorbell rang.",
        "I was have a shower when the doorbell rang.",
        "I was having a shower when the doorbell ring.",
      ]),
      lc("p1", "While we were walking, it started to snow.", [
        "While we were waiting, it started to snow.",
        "While we were walking, it started to rain.",
      ]),
      // p2 — when / while
      fc("p2", "___ we were talking, she arrived.", ["While", "During", "For"]),
      chat("p2", ["Where were you when it happened?", null], [
        "I was standing in the kitchen.",
        "I were standing in the kitchen.",
        "I was stand in the kitchen.",
      ]),
      la("p2", "When it happened, I was standing in the kitchen.", ["were"]),
      // p3 — suddenly
      fc("p3", "I was sleeping. ___ I heard a loud noise.", ["Suddenly", "Sudden", "While"]),
      spk("p3", "Suddenly I heard a loud noise."),
      lc("p3", "All of a sudden the door opened.", ["All of a sudden the door closed.", "All of a sudden the window opened."]),
      // karışık
      chat("mix", ["What happened on your way home?", null], [
        "I was walking home when suddenly it started to rain.",
        "I was walk home when suddenly it started to rain.",
        "I was walking home when suddenly it start to rain.",
      ]),
      sit("mix", "You were reading. In the middle of it, your friend called. What do you say?", [
        "While I was reading, my friend called.",
        "While I was reading, my friend call.",
        "While I were reading, my friend called.",
      ]),
    ],
    success: "The learner combines past continuous and past simple correctly with both while and when.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "While we were eating, the lights went out.",
        "While we were eat, the lights went out.",
        "While we was eating, the lights went out.",
      ], 0),
      qfill("I ___ sleeping when the alarm rang. (be)", ["was"]),
      qmcq("Which sentence is correct?", [
        "I was reading when the phone rang.",
        "I was reading while the phone rang.",
        "I read when the phone was ringing.",
      ], 0),
    ],
    scenes: [
      sc("Sofia", "a friend you meet for coffee", "to hear the story of your strange morning",
        "Something unexpected happened to you this morning and your friend wants the details.",
        "Tell the story of the interruption from beginning to end.",
        "You said you had a very difficult morning. What happened?", "curious"),
      sc("Marek", "your manager", "to understand how the meeting was interrupted",
        "Yesterday's meeting stopped halfway through and your manager was not there.",
        "Explain what people were doing and what interrupted them.",
        "The meeting stopped early yesterday. What were you doing when it happened?", "calm"),
      sc("Ines", "a fellow traveller at the airport", "to swap stories about delayed journeys",
        "Two travellers are waiting at the gate and comparing bad journeys.",
        "Tell the story of a journey that was interrupted.",
        "My flight was cancelled while I was waiting at the gate. What happened on your last trip?", "sympathetic"),
      sc("Dr. Bello", "your teacher", "to practise combining two past tenses",
        "The class is telling short stories about unexpected moments.",
        "Tell a short story with a long action and a short one.",
        "Everyone has one story about being interrupted. What is yours?", "warm"),
      sc("Ms. Fischer", "the examiner", "to check that you can combine the two past tenses",
        "The examiner asks for a short story about an unexpected event.",
        "Tell the story clearly, using both past tenses.",
        "Tell me about a time when something surprising happened. What were you doing?", "neutral"),
    ],
  },

  {
    id: "a2-ago-last-yesterday",
    topic: "saying when something happened in the past",
    objectives: [
      "Say how long ago something happened.",
      "Use last and yesterday without extra words.",
    ],
    goal: "Place a past event in time so the other person knows when it was.",
    target: "past time expressions: ago, last, yesterday",
    correction: "Repeat the whole time expression inside a full sentence and let the learner say it again.",
    summary: "You learned to place a past event in time with ago, last and yesterday.",
    minutes: 7,
    points: [
      {
        form: "... ago",
        claims: [
          "Count back from now and put 'ago' at the end: two years ago, ten minutes ago.",
          "'Ago' always follows the length of time, never comes before it.",
        ],
        ex: ["I moved here two years ago.", "She called me ten minutes ago."],
      },
      {
        form: "last week / yesterday",
        claims: [
          "Use 'last' for the nearest past week, month, summer or year.",
          "Do not put 'in', 'on' or 'at' before last or yesterday: last summer, not in last summer.",
        ],
        ex: ["We met last summer.", "Last week I started a new course.", "I saw him yesterday."],
      },
      {
        form: "about a month ago",
        claims: [
          "Add 'about' or 'around' when you are not sure of the exact time.",
          "This is very common in conversation and sounds more natural than an exact date.",
        ],
        ex: ["I saw him about a month ago.", "It happened around ten years ago."],
      },
    ],
    ex: [],
    drills: [
      // p1 — ... ago
      fc("p1", "She called me ten minutes ___.", ["ago", "last", "past"]),
      arr("p1", "I moved here two years ago.", ["last"]),
      lc("p1", "We met five years ago.", ["We met nine years ago.", "We moved five years ago."]),
      // p2 — last / yesterday
      fc("p2", "I started a new course ___ week.", ["last", "in last", "on last"]),
      sit("p2", "You saw your friend one day before today. What do you say?", [
        "I saw him yesterday.",
        "I saw him on yesterday.",
        "I saw him the yesterday.",
      ]),
      chat("p2", ["When did you start this job?", null], ["Last year, in March.", "In last year, in March.", "On last year, in March."]),
      // p3 — about / around
      fc("p3", "It happened ___ ten years ago. I'm not sure exactly.", ["about", "for", "since"]),
      spk("p3", "I saw him about a month ago."),
      la("p3", "It happened around ten years ago.", ["last"]),
      // karışık
      chat("mix", ["When did you last see your cousin?", null], [
        "I saw her last summer, and she called me about two months ago.",
        "I saw her in last summer, and she called me about two months ago.",
        "I saw her last summer, and she called me about ago two months.",
      ]),
      sit("mix", "You are not sure of the exact time. You started learning English three years before now. What do you say?", [
        "I started about three years ago.",
        "I started about ago three years.",
        "I started about three years last.",
      ]),
    ],
    success: "The learner uses at least two different past time expressions correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "He left ten minutes ago.",
        "He left ago ten minutes.",
        "He left before ten minutes.",
      ], 0),
      qfill("We went there ___ summer.", ["last"]),
      qmcq("Which sentence is correct?", [
        "I finished school about five years ago.",
        "I finished school about five years before.",
        "I finished school since five years.",
      ], 0),
    ],
    scenes: [
      sc("Leila", "a neighbour you rarely see", "to catch up on what you have both been doing",
        "Two neighbours meet in the hallway after a long time.",
        "Say when the things in your life happened.",
        "I never see you! When did you move into this building?", "friendly"),
      sc("Oscar", "a new colleague", "to learn how long people have been at the company",
        "A new colleague is getting to know the team over lunch.",
        "Say when you joined and when things changed.",
        "When did you start working here?", "open"),
      sc("Nadia", "someone you meet at a hostel", "to swap travel histories",
        "Two travellers compare the trips they have taken.",
        "Say when you went to each place.",
        "You travel a lot! When was your last big trip?", "relaxed"),
      sc("Mr. Okonjo", "your teacher", "to practise past time expressions",
        "The class is making a timeline of important moments.",
        "Say when three things in your life happened.",
        "Tell me about an important day in your life. When was it?", "warm"),
      sc("Mrs. Sandoval", "the examiner", "to check that you can place events in time",
        "The examiner asks about recent changes in your life.",
        "Say clearly when each thing happened.",
        "Tell me about a big change in your life. When did it happen?", "neutral"),
    ],
  },

  {
    id: "a2-first-then-after-that",
    topic: "putting the events of a story in order",
    objectives: [
      "Open a story and move it forward step by step.",
      "Close a story with the result.",
    ],
    goal: "Tell a short story so the listener can follow the order of events.",
    target: "sequencing expressions: first of all, after that, in the end",
    correction: "Repeat the sentence with the sequencing expression at the front and let the learner continue.",
    summary: "You learned to order the events of a story from the first moment to the result.",
    minutes: 7,
    points: [
      {
        form: "first of all / to start with",
        claims: [
          "Open the story with the first event so the listener knows where it begins. You can also simply say 'First': First we got lost.",
          "These expressions usually come at the start of the sentence, followed by a comma.",
        ],
        ex: ["First of all, we missed the train.", "To start with, nobody answered the door."],
      },
      {
        form: "then / after that / a bit later",
        claims: [
          "Move the story forward one step at a time with then, after that or a bit later.",
          "'After that' looks back at the event you have just told.",
        ],
        ex: ["Then we waited for an hour.", "After that, the rain started."],
      },
      {
        form: "in the end / finally",
        claims: [
          "Close the story with the result using in the end or finally.",
          "'In the end' means after everything that happened, this was the result.",
        ],
        ex: ["In the end we took a taxi.", "Finally, everything was fine."],
      },
    ],
    ex: [],
    drills: [
      // p1 — first of all / to start with
      fc("p1", "___ of all, we missed the train.", ["First", "At first", "Firstly"]),
      sit("p1", "You are starting a story about a bad day. What do you say first?", [
        "To start with, nobody answered the door.",
        "In the end, nobody answered the door.",
        "After that, nobody answered the door.",
      ]),
      lc("p1", "First of all, we lost our tickets.", ["First of all, we lost our keys.", "In the end, we lost our tickets."]),
      // p2 — then / after that / a bit later
      fc("p2", "We waited for an hour. ___ that, the rain started.", ["After", "Then", "Later"]),
      spk("p2", "After that, the rain started."),
      chat("p2", ["So you missed the train. What happened next?", null], [
        "After that, a friend picked us up.",
        "After that, a friend pick us up.",
        "After that, a friend picking us up.",
      ]),
      // p3 — in the end / finally
      fc("p3", "We tried everything. ___, we took a taxi.", ["In the end", "In end", "On the end"]),
      la("p3", "Finally, everything was fine.", ["final"]),
      sit("p3", "Your story is finished and the trip was good. What do you say?", [
        "In the end, the trip was great.",
        "In the end, the trip is great.",
        "On the end, the trip was great.",
      ]),
      // karışık
      chat("mix", ["How was your journey?", null], [
        "First of all, the bus was late. In the end, we arrived at ten.",
        "First of all, the bus was late. In end, we arrived at ten.",
        "First all, the bus was late. In the end, we arrived at ten.",
      ]),
      la("mix", "First we got lost, but in the end we arrived.", ["at"]),
    ],
    success: "The learner tells an ordered story using first of all, after that and in the end correctly.",
    quiz: [
      qmcq("Which expression starts a story?", ["First of all", "In the end", "Finally"], 0),
      qfill("___ that, we went home.", ["After"]),
      qmcq("Which sentence is correct?", [
        "In the end, we found the keys.",
        "In the end, we finding the keys.",
        "In end, we found the keys.",
      ], 0),
    ],
    scenes: [
      sc("Bruno", "a friend who was not there", "to hear the whole story in order",
        "You had a small disaster on the way home and your friend wants the full story.",
        "Tell the story from the first moment to the result.",
        "Tell me the story of last night. How did it start?", "eager"),
      sc("Hana", "a colleague writing an incident note", "to record the events in the right order",
        "Something went wrong with a delivery and someone has to write it down clearly.",
        "Describe what happened, step by step.",
        "Tell me about the problem at work yesterday. What happened first?", "focused"),
      sc("Diego", "a fellow guest at breakfast", "to hear about your difficult journey",
        "Your journey to the hotel took much longer than planned.",
        "Tell the story of the journey in order.",
        "You arrived very late last night. What happened?", "sympathetic"),
      sc("Ms. Grant", "your teacher", "to practise ordering events",
        "The class is retelling short everyday stories.",
        "Retell a small everyday disaster in order.",
        "Tell us about a bad day. How did it start?", "encouraging"),
      sc("Mr. Yilmaz", "the examiner", "to check that you can order events clearly",
        "The examiner asks for a short story about a difficult day.",
        "Tell the story with a clear beginning, middle and end.",
        "Tell me about a day when things went wrong. What happened first?", "neutral"),
    ],
  },

  {
    id: "a2-my-best-holiday",
    topic: "telling the story of a past trip",
    objectives: [
      "Say where you went and where you stayed.",
      "Give your feeling about a trip and the moment you remember most.",
    ],
    goal: "Tell someone the story of the best trip you have taken.",
    target: "telling the full story of a past trip",
    correction: "Model the sentence about the trip in the past and let the learner carry on with the story.",
    summary: "You practised telling the whole story of a trip: where, where you stayed and how it felt.",
    minutes: 7,
    points: [
      {
        form: "we went to / we stayed in",
        claims: [
          "Say the place first and then where you stayed.",
          "Both verbs are in the past simple because the trip is finished.",
        ],
        ex: ["We went to the mountains last spring.", "We stayed in a small hotel near the beach."],
      },
      {
        form: "it was amazing",
        claims: [
          "Give your feeling with 'it was' and a strong adjective: amazing, awful, unforgettable.",
          "You can add 'but' to give the other side of the story.",
        ],
        ex: ["The food was amazing.", "The weather was awful, but we had a great time."],
      },
      {
        form: "I'll never forget",
        claims: [
          "Use 'I'll never forget' to introduce a moment or experience that you still remember clearly.",
          "It can be followed by a noun or by a verb ending in -ing.",
        ],
        ex: ["I'll never forget that evening.", "I'll never forget watching the sunrise."],
      },
    ],
    ex: [],
    drills: [
      // p1 — we went to / we stayed in
      fc("p1", "Last summer we ___ in a small hotel near the beach.", ["stayed", "stay", "were stay"]),
      arr("p1", "We went to the mountains last spring.", ["go"]),
      lc("p1", "We stayed in a small flat by the sea.", ["We stayed in a big flat by the sea.", "We stayed in a small hotel by the sea."]),
      // p2 — it was amazing
      fc("p2", "On our holiday last year, the food ___ amazing.", ["was", "were", "is"]),
      sit("p2", "The weather on your trip was bad, but you were happy. What do you say?", [
        "The weather was awful, but we had a great time.",
        "The weather was awful, but we have a great time.",
        "The weather were awful, but we had a great time.",
      ]),
      spk("p2", "It was amazing."),
      // p3 — I'll never forget
      fc("p3", "I'll never forget ___ the sunrise.", ["watching", "watch", "to watching"]),
      chat("p3", ["What was the best moment?", null], [
        "I'll never forget that evening.",
        "I'll never forgetting that evening.",
        "I'll never forgot that evening.",
      ]),
      la("p3", "I'll never forget that beautiful beach.", ["forgot"]),
      // karışık
      chat("mix", ["How was your holiday?", null], [
        "We stayed in a small hotel and it was amazing.",
        "We stay in a small hotel and it was amazing.",
        "We stayed in a small hotel and it were amazing.",
      ]),
      spk("mix", "We went to the coast, and I'll never forget it."),
    ],
    success: "The learner tells the story of a trip with a place, a stay and a personal reaction.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We stayed in a small hotel.",
        "We stay in a small hotel last year.",
        "We were stay in a small hotel.",
      ], 0),
      qfill("It ___ amazing. (be)", ["was"]),
      qmcq("Which sentence is correct?", [
        "I'll never forget that evening.",
        "I'll never forgetting that evening.",
        "I'll never forgot that evening.",
      ], 0),
    ],
    scenes: [
      sc("Marta", "a friend planning her own holiday", "to get ideas from your best trip",
        "A friend is deciding where to go this year and wants to hear about your favourite trip.",
        "Tell the story of your best trip.",
        "I need ideas for my holiday. What was your best trip?", "excited"),
      sc("Peter", "a colleague back from leave", "to swap holiday stories after the summer",
        "Two colleagues are catching up on the first morning back at work.",
        "Tell your holiday story and ask about theirs.",
        "Welcome back! How was your holiday?", "relaxed"),
      sc("Aiko", "a guest at the same hotel", "to compare travel experiences",
        "Two travellers are talking on the hotel terrace in the evening.",
        "Describe the best trip you have taken.",
        "Where did you go on your best holiday?", "warm"),
      sc("Mr. Duarte", "your teacher", "to practise telling a longer story",
        "The class is presenting a favourite memory.",
        "Tell the class about your best trip.",
        "Today everyone shares one good memory. What is your best trip?", "encouraging"),
      sc("Ms. Bright", "the examiner", "to check that you can tell an extended story",
        "The examiner asks about a memorable journey.",
        "Describe the trip fully, with a beginning and an end.",
        "Could you tell me about a trip that you remember well?", "neutral"),
    ],
  },

  {
    id: "a2-two-photos-one-story",
    topic: "describing two photos and the story between them",
    objectives: [
      "Introduce a picture before describing it.",
      "Link two moments in time with a background action.",
    ],
    goal: "Describe two pictures from the same day and tell the story between them.",
    target: "comparing two photos and telling the story behind them",
    correction: "Model the sentence that introduces the picture and let the learner describe it again.",
    summary: "You practised describing two pictures and linking them into one story.",
    minutes: 7,
    points: [
      {
        form: "in the first photo",
        claims: [
          "Introduce each picture before you describe what is in it.",
          "Use 'the second one' instead of repeating the word photo.",
        ],
        ex: [
          "In the first photo, we are standing outside a station.",
          "In the second one, everybody is laughing.",
        ],
      },
      {
        form: "while we were",
        claims: [
          "Say what was happening around the moment the picture was taken.",
          "This uses was or were with an -ing verb, because the action was in progress.",
        ],
        ex: ["While we were waiting, someone took this photo.", "While we were walking, it started to rain."],
      },
      {
        form: "after that",
        claims: [
          "Link the two moments so the listener sees the order.",
          "'After that' tells the listener the second picture came later.",
        ],
        ex: ["After that, we found a cafe and sat down.", "After that the weather changed completely."],
      },
    ],
    ex: [],
    drills: [
      // p1 — in the first photo / the second one
      fc("p1", "In the ___ of the two photos, we are standing outside a station.", ["first", "one", "firstly"]),
      sit("p1", "You show a second photo and don't want to say 'photo' again. What do you say?", [
        "In the second one, everybody is laughing.",
        "In the second, one everybody is laughing.",
        "In second one, everybody is laughing.",
      ]),
      lc("p1", "In the first photo, we're at the beach.", ["In the first photo, we're at the bus stop.", "In the third photo, we're at the beach."]),
      // p2 — while we were
      fc("p2", "While we ___ waiting, someone took this photo.", ["were", "was", "are"]),
      chat("p2", ["Who took this photo?", null], [
        "A man took it while we were walking.",
        "A man took it while we was walking.",
        "A man took it while we were walk.",
      ]),
      spk("p2", "While we were eating, it started to snow."),
      // p3 — after that
      fc("p3", "___ that, we found a cafe and sat down.", ["After", "Then", "Later"]),
      la("p3", "After that, the weather changed completely.", ["changes"]),
      sit("p3", "Your second photo was taken later than the first. How do you link them?", [
        "After that, we had lunch in the park.",
        "After that, we have lunch in the park.",
        "After that, we lunch in the park.",
      ]),
      // karışık
      chat("mix", ["Tell me about your two photos.", null], [
        "In the first photo we were waiting for a bus. After that, we went to the beach.",
        "In the first photo we were wait for a bus. After that, we went to the beach.",
        "In the first photo we were waiting for a bus. After, that we went to the beach.",
      ]),
      spk("mix", "In the second one, we were swimming in the sea."),
    ],
    success: "The learner describes two moments and connects them with a time link.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "While we were walking, it started to rain.",
        "While we walking, it started to rain.",
        "While we were walk, it started to rain.",
      ], 0),
      qfill("___ that, we went to the beach.", ["After"]),
      qmcq("Which sentence introduces a picture?", [
        "In the second one, we are at the beach.",
        "We go to the beach every summer.",
        "We will go to the beach.",
      ], 0),
    ],
    scenes: [
      sc("Camille", "a friend looking through your photos", "to hear the story behind two pictures",
        "A friend is scrolling through the photos from your last trip.",
        "Describe two photos and the story between them.",
        "Think of two photos from one day of your trip. What is in the first photo?", "curious"),
      sc("Stefan", "a colleague making the team slideshow", "to caption the pictures correctly",
        "The team is putting photos from an event into a short presentation.",
        "Describe two photos so they can be captioned.",
        "Choose two photos from a team day. What is happening in the first one?", "practical"),
      sc("Rosa", "another guest sharing travel photos", "to swap the stories behind the pictures",
        "Two travellers are showing each other pictures from their journeys.",
        "Describe two of your pictures and what happened between them.",
        "Do you have two photos from one day? What happened between them?", "warm"),
      sc("Mrs. Chen", "your teacher", "to practise describing and comparing pictures",
        "The class is doing a picture-description task.",
        "Describe the two pictures and link them.",
        "Think of two photos from one day. What is in the first photo?", "encouraging"),
      sc("Mr. Ferreira", "the examiner", "to check that you can compare two pictures",
        "The examiner shows you two photographs from the same occasion.",
        "Describe both and explain the connection.",
        "Think of two photos from one day of yours. Could you describe them?", "neutral"),
    ],
  },

  // --- Ünite 2 · Plans and Predictions ---------------------------------------
  {
    id: "a2-im-going-to-move",
    topic: "talking about decisions you have already made",
    objectives: [
      "Use 'be going to' for a plan you have already decided.",
      "Keep the verb after 'going to' in its base form.",
    ],
    goal: "Tell someone about a decision you have already made about the future.",
    target: "'be going to' for plans and intentions",
    correction: "Say the full 'going to' sentence and let the learner repeat it.",
    summary: "You learned to use am, is and are with 'going to' for plans you have decided.",
    minutes: 8,
    points: [
      {
        form: "be going to + verb",
        claims: [
          "Use am, is or are with 'going to' and then the base verb.",
          "This form says the decision is already made, not that you are thinking about it.",
        ],
        ex: ["I'm going to move to another city.", "We're going to buy a bigger table."],
      },
      {
        form: "she's going to",
        claims: [
          "Only am, is and are change with the person; 'going to' never changes.",
          "The verb after 'going to' never takes -s or -ing.",
        ],
        ex: ["She's going to start a new job.", "They're going to travel in July."],
      },
      {
        form: "next month, soon",
        claims: [
          "A future time makes the plan clearer: next month, in the summer, soon.",
          "The time usually comes at the end of the sentence.",
        ],
        ex: ["We're going to redecorate next month.", "I'm going to call her soon."],
      },
    ],
    ex: [],
    drills: [
      // p1 — be going to + verb
      fc("p1", "I'm going to ___ to another city.", ["move", "moving", "moved"]),
      arr("p1", "We're going to buy a bigger table.", ["buying"]),
      sit("p1", "Yesterday you decided to learn to drive. What do you say?", [
        "I'm going to learn to drive.",
        "I'm going learn to drive.",
        "I going to learn to drive.",
      ]),
      lc("p1", "I'm going to call my mother.", ["I'm going to call my brother.", "I'm not going to call my mother."]),
      // p2 — only am / is / are change
      fc("p2", "My parents ___ going to travel in July.", ["are", "is", "am"]),
      err("p2", "He's going to starts a new course.", "starts", "start"),
      spk("p2", "She's going to start a new job."),
      // p3 — next month, soon
      fc("p3", "We're going to paint the kitchen ___ month.", ["next", "in next", "on next"]),
      la("p3", "I'm going to call her soon.", ["calling"]),
      chat("p3", ["When are you going to move?", null], [
        "We're going to move in the summer.",
        "We're going to moving in the summer.",
        "We going to move in the summer.",
      ]),
      // karışık
      sit("mix", "Your sister has decided to study in Spain next year. What do you say?", [
        "She's going to study in Spain next year.",
        "She's going to studies in Spain next year.",
        "She going to study in Spain next year.",
      ]),
      spk("mix", "We're going to travel next month."),
    ],
    success: "The learner describes two decided plans using I'm going to and we're going to correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We're going to paint the kitchen.",
        "We're going to painting the kitchen.",
        "We going to paint the kitchen.",
      ], 0),
      qfill("She ___ going to call you later. (be)", ["is"]),
      qmcq("Which sentence talks about a plan?", [
        "I'm going to look for a new job.",
        "I looked for a new job.",
        "I look for a new job every year.",
      ], 0),
    ],
    scenes: [
      sc("Elif", "a close friend", "to hear about the big decision you have made",
        "You have decided something important and your friend does not know yet.",
        "Explain your decision and what you are going to do.",
        "You said you had news. What are you going to do?", "supportive"),
      sc("Andres", "your team leader", "to understand your plans for the coming months",
        "The team is discussing what each person will take on this year.",
        "Say what you are going to do and when.",
        "What are you going to work on this year?", "attentive"),
      sc("Yuki", "a traveller you meet on the train", "to find out where you are heading next",
        "Two travellers are talking about the rest of their journeys.",
        "Say where you are going to go and what you are going to do there.",
        "This is my last stop. Where are you going to go next?", "friendly"),
      sc("Mr. Novotny", "your teacher", "to practise talking about decided plans",
        "The class is talking about goals for the coming year.",
        "Describe two plans you have decided.",
        "What are you going to do this year?", "encouraging"),
      sc("Ms. Alvarez", "the examiner", "to check that you can describe future plans",
        "The examiner asks about your plans for the near future.",
        "Describe your plans clearly.",
        "Could you tell me about something you're going to do soon?", "neutral"),
    ],
  },

  {
    id: "a2-are-you-going-to-come",
    topic: "asking about plans and saying what you will not do",
    objectives: [
      "Ask questions with 'going to' in the correct order.",
      "Make negative sentences with 'not going to'.",
    ],
    goal: "Find out other people's plans and say what you are not going to do.",
    target: "'be going to': questions and negatives",
    correction: "Repeat the question in the correct order and invite the learner to ask it again.",
    summary: "You learned to ask about plans and to say what you are not going to do.",
    minutes: 8,
    points: [
      {
        form: "are you going to ...?",
        claims: [
          "To ask, put am, is or are before the person.",
          "Never use 'do' or 'does' with 'going to'.",
        ],
        ex: ["Are you going to come on Saturday?", "Is he going to bring the car?"],
      },
      {
        form: "I'm not going to",
        claims: [
          "For the negative, put 'not' straight after am, is or are.",
          "The short forms are I'm not, isn't and aren't.",
        ],
        ex: ["I'm not going to stay long.", "We aren't going to book anything yet."],
      },
      {
        form: "what are you going to ...?",
        claims: [
          "Question words come first, then am, is or are, then the person.",
          "With 'who' as the subject, no extra word is needed: who is going to drive?",
        ],
        ex: ["What are you going to wear?", "Who is going to drive?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — Are you going to...?
      fc("p1", "___ you going to come on Saturday?", ["Are", "Do", "Will"]),
      arr("p1", "Is he going to bring the car?", ["Does"]),
      sit("p1", "You want to know if your friend plans to join the trip. What do you ask?", [
        "Are you going to join the trip?",
        "Do you going to join the trip?",
        "Are you going join the trip?",
      ]),
      lc("p1", "Are you going to come?", ["Are you going to cook?", "Are they going to come?"]),
      // p2 — I'm not going to
      fc("p2", "I'm ___ going to stay long.", ["not", "don't", "no"]),
      chat("p2", ["Are you going to book the hotel today?", null], [
        "No, we aren't going to book anything yet.",
        "No, we don't going to book anything yet.",
        "No, we not going to book anything yet.",
      ]),
      spk("p2", "I'm not going to stay long."),
      // p3 — What are you going to...? / Who is going to...?
      fc("p3", "What ___ you going to wear?", ["are", "do", "is"]),
      pairs("p3", [
        ["What are you going to wear?", "My blue dress."],
        ["Who is going to drive?", "Tom is."],
        ["Where are you going to stay?", "In a small hotel."],
      ]),
      la("p3", "Who is going to drive?", ["does"]),
      // karışık
      chat("mix", ["What are you going to do on Sunday?", null], [
        "I'm not going to do much. I'm going to rest.",
        "I'm not going to do much. I going to rest.",
        "I don't going to do much. I'm going to rest.",
      ]),
      sit("mix", "Your friend is not coming to the party. You want to know why. What do you ask?", [
        "Why aren't you going to come?",
        "Why don't you going to come?",
        "Why you aren't going to come?",
      ]),
    ],
    success: "The learner asks two correct going to questions and produces one correct negative sentence.",
    quiz: [
      qmcq("Which question is correct?", [
        "Is he going to join us?",
        "Does he going to join us?",
        "Is he going to joins us?",
      ], 0),
      qfill("___ they going to help? (be)", ["Are"]),
      qmcq("Which sentence is negative?", [
        "I'm not going to argue.",
        "I'm going to argue.",
        "Am I going to argue?",
      ], 0),
    ],
    scenes: [
      sc("Nour", "a friend organising a get-together", "to find out who is coming and what they are bringing",
        "A friend is putting together a small party and needs to know the details.",
        "Ask about the arrangements and say what you are and are not going to do.",
        "I'm planning a party on Saturday. What do you want to ask me?", "busy"),
      sc("Gareth", "a colleague planning the away day", "to collect everyone's intentions",
        "The team away day needs a rough plan and nobody has answered yet.",
        "Ask your colleague about the plans for the day.",
        "The team day is next month. What do you want to know?", "organised"),
      sc("Sanne", "a fellow traveller sharing a taxi", "to agree what each of you will do on arrival",
        "Two travellers are heading to the same town and comparing plans.",
        "Ask about their plans and explain yours.",
        "We're going to the same town. What are you going to do there?", "easy-going"),
      sc("Mr. Haddad", "your teacher", "to practise questions about future plans",
        "The class is interviewing each other about the holidays.",
        "Interview your partner about their plans.",
        "Ask me about my holiday. What do you want to know?", "encouraging"),
      sc("Mrs. Petrova", "the examiner", "to check that you can ask about plans",
        "The examiner asks you to interview them about the coming month.",
        "Ask clear questions about their plans.",
        "Now you ask me about next month. What do you want to know?", "neutral"),
    ],
  },

  {
    id: "a2-i-think-it-will-rain",
    topic: "making predictions about the future",
    objectives: [
      "Use will to say what you think will happen.",
      "Soften a prediction with 'I think' or 'probably'.",
    ],
    goal: "Say what you think will happen in the future and how sure you are.",
    target: "will for predictions",
    correction: "Repeat the prediction with will plus the base verb and let the learner say it again.",
    summary: "You learned to make predictions with will, won't and words like probably.",
    minutes: 8,
    points: [
      {
        form: "will + verb",
        claims: [
          "Use 'will' plus the base verb for what you think or guess about the future.",
          "'Will' is the same for every person: I will, she will, they will.",
        ],
        ex: ["It will rain tomorrow.", "The film will finish at ten."],
      },
      {
        form: "I think it will / it will probably",
        claims: [
          "Soften a guess with 'I think' at the start or 'probably' after will.",
          "'Probably' goes between will and the verb.",
        ],
        ex: ["I think it will be cold tonight.", "It will probably take an hour."],
      },
      {
        form: "it won't",
        claims: [
          "'Won't' is the short form of 'will not' and is very common in speech.",
          "The base verb follows won't with no changes.",
        ],
        ex: ["It won't be easy.", "They won't arrive before six."],
      },
    ],
    ex: [],
    drills: [
      // p1 — will + verb
      fc("p1", "The film ___ finish at ten.", ["will", "is", "wills"]),
      err("p1", "It will rains tomorrow.", "rains", "rain"),
      arr("p1", "They will arrive at six.", ["arrives"]),
      lc("p1", "It will be cold tonight.", ["It will be hot tonight.", "It was cold last night."]),
      // p2 — I think it will / probably
      fc("p2", "I ___ it will be cold tonight.", ["think", "thinks", "am think"]),
      chat("p2", ["Will we win on Saturday?", null], ["I think we'll probably win.", "I think we'll probably wins.", "I'm think we'll probably win."]),
      spk("p2", "I think it will rain tomorrow."),
      // p3 — won't
      fc("p3", "The traffic is terrible, so they ___ arrive before six.", ["won't", "will", "don't"]),
      la("p3", "It won't be a problem.", ["doesn't"]),
      sit("p3", "You are sure your friend will not come to the party. What do you say?", [
        "She won't come to the party.",
        "She will come to the party.",
        "She won't comes to the party.",
      ]),
      // karışık
      chat("mix", ["What will the weather be like tomorrow?", null], [
        "I think it will rain, but it won't be cold.",
        "I think it will rain, but it won't is cold.",
        "I think it will rains, but it won't be cold.",
      ]),
      spk("mix", "It will probably be sunny, but it won't be hot."),
    ],
    success: "The learner makes at least two predictions using will or won't.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I think it will be sunny.",
        "I think it will to be sunny.",
        "I think it will sunny.",
      ], 0),
      qfill("It ___ be easy, but we can try. (will not)", ["won't"]),
      qmcq("Which sentence is a prediction?", [
        "The team will probably win.",
        "The team won yesterday.",
        "The team is winning now.",
      ], 0),
    ],
    scenes: [
      sc("Ivan", "a neighbour looking at the sky", "to guess what the weather will do",
        "The weather is changing and you are both deciding whether to go out.",
        "Say what you think the weather will do.",
        "The sky is very dark today. What do you think the weather will be like?", "doubtful"),
      sc("Priya", "a colleague reviewing next year's plan", "to hear your predictions about the business",
        "The team is guessing how the coming year will go.",
        "Predict what will and will not happen.",
        "What do you think will happen next year?", "thoughtful"),
      sc("Mateo", "a guide preparing the group", "to warn the group about the conditions ahead",
        "The group is about to set off and the weather is uncertain.",
        "Predict the conditions and what the group will need.",
        "The mountain weather changes fast. What do you think it will be like today?", "practical"),
      sc("Dr. Sharma", "your teacher", "to practise talking about the future",
        "The class is discussing how life will change in ten years.",
        "Make predictions about the future.",
        "In ten years, what do you think will be completely different?", "curious"),
      sc("Mr. Kaufmann", "the examiner", "to check that you can make predictions",
        "The examiner asks how things will change in the coming years.",
        "Make clear predictions and say how sure you are.",
        "Could you tell me how you think your town will change in the next ten years?", "neutral"),
    ],
  },

  {
    id: "a2-tomorrow-next-week",
    topic: "saying when something will happen",
    objectives: [
      "Use next and in with future times correctly.",
      "Point to a part of the period you are already in.",
    ],
    goal: "Say clearly when something in the future will happen.",
    target: "future time expressions",
    correction: "Repeat the whole time expression inside a full sentence and let the learner say it again.",
    summary: "You learned to say when something will happen with next, in and later this.",
    minutes: 7,
    points: [
      {
        form: "tomorrow / next week",
        claims: [
          "Use 'next' with the coming week, month or year.",
          "Do not put 'in', 'on' or 'at' before next or tomorrow: next week, not in next week.",
        ],
        ex: ["I'll call you tomorrow.", "We're moving next week."],
      },
      {
        form: "in two weeks",
        claims: [
          "'In' plus a length of time counts forward from now.",
          "'In ten minutes' means ten minutes from now, not during ten minutes.",
        ],
        ex: ["The train leaves in ten minutes.", "She'll be back in two weeks."],
      },
      {
        form: "later this year",
        claims: [
          "Use 'later this' to point to a later part of the period you are currently in.",
          "'At the end of the month' is another useful expression for locating a future event.",
        ],
        ex: ["We'll decide later this year.", "I'm free at the end of the month."],
      },
    ],
    ex: [],
    drills: [
      // p1 — tomorrow / next week
      fc("p1", "I'll call you ___.", ["tomorrow", "on tomorrow", "the tomorrow"]),
      fc("p1", "We're moving ___ week.", ["next", "in next", "on next"]),
      lc("p1", "See you next Friday.", ["See you next Monday.", "See you this Friday."]),
      // p2 — in two weeks
      fc("p2", "The train leaves ___ ten minutes.", ["in", "on", "at"]),
      sit("p2", "Your sister will be back fourteen days from now. What do you say?", [
        "She'll be back in two weeks.",
        "She'll be back two weeks ago.",
        "She'll be back on two weeks.",
      ]),
      spk("p2", "I'll be back in two weeks."),
      // p3 — later this year / at the end of the month
      fc("p3", "We'll decide ___ this year.", ["later", "laterly", "lately"]),
      la("p3", "I'm free at the end of the month.", ["in"]),
      chat("p3", ["When is the new office opening?", null], [
        "Later this year, probably in October.",
        "Later the year, probably in October.",
        "Later of this year, probably in October.",
      ]),
      // karışık
      chat("mix", ["When can we meet?", null], [
        "Not tomorrow, but I'm free next week.",
        "Not on tomorrow, but I'm free next week.",
        "Not tomorrow, but I'm free on next week.",
      ]),
      sit("mix", "Today is the first of the month. Your exam is on the fifteenth. What do you say?", [
        "My exam is in two weeks.",
        "My exam is two weeks ago.",
        "My exam is on two weeks.",
      ]),
    ],
    success: "The learner uses at least two different future time expressions correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We'll meet next month.",
        "We'll meet the next month.",
        "We'll meet in next month.",
      ], 0),
      qfill("The film starts ___ twenty minutes.", ["in"]),
      qmcq("Which expression means two weeks from now?", ["in two weeks", "two weeks ago", "last two weeks"], 0),
    ],
    scenes: [
      sc("Greta", "a friend with a long to-do list", "to agree when each job will get done",
        "You share a flat and several small jobs are waiting.",
        "Say when each thing will happen.",
        "We have a lot to do. What can we do next week?", "practical"),
      sc("Felipe", "a colleague scheduling the work", "to fix a date for each task",
        "The team has to put dates next to a list of tasks.",
        "Say when you can do each task.",
        "I need dates for these tasks. When can you start?", "organised"),
      sc("Amara", "the tour coordinator", "to confirm when the group activities happen",
        "The group is planning the rest of the week's activities.",
        "Ask and say when things will happen.",
        "We have three free days. What do you want to do, and when?", "helpful"),
      sc("Mr. Lindqvist", "your teacher", "to practise future time expressions",
        "The class is filling in a diary for the coming month.",
        "Say when three things in your diary will happen.",
        "What are your plans for next month?", "encouraging"),
      sc("Ms. Rahman", "the examiner", "to check that you can talk about future times",
        "The examiner asks about your coming week.",
        "Say clearly when each thing will happen.",
        "Could you tell me about your plans for the next few weeks?", "neutral"),
    ],
  },

  {
    id: "a2-ill-get-it",
    topic: "offering help and deciding at the moment of speaking",
    objectives: [
      "Offer help with I'll and shall I.",
      "Reassure someone before you offer.",
    ],
    goal: "Offer to help someone the moment you see they need it.",
    target: "will for offers and instant decisions",
    correction: "Model the offer with I'll or shall I and let the learner make the offer again.",
    summary: "You learned to offer help with I'll and shall I as you decide to do it.",
    minutes: 8,
    points: [
      {
        form: "I'll + verb",
        claims: [
          "Use 'I'll' when you decide to do something as you are speaking.",
          "This is not a plan you made before; you decide it in the moment.",
        ],
        ex: ["I'll get it.", "I'll do the washing up.", "I'll do it."],
      },
      {
        form: "shall I ...?",
        claims: [
          "Use 'shall I' plus the base verb to offer help: Shall I carry that? 'Shall we' suggests doing something together: Shall we go?",
          "'Shall I' asks whether the other person wants you to help.",
        ],
        ex: ["Shall I help you with that?", "Shall I call a taxi?"],
      },
      {
        form: "don't worry, I'll ...",
        claims: [
          "Reassure the other person first, then make the offer.",
          "'Don't worry' and 'leave it to me' both sound friendly and natural.",
        ],
        ex: ["Don't worry, I'll take care of it.", "Don't worry about the bill, I'll pay."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'll + verb
      fc("p1", "There's someone at the door. I'll ___ it.", ["get", "getting", "got"]),
      sit("p1", "Your friend says the bin is full. You decide right now to take it out. What do you say?", [
        "I'll take it out.",
        "I'll taking it out.",
        "I'll to take it out.",
      ]),
      arr("p1", "I'll do the washing up.", ["doing"]),
      lc("p1", "I'll get the door.", ["I'll get the phone.", "I'll shut the door."]),
      // p2 — Shall I...?
      fc("p2", "Your friend's bags look heavy. You offer help: '___ I carry one for you?'", ["Shall", "Am", "Do"]),
      chat("p2", ["It's so hot in here!", null], ["Shall I turn on the fan?", "Shall I turning on the fan?", "Shall I to turn on the fan?"]),
      spk("p2", "Shall I call a taxi?"),
      // p3 — Don't worry, I'll...
      fc("p3", "Don't ___, I'll take care of it.", ["worry", "worries", "worrying"]),
      la("p3", "Don't worry about the bill, I'll pay.", ["paying"]),
      sit("p3", "Your colleague is stressed about a report. You want to help. What do you say?", [
        "Don't worry, I'll finish it.",
        "Don't worry, I'll finishing it.",
        "Not worry, I'll finish it.",
      ]),
      // karışık
      chat("mix", ["Oh no, I dropped my bags!", null], [
        "Don't worry, I'll help you. Shall I carry this one?",
        "Don't worry, I'll helping you. Shall I carry this one?",
        "Don't worry, I'll help you. Shall I carrying this one?",
      ]),
      spk("mix", "Don't worry, I'll do it."),
    ],
    success: "The learner makes at least two offers using I'll or shall I.",
    quiz: [
      qmcq("Which sentence is an offer?", [
        "Shall I open the window?",
        "I opened the window.",
        "I open the window every morning.",
      ], 0),
      qfill("The phone is ringing. ___ answer it. (I will)", ["I'll"]),
      qmcq("Which sentence is correct?", [
        "Don't worry, I'll sort it out.",
        "Don't worry, I'll to sort it out.",
        "Don't worry, I'll sorting it out.",
      ], 0),
    ],
    scenes: [
      sc("Bea", "a neighbour with her hands full", "to get through the door with the shopping",
        "Your neighbour is struggling with bags and keys in the hallway.",
        "Offer help in more than one way.",
        "Oh, I can't carry these bags and open the door! Can you help?", "flustered"),
      sc("Karim", "a colleague preparing for a visit", "to get the room ready before the guests arrive",
        "Visitors are arriving in fifteen minutes and several things are not ready.",
        "Offer to take some of the jobs.",
        "Our guests are here in fifteen minutes and nothing is ready! What can you do?", "rushed"),
      sc("Lucia", "a traveller who has dropped her things", "to gather everything before the bus leaves",
        "Someone's bag has opened at the bus stop and the bus is coming.",
        "Offer help quickly and clearly.",
        "Oh no, my things are on the floor and that's my bus! Can you help?", "panicked"),
      sc("Mrs. Owusu", "your teacher", "to practise making offers",
        "The class is practising polite offers in everyday situations.",
        "Make offers in two different situations.",
        "I need help with these heavy books. What do you say?", "encouraging"),
      sc("Mr. Sorensen", "the examiner", "to check that you can offer help naturally",
        "The examiner describes a small problem and waits for your reaction.",
        "Offer help in a natural way.",
        "Imagine I am carrying a heavy box and I drop my keys. What would you say?", "neutral"),
    ],
  },

  {
    id: "a2-im-meeting-sam-at-six",
    topic: "talking about fixed arrangements",
    objectives: [
      "Use am, is or are plus -ing for arrangements that are already fixed.",
      "Ask about someone's diary with the same form.",
    ],
    goal: "Talk about what is already in your diary for the coming days.",
    target: "present continuous for fixed future arrangements",
    correction: "Repeat the arrangement with am, is or are plus -ing and let the learner say it again.",
    summary: "You learned to talk about fixed arrangements with am, is or are plus an -ing verb.",
    minutes: 8,
    points: [
      {
        form: "I'm meeting / we're leaving",
        claims: [
          "Use am, is or are plus -ing for a future arrangement with fixed details, often with another person or a booking.",
          "A time or a day is usually included, because the arrangement is real.",
        ],
        ex: ["I'm meeting Sam at six.", "We're leaving at half past seven."],
      },
      {
        form: "what are you doing on Friday?",
        claims: [
          "The same form asks what is already in someone's diary.",
          "'Are you doing anything?' is the natural way to check if someone is free.",
        ],
        ex: ["What are you doing on Friday?", "Are you doing anything on Sunday?"],
      },
      {
        form: "arrangement or intention",
        claims: [
          "Use the present continuous when you want to emphasise that an arrangement has fixed details.",
          "Use 'going to' when you want to emphasise an intention or plan; the time may already be known.",
        ],
        ex: ["I'm seeing the doctor at four.", "I'm going to see a doctor soon."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm meeting / we're leaving
      fc("p1", "I'm ___ my sister at six tonight.", ["meeting", "meet", "met"]),
      arr("p1", "We're leaving at half past seven.", ["leave"]),
      sit("p1", "You booked a table with a friend for tomorrow at eight. What do you say?", [
        "We're having dinner at eight tomorrow.",
        "We having dinner at eight tomorrow.",
        "We're have dinner at eight tomorrow.",
      ]),
      lc("p1", "I'm meeting my boss at ten.", ["I'm meeting my boss at two.", "I'm meeting my friend at ten."]),
      // p2 — What are you doing on Friday?
      fc("p2", "What are you ___ on Friday?", ["doing", "do", "does"]),
      chat("p2", ["Are you doing anything on Sunday?", null], [
        "Yes, I'm visiting my parents.",
        "Yes, I visiting my parents.",
        "Yes, I'm visit my parents.",
      ]),
      spk("p2", "What are you doing on Friday?"),
      // p3 — düzenleme mi, niyet mi
      sit("p3", "You don't have a time or a booking yet, but you plan to see a doctor soon. What do you say?", [
        "I'm going to see a doctor soon.",
        "I'm seeing the doctor at four.",
        "I going to see a doctor soon.",
      ]),
      fc("p3", "It's in my diary: I'm ___ the dentist at four.", ["seeing", "see", "going see"]),
      la("p3", "We're flying to Rome on Monday at nine.", ["fly"]),
      // karışık
      chat("mix", ["What are you doing tonight?", null], [
        "I'm meeting a friend at seven, and I'm going to buy a cake.",
        "I meeting a friend at seven, and I'm going to buy a cake.",
        "I'm meeting a friend at seven, and I'm going buy a cake.",
      ]),
      spk("mix", "We're leaving at six, and we're going to drive."),
    ],
    success: "The learner describes at least two fixed arrangements with a time.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'm seeing the dentist at four.",
        "I'm see the dentist at four.",
        "I seeing the dentist at four.",
      ], 0),
      qfill("What ___ you doing tonight? (be)", ["are"]),
      qmcq("Which sentence is an arrangement with another person?", [
        "We're meeting at the station at six.",
        "We meet at the station every Monday.",
        "We met at the station yesterday.",
      ], 0),
    ],
    scenes: [
      sc("Jonah", "a friend trying to find a free evening", "to compare diaries and find a gap",
        "Two friends are looking at their weeks to find an evening that works.",
        "Say what is already fixed in your week.",
        "Let's meet this week. What are you doing on Thursday?", "hopeful"),
      sc("Rita", "a colleague booking the meeting room", "to avoid clashing with your appointments",
        "The team is fixing a time for a long meeting.",
        "Say what is already in your diary.",
        "I need the meeting room. What are you doing tomorrow morning?", "efficient"),
      sc("Hugo", "a receptionist confirming your bookings", "to check the times you have arranged",
        "You are confirming the arrangements you made for the rest of the stay.",
        "Confirm your arrangements and their times.",
        "Hello! What time are you leaving tomorrow?", "polite"),
      sc("Ms. Bianchi", "your teacher", "to practise talking about arrangements",
        "The class is comparing diaries for the coming week.",
        "Describe what is fixed in your week.",
        "Tell me about your week. What are you doing on Friday?", "encouraging"),
      sc("Mr. Tanaka", "the examiner", "to check that you can describe arrangements",
        "The examiner asks about the coming week.",
        "Describe your arrangements with times.",
        "Could you tell me what you are doing this weekend?", "neutral"),
    ],
  },

  {
    id: "a2-how-about-this",
    topic: "making and answering suggestions",
    objectives: [
      "Make suggestions with the correct form after each expression.",
      "Accept or refuse a suggestion politely.",
    ],
    goal: "Suggest ideas to a friend and react to their suggestions.",
    target: "suggestions with how about, why don't we and shall we",
    correction: "Repeat the suggestion with the correct verb form and let the learner suggest again.",
    summary: "You learned to make suggestions in three ways and to answer them.",
    minutes: 7,
    points: [
      {
        form: "how about / what about + -ing",
        claims: [
          "After 'how about' and 'what about', use a noun, an -ing form or a complete clause.",
          "Say 'How about going?' or 'How about we go?', but not 'How about go?'",
        ],
        ex: ["How about Saturday?", "What about going to the coast?", "How about we take the train?"],
      },
      {
        form: "why don't we / shall we + verb",
        claims: [
          "After 'why don't we' and 'shall we', use the base verb.",
          "Both are questions, so they end with a question mark.",
        ],
        ex: ["Why don't we eat first?", "Shall we take the train?"],
      },
      {
        form: "good idea / I'd rather not",
        claims: [
          "Accept with 'good idea' or 'that sounds great'.",
          "Refuse politely with 'I'd rather not' and a short reason.",
        ],
        ex: ["Good idea, let's do that.", "I'd rather not go so early."],
      },
    ],
    ex: [],
    drills: [
      // p1 — How about / What about + -ing
      fc("p1", "What about ___ a picnic?", ["having", "have", "to have"]),
      err("p1", "How about go to the park?", "go", "going"),
      lc("p1", "How about Saturday?", ["How about Sunday?", "What about today?"]),
      // p2 — Why don't we / Shall we
      fc("p2", "Why don't we ___ first?", ["eat", "eating", "to eat"]),
      arr("p2", "Shall we take the train?", ["taking"]),
      spk("p2", "Why don't we eat out tonight?"),
      // p3 — good idea / I'd rather not
      chat("p3", ["Shall we go for a walk?", null], ["That sounds great!", "That sound great!", "That sounds greatly!"]),
      sit("p3", "Your friend suggests leaving at six in the morning. It's too early for you. What do you say?", [
        "I'd rather not go so early.",
        "I'd rather not to go so early.",
        "I'd not rather go so early.",
      ]),
      la("p3", "Good idea, let's go tomorrow.", ["goes"]),
      // karışık
      chat("mix", ["Why don't we go to the cinema tonight?", null], [
        "I'd rather not. How about going tomorrow?",
        "I'd rather not. How about go tomorrow?",
        "I'd rather not to. How about going tomorrow?",
      ]),
      lc("mix", "How about Friday? Good idea.", ["How about Sunday? Good idea.", "What about Friday? Bad idea."]),
    ],
    success: "The learner makes three correctly formed suggestions and gives at least one appropriate response.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Why don't we ask her?",
        "Why don't we asking her?",
        "Why we don't ask her?",
      ], 0),
      qfill("How about ___ to the cinema? (go)", ["going"]),
      qmcq("Which answer accepts a suggestion?", ["Good idea, let's do that.", "I'd rather not.", "Sorry, I can't."], 0),
    ],
    scenes: [
      sc("Tessa", "a friend with a free weekend", "to decide together what to do",
        "Two friends have a free Saturday and no plan at all.",
        "Suggest ideas and react to hers.",
        "We finally have a free Saturday. What shall we do?", "playful"),
      sc("Viktor", "a colleague organising the team lunch", "to agree on a place and a time",
        "The team lunch needs a place and everyone has an opinion.",
        "Suggest a place and a time.",
        "Nobody can choose a restaurant. What do you suggest?", "patient"),
      sc("Noor", "another guest planning the day", "to choose what the group does today",
        "Two travellers are deciding how to spend a free day in a new city.",
        "Suggest what to do and when.",
        "We have one day here. What shall we do first?", "enthusiastic"),
      sc("Mr. Berg", "your teacher", "to practise making suggestions",
        "The class is planning an end-of-course outing.",
        "Suggest ideas for the outing.",
        "We are planning something for the end of the course. What do you suggest?", "encouraging"),
      sc("Mrs. Costa", "the examiner", "to check that you can suggest and respond",
        "The examiner asks you to plan an afternoon together.",
        "Make suggestions and respond to the examiner's ideas.",
        "Imagine we have a free afternoon in this city. What shall we do?", "neutral"),
    ],
  },

  {
    id: "a2-lets-make-a-plan",
    topic: "arranging to meet someone",
    objectives: [
      "Propose a day, a time and a place.",
      "Check that the other person agrees and close the arrangement.",
    ],
    goal: "Arrange to meet someone and agree on all the details.",
    target: "arranging to meet and agreeing on details",
    correction: "Model the sentence that proposes or confirms the detail and let the learner continue.",
    summary: "You practised arranging a meeting from the first idea to the final confirmation.",
    minutes: 7,
    points: [
      {
        form: "how about Thursday?",
        claims: [
          "Offer one detail at a time: first the day, then the time, then the place.",
          "One clear proposal is easier to answer than three at once.",
        ],
        ex: ["How about Thursday evening?", "How about the cafe near the station?"],
      },
      {
        form: "does that work for you?",
        claims: [
          "Check that the other person agrees before you move on.",
          "'Is that too early for you?' invites them to say no politely.",
        ],
        ex: ["Does that work for you?", "Is seven too early for you?"],
      },
      {
        form: "see you then",
        claims: [
          "Close by repeating the agreed detail, then say 'see you then'.",
          "Repeating the day and time prevents misunderstandings.",
        ],
        ex: ["Great, see you then.", "Perfect. See you on Thursday at seven."],
      },
    ],
    ex: [],
    drills: [
      // p1 — How about Thursday?
      fc("p1", "How ___ Thursday evening?", ["about", "for", "at"]),
      lc("p1", "How about the cafe near the station?", ["How about the cafe near the school?", "How about the bar near the station?"]),
      arr("p1", "How about Thursday at seven?", ["for"]),
      // p2 — Does that work for you?
      fc("p2", "Is seven too ___ for you?", ["early", "earlier", "earliest"]),
      sit("p2", "You suggest a time and want to check that your friend agrees. What do you ask?", [
        "Does that work for you?",
        "Do that work for you?",
        "Does that works for you?",
      ]),
      spk("p2", "Does that work for you?"),
      // p3 — see you then
      fc("p3", "Great, see you ___.", ["then", "than", "them"]),
      la("p3", "Perfect, see you on Thursday at seven.", ["in"]),
      chat("p3", ["OK, Friday at six at the cafe.", null], ["Great, see you then.", "Great, see you than.", "Great, seeing you then."]),
      // karışık
      chat("mix", ["When can we meet?", null], [
        "How about Tuesday at five? Does that work for you?",
        "How about Tuesday at five? Do that work for you?",
        "How about to Tuesday at five? Does that work for you?",
      ]),
      spk("mix", "Saturday at ten is perfect, see you then."),
    ],
    success: "The learner proposes all three details, checks agreement and closes the arrangement naturally.",
    quiz: [
      qmcq("Which sentence closes an arrangement?", ["See you then.", "How about Friday?", "Does that work?"], 0),
      qfill("___ that work for you? (do)", ["Does"]),
      qmcq("Which sentence suggests a time?", [
        "How about half past six?",
        "I saw him at half past six.",
        "It takes half an hour.",
      ], 0),
    ],
    scenes: [
      sc("Milena", "a friend you have not seen for months", "to finally fix a date to meet",
        "You have both been saying 'we should meet' for months without fixing anything.",
        "Agree on a day, a time and a place.",
        "We need to meet! When are you free?", "determined"),
      sc("Samir", "a client you need to see", "to arrange a short meeting this week",
        "A short meeting has to happen this week and both diaries are full.",
        "Propose times and agree on the details.",
        "I'm busy this week, but we should meet. What do you suggest?", "businesslike"),
      sc("Elena", "someone you met while travelling", "to meet again before you both leave",
        "Two travellers want to meet once more before their trips end.",
        "Arrange the meeting with day, time and place.",
        "I leave on Sunday. Can we meet before then?", "warm"),
      sc("Mr. Fontaine", "your teacher", "to practise arranging a meeting",
        "The class is role-playing arrangements in pairs.",
        "Arrange a meeting with your partner.",
        "You and I need to meet this week. What do you suggest?", "encouraging"),
      sc("Ms. Iqbal", "the examiner", "to check that you can arrange a meeting",
        "The examiner asks you to arrange a meeting with them.",
        "Propose the details and confirm the arrangement.",
        "Let us say we need to meet this week. What would you suggest?", "neutral"),
    ],
  },
];
