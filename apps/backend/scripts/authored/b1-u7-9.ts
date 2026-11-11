/** B1 · Ünite 7-9 — dışa aktarılmış çekirdekten (export-authored.ts); tek doğruluk kaynağı bu dosya. */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const B1_U7_9: Authored[] = [
  {
    id: "b1-the-woman-who-called",
    topic: "joining sentences with who, which and that to identify someone",
    objectives: [
      "Join two sentences using who, which, or that to identify people or things.",
      "Use who for people and which/that for things in defining relative clauses.",
    ],
    goal: "The learner can describe or identify a specific person or thing in a group by joining sentences with who, which, or that.",
    target: "people who, something that, anyone who wants",
    correction: "Prompt the learner to use who for people and which or that for things when joining sentences.",
    summary: "You learned how to join sentences using who, which, and that to identify people or things.",
    minutes: 8,
    points: [
      {
        form: "who",
        claims: [
          "Use who to join sentences and identify or describe people.",
          "Who replaces the person in the second sentence.",
        ],
        ex: [
          "She is the person who helps everyone.",
          "People who speak two languages are bilingual.",
          "Anyone who wants to come is welcome.",
        ],
      },
      {
        form: "which and that",
        claims: [
          "Use which or that to join sentences and identify or describe things.",
          "Which and that replace the thing in the second sentence.",
          "That can often replace which in these sentences.",
        ],
        ex: [
          "This is something that makes life easier.",
          "I want a phone which takes good photos.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — who
      fc("p1", "The woman ___ called you is my aunt.", ["who", "which", "where"]),
      arr("p1", "She is the woman who called me.", ["which"]),
      err("p1", "My mum is the person which taught me to cook.", "which", "who"),
      lc("p1", "Anyone who wants a ticket can ask me.", ["Anyone who has a ticket can come in.", "Everyone wants a ticket for the show."]),
      spk("p1", "People who travel a lot learn quickly."),
      // p2 — which / that
      fc("p2", "Do you have a bag ___ is big enough for my laptop?", ["that", "who", "where"]),
      arr("p2", "This is the key that opens the door.", ["who"]),
      sit("p2", "You are describing a thing in your kitchen. It makes coffee very fast. What do you say?", [
        "It's a machine which makes coffee very fast.",
        "It's a machine who makes coffee very fast.",
        "It's a machine which make coffee very fast.",
      ]),
      err("p2", "The milk who was in the fridge has gone bad.", "who", "that"),
      chat("p2", ["What kind of films do you like?", null], [
        "I like films that make me laugh.",
        "I like films who make me laugh.",
        "I like films that makes me laugh.",
      ]),
      // karışık
      chat("mix", ["Who is that man?", null], [
        "He's the man who fixed the car that broke down.",
        "He's the man which fixed the car who broke down.",
        "He's the man who fixed the car who broke down.",
      ]),
      lc("mix", "I need someone who can fix a phone that fell in water.", [
        "I need someone who can fix my phone today.",
        "I know someone who has a phone like that.",
      ]),
    ],
    success: "The learner correctly joins sentences using who, which, or that to identify someone or something.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "People who like music are welcome.",
        "People which like music are welcome.",
        "People that likes music are welcome.",
      ], 0),
      qmcq("This is something ___ makes me happy.", [
        "that",
        "who",
        "where",
      ], 0),
      qmcq("Choose the correct option to complete the sentence: 'Anyone ___ wants to help can join.'", [
        "who",
        "which",
        "where",
      ], 0),
      qmcq("I know people ___ speak three languages.", [
        "who",
        "which",
        "whose",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "neighbour", "to find someone to water her plants while she's away",
        "You are chatting with your neighbour Lucy in the apartment hallway.",
        "Help Lucy choose a person from the building who can water her plants, using the target phrases.",
        "I'm going away next week, and my plants need water every day. Do you know anyone who could help me?", "friendly"),
      sc("David", "office manager", "to assign a special project to the right team member",
        "You are in the office with David, discussing who should take on a new project.",
        "Identify a colleague for the project by describing them with the target phrases.",
        "We need one person for the new project, and it's a lot of work with numbers. What kind of person do we need?", "busy"),
      sc("Sophie", "tour guide", "to organise a group activity based on interests",
        "You are at a hotel lounge with Sophie, the tour guide, talking about group activities.",
        "Help Sophie identify which guests should join a hiking trip, using the target phrases.",
        "I'm planning a long hiking trip for Saturday. What kind of people do you think would enjoy it?", "curious"),
      sc("Mr. Carter", "teacher", "to choose a student for a special class project",
        "You are in the classroom after school, speaking with Mr. Carter about a group project.",
        "Describe a classmate who should be chosen for the project, using the target phrases.",
        "We need a student to help the new classmates this term. What kind of student would be a good choice?", "friendly"),
      sc("Ms. Taylor", "examiner", "to assess your ability to describe people and things",
        "You are sitting in a speaking exam room with Ms. Taylor, the examiner.",
        "Describe a person or thing from a group using the target phrases.",
        "Tell me about something that you use every day. Why is it important to you?", "curious"),
    ],
  },
  {
    id: "b1-my-brother-who-lives-abroad",
    topic: "adding extra information with commas around the added part",
    objectives: [
      "Recognise and use commas to add extra information to a sentence.",
      "Add extra detail about people or things using a clause with commas.",
    ],
    goal: "Describe people or things by adding extra information in a sentence using commas.",
    target: "Sentences with extra information (non-defining relative clauses) set off by commas, e.g. 'my brother, who lives in Paris, is visiting.'",
    correction: "Point out missing or incorrect commas and ask the learner to add or correct them.",
    summary: "You learned how to add extra information to a sentence using commas. You learned to use commas to separate extra details about people or things.",
    minutes: 8,
    intents: {
      readiness: "Greet, introduce adding extra information with commas, and check if the learner is ready.",
      teach: "Explain how to add extra information to a sentence using commas.",
      questions: "Invite questions about adding extra information with commas.",
      say: "Acknowledge and announce practice exercises with commas and extra information.",
    },
    points: [
      {
        form: "commas around extra information",
        claims: [
          "Use commas to separate extra information from the main part of the sentence.",
          "The extra information is not necessary to identify the person or thing.",
          "The sentence is still correct if you remove the part between commas.",
          "If the extra information comes at the end of the sentence, use one comma before it.",
        ],
        ex: [
          "My brother, who lives in London, is coming to visit.",
          "The cake, which was lovely, disappeared quickly.",
          "I visited my brother, who lives abroad.",
        ],
      },
      {
        form: "who/which + extra detail",
        claims: [
          "Use 'who' for people and 'which' for things when adding extra information.",
          "Do not use 'that' for extra information between commas: say 'The cake, which was lovely,' not 'The cake, that was lovely,'.",
          "'Who happens to be' adds a fact that is true by chance: My neighbour, who happens to be a nurse, helped me.",
        ],
        ex: [
          "My friend, who happens to be a doctor, helped me.",
          "The park, which was lovely, was full of people.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — commas around extra information
      sit("p1", "You have only one brother. He lives in Canada and he is a chef. Which sentence is correct?", [
        "My brother, who lives in Canada, is a chef.",
        "My brother who lives in Canada, is a chef.",
        "My brother, who lives in Canada is a chef.",
      ]),
      la("p1", "My sister, who lives in Spain, is coming tomorrow.", ["which"]),
      sit("p1", "Take the extra information out of this sentence: 'My car, which is very old, still works.' What is left?", [
        "My car still works.",
        "My car is very old.",
        "Which is very old still works.",
      ]),
      spk("p1", "My brother, who lives abroad, calls me every week."),
      // p2 — who / which + extra detail
      fc("p2", "Our new office, ___ is near the station, is very bright.", ["which", "who", "that"]),
      err("p2", "My uncle, which happens to be a cook, made dinner.", "which", "who"),
      chat("p2", ["How was your holiday?", null], [
        "Our hotel, which was lovely, was right by the sea.",
        "Our hotel, who was lovely, was right by the sea.",
        "Our hotel, which were lovely, was right by the sea.",
      ]),
      sit("p2", "You are telling a colleague about your neighbour. By chance, she is a doctor, and she helped you when you were ill. What do you say?", [
        "My neighbour, who happens to be a doctor, helped me.",
        "My neighbour, which happens to be a doctor, helped me.",
        "My neighbour, who happen to be a doctor, helped me.",
      ]),
      lc("p2", "My cousin, who happens to be a pilot, flew us home.", [
        "My cousin, who wants to be a pilot, flew home.",
        "My cousin, who is a teacher, drove us home.",
      ]),
      // karışık
      sit("mix", "You have one aunt. She is a teacher, and she lives near you. You add the extra information. Which sentence is correct?", [
        "My aunt, who is a teacher, lives near us.",
        "My aunt who is a teacher, lives near us.",
        "My aunt, which is a teacher, lives near us.",
      ]),
      la("mix", "My grandmother, who is ninety, still swims.", ["which"]),
    ],
    success: "The learner adds extra information about a person or thing using at least one of the required phrases.",
    minUses: 1,
    quiz: [
      qmcq("Which sentence uses commas correctly to add extra information?", [
        "My brother, who lives in Paris is here.",
        "My brother, who lives in Paris, is here.",
        "My brother who, lives in Paris, is here.",
      ], 1),
      qfill("The party, ___ was lovely, ended late.", ["which","Which"]),
      qmcq("Choose the correct way to add extra information about a person.", [
        "My friend, who is a teacher, lives nearby.",
        "My friend, who is a teacher lives nearby.",
        "My friend who, is a teacher, lives nearby.",
      ], 0),
      qfill("My sister, ___ happens to be a doctor, is very busy.", ["who","Who"]),
    ],
    scenes: [
      sc("Sophie", "friend", "find out more about your family and recent events",
        "You are chatting with your friend Sophie at a cafe about your weekend.",
        "Describe a family member and something that happened using extra information with commas.",
        "You spent the weekend with your family, right? Who was there, and how was it?", "curious"),
      sc("Mark", "colleague", "learn more about your background during a coffee break",
        "You and your colleague Mark are having coffee and talking about your families.",
        "Describe a family member and an event, adding extra information using commas.",
        "You mentioned your brother earlier. Where does he live, and what does he do?", "friendly"),
      sc("Linda", "hotel receptionist", "make conversation while checking you in",
        "You are checking into a hotel and chatting with the receptionist.",
        "Describe someone who is travelling with you, adding extra information with commas.",
        "Welcome! Your booking is for two people. Who is travelling with you?", "friendly"),
      sc("Dr. Patel", "university advisor", "learn about your support system as a student",
        "You are meeting your academic advisor to discuss your support network.",
        "Describe a family member or friend, adding extra information with commas.",
        "Studying can be hard. Who in your family helps you most, and what are they like?", "curious"),
      sc("Mr. Harris", "examiner", "assess your ability to describe people using extra information",
        "You are in a speaking exam and the examiner asks about your family.",
        "Describe a family member and give extra information using commas.",
        "Tell me about a family member who is important to you. Where do they live, and what do they do?", "friendly"),
    ],
  },
  {
    id: "b1-the-place-where-we-met",
    topic: "using where, when and whose to join sentences",
    objectives: [
      "Join two sentences using where, when, or whose.",
      "Choose the correct word (where, when, whose) based on the information joined.",
      "Produce sentences using where, when, and whose in context.",
    ],
    goal: "Describe places, times, or people with extra information in one sentence.",
    target: "Sentences joined using where, when, or whose (e.g. 'the place where we met', 'the day when it happened', 'the friend whose name is Anna').",
    correction: "Point out if the wrong joining word is used and prompt the correct one for place, time, or possession.",
    summary: "You learned how to join sentences using where, when, and whose. You learned to describe places, times, and people with extra information.",
    minutes: 8,
    intents: {
      readiness: "greet, name today's topic (joining sentences with where, when, whose), ask if ready",
    },
    points: [
      {
        form: "where",
        claims: [
          "Use where to join sentences about a place.",
          "Put 'where' after a place word (house, cafe, town) and then say what happens or happened there.",
        ],
        ex: [
          "This is the cafe where we met.",
          "I remember the house where I grew up.",
        ],
      },
      {
        form: "when",
        claims: [
          "Use when to join sentences about a time or date.",
          "Put 'when' after a time word (day, year, season) and then say what happens or happened at that time.",
        ],
        ex: [
          "That was the day when it happened.",
          "Summer is the season when we travel.",
        ],
      },
      {
        form: "whose",
        claims: [
          "Use whose to join sentences about a person and something they have or own.",
          "'Whose' replaces his, her or their: I met a man. His car is red. = I met a man whose car is red.",
        ],
        ex: [
          "She is the friend whose name is Anna.",
          "I met a man whose car is red.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — where
      fc("p1", "This is the park ___ I learned to ride a bike.", ["where", "when", "whose"]),
      arr("p1", "I visited the town where my father was born.", ["when"]),
      sit("p1", "You are showing a friend the hospital. You were born there. What do you say?", [
        "That's the hospital where I was born.",
        "That's the hospital when I was born.",
        "That's the hospital whose I was born.",
      ]),
      // p2 — when
      fc("p2", "I'll never forget the day ___ I started my first job.", ["when", "where", "whose"]),
      lc("p2", "That was the summer when we moved to the city.", [
        "That was the summer we went to the sea.",
        "This is the city where we live now.",
      ]),
      chat("p2", ["When did you meet your best friend?", null], [
        "It was on the day when I started school.",
        "It was on the day who I started school.",
        "It was on the day whose I started school.",
      ]),
      // p3 — whose
      fc("p3", "I have a neighbour ___ cat sleeps in my garden.", ["whose", "who", "who's"]),
      err("p3", "I know a man who daughter is a doctor.", "who", "whose"),
      sit("p3", "You met a man at a party. His sister works with you. What do you say about him?", [
        "I met a man whose sister works with me.",
        "I met a man who sister works with me.",
        "I met a man whose sister work with me.",
      ]),
      spk("p3", "I have a friend whose brother is a pilot."),
      // karışık
      pairs("mix", [
        ["This is the cafe", "where we first met."],
        ["That was the year", "when we got married."],
        ["He's the boy", "whose bike was stolen."],
      ]),
      la("mix", "That's the house where we lived when I was small.", ["whose"]),
    ],
    success: "The learner correctly joins sentences using where, when, or whose and uses at least two of the required phrases.",
    quiz: [
      qmcq("Choose the correct word: This is the friend ___ name is Sarah.", [
        "whose",
        "where",
        "when",
      ], 0),
      qmcq("Do you remember the year ___ it happened?", [
        "when",
        "where",
        "whose",
      ], 0),
      qmcq("Choose the correct word: That is the restaurant ___ we met.", [
        "when",
        "whose",
        "where",
      ], 2),
      qfill("She met a boy ___ dog is very friendly.", ["whose"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to hear an interesting story about a place you know",
        "You are chatting with your friend Lucy at a cafe, sharing stories about special places.",
        "Describe a place that has a story, using 'where we met', 'whose name is', and 'when it happened'.",
        "Where did you first meet your best friend, and when was it?", "curious"),
      sc("Martin", "colleague", "to learn more about your experiences for a team-building activity",
        "You are in the office break room with Martin, talking about memorable places related to work.",
        "Describe a place with a story, using 'where we met', 'whose name is', and 'when it happened'.",
        "For our team day, everyone shares a story. Is there a place that's special to you because of something that happened there?", "friendly"),
      sc("Sophie", "hotel receptionist", "to learn about your favourite travel memories for a guest book",
        "You are at a hotel reception desk, and Sophie asks about a memorable place from your travels.",
        "Describe a place from your travels, using 'where we met', 'whose name is', and 'when it happened'.",
        "I'm collecting travel memories for our guest book. Which place will you never forget, and what happened there?", "friendly"),
      sc("Dr. Patel", "university advisor", "to get you to practise complex sentences for your class presentation",
        "You are meeting with Dr. Patel in his office to discuss how to describe places for your assignment.",
        "Describe a place with a story, using 'where we met', 'whose name is', and 'when it happened'.",
        "For your presentation, think of a place that matters to you. Who did you meet there, and when?", "curious"),
      sc("Mr. Green", "examiner", "to assess how well you can join sentences using relative clauses",
        "You are in a speaking exam with Mr. Green, who asks about places with stories.",
        "Describe a place with a story, using 'where we met', 'whose name is', and 'when it happened'.",
        "Describe a place that is special to you. What happened there, and when did it happen?", "curious"),
    ],
  },
  {
    id: "b1-a-nice-old-wooden-table",
    topic: "order of describing words before a noun",
    objectives: [
      "Put describing words in the correct order before a noun.",
      "Use phrases like 'nice old', 'small round', and 'big red one' correctly.",
    ],
    goal: "Describe objects clearly and naturally by putting describing words in the right order.",
    target: "adjective order before a noun (e.g., 'nice old chair', 'big red one')",
    correction: "Model the correct order and prompt the learner to repeat with the right sequence.",
    summary: "You learned the order describing words go in before a noun. You practised using phrases like 'nice old', 'small round', and 'big red one'.",
    minutes: 8,
    points: [
      {
        form: "adjective order before a noun",
        claims: [
          "When using more than one describing word before a noun, the usual order is opinion, size, age, shape, colour, then material, then the noun.",
          "Say 'nice old', not 'old nice'; say 'big red', not 'red big'.",
          "Use 'one' after describing words if you do not repeat the noun.",
        ],
        ex: [
          "I like that nice old table.",
          "She wants the big red one.",
        ],
      },
      {
        form: "what is it made of",
        claims: [
          "Material words come last, closest to the noun: a wooden table, a leather bag.",
          "A material word almost never takes 'very' or a comparative form.",
        ],
        ex: [
          "It's a nice old wooden table.",
          "She bought a small round metal tray.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — adjective order
      fc("p1", "I bought a ___ sofa for the living room.", ["lovely big", "big lovely", "lovely bigs"]),
      la("p1", "We stayed in a lovely little house.", ["littles"]),
      sit("p1", "Your friend asks which bag is yours. Yours is small and black. The other bags are big. What do you say?", [
        "It's the small black one.",
        "It's the black small one.",
        "It's the small black ones.",
      ]),
      chat("p1", ["What did you buy at the market?", null], [
        "A lovely old mirror.",
        "An old lovely mirror.",
        "A lovely old mirrors.",
      ]),
      spk("p1", "It's a lovely old house."),
      // p2 — material last
      fc("p2", "I'd like a ___ bag, please.", ["small leather", "leather small", "small leathers"]),
      sit("p2", "You are describing your table to a friend. It is round and made of glass. What do you say?", [
        "It's a round glass table.",
        "It's a glass round table.",
        "It's a round glasses table.",
      ]),
      la("p2", "He gave me a nice silver ring.", ["silvers"]),
      lc("p2", "I'm looking for a cheap wooden chair.", [
        "I'm looking for a cheap white chair.",
        "I'm looking for a cheap wooden table.",
      ]),
      // karışık
      sit("mix", "You lost your bag. It is big and old, and it is made of leather. What do you tell the man at the lost property office?", [
        "It's a big old leather bag.",
        "It's a leather big old bag.",
        "It's an old big leather bag.",
      ]),
      chat("mix", ["Can I help you?", null], [
        "Yes, I'm looking for a nice small wooden box.",
        "Yes, I'm looking for a wooden nice small box.",
        "Yes, I'm looking for a small nice wooden box.",
      ]),
    ],
    success: "Learner puts describing words in the correct order before a noun at least twice.",
    quiz: [
      qmcq("Which is the correct order?", [
        "nice old chair",
        "old nice chair",
        "chair nice old",
      ], 0),
      qmcq("I want the ___ table, please.", [
        "small round",
        "round small",
        "smalls round",
      ], 0),
      qmcq("Choose the correct phrase.", [
        "big red one",
        "red big one",
        "one red big",
      ], 0),
      qmcq("She bought a ___ wooden lamp at the market.", [
        "lovely old",
        "old lovely",
        "lovely olds",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "market seller", "Help you choose the furniture you want",
        "You are at a busy second-hand market, talking to a seller about different pieces of furniture.",
        "Describe which pieces of furniture you are interested in using the correct order of describing words.",
        "Welcome to my stall! I've got tables, chairs and lamps in every size and colour. What kind of furniture are you looking for?", "friendly"),
      sc("David", "office manager", "Find out which furniture to buy for the new office",
        "You are discussing furniture options for a new office space with your manager.",
        "Describe the furniture options clearly so your manager knows which items you mean.",
        "We need a new table and some chairs for the meeting room. What kind should we buy?", "curious"),
      sc("Sophie", "hostel receptionist", "Help you choose furniture for your hostel room",
        "You are staying at a hostel abroad and talking to the receptionist about choosing furniture for your room.",
        "Describe the furniture you want for your room using the correct order of describing words.",
        "We have two free rooms. One has a big red sofa, and the other has a small blue one. Which room would you like?", "friendly"),
      sc("Tom", "classmate", "Decide which furniture to use for a group project display",
        "You and your classmates are choosing furniture for a school project display.",
        "Describe the furniture options so your group can agree on what to use.",
        "We need a table and two chairs for our project display. What kind of table should we look for?", "curious"),
      sc("Mrs. Carter", "examiner", "Hear you describe furniture clearly",
        "You are in a speaking exam with Mrs. Carter, talking about furniture in your home.",
        "Describe a piece of furniture you own using the correct order of describing words.",
        "Can you describe your favourite piece of furniture at home?", "friendly"),
    ],
  },
  {
    id: "b1-hard-to-describe",
    topic: "describing something when you do not know the exact word",
    objectives: [
      "Use set phrases to describe an object when the exact word is unknown",
      "Ask for help finding the correct word",
      "Compare the unknown item to something similar",
    ],
    goal: "The learner can describe an object or concept when they do not know the exact English word, especially in a shop or similar situation.",
    target: "it's a kind of, sort of like, what do you call",
    correction: "Model the correct phrase and prompt the learner to repeat it accurately.",
    summary: "You learned set phrases for describing something when you do not know the exact word.",
    minutes: 7,
    points: [
      {
        form: "it's a kind of",
        claims: [
          "Use 'it's a kind of' + a general word (tool, food, machine) when you do not know the exact name of something.",
          "This phrase introduces a general category or type.",
        ],
        ex: [
          "It's a kind of tool for tightening screws.",
          "It's a kind of tape, but stronger.",
        ],
      },
      {
        form: "sort of like",
        claims: [
          "Use 'sort of like' to compare the unknown item to something familiar.",
          "This phrase helps the listener understand by giving a similar example.",
        ],
        ex: [
          "It's sort of like a hammer, but smaller.",
          "It's sort of like glue, but for metal.",
        ],
      },
      {
        form: "what do you call",
        claims: [
          "Use 'what do you call' to ask for the correct word when you do not know it.",
          "This phrase is often used before describing the item.",
        ],
        ex: [
          "What do you call the thing you use to measure angles?",
          "What do you call it when you want to join two pipes together?",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's a kind of
      fc("p1", "It's a ___ of bread from France.", ["kind", "kinds", "kindly"]),
      sit("p1", "You need a big round pan for cooking, but you don't know its name. What do you say in the shop?", [
        "It's a kind of pan for cooking rice and vegetables.",
        "It's a kind of pans for cooking rice and vegetables.",
        "It's kind a of pan for cooking rice and vegetables.",
      ]),
      la("p1", "It's a kind of tool for the garden.", ["kinds"]),
      // p2 — sort of like
      fc("p2", "It's ___ like a pen, but it's for painting.", ["sort of", "sort", "sorts of"]),
      chat("p2", ["What does it taste like?", null], [
        "It's sort of like chicken, but softer.",
        "It's sort of chicken like, but softer.",
        "It's sorts of like chicken, but softer.",
      ]),
      spk("p2", "It's sort of like a bag, but smaller."),
      // p3 — what do you call
      fc("p3", "What do you ___ the thing you use to open bottles?", ["call", "say", "name it"]),
      err("p3", "What do you calls the person who fixes pipes?", "calls", "call"),
      lc("p3", "What do you call the thing that cuts grass?", [
        "What do you do when you cut the grass?",
        "Who do you call when the grass is long?",
      ]),
      // karışık
      chat("mix", ["Can I help you?", "Yes. What do you call the thing for heating food very quickly?", "A pan?", null], [
        "No, it's a kind of machine, sort of like a small oven.",
        "No, it's a kinds of machine, sort of like a small oven.",
        "No, it's a kind of machine, sort like a small oven.",
      ]),
      sit("mix", "You need something for your neck in winter, but you don't know the word. What do you say?", [
        "What do you call it? It's a kind of long cloth for your neck.",
        "What do you calls it? It's a kind of long cloth for your neck.",
        "What do you call it? It's a kinds of long cloth for your neck.",
      ]),
      la("mix", "It's a kind of fruit, sort of like an orange.", ["kinds"]),
    ],
    success: "The learner uses at least two of the target phrases correctly to describe something when they do not know the exact word.",
    quiz: [
      qmcq("Which phrase helps you ask for the correct word when you do not know it?", [
        "What do you call",
        "How much is it",
        "Where is it",
      ], 0),
      qfill("___ a kind of tool for making holes in wood.", ["it's","it is"]),
      qmcq("You want to compare an unknown item to something familiar. Which phrase do you use?", [
        "sort of like",
        "at the same time",
        "as well as",
      ], 0),
      qfill("It's ___ like a wrench, but smaller.", ["sort of","kind of"]),
    ],
    scenes: [
      sc("Sophie", "shop assistant", "to help you find the item you need",
        "You are in a local hardware shop looking for something but you don't know the exact word.",
        "Describe the item you need using the target phrases so Sophie can help you.",
        "Hi there! Don't worry if you don't know the name. What are you looking for today?", "friendly"),
      sc("Daniel", "office manager", "to get the right supplies for the office",
        "You are at work, trying to explain to Daniel what office supply you need but you don't remember the exact word.",
        "Describe the item you need for the office using the target phrases.",
        "I'm sending the supply order today. Is there anything you need for your desk?", "busy"),
      sc("Maria", "hotel receptionist", "to help with your request as a guest",
        "You are staying at a hotel abroad and need to ask Maria at the front desk for something, but you do not know the English word.",
        "Describe the thing you need to Maria using the target phrases.",
        "Welcome! Is something missing from your room?", "curious"),
      sc("James", "classmate", "to help you with your project materials",
        "You are working on a group project and need to describe a tool or material you need, but you don't know the exact word.",
        "Explain to James what you need using the target phrases.",
        "We're buying the materials for our project tomorrow. What do we still need?", "friendly"),
      sc("Ms. Carter", "speaking examiner", "to hear how you describe something you can't name",
        "You are in a speaking exam and Ms. Carter asks you to describe an object you cannot remember the name of.",
        "Use the target phrases to describe the object to Ms. Carter.",
        "Think of something in your kitchen that you don't know the English name for. Can you describe it to me?", "curious"),
    ],
  },
  {
    id: "b1-someone-i-admire",
    topic: "describing a person in detail and saying why they matter to you",
    objectives: [
      "Describe a person in detail using specific phrases.",
      "Explain why this person is important to them.",
      "Use common expressions to highlight qualities and habits.",
    ],
    goal: "Describe a person who shaped your life and explain why they are important to you.",
    target: "Descriptive sentences about a person, using 'what I admire', 'he's the kind of', and 'she always used to'.",
    correction: "Gently model the correct phrase if the learner omits or misuses the target expressions.",
    summary: "You learned how to describe a person in detail and explain why they matter to you. You practised using phrases like 'what I admire', 'he's the kind of', and 'she always used to'.",
    minutes: 7,
    points: [
      {
        form: "what I admire",
        claims: [
          "'What I admire' introduces a quality or action you respect in someone.",
          "Use it to highlight something special about a person.",
        ],
        ex: [
          "What I admire about him is his honesty.",
          "What I admire most is her patience.",
        ],
      },
      {
        form: "he's the kind of",
        claims: [
          "'He's the kind of' describes the type of person someone is.",
          "Use it to introduce a typical behavior or attitude.",
        ],
        ex: [
          "He's the kind of person who always helps others.",
          "She's the kind of friend you can trust.",
        ],
      },
      {
        form: "she always used to",
        claims: [
          "'She always used to' describes a habit or repeated action in the past.",
          "Use it to talk about something the person did regularly before.",
          "Use the base verb after 'used to': she always used to sing, not sang or singing.",
        ],
        ex: [
          "She always used to tell me stories before bed.",
          "He always used to bring me a snack after school.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — what I admire
      fc("p1", "What I admire ___ my father is his patience.", ["about", "of", "at"]),
      err("p1", "What I admire about him is his honestly.", "honestly", "honesty"),
      spk("p1", "What I admire about her is her kindness."),
      // p2 — he's the kind of
      fc("p2", "She's the kind of person ___ never gives up.", ["who", "which", "whose"]),
      sit("p2", "Your friend helps everyone. You describe her. What do you say?", [
        "She's the kind of person who helps everyone.",
        "She's the kind person of who helps everyone.",
        "She's the kind of person who help everyone.",
      ]),
      la("p2", "He's the kind of man who always listens.", ["kinds"]),
      // p3 — she always used to
      fc("p3", "My grandmother always used to ___ bread on Sundays.", ["bake", "baked", "baking"]),
      chat("p3", ["What did your grandfather do with you when you were small?", null], [
        "He always used to take me fishing.",
        "He always use to took me fishing.",
        "He always used to taking me fishing.",
      ]),
      lc("p3", "She always used to read to us at night.", [
        "She always likes to read to us at night.",
        "She always reads the news at night.",
      ]),
      // karışık
      chat("mix", ["Tell me about your old teacher.", null], [
        "She's the kind of teacher who always used to stay late to help us.",
        "She's the kind of teacher who always used to stayed late to help us.",
        "She's the kind of teacher which always used to stay late to help us.",
      ]),
      sit("mix", "You admire your uncle because he is honest. He never lies. What do you say?", [
        "What I admire about him is his honesty. He's the kind of man who never lies.",
        "What I admire about him is his honesty. He's the kind of man which never lies.",
        "What I admires about him is his honesty. He's the kind of man who never lies.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases to describe a person and explain their importance.",
    maxTurns: 10,
    quiz: [
      qmcq("Which sentence correctly uses 'what I admire'?", [
        "What I admire about her is her honesty.",
        "What I admire her honesty.",
        "What I admire is she honest.",
      ], 0),
      qfill("He's the kind of person who ___ others.", ["helps","always helps"]),
      qmcq("Choose the correct use of 'she always used to':", [
        "She always used to sing to me as a child.",
        "She always use to sing to me as a child.",
        "She always used singing to me as a child.",
      ], 0),
      qfill("What I admire most is her ___.", ["patience","kindness","strength"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to learn more about someone important in your life",
        "You are chatting with your neighbour Sophie while watering the garden.",
        "Describe a person who shaped your life and explain why they matter to you.",
        "I've always admired my grandmother. Who do you admire most, and why?", "curious"),
      sc("Daniel", "colleague", "to get to know you better through personal stories",
        "You are having a coffee break with your colleague Daniel in the office kitchen.",
        "Describe a person who shaped your life and explain why they are important to you.",
        "Who did you look up to when you were younger, and what was that person like?", "friendly"),
      sc("Lucia", "hostel roommate", "to hear about people who influenced your life",
        "You are relaxing in a hostel lounge with Lucia, your roommate from another country.",
        "Describe a person who shaped your life and explain why they matter to you.",
        "I love hearing about inspiring people. Who is someone that really shaped your life?", "curious"),
      sc("Dr. Patel", "study advisor", "to understand your background and influences",
        "You are meeting with Dr. Patel, your study advisor, in her office.",
        "Describe a person who shaped your life and explain why they are important to you.",
        "To help me guide you, can you tell me about someone who had a big influence on you?", "friendly"),
      sc("Mr. Harris", "examiner", "to assess your ability to describe someone important to you",
        "You are in a speaking exam room with Mr. Harris, the examiner.",
        "Describe a person who shaped your life and explain why they matter to you.",
        "Tell me about a person you admire. What kind of person are they?", "curious"),
    ],
  },
  {
    id: "b1-she-must-be-tired",
    topic: "must, might and can't for working out what is true now",
    objectives: [
      "Use must, might, and can't to make logical guesses about the present.",
      "Form sentences using must, might, and can't plus be and another verb in the present.",
    ],
    goal: "Make logical guesses about what is happening with people right now.",
    target: "must, might, can't + be/verb (present deduction)",
    correction: "Prompt the learner to use must, might, or can't plus the base verb for present deductions.",
    summary: "You learned how to use must, might, and can't to guess what is true now. You practised sentences like 'She must be tired' and 'It can't be true'.",
    minutes: 8,
    points: [
      {
        form: "must + be/verb",
        claims: [
          "Use 'must' plus be or a base verb when the evidence makes you strongly believe something is true.",
          "Do not use to after must.",
          "Use must for strong logical guesses about the present.",
        ],
        ex: [
          "She must be at work now.",
          "He must know the answer.",
        ],
      },
      {
        form: "might + be/verb",
        claims: [
          "Use might plus be or a base verb to say something is possible now, but you are not sure.",
          "Do not use to after might.",
          "Use might for weak or possible guesses about the present.",
        ],
        ex: [
          "He might be busy right now.",
          "She might know the answer.",
        ],
      },
      {
        form: "can't + be/verb",
        claims: [
          "Use 'can't' plus be or a base verb when the evidence makes something seem impossible.",
          "Do not use to after can't.",
          "Use can't for strong logical guesses that something is impossible now.",
        ],
        ex: [
          "It can't be true.",
          "She can't be serious.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — must
      sit("p1", "Your friend worked for twelve hours today, and she is yawning. You are sure about the reason. What do you say?", [
        "She must be tired.",
        "She can't be tired.",
        "She must to be tired.",
      ]),
      fc("p1", "He has three cars and a very big house. He ___ be rich.", ["must", "can't", "must to"]),
      arr("p1", "He must know the answer.", ["knows"]),
      // p2 — might
      fc("p2", "Sam could be in many places, so I'm only guessing. He ___ be in the garden.", ["might", "must", "can't"]),
      chat("p2", ["Why isn't Maria answering her phone?", null], [
        "I'm not sure. She might be in a meeting.",
        "I'm not sure. She might to be in a meeting.",
        "I'm not sure. She might is in a meeting.",
      ]),
      spk("p2", "They might be on the train."),
      // p3 — can't
      sit("p3", "Your friend says your neighbour is in Paris today. But you saw your neighbour in the shop five minutes ago. What do you say?", [
        "He can't be in Paris.",
        "He must be in Paris.",
        "He can't is in Paris.",
      ]),
      err("p3", "That can't being the right bus.", "being", "be"),
      lc("p3", "That can't be our taxi. It's blue.", [
        "That must be our taxi. It's here.",
        "That isn't our taxi. It's blue.",
      ]),
      // karışık
      pairs("mix", [
        ["She hasn't slept for two days.", "She must be exhausted."],
        ["Nobody knows where Tom is.", "He might be at home."],
        ["The shop closed an hour ago.", "It can't be open now."],
      ]),
      chat("mix", ["Is that your sister at the door?", null], [
        "It can't be her. She's in Spain this week. It might be the neighbour.",
        "It must be her. She's in Spain this week. It might be the neighbour.",
        "It can't be her. She's in Spain this week. It might is the neighbour.",
      ]),
      la("mix", "It must be late, but it can't be midnight.", ["mustn't"]),
    ],
    success: "Learner uses must, might, or can't plus be or another verb to make logical guesses about the present.",
    quiz: [
      qmcq("Your friend has been laughing and smiling all evening. What do you say?", [
        "She must be happy.",
        "She can't be happy.",
        "She might be sad.",
      ], 0),
      qfill("He is not at home. I am not sure where he is. He ___ be at the gym.", ["might","Might"]),
      qmcq("Your friend says he saw a unicorn. What do you say?", [
        "It must be true.",
        "It can't be true.",
        "He might be right.",
      ], 1),
      qmcq("She looks tired, and she stays at the office until ten every night. You are sure. She ___ be working too hard.", [
        "must",
        "can't",
        "must to",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "Neighbour", "Figure out why their friend Anna hasn't come to the park",
        "You are chatting with your neighbour Lucy outside your building, wondering why Anna didn't join you at the park as planned.",
        "Use must, might, and can't to guess what Anna is doing right now.",
        "Anna said she'd meet us at the park an hour ago, but she isn't here and she isn't answering her phone. Where do you think she is?", "curious"),
      sc("David", "Colleague", "Understand why their manager isn't at the team meeting",
        "You are in a meeting room with your colleague David, and your manager has not arrived.",
        "Use must, might, and can't to guess where the manager is or what they are doing.",
        "Our manager is never late, but the meeting started fifteen minutes ago and he isn't here. What do you think is happening?", "busy"),
      sc("Sophie", "Hotel Receptionist", "Help you guess why your friend hasn't returned to the hotel",
        "You are at the hotel reception with Sophie, trying to guess why your friend hasn't come back yet.",
        "Use must, might, and can't to guess what your friend is doing now.",
        "Your friend went out at eight this morning, and it's almost midnight now. Her key is still here at the desk. What do you think she's doing?", "friendly"),
      sc("Mr. Carter", "Teacher", "Find out why a student is missing from class",
        "You are in class with Mr. Carter, and one student is absent today.",
        "Use must, might, and can't to guess why the student is not in class.",
        "Tom isn't in class today. Yesterday he was coughing all morning. Why do you think he isn't here?", "curious"),
      sc("Ms. Green", "Examiner", "Test your ability to make logical guesses",
        "You are in a speaking exam room with Ms. Green. She describes a woman at a train station late at night.",
        "Use must, might, and can't to guess what is happening to the woman she describes.",
        "Imagine a woman at a train station at midnight. She has three big suitcases and keeps looking at her watch. What do you think is happening?", "friendly"),
    ],
  },
  {
    id: "b1-it-cant-have-been-him",
    topic: "must have, might have, can't have for past deduction",
    objectives: [
      "Use must have, might have, and can't have to make guesses about past events.",
      "Choose the correct phrase to show certainty or possibility about what happened.",
      "Form sentences with must have, might have, and can't have plus the past participle.",
    ],
    goal: "The learner can discuss and guess what happened in the past using must have, might have, and can't have.",
    target: "must have + past participle, might have + past participle, can't have + past participle",
    correction: "Gently prompt the correct modal and past participle form if the learner uses the wrong modal or verb form.",
    summary: "You learned how to use must have, might have, and can't have to talk about possible or impossible events in the past.",
    minutes: 8,
    points: [
      {
        form: "must have + past participle",
        claims: [
          "Use 'must have' plus the past participle to make a strong deduction about a past event.",
          "The structure is: must have + verb-ed (or the third form of the verb).",
        ],
        ex: [
          "She must have been tired after the party.",
          "He must have forgotten his keys.",
        ],
      },
      {
        form: "can't have + past participle",
        claims: [
          "Use 'can't have' plus the past participle when the evidence makes a past event seem impossible.",
          "The structure is: can't have + verb-ed (or the third form of the verb).",
        ],
        ex: [
          "They can't have left already.",
          "She can't have seen us.",
        ],
      },
      {
        form: "might have + past participle",
        claims: [
          "Use might have + past participle to show it is possible something happened in the past, but you are not sure.",
          "The structure is: might have + verb-ed (or the third form of the verb).",
        ],
        ex: [
          "He might have gone home early.",
          "She might have lost her phone.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — must have
      fc("p1", "The street is wet. It must have ___ in the night.", ["rained", "rain", "rains"]),
      sit("p1", "Your friend tells you he worked until three in the morning last night. What do you say?", [
        "You must have been really tired.",
        "You must be have really tired.",
        "You must have be really tired.",
      ]),
      arr("p1", "Someone must have taken my umbrella.", ["taked"]),
      // p2 — can't have
      fc("p2", "She ___ the email. She had no internet all week.", ["can't have sent", "must have sent", "can't have send"]),
      err("p2", "He can't have went out. His shoes are still here.", "went", "gone"),
      lc("p2", "They can't have finished the pizza already.", [
        "They must have finished the pizza already.",
        "They can't finish the pizza alone.",
      ]),
      // p3 — might have
      fc("p3", "I don't know why Lena is late. She ___ missed the bus.", ["might have", "can't have", "might"]),
      chat("p3", ["Where are my keys?", null], [
        "I'm not sure. You might have left them in the car.",
        "I'm not sure. You might left them in the car.",
        "I'm not sure. You might have leave them in the car.",
      ]),
      spk("p3", "She might have forgotten our meeting."),
      // karışık
      chat("mix", ["Who ate all the cake? The dog was in the garden all evening.", null], [
        "It can't have been the dog. It might have been the kids.",
        "It can't have been the dog. It might have be the kids.",
        "It can't has been the dog. It might have been the kids.",
      ]),
      lc("mix", "She must have left early, but she can't have gone far.", [
        "She must leave early, so she can't go far.",
        "She might have left early, but she has gone far.",
      ]),
      pairs("mix", [
        ["He's still in the meeting room.", "He can't have left."],
        ["The ground is all white.", "It must have snowed."],
        ["Nobody knows why she's late.", "She might have overslept."],
      ]),
    ],
    success: "The learner uses the correct modal phrase with the past participle to make a logical guess about the past.",
    quiz: [
      qmcq("You see your friend's umbrella is wet. What do you say?", [
        "She must have been outside.",
        "She can't have been outside.",
        "She might have gone to bed.",
      ], 0),
      qmcq("He ___ gone home. His coat, keys and phone are still on his desk.", [
        "can't have",
        "must have",
        "can't has",
      ], 0),
      qmcq("You are not sure if Tom went to the party. What do you say?", [
        "Tom must have gone to the party.",
        "Tom might have gone to the party.",
        "Tom can't have gone to the party.",
      ], 1),
      qmcq("She was very quiet last night and went to bed at eight. You are sure about the reason. She ___ tired.", [
        "must have been",
        "must have be",
        "must been",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "friend", "figure out what happened at the party last night",
        "You and your friend Lucy are sitting in a cafe, talking about last night's party.",
        "Help Lucy guess what happened to your mutual friend who left the party early.",
        "Tom left the party last night without saying goodbye to anyone. What do you think happened?", "curious"),
      sc("David", "colleague", "understand why a team member missed an important meeting",
        "You and your colleague David are in the office kitchen discussing why your teammate wasn't at yesterday's meeting.",
        "Work with David to guess why your team member missed the meeting.",
        "Sarah missed the meeting yesterday, and she never misses meetings. What could have happened?", "busy"),
      sc("Monica", "hotel receptionist", "explain why a guest did not return to the hotel last night",
        "You are at the hotel front desk with Monica, talking about a guest who didn't come back last night.",
        "Discuss possible reasons with Monica for the guest's absence.",
        "Mr. Brown didn't come back to the hotel last night, but his bags are still in his room. What do you think happened?", "friendly"),
      sc("Josh", "classmate", "find out why a student didn't hand in their assignment",
        "You and your classmate Josh are in the library, talking about a student who didn't submit their homework.",
        "Guess with Josh why the student didn't turn in their assignment.",
        "Anna didn't hand in her homework today, and she always does it on time. Why do you think that is?", "curious"),
      sc("Mr. Carter", "examiner", "assess your ability to discuss and guess about the past",
        "You are in a speaking exam room with Mr. Carter, who asks you to discuss what might have happened last night.",
        "Use past deduction phrases to answer Mr. Carter's questions about a missing classmate.",
        "Imagine a classmate didn't come to an important exam yesterday. What do you think might have happened?", "friendly"),
    ],
  },
  {
    id: "b1-it-looks-like-rain",
    topic: "saying what something seems or appears to be",
    objectives: [
      "Use common phrases to say what something seems or appears to be",
      "Comment on situations when not completely sure",
    ],
    goal: "The learner can comment on situations or things they are not sure about using appropriate phrases.",
    target: "it looks like, seems to be, sounds like",
    correction: "Model the correct phrase and prompt the learner to repeat it.",
    summary: "You learned how to use 'it looks like', 'seems to be', and 'sounds like' to comment on situations you are not sure about.",
    minutes: 7,
    points: [
      {
        form: "it looks like",
        claims: [
          "Use 'it looks like' to make a guess from what you see.",
          "'It looks like' is followed by a clause or noun: It looks like rain. It looks like it will rain.",
        ],
        ex: [
          "It looks like it will rain soon.",
          "It looks like they are having a meeting.",
        ],
      },
      {
        form: "seems to be",
        claims: [
          "Use 'seems to be' to say what you think is true based on what you know.",
          "'Seems to be' is followed by a noun or adjective.",
          "Use it when what you notice makes you think something, for example about someone's feelings or a problem.",
        ],
        ex: [
          "She seems to be tired.",
          "There seems to be a problem with the printer.",
        ],
      },
      {
        form: "sounds like",
        claims: [
          "Use 'sounds like' to say what you think after hearing something.",
          "'Sounds like' is followed by a clause or noun.",
          "'That sounds like' can also react to an idea someone tells you: That sounds like a good idea.",
        ],
        ex: [
          "It sounds like someone is at the door.",
          "That sounds like a good idea.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it looks like
      sit("p1", "You look out of the window. The sky is dark grey. What do you say?", [
        "It looks like it's going to rain.",
        "It sounds like it's going to rain.",
        "It looks like it going to rain.",
      ]),
      fc("p1", "Look at the long queue! It ___ like the shop is very popular.", ["looks", "sounds", "look"]),
      la("p1", "It looks like nobody is at home.", ["sounds"]),
      // p2 — seems to be
      fc("p2", "There ___ to be a problem with my ticket.", ["seems", "seem", "seeming"]),
      err("p2", "She seems to being tired.", "being", "be"),
      chat("p2", ["How is your new boss?", null], [
        "She seems to be very kind.",
        "She seems be very kind.",
        "She seem to be very kind.",
      ]),
      // p3 — sounds like
      sit("p3", "You can't see next door, but you hear loud music and people singing there. What do you say?", [
        "It sounds like they're having a party.",
        "It looks like they're having a party.",
        "It sounds like they having a party.",
      ]),
      chat("p3", ["Let's have a picnic on Saturday.", null], [
        "That sounds like a great idea!",
        "That sounds a great idea like!",
        "That sound like a great idea!",
      ]),
      spk("p3", "That sounds like a lot of fun."),
      // karışık
      pairs("mix", [
        ["You see dark clouds outside.", "It looks like it's going to rain."],
        ["You hear a knock.", "It sounds like someone's at the door."],
        ["Your friend isn't talking and won't smile.", "She seems to be upset."],
      ]),
      lc("mix", "It looks like a nice hotel, and it seems to be cheap.", [
        "It looks like a nice hotel, but it seems to be full.",
        "It sounds like a nice hotel, and it seems to be cheap.",
      ]),
    ],
    success: "The learner uses the target phrase correctly to comment on a situation they are not sure about.",
    quiz: [
      qmcq("You hear people laughing in the next room. What can you say?", [
        "It sounds like they are having fun.",
        "It looks like they are having fun.",
        "It sounds like they having fun.",
      ], 0),
      qmcq("___ a mistake in this report.", [
        "There seems to be",
        "There seem to be",
        "There seems be",
      ], 0),
      qmcq("You see dark clouds in the sky. What do you say?", [
        "It looks like it might rain.",
        "It sounds like it might rain.",
        "It looks like it might raining.",
      ], 0),
      qmcq("That ___ a difficult question.", [
        "sounds like",
        "sound like",
        "sounding like",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "neighbour", "to figure out what happened outside with the learner",
        "Your neighbour Lucy calls you. She tells you what she can see and hear outside her house.",
        "Help Lucy guess what is going on, using the target phrases.",
        "The sky over my house is almost black, and I can hear thunder far away. Should I bring my washing in?", "curious"),
      sc("David", "colleague", "to quickly understand a problem with the office printer",
        "You and your colleague David are standing by a broken printer in the office.",
        "Help David describe what the problem might be using the target phrases.",
        "The printer is making a strange loud noise again, and the pages are coming out black. What do you think is wrong with it?", "busy"),
      sc("Maria", "hotel receptionist", "to help the learner understand a strange noise in their hotel room",
        "You are at the hotel front desk speaking to Maria about a noise you heard in your room.",
        "Explain to Maria what the noise might be using the target phrases.",
        "You called again about the noise in your room. What does it sound like now?", "friendly"),
      sc("Tom", "classmate", "to discuss a confusing part of the homework with the learner",
        "You and your classmate Tom are looking at a difficult homework question together.",
        "Talk with Tom about what the question could mean using the target phrases.",
        "Question five asks us to compare two graphs, but there's only one in the book. What do you think that means?", "curious"),
      sc("Mr. Carter", "examiner", "to see how the learner describes uncertain situations",
        "You are in a speaking exam. Mr. Carter describes a situation to you.",
        "Say what you think is happening in the situation, using the target phrases.",
        "Imagine you arrive at a party. The music is off, nobody is talking, and a man is shouting in the kitchen. What do you think is happening?", "friendly"),
    ],
  },
  {
    id: "b1-im-not-sure-but",
    topic: "softening a guess",
    objectives: [
      "Use common phrases to give an opinion without sounding too certain.",
      "Recognise and produce expressions that soften a guess in conversation.",
    ],
    goal: "The learner can offer their opinion carefully in a meeting without sounding too direct or certain.",
    target: "I'm not sure but; I could be wrong; as far as I know",
    correction: "Prompt the learner to use one of the target phrases before their opinion if missing.",
    summary: "You learned three phrases to make your opinion sound less certain. You learned how to soften a guess in meetings or discussions.",
    minutes: 7,
    points: [
      {
        form: "I'm not sure but",
        claims: [
          "Use 'I'm not sure but' to show you are giving an opinion that might not be correct.",
          "This phrase makes your statement softer and less direct.",
        ],
        ex: [
          "I'm not sure, but I think the meeting starts at 10.",
          "I'm not sure, but maybe we should ask the manager.",
        ],
      },
      {
        form: "I could be wrong",
        claims: [
          "Use 'I could be wrong' after your opinion to show you are not completely certain.",
          "This phrase helps you sound polite and careful.",
        ],
        ex: [
          "The shop closes at six, but I could be wrong.",
          "She is from the finance team, but I could be wrong.",
        ],
      },
      {
        form: "as far as I know",
        claims: [
          "Use 'as far as I know' to show your information might not be complete.",
          "This phrase means you are speaking from your own knowledge.",
        ],
        ex: [
          "As far as I know, the report is finished.",
          "As far as I know, we do not have any updates.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm not sure but
      fc("p1", "I'm not sure, ___ I think the bank opens at nine.", ["but", "so", "because"]),
      sit("p1", "A tourist asks you where the station is. You think it's on the left, but you aren't certain. What do you say?", [
        "I'm not sure, but I think it's on the left.",
        "I'm sure, but I think it's on the left.",
        "I'm not sure, but I think it on the left.",
      ]),
      la("p1", "I'm not sure, but I think she's right.", ["isn't"]),
      // p2 — I could be wrong
      chat("p2", ["What time does the film start?", null], [
        "At eight, I think, but I could be wrong.",
        "At eight, I think, but I could wrong.",
        "At eight, I think, but I could being wrong.",
      ]),
      err("p2", "The meeting is in room five, but I could be wrongly.", "wrongly", "wrong"),
      spk("p2", "It's on the second floor, but I could be wrong."),
      // p3 — as far as I know
      fc("p3", "As far as I ___, the trains are running normally.", ["know", "knowing", "knows"]),
      sit("p3", "Your colleague asks if the boss is coming today. Nobody told you she isn't, but you haven't checked. What do you say?", [
        "As far as I know, she's coming.",
        "As long as I know, she's coming.",
        "As far I know, she's coming.",
      ]),
      lc("p3", "As far as I know, the pool is open on Sundays.", [
        "As far as I know, the park is closed on Sundays.",
        "As soon as I know, I'll tell you.",
      ]),
      // karışık
      chat("mix", ["Is the museum free?", null], [
        "As far as I know, it is, but I could be wrong.",
        "As far as I know, it is, but I could wrong.",
        "As far as I knows, it is, but I could be wrong.",
      ]),
      sit("mix", "Your friend asks if the cafe has free Wi-Fi. You think it does, but you aren't certain. You want to sound careful. What do you say?", [
        "I'm not sure, but I think it does. I could be wrong.",
        "I'm sure, but I think it does. I could be wrong.",
        "I'm not sure, but I think it does. I could be wrongs.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases correctly to soften their opinion or guess.",
    quiz: [
      qmcq("Which phrase shows you are not completely sure?", [
        "As far as I know",
        "I am certain",
        "It must be true",
      ], 0),
      qmcq("___, the new software is working fine.", [
        "As far as I know",
        "As far I know",
        "As long as I know",
      ], 0),
      qmcq("Choose the best phrase to soften this statement: 'The meeting is on Monday.'", [
        "I'm not sure, but the meeting is on Monday.",
        "The meeting is definitely on Monday.",
        "The meeting is always on Monday.",
      ], 0),
      qfill("The bank opens at nine, but ___.", ["I could be wrong"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to find out what time the recycling is collected",
        "You are chatting with your neighbour Sophie in the hallway about the recycling schedule.",
        "Help Sophie by offering your opinion about when the recycling is collected, using soft language.",
        "Do you know which day they collect the recycling here?", "curious"),
      sc("Marcus", "colleague", "to decide the best time for the next team meeting",
        "You are in a team meeting at work, discussing when to schedule the next meeting.",
        "Give your opinion about when the next meeting could be, but sound careful and not too certain.",
        "We need to meet again next week. Which day do you think is best for everyone?", "friendly"),
      sc("Linda", "hotel receptionist", "to answer your question about breakfast times",
        "You are at the hotel front desk asking about the breakfast schedule.",
        "Offer your opinion about the breakfast time, but make it clear you are not completely sure.",
        "Good morning! Do you remember what time breakfast starts here?", "busy"),
      sc("Daniel", "study group leader", "to confirm the due date for a group assignment",
        "You are in a study group meeting discussing when your assignment is due.",
        "Give your opinion about the assignment deadline, but use softening language.",
        "Does anyone know when we need to hand in the assignment?", "curious"),
      sc("Ms. Carter", "examiner", "to hear your opinion about a topic in a polite way",
        "You are in a speaking exam where the examiner asks for your opinion about a schedule.",
        "Carefully offer your opinion about the schedule, using softening phrases.",
        "Can you tell me what time the banks open in your town?", "friendly"),
    ],
  },
  {
    id: "b1-apparently-it-turns-out",
    topic: "passing on something you heard without vouching for it",
    objectives: [
      "Use common phrases to share information heard from others.",
      "Report news or rumors without confirming them as fact.",
    ],
    goal: "Share information you heard from others without saying it is definitely true.",
    target: "it turns out, apparently he, I heard that",
    correction: "Prompt the learner to use one of the target phrases before sharing information.",
    summary: "You learned how to pass on information you heard without confirming if it is true. You learned to use 'it turns out', 'apparently he', and 'I heard that' to do this.",
    minutes: 7,
    points: [
      {
        form: "it turns out",
        claims: [
          "Use 'it turns out' to introduce new or surprising information you have learned.",
          "This phrase shows that you did not know this before.",
        ],
        ex: [
          "It turns out the meeting was cancelled.",
          "It turns out she already finished the project.",
        ],
      },
      {
        form: "apparently he",
        claims: [
          "Use 'apparently' when you heard or read something, but you did not see it yourself.",
          "This phrase shows you are not confirming the information.",
        ],
        ex: [
          "Apparently he got a new job.",
          "Apparently he is moving to another city.",
        ],
      },
      {
        form: "I heard that",
        claims: [
          "Use 'I heard that' to say you got information from someone else.",
          "This phrase shows you are just repeating what you heard.",
        ],
        ex: [
          "I heard that the company is hiring.",
          "I heard that we might have a new manager.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it turns out
      fc("p1", "I thought the shop was closed, but it ___ out it was open.", ["turns", "turn", "turning"]),
      sit("p1", "You thought your new neighbour was a student. Today you learned he is a doctor. What do you say?", [
        "It turns out he's a doctor.",
        "It turns over he's a doctor.",
        "It turn out he's a doctor.",
      ]),
      la("p1", "It turns out the test was easy.", ["turned"]),
      // p2 — apparently he
      fc("p2", "___ he's moving to Canada next month.", ["Apparently", "Apparent", "Apparents"]),
      chat("p2", ["Have you heard any news about Mark?", null], [
        "Yes. Apparently he's getting married.",
        "Yes. Apparent he's getting married.",
        "Yes. Apparently he getting married.",
      ]),
      spk("p2", "Apparently he speaks five languages."),
      // p3 — I heard that
      fc("p3", "I heard ___ the new cafe is really good.", ["that", "what", "about"]),
      err("p3", "I heared that they're closing the library.", "heared", "heard"),
      lc("p3", "I heard that the library is closing.", [
        "I hope that the library is open.",
        "I know the library is closed today.",
      ]),
      // karışık
      chat("mix", ["Is Tom still working at the bank?", null], [
        "I heard that he left. Apparently he works in a shop now.",
        "I heard that he left. Apparent he works in a shop now.",
        "I heared that he left. Apparently he works in a shop now.",
      ]),
      sit("mix", "Yesterday a friend told you the concert was cancelled. Today you found out it is happening after all. What do you say?", [
        "I heard that it was cancelled, but it turns out it's happening.",
        "I heard that it was cancelled, but it turns out it happening.",
        "I heard that it was cancelled, but it turn out it's happening.",
      ]),
    ],
    success: "The learner uses at least one target phrase correctly to pass on information.",
    minUses: 1,
    quiz: [
      qmcq("Which phrase shows you are not sure if something is true?", [
        "Apparently he",
        "He is",
        "I am sure",
      ], 0),
      qmcq("A colleague told you the boss is on holiday this week. You tell another colleague. What do you say?", [
        "I heard that the boss is on holiday this week.",
        "I heard what the boss is on holiday this week.",
        "I heard about the boss is on holiday this week.",
      ], 0),
      qmcq("Choose the best option: ___ we have a meeting at 3 pm.", [
        "It turns out",
        "Apparently he",
        "I am",
      ], 0),
      qfill("___ got a promotion.", ["Apparently he"]),
    ],
    scenes: [
      sc("Lucy", "neighbour", "to talk about some news she heard in the neighbourhood",
        "You meet your neighbour Lucy while taking out the rubbish.",
        "Share some news you heard from others in the neighbourhood.",
        "A new family moved in next door last week. Have you heard anything about them?", "curious"),
      sc("James", "colleague", "to discuss rumours going around the office",
        "You are chatting with James near the coffee machine at work.",
        "Pass on office news you heard from someone else.",
        "Everyone is talking about changes in our department. What have you heard?", "friendly"),
      sc("Maria", "hostel guest", "to find out what's happening in the hostel or city",
        "You are sitting in the hostel lounge with another traveller, Maria.",
        "Share something you heard from other travellers or staff.",
        "Someone said there's a festival in town tonight. Do you know anything about it?", "curious"),
      sc("Dr. Patel", "university lecturer", "to check if students know about some news related to the course",
        "After class, Dr. Patel stops to chat with you about course news.",
        "Pass on academic information you heard from classmates or other teachers.",
        "There are some rumours about the exam schedule. What have you heard from your classmates?", "busy"),
      sc("Mr. Green", "examiner", "to ask about something the learner has heard",
        "You are sitting in front of Mr. Green for your speaking exam.",
        "Share some information you heard from others, using the target phrases.",
        "Can you tell me about some news you heard recently from a friend?", "curious"),
    ],
  },
  {
    id: "b1-solving-a-mystery",
    topic: "working out what happened from clues",
    objectives: [
      "Use phrases to suggest explanations for past events.",
      "Discuss possible reasons for something strange using evidence.",
    ],
    goal: "You can talk about a strange event and suggest what probably happened, using clues.",
    target: "Phrases: it must have, that would explain, I bet it was",
    correction: "Prompt the learner to use one of the target phrases when they forget or use a different structure.",
    summary: "You learned how to use phrases like 'it must have', 'that would explain', and 'I bet it was' to suggest explanations for something that happened. You practised making guesses based on clues.",
    minutes: 7,
    points: [
      {
        form: "it must have",
        claims: [
          "Use 'it must have' to say you are sure about what happened, based on clues.",
          "Follow 'must have' with the past participle of the verb.",
        ],
        ex: [
          "The ground is wet. It must have rained last night.",
          "She is tired. It must have been a long day.",
        ],
      },
      {
        form: "that would explain",
        claims: [
          "Say 'that would explain' when a clue makes something clear.",
          "Use it after you hear a possible reason for something strange.",
        ],
        ex: [
          "He left early? That would explain why his bag is gone.",
          "She was sick? That would explain her absence.",
        ],
      },
      {
        form: "I bet it was",
        claims: [
          "Use 'I bet it was' to guess what or who caused something.",
          "This shows you are making a confident guess.",
        ],
        ex: [
          "The lights went out. I bet it was a power cut.",
          "Someone ate the cake. I bet it was Tom.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it must have
      fc("p1", "There's water on the floor, right under a hole in the roof. It must have ___ through the hole.", ["come", "came", "coming"]),
      sit("p1", "The grass is wet this morning, but now the sun is shining. What do you say?", [
        "It must have rained earlier.",
        "It must have rain earlier.",
        "It must rained earlier.",
      ]),
      la("p1", "It must have happened during the night.", ["happen"]),
      // p2 — that would explain
      chat("p2", ["The neighbours were away all week.", null], [
        "That would explain why their house was dark.",
        "That would explains why their house was dark.",
        "That will explaining why their house was dark.",
      ]),
      fc("p2", "She didn't sleep last night? That would ___ why she looks tired.", ["explain", "explains", "explained"]),
      spk("p2", "That would explain the noise."),
      // p3 — I bet it was
      fc("p3", "Someone ate my sandwich. I bet it ___ my brother.", ["was", "were", "is being"]),
      err("p3", "I bet it were the cat.", "were", "was"),
      lc("p3", "I bet it was the wind.", ["I bet it was the kids.", "I bet it will be windy."]),
      // karışık
      chat("mix", ["The cake is gone, and there are crumbs on the sofa.", null], [
        "I bet it was the kids. They must have eaten it there.",
        "I bet it was the kids. They must have ate it there.",
        "I bet it were the kids. They must have eaten it there.",
      ]),
      sit("mix", "Your friend says the neighbours had a big party last night. This morning there are empty bottles all over the street. What do you say?", [
        "That would explain it. They must have left them there.",
        "That would explains it. They must have left them there.",
        "That would explain it. They must have leave them there.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases naturally to suggest explanations for past events.",
    maxTurns: 10,
    quiz: [
      qmcq("The plate was full of cake an hour ago. Now it is empty, and there are crumbs on the floor. What do you say?", [
        "Someone must have eaten it.",
        "Someone must eat it.",
        "Someone must have eat it.",
      ], 0),
      qmcq("You heard loud music and singing next door all night. What do you say?", [
        "There must have been a party.",
        "There must have be a party.",
        "There must be have a party.",
      ], 0),
      qmcq("Your friend tells you there was a power cut last night. Your fridge is warm this morning. What do you say?", [
        "That would explain why the fridge is warm.",
        "That would explains why the fridge is warm.",
        "That would explaining why the fridge is warm.",
      ], 0),
      qfill("The phone is missing. ___ your sister who took it.", ["I bet it was","bet it was"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to figure out what happened in the kitchen with you",
        "You and your friend are in your kitchen, noticing a big mess on the table.",
        "Work together to guess what caused the mess, using the clues Lucy describes.",
        "Someone spilled flour all over the kitchen table, and there are small white paw prints going to the open window. What do you think happened?", "curious"),
      sc("Mark", "colleague", "to find out who left strange files on the office printer",
        "You are in the office, looking at some mysterious documents left by the printer.",
        "Discuss the clues and suggest what probably happened with the documents.",
        "I found fifty copies of a strange letter on the printer this morning, and nobody says they printed it. What do you think happened?", "busy"),
      sc("Sophie", "hotel receptionist", "to understand why a guest's luggage is missing",
        "You are at a hotel reception, trying to work out why your luggage is not in your room.",
        "Talk about the clues and suggest what might have happened to your luggage.",
        "I'm so sorry, your suitcase isn't in your room. The porter says he left it by the door of room twelve. What do you think happened?", "friendly"),
      sc("Tom", "classmate", "to solve the mystery of missing homework assignments",
        "In the classroom, you and a classmate are trying to figure out why some homework assignments are missing from the teacher’s desk.",
        "Use clues to suggest what probably happened to the homework.",
        "The teacher says our homework was on her desk yesterday, but this morning it's gone. What do you think happened to it?", "curious"),
      sc("Mr. Carter", "examiner", "to see how you solve a mystery using clues",
        "In a speaking exam room, the examiner describes a strange event and asks you to work out what happened.",
        "Listen to the clues and suggest what probably happened.",
        "Imagine you come home and find wet footprints in your living room, but no one is home. What do you think happened?", "friendly"),
    ],
  },
  {
    id: "b1-i-used-to-smoke",
    topic: "used to for habits and states that have stopped",
    objectives: [
      "Use 'used to' to talk about past habits or states that are no longer true.",
      "Form negative and question sentences with 'didn't use to' and 'did you use to'.",
    ],
    goal: "Describe how your life or habits were different in the past compared to now.",
    target: "'I used to', 'didn't use to', 'did you use to'",
    correction: "Prompt the learner to use the correct form of 'used to' for past habits or states that have stopped.",
    summary: "You learned how to use 'used to' for habits and states that are no longer true. You also learned how to make negative and question forms.",
    minutes: 8,
    intents: {
      readiness: "Greet, introduce 'used to' for past habits and states, and check if the learner is ready.",
      teach: "Explain how to use 'used to' for things that were true in the past but are not true now.",
      questions: "Invite questions about how to use 'used to', 'didn't use to', and 'did you use to'.",
      say: "Acknowledge and announce the start of practice questions.",
    },
    points: [
      {
        form: "used to",
        claims: [
          "Use 'used to' + base verb to talk about habits or states that were true in the past but are not true now.",
          "'Used to' does not describe present habits or states.",
        ],
        ex: [
          "I used to play football every weekend.",
          "She used to have long hair.",
        ],
      },
      {
        form: "didn't use to",
        claims: [
          "Use 'didn't use to' + base verb for negative sentences about things that were not true in the past.",
          "Do not add -d to 'use' after 'didn't'.",
        ],
        ex: [
          "I didn't use to like coffee.",
          "They didn't use to live here.",
        ],
      },
      {
        form: "did you use to",
        claims: [
          "Use 'Did you use to' + base verb to ask about past habits or states.",
          "Do not add -d to 'use' in questions.",
        ],
        ex: [
          "Did you use to play an instrument?",
          "Did you use to have a pet?",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — used to
      fc("p1", "I ___ play tennis, but I stopped last year.", ["used to", "use to", "am used to"]),
      arr("p1", "We used to live near the sea.", ["use"]),
      sit("p1", "When you were a child, you had a dog. Now you don't have one. What do you say?", [
        "I used to have a dog.",
        "I use to have a dog.",
        "I used to having a dog.",
      ]),
      // p2 — didn't use to
      fc("p2", "She ___ like coffee, but now she drinks it every day.", ["didn't use to", "don't use to", "didn't use"]),
      err("p2", "I didn't use to liked school.", "liked", "like"),
      lc("p2", "We didn't use to have a car.", ["We didn't want to have a car.", "We used to have a big car."]),
      // p3 — did you use to
      fc("p3", "___ you use to walk to school?", ["Did", "Do", "Were"]),
      chat("p3", ["I lived in Rome for five years.", null], [
        "Really? Did you use to speak Italian there?",
        "Really? Did you use to speaking Italian there?",
        "Really? Use you to speak Italian there?",
      ]),
      spk("p3", "Did you use to play a sport?"),
      // karışık
      chat("mix", ["Did you use to eat vegetables as a child?", null], [
        "No, I didn't use to like them, but I do now.",
        "No, I didn't use to liked them, but I do now.",
        "No, I don't use to like them, but I do now.",
      ]),
      sit("mix", "When you were young, you hated fish. Now you love it. Your friend asks if you always liked it. What do you say?", [
        "No, I didn't use to like it. I used to hate it.",
        "No, I didn't use to like it. I use to hate it.",
        "No, I didn't use to liking it. I used to hate it.",
      ]),
    ],
    success: "The learner correctly uses 'used to', 'didn't use to', and 'did you use to' to talk about past habits or states that have stopped.",
    quiz: [
      qmcq("Which question is correct?", [
        "Did you use to live in London?",
        "Did you used to live in London?",
        "Do you used to live in London?",
      ], 0),
      qfill("I ___ eat vegetables, but now I love them.", ["didn't use to","did not use to"]),
      qmcq("Choose the correct negative sentence.", [
        "She didn't use to like tea.",
        "She didn't used to like tea.",
        "She don't use to like tea.",
      ], 0),
      qmcq("My brother ___ play the guitar when he was a teenager.", [
        "used to",
        "use to",
        "was used to",
      ], 0),
    ],
    scenes: [
      sc("Sophie", "old friend from school", "to catch up and hear how your life has changed",
        "You meet Sophie at a cafe after not seeing each other for ten years.",
        "Share how your habits and lifestyle have changed since you were younger.",
        "It's been so long! Did you use to live in this city, or did you move here later?", "curious"),
      sc("James", "colleague", "to get to know you better at a team lunch",
        "You are having lunch with James and talking about your past jobs and routines.",
        "Describe how your work habits and routines have changed over the years.",
        "I'm always interested in how people change. What did you use to do before this job?", "friendly"),
      sc("Anna", "hostel roommate", "to make conversation and learn about your background",
        "You and Anna are chatting in a hostel common room while travelling abroad.",
        "Talk about how your travel habits and interests were different in the past.",
        "I used to travel a lot, but now I hardly go anywhere. Did you use to travel when you were younger?", "curious"),
      sc("Dr. Patel", "university advisor", "to understand your background and help you settle in",
        "You are meeting Dr. Patel for your first academic advising session.",
        "Explain how your study habits or academic interests have changed over the years.",
        "Which subjects did you use to enjoy at school, and which didn't you like?", "friendly"),
      sc("Mr. Wilson", "speaking examiner", "to assess your ability to talk about past habits and states",
        "You are in a speaking exam room with Mr. Wilson.",
        "Describe how your life, habits, or interests were different ten years ago.",
        "Let's talk about your life ten years ago. What did you use to do in your free time?", "curious"),
    ],
  },
  {
    id: "b1-we-would-spend-summers-there",
    topic: "would for repeated past actions",
    objectives: [
      "Recognise and form sentences using 'would' to talk about repeated actions in the past.",
      "Use 'would' to describe past routines or habits.",
      "Distinguish 'would' for past repeated actions from other uses of 'would'.",
    ],
    goal: "Describe past routines or habits using 'would' when talking about childhood or earlier times.",
    target: "'would' + base verb for repeated past actions (not for states)",
    correction: "Prompt the learner to use 'would' plus the base verb for repeated past actions, not for single events or states.",
    summary: "You learned how to use 'would' to talk about actions that happened again and again in the past. You learned the form and use of 'would' for describing past routines.",
    minutes: 8,
    intents: {
      readiness: "Greet, name today's topic (would for repeated past actions), and ask if the learner is ready.",
      teach: "Announce the explanation of 'would' for repeated actions in the past.",
      questions: "Invite any question before the exercises.",
      say: "Acknowledge and announce a few practice questions.",
    },
    points: [
      {
        form: "'would' + base verb",
        claims: [
          "Use 'would' plus the base form of a verb to talk about actions that happened again and again in the past.",
          "'Would' for repeated past actions is similar to 'used to', but not for states.",
          "Do not add -s or -ed to the verb after 'would'.",
        ],
        ex: [
          "When I was a child, we would always visit my grandparents on Sundays.",
          "Every summer we'd go camping by the lake.",
        ],
      },
      {
        form: "would for repeated actions, not states",
        claims: [
          "Use 'would' mainly for repeated actions and events in the past.",
          "Do not use 'would' for past states with verbs like 'be', 'have' (own), 'know' or 'like'. Use 'used to' or the past simple instead.",
        ],
        ex: [
          "He would often play football after school.",
          "When I was young, I used to be shy.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — would + base verb
      fc("p1", "Every Sunday my grandfather would ___ us to the park.", ["take", "takes", "took"]),
      arr("p1", "We'd spend hours at the beach.", ["spends"]),
      lc("p1", "My mother would sing while she cooked.", [
        "My mother wanted to sing while she cooked.",
        "My mother sings while she cooks.",
      ]),
      spk("p1", "Every summer we'd visit our cousins."),
      chat("p1", ["What did you do after school when you were a kid?", null], [
        "I would often ride my bike with friends.",
        "I would often rode my bike with friends.",
        "I would often riding my bike with friends.",
      ]),
      // p2 — actions, not states
      sit("p2", "You want to say that you had long hair as a child. Which sentence is correct?", [
        "I used to have long hair.",
        "I would have long hair.",
        "I would had long hair.",
      ]),
      fc("p2", "When I was ten, I ___ very shy.", ["was", "would be", "would"]),
      err("p2", "We would live in a small flat when I was a child.", "would", "used to"),
      la("p2", "He used to know everyone in the village.", ["would"]),
      // karışık
      sit("mix", "Your grandfather was a farmer. Every day he got up at five. Which sentence is correct?", [
        "He was a farmer, and he would get up at five.",
        "He would be a farmer, and he would get up at five.",
        "He was a farmer, and he would got up at five.",
      ]),
      chat("mix", ["What was your old school like?", null], [
        "It was small, and we would play outside every day.",
        "It would be small, and we would play outside every day.",
        "It was small, and we would played outside every day.",
      ]),
    ],
    success: "The learner uses 'would' plus a base verb to describe repeated past actions naturally.",
    quiz: [
      qmcq("Which sentence uses 'would' correctly for a repeated past action?", [
        "He would often ride his bike to school.",
        "He would often was late.",
        "He would often knew the answer.",
      ], 0),
      qmcq("Every summer ___ go to the mountains.", [
        "we'd",
        "we'd went",
        "we'd to",
      ], 0),
      qmcq("Choose the correct use of 'would' for a past routine.", [
        "My family would always have dinner together on Sundays.",
        "My family would always knew everyone in town.",
        "My family would always was happy.",
      ], 0),
      qmcq("As a boy, he ___ play outside until dark.", [
        "would",
        "would to",
        "was",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "old friend", "to share memories and hear about your childhood routines",
        "You are sitting on a park bench with your old friend, talking about your childhoods.",
        "Describe your childhood routines using 'would' to share memories.",
        "When we were kids, my family would always go to the lake on Sundays. What would your family do at the weekend?", "curious"),
      sc("Mark", "colleague", "to get to know you better by talking about childhood memories",
        "You are having coffee with a colleague during a work break, chatting about childhood habits.",
        "Talk about your past routines and habits using 'would'.",
        "What would you do every summer when you were a child?", "friendly"),
      sc("Sophie", "hostel roommate", "to learn about your life back home and share stories",
        "You are staying in a hostel abroad and chatting with your roommate about childhood summers.",
        "Share your childhood routines and describe what you and your family would do.",
        "What were summers like for you when you were growing up?", "curious"),
      sc("Dr. Harris", "class instructor", "to encourage students to practice talking about past routines",
        "You are in a classroom and your instructor asks about your childhood routines as part of a speaking exercise.",
        "Describe your childhood habits using 'would' in your answer.",
        "Can you tell the class about something you would often do as a child?", "friendly"),
      sc("Mr. Green", "examiner", "to assess your ability to talk about past routines in English",
        "You are in a speaking exam and the examiner asks about your childhood routines.",
        "Use 'would' to describe repeated actions in your past.",
        "What are some things you and your family would always do when you were younger?", "curious"),
    ],
  },
  {
    id: "b1-im-getting-used-to-it",
    topic: "be used to and get used to",
    objectives: [
      "Use 'be used to' to talk about things that are normal for me now.",
      "Use 'get used to' to talk about the process of something becoming normal.",
      "Say when I am not used to something.",
    ],
    goal: "Describe how you have adapted or are adapting to a big change in your life.",
    target: "I'm used to, getting used to, not used to",
    correction: "Prompt the correct phrase and check for the correct use of 'used to' with the right verb form (noun or -ing).",
    summary: "You learned how to use 'be used to' for things that are normal now and 'get used to' for things that are becoming normal. It also showed how to say when something is not normal yet using 'not used to'.",
    minutes: 8,
    points: [
      {
        form: "be used to",
        claims: [
          "Use 'be used to' + noun or -ing form to say something is normal for you now.",
          "'Be' changes for the subject: I am used to, he is used to, we are used to.",
          "Do not use the base verb after 'be used to'.",
          "Do not mix it up with 'used to' + base verb: 'I used to work at night' means I did it before; 'I'm used to working at night' means it is normal for me.",
        ],
        ex: [
          "I'm used to waking up early.",
          "She is used to the cold weather.",
        ],
      },
      {
        form: "get used to",
        claims: [
          "Use 'get used to' + noun or -ing form to talk about the process of something becoming normal.",
          "'Get' changes for the subject and tense: I am getting used to, she got used to.",
          "Do not use the base verb after 'get used to'.",
        ],
        ex: [
          "I am getting used to driving on the left.",
          "He got used to his new job.",
        ],
      },
      {
        form: "not used to",
        claims: [
          "Use 'not used to' to say something is not normal or comfortable for you yet.",
          "'Not' goes before 'used to': I am not used to, they are not used to.",
          "Use a noun or -ing form after 'not used to'.",
        ],
        ex: [
          "I am not used to speaking English every day.",
          "They are not used to city life.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — be used to
      fc("p1", "I'm used to ___ early. I do it every day.", ["getting up", "get up", "got up"]),
      sit("p1", "You have lived in a hot country for ten years. The heat is normal for you. What do you say?", [
        "I'm used to the heat.",
        "I used to the heat.",
        "I'm used to hot.",
      ]),
      lc("p1", "He's used to working long hours.", [
        "He's tired of working long hours.",
        "He likes working short hours.",
      ]),
      // p2 — get used to
      fc("p2", "I'm slowly ___ used to the food here.", ["getting", "get", "got"]),
      chat("p2", ["How's your new job?", null], [
        "It's hard, but I'm getting used to it.",
        "It's hard, but I'm getting use to it.",
        "It's hard, but I'm get used to it.",
      ]),
      arr("p2", "I'm getting used to the noise.", ["get"]),
      // p3 — not used to
      fc("p3", "I'm not used to ___ such spicy food.", ["eating", "eat", "ate"]),
      spk("p3", "I'm not used to the cold weather."),
      la("p3", "They aren't used to driving in snow.", ["drive"]),
      // karışık
      sit("mix", "You moved to a big city a month ago. The traffic still feels strange, but it is slowly becoming normal. What do you say?", [
        "I'm not used to the traffic yet, but I'm getting used to it.",
        "I'm not use to the traffic yet, but I'm getting used to it.",
        "I'm not used to the traffic yet, but I'm get used to it.",
      ]),
      chat("mix", ["Was it hard to start working at night?", null], [
        "I wasn't used to it at first, but I got used to it.",
        "I wasn't used to it at first, but I got use to it.",
        "I wasn't use to it at first, but I got used to it.",
      ]),
    ],
    success: "The learner uses the correct phrase for what is normal, becoming normal, or not normal yet, with the right form after 'used to'.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'm used to getting up early.",
        "I'm used to get up early.",
        "I'm used to get up.",
      ], 0),
      qfill("She grew up in a small town, so she is ___ living in a big city.", ["not used to"]),
      qmcq("Choose the best option: After a few weeks, I am ___ my new job.", [
        "getting used to",
        "not used to",
        "used to",
      ], 0),
      qmcq("They have lived in the city for years, so the noise is normal for them. They ___ the noise.", [
        "are used to",
        "used to",
        "are use to",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "new neighbour", "to learn how you are settling into the neighbourhood",
        "You meet your new neighbour Lucy while taking out the trash.",
        "Describe how you are adapting to living in a new neighbourhood.",
        "Hi! You just moved in, didn't you? How are you finding the area so far?", "curious"),
      sc("Daniel", "team leader", "to check how you are adjusting to your new job",
        "Your team leader Daniel chats with you during a coffee break at your new job.",
        "Explain how you are adapting to the new work environment.",
        "How are you getting on at work? Is it very different from your old job?", "friendly"),
      sc("Sophie", "hostel receptionist", "to make sure you are comfortable staying abroad",
        "You are checking in at a hostel and chatting with Sophie at the front desk.",
        "Talk about how you are adapting to life in a new country.",
        "Welcome! Is this your first time living in this country? What still feels strange to you here?", "curious"),
      sc("Mr. Carter", "university advisor", "to find out how you are adapting to university life",
        "You are meeting Mr. Carter, your advisor, for your first check-in at university.",
        "Describe how you are adjusting to university routines and studies.",
        "How are you settling into university life? Is the new timetable hard for you?", "friendly"),
      sc("Ms. Green", "examiner", "to assess your ability to talk about adapting to change",
        "You are sitting in a speaking exam with Ms. Green, the examiner.",
        "Describe how you have adapted or are adapting to a big change in your life.",
        "Can you tell me about a big change in your life? What was hard at first, and what is easier now?", "curious"),
    ],
  },
  {
    id: "b1-always-complaining",
    topic: "always with the -ing form for irritating habits",
    objectives: [
      "Use 'always' + -ing form to describe annoying habits.",
      "Recognise and produce sentences like 'he's always complaining'.",
    ],
    goal: "Describe irritating habits of people close to you using 'always' with the -ing form.",
    target: "'always' + be + -ing for irritating habits (e.g. 'he's always complaining')",
    correction: "Prompt the correct structure: 'He's always + -ing verb.'",
    summary: "You learned how to use 'always' with the -ing form to talk about habits that irritate you. You practised making sentences like 'he's always complaining'.",
    minutes: 8,
    intents: {
      readiness: "greet the learner, name the topic of using 'always' with -ing for irritating habits, and check if the learner is ready",
      teach: "announce that you will explain how to use 'always' with the -ing form for irritating habits",
      questions: "invite any questions about using 'always' with the -ing form for irritating habits",
      say: "acknowledge and announce that you will do a few practice questions",
    },
    points: [
      {
        form: "'always' + be + -ing",
        claims: [
          "Use 'always' with the present continuous (be + -ing) to talk about a repeated action that annoys you.",
          "With the present simple, 'always' is neutral: He always walks to work. With be + -ing, it usually sounds like a complaint.",
        ],
        ex: [
          "He's always leaving his shoes in the hallway.",
          "You're always checking your phone!",
        ],
      },
      {
        form: "'she's forever' + -ing",
        claims: [
          "You can also use 'forever' or 'constantly' with the -ing form to show irritation.",
          "'She's forever' or 'they're constantly' work the same way as 'always' in this structure.",
        ],
        ex: [
          "She's forever losing her keys.",
          "They're constantly borrowing my things.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — always + be + -ing
      fc("p1", "My brother is always ___ my clothes without asking!", ["taking", "take", "takes"]),
      sit("p1", "Your flatmate leaves dirty cups in the sink again and again. It annoys you. What do you say?", [
        "He's always leaving dirty cups in the sink!",
        "He's always leaves dirty cups in the sink!",
        "He's always leave dirty cups in the sink!",
      ]),
      la("p1", "You're always interrupting me!", ["interrupt"]),
      spk("p1", "He's always complaining about his job."),
      chat("p1", ["Why are you angry with your sister?", null], [
        "She's always borrowing my phone!",
        "She's always borrow my phone!",
        "She always borrowing my phone!",
      ]),
      // p2 — forever / constantly
      fc("p2", "They're ___ arguing about money.", ["constantly", "constant", "constants"]),
      fc("p2", "She's forever ___ about the weather.", ["complaining", "complain", "complains"]),
      lc("p2", "He's forever losing his glasses.", [
        "He's never lost his glasses.",
        "He's looking for his glasses.",
      ]),
      sit("p2", "Your neighbours play loud music every night, and you are tired of it. You use 'constantly'. What do you say?", [
        "They're constantly playing loud music.",
        "They're constantly play loud music.",
        "They constantly playing loud music.",
      ]),
      // karışık
      chat("mix", ["What's wrong with your new flatmates?", null], [
        "One is always leaving the lights on, and the other is forever eating my food.",
        "One is always leaving the lights on, and the other is forever eat my food.",
        "One is always leave the lights on, and the other is forever eating my food.",
      ]),
      sit("mix", "Your colleague comes late again and again, and he takes your pens all the time. You complain to a friend. What do you say?", [
        "He's always coming late, and he's constantly taking my pens.",
        "He's always coming late, and he's constantly take my pens.",
        "He always coming late, and he's constantly taking my pens.",
      ]),
    ],
    success: "The learner uses one of the target phrases with the -ing form to describe an irritating habit.",
    minUses: 1,
    quiz: [
      qmcq("Which sentence uses 'always' with the -ing form to show irritation?", [
        "He's always forgetting his wallet.",
        "He always forgets his wallet.",
        "He forgot his wallet.",
      ], 0),
      qmcq("She's ___ talking on the phone when I need her.", [
        "forever",
        "forevers",
        "ever",
      ], 0),
      qmcq("Choose the sentence that complains about a repeated habit.", [
        "They're constantly arriving late.",
        "They arrived late once.",
        "They will arrive late.",
      ], 0),
      qmcq("Choose the correct complaint.", [
        "He's always making the same mistake!",
        "He always making the same mistake!",
        "He's always make the same mistake!",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "best friend", "hear you grumble about someone close to you",
        "You and your best friend are chatting over coffee at your home.",
        "Describe the irritating habits of someone close to you using the target phrases.",
        "My brother is always taking my things without asking! Does anyone in your family drive you crazy like that?", "curious"),
      sc("Mark", "colleague", "share stories about annoying habits at work",
        "You and a colleague are taking a break in the office kitchen.",
        "Talk about a coworker's irritating habits using the target phrases.",
        "Is there anyone at work who keeps doing something that annoys you?", "friendly"),
      sc("Sophie", "fellow traveller", "swap stories about travel companions' habits",
        "You and another traveller are waiting at the airport for a delayed flight.",
        "Describe the irritating habits of your travel companion using the target phrases.",
        "Who do you usually travel with, and do they have any annoying habits?", "curious"),
      sc("Tom", "study group partner", "find out what habits annoy you in group work",
        "You and a study partner are preparing for a group project in the library.",
        "Complain about a group member's irritating habits using the target phrases.",
        "Is there anyone in our study group who does something that bothers you?", "friendly"),
      sc("Ms. Carter", "examiner", "assess your ability to describe irritating habits",
        "You are in a speaking exam and the examiner asks about people close to you.",
        "Describe the irritating habits of someone you know using the target phrases.",
        "Can you tell me about a habit of someone close to you that you find annoying?", "curious"),
    ],
  },
  {
    id: "b1-how-things-have-changed",
    topic: "comparing past and present",
    objectives: [
      "Use set phrases to compare the past and present.",
      "Describe changes using 'these days', 'back then', and 'it's not the same'.",
    ],
    goal: "Describe and compare how things have changed over time using common English phrases.",
    target: "'these days', 'back then', 'it's not the same'",
    correction: "Model the correct phrase and prompt the learner to repeat it accurately.",
    summary: "You learned how to compare the past and present using set phrases.",
    minutes: 7,
    points: [
      {
        form: "these days",
        claims: [
          "'these days' means now or in the present time.",
          "Use 'these days' to talk about how things are today, often compared to the past.",
        ],
        ex: [
          "These days, there are many new buildings in the city.",
          "People use smartphones a lot these days.",
        ],
      },
      {
        form: "back then",
        claims: [
          "'back then' means at a time in the past.",
          "Use 'back then' to describe how things were before, often in contrast to now.",
        ],
        ex: [
          "Back then, there were only a few cars on the road.",
          "People wrote letters back then.",
        ],
      },
      {
        form: "it's not the same",
        claims: [
          "'it's not the same' means something has changed and is different now.",
          "Use 'it's not the same' to show that the present is different from the past.",
        ],
        ex: [
          "The city is much bigger now. It's not the same.",
          "The park used to be quiet, but it's not the same these days.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — these days
      fc("p1", "___ days, most people pay with their phones.", ["These", "Those", "This"]),
      sit("p1", "You want to say that now you work from home. What do you say?", [
        "These days, I work from home.",
        "Back then, I work from home.",
        "These day, I work from home.",
      ]),
      lc("p1", "Everything is so expensive these days.", [
        "Everything was so cheap in those days.",
        "Everything is so expensive this week.",
      ]),
      // p2 — back then
      fc("p2", "We didn't have the internet back ___.", ["then", "than", "them"]),
      chat("p2", ["What was your town like twenty years ago?", null], [
        "It was tiny back then.",
        "It is tiny back then.",
        "It was tiny back than.",
      ]),
      la("p2", "Back then, the streets were much quieter.", ["than"]),
      // p3 — it's not the same
      sit("p3", "Your favourite cafe has new owners and new food. You liked it more before. What do you say?", [
        "It's not the same now.",
        "It's not the same than before.",
        "It not the same now.",
      ]),
      err("p3", "The beach is full of hotels now. It's not the some.", "some", "same"),
      spk("p3", "The town is bigger now, and it's not the same."),
      // karışık
      chat("mix", ["Do you still go to that old cinema?", null], [
        "Not often. Back then I went every week, but these days it's not the same there.",
        "Not often. Back then I go every week, but these days it's not the same there.",
        "Not often. These days I went every week, but back then it's not the same there.",
      ]),
      sit("mix", "Twenty years ago your street had small shops. Now it has big supermarkets. What do you say?", [
        "Back then, there were small shops. These days, there are supermarkets.",
        "Back then, there are small shops. These days, there were supermarkets.",
        "These days, there were small shops. Back then, there are supermarkets.",
      ]),
    ],
    success: "Learner uses at least two of the target phrases correctly to compare past and present.",
    quiz: [
      qmcq("Which phrase do you use to talk about the present?", [
        "these days",
        "back then",
        "in the future",
      ], 0),
      qmcq("Complete the sentence: ___, the streets were quieter.", [
        "Back then",
        "These days",
        "It's not the same",
      ], 0),
      qmcq("People used to play outside more, but ___, most people stay inside.", [
        "these days",
        "back then",
        "those days",
      ], 0),
      qmcq("The old cafe is gone, and the street feels different now. What do you say?", [
        "It's not the same.",
        "It's not same.",
        "It's no the same.",
      ], 0),
    ],
    scenes: [
      sc("Sarah", "old family friend", "to catch up and hear about changes in the city",
        "You meet Sarah at a local park while walking your dog.",
        "Explain to Sarah how the city has changed from before to now using the target phrases.",
        "I haven't seen you in ages! How is the city different from when you were a child?", "curious"),
      sc("David", "colleague", "to discuss how the area around your office has changed",
        "You and David are chatting in the office break room.",
        "Describe to David how the neighbourhood around your workplace has changed using the target phrases.",
        "This area looks so different now. What was it like ten years ago?", "friendly"),
      sc("Linda", "hotel receptionist", "to learn about your impressions of the city",
        "You are checking in at a hotel and Linda asks about your last visit.",
        "Share with Linda how the city has changed since your last trip using the target phrases.",
        "You said you visited here years ago. Is the city very different now?", "curious"),
      sc("Mr. Clark", "history teacher", "to get your opinion for a class discussion",
        "Mr. Clark is leading a discussion about local history in class.",
        "Compare how the city used to be and how it is now using the target phrases.",
        "For today's class discussion, how was our city different fifty years ago, and how is it now?", "friendly"),
      sc("Ms. Turner", "examiner", "to assess your speaking about changes in your city",
        "Ms. Turner is conducting your speaking exam in a classroom.",
        "Describe and compare your city in the past and now using the target phrases.",
        "How has your city changed since you were young?", "curious"),
    ],
  },
  {
    id: "b1-then-and-now",
    topic: "describing how your own life has changed over the years",
    objectives: [
      "Use set phrases to talk about changes in their life over time.",
      "Compare past and present habits or situations.",
      "Express how much has changed since a previous time.",
    ],
    goal: "The learner can describe to someone how their life is different now compared to the past, using set phrases.",
    target: "Phrases: back in those days, now I tend to, so much has changed",
    correction: "Prompt the learner to use the required phrases and model the correct usage if missing.",
    summary: "You learned how to describe changes in your life over the years. You practised using set phrases to compare your past and present.",
    minutes: 7,
    points: [
      {
        form: "back in those days",
        claims: [
          "Use 'back in those days' to talk about a time in the past, often many years ago.",
          "This phrase introduces a memory or description of how things used to be.",
        ],
        ex: [
          "Back in those days, I used to play outside every afternoon.",
          "Back in those days, we did not have smartphones.",
        ],
      },
      {
        form: "now I tend to",
        claims: [
          "Use 'now I tend to' to describe what you usually do these days.",
          "It shows a present habit or routine that is different from before.",
          "Use the base verb after 'tend to': now I tend to stay at home, not staying.",
        ],
        ex: [
          "Now I tend to stay at home in the evenings.",
          "Now I tend to eat healthier food.",
        ],
      },
      {
        form: "so much has changed",
        claims: [
          "Use 'so much has changed' to express that many things are different now.",
          "This phrase highlights a big difference between the past and the present.",
        ],
        ex: [
          "So much has changed since we last met.",
          "So much has changed in my life over the years.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — back in those days
      fc("p1", "Back in ___ days, we wrote letters to each other.", ["those", "these", "this"]),
      sit("p1", "You are telling a friend about your childhood. You walked to school every day. What do you say?", [
        "Back in those days, I walked to school.",
        "Back in these days, I walked to school.",
        "Back in those day, I walked to school.",
      ]),
      la("p1", "Back in those days, life was slower.", ["these"]),
      // p2 — now I tend to
      fc("p2", "Now I tend ___ go to bed early.", ["to", "for", "of"]),
      err("p2", "Now I tend to eating at home.", "eating", "eat"),
      spk("p2", "Now I tend to read before bed."),
      // p3 — so much has changed
      chat("p3", ["Have you been back to your old school?", null], [
        "Yes, and so much has changed!",
        "Yes, and so much have changed!",
        "Yes, and so many has changed!",
      ]),
      fc("p3", "So much ___ changed since I was a child.", ["has", "have", "is"]),
      lc("p3", "So much has changed in this city.", [
        "Not much has changed in this city.",
        "So much has happened in my life.",
      ]),
      // karışık
      chat("mix", ["How is your life different from your student years?", null], [
        "Back in those days I went out a lot, but now I tend to stay home.",
        "Back in those days I went out a lot, but now I tend to staying home.",
        "Back in these days I went out a lot, but now I tend to stay home.",
      ]),
      sit("mix", "You meet an old friend after ten years. Your life is very different now, and these days you usually work all day. What do you say?", [
        "So much has changed! Now I tend to work all day.",
        "So much have changed! Now I tend to work all day.",
        "So much has changed! Now I tend work all day.",
      ]),
    ],
    success: "The learner uses the required phrases naturally to compare past and present habits or situations.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase introduces a memory from the past?", [
        "back in those days",
        "now I tend to",
        "so much has changed",
      ], 0),
      qfill("I used to love playing football, but ___ watch movies at home.", ["now I tend to","Now I tend to"]),
      qmcq("You want to say that many things are different now. What do you say?", [
        "so much has changed",
        "now I tend to",
        "back in those days",
      ], 0),
      qmcq("___ since we finished school.", [
        "So much has changed",
        "So much have changed",
        "So many has changed",
      ], 0),
    ],
    scenes: [
      sc("Linda", "old friend from your neighbourhood", "to catch up and hear about how your life has changed",
        "You meet Linda at a local cafe after not seeing each other for many years.",
        "Describe to Linda how your life is different now compared to the past.",
        "It's been ages since we last talked! How is your life different now from when we were kids?", "curious"),
      sc("Mark", "former colleague", "to find out what has changed in your life since you last worked together",
        "You run into Mark at a business conference after several years apart.",
        "Explain to Mark how your life and habits have changed since you worked together.",
        "I can hardly believe it's been ten years since we worked together! What's different in your life now?", "friendly"),
      sc("Sophie", "old travel companion", "to hear about how your life has changed since your last trip together",
        "You meet Sophie by chance at an airport after years apart.",
        "Tell Sophie how your life has changed since your last trip together.",
        "It's so good to see you! Our last trip together was years ago. How have things changed for you since then?", "curious"),
      sc("Dr. Patel", "former university advisor", "to learn about your personal and academic growth since graduation",
        "You meet Dr. Patel at a university reunion event after many years.",
        "Describe to Dr. Patel how your life is now compared to your student days.",
        "It's wonderful to see you again! How is your life now compared to your student days?", "friendly"),
      sc("Mr. Green", "speaking examiner", "to assess your ability to describe changes in your life",
        "You are in a speaking exam room with Mr. Green, who is asking about your life changes.",
        "Describe to the examiner how your life is different now compared to the past.",
        "Can you tell me how your life is different now compared to ten years ago?", "curious"),
    ],
  },
];
