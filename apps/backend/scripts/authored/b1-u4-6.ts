/** B1 · Ünite 4-6 — dışa aktarılmış çekirdekten (export-authored.ts); tek doğruluk kaynağı bu dosya. */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sit, sc, spk, type Authored } from "./dsl.js";

export const B1_U4_6: Authored[] = [
  {
    id: "b1-if-i-had-more-time",
    topic: "second conditional for unreal or unlikely present situations",
    objectives: [
      "Recognise and form the second conditional for present unreal or unlikely situations.",
      "Use 'if I had', 'I would', and 'I'd probably' to talk about imaginary present situations.",
    ],
    goal: "Imagine and discuss unreal or unlikely situations in the present, such as daydreaming about a different life.",
    target: "if + past simple, would + base verb; 'if I had', 'I would', 'I'd probably'",
    correction: "Prompt the correct form by modeling the full second conditional structure and highlighting errors in verb tense or word order.",
    summary: "You learned how to use the second conditional to talk about unreal or unlikely present situations. You practised using 'if I had', 'I would', and 'I'd probably' for daydreaming or imagining a different life.",
    minutes: 8,
    points: [
      {
        form: "if + past simple, would + base verb",
        claims: [
          "Use the second conditional to talk about unreal or unlikely situations in the present.",
          "The structure is: if + past simple, would + base verb.",
          "The order can be changed: 'If I had time, I would travel.' or 'I would travel if I had time.'",
        ],
        ex: [
          "If I had a million dollars, I would buy a big house.",
          "I would travel the world if I had more free time.",
        ],
      },
      {
        form: "I'd probably",
        claims: [
          "'I'd' is the contraction of 'I would'.",
          "Use 'I'd probably' to show something is likely in your imaginary situation.",
        ],
        ex: [
          "If I had a different job, I'd probably be happier.",
          "I'd probably move to the beach if I had the chance.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — if + past simple, would + base verb
      fc("p1", "If I ___ more money, I would buy a new bike.", ["had", "have", "will have"]),
      err("p1", "If I had more time, I would learned to cook.", "learned", "learn"),
      sit("p1", "You don't have a garden, but you dream about one. What do you say?", [
        "If I had a garden, I would grow flowers.",
        "If I have a garden, I would grow flowers.",
        "If I had a garden, I will grow flowers.",
      ]),
      fc("p1", "If she lived near the sea, she ___ swim every day.", ["would", "will", "is"]),
      la("p1", "If we had a car, we would visit you.", ["will"]),
      // p2 — I'd probably
      fc("p2", "If I had a different car, ___ probably drive to work.", ["I'd", "I'll", "I'm"]),
      chat("p2", ["If you won a holiday, where would you go?", null], [
        "I'd probably go to Japan.",
        "I'd probably going to Japan.",
        "I'd probably went to Japan.",
      ]),
      la("p2", "I'd probably stay at home.", ["will"]),
      sit("p2", "Your friend asks what you would do with a free day. You think you would most likely sleep late. What do you say?", [
        "I'd probably sleep late.",
        "I'd probably slept late.",
        "I'd probably to sleep late.",
      ]),
      // mix
      spk("mix", "If I had more time, I'd probably read more."),
      fc("mix", "If I ___ in London, I'd probably take the bus everywhere.", ["lived", "live", "will live"]),
      chat("mix", ["What would you do if you had a year off?", null], [
        "If I had a year off, I'd probably travel.",
        "If I have a year off, I'd probably travel.",
        "If I had a year off, I'll probably travel.",
      ]),
    ],
    success: "The learner uses the second conditional structure correctly and includes all target phrases in their answers.",
    quiz: [
      qmcq("Choose the correct second conditional sentence.", [
        "If I had more time, I would learn French.",
        "If I have more time, I learn French.",
        "If I would have more time, I will learn French.",
      ], 0),
      qfill("If I ___ a car, I would drive to work.", ["had"]),
      qmcq("Which is the contraction for 'I would'?", [
        "I'd",
        "I'm",
        "I'll",
      ], 0),
      qfill("I'd probably move to another city if I ___ a better job offer.", ["had"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to chat about fun, imaginary lives",
        "You and your friend Sophie are sitting in a park, talking about what life would be like if you could change anything.",
        "Imagine and describe a completely different life using second conditional phrases.",
        "If you could be anyone else for a day, who would you be and why?", "curious"),
      sc("Mark", "colleague", "to make the workday more interesting with a fun conversation",
        "You and your colleague Mark are taking a coffee break and start chatting about what you would do if you had a totally different job.",
        "Discuss what life would be like with a different career using second conditional phrases.",
        "If you had any job in the world, what would you choose?", "friendly"),
      sc("Lucia", "fellow traveller", "to pass the time with an interesting conversation",
        "You and Lucia are waiting for a delayed flight at the airport and start talking about what you would do if you lived in another country.",
        "Imagine living in another country and describe what you would do using second conditional phrases.",
        "If you could live anywhere in the world, where would you live?", "curious"),
      sc("Dr. Patel", "university advisor", "to encourage creative thinking in students",
        "You are meeting with Dr. Patel, your university advisor, who asks you to imagine your life if you had chosen a different subject to study.",
        "Talk about how your life would be different with another field of study using second conditional phrases.",
        "If you could study any other subject, what would you choose and why?", "friendly"),
      sc("Mr. Johnson", "examiner", "to assess your ability to use second conditional sentences",
        "You are in a speaking exam with Mr. Johnson, who asks you questions about imaginary situations.",
        "Respond to questions about unreal present situations using second conditional phrases.",
        "If you could change one thing about your life right now, what would it be?", "curious"),
    ],
  },
  {
    id: "b1-unless-you-ask",
    topic: "unless, as long as and provided that for conditions",
    objectives: [
      "Use 'unless', 'as long as', and 'provided that' to state conditions in sentences.",
      "Distinguish between the uses of 'unless', 'as long as', and 'provided that'.",
    ],
    goal: "State and understand conditions when explaining terms, offers, or agreements.",
    target: "'unless you', 'as long as', 'provided that you' for stating conditions",
    correction: "Prompt the learner to use the correct conditional phrase and explain why it fits the sentence.",
    summary: "You learned how to use 'unless', 'as long as', and 'provided that' to state conditions. You practised choosing the correct phrase for different situations.",
    minutes: 8,
    intents: {
      readiness: "Greet, introduce the topic of stating conditions with 'unless', 'as long as', and 'provided that', and check if the learner is ready.",
      teach: "Announce that you will explain how to use 'unless', 'as long as', and 'provided that' for conditions.",
      questions: "Invite questions about how to use 'unless', 'as long as', or 'provided that' before moving to practice.",
      say: "Acknowledge and announce that you will do a few practice questions using these phrases.",
    },
    points: [
      {
        form: "unless you",
        claims: [
          "'Unless' means 'if not'.",
          "'You cannot join unless you pay' means the same as 'you cannot join if you do not pay'.",
        ],
        ex: [
          "You will not get the offer unless you apply today.",
          "The deal is not valid unless you sign the contract.",
        ],
      },
      {
        form: "as long as",
        claims: [
          "'As long as' means 'if' or 'only if'.",
          "Use 'as long as' to show that something is possible or allowed under a certain condition.",
        ],
        ex: [
          "You can get a discount as long as you show your student card.",
          "You may use the service as long as you follow the rules.",
        ],
      },
      {
        form: "provided that you",
        claims: [
          "'Provided that' means 'if' or 'only if', like 'as long as'.",
          "Use 'provided that' in more formal situations to state a condition.",
        ],
        ex: [
          "We will accept your application provided that you send it before Friday.",
          "The offer is available provided that you are over 18.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — unless = if not
      fc("p1", "A pass is required. You can't enter the building ___ you have one.", ["unless", "as long as", "provided that"]),
      sit("p1", "Your friend will come to the party, but not if she is working. What does she say?", [
        "I'll come unless I'm working.",
        "I'll come unless I'm not working.",
        "I'll come as long as I'm working.",
      ]),
      lc("p1", "I won't go unless you come with me.", ["I won't go if you come with me.", "I'll go as long as you come with me."]),
      // p2 — as long as
      fc("p2", "You can borrow my bike ___ you bring it back tonight.", ["as long as", "as long", "as long that"]),
      chat("p2", ["Can I use your laptop?", null], [
        "Sure, as long as you're careful with it.",
        "Sure, as long you're careful with it.",
        "Sure, as long as you careful with it.",
      ]),
      la("p2", "You can stay as long as you are quiet.", ["will"]),
      // p3 — provided that (formal)
      fc("p3", "The refund is possible ___ that you keep the receipt.", ["provided", "provide", "provides"]),
      err("p3", "You can register provide that you are over 16.", "provide", "provided"),
      sit("p3", "You write a formal email to a customer. The discount is only for people who order before Friday. What do you write?", [
        "You will get a discount provided that you order before Friday.",
        "You will get a discount provided that you will order before Friday.",
        "You will get a discount unless you order before Friday.",
      ]),
      spk("p3", "You can start provided that you sign the contract."),
      // mix
      sit("mix", "The rule is: 'You can't use the pool if you don't have a membership card.' Which sentence means the same?", [
        "You can use the pool as long as you have a membership card.",
        "You can use the pool unless you have a membership card.",
        "You can't use the pool as long as you have a membership card.",
      ]),
      sit("mix", "A hotel email says guests can check in early, but only if they call first. Which sentence is correct and formal?", [
        "Early check-in is possible provided that you call first.",
        "Early check-in is possible unless you call first.",
        "Early check-in is possible provided that you will call first.",
      ]),
    ],
    success: "The learner uses each target phrase correctly to state a condition in context.",
    minUses: 3,
    quiz: [
      qmcq("You can use the gym ___ you wear proper shoes.", [
        "as long as",
        "unless",
        "because",
      ], 0),
      qfill("The ticket is not valid ___ you show your ID.", ["unless","Unless"]),
      qmcq("We will deliver your order ___ you pay in advance.", [
        "provided that",
        "unless",
        "while",
      ], 0),
      qfill("You can enter the contest ___ you are over 18.", ["provided that","Provided that"]),
    ],
    scenes: [
      sc("Lucy", "neighbour", "to lend you her lawnmower under certain conditions",
        "You are talking with your neighbour Lucy in her garden about borrowing her lawnmower.",
        "Explain the conditions for borrowing the lawnmower using unless, as long as, and provided that.",
        "You can borrow my lawnmower, but I have a few rules. What rules do you think are fair?", "friendly"),
      sc("Michael", "team leader", "to clarify the terms for working from home",
        "You are in a meeting with your team leader about working from home.",
        "Explain the conditions for working from home using unless, as long as, and provided that.",
        "We can discuss working from home, but what conditions do you think are important?", "busy"),
      sc("Sophie", "hotel receptionist", "to explain the terms of a room upgrade offer",
        "You are at the hotel front desk discussing a possible room upgrade with the receptionist.",
        "State the conditions for getting a room upgrade using unless, as long as, and provided that.",
        "We can give you a free room upgrade today, with some conditions. What conditions do you think there are?", "curious"),
      sc("Dr. Patel", "course advisor", "to explain the requirements for joining a special seminar",
        "You are meeting with your course advisor to ask about joining a special seminar.",
        "Explain the conditions for joining the seminar using unless, as long as, and provided that.",
        "You are interested in the seminar, right? What do you think you need to do to join?", "friendly"),
      sc("Mr. Collins", "examiner", "to check your ability to explain conditions for an offer",
        "You are in a speaking exam and the examiner asks you about the conditions for accepting an offer.",
        "State the conditions for accepting an offer using unless, as long as, and provided that.",
        "Imagine a company offers you a job abroad. On what conditions would you accept it?", "curious"),
    ],
  },
  {
    id: "b1-in-case-it-rains",
    topic: "in case for precautions vs if",
    objectives: [
      "Use 'in case' to talk about preparing for possible situations.",
      "Choose correctly between 'in case' and 'if' for precautions.",
    ],
    goal: "Can explain why they bring or do something as a precaution using 'in case', and can tell the difference from 'if'.",
    target: "'in case' for precautions, and contrast with 'if' for conditions",
    correction: "Prompt the learner to use 'in case' for preparations, and 'if' for conditions; explain the difference if confused.",
    summary: "You learned how to use 'in case' to talk about precautions. It also explained the difference between 'in case' and 'if'.",
    minutes: 8,
    points: [
      {
        form: "in case + present tense",
        claims: [
          "Use 'in case' to show you do something as a precaution, to prepare for a possible situation.",
          "You do the main action first (for example, you take an umbrella), before you know if the situation will happen.",
          "'Just in case' can also come alone at the end: 'Take some cash, just in case.'",
        ],
        ex: [
          "Take an umbrella in case it rains.",
          "I will bring a jacket in case it gets cold.",
          "Take it with you in case you need it.",
        ],
      },
      {
        form: "if + present tense",
        claims: [
          "Use 'if' to talk about what you will do when or after a situation happens.",
          "The action with 'if' happens after or only when the situation happens.",
        ],
        ex: [
          "If it rains, I will take an umbrella.",
          "If it gets cold, I will put on my jacket.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — in case (precaution) / just in case / take it with you
      fc("p1", "Take a bottle of water ___ you get thirsty.", ["in case", "in case of", "incase"]),
      sit("p1", "You don't know if the shop takes cards, so you take some cash before you go. What do you say?", [
        "I'll take some cash in case they don't take cards.",
        "I'll take some cash in case they won't take cards.",
        "I'll take some cash in case of they don't take cards.",
      ]),
      la("p1", "Take your phone with you in case you get lost.", ["will"]),
      err("p1", "I'll write it down in case I forgot.", "forgot", "forget"),
      chat("p1", ["Why are you taking a sweater? It's warm today.", null], [
        "Just in case it gets cold tonight.",
        "Just in case it will get cold tonight.",
        "Just in case of it gets cold tonight.",
      ]),
      spk("p1", "Bring a sweater, just in case."),
      // p2 — if (only when it happens)
      sit("p2", "You will close the window only when it actually gets cold, not before. What do you say?", [
        "I'll close the window if it gets cold.",
        "I'll close the window in case it gets cold.",
        "I'll close the window if it will get cold.",
      ]),
      fc("p2", "If the bus is late, I ___ a taxi.", ["will take", "take will", "taking"]),
      lc("p2", "If it rains, we'll eat inside.", ["If it rains, we'll eat outside.", "In case it rains, we'll eat inside."]),
      // mix
      sit("mix", "You will call your friend only if your train is late. You are also taking a book now, because the trip might be boring. What do you say?", [
        "I'll call you if my train is late, and I'm taking a book in case I get bored.",
        "I'll call you in case my train is late, and I'm taking a book if I get bored.",
        "I'll call you if my train will be late, and I'm taking a book in case I get bored.",
      ]),
      sit("mix", "The restaurant might be busy tonight, so you want to book a table now, before you know. Which sentence shows this precaution?", [
        "I'll book a table in case the restaurant is busy.",
        "I'll book a table if the restaurant is busy.",
        "I'll book a table in case the restaurant will be busy.",
      ]),
    ],
    success: "The learner uses 'in case' or 'just in case' correctly to show a precaution, and uses 'take it with you' in a natural way.",
    quiz: [
      qmcq("You are leaving home and do not know how the weather will change. Which sentence shows a precaution?", [
        "Bring a coat in case it gets cold.",
        "Bring a coat if it gets cold.",
        "Bring a coat because it is cold.",
      ], 0),
      qfill("Take your sunglasses ___ it is sunny.", ["in case","In case"]),
      qmcq("Which is correct for preparing for rain?", [
        "Take an umbrella in case it rains.",
        "Take an umbrella if it rains.",
        "Take an umbrella because it rains.",
      ], 0),
      qfill("I will take a power bank ___ my phone battery dies.", ["in case","In case"]),
    ],
    scenes: [
      sc("Lucy", "your friend", "to understand why you are packing certain things",
        "You are at your house packing bags with your friend Lucy before a weekend trip.",
        "Explain why you are bringing certain items as a precaution using 'in case', and suggest your friend also brings something 'just in case'.",
        "The sky is clear, but you're taking an umbrella today. Why?", "curious"),
      sc("David", "your colleague", "to make sure nothing is forgotten for the business trip",
        "You and your colleague David are preparing to leave the office for a business trip.",
        "Explain why you are taking certain work items as a precaution, and recommend David bring something 'just in case'.",
        "We're packing for our work trip. What extra things should we take, and why?", "busy"),
      sc("Sofia", "hotel receptionist", "to help you prepare for your stay",
        "You are checking in at a hotel and Sofia is asking about your luggage and what you brought.",
        "Explain to Sofia why you packed certain items as a precaution, and mention something you brought 'just in case'.",
        "The forecast says it might snow tomorrow. What will you take with you when you go out?", "friendly"),
      sc("Mr. Green", "your teacher", "to know if you are prepared for the school trip",
        "Before a school field trip, Mr. Green is checking what students are bringing.",
        "Explain to your teacher why you packed certain things as a precaution, and suggest something other students should take 'just in case'.",
        "Can you tell me why you decided to pack a jacket today?", "curious"),
      sc("Ms. Carter", "examiner", "to assess your ability to use 'in case' and 'if' correctly",
        "You are in a speaking exam room with Ms. Carter.",
        "Explain why you brought certain items for a trip as a precaution, and show the difference between 'in case' and 'if'.",
        "Why did you decide to take an extra sweater with you on your trip?", "friendly"),
    ],
  },
  {
    id: "b1-i-wish-things-were-different",
    topic: "wish and if only for regrets about the present",
    objectives: [
      "Use 'wish' and 'if only' to express regrets about the present.",
      "Form correct sentences using 'I wish I' and 'if only' for current situations.",
      "Use 'were' after 'I wish it' to talk about unreal present situations.",
    ],
    goal: "Express regrets about your current situation using 'wish' and 'if only'.",
    target: "I wish I + past simple, if only + past simple, I wish it were",
    correction: "Prompt the correct form using past simple after 'wish' and 'if only', and 'were' after 'I wish it'.",
    summary: "You learned how to use 'wish' and 'if only' to talk about present regrets.",
    minutes: 8,
    points: [
      {
        form: "I wish I + past simple",
        claims: [
          "Use 'I wish I' plus the past simple to talk about something you want to be different now.",
          "This shows regret or unhappiness about your present situation.",
          "For ability, use 'could' (not 'can') after 'I wish': 'I wish I could sing.'",
        ],
        ex: [
          "I wish I had more free time.",
          "I wish I lived closer to my friends.",
        ],
      },
      {
        form: "if only + past simple",
        claims: [
          "Use 'if only' plus the past simple to show a strong wish that something in the present was different.",
          "'If only' is often stronger than 'I wish'.",
        ],
        ex: [
          "If only I knew the answer.",
          "If only I had a car.",
        ],
      },
      {
        form: "I wish it were",
        claims: [
          "After 'I wish it', careful and formal English prefers 'were' for unreal situations.",
          "Use 'were' in the same way after 'if only it': 'If only it were Saturday.'",
          "In everyday informal English, 'was' is also common: 'I wish it was easier.'",
        ],
        ex: [
          "I wish it were sunny today.",
          "I wish it were easier.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — I wish I + past simple (could for ability)
      fc("p1", "I wish I ___ a bigger flat.", ["had", "have", "will have"]),
      err("p1", "I wish I could spoke Italian.", "spoke", "speak"),
      la("p1", "I wish I lived near the sea.", ["live"]),
      sit("p1", "You work every weekend and you are not happy about it. What do you say?", [
        "I wish I had free weekends.",
        "I wish I have free weekends.",
        "I wish I will have free weekends.",
      ]),
      // p2 — if only
      fc("p2", "If only I ___ her phone number!", ["knew", "know", "will know"]),
      chat("p2", ["You look worried. What's wrong?", null], [
        "If only I had more time for this project.",
        "If only I have more time for this project.",
        "If only I will have more time for this project.",
      ]),
      spk("p2", "If only I lived closer to work."),
      // p3 — I wish it were
      fc("p3", "I wish it ___ warmer today.", ["were", "is", "will be"]),
      err("p3", "I wish it is the weekend.", "is", "were"),
      lc("p3", "I wish it were quieter here.", ["I wish it was cheaper here.", "I'm glad it's quiet here."]),
      // mix
      sit("mix", "Your phone is old and slow, and you don't have money for a new one. What do you say?", [
        "I wish I had a new phone. If only this one were faster!",
        "I wish I have a new phone. If only this one were faster!",
        "I wish I had a new phone. If only this one is faster!",
      ]),
      fc("mix", "If only it ___ Saturday! I wish I could sleep late.", ["were", "is", "will be"]),
      spk("mix", "If only it were Friday and I had more time."),
    ],
    success: "Learner produces sentences with the correct structure to express present regrets using 'wish' and 'if only'.",
    quiz: [
      qmcq("Choose the correct sentence to express a present regret.", [
        "I wish I knew how to swim.",
        "I wish I know how to swim.",
        "I wish I will know how to swim.",
      ], 0),
      qfill("If only it ___ not raining now.", ["were","was"]),
      qmcq("Which is correct?", [
        "If only I have more money.",
        "If only I had more money.",
        "If only I will have more money.",
      ], 1),
      qfill("I wish it ___ possible to travel today.", ["were","was"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to find out what you would change about your life right now",
        "You are sitting with your friend Lucy in a coffee shop talking about your lives.",
        "Express regrets about your current situation using 'wish' and 'if only'.",
        "What is one thing you wish were different in your life right now?", "curious"),
      sc("Simon", "colleague", "to understand what you wish was different at work",
        "You are taking a break with your colleague Simon in the office kitchen.",
        "Express regrets about your work situation using 'wish' and 'if only'.",
        "What do you wish was different at work right now?", "friendly"),
      sc("Maria", "hotel receptionist", "to make your stay better by learning what you wish was different",
        "You are talking to Maria at the hotel reception about your stay.",
        "Express regrets about your current travel situation using 'wish' and 'if only'.",
        "What do you wish was better about your room or your stay?", "curious"),
      sc("Dr. Carter", "academic advisor", "to help you improve your study situation",
        "You are meeting your academic advisor Dr. Carter to talk about your studies.",
        "Express regrets about your current study situation using 'wish' and 'if only'.",
        "What do you wish was different about your studies right now?", "friendly"),
      sc("Mr. Green", "examiner", "to hear you talk about your present regrets",
        "You are in a speaking exam room with Mr. Green, who is asking about your life.",
        "Express regrets about your current situation using 'wish' and 'if only'.",
        "Can you tell me about something you wish was different in your life at the moment?", "curious"),
    ],
  },
  {
    id: "b1-on-the-one-hand",
    topic: "weighing two sides of a question out loud",
    objectives: [
      "Use set phrases to show two sides of a situation.",
      "Express a balanced opinion using 'on the one hand', 'then again', and 'all things considered'.",
    ],
    goal: "The learner can clearly show both sides of a difficult choice and give a balanced opinion in conversation.",
    target: "'on the one hand', 'then again', 'all things considered'",
    correction: "Prompt the learner to use all three target phrases clearly when weighing options.",
    summary: "You learned you how to use three key phrases to discuss both sides of a question. You practised giving a balanced opinion out loud.",
    minutes: 7,
    intents: {
      readiness: "Greet, introduce the topic of weighing two sides of a question, and check readiness.",
      teach: "Explain how to show both sides when thinking about a difficult choice.",
      questions: "Invite any questions before starting practice exercises.",
      say: "Acknowledge and announce a few practice questions are coming.",
    },
    points: [
      {
        form: "on the one hand",
        claims: [
          "Use 'on the one hand' to introduce the first side or reason in a situation.",
          "This phrase signals you are starting to weigh options.",
        ],
        ex: [
          "On the one hand, the job pays well.",
          "On the one hand, living in the city is exciting.",
        ],
      },
      {
        form: "then again",
        claims: [
          "Use 'then again' to introduce the opposite side or a different reason.",
          "This phrase shows you are considering another point.",
        ],
        ex: [
          "Then again, the job is very stressful.",
          "Then again, the city is very noisy.",
        ],
      },
      {
        form: "all things considered",
        claims: [
          "Use 'all things considered' to give your final opinion after thinking about both sides.",
          "This phrase means you have looked at all the reasons.",
        ],
        ex: [
          "All things considered, I think I will take the job.",
          "All things considered, living in the city is best for me.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — on the one hand
      fc("p1", "___ the one hand, the flat is very big.", ["On", "In", "At"]),
      la("p1", "On the one hand, the course is free.", ["in"]),
      sit("p1", "You start to talk about a new job. First you give the good side: the salary is great. What do you say?", [
        "On the one hand, the salary is great.",
        "In the one hand, the salary is great.",
        "On the one hands, the salary is great.",
      ]),
      // p2 — then again
      fc("p2", "The hotel is near the beach. ___ again, it's very expensive.", ["Then", "Than", "Them"]),
      chat("p2", ["This phone has a great camera.", null], [
        "Then again, the battery is really weak.",
        "Than again, the battery is really weak.",
        "Then again, the battery are really weak.",
      ]),
      spk("p2", "Then again, it's a long way from home."),
      // p3 — all things considered
      fc("p3", "All things ___, I'm happy with my choice.", ["considered", "considering", "consider"]),
      err("p3", "All things consider, I'll stay here.", "consider", "considered"),
      lc("p3", "All things considered, it was a good trip.", ["All in all, it was a long trip.", "After all, it was a good trip."]),
      // mix
      chat("mix", ["Should we buy a car?", "On the one hand, it would be useful.", "That's true. Anything else?", null], [
        "Then again, it would cost a lot of money.",
        "Than again, it would cost a lot of money.",
        "Then again, it would costs a lot of money.",
      ]),
      sit("mix", "You think about a new job: good pay, but a long trip to work. In the end, you decide to take it. What do you say?", [
        "On the one hand, the pay is good. Then again, the trip is long. All things considered, I'll take it.",
        "On the one hand, the pay is good. Then again, the trip is long. On the one hand, I'll take it.",
        "Then again, the pay is good. On the one hand, the trip is long. All things considered, I'll take it.",
      ]),
    ],
    success: "The learner clearly uses all three target phrases to show two sides and a final opinion.",
    minUses: 1,
    quiz: [
      qmcq("Which phrase do you use to introduce the first side of a question?", [
        "On the one hand",
        "Then again",
        "All things considered",
      ], 0),
      qfill("I want to travel. ___, I do not have much money.", ["Then again","then again"]),
      qmcq("Which phrase do you use to give your final opinion after thinking about both sides?", [
        "On the one hand",
        "Then again",
        "All things considered",
      ], 2),
      qfill("___, I think I will stay home tonight.", ["All things considered","all things considered"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to help you decide whether to move to a new apartment",
        "You are sitting in a cafe with your friend Sophie, discussing whether you should move to a new apartment.",
        "Weigh the pros and cons of moving to a new apartment and share your balanced opinion.",
        "You're thinking about moving to a new city. What are the good and bad sides?", "curious"),
      sc("Martin", "colleague", "to hear your thoughts about accepting a new project",
        "You are in the break room at work and Martin asks your opinion about taking on a big new project.",
        "Discuss both sides of accepting the project and give your balanced view.",
        "What are the good and bad sides of saying yes to the new project?", "friendly"),
      sc("Linda", "travel companion", "to decide together whether to visit a popular tourist attraction",
        "You and Linda are in your hotel room abroad, trying to decide whether to visit a busy tourist spot.",
        "Talk through the advantages and disadvantages of visiting the place and share your balanced opinion.",
        "The famous museum is very popular, but tickets are expensive. What do you think about going tomorrow?", "curious"),
      sc("James", "classmate", "to discuss whether to join a study group for exam preparation",
        "You are in the library with James, talking about joining a new study group.",
        "Consider the benefits and drawbacks of joining the study group and give your opinion.",
        "The new study group meets every evening before the exam. What do you think about joining it?", "curious"),
      sc("Ms. Carter", "examiner", "to assess your ability to discuss both sides of a decision",
        "You are in a speaking exam and Ms. Carter asks you to talk about deciding whether to buy a car.",
        "Explain both sides of buying a car and give a balanced conclusion.",
        "Can you tell me about the advantages and disadvantages of buying a car?", "neutral"),
    ],
  },
  {
    id: "b1-what-would-you-do",
    topic: "talking through imaginary situations and defending your answer",
    objectives: [
      "Ask someone what they would do in an imaginary situation.",
      "Explain and defend their own choice using set phrases.",
    ],
    goal: "The learner can discuss imaginary situations with friends and explain their choices.",
    target: "Phrases: 'What would you do?', 'I'd probably...', 'I definitely wouldn't...'.",
    correction: "Prompt the correct phrase if the learner omits or misuses the target phrases.",
    summary: "You learned asking about imaginary situations and giving and defending answers. Learners used set phrases to explain their choices.",
    minutes: 7,
    points: [
      {
        form: "What would you do?",
        claims: [
          "Use 'What would you do?' to ask someone about an imaginary or hypothetical situation.",
          "This question invites the other person to imagine themselves in the situation.",
        ],
        ex: [
          "What would you do if you lost your wallet?",
          "What would you do if you saw a famous person?",
        ],
      },
      {
        form: "I'd probably / I definitely wouldn't",
        claims: [
          "Use 'I'd probably...' to explain what you would most likely do in the situation.",
          "Use 'I definitely wouldn't...' to say clearly what you would not do.",
          "These phrases help you defend or explain your answer.",
        ],
        ex: [
          "I'd probably call the police.",
          "I definitely wouldn't run away.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — What would you do?
      fc("p1", "What ___ you do if you lost your keys?", ["would", "will", "did"]),
      la("p1", "What would you do if it snowed?", ["will"]),
      sit("p1", "You want to ask your friend about an imaginary situation: winning a big prize. What do you ask?", [
        "What would you do if you won a big prize?",
        "What do you do if you won a big prize?",
        "What would you do if you win a big prize?",
      ]),
      // p2 — I'd probably / I definitely wouldn't
      chat("p2", ["What would you do if you missed your flight?", null], [
        "I'd probably book a hotel near the airport.",
        "I'd probably booked a hotel near the airport.",
        "I'd probably to book a hotel near the airport.",
      ]),
      fc("p2", "I definitely ___ shout at the waiter.", ["wouldn't", "won't to", "don't would"]),
      spk("p2", "I definitely wouldn't tell anyone."),
      // mix
      sit("mix", "Your friend asks: 'What would you do if you found money in the street?' You would most likely give it to the police, and you are sure you would not keep it. What do you say?", [
        "I'd probably give it to the police. I definitely wouldn't keep it.",
        "I'd probably give it to the police. I definitely would keep it.",
        "I'd probably gave it to the police. I definitely wouldn't keep it.",
      ]),
      sit("mix", "Your friend has a problem with her boss. You say what you would most likely do, then you ask her opinion. What do you say?", [
        "I'd probably talk to my boss. What would you do?",
        "I'd probably talked to my boss. What would you do?",
        "I'd probably talk to my boss. What would you did?",
      ]),
    ],
    success: "Learner asks about an imaginary situation and gives and defends their answer using the target phrases.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase asks about an imaginary situation?", [
        "What would you do?",
        "What are you doing?",
        "What did you do?",
      ], 0),
      qfill("___ probably tell my parents if I had a problem.", ["I'd","I would"]),
      qmcq("Choose the phrase that clearly says you would NOT do something.", [
        "I'd probably",
        "I definitely wouldn't",
        "What would you do",
      ], 1),
      qfill("If you saw someone cheating on a test, ___?", ["what would you do","What would you do"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to have fun discussing imaginary situations with you",
        "You are sitting with your friend Lucy in a cafe, playing a what-would-you-do game.",
        "Share your choices and explain them using the target phrases.",
        "If you found a wallet on the street, what would you do?", "curious"),
      sc("James", "colleague", "to get to know you better through a fun team-building activity",
        "During a lunch break, your colleague James suggests playing a what-would-you-do game in the office kitchen.",
        "Discuss an imaginary work situation and defend your answer using the target phrases.",
        "If you saw someone taking office supplies without asking, what would you do?", "friendly"),
      sc("Sophie", "fellow traveller", "to pass the time and learn about your ideas while waiting for a delayed train",
        "You are waiting at a train station abroad with Sophie, who starts a what-would-you-do conversation.",
        "Talk about a travel dilemma and explain your choice using the target phrases.",
        "If you lost your passport in a foreign country, what would you do?", "curious"),
      sc("Daniel", "classmate", "to practice English and share opinions in a study group",
        "During a study group break, Daniel suggests a what-would-you-do game to practice English.",
        "Respond to an academic scenario and defend your answer using the target phrases.",
        "If you forgot to do your homework and the teacher asks you, what would you do?", "friendly"),
      sc("Mrs. Carter", "examiner", "to hear how you handle imaginary situations and explain your choices",
        "You are in a speaking exam room, and Mrs. Carter asks you about imaginary situations.",
        "Answer the examiner's question and explain your reasoning using the target phrases.",
        "Imagine you missed an important appointment. What would you do?", "curious"),
    ],
  },
  {
    id: "b1-he-said-he-was-tired",
    topic: "reporting statements and shifting the words back in time",
    objectives: [
      "Report statements using 'said' or 'told' plus a clause.",
      "Shift present tense verbs to past tense in reported speech.",
      "Shift will to would in reported speech.",
    ],
    goal: "Pass on what someone said earlier, using correct reported speech.",
    target: "reported statements with correct tense shift (e.g., he said he was, she told me she had, they said they'd)",
    correction: "Point out incorrect tense or reporting verb and model the correct reported statement.",
    summary: "You learned how to report statements using 'said' and 'told', and how to shift the verb tense back in time. You practised reporting what others said earlier.",
    minutes: 8,
    points: [
      {
        form: "he said he / she told me",
        claims: [
          "Use 'said' or 'told' plus a clause to report what someone said.",
          "'Told' must have a person after it (e.g., she told me).",
          "Do not use quotation marks in reported speech.",
        ],
        ex: [
          "He said he was busy.",
          "She told me she would call later.",
        ],
      },
      {
        form: "shifting the words back in time",
        claims: [
          "With a past reporting verb, present simple usually shifts to past simple; it may stay present if the information is still true.",
          "Change 'will' to 'would' in reported speech.",
          "'They'd' (or 'he'd', 'she'd') here is the short form of 'they would': 'They said they'd call.'",
          "Change past simple to past perfect if needed.",
        ],
        ex: [
          "Direct: 'I am tired.' Reported: He said he was tired.",
          "Direct: 'We will finish soon.' Reported: They said they would finish soon.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — said / told + person
      fc("p1", "She ___ me she was busy.", ["told", "said", "says"]),
      err("p1", "She said me that she was tired.", "said", "told"),
      fc("p1", "He ___ he was hungry.", ["said", "told", "tell"]),
      la("p1", "She told me she was at home.", ["said"]),
      // p2 — shifting back
      fc("p2", "'I will help you.' Reported: He said he ___ help me.", ["would", "will be", "helps"]),
      sit("p2", "Yesterday your friend Anna said to you: 'I am tired.' Today you tell someone. What do you say?", [
        "She said she was tired.",
        "She said me she was tired.",
        "She told she was tired.",
      ]),
      chat("p2", ["What did Tom say about the party?", null], [
        "He said he would come.",
        "He said he would comes.",
        "He said he would came.",
      ]),
      lc("p2", "They said they were lost.", ["They said they were leaving.", "They told us to wait."]),
      fc("p2", "'We will call you.' Reported: They said ___ call me.", ["they'd", "they'd to", "they'll to"]),
      sit("p2", "Yesterday your friend Tom said: 'I lost my keys.' Today you tell someone. What do you say?", [
        "He said he had lost his keys.",
        "He said he has lose his keys.",
        "He said me he had lost his keys.",
      ]),
      // mix
      spk("mix", "He told me he would be late."),
      sit("mix", "This morning, Anna said to you: 'I will send the email.' Now you tell your boss. What do you say?", [
        "Anna told me she would send the email.",
        "Anna said me she would send the email.",
        "Anna told me she would sends the email.",
      ]),
      fc("mix", "Ben told me he ___ leaving early.", ["was", "were", "be"]),
    ],
    success: "The learner reports a statement with the correct reporting verb and shifts the verb tense back.",
    quiz: [
      qmcq("Which is correct for reported speech?", [
        "She told me she will help.",
        "She told me she would help.",
        "She told me she helps.",
      ], 1),
      qfill("He said he ___ going to be late.", ["was"]),
      qmcq("They said they'd ___ the documents by Monday.", [
        "send",
        "sends",
        "sent",
      ], 0),
      qfill("She told me she ___ finished the task.", ["had"]),
    ],
    scenes: [
      sc("Lucy", "Neighbour", "Find out what another neighbour mentioned earlier",
        "You meet your neighbour Lucy outside your apartment building.",
        "Pass on what another neighbour told you earlier using reported speech.",
        "Hi! I saw you talking to Mr. Green earlier. Did he say anything interesting?", "curious"),
      sc("Mark", "Team Leader", "Get updates about what colleagues said in a previous meeting",
        "You are in the office, and Mark asks you about a meeting you attended earlier.",
        "Report what your colleague shared in the meeting using reported speech.",
        "I missed the meeting this morning. Can you tell me what Sarah said about the project?", "busy"),
      sc("Olivia", "Hotel Receptionist", "Understand what the tour guide mentioned to you",
        "You are at the hotel front desk, and Olivia wants to know about your conversation with the tour guide.",
        "Pass on information the tour guide gave you earlier using reported speech.",
        "Welcome back! Did the tour guide give you any updates about tomorrow's trip?", "friendly"),
      sc("Dr. Carter", "Course Advisor", "Find out what your professor said about the assignment",
        "You are meeting with your course advisor, Dr. Carter, to discuss your assignment.",
        "Report what your professor told you earlier using reported speech.",
        "I heard you spoke with Professor Lee. What did she tell you about the assignment?", "curious"),
      sc("Mr. Smith", "Examiner", "Assess your ability to use reported speech",
        "You are in a speaking exam room with Mr. Smith, who asks about a previous conversation.",
        "Demonstrate your ability to use reported speech to pass on information.",
        "Earlier, you mentioned a conversation with your colleague. Can you tell me what they said?", "neutral"),
    ],
  },
  {
    id: "b1-she-asked-where-i-lived",
    topic: "reporting questions and word order",
    objectives: [
      "Report yes/no and wh- questions using correct word order.",
      "Use phrases like 'she asked me', 'he wanted to know', and 'they asked whether' to report questions.",
    ],
    goal: "Describe what questions were asked in a job interview using reported speech.",
    target: "Reported questions using 'she asked me', 'he wanted to know', 'they asked whether', and correct word order (subject before verb, no question word order).",
    correction: "Model the correct word order and prompt the learner to repeat the sentence correctly.",
    summary: "You learned how to report questions using correct word order.",
    minutes: 8,
    points: [
      {
        form: "reporting questions",
        claims: [
          "Use phrases like 'she asked me', 'he wanted to know', or 'they asked whether' to start a reported question.",
          "Do not use question word order in reported questions.",
          "In reported questions, put the subject before the verb.",
        ],
        ex: [
          "She asked me where I worked.",
          "He wanted to know if I could start next week.",
        ],
      },
      {
        form: "word order in reported questions",
        claims: [
          "Do not use do/does/did in reported questions.",
          "Use 'if' or 'whether' to report yes/no questions.",
        ],
        ex: [
          "They asked whether I had any experience.",
          "She asked me if I liked working in a team.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — reporting questions
      fc("p1", "He asked me where ___ from.", ["I was", "was I", "did I was"]),
      err("p1", "He wanted to knew where I lived.", "knew", "know"),
      arr("p1", "She asked me where I lived.", ["did"]),
      sit("p1", "Last month, at a hotel, a man asked you: 'Which room are you in?' Now you have left the hotel and you tell a friend. What do you say?", [
        "He asked me which room I was in.",
        "He asked me which room was I in.",
        "He asked me which room am I in.",
      ]),
      lc("p1", "He wanted to know where I was staying.", ["He wanted to know when I was leaving.", "He wanted to go where I was staying."]),
      // p2 — no do/does/did, if/whether
      fc("p2", "She asked me ___ I liked my new job.", ["if", "that", "what"]),
      chat("p2", ["What did the doctor ask you?", null], [
        "She asked whether I slept well.",
        "She asked whether did I sleep well.",
        "She asked whether do I sleep well.",
      ]),
      spk("p2", "She asked me if I was free on Friday."),
      la("p2", "He asked whether I could help him.", ["do"]),
      // mix
      sit("mix", "Your new boss asked you two questions: 'Where do you live?' and 'Do you have a car?' You tell a friend. What do you say?", [
        "She asked me where I lived and whether I had a car.",
        "She asked me where did I live and whether I had a car.",
        "She asked me where I lived and whether did I have a car.",
      ]),
      fc("mix", "They wanted to know when ___ start.", ["I could", "could I", "did I could"]),
    ],
    success: "The learner reports questions using the correct phrase and correct word order (subject before verb, no question word order, no do/does/did).",
    quiz: [
      qmcq("Which is correct for reporting a yes/no question?", [
        "They asked whether I could work weekends.",
        "They asked did I work weekends.",
        "They asked whether do I work weekends.",
      ], 0),
      qfill("He wanted to know ___ I had any questions.", ["if","whether"]),
      qmcq("Choose the correct reported question:", [
        "She asked me where do I live.",
        "She asked me where I live.",
        "She asked me where did I live.",
      ], 1),
      qfill("They asked ___ I could start next week.", ["if","whether"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to hear about your job interview experience",
        "You are sitting in a cafe with your friend after your job interview.",
        "Describe the questions you were asked in the interview using reported speech.",
        "So, how did your job interview go? What did they ask you?", "curious"),
      sc("Martin", "colleague", "to find out about the interview process at another company",
        "You are chatting with a colleague in the office kitchen about your recent interview.",
        "Explain to your colleague what questions you were asked in the interview using reported speech.",
        "Hey, I heard you had an interview yesterday. Can you tell me what kind of questions they asked?", "friendly"),
      sc("Linda", "hostel roommate", "to learn about job interviews in your country",
        "You are talking to your roommate in a hostel abroad about your job interview experience.",
        "Share the types of questions you were asked in the interview using reported speech.",
        "I’ve never done a job interview in your country. What did they want to know?", "curious"),
      sc("Dr. Patel", "career advisor", "to help you prepare for future interviews",
        "You are meeting your university career advisor to discuss your recent job interview.",
        "Describe the interview questions you were asked using reported speech.",
        "Let’s go over your interview. What questions did they ask you?", "friendly"),
      sc("Mr. Brown", "examiner", "to assess your ability to use reported speech",
        "You are in a speaking exam, and the examiner asks about your last job interview.",
        "Report the questions you were asked during the interview using reported speech.",
        "Can you tell me what questions were asked in your job interview?", "curious"),
    ],
  },
  {
    id: "b1-they-told-me-to-wait",
    topic: "reporting requests, orders and advice",
    objectives: [
      "Report a request using 'asked me to'.",
      "Report an order using 'told me to'.",
      "Report advice using 'advised me to'.",
    ],
    goal: "Explain instructions, requests, or advice you received from someone else.",
    target: "'told me to', 'asked me to', 'advised me to' + base verb",
    correction: "Model the correct phrase and prompt the learner to repeat using the correct reporting verb plus 'to' and the base verb.",
    summary: "You learned how to report requests, orders, and advice using 'asked me to', 'told me to', and 'advised me to'.",
    minutes: 8,
    points: [
      {
        form: "asked me to",
        claims: [
          "Use 'asked me to' + base verb to report a request.",
          "'Asked' is the past form of 'ask'.",
          "Do not use 'that' after 'asked me to'.",
        ],
        ex: [
          "She asked me to close the window.",
          "They asked me to help with the project.",
        ],
      },
      {
        form: "told me to",
        claims: [
          "Use 'told me to' + base verb to report an order or instruction.",
          "'Told' is the past form of 'tell'.",
          "Do not use 'that' after 'told me to'.",
        ],
        ex: [
          "My boss told me to finish the report.",
          "He told me to wait outside.",
        ],
      },
      {
        form: "advised me to",
        claims: [
          "Use 'advised me to' + base verb to report advice.",
          "'Advised' is the past form of 'advise'.",
          "Do not use 'that' after 'advised me to'.",
        ],
        ex: [
          "The doctor advised me to rest.",
          "She advised me to study more.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — asked me to (request)
      fc("p1", "My neighbour asked me ___ water her plants.", ["to", "that", "for"]),
      sit("p1", "Your friend Lisa said: 'Can you call me tonight?' You tell your sister. What do you say?", [
        "She asked me to call her tonight.",
        "She asked me that I call her tonight.",
        "She asked me calling her tonight.",
      ]),
      la("p1", "They asked me to bring some food.", ["that"]),
      // p2 — told me to (order)
      fc("p2", "The teacher told us ___ quiet.", ["to be", "be", "being"]),
      err("p2", "The manager told me to coming back later.", "coming", "come"),
      arr("p2", "The nurse told me to sit down.", ["sitting"]),
      // p3 — advised me to (advice)
      fc("p3", "My doctor advised me ___ more water.", ["to drink", "drink", "drinking"]),
      chat("p3", ["What did the bank say about your savings?", null], [
        "They advised me to open a new account.",
        "They advised me open a new account.",
        "They advised me that open a new account.",
      ]),
      spk("p3", "My teacher advised me to read more."),
      // mix
      sit("mix", "Your doctor said: 'You should stop working late.' Then your boss said: 'Go home now!' You tell your friend. What do you say?", [
        "My doctor advised me to stop working late, and my boss told me to go home.",
        "My doctor advised me to stop working late, and my boss told me that go home.",
        "My doctor advised me stop working late, and my boss told me go home.",
      ]),
      lc("mix", "She asked me to stay, but he told me to leave.", ["She asked me to stay, but he told me to wait.", "She told me to stay, but he asked me to leave."]),
    ],
    success: "The learner correctly uses 'told me to', 'asked me to', or 'advised me to' with a base verb to report a request, order, or advice.",
    quiz: [
      qmcq("Which is correct for reporting an order?", [
        "He told me to stop.",
        "He asked me to stop.",
        "He advised me to stop.",
      ], 0),
      qfill("The doctor said: 'You should exercise more.' Reported: The doctor ___ exercise more.", ["advised me to"]),
      qmcq("How do you report: 'Can you help me?'", [
        "She told me to help her.",
        "She advised me to help her.",
        "She asked me to help her.",
      ], 2),
      qfill("My parents said: 'Please clean your room.' Reported: My parents ___ clean my room.", ["asked me to"]),
    ],
    scenes: [
      sc("Lucy", "your neighbour", "to find out what instructions you got about looking after her plants",
        "You are chatting with your neighbour Lucy about looking after her plants while she is away.",
        "Explain to Lucy what her sister told, asked, or advised you to do for the plants.",
        "So, what did my sister tell you to do with the plants while I am gone?", "curious"),
      sc("Mr. Carter", "your manager", "to make sure you understood the instructions from the team leader",
        "You are in the office and your manager wants to check if you understood the team leader's instructions.",
        "Explain to Mr. Carter what the team leader told, asked, or advised you to do.",
        "Can you tell me what the team leader asked you to do for this project?", "busy"),
      sc("Sophie", "hotel receptionist", "to check if you understood the hotel manager's instructions for guests",
        "You are at the hotel front desk and the receptionist wants to know about the manager's instructions.",
        "Explain to Sophie what the manager told, asked, or advised you to do as a guest.",
        "What did the manager tell you to do if you need anything in your room?", "friendly"),
      sc("Dr. Patel", "your university advisor", "to see if you understood the professor's advice about your assignment",
        "You are meeting with your university advisor to discuss your assignment.",
        "Explain to Dr. Patel what your professor told, asked, or advised you to do for the assignment.",
        "What did your professor advise you to do to improve your assignment?", "curious"),
      sc("Mr. Lewis", "examiner", "to hear how you report instructions or advice from others",
        "You are in a speaking exam and the examiner is asking about instructions you received.",
        "Explain to Mr. Lewis what someone told, asked, or advised you to do in a recent situation.",
        "Can you tell me about a time when someone gave you advice or instructions?", "friendly"),
    ],
  },
  {
    id: "b1-admit-deny-suggest",
    topic: "reporting words with more meaning than say and tell",
    objectives: [
      "Recognise and use reporting verbs like admit, suggest, and deny.",
      "Choose a reporting verb that shows the speaker's attitude or intention.",
      "Report what someone said using verbs other than say and tell.",
    ],
    goal: "Describe what people said in a disagreement using reporting verbs that show attitude or intention.",
    target: "he admitted that, she suggested, they denied it",
    correction: "Prompt the learner to use a more precise reporting verb if they use say or tell.",
    summary: "You learned how to use reporting verbs like admit, suggest, and deny. These verbs show more meaning than say or tell.",
    minutes: 8,
    points: [
      {
        form: "admit (that) + clause",
        claims: [
          "Use admit to report that someone says something is true, usually something bad that they did.",
          "admit can be followed by that + clause or a noun.",
          "admit often shows that the person accepts responsibility for a mistake.",
        ],
        ex: [
          "He admitted that he made a mistake.",
          "She admitted her error.",
        ],
      },
      {
        form: "suggest + (that) + clause",
        claims: [
          "Use suggest to report when someone gives an idea or proposal.",
          "suggest can be followed by that + clause, a noun, or verb-ing.",
          "suggest does not mean to order or insist.",
          "Do not use 'to' + verb after suggest: say 'He suggested meeting' or 'She suggested that we ask', not 'He suggested to meet' or 'She suggested us to ask'.",
        ],
        ex: [
          "She suggested that we try a different approach.",
          "He suggested meeting after lunch.",
        ],
      },
      {
        form: "deny + noun or (that) + clause",
        claims: [
          "Use deny to report that someone says something is not true.",
          "deny can be followed by a noun or that + clause.",
          "deny is often used when someone says they did not do something wrong.",
        ],
        ex: [
          "They denied it was their fault.",
          "He denied the accusation.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — admit
      fc("p1", "He finally ___ that he broke the window.", ["admitted", "admit to", "admitting"]),
      sit("p1", "Your brother says: 'Yes, I ate your chocolate. Sorry!' You tell your mum. What do you say?", [
        "He admitted that he ate my chocolate.",
        "He denied that he ate my chocolate.",
        "He suggested that he ate my chocolate.",
      ]),
      lc("p1", "She admitted her mistake.", ["She denied her mistake.", "She fixed her mistake."]),
      // p2 — suggest
      fc("p2", "Maria suggested ___ to the beach.", ["going", "to go", "go"]),
      err("p2", "They suggested eat at home.", "eat", "eating"),
      chat("p2", ["What did your manager say about the problem?", null], [
        "She suggested that we ask the IT team.",
        "She suggested that we to ask the IT team.",
        "She suggested us to ask the IT team.",
      ]),
      spk("p2", "He suggested meeting after work."),
      // p3 — deny
      fc("p3", "The player ___ that he broke the rules.", ["denied", "denied to", "deny to"]),
      sit("p3", "Your colleague says: 'No, I didn't take your pen!' What do you tell your friend?", [
        "He denied that he took my pen.",
        "He admitted that he took my pen.",
        "He denied to take my pen.",
      ]),
      la("p3", "He denied that he lost the keys.", ["denying"]),
      // mix
      sit("mix", "At first, Tom said he didn't break the cup. Later he said: 'OK, it was me.' What do you say?", [
        "He denied it at first, but later he admitted it.",
        "He admitted it at first, but later he denied it.",
        "He denied it at first, but later he suggested it.",
      ]),
      chat("mix", ["Did Sam say sorry for the mistake?", null], [
        "No, he denied it, but he suggested talking about it.",
        "No, he denied it, but he suggested to talk about it.",
        "No, he denied to do it, but he suggested talking about it.",
      ]),
    ],
    success: "The learner uses the target reporting verbs correctly to describe what people said.",
    minUses: 3,
    quiz: [
      qmcq("Which reporting verb shows someone accepts responsibility?", [
        "admit",
        "suggest",
        "deny",
      ], 0),
      qfill("Anna gave an idea for the project. She ___ we start earlier.", ["suggested that","suggested"]),
      qmcq("Which sentence uses deny correctly?", [
        "They denied it was their fault.",
        "They denied to help.",
        "They denied a new plan.",
      ], 0),
      qfill("After the meeting, ___ he was late.", ["he admitted that"]),
    ],
    scenes: [
      sc("Olivia", "neighbour", "find out what happened during a disagreement between friends",
        "You are chatting with your neighbour outside your apartment building about a recent disagreement among friends at a barbecue.",
        "Describe how the disagreement unfolded using reporting verbs that show attitude or intention.",
        "I heard there was a bit of an argument at the barbecue last night. What actually happened?", "curious"),
      sc("Martin", "team leader", "understand the details of a disagreement during a team meeting",
        "You are in a meeting room with your team leader, discussing a disagreement that happened during the last project meeting.",
        "Explain how the disagreement unfolded using reporting verbs that show attitude or intention.",
        "There was a disagreement in yesterday's meeting. What did people admit, deny or suggest?", "busy"),
      sc("Sophie", "hostel receptionist", "find out about a disagreement between guests",
        "You are at the hostel reception, and the receptionist wants to know about a disagreement that happened between guests in the common room.",
        "Describe the disagreement using reporting verbs that show attitude or intention.",
        "I heard there was some trouble in the common room last night. Can you tell me what happened?", "friendly"),
      sc("Dr. Patel", "university advisor", "get details about a disagreement in a study group",
        "You are meeting your university advisor to talk about a disagreement that happened in your study group.",
        "Describe how the disagreement unfolded using reporting verbs that show attitude or intention.",
        "Some students mentioned there was a disagreement in your study group. What was it about?", "curious"),
      sc("Mr. Turner", "examiner", "assess your ability to describe a disagreement using reporting verbs",
        "You are in a speaking exam, and the examiner asks you to describe a disagreement at work.",
        "Describe how the disagreement unfolded using reporting verbs that show attitude or intention.",
        "Tell me about a disagreement at work. What did people admit, deny or suggest?", "friendly"),
    ],
  },
  {
    id: "b1-passing-on-a-message",
    topic: "relaying what someone else said to a third person",
    objectives: [
      "Use set phrases to relay a message from one person to another.",
      "Report what someone said using simple indirect speech.",
      "Confirm understanding and promise to deliver a message.",
    ],
    goal: "The learner can pass on a message from one person to another using common English phrases.",
    target: "message for you, she said to tell, I'll pass it on",
    correction: "Prompt the learner to use the exact target phrases when relaying a message.",
    summary: "You learned how to relay a message from one person to another. You learned and practised three common phrases for passing on messages.",
    minutes: 7,
    points: [
      {
        form: "message for you",
        claims: [
          "Use 'message for you' to tell someone that another person has left them information.",
          "This phrase is short and direct, often used in workplaces.",
        ],
        ex: [
          "There is a message for you from your manager.",
          "I have a message for you from John.",
        ],
      },
      {
        form: "she said to tell",
        claims: [
          "Use 'she said to tell' to show you are repeating someone else's words to a third person.",
          "This phrase introduces what the other person wanted you to say.",
        ],
        ex: [
          "She said to tell you she will be late.",
          "He said to tell you the meeting is at 3.",
        ],
      },
      {
        form: "I'll pass it on",
        claims: [
          "Use 'I'll pass it on' to promise that you will give the message to the right person.",
          "This phrase shows responsibility for delivering the message.",
        ],
        ex: [
          "Thanks for the message. I'll pass it on.",
          "Don't worry, I'll pass it on to her.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — message for you
      fc("p1", "There's a message ___ you from the school.", ["for", "at", "with"]),
      sit("p1", "Your colleague comes back to the office. While she was out, her manager called and left some information. What do you say first?", [
        "There's a message for you from your manager.",
        "There's a message for your from your manager.",
        "There's a message for you of your manager.",
      ]),
      lc("p1", "I have a message for you from Lisa.", ["I have a present for you from Lisa.", "I sent a message to Lisa."]),
      // p2 — she said to tell
      fc("p2", "Your mum called. She said to ___ you she'll be home late.", ["tell", "telling", "told"]),
      arr("p2", "He said to tell you he's sorry.", ["telling"]),
      chat("p2", ["Did Mark say anything before he left?", null], [
        "Yes, he said to tell you the keys are on the desk.",
        "Yes, he said to telling you the keys are on the desk.",
        "Yes, he said tell to you the keys are on the desk.",
      ]),
      // p3 — I'll pass it on
      fc("p3", "Thanks, I'll pass it ___ to her.", ["on", "in", "at"]),
      chat("p3", ["Can you tell Sara the meeting is at ten?", null], [
        "Sure, I'll pass it on.",
        "Sure, I'll pass on it.",
        "Sure, I'll passing it on.",
      ]),
      spk("p3", "Don't worry, I'll pass it on."),
      // mix
      sit("mix", "Your flatmate Emma comes home. Earlier, her sister called and said: 'Tell Emma I'm coming on Sunday.' What do you say to Emma?", [
        "There's a message for you. Your sister said to tell you she's coming on Sunday.",
        "There's a message for you. Your sister said to tell you I'm coming on Sunday.",
        "There's a message for you. Your sister said tell to you she's coming on Sunday.",
      ]),
      spk("mix", "There's a message for you: she said to tell you she's here."),
    ],
    success: "The learner uses at least two of the target phrases correctly to relay a message.",
    quiz: [
      qmcq("Which phrase promises to deliver a message to someone?", [
        "I'll pass it on.",
        "She said to tell.",
        "Message for you.",
      ], 0),
      qfill("If Anna wants you to tell Tom something, you say: 'Anna ___ you she will call later.'", ["said to tell"]),
      qmcq("You answer the phone for your boss. What do you say to your boss when she returns?", [
        "There is a message for you.",
        "I will call them back.",
        "She said she is busy.",
      ], 0),
    ],
    scenes: [
      sc("Sophie", "Neighbour", "to check if you have a message from her husband",
        "You meet your neighbour Sophie in the hallway after her husband asked you to give her a message.",
        "Pass on a message from her husband using the target phrases.",
        "Hi, I heard you spoke to my husband earlier. Did he leave a message for me?", "friendly"),
      sc("David", "Colleague", "to find out if his manager left any instructions",
        "David returns to the office after a meeting, and you need to pass on a message from your manager.",
        "Relay your manager's message to David using the target phrases.",
        "Hey, I just got back. Did our manager say anything I should know?", "busy"),
      sc("Linda", "Hotel receptionist", "to find out if a guest received a message from her colleague",
        "You are at the hotel reception and Linda asks if you have a message for her from her colleague.",
        "Pass on a message from her colleague using the target phrases.",
        "Hello, my colleague said she might leave a message for me. Did she tell you anything?", "curious"),
      sc("Tom", "Classmate", "to see if the teacher left any instructions",
        "Tom comes to class late and wants to know if the teacher left a message for him.",
        "Pass on the teacher's message using the target phrases.",
        "Hi, sorry I'm late! Did the teacher leave any message for me?", "friendly"),
      sc("Ms. Carter", "Examiner", "to see how you relay a message in English",
        "Ms. Carter interviews you for a speaking exam and asks you to pass on a message.",
        "Demonstrate how to relay a message using the target phrases.",
        "Imagine your friend is out and someone leaves a message for them. What would you say?", "curious"),
    ],
  },
  {
    id: "b1-what-did-they-tell-you",
    topic: "retelling a whole conversation you were part of",
    objectives: [
      "Retell a conversation they participated in using reported speech.",
      "Compare different versions of the same conversation.",
      "Use phrases to introduce what others said or claimed.",
    ],
    goal: "The learner can explain what was said in a meeting or conversation, including different points of view.",
    target: "Phrases for retelling a conversation: 'they told me that', 'apparently she', 'that's not what I heard'.",
    correction: "Model the correct phrase and prompt the learner to repeat it using the target structure.",
    summary: "You learned how to retell a conversation you were part of. You practised using phrases to share and compare what people said.",
    minutes: 7,
    points: [
      {
        form: "they told me that",
        claims: [
          "Use 'they told me that' to introduce what someone said to you.",
          "This phrase helps report information you heard directly.",
          "It is often used to explain what you learned from others.",
        ],
        ex: [
          "They told me that the meeting was at 2 PM.",
          "They told me that we need to finish the project by Friday.",
        ],
      },
      {
        form: "apparently she",
        claims: [
          "Use 'apparently she' to introduce information you heard but are not completely sure about.",
          "This phrase shows you are reporting what you heard, not what you know for certain.",
        ],
        ex: [
          "Apparently she is moving to another city.",
          "Apparently she did not get the email.",
        ],
      },
      {
        form: "that's not what I heard",
        claims: [
          "Use 'that's not what I heard' to show that you heard something different from someone else.",
          "This phrase helps you compare two versions of the same conversation.",
        ],
        ex: [
          "That's not what I heard. I heard the meeting is tomorrow.",
          "That's not what I heard. I heard she is staying.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — they told me that
      fc("p1", "They told me ___ the office was closed.", ["that", "to", "said"]),
      err("p1", "They said me that the shop was open.", "said", "told"),
      spk("p1", "They told me that the bus was late."),
      // p2 — apparently she
      fc("p2", "___ she is looking for a new job, but I'm not sure.", ["Apparently", "Apparent", "Appear"]),
      sit("p2", "You heard from friends that Kate is getting married, but she didn't tell you herself. What do you say?", [
        "Apparently she is getting married.",
        "Apparent she is getting married.",
        "Apparently she getting married.",
      ]),
      lc("p2", "Apparently she lives in Rome now.", ["Apparently she works in Rome now.", "I know she lives in Rome now."]),
      // p3 — that's not what I heard
      chat("p3", ["The party is on Saturday.", null], [
        "That's not what I heard. I heard it's on Sunday.",
        "That's not what I heared. I heard it's on Sunday.",
        "That's not what I heard. I heard it's on Saturday.",
      ]),
      fc("p3", "That's not ___ I heard. I heard she's staying.", ["what", "that", "which"]),
      la("p3", "That's not what I heard.", ["heared"]),
      // mix
      chat("mix", ["Apparently the shop closes at six.", null], [
        "That's not what I heard. They told me that it closes at eight.",
        "That's not what I heard. They told me that it closes at six.",
        "That's not what I heard. They said me that it closes at eight.",
      ]),
      sit("mix", "Your colleague says: 'They told me that Sue is leaving.' You heard something different: Sue is staying. What do you say?", [
        "That's not what I heard. Apparently she is staying.",
        "That's not what I heard. Apparently she staying.",
        "That's not what heard I. Apparently she is staying.",
      ]),
    ],
    success: "Learner uses all three target phrases correctly to retell and compare information from a conversation.",
    minUses: 3,
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase shows you are reporting what someone told you directly?", [
        "They told me that",
        "Apparently she",
        "That's not what I heard",
      ], 0),
      qfill("___ is going to join the team, but I am not sure.", ["Apparently she"]),
      qmcq("What do you say if you heard something different from someone else?", [
        "That's not what I heard",
        "They told me that",
        "Apparently she",
      ], 0),
      qfill("___ the meeting is cancelled, but John says it is still on.", ["They told me that"]),
    ],
    scenes: [
      sc("Sarah", "friend", "find out what really happened during a conversation with another friend",
        "You and your friend Sarah are chatting in a cafe about a conversation you both had with a mutual friend yesterday.",
        "Retell the conversation to Sarah, compare what each person said, and clarify misunderstandings using the target phrases.",
        "What did Mark and Anna tell you about the new plan yesterday?", "curious"),
      sc("James", "colleague", "quickly understand what was discussed in a team meeting he missed",
        "You are at work and James, your colleague, asks you to summarise yesterday's team meeting.",
        "Explain the main points from the meeting, mention others' opinions, and compare what you heard with what James has been told.",
        "Can you tell me what happened in the meeting yesterday?", "busy"),
      sc("Olga", "hotel receptionist", "clarify what was discussed with another guest about a booking issue",
        "At a hotel reception, Olga asks you to explain the conversation you had with her colleague about your room reservation.",
        "Retell the discussion about your booking, compare information, and clear up any confusion using the target phrases.",
        "Could you tell me what you talked about with my colleague earlier?", "friendly"),
      sc("Dr. Patel", "advisor", "understand what was discussed during a group project meeting",
        "After a group project meeting, Dr. Patel asks you to explain what was discussed, including any disagreements.",
        "Summarise the conversation, mention different viewpoints, and clarify any differences in what was said using the target phrases.",
        "Can you explain what was discussed in your group meeting?", "curious"),
      sc("Mr. White", "examiner", "assess your ability to retell a conversation and compare information",
        "You are in a speaking exam and Mr. White asks you to describe a conversation you were involved in, including different opinions.",
        "Retell the conversation, show you can compare different versions, and use the target phrases naturally.",
        "Can you tell me about a conversation you had where people had different opinions?", "friendly"),
    ],
  },
  {
    id: "b1-it-was-built-in-1900",
    topic: "past passive voice",
    objectives: [
      "Recognise and form past passive sentences.",
      "Describe past events without saying who did them.",
      "Use key passive phrases to talk about buildings and objects.",
    ],
    goal: "Describe the history of a place or object without focusing on who performed the actions.",
    target: "past passive forms like 'it was built', 'they were made', and 'was designed by'",
    correction: "Gently prompt the correct passive form if the learner uses an active sentence or omits 'was/were'.",
    summary: "You learned how to use the past passive voice to describe events without saying who did them.",
    minutes: 8,
    points: [
      {
        form: "was/were + past participle",
        claims: [
          "Use was or were plus the past participle to describe past events without saying who did them.",
          "Use was for singular subjects and were for plural subjects.",
          "The person who did the action can be left out or added with by.",
        ],
        ex: [
          "It was built in 1880.",
          "They were made by hand.",
        ],
      },
      {
        form: "was designed by",
        claims: [
          "Use was designed by to say who created something, if needed.",
          "The focus stays on the object, not the person.",
        ],
        ex: [
          "The building was designed by a famous architect.",
          "The windows were designed by an artist.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — was/were + past participle
      fc("p1", "The old church ___ in 1750.", ["was built", "were built", "built"]),
      err("p1", "The house was build in 1990.", "build", "built"),
      fc("p1", "These photos ___ in Paris.", ["were taken", "was taken", "took"]),
      la("p1", "Our school was opened in 1995.", ["opens"]),
      sit("p1", "You tell a visitor about an old hotel. You don't know who built it, but you know the year: 1850. What do you say?", [
        "The hotel was built in 1850.",
        "The hotel were built in 1850.",
        "The hotel was build in 1850.",
      ]),
      // p2 — was designed by
      fc("p2", "The park was designed ___ a young architect.", ["by", "of", "at"]),
      chat("p2", ["Your garden is beautiful. Who created it?", null], [
        "It was designed by my grandmother.",
        "It designed by my grandmother.",
        "It was designed of my grandmother.",
      ]),
      lc("p2", "The logo was designed by a student.", ["The logo was changed by a student.", "A student wants a new logo."]),
      spk("p2", "The stadium was designed by a famous architect."),
      // mix
      sit("mix", "You tell a tourist about an old theatre. You know the year it was built (1900) and the person who designed it (Anna Berg). What do you say?", [
        "It was built in 1900 and was designed by Anna Berg.",
        "It was built in 1900 and was designed of Anna Berg.",
        "It built in 1900 and was designed by Anna Berg.",
      ]),
      fc("mix", "The first phones ___ by a small team.", ["were designed", "was designed", "designed"]),
    ],
    success: "The learner uses at least two correct past passive sentences describing objects or buildings.",
    quiz: [
      qmcq("The bridge ___ in 1920.", [
        "was built",
        "were built",
        "built",
      ], 0),
      qmcq("The paintings ___ by local artists.", [
        "was made",
        "were made",
        "are made",
      ], 1),
      qfill("The museum ___ by a famous designer.", ["was designed"]),
      qfill("These chairs ___ a long time ago.", ["were made"]),
    ],
    scenes: [
      sc("Sarah", "neighbour", "to learn more about the old house next door",
        "You are standing in front of an old house with your neighbour Sarah.",
        "Explain the history of the house using the target phrases.",
        "You know a lot about our street. When was the old house next door built?", "curious"),
      sc("Mr. Carter", "office manager", "to introduce the company building to a new employee",
        "You are giving a tour of the company building to your new manager.",
        "Describe the building and some items in it using the target phrases.",
        "This place has a lot of history. Can you tell me who designed it?", "friendly"),
      sc("Lucas", "tourist", "to learn about the historical site you are visiting together",
        "You are showing a tourist around a famous old castle.",
        "Describe the castle and some objects inside using the target phrases.",
        "We're standing in front of the old castle now. What do you know about its history?", "curious"),
      sc("Professor Miller", "history professor", "to hear your explanation about a historical building for a class project",
        "You are presenting information about a historical building to your professor.",
        "Describe the building and related objects using the target phrases.",
        "I'm interested in your project. Who was the building designed by, and when was it built?", "friendly"),
      sc("Ms. Green", "examiner", "to assess your ability to describe past events using passive voice",
        "You are in a speaking exam and the examiner asks about a historical building.",
        "Describe the building and some objects in it using the target phrases.",
        "Please describe a famous building from your country. When was it built?", "curious"),
    ],
  },
  {
    id: "b1-english-is-spoken-here",
    topic: "present simple passive for habits and facts",
    objectives: [
      "Recognise and form present simple passive sentences for habits and facts.",
      "Use present simple passive to describe general truths or routines without naming who does the action.",
    ],
    goal: "Describe how things are done or what is true in your area without saying who does it.",
    target: "present simple passive forms like 'is spoken', 'are sold', 'it's known as'",
    correction: "Model the correct passive form and prompt the learner to repeat.",
    summary: "You learned how to use the present simple passive to describe habits and facts without saying who does the action. You practised using phrases like 'is spoken', 'are sold', and 'it's known as'.",
    minutes: 8,
    points: [
      {
        form: "is/are + past participle",
        claims: [
          "Use the present simple passive to talk about habits and facts when the doer is not important or not known.",
          "Form the present simple passive with am/is/are + past participle.",
          "Use 'is' for singular, 'are' for plural subjects.",
        ],
        ex: [
          "English is spoken in many countries.",
          "Fresh vegetables are sold at the market.",
        ],
      },
      {
        form: "it's known as",
        claims: [
          "'It's known as' is a common way to introduce what something is called.",
          "Compare: 'known as' + a name, 'known for' + the reason it is famous: 'The city is known for its food.'",
          "Use 'it's known as' to give a name or title for something.",
        ],
        ex: [
          "This area is famous for a festival. It's known as the Spring Parade.",
          "The dish is popular. It's known as hotpot.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — am/is/are + past participle
      fc("p1", "Coffee ___ in many parts of Brazil.", ["is grown", "are grown", "is grow"]),
      err("p1", "Rice is eat in many countries.", "eat", "eaten"),
      fc("p1", "Cars ___ in this factory.", ["are made", "is made", "make"]),
      la("p1", "Tickets are sold online.", ["sell"]),
      sit("p1", "A visitor asks about the market in your town. People sell fish there every morning. What do you say?", [
        "Fish is sold there every morning.",
        "Fish is sell there every morning.",
        "Fish sold there every morning.",
      ]),
      // p2 — it's known as
      fc("p2", "This big park is in the city centre. It's known ___ Central Park.", ["as", "by", "at"]),
      chat("p2", ["What do people call the old market in your town?", null], [
        "It's known as the Blue Market.",
        "It's know as the Blue Market.",
        "It's known like the Blue Market.",
      ]),
      lc("p2", "It's known as the Old Bridge.", ["It's known for the Old Bridge.", "It's near the Old Bridge."]),
      spk("p2", "It's known as the old town."),
      // mix
      sit("mix", "A tourist asks about the main square in your city. Concerts are held there every summer, and people call it 'the Heart'. What do you say?", [
        "Concerts are held there every summer. It's known as the Heart.",
        "Concerts are hold there every summer. It's known as the Heart.",
        "Concerts are held there every summer. It's known for the Heart.",
      ]),
      lc("mix", "Tea is grown here. It's known as green gold.", ["Tea is grown here. It's known for its gold.", "Tea grows here. It's called green gold."]),
    ],
    success: "Learner uses at least two correct present simple passive forms from the list in context.",
    quiz: [
      qmcq("Which sentence uses the present simple passive?", [
        "Apples are sold here.",
        "People sell apples here.",
        "They are selling apples here.",
      ], 0),
      qfill("This city ___ for its music festival.", ["is known"]),
      qmcq("Choose the correct passive form: English ___ in this country.", [
        "is spoken",
        "speaks",
        "is speaking",
      ], 0),
      qfill("Fresh vegetables ___ at the market every day.", ["are sold"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to learn about local customs and habits",
        "You are chatting with your neighbour Sophie in the shared garden.",
        "Explain local habits and facts using the target phrases.",
        "I’ve just moved here and I’m curious—can you tell me how things are usually done around here?", "curious"),
      sc("David", "new colleague", "to understand how things work in the office",
        "You are having coffee with David in the office break room.",
        "Describe office routines and facts using the target phrases.",
        "I’m still learning how things work in this office. Can you explain some of the usual practices?", "friendly"),
      sc("Linda", "hotel receptionist", "to help guests understand local customs",
        "You are checking in at a hotel and chatting with the receptionist.",
        "Describe local customs and facts using the target phrases.",
        "Welcome! Many guests ask about local habits—could you tell me how things are usually done here?", "busy"),
      sc("Mr. Brown", "teacher", "to learn about students' home cultures",
        "You are in class and Mr. Brown is asking about your country.",
        "Explain how things work in your area using the target phrases.",
        "I’m interested in your culture. Can you describe some habits or facts from your country?", "curious"),
      sc("Ms. Carter", "examiner", "to assess your ability to describe habits and facts",
        "You are in a speaking exam and Ms. Carter is asking about your area.",
        "Use the target phrases to explain how things are done where you live.",
        "Can you tell me how things are usually done in your area?", "busy"),
    ],
  },
  {
    id: "b1-it-has-been-repaired",
    topic: "recent passive results (present perfect passive)",
    objectives: [
      "Describe recent results without saying who did the action.",
      "Use present perfect passive forms like 'it has been' and 'they have been'.",
    ],
    goal: "The learner can report that a problem is solved without saying who fixed it.",
    target: "present perfect passive forms: 'it has been', 'they have been', 'has already been done'",
    correction: "Prompt the learner to use the correct passive form and check for correct word order.",
    summary: "You learned how to report recent results using the present perfect passive.",
    minutes: 8,
    points: [
      {
        form: "it has been",
        claims: [
          "Use 'it has been' + past participle to talk about a result now (the thing is done), without saying who did it.",
          "This is the present perfect passive form.",
        ],
        ex: [
          "It has been repaired.",
          "It has been decided.",
        ],
      },
      {
        form: "they have been",
        claims: [
          "Use 'they have been' + past participle for plural results when you do not say who did the action.",
          "This form is also present perfect passive.",
          "'They've been' is the short form of 'they have been'.",
        ],
        ex: [
          "They have been fixed.",
          "They have been sent.",
          "They've been cleaned.",
        ],
      },
      {
        form: "has already been done",
        claims: [
          "Use 'has already been done' to show something is finished now and you do not say who did it.",
          "The word 'already' goes between 'has' and 'been'.",
        ],
        ex: [
          "It has already been done.",
          "The work has already been finished.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it has been + past participle
      fc("p1", "Good news: the heating ___ fixed.", ["has been", "have been", "has be"]),
      err("p1", "The window has been repair.", "repair", "repaired"),
      la("p1", "It has been painted.", ["paint"]),
      sit("p1", "Your neighbour asks about the broken door. Someone fixed it this morning, but you don't know who. What do you say?", [
        "It has been fixed.",
        "It has fixed.",
        "It have been fixed.",
      ]),
      // p2 — they have been / they've been
      fc("p2", "All the tickets ___ sold.", ["have been", "has been", "have be"]),
      chat("p2", ["Are the new chairs here?", null], [
        "Yes, they've been delivered.",
        "Yes, they've been deliver.",
        "Yes, they's been delivered.",
      ]),
      lc("p2", "They've been cleaned.", ["They need cleaning.", "They've been sold."]),
      // p3 — has already been done
      fc("p3", "The room has ___ been cleaned.", ["already", "yet", "ever"]),
      la("p3", "The report has already been sent.", ["send"]),
      sit("p3", "Your boss asks you to book the hotel. Someone booked it an hour ago. What do you say?", [
        "It has already been booked.",
        "It has already booked.",
        "It already has been book.",
      ]),
      // mix
      chat("mix", ["Is everything ready for the party?", null], [
        "Yes, the food has already been made and the chairs have been moved.",
        "Yes, the food has already been made and the chairs has been moved.",
        "Yes, the food has already made and the chairs have been moved.",
      ]),
      spk("mix", "The bills have already been paid."),
    ],
    success: "Learner uses at least two correct present perfect passive phrases to describe recent results without naming who did the action.",
    quiz: [
      qmcq("Which sentence uses the present perfect passive to report a recent result?", [
        "It has been repaired.",
        "Someone repaired it.",
        "They repair it.",
      ], 0),
      qfill("The emails ___ sent.", ["have been","have already been"]),
      qmcq("Choose the correct way to say a task is finished, without naming who did it.", [
        "It has already been done.",
        "I already did it.",
        "They did it already.",
      ], 0),
    ],
    scenes: [
      sc("Linda", "neighbour", "to find out if the elevator problem in the building is finally sorted",
        "You meet your neighbour Linda in the apartment hallway after weeks of elevator troubles.",
        "Tell Linda that the elevator issue has been fixed using the target phrases.",
        "Hi, have you heard anything about the elevator? Is it finally working?", "friendly"),
      sc("Paul", "team leader", "to check if the technical issues with the project have been sorted out",
        "You are in the office and your team leader Paul wants an update on the technical problems that delayed your project.",
        "Report to Paul that the technical issues have been fixed, using the target phrases.",
        "Do you have any updates about the technical problems with our project?", "busy"),
      sc("Sophie", "hotel receptionist", "to make sure your room concerns have been addressed",
        "You are at the hotel front desk after complaining about the air conditioning and Wi-Fi in your room.",
        "Tell Sophie that the problems in your room have been dealt with, using the target phrases.",
        "Has everything in your room been fixed now?", "curious"),
      sc("Dr. Patel", "course advisor", "to confirm that the timetable errors have been corrected",
        "You are meeting your course advisor after students reported timetable mistakes.",
        "Inform Dr. Patel that the timetable issues have been fixed, using the target phrases.",
        "Have the timetable problems been sorted yet?", "friendly"),
      sc("Mr. Clark", "examiner", "to see if you can report about a problem being solved",
        "You are in a speaking exam and the examiner asks about a recent problem at your school.",
        "Explain to Mr. Clark that the problem has been fixed, using the target phrases.",
        "Can you tell me about a problem at your school that has been solved recently?", "curious"),
    ],
  },
  {
    id: "b1-who-was-it-made-by",
    topic: "asking who did it and naming the doer (passive questions)",
    objectives: [
      "Ask who did an action using passive questions.",
      "Use phrases like 'made by' and 'was it done by' to name the doer.",
      "Answer questions about the doer of an action.",
    ],
    goal: "Ask and answer questions about who did something, especially when the doer is important.",
    target: "who was it, made by, was it done by",
    correction: "Model the correct passive question or phrase, focusing on word order and correct use of 'by'.",
    summary: "You learned how to ask who did something using passive questions. It also showed how to name the doer with 'made by' and 'was it done by'.",
    minutes: 8,
    intents: {
      readiness: "greet, name today's topic of asking who did something, ask if ready",
      teach: "announce the explanation of asking and naming the doer",
    },
    points: [
      {
        form: "Who was it made by?",
        claims: [
          "To ask who did something when you see the result, use a passive question: Who was it made by?",
          "The thing is the subject; 'by' at the end asks about the person who did it.",
        ],
        ex: [
          "Who was it made by?",
          "Who was this cake made by?",
        ],
      },
      {
        form: "made by",
        claims: [
          "Use 'made by' to say who did or created something.",
          "'By' introduces the person or group who did the action.",
        ],
        ex: [
          "This cake was made by my friend.",
          "The painting was made by a famous artist.",
        ],
      },
      {
        form: "was it done by",
        claims: [
          "Use 'Was it done by' to ask if a specific person did the action.",
          "This is a passive question about the doer.",
        ],
        ex: [
          "Was it done by your team?",
          "Was it done by someone else?",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — Who was it made by?
      fc("p1", "Who ___ this cake made by?", ["was", "did", "were"]),
      arr("p1", "Who was this photo taken by?", ["did"]),
      sit("p1", "Your friend has a nice drawing on her wall, and you want to know the artist. What do you ask?", [
        "Who was it drawn by?",
        "Who did it drawn by?",
        "Who was it draw by?",
      ]),
      // p2 — made by
      fc("p2", "This bag was made ___ my sister.", ["by", "of", "at"]),
      lc("p2", "The table was made by my grandfather.", ["The table was moved by my grandfather.", "My grandfather wants a table."]),
      spk("p2", "This shirt was made by a local company."),
      // p3 — was it done by
      chat("p3", ["The report is finished, and it looks great.", null], [
        "Was it done by Maria?",
        "Was it did by Maria?",
        "Did it done by Maria?",
      ]),
      fc("p3", "The cleaning is finished. Was it ___ by the new staff?", ["done", "did", "do"]),
      err("p3", "Was it do by the students?", "do", "done"),
      // mix
      chat("mix", ["Someone painted the kitchen while we were away.", null], [
        "Really? Who was it done by?",
        "Really? Who did it done by?",
        "Really? Who was it did by?",
      ]),
      sit("mix", "A colleague says the new website was made by a company in Berlin. You want to know if the same company did the app. What do you ask?", [
        "Was it done by the same company?",
        "Was it made from the same company?",
        "Did it done by the same company?",
      ]),
    ],
    success: "The learner correctly asks who did something and names the doer using the target phrases.",
    quiz: [
      qfill("This chair was ___ my uncle.", ["made by"]),
      qmcq("Which question asks about the person who did the action?", [
        "Who was the car fixed by?",
        "Where was the car fixed?",
        "When was the car fixed?",
      ], 0),
      qmcq("You want to know if your friend painted the picture. What can you ask?", [
        "Was it done by you?",
        "Is it your picture?",
        "Do you like painting?",
      ], 0),
      qfill("Who was this book written ___?", ["by"]),
    ],
    scenes: [
      sc("Lucy", "flatmate", "find out who made a delicious cake in the kitchen",
        "In the shared apartment kitchen, a fresh cake is sitting on the counter.",
        "Ask who made the cake and say who did it, using the target phrases.",
        "Someone made a cake for us and left it in the kitchen. I know who. What do you want to ask me?", "curious"),
      sc("David", "team leader", "find out who completed an important report",
        "During a morning meeting in the office, a finished report is on the table.",
        "Ask who did the report and name the person, using the target phrases.",
        "Someone finished the report for me, but there is no name on it. What would you ask the team?", "busy"),
      sc("Sophie", "hotel receptionist", "explain where a welcome gift in the room came from",
        "At a hotel reception, the guest asks about a fruit basket in their room.",
        "Ask who put the basket there and explain who did it, using the target phrases.",
        "Someone at the hotel left a fruit basket in your room as a surprise. I know who. What do you want to ask me?", "friendly"),
      sc("Mr. Carter", "chemistry teacher", "find out who created a poster for the science fair",
        "In the school hallway, a colourful poster is displayed for the science fair.",
        "Ask who made the poster and say who did it, using the target phrases.",
        "The science fair poster won a prize, and I know who created it. What do you want to ask me?", "curious"),
      sc("Ms. Green", "examiner", "test your ability to ask and answer about who did something",
        "In a speaking exam room, the examiner talks about a handmade wooden box she has at home.",
        "Ask who made the object and say who did it, using the target phrases.",
        "I have a handmade wooden box at home, and I know who made it. What would you like to ask me about it?", "friendly"),
    ],
  },
  {
    id: "b1-reporting-an-incident",
    topic: "describing what happened when you cannot say who was responsible",
    objectives: [
      "Describe an event without naming who did it.",
      "Use set phrases to report incidents in a neutral way.",
    ],
    goal: "Report an incident without saying who caused it, using neutral language.",
    target: "something was taken, it appears that, no one was hurt",
    correction: "Prompt the learner to use the target phrases instead of active or personal forms.",
    summary: "You learned how to describe events when the person responsible is unknown or unimportant.",
    minutes: 7,
    points: [
      {
        form: "something was taken",
        claims: [
          "Use 'something was taken' to report that an item is missing when you do not know who took it.",
          "This phrase uses the passive voice to avoid naming the person responsible.",
        ],
        ex: [
          "Something was taken from the storage room.",
          "We noticed that something was taken during the night.",
        ],
      },
      {
        form: "it appears that",
        claims: [
          "Use 'it appears that' to describe what you think happened, based on evidence.",
          "This phrase shows you are not completely sure and avoids blaming anyone.",
        ],
        ex: [
          "It appears that the window was broken.",
          "It appears that someone entered through the back door.",
        ],
      },
      {
        form: "no one was hurt",
        claims: [
          "Use 'no one was hurt' to say that everybody is safe after an incident.",
          "This phrase focuses on the result, not on who did something.",
        ],
        ex: [
          "No one was hurt in the accident.",
          "Luckily, no one was hurt when the glass broke.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — something was taken
      fc("p1", "Something ___ taken from my car last night.", ["was", "were", "has"]),
      sit("p1", "You come back to your hotel room and your watch is missing. You don't know who took it. What do you tell reception?", [
        "Something was taken from my room.",
        "Something was took from my room.",
        "Something taken from my room.",
      ]),
      la("p1", "I think something was taken from the office.", ["take"]),
      // p2 — it appears that
      fc("p2", "It ___ that the door was left open.", ["appears", "appear", "appearing"]),
      chat("p2", ["Why is there water on the floor?", null], [
        "It appears that a pipe is broken.",
        "It appear that a pipe is broken.",
        "It appears what a pipe is broken.",
      ]),
      spk("p2", "It appears that the window was open."),
      // p3 — no one was hurt
      fc("p3", "It was a big fire, but luckily no one ___ hurt.", ["was", "were", "did"]),
      err("p3", "Don't worry, no one was hurted.", "hurted", "hurt"),
      lc("p3", "No one was hurt in the fire.", ["No one was home during the fire.", "Someone was hurt in the fire."]),
      // mix
      sit("mix", "You report a break-in at work. A laptop is missing, the back door is open (so maybe the thief came in that way), and everyone is safe. What do you say?", [
        "A laptop was taken. It appears that someone came in through the back door. No one was hurt.",
        "A laptop was took. It appears that someone came in through the back door. No one was hurt.",
        "A laptop was taken. It appears that someone came in through the back door. No one were hurt.",
      ]),
      chat("mix", ["Was anyone hurt? And is anything missing?", null], [
        "No one was hurt, but something was taken from the safe.",
        "No one was hurt, but something was taking from the safe.",
        "No one were hurt, but something was taken from the safe.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases to describe an incident without naming who was responsible.",
    quiz: [
      qmcq("Which phrase reports that an item is missing without saying who took it?", [
        "Something was taken.",
        "I took something.",
        "Who took it?",
      ], 0),
      qfill("___ the lights were left on overnight.", ["It appears that"]),
      qmcq("How do you say everyone is safe after an incident?", [
        "No one was hurt.",
        "Someone was hurt.",
        "It appears that someone was hurt.",
      ], 0),
    ],
    scenes: [
      sc("Sophie", "apartment building manager", "to find out what happened in the hallway",
        "You are in the lobby of your apartment building, speaking to the building manager about an incident.",
        "Report an incident in the hallway using neutral language and the target phrases.",
        "Hi, I heard there was a problem on your floor. Can you tell me what happened?", "curious"),
      sc("Mr. Carter", "office facilities supervisor", "to get details about an incident in the office",
        "You are at work, speaking to the facilities supervisor about something that happened in the staff kitchen.",
        "Describe the incident in the kitchen using neutral language and the target phrases.",
        "I heard something happened in the kitchen this morning. What can you tell me?", "busy"),
      sc("Linda", "hotel front desk manager", "to understand what happened in a guest area",
        "You are at a hotel, talking to the front desk manager about an incident in the lounge.",
        "Report what happened in the hotel lounge using neutral language and the target phrases.",
        "I understand there was an issue in the lounge. Could you explain what happened?", "friendly"),
      sc("Dr. Patel", "university building coordinator", "to find out about a problem in a study room",
        "You are at your university, speaking to the building coordinator about an incident in a study room.",
        "Describe what happened in the study room using neutral language and the target phrases.",
        "I heard something happened in one of the study rooms. Can you tell me what you saw?", "curious"),
      sc("Mr. Bennett", "speaking examiner", "to assess your ability to describe an incident",
        "You are in a speaking exam, and the examiner asks you to describe an incident in a building.",
        "Use neutral language and the target phrases to describe what happened.",
        "Please describe an incident in a building where you do not know who was responsible. What happened?", "friendly"),
    ],
  },
  {
    id: "b1-how-its-made",
    topic: "explaining a process step by step",
    objectives: [
      "Clearly describe a simple process in logical steps.",
      "Use linking phrases like 'first it's', 'then it gets', and 'after that it's' to explain a sequence.",
    ],
    goal: "The learner can explain a basic process from their work or daily life to someone unfamiliar with it.",
    target: "Use of step-by-step linking phrases: 'first it's', 'then it gets', 'after that it's'.",
    correction: "Prompt the learner to use all three linking phrases in order and ensure steps are clear.",
    summary: "You learned how to explain a process step by step using clear linking phrases.",
    minutes: 7,
    points: [
      {
        form: "first it's",
        claims: [
          "Use 'first it's' to start explaining the first step of a process.",
          "This phrase helps your listener know where the process begins.",
        ],
        ex: [
          "First it's just a piece of paper.",
          "First it's cold water.",
        ],
      },
      {
        form: "then it gets",
        claims: [
          "Use 'then it gets' to describe what happens in the next step.",
          "This phrase shows a change or development in the process.",
        ],
        ex: [
          "Then it gets folded in half.",
          "Then it gets heated.",
        ],
      },
      {
        form: "after that it's",
        claims: [
          "Use 'after that it's' to explain the result or next stage after the previous step.",
          "This phrase helps finish the explanation or move to the last step.",
        ],
        ex: [
          "After that it's ready to use.",
          "After that it's a finished product.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — first it's
      fc("p1", "First ___ just some clay.", ["it's", "it", "its"]),
      sit("p1", "You start to explain how bread is made. At the beginning, there is only flour, water and salt. What do you say?", [
        "First it's just flour, water and salt.",
        "First its just flour, water and salt.",
        "First it just flour, water and salt.",
      ]),
      spk("p1", "First it's just a piece of wood."),
      // p2 — then it gets
      fc("p2", "Then it ___ painted blue.", ["gets", "get", "getting"]),
      err("p2", "Then it gets cutted into two parts.", "cutted", "cut"),
      lc("p2", "Then it gets washed and dried.", ["Then it gets painted and dried.", "Then you wash it and dry it."]),
      // p3 — after that it's
      chat("p3", ["So the cake is in the oven. What happens next?", null], [
        "After that it's ready to eat.",
        "After that its ready to eat.",
        "After that it ready to eat.",
      ]),
      la("p3", "After that it's ready to sell.", ["its"]),
      sit("p3", "You explain how a table is made. The last step is done, and people can start using it. What do you say?", [
        "After that it's ready to use.",
        "After that it's ready to using.",
        "After that it ready to use.",
      ]),
      // mix
      sit("mix", "You explain how paper is recycled: at the start it's old paper, next someone cleans it, and at the end it's new paper. What do you say?", [
        "First it's old paper, then it gets cleaned, and after that it's new paper.",
        "First it's old paper, then it gets cleaning, and after that it's new paper.",
        "First it's old paper, then it get cleaned, and after that its new paper.",
      ]),
      la("mix", "First it's milk, then it gets heated.", ["get"]),
    ],
    success: "The learner uses all three linking phrases in the correct order to explain a process.",
    minUses: 1,
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase do you use to start explaining a process?", [
        "First it's",
        "Then it gets",
        "After that it's",
      ], 0),
      qfill("First it's a raw material, ___ shaped, after that it's a finished part.", ["then it gets"]),
      qmcq("What comes after 'then it gets' when explaining steps?", [
        "First it's",
        "After that it's",
        "Then it gets",
      ], 1),
      qfill("First it's an idea, then it gets discussed, ___ a project.", ["after that it's"]),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to understand how you make your favourite dish",
        "You are chatting with your neighbour in the garden and she asks about how you cook your favourite meal.",
        "Explain the cooking process step by step to someone who has never made it before.",
        "What's your favourite dish? How do you make it, step by step?", "curious"),
      sc("David", "new colleague", "to learn how your daily work process goes",
        "A new colleague at the office asks you to explain how you handle a typical task at work.",
        "Explain your main work process step by step to a colleague from another department.",
        "I'm new here. How do you do your main task at work, step by step?", "curious"),
      sc("Maria", "hotel receptionist", "to learn how guests use the laundry service",
        "A hotel receptionist abroad asks you to explain how the laundry machine works, as she is not familiar with it.",
        "Explain the laundry process step by step to someone who has never used the machine before.",
        "I don't know our new laundry machine well. How does it work, step by step?", "friendly"),
      sc("Tom", "classmate", "to understand how to use the library printer",
        "A classmate asks you to explain how to print a document in the university library.",
        "Explain the printing process step by step to a student who hasn't done it before.",
        "I have never printed anything here before. How does the printer work, step by step?", "curious"),
      sc("Ms. Carter", "examiner", "to assess your ability to explain a process",
        "You are in a speaking exam and the examiner asks you to explain a simple process you know well.",
        "Explain a basic process step by step to show your speaking skills.",
        "Can you explain a simple process you know, step by step?", "friendly"),
    ],
  },
];
