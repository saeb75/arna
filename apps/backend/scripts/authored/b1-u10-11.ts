/** B1 · Ünite 10-11 — dışa aktarılmış çekirdekten (export-authored.ts); tek doğruluk kaynağı bu dosya. */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sit, spk, sc, type Authored } from "./dsl.js";

export const B1_U10_11: Authored[] = [
  {
    id: "b1-i-enjoy-reading-i-want-to-read",
    topic: "verbs followed by -ing or to",
    objectives: [
      "Recognise which common verbs are followed by -ing or to.",
      "Produce sentences using 'I enjoy', 'I want to', and 'I'd rather' with the correct verb form.",
    ],
    goal: "Describe your likes, preferences, and plans using the correct verb forms after common verbs.",
    target: "'I enjoy' + verb-ing, 'I want to' + base verb, 'I'd rather' + base verb",
    correction: "Prompt the learner to use the correct form (-ing or to + base verb) after each verb.",
    summary: "You learned which verbs are followed by -ing and which by to. You practised using 'I enjoy', 'I want to', and 'I'd rather' in sentences.",
    minutes: 8,
    points: [
      {
        form: "'enjoy' + verb-ing",
        claims: [
          "Use the -ing form after 'enjoy'.",
          "Do not use 'to' + verb after 'enjoy': say 'I enjoy reading', not 'I enjoy to read'.",
        ],
        ex: [
          "I enjoy reading books.",
          "She enjoys playing tennis.",
        ],
      },
      {
        form: "'want to' + base verb",
        claims: [
          "Use 'to' + base verb after 'want'.",
          "Do not use the -ing form after 'want': say 'I want to travel', not 'I want travelling'.",
        ],
        ex: [
          "I want to travel this year.",
          "They want to learn English.",
        ],
      },
      {
        form: "'would rather' + base verb",
        claims: [
          "Use the base verb (no 'to', no -ing) after 'would rather'.",
          "In speech, 'I would rather' is usually shortened to 'I'd rather'.",
        ],
        ex: [
          "I would rather stay home tonight.",
          "I'd rather walk to work.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — enjoy + -ing
      fc("p1", "I really enjoy ___ in the mountains.", ["walking", "to walk", "walk"]),
      arr("p1", "My brother enjoys cooking for his friends.", ["to"]),
      sit("p1", "You love reading in bed every night. What do you say?", [
        "I enjoy reading in bed.",
        "I enjoy to read in bed.",
        "I enjoy read in bed.",
      ]),
      spk("p1", "I enjoy reading before bed."),
      // p2 — want to + base verb
      fc("p2", "We want ___ a new car next year.", ["to buy", "buying", "buy"]),
      la("p2", "I want to learn to swim this summer.", ["learning"]),
      chat("p2", ["What are your plans for the holidays?", null], [
        "I want to visit my grandparents.",
        "I want visiting my grandparents.",
        "I want visit my grandparents.",
      ]),
      // p3 — would rather + base verb
      fc("p3", "I'd rather ___ at home tonight.", ["stay", "to stay", "staying"]),
      sit("p3", "Your friend asks: 'Do you want to take the bus or walk?' You prefer walking. What do you say?", [
        "I'd rather walk.",
        "I'd rather to walk.",
        "I'd rather walking.",
      ]),
      arr("p3", "We would rather take the train.", ["to"]),
      lc("p3", "I'd rather stay at home.", ["I'd like to stay at home.", "I'd rather go home."]),
      // karışık
      sit("mix", "You love dancing, and next year you plan to take dance classes. What do you say?", [
        "I enjoy dancing, so I want to take classes.",
        "I enjoy to dance, so I want to take classes.",
        "I enjoy dancing, so I want taking classes.",
      ]),
      spk("mix", "I enjoy cooking, but tonight I'd rather eat out."),
    ],
    success: "Learner uses each phrase with the correct verb form (-ing or to or base verb) at least once.",
    minUses: 3,
    quiz: [
      qmcq("Which is correct?", [
        "I enjoy to swim.",
        "I enjoy swimming.",
        "I enjoy swim.",
      ], 1),
      qfill("I want ___ (learn) Spanish.", ["to learn"]),
      qmcq("Choose the correct sentence.", [
        "I'd rather to eat at home.",
        "I'd rather eating at home.",
        "I'd rather eat at home.",
      ], 2),
      qfill("She enjoys ___ (dance) at parties.", ["dancing"]),
    ],
    scenes: [
      sc("Sophie", "friend", "find out what you like doing and your weekend plans",
        "You and your friend Sophie are chatting at a coffee shop about your hobbies and what you want to do this weekend.",
        "Describe your hobbies and say what you want to do this weekend using the target phrases.",
        "I enjoy swimming, and this weekend I want to try a new cafe. What do you enjoy doing, and what do you want to do this weekend?", "curious"),
      sc("Michael", "colleague", "learn about your work preferences and what tasks you'd like to do",
        "You are having a break with your colleague Michael, talking about work tasks and preferences.",
        "Talk about what tasks you enjoy and what you want to work on using the target phrases.",
        "Which tasks do you enjoy at work, and what do you want to learn next?", "friendly"),
      sc("Luca", "tour guide", "help you choose activities for your trip based on your likes",
        "You are speaking with Luca, a tour guide, who is helping you plan your activities for your holiday.",
        "Describe what activities you enjoy and what you want to do on your trip using the target phrases.",
        "This afternoon you can walk in the old town or take a boat tour. Which would you rather do, and why?", "friendly"),
      sc("Dr. Patel", "study advisor", "understand your study preferences and help you plan",
        "You are meeting your study advisor, Dr. Patel, to talk about your study preferences and future plans.",
        "Explain what subjects you enjoy and what you want to study next using the target phrases.",
        "Which subjects do you enjoy studying, and what do you want to study next year?", "curious"),
      sc("Mr. Green", "examiner", "assess your ability to talk about your likes and plans",
        "You are in a speaking exam with Mr. Green, who asks about your interests and future plans.",
        "Use the target phrases to talk about your likes and what you want to do.",
        "Imagine a free Saturday. You can stay at home or go out. Which would you rather do?", "friendly"),
    ],
  },
  {
    id: "b1-i-stopped-smoking-i-stopped-to-smoke",
    topic: "verbs with different meanings: -ing vs to",
    objectives: [
      "Recognise verbs whose meaning changes with -ing or to.",
      "Choose the correct form (-ing or to) to express the intended meaning with common verbs.",
    ],
    goal: "Explain clearly what you mean when you use verbs like stop, remember, or try with -ing or to.",
    target: "verbs like stop, remember, try with -ing or to",
    correction: "Prompt the learner to check if -ing or to gives the meaning they want; explain the difference if needed.",
    summary: "You learned how the meaning changes for some verbs when using -ing or to.",
    minutes: 8,
    points: [
      {
        form: "stop doing vs stop to do",
        claims: [
          "'Stop doing' means you end an action or a habit.",
          "'Stop to do' means you stop what you are doing so that you can do something else.",
        ],
        ex: [
          "I stopped smoking.",
          "I stopped doing yoga last year.",
          "I stopped to smoke.",
        ],
      },
      {
        form: "remember doing vs remember to do",
        claims: [
          "Remember doing means you recall a past event.",
          "Remember to do means you do not forget to do something.",
        ],
        ex: [
          "I remember meeting her last year.",
          "I remembered to call her.",
        ],
      },
      {
        form: "try doing vs try to do",
        claims: [
          "'Try doing' usually means you do something as a test, to see if it solves a problem.",
          "'Try to do' usually means you make an effort to do something difficult, often without success.",
          "The two forms can overlap; the context shows which meaning you want.",
        ],
        ex: [
          "I tried calling her, but she did not answer.",
          "I tried to call her, but I could not find my phone.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — stop doing / stop to do
      sit("p1", "You smoked for ten years. Last year you ended this habit. What do you say?", [
        "I stopped smoking last year.",
        "I stopped to smoke last year.",
        "I stopped smoke last year.",
      ]),
      fc("p1", "We were thirsty, so we stopped ___ some water at a shop.", ["to buy", "buying", "buy"]),
      spk("p1", "I stopped doing yoga last year."),
      lc("p1", "He stopped to talk to me.", ["He stopped talking to me.", "He wanted to talk to me."]),
      // p2 — remember doing / remember to do
      fc("p2", "I remember ___ my best friend on my first day at school.", ["meeting", "to meet", "meet"]),
      sit("p2", "Your mum asked you to buy bread. You did not forget, and you bought it. What do you say?", [
        "I remembered to buy bread.",
        "I remembered buying bread.",
        "I remembered buy bread.",
      ]),
      la("p2", "I remember meeting her at a party.", ["to"]),
      // p3 — try doing / try to do
      fc("p3", "My laptop was slow, so I tried ___ it, and that fixed it.", ["restarting", "restart", "restarted"]),
      spk("p3", "I tried calling him at home."),
      fc("p3", "The box was very heavy. I tried ___ it, but I couldn't.", ["to lift", "lift", "lifted"]),
      chat("p3", ["Did you sleep well?", "Not really. I couldn't sleep at all.", "Oh no. What did you do?", null], [
        "I tried reading a book, but it didn't help.",
        "I tried read a book, but it didn't help.",
        "I tried to reading a book, but it didn't help.",
      ]),
      // karışık
      sit("mix", "On the way home, you paused at a shop to buy bread. You also did not forget the milk. What do you say?", [
        "I stopped to buy bread, and I remembered to buy milk.",
        "I stopped buying bread, and I remembered to buy milk.",
        "I stopped to buy bread, and I remembered buying milk.",
      ]),
      la("mix", "We stopped to rest, and I tried calling you.", ["call"]),
    ],
    success: "Learner uses at least two of the target phrases correctly in context.",
    quiz: [
      qmcq("Which sentence means you ended an action?", [
        "I stopped to read.",
        "I stopped reading.",
        "I stopped to reading.",
      ], 1),
      qfill("I remember ___ him at the party.", ["meeting"]),
      qmcq("Which means you tried as an experiment?", [
        "I tried calling her.",
        "I tried to call her.",
        "I try call her.",
      ], 0),
      qmcq("Which sentence means you did not forget to do something?", [
        "I remember meeting her.",
        "I remembered to call her.",
        "I remember to meeting her.",
      ], 1),
    ],
    scenes: [
      sc("Lucy", "friend", "to understand what you meant about your plans yesterday",
        "You are chatting with your friend Lucy in a cafe after school.",
        "Explain a misunderstanding about what you said you stopped doing, remembered, or tried yesterday.",
        "You told me you stopped drinking coffee, but I saw you drinking coffee in a cafe this morning. What did you mean?", "curious"),
      sc("Martin", "colleague", "to clarify a task you discussed during a meeting",
        "You are talking with your colleague Martin in the office break room.",
        "Clear up confusion about what actions you stopped, remembered, or tried at work.",
        "The client says nobody called him yesterday. Did you try to reach him, and what happened?", "busy"),
      sc("Sophie", "hotel receptionist", "to help you with your hotel booking after a confusing phone call",
        "You are at the hotel front desk talking to Sophie about your reservation.",
        "Explain clearly what you meant about trying, stopping, or remembering something with your booking.",
        "My colleague says she checked you in when you stayed here last year. Do you remember her?", "friendly"),
      sc("Dr. Patel", "university advisor", "to understand your study habits after a confusing email",
        "You are meeting Dr. Patel in her office to discuss your study progress.",
        "Clarify what you meant about what you stopped, remembered, or tried in your studies.",
        "Last term you had problems sleeping before exams. What did you try to fix it?", "curious"),
      sc("Mr. Green", "examiner", "to check your understanding of English verb forms",
        "You are in a speaking exam room with Mr. Green.",
        "Explain the difference in meaning when you use stop, remember, or try with -ing or to.",
        "Tell me about a habit you gave up. What was it, and why?", "friendly"),
    ],
  },
  {
    id: "b1-look-up-look-after",
    topic: "two-word expressions with object position",
    objectives: [
      "Use common two-word expressions with the object in the correct place.",
      "Understand and follow instructions using these expressions.",
    ],
    goal: "Give and follow instructions using two-word expressions like look it up, look after, and pick them up.",
    target: "look it up, look after, pick them up (focus on object position)",
    correction: "Prompt the learner to move the object to the correct place or use the correct form.",
    summary: "You learned common two-word expressions and where to put the object. You practised using look it up, look after, and pick them up.",
    minutes: 8,
    points: [
      {
        form: "look it up",
        claims: [
          "Some two-word expressions use a verb and a short word (particle), like look up.",
          "When the object is a pronoun (like it), put it between the verb and the particle: look it up.",
          "When the object is a noun, it can go after the expression or in the middle: look up the word / look the word up.",
        ],
        ex: [
          "If you do not know the word, look it up.",
          "Look up the address online.",
        ],
      },
      {
        form: "look after",
        claims: [
          "Some two-word expressions do not separate; the object always goes after the particle.",
          "You cannot put the object between look and after.",
        ],
        ex: [
          "Can you look after the kids?",
          "She looks after her dog every day.",
        ],
      },
      {
        form: "pick them up",
        claims: [
          "For expressions like pick up, put pronoun objects (like them) between the verb and the particle: pick them up.",
          "With noun objects, both orders are possible: pick up the toys / pick the toys up.",
          "Never say: pick up them.",
        ],
        ex: [
          "Please pick them up from school.",
          "Pick up your shoes before dinner.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — look it up
      fc("p1", "I don't know this word. I'll look ___.", ["it up", "up it", "it"]),
      arr("p1", "Look it up in the dictionary.", ["looks"]),
      sit("p1", "Your friend asks what a word means. You don't know, but you have a dictionary app. What do you say?", [
        "Let's look it up.",
        "Let's look up it.",
        "Let's look it.",
      ]),
      // p2 — look after
      sit("p2", "You are going on holiday. You want your neighbour to water your plants and take care of them. What do you ask?", [
        "Can you look after my plants?",
        "Can you look my plants after?",
        "Can you look after of my plants?",
      ]),
      arr("p2", "My grandmother looks after the baby.", ["look"]),
      lc("p2", "She looks after her grandmother.", ["She looks like her grandmother.", "She lives with her grandmother."]),
      spk("p2", "Can you look after the kids tonight?"),
      // p3 — pick them up
      fc("p3", "Your toys are on the floor. Please pick ___.", ["them up", "up them", "them"]),
      err("p3", "Your shoes are on the floor. Pick it up, please.", "it", "them"),
      la("p3", "I pick them up from school at three.", ["picks"]),
      // karışık
      chat("mix", ["I'm going out for an hour. Can you help with the baby and the toys?", null], [
        "Sure, I'll look after him and pick them up.",
        "Sure, I'll look him after and pick them up.",
        "Sure, I'll look after him and pick up them.",
      ]),
      sit("mix", "Your friend wants to know when the museum opens, and she needs a lift from the station. What do you say?", [
        "I'll look it up, and then I'll pick you up.",
        "I'll look up it, and then I'll pick you up.",
        "I'll look it up, and then I'll pick up you.",
      ]),
    ],
    success: "The learner puts the object in the correct place for each phrase.",
    quiz: [
      qmcq("Which is correct?", [
        "Can you look after the cat?",
        "Can you look the cat after?",
        "Can you look after it up?",
      ], 0),
      qfill("If you do not know the word, ___ .", ["look it up"]),
      qmcq("Choose the correct sentence.", [
        "Please pick them up before dinner.",
        "Please pick up them before dinner.",
        "Please pick before dinner them up.",
      ], 0),
      qfill("She will ___ the children while we are away.", ["look after"]),
    ],
    scenes: [
      sc("Sophie", "older sister", "get help with chores and a question",
        "In the living room at home, Sophie is tidying up and needs your help.",
        "Help Sophie by giving and following instructions using the target phrases.",
        "I have to go out for an hour. The baby is asleep, and the toys are all over the floor. What can you do to help me?", "busy"),
      sc("Daniel", "office manager", "make sure tasks are done correctly",
        "In an office, Daniel is explaining some tasks to a new colleague.",
        "Give and follow instructions for office tasks using the target phrases.",
        "A client used a word in his email that I don't understand. What should I do?", "friendly"),
      sc("Linda", "hotel receptionist", "make sure the guest understands how things work",
        "At the hotel front desk, Linda is explaining hotel rules and services.",
        "Ask and answer questions using the target phrases to understand instructions.",
        "Your children are tired, but you want to go to dinner. Our hotel has a babysitter. What can she do for you?", "curious"),
      sc("Mr. Harris", "science teacher", "help students complete a classroom activity",
        "In a classroom, Mr. Harris gives group instructions for a science project.",
        "Give and follow instructions for the group activity using the target phrases.",
        "The students left their notebooks on the tables after class. What should they do with them?", "friendly"),
      sc("Ms. Brown", "examiner", "see how you give and follow instructions in English",
        "In a speaking exam room, Ms. Brown is asking you about following instructions at home.",
        "Demonstrate giving and following instructions using the target phrases.",
        "Imagine you are going on holiday for a week, and you have a cat. What do you ask your neighbour?", "curious"),
    ],
  },
  {
    id: "b1-saying-it-more-precisely",
    topic: "choosing a more exact word than the first one that comes to mind",
    objectives: [
      "Use phrases to clarify or correct their word choice.",
      "Make their meaning clearer when describing a problem.",
    ],
    goal: "The learner can clarify and make their description of a problem more precise when talking to someone who can fix it.",
    target: "more like, to be precise, what I mean is",
    correction: "Prompt the learner to use one of the target phrases to clarify or correct their statement.",
    summary: "You learned how to use phrases to choose a more exact word when describing a problem.",
    minutes: 7,
    points: [
      {
        form: "more like",
        claims: [
          "Use 'more like' to suggest a word or description that is closer to what you mean.",
          "It helps correct or adjust your first word choice.",
        ],
        ex: [
          "It is not broken, more like stuck.",
          "The noise is not loud, more like annoying.",
        ],
      },
      {
        form: "to be precise",
        claims: [
          "Use 'to be precise' to give a more exact detail or description.",
          "It shows you want to be clear and accurate.",
        ],
        ex: [
          "The printer is not working. To be precise, it keeps jamming the paper.",
          "There is a problem with the door. To be precise, it will not close fully.",
        ],
      },
      {
        form: "what I mean is",
        claims: [
          "Use 'what I mean is' to explain your idea in a clearer way.",
          "It helps restate or clarify your point.",
        ],
        ex: [
          "The screen is strange. What I mean is, it keeps flickering.",
          "It is not just slow. What I mean is, the computer freezes a lot.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — more like
      fc("p1", "The soup isn't bad, ___ boring.", ["more like", "most like", "more liked"]),
      sit("p1", "Your friend asks if your new job is hard. It isn't hard; it's just busy. What do you say?", [
        "It's not hard, more like busy.",
        "It's not hard, more liked busy.",
        "It's not hard, most like busy.",
      ]),
      lc("p1", "The room isn't dirty, more like untidy.", ["The room isn't dirty, it's very tidy.", "The room is dirty and untidy."]),
      // p2 — to be precise
      fc("p2", "My phone has a problem. To be ___, the battery dies after an hour.", ["precise", "precisely", "precision"]),
      la("p2", "To be precise, the screen keeps going black.", ["precisely"]),
      chat("p2", ["So what's wrong with your shower?", "It doesn't work well.", "Can you be more exact?", null], [
        "To be precise, the water is never hot.",
        "To be precisely, the water is never hot.",
        "For be precise, the water is never hot.",
      ]),
      // p3 — what I mean is
      fc("p3", "The heater is strange. What I mean ___, it turns off every hour.", ["is", "it", "are"]),
      spk("p3", "What I mean is, the door won't lock."),
      sit("p3", "You told the hotel desk that the Wi-Fi is 'bad'. The receptionist does not understand, so you explain more clearly. What do you say?", [
        "What I mean is, it stops every few minutes.",
        "What I mean it, it stops every few minutes.",
        "What do I mean is, it stops every few minutes.",
      ]),
      // karışık
      chat("mix", ["Is your laptop broken?", null], [
        "Not broken, more like slow. To be precise, it takes five minutes to start.",
        "Not broken, most like slow. To be precise, it takes five minutes to start.",
        "Not broken, more like slow. To be precisely, it takes five minutes to start.",
      ]),
      sit("mix", "You told a mechanic, 'My bike is broken.' Now you explain better: it isn't really broken, it's just very noisy. What do you say?", [
        "What I mean is, it's not broken, more like noisy.",
        "What I mean is, it's not broken, most like noisy.",
        "What I mean it, it's not broken, more like noisy.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases to clarify or correct their description of a problem.",
    quiz: [
      qmcq("Which phrase helps you give a more exact detail?", [
        "to be precise",
        "by the way",
        "in my opinion",
      ], 0),
      qmcq("You said the food was bad, but you only meant the portion was small. How do you clarify?", [
        "What I mean is, the portion was small.",
        "By the way, the portion was small.",
        "In my opinion, the food was bad.",
      ], 0),
      qmcq("You said, 'The computer is slow.' How can you clarify this?", [
        "What I mean is, it takes a long time to start.",
        "I hope it gets better.",
        "Maybe it is old.",
      ], 0),
      qmcq("You said there is a problem with the sink. Now you add the exact detail. What do you say?", [
        "To be precise, the water doesn't drain.",
        "By the way, the water doesn't drain.",
        "I hope the water drains.",
      ], 0),
    ],
    scenes: [
      sc("Sophie", "neighbour", "to understand exactly what is wrong so she can help or suggest someone who can fix it",
        "You are at your neighbour Sophie's house, explaining a problem with your kitchen sink.",
        "Explain the problem with your sink using more precise words.",
        "You said your kitchen sink is broken. Is it really broken, or is it something else?", "curious"),
      sc("David", "IT support technician", "to quickly understand and fix your computer problem",
        "You are at your office desk, describing a computer issue to David from IT support.",
        "Describe your computer problem more precisely so David can help.",
        "You said your computer is slow. What exactly happens when you use it?", "busy"),
      sc("Maria", "hotel receptionist", "to understand your room problem so she can fix it",
        "You are at the hotel front desk, telling Maria about something wrong in your room.",
        "Describe the issue in your hotel room more exactly.",
        "You said your room is too cold. What exactly is the problem?", "friendly"),
      sc("Mr. Clark", "science teacher", "to understand your question so he can help you",
        "You are in science class, trying to describe a problem with your experiment to Mr. Clark.",
        "Make your description of the experiment problem more precise.",
        "You said your experiment went wrong. What exactly went wrong?", "curious"),
      sc("Ms. Turner", "examiner", "to test your ability to describe a problem clearly",
        "You are in a speaking exam, and Ms. Turner asks you to describe a problem you have had with something that needed fixing.",
        "Describe a problem and make your explanation more precise.",
        "Think of something at home that stopped working properly. What was the problem, exactly?", "friendly"),
    ],
  },
  {
    id: "b1-its-worth-trying",
    topic: "fixed expressions + -ing",
    objectives: [
      "Recognise and use common fixed expressions that require an -ing word after them.",
      "Form sentences with 'it's worth', 'there's no point', and 'I can't help' followed by -ing.",
      "Give advice or opinions using these expressions.",
    ],
    goal: "The learner can encourage or discourage someone by using fixed expressions with -ing forms.",
    target: "it's worth + -ing, there's no point + -ing, I can't help + -ing",
    correction: "Prompt the learner to use the correct fixed expression followed by an -ing form.",
    summary: "You learned three fixed expressions that always take an -ing word after them.",
    minutes: 8,
    points: [
      {
        form: "it's worth + -ing",
        claims: [
          "Use 'it's worth' followed by a verb ending in -ing to say something is a good idea or useful.",
          "Do not use the to-infinitive after 'it's worth'.",
        ],
        ex: [
          "It's worth trying this new restaurant.",
          "It's worth learning a new skill.",
        ],
      },
      {
        form: "there's no point + -ing",
        claims: [
          "Use 'there's no point' followed by a verb ending in -ing to say something is useless or not necessary.",
          "You can also say 'there's no point in' + -ing: there's no point in waiting.",
          "Do not use the to-infinitive after 'there's no point'.",
        ],
        ex: [
          "There's no point arguing about it.",
          "There's no point waiting any longer.",
        ],
      },
      {
        form: "I can't help + -ing",
        claims: [
          "Use 'I can't help' followed by a verb ending in -ing to say you cannot stop yourself from doing something.",
          "Here 'help' does not mean 'give help', so do not use the to-infinitive after it.",
        ],
        ex: [
          "I can't help laughing at his jokes.",
          "I can't help thinking about the problem.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's worth + -ing
      fc("p1", "The old town is beautiful. It's worth ___ there at night.", ["walking", "to walk", "walk"]),
      sit("p1", "A friend asks about a book you read. It is long, but you think it is very good. What do you say?", [
        "It's worth reading.",
        "It's worth to read.",
        "It's worth read.",
      ]),
      arr("p1", "It's worth booking a table early.", ["book"]),
      // p2 — there's no point + -ing
      fc("p2", "The shop is closed now. There's no point ___ there.", ["going", "go", "went"]),
      chat("p2", ["Should we call him again? He never answers his phone.", null], [
        "There's no point calling him again.",
        "There's no point call him again.",
        "There's no point to calling him again.",
      ]),
      lc("p2", "There's no point worrying about it.", ["There's no need to worry about it.", "There's nothing to worry about."]),
      // p3 — I can't help + -ing
      fc("p3", "The baby is so cute. I can't help ___ at her.", ["smiling", "to smile", "smile"]),
      spk("p3", "I can't help thinking about it."),
      sit("p3", "You know you should not eat more cake, but you always take another piece. What do you say?", [
        "I can't help eating it.",
        "I can't help to eat it.",
        "I can't help eat it.",
      ]),
      // karışık
      chat("mix", ["I know this film is long, but should I watch it?", null], [
        "Yes, it's worth watching. I can't help crying at the end.",
        "Yes, it's worth to watch. I can't help crying at the end.",
        "Yes, it's worth watching. I can't help cry at the end.",
      ]),
      la("mix", "It's worth asking, but there's no point waiting.", ["ask"]),
    ],
    success: "The learner uses at least two of the target expressions correctly with an -ing word in their answers.",
    quiz: [
      qmcq("Which is correct?", [
        "It's worth to try.",
        "It's worth trying.",
        "It's worth try.",
      ], 1),
      qfill("There's no point ___ (wait) for the bus if it isn't coming.", ["waiting"]),
      qmcq("Choose the correct sentence.", [
        "I can't help to laugh at his stories.",
        "I can't help laughing at his stories.",
        "I can't help laugh at his stories.",
      ], 1),
      qfill("It's worth ___ (visit) the museum when you are in town.", ["visiting"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to decide if she should try a new dance class",
        "Two friends are chatting at a coffee shop about trying new hobbies.",
        "Encourage Sophie to try the dance class using the target phrases.",
        "There's a dance class near my house, but I've never danced. Should I try it?", "friendly"),
      sc("David", "colleague", "to get advice about presenting his idea at the next team meeting",
        "Two colleagues are talking in the office break room about sharing ideas at work.",
        "Encourage or discourage David from presenting his idea using the target phrases.",
        "I have an idea for the team, but I'm nervous about presenting it at the meeting. Should I do it?", "curious"),
      sc("Lucia", "fellow traveller", "to decide if she should try local street food",
        "Two travellers are waiting in line at a busy food market in a foreign city.",
        "Encourage or discourage Lucia from trying the street food using the target phrases.",
        "The queue for this food stall is very long, and our train leaves in ten minutes. Should we wait?", "curious"),
      sc("Mr. Harris", "study group leader", "to motivate a student to join a study session",
        "A study group leader invites a student to join a group revision session before exams.",
        "Encourage the student to join the session using the target phrases.",
        "Some students say a revision session the day before an exam is useless. What do you think?", "friendly"),
      sc("Ms. Turner", "examiner", "to see how the learner gives advice and encouragement",
        "A speaking exam room where the examiner asks about encouraging someone to try new things.",
        "Show you can use the target phrases to encourage or discourage someone.",
        "What is something you can't stop doing, even when you try?", "curious"),
    ],
  },
  {
    id: "b1-although-however-despite",
    topic: "showing contrast between two ideas in one stretch of speech",
    objectives: [
      "Use 'although it was', 'even though', and 'despite that' to show contrast between two ideas.",
      "Connect contrasting ideas in one sentence or across two related sentences.",
    ],
    goal: "Present both sides of a decision or situation by connecting contrasting ideas in one sentence.",
    target: "'although it was', 'even though', 'despite that'",
    correction: "Prompt the learner to use one of the target phrases to clearly connect the two contrasting ideas.",
    summary: "You learned how to use 'although it was', 'even though', and 'despite that' to show contrast between two ideas in one sentence.",
    minutes: 8,
    points: [
      {
        form: "although it was",
        claims: [
          "Use 'although' to join two facts that contrast.",
          "The 'although' part can come first or second: 'Although it was cold, we went out.' / 'We went out although it was cold.'",
          "When the 'although' part comes first, put a comma after it.",
          "After 'although it was', you can use an adjective or a noun (although it was cold / a holiday), or a verb with -ing for an action in progress (although it was raining).",
        ],
        ex: [
          "Although it was raining, we went for a walk.",
          "We enjoyed the picnic although it was cold.",
        ],
      },
      {
        form: "even though",
        claims: [
          "'Even though' works like 'although', but the contrast is stronger.",
          "Put 'even though' before the fact; the other part of the sentence gives the surprising result.",
          "Like 'although', it can come first or second in the sentence.",
        ],
        ex: [
          "Even though I was tired, I finished my homework.",
          "She smiled even though she felt sad.",
        ],
      },
      {
        form: "despite that",
        claims: [
          "'Despite that' refers back to the previous statement and introduces a contrasting result.",
          "The first sentence gives a fact; 'despite that' starts the second sentence.",
          "Follow 'despite that' with the surprising action or result.",
          "'However' can start the second sentence in the same way: It was late. However, they kept working.",
        ],
        ex: [
          "The exam was very difficult. Despite that, he passed.",
          "It was late. Despite that, they kept working.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — although it was
      fc("p1", "___ it was cold, we had a picnic.", ["Although", "Despite", "In spite"]),
      la("p1", "We went to the beach although it was cold.", ["despite"]),
      sit("p1", "The hotel was expensive. You stayed there because it was near the sea. What do you say?", [
        "Although it was expensive, we stayed there.",
        "Despite it was expensive, we stayed there.",
        "Although it expensive, we stayed there.",
      ]),
      spk("p1", "Although it was late, we kept talking."),
      // p2 — even though
      fc("p2", "She went to work ___ she had a fever.", ["even though", "despite", "even"]),
      chat("p2", ["Did you enjoy the party?", null], [
        "Yes, even though I didn't know many people.",
        "Yes, even I didn't know many people.",
        "Yes, despite I didn't know many people.",
      ]),
      lc("p2", "She smiled even though she was sad.", ["She smiled because she was happy.", "She was sad, so she didn't smile."]),
      // p3 — despite that
      fc("p3", "The test was very hard. ___, I passed it.", ["However", "Although", "Even though"]),
      sit("p3", "Your train was two hours late, but you got to the meeting on time. You tell a friend. What do you say?", [
        "My train was late. Despite that, I was on time.",
        "My train was late. Despite, I was on time.",
        "My train was late. Despite of that, I was on time.",
      ]),
      spk("p3", "Despite that, we had a great time."),
      // karışık
      sit("mix", "You tell a friend about your trip. It rained every day, but you had fun. What do you say?", [
        "It rained every day. Despite that, we had fun.",
        "It rained every day. Although, we had fun.",
        "Despite it rained every day, we had fun.",
      ]),
      chat("mix", ["How was the concert?", "Great, even though it was outside.", "Wasn't it cold?", null], [
        "Yes, very. Despite that, we stayed until the end.",
        "Yes, very. Even though, we stayed until the end.",
        "Yes, very. Although, we stayed until the end.",
      ]),
    ],
    success: "The learner combines two contrasting ideas in one stretch of speech using the target phrases correctly.",
    quiz: [
      qmcq("___ raining, they played football.", [
        "Although it was",
        "Despite that",
        "Even though",
      ], 0),
      qfill("He was tired. ___, he finished the project.", ["Despite that"]),
      qmcq("___ I studied hard, I did not pass the test.", [
        "Even though",
        "Despite that",
        "Although it was",
      ], 0),
      qfill("___ late, we continued working.", ["Although it was"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to understand why you made your decision",
        "You are chatting with your friend Lucy at a cafe about a recent decision you made.",
        "Explain both sides of your decision using contrast phrases.",
        "You moved to a smaller flat last month. Was it a good decision?", "curious"),
      sc("James", "colleague", "to hear your reasoning for a work-related choice",
        "You are in the office break room talking to your colleague James about a project decision.",
        "Present both sides of a work decision using contrast phrases.",
        "The new plan was more expensive, but you chose it. Why?", "friendly"),
      sc("Sophie", "hotel receptionist", "to understand your choice about your travel plans",
        "You are at the hotel front desk explaining your travel choices to Sophie, the receptionist.",
        "Describe both sides of your travel decision using contrast phrases.",
        "You booked the night train, not the flight. The flight was faster, so why the train?", "curious"),
      sc("Dr. Patel", "academic advisor", "to understand your academic decision",
        "You are meeting Dr. Patel, your academic advisor, to discuss your choice of courses.",
        "Explain both sides of your course selection using contrast phrases.",
        "You chose the hardest course this term. What was good about that choice, and what was difficult?", "friendly"),
      sc("Mr. Harris", "examiner", "to assess your ability to present both sides of a decision",
        "You are in a speaking exam and Mr. Harris asks about a recent decision you made.",
        "Present both sides of your decision using contrast phrases.",
        "Tell me about a decision you made recently. What was difficult about it, and what did you do?", "curious"),
    ],
  },
  {
    id: "b1-explaining-yourself-clearly",
    topic: "explaining something complicated in simple words",
    objectives: [
      "Explain a complex idea in simple language",
      "Use linking phrases to clarify explanations",
    ],
    goal: "Explain a complicated topic to someone using clear, simple language and helpful phrases.",
    target: "Phrases: let me put it, in other words, does that make sense",
    correction: "Prompt the learner to use the target phrases when they forget or use less clear language.",
    summary: "You learned how to explain complicated things in simple words. You practised using helpful phrases to make your meaning clear.",
    minutes: 7,
    points: [
      {
        form: "let me put it",
        claims: [
          "Use 'let me put it' to start explaining something in a different or simpler way.",
          "This phrase shows you want to help the listener understand.",
        ],
        ex: [
          "Let me put it another way: it is like a big team project.",
          "Let me put it simply: you just need to follow these steps.",
        ],
      },
      {
        form: "in other words",
        claims: [
          "Use 'in other words' to say the same thing in a simpler or clearer way.",
          "It helps the listener see your point from a new angle.",
        ],
        ex: [
          "In other words, you just have to wait your turn.",
          "It is very expensive. In other words, not many people can buy it.",
        ],
      },
      {
        form: "does that make sense",
        claims: [
          "Use 'does that make sense' to check if the listener understands your explanation.",
          "It invites questions if something is not clear.",
        ],
        ex: [
          "You add water, then mix it. Does that make sense?",
          "It works like this: you press the button and it starts. Does that make sense?",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — let me put it
      fc("p1", "That was too complicated. Let me put it another ___.", ["way", "road", "time"]),
      sit("p1", "Your explanation was too difficult. You want to try again with easier words. What do you say?", [
        "Let me put it simply.",
        "Let me put simply it.",
        "Let me to put it simply.",
      ]),
      la("p1", "Let me put it in a different way.", ["puts"]),
      // p2 — in other words
      fc("p2", "The flight is full. In other ___, there are no seats left.", ["words", "word", "ways"]),
      chat("p2", ["The bank says my card is 'blocked'. What does that mean?", null], [
        "In other words, you can't use it right now.",
        "In another words, you can't use it right now.",
        "With other words, you can't use it right now.",
      ]),
      spk("p2", "In other words, you need to wait."),
      // p3 — does that make sense
      fc("p3", "First you open the app, then you scan the code. Does that ___ sense?", ["make", "do", "have"]),
      sit("p3", "You just explained a game to a friend. You want to check that she understands. What do you ask?", [
        "Does that make sense?",
        "Does that makes sense?",
        "Is that make sense?",
      ]),
      lc("p3", "Does that make sense to you?", ["Does that sound good to you?", "Do you have any questions?"]),
      // karışık
      chat("mix", ["I don't understand. What is a password manager?", null], [
        "Let me put it simply: it remembers your passwords. Does that make sense?",
        "Let me put it simply: it remembers your passwords. Does that makes sense?",
        "Let me put simply: it remembers your passwords. Does that make sense?",
      ]),
      sit("mix", "Your friend did not understand you. You say the same idea again in simpler words, then you check. What do you say?", [
        "In other words, it's free. Does that make sense?",
        "In other word, it's free. Does that make sense?",
        "In other words, it's free. Does that makes sense?",
      ]),
    ],
    success: "The learner uses the target phrases correctly to explain something complicated in simple words.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase can you use to explain something in a different way?", [
        "Let me put it",
        "Does that make sense?",
        "Thank you",
      ], 0),
      qfill("It is very hard to find. ___, not many people have it.", ["In other words","in other words"]),
      qmcq("What do you say to check if your friend understands your explanation?", [
        "Does that make sense?",
        "Let me put it",
        "In other words",
      ], 0),
    ],
    scenes: [
      sc("Lucy", "your neighbour", "to understand how online banking works",
        "You are sitting together in your building’s shared garden, and Lucy asks you to explain online banking.",
        "Help Lucy understand the basics of online banking using simple words and the target phrases.",
        "I keep hearing about online banking, but I don't really get it. How does it work?", "curious"),
      sc("Tom", "your new colleague", "to learn how your team’s project management tool works",
        "You are in the office break room, and Tom asks you about the project management tool your team uses.",
        "Explain the project management tool to Tom in simple terms using the target phrases.",
        "I'm new here, and I don't understand the project tool your team uses. Can you explain it to me?", "curious"),
      sc("Sophie", "hotel receptionist", "to understand how to use a foreign guest’s travel adapter",
        "You are at the hotel front desk, and Sophie is curious about how your travel adapter works.",
        "Explain how the travel adapter works in simple language using the target phrases.",
        "You said you need a travel adapter for your phone. What is it, and how does it work?", "friendly"),
      sc("Ben", "classmate", "to understand a difficult science concept from your class",
        "You are studying in the library, and Ben asks you to explain a complicated science topic.",
        "Help Ben understand the science concept using the target phrases and clear language.",
        "I want to start cooking at home, but I don't know where to begin. Can you explain how to make a simple dish?", "curious"),
      sc("Mrs. Carter", "examiner", "to see if you can explain a complicated idea in simple words",
        "You are in a speaking exam room, and Mrs. Carter asks you to explain a difficult idea simply.",
        "Demonstrate your ability to explain a complicated topic clearly using the target phrases.",
        "Choose something you know well, like a game or a recipe. Can you explain it to me in simple words?", "friendly"),
    ],
  },
  {
    id: "b1-youre-coming-arent-you",
    topic: "short check questions at sentence end (question tags)",
    objectives: [
      "Add a short check question to the end of a statement.",
      "Use aren't you, isn't it, and haven't we correctly in context.",
    ],
    goal: "The learner can confirm information or arrangements informally by adding short check questions to the end of statements.",
    target: "aren't you, isn't it, haven't we",
    correction: "Model the correct short check question and prompt the learner to repeat it correctly.",
    summary: "You learned how to add short check questions like aren't you, isn't it, and haven't we to the end of statements. These help confirm information or arrangements in conversation.",
    minutes: 8,
    points: [
      {
        form: "short check question at sentence end",
        claims: [
          "A question tag is a short question at the end of a sentence, like 'isn't it?'.",
          "Use a question tag to check information or to ask someone to agree.",
          "The tag uses the same helping verb as the sentence, and a pronoun for the subject: 'Your brother is at home, isn't he?'",
          "After a positive sentence, use a negative tag.",
        ],
        ex: [
          "You are coming to the party, aren't you?",
          "It is a nice day, isn't it?",
          "Your brother is at home, isn't he?",
        ],
      },
      {
        form: "aren't you",
        claims: [
          "Use aren't you after a statement with 'you are' to check or confirm.",
          "The tag is negative if the statement is positive.",
        ],
        ex: [
          "You are joining us, aren't you?",
          "You are free tomorrow, aren't you?",
        ],
      },
      {
        form: "isn't it / haven't we",
        claims: [
          "Use isn't it after a statement with 'it is' to confirm or check.",
          "Use haven't we after 'we have' + past participle (present perfect) to confirm or check: We have met before, haven't we?",
        ],
        ex: [
          "It is almost time, isn't it?",
          "We have met before, haven't we?",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — question tag
      fc("p1", "Your sister is a teacher, ___?", ["isn't she", "isn't it", "doesn't she"]),
      sit("p1", "You think the shop is open today. You check with a friend. What do you say?", [
        "The shop is open today, isn't it?",
        "The shop is open today, isn't she?",
        "The shop is open today, doesn't it?",
      ]),
      err("p1", "The children are tired, aren't it?", "it", "they"),
      // p2 — aren't you
      fc("p2", "You are working on Saturday, ___?", ["aren't you", "isn't you", "don't you"]),
      spk("p2", "You are free tonight, aren't you?"),
      chat("p2", ["So, the party is at my house at eight.", null], [
        "Great. You are cooking, aren't you?",
        "Great. You are cooking, isn't you?",
        "Great. You are cooking, don't you?",
      ]),
      // p3 — isn't it / haven't we
      fc("p3", "We have seen this film before, ___?", ["haven't we", "aren't we", "haven't you"]),
      sit("p3", "You think it is your friend's birthday tomorrow. You check with her. What do you say?", [
        "It is your birthday tomorrow, isn't it?",
        "It is your birthday tomorrow, isn't she?",
        "It is your birthday tomorrow, wasn't it?",
      ]),
      lc("p3", "It's a long way, isn't it?", ["It's a lovely day, isn't it?", "It's too far away, isn't it?"]),
      la("p3", "We have paid for the tickets, haven't we?", ["hasn't"]),
      // karışık
      chat("mix", ["Are you ready for the trip?", null], [
        "Yes! It is tomorrow, isn't it? And you are driving, aren't you?",
        "Yes! It is tomorrow, isn't it? And you are driving, isn't you?",
        "Yes! It is tomorrow, aren't it? And you are driving, aren't you?",
      ]),
      sit("mix", "You think your colleague is away next week, and you think it is a long trip. You check both things. What do you say?", [
        "You are away next week, aren't you? It is a long trip, isn't it?",
        "You are away next week, isn't you? It is a long trip, isn't it?",
        "You are away next week, aren't you? It is a long trip, isn't she?",
      ]),
    ],
    success: "The learner uses the correct short check question for the subject and tense in each sentence.",
    minUses: 3,
    quiz: [
      qmcq("You are going to help me, ___?", [
        "aren't you",
        "isn't it",
        "haven't we",
      ], 0),
      qmcq("It is your turn, ___?", [
        "haven't we",
        "aren't you",
        "isn't it",
      ], 2),
      qfill("We have finished the project, ___?", ["haven't we"]),
      qfill("You are coming to the party, ___?", ["aren't you"]),
    ],
    scenes: [
      sc("Lucy", "your neighbour", "to confirm your plans for the weekend together",
        "You meet your neighbour Lucy outside your building to talk about weekend plans.",
        "Confirm your shared weekend plans with Lucy using question tags.",
        "I made our plan for Saturday, but I'm not sure I told you everything. What do you think the plan is?", "friendly"),
      sc("David", "your colleague", "to make sure you both remember the team meeting details",
        "You and your colleague David are discussing the upcoming team meeting in the office kitchen.",
        "Confirm the meeting time and details with David using question tags.",
        "I sent you the meeting details yesterday. What do you think the time and place are?", "busy"),
      sc("Sophie", "hotel receptionist", "to check your check-out time and travel plans",
        "You are at the hotel reception desk talking to Sophie about your check-out and taxi booking.",
        "Confirm your check-out and taxi arrangements using question tags.",
        "Your check-out is tomorrow morning, and you booked a taxi with us. What do you want to check with me?", "friendly"),
      sc("Tom", "study group partner", "to make sure you both remember the study session details",
        "You and Tom are leaving class and talking about your next study group meeting.",
        "Confirm the time and place for the study session using question tags.",
        "We planned a study session for this week, but I forgot the day. Do you remember it?", "curious"),
      sc("Mrs. Green", "examiner", "to check your ability to confirm information using question tags",
        "You are in a speaking exam room and Mrs. Green is asking you about your daily routine.",
        "Use question tags to confirm information about your routine with the examiner.",
        "I'm the examiner today, so you don't know much about me. Can you guess some things about my day and check them with me?", "curious"),
    ],
  },
  {
    id: "b1-so-tired-such-a-long-day",
    topic: "so and such for emphasis",
    objectives: [
      "Use 'so' and 'such' to add emphasis to statements.",
      "Form sentences with 'so' + adjective and 'such' + adjective + noun.",
      "Recognise and correct common mistakes with 'so' and 'such'.",
    ],
    goal: "Describe and emphasise feelings or situations when talking about a tiring or exhausting day.",
    target: "'so' + adjective; 'such' + adjective + noun",
    correction: "Prompt the learner to choose 'so' or 'such' correctly and adjust word order if needed.",
    summary: "You learned how to use 'so' and 'such' to make statements stronger.",
    minutes: 8,
    intents: {
      readiness: "Greet, name today's topic (so and such for emphasis), and ask if the learner is ready.",
      teach: "Announce the explanation of how to use 'so' and 'such' for emphasis.",
      questions: "Invite any questions before starting the exercises.",
      say: "Acknowledge and announce a few practice questions about using 'so' and 'such'.",
    },
    points: [
      {
        form: "'so' + adjective",
        claims: [
          "Use 'so' before an adjective to make it stronger: so tired.",
          "Do not use 'so' before 'a' + noun: say 'such a long day', not 'so a long day'.",
          "Use 'so' to show strong feelings or opinions.",
        ],
        ex: [
          "I am so tired.",
          "It was so difficult.",
        ],
      },
      {
        form: "'such' + adjective + noun",
        claims: [
          "Use 'such' before an adjective and a noun to add force.",
          "With a singular noun, put 'a' or 'an' after 'such': such a nice person.",
          "Do not use 'such' before an adjective alone: say 'so tired', not 'such tired'.",
        ],
        ex: [
          "It was such a long day.",
          "She is such a nice person.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — so + adjective
      fc("p1", "The film was ___ boring. I almost fell asleep.", ["so", "such", "such a"]),
      err("p1", "I'm such tired after work today.", "such", "so"),
      spk("p1", "It was so hot today."),
      lc("p1", "The test was so difficult.", ["The test was quite easy.", "The trip was so long."]),
      // p2 — such + adjective + noun
      fc("p2", "It was ___ a nice evening.", ["such", "so", "very"]),
      la("p2", "We had such a great time at the beach.", ["so"]),
      sit("p2", "You worked from eight in the morning to ten at night. What do you say?", [
        "I had such a busy day.",
        "I had so a busy day.",
        "I had such busy day.",
      ]),
      chat("p2", ["How was your holiday?", null], [
        "Great! It was such a beautiful place.",
        "Great! It was so a beautiful place.",
        "Great! It was a such beautiful place.",
      ]),
      // karışık
      sit("mix", "Your friend asks about your new job. The days are long, and you feel very tired. What do you say?", [
        "It's such a hard job. I'm so tired.",
        "It's so a hard job. I'm so tired.",
        "It's such a hard job. I'm such tired.",
      ]),
      spk("mix", "It was such a long day, and I'm so tired."),
      chat("mix", ["How was the concert?", null], [
        "It was so good. They are such a great band.",
        "It was such good. They are such a great band.",
        "It was so good. They are so a great band.",
      ]),
    ],
    success: "Learner uses 'so' and 'such' correctly to emphasise feelings or descriptions about an exhausting day.",
    quiz: [
      qmcq("Which is correct?", [
        "I am so tired.",
        "I am such tired.",
        "I am such a tired.",
      ], 0),
      qfill("It was ___ a long day that I forgot to eat lunch.", ["such"]),
      qmcq("Choose the correct sentence.", [
        "It was so a long day.",
        "It was such a long day.",
        "It was so long a day.",
      ], 1),
      qfill("She was ___ happy to see her friends.", ["so"]),
    ],
    scenes: [
      sc("Lucy", "neighbour", "to chat and hear about your day",
        "You meet your neighbour Lucy while taking out the trash in the evening.",
        "Explain to Lucy how exhausting your day was using emphasis.",
        "Hi! You're home late tonight. How was your day?", "friendly"),
      sc("David", "colleague", "to check in about your workload",
        "You and your colleague David are talking in the break room after work.",
        "Describe your tiring workday and emphasise how exhausting it was.",
        "Finally, the work day is over! How was your day?", "curious"),
      sc("Maria", "hotel receptionist", "to make sure you are comfortable after your arrival",
        "You are checking in at your hotel after a long journey.",
        "Explain to Maria how exhausting your travel day was using emphasis.",
        "Welcome to the hotel! How was your journey here?", "friendly"),
      sc("Tom", "classmate", "to talk about how the day went",
        "You and your classmate Tom are leaving the library after studying all day.",
        "Tell Tom how tired you feel and how long the day was.",
        "We studied in the library all day! How do you feel now?", "curious"),
      sc("Ms. Carter", "examiner", "to assess your ability to describe a tiring day",
        "You are in a speaking exam and the examiner asks about your most exhausting day.",
        "Describe your tiring day with emphasis using the target phrases.",
        "Tell me about the longest, hardest day you can remember. How did you feel?", "neutral"),
    ],
  },
  {
    id: "b1-enough-too-much-plenty",
    topic: "talking about amounts precisely",
    objectives: [
      "Use 'not enough', 'too much', and 'plenty of' to describe amounts.",
      "Choose the correct phrase to express if there is a sufficient, insufficient, or excessive amount of something.",
    ],
    goal: "Describe if there is enough, too much, or not enough of something in real situations.",
    target: "'not enough', 'too much', 'plenty of time'",
    correction: "Correct errors by modeling the correct phrase and having the learner repeat it.",
    summary: "You learned how to use 'not enough', 'too much', and 'plenty of' to talk about amounts.",
    minutes: 8,
    intents: {
      readiness: "Greet, name today's topic of talking about amounts precisely, and ask if ready.",
      teach: "Announce that we will explain how to talk about amounts precisely.",
      questions: "Invite any questions before starting the exercises.",
      say: "Acknowledge and announce a few practice questions.",
    },
    points: [
      {
        form: "not enough",
        claims: [
          "'Not enough' means less than you need.",
          "Put 'enough' before the noun: enough chairs, enough time.",
          "The 'not' usually goes with the verb: We don't have enough chairs. / There isn't enough water.",
        ],
        ex: [
          "We do not have enough chairs for everyone.",
          "There is not enough water in the bottle.",
        ],
      },
      {
        form: "too much",
        claims: [
          "'Too much' means more than you want or need.",
          "Use 'too much' before uncountable nouns: too much sugar.",
          "With plural countable nouns, use 'too many': too many people.",
        ],
        ex: [
          "There is too much sugar in my tea.",
          "You spend too much time on your phone.",
          "There are too many cars in the city.",
        ],
      },
      {
        form: "plenty of",
        claims: [
          "'Plenty of' means more than enough.",
          "Use 'plenty of' before plural or uncountable nouns: plenty of apples, plenty of time.",
          "Do not forget 'of': say 'plenty of time', not 'plenty time'.",
        ],
        ex: [
          "We have plenty of time to finish the project.",
          "There are plenty of apples in the basket.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — not enough
      fc("p1", "We have ten guests but only eight chairs. We don't have ___ chairs for everyone.", ["enough", "much", "enough of"]),
      arr("p1", "There isn't enough milk for the cake.", ["many"]),
      sit("p1", "You need two hours to finish your work, but you only have one hour. What do you say?", [
        "I don't have enough time.",
        "I don't have enough of time.",
        "I have plenty of time.",
      ]),
      // p2 — too much
      fc("p2", "There is too ___ traffic in the city centre.", ["much", "many", "enough"]),
      chat("p2", ["Why aren't you drinking your coffee?", null], [
        "There's too much sugar in it.",
        "There's too many sugar in it.",
        "There's much too sugars in it.",
      ]),
      spk("p2", "I have too much work this week."),
      err("p2", "There are too much people on this bus.", "much", "many"),
      // p3 — plenty of
      fc("p3", "Don't hurry. The train leaves in two hours, so we have ___ time.", ["plenty of", "not enough", "plenty"]),
      la("p3", "There are plenty of seats at the back.", ["much"]),
      sit("p3", "Your friend is worried about drinks for the party. You have forty bottles of water, and ten people are coming. What do you say?", [
        "Don't worry, we have plenty of water.",
        "Don't worry, we have plenty water.",
        "Don't worry, we don't have enough water.",
      ]),
      // karışık
      sit("mix", "You are planning a picnic. You have lots of sandwiches, but only one small bottle of water for six people. What do you say?", [
        "We have plenty of sandwiches, but not enough water.",
        "We have plenty sandwiches, but not enough water.",
        "We have plenty of sandwiches, but too much water.",
      ]),
      lc("mix", "There's too much work and not enough time.", ["There's too much work and plenty of time.", "There's not much work and lots of time."]),
    ],
    success: "Learner uses the correct phrase to describe the amount in each situation.",
    quiz: [
      qmcq("We invited ten people and cooked for twenty. We have ___ food for everyone.", [
        "not enough",
        "too much",
        "plenty of",
      ], 2),
      qfill("There is ___ water in the glass. It is almost empty.", ["not enough"]),
      qmcq("He put ___ salt in the soup, so it tastes bad.", [
        "plenty of",
        "not enough",
        "too much",
      ], 2),
      qfill("We have ___ to finish the test. Do not worry.", ["plenty of time"]),
    ],
    scenes: [
      sc("Sophie", "housemate", "to check if they have enough ingredients for dinner",
        "You and your housemate are checking the kitchen before cooking dinner together.",
        "Explain if you have enough ingredients or if you need to buy more.",
        "We're cooking dinner for eight people, and we have one small bag of rice. What do you think?", "curious"),
      sc("David", "project manager", "to make sure the team has enough resources for the project",
        "In a team meeting, your manager is reviewing the resources for a new project.",
        "Discuss if there are enough materials and time for the project.",
        "The deadline is in three months, and the project needs about one month of work. How do you feel about the time?", "busy"),
      sc("Linda", "tour guide", "to plan the day's sightseeing schedule",
        "You are on a group tour, and the guide is discussing the day's plan with you.",
        "Say if there is enough time to visit all the places or if there is too much or not enough time.",
        "Today we have six museums on the plan and only five hours. What do you think of the plan?", "friendly"),
      sc("Tom", "study group leader", "to organise a group study session",
        "During a study group meeting, you are planning how much time to spend on each subject.",
        "Discuss whether there is enough time to cover all topics before the test.",
        "The test is on Friday, and we have ten topics to study in two days. What do you think?", "curious"),
      sc("Helen", "examiner", "to ask about your experience with time management",
        "In a speaking exam, the examiner asks about your experiences with time and resources.",
        "Describe a situation where you had too much, not enough, or plenty of time.",
        "Tell me about a really busy week you had. How was it?", "friendly"),
    ],
  },
  {
    id: "b1-getting-your-point-across",
    topic: "giving an opinion and agreeing or disagreeing with force",
    objectives: [
      "Give a strong opinion using a set phrase.",
      "Agree or disagree strongly and politely in discussion.",
      "Respond to others' opinions using appropriate expressions.",
    ],
    goal: "Participate in a lively discussion by giving strong opinions and agreeing or disagreeing with others.",
    target: "in my view, I couldn't agree more, I see your point",
    correction: "Prompt the learner to use the full target phrase if missing or incomplete.",
    summary: "You learned how to give a strong opinion and agree or disagree with force. You practised using set phrases for lively discussions.",
    minutes: 7,
    points: [
      {
        form: "in my view",
        claims: [
          "Use 'in my view' to introduce your opinion in a discussion.",
          "'In my view' is followed by a statement or belief.",
          "It sounds a little more formal than 'I think'.",
        ],
        ex: [
          "In my view, this is the best solution.",
          "In my view, we should try something different.",
        ],
      },
      {
        form: "I couldn't agree more",
        claims: [
          "Use 'I couldn't agree more' to show very strong agreement with someone's opinion.",
          "This phrase means you completely agree.",
          "It is often used to support a friend's statement in a lively conversation.",
        ],
        ex: [
          "I couldn't agree more with what you said.",
          "You are absolutely right. I couldn't agree more.",
        ],
      },
      {
        form: "I see your point",
        claims: [
          "Use 'I see your point' to show that you understand another person's opinion, even if you do not fully agree.",
          "This phrase is useful before giving your own opinion or disagreeing politely.",
          "It helps keep the discussion respectful.",
        ],
        ex: [
          "I see your point, but I think there is another way.",
          "I see your point about the cost.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — in my view
      fc("p1", "In my ___, we should take the train.", ["view", "views", "viewing"]),
      sit("p1", "Your group is choosing a restaurant. You want to give your opinion: the Italian one is best. What do you say?", [
        "In my view, the Italian one is best.",
        "On my view, the Italian one is best.",
        "In my view, the Italian one is goodest.",
      ]),
      lc("p1", "In my view, it's too expensive.", ["To me, it looks very cheap.", "In my view, it's not expensive."]),
      // p2 — I couldn't agree more
      sit("p2", "Your friend says, 'We need more parks in this city.' You agree one hundred percent. What do you say?", [
        "I couldn't agree more.",
        "I couldn't agree most.",
        "I see your point, but I'm not sure.",
      ]),
      fc("p2", "You're absolutely right. I couldn't agree ___.", ["more", "most", "much"]),
      spk("p2", "I couldn't agree more with you."),
      // p3 — I see your point
      fc("p3", "I see your ___, but I think it's too late.", ["point", "pointed", "pointing"]),
      sit("p3", "Your colleague says, 'We should work from home every day.' You understand why, but you don't fully agree. What do you say?", [
        "I see your point, but I like the office.",
        "I couldn't agree more.",
        "I see your point, so I agree completely.",
      ]),
      la("p3", "I see your point about the price.", ["sees"]),
      // karışık
      chat("mix", ["This city is too expensive. People should move away.", null], [
        "I see your point, but in my view, the salaries are good.",
        "I see your point, but on my view, the salaries are good.",
        "I see you point, but in my view, the salaries are good.",
      ]),
      sit("mix", "Your friend says that cycling is the best way to get around town. You agree completely and add your own opinion. What do you say?", [
        "I couldn't agree more. In my view, it's also cheap.",
        "I couldn't agree more. On my view, it's also cheap.",
        "I could agree more. In my view, it's also cheap.",
      ]),
    ],
    success: "The learner uses at least two target phrases naturally and correctly in a discussion context.",
    quiz: [
      qmcq("Which phrase is best for politely disagreeing before giving your own opinion?", [
        "I see your point.",
        "I couldn't agree more.",
        "In my view.",
      ], 0),
      qfill("___, this is not the best idea.", ["In my view"]),
      qmcq("You want to show very strong agreement. What do you say?", [
        "I see your point.",
        "I couldn't agree more.",
        "In my view.",
      ], 1),
      qfill("I ___, but I still think we need more information.", ["see your point"]),
    ],
    scenes: [
      sc("Sophie", "friend", "find out what everyone thinks about a new restaurant",
        "You and your friends are sitting in a cafe discussing whether the new pizza place in town is worth trying.",
        "Give your opinion about the new pizza place and respond to your friend's ideas.",
        "I think the new pizza place is the best in town. Do you agree?", "curious"),
      sc("James", "colleague", "decide as a team whether to work from home or the office",
        "You are in a team meeting discussing if your team should continue working from home or return to the office.",
        "Express your strong opinion about the best work arrangement and react to your colleague's views.",
        "I think we should all work from home every day. It saves so much time. What's your opinion?", "busy"),
      sc("Luca", "fellow traveller", "choose the best sightseeing option for the group",
        "You and other tourists are deciding which tour to take in a new city: a historical walk or a food tour.",
        "Share your opinion about which tour is better and respond to what others suggest.",
        "I want to do the history walk, not the food tour. Food tours are just eating. What do you think?", "friendly"),
      sc("Priya", "classmate", "choose the best topic for a group project",
        "You are in a study group discussing which topic to choose for your group project.",
        "State your strong opinion about the best project topic and react to your classmate's ideas.",
        "I think the environment is the best topic for our project. Everybody knows about it. What's your opinion?", "curious"),
      sc("Mr. Carter", "examiner", "see how well you can discuss and share opinions",
        "You are in an English speaking exam and the examiner asks you to discuss your opinion about online learning.",
        "Give a strong opinion about online learning and respond to the examiner's comments.",
        "Some people say online classes are better than classes at school. What's your opinion?", "friendly"),
    ],
  },
  {
    id: "b1-keeping-a-conversation-going",
    topic: "follow-up questions and reactions that invite someone to say more",
    objectives: [
      "Use simple follow-up questions to keep a conversation going.",
      "React to information in a way that encourages the other person to share more.",
    ],
    goal: "The learner can respond to what someone says and invite them to share more details in a friendly conversation.",
    target: "that's interesting; how come; tell me more about",
    correction: "If the learner does not use a target phrase or uses it incorrectly, prompt them to try again using one of the exact target phrases.",
    summary: "You learned three useful phrases for inviting someone to say more.",
    minutes: 7,
    points: [
      {
        form: "that's interesting",
        claims: [
          "Say 'that's interesting' to show you are interested in what someone just said.",
          "This phrase encourages the other person to continue talking.",
        ],
        ex: [
          "You travel a lot for work? That's interesting.",
          "You grew up in a small town? That's interesting.",
        ],
      },
      {
        form: "how come",
        claims: [
          "Use 'how come' to ask why something happened or is true.",
          "It is an informal way to say 'why'.",
          "After 'how come', use normal sentence order: 'How come you moved here?', not 'How come did you move here?'",
          "You can also use it alone as a short question: 'How come?'",
        ],
        ex: [
          "You moved here last year? How come?",
          "You don't eat meat? How come?",
          "How come you moved here?",
        ],
      },
      {
        form: "tell me more about",
        claims: [
          "Say 'tell me more about' to invite someone to give more information about a topic.",
          "This phrase shows you are interested in hearing details.",
        ],
        ex: [
          "You play the guitar? Tell me more about that.",
          "You visited Japan? Tell me more about your trip.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — that's interesting
      fc("p1", "You lived in Brazil for five years? That's ___.", ["interesting", "interested", "interest"]),
      sit("p1", "A new colleague tells you she was a chef before. You want to show interest. What do you say?", [
        "Really? That's interesting.",
        "Really? That's interested.",
        "Really? That interesting.",
      ]),
      spk("p1", "Oh, that's really interesting."),
      // p2 — how come
      fc("p2", "How come you ___ to the party yesterday?", ["didn't come", "did you not come", "don't came"]),
      chat("p2", ["I never drink coffee.", null], [
        "Really? How come?",
        "Really? How comes?",
        "Really? Why come?",
      ]),
      arr("p2", "How come you moved to this city?", ["did"]),
      // p3 — tell me more about
      fc("p3", "You went to Japan? Tell me more ___ your trip.", ["about", "to", "at"]),
      la("p3", "Tell me more about your new job.", ["tells"]),
      sit("p3", "Your friend says he started a band. You want to hear the details. What do you say?", [
        "Tell me more about it.",
        "Tell me more for it.",
        "Say me more about it.",
      ]),
      // karışık
      chat("mix", ["I'm moving to Canada next month.", null], [
        "That's interesting! How come?",
        "That's interested! How come?",
        "That's interesting! How comes?",
      ]),
      lc("mix", "How come? Tell me more about it.", ["How come? Tell me more about you.", "Come on, tell me about it."]),
    ],
    success: "The learner uses at least two of the target phrases naturally to invite the other person to share more.",
    quiz: [
      qmcq("Which phrase can you use to ask someone why they did something?", [
        "How come?",
        "That's interesting.",
        "See you later.",
      ], 0),
      qfill("Your friend says, 'I started learning Spanish.' You reply, '___'", ["that's interesting","That's interesting"]),
      qmcq("What do you say if you want to hear more about someone's trip?", [
        "Tell me more about your trip.",
        "I don't care.",
        "Maybe later.",
      ], 0),
      qfill("You hear, 'I moved here last year.' You ask, '___?'", ["how come","How come"]),
    ],
    scenes: [
      sc("Olivia", "neighbour", "to get to know the learner better",
        "You meet your neighbour Olivia while both of you are gardening in front of your houses.",
        "Respond to Olivia's story and invite her to share more details using friendly follow-up questions.",
        "I grow forty kinds of tomatoes in my garden, but I never eat them. Can you guess why?", "friendly"),
      sc("James", "colleague", "to have a friendly chat during a coffee break",
        "You and your colleague James are having coffee together in the office break room.",
        "React to James's story and encourage him to talk more about it with follow-up questions.",
        "Guess what? Next month I'm leaving the office to work on a boat for a year. What do you think?", "curious"),
      sc("Sophia", "fellow traveller", "to chat and pass the time while waiting for a train",
        "You are waiting at a train station and start talking with Sophia, another traveller.",
        "Show interest in Sophia's travel story and ask her to share more details.",
        "I'm travelling by train from Lisbon to Istanbul, because I never fly. What do you think of that?", "friendly"),
      sc("Daniel", "classmate", "to make a new friend in class",
        "You are sitting next to Daniel, a classmate, before your lesson starts.",
        "Respond to Daniel’s story and invite him to share more about his interests.",
        "I started learning Japanese last month, and I already have a pen friend in Tokyo. What would you like to ask me?", "curious"),
      sc("Rachel", "examiner", "to assess your ability to keep a conversation going",
        "You are in a speaking exam room with Rachel, the examiner.",
        "React to Rachel’s statements and invite her to continue sharing using follow-up questions.",
        "Here's something about me: last year I lived in a tent for three months. What do you say to that?", "friendly"),
    ],
  },
  {
    id: "b1-a-real-discussion",
    topic: "discussing a topic you genuinely care about",
    objectives: [
      "Use phrases to show genuine interest in a topic",
      "Express personal opinions clearly in conversation",
    ],
    goal: "The learner can join a conversation and share their real thoughts and feelings about a subject using natural phrases.",
    target: "Phrases: what strikes me is, I've always thought, to be honest",
    correction: "Gently prompt the learner to use one of the target phrases if they forget or use an incorrect form.",
    summary: "You learned how to discuss a topic you genuinely care about using natural English phrases.",
    minutes: 7,
    points: [
      {
        form: "what strikes me is",
        claims: [
          "Use 'what strikes me is' to introduce something that strongly catches your attention or interest.",
          "This phrase helps show you are thinking deeply about the topic.",
        ],
        ex: [
          "What strikes me is how quickly technology changes.",
          "What strikes me is the passion people have for this sport.",
        ],
      },
      {
        form: "I've always thought",
        claims: [
          "Use 'I've always thought' to share a long-held opinion or belief.",
          "This phrase shows your view is genuine and not just a quick idea.",
        ],
        ex: [
          "I've always thought learning languages is important.",
          "I've always thought that honesty is the best policy.",
        ],
      },
      {
        form: "to be honest",
        claims: [
          "Use 'to be honest' before saying something that is your true opinion, even if it is different from others.",
          "This phrase makes your comment sound sincere and personal.",
        ],
        ex: [
          "To be honest, I find this topic a bit difficult.",
          "To be honest, I do not enjoy watching sports.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — what strikes me is
      fc("p1", "What ___ me is how friendly people are here.", ["strikes", "strike", "striking"]),
      sit("p1", "You are in a new city. You notice that everyone rides a bike, and this surprises you. What do you say?", [
        "What strikes me is how many people cycle.",
        "What strike me is how many people cycle.",
        "What strikes me are how many people cycle.",
      ]),
      lc("p1", "What strikes me is how quiet it is.", ["What I like is the quiet streets.", "It strikes me as a quiet place."]),
      // p2 — I've always thought
      fc("p2", "I've always ___ that music helps you study.", ["thought", "think", "thinking"]),
      chat("p2", ["Do you think it's important to learn languages?", null], [
        "Yes, I've always thought it's important.",
        "Yes, I've always think it's important.",
        "Yes, I've always thinked it's important.",
      ]),
      spk("p2", "I've always thought that cities need more trees."),
      // p3 — to be honest
      fc("p3", "To be ___, I don't really like football.", ["honest", "honestly", "honesty"]),
      sit("p3", "Your friends love a TV show. You don't like it, and you want to say this sincerely. What do you say?", [
        "To be honest, I don't like it.",
        "To be honestly, I don't like it.",
        "For be honest, I don't like it.",
      ]),
      la("p3", "To be honest, I found the book boring.", ["honestly"]),
      // karışık
      chat("mix", ["What do you think about working from home?", null], [
        "To be honest, I've always thought it's a good idea.",
        "To be honestly, I've always thought it's a good idea.",
        "To be honest, I've always think it's a good idea.",
      ]),
      sit("mix", "You visited a small village. People were very kind there, and you have believed for years that small places are friendlier. What do you say?", [
        "What strikes me is how kind people are. I've always thought small places are friendlier.",
        "What strike me is how kind people are. I've always thought small places are friendlier.",
        "What strikes me is how kind people are. I've always think small places are friendlier.",
      ]),
    ],
    success: "The learner uses at least two of the target phrases naturally while expressing real opinions.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase shows you are sharing a long-term belief?", [
        "I've always thought",
        "To be honest",
        "What strikes me is",
      ], 0),
      qfill("___, I am not really interested in that subject.", ["To be honest","to be honest"]),
      qmcq("Which phrase would you use to introduce something that surprises or impresses you?", [
        "What strikes me is",
        "I've always thought",
        "To be honest",
      ], 0),
      qfill("___ how connected people are now.", ["What strikes me is","what strikes me is"]),
    ],
    scenes: [
      sc("Sophie", "friend", "to hear your real opinion about a news story",
        "You are sitting with a friend in a cafe, talking about a recent news event.",
        "Share your honest thoughts and feelings about the news topic.",
        "Some cities want to stop cars in the city centre. What do you really think about that idea?", "curious"),
      sc("David", "colleague", "to discuss your opinions about a new project idea",
        "You are in the office kitchen chatting with a colleague about a new project proposal.",
        "Express your true feelings and opinions about the project.",
        "Our boss wants everyone to work four days a week, ten hours a day. What's your honest opinion?", "friendly"),
      sc("Maria", "fellow traveller", "to talk about your experiences in a new country",
        "You are waiting at a train station with another traveller, discussing your impressions of the country.",
        "Share your genuine thoughts and feelings about your travel experiences.",
        "You've been in this country for a week now. What surprises you most about it?", "curious"),
      sc("Dr. Wilson", "seminar leader", "to encourage you to share your personal views on a class topic",
        "During a seminar, your teacher invites you to discuss your thoughts on a controversial subject.",
        "Give your honest opinions and feelings about the seminar topic.",
        "Today's question is: should all students learn a second language at school? What do you really think?", "friendly"),
      sc("Mr. Carter", "examiner", "to find out your genuine opinion on a familiar subject",
        "You are in a speaking exam and the examiner asks you about a topic you care about.",
        "Clearly express your true thoughts and feelings on the subject.",
        "Choose a topic you really care about, like sport, music or the environment. What do you think about it?", "curious"),
    ],
  },
  {
    id: "b1-telling-it-like-it-is",
    topic: "giving your honest view even when it is uncomfortable",
    objectives: [
      "Use phrases to express an honest opinion politely.",
      "Give feedback that may be uncomfortable to hear.",
      "Soften criticism using common expressions.",
    ],
    goal: "The learner can give honest feedback or opinions, even if they are negative, in a respectful way.",
    target: "Phrases: I have to say, if I'm honest, no offence but",
    correction: "Prompt the learner to use one of the target phrases if missing or used incorrectly.",
    summary: "You learned how to give honest feedback, even if it is uncomfortable. You practised using polite phrases to share your true opinion.",
    minutes: 7,
    points: [
      {
        form: "I have to say",
        claims: [
          "Use 'I have to say' to introduce an honest opinion, especially if it may not be positive.",
          "This phrase prepares the listener for feedback that may be direct.",
          "It shows you are being open and sincere.",
        ],
        ex: [
          "I have to say, your report is very detailed.",
          "I have to say, I expected something different.",
        ],
      },
      {
        form: "if I'm honest",
        claims: [
          "Use 'if I'm honest' to show you are telling the truth, even if it is difficult.",
          "This phrase can make your feedback sound less harsh.",
          "It signals you are sharing your real thoughts.",
        ],
        ex: [
          "If I'm honest, I think the design could be improved.",
          "If I'm honest, this part was a bit confusing.",
        ],
      },
      {
        form: "no offence but",
        claims: [
          "Use 'no offence but' to warn that your next words may sound critical.",
          "This phrase helps to soften negative feedback.",
          "It shows you do not want to hurt the other person's feelings.",
          "Even with this phrase, your words can still sound rude, so use it only with people you know well.",
        ],
        ex: [
          "No offence, but I think you could do better next time.",
          "No offence, but I do not agree with your idea.",
        ],
      },
    ],
    ex: [],
    drills: [
      // p1 — I have to say
      fc("p1", "I have ___ say, the food here is excellent.", ["to", "for", "that"]),
      sit("p1", "Your friend cooked dinner. You want to give your honest opinion: it was really good. What do you say?", [
        "I have to say, it was delicious.",
        "I have say, it was delicious.",
        "I have to saying, it was delicious.",
      ]),
      lc("p1", "I have to say, it was a bit long.", ["I have to go, it's a bit late.", "I want to say it was great."]),
      // p2 — if I'm honest
      fc("p2", "If I'm ___, the second part was a bit boring.", ["honest", "honestly", "honesty"]),
      chat("p2", ["What did you think of my presentation?", null], [
        "If I'm honest, it was too long.",
        "If I'm honestly, it was too long.",
        "If I honest, it was too long.",
      ]),
      spk("p2", "If I'm honest, I think it needs more work."),
      // p3 — no offence, but
      fc("p3", "No ___, but I think your plan is too risky.", ["offence", "offend", "offensive"]),
      sit("p3", "Your friend asks about his new haircut. You don't like it, and you want to warn him that your words may sound critical. What do you say?", [
        "No offence, but it's too short.",
        "No offend, but it's too short.",
        "Not offence, but it's too short.",
      ]),
      la("p3", "No offence, but I don't agree with you.", ["offend"]),
      // karışık
      chat("mix", ["Be honest. What do you think of my new website?", null], [
        "I have to say, it looks great. If I'm honest, the text is a bit small.",
        "I have to say, it looks great. If I'm honestly, the text is a bit small.",
        "I have say, it looks great. If I'm honest, the text is a bit small.",
      ]),
      sit("mix", "A close friend asks about her report. You think the ideas are good, but you want to warn her about a criticism: it is too long. What do you say?", [
        "I have to say, the ideas are good. No offence, but it's too long.",
        "I have to say, the ideas are good. No offend, but it's too long.",
        "I have to saying, the ideas are good. No offence, but it's too long.",
      ]),
    ],
    success: "Learner uses at least two target phrases to introduce honest feedback in a respectful way.",
    maxTurns: 10,
    quiz: [
      qmcq("Which phrase can you use to introduce honest feedback that may be uncomfortable?", [
        "No offence, but",
        "Nice to meet you",
        "See you soon",
      ], 0),
      qfill("___, I think you could organise your ideas better.", ["If I'm honest","if I'm honest"]),
      qmcq("What does 'I have to say' do in a conversation?", [
        "It introduces an honest opinion.",
        "It asks a question.",
        "It ends a conversation.",
      ], 0),
      qfill("___ I do not really like the colours you chose.", ["No offence, but","no offence, but"]),
    ],
    scenes: [
      sc("Lucy", "friend", "to get your honest opinion about her homemade cake",
        "You are at Lucy's house and she offers you a slice of cake she baked herself.",
        "Give respectful but honest feedback about the cake, using the target phrases.",
        "Imagine you just tasted my cake. It's sweet, but a bit dry. What do you honestly think?", "friendly"),
      sc("Mark", "colleague", "to hear your true thoughts on his project presentation",
        "After a team meeting, Mark asks for your feedback on his project presentation.",
        "Share your honest opinion about Mark's presentation in a respectful way.",
        "In my presentation today, I talked for forty minutes and showed sixty slides. What did you honestly think of it?", "curious"),
      sc("Sophie", "hotel receptionist", "to know if you liked your stay at the hotel",
        "You are checking out of a hotel and Sophie asks about your experience.",
        "Give honest feedback about your hotel stay, even if some things were not perfect.",
        "Thank you for staying with us! Before you go, what did you honestly think of your stay?", "friendly"),
      sc("Dr. Patel", "seminar leader", "to get your honest feedback on the seminar",
        "At the end of a seminar, Dr. Patel asks for your opinion about the session.",
        "Give honest and respectful feedback about the seminar.",
        "Today's seminar was three hours long with no break. What did you think of the session?", "curious"),
      sc("Mr. Carter", "examiner", "to assess your ability to give honest feedback in English",
        "In a speaking exam, Mr. Carter asks you to give your honest opinion about a classmate's presentation.",
        "Demonstrate that you can give honest but respectful feedback using the target phrases.",
        "Imagine your classmate gave a presentation. It was interesting, but she read every word from her notes. What feedback do you give her?", "friendly"),
    ],
  },
];
