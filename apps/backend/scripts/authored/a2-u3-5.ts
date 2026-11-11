/** A2 · Ünite 3-5 — Comparing · Rules and Advice · Experiences (22 ders, elle yazıldı).
 *
 *  Ünite 3 karşılaştırmayı üç ayrı biçimde kuruyor (-er / more / as...as) ve
 *  aralarına zarf ile aşırı sıfatları koyuyor: A2'de öğrenci "more better" ve
 *  "more cheap" hatalarını tam burada üretiyor, o yüzden kısa-uzun sıfat ayrımı
 *  ilk iki derste ayrı ayrı öğretiliyor.
 *
 *  Ünite 4 zorunluluk ile tavsiyeyi ayırıyor; `don't have to` ↔ `mustn't` farkına
 *  ayrı ders veriliyor çünkü bu ikisi bu seviyede en sık karışan çifttir.
 *
 *  Ünite 5 present perfect'i DENEYİM olarak açıyor (ever/never/been-gone/already-
 *  just/yet). Geçmiş zamanla karşıtlık ünite 1'de kurulduğu için burada "ne zaman"
 *  sorusu yok: deneyimin kendisi konuşuluyor.
 *
 *  Gramer derslerinde 4 alıştırma, phrases/practice'te 3.
 *
 *  NOT — MCQ doğru şıkkı hep 0'da yazılır: şık sırası SERVİS ANINDA deterministik
 *  olarak karıştırılıyor (bkz. permuteChoices), yani kaynaktaki indeks öğrencinin
 *  gördüğü sırayı belirlemiyor. 0'da tutmak inceleme dökümünü okunur kılıyor.
 */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const A2_U3_5: Authored[] = [
  // --- Ünite 3 · Comparing ---------------------------------------------------
  {
    id: "a2-bigger-and-better",
    topic: "comparing two things with short describing words",
    objectives: [
      "Add -er to short describing words to compare two things.",
      "Say how big the difference between them is.",
    ],
    goal: "Compare two things and say which one is better for you.",
    target: "comparatives with -er and than",
    correction: "Say the comparative form inside a full sentence and let the learner repeat it.",
    summary: "You learned to compare two things with -er and than, and to say how big the difference is.",
    minutes: 8,
    points: [
      {
        form: "-er than",
        claims: [
          "Add -er to short describing words and put 'than' before the second thing.",
          "For many one-syllable words ending consonant + vowel + consonant, double the final consonant: big becomes bigger, hot becomes hotter.",
        ],
        ex: ["This flat is bigger than the other one.", "The second one is cheaper than the first."],
      },
      {
        form: "y becomes -ier",
        claims: [
          "Words ending in -y change the y to -ier: easy becomes easier, busy becomes busier.",
          "The rest of the sentence does not change.",
        ],
        ex: ["The journey is easier than I expected.", "This street is noisier than ours."],
      },
      {
        form: "much better",
        claims: [
          "Put 'much', 'a lot' or 'a bit' before the comparative to say how big the difference is.",
          "'Good' has an irregular comparative: better, not gooder.",
        ],
        ex: ["It's much better than the old one.", "This one is a bit smaller."],
      },
    ],
    ex: [],
    drills: [
      // p1 — -er than
      fc("p1", "This flat is ___ than the other one.", ["bigger", "biger", "more big"]),
      arr("p1", "It's cheaper than the other one.", ["cheap"]),
      fc("p1", "Today is ___ than yesterday.", ["hotter", "hoter", "more hot"]),
      lc("p1", "My room is smaller than yours.", ["My room is bigger than yours.", "My room is smaller than his."]),
      // p2 — y > -ier
      fc("p2", "The test was ___ than I expected.", ["easier", "easyer", "more easy"]),
      err("p2", "This street is noisyer than ours.", "noisyer", "noisier"),
      spk("p2", "The journey is easier than I expected."),
      // p3 — much / a bit + better
      fc("p3", "It's ___ better than the old one.", ["much", "more", "very"]),
      sit("p3", "The new phone is very good. The old one was bad. What do you say?", [
        "The new one is much better.",
        "The new one is much gooder.",
        "The new one is very better.",
      ]),
      la("p3", "This one is a bit smaller.", ["smallest"]),
      // karışık
      chat("mix", ["Which flat do you like?", null], [
        "The second one. It's much bigger and easier to find.",
        "The second one. It's much biger and easier to find.",
        "The second one. It's very bigger and easier to find.",
      ]),
      sit("mix", "Bus: 2 euros, 40 minutes. Train: 5 euros, 20 minutes. What is true?", [
        "The bus is a lot cheaper, but the train is faster.",
        "The bus is a lot cheapper, but the train is faster.",
        "The bus is a lot more cheap, but the train is faster.",
      ]),
    ],
    success: "The learner uses at least two comparative forms and uses 'than' correctly in a comparison.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "This box is heavier than that one.",
        "This box is more heavy than that one.",
        "This box is heavyer than that one.",
      ], 0),
      qfill("The red one is ___ than the blue one. (cheap)", ["cheaper"]),
      qmcq("Which sentence is correct?", [
        "It's much better than before.",
        "It's much more better than before.",
        "It's much gooder than before.",
      ], 0),
    ],
    scenes: [
      sc("Nadia", "a friend helping you decide", "to work out which of two flats you should take",
        "You have seen two flats and cannot decide between them.",
        "Compare the two flats and say which is better.",
        "You saw two flats today. Which one is bigger?", "practical"),
      sc("Ryan", "a colleague looking at two offices", "to choose between two possible team spaces",
        "The team has to pick one of two floors to move into.",
        "Compare the two spaces for the team.",
        "We can have an office on the third floor or the fifth. Which one is better for you?", "considering"),
      sc("Beatrix", "a travel agent", "to help you pick between two hotels",
        "Two hotels are available for the same dates and price range.",
        "Compare the two hotels and choose one.",
        "One hotel is near the beach, one is in the centre. Which one is better for you?", "helpful"),
      sc("Ms. Oyelaran", "your teacher", "to practise comparing two things",
        "The class is comparing pairs of everyday objects and places.",
        "Compare two things you know well.",
        "Think of two places you know well. Which one is bigger?", "encouraging"),
      sc("Mr. Bauer", "the examiner", "to check that you can compare two things",
        "The examiner asks you to compare two familiar places.",
        "Compare them clearly and say which you prefer.",
        "Could you compare two places you know? Which one is better?", "neutral"),
    ],
  },

  {
    id: "a2-more-interesting-than",
    topic: "comparing with longer words and irregular forms",
    objectives: [
      "Use 'more' with longer describing words.",
      "Use the irregular comparisons better and worse.",
    ],
    goal: "Compare two places or things using longer describing words.",
    target: "comparatives with 'more' and the common irregulars",
    correction: "Repeat the sentence with the correct comparative form and invite the learner to try again.",
    summary: "You learned when to use 'more' instead of -er, and the forms better, worse and less.",
    minutes: 8,
    points: [
      {
        form: "more ... than",
        claims: [
          "Many longer describing words take 'more' instead of -er.",
          "Some two-syllable words still take -er, especially those ending in -y: happy becomes happier.",
          "Never use both together: 'more expensive', not 'more expensiver'.",
        ],
        ex: ["This city is more expensive than my hometown.", "The museum is more interesting than the castle."],
      },
      {
        form: "less ... than",
        claims: [
          "'Less' is the opposite of 'more' and works the same way.",
          "'Less crowded' means fewer people than the other place.",
        ],
        ex: ["The old town is less crowded in winter.", "This route is less tiring than the other one."],
      },
      {
        form: "better and worse",
        claims: [
          "'Good' and 'bad' are irregular: they become better and worse.",
          "These two never take -er or 'more'.",
        ],
        ex: ["The weather here is better than at home.", "The traffic was worse than yesterday."],
      },
    ],
    ex: [],
    drills: [
      // p1 — more ... than
      fc("p1", "This city is ___ than my hometown.", ["more expensive", "expensiver", "more expensiver"]),
      err("p1", "The museum is more interestinger than the castle.", "interestinger", "interesting"),
      arr("p1", "It's more comfortable than my old flat.", ["most"]),
      lc("p1", "It's more expensive than the bus.", ["It's less expensive than the bus.", "It's more expensive than the boat."]),
      // p2 — less ... than
      fc("p2", "The old town is ___ crowded in winter.", ["less", "fewer", "lesser"]),
      sit("p2", "In the morning there are 50 people in the gym. In the evening there are 200. What do you say?", [
        "The gym is less crowded in the morning.",
        "The gym is fewer crowded in the morning.",
        "The gym is less crowdeder in the morning.",
      ]),
      spk("p2", "The museum is less crowded on Mondays."),
      // p3 — better / worse
      fc("p3", "The traffic was ___ than yesterday.", ["worse", "badder", "more bad"]),
      chat("p3", ["How was the weather on your trip?", null], [
        "It was better than at home.",
        "It was gooder than at home.",
        "It was more better than at home.",
      ]),
      la("p3", "The weather here is better than at home.", ["good"]),
      // karışık
      chat("mix", ["Which city do you prefer?", null], [
        "The second one. It's more interesting and less crowded.",
        "The second one. It's interestinger and less crowded.",
        "The second one. It's more interesting and fewer crowded.",
      ]),
      sit("mix", "Hotel A is cheap but noisy. Hotel B costs more, but it is quiet and clean. What do you say about Hotel B?", [
        "It's more expensive, but it's better.",
        "It's expensiver, but it's better.",
        "It's more expensive, but it's more good.",
      ]),
    ],
    success: "The learner uses 'more' or an irregular comparative correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "This film is more boring than the last one.",
        "This film is boringer than the last one.",
        "This film is more boringer than the last one.",
      ], 0),
      qfill("The food here is ___ than at the other place. (good)", ["better"]),
      qmcq("Which sentence is correct?", [
        "The second route is less tiring.",
        "The second route is less tiringer.",
        "The second route is more less tiring.",
      ], 0),
    ],
    scenes: [
      sc("Teodor", "a friend who has travelled a lot", "to compare the cities you have both seen",
        "Two friends are comparing places they have visited.",
        "Compare two cities you know.",
        "You know two cities well. Which one is more interesting?", "curious"),
      sc("Marguerite", "a colleague planning a company trip", "to choose the better city for the event",
        "The team event can be held in one of two cities.",
        "Compare the two cities for the event.",
        "Our trip can be in Rome or in Berlin. Which city is less crowded, do you think?", "focused"),
      sc("Arjun", "another traveller at the hostel", "to swap opinions about the region",
        "Two travellers compare the towns they have passed through.",
        "Compare the places you have seen.",
        "Is your city more expensive than this one?", "open"),
      sc("Dr. Weiss", "your teacher", "to practise longer comparative forms",
        "The class is comparing cities and regions.",
        "Compare two places using longer describing words.",
        "Compare two cities you know. Which one is more expensive?", "encouraging"),
      sc("Mrs. Aoki", "the examiner", "to check longer comparative forms",
        "The examiner asks you to compare two places you know.",
        "Compare them using longer describing words.",
        "Could you compare two cities you know? Which one is better?", "neutral"),
    ],
  },

  {
    id: "a2-the-best-one",
    topic: "saying which is the top or bottom of a group",
    objectives: [
      "Use the superlative for the top or bottom of a group.",
      "Say why something is your favourite.",
    ],
    goal: "Pick the best or worst from a group and explain your choice.",
    target: "superlatives with the -est and the most",
    correction: "Say the superlative with 'the' in a full sentence and let the learner repeat it.",
    summary: "You learned to name the top or bottom of a group with the -est and the most.",
    minutes: 8,
    points: [
      {
        form: "the -est",
        claims: [
          "Short words take the -est and almost always need 'the' before them.",
          "The spelling rules are the same as the comparative: big becomes the biggest, easy becomes the easiest.",
        ],
        ex: ["That's the cheapest one in the shop.", "This is the easiest way to get there."],
      },
      {
        form: "the most",
        claims: [
          "Longer words take 'the most' instead of the -est.",
          "'Good' and 'bad' are irregular here too: the best and the worst.",
        ],
        ex: ["It's the most comfortable chair in the office.", "That was the best meal of the trip."],
      },
      {
        form: "my favourite one",
        claims: [
          "'My favourite' says which one you like most without a comparison word.",
          "Add 'because' to give the reason for your choice.",
        ],
        ex: ["This is my favourite one because it is light.", "The small one is my favourite."],
      },
    ],
    ex: [],
    drills: [
      // p1 — the -est
      fc("p1", "That's ___ one in the shop.", ["the cheapest", "cheapest", "the cheaper"]),
      err("p1", "This is the easyest way to get there.", "easyest", "easiest"),
      arr("p1", "This hotel is the cheapest.", ["cheapests"]),
      lc("p1", "It's the longest day of the year.", ["It's the shortest day of the year.", "It's the longest day of the week."]),
      // p2 — the most / the best / the worst
      fc("p2", "It's ___ comfortable chair in the office.", ["the most", "the more", "most"]),
      sit("p2", "You ate five meals on your trip. One was better than all the others. What do you say?", [
        "That was the best meal of the trip.",
        "That was the goodest meal of the trip.",
        "That was the most good meal of the trip.",
      ]),
      spk("p2", "It's the most beautiful place in the city."),
      // p3 — my favourite
      fc("p3", "This is my ___ one because it's light.", ["favourite", "favourites", "the favourite"]),
      chat("p3", ["Which cup do you like?", null], [
        "The small one is my favourite.",
        "The small one is my favourites.",
        "The small one is the my favourite.",
      ]),
      la("p3", "This is my favourite one because it's light.", ["favourites"]),
      // karışık
      chat("mix", ["Which hotel should I book?", null], [
        "The Park Hotel. It's the cheapest, and it's my favourite.",
        "The Park Hotel. It's cheapest the, and it's my favourite.",
        "The Park Hotel. It's the most cheap, and it's my favourite.",
      ]),
      sit("mix", "Three phones: A costs 100 euros, B costs 300, C costs 500. You like A most. What do you say?", [
        "A is the cheapest, and it's my favourite.",
        "A is the most cheap, and it's my favourite.",
        "A is the cheaper, and it's my favourite.",
      ]),
    ],
    success: "The learner uses a superlative correctly and gives a reason for the choice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "This is the biggest room in the flat.",
        "This is the most big room in the flat.",
        "This is the bigest room in the flat.",
      ], 0),
      qfill("It was ___ worst day of the week.", ["the"]),
      qmcq("Which sentence is correct?", [
        "That was the most interesting part.",
        "That was the interestingest part.",
        "That was the most interestingest part.",
      ], 0),
    ],
    scenes: [
      sc("Paloma", "a friend asking for a recommendation", "to find the best place to eat nearby",
        "A friend wants one clear recommendation, not a long list.",
        "Name the best option and say why.",
        "I only have one evening here. What's the best restaurant in your city?", "trusting"),
      sc("Declan", "a colleague comparing suppliers", "to choose the best of three offers",
        "Three offers are on the table and one has to be chosen.",
        "Say which offer is best and why.",
        "Think of the shops near your office. Which one is the cheapest?", "analytical"),
      sc("Xiomara", "a hotel concierge", "to help you choose the best day trip",
        "Several day trips are available and you can only do one.",
        "Pick the best option and explain the choice.",
        "What is the best place to visit in your country?", "welcoming"),
      sc("Mr. Kovacs", "your teacher", "to practise superlative forms",
        "The class is ranking places and things.",
        "Name the best or worst of a group and explain.",
        "Think of three restaurants you know. Which one is the best?", "encouraging"),
      sc("Ms. Reyes", "the examiner", "to check superlative forms",
        "The examiner asks you to choose the top of a group.",
        "Name it with a superlative and justify it.",
        "What is your favourite place to eat, and why?", "neutral"),
    ],
  },

  {
    id: "a2-i-prefer-this-one",
    topic: "saying which of two things you prefer",
    objectives: [
      "Say which of two options you prefer.",
      "Give a short reason for your preference.",
    ],
    goal: "Choose between two options in a shop and explain your choice.",
    target: "expressing preference between two options",
    correction: "Model the preference sentence and let the learner say their own version.",
    summary: "You learned three ways to say which option you prefer and how to give a reason.",
    minutes: 7,
    points: [
      {
        form: "I prefer",
        claims: [
          "'Prefer' can be followed by a noun, an -ing form or a to-infinitive.",
          "When you compare two activities directly, use 'to': I prefer walking to driving.",
        ],
        ex: ["I prefer the blue one.", "I prefer walking to driving.", "I prefer to travel by train."],
      },
      {
        form: "I like this one",
        claims: [
          "'This one' and 'that one' avoid repeating the name of the thing.",
          "'Better' turns a simple opinion into a comparison: I like this one better.",
        ],
        ex: ["I like this one better.", "I like the smaller one."],
      },
      {
        form: "I'd rather have",
        claims: [
          "'I'd rather' is followed by the base verb, with no 'to'.",
          "It sounds slightly softer than 'I want'.",
        ],
        ex: ["I'd rather have the black one.", "I'd rather pay a bit more for a good one."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I prefer
      fc("p1", "I prefer tea ___ coffee.", ["to", "than", "from"]),
      sit("p1", "You like trains more than buses. What do you say?", [
        "I prefer the train.",
        "I prefer the train than the bus.",
        "I'm preferring the train.",
      ]),
      spk("p1", "I prefer to travel by train."),
      // p2 — I like this one (better)
      chat("p2", ["Do you want the red bag or the blue one?", null], [
        "I like the blue one better.",
        "I like the blue one more better.",
        "I like the blue one gooder.",
      ]),
      arr("p2", "I like the smaller one.", ["ones"]),
      lc("p2", "I like that one better.", ["I like that one less.", "I like that colour better."]),
      // p3 — I'd rather
      fc("p3", "I'd rather ___ the black one.", ["have", "to have", "having"]),
      sit("p3", "You don't want the cheap one. You want to pay more for a good one. What do you say?", [
        "I'd rather pay a bit more.",
        "I'd rather to pay a bit more.",
        "I'd rather paying a bit more.",
      ]),
      la("p3", "I'd rather have the black one.", ["having"]),
      // karışık
      chat("mix", ["Tea or coffee?", null], [
        "I prefer tea, but I'd rather have coffee today.",
        "I prefer tea, but I'd rather to have coffee today.",
        "I prefer tea, but I'd rather having coffee today.",
      ]),
      sit("mix", "There are two jackets. You like the green one more, but you want to spend less. What do you say?", [
        "I like the green one better, but I'd rather pay less.",
        "I like the green one better, but I'd rather to pay less.",
        "I like the green one more better, but I'd rather pay less.",
      ]),
    ],
    success: "The learner states a preference and supports it with a reason.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I prefer walking to driving.",
        "I prefer walking than driving.",
        "I prefer to walking than drive.",
      ], 0),
      qfill("I'd ___ have the smaller size.", ["rather"]),
      qmcq("Which sentence gives a preference?", [
        "I like this one better.",
        "This one is over there.",
        "They have two sizes.",
      ], 0),
    ],
    scenes: [
      sc("Sinead", "a shop assistant", "to help you choose between two items",
        "You are holding two similar items and cannot decide.",
        "Say which one you prefer and why.",
        "You are trying two jackets, a black one and a blue one. Which one do you prefer?", "patient"),
      sc("Omar", "a colleague choosing office equipment", "to agree on one option for the team",
        "Two models are within budget and the team must pick one.",
        "State your preference and give a reason.",
        "Two laptops are in the budget, a small one and a big one. Which would you rather have?", "practical"),
      sc("Lena", "a market seller", "to sell you one of two similar items",
        "A market stall has two versions of the same thing.",
        "Say which one you prefer and why.",
        "I have this bag in two sizes, a small one and a big one. Which one do you prefer?", "friendly"),
      sc("Mrs. Dube", "your teacher", "to practise expressing preference",
        "The class is choosing between pairs of options.",
        "State a preference and justify it.",
        "Imagine two holidays: one at the beach and one in the city. Which do you prefer?", "encouraging"),
      sc("Mr. Ellery", "the examiner", "to check that you can express preference",
        "The examiner offers you a choice between two things.",
        "State your preference clearly with a reason.",
        "City or countryside? Which do you prefer?", "neutral"),
    ],
  },

  {
    id: "a2-as-cheap-as",
    topic: "saying two things are equal or not equal",
    objectives: [
      "Use 'as ... as' to say two things are the same.",
      "Use 'not as ... as' to say one is less than the other.",
    ],
    goal: "Argue that two options are closer than they look.",
    target: "as ... as and not as ... as",
    correction: "Repeat the full 'as ... as' sentence and let the learner build their own.",
    summary: "You learned to say two things are equal with 'as ... as' and unequal with 'not as ... as'.",
    minutes: 8,
    points: [
      {
        form: "as ... as",
        claims: [
          "Put the plain describing word between the two 'as' words, with no -er and no 'more'.",
          "This says the two things are the same in that way.",
        ],
        ex: ["This one is as good as the expensive one.", "The train is as fast as the bus."],
      },
      {
        form: "not as ... as",
        claims: [
          "'Not as ... as' means the first thing is less than the second.",
          "'It's not as expensive as that one' means it costs less.",
        ],
        ex: ["It's not as expensive as I thought.", "Today is not as cold as yesterday."],
      },
      {
        form: "just as nice",
        claims: [
          "'Just as' makes the equality stronger: exactly the same, not almost.",
          "'Almost as' says it is close but slightly less.",
        ],
        ex: ["The cheaper one is just as nice.", "This route is almost as quick."],
      },
    ],
    ex: [],
    drills: [
      // p1 — as ... as
      fc("p1", "This one is as good ___ the expensive one.", ["as", "than", "like"]),
      err("p1", "The bus is as quicker as the train.", "quicker", "quick"),
      arr("p1", "My sister is as tall as me.", ["taller"]),
      // p2 — not as ... as
      fc("p2", "It's not ___ expensive as I thought.", ["as", "more", "than"]),
      sit("p2", "Today it is 15 degrees. Yesterday it was 5 degrees. What do you say?", [
        "Today is not as cold as yesterday.",
        "Today is not as cold than yesterday.",
        "Today is not as colder as yesterday.",
      ]),
      spk("p2", "It's not as expensive as that one."),
      // p3 — just as / almost as
      sit("p3", "The cheap bag is exactly as nice as the expensive bag. What do you say?", [
        "The cheap one is just as nice.",
        "The cheap one is almost as nice.",
        "The cheap one is just as nicer.",
      ]),
      fc("p3", "The bus is ___ as quick as the train: it's only five minutes slower.", ["almost", "just", "exactly"]),
      la("p3", "This route is almost as quick.", ["quicker"]),
      // karışık
      chat("mix", ["Is the cheap phone as good as the expensive one?", null], [
        "Yes! It's just as good, and it's not as heavy.",
        "Yes! It's just as good, and it's not as heavier.",
        "Yes! It's just as better, and it's not as heavy.",
      ]),
      lc("mix", "It's not as big, but it's just as nice.", [
        "It's not as cheap, but it's just as nice.",
        "It's not as big, but it's much nicer.",
      ]),
    ],
    success: "The learner uses 'as ... as' or 'not as ... as' correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The train is as fast as the bus.",
        "The train is as faster as the bus.",
        "The train is as fast than the bus.",
      ], 0),
      qfill("This bag is not ___ heavy as the other one.", ["as"]),
      qmcq("Which sentence says the two are equal?", [
        "The cheaper one is just as nice.",
        "The cheaper one is nicer.",
        "The cheaper one is not as nice.",
      ], 0),
    ],
    scenes: [
      sc("Gustavo", "a friend about to overspend", "to be talked out of the expensive option",
        "A friend is about to buy the most expensive version of something.",
        "Argue that the cheaper option is just as good.",
        "I want to buy the most expensive phone. Is the cheaper one as good?", "hesitant"),
      sc("Priya", "your manager reviewing the budget", "to justify the cheaper supplier",
        "The cheaper supplier has to be defended in a meeting.",
        "Argue that the two options are equal in quality.",
        "The cheaper laptop costs half the price. Is it as good as the expensive one?", "sceptical"),
      sc("Bram", "a fellow traveller comparing routes", "to decide between a train and a bus",
        "Two ways to reach the same city, different prices.",
        "Compare the two and argue they are close.",
        "The train costs double the bus. Is the bus as fast as the train?", "curious"),
      sc("Ms. Farrow", "your teacher", "to practise equality comparisons",
        "The class is arguing that cheap options can match expensive ones.",
        "Argue two things are equal using 'as ... as'.",
        "Think of something cheap that is as good as an expensive version. What is it?", "encouraging"),
      sc("Mr. Ibrahim", "the examiner", "to check equality comparisons",
        "The examiner asks you to compare two similar things.",
        "Say how they are equal and how they differ.",
        "Think of two similar phones. Is the cheaper one as good as the other one?", "neutral"),
    ],
  },

  {
    id: "a2-absolutely-freezing",
    topic: "strong describing words",
    objectives: [
      "Use strong describing words instead of very plus a plain word.",
      "Choose the right intensifier for a strong word.",
    ],
    goal: "Tell an exaggerated story about weather or a place.",
    target: "extreme adjectives and their intensifiers",
    correction: "Say the strong word with its natural intensifier and let the learner use it again.",
    summary: "You learned strong describing words like freezing and huge, and how to make them stronger.",
    minutes: 7,
    points: [
      {
        form: "freezing / boiling / huge / tiny",
        claims: [
          "Strong words already contain 'very': freezing means very cold, huge means very big.",
          "Because of that, we do not usually say 'very freezing'.",
        ],
        ex: ["It was absolutely freezing outside.", "Their kitchen is tiny."],
      },
      {
        form: "absolutely / really",
        claims: [
          "Use 'absolutely' before strong words instead of 'very'.",
          "'Really' works with both strong and plain words.",
        ],
        ex: ["The room was absolutely boiling.", "The garden was really tiny."],
      },
      {
        form: "it was huge",
        claims: [
          "Strong words make a story livelier than a plain word plus 'very'.",
          "In speech the strong word usually carries the stress.",
        ],
        ex: ["The queue was huge.", "The bill was enormous."],
      },
    ],
    ex: [],
    drills: [
      // p1 — güçlü sıfatlar
      pairs("p1", [
        ["very cold", "freezing"],
        ["very hot", "boiling"],
        ["very small", "tiny"],
        ["very big", "huge"],
      ]),
      fc("p1", "Put on a coat. It's ___ outside.", ["freezing", "boiling", "huge"]),
      sit("p1", "Your kitchen is very, very small. What do you say?", [
        "My kitchen is tiny.",
        "My kitchen is absolutely huge.",
        "My kitchen is tinier.",
      ]),
      // p2 — absolutely / really
      fc("p2", "The room was ___ boiling.", ["absolutely", "much", "more"]),
      chat("p2", ["How was the garden?", null], ["It was really tiny.", "It was really tinyer.", "It was much tiny."]),
      la("p2", "The water was absolutely freezing.", ["freeze"]),
      // p3 — it was huge
      lc("p3", "The queue was huge.", ["The queue was short.", "The room was huge."]),
      sit("p3", "The restaurant bill was very, very big. What do you say?", [
        "The bill was enormous.",
        "The bill was tiny.",
        "The bill was enormously.",
      ]),
      spk("p3", "It was huge!"),
      // karışık
      chat("mix", ["How was your holiday flat?", null], [
        "It was really tiny, and the bedroom was absolutely freezing!",
        "It was really tiny, and the bedroom was much freezing!",
        "It was really tiny, and the bedroom was absolutely freeze!",
      ]),
      spk("mix", "The hotel was huge, but the rooms were really tiny."),
    ],
    success: "The learner uses strong describing words naturally at least twice.",
    quiz: [
      qmcq("Which sentence sounds natural?", [
        "It was absolutely freezing.",
        "It was very freezing.",
        "It was more freezing.",
      ], 0),
      qfill("Their flat is ___, only one small room. (very small)", ["tiny"]),
      qmcq("Which word means very big?", ["huge", "tiny", "narrow"], 0),
    ],
    scenes: [
      sc("Kasia", "a neighbour who loves a good story", "to swap exaggerated weather stories",
        "Two neighbours are outdoing each other with weather stories.",
        "Describe extreme weather with strong words.",
        "Is your home town cold in winter?", "animated"),
      sc("Nils", "a colleague back from a trip", "to hear how extreme the conditions were",
        "A colleague is describing a difficult business trip.",
        "Describe the conditions with strong words.",
        "You were on a trip! Was the hotel big?", "sympathetic"),
      sc("Rafaela", "a guide preparing you for the weather", "to warn you about the conditions",
        "The guide is describing what to expect on the trip.",
        "React and describe extremes you have experienced.",
        "The mountains here are very cold. Is your country hot or cold?", "warning"),
      sc("Mr. Sandoval", "your teacher", "to practise strong describing words",
        "The class is replacing plain words with strong ones.",
        "Describe something extreme.",
        "Instead of saying very cold, what could you say?", "encouraging"),
      sc("Mrs. Lindgren", "the examiner", "to check descriptive range",
        "The examiner asks about an extreme experience.",
        "Describe it with strong words.",
        "What is the weather like in your country in summer?", "neutral"),
    ],
  },

  {
    id: "a2-he-drives-carefully",
    topic: "saying how someone does something",
    objectives: [
      "Form adverbs from describing words with -ly.",
      "Put the adverb in the right place in the sentence.",
    ],
    goal: "Describe how people do things at work or on the road.",
    target: "adverbs of manner",
    correction: "Repeat the sentence with the adverb in its natural place and let the learner say it again.",
    summary: "You learned to say how someone does something using adverbs ending in -ly.",
    minutes: 8,
    points: [
      {
        form: "-ly",
        claims: [
          "Most adverbs add -ly to the describing word: careful becomes carefully, slow becomes slowly.",
          "Words ending in -y change to -ily: easy becomes easily.",
        ],
        ex: ["He drives very carefully.", "She speaks slowly and clearly."],
      },
      {
        form: "fast, hard, well",
        claims: [
          "'Fast' and 'hard' do not change; 'good' becomes 'well'.",
          "'Hardly' is a different word and does not mean 'with effort'.",
        ],
        ex: ["He works hard and drives fast.", "She speaks English quite well."],
      },
      {
        form: "where the adverb goes",
        claims: [
          "The adverb of manner usually comes after the verb or after the object.",
          "It does not go between the verb and its object.",
        ],
        ex: ["She opened the door quietly.", "He answered the question politely."],
      },
    ],
    ex: [],
    drills: [
      // p1 — -ly
      fc("p1", "He drives very ___.", ["carefully", "careful", "carefuly"]),
      fc("p1", "The test was short, so she finished it ___.", ["easily", "easyly", "easy"]),
      arr("p1", "My sister sings beautifully.", ["beautiful"]),
      lc("p1", "He speaks slowly.", ["He speaks loudly.", "He walks slowly."]),
      // p2 — fast, hard, well
      fc("p2", "She speaks English quite ___.", ["well", "good", "goodly"]),
      chat("p2", ["Is your sister a fast driver?", null], [
        "Yes, she drives very fast.",
        "Yes, she drives very fastly.",
        "Yes, she drives very fasting.",
      ]),
      sit("p2", "Your friend gets good marks in every test. What do you say?", [
        "She does well in every test.",
        "She does good in every test.",
        "She does goodly in every test.",
      ]),
      // p3 — zarfın yeri
      chat("p3", ["How did she close the window?", null], [
        "She closed the window carefully.",
        "She closed carefully the window.",
        "She carefully closed carefully the window.",
      ]),
      sit("p3", "Your friend reads books very quickly. What do you say?", [
        "He reads books very quickly.",
        "He reads very quickly books.",
        "He very quickly books reads.",
      ]),
      la("p3", "She speaks English very well.", ["good"]),
      // karışık
      chat("mix", ["How does your dad drive?", null], [
        "He drives carefully, and he parks very well.",
        "He drives careful, and he parks very well.",
        "He drives carefully, and he parks very good.",
      ]),
      spk("mix", "He speaks slowly, but he works very hard."),
    ],
    success: "The learner uses adverbs of manner correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "She opened the door quietly.",
        "She opened quietly the door.",
        "She opened the door quiet.",
      ], 0),
      qfill("He works very ___ and never complains. (hard)", ["hard"]),
      qmcq("Which sentence is correct?", [
        "He answered the question politely.",
        "He answered the question polite.",
        "He politely answered politely the question.",
      ], 0),
    ],
    scenes: [
      sc("Yara", "a neighbour talking about the street", "to compare how people drive around here",
        "Two neighbours are talking about traffic on their street.",
        "Describe how different people drive.",
        "How do people drive in your city?", "chatty"),
      sc("Hendrik", "a new team member", "to learn how the team works",
        "A new colleague wants to know how people here do things.",
        "Describe how your colleagues work.",
        "Tell me about your manager. How does he or she speak?", "curious"),
      sc("Amina", "a driving instructor abroad", "to check you understand local driving habits",
        "You are learning the local rules of the road.",
        "Describe how people drive here and at home.",
        "How do you drive, fast or carefully?", "instructive"),
      sc("Mr. Novak", "your teacher", "to practise adverbs of manner",
        "The class is describing how people do everyday things.",
        "Describe how someone does something.",
        "Think of someone you know well. How do they speak?", "encouraging"),
      sc("Ms. Bright", "the examiner", "to check adverb use",
        "The examiner asks about someone's way of doing things.",
        "Describe it using adverbs.",
        "Think of a person you know. How do they do their job?", "neutral"),
    ],
  },

  {
    id: "a2-which-one-would-you-pick",
    topic: "weighing two options and choosing",
    objectives: [
      "Weigh two real options against each other.",
      "Explain what your choice depends on.",
    ],
    goal: "Help someone choose between two offers and explain your reasoning.",
    target: "comparing two options and justifying a choice",
    correction: "Model the sentence that states the choice and let the learner continue the reasoning.",
    summary: "You practised weighing two options and explaining which one you would choose.",
    minutes: 7,
    points: [
      {
        form: "I'd rather",
        claims: [
          "'I'd rather' plus the base verb states your choice without sounding pushy.",
          "Add 'than' to name the option you are rejecting.",
        ],
        ex: ["I'd rather take the first one.", "I'd rather wait than pay that much."],
      },
      {
        form: "it depends on",
        claims: [
          "'It depends on' is followed by a noun or by a question word.",
          "It says your answer would change if the situation changed.",
        ],
        ex: ["It depends on the price.", "It depends on how much time you have."],
      },
      {
        form: "in my opinion",
        claims: [
          "'In my opinion' marks the next sentence as your view, not a fact.",
          "It usually stands at the start, followed by a comma.",
        ],
        ex: ["In my opinion, the second one is safer.", "In my opinion, it is worth waiting."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd rather (than)
      fc("p1", "I'd rather take the train ___ fly.", ["than", "to", "from"]),
      sit("p1", "Job A pays more. Job B is near your home. You want Job B. What do you say?", [
        "I'd rather take Job B.",
        "I'd rather to take Job B.",
        "I'd rather taking Job B.",
      ]),
      spk("p1", "I'd rather take the first one."),
      // p2 — it depends on
      fc("p2", "It depends ___ the traffic.", ["on", "of", "from"]),
      chat("p2", ["Bus or taxi?", null], ["It depends on the weather.", "It depends of the weather.", "It depends the weather."]),
      la("p2", "It depends on how much time you have.", ["of"]),
      // p3 — in my opinion
      fc("p3", "___ my opinion, the second one is safer.", ["In", "On", "For"]),
      chat("p3", ["Is the city safe at night?", null], [
        "In my opinion, it's quite safe.",
        "On my opinion, it's quite safe.",
        "In mine opinion, it's quite safe.",
      ]),
      lc("p3", "In my opinion, it's worth waiting.", ["In my opinion, it's worth the money.", "In your opinion, is it worth waiting?"]),
      // karışık
      chat("mix", ["Which flat would you take?", null], [
        "It depends on the price. In my opinion, the small one is better.",
        "It depends of the price. In my opinion, the small one is better.",
        "It depends on the price. On my opinion, the small one is better.",
      ]),
      sit("mix", "You like both hotels, but the cheap one is far from the centre. What do you say?", [
        "In my opinion, I'd rather pay more and be near the centre.",
        "In my opinion, I'd rather to pay more and be near the centre.",
        "In my opinion, I'd rather paying more and be near the centre.",
      ]),
    ],
    success: "The learner states a choice, gives a reason and names a condition.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'd rather wait than pay that much.",
        "I'd rather to wait than pay that much.",
        "I'd rather waiting than pay that much.",
      ], 0),
      qfill("It depends ___ the price.", ["on"]),
      qmcq("Which phrase marks an opinion?", ["In my opinion", "As usual", "At the moment"], 0),
    ],
    scenes: [
      sc("Cassia", "a friend with two job offers", "to hear your honest opinion before deciding",
        "A friend has to answer both employers tomorrow.",
        "Weigh the two offers and say which you would pick.",
        "One job pays more, one is near my flat. Which one would you take?", "torn"),
      sc("Lucas", "a colleague choosing between two projects", "to decide which project to join",
        "Two projects need people and your colleague can pick one.",
        "Compare the projects and recommend one.",
        "I can join the big team or the small team. Which would you rather join?", "thinking"),
      sc("Imani", "a fellow traveller with two routes", "to choose the better way to continue the trip",
        "Two routes lead to the same destination, one slower and cheaper.",
        "Compare the routes and choose.",
        "Cheap and slow, or fast and expensive? Which would you pick?", "relaxed"),
      sc("Mrs. Tanaka", "your teacher", "to practise justifying a choice",
        "The class is deciding between pairs of options.",
        "Choose one option and explain fully.",
        "You can study at home or in a library. Which would you rather do, and why?", "encouraging"),
      sc("Mr. Okafor", "the examiner", "to check that you can justify a choice",
        "The examiner presents you with a decision.",
        "Choose and justify with clear reasons.",
        "A better salary or a shorter journey: which would you take?", "neutral"),
    ],
  },

  {
    id: "a2-it-doesnt-fit",
    topic: "changing something you bought",
    objectives: [
      "Explain what is wrong with something you bought.",
      "Ask to change it for a different size or colour.",
    ],
    goal: "Go back to a shop and change something politely.",
    target: "exchanging a purchase in a shop",
    correction: "Model the polite request and let the learner make it again in their own words.",
    summary: "You practised explaining a problem with a purchase and asking to change it.",
    minutes: 7,
    points: [
      {
        form: "it doesn't fit",
        claims: [
          "Say what is wrong before you say what you want.",
          "'It doesn't fit' covers size; 'it doesn't suit me' is about how it looks.",
        ],
        ex: ["I bought this yesterday, but it doesn't fit.", "It's a bit too tight around the shoulders."],
      },
      {
        form: "can I change",
        claims: [
          "'Can I change this for ...?' asks for a different item, not money back.",
          "'Could I' sounds slightly more polite than 'can I'.",
        ],
        ex: ["Can I change this for a bigger one?", "Could I exchange it, please?"],
      },
      {
        form: "in a smaller size",
        claims: [
          "'In' introduces the size or colour you want instead.",
          "'Have you got this in ...?' is the usual way to ask what is available.",
        ],
        ex: ["Have you got this in a smaller size?", "Do you have it in blue?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — it doesn't fit / suit
      fc("p1", "I bought this jacket yesterday, but it doesn't ___.", ["fit", "fits", "fitting"]),
      sit("p1", "The size is OK, but you don't like how the colour looks on you. What do you say?", [
        "It doesn't suit me.",
        "It doesn't fit me.",
        "It doesn't suits me.",
      ]),
      spk("p1", "It doesn't fit."),
      // p2 — can I change
      fc("p2", "Could I ___ it for a smaller one, please?", ["exchange", "exchanges", "exchanging"]),
      chat("p2", ["Do you want your money back?", null], [
        "No, thanks. Can I change it for a different colour?",
        "No, thanks. Can I change it for a different colours?",
        "No, thanks. Can I changing it for a different colour?",
      ]),
      lc("p2", "Could I exchange it, please?", ["Could I explain it, please?", "Can you exchange it, please?"]),
      // p3 — in a smaller size
      arr("p3", "Have you got this in a smaller size?", ["on"]),
      sit("p3", "The shirt is OK, but you want it in green. What do you ask?", [
        "Do you have it in green?",
        "Do you have it on green?",
        "Do you have it green in?",
      ]),
      la("p3", "Do you have these shoes in a bigger size?", ["on"]),
      // karışık
      chat("mix", ["Hello, can I help you?", null], [
        "Yes, it doesn't fit. Can I change it for a smaller size?",
        "Yes, it doesn't fits. Can I change it for a smaller size?",
        "Yes, it doesn't fit. Can I change it on a smaller size?",
      ]),
      sit("mix", "Your new shoes are too small. You want the same shoes, but bigger. What do you say?", [
        "They don't fit. Have you got them in a bigger size?",
        "They don't suit me. Have you got them in a bigger size?",
        "They don't fit. Have you got them on a bigger size?",
      ]),
    ],
    success: "The learner explains the problem and makes a polite request.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Can I change this for a bigger one?",
        "Can I change this for bigger one?",
        "Can I to change this for a bigger one?",
      ], 0),
      qfill("Have you got this ___ blue?", ["in"]),
      qmcq("Which sentence explains a problem?", [
        "It doesn't fit around the shoulders.",
        "I will take two of them.",
        "The shop opens at nine.",
      ], 0),
    ],
    scenes: [
      sc("Ffion", "a shop assistant", "to sort out the exchange for you",
        "You are at the counter with something you bought two days ago.",
        "Explain the problem and ask to change it.",
        "Hello, how can I help you today?", "helpful"),
      sc("Marcus", "the shop manager", "to handle a case without a receipt",
        "You want to exchange something but cannot find the receipt.",
        "Explain the situation and ask what is possible.",
        "My colleague says there is a problem with your jacket. What is wrong?", "formal"),
      sc("Sunita", "a market seller abroad", "to swap an item you bought yesterday",
        "You bought something at a market and it is the wrong size.",
        "Explain and ask for a different one.",
        "You came back! Is there a problem with the shirt?", "warm"),
      sc("Ms. Petrova", "your teacher", "to practise shop language",
        "The class is role-playing returns and exchanges.",
        "Explain a problem and request an exchange.",
        "You bought something that doesn't fit. What do you say at the counter?", "encouraging"),
      sc("Mr. Halloran", "the examiner", "to check transactional language",
        "The examiner plays a shop assistant.",
        "Explain the problem and ask for an exchange.",
        "Good morning, is there something wrong with your new shoes?", "neutral"),
    ],
  },

  // --- Ünite 4 · Rules and Advice --------------------------------------------
  {
    id: "a2-i-have-to-work",
    topic: "saying what is necessary",
    objectives: [
      "Use 'have to' and 'has to' for things that are necessary.",
      "Ask whether something is necessary.",
      "Use 'had to' for something that was necessary in the past.",
    ],
    goal: "Explain the rules of your job or your home.",
    target: "have to and has to for necessity",
    correction: "Say the full 'have to' sentence and let the learner repeat it.",
    summary: "You learned to describe present necessity with have to and has to, ask questions about necessity, and use had to for the past.",
    minutes: 8,
    points: [
      {
        form: "have to / has to",
        claims: [
          "'Have to' is followed by the base verb and says something is necessary.",
          "After he, she and it it becomes 'has to'.",
        ],
        ex: ["I have to work on Saturday.", "She has to wear a uniform."],
      },
      {
        form: "do you have to?",
        claims: [
          "Questions use do or does before the person, and 'have to' does not change.",
          "The answer is usually short: yes, I do. No, I don't.",
        ],
        ex: ["Do you have to work at weekends?", "Does he have to be there early?"],
      },
      {
        form: "had to",
        claims: [
          "In the past both forms become 'had to' for every person.",
          "'Had to' says it was necessary then, not now.",
        ],
        ex: ["We had to wait an hour.", "She had to leave early yesterday."],
      },
    ],
    ex: [],
    drills: [
      // p1 — have to / has to
      fc("p1", "My brother ___ work at night.", ["has to", "have to", "haves to"]),
      err("p1", "He has to works on Saturday.", "works", "work"),
      arr("p1", "She has to wear a uniform.", ["have"]),
      lc("p1", "We have to leave early.", ["We have to leave at eight.", "We want to leave early."]),
      // p2 — do you have to?
      fc("p2", "___ you have to work at weekends?", ["Do", "Are", "Does"]),
      chat("p2", ["Do you have to wear a suit at work?", null], ["No, I don't.", "No, I haven't.", "No, I don't have."]),
      spk("p2", "Does he have to be there early?"),
      // p3 — had to
      fc("p3", "Yesterday we ___ wait an hour for the bus.", ["had to", "have to", "has to"]),
      sit("p3", "Last week the trains were not working, so you walked to work. What do you say?", [
        "I had to walk to work.",
        "I have to walk to work.",
        "I had to walked to work.",
      ]),
      la("p3", "She had to leave early yesterday.", ["has"]),
      // karışık
      chat("mix", ["Do you have to work on Sunday?", null], [
        "Not usually, but last Sunday I had to.",
        "Not usually, but last Sunday I have to.",
        "Not usually, but last Sunday I had to went.",
      ]),
      chat("mix", ["Does your sister have to work at night?", null], [
        "Yes, she does. She has to work three nights a week.",
        "Yes, she do. She has to work three nights a week.",
        "Yes, she does. She have to work three nights a week.",
      ]),
    ],
    success: "The learner describes at least two necessary actions with have to or has to.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "He has to leave at six.",
        "He have to leave at six.",
        "He has to leaves at six.",
      ], 0),
      qfill("___ she have to work on Sundays? (do)", ["Does"]),
      qmcq("Which sentence talks about the past?", [
        "We had to wait an hour.",
        "We have to wait an hour.",
        "We will have to wait an hour.",
      ], 0),
    ],
    scenes: [
      sc("Rosa", "a neighbour curious about your week", "to understand why you are never free",
        "A neighbour keeps inviting you and you keep saying no.",
        "Explain what you have to do.",
        "You are never home at weekends! Do you have to work?", "curious"),
      sc("Bastien", "a new colleague", "to learn the rules of the workplace",
        "A new colleague is finding out how things work here.",
        "Explain the rules of the job.",
        "I'm new here. What do I have to do every morning?", "eager"),
      sc("Aditi", "a host family member", "to explain the house rules to you",
        "You are staying with a host family and comparing rules.",
        "Explain the rules where you live.",
        "We have some house rules. What do you have to do at home?", "kind"),
      sc("Mr. Hassan", "your teacher", "to practise talking about obligations",
        "The class is comparing daily obligations.",
        "Describe what you have to do.",
        "What is one thing you have to do every week, whether you like it or not?", "encouraging"),
      sc("Mrs. Clark", "the examiner", "to check obligation forms",
        "The examiner asks about your responsibilities.",
        "Describe them with have to.",
        "What do you have to do in a normal week?", "neutral"),
    ],
  },

  {
    id: "a2-you-dont-have-to-come",
    topic: "the difference between not necessary and not allowed",
    objectives: [
      "Say something is not necessary with 'don't have to'.",
      "Say something is not allowed with 'mustn't'.",
    ],
    goal: "Explain which rules are strict and which are optional.",
    target: "don't have to versus mustn't",
    correction: "Contrast the two forms in one sentence and let the learner choose the right one.",
    summary: "You learned that 'don't have to' means optional and 'mustn't' means not allowed.",
    minutes: 8,
    points: [
      {
        form: "you don't have to",
        claims: [
          "'Don't have to' means it is not necessary; you can if you want.",
          "It is not a prohibition, even though it contains 'not'.",
        ],
        ex: ["You don't have to come if you're busy.", "We don't have to book in advance."],
      },
      {
        form: "you mustn't",
        claims: [
          "'Mustn't' means it is not allowed; there is no choice.",
          "This is the opposite of 'don't have to', not the same thing.",
        ],
        ex: ["You mustn't park in front of the door.", "You mustn't tell anyone yet."],
      },
      {
        form: "we have to",
        claims: [
          "For the positive rule, 'have to' and 'must' are close in everyday speech.",
          "'Have to' is more common when the rule comes from outside you.",
        ],
        ex: ["We have to wear a badge in the building.", "You have to show your ticket at the gate."],
      },
    ],
    ex: [],
    drills: [
      // p1 — don't have to (gerekmiyor, seçim senin)
      sit("p1", "The party starts at eight. Your friend can come later if they want. What do you say?", [
        "You don't have to come at eight.",
        "You mustn't come at eight.",
        "You have to come at eight.",
      ]),
      fc("p1", "The museum is free, so you ___ pay.", ["don't have to", "mustn't", "have to"]),
      arr("p1", "You don't have to bring anything.", ["doesn't"]),
      lc("p1", "You don't have to wait.", ["You mustn't wait.", "You don't have to wear it."]),
      // p2 — mustn't (yasak)
      sit("p2", "The sign in the exam room says: NO PHONES. What does the teacher say?", [
        "You mustn't use your phone.",
        "You don't have to use your phone.",
        "You mustn't to use your phone.",
      ]),
      fc("p2", "You ___ park in front of the door. It's for the fire service.", ["mustn't", "don't have to", "must"]),
      spk("p2", "You mustn't tell anyone yet."),
      // p3 — have to (kural)
      fc("p3", "It's a rule: we ___ wear a badge in the building.", ["have to", "don't have to", "mustn't"]),
      chat("p3", ["What do I need at the gate?", null], ["You have to show your ticket.", "You have show your ticket.", "You have to showing your ticket."]),
      la("p3", "We have to book a table before Friday.", ["has"]),
      // karışık — kural / serbest / yasak arasında gerçek seçim
      sit("mix", "At your office a jacket is optional, but smoking is not allowed. What do you tell a new colleague?", [
        "You don't have to wear a jacket, but you mustn't smoke.",
        "You mustn't wear a jacket, but you don't have to smoke.",
        "You don't have to wear a jacket, but you don't have to smoke.",
      ]),
      chat("mix", ["Do I have to bring food to the picnic?", null], [
        "No, you don't have to. But you mustn't be late!",
        "No, you mustn't. But you don't have to be late!",
        "No, you don't have. But you mustn't be late!",
      ]),
      sit("mix", "At the pool, a swimming cap is a rule, but goggles are your choice. What does the lifeguard say?", [
        "You have to wear a cap, but you don't have to wear goggles.",
        "You don't have to wear a cap, but you have to wear goggles.",
        "You mustn't wear a cap, but you don't have to wear goggles.",
      ]),
    ],
    success: "The learner uses 'don't have to' and 'mustn't' with the correct meanings.",
    quiz: [
      qmcq("Which sentence means it is optional?", [
        "You don't have to stay until the end.",
        "You mustn't stay until the end.",
        "You have to stay until the end.",
      ], 0),
      qfill("You ___ smoke in here. (must not)", ["mustn't"]),
      qmcq("Which sentence is correct?", [
        "We don't have to book in advance.",
        "We don't have to booking in advance.",
        "We haven't to book in advance.",
      ], 0),
    ],
    scenes: [
      sc("Elif", "a friend worried about a dress code", "to find out what is really required",
        "A friend is nervous about an event and unsure what the rules are.",
        "Explain which things are optional and which are not.",
        "I'm going to your friend's wedding. What do I have to wear?", "anxious"),
      sc("Gerard", "a colleague explaining site rules", "to make sure you understand the safety rules",
        "You are visiting a site with strict safety rules.",
        "Repeat back which rules are strict and which are optional.",
        "This site has strict rules. What do you think visitors mustn't do here?", "serious"),
      sc("Malia", "a hostel receptionist", "to explain the house rules",
        "You have just checked in and are being told the rules.",
        "Check which rules are strict.",
        "Welcome! What do you think guests mustn't do in a hostel?", "friendly"),
      sc("Mrs. Adeyemi", "your teacher", "to practise the two forms",
        "The class is sorting rules into optional and forbidden.",
        "Give one example of each.",
        "Think of your school or office. What mustn't people do there?", "encouraging"),
      sc("Mr. Vidal", "the examiner", "to check the distinction",
        "The examiner asks about rules in a place you know.",
        "Distinguish clearly between optional and forbidden.",
        "What do people have to do where you work or study?", "neutral"),
    ],
  },

  {
    id: "a2-you-should-rest",
    topic: "giving advice",
    objectives: [
      "Give advice with should and shouldn't.",
      "Soften advice so it does not sound like an order.",
    ],
    goal: "Give a friend advice about a problem.",
    target: "should and shouldn't for advice",
    correction: "Model the advice with should and let the learner give their own.",
    summary: "You learned to give advice with should and shouldn't, and to soften it.",
    minutes: 8,
    points: [
      {
        form: "you should",
        claims: [
          "'Should' is followed by the base verb, with no 'to'.",
          "It gives advice, not an order: the other person can still decide.",
        ],
        ex: ["You should rest for a few days.", "You should talk to your manager."],
      },
      {
        form: "you shouldn't",
        claims: [
          "'Shouldn't' advises against something.",
          "It is softer than 'mustn't', which is about rules rather than advice.",
        ],
        ex: ["You shouldn't work so late every night.", "You shouldn't worry about it."],
      },
      {
        form: "maybe you should",
        claims: [
          "'Maybe' or 'I think' before 'you should' makes the advice gentler.",
          "'Why don't you' is another friendly way to suggest the same thing.",
        ],
        ex: ["Maybe you should take a day off.", "I think you should call her."],
      },
    ],
    ex: [],
    drills: [
      // p1 — should
      fc("p1", "You look tired. You ___ rest for a few days.", ["should", "should to", "must to"]),
      fc("p1", "You should ___ to your manager.", ["talk", "to talk", "talking"]),
      sit("p1", "Your friend has a bad toothache. You give advice. What do you say?", [
        "You should see a dentist.",
        "You should seeing a dentist.",
        "You should to see a dentist.",
      ]),
      spk("p1", "You should rest for a few days."),
      sit("p1", "At work it is a rule to wear a badge. It is only your advice that your colleague rests more. What do you say?", [
        "You have to wear your badge, and you should rest more.",
        "You should wear your badge, and you have to rest more.",
        "You have to wear your badge, and you should to rest more.",
      ]),
      // p2 — shouldn't
      fc("p2", "You ___ work so late every night. You need sleep.", ["shouldn't", "should", "don't should"]),
      chat("p2", ["I drink five coffees a day.", null], [
        "You shouldn't drink so much coffee.",
        "You don't should drink so much coffee.",
        "You shouldn't to drink so much coffee.",
      ]),
      lc("p2", "You shouldn't work so much.", ["You shouldn't work so late.", "You shouldn't eat so much."]),
      // p3 — maybe / I think / why don't you
      fc("p3", "Why don't you ___ her?", ["call", "to call", "calling"]),
      sit("p3", "Your friend is stressed. You want to give advice gently. What do you say?", [
        "I think you should take a break.",
        "I think you should to take a break.",
        "I think you should taking a break.",
      ]),
      la("p3", "Maybe you should take a day off.", ["shoulds"]),
      // karışık — kural (have to) ile tavsiye (should) ayrımı
      chat("mix", ["I have a headache and an exam tomorrow.", null], [
        "You shouldn't stay up late. I think you should go to bed early.",
        "You shouldn't stay up late. I think you should going to bed early.",
        "You don't should stay up late. I think you should go to bed early.",
      ]),
      sit("mix", "Your friend is ill. It's your advice that she stays at home, not a rule. What do you say?", [
        "You shouldn't go to work today. Maybe you should stay in bed.",
        "You don't should go to work today. Maybe you should stay in bed.",
        "You shouldn't go to work today. Maybe you should to stay in bed.",
      ]),
    ],
    success: "The learner gives at least two pieces of advice using should or shouldn't.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "You shouldn't worry about it.",
        "You shouldn't to worry about it.",
        "You not should worry about it.",
      ], 0),
      qfill("Maybe you ___ ask for help. (should)", ["should"]),
      qmcq("Which sentence is advice, not a rule?", [
        "You should get more sleep.",
        "You mustn't enter this room.",
        "You have to show your badge.",
      ], 0),
    ],
    scenes: [
      sc("Tomas", "a friend who is exhausted", "to get some honest advice",
        "A friend has been working late every night for weeks.",
        "Give friendly advice.",
        "I'm so tired every day. What should I do?", "tired"),
      sc("Sonia", "a colleague under pressure", "to hear how to handle the workload",
        "A colleague has taken on too much work.",
        "Advise them without sounding bossy.",
        "I have too much work and I can't stop. What should I do?", "stressed"),
      sc("Dr. Farah", "a doctor at a walk-in clinic", "to give you advice about resting",
        "You are being advised about a minor health problem.",
        "Ask questions and repeat the advice you are given.",
        "Your friend has the same cold as you. What advice would you give your friend?", "calm"),
      sc("Mr. Lindqvist", "your teacher", "to practise giving advice",
        "The class is role-playing advice for common problems.",
        "Give advice about a problem.",
        "Your friend can't sleep. What advice would you give?", "encouraging"),
      sc("Ms. Duarte", "the examiner", "to check advice forms",
        "The examiner describes a problem and asks for advice.",
        "Give clear, friendly advice.",
        "A friend of mine is always tired and works too much. What should they do?", "neutral"),
    ],
  },

  {
    id: "a2-can-i-ask-something",
    topic: "polite requests and permission",
    objectives: [
      "Ask for things politely with could and may.",
      "Ask for permission in a formal situation.",
    ],
    goal: "Ask for something politely in a formal situation.",
    target: "could and may for polite requests",
    correction: "Model the polite form and let the learner ask again more politely.",
    summary: "You learned to ask politely with could, may and softer phrases.",
    minutes: 8,
    points: [
      {
        form: "could you",
        claims: [
          "'Could you' plus the base verb asks someone to do something politely.",
          "It is softer than 'can you' and much softer than the plain imperative.",
        ],
        ex: ["Could you send me the file, please?", "Could you help me with this form?"],
      },
      {
        form: "may I",
        claims: [
          "'May I' asks for permission and is the most formal of these forms.",
          "'Could I' is slightly less formal and very common.",
        ],
        ex: ["May I ask you something?", "Could I use your phone for a moment?"],
      },
      {
        form: "would it be okay",
        claims: [
          "'Would it be okay if ...' softens a bigger request.",
          "Adding 'please' and a reason makes any request easier to accept.",
        ],
        ex: ["Would it be okay if I left early?", "Would it be okay to bring a friend?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — could you
      fc("p1", "___ you send me the file, please?", ["Could", "May", "Would it"]),
      arr("p1", "Could you open the window?", ["opening"]),
      sit("p1", "You need help with a heavy box. You ask a colleague politely. What do you say?", [
        "Could you help me with this box, please?",
        "Could you to help me with this box, please?",
        "Could you helping me with this box, please?",
      ]),
      // p2 — may I / could I
      fc("p2", "___ I sit here?", ["May", "Am", "Does"]),
      chat("p2", ["Good morning. Can I help you?", null], [
        "Yes. May I use the phone, please?",
        "Yes. May I to use the phone, please?",
        "Yes. May I using the phone, please?",
      ]),
      lc("p2", "Could I use your pen?", ["Could you use my pen?", "Could I take your pen?"]),
      spk("p2", "May I ask you something?"),
      // p3 — would it be okay
      fc("p3", "Would it be okay ___ I left early?", ["if", "when", "that"]),
      sit("p3", "You need to leave work one hour early today. You ask your boss politely. What do you say?", [
        "Would it be okay if I left early today?",
        "Would it be okay if I leaving early today?",
        "Would it be okay I left early today?",
      ]),
      la("p3", "Would it be okay to bring a friend?", ["bringing"]),
      // karışık
      chat("mix", ["Hello, how can I help?", null], [
        "May I ask a question? Could you show me the way to the station?",
        "May I ask a question? Could you to show me the way to the station?",
        "May I asking a question? Could you show me the way to the station?",
      ]),
      lc("mix", "May I come in? Would it be okay to sit here?", [
        "May I come in? Would it be okay to stay here?",
        "Can I come in? Would it be okay to sit here?",
      ]),
    ],
    success: "The learner makes at least two polite requests with the correct forms.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "Could you help me with this form?",
        "Could you to help me with this form?",
        "Could you helping me with this form?",
      ], 0),
      qfill("___ I ask you a question? (may)", ["May"]),
      qmcq("Which request is polite?", [
        "Could I use your phone for a moment?",
        "Give me your phone.",
        "I use your phone now.",
      ], 0),
    ],
    scenes: [
      sc("Mrs. Alonso", "your landlord", "to hear your request about the flat",
        "You need to ask your landlord for something.",
        "Make the request politely.",
        "You want to ask me something about the flat. What is it?", "formal"),
      sc("Mr. Reddy", "a senior manager", "to consider your request",
        "You need permission from someone senior.",
        "Ask politely and give a reason.",
        "You wanted to talk to me before the meeting. What can I do for you?", "busy"),
      sc("Ana Lucia", "a hotel receptionist", "to handle your request",
        "You need something from the hotel that is not standard.",
        "Ask politely.",
        "Good evening. Is there anything you need from reception?", "professional"),
      sc("Mr. Bergstrom", "your teacher", "to practise polite requests",
        "The class is practising formal and informal requests.",
        "Make the same request politely.",
        "How would you ask a stranger to help you with a heavy bag?", "encouraging"),
      sc("Ms. Whitfield", "the examiner", "to check polite request forms",
        "The examiner asks you to make a request.",
        "Ask politely and appropriately.",
        "Imagine you need to leave early. How would you ask me?", "neutral"),
    ],
  },

  {
    id: "a2-whats-the-matter",
    topic: "talking about health problems",
    objectives: [
      "Say how you feel and where it hurts.",
      "Understand simple advice from a doctor.",
    ],
    goal: "Explain a health problem at a clinic.",
    target: "describing health problems",
    correction: "Model the natural way to describe the problem and let the learner repeat it.",
    summary: "You learned to describe how you feel and where it hurts, and to follow simple advice.",
    minutes: 7,
    points: [
      {
        form: "I don't feel well",
        claims: [
          "'I don't feel well' is the usual general way to say you are ill.",
          "'I feel sick' in British English usually means you might vomit.",
        ],
        ex: ["I don't feel well today.", "I feel tired all the time."],
      },
      {
        form: "my head hurts",
        claims: [
          "Say the body part plus 'hurts' for one place, or 'I have a' plus the problem.",
          "'I have a headache' and 'my head hurts' mean the same thing. It works the same way for a toothache and a stomach ache.",
        ],
        ex: ["My head hurts and my throat is sore.", "I have a bad cough.", "I have a toothache."],
      },
      {
        form: "you should see",
        claims: [
          "Advice at a clinic usually comes with 'you should' or 'try to'.",
          "'You should see a doctor' means go to a doctor about it.",
        ],
        ex: ["You should see a doctor if it continues.", "You should drink plenty of water."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I don't feel well
      fc("p1", "I don't ___ well today.", ["feel", "feeling", "fell"]),
      sit("p1", "You are ill, but you don't know exactly what is wrong. What do you say?", [
        "I don't feel well.",
        "I don't feel good well.",
        "I'm not feel well.",
      ]),
      spk("p1", "I don't feel well today."),
      // p2 — my head hurts / I have a ...
      fc("p2", "My head ___ right now, and my throat is sore.", ["hurts", "hurt", "hurting"]),
      pairs("p2", [
        ["My head hurts.", "I have a headache."],
        ["My tooth hurts.", "I have a toothache."],
        ["My stomach hurts.", "I have a stomach ache."],
      ]),
      chat("p2", ["What's the matter?", null], ["I have a bad cough.", "I have bad cough.", "I am a bad cough."]),
      lc("p2", "My back hurts.", ["My hand hurts.", "My back is hot."]),
      // p3 — you should see
      fc("p3", "You should ___ a doctor if it continues.", ["see", "to see", "seeing"]),
      sit("p3", "Your friend's cough is very bad and it doesn't stop. What do you say?", [
        "You should see a doctor.",
        "You should to see a doctor.",
        "You should seeing a doctor.",
      ]),
      la("p3", "You should drink more water and rest.", ["drinks"]),
      // karışık
      chat("mix", ["Come in. What seems to be the problem?", null], [
        "I don't feel well. My head hurts and I'm very tired.",
        "I don't feel well. My head hurt and I'm very tired.",
        "I'm not feel well. My head hurts and I'm very tired.",
      ]),
      chat("mix", ["I have a headache and a sore throat.", null], [
        "You should see a doctor. Maybe you have a cold.",
        "You should to see a doctor. Maybe you have a cold.",
        "You should see a doctor. Maybe you are a cold.",
      ]),
    ],
    success: "The learner describes at least two symptoms and says when they started.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "My back hurts when I sit for a long time.",
        "My back hurt when I sit for a long time.",
        "My back is hurt when I sit for a long time.",
      ], 0),
      qfill("I have a ___ throat and I cannot swallow easily. (painful)", ["sore"]),
      qmcq("Which sentence is advice?", [
        "You should drink plenty of water.",
        "I drank plenty of water.",
        "The water is over there.",
      ], 0),
    ],
    scenes: [
      sc("Dr. Mensah", "the doctor at a walk-in clinic", "to work out what is wrong with you",
        "You have come to a clinic without an appointment.",
        "Describe your symptoms clearly.",
        "Come in and sit down. What seems to be the problem?", "calm"),
      sc("Iris", "the office first aider", "to decide whether you should go home",
        "You feel unwell at work and someone has noticed.",
        "Explain how you feel.",
        "You look pale. How are you feeling?", "concerned"),
      sc("Pedro", "a pharmacist abroad", "to find you something for your symptoms",
        "You are unwell while travelling and go to a pharmacy.",
        "Describe your symptoms and ask for something.",
        "Good morning. What's the matter?", "helpful"),
      sc("Ms. Kowalski", "your teacher", "to practise health language",
        "The class is role-playing a clinic visit.",
        "Describe symptoms to a doctor.",
        "You are the patient today. What is wrong?", "encouraging"),
      sc("Mr. Serrano", "the examiner", "to check health vocabulary",
        "The examiner asks about a time you were unwell.",
        "Describe the symptoms clearly.",
        "Imagine you are ill today. What do you tell the doctor?", "neutral"),
    ],
  },

  {
    id: "a2-a-friend-needs-help",
    topic: "listening to a problem and advising",
    objectives: [
      "Show that you understand someone's problem.",
      "Give advice from your own point of view.",
    ],
    goal: "Listen to a friend's problem and help them think it through.",
    target: "responding to a problem and giving advice",
    correction: "Model the sympathetic reply and let the learner continue advising.",
    summary: "You practised listening to a problem, showing sympathy and giving advice.",
    minutes: 7,
    points: [
      {
        form: "that sounds hard",
        claims: [
          "React to the problem before you advise; advice without sympathy sounds cold.",
          "'That sounds hard' and 'I'm sorry to hear that' both work well.",
        ],
        ex: ["That sounds hard.", "I'm sorry to hear that."],
      },
      {
        form: "have you tried",
        claims: [
          "'Have you tried' is followed by a verb with -ing.",
          "It suggests something without assuming the person has not thought of it.",
        ],
        ex: ["Have you tried talking to your manager?", "Have you tried writing it down?"],
      },
      {
        form: "if I were you",
        claims: [
          "'If I were you' introduces advice from your own point of view.",
          "It is usually followed by 'I would' plus the base verb.",
        ],
        ex: ["If I were you, I'd wait a week.", "If I were you, I would ask for more time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — that sounds hard
      chat("p1", ["I lost my job today.", null], [
        "Oh no, I'm sorry to hear that.",
        "Oh no, I'm sorry to hear it that.",
        "Oh no, I'm sorry for hear that.",
      ]),
      sit("p1", "Your friend tells you about a big problem. What do you say first?", [
        "That sounds hard.",
        "That sounds hardly.",
        "That sound hard.",
      ]),
      lc("p1", "That sounds really hard.", ["That sounds really nice.", "That was really hard."]),
      // p2 — have you tried + -ing
      fc("p2", "Have you tried ___ to your manager?", ["talking", "talk", "to talking"]),
      arr("p2", "Have you tried writing it down?", ["write"]),
      spk("p2", "Have you tried talking to her?"),
      // p3 — if I were you
      fc("p3", "If I were you, I ___ wait a week.", ["would", "will", "am"]),
      sit("p3", "You give advice from your own point of view. What do you say?", [
        "If I were you, I'd ask for help.",
        "If I were you, I'd asking for help.",
        "If I were you, I asked for help.",
      ]),
      la("p3", "If I were you, I'd take the job.", ["will"]),
      // karışık
      chat("mix", ["My flatmate is very noisy at night.", null], [
        "That sounds hard. Have you tried talking to him?",
        "That sounds hard. Have you tried talk to him?",
        "That sounds hardly. Have you tried talking to him?",
      ]),
      chat("mix", ["I can't finish my project in time.", null], [
        "I'm sorry to hear that. If I were you, I'd ask for more time.",
        "I'm sorry to hear that. If I were you, I'll ask for more time.",
        "I'm sorry to hear that. If I were you, I asking for more time.",
      ]),
    ],
    success: "The learner reacts with sympathy and gives at least one piece of advice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "If I were you, I would ask for more time.",
        "If I were you, I will ask for more time.",
        "If I am you, I would ask for more time.",
      ], 0),
      qfill("Have you ___ speaking to her directly? (try)", ["tried"]),
      qmcq("Which sentence shows sympathy?", [
        "That sounds hard.",
        "That is your problem.",
        "I did that last year.",
      ], 0),
    ],
    scenes: [
      sc("Joaquin", "a friend thinking about quitting", "to talk the decision through with you",
        "A friend has been offered a new job and cannot decide.",
        "Listen, react and advise.",
        "I got a new job offer, but I'm scared. What do you think?", "uncertain"),
      sc("Renata", "a colleague struggling with workload", "to find a way forward",
        "A colleague is close to burning out.",
        "React with sympathy and suggest something.",
        "I have too much work and I don't know where to start. Any ideas?", "overwhelmed"),
      sc("Kofi", "a fellow traveller who lost his bag", "to work out what to do next",
        "Someone you met while travelling has lost their documents.",
        "Sympathise and suggest steps.",
        "My bag is gone, with everything in it. What would you do?", "shaken"),
      sc("Mrs. Nowak", "your teacher", "to practise sympathetic advice",
        "The class is role-playing supportive conversations.",
        "React and advise about a problem.",
        "Your partner has a problem. What do you say first?", "encouraging"),
      sc("Mr. Delacroix", "the examiner", "to check advice and reaction language",
        "The examiner describes a personal dilemma.",
        "React appropriately and advise.",
        "I have a job offer in another city, but my family is here. What would you do?", "neutral"),
    ],
  },

  // --- Ünite 5 · Experiences -------------------------------------------------
  {
    id: "a2-have-you-ever-been",
    topic: "asking about life experience",
    objectives: [
      "Ask about someone's life experience with 'ever'.",
      "Answer with a short present perfect answer.",
    ],
    goal: "Find out what unusual things someone has done in their life.",
    target: "present perfect with ever for experience",
    correction: "Repeat the question in the correct form and let the learner ask it again.",
    summary: "You learned to ask about experience with 'have you ever' and to answer shortly.",
    minutes: 8,
    points: [
      {
        form: "have you ever + past participle",
        claims: [
          "Use have or has plus the third form of the verb: been, seen, tried, eaten.",
          "'Ever' means at any time in your life and goes before the verb.",
        ],
        ex: ["Have you ever been to Japan?", "Have you ever tried diving?"],
      },
      {
        form: "yes I have / no I haven't",
        claims: [
          "Short answers repeat have or haven't, not the main verb.",
          "'Yes, I have' is complete on its own.",
        ],
        ex: ["Yes, I have.", "No, I haven't."],
      },
      {
        form: "no time expression",
        claims: [
          "This use does not say WHEN something happened, only that it happened.",
          "If you add a past time like 'last year', use the past simple instead.",
        ],
        ex: ["I have been to Italy twice.", "I went there last summer."],
      },
    ],
    ex: [],
    drills: [
      // p1 — have you ever + 3. hâl
      fc("p1", "Have you ever ___ to Japan?", ["been", "went", "go"]),
      err("p1", "Have you ever ate sushi?", "ate", "eaten"),
      sit("p1", "You want to know if your friend has tried diving at any time in their life. What do you ask?", [
        "Have you ever tried diving?",
        "Have you ever try diving?",
        "Have you ever tryed diving?",
      ]),
      lc("p1", "Have you ever been to Spain?", ["Have you ever been to Spain or Italy?", "Have you ever driven to Spain?"]),
      // p2 — Yes, I have. / No, I haven't.
      chat("p2", ["Have you ever been to London?", null], ["No, I haven't.", "No, I haven't been never.", "No, I don't."]),
      fc("p2", "Has your brother ever lived abroad? Yes, he ___.", ["has", "have", "is"]),
      spk("p2", "No, I haven't."),
      // p3 — zaman ifadesi varsa past simple
      sit("p3", "You visited Italy last summer. You want to say when. What do you say?", [
        "I went to Italy last summer.",
        "I've been to Italy last summer.",
        "I've went to Italy last summer.",
      ]),
      fc("p3", "I ___ there in 2019.", ["went", "have been", "have gone"]),
      la("p3", "I've been to Italy twice.", ["went"]),
      // karışık
      chat("mix", ["Have you ever been to Paris?", null], [
        "Yes, I have. I went there last year.",
        "Yes, I have. I've been there last year.",
        "Yes, I have. I go there last year.",
      ]),
      chat("mix", ["Have you ever eaten octopus?", null], [
        "No, I haven't, but I'd like to try it.",
        "No, I haven't eat, but I'd like to try it.",
        "No, I haven't never, but I'd like to try it.",
      ]),
    ],
    success: "The learner asks two correct experience questions and gives one correct present perfect answer.",
    quiz: [
      qmcq("Which question is correct?", [
        "Have you ever seen a whale?",
        "Have you ever saw a whale?",
        "Did you ever seen a whale?",
      ], 0),
      qfill("___ she ever worked abroad? (have)", ["Has"]),
      qmcq("Which answer is correct?", ["Yes, I have.", "Yes, I did have.", "Yes, I am."], 0),
    ],
    scenes: [
      sc("Valentina", "someone you just met at a party", "to find something interesting you have in common",
        "Two people are getting to know each other at a party.",
        "Ask about each other's experiences.",
        "I'm bad at small talk. Have you ever been to a party like this?", "playful"),
      sc("Daniel", "an interviewer", "to learn about your professional experience",
        "You are being asked about what you have done before.",
        "Ask and answer about experience.",
        "Before we start: have you ever worked in a big team?", "professional"),
      sc("Marisol", "a tour guide", "to find out what the group has already done",
        "The guide wants to avoid repeating things people have done.",
        "Say what you have and have not done.",
        "Have you ever been to this region before?", "organised"),
      sc("Mr. Owusu", "your teacher", "to practise experience questions",
        "The class is interviewing each other about experiences.",
        "Ask your partner about their experiences.",
        "Ask your partner about unusual things. What's your first question?", "encouraging"),
      sc("Ms. Fontaine", "the examiner", "to check experience questions",
        "The examiner invites you to ask about their life.",
        "Ask clear experience questions.",
        "Ask me about my experiences. What do you want to know?", "neutral"),
    ],
  },

  {
    id: "a2-ive-never-tried-that",
    topic: "saying what you have not done",
    objectives: [
      "Use 'never' to say something has not happened in your life.",
      "Avoid using two negatives together.",
    ],
    goal: "Admit the ordinary things you have somehow never done.",
    target: "present perfect with never",
    correction: "Repeat the sentence with a single negative and let the learner say it again.",
    summary: "You learned to say what you have never done, without doubling the negative.",
    minutes: 8,
    points: [
      {
        form: "I've never",
        claims: [
          "'Never' already makes the sentence negative, so 'have' stays positive.",
          "Say 'I have never been', not 'I haven't never been'.",
        ],
        ex: ["I've never tried sushi.", "I've never been to a football match."],
      },
      {
        form: "she's never",
        claims: [
          "After he, she and it the form is 'has never'.",
          "The third form of the verb does not change with the person.",
        ],
        ex: ["She's never worked abroad.", "He's never seen the sea."],
      },
      {
        // Devrik "Never in my life have I..." doğru ama C1 tonunda; A2'de
        // öğretilen biçim ifadenin cümle SONUNA eklenmesi.
        form: "I've never ... in my life",
        claims: [
          "'In my life' adds emphasis to an experience sentence, at the end after the experience.",
          "'I still haven't' says you expected to do it by now.",
        ],
        ex: ["I've never broken a bone in my life.", "I still haven't seen that film."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I've never
      fc("p1", "I've never ___ sushi.", ["tried", "try", "tryed"]),
      sit("p1", "You don't know what sushi tastes like. You have no experience of it. What do you say?", [
        "I've never tried sushi.",
        "I haven't never tried sushi.",
        "I've never try sushi.",
      ]),
      la("p1", "I've never been to a football match.", ["went"]),
      spk("p1", "I've never been to a concert."),
      // p2 — she's never
      fc("p2", "My brother ___ never seen the sea.", ["has", "have", "is"]),
      chat("p2", ["Does your dad like flying?", null], [
        "He doesn't know. He's never been on a plane.",
        "He doesn't know. He's never be on a plane.",
        "He doesn't know. He hasn't never been on a plane.",
      ]),
      lc("p2", "She's never seen snow.", ["She's never seen the sea.", "We've never seen snow."]),
      // p3 — in my life / still haven't
      fc("p3", "I've never broken a bone ___ my life.", ["in", "on", "at"]),
      sit("p3", "Everyone saw the new film. You wanted to see it too, but you haven't seen it. What do you say?", [
        "I still haven't seen that film.",
        "I still haven't saw that film.",
        "I haven't still seen that film.",
      ]),
      la("p3", "I've never been so tired in my life.", ["ever"]),
      // karışık
      chat("mix", ["Have you ever ridden a horse?", null], [
        "No, never in my life! And my sister has never ridden one either.",
        "No, never in my life! And my sister have never ridden one either.",
        "No, never in my life! And my sister has never rode one either.",
      ]),
      spk("mix", "I've never been there, and she's never been there either."),
    ],
    success: "The learner uses 'never' with the present perfect correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I have never eaten octopus.",
        "I haven't never eaten octopus.",
        "I have never ate octopus.",
      ], 0),
      qfill("He ___ never driven a car. (have)", ["has"]),
      qmcq("Which sentence is correct?", [
        "She's never been abroad.",
        "She's never was abroad.",
        "She hasn't never been abroad.",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend who is easily surprised", "to discover what you have never done",
        "Two friends are confessing ordinary things they have never done.",
        "Admit things you have never done.",
        "I can't ride a bike! What is something you've never done?", "amused"),
      sc("Anton", "a colleague planning a team activity", "to pick an activity nobody has done",
        "The team wants an activity that is new to everyone.",
        "Say what you have and have not done.",
        "I want a new team activity. What have you never tried?", "planning"),
      sc("Sofia", "a guide offering activities", "to find something new for you to try",
        "The guide is offering several local experiences.",
        "Say which ones you have never tried.",
        "We have kayaking, climbing and riding here. Which one have you never tried?", "encouraging"),
      sc("Mr. Baptiste", "your teacher", "to practise 'never' sentences",
        "The class is sharing surprising confessions.",
        "Say what you have never done.",
        "What is one common thing you've never done?", "warm"),
      sc("Mrs. Ilves", "the examiner", "to check negative experience forms",
        "The examiner asks about things you have not done.",
        "Answer using 'never' correctly.",
        "What is something you've never done but want to try?", "neutral"),
    ],
  },

  {
    id: "a2-been-or-gone",
    topic: "the difference between been and gone",
    objectives: [
      "Use 'has been to' for a completed visit.",
      "Use 'has gone to' for someone who is still away.",
    ],
    goal: "Explain where your colleagues are and where they have travelled.",
    target: "has been to versus has gone to",
    correction: "Contrast the two sentences and let the learner choose the right one.",
    summary: "You learned that 'been to' means came back and 'gone to' means still away.",
    minutes: 7,
    points: [
      {
        form: "I've been to",
        claims: [
          "'Been to' means the person visited the place and has returned.",
          "This is the form used for life experience.",
        ],
        ex: ["I've been to Paris three times.", "She's been there before."],
      },
      {
        form: "he's gone to",
        claims: [
          "'Gone to' usually means the person is on the way there or still there.",
          "So we don't usually say 'I've gone to' about ourselves while we are here.",
        ],
        ex: ["He's gone to the bank, he'll be back at three.", "They've gone to the airport."],
      },
      {
        form: "been in / been to",
        claims: [
          "'Been to' focuses on a completed visit to a place.",
          "'Been in' focuses on staying in a place and usually comes with a length of time.",
        ],
        ex: ["I've been to the new office once.", "We've been in this building for two years."],
      },
    ],
    ex: [],
    drills: [
      // p1 — been to (gidip döndü)
      fc("p1", "I've ___ to Paris three times.", ["been", "went", "go"]),
      la("p1", "She's been there before.", ["gone"]),
      sit("p1", "You visited London last year and came home. Now you talk about your life experience. What do you say?", [
        "I've been to London.",
        "I've gone to London.",
        "I've been in London to.",
      ]),
      // p2 — gone to (hâlâ orada)
      sit("p2", "Your colleague went to the bank ten minutes ago. He is there now. What do you say?", [
        "He's gone to the bank.",
        "He's been to the bank.",
        "He's went to the bank.",
      ]),
      fc("p2", "Anna is at work now. She's ___ to work.", ["gone", "been", "go"]),
      lc("p2", "He's gone to the gym.", ["He's gone to the bank.", "They've gone to the gym."]),
      // p3 — been in + süre
      fc("p3", "We've been ___ this building for two years.", ["in", "to", "on"]),
      chat("p3", ["How long have you been in Madrid?", null], [
        "I've been in Madrid for a month.",
        "I've been to Madrid for a month.",
        "I've gone in Madrid for a month.",
      ]),
      la("p3", "I've been to the new office once.", ["gone"]),
      // karışık
      chat("mix", ["Where's your sister?", null], [
        "She's gone to Spain. She's been there three times before.",
        "She's been to Spain. She's gone there three times before.",
        "She's gone to Spain. She's gone there three times before.",
      ]),
      spk("mix", "He's gone to the bank, and I've been to the shop."),
    ],
    success: "The learner uses 'been to' and 'gone to' with the correct meanings.",
    quiz: [
      qmcq("Which sentence is correct if the person is still away?", [
        "She's gone to the shops.",
        "She's been to the shops and is still there.",
        "She goes to the shops now.",
      ], 0),
      qfill("I've ___ to Italy twice. (be)", ["been"]),
      qmcq("Which sentence is correct?", [
        "They've gone to the airport, so they aren't here.",
        "They've been to the airport, so they aren't here.",
        "They've go to the airport, so they aren't here.",
      ], 0),
    ],
    scenes: [
      sc("Camila", "a colleague looking for someone", "to find out where a team member is",
        "Someone is looking for a colleague who is not at their desk.",
        "Explain where people are and where they have been.",
        "I can't find our manager. Where is she?", "hurried"),
      sc("Wouter", "your manager", "to know who is available this week",
        "Several people are travelling and the manager needs a picture.",
        "Report who is away and who has already returned.",
        "Half the team is away. Where have they gone?", "practical"),
      sc("Nia", "a hotel receptionist", "to pass on a message to your colleague",
        "You are leaving a message for someone who is out.",
        "Explain where the person has gone.",
        "Your colleague isn't here right now. Do you know where he's gone?", "polite"),
      sc("Mr. Farrell", "your teacher", "to practise been and gone",
        "The class is describing where people are.",
        "Use both forms correctly.",
        "Which countries have you been to?", "encouraging"),
      sc("Ms. Sorensen", "the examiner", "to check been and gone",
        "The examiner asks about people you know.",
        "Distinguish the two forms clearly.",
        "Where is someone in your family right now, and where have they been before?", "neutral"),
    ],
  },

  {
    id: "a2-tell-me-more",
    topic: "keeping a conversation going",
    objectives: [
      "Ask follow-up questions about someone's experience.",
      "Show interest so the other person keeps talking.",
    ],
    goal: "Keep a conversation going when someone shares news.",
    target: "follow-up questions about experience",
    correction: "Model the follow-up question and let the learner ask their own.",
    summary: "You learned follow-up questions that keep a conversation going.",
    minutes: 7,
    points: [
      {
        form: "what was it like",
        claims: [
          "'What was it like?' asks for a description, not a yes or no answer.",
          "It is the natural follow-up when someone mentions a place or event.",
        ],
        ex: ["What was it like?", "What was the food like there?"],
      },
      {
        form: "how long",
        claims: [
          "'How long' asks about duration and is answered with a period of time.",
          "'How long did you stay?' and 'How long have you been there?' ask about different times.",
        ],
        ex: ["How long did you stay?", "How long have you known each other?"],
      },
      {
        form: "tell me more",
        claims: [
          "'Tell me more about ...' invites the other person to continue.",
          "Short reactions like 'really?' and 'that sounds great' do the same job.",
        ],
        ex: ["Tell me more about the trip.", "Really? That sounds great."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what was it like?
      fc("p1", "What ___ the food like there?", ["was", "did", "were"]),
      la("p1", "What was the hotel like?", ["how"]),
      chat("p1", ["I went to Iceland last month.", null], ["Wow! What was it like?", "Wow! How was it like?", "Wow! What it was like?"]),
      // p2 — how long
      fc("p2", "How ___ did you stay?", ["long", "much", "many"]),
      sit("p2", "Your friend lived in Rome. You want to know the length of time. What do you ask?", [
        "How long did you live there?",
        "How much did you live there?",
        "How long you lived there?",
      ]),
      lc("p2", "How long have you known each other?", ["How long have you known her?", "Where did you meet each other?"]),
      // p3 — tell me more / really?
      fc("p3", "Tell me ___ about the trip.", ["more", "many", "most"]),
      chat("p3", ["I met a famous singer on the train!", null], ["Really? Tell me more!", "Really? Say me more!", "Really? Tell more me!"]),
      spk("p3", "Tell me more about your new job."),
      // karışık
      chat("mix", ["I worked in a hotel in Spain.", null], [
        "Really? How long did you work there? What was it like?",
        "Really? How long did you work there? How was it like?",
        "Really? How much did you work there? What was it like?",
      ]),
      lc("mix", "How long did you stay, and what was it like?", ["How long did you stay, and where did you go?", "How much did you pay, and what was it like?"]),
    ],
    success: "The learner asks three open follow-up questions.",
    quiz: [
      qmcq("Which question invites a longer answer?", [
        "What was the weather like?",
        "Was the weather good?",
        "Did it rain?",
      ], 0),
      qfill("___ long did you stay there?", ["How"]),
      qmcq("Which phrase invites someone to continue?", [
        "Tell me more about it.",
        "That is all, thanks.",
        "I have to go now.",
      ], 0),
    ],
    scenes: [
      sc("Idris", "a friend back from a long trip", "to share the story if you ask the right questions",
        "A friend has just returned and is waiting to be asked.",
        "Ask follow-up questions to keep them talking.",
        "I'm back from three months of travel! What do you want to ask me?", "excited"),
      sc("Freya", "a colleague who changed roles", "to talk about the new job",
        "A colleague has moved to a different department.",
        "Ask about the new role.",
        "I started in a new team last week. Do you want to hear about it?", "chatty"),
      sc("Tobias", "another guest with stories", "to tell you about the region",
        "Someone at the hostel has been travelling for months.",
        "Ask questions that keep them talking.",
        "I have travelled all over this country. What do you want to know?", "relaxed"),
      sc("Mrs. Gallagher", "your teacher", "to practise follow-up questions",
        "The class is practising keeping conversations alive.",
        "Ask open follow-up questions.",
        "Your partner had an amazing weekend. What do you ask?", "encouraging"),
      sc("Mr. Nakamura", "the examiner", "to check conversational questions",
        "The examiner mentions something briefly and waits.",
        "Ask follow-up questions naturally.",
        "I spent last month in a very unusual place. What do you want to ask me?", "neutral"),
    ],
  },

  {
    id: "a2-ive-already-finished",
    topic: "saying something happened sooner than expected",
    objectives: [
      "Use 'already' for something finished sooner than expected.",
      "Use 'just' for something finished a moment ago.",
    ],
    goal: "Report progress on a task you share with someone.",
    target: "present perfect with already and just",
    correction: "Repeat the sentence with the word in its natural position and let the learner try again.",
    summary: "You learned to use already for something completed by now or sooner than expected, and just for something completed a short time ago.",
    minutes: 8,
    points: [
      {
        form: "I've already",
        claims: [
          "'Already' says the action happened sooner than the other person expected.",
          "It goes between have and the third form of the verb.",
        ],
        ex: ["I've already sent the email.", "We've already booked the room."],
      },
      {
        form: "I've just",
        claims: [
          "'Just' says the action finished a very short time ago.",
          "It sits in the same place as 'already', between have and the verb.",
        ],
        ex: ["I've just finished the report.", "She's just left the office."],
      },
      {
        form: "why the present perfect",
        claims: [
          "These sentences connect a past action to the situation right now.",
          "If you say exactly when it happened, switch to the past simple.",
        ],
        ex: ["I've already eaten, thanks.", "I ate at one o'clock."],
      },
    ],
    ex: [],
    drills: [
      // p1 — already
      fc("p1", "I've ___ sent the email, so you don't have to send it.", ["already", "yet", "still"]),
      la("p1", "I've already eaten lunch.", ["yet"]),
      sit("p1", "Your boss asks for the report. You sent it an hour ago. What do you say?", [
        "I've already sent it.",
        "I've sent already it.",
        "I've already send it.",
      ]),
      lc("p1", "We've already booked it.", ["We've already paid for it.", "We haven't booked it."]),
      // p2 — just
      fc("p2", "Hurry! The film has ___ started.", ["just", "yet", "still"]),
      chat("p2", ["Is Maria here?", null], ["No, sorry. She's just left.", "No, sorry. She's just leave.", "No, sorry. She just has left."]),
      spk("p2", "I've just finished the report."),
      // p3 — zaman söylenirse past simple
      fc("p3", "I ___ at one o'clock.", ["ate", "have eaten", "have ate"]),
      sit("p3", "Someone offers you food. You had lunch before, and you don't want more. What do you say?", [
        "No, thanks. I've already eaten.",
        "No, thanks. I've already ate.",
        "No, thanks. I already eaten.",
      ]),
      la("p3", "I sent the email at nine o'clock.", ["have"]),
      // karışık
      chat("mix", ["Have you booked the hotel?", null], [
        "Yes, I've already booked it. I did it this morning.",
        "Yes, I've already book it. I did it this morning.",
        "Yes, I've already booked it. I've done it at nine.",
      ]),
      lc("mix", "Sorry, he's just gone home. He left at five.", [
        "Sorry, he's just gone home. He left at nine.",
        "Sorry, he's already gone home. He left at five.",
      ]),
    ],
    success: "The learner uses already and just correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We've already booked the room.",
        "We've booked already the room.",
        "We already have book the room.",
      ], 0),
      qfill("She's ___ left, you missed her by a minute. (just)", ["just"]),
      qmcq("Which sentence says it happened a moment ago?", [
        "I've just spoken to her.",
        "I spoke to her last week.",
        "I speak to her every week.",
      ], 0),
    ],
    scenes: [
      sc("Halima", "a flatmate checking on chores", "to find out what still needs doing",
        "Two flatmates are working through a list of jobs.",
        "Report what you have already done.",
        "I made a list of jobs this morning. What have you already done?", "practical"),
      sc("Viktor", "your team leader", "to get a progress update",
        "Your team leader wants a quick status on three tasks.",
        "Report progress on each.",
        "Quick update: what have you already finished?", "brisk"),
      sc("Elodie", "a tour coordinator", "to check what the group has arranged",
        "The group is preparing for tomorrow's departure.",
        "Say what you have already arranged.",
        "We leave early tomorrow. What have you already done?", "organised"),
      sc("Mr. Achebe", "your teacher", "to practise already and just",
        "The class is reporting on a shared project.",
        "Report progress with already and just.",
        "What have you already finished, and what have you just started?", "encouraging"),
      sc("Ms. Lindberg", "the examiner", "to check already and just",
        "The examiner asks about your recent progress.",
        "Report using already and just correctly.",
        "What have you already done today?", "neutral"),
    ],
  },

  {
    id: "a2-have-you-done-it-yet",
    topic: "asking whether something is finished",
    objectives: [
      "Ask whether something is finished with 'yet'.",
      "Say something has not happened so far.",
    ],
    goal: "Chase up things that were supposed to be done.",
    target: "present perfect questions and negatives with yet",
    correction: "Repeat the question with 'yet' at the end and let the learner ask again.",
    summary: "You learned to ask and answer about unfinished things using 'yet'.",
    minutes: 7,
    points: [
      {
        form: "have you finished ... yet?",
        claims: [
          "'Yet' usually goes at the end of a question or a negative sentence.",
          "It means up to now, and expects that the thing will happen.",
        ],
        ex: ["Have you finished the report yet?", "Has she replied yet?"],
      },
      {
        form: "not yet",
        claims: [
          "'Not yet' is a complete answer on its own.",
          "'Not yet, but soon' softens it and gives information.",
        ],
        ex: ["Not yet, I am still working on it.", "Not yet, but I'll do it this afternoon."],
      },
      {
        form: "I haven't ... yet",
        claims: [
          "The full negative is 'I haven't' plus the third form plus 'yet'.",
          "'Already' belongs in positive sentences, and in a question it shows surprise.",
        ],
        ex: ["I haven't finished it yet.", "They haven't answered yet.", "Have you already finished?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — have you ... yet?
      fc("p1", "Have you finished the report ___?", ["yet", "still", "just"]),
      la("p1", "Has she replied yet?", ["replies"]),
      lc("p1", "Have you called him yet?", ["Have you called them yet?", "Have you told him yet?"]),
      // p2 — not yet
      chat("p2", ["Have you finished the book?", null], ["Not yet. I'm still reading it.", "Not yet. I'm still read it.", "Yet not. I'm still reading it."]),
      sit("p2", "Your boss asks if the email is ready. You are still writing it. What do you say?", [
        "Not yet, I'm still working on it.",
        "Already, I'm still working on it.",
        "Not yet, I'm still work on it.",
      ]),
      spk("p2", "Not yet, but soon."),
      // p3 — I haven't ... yet
      fc("p3", "I haven't finished it ___.", ["yet", "already", "just"]),
      sit("p3", "You sent a message to your friends this morning. Nobody has answered. What do you say?", [
        "They haven't answered yet.",
        "They haven't answered already.",
        "They didn't answered yet.",
      ]),
      la("p3", "I haven't paid the bill yet.", ["already"]),
      // karışık
      chat("mix", ["Have you sent the invitations yet?", null], [
        "Not yet. I haven't written them yet.",
        "Not yet. I haven't written them already.",
        "Not yet. I haven't wrote them yet.",
      ]),
      chat("mix", ["The taxi is here. Have you found your keys yet?", null], [
        "Not yet! I haven't looked in my bag yet.",
        "Not yet! I haven't look in my bag yet.",
        "Yet not! I haven't looked in my bag yet.",
      ]),
    ],
    success: "The learner uses 'yet' correctly in two questions and one negative sentence.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I haven't sent it yet.",
        "I haven't yet sent already.",
        "I didn't have sent it yet.",
      ], 0),
      qfill("Have they arrived ___?", ["yet"]),
      qmcq("Which answer means it is not finished?", ["Not yet.", "Already done.", "Yes, this morning."], 0),
    ],
    scenes: [
      sc("Sanjay", "a flatmate waiting on you", "to find out whether the jobs are done",
        "Two flatmates agreed on jobs and one is behind.",
        "Ask and admit what is not done.",
        "The landlord comes tomorrow. Have you finished cleaning your room yet?", "anxious"),
      sc("Petra", "your project manager", "to chase three outstanding items",
        "Three tasks were due and none have been confirmed.",
        "Ask about them and report honestly.",
        "Have you finished the three tasks yet?", "direct"),
      sc("Milo", "a travel companion", "to check the group is ready to leave",
        "The group has to leave in an hour and things are unfinished.",
        "Ask what is done and admit what is not.",
        "We leave in one hour. Have you packed yet?", "hurried"),
      sc("Mrs. Silva", "your teacher", "to practise 'yet' questions",
        "The class is chasing up unfinished homework.",
        "Ask and answer with 'yet'.",
        "Have you finished the task I set last week?", "encouraging"),
      sc("Mr. Andersson", "the examiner", "to check 'yet' forms",
        "The examiner asks about unfinished plans.",
        "Use 'yet' correctly in questions and negatives.",
        "What did you plan to do this year that you haven't done yet?", "neutral"),
    ],
  },

  {
    id: "a2-two-truths-and-a-lie",
    topic: "sharing unusual experiences",
    objectives: [
      "Share unusual experiences from your life.",
      "React with doubt when something sounds unlikely.",
    ],
    goal: "Play a guessing game about each other's experiences.",
    target: "sharing and questioning experiences",
    correction: "Model the experience sentence and let the learner produce their own.",
    summary: "You practised sharing unusual experiences and questioning the ones that sound unlikely.",
    minutes: 7,
    points: [
      {
        form: "I've never",
        claims: [
          "A surprising 'never' is often more interesting than a long story.",
          "Keep the sentence short so the listener can react.",
        ],
        ex: ["I've never eaten a banana.", "I've never travelled by plane."],
      },
      {
        form: "have you ever",
        claims: [
          "Turn the game back with a question about the other person.",
          "'Have you ever' keeps the conversation moving between you.",
        ],
        ex: ["Have you ever done anything like that?", "Have you ever met someone famous?"],
      },
      {
        form: "that can't be true",
        claims: [
          "'That can't be true!' expresses strong surprise, but it can sound blunt without a playful tone.",
          "'Really?' and 'You're joking!' express doubt more softly.",
        ],
        ex: ["That can't be true!", "Really? You're joking!"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I've never
      fc("p1", "I've ___ eaten a banana!", ["never", "ever", "no"]),
      spk("p1", "I've never been on a plane."),
      la("p1", "I've never seen a horse.", ["saw"]),
      // p2 — have you ever
      chat("p2", ["I once met a famous actor.", null], [
        "Wow! Have you ever met a singer too?",
        "Wow! Have you ever meet a singer too?",
        "Wow! Have you ever met a singer to?",
      ]),
      lc("p2", "Have you ever met a famous singer?", ["Have you ever met a famous dancer?", "Have you ever seen a famous singer?"]),
      la("p2", "Have you ever done anything like that?", ["did"]),
      // p3 — that can't be true / really? you're joking!
      chat("p3", ["I've been to forty countries.", null], ["Really? You're joking!", "Really? You're joke!", "Really? You joking!"]),
      fc("p3", "That ___ be true!", ["can't", "isn't", "doesn't"]),
      spk("p3", "No way, that can't be true!"),
      // karışık
      chat("mix", ["Have you ever won a prize?", null], [
        "No, I've never won anything. Have you?",
        "No, I've never win anything. Have you?",
        "No, I've ever won anything. Have you?",
      ]),
      chat("mix", ["I've never eaten bread in my life.", null], [
        "That can't be true! Have you ever eaten pizza?",
        "That can't be true! Have you ever ate pizza?",
        "That can't true! Have you ever eaten pizza?",
      ]),
    ],
    success: "The learner shares experiences and asks at least one experience question.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I've never travelled by plane.",
        "I've never travel by plane.",
        "I never have travelled by plane not.",
      ], 0),
      qfill("Have you ___ met someone famous? (ever)", ["ever"]),
      qmcq("Which reply shows doubt?", ["That can't be true!", "That sounds right.", "I agree completely."], 0),
    ],
    scenes: [
      sc("Zeynep", "a new colleague at a team lunch", "to break the ice with a game",
        "New colleagues are playing a guessing game over lunch.",
        "Share experiences and question theirs.",
        "Let's play two truths and a lie. Can you go first?", "playful"),
      sc("Callum", "a colleague at an away day", "to get to know the team better",
        "The team is doing an icebreaker activity.",
        "Share and question experiences.",
        "We have to share something surprising. What is something you've never done?", "game"),
      sc("Ariana", "a traveller at a shared dinner", "to swap unusual travel stories",
        "Travellers at a hostel dinner are comparing stories.",
        "Share unusual experiences.",
        "Everyone here has one strange story. What is yours?", "curious"),
      sc("Mr. Kimura", "your teacher", "to practise experience forms in a game",
        "The class is playing an experience guessing game.",
        "Share three statements and question your partner.",
        "Two truths and one lie about your life. What are they?", "encouraging"),
      sc("Ms. Bianchi", "the examiner", "to check experience language",
        "The examiner invites you to share unusual experiences.",
        "Share them and ask one question back.",
        "Tell me about something unusual. Have you ever done anything strange?", "neutral"),
    ],
  },
];
