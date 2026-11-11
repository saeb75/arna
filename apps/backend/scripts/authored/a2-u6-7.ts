/** A2 · Ünite 6-7 — Quantity and Detail · Reasons and Conditions (15 ders).
 *
 *  Ünite 6 miktarı ve kesinliği kuruyor: sayılabilir/sayılamaz ayrımı, küçük
 *  miktarlar, "too/enough" ile yetersizlik, some-/any-/no- bileşikleri ve iyelik.
 *  Hepsi tek bir pratik amaca hizmet ediyor — öğrencinin "bir şey" demek yerine
 *  NE KADAR olduğunu söyleyebilmesi.
 *
 *  Ünite 7 cümleleri birbirine bağlıyor: sebep (because/so), koşul (if), her zaman
 *  doğru olan (zero conditional), gelecekteki zaman bağlaçları, kesinlik derecesi
 *  ve amaç (to + fiil). `if` ile `when` ayrı derslerde çünkü A2'de en sık karışan
 *  yer burası: "if it rains" olası, "when water boils" her zaman.
 *
 *  Gramer derslerinde 4 alıştırma, phrases/practice'te 3.
 */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const A2_U6_7: Authored[] = [
  // --- Ünite 6 · Quantity and Detail -----------------------------------------
  {
    id: "a2-how-much-sugar",
    topic: "asking about amounts",
    objectives: [
      "Choose between much and many correctly.",
      "Ask how much of something there is.",
    ],
    goal: "Work out what is left in the kitchen and what you need to buy.",
    target: "much, many and a lot of",
    correction: "Repeat the question with the correct word and let the learner ask it again.",
    summary: "You learned to use much with things you cannot count and many with things you can.",
    minutes: 8,
    points: [
      {
        form: "how much / how many",
        claims: [
          "Use 'how many' with things you can count: apples, eggs, people.",
          "Use 'how much' with things you cannot count: sugar, water, time, money.",
        ],
        ex: ["How much sugar do we need?", "How many eggs are left?"],
      },
      {
        form: "a lot of",
        claims: [
          "'A lot of' works with both kinds and is very common in positive sentences.",
          "'Much' and 'many' sound more natural in questions and negatives.",
        ],
        ex: ["There's a lot of milk in the fridge.", "We have a lot of plates."],
      },
      {
        form: "not much / not many",
        claims: [
          "The negative keeps the same choice: not much sugar, not many eggs.",
          "'None' means zero and stands alone as an answer.",
        ],
        ex: ["There isn't much bread left.", "There aren't many clean cups."],
      },
    ],
    ex: [],
    drills: [
      // p1 — how much / how many
      fc("p1", "How ___ eggs are left?", ["many", "much", "a lot"]),
      fc("p1", "How ___ money do you have?", ["much", "many", "lot"]),
      sit("p1", "You want to know the number of people at the party. What do you ask?", [
        "How many people are coming?",
        "How much people are coming?",
        "How many people is coming?",
      ]),
      lc("p1", "How much sugar do we need?", ["How much sugar do we have?", "How much water do we need?"]),
      // p2 — a lot of
      fc("p2", "There's ___ milk in the fridge.", ["a lot of", "many", "a lot"]),
      arr("p2", "We have a lot of plates.", ["much"]),
      spk("p2", "We have a lot of time today."),
      // p3 — not much / not many
      fc("p3", "There isn't ___ bread left.", ["much", "many", "many of"]),
      chat("p3", ["Have we got any eggs?", null], ["Not many, only two.", "Not much, only two.", "Not many, only a two."]),
      err("p3", "There aren't much chairs in the room.", "much", "many"),
      // karışık
      chat("mix", ["What do we need for the cake?", null], [
        "A lot of flour and not many eggs.",
        "A lot of flour and not much eggs.",
        "Many flour and not many eggs.",
      ]),
      la("mix", "How many cups and how much tea do we need?", ["lot"]),
    ],
    success: "The learner uses much and many correctly with the right nouns at least twice.",
    quiz: [
      qmcq("Which question is correct?", [
        "How much time do we have?",
        "How many time do we have?",
        "How much times do we have?",
      ], 0),
      qfill("There aren't ___ clean cups. (many)", ["many"]),
      qmcq("Which sentence is correct?", [
        "There's a lot of water in the bottle.",
        "There's a lot water in the bottle.",
        "There are a lot of water in the bottle.",
      ], 0),
    ],
    scenes: [
      sc("Rosalind", "a flatmate making a shopping list", "to find out what the kitchen needs",
        "Two flatmates are checking the cupboards before shopping.",
        "Say what there is a lot of and what is running out.",
        "I'm writing the shopping list. How much milk do we have?", "practical"),
      sc("Emeka", "a colleague organising a lunch", "to order the right amounts for the team",
        "Food has to be ordered for a team lunch.",
        "Say how much of each thing is needed.",
        "Twelve people are coming to lunch. How many sandwiches should I order?", "organised"),
      sc("Chiara", "a host in a shared kitchen", "to plan a meal together",
        "You are cooking with a host and checking ingredients.",
        "Ask and answer about amounts.",
        "I want to cook tonight. How much rice is there in your kitchen?", "welcoming"),
      sc("Mr. Achterberg", "your teacher", "to practise much and many",
        "The class is describing what is in their kitchens.",
        "Describe amounts correctly.",
        "I'm checking what we need. How much food do you have in your kitchen?", "encouraging"),
      sc("Ms. Cardoso", "the examiner", "to check quantity words",
        "The examiner asks about your shopping habits.",
        "Describe amounts using much and many.",
        "What food do you usually buy? How much or how many do you get?", "neutral"),
    ],
  },

  {
    id: "a2-a-few-or-a-little",
    topic: "talking about small amounts",
    objectives: [
      "Choose between 'a few' and 'a little' correctly.",
      "Say an amount is small without sounding negative.",
    ],
    goal: "Say how much time or money something needs.",
    target: "a few and a little for small amounts",
    correction: "Repeat the phrase with the right word and let the learner build a new sentence.",
    summary: "You learned to use a few with countable things and a little with uncountable ones.",
    minutes: 8,
    points: [
      {
        form: "just a few",
        claims: [
          "'A few' goes with things you can count: a few days, a few people.",
          "'Just a few' makes the small amount sound deliberate rather than disappointing.",
        ],
        ex: ["It only takes a few minutes.", "I invited just a few friends."],
      },
      {
        form: "only a little",
        claims: [
          "'A little' goes with things you cannot count: a little time, a little money.",
          "'Only a little' stresses that the amount is small.",
        ],
        ex: ["I have only a little time today.", "Add a little salt at the end."],
      },
      {
        form: "quite a lot",
        claims: [
          "'Quite a lot' means a fairly large amount and works with both countable and uncountable nouns.",
          "'A few' and 'a little' are positive; 'few' and 'little' alone sound negative.",
        ],
        ex: ["It costs quite a lot.", "We still have quite a lot of time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — a few
      fc("p1", "It takes three minutes. It only takes ___ minutes.", ["a few", "a little", "much"]),
      arr("p1", "There are a few people outside.", ["little"]),
      sit("p1", "Three or four friends are coming. What do you say?", [
        "Just a few friends are coming.",
        "Just a little friends are coming.",
        "Just a few friend are coming.",
      ]),
      lc("p1", "We need just a few chairs.", ["We need just a few cups.", "We need a lot of chairs."]),
      // p2 — a little
      fc("p2", "I have only ___ time today.", ["a little", "a few", "few of"]),
      chat("p2", ["Do you want milk in your coffee?", null], [
        "Yes, just a little, please.",
        "Yes, just a few, please.",
        "Yes, just a little milks, please.",
      ]),
      spk("p2", "I have only a little money."),
      // p3 — quite a lot
      fc("p3", "It costs quite ___.", ["a lot", "a few", "lot"]),
      sit("p3", "The trip costs two thousand euros. You think that is a fairly large amount. What do you say?", [
        "It costs quite a lot.",
        "It costs quite a few.",
        "It costs a little.",
      ]),
      la("p3", "We still have quite a lot of time.", ["few"]),
      // karışık
      chat("mix", ["How many people and how much food?", null], [
        "A few people, but quite a lot of food.",
        "A little people, but quite a lot of food.",
        "A few people, but quite a few of food.",
      ]),
      fc("mix", "Put ___ sugar and a few lemons in the tea.", ["a little", "a few", "few"]),
    ],
    success: "The learner uses 'a few' and 'a little' correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Add a little salt at the end.",
        "Add a few salt at the end.",
        "Add little a salt at the end.",
      ], 0),
      qfill("We have ___ few days before the deadline. (a)", ["a"]),
      qmcq("Which sentence is correct?", [
        "There are a few people waiting.",
        "There are a little people waiting.",
        "There is a few people waiting.",
      ], 0),
    ],
    scenes: [
      sc("Ottoline", "a friend planning a party", "to work out what the party needs",
        "A friend is planning a small gathering and needs a reality check.",
        "Say how much time and money it will take.",
        "I'm planning a party. How many people should I invite?", "optimistic"),
      sc("Sebastian", "a colleague scoping a task", "to estimate the work involved",
        "A small task needs an honest estimate.",
        "Estimate the time and resources needed.",
        "How much time do you need for this task?", "direct"),
      sc("Noemi", "a guide pricing a trip", "to explain what the trip costs and takes",
        "You are asking about the practical side of a trip.",
        "Ask about time and cost.",
        "How much money do you want to spend on the trip?", "helpful"),
      sc("Mrs. Ekwueme", "your teacher", "to practise small quantity words",
        "The class is estimating time and cost for plans.",
        "Describe small amounts correctly.",
        "How much time do you need for your project?", "encouraging"),
      sc("Mr. Halvorsen", "the examiner", "to check quantity words",
        "The examiner asks about a plan of yours.",
        "Describe the amounts precisely.",
        "Tell me about a plan. How much time and money does it need?", "neutral"),
    ],
  },

  {
    id: "a2-too-small-not-big-enough",
    topic: "saying why something does not work",
    objectives: [
      "Use 'too' before a describing word.",
      "Use 'enough' after a describing word.",
    ],
    goal: "Explain why something does not fit or does not work for you.",
    target: "too and enough",
    correction: "Repeat the sentence with the word in the right position and let the learner try again.",
    summary: "You learned that 'too' comes before the describing word and 'enough' comes after it.",
    minutes: 8,
    points: [
      {
        form: "it's too small",
        claims: [
          "'Too' comes before the describing word and means more than you want.",
          "When 'too' means more than wanted or suitable, it describes a problem: too big, too noisy.",
        ],
        ex: ["This jacket is too small for me.", "The room was too noisy to work in."],
      },
      {
        form: "not big enough",
        claims: [
          "'Enough' comes after the describing word: big enough, warm enough.",
          "Before a noun the order changes: enough time, enough chairs.",
        ],
        ex: ["The table isn't big enough for six.", "We don't have enough chairs."],
      },
      {
        form: "too expensive",
        claims: [
          "'Too ... to ...' gives the consequence: too expensive to buy.",
          "'Enough to' works the same way: warm enough to sit outside.",
        ],
        ex: ["It's too expensive to buy today.", "It's warm enough to sit outside."],
      },
    ],
    ex: [],
    drills: [
      // p1 — too + describing word
      fc("p1", "This jacket is ___ small for me.", ["too", "to", "enough"]),
      err("p1", "The music is to loud.", "to", "too"),
      sit("p1", "The shoes are size 38, but you need size 40. What do you say?", [
        "They're too small.",
        "They're small enough.",
        "They're too big.",
      ]),
      lc("p1", "It's too cold to swim.", ["It's too cold to sleep.", "It's warm enough to swim."]),
      // p2 — describing word + enough / enough + noun
      fc("p2", "The table isn't big ___ for six people.", ["enough", "too", "so"]),
      arr("p2", "We don't have enough chairs.", ["too"]),
      chat("p2", ["Can we sit outside?", null], ["No, it isn't warm enough.", "No, it isn't enough warm.", "No, it isn't warm too."]),
      spk("p2", "The room isn't big enough."),
      // p3 — too ... to / enough to
      fc("p3", "It's too expensive ___ buy today.", ["to", "for", "enough"]),
      sit("p3", "The weather is warm. You can sit outside. What do you say?", [
        "It's warm enough to sit outside.",
        "It's enough warm to sit outside.",
        "It's too warm to sit outside.",
      ]),
      la("p3", "This bag is too heavy to carry.", ["for"]),
      // karışık
      chat("mix", ["Do you want this flat?", null], [
        "No, it's too expensive and it isn't big enough.",
        "No, it's too expensive and it isn't enough big.",
        "No, it's to expensive and it isn't big enough.",
      ]),
      spk("mix", "It's too small and not warm enough."),
    ],
    success: "The learner uses 'too' and 'enough' in the correct positions at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The coffee is too hot to drink.",
        "The coffee is hot too to drink.",
        "The coffee is enough hot to drink.",
      ], 0),
      qfill("It isn't warm ___ to sit outside.", ["enough"]),
      qmcq("Which sentence is correct?", [
        "We don't have enough time.",
        "We don't have time enough.",
        "We don't have too time.",
      ], 0),
    ],
    scenes: [
      sc("Fabio", "a shop assistant", "to find you something that fits",
        "You are trying things on and nothing is right.",
        "Explain why each one does not work.",
        "Did the jacket fit? What was wrong with it?", "attentive"),
      sc("Greta", "a colleague viewing an office", "to judge whether the space works",
        "The team is considering a new office space.",
        "Say why the space does or does not work.",
        "Is this office big enough for our team?", "assessing"),
      sc("Youssef", "a hotel manager", "to fix a problem with your room",
        "Your room has a problem you need to explain.",
        "Explain what is wrong with the room.",
        "Is there a problem with your room?", "attentive"),
      sc("Ms. Lindholm", "your teacher", "to practise too and enough",
        "The class is explaining why things do not fit.",
        "Explain a problem with too or enough.",
        "Think of something that did not fit you. What was wrong with it?", "encouraging"),
      sc("Mr. Delgado", "the examiner", "to check too and enough",
        "The examiner asks about a decision not to buy something.",
        "Explain the reason clearly.",
        "Could you tell me about something you decided not to buy, and why?", "neutral"),
    ],
  },

  {
    id: "a2-how-long-how-far",
    topic: "asking about time and distance",
    objectives: [
      "Ask how long a journey takes and how far it is.",
      "Give approximate answers.",
    ],
    goal: "Check the practical details of a journey before you set off.",
    // Katalog `focus`u "size"ı da anıyor ama `targetPhrases` üçü de süre/mesafe —
    // ölçülen şey bu, o yüzden hedef de onu söylüyor. Boyut öğretiliyor (p2'de
    // "how big"), sadece ölçüme girmiyor.
    target: "questions about duration and distance",
    correction: "Model the question in its natural form and let the learner ask it again.",
    summary: "You learned to ask about time, distance and size, and to answer approximately.",
    minutes: 7,
    points: [
      {
        form: "how long does it take",
        claims: [
          "'How long does it take?' asks about duration, not about length.",
          "The answer usually starts with 'it takes' plus a period of time.",
        ],
        ex: ["How long does it take to get there?", "It takes about forty minutes."],
      },
      {
        form: "how far is",
        claims: [
          "'How far' asks about distance and is usually answered in metres, kilometres or miles.",
          "'How big' and 'how deep' follow the same pattern.",
        ],
        ex: ["How far is the station from here?", "How big is the room?"],
      },
      {
        form: "about ten kilometres",
        claims: [
          "'About', 'around' and 'roughly' make an answer approximate.",
          "Exact numbers are rarely needed in everyday conversation.",
        ],
        ex: ["It's about ten kilometres.", "Roughly half an hour by bus."],
      },
    ],
    ex: [],
    drills: [
      // p1 — how long does it take
      arr("p1", "How long does it take to get there?", ["far"]),
      chat("p1", ["How long does it take by bus?", null], [
        "It takes about forty minutes.",
        "It's about forty kilometres.",
        "It costs about forty euros.",
      ]),
      spk("p1", "How long does it take?"),
      // p2 — how far / how big
      fc("p2", "How ___ is the station from here?", ["far", "long", "much"]),
      sit("p2", "You want to know the distance to the beach. What do you ask?", [
        "How far is the beach?",
        "How long is the beach?",
        "How much is the beach?",
      ]),
      lc("p2", "How big is the room?", ["How big is the garden?", "How far is the room?"]),
      // p3 — about / around / roughly
      fc("p3", "It's ___ ten kilometres from here.", ["about", "around of", "roughly of"]),
      sit("p3", "You don't know the exact time. It's maybe thirty minutes. What do you say?", [
        "About half an hour.",
        "Exactly half an hour.",
        "Half an hour exactly.",
      ]),
      la("p3", "Roughly half an hour by bus.", ["rough"]),
      // karışık
      chat("mix", ["How far is the airport?", null], [
        "About twenty kilometres, so it takes about half an hour.",
        "About twenty minutes, so it takes about half an hour.",
        "About twenty kilometres, so it is about half an hour far.",
      ]),
      lc("mix", "It's about ten kilometres and it takes twenty minutes.", [
        "It's about ten minutes and it takes twenty kilometres.",
        "It's about two kilometres and it takes twenty minutes.",
      ]),
    ],
    success: "The learner asks at least two correct practical questions.",
    quiz: [
      qmcq("Which question is correct?", [
        "How long does it take to get there?",
        "How long it takes to get there?",
        "How long does it takes to get there?",
      ], 0),
      qfill("___ far is it from here to the beach?", ["How"]),
      qmcq("Which answer is approximate?", [
        "It's about ten kilometres.",
        "It's ten kilometres and forty metres.",
        "It's not far at all, exactly.",
      ], 0),
    ],
    scenes: [
      sc("Dorota", "a friend who knows the area", "to give you the practical details",
        "You are planning a trip to a place your friend knows well.",
        "Ask the practical questions you need answered.",
        "I know the way to the lake well. What do you want to know?", "helpful"),
      sc("Anders", "a colleague arranging travel", "to book the right connections",
        "A business trip needs planning and timings.",
        "Ask about times and distances.",
        "I'm booking our train. Do you want to know how long the journey takes?", "efficient"),
      sc("Kemal", "a taxi driver", "to tell you about the route",
        "You are in a taxi and want to know the details of the journey.",
        "Ask about duration and distance.",
        "Where are you going today? How far is it?", "chatty"),
      sc("Mrs. Nyberg", "your teacher", "to practise practical questions",
        "The class is planning journeys in pairs.",
        "Ask about time and distance.",
        "You are planning a journey. Do you want to know how long it takes or how far it is?", "encouraging"),
      sc("Mr. Rossi", "the examiner", "to check practical question forms",
        "The examiner asks you to plan a journey.",
        "Ask clear practical questions.",
        "Imagine you are travelling to a new city. What do you want to know about how far the centre is?", "neutral"),
    ],
  },

  {
    id: "a2-something-anything-nothing",
    topic: "words built with some, any and no",
    objectives: [
      "Choose between something, anything and nothing.",
      "Use the compound word instead of a longer phrase.",
    ],
    goal: "Say what there is and is not, without naming it exactly.",
    target: "compounds with some-, any- and no-",
    correction: "Repeat the sentence with the correct compound and let the learner say it again.",
    summary: "You learned when to use something, anything and nothing, with a first look at related forms such as somebody and somewhere.",
    minutes: 8,
    points: [
      {
        form: "something to eat",
        claims: [
          "'Something' is used in positive sentences and in offers.",
          "The same rule gives somebody and somewhere.",
        ],
        ex: ["I need something to eat.", "Somebody left a bag here."],
      },
      {
        form: "anything else",
        claims: [
          "'Anything' is usual in questions and after a negative verb.",
          "'Would you like anything else?' is the standard shop question.",
        ],
        ex: ["Is there anything else?", "I didn't buy anything."],
      },
      {
        form: "nothing special",
        claims: [
          "'Nothing' already carries the negative, so the verb stays positive.",
          "Say 'there's nothing', not 'there isn't nothing'.",
        ],
        ex: ["There's nothing in the fridge.", "It was nothing special."],
      },
    ],
    ex: [],
    drills: [
      // p1 — something / somebody / somewhere
      fc("p1", "I'm hungry. I need ___ to eat.", ["something", "anything", "nothing"]),
      fc("p1", "Look! ___ left a bag here.", ["Somebody", "Anybody", "Nobody"]),
      arr("p1", "I need something to drink.", ["somethings"]),
      spk("p1", "Let's go somewhere quiet."),
      // p2 — anything
      fc("p2", "I didn't buy ___ at the market.", ["anything", "nothing", "somethings"]),
      sit("p2", "You work in a shop. You want to know if the customer needs more. What do you ask?", [
        "Would you like anything else?",
        "Would you like nothing else?",
        "Would you like anythings else?",
      ]),
      lc("p2", "Is there anything else?", ["Is there anyone else?", "Is there anything new?"]),
      // p3 — nothing
      fc("p3", "The fridge is empty. There's ___ in it.", ["nothing", "anything", "something"]),
      chat("p3", ["How was the film?", null], ["It was nothing special.", "It wasn't nothing special.", "It was anything special."]),
      la("p3", "There's nothing to do here.", ["anything"]),
      // karışık
      chat("mix", ["Do you need anything from the shop?", null], [
        "No, nothing, thanks. I bought something yesterday.",
        "No, anything, thanks. I bought something yesterday.",
        "No, nothing, thanks. I bought anything yesterday.",
      ]),
      sit("mix", "Your friend asks about your weekend. You stayed at home and it was not exciting. What do you say?", [
        "I didn't do anything special.",
        "I didn't do nothing special.",
        "I did anything special.",
      ]),
    ],
    success: "The learner uses these compound words correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I didn't buy anything.",
        "I didn't buy nothing.",
        "I don't bought anything.",
      ], 0),
      qfill("Is there ___ else you need? (any)", ["anything"]),
      qmcq("Which sentence is correct?", [
        "Somebody left a message for you.",
        "Anybody left a message for you.",
        "Nobody left a message for you, somebody did.",
      ], 0),
    ],
    scenes: [
      sc("Renske", "a flatmate looking for food", "to decide whether to order in",
        "Two flatmates are staring into an empty fridge.",
        "Say what there is and is not.",
        "Are you hungry? Is there anything to eat at your place?", "hungry"),
      sc("Julio", "a colleague at the end of a meeting", "to close the meeting properly",
        "The meeting is finishing and there is time for final points.",
        "Say whether there is anything left to raise.",
        "Before we finish, is there anything else?", "brisk"),
      sc("Hana", "a shop assistant", "to complete your purchase",
        "You are at the counter finishing a purchase.",
        "Answer and ask about what else you need.",
        "That's everything scanned. Would you like anything else?", "polite"),
      sc("Mr. Whitmore", "your teacher", "to practise compound words",
        "The class is describing what is and is not there.",
        "Use something, anything and nothing correctly.",
        "What is in your bag right now, and what is missing?", "encouraging"),
      sc("Ms. Ferreira", "the examiner", "to check compound words",
        "The examiner asks what you keep at home.",
        "Describe using the right compounds.",
        "Could you tell me what there is in your kitchen at the moment?", "neutral"),
    ],
  },

  {
    id: "a2-mine-yours-theirs",
    topic: "saying whose something is",
    objectives: [
      "Use possessive pronouns instead of repeating the noun.",
      "Ask whose something is.",
    ],
    goal: "Sort out whose things are whose after a shared trip.",
    target: "possessive pronouns and whose",
    correction: "Repeat the sentence with the pronoun alone and let the learner say it again.",
    summary: "You learned to say mine, yours and theirs, and to ask whose something is.",
    minutes: 8,
    points: [
      {
        form: "it's mine",
        claims: [
          "Possessive pronouns stand alone: mine, yours, his, hers, ours, theirs.",
          "They replace the noun, so nothing follows them.",
        ],
        ex: ["That bag is mine.", "The blue one is hers."],
      },
      {
        form: "my / mine",
        claims: [
          "'My' comes before a noun; 'mine' stands alone.",
          "Say 'my coat' or 'mine', never 'mine coat'.",
        ],
        ex: ["This is my coat.", "This coat is mine."],
      },
      {
        form: "whose is this",
        claims: [
          "'Whose' asks who owns something.",
          "It sounds the same as 'who's' but has a different meaning.",
        ],
        ex: ["Whose is this jacket?", "Whose keys are these?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — possessive pronouns
      pairs("p1", [
        ["my", "mine"],
        ["your", "yours"],
        ["her", "hers"],
        ["our", "ours"],
        ["their", "theirs"],
      ]),
      fc("p1", "That bag is ___.", ["mine", "my", "me"]),
      sit("p1", "The red umbrella belongs to your sister. What do you say?", [
        "The red umbrella is hers.",
        "The red umbrella is her.",
        "The red umbrella is her's.",
      ]),
      lc("p1", "That's yours.", ["That bag is mine.", "Those keys are his."]),
      // p2 — my / mine
      err("p2", "This is mine coat.", "mine", "my"),
      fc("p2", "This is ___ coat.", ["my", "mine", "me"]),
      arr("p2", "This coat is mine.", ["mines"]),
      // p3 — whose
      fc("p3", "___ is this jacket?", ["Whose", "Who's", "Who"]),
      chat("p3", ["I found these keys.", null], ["Whose keys are they?", "Who's keys are they?", "Whose keys they are?"]),
      lc("p3", "Whose phone is this?", ["Whose bag is this?", "Who's on the phone?"]),
      spk("p3", "Whose is this?"),
      // karışık
      chat("mix", ["Whose glasses are these?", null], ["They're mine. Thanks!", "They're my. Thanks!", "They're mines. Thanks!"]),
      la("mix", "This bag is mine, and that one is yours.", ["your"]),
    ],
    success: "The learner uses possessive pronouns and 'whose' correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The blue one is hers.",
        "The blue one is her.",
        "The blue one is hers one.",
      ], 0),
      qfill("___ is this umbrella? (who owns it)", ["Whose"]),
      qmcq("Which sentence is correct?", [
        "These seats are ours.",
        "These seats are our.",
        "These are ours seats.",
      ], 0),
    ],
    scenes: [
      sc("Bettina", "a friend after a shared holiday", "to return the things left behind",
        "Several items are left in one bag after a group trip.",
        "Sort out what belongs to whom.",
        "I have a hat and a phone from our trip. Are they yours?", "puzzled"),
      sc("Ismail", "a colleague clearing a meeting room", "to find the owners of the items left",
        "Things were left behind after a long meeting.",
        "Ask and answer about ownership.",
        "Someone left a laptop in the meeting room. Is it yours?", "practical"),
      sc("Solveig", "a hostel receptionist", "to reunite lost items with guests",
        "Items have been handed in at reception.",
        "Ask about and claim items.",
        "We have a lost umbrella here. Is it yours?", "helpful"),
      sc("Mrs. Osei", "your teacher", "to practise possessive pronouns",
        "The class is sorting out mixed-up belongings.",
        "Say what belongs to whom.",
        "Imagine we have the same pens. How do you say which is yours?", "encouraging"),
      sc("Mr. Larsen", "the examiner", "to check possessive forms",
        "The examiner asks about shared belongings.",
        "Use possessive pronouns correctly.",
        "Could you tell me about something you share with someone, and what is yours?", "neutral"),
    ],
  },

  {
    id: "a2-packing-for-a-trip",
    topic: "deciding what to take",
    objectives: [
      "Say what you need and do not need.",
      "Agree when you have enough of something.",
    ],
    goal: "Pack one suitcase with someone else and agree on what goes in.",
    target: "deciding quantities and necessity",
    correction: "Model the sentence about need and let the learner continue deciding.",
    summary: "You practised deciding what to take, what to leave and when enough is enough.",
    minutes: 7,
    points: [
      {
        form: "I don't need / that's enough",
        claims: [
          "'I don't need' is followed by a noun or by 'to' plus a verb.",
          "It is softer than 'I won't take' when you are deciding together.",
          "'That's enough' closes a decision politely; 'That should do it' means the same thing in a softer way.",
        ],
        ex: ["I don't need three jumpers.", "Two pairs are enough.", "That's enough for four days."],
      },
      {
        form: "we should take",
        claims: [
          "'We should take' suggests without deciding for the other person.",
          "'Shall we take ...?' turns the same idea into a question.",
        ],
        ex: ["We should take an umbrella.", "We should take something warm."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I don't need / that's enough
      fc("p1", "I don't need ___ bring my laptop.", ["to", "for", "the"]),
      sit("p1", "You have two jumpers in the bag. It's a short trip, so two is OK. What do you say?", [
        "Two jumpers are enough.",
        "Two jumpers are too enough.",
        "Two jumpers is enough of.",
      ]),
      la("p1", "I don't need three jumpers.", ["needs"]),
      // p2 — we should take
      fc("p2", "It might rain. We should ___ an umbrella.", ["take", "to take", "taking"]),
      chat("p2", ["It's cold in the mountains.", null], [
        "Then we should take something warm.",
        "Then we should to take something warm.",
        "Then we should taking something warm.",
      ]),
      spk("p2", "We should take an umbrella."),
      // karışık
      chat("mix", ["Shall we take four towels?", null], [
        "We don't need four. Two are enough.",
        "We don't need four. Two is enoughs.",
        "We doesn't need four. Two are enough.",
      ]),
      lc("mix", "We should take water, but we don't need food.", [
        "We should take water, but we don't need shoes.",
        "We should take food, but we don't need water.",
      ]),
    ],
    success: "The learner states needs and closes at least one decision.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I don't need to bring my laptop.",
        "I don't need bring my laptop.",
        "I don't need to bringing my laptop.",
      ], 0),
      qfill("That's ___ for four days, I think.", ["enough"]),
      qmcq("Which sentence closes a decision?", [
        "That should do it.",
        "What else is there?",
        "I am not sure yet.",
      ], 0),
    ],
    scenes: [
      sc("Konstantin", "a friend you are travelling with", "to fit everything into one case",
        "Two friends have one suitcase and too many things.",
        "Decide together what to take.",
        "Four days, one bag. What should we take?", "amused"),
      sc("Adaeze", "a colleague packing for a work trip", "to pack the right things for the meetings",
        "A short business trip needs careful packing.",
        "Decide what is necessary.",
        "Two days of meetings. What do I need to take?", "practical"),
      sc("Lasse", "a fellow hiker", "to keep the packs light",
        "Two hikers are cutting weight from their packs.",
        "Decide what to leave behind.",
        "We walk all day tomorrow. What don't we need?", "focused"),
      sc("Ms. Villanueva", "your teacher", "to practise necessity language",
        "The class is packing an imaginary suitcase.",
        "Say what is needed and what is not.",
        "You have one small bag for a week. What should you take, and what don't you need?", "encouraging"),
      sc("Mr. Kristensen", "the examiner", "to check necessity language",
        "The examiner asks about your packing habits.",
        "Say what you need and do not need.",
        "You have one small bag. What should you take, and when is it enough?", "neutral"),
    ],
  },

  // --- Ünite 7 · Reasons and Conditions --------------------------------------
  {
    id: "a2-because-and-so",
    topic: "giving reasons and results",
    objectives: [
      "Give a reason with because.",
      "Give a result with so.",
    ],
    goal: "Explain a decision you had to make quickly.",
    target: "because and so",
    correction: "Repeat the joined sentence and let the learner build their own.",
    summary: "You learned that because introduces the reason and so introduces the result.",
    minutes: 8,
    points: [
      {
        form: "because I was",
        claims: [
          "'Because' introduces the reason and answers the question why.",
          "The reason can come first or second, but the two parts stay in one sentence.",
        ],
        ex: ["I left early because I was tired.", "Because it was raining, we stayed in."],
      },
      {
        form: "so I decided",
        claims: [
          "'So' introduces the result of what came before.",
          "The order matters: reason first, then 'so', then result.",
        ],
        ex: ["The train was cancelled, so I decided to walk.", "It was late, so we went home."],
      },
      {
        form: "that's why",
        claims: [
          "'That's why' points back to the reason you have just given.",
          "It usually starts a new sentence.",
        ],
        ex: ["The road was closed. That's why I was late.", "That's why I called you."],
      },
    ],
    ex: [],
    drills: [
      // p1 — because
      fc("p1", "Why did you leave early? I left early ___ I was tired.", ["because", "so", "that's why"]),
      sit("p1", "You missed the bus. That was the reason you were late. What do you say?", [
        "I was late because I missed the bus.",
        "I was late so I missed the bus.",
        "I missed the bus because I was late.",
      ]),
      lc("p1", "We stayed in because it was raining.", ["We stayed in because it was snowing.", "We went out because it was raining."]),
      spk("p1", "I left early because I was tired."),
      // p2 — so
      fc("p2", "The train was cancelled, ___ I decided to walk.", ["so", "because", "why"]),
      arr("p2", "It was cold, so we stayed at home.", ["because"]),
      chat("p2", ["Why did you take a taxi?", null], [
        "The bus didn't come, so I took a taxi.",
        "The bus didn't come, because I took a taxi.",
        "I took a taxi, so the bus didn't come.",
      ]),
      la("p2", "I was hungry, so I made a sandwich.", ["because"]),
      // p3 — that's why
      fc("p3", "The road was closed. That's ___ I was late.", ["why", "because", "so"]),
      chat("p3", ["You look tired!", null, "Oh no, poor you."], [
        "I didn't sleep well. That's why I'm tired.",
        "I didn't sleep well. That's why I tired.",
        "I didn't sleep well. That's so I'm tired.",
      ]),
      lc("p3", "That's why I called you.", ["That's when I called you.", "That's why I told you."]),
      // karışık
      sit("mix", "It was raining. You took an umbrella. What do you say?", [
        "It was raining, so I took an umbrella.",
        "It was raining because I took an umbrella.",
        "I took an umbrella, so it was raining.",
      ]),
      chat("mix", ["Why didn't you come?", null], [
        "I was ill, so I stayed at home. That's why.",
        "I was ill, because I stayed at home. That's why.",
        "I was ill, so I stay at home. That's why.",
      ]),
    ],
    success: "The learner joins reason and result correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It was late, so we went home.",
        "It was late, because we went home.",
        "So it was late, we went home.",
      ], 0),
      qfill("We stayed inside ___ it was raining.", ["because"]),
      qmcq("Which sentence gives a reason?", [
        "I was late because the road was closed.",
        "I was late, so the road was closed.",
        "The road was closed, that is late.",
      ], 0),
    ],
    scenes: [
      sc("Mirela", "a friend you kept waiting", "to hear why you were late",
        "You arrived very late and your friend waited.",
        "Explain the reason and what you decided.",
        "I was starting to worry! What happened?", "relieved"),
      sc("Patrick", "your manager", "to understand a decision you made alone",
        "You made a call without checking first and must explain.",
        "Give the reason and the result.",
        "You changed the plan yesterday. Why did you do that?", "even"),
      sc("Sara", "a fellow passenger", "to swap stories about the delay",
        "A cancelled connection has stranded several travellers.",
        "Explain what you did and why.",
        "Our train was cancelled. What did you do?", "commiserating"),
      sc("Mr. Boateng", "your teacher", "to practise because and so",
        "The class is joining reasons and results.",
        "Explain a decision fully.",
        "Tell us about a decision you made quickly. Why did you make it?", "encouraging"),
      sc("Ms. Aaltonen", "the examiner", "to check reason and result links",
        "The examiner asks about a past decision.",
        "Give reason and result clearly.",
        "Could you tell me about a decision you had to make in a hurry?", "neutral"),
    ],
  },

  {
    id: "a2-if-it-rains-well-stay",
    topic: "talking about a likely future situation",
    objectives: [
      "Use the present tense after 'if' when talking about the future.",
      "Use will in the other half of the sentence.",
    ],
    goal: "Plan an event around weather you cannot control.",
    target: "if plus present, will plus base verb",
    correction: "Repeat the whole sentence with the correct tenses and let the learner build another.",
    summary: "You learned to talk about a likely future situation with if plus the present and will.",
    minutes: 8,
    points: [
      {
        form: "if it rains, we'll stay",
        claims: [
          "After 'if' use the present tense, even though you mean the future.",
          "The other half uses will plus the base verb.",
        ],
        ex: ["If it rains, we'll stay inside.", "If she calls, I'll tell her."],
      },
      {
        form: "I'll call you",
        claims: [
          "Either half can come first; only the comma moves.",
          "Never put 'will' after 'if' in this pattern.",
        ],
        ex: ["I'll call you if there's a problem.", "If there's a problem, I'll call you."],
      },
      {
        form: "if you want",
        claims: [
          "'If you want' and 'if you like' soften an offer.",
          "'Unless' means the same as 'if not'.",
        ],
        ex: ["I'll book it if you want.", "We'll go ahead unless it snows."],
      },
    ],
    ex: [],
    drills: [
      // p1 — if + present, will + verb
      fc("p1", "If it ___, we'll stay inside.", ["rains", "will rain", "rain"]),
      fc("p1", "If she calls, ___ her.", ["I'll tell", "I told", "I will telling"]),
      sit("p1", "Maybe it will rain tomorrow. Then you will stay at home. What do you say?", [
        "If it rains tomorrow, I'll stay at home.",
        "If it will rain tomorrow, I'll stay at home.",
        "If it rains tomorrow, I staying at home.",
      ]),
      lc("p1", "If it rains, we'll stay inside.", ["If it rains, we'll play inside.", "If it snows, we'll stay inside."]),
      // p2 — either half first, no will after if
      fc("p2", "I'll call you if there ___ a problem.", ["is", "will be", "be"]),
      arr("p2", "I'll call you if you're late.", ["will"]),
      spk("p2", "I'll call you if there's a problem."),
      // p3 — if you want / unless
      chat("p3", ["I can book the restaurant.", null], [
        "Great, book it if you want.",
        "Great, book it if you will want.",
        "Great, book it unless you want.",
      ]),
      sit("p3", "You will go to the beach. The only problem is snow. What do you say?", [
        "We'll go unless it snows.",
        "We'll go if it snows.",
        "We'll go unless it will snow.",
      ]),
      la("p3", "I'll help you if you like.", ["will"]),
      // karışık
      chat("mix", ["What's the plan for Saturday?", null], [
        "If it's sunny, we'll go to the park. I'll call you if you want.",
        "If it will be sunny, we'll go to the park. I'll call you if you want.",
        "If it's sunny, we go to the park will. I'll call you if you want.",
      ]),
      lc("mix", "If you want, I'll call you tonight.", ["If you want, I'll call you tomorrow.", "If you want, I'll visit you tonight."]),
    ],
    success: "The learner produces at least two correct if-sentences about the future.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "If it snows, we will cancel.",
        "If it will snow, we will cancel.",
        "If it snows, we cancel will.",
      ], 0),
      qfill("If you ___ late, send me a message. (be)", ["are"]),
      qmcq("Which sentence is correct?", [
        "I'll help you if you need it.",
        "I'll help you if you will need it.",
        "I help you will if you need it.",
      ], 0),
    ],
    scenes: [
      sc("Ingrid", "a friend organising a picnic", "to have a backup plan for bad weather",
        "A picnic is planned and the forecast is uncertain.",
        "Agree what happens if the weather turns.",
        "The weather might change. What will we do if it rains?", "practical"),
      sc("Cormac", "a colleague running an outdoor event", "to prepare for every weather outcome",
        "A company event is outdoors next week.",
        "Plan for each possible outcome.",
        "What will we do if it rains during the event?", "planning"),
      sc("Talia", "a trek leader", "to prepare the group for changing conditions",
        "The group is setting off and conditions may change.",
        "Ask and answer about what happens if things change.",
        "The weather here changes fast. What will you do if it rains?", "steady"),
      sc("Mr. Anand", "your teacher", "to practise if-sentences",
        "The class is making plans with conditions.",
        "Make plans that depend on a condition.",
        "What will you do if it rains at the weekend?", "encouraging"),
      sc("Ms. Berger", "the examiner", "to check conditional forms",
        "The examiner asks about a plan with a risk.",
        "Use conditional sentences correctly.",
        "Could you tell me about a plan you have and what you will do if it goes wrong?", "neutral"),
    ],
  },

  {
    id: "a2-when-water-boils",
    topic: "things that are always true",
    objectives: [
      "Use the present tense in both halves for things that always happen.",
      "Choose between if and when for general truths.",
    ],
    goal: "Explain how something works, step by step.",
    target: "if and when for general truths",
    correction: "Repeat the sentence with both halves in the present and let the learner explain again.",
    summary: "You learned to describe things that are always true with the present tense in both halves.",
    minutes: 8,
    points: [
      {
        form: "if you heat",
        claims: [
          "For things that are always true, both halves use the present tense.",
          "There is no 'will' here, because the result is not a prediction.",
        ],
        ex: ["If you heat water, it boils.", "If you press this, the machine stops."],
      },
      {
        form: "when it gets",
        claims: [
          "'When' presents the result as regular or certain; 'if' presents it as a condition.",
          "For general truths the two are often interchangeable.",
        ],
        ex: ["When it gets cold, the pipes freeze.", "When you press start, it beeps."],
      },
      {
        form: "it always happens",
        claims: [
          "Words like always, usually and never fit this pattern naturally.",
          "They usually come before most main verbs but after the verb 'be'.",
        ],
        ex: ["It always happens at the same time.", "The light usually comes on first."],
      },
    ],
    ex: [],
    drills: [
      // p1 — if + present, present (always true)
      fc("p1", "If you heat water, it ___.", ["boils", "will boils", "boiling"]),
      sit("p1", "Mixing red and white always gives pink. What do you say?", [
        "If you mix red and white, you get pink.",
        "If you will mix red and white, you get pink.",
        "If you mix red and white, you getting pink.",
      ]),
      arr("p1", "If you press this, the machine stops.", ["stop"]),
      lc("p1", "If you heat ice, it melts.", ["If you heat milk, it boils.", "If you cool water, it freezes."]),
      // p2 — when
      fc("p2", "When it ___ cold, the pipes freeze.", ["gets", "will get", "getting"]),
      chat("p2", ["What happens when you press start?", null], [
        "When you press start, it beeps.",
        "When you press start, it will beeps.",
        "When you will press start, it beeps.",
      ]),
      spk("p2", "When it gets cold, I wear a coat."),
      // p3 — always / usually / never
      fc("p3", "The light ___ comes on first.", ["usually", "usual", "use"]),
      sit("p3", "The bus is late every day. What do you say?", [
        "The bus is always late.",
        "The bus are always late.",
        "The bus is always lately.",
      ]),
      la("p3", "It always happens at the same time.", ["happen"]),
      // karışık
      chat("mix", ["Why is the floor wet?", null], [
        "When it rains, the roof always leaks.",
        "When it will rain, the roof always leaks.",
        "When it rains, the roof always leak.",
      ]),
      lc("mix", "When I'm tired, I always drink coffee.", ["When I'm tired, I never drink coffee.", "When I'm tired, I always drink tea."]),
    ],
    success: "The learner produces at least two correct general-truth sentences.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "If you mix blue and yellow, you get green.",
        "If you will mix blue and yellow, you get green.",
        "If you mix blue and yellow, you will got green.",
      ], 0),
      qfill("When the machine ___ hot, it stops automatically. (get)", ["gets"]),
      qmcq("Which sentence describes something always true?", [
        "Water freezes at zero degrees.",
        "Water will freeze tomorrow.",
        "Water froze last night.",
      ], 0),
    ],
    scenes: [
      sc("Aurelio", "a neighbour with a broken heater", "to understand how the heating works",
        "A neighbour cannot work out the building's heating.",
        "Explain how it works step by step.",
        "My heater is strange. How does yours work?", "frustrated"),
      sc("Nkechi", "a new colleague", "to learn how a machine at work operates",
        "A new colleague needs to use a machine safely.",
        "Explain the steps that always happen.",
        "What happens when I switch on the coffee machine?", "attentive"),
      sc("Ferran", "a host explaining the flat", "to show you how things work in the flat",
        "You are staying somewhere and need to know how things work.",
        "Ask and explain how the appliances work.",
        "Tell me about the shower in your home. What happens when you turn it on?", "friendly"),
      sc("Mrs. Iversen", "your teacher", "to practise general truths",
        "The class is explaining everyday processes.",
        "Explain a process that is always true.",
        "Explain something everyday. What happens if you heat water?", "encouraging"),
      sc("Mr. Sasaki", "the examiner", "to check general-truth forms",
        "The examiner asks how something works.",
        "Explain with the present tense in both halves.",
        "Could you explain how something in your home works?", "neutral"),
    ],
  },

  {
    id: "a2-as-soon-as-i-arrive",
    topic: "future time links",
    objectives: [
      "Use the present tense after time words about the future.",
      "Say what happens first and what happens after.",
    ],
    goal: "Coordinate plans that depend on when things happen.",
    target: "as soon as, when, before and until with future meaning",
    correction: "Repeat the sentence with the present tense after the time word and let the learner try again.",
    summary: "You learned to use the present tense after as soon as, when, before and until when talking about the future.",
    minutes: 8,
    points: [
      {
        form: "as soon as",
        claims: [
          "After 'as soon as' use the present tense, even for the future.",
          "'As soon as' means immediately after, with no delay.",
        ],
        ex: ["I'll call you as soon as I arrive.", "As soon as she replies, I'll let you know."],
      },
      {
        form: "when I get home",
        claims: [
          "'When' works the same way and never takes 'will' in this pattern.",
          "The other half often uses 'will', but it can also be an instruction: 'Call me when you get home.'",
        ],
        ex: ["I'll do it when I get home.", "When the meeting finishes, I'll send the notes."],
      },
      {
        form: "before I leave",
        claims: [
          "'Before' and 'until' follow the same rule.",
          "'Until' means up to that moment and often goes with a negative.",
        ],
        ex: ["I'll finish it before I leave.", "We won't start until everyone arrives."],
      },
    ],
    ex: [],
    drills: [
      // p1 — as soon as
      fc("p1", "I'll call you as soon as I ___.", ["arrive", "will arrive", "arriving"]),
      arr("p1", "I'll text you as soon as I land.", ["will"]),
      sit("p1", "You will tell your friend the news immediately after you hear it. What do you say?", [
        "I'll tell you as soon as I hear.",
        "I'll tell you as soon as I will hear.",
        "I tell you as soon as I'll hear.",
      ]),
      lc("p1", "As soon as she replies, I'll let you know.", [
        "As soon as she replies, I'll let him know.",
        "As soon as she arrives, I'll let you know.",
      ]),
      // p2 — when
      fc("p2", "I'll send the notes when the meeting ___.", ["finishes", "will finish", "finish"]),
      chat("p2", ["When will you do the dishes?", null], [
        "I'll do them when I get home.",
        "I'll do them when I will get home.",
        "I do them when I'll get home.",
      ]),
      spk("p2", "I'll call you when I get home."),
      // p3 — before / until
      fc("p3", "I'll finish it before I ___.", ["leave", "will leave", "leaving"]),
      sit("p3", "The meeting starts only after everyone arrives. What do you say?", [
        "We won't start until everyone arrives.",
        "We won't start until everyone will arrive.",
        "We start until everyone arrives.",
      ]),
      la("p3", "Wait here until I come back.", ["will"]),
      // karışık
      chat("mix", ["What's your plan for tonight?", null], [
        "I'll cook as soon as I get home, before the film starts.",
        "I'll cook as soon as I will get home, before the film starts.",
        "I'll cook as soon as I get home, before the film will start.",
      ]),
      lc("mix", "I'll call you before I leave and when I arrive.", [
        "I'll call you after I leave and when I arrive.",
        "I'll call you before I leave and when I drive.",
      ]),
    ],
    success: "The learner uses future time links correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'll tell her as soon as she arrives.",
        "I'll tell her as soon as she will arrive.",
        "I tell her as soon as she will arrive.",
      ], 0),
      qfill("Call me when you ___ there. (get)", ["get"]),
      qmcq("Which sentence is correct?", [
        "We won't leave until it stops raining.",
        "We won't leave until it will stop raining.",
        "We don't leave until it will stop raining.",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a friend meeting you later", "to know when you will arrive",
        "You are travelling and your friend is waiting for news.",
        "Say what you will do and when.",
        "Tell me the plan. When will you call me?", "waiting"),
      sc("Rahim", "a colleague depending on your work", "to know when the next step can start",
        "Your colleague cannot start until you finish.",
        "Explain the order of what happens.",
        "I need your part of the report. When will you send it?", "patient"),
      sc("Elke", "a hotel receptionist", "to arrange your late arrival",
        "You are arriving after reception closes.",
        "Explain when you will arrive and what you will do.",
        "You arrive late tonight. When will you call us?", "accommodating"),
      sc("Mr. Otieno", "your teacher", "to practise future time links",
        "The class is sequencing future plans.",
        "Say what happens first and next.",
        "What is the first thing you will do when you get home today?", "encouraging"),
      sc("Ms. Grimaldi", "the examiner", "to check future time links",
        "The examiner asks about your plans for tomorrow.",
        "Sequence them with time links.",
        "Could you tell me what you will do as soon as you get home tomorrow?", "neutral"),
    ],
  },

  {
    id: "a2-maybe-probably-definitely",
    topic: "saying how sure you are",
    objectives: [
      "Say how certain or uncertain you are.",
      "Give an honest answer when you cannot commit.",
    ],
    goal: "Answer a question honestly when you cannot give a firm yes or no.",
    target: "expressing degrees of certainty",
    correction: "Model the phrase with its natural certainty level and let the learner answer again.",
    summary: "You learned to show how sure you are, from 'definitely' down to 'probably not'.",
    minutes: 7,
    points: [
      {
        form: "I'm not sure",
        claims: [
          "'I'm not sure' is an honest answer, not a refusal.",
          "Add 'yet' or a reason to show you will decide later.",
        ],
        ex: ["I'm not sure yet.", "I'm not sure, I need to check first."],
      },
      {
        form: "probably / probably not",
        claims: [
          "'Probably' means likely but not certain.",
          "In the negative, 'probably' comes before 'not': probably not.",
        ],
        ex: ["I'll probably come.", "Probably not this week."],
      },
      {
        form: "almost certainly",
        claims: [
          "'Definitely' and 'almost certainly' are the strongest of these.",
          "They usually come before the main verb, after 'be', and after the first auxiliary or modal.",
        ],
        ex: ["I'll definitely be there.", "She's almost certainly right."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm not sure
      chat("p1", ["Will you come to the party?", null], ["I'm not sure yet.", "I'm not sure already.", "I not sure yet."]),
      spk("p1", "I'm not sure, I need to check first."),
      lc("p1", "I'm not sure yet.", ["I'm not sure, sorry.", "I'm sure, yes."]),
      // p2 — probably / probably not
      fc("p2", "I'll ___ come, but I'm not sure.", ["probably", "definitely", "not"]),
      sit("p2", "You think you will not go this week, but you are not certain. What do you say?", [
        "Probably not this week.",
        "Not probably this week.",
        "Definitely not this week.",
      ]),
      la("p2", "She'll probably call tonight.", ["probable"]),
      // p3 — definitely / almost certainly
      fc("p3", "I'll ___ be there. I promise.", ["definitely", "probably", "maybe"]),
      chat("p3", ["Is she right?", null], ["She's almost certainly right.", "She's almost certainly rightly.", "She's almost certain right."]),
      lc("p3", "He's almost certainly at home.", ["He's almost certainly at work.", "He's probably at home."]),
      // karışık
      chat("mix", ["Are you coming on Friday and Saturday?", null], [
        "Friday, definitely. Saturday, probably not.",
        "Friday, definitely. Saturday, not probably.",
        "Friday, definite. Saturday, probably not.",
      ]),
      sit("mix", "You are certain about Monday, but not about Tuesday. What do you say?", [
        "I'll definitely come on Monday, but I'm not sure about Tuesday.",
        "I'll definitely come on Monday, but I'm sure about Tuesday.",
        "I'll definite come on Monday, but I'm not sure about Tuesday.",
      ]),
    ],
    success: "The learner expresses three different levels of certainty appropriately.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'll definitely be there.",
        "I'll be definitely there not.",
        "Definitely I will be there probably.",
      ], 0),
      qfill("___ not this week, I'm too busy. (probable)", ["Probably"]),
      qmcq("Which answer is the least certain?", ["I'm not sure yet.", "I'll definitely come.", "I'm almost certain."], 0),
    ],
    scenes: [
      sc("Marta", "a friend planning three events", "to get an answer for each date",
        "A friend needs answers about several invitations.",
        "Answer each one honestly.",
        "Are you free on Friday, Saturday and Sunday?", "hopeful"),
      sc("Dimitri", "a colleague chasing confirmations", "to fill in a schedule",
        "Your colleague needs commitments for a planning sheet.",
        "Answer with honest certainty levels.",
        "Will you come to the meeting next week?", "practical"),
      sc("Yuki", "a tour organiser", "to know which activities you will join",
        "The group must confirm which activities they want.",
        "Answer with different levels of certainty.",
        "Do you want to join the boat trip tomorrow?", "flexible"),
      sc("Mrs. Larsson", "your teacher", "to practise certainty expressions",
        "The class is answering questions with different certainty.",
        "Answer with different levels of certainty.",
        "Will you be here next week? How sure are you?", "encouraging"),
      sc("Mr. Cabrera", "the examiner", "to check certainty expressions",
        "The examiner asks about your future plans.",
        "Show how sure you are of each.",
        "Could you tell me about your plans for next month and how certain they are?", "neutral"),
    ],
  },

  {
    id: "a2-i-came-here-to-learn",
    topic: "explaining why you do something",
    objectives: [
      "Use 'to' plus a verb to explain purpose.",
      "Distinguish a purpose ('to learn') from a cause or reason ('because I wanted to learn').",
    ],
    goal: "Explain your reasons for a big change in your life.",
    target: "to plus verb for purpose",
    correction: "Repeat the purpose phrase and let the learner explain again.",
    summary: "You learned to explain why you do something with 'to' plus a verb.",
    minutes: 8,
    points: [
      {
        form: "to learn English",
        claims: [
          "'To' plus the base verb explains the purpose of an action.",
          "It answers the question why without using 'because'.",
        ],
        ex: ["I came here to learn English.", "She called to ask about the flat."],
      },
      {
        form: "to get better",
        claims: [
          "'In order to' means the same thing and sounds more formal.",
          "'For' is followed by a noun, not by a verb: for a coffee, not for to drink.",
        ],
        ex: ["I practise every day to get better.", "We stopped for a coffee."],
      },
      {
        form: "I came here to",
        claims: [
          "The purpose usually comes after the main action.",
          "Both halves talk about the same person.",
        ],
        ex: ["I came here to find work.", "He moved to be closer to his family."],
      },
    ],
    ex: [],
    drills: [
      // p1 — to + verb for purpose
      fc("p1", "I came here ___ learn English.", ["to", "for", "for to"]),
      sit("p1", "You call the shop because you want to ask about a price. What do you say?", [
        "I'm calling to ask about the price.",
        "I'm calling for ask about the price.",
        "I'm calling for to ask about the price.",
      ]),
      arr("p1", "She called to ask about the flat.", ["for"]),
      spk("p1", "I came here to find a better job."),
      // p2 — for + noun
      fc("p2", "We stopped ___ a coffee.", ["for", "to", "for to"]),
      fc("p2", "I practise every day ___ get better.", ["to", "for", "for to"]),
      lc("p2", "I study at night to get better.", ["I study at night to get better grades.", "I study at night for a test."]),
      // p3 — main action first, then purpose
      chat("p3", ["Why did you move to London?", null], [
        "I moved to London to find work.",
        "I moved to London for find work.",
        "I moved to London to finding work.",
      ]),
      la("p3", "I came here to see my friends.", ["for"]),
      sit("p3", "You went to the station because you wanted to meet your sister. What do you say?", [
        "I went to the station to meet my sister.",
        "I went to the station for meet my sister.",
        "I went to the station to meeting my sister.",
      ]),
      // karışık
      chat("mix", ["Why are you learning English?", null], [
        "To get a better job, and for fun.",
        "For get a better job, and for fun.",
        "To get a better job, and to fun.",
      ]),
      spk("mix", "I came here to work and to make new friends."),
    ],
    success: "The learner explains purpose with 'to' plus a verb at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "He moved to be closer to his family.",
        "He moved for be closer to his family.",
        "He moved to being closer to his family.",
      ], 0),
      qfill("I went to the shop ___ buy some bread.", ["to"]),
      qmcq("Which sentence explains a purpose?", [
        "I came here to find work.",
        "I came here last year.",
        "I came here with my brother.",
      ], 0),
    ],
    scenes: [
      sc("Larissa", "a new neighbour", "to learn why you moved here",
        "A neighbour is getting to know you.",
        "Explain why you made the change.",
        "You're new in the building. Why did you come here?", "warm"),
      sc("Mr. Ferreira", "an interviewer", "to understand your motivation",
        "You are explaining a career move in an interview.",
        "Explain your purpose clearly.",
        "Why did you change jobs two years ago?", "professional"),
      sc("Ayaan", "a fellow student abroad", "to compare reasons for coming here",
        "Two people abroad are comparing why they came.",
        "Explain your reasons.",
        "Why did you come to this city?", "curious"),
      sc("Ms. Karlsson", "your teacher", "to practise purpose clauses",
        "The class is explaining their reasons for studying.",
        "Explain your purpose.",
        "Why are you learning English? What do you want to do with it?", "encouraging"),
      sc("Mr. Adebayo", "the examiner", "to check purpose forms",
        "The examiner asks about a decision you made.",
        "Explain the purpose behind it.",
        "Tell me about a decision you made. Why did you do it?", "neutral"),
    ],
  },

  {
    id: "a2-i-want-to-go-i-enjoy-going",
    topic: "which verbs take to and which take -ing",
    objectives: [
      "Use 'to' after want, need, decide and would like.",
      "Use -ing after enjoy, finish and mind.",
    ],
    goal: "Talk about what you want to do and what you enjoy doing.",
    target: "verb plus to versus verb plus -ing",
    correction: "Repeat the phrase with the correct form and let the learner build another.",
    summary: "You learned which common verbs are followed by 'to' and which by -ing.",
    minutes: 8,
    points: [
      {
        form: "I want to",
        claims: [
          "Want, need, decide, hope and would like are followed by 'to' plus the base verb.",
          "'Would like to' is a polite way of saying 'want to'.",
        ],
        ex: ["I want to travel more next year.", "We decided to stay another night."],
      },
      {
        form: "I enjoy",
        claims: [
          "Enjoy, finish, mind and practise are followed by the -ing form.",
          "Say 'I enjoy cooking', not 'I enjoy to cook'.",
        ],
        ex: ["I enjoy cooking at the weekend.", "I don't mind waiting."],
      },
      {
        form: "I'd like to",
        claims: [
          "When another verb follows, 'like' can take either form, but 'would like' takes a to-infinitive.",
          "After a preposition, the verb always takes -ing: good at cooking.",
        ],
        ex: ["I'd like to see that film.", "She's good at explaining things."],
      },
    ],
    ex: [],
    drills: [
      // p1 — want / need / hope + to
      fc("p1", "I hope ___ you soon.", ["to see", "seeing", "see"]),
      fc("p1", "I need ___ some milk.", ["to buy", "buying", "buy"]),
      arr("p1", "I want to travel more next year.", ["travelling"]),
      lc("p1", "I want to go home.", ["I want to go out.", "I don't want to go home."]),
      // p2 — enjoy / finish / mind + -ing
      fc("p2", "I enjoy ___ at the weekend.", ["cooking", "to cook", "cook"]),
      sit("p2", "You stopped working on your report. It is done. What do you say?", [
        "I finished writing my report.",
        "I finished to write my report.",
        "I finished write my report.",
      ]),
      chat("p2", ["Do you like your new job?", null], [
        "Yes, I really enjoy working there.",
        "Yes, I really enjoy to work there.",
        "Yes, I really enjoy work there.",
      ]),
      spk("p2", "I enjoy cooking at the weekend."),
      // p3 — would like to / preposition + -ing
      fc("p3", "I'd like ___ that film.", ["to see", "seeing", "see"]),
      fc("p3", "He's good at ___ games.", ["playing", "to play", "play"]),
      la("p3", "I'd like to learn Spanish.", ["learning"]),
      // karışık
      chat("mix", ["What are your plans?", null], [
        "I want to travel because I enjoy meeting people.",
        "I want travelling because I enjoy meeting people.",
        "I want to travel because I enjoy to meet people.",
      ]),
      sit("mix", "You like swimming, and you want to swim tomorrow. What do you say?", [
        "I enjoy swimming, so I'd like to swim tomorrow.",
        "I enjoy to swim, so I'd like to swim tomorrow.",
        "I enjoy swimming, so I'd like swimming tomorrow.",
      ]),
    ],
    success: "The learner uses both patterns correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We decided to stay another night.",
        "We decided staying another night.",
        "We decided stay another night.",
      ], 0),
      qfill("She's good at ___ things clearly. (explain)", ["explaining"]),
      qmcq("Which sentence is correct?", [
        "I don't mind waiting.",
        "I don't mind to wait.",
        "I don't mind wait.",
      ], 0),
    ],
    scenes: [
      sc("Pia", "a friend making plans for the year", "to compare your hopes for the year",
        "Two friends are talking about the year ahead.",
        "Say what you want to do and enjoy doing.",
        "It's a new year! What do you want to do this year?", "upbeat"),
      sc("Nathan", "a manager discussing development", "to understand what you want to work on",
        "A development conversation at work.",
        "Say what you want to do and enjoy.",
        "What would you like to learn at work this year?", "supportive"),
      sc("Rania", "a language exchange partner", "to plan how you will practise together",
        "Two people are agreeing how to practise together.",
        "Say what you want to practise and enjoy doing.",
        "What do you enjoy talking about?", "flexible"),
      sc("Mr. Jankowski", "your teacher", "to practise verb patterns",
        "The class is talking about hopes and hobbies.",
        "Use both verb patterns correctly.",
        "What do you want to do this year, and what do you enjoy doing already?", "encouraging"),
      sc("Ms. Oyelaran", "the examiner", "to check verb patterns",
        "The examiner asks about your interests and plans.",
        "Use both patterns accurately.",
        "Could you tell me what you enjoy doing in your free time?", "neutral"),
    ],
  },

  {
    id: "a2-making-a-decision",
    topic: "talking a decision through",
    objectives: [
      "Present both sides of a decision.",
      "Say what will follow from each choice.",
    ],
    goal: "Weigh up a big decision out loud and reach a conclusion.",
    target: "weighing options and announcing a decision",
    correction: "Model the contrast sentence and let the learner continue weighing.",
    summary: "You practised presenting both sides of a decision and announcing your choice.",
    minutes: 7,
    points: [
      {
        form: "on the other hand",
        claims: [
          "'On the one hand ... on the other hand' presents two sides in order.",
          "'On the other hand' can also stand alone to introduce the second side.",
        ],
        ex: ["On the other hand, the rent is much higher.", "On the one hand it pays better."],
      },
      {
        form: "if I do that / I've decided to",
        claims: [
          "'If I do that' names the consequence of one option.",
          "With 'if' plus the present tense, the result usually uses 'will' plus the base verb.",
          "'I've decided to' plus the base verb announces your conclusion after the weighing.",
        ],
        ex: ["If I do that, I'll have to move.", "If I stay, I'll save money.", "I've decided to take the job."],
      },
    ],
    ex: [],
    drills: [
      // p1 — on the other hand
      fc("p1", "The job pays well. ___, it's far from home.", ["On the other hand", "On another hand", "In the other hand"]),
      lc("p1", "On the other hand, the rent is much higher.", [
        "On the other hand, the rent is much lower.",
        "On one hand, the rent is much higher.",
      ]),
      la("p1", "On the one hand it pays better.", ["another"]),
      // p2 — if I do that / I've decided to
      fc("p2", "If I do that, ___ have to move.", ["I'll", "I will to", "I'm"]),
      chat("p2", ["So, what's your answer?", null], [
        "I've decided to take the job.",
        "I've decided taking the job.",
        "I've decided take the job.",
      ]),
      spk("p2", "If I stay, I'll save money."),
      // karışık
      chat("mix", ["Will you move to Berlin?", null], [
        "The pay is better. On the other hand, it's far. I've decided to stay.",
        "The pay is better. On the other hand, it's far. I've decided staying.",
        "The pay is better. In the other hand, it's far. I've decided to stay.",
      ]),
      sit("mix", "If you buy the car, you'll have no money. So you decide to wait. What do you say?", [
        "If I buy it, I'll have no money, so I've decided to wait.",
        "If I will buy it, I'll have no money, so I've decided to wait.",
        "If I buy it, I have no money will, so I've decided to wait.",
      ]),
    ],
    success: "The learner presents both sides and announces a clear decision.",
    quiz: [
      qmcq("Which phrase introduces the second side?", [
        "On the other hand",
        "For example",
        "In the end",
      ], 0),
      qfill("I've decided ___ wait another month.", ["to"]),
      qmcq("Which sentence names a consequence?", [
        "If I do that, I'll have to move.",
        "I did that last year.",
        "That is a good idea.",
      ], 0),
    ],
    scenes: [
      sc("Georgios", "a close friend", "to help you think the move through",
        "You are considering moving to another city and need to talk.",
        "Weigh both sides out loud and decide.",
        "You can't decide about the new job. What are the good and bad sides?", "patient"),
      sc("Helena", "your mentor at work", "to help you weigh a career choice",
        "A career decision has to be made this week.",
        "Present both sides and reach a conclusion.",
        "You have two job offers. Which one will you take?", "thoughtful"),
      sc("Emre", "a friend who moved abroad", "to share experience of the same decision",
        "Someone who made the same move is offering perspective.",
        "Weigh the decision with their input.",
        "Do you want to move abroad or stay here?", "understanding"),
      sc("Mrs. Petrenko", "your teacher", "to practise weighing options",
        "The class is discussing difficult decisions.",
        "Present both sides and decide.",
        "Think of a hard decision. What are the two sides?", "encouraging"),
      sc("Mr. Almeida", "the examiner", "to check discussion language",
        "The examiner asks about a difficult decision.",
        "Present both sides and conclude.",
        "Could you tell me about a difficult decision and how you thought about it?", "neutral"),
    ],
  },
];
