/** B1 · Ünite 1-3 — dışa aktarılmış çekirdekten (export-authored.ts); tek doğruluk kaynağı bu dosya. */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const B1_U1_3: Authored[] = [
  {
    id: "b1-it-had-already-started",
    topic: "past perfect for an event that happened before another past event",
    objectives: [
      "Recognise the past perfect tense in sentences describing two past events.",
      "Form sentences using the past perfect to show which event happened first.",
      "Use the past perfect to explain what happened before another past event.",
    ],
    goal: "Explain the order of two past events, especially when describing what you missed or what happened before you arrived.",
    target: "past perfect (had + past participle) for the earlier of two past events",
    correction: "Prompt the learner to use 'had' plus the past participle for the earlier event when two past events are described.",
    summary: "You learned how to use the past perfect to show that one event happened before another in the past.",
    minutes: 8,
    intents: {
      readiness: "Greet, introduce past perfect for an event before another past event, and check if the learner is ready.",
      teach: "Explain how and why to use the past perfect for two past events.",
      questions: "Invite questions about the past perfect before starting practice.",
      say: "Acknowledge and announce a few practice questions are coming.",
    },
    points: [
      {
        form: "had + past participle",
        claims: [
          "Use 'had' plus the past participle to form the past perfect.",
          "The past perfect shows that one past event happened before another past event.",
          "The later past event usually uses the past simple.",
        ],
        ex: [
          "I had finished my homework before I went out.",
          "She had already left when I arrived.",
        ],
      },
      {
        form: "already, never, by then + past perfect",
        claims: [
          "Words like 'already', 'never', and 'by then' are often used with the past perfect.",
          "'Already' shows something happened before another past event.",
          "'Never' means not at any time before that past moment.",
          "'By then' means 'at or before that past moment'.",
        ],
        ex: [
          "It had already started when I got there.",
          "I had never seen that movie before last night.",
          "By then we had eaten all the cake.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — had + past participle
      fc("p1", "I couldn't open the door because I ___ lost my key.", ["had", "has", "have"]),
      la("p1", "She had lost her keys before she got home.", ["lose"]),
      sit("p1", "The bus left at 8:00. You arrived at the stop at 8:10. What do you say?", [
        "When I arrived, the bus had left.",
        "When I arrived, the bus has left.",
        "When I arrived, the bus leaves.",
      ]),
      lc("p1", "She had gone home when I called.", ["She went home after I called.", "She was at home when I called."]),
      // p2 — already, never, by then
      fc("p2", "It had ___ started when I got there.", ["already", "yet", "ever"]),
      err("p2", "I had never saw snow before that winter.", "saw", "seen"),
      chat("p2", ["Did you enjoy the concert last night?", null], [
        "Yes! I had never heard that band before.",
        "Yes! I had never hear that band before.",
        "Yes! I had ever heard that band before.",
      ]),
      la("p2", "By then the shops had closed.", ["close"]),
      spk("p2", "By then we had cleaned the whole house."),
      // mix
      sit("mix", "Last night you ate Thai food. It was your first time. What do you say?", [
        "I had never eaten Thai food before last night.",
        "I have never eaten Thai food before last night.",
        "I had never eat Thai food before last night.",
      ]),
      fc("mix", "When we arrived, the show had already ___.", ["finished", "finish", "finishing"]),
    ],
    success: "The learner uses the past perfect correctly to show which event happened first and uses the required phrase naturally.",
    quiz: [
      qmcq("Which sentence uses the past perfect correctly?", [
        "I had finished my meal before she arrived.",
        "I finish my meal before she arrived.",
        "I am finishing my meal before she arrived.",
      ], 0),
      qfill("By then we ___ already left.", ["had","Had"]),
      qmcq("Choose the correct form: She ___ seen the film before last night.", [
        "had never",
        "never had",
        "has never",
      ], 0),
      qfill("When I got to the station, the train ___ already gone.", ["had","Had"]),
    ],
    scenes: [
      sc("Lucy", "friend", "find out what you missed at the party",
        "You arrive late at a friend's birthday party at their house.",
        "Explain to Lucy what had already happened before you arrived and what you had never seen at a party before.",
        "You finally made it! The party started at seven. What had already happened when you walked in?", "curious"),
      sc("Martin", "colleague", "update you about the team meeting you missed",
        "You walk into the office after a team meeting has finished.",
        "Explain to Martin what you had never experienced at work before and ask about what had already been discussed.",
        "Oh, you just got here! The meeting is over. Why were you late? What had already gone wrong before you left home?", "busy"),
      sc("Sofia", "tour guide", "help you catch up with the tour group",
        "You join a city walking tour after it has started.",
        "Explain to Sofia what you had never seen before and ask what the group had already visited.",
        "Welcome! You joined us late. When you found the group, what had already happened?", "friendly"),
      sc("Dr. Patel", "professor", "make sure you understand what you missed in class",
        "You arrive late to a university lecture.",
        "Explain to Dr. Patel what you had never learned before and ask what had already been covered by the time you arrived.",
        "Glad you could join us. You missed twenty minutes. What had already happened on your way here?", "friendly"),
      sc("Mr. Green", "examiner", "assess how you explain past events in English",
        "You are in a speaking exam room, and the examiner asks about a time you arrived late.",
        "Describe to Mr. Green what had already happened before you arrived and what you had never done before.",
        "Think of a time you arrived late somewhere. What had already happened when you got there?", "curious"),
    ],
  },
  {
    id: "b1-by-the-time-i-got-there",
    topic: "past perfect with by the time, already and just",
    objectives: [
      "Form the past perfect with by the time, already, and just.",
      "Describe the order of past events using these phrases.",
    ],
    goal: "Describe a sequence of past events, showing what happened first using by the time, already, and just.",
    target: "past perfect sentences with by the time, already, and just",
    correction: "Prompt the learner to use had + past participle with by the time, already, or just to clarify the sequence of events.",
    summary: "You learned how to use the past perfect with by the time, already, and just.",
    minutes: 8,
    points: [
      {
        form: "past perfect",
        claims: [
          "Use had + past participle to show one past action happened before another.",
          "The past perfect often comes with time words like by the time, already, and just.",
        ],
        ex: [
          "By the time we arrived, the bus had left.",
          "We had already finished dinner when he called.",
        ],
      },
      {
        form: "by the time",
        claims: [
          "'By the time' plus the past simple names a past moment; the past perfect in the other part shows what was already complete at that moment.",
          "The past perfect usually goes in the other part of the sentence.",
        ],
        ex: [
          "By the time she got to the station, the train had just left.",
          "By the time we noticed, they had already gone.",
        ],
      },
      {
        form: "already and just",
        claims: [
          "Already means something happened before another event, often earlier than expected.",
          "Just means something happened a short time before another event.",
          "'Already' and 'just' usually go between 'had' and the past participle: had just left.",
        ],
        ex: [
          "We had already locked the door when she arrived.",
          "He had just left when I called.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — past perfect
      fc("p1", "I couldn't get in because I ___ forgotten my card.", ["had", "has", "have"]),
      fc("p1", "When we got there, the shop had ___.", ["closed", "close", "closing"]),
      lc("p1", "The film had started when we sat down.", ["The film started after we sat down.", "The film was long, so we sat down."]),
      // p2 — by the time
      fc("p2", "___ we got to the station, the train had left.", ["By the time", "Until", "During"]),
      la("p2", "By the time we arrived, the food had gone cold.", ["go"]),
      sit("p2", "The concert ended at ten. You got there at quarter past ten. What do you say?", [
        "By the time I got there, the concert had ended.",
        "By the time I got there, the concert ends.",
        "By the time I got there, the concert has ended.",
      ]),
      spk("p2", "By the time I got there, everyone had gone home."),
      // p3 — already and just
      fc("p3", "He had ___ left when I called, so I missed him by one minute.", ["just", "yet", "ever"]),
      chat("p3", ["Did you see Tom at the station?", null], [
        "No, he had just left when I got there.",
        "No, he has just left when I got there.",
        "No, he had just leave when I got there.",
      ]),
      sit("p3", "Your friend came at eight to help you clean. You finished cleaning at seven, earlier than you expected. What do you say?", [
        "We had already cleaned the house when you came.",
        "We have already cleaned the house when you came.",
        "We had already clean the house when you came.",
      ]),
      spk("p3", "We had already paid when he arrived."),
      // mix
      fc("mix", "By the time the doctor came, the pain had ___ gone.", ["already", "yet", "ever"]),
      sit("mix", "The last train left at 11:00. You reached the platform at 11:01. What do you say?", [
        "By the time I reached the platform, the train had just left.",
        "By the time I reached the platform, the train has just left.",
        "By the time I reached the platform, the train just leaves.",
      ]),
    ],
    success: "The learner uses the past perfect correctly with by the time, already, or just to show the order of past events.",
    quiz: [
      qmcq("Which sentence correctly uses the past perfect with already?", [
        "We had already eaten when he arrived.",
        "We already ate when he arrived.",
        "We have already eaten when he arrived.",
      ], 0),
      qfill("By the time she called, I ___ already left.", ["had"]),
      qmcq("Choose the correct sentence.", [
        "They had just left when we arrived.",
        "They just had left when we arrived.",
        "They had left just when we arrived.",
      ], 0),
      qfill("We ___ finished our homework by the time our friends came.", ["had already"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to find out what happened with the package delivery",
        "You meet your neighbour in the hallway after a missed package delivery.",
        "Explain the sequence of events that led to missing the delivery.",
        "Hi! A delivery driver came to your door at two, but you weren't home. When you got back, what had happened to your package?", "curious"),
      sc("James", "team leader", "to understand why the report was not submitted on time",
        "You are in a meeting with your team leader discussing a late report.",
        "Describe what went wrong with the report submission.",
        "The report arrived two hours late this morning. What had already gone wrong by the time you started work?", "busy"),
      sc("Lena", "hotel receptionist", "to check why you missed your airport shuttle",
        "You are at the hotel front desk after missing your airport shuttle.",
        "Explain the chain of events that caused you to miss the shuttle.",
        "Oh, you missed the shuttle! It left at eight o'clock. What had happened by the time you came down?", "friendly"),
      sc("Mr. Carter", "teacher", "to find out why you missed the start of class",
        "Your teacher asks you why you arrived late to class after a test started.",
        "Describe the events that led to your late arrival.",
        "The test started at nine and you came in at half past nine. What had already happened by the time you got to school?", "curious"),
      sc("Ms. Brown", "examiner", "to hear you describe a situation using past perfect",
        "You are in a speaking exam and the examiner asks about a time when things went wrong.",
        "Describe a sequence of past events that went wrong using the target phrases.",
        "Think of a day when your plans went wrong. What had already happened by the time you arrived somewhere?", "friendly"),
    ],
  },
  {
    id: "b1-setting-the-scene",
    topic: "past continuous and past simple together",
    objectives: [
      "Form sentences using past continuous and past simple together.",
      "Describe an action in progress interrupted by another action in the past.",
    ],
    goal: "Describe a situation in the past where one action was happening when another action occurred.",
    target: "past continuous and past simple used together in one sentence",
    correction: "Prompt the correct tense for each part and model the full sentence.",
    summary: "You learned how to use past continuous and past simple together in a story.",
    minutes: 8,
    points: [
      {
        form: "past continuous",
        claims: [
          "Use was or were plus verb-ing to show an action in progress in the past.",
          "Use 'was' with I, he, she and it; use 'were' with you, we and they.",
        ],
        ex: [
          "I was walking to the store.",
          "They were talking on the phone.",
        ],
      },
      {
        form: "past simple",
        claims: [
          "Use the past form of the verb to show a finished action in the past.",
          "The past simple often interrupts the past continuous in a story.",
        ],
        ex: [
          "I saw my friend.",
          "She called me.",
        ],
      },
      {
        form: "using both tenses together",
        claims: [
          "Use past continuous for the background action and past simple for the action that interrupts.",
          "'While' usually introduces the longer background action in the past continuous; 'when' often introduces the short action in the past simple.",
        ],
        ex: [
          "I was walking when I saw an accident.",
          "While we were eating, the phone rang.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — past continuous
      fc("p1", "They ___ playing football in the park.", ["were", "was", "did"]),
      fc("p1", "I was ___ to work at eight o'clock.", ["walking", "walk", "walked"]),
      lc("p1", "She was talking on the phone.", ["She talked to me on the phone.", "She is talking on the phone now."]),
      // p2 — past simple interrupts
      fc("p2", "I was cooking when my sister ___ home.", ["came", "come", "comed"]),
      arr("p2", "The lights went out at nine.", ["go"]),
      sit("p2", "You were reading. Then, at ten, the doorbell rang once. Which sentence is correct?", [
        "I was reading when the doorbell rang.",
        "I was reading when the doorbell rings.",
        "I was read when the doorbell rang.",
      ]),
      // p3 — when / while
      fc("p3", "___ we were having lunch, it started to snow.", ["While", "During", "Until"]),
      spk("p3", "I was walking to work when I saw an old friend."),
      la("p3", "While we were waiting, the bus broke down.", ["wait"]),
      // mix
      err("mix", "While they were sleeping, someone open the door.", "open", "opened"),
      sit("mix", "You and your friends were sitting in the park. A dog suddenly took your sandwich. How do you tell the story?", [
        "While we were sitting in the park, a dog took my sandwich.",
        "While we were sit in the park, a dog took my sandwich.",
        "While we were sitting in the park, a dog take my sandwich.",
      ]),
    ],
    success: "Learner uses both past continuous and past simple correctly in context, and includes at least one mustUse phrase.",
    quiz: [
      qmcq("Which sentence uses both tenses correctly?", [
        "I was cooking when the phone rang.",
        "I cooked when the phone was ringing.",
        "I am cooking when the phone rang.",
      ], 0),
      qfill("While we ___ watching TV, the lights went out.", ["were"]),
      qmcq("Choose the correct option to complete the sentence: I was reading a book when I ___ a noise.", [
        "heard",
        "was hearing",
        "hear",
      ], 0),
      qfill("I was walking home when I ___ my old teacher.", ["saw"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to hear about what happened when you got some surprising news",
        "You are chatting with your friend Sophie in a park about a surprising piece of news you heard yesterday.",
        "Describe where you were and what you were doing when you heard the news, using the target phrases.",
        "I heard the big news yesterday while I was cooking. What were you doing when you heard it?", "curious"),
      sc("David", "colleague", "to find out how you learned about a big change at work",
        "You are having coffee with your colleague David in the office break room, talking about a recent company announcement.",
        "Explain what you were doing when you found out about the company news, using the target phrases.",
        "I was drinking my coffee when I read the email about the new office. What were you doing when you saw it?", "friendly"),
      sc("Linda", "hotel receptionist", "to make small talk and hear about your experience in the city",
        "You are checking in at a hotel and chatting with the receptionist about something interesting you heard earlier in the day.",
        "Describe what you were doing and where you were when you heard the news, using the target phrases.",
        "Welcome! I was working at this desk when the lights went out last night. What were you doing when it happened?", "friendly"),
      sc("Mr. Carter", "teacher", "to get you to practice telling stories about past events",
        "You are in class and your teacher Mr. Carter asks you to describe where you were when you heard some school news.",
        "Tell your teacher what you were doing and where you were when you heard the news, using the target phrases.",
        "Our school won the big prize yesterday! I was teaching when I heard. What were you doing when you heard the news?", "curious"),
      sc("Ms. Green", "examiner", "to assess your ability to talk about past events in English",
        "You are in a speaking exam and the examiner asks you about a time you heard some important news.",
        "Describe where you were and what you were doing when you heard the news, using the target phrases.",
        "Think of a day when you heard some important news. What were you doing when you heard it?", "friendly"),
    ],
  },
  {
    id: "b1-what-had-happened-before",
    topic: "past perfect in questions and negatives",
    objectives: [
      "Form past perfect questions and negatives correctly.",
      "Use past perfect questions and negatives to ask about or explain events before a past moment.",
    ],
    goal: "Ask and answer about events that happened before another past event, especially when discussing stories or experiences.",
    target: "past perfect questions (Had + subject + past participle?) and negatives (subject + had not + past participle)",
    correction: "Prompt the correct form by modeling the structure and highlighting the use of 'had' and the past participle.",
    summary: "You learned how to form and use the past perfect in questions and negatives.",
    minutes: 8,
    points: [
      {
        form: "Had + subject + past participle?",
        claims: [
          "Use 'had' before the subject to make a question in the past perfect.",
          "The main verb is in the past participle form.",
          "Use past perfect questions to ask if something happened before another past event: Had you ever...?",
          "A question word comes first. In 'What had happened?', 'what' is the subject, so no other subject is needed.",
        ],
        ex: [
          "Had you ever seen that movie before last night?",
          "Had they finished dinner when you arrived?",
          "What had happened before the police arrived?",
        ],
      },
      {
        form: "subject + had not + past participle",
        claims: [
          "Use 'had not' or 'hadn't' before the past participle to make a negative in the past perfect.",
          "Do not add 'did' or change the past participle.",
          "Use past perfect negatives to say something did not happen before another past event.",
        ],
        ex: [
          "I hadn't heard the news before you told me.",
          "She had not finished her homework when the phone rang.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — Had + subject + past participle?
      fc("p1", "___ they met before last night's party?", ["Had", "Did", "Have"]),
      arr("p1", "What had happened to the car?", ["happen"]),
      chat("p1", ["I went to Japan last month.", null], [
        "Had you ever been there before?",
        "Did you ever been there before?",
        "Had you ever went there before?",
      ]),
      lc("p1", "Had you seen her before that day?", ["Did you see her after that day?", "Have you seen her since that day?"]),
      // p2 — had not + past participle
      fc("p2", "I ___ heard the news before you told me.", ["hadn't", "didn't", "haven't"]),
      fc("p2", "She hadn't ___ to bed when I called.", ["gone", "went", "go"]),
      sit("p2", "Your friend asked about the book at the start of class. At that moment, you were still on page ten. What do you say?", [
        "I hadn't finished it when you asked.",
        "I didn't finished it when you asked.",
        "I hadn't finish it when you asked.",
      ]),
      spk("p2", "I hadn't met her before the wedding."),
      la("p2", "We hadn't seen the sea before that trip.", ["see"]),
      // mix
      chat("mix", ["Had you ever driven in the snow before last winter?", null], [
        "No, I hadn't. It was my first time.",
        "No, I didn't. It was my first time.",
        "No, I hadn't drove. It was my first time.",
      ]),
      fc("mix", "Had you eaten before the meeting? No, I ___.", ["hadn't", "didn't", "haven't"]),
    ],
    success: "Learner correctly forms past perfect questions and negatives using the target phrases.",
    minUses: 3,
    quiz: [
      qmcq("___ you ever visited London before last year?", [
        "Had",
        "Did",
        "Have",
      ], 0),
      qfill("I ___ finished my homework when my friend called.", ["hadn't","had not"]),
      qmcq("What ___ before you arrived?", [
        "had happened",
        "has happened",
        "did happen",
      ], 0),
      qfill("She ___ seen the movie before last night.", ["hadn't","had not"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to understand the full story about something surprising that happened",
        "You are sitting with your friend Lucy in a cafe, telling her about a strange thing that happened at a party.",
        "Explain the order of events using past perfect in questions and negatives.",
        "You stopped your story at the best part! What had happened before the music stopped?", "curious"),
      sc("Martin", "colleague", "to learn what led up to a problem during a work project",
        "You and your colleague Martin are talking in the break room about a project that went wrong.",
        "Ask and answer about earlier events using past perfect in questions and negatives.",
        "The project went wrong last week, but I was on holiday. What had happened before the client called?", "friendly"),
      sc("Sophie", "hotel receptionist", "to understand a guest's unusual experience before arriving",
        "You are at the hotel desk explaining to Sophie why you arrived late and stressed.",
        "Describe previous events and answer questions using past perfect in questions and negatives.",
        "Welcome! I saw snow yesterday. Ask me if I had ever seen it before. What's your question?", "curious"),
      sc("Dr. Patel", "university advisor", "to help you understand what led to a problem with your assignment",
        "You are meeting with Dr. Patel to discuss why your assignment was late.",
        "Explain the sequence of events using past perfect in questions and negatives.",
        "Your assignment came in two days late. What had happened before the deadline?", "friendly"),
      sc("Mr. Green", "examiner", "to check your ability to use past perfect in questions and negatives",
        "You are in a speaking exam and Mr. Green asks you to talk about a surprising experience.",
        "Use past perfect in questions and negatives to describe the story.",
        "I visited Japan last year. Ask me if I had been there before. What's your question?", "curious"),
    ],
  },
  {
    id: "b1-suddenly-meanwhile-later",
    topic: "story-linking expressions",
    objectives: [
      "Use linking expressions to connect events in a story",
      "Recognise and choose appropriate phrases to show the order of events",
    ],
    goal: "The learner can retell a sequence of events smoothly using linking expressions.",
    target: "all of a sudden, not long after, in the meantime",
    correction: "Prompt the learner to use the correct linking phrase and model the right usage in context.",
    summary: "You learned how to use three expressions to connect moments in a story.",
    minutes: 7,
    points: [
      {
        form: "all of a sudden",
        claims: [
          "Use 'all of a sudden' to show that something happened very quickly and unexpectedly.",
          "This phrase introduces a surprising or sudden event in the story.",
        ],
        ex: [
          "All of a sudden, the bus stopped in the middle of the road.",
          "We were walking, and all of a sudden, it started to rain.",
        ],
      },
      {
        form: "not long after",
        claims: [
          "Use 'not long after' to show that something happened soon after another event.",
          "This phrase connects two events that are close in time.",
          "It can start a clause (Not long after we left, ...) or stand alone (Not long after, ...).",
        ],
        ex: [
          "Not long after we left, we saw a beautiful mountain.",
          "The train arrived, and not long after, we found our seats.",
        ],
      },
      {
        form: "in the meantime",
        claims: [
          "Use 'in the meantime' to talk about what happens in the time between two events, often while you wait.",
          "It often introduces what you do while you wait for something else.",
        ],
        ex: [
          "We missed the bus. In the meantime, we got some coffee.",
          "The car was being fixed. In the meantime, we walked around the city.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — all of a sudden
      fc("p1", "We were sitting quietly. All of a ___, the window broke.", ["sudden", "suddenly", "surprise"]),
      sit("p1", "You were driving on a quiet road. With no warning, a deer ran out in front of your car. How do you tell this part?", [
        "All of a sudden, a deer ran into the road.",
        "All of a sudden, a deer run into the road.",
        "All of sudden, a deer ran into the road.",
      ]),
      spk("p1", "We were walking, and all of a sudden it started to snow."),
      // p2 — not long after
      fc("p2", "Not long ___ we arrived, the rain stopped.", ["after", "ago", "later"]),
      la("p2", "Not long after we left, the car broke down.", ["leave"]),
      chat("p2", ["So you got to the hotel at six. What happened next?", null], [
        "Not long after, we went out for dinner.",
        "Not long after, we go out for dinner yesterday.",
        "Not long after of that, we went out for dinner.",
      ]),
      // p3 — in the meantime
      sit("p3", "Your train is forty minutes late. You decide to get a coffee while you wait. What do you say?", [
        "The train is late, so in the meantime I'll get a coffee.",
        "The train is late, so in a meantime I'll get a coffee.",
        "The train is late, so in the meantimes I'll get a coffee.",
      ]),
      fc("p3", "The pizza was in the oven. In ___ meantime, we set the table.", ["the", "a", "one"]),
      fc("p3", "My room wasn't ready. In the ___, I left my bags at the desk.", ["meantime", "meaning", "time"]),
      // mix
      chat("mix", ["How was your trip to the airport?", "Terrible! We waited an hour for a taxi.", "Oh no! What did you do?", null], [
        "In the meantime, we had lunch, and not long after, the taxi came.",
        "In the meantime, we had lunch, and not long after, the taxi come.",
        "In a meantime, we had lunch, and not long after, the taxi came.",
      ]),
      sit("mix", "You were waiting for a friend in a cafe, so you read a magazine. Then, with no warning, the lights went out. How do you tell it?", [
        "In the meantime, I read a magazine. All of a sudden, the lights went out.",
        "In the meantime, I read a magazine. All of a sudden, the lights go out yesterday.",
        "In the meantime, I read a magazine. All of sudden, the lights went out.",
      ]),
    ],
    success: "The learner uses each linking phrase correctly to connect events in a story.",
    minUses: 1,
    quiz: [
      qmcq("Which phrase shows that something happened quickly and unexpectedly?", [
        "All of a sudden",
        "Not long after",
        "In the meantime",
      ], 0),
      qfill("We arrived at the airport. ___, we checked our tickets.", ["Not long after","not long after"]),
      qmcq("Which phrase can you use to talk about something you did while waiting?", [
        "In the meantime",
        "All of a sudden",
        "Not long after",
      ], 0),
      qfill("We were walking in the park when, ___, it started to rain.", ["all of a sudden","All of a sudden"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to hear about your eventful trip home yesterday",
        "You are sitting in a cafe with your friend Lucy, who asks about your journey home yesterday.",
        "Retell the key moments of your journey using story-linking expressions.",
        "I heard your trip home yesterday was crazy! What happened, and what did you do while you waited?", "curious"),
      sc("Martin", "colleague", "to find out why you were late to the meeting",
        "You arrive at work and your colleague Martin asks why you were late this morning.",
        "Explain the sequence of events on your journey to work using linking expressions.",
        "You came in an hour late this morning! What happened on the way, and what did you do while you were stuck?", "friendly"),
      sc("Sophia", "hotel receptionist", "to understand why you arrived late for your hotel check-in",
        "You finally arrive at your hotel and Sophia at the front desk asks about your delayed arrival.",
        "Describe the series of events during your journey to the hotel using linking expressions.",
        "Welcome! We expected you at four, and now it's nine. What happened on your journey?", "curious"),
      sc("Dr. Patel", "university advisor", "to hear about your experience travelling to a recent academic conference",
        "You meet Dr. Patel in her office to discuss your recent trip to a conference.",
        "Share the main events of your journey to the conference using story-linking expressions.",
        "I heard your trip to the conference had a few surprises. What happened along the way?", "friendly"),
      sc("Mr. Harris", "examiner", "to assess your ability to describe a sequence of events",
        "You are in a speaking exam and Mr. Harris asks you to describe a memorable journey.",
        "Clearly retell the events of an eventful journey using linking expressions.",
        "Tell me about a journey that did not go as planned. What happened first, and what happened next?", "curious"),
    ],
  },
  {
    id: "b1-a-story-worth-telling",
    topic: "telling a longer story about something that happened to you",
    objectives: [
      "Start and develop a story about a personal experience.",
      "Use linking phrases to connect events in a story.",
      "Finish a story with a clear ending or result.",
    ],
    goal: "Tell a clear and interesting story about something that happened to you, using linking phrases.",
    target: "Phrases for telling a story: you won't believe, it turned out, in the end. Linking events clearly.",
    correction: "Gently prompt the learner to use the target phrases and help connect their story events.",
    summary: "You learned how to tell a longer story about something that happened to you. You practised using linking phrases to make your story clear and interesting.",
    minutes: 7,
    points: [
      {
        form: "you won't believe",
        claims: [
          "Use 'you won't believe' to start a story or introduce a surprising part.",
          "It makes the listener curious about what happened.",
        ],
        ex: [
          "You won't believe what happened to me yesterday.",
          "You won't believe who I met at the store.",
        ],
      },
      {
        form: "it turned out",
        claims: [
          "Use 'it turned out' to explain the result or what you discovered in the story.",
          "It often shows that the truth was different from what you expected.",
        ],
        ex: [
          "It turned out the restaurant was closed.",
          "It turned out she was my neighbour.",
        ],
      },
      {
        form: "in the end",
        claims: [
          "Use 'in the end' to finish your story or show the final result.",
          "It helps the listener understand how the story finished.",
        ],
        ex: [
          "In the end, we found a new place to eat.",
          "In the end, everything was fine.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — you won't believe
      fc("p1", "You won't ___ who I saw at the airport!", ["believe", "believing", "to believe"]),
      spk("p1", "You won't believe what happened on my way home."),
      chat("p1", ["Hi! How was your weekend?", null], [
        "You won't believe it. I met a famous singer!",
        "You won't believes it. I met a famous singer!",
        "You won't believing it. I met a famous singer!",
      ]),
      // p2 — it turned out
      fc("p2", "We waited for an hour, but it turned ___ the shop was closed.", ["out", "up", "off"]),
      sit("p2", "You thought someone had stolen your phone. Later you found it under your bed. What do you say?", [
        "It turned out my phone was under the bed.",
        "It turned my phone was under the bed.",
        "It turned out my phone were under the bed.",
      ]),
      lc("p2", "It turned out she was my neighbour's sister.", ["She turned around and saw my neighbour's sister.", "It was hard to find my neighbour's sister."]),
      // p3 — in the end
      fc("p3", "We got lost twice, but ___ the end we found the hotel.", ["in", "on", "of"]),
      sit("p3", "You missed your flight, waited six hours and finally got home at midnight. How do you finish the story?", [
        "In the end, I got home at midnight.",
        "In end, I got home at midnight.",
        "In the end, I get home at midnight last night.",
      ]),
      la("p3", "In the end, we took a taxi home.", ["take"]),
      // mix
      chat("mix", ["Did you find your wallet?", null], [
        "Yes! It turned out it was in my coat, so in the end everything was fine.",
        "Yes! It turned out it was in my coat, so in an end everything was fine.",
        "Yes! It turned it was in my coat, so in the end everything was fine.",
      ]),
      spk("mix", "You won't believe it, but in the end we won the game."),
    ],
    success: "The learner tells a story about something that happened to them, using all three target phrases naturally.",
    minUses: 1,
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase do you use to start a surprising story?", [
        "You won't believe",
        "In the end",
        "It turned out",
      ], 0),
      qfill("___, I passed the test even though I was nervous.", ["In the end","in the end"]),
      qmcq("Which phrase explains a result you did not expect?", [
        "It turned out",
        "You won't believe",
        "In the end",
      ], 0),
      qfill("I thought I lost my wallet, but ___ it was in my pocket.", ["it turned out","It turned out"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to hear an interesting story from you",
        "You and your friend Sophie are having dinner together at your home.",
        "Tell Sophie a clear and interesting story about something that happened to you, using linking phrases.",
        "I had a boring day, so cheer me up! Did anything surprising happen to you recently?", "curious"),
      sc("David", "colleague", "to swap funny or surprising work stories with you",
        "You and your colleague David are chatting in the break room during lunch.",
        "Tell David a story about something that happened to you, using linking phrases.",
        "I need a good laugh. Did anything funny happen to you at work this month?", "friendly"),
      sc("Maria", "fellow traveller", "to hear about your most memorable travel experience",
        "You and Maria are sitting together in a hostel common room, talking about travel adventures.",
        "Tell Maria a story about something that happened to you while travelling, using linking phrases.",
        "I love travel stories! Did anything strange happen to you on a trip?", "curious"),
      sc("Alex", "classmate", "to hear about your most interesting experience at school",
        "You and Alex are having coffee after class, talking about school experiences.",
        "Tell Alex a story about something that happened to you at school, using linking phrases.",
        "That class was so boring! Did anything crazy ever happen to you at school?", "friendly"),
      sc("Mr. Carter", "examiner", "to hear you tell a clear and interesting story using linking phrases",
        "You are sitting in a speaking exam room with Mr. Carter, who is asking about your experiences.",
        "Tell Mr. Carter a clear and interesting story about something that happened to you, using linking phrases.",
        "Tell me about something surprising that happened to you. How did it end?", "curious"),
    ],
  },
  {
    id: "b1-ive-lived-here-for-years",
    topic: "present perfect with for and since",
    objectives: [
      "Form present perfect sentences using for and since.",
      "Choose correctly between for and since to express duration or starting point.",
      "Talk about how long something has happened using present perfect.",
    ],
    goal: "Can say how long you have done something in your life using present perfect with for and since.",
    target: "I've lived here for a long time / since I was...",
    correction: "Model the correct use of for or since and prompt the learner to repeat the sentence.",
    summary: "You learned how to use present perfect with for and since. You learned to say how long something has happened.",
    minutes: 8,
    points: [
      {
        form: "present perfect with for",
        claims: [
          "Use have or has plus past participle to make the present perfect.",
          "Use 'for' to show how long a continuing state or activity has lasted.",
          "For goes before a period of time, like 'three years' or 'a long time'.",
          "Don't use the present simple for this: say 'I've lived here for years', not 'I live here for years'.",
        ],
        ex: [
          "I've lived here for three years.",
          "She has worked here for a long time.",
        ],
      },
      {
        form: "present perfect with since",
        claims: [
          "Use since to show the starting point of an action that continues until now.",
          "Since goes before a specific time or event, like '2019' or 'I was a child'.",
        ],
        ex: [
          "I've lived here since I was ten.",
          "He has studied English since last year.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — present perfect + for
      fc("p1", "We've had this car ___ six years.", ["for", "since", "from"]),
      arr("p1", "I've lived here for a long time.", ["live"]),
      chat("p1", ["How long has your sister worked at the hospital?", null], [
        "She has worked there for ten years.",
        "She has worked there since ten years.",
        "She works there for ten years.",
      ]),
      lc("p1", "They've been friends for twenty years.", ["They became friends at school.", "They were friends a long time ago."]),
      sit("p1", "You moved to this city many years ago and you still live here. What do you say?", [
        "I've lived here for a long time.",
        "I live here for a long time.",
        "I've live here for a long time.",
      ]),
      // p2 — present perfect + since
      fc("p2", "I've worn glasses ___ I was twelve.", ["since", "for", "from"]),
      chat("p2", ["How long have you known Maria?", null], [
        "Since we were at school together.",
        "For we were at school together.",
        "Since we are at school together.",
      ]),
      spk("p2", "I've lived here since I was a child."),
      la("p2", "He's worked at the bank since last summer.", ["work"]),
      // mix
      sit("mix", "You started learning English at age ten. That was fifteen years ago, and you still study it. Which sentence is correct?", [
        "I've studied English since I was ten.",
        "I've studied English since fifteen years.",
        "I study English since I was ten.",
      ]),
      chat("mix", ["Do you know this town well?", null], [
        "Yes, I've lived here for a long time, since I was a teenager.",
        "Yes, I live here for a long time, since I was a teenager.",
        "Yes, I've lived here since a long time, since I was a teenager.",
      ]),
    ],
    success: "Uses present perfect with for or since to talk about duration or starting point.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I've lived here since five years.",
        "I've lived here for five years.",
        "I've lived here from five years.",
      ], 1),
      qfill("He has worked at the company ___ 2020.", ["since"]),
      qmcq("Choose the correct word: She has played tennis ___ she was a child.", [
        "for",
        "since",
        "during",
      ], 1),
      qfill("I've known him ___ a long time.", ["for"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to learn more about you as her new neighbour",
        "You meet your neighbour Sophie in the hallway of your apartment building.",
        "Tell Sophie how long you have lived in the building using present perfect with for and since.",
        "Hi, I don't think we've met. I moved in last week. How long have you lived here?", "curious"),
      sc("David", "colleague", "to get to know his team members better",
        "You are having coffee with a colleague during a break at work.",
        "Tell David how long you have worked at the company using present perfect with for and since.",
        "I've worked here for two months, so I'm still new. How long have you worked here?", "friendly"),
      sc("Linda", "hotel receptionist", "to chat with guests and learn about their stay",
        "You are checking in at a hotel and chatting with the receptionist.",
        "Tell Linda how long you have been in this city using present perfect with for and since.",
        "Welcome! I've lived in this city since I was a child. How long have you been here?", "curious"),
      sc("Mr. Carter", "teacher", "to learn more about his students' backgrounds",
        "Your teacher is asking students about their lives at the beginning of the semester.",
        "Tell Mr. Carter how long you have studied at this school using present perfect with for and since.",
        "I've taught at this school for ten years. How long have you studied here?", "friendly"),
      sc("Ms. Green", "examiner", "to assess your speaking skills",
        "You are in a speaking exam and the examiner is asking about your life.",
        "Tell Ms. Green how long you have lived in your current city using present perfect with for and since.",
        "Let's talk about where you live. How long have you lived in your current town?", "curious"),
    ],
  },
  {
    id: "b1-have-you-finished-yet",
    topic: "present perfect vs past simple by time period",
    objectives: [
      "Choose present perfect or past simple based on the time period mentioned.",
      "Use 'have you finished', 'I did that', and 'not yet' correctly in context.",
    ],
    goal: "Can ask and answer about completed and uncompleted tasks using the correct tense for the time period.",
    target: "have you finished, I did that, not yet",
    correction: "Prompt the learner to check if the time period is finished or not, and reformulate using the correct tense.",
    summary: "You learned how to choose between present perfect and past simple based on the time period. You practised using 'have you finished', 'I did that', and 'not yet' in real situations.",
    minutes: 8,
    points: [
      {
        form: "present perfect for unfinished time",
        claims: [
          "Use present perfect for actions in a time period that is not finished (like today, this week, this year).",
          "Do not use a finished past time with present perfect (not 'yesterday', not 'last week').",
        ],
        ex: [
          "Have you finished your homework today?",
          "I haven't seen him this week.",
        ],
      },
      {
        form: "past simple for finished time",
        claims: [
          "Use past simple for actions in a finished time period (like yesterday, last week, in 2010).",
          "When you add a finished time to your answer, use the past simple: Yes, I did that yesterday.",
        ],
        ex: [
          "I did that yesterday.",
          "She called me last night.",
        ],
      },
      {
        form: "not yet with present perfect",
        claims: [
          "Use 'not yet' with present perfect to say something is still not finished in the current time period.",
          "'Yet' goes at the end of questions and negatives: I haven't finished it yet.",
        ],
        ex: [
          "Have you finished your report? Not yet.",
          "I have not finished my lunch yet.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — present perfect, unfinished time
      fc("p1", "___ you finished any books this week?", ["Have", "Did", "Are"]),
      sit("p1", "It is Friday morning. You want to know if your friend has completed the report. The week is not over. What do you ask?", [
        "Have you finished the report?",
        "Did you finished the report?",
        "Have you finish the report?",
      ]),
      arr("p1", "Have you finished your lunch?", ["finish"]),
      // p2 — past simple, finished time
      fc("p2", "I ___ that last Monday.", ["did", "have done", "do"]),
      chat("p2", ["Can you call the dentist, please?", null], [
        "I did that yesterday.",
        "I have done that yesterday.",
        "I do that yesterday.",
      ]),
      lc("p2", "I sent the email last night.", ["I'll send the email tonight.", "I need to write the email."]),
      // p3 — not yet
      chat("p3", ["Have you booked the hotel?", null], [
        "Not yet. I'll do it tonight.",
        "Not already. I'll do it tonight.",
        "Yet not. I'll do it tonight.",
      ]),
      fc("p3", "I haven't cleaned the kitchen ___.", ["yet", "already", "still"]),
      spk("p3", "Not yet, but I'll finish it today."),
      la("p3", "We haven't paid the bill yet.", ["pay"]),
      // mix
      sit("mix", "Your boss asks about two tasks. You wrote the report yesterday. You haven't called the client. What do you say?", [
        "I did the report yesterday, but I haven't called the client yet.",
        "I have done the report yesterday, but I haven't called the client yet.",
        "I did the report yesterday, but I haven't called the client already.",
      ]),
      fc("mix", "___ you finished? Not yet, I'm on the last page.", ["Have", "Do", "Were"]),
    ],
    success: "The learner chooses the correct tense for the time period and uses the required phrases accurately.",
    quiz: [
      qmcq("Which is correct for something done in 2015?", [
        "I did that in 2015.",
        "I have done that in 2015.",
        "Have you finished that in 2015?",
      ], 0),
      qfill("___ your homework yet?", ["Have you finished"]),
      qmcq("Which answer is correct if you still have work to do today?", [
        "I did that.",
        "Not yet.",
        "I did that yesterday.",
      ], 1),
      qfill("I ___ my report last week.", ["did"]),
    ],
    scenes: [
      sc("Sophie", "housemate", "to check if the chores are done",
        "You are in the kitchen with your housemate, talking about today's chores.",
        "Tell your housemate which chores you have finished and which you have not done yet.",
        "Hey, we had a list of chores for today. Have you finished the laundry yet?", "friendly"),
      sc("Paul", "team leader", "to check the progress on the team tasks",
        "You are at your desk and your team leader wants an update on your tasks for this week.",
        "Report which work tasks you have finished and which are still open.",
        "It's Thursday, and the week is almost over. Have you finished the project report yet?", "busy"),
      sc("Maria", "hotel receptionist", "to check if you have completed all check-in steps",
        "You are at the hotel front desk checking in, and the receptionist is reviewing your documents.",
        "Say which check-in steps you have completed and which you have not done yet.",
        "Welcome! Have you finished filling in the registration form yet?", "curious"),
      sc("Dr. Turner", "seminar tutor", "to see if students have completed their assignments",
        "You are in a seminar and your tutor is checking if everyone has done their homework.",
        "Tell your tutor which assignments you have finished and which are not done yet.",
        "Before we start, have you finished this week's reading yet?", "friendly"),
      sc("Mr. Patel", "examiner", "to test your ability to talk about completed and uncompleted tasks",
        "You are in a speaking exam and the examiner is asking about your recent activities.",
        "Answer questions about tasks you have finished and tasks you have not done yet.",
        "Let's talk about your week. What have you finished, and what haven't you done yet?", "curious"),
    ],
  },
  {
    id: "b1-ive-been-working-on-it",
    topic: "present perfect continuous for an activity still going on",
    objectives: [
      "Form the present perfect continuous to talk about ongoing activities.",
      "Use the present perfect continuous to explain what has been happening up to now.",
    ],
    goal: "Describe what you or others have been doing recently and explain ongoing activities.",
    target: "I've been working, we've been trying, I've been learning",
    correction: "Gently prompt the correct form if the learner uses the wrong tense or structure.",
    summary: "You learned how to form and use the present perfect continuous for activities that are still happening. You practised using it to talk about recent ongoing actions.",
    minutes: 8,
    intents: {
      readiness: "Greet, introduce present perfect continuous for ongoing activities, and check if the learner is ready.",
      teach: "Explain how and when to use the present perfect continuous for activities still happening.",
      questions: "Invite any questions about the form or use before practising.",
      say: "Acknowledge and announce a few practice questions using the target structure.",
    },
    points: [
      {
        form: "have/has been + verb-ing",
        claims: [
          "Use have/has been + verb-ing to talk about actions that started in the past and are still happening now.",
          "Use have for I, you, we, they; use has for he, she, it.",
          "The action is usually still going on, or it has just finished and its result is still visible.",
        ],
        ex: [
          "I've been working all morning.",
          "She's been learning to drive.",
        ],
      },
      {
        form: "how long / since / for",
        claims: [
          "'How long have you been ...?' asks about the duration of an action still going on.",
          "Answer with 'for' plus a length of time, or 'since' plus a starting point.",
        ],
        ex: [
          "How long have you been working here?",
          "I've been learning Spanish for two years.",
          "We've been trying since Monday.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — have/has been + -ing
      fc("p1", "We've been ___ to fix the printer all morning.", ["trying", "try", "tried"]),
      err("p1", "She's been learn Spanish since May.", "learn", "learning"),
      arr("p1", "We've been waiting for the bus.", ["wait"]),
      lc("p1", "She's been working in the garden.", ["She works in a garden.", "She went to the garden."]),
      sit("p1", "You started reading a long novel last week. You are still reading it, on page two hundred. What do you say?", [
        "I've been reading a long novel.",
        "I've been read a long novel.",
        "I'm been reading a long novel.",
      ]),
      // p2 — how long / since / for
      fc("p2", "How long have you ___ living in Berlin?", ["been", "be", "being"]),
      chat("p2", ["How long have you been learning the guitar?", null], [
        "For about two years.",
        "Since about two years.",
        "During about two years.",
      ]),
      sit("p2", "You started waiting for the bus at two. It is now three. What do you say?", [
        "I've been waiting for an hour.",
        "I've been waiting since an hour.",
        "I've been waiting during an hour.",
      ]),
      spk("p2", "I've been learning English for three years."),
      // mix
      la("mix", "We've been trying to sell our car since March.", ["try"]),
      sit("mix", "You started this job in May. It is now October, and you still work here. A new colleague asks how long. What do you say?", [
        "I've been working here since May.",
        "I've been working here for May.",
        "I've been work here since May.",
      ]),
    ],
    success: "The learner uses the present perfect continuous correctly to describe ongoing activities.",
    quiz: [
      qmcq("Choose the correct sentence for an activity that started in the past and is still happening.", [
        "I've been working here since January.",
        "I work here since January.",
        "I will work here since January.",
      ], 0),
      qfill("___ been trying to call you all morning.", ["We've","We have"]),
      qmcq("Which is correct?", [
        "She's been working from home all week.",
        "She been working from home all week.",
        "She is been working from home all week.",
      ], 0),
      qfill("How long ___ been raining?", ["has it"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "To catch up and find out what has been keeping you busy",
        "You meet your neighbour Sophie while taking out the trash in your apartment building.",
        "Explain what you have been doing lately and what you have been learning.",
        "Hi! I haven't seen you for weeks. What have you been doing lately?", "curious"),
      sc("James", "colleague", "To update each other on recent work tasks and team efforts",
        "You and your colleague James are having a quick chat during a coffee break at the office.",
        "Describe your ongoing work and what your team has been trying to finish.",
        "I've been working on the new website all week. What have you been working on?", "busy"),
      sc("Linda", "hotel receptionist", "To make conversation with a guest while checking their booking",
        "You are at the hotel front desk, talking with Linda as she processes your check-in.",
        "Share what you have been doing during your trip and what you have been trying to see.",
        "Welcome back! You've been out all day. What have you been doing in the city?", "friendly"),
      sc("Dr. Patel", "study group advisor", "To check on your progress and group activities",
        "You meet Dr. Patel in the library for a quick update on your group project.",
        "Explain your recent academic activities and what your group has been working on together.",
        "Hello! Your group meets every week. What have you been working on together?", "friendly"),
      sc("Mr. Carter", "examiner", "To assess your ability to talk about ongoing activities",
        "You are sitting in a speaking exam room with Mr. Carter, who is asking about your recent activities.",
        "Describe what has been keeping you busy and what you have been trying to do lately.",
        "Let's talk about your life now. What have you been learning or trying to do lately?", "curious"),
    ],
  },
  {
    id: "b1-how-long-have-you-been-doing-that",
    topic: "present perfect continuous in questions",
    objectives: [
      "Form present perfect continuous questions correctly.",
      "Use present perfect continuous questions to ask about activities and their duration.",
    ],
    goal: "Ask someone what they have been doing and for how long.",
    target: "How long have you been + verb-ing?",
    correction: "Model the correct question form and prompt the learner to repeat.",
    summary: "You learned how to form and use present perfect continuous questions. You can now ask what someone has been doing and for how long.",
    minutes: 8,
    intents: {
      readiness: "Greet, name today's topic (present perfect continuous in questions), ask if ready",
      teach: "Announce the explanation of how to form and use present perfect continuous questions",
      questions: "Invite any question before the exercises",
      say: "Acknowledge and announce a few practice questions",
    },
    points: [
      {
        form: "How long have you been + verb-ing?",
        claims: [
          "Start with 'How long have you been' to ask about the duration of an activity.",
          "Use the base verb plus -ing after 'been'.",
        ],
        ex: [
          "How long have you been studying English?",
          "How long have you been working here?",
        ],
      },
      {
        form: "Have you been + verb-ing?",
        claims: [
          "Use 'Have you been' plus verb-ing to ask if someone has been doing something recently.",
          "This form asks about activity, not duration.",
        ],
        ex: [
          "Have you been feeling okay?",
          "Have you been watching the new show?",
        ],
      },
      {
        form: "for a while / since + starting point",
        claims: [
          "Use 'since' plus a specific time to say when the activity started.",
          "Use 'for' plus a length of time; 'for a while' means for some time.",
        ],
        ex: [
          "I have been living here since last year.",
          "She has been working here since last year.",
          "We've been talking for a while.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — How long have you been + -ing?
      fc("p1", "How long have you been ___ to drive?", ["learning", "learn", "learned"]),
      arr("p1", "How long have you been living here?", ["live"]),
      err("p1", "How long have you been play the piano?", "play", "playing"),
      lc("p1", "How long have you been running?", ["How often do you go running?", "How far did you run?"]),
      // p2 — Have you been + -ing?
      fc("p2", "___ you been sleeping well?", ["Have", "Are", "Do"]),
      chat("p2", ["I've been swimming a lot this month.", null], [
        "Really? Have you been going every day?",
        "Really? Are you been going every day?",
        "Really? Have you going every day?",
      ]),
      sit("p2", "Your friend looks very tired today. You want to ask about the last few nights. What do you ask?", [
        "Have you been sleeping badly?",
        "Have you been sleep badly?",
        "Are you been sleeping badly?",
      ]),
      // p3 — for a while / since
      fc("p3", "We've been talking for a ___, so let's take a break.", ["while", "when", "whole"]),
      chat("p3", ["Have you been waiting long?", null], [
        "Yes, for a while. About forty minutes.",
        "Yes, since a while. About forty minutes.",
        "Yes, for while. About forty minutes.",
      ]),
      fc("p3", "I've been working here ___ May.", ["since", "for", "from"]),
      spk("p3", "I've been living here for a while."),
      // mix
      chat("mix", ["How long have you been playing the violin?", null], [
        "For a while. I started when I was twelve.",
        "Since a while. I started when I was twelve.",
        "For a while. I start when I was twelve.",
      ]),
      la("mix", "Have you been learning Italian for a while?", ["learn"]),
    ],
    success: "The learner forms correct present perfect continuous questions using the required phrases.",
    quiz: [
      qmcq("Choose the correct question:", [
        "How long have you been studying here?",
        "How long you have been studying here?",
        "How long have you study here?",
      ], 0),
      qfill("___ you been working here since last year?", ["Have","have"]),
      qmcq("Which answer uses 'since last year' correctly?", [
        "I have been working here since last year.",
        "I am working here since last year.",
        "I work here since last year.",
      ], 0),
      qfill("How long ___ you been waiting?", ["have","Have"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "find out what you have been doing lately",
        "You meet your neighbour Sophie while taking out the trash in your apartment building.",
        "Ask Sophie what she has been doing and for how long, using present perfect continuous questions.",
        "Hi! I've started a new hobby, and I really love it. Ask me how long I've been doing it. What's your question?", "curious"),
      sc("David", "colleague", "catch up about recent work activities",
        "You and your colleague David are taking a coffee break in the office kitchen.",
        "Ask David about his recent work activities and how long he has been working on them.",
        "I've been working on a secret project at night. Ask me how long. What's your question?", "friendly"),
      sc("Linda", "hostel receptionist", "learn about your travel experiences",
        "You are checking in at a hostel and chatting with Linda at the front desk.",
        "Ask Linda about her experiences and how long she has been working or living in the city.",
        "Welcome! I live and work in this city. Ask me how long I've been working here. What's your question?", "curious"),
      sc("Tom", "study group leader", "get to know your study habits",
        "You join a study group for the first time and Tom introduces himself.",
        "Ask Tom about his studies and how long he has been leading the group.",
        "Hi, welcome to the study group! I lead it. Ask me how long I've been leading it. What's your question?", "friendly"),
      sc("Ms. Carter", "examiner", "assess your ability to ask questions about ongoing activities",
        "You are in an English speaking exam with Ms. Carter in a quiet room.",
        "Ask Ms. Carter what she has been doing and for how long, using present perfect continuous questions.",
        "In this task, you ask the questions. I play the piano. Ask me how long I've been playing it. What's your question?", "curious"),
    ],
  },
  {
    id: "b1-milestones-and-firsts",
    topic: "talking about achievements and turning points in your life",
    objectives: [
      "Use set phrases to describe recent achievements.",
      "State how long it has been since a turning point.",
      "Share an experience that happened for the first time.",
    ],
    goal: "The learner can talk about important changes and achievements in their life using common English phrases.",
    target: "I've just started; it's been about; for the first time",
    correction: "Model the correct phrase and prompt the learner to repeat it exactly.",
    summary: "You learned three phrases to talk about achievements and turning points in your life.",
    minutes: 7,
    intents: {
      readiness: "Greet, name today's topic, and check if the learner is ready to begin.",
      teach: "Announce that you will explain useful phrases for talking about achievements and turning points in life.",
      questions: "Invite the learner to ask any questions about the phrases before starting practice.",
      say: "Acknowledge and announce that you will do a few practice questions using the new phrases.",
    },
    points: [
      {
        form: "I've just started",
        claims: [
          "Use 'I've just started' to say you began something new very recently.",
          "This phrase shows a recent achievement or change.",
        ],
        ex: [
          "I've just started a new job.",
          "I've just started learning English.",
        ],
      },
      {
        form: "it's been about",
        claims: [
          "Use 'it's been about' to say how much time has passed since something important happened.",
          "This phrase helps you describe a turning point in your life.",
          "After the length of time, use 'since' and the past simple: It's been about a year since I moved.",
        ],
        ex: [
          "It's been about two years since I moved here.",
          "It's been about six months since I started my new job.",
        ],
      },
      {
        form: "for the first time",
        claims: [
          "Use 'for the first time' when you do something you had never done before.",
          "This phrase highlights a new experience or achievement.",
        ],
        ex: [
          "I travelled alone for the first time last year.",
          "I tried sushi for the first time recently.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — I've just started
      fc("p1", "I've just ___ a cooking class.", ["started", "start", "starting"]),
      chat("p1", ["You look busy these days. What's new?", null], [
        "I've just started a new job!",
        "I just have started a new job!",
        "I've just start a new job!",
      ]),
      lc("p1", "I've just started learning to swim.", ["I want to start learning to swim.", "I stopped learning to swim."]),
      // p2 — it's been about
      fc("p2", "It's been about a year ___ I moved to London.", ["since", "for", "from"]),
      err("p2", "It's been about two years since I start this job.", "start", "started"),
      spk("p2", "It's been about six months since I moved here."),
      // p3 — for the first time
      fc("p3", "Last summer I saw the sea for the first ___.", ["time", "times", "once"]),
      sit("p3", "Last month you flew in a plane. You had never done it before. What do you say?", [
        "Last month I flew for the first time.",
        "Last month I flew for first time.",
        "Last month I flew for the first times.",
      ]),
      la("p3", "I cooked for my whole family for the first time.", ["cook"]),
      // mix
      sit("mix", "You moved to a new city two years ago. Last week you rode a bike there. You had never done that before. What do you say?", [
        "It's been about two years since I moved here, and last week I rode a bike for the first time.",
        "It's been about two years since I move here, and last week I rode a bike for the first time.",
        "It's been about two years since I moved here, and last week I rode a bike for first time.",
      ]),
      chat("mix", ["How's the new dance class?", null], [
        "I've just started, but last night I danced on stage for the first time!",
        "I've just start, but last night I danced on stage for the first time!",
        "I've just started, but last night I danced on stage for first time!",
      ]),
    ],
    success: "The learner uses the target phrases correctly to talk about achievements or turning points.",
    quiz: [
      qmcq("Which phrase would you use to say you began something new recently?", [
        "I've just started",
        "It's been about",
        "For the first time",
      ], 0),
      qfill("___ three months since I started this job.", ["It's been about","it has been about"]),
      qmcq("Choose the best phrase: I tried skiing ___ last winter.", [
        "for the first time",
        "it's been about",
        "I've just started",
      ], 0),
      qfill("I travelled alone ___ two years ago.", ["for the first time"]),
    ],
    scenes: [
      sc("Lucy", "new neighbour", "to get to know you and share life stories",
        "You meet your new neighbour Lucy while taking out the trash.",
        "Chat with Lucy about important changes and achievements in your life.",
        "Hi, I moved in next door last week! I've just started a new job here too. What's new in your life?", "curious"),
      sc("James", "new colleague", "to learn about your background and share his own",
        "You are having coffee with James, who just joined your team at work.",
        "Talk with James about your achievements and turning points at work.",
        "Hi, I've just started here. It's my first week! How long has it been since you joined the company?", "friendly"),
      sc("Sophia", "hostel roommate", "to swap travel stories and learn about your experiences",
        "You and Sophia are chatting in your shared hostel room abroad.",
        "Share with Sophia some achievements and turning points in your life while travelling.",
        "This is my first trip abroad, and I'm travelling alone for the first time! What did you do for the first time recently?", "curious"),
      sc("Michael", "classmate", "to make friends and talk about study experiences",
        "You meet Michael before your first seminar at university.",
        "Discuss with Michael some important changes and achievements in your academic life.",
        "Hi, I've just started my course here. What about you? Have you started anything new recently?", "friendly"),
      sc("Ms. Carter", "examiner", "to hear about your achievements and important life changes",
        "You are sitting across from Ms. Carter in a speaking exam room.",
        "Respond to Ms. Carter’s questions about your achievements and life turning points.",
        "Tell me about an important change in your life. How long has it been since it happened?", "curious"),
    ],
  },
  {
    id: "b1-where-ive-got-to",
    topic: "describing your progress in something you are working on",
    objectives: [
      "Describe progress on a task or project using common phrases.",
      "Explain what has been completed and what is still left to do.",
      "Express ongoing effort or gradual improvement.",
    ],
    goal: "The learner can update someone on the current status of a long-running project or task using appropriate phrases.",
    target: "so far I've, I still haven't, I'm getting there",
    correction: "Prompt the learner to use the target phrases if missing or incorrect, and model the correct sentence.",
    summary: "You learned how to describe your progress on something you are working on. You practised using 'so far I've', 'I still haven't', and 'I'm getting there' to give updates.",
    minutes: 7,
    points: [
      {
        form: "so far I've",
        claims: [
          "'So far I've' introduces things you have finished or achieved up to now.",
          "Use it to summarise completed steps in a process.",
        ],
        ex: [
          "So far I've finished the first two chapters.",
          "So far I've collected all the materials I need.",
        ],
      },
      {
        form: "I still haven't",
        claims: [
          "'I still haven't' says something has not happened yet, and you expected it to happen by now.",
          "It shows that the task is not complete.",
          "'Still' goes before 'haven't'; 'yet' goes at the end: I haven't finished it yet.",
        ],
        ex: [
          "I still haven't started the final part.",
          "I still haven't solved that problem.",
        ],
      },
      {
        form: "I'm getting there",
        claims: [
          "'I'm getting there' means you are making progress, but you are not finished yet.",
          "It is often used to encourage yourself or show steady improvement.",
        ],
        ex: [
          "It's not done, but I'm getting there.",
          "I'm getting there, just a few more things to do.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — so far I've
      fc("p1", "So far I've ___ three chapters of the book.", ["read", "reading", "reads"]),
      sit("p1", "You are painting your flat. The kitchen and the bedroom are done, but the living room is not. A friend asks how it's going. What do you say first?", [
        "So far I've painted the kitchen and the bedroom.",
        "So far I've painting the kitchen and the bedroom.",
        "So far I've paint the kitchen and the bedroom.",
      ]),
      la("p1", "So far I've saved half of the money.", ["save"]),
      // p2 — I still haven't
      fc("p2", "I ___ haven't called the bank.", ["still", "yet", "already"]),
      chat("p2", ["Have you written your essay?", null], [
        "No, I still haven't written it.",
        "No, I still haven't wrote it.",
        "No, I haven't still written it.",
      ]),
      spk("p2", "I still haven't finished the last part."),
      // p3 — I'm getting there
      chat("p3", ["How's your French? Can you speak it well now?", null], [
        "Not perfectly, but I'm getting there.",
        "Not perfectly, but I'm getting here.",
        "Not perfectly, but I'm get there.",
      ]),
      fc("p3", "It's slow, but I'm getting ___.", ["there", "here", "their"]),
      lc("p3", "It isn't finished, but I'm getting there.", ["It's finished, so I'm going home.", "It isn't open, so I'm not going there."]),
      // mix
      chat("mix", ["How's the website going?", null], [
        "So far I've built the home page, but I still haven't added the photos.",
        "So far I've build the home page, but I still haven't added the photos.",
        "So far I've built the home page, but I still haven't add the photos.",
      ]),
      spk("mix", "I still haven't finished, but I'm getting there."),
    ],
    success: "The learner correctly uses the target phrases to describe progress and what is left to do.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase means you have not finished something yet?", [
        "I still haven't",
        "So far I've",
        "I'm getting there",
      ], 0),
      qfill("___ collected all the data I need.", ["So far I've","So far I have"]),
      qmcq("What can you say to show you are making progress, even if you are not finished?", [
        "I'm getting there.",
        "I still haven't finished.",
        "So far I've done nothing.",
      ], 0),
      qfill("I ___ solved the last problem.", ["still haven't","still have not"]),
    ],
    scenes: [
      sc("Lucy", "friend", "To hear how your big project is going",
        "You and your friend Lucy are having coffee together at a cafe.",
        "Update your friend on how your long-running project is progressing.",
        "Hey! Last time you told me about your big project. How far have you got with it?", "curious"),
      sc("Mark", "team leader", "To get a quick update on your project for the team meeting",
        "You are in the office and your team leader Mark stops by your desk.",
        "Give your team leader a progress update on your work project.",
        "The team meeting is at three. How is your part of the project going so far?", "busy"),
      sc("Sophie", "hostel receptionist", "To check how your travel blog is coming along",
        "You are sitting in the hostel lounge and Sophie, the receptionist, asks about your travel blog.",
        "Tell Sophie how your travel blog is progressing.",
        "You've been writing your travel blog all week. How's it going? What have you written so far?", "friendly"),
      sc("Dr. Green", "university advisor", "To find out how your research project is progressing",
        "You are meeting your advisor Dr. Green in their office at university.",
        "Update your advisor on the progress of your research project.",
        "Let's talk about your research. What have you done so far, and what's still left?", "curious"),
      sc("Mr. Carter", "examiner", "To assess how well you can describe your progress",
        "You are sitting across from Mr. Carter in a speaking exam room.",
        "Describe your progress on a long-term project for the examiner.",
        "Think of something you've been working on for a while. How far have you got?", "friendly"),
    ],
  },
  {
    id: "b1-this-time-next-year",
    topic: "future continuous for something in progress at a future moment",
    objectives: [
      "Form the future continuous tense with will be + verb-ing.",
      "Use the future continuous to describe actions that will be happening at a specific time in the future.",
    ],
    goal: "Describe what you will be doing at a specific moment in the future.",
    target: "will be + verb-ing (future continuous), especially with 'this time next year', 'I'll be working', 'we'll be living'",
    correction: "Model the correct future continuous form and prompt the learner to repeat it.",
    summary: "You learned how to form the future continuous tense with 'will be' plus verb-ing.",
    minutes: 8,
    intents: {
      readiness: "Greet, say today's topic is the future continuous for something in progress at a future moment, and check if the learner is ready.",
      teach: "Announce that you will explain how to use the future continuous tense.",
      questions: "Invite the learner to ask any questions before starting the exercises.",
      say: "Acknowledge and announce that you will do a few practice questions.",
    },
    points: [
      {
        form: "will be + verb-ing",
        claims: [
          "Form the future continuous with will be plus the -ing form of the verb.",
          "Keep the -ing form after 'will be': say 'I'll be working', not 'I'll be work'.",
        ],
        ex: [
          "This time next year, I'll be working in a new job.",
          "At 8 o'clock tomorrow, we will be having dinner.",
        ],
      },
      {
        form: "this time next year",
        claims: [
          "Use the future continuous to talk about something that will be happening at a specific time in the future.",
          "The action will not be finished at that moment.",
        ],
        ex: [
          "This time next year, we'll be living in a different city.",
          "At 10 am, I'll be meeting with my team.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — will be + -ing
      fc("p1", "Don't call at eight. I'll be ___ the kids to bed.", ["putting", "put", "puts"]),
      chat("p1", ["Can I call you at noon tomorrow?", null], [
        "Sorry, at noon we'll be eating lunch.",
        "Sorry, at noon we'll be eat lunch.",
        "Sorry, at noon we're be eating lunch.",
      ]),
      arr("p1", "I'll be driving to work at eight.", ["drive"]),
      lc("p1", "We'll be having dinner at seven.", ["We had dinner at seven.", "We're going out after seven."]),
      spk("p1", "This time tomorrow, I'll be working at home."),
      // p2 — a moment in the future
      fc("p2", "___ next year, we'll be living by the sea.", ["This time", "In this time", "On time"]),
      sit("p2", "Your new job starts next month. In twelve months you will be in the middle of it. What do you say?", [
        "This time next year, I'll be working at my new company.",
        "This time next year, I'll working at my new company.",
        "This time next year, I be working at my new company.",
      ]),
      chat("p2", ["Where do you think you'll be living this time next year?", null], [
        "We'll be living in a bigger flat, I hope.",
        "We'll be live in a bigger flat, I hope.",
        "We'll living in a bigger flat, I hope.",
      ]),
      fc("p2", "At this time ___ week, I'll be lying on a beach.", ["next", "last", "after"]),
      // mix
      la("mix", "This time next year, we'll be living in Spain.", ["live"]),
      sit("mix", "Every Monday at nine you have a team meeting. Next Monday, a friend wants to call you at quarter past nine. What do you say?", [
        "Not then. At quarter past nine I'll be sitting in a meeting.",
        "Not then. At quarter past nine I'll be sit in a meeting.",
        "Not then. At quarter past nine I'm be sitting in a meeting.",
      ]),
    ],
    success: "The learner uses the future continuous form with 'will be + verb-ing' and includes at least one of the required phrases in a correct sentence.",
    quiz: [
      qmcq("Choose the correct future continuous sentence.", [
        "This time next year, I'll be working in London.",
        "This time next year, I am work in London.",
        "This time next year, I will working in London.",
      ], 0),
      qfill("At 9 pm tomorrow, we ___ be having dinner.", ["will","will"]),
      qmcq("What does the future continuous show?", [
        "An action in progress at a future time",
        "A completed action in the past",
        "A general truth",
      ], 0),
      qfill("This time next year, we'll ___ living in a new city.", ["be","be"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to chat about future plans together",
        "You are sitting in a cafe with your friend Lucy, talking about the future.",
        "Describe what you will be doing and where you will be living this time next year.",
        "I've been thinking about the future. This time next year, I'll be living in a new flat! What will you be doing this time next year?", "curious"),
      sc("David", "colleague", "to discuss career plans for the next year",
        "You are having lunch with your colleague David in the office canteen.",
        "Explain what job you expect to be doing and where you will be living a year from now.",
        "Next year our team is moving to a new office. What do you think you'll be working on this time next year?", "friendly"),
      sc("Sophie", "fellow traveller", "to share travel dreams for the future",
        "You meet Sophie at a hostel lounge while travelling abroad.",
        "Describe what you will be doing and where you will be living next year at this time.",
        "I love this trip, but next year I'll be working again. Where do you think you'll be living this time next year?", "curious"),
      sc("Professor Harris", "university advisor", "to learn about your future study or research plans",
        "You are in your advisor’s office discussing your future studies.",
        "Explain what you will be doing and where you will be living this time next year.",
        "Let's talk about your plans. What will you be studying or doing this time next year?", "friendly"),
      sc("Mr. Clark", "examiner", "to hear about your future plans for assessment",
        "You are in a speaking exam room with Mr. Clark, the examiner.",
        "Describe what you will be doing and where you will be living at this time next year.",
        "Imagine your life one year from now. What will you be doing this time next year?", "curious"),
    ],
  },
  {
    id: "b1-ill-have-finished-by-then",
    topic: "future perfect for something completed before a future point",
    objectives: [
      "Form the future perfect tense using will have + past participle.",
      "Use the future perfect to talk about actions that will be completed before a specific time in the future.",
    ],
    goal: "The learner can talk about things that will be finished before a future deadline.",
    target: "I'll have finished, by next month, by the end of",
    correction: "Prompt the correct future perfect form and the time reference if missing.",
    summary: "You learned how to use the future perfect to describe actions completed before a future time.",
    minutes: 8,
    points: [
      {
        form: "will have + past participle",
        claims: [
          "Use will have + past participle to form the future perfect.",
          "The future perfect shows that something will be completed before a future time.",
        ],
        ex: [
          "I'll have finished my project by next month.",
          "They will have left before you arrive.",
        ],
      },
      {
        form: "by + future time",
        claims: [
          "Use by + a future time to show the deadline or moment before which the action will be finished.",
          "'By' means 'not later than'; do not use 'until' or 'since' here.",
        ],
        ex: [
          "We'll have moved by next month.",
          "She will have graduated by the end of this year.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — will have + past participle
      fc("p1", "By Friday, I'll have ___ all the emails.", ["answered", "answer", "answering"]),
      sit("p1", "Your friends' train leaves at six. You will arrive at seven. What do you say?", [
        "They will have left before I arrive.",
        "They will have leave before I arrive.",
        "They will has left before I arrive.",
      ]),
      arr("p1", "We'll have painted the kitchen by Sunday.", ["paint"]),
      lc("p1", "I'll have finished the report by then.", ["I'll start the report then.", "I finished the report last week."]),
      spk("p1", "I'll have finished my course by the summer."),
      // p2 — by + future time
      fc("p2", "I'll have read the whole book ___ next month.", ["by", "until", "since"]),
      sit("p2", "Your exams finish on 30 June. A friend asks about your plans for July. What do you say?", [
        "I'll have finished my exams by the end of June.",
        "I'll have finished my exams until the end of June.",
        "I'll have finished my exams since the end of June.",
      ]),
      chat("p2", ["Will you have sent the photos by tomorrow evening?", null], [
        "Yes, I'll have sent them by then.",
        "Yes, I'll have sent them until then.",
        "Yes, I'll have send them by then.",
      ]),
      la("p2", "He'll have retired by the end of next year.", ["retire"]),
      // mix
      la("mix", "We'll have moved house by the end of May.", ["move"]),
      sit("mix", "You plan to finish your website next week. A client asks if it will be ready next month. What do you say?", [
        "Yes, I'll have finished it by next month.",
        "Yes, I'll have finish it by next month.",
        "Yes, I'll have finished it until next month.",
      ]),
    ],
    success: "Learner produces at least two correct future perfect sentences using the required phrases.",
    quiz: [
      qmcq("Which is the correct future perfect sentence?", [
        "She will have finished the work by Friday.",
        "She finishes the work by Friday.",
        "She will finishing the work by Friday.",
      ], 0),
      qfill("By next month, ___ (move) to a new apartment.", ["we'll have moved","we will have moved"]),
      qmcq("What does the future perfect tense show?", [
        "An action will be completed before a future time.",
        "An action is happening now.",
        "An action happened in the past.",
      ], 0),
      qfill("I think ___ (finish) my homework by next month.", ["I'll have finished","I will have finished"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "find out your plans for the next month",
        "You are chatting with your neighbour Sophie outside your apartment building.",
        "Explain what you will have finished and when you will have moved by next month.",
        "You've been so busy with your flat lately! What will you have finished by next month?", "curious"),
      sc("David", "team leader", "check if your tasks will be done before the project deadline",
        "You are having a quick meeting with your team leader David in the office.",
        "Tell your team leader what you will have finished and if your team will have moved offices by next month.",
        "The deadline is the end of the month. What will you have finished by then?", "busy"),
      sc("Maria", "hotel receptionist", "find out your plans for leaving the hotel",
        "You are talking to Maria at the hotel reception about your stay.",
        "Explain when you will have finished packing and if you will have moved out by next month.",
        "You're staying with us for three weeks. What will you have done in the city by the end of your stay?", "friendly"),
      sc("Dr. Patel", "advisor", "check your progress on your assignments and moving plans",
        "You are meeting your academic advisor Dr. Patel in their office.",
        "Say what you will have finished and if you will have moved by next month.",
        "Let's plan your term. What will you have finished by the end of this month?", "curious"),
      sc("Mr. Clark", "examiner", "assess your ability to talk about future plans completed before a deadline",
        "You are in a speaking exam room with Mr. Clark, the examiner.",
        "Describe what you will have finished and whether you will have moved by next month.",
        "Think about a goal you have. What will you have finished by the end of the year?", "friendly"),
    ],
  },
  {
    id: "b1-likely-bound-to-unlikely",
    topic: "saying how probable you think something is",
    objectives: [
      "Use common phrases to express how likely or unlikely something is.",
      "Choose the right phrase to predict the probability of a plan or event.",
    ],
    goal: "The learner can state how likely or unlikely they think something is to happen.",
    target: "it's likely to, bound to happen, not very likely",
    correction: "Gently prompt the correct phrase if the learner uses a different way to express probability.",
    summary: "You learned three phrases for saying how probable something is. You learned to use 'it's likely to', 'bound to happen', and 'not very likely' to predict outcomes.",
    minutes: 7,
    points: [
      {
        form: "it's likely to",
        claims: [
          "Use 'it's likely to' to say you think something will probably happen.",
          "'It's likely to' is followed by a base verb.",
          "You can also start with a person or thing: The train is likely to be late.",
        ],
        ex: [
          "It's likely to rain tomorrow.",
          "The meeting is likely to start late.",
        ],
      },
      {
        form: "be bound to + verb",
        claims: [
          "Use 'be bound to' plus a base verb to say you are almost sure something will happen.",
          "'Mistakes are bound to happen' means they will almost certainly happen.",
        ],
        ex: [
          "With all these dark clouds, it's bound to rain.",
          "If you never study, mistakes are bound to happen.",
        ],
      },
      {
        form: "not very likely",
        claims: [
          "Use 'not very likely' to say you think something probably will not happen.",
          "You can say 'It's not very likely that...' or put it after a noun: Winning is not very likely.",
        ],
        ex: [
          "It's not very likely that the train will be on time.",
          "Winning the lottery is not very likely.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — likely to
      fc("p1", "The roads are icy, so the bus is ___ to be late.", ["likely", "like", "likes"]),
      sit("p1", "The weather report says there is a seventy percent chance of rain tomorrow. What do you say?", [
        "It's likely to rain tomorrow.",
        "It's likely raining tomorrow.",
        "It's like to rain tomorrow.",
      ]),
      lc("p1", "The shop is likely to close early today.", ["The shop closed early yesterday.", "We went to the shop this morning."]),
      // p2 — be bound to
      fc("p2", "He never checks his work, so mistakes are bound to ___.", ["happen", "happening", "happened"]),
      err("p2", "With this traffic, we're bound to being late.", "being", "be"),
      spk("p2", "Problems like this are bound to happen."),
      // p3 — not very likely
      chat("p3", ["Do you think it will snow here in July?", null], [
        "No, it's not very likely.",
        "No, it's not very like.",
        "No, it's not much likely.",
      ]),
      fc("p3", "It's not very likely ___ he'll come tonight.", ["that", "what", "than"]),
      la("p3", "It's not very likely that we'll win.", ["winning"]),
      // mix
      sit("mix", "Your team has won every game this year. The other team has lost every game. What do you say about Saturday's match?", [
        "We're bound to win, and a draw is not very likely.",
        "We're bound win, and a draw is not very likely.",
        "We're bound to win, and a draw is not very like.",
      ]),
      chat("mix", ["Will the meeting finish on time?", null], [
        "Not very likely. It's likely to run late.",
        "Not very likely. It's likely run late.",
        "Not very like. It's likely to run late.",
      ]),
    ],
    success: "The learner uses the correct phrase to match the probability in each situation.",
    quiz: [
      qmcq("Which phrase means something will probably not happen?", [
        "it's likely to",
        "bound to happen",
        "not very likely",
      ], 2),
      qfill("If you never water the plant, it's ___ to survive.", ["not very likely","not likely"]),
      qmcq("You studied hard for the test. What can you say?", [
        "It's likely to go well.",
        "It's not very likely to go well.",
        "It's bound to be a disaster.",
      ], 0),
      qfill("With all this traffic, being late is ___ happen.", ["bound to","sure to"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to discuss weekend picnic plans and see what you think will happen",
        "You and your friend Sophie are chatting in a park about your group’s plan to have a picnic on Saturday.",
        "Say how likely you think the picnic will happen and if the weather will be good.",
        "Our picnic is on Saturday, but the weather report isn't great. How likely is it that our picnic will really happen?", "curious"),
      sc("Paul", "colleague", "to get your opinion about whether the team project will be finished on time",
        "You are in the office break room talking with your colleague Paul about your team’s project deadline.",
        "Say how likely you think it is that the project will be finished by Friday.",
        "We still have a lot of work, and the deadline is Friday. How likely is it that we'll finish on time?", "busy"),
      sc("Linda", "hotel receptionist", "to reassure you about your room being ready on time",
        "You are at a hotel front desk asking Linda if your room will be ready before check-in time.",
        "Say how likely you think your room will be ready early.",
        "Check-in is at two, and you arrived at eleven. How likely do you think it is that your room will be ready early?", "friendly"),
      sc("Dr. Patel", "academic advisor", "to find out your thoughts about passing the upcoming exam",
        "You are meeting with your academic advisor, Dr. Patel, to discuss your chances of passing an important exam.",
        "Say how likely you think it is that you will pass the exam.",
        "Your exam is next month. How likely is it that you'll pass, do you think?", "curious"),
      sc("Mr. Green", "examiner", "to ask you about your predictions for future plans",
        "You are in a speaking exam with Mr. Green, who is asking about your opinion on future events.",
        "Say how likely you think certain plans or events are to happen.",
        "Think about your plans for next month. Which ones are likely to happen, and which are not very likely?", "friendly"),
    ],
  },
  {
    id: "b1-making-arrangements",
    topic: "fixing plans and confirming details",
    objectives: [
      "Suggest a time or place for a plan using set phrases.",
      "Check if a proposed plan works for others.",
      "Confirm and tentatively agree to a plan.",
    ],
    goal: "The learner can suggest, check, and confirm plans with others using natural English expressions.",
    target: "shall we say, does that suit you, let's pencil it in",
    correction: "Prompt the learner to use the exact phrase from the lesson if they use a different or incorrect expression.",
    summary: "You learned three useful phrases for making and confirming plans.",
    minutes: 7,
    points: [
      {
        form: "shall we say",
        claims: [
          "Use 'shall we say' to suggest a possible time, date, or place for a plan.",
          "It is a polite way to make a suggestion and invite agreement.",
          "Here 'say' means 'suggest', and the time or place comes after it: Shall we say ten o'clock?",
        ],
        ex: [
          "Shall we say 7 pm at the cafe?",
          "We could meet next week. Shall we say Friday?",
        ],
      },
      {
        form: "does that suit you",
        claims: [
          "Use 'does that suit you' to check if the suggested plan is convenient for the other person.",
          "It is a polite way to ask if someone is available or happy with the plan.",
        ],
        ex: [
          "We can meet at 6 pm. Does that suit you?",
          "How about Saturday afternoon? Does that suit you?",
        ],
      },
      {
        form: "let's pencil it in",
        claims: [
          "Use 'let's pencil it in' to tentatively agree to a plan, with the idea that it might change.",
          "It means to make a plan, but not confirm it 100%.",
        ],
        ex: [
          "Let's pencil it in for next Thursday.",
          "If everyone agrees, let's pencil it in.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — shall we say
      fc("p1", "Shall we ___ ten o'clock at the station?", ["say", "tell", "speak"]),
      chat("p1", ["Let's have lunch next week. When are you free?", null], [
        "Shall we say Tuesday at one?",
        "Shall we tell Tuesday at one?",
        "Shall we saying Tuesday at one?",
      ]),
      lc("p1", "Shall we say half past six?", ["Can you call me at six?", "We met at half past six."]),
      // p2 — does that suit you
      fc("p2", "We can meet on Monday morning. Does that ___ you?", ["suit", "suits", "suiting"]),
      sit("p2", "You suggest meeting at five. You want to check if this time is good for your colleague. What do you ask?", [
        "Does that suit you?",
        "Does that suits you?",
        "Is that suit you?",
      ]),
      spk("p2", "Does that suit you?"),
      // p3 — let's pencil it in
      fc("p3", "I'm not sure yet, but let's pencil it ___ for Thursday.", ["in", "on", "out"]),
      sit("p3", "A friend suggests dinner on Friday. You can probably come, but you are not 100% sure. What do you say?", [
        "Let's pencil it in for Friday.",
        "Let's pencil in it for Friday.",
        "Let's pencil on it for Friday.",
      ]),
      chat("p3", ["Friday might work, but I'll know for sure tomorrow.", null], [
        "OK, let's pencil it in, then.",
        "OK, let's pencil in it, then.",
        "OK, let's pencils it in, then.",
      ]),
      // mix
      chat("mix", ["Let's meet to plan the trip. When are you free?", null, "Yes, Sunday is perfect."], [
        "Shall we say Sunday at eleven? Does that suit you?",
        "Shall we say Sunday at eleven? Does that suits you?",
        "Shall we tell Sunday at eleven? Does that suit you?",
      ]),
      sit("mix", "You suggest Thursday at four for a meeting, but the plan may change. What do you say?", [
        "Shall we say Thursday at four? Let's pencil it in.",
        "Shall we say Thursday at four? Let's pencil it on.",
        "Shall we said Thursday at four? Let's pencil it in.",
      ]),
    ],
    success: "The learner uses at least one of the target phrases correctly in context to suggest, check, or confirm a plan.",
    minUses: 1,
    quiz: [
      qmcq("Which phrase is best to politely suggest a time to meet?", [
        "Shall we say",
        "Are you coming",
        "See you",
      ], 0),
      qfill("We are not sure yet, but ___ for now.", ["let's pencil it in","lets pencil it in"]),
      qmcq("You want to check if your plan works for someone. What do you ask?", [
        "Does that suit you?",
        "Are you ready?",
        "Can you help me?",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "friend", "to organise a movie night with friends",
        "Lucy is texting you about organising a movie night with your group of friends.",
        "Agree on a day and time for the movie night and confirm the details.",
        "We all want a movie night soon! When are you free next week?", "friendly"),
      sc("Mark", "colleague", "to schedule a team meeting for a project update",
        "Mark is messaging you and other colleagues to fix a time for the next project meeting.",
        "Suggest a time, check if it works for everyone, and confirm the meeting.",
        "We need a team meeting this week. What day and time work for you?", "busy"),
      sc("Sophie", "tour guide", "to arrange a city tour with your group",
        "Sophie is chatting with you online to organise a sightseeing tour for your group during your trip.",
        "Decide on a date and time for the tour and confirm the plan.",
        "Hello! I'd love to show your group the old town. When would you like to go?", "curious"),
      sc("David", "study group leader", "to arrange the next study group session",
        "David is messaging the group to organise your next study session before exams.",
        "Fix a time for the group to meet and confirm the details.",
        "Exams start soon, so we need one more study session. When shall we meet?", "friendly"),
      sc("Helen", "examiner", "to check your ability to organise plans in English",
        "Helen is acting as an examiner and asks you to organise a meet-up with a group of friends.",
        "Suggest a plan, check if it suits, and confirm the details using natural English.",
        "Imagine I'm your friend and we want to meet for dinner. Suggest a day and a time. What do you say?", "curious"),
    ],
  },
  {
    id: "b1-might-may-could",
    topic: "talking about future possibility that is still open",
    objectives: [
      "Use 'it might', 'we could always', and 'there may be' to discuss future possibilities.",
      "Suggest options that are not decided yet using appropriate phrases.",
    ],
    goal: "The learner can discuss possible plans or options for the future when nothing is decided.",
    target: "'it might', 'we could always', 'there may be' for open future possibilities",
    correction: "Prompt the learner to use one of the target phrases to express the future possibility.",
    summary: "You learned how to talk about future possibilities that are still open. You learned to use 'it might', 'we could always', and 'there may be' for this purpose.",
    minutes: 8,
    points: [
      {
        form: "it might + base verb",
        claims: [
          "'It might' shows that something is possible in the future but not certain.",
          "Use 'it might' before the base form of a verb to talk about a possible action.",
        ],
        ex: [
          "It might rain tomorrow.",
          "It might be a good idea to call her.",
        ],
      },
      {
        form: "we could always + base verb",
        claims: [
          "'We could always' is used to suggest an option for the future that is not decided yet.",
          "Use 'we could always' before the base form of a verb to offer a possible idea.",
          "Here 'always' does not mean 'every time'; it shows one possible option.",
        ],
        ex: [
          "We could always go to the park if the weather is nice.",
          "If the train is late, we could always take a taxi.",
        ],
      },
      {
        form: "there may be + noun",
        claims: [
          "'There may be' is used to say that something could exist or happen in the future.",
          "Use 'there may be' before a noun to talk about possible things or events.",
        ],
        ex: [
          "There may be more tickets available later.",
          "There may be a meeting next week.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it might
      fc("p1", "Take an umbrella. It ___ rain later.", ["might", "mights", "might to"]),
      sit("p1", "You're not sure, but the night could be cold. What do you say?", [
        "It might be cold tonight.",
        "It might is cold tonight.",
        "It mights be cold tonight.",
      ]),
      lc("p1", "It might be closed on Sunday.", ["It was closed on Sunday.", "It's always closed on Sunday."]),
      // p2 — we could always
      fc("p2", "If the restaurant is full, we could always ___ at home.", ["eat", "eating", "to eat"]),
      chat("p2", ["The cinema is sold out tonight!", null], [
        "Oh well, we could always go tomorrow.",
        "Oh well, we could always going tomorrow.",
        "Oh well, we could always to go tomorrow.",
      ]),
      la("p2", "We could always ask your brother for help.", ["asking"]),
      // p3 — there may be
      fc("p3", "There ___ be a problem with the trains tomorrow.", ["may", "mays", "is may"]),
      sit("p3", "You're not sure, but you think the hotel could have a free room tonight. What do you say?", [
        "There may be a free room tonight.",
        "There may is a free room tonight.",
        "There mays be a free room tonight.",
      ]),
      spk("p3", "There may be some traffic on the way."),
      // mix
      chat("mix", ["The hotel might be full when we arrive.", null], [
        "Then we could always try the one next door. There may be rooms there.",
        "Then we could always tried the one next door. There may be rooms there.",
        "Then we could always try the one next door. There may are rooms there.",
      ]),
      sit("mix", "You and a friend are planning a picnic. You aren't sure about the weather, but you have a back-up plan. What do you say?", [
        "It might rain, but we could always eat inside.",
        "It might rains, but we could always eat inside.",
        "It might rain, but we could always eating inside.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases correctly to talk about future possibilities.",
    quiz: [
      qmcq("Which sentence talks about a future possibility?", [
        "It might snow tonight.",
        "It always snows here.",
        "It snowed last week.",
      ], 0),
      qfill("If we are bored, ___ watch a movie.", ["we could always"]),
      qmcq("Choose the best way to suggest a possible event in the future.", [
        "There may be a concert in the park.",
        "There is a concert in the park now.",
        "There was a concert in the park yesterday.",
      ], 0),
      qfill("I am not sure, but ___ enough time to finish.", ["there may be"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to make plans for the weekend",
        "You and your friend are sitting in a cafe, talking about what to do this weekend.",
        "Help Sophie discuss possible plans for the weekend using the target phrases.",
        "I'm free all weekend, but I have no plans yet. What could we do?", "curious"),
      sc("Mark", "colleague", "to decide how to handle an upcoming project deadline",
        "You are in the office break room with a colleague, talking about how to finish a project on time.",
        "Help Mark discuss different options for meeting the deadline using the target phrases.",
        "The deadline is Friday and we're behind. What could we do?", "busy"),
      sc("Lucas", "fellow traveller", "to decide where to go next on your trip",
        "You are in a hostel lounge with another traveller, talking about where to visit next.",
        "Help Lucas discuss possible travel destinations using the target phrases.",
        "We have three days left and no plan. Where might we go next?", "friendly"),
      sc("Priya", "study group member", "to choose a topic for a group presentation",
        "You and your study group are meeting in the library to choose a topic for your presentation.",
        "Help Priya discuss possible presentation topics using the target phrases.",
        "We still need a topic for our presentation. What ideas do you have?", "curious"),
      sc("Mr. Carter", "examiner", "to hear you discuss possible future plans",
        "You are in a speaking exam and the examiner is asking about your future plans.",
        "Talk about your possible future plans using the target phrases.",
        "Your plans for next year aren't fixed yet. What might you do?", "friendly"),
    ],
  },
  {
    id: "b1-the-year-ahead",
    topic: "talking about your plans, hopes and worries for the coming year",
    objectives: [
      "Express personal plans for the coming year using set phrases.",
      "Share hopes and wishes for the future.",
      "Mention worries or uncertainties about the next year.",
    ],
    goal: "The learner can discuss their plans, hopes, and worries for the coming year in a conversation.",
    target: "I'm hoping to, I'd really like, if all goes well",
    correction: "Gently prompt the learner to use the target phrases if they forget or use a less natural alternative.",
    summary: "You learned phrases for talking about your plans, hopes, and worries for the coming year. You practised using 'I'm hoping to', 'I'd really like', and 'if all goes well' in conversation.",
    minutes: 7,
    points: [
      {
        form: "I'm hoping to",
        claims: [
          "Use 'I'm hoping to' to talk about something you want to do in the future.",
          "It shows a plan you want, but you are not sure it will happen.",
          "Follow 'I'm hoping to' with the base form of a verb.",
        ],
        ex: [
          "I'm hoping to travel more this year.",
          "I'm hoping to start a new job soon.",
        ],
      },
      {
        form: "I'd really like",
        claims: [
          "Use 'I'd really like' to express a strong wish or hope for the future.",
          "This phrase is often used for dreams or important goals.",
          "It is followed by 'to' plus the base verb, or by a noun: I'd really like a holiday.",
        ],
        ex: [
          "I'd really like to learn a new language.",
          "I'd really like to spend more time with my family.",
        ],
      },
      {
        form: "if all goes well",
        claims: [
          "Use 'if all goes well' to talk about your plans or hopes when you are not sure what will happen.",
          "This phrase shows that you hope things will work out, but there may be problems.",
          "It is often used at the beginning or end of a sentence about the future.",
        ],
        ex: [
          "If all goes well, I'll finish my studies this year.",
          "I'll move to a new city, if all goes well.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm hoping to
      fc("p1", "I'm hoping ___ visit my cousins in the summer.", ["to", "for", "of"]),
      sit("p1", "You want to move to a bigger flat this year, but you're not sure it will happen. What do you say?", [
        "I'm hoping to find a bigger flat this year.",
        "I'm hoping to finding a bigger flat this year.",
        "I'm hoping find a bigger flat this year.",
      ]),
      la("p1", "I'm hoping to save some money this year.", ["saving"]),
      // p2 — I'd really like
      fc("p2", "I'd really like ___ a cooking course.", ["to take", "to taking", "take"]),
      chat("p2", ["What's your big dream for next year?", null], [
        "I'd really like to run a marathon.",
        "I'd really like run a marathon.",
        "I'd really likes to run a marathon.",
      ]),
      spk("p2", "I'd really like to learn to cook properly."),
      // p3 — if all goes well
      fc("p3", "If all ___ well, we'll move in March.", ["goes", "go", "going"]),
      sit("p3", "You plan to finish your degree in June, but you're not completely sure. What do you say?", [
        "If all goes well, I'll finish my degree in June.",
        "If all go well, I'll finish my degree in June.",
        "If all going well, I'll finish my degree in June.",
      ]),
      lc("p3", "If all goes well, I'll start my own business.", ["If I go, I'll start my own business.", "It all went well, so I started my own business."]),
      // mix
      chat("mix", ["What are your plans for this year?", null], [
        "I'm hoping to change jobs and, if all goes well, move to the coast.",
        "I'm hoping change jobs and, if all goes well, move to the coast.",
        "I'm hoping to change jobs and, if all go well, move to the coast.",
      ]),
      spk("mix", "If all goes well, I'm hoping to buy a car."),
    ],
    success: "The learner uses at least two of the target phrases correctly to talk about their plans, hopes, or worries for the coming year.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase best shows a strong wish for the future?", [
        "I'd really like",
        "I'm hoping to",
        "If all goes well",
      ], 0),
      qfill("___, I will pass all my exams this year.", ["If all goes well","if all goes well"]),
      qmcq("Which sentence is correct?", [
        "I'm hoping to get a new job.",
        "I'm hoping get a new job.",
        "I'm hoping to getting a new job.",
      ], 0),
      qfill("I'd really like ___ more time with my friends.", ["to spend"]),
    ],
    scenes: [
      sc("Sophie", "old friend", "to catch up and hear about your plans for the new year",
        "You meet Sophie at a cozy cafe just after New Year's Day.",
        "Share your plans, hopes, and worries for the coming year with Sophie.",
        "It's so good to see you! It's a new year. What are you hoping to do this year?", "curious"),
      sc("David", "colleague", "to discuss goals and expectations for the year ahead",
        "You and David are having a coffee break at the office on the first week back after the holidays.",
        "Talk about your plans, hopes, and worries for the coming year at work.",
        "Welcome back! I'm hoping to get a promotion this year. What would you really like to do at work this year?", "friendly"),
      sc("Linda", "fellow traveller", "to chat and share New Year plans during a long train journey",
        "You are sitting next to Linda on a train heading to another city in January.",
        "Discuss your plans, hopes, and worries for the coming year while travelling.",
        "It's the start of a new year! I'd really like to learn to dance. What about you? What are you hoping to do?", "friendly"),
      sc("Tom", "classmate", "to talk about study goals and personal hopes for the year",
        "You and Tom are chatting before your first class of the new semester.",
        "Share your academic and personal plans, hopes, and worries for the year with Tom.",
        "Hi! New semester, new goals. What would you really like to achieve this year?", "curious"),
      sc("Mrs. Taylor", "examiner", "to hear you talk about your plans, hopes, and worries for the coming year",
        "You are in a speaking exam room, and Mrs. Taylor is asking you about your future plans.",
        "Describe your plans, hopes, and worries for the coming year in response to her questions.",
        "Let's talk about the year ahead. What are you hoping to do, if all goes well?", "friendly"),
    ],
  },
];
