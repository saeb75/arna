/** A2 · Ünite 8-9 — Getting Things Done · People and Things (14 ders).
 *
 *  Ünite 8'de TEK BİR gramer dersi yok ve bu kasıtlı: bu seviyede öğrenciyi
 *  kilitleyen şey gramer değil, işlem yapamamak. Rica etmek, kibarca reddetmek,
 *  rezervasyon, şikâyet, tekrar isteme ve baştan sona telefonla sorun çözme —
 *  hepsi kalıp ve uygulama dersi.
 *
 *  Ünite 9 betimlemeyi uzatıyor: ilgi cümlecikleri, dönüşlü zamirler, other/another,
 *  used to, görüş bildirme ve -ed/-ing sıfat çifti. A2'nin kapanışı bir tavsiye
 *  dersi — öğrenci artık bir şeyi anlatıp savunabiliyor.
 */
import { arr, chat, err, fc, la, lc, pairs, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const A2_U8_9: Authored[] = [
  // --- Ünite 8 · Getting Things Done -----------------------------------------
  {
    id: "a2-would-you-mind",
    topic: "asking a stranger for a small favour",
    objectives: [
      "Make a polite request with 'would you mind'.",
      "Answer a 'would you mind' question correctly.",
    ],
    goal: "Ask a stranger for a small favour without sounding rude.",
    target: "polite requests with would you mind",
    correction: "Model the request and the natural answer, then let the learner try both.",
    summary: "You learned to ask politely with 'would you mind' and to answer it the right way.",
    minutes: 7,
    points: [
      {
        form: "would you mind + -ing",
        claims: [
          "'Would you mind' is followed by a verb with -ing, not by 'to'.",
          "It is one of the most polite ways to ask a stranger for something.",
        ],
        ex: ["Would you mind moving your bag?", "Would you mind waiting a moment?"],
      },
      {
        form: "not at all",
        claims: [
          "The question asks whether something bothers you, so 'no' means yes.",
          "'Not at all' and 'of course not' both mean you agree happily.",
        ],
        ex: ["Not at all, go ahead.", "Of course not, take your time."],
      },
      {
        form: "sorry, I'm afraid",
        claims: [
          "To refuse, start with 'sorry' and give a short reason.",
          "A bare 'no' sounds abrupt in this situation.",
        ],
        ex: ["Sorry, I'm afraid I need it.", "I'm afraid I can't right now."],
      },
    ],
    ex: [],
    drills: [
      // p1 — would you mind + -ing
      fc("p1", "Would you mind ___ the door?", ["closing", "to close", "close"]),
      arr("p1", "Would you mind waiting a moment?", ["wait"]),
      sit("p1", "A stranger's coat is on the seat you want. You ask politely. What do you say?", [
        "Would you mind moving your coat?",
        "Would you mind to move your coat?",
        "Would you mind move your coat?",
      ]),
      lc("p1", "Would you mind waiting here?", ["Would you mind sitting here?", "Would you wait here?"]),
      // p2 — not at all / of course not
      chat("p2", ["Would you mind holding my coffee for a second?", null], [
        "Not at all, go ahead.",
        "No at all, go ahead.",
        "Not at all, goes ahead.",
      ]),
      sit("p2", "Someone asks: 'Would you mind waiting a moment?' You are happy to wait. What do you say?", [
        "Of course not, take your time.",
        "Of course, I mind.",
        "Of course not, take you time.",
      ]),
      spk("p2", "Not at all, go ahead."),
      // p3 — sorry, I'm afraid
      fc("p3", "Sorry, I'm ___ I need it.", ["afraid", "afraided", "fear"]),
      sit("p3", "A stranger asks you to move your bag. You can't, because there is no other place for it. You refuse politely. What do you say?", [
        "Sorry, I'm afraid there's no other place for it.",
        "Not at all, there's no other place for it.",
        "Sorry, I afraid there's no other place for it.",
      ]),
      la("p3", "I'm afraid I can't right now.", ["afraided"]),
      // karışık
      chat("mix", ["Would you mind waiting a moment?", "Not at all.", "Thanks. And would you mind moving your bag?", null], [
        "Sorry, I'm afraid I need it here.",
        "Not at all, I'm afraid I need it here.",
        "Sorry, I afraid I need it here.",
      ]),
      lc("mix", "Would you mind closing the door? Of course not.", [
        "Would you mind closing the door? Of course.",
        "Would you mind closing the window? Of course not.",
      ]),
    ],
    success: "The learner makes a correct 'would you mind' request and produces both an agreeing reply and a polite refusal.",
    quiz: [
      qmcq("Which request is correct?", [
        "Would you mind opening the window?",
        "Would you mind to open the window?",
        "Would you mind open the window?",
      ], 0),
      qfill("___ at all, go ahead.", ["Not"]),
      qmcq("Which answer refuses politely?", [
        "Sorry, I'm afraid I need it.",
        "No.",
        "That is impossible.",
      ], 0),
    ],
    scenes: [
      sc("Marisa", "a stranger on a busy train", "to sort out the seats without friction",
        "The train is full and bags are on the seats.",
        "Ask politely for what you need.",
        "Excuse me, would you mind moving your bag?", "distracted"),
      sc("Theo", "a colleague in a shared office", "to agree on the shared space",
        "The shared office is noisy and you need to concentrate.",
        "Make a polite request.",
        "It's noisy in here. Would you mind closing the door?", "considerate"),
      sc("Nala", "a stranger at a busy cafe", "to share a table with you",
        "Every table is taken and you need a seat.",
        "Ask politely to share.",
        "Excuse me, would you mind watching my coffee for a minute?", "friendly"),
      sc("Mr. Duarte", "your teacher", "to practise polite requests",
        "The class is practising requests with strangers.",
        "Make and answer polite requests.",
        "Imagine my bag is on your seat. What do you ask me?", "encouraging"),
      sc("Ms. Beaumont", "the examiner", "to check polite request forms",
        "The examiner sets up a small social situation.",
        "Make the request and answer correctly.",
        "Imagine my coat is on the seat you want. What do you ask me?", "neutral"),
    ],
  },

  {
    id: "a2-im-sorry-i-cant",
    topic: "saying no politely",
    objectives: [
      "Turn down an invitation without offending anyone.",
      "Leave the door open for another time.",
    ],
    goal: "Say no to an invitation you would like to accept.",
    target: "refusing politely and apologising",
    correction: "Model the softened refusal and let the learner refuse in their own words.",
    summary: "You learned to refuse politely, give a reason and suggest another time.",
    minutes: 7,
    points: [
      {
        form: "I'm afraid I can't",
        claims: [
          "'I'm afraid' softens bad news and is not about fear.",
          "It usually comes before the refusal, not after it.",
        ],
        ex: ["I'm afraid I can't make it on Friday.", "I'm afraid that won't work for me."],
      },
      {
        form: "sorry about that",
        claims: [
          "A short reason makes a refusal easier to accept.",
          "The reason does not need to be detailed or private.",
        ],
        ex: ["I have something on that evening, sorry about that.", "Sorry about that, it's a busy week."],
      },
      {
        form: "maybe next time",
        claims: [
          "'Maybe next time' keeps the relationship open.",
          "Offering another day shows the refusal is about timing, not the person.",
        ],
        ex: ["Maybe next time.", "Could we do it the following week instead?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm afraid I can't
      fc("p1", "I'm ___ I can't make it on Friday.", ["afraid", "afraided", "fear"]),
      arr("p1", "I'm afraid I can't come tonight.", ["cans"]),
      sit("p1", "Your friend invites you to dinner on Saturday. You work on Saturday. What do you say?", [
        "I'm afraid I can't, I work on Saturday.",
        "I'm afraid I don't can, I work on Saturday.",
        "I'm afraid I can, I work on Saturday.",
      ]),
      lc("p1", "I'm afraid I can't make it.", ["I'm afraid I can't come tonight.", "I'm sure I can make it."]),
      // p2 — sorry about that
      chat("p2", ["Can you come to my party on Friday?", null], [
        "I have something on that evening, sorry about that.",
        "I have something on that evening, sorry about it that.",
        "I have something on that evening, sorry of that.",
      ]),
      spk("p2", "Sorry about that, it's a busy week."),
      fc("p2", "Sorry ___ that, it's a busy week.", ["about", "of", "at"]),
      // p3 — maybe next time
      sit("p3", "You can't go this week, but you want to go another time. What do you say?", [
        "Could we go next week instead?",
        "Could we go last week instead?",
        "Could we going next week instead?",
      ]),
      la("p3", "Maybe next time, then.", ["times"]),
      chat("p3", ["Oh, you can't come? That's a shame.", null], [
        "Yes, sorry. Maybe next time!",
        "Yes, sorry. Maybe next times!",
        "Yes, sorry. Maybe the last time!",
      ]),
      // karışık
      chat("mix", ["Do you want to come to the cinema tonight?", null], [
        "I'm afraid I can't, sorry about that. Maybe next time?",
        "I'm afraid I can't, sorry about that. Maybe last time?",
        "I afraid I can't, sorry about that. Maybe next time?",
      ]),
      spk("mix", "I'm afraid I can't, but maybe next time."),
    ],
    success: "The learner refuses politely, gives a reason and suggests a clear alternative.",
    quiz: [
      qmcq("Which sentence is a polite refusal?", [
        "I'm afraid that won't work for me.",
        "That will not work and that is final.",
        "I will not be doing that.",
      ], 0),
      qfill("Maybe ___ time, when I am less busy.", ["next"]),
      qmcq("Which sentence keeps the door open?", [
        "Could we do it the following week instead?",
        "I never go out on weekdays.",
        "Please do not ask me again.",
      ], 0),
    ],
    scenes: [
      sc("Aurora", "a friend inviting you out", "to get an answer about Friday",
        "A friend has invited you somewhere you cannot go.",
        "Refuse politely and suggest another time.",
        "We're going out on Friday, but you work late on Fridays, right? Can you come?", "hopeful"),
      sc("Bernard", "a colleague organising an after-work event", "to know whether you will join",
        "A work social is planned for an evening you are busy.",
        "Refuse politely and explain briefly.",
        "I know you're busy on Thursday, but can you come for drinks after work?", "casual"),
      sc("Selin", "a host offering an activity", "to include you in the group plan",
        "The group is doing something you cannot join.",
        "Decline politely.",
        "You have an early train tomorrow, I know. Will you come to the old town tonight?", "welcoming"),
      sc("Mrs. Okonkwo", "your teacher", "to practise polite refusals",
        "The class is practising saying no kindly.",
        "Refuse an invitation politely.",
        "Someone invites you out but you are busy. What do you say?", "encouraging"),
      sc("Mr. Halloran", "the examiner", "to check polite refusal language",
        "The examiner invites you to something.",
        "Refuse politely with a reason.",
        "Imagine you are busy this Saturday. Would you like to join our class trip?", "neutral"),
    ],
  },

  {
    id: "a2-a-small-favour",
    topic: "asking people you know for favours",
    objectives: [
      "Ask a neighbour or colleague for a small favour.",
      "Agree to a favour naturally.",
    ],
    goal: "Ask the people around you for small favours and respond to theirs.",
    target: "asking for and granting small favours",
    correction: "Model the request and the natural agreement, then let the learner try again.",
    summary: "You practised asking for small favours and agreeing to them naturally.",
    minutes: 7,
    points: [
      {
        form: "would you mind",
        claims: [
          "With people you know, 'would you mind' still works and stays polite.",
          "Adding the reason first makes the favour easier to accept.",
        ],
        ex: [
          "I'll be away next week. Would you mind taking in any parcels for me?",
          "I have a meeting this afternoon. Would you mind keeping an eye on the front desk?",
        ],
      },
      {
        form: "could you please",
        claims: [
          "'Could you please' is direct but still polite among people who know each other.",
          "'Please' can go after 'could you' or at the end of the request.",
        ],
        ex: ["Could you please water the plants?", "Could you send it to me, please?"],
      },
      {
        form: "no problem",
        claims: [
          "'No problem' and 'sure' agree to a favour without ceremony.",
          "'Any time' adds warmth after you have agreed.",
        ],
        ex: ["No problem, leave it with me.", "Sure, any time."],
      },
    ],
    ex: [],
    drills: [
      // p1 — would you mind (tanıdıklarla)
      sit("p1", "You are away next week and you are expecting some parcels. Your neighbour is at home. What do you ask?", [
        "Would you mind taking in my parcels?",
        "Would you mind to take in my parcels?",
        "Would you mind take in my parcels?",
      ]),
      arr("p1", "Would you mind watering my plants?", ["water"]),
      lc("p1", "Would you mind feeding my cat?", ["Would you mind feeding my dog?", "Would you mind finding my keys?"]),
      // p2 — could you please
      arr("p2", "Could you water the plants, please?", ["waters"]),
      chat("p2", ["I'm going to the shop. Do you need anything?", null], [
        "Yes. Could you please buy some milk?",
        "Yes. Could you please buying some milk?",
        "Yes. Could please you buy some milk?",
      ]),
      spk("p2", "Could you send it to me, please?"),
      // p3 — no problem
      chat("p3", ["Could you water my plants this week?", null], [
        "No problem, leave it with me.",
        "No problems, leave it with me.",
        "No problem, leave it to I.",
      ]),
      sit("p3", "Your colleague thanks you for your help. You want to say you are happy to help again. What do you say?", [
        "Any time.",
        "No time.",
        "Every time.",
      ]),
      la("p3", "Sure, no problem.", ["problems"]),
      // karışık
      chat("mix", ["Would you mind checking my emails while I'm away?", null], [
        "No problem. Could you please tell me what to look for?",
        "No problem. Could you please telling me what to look for?",
        "No problems. Could you please tell me what to look for?",
      ]),
      sit("mix", "You ask your colleague to answer your phone, and she agrees happily. Which conversation is correct?", [
        "Would you mind answering my phone? No problem.",
        "Would you mind to answer my phone? No problem.",
        "Would you mind answering my phone? No problems.",
      ]),
    ],
    success: "The learner makes two polite requests and responds to a favour naturally.",
    quiz: [
      qmcq("Which request is correct?", [
        "Would you mind keeping an eye on it?",
        "Would you mind to keep an eye on it?",
        "Would you mind keep an eye on it?",
      ], 0),
      qfill("Could you ___ send it to me? (please)", ["please"]),
      qmcq("Which reply is a warm agreement?", ["Sure, any time.", "If I must.", "I suppose so."], 0),
    ],
    scenes: [
      sc("Fatima", "the neighbour across the hall", "to help you while you are away",
        "You are away for a week and need a hand.",
        "Ask for two small favours.",
        "I saw your suitcase in the hall. Are you going away? Do you need anything?", "neighbourly"),
      sc("Owen", "a colleague covering for you", "to take over a few small things",
        "You are on leave and a few tasks need covering.",
        "Ask a colleague to cover them.",
        "You're off next week, right? What can I do for you?", "willing"),
      sc("Camille", "someone at your guesthouse", "to help with a small practical problem",
        "You need a small favour from someone staying nearby.",
        "Ask politely and thank them.",
        "You look busy. Can I help you with something?", "kind"),
      sc("Mr. Sorescu", "your teacher", "to practise asking for favours",
        "The class is role-playing favours between neighbours.",
        "Ask for a favour and respond to one.",
        "You are going away for a week. What do you ask your neighbour?", "encouraging"),
      sc("Ms. Nakagawa", "the examiner", "to check favour language",
        "The examiner asks you to make a request.",
        "Ask politely and respond naturally.",
        "Imagine you need my help while you are away. What do you ask me?", "neutral"),
    ],
  },

  {
    id: "a2-booking-a-room",
    topic: "booking a place to stay",
    objectives: [
      "Make a booking on the phone.",
      "Ask what is included in the price.",
    ],
    goal: "Book a room on the phone and check the details.",
    target: "booking accommodation",
    correction: "Model the booking sentence and let the learner make the booking again.",
    summary: "You learned to make a booking and check what is included.",
    minutes: 7,
    points: [
      {
        form: "I'd like to book",
        claims: [
          "'I'd like to book' opens a booking politely and clearly.",
          "Include the room type, the dates and the number of guests; the exact order can vary.",
        ],
        ex: ["I'd like to book a double room.", "I'd like to book a table for four."],
      },
      {
        form: "for two nights",
        claims: [
          "'For' introduces the length of the stay: for two nights, for a week.",
          "'From ... to ...' gives the exact dates.",
        ],
        ex: ["For two nights, please.", "From the fifth to the seventh."],
      },
      {
        form: "is breakfast included",
        claims: [
          "'Is ... included?' checks what the price covers.",
          "Ask before you confirm, not after.",
        ],
        ex: ["Is breakfast included?", "Is there a charge for parking?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'd like to book
      fc("p1", "I'd like ___ a table for four.", ["to book", "book", "booking"]),
      arr("p1", "I'd like to book a single room.", ["booking"]),
      sit("p1", "You call a restaurant. You want a table for two people. What do you say?", [
        "I'd like to book a table for two.",
        "I'd like book a table for two.",
        "I'd like to booking a table for two.",
      ]),
      lc("p1", "I'd like to book a room for Friday.", ["I'd like to book a room for Sunday.", "I'd like to book a table for Friday."]),
      // p2 — for two nights / from ... to ...
      fc("p2", "We want to stay ___ a week.", ["for", "since", "during"]),
      chat("p2", ["How long would you like to stay?", null], [
        "Three nights, from the tenth to the thirteenth.",
        "Three nights, from the tenth at the thirteenth.",
        "Three nights, since the tenth to the thirteenth.",
      ]),
      spk("p2", "For two nights, please."),
      // p3 — is breakfast included
      arr("p3", "Is breakfast included in the price?", ["includes"]),
      sit("p3", "You want to know if the price covers breakfast. What do you ask?", [
        "Is breakfast included?",
        "Is breakfast include?",
        "Does breakfast included?",
      ]),
      la("p3", "Is there a charge for the gym?", ["charges"]),
      // karışık
      chat("mix", ["Good afternoon, Hotel Bella. How can I help?", null], [
        "I'd like to book a room for two nights. Is breakfast included?",
        "I'd like to book a room for two nights. Is breakfast include?",
        "I'd like book a room for two nights. Is breakfast included?",
      ]),
      lc("mix", "A double room for three nights, please.", [
        "A double room for two nights, please.",
        "A single room for three nights, please.",
      ]),
    ],
    success: "The learner makes a complete booking and asks at least one question.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "I'd like to book a double room.",
        "I'd like book a double room.",
        "I'd like to booking a double room.",
      ], 0),
      qfill("___ two nights, please.", ["For"]),
      qmcq("Which question checks the price?", [
        "Is there a charge for parking?",
        "Where is the car park?",
        "How do I get to the car park?",
      ], 0),
    ],
    scenes: [
      sc("Sofia", "the owner of a small hotel", "to take your booking over the phone",
        "You are calling a small family hotel to book.",
        "Make the booking and check the details.",
        "Good afternoon, Hotel Sol. How can I help you?", "welcoming"),
      sc("Mr. Grant", "a company travel coordinator", "to book your work trip correctly",
        "You need accommodation arranged for a work trip.",
        "Give the details and ask what is covered.",
        "I'm booking your work trip. What room do you need?", "efficient"),
      sc("Ilaria", "a hostel receptionist", "to arrange your stay",
        "You are booking a bed for a few nights.",
        "Book and ask what is included.",
        "Hello! Would you like a bed for tonight?", "casual"),
      sc("Mrs. Berg", "your teacher", "to practise booking language",
        "The class is role-playing phone bookings.",
        "Make a complete booking.",
        "Imagine you are calling a hotel. What do you say first?", "encouraging"),
      sc("Mr. Pereira", "the examiner", "to check transactional language",
        "The examiner plays a receptionist.",
        "Make a clear booking with all the details.",
        "Good morning, Riverside Hotel. How may I help you?", "neutral"),
    ],
  },

  {
    id: "a2-something-went-wrong",
    topic: "complaining politely",
    objectives: [
      "Explain what is wrong with something you bought.",
      "Say what you would like the shop to do.",
    ],
    goal: "Take a faulty item back and get it sorted out.",
    target: "complaining politely and asking for a solution",
    correction: "Model the polite complaint and let the learner complain in their own words.",
    summary: "You learned to explain a fault politely and ask for a refund or replacement.",
    minutes: 7,
    points: [
      {
        form: "there's a problem",
        claims: [
          "Open with the problem, calmly and without blaming the person in front of you.",
          "'There's a problem with ...' is neutral and easy to answer.",
        ],
        ex: ["There's a problem with this kettle.", "There's a problem with my order."],
      },
      {
        form: "it doesn't work",
        claims: [
          "Say exactly what is wrong: it doesn't work, it's broken, a part is missing.",
          "A precise fault gets a faster answer than a general complaint.",
        ],
        ex: ["It doesn't work at all.", "It stopped working after two days."],
      },
      {
        form: "could I get a refund",
        claims: [
          "Say what you want: a refund, a replacement or a repair.",
          "'Could I' keeps the request polite even when you are annoyed.",
        ],
        ex: ["Could I get a refund, please?", "Could I exchange it for a new one?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — there's a problem
      fc("p1", "There's a problem ___ this kettle.", ["with", "for", "of"]),
      arr("p1", "There's a problem with my room.", ["is"]),
      lc("p1", "There's a problem with my phone.", ["There's a problem with my phone bill.", "There's no problem with my phone."]),
      // p2 — it doesn't work
      fc("p2", "My new laptop ___ work at all.", ["doesn't", "isn't", "don't"]),
      sit("p2", "Your new headphones worked for two days, and now they don't. What do you say?", [
        "They stopped working after two days.",
        "They stopped working since two days.",
        "They stop working after two days ago.",
      ]),
      fc("p2", "It doesn't ___ when I turn it on.", ["work", "works", "working"]),
      spk("p2", "It doesn't work at all."),
      // p3 — could I get a refund
      chat("p3", ["How can I help you?", null], [
        "This phone is broken. Could I get a refund, please?",
        "This phone is broken. Could I getting a refund, please?",
        "This phone is broken. Could get I a refund, please?",
      ]),
      sit("p3", "Your kettle is broken. You don't want your money back. You want a new kettle. What do you ask?", [
        "Could I get a replacement, please?",
        "Could I get a refund, please?",
        "Could I gets a replacement, please?",
      ]),
      la("p3", "Could I get a new one, please?", ["gets"]),
      // karışık
      chat("mix", ["Hello, what can I do for you?", null], [
        "There's a problem with this kettle. It doesn't work.",
        "There's a problem with this kettle. It doesn't works.",
        "There's a problem for this kettle. It doesn't work.",
      ]),
      spk("mix", "This lamp doesn't work, so could I get a refund?"),
    ],
    success: "The learner explains a fault and asks for a specific solution.",
    quiz: [
      qmcq("Which sentence is a polite complaint?", [
        "There's a problem with my order.",
        "Your shop is terrible.",
        "You sold me a broken thing on purpose.",
      ], 0),
      qfill("Could I ___ it for a new one? (exchange)", ["exchange"]),
      qmcq("Which sentence states what you want?", [
        "Could I get a refund, please?",
        "This is very disappointing.",
        "I bought it last Tuesday.",
      ], 0),
    ],
    scenes: [
      sc("Dilek", "a shop assistant", "to deal with your faulty item",
        "You are at the returns desk with something that broke.",
        "Explain the fault and ask for a solution.",
        "Hello, what can I do for you today?", "professional"),
      sc("Mr. Lowell", "a supplier on the phone", "to resolve a problem with a delivery",
        "A work order arrived damaged.",
        "Explain the problem and ask for a fix.",
        "You called about the delivery. What's the problem?", "businesslike"),
      sc("Anouk", "a hotel manager", "to fix a problem in your room",
        "Something in your room is not working.",
        "Explain politely and ask for it to be fixed.",
        "I hear there is a problem with your room. What is it?", "apologetic"),
      sc("Ms. Kaur", "your teacher", "to practise complaint language",
        "The class is practising polite complaints.",
        "Explain a fault and ask for a solution.",
        "Imagine something you bought is broken. What do you say at the counter?", "encouraging"),
      sc("Mr. Eriksen", "the examiner", "to check complaint language",
        "The examiner plays a shop assistant.",
        "Complain politely and state what you want.",
        "Good morning, is there a problem with your purchase?", "neutral"),
    ],
  },

  {
    id: "a2-can-you-say-that-again",
    topic: "asking someone to repeat or explain",
    objectives: [
      "Ask someone to repeat or slow down.",
      "Ask what a word means.",
    ],
    goal: "Keep a difficult phone conversation going when you cannot follow.",
    target: "asking for repetition and clarification",
    correction: "Model the clarification request and let the learner ask it again.",
    summary: "You learned to ask for repetition, slower speech and the meaning of words.",
    minutes: 7,
    points: [
      {
        form: "could you repeat that",
        claims: [
          "'Could you repeat that, please?' is polite and works in any situation.",
          "'Sorry?' alone also works, but only for short repetitions.",
        ],
        ex: ["Could you repeat that, please?", "Could you say that again?"],
      },
      {
        form: "sorry, I didn't catch",
        claims: [
          "'I didn't catch that' means you did not hear or understand something clearly.",
          "Naming the part you missed helps the speaker repeat the right information.",
        ],
        ex: ["Sorry, I didn't catch the last part.", "Sorry, I didn't catch your name."],
      },
      {
        form: "what does that mean",
        claims: [
          "'What does ... mean?' asks about a word you do not know.",
          "'Could you speak a bit more slowly?' asks about speed, not meaning.",
        ],
        ex: ["What does that word mean?", "Could you speak a bit more slowly, please?"],
      },
    ],
    ex: [],
    drills: [
      // p1 — could you repeat that
      arr("p1", "Could you repeat that, please?", ["repeating"]),
      sit("p1", "You didn't hear the phone number. What do you say?", [
        "Could you repeat that, please?",
        "Could you repeating that, please?",
        "Could repeat you that, please?",
      ]),
      lc("p1", "Could you repeat the number?", ["Could you repeat the name?", "Could you read the number?"]),
      // p2 — sorry, I didn't catch
      chat("p2", ["The meeting is on the twenty-third at ten.", null], [
        "Sorry, I didn't catch the date.",
        "Sorry, I didn't caught the date.",
        "Sorry, I don't catched the date.",
      ]),
      spk("p2", "Sorry, I didn't catch the last part."),
      la("p2", "Sorry, I didn't catch the time.", ["caught"]),
      // p3 — what does that mean
      fc("p3", "What does this word ___?", ["mean", "means", "meaning"]),
      sit("p3", "You don't know the word 'receipt'. What do you ask?", [
        "What does 'receipt' mean?",
        "Could you speak more slowly?",
        "What does 'receipt' means?",
      ]),
      lc("p3", "What does that word mean?", ["What does that sign mean?", "How do you spell that word?"]),
      // karışık
      chat("mix", ["Your booking reference is K-B-seven-two.", null], [
        "Sorry, I didn't catch that. Could you repeat it, please?",
        "Sorry, I didn't catch that. Could you repeating it, please?",
        "Sorry, I didn't caught that. Could you repeat it, please?",
      ]),
      spk("mix", "Sorry, could you say that again more slowly?"),
    ],
    success: "The learner asks for clarification naturally in three different ways.",
    quiz: [
      qmcq("Which request is polite?", [
        "Could you say that again, please?",
        "Say it again.",
        "What? I cannot hear.",
      ], 0),
      qfill("Sorry, I didn't ___ your name.", ["catch"]),
      qmcq("Which sentence asks about speed?", [
        "Could you speak a bit more slowly?",
        "What does that mean?",
        "Could you spell that?",
      ], 0),
    ],
    scenes: [
      sc("Gabriel", "someone calling from a noisy street", "to give you information over a bad line",
        "The line is poor and the caller is speaking fast.",
        "Ask for repetition and clarification.",
        "The meeting starts at seven, but it's noisy here. Did you catch that?", "hurried"),
      sc("Ms. Prentice", "a caller from another company", "to pass on details you must get right",
        "You are taking important details on a phone call.",
        "Ask for repetition where you need it.",
        "Your reference is K-X-four-nine-two-seven, and the date is the eighteenth. Is that clear?", "brisk"),
      sc("Joaquim", "a station announcer you meet at the desk", "to explain the announcement you missed",
        "You missed an announcement and need it explained.",
        "Ask what was said and what it means.",
        "The train to Lyon leaves from platform eleven at nine-forty. Did you get that?", "helpful"),
      sc("Mrs. Lindberg", "your teacher", "to practise clarification requests",
        "The class is practising asking for repetition.",
        "Ask for clarification in different ways.",
        "If you do not understand a word I say, what can you ask?", "encouraging"),
      sc("Mr. Vasquez", "the examiner", "to check clarification language",
        "The examiner speaks quickly on purpose.",
        "Ask for repetition politely.",
        "The registration deadline is the twenty-third, understood?", "neutral"),
    ],
  },

  {
    id: "a2-sorting-out-a-problem",
    topic: "solving a problem on the phone",
    objectives: [
      "Open a call by saying why you are calling.",
      "Work through a problem to a solution.",
    ],
    goal: "Call about an order that never arrived and get it sorted.",
    target: "handling a problem call from start to finish",
    correction: "Model the stage the learner is on and let them carry the call forward.",
    summary: "You practised opening a call, explaining a problem and closing it politely.",
    minutes: 7,
    points: [
      {
        form: "I'm calling about",
        claims: [
          "Open with the reason for the call before any detail.",
          "Give your name and a reference number if you have one.",
        ],
        ex: ["I'm calling about an order that hasn't arrived.", "I'm calling about last week's booking."],
      },
      {
        form: "let me check",
        claims: [
          "'Let me check' is what the other person says while they look.",
          "'Bear with me' and 'one moment' mean the same thing.",
        ],
        ex: ["Let me check that for you.", "One moment, I'll look it up."],
      },
      {
        form: "thanks for your help",
        claims: [
          "Close by confirming what will happen and when.",
          "'Thanks for your help' ends the call warmly.",
        ],
        ex: ["So it will arrive on Thursday. Thanks for your help.", "Thanks for your help, that's clear now."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I'm calling about
      fc("p1", "Hello, I'm calling ___ my booking.", ["about", "for to", "of"]),
      arr("p1", "I'm calling about an order that hasn't arrived.", ["call"]),
      spk("p1", "I'm calling about last week's booking."),
      // p2 — let me check
      chat("p2", ["Hello, I'm calling about my order.", null], [
        "Let me check that for you.",
        "Let me checking that for you.",
        "Let's me check that for you.",
      ]),
      lc("p2", "One moment, I'll look it up.", ["One moment, I'll look at it.", "One moment, I'll book it."]),
      sit("p2", "A customer asks you a question. You need a few seconds to find the answer. What do you say?", [
        "One moment, let me check.",
        "One moment, let me to check.",
        "One moment, let's me check.",
      ]),
      // p3 — thanks for your help
      fc("p3", "Thanks ___ your help.", ["for", "to", "of"]),
      sit("p3", "The agent says your parcel will arrive on Thursday. You want to end the call. What do you say?", [
        "So it will arrive on Thursday. Thanks for your help.",
        "So it will arrive on Thursday. Thanks for you help.",
        "So it arrive on Thursday. Thanks for your help.",
      ]),
      la("p3", "Thanks for your help, have a nice day.", ["helps"]),
      // karışık
      sit("mix", "You call a shop because your order is late. At the end, they solve the problem. What do you say first and last?", [
        "I'm calling about my order. ... Thanks for your help.",
        "I'm calling for my order. ... Thanks for your help.",
        "I'm calling about my order. ... Thanks for you help.",
      ]),
      chat("mix", ["Customer service, how can I help?", "I'm calling about my parcel. It hasn't arrived.", "Let me check... It will arrive tomorrow.", null], [
        "Great, thanks for your help.",
        "Great, thanks for you help.",
        "Great, thank for your help.",
      ]),
    ],
    success: "The learner opens the call, explains the problem, requests and confirms a solution, and closes politely.",
    quiz: [
      qmcq("Which sentence opens a call?", [
        "I'm calling about my delivery.",
        "I called about my delivery.",
        "Call me about my delivery.",
      ], 0),
      qfill("One moment, ___ me check that for you.", ["let"]),
      qmcq("Which sentence closes a call?", [
        "Thanks for your help, that's clear now.",
        "I do not understand you.",
        "Who am I speaking to?",
      ], 0),
    ],
    scenes: [
      sc("Priscilla", "a customer service agent", "to trace your missing order",
        "You are calling about an order that never arrived.",
        "Explain the problem and reach a solution.",
        "Thank you for calling. How can I help today?", "professional"),
      sc("Mr. Osei", "a supplier's account manager", "to resolve a delivery failure",
        "A work delivery has not arrived and a client is waiting.",
        "Explain the situation and agree next steps.",
        "You said it's urgent. What are you calling about?", "attentive"),
      sc("Lucia", "an airline call centre agent", "to help with your delayed luggage",
        "Your luggage did not arrive with your flight.",
        "Explain and agree what happens next.",
        "Baggage services, how can I help you?", "calm"),
      sc("Mr. Wickham", "your teacher", "to practise a full problem call",
        "The class is role-playing complete phone calls.",
        "Handle the call from start to finish.",
        "You are calling about a problem. How do you open the call?", "encouraging"),
      sc("Ms. Roux", "the examiner", "to check a full transactional call",
        "The examiner plays a customer service agent.",
        "Open, explain and close the call.",
        "Customer service, good morning. How can I help?", "neutral"),
    ],
  },

  // --- Ünite 9 · People and Things -------------------------------------------
  {
    id: "a2-the-man-who-helped-me",
    topic: "joining sentences to describe people and things",
    objectives: [
      "Use who for people and which or that for things.",
      "Describe something you cannot name exactly.",
    ],
    goal: "Describe a person or a thing when you do not know the exact word.",
    target: "relative clauses with who, which and that",
    correction: "Repeat the joined sentence and let the learner describe again.",
    summary: "You learned to join two ideas with who, which and that to describe people and things.",
    minutes: 8,
    points: [
      {
        form: "someone who",
        claims: [
          "'Who' introduces defining information about a person.",
          "In informal defining clauses, 'that' can often replace 'who'.",
        ],
        ex: ["The man who helped me was very kind.", "I need someone who speaks Spanish."],
      },
      {
        form: "something that",
        claims: [
          "'Which' and 'that' introduce defining information about a thing.",
          "'That' is very common in everyday defining clauses.",
        ],
        ex: ["It's a thing that opens bottles.", "The bag which I lost was blue."],
      },
      {
        form: "people who live",
        claims: [
          "The describing part comes straight after the noun it describes.",
          "Do not repeat the noun with a pronoun inside the clause.",
        ],
        ex: ["People who live here know the shortcuts.", "The train that leaves at six is faster."],
      },
    ],
    ex: [],
    drills: [
      // p1 — someone who
      fc("p1", "I need someone ___ speaks Spanish.", ["who", "which", "what"]),
      arr("p1", "The man who helped me was very kind.", ["which"]),
      sit("p1", "You want a person to fix your bike. What do you say?", [
        "I need someone who can fix my bike.",
        "I need someone which can fix my bike.",
        "I need someone who he can fix my bike.",
      ]),
      lc("p1", "She's the woman who lives next door.", ["She's the woman who works next door.", "She's the woman who lives near the door."]),
      // p2 — something that
      fc("p2", "It's a thing ___ opens bottles.", ["that", "who", "what"]),
      chat("p2", ["What's a corkscrew?", null], [
        "It's something that opens bottles.",
        "It's something who opens bottles.",
        "It's something what opens bottles.",
      ]),
      la("p2", "I want a phone that takes good photos.", ["who"]),
      // p3 — açıklama isimden hemen sonra, zamir tekrarı yok
      fc("p3", "People who ___ here know the shortcuts.", ["live", "lives", "they live"]),
      sit("p3", "You want to describe the bus. It leaves at nine and it is slow. What do you say?", [
        "The bus that leaves at nine is slow.",
        "The bus that it leaves at nine is slow.",
        "The bus leaves at nine that is slow.",
      ]),
      spk("p3", "People who live here are very friendly."),
      // karışık
      chat("mix", ["Who is Maria?", null], [
        "She's the woman who sells the cake that I love.",
        "She's the woman which sells the cake that I love.",
        "She's the woman who sells the cake who I love.",
      ]),
      lc("mix", "I know someone who has a car that you can use.", [
        "I know someone who has a bike that you can use.",
        "I know someone who has a car that he drives every day.",
      ]),
    ],
    success: "The learner uses a relative clause correctly at least twice.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The train that leaves at six is faster.",
        "The train what leaves at six is faster.",
        "The train that it leaves at six is faster.",
      ], 0),
      qfill("I know a woman ___ works there. (who)", ["who"]),
      qmcq("Which sentence describes a thing?", [
        "The bag which I lost was blue.",
        "The man who I met was tall.",
        "The people who came were early.",
      ], 0),
    ],
    scenes: [
      sc("Ingeborg", "a friend playing a guessing game", "to guess the word you are describing",
        "You cannot remember a word and must describe it instead.",
        "Describe the thing without naming it.",
        "Let's play a game. Describe a thing, and I'll guess it. What is it?", "amused"),
      sc("Rashid", "a colleague you need a contact from", "to find the right person for you",
        "You need to be introduced to someone with a specific skill.",
        "Describe the kind of person you need.",
        "You need help with the website? What kind of person do you need?", "helpful"),
      sc("Cecilia", "a shop assistant in a hardware shop", "to find the item you are describing",
        "You need a tool but do not know its name in English.",
        "Describe the object clearly.",
        "We have most things here. What are you looking for?", "patient"),
      sc("Mr. Tremblay", "your teacher", "to practise relative clauses",
        "The class is playing a describing game.",
        "Describe a person or thing with a relative clause.",
        "Describe something without saying its name. What is it?", "encouraging"),
      sc("Ms. Bianchi", "the examiner", "to check relative clauses",
        "The examiner asks you to describe something indirectly.",
        "Use who, which or that correctly.",
        "Tell me about a person who is important to you. Who is it?", "neutral"),
    ],
  },

  {
    id: "a2-dont-burn-yourself",
    topic: "myself, yourself and each other",
    objectives: [
      "Use reflexive pronouns when the action comes back to the person.",
      "Use 'each other' when people perform an action mutually.",
    ],
    goal: "Talk about doing things alone and looking after yourself.",
    target: "reflexive pronouns and each other",
    correction: "Repeat the sentence with the right pronoun and let the learner say it again.",
    summary: "You learned myself, yourself and each other, and when 'by myself' means alone.",
    minutes: 8,
    points: [
      {
        form: "myself / yourself",
        claims: [
          "Use these when the person doing the action and the person receiving it are the same.",
          "'Don't burn yourself' warns the listener about their own safety.",
          "The full set: myself, yourself, himself, herself, itself, ourselves, themselves.",
        ],
        ex: ["Don't burn yourself, the pan is hot.", "I taught myself to cook."],
      },
      {
        form: "by myself",
        claims: [
          "'By myself' means alone, without help.",
          "'Enjoy yourself' means have a good time, not do something alone.",
        ],
        ex: ["I did it by myself.", "Enjoy yourself this weekend."],
      },
      {
        form: "each other",
        claims: [
          "'Each other' is used when two or more people perform an action mutually.",
          "'They helped each other' is different from 'they helped themselves'.",
        ],
        ex: ["We help each other at work.", "They have known each other for years."],
      },
    ],
    ex: [],
    drills: [
      // p1 — myself / yourself
      fc("p1", "Be careful! Don't cut ___.", ["yourself", "you", "yours"]),
      pairs("p1", [
        ["I", "myself"],
        ["you (one person)", "yourself"],
        ["he", "himself"],
        ["she", "herself"],
        ["we", "ourselves"],
      ]),
      sit("p1", "You learned to play the guitar with no teacher. What do you say?", [
        "I taught myself to play the guitar.",
        "I taught me to play the guitar.",
        "I taught myself play the guitar.",
      ]),
      lc("p1", "Don't burn yourself, the pan is hot.", ["Don't burn yourself, the oven is hot.", "Don't burn the bread, the pan is hot."]),
      // p2 — by myself / enjoy yourself
      fc("p2", "Nobody helped me. I did it by ___.", ["myself", "me", "my"]),
      chat("p2", ["I'm going to a party tonight!", null], ["Great! Enjoy yourself!", "Great! Enjoy you!", "Great! Enjoy by yourself!"]),
      spk("p2", "I live by myself."),
      // p3 — each other
      fc("p3", "Anna helps Tom and Tom helps Anna. They help ___.", ["each other", "themselves", "theirselves"]),
      la("p3", "We call each other every day.", ["others"]),
      sit("p3", "You and your sister talk on the phone every week. What do you say?", [
        "We talk to each other every week.",
        "We talk to ourselves every week.",
        "We talk to each others every week.",
      ]),
      // karışık
      chat("mix", ["Did you paint the room by yourself?", null], [
        "No, my brother and I helped each other.",
        "No, my brother and I helped ourselves.",
        "No, my brother and I helped each others.",
      ]),
      spk("mix", "We cooked it by ourselves."),
    ],
    success: "The learner uses reflexive pronouns and 'each other' correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "They have known each other for years.",
        "They have known themselves for years.",
        "They have known each other themselves for years.",
      ], 0),
      qfill("Enjoy ___ at the party! (you)", ["yourself"]),
      qmcq("Which sentence means alone?", [
        "I did it by myself.",
        "I did it myself proud.",
        "I did it to myself.",
      ], 0),
    ],
    scenes: [
      sc("Malena", "a friend in your kitchen", "to cook together without accidents",
        "Two friends are cooking together in a small kitchen.",
        "Warn and describe who does what.",
        "Careful, that pan is very hot! Do you want help?", "playful"),
      sc("Stefan", "a colleague on a shared task", "to divide a job between you",
        "Two colleagues are splitting a task.",
        "Say what you will do alone and what together.",
        "We can share this job. What do you want to do by yourself?", "collaborative"),
      sc("Aya", "a host showing you the flat", "to make sure you can manage alone",
        "Your host is leaving and you will be alone in the flat.",
        "Say what you can do by yourself.",
        "I'm away until Sunday. Will you be OK by yourself?", "caring"),
      sc("Mrs. Petrov", "your teacher", "to practise reflexive pronouns",
        "The class is describing independent and mutual actions.",
        "Use both forms correctly.",
        "What is something you learned without any help?", "encouraging"),
      sc("Mr. Oduya", "the examiner", "to check reflexive pronouns",
        "The examiner asks about independence and friendship.",
        "Use the correct pronouns.",
        "Could you tell me about something you taught yourself?", "neutral"),
    ],
  },

  {
    id: "a2-the-other-one",
    topic: "other, another and the others",
    objectives: [
      "Choose between another and the other.",
      "Refer to the remaining items in a group.",
    ],
    goal: "Choose between things when the first one is not right.",
    target: "other, another and the others",
    correction: "Repeat the phrase with the right form and let the learner choose again.",
    summary: "You learned the difference between another, the other and the others.",
    minutes: 8,
    points: [
      {
        form: "another one",
        claims: [
          "'Another' means one more or a different one, and is written as one word.",
          "At this level, it is usually used before a singular countable noun: another shop, another one.",
        ],
        ex: ["Could I have another one, please?", "Let's try another shop."],
      },
      {
        form: "the other",
        claims: [
          "'The other one' means the remaining member of a pair.",
          "It avoids repeating the noun when both options are already known.",
        ],
        ex: ["I prefer the other one.", "The other shoe is under the bed."],
      },
      {
        form: "the others",
        claims: [
          "'The others' means all the remaining ones in a group.",
          "'Others' without 'the' means some more, not all the rest.",
        ],
        ex: ["What about the others?", "The others are waiting outside."],
      },
    ],
    ex: [],
    drills: [
      // p1 — another one
      fc("p1", "This cake is great. Can I have ___ piece?", ["another", "other", "others"]),
      fc("p1", "Could I have another ___, please?", ["one", "ones", "the one"]),
      sit("p1", "This shop is closed. You want to go to a different shop. What do you say?", [
        "Let's try another shop.",
        "Let's try other shop.",
        "Let's try an other shop.",
      ]),
      lc("p1", "Could I have another coffee?", ["Could I have another cookie?", "Could I have the other coffee?"]),
      // p2 — the other
      fc("p2", "I have two bags. This one is blue and ___ one is red.", ["the other", "another", "other"]),
      sit("p2", "There are exactly two jackets. You don't like the first one. You like the second one. What do you say?", ["I prefer the other one.", "I prefer another one.", "I prefer the another one."]),
      spk("p2", "I prefer the other one."),
      // p3 — the others
      fc("p3", "Tom is here, but where are ___?", ["the others", "the other", "another"]),
      sit("p3", "Three friends are coming. One is here. You want to know about the two friends who are not here. What do you ask?", [
        "What about the others?",
        "What about another?",
        "What about the other?",
      ]),
      la("p3", "The others are in the car.", ["other"]),
      // karışık
      lc("mix", "I like this one, but what about the others?", [
        "I like this one, but what about that one?",
        "I like the other one, but what about the others?",
      ]),
      chat("mix", ["We have two hotels: this one in the city and one near the beach. You like the beach one best.", null], [
        "I prefer the other one. Are there any others?",
        "I prefer another one. Are there any others?",
        "I prefer the other one. Are there any other?",
      ]),
    ],
    success: "The learner uses another, the other and the others correctly.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "The other shoe is under the bed.",
        "The another shoe is under the bed.",
        "Other shoe is under the bed.",
      ], 0),
      qfill("The ___ are waiting outside. (all the rest)", ["others"]),
      qmcq("Which sentence asks for one more?", [
        "Could I have another one?",
        "Could I have the other one?",
        "Could I have the others?",
      ], 0),
    ],
    scenes: [
      sc("Rosalie", "a shop assistant", "to show you the alternatives",
        "The first item you tried is not right.",
        "Ask about the alternatives.",
        "You don't like that shirt? Do you want another one?", "attentive"),
      sc("Tobias", "a colleague reviewing options", "to work through a list of candidates",
        "Several options are on the table and one has been ruled out.",
        "Talk about the remaining options.",
        "We can say no to this plan. What about the others?", "systematic"),
      sc("Amara", "a waiter", "to bring you something else",
        "Your first choice is not available.",
        "Choose from the alternatives.",
        "I'm afraid that dish is finished. Would you like another one?", "apologetic"),
      sc("Mr. Lindqvist", "your teacher", "to practise other and another",
        "The class is choosing between alternatives.",
        "Use the right form for each situation.",
        "Imagine you have two bags and you don't like one. What do you say?", "encouraging"),
      sc("Ms. Farrell", "the examiner", "to check these forms",
        "The examiner offers you several choices.",
        "Use another, the other and the others correctly.",
        "Imagine I show you three shirts and you don't like the first. What do you say?", "neutral"),
    ],
  },

  {
    id: "a2-i-used-to-play-football",
    topic: "past habits and situations that have changed",
    objectives: [
      "Use 'used to' for repeated past actions and past situations that are no longer true.",
      "Form questions and negatives with 'use to'.",
    ],
    goal: "Talk about past habits and situations that are different now.",
    target: "used to for past habits and past states",
    correction: "Repeat the sentence with the correct form and let the learner say it again.",
    summary: "You learned to talk about past habits and past situations with used to, and to drop the -d in questions.",
    minutes: 8,
    points: [
      {
        form: "I used to",
        claims: [
          "'Used to' plus the base verb describes a repeated past action or a past situation that is no longer true.",
          "With actions it suggests something happened regularly; with state verbs it describes how things were before.",
        ],
        ex: ["I used to play football every Sunday.", "We used to live near the sea."],
      },
      {
        form: "didn't use to",
        claims: [
          "In questions and negatives the -d disappears: did you use to, didn't use to.",
          "This is because 'did' already carries the past.",
        ],
        ex: ["Did you use to play an instrument?", "I didn't use to like coffee."],
      },
      {
        form: "now versus then",
        claims: [
          "'Used to' contrasts with how things are now, so a 'but now' half often follows.",
          "For present habits use the present simple, not 'used to'.",
        ],
        ex: ["I used to smoke, but I stopped years ago.", "We used to walk, but now we drive."],
      },
    ],
    ex: [],
    drills: [
      // p1 — used to
      fc("p1", "I ___ play football every Sunday, but I stopped.", ["used to", "use to", "was used to"]),
      arr("p1", "We used to live near the sea.", ["use"]),
      sit("p1", "When you were a child, you played tennis every week. Now you don't. What do you say?", [
        "I used to play tennis.",
        "I use to play tennis.",
        "I used to playing tennis.",
      ]),
      lc("p1", "We used to live in a small flat.", ["We used to live in a small town.", "We use a small flat."]),
      // p2 — did ... use to / didn't use to
      fc("p2", "I didn't ___ to like coffee.", ["use", "uses", "using"]),
      chat("p2", ["Did you use to play an instrument?", null], [
        "Yes, I used to play the piano.",
        "Yes, I use to play the piano.",
        "Yes, I used to playing the piano.",
      ]),
      la("p2", "Did you use to live here?", ["uses"]),
      // p3 — then vs now
      sit("p3", "Before, you lived with your parents. Now you live alone. What do you say?", [
        "I used to live with my parents, but now I live alone.",
        "I used to live with my parents, but now I used to live alone.",
        "I used to live with my parents, but now I living alone.",
      ]),
      fc("p3", "These days I ___ coffee every morning.", ["drink", "used to drink", "use to drink"]),
      spk("p3", "I used to read a lot, but now I don't."),
      // karışık
      chat("mix", ["Did you use to go out a lot?", null], [
        "No, I didn't use to, but now I go out every weekend.",
        "No, I don't use to, but now I go out every weekend.",
        "No, I didn't use to, but now I used to go out every weekend.",
      ]),
      spk("mix", "We didn't use to have a car, but now we have one."),
    ],
    success: "The learner correctly describes at least two past habits or situations with 'used to'.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We used to walk, but now we drive.",
        "We use to walk, but now we drive.",
        "We used to walking, but now we drive.",
      ], 0),
      qfill("Did she ___ to work here? (use)", ["use"]),
      qmcq("Which sentence describes a stopped habit?", [
        "I used to smoke, but I stopped.",
        "I smoke every day.",
        "I will smoke less.",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "an old friend you have not seen for years", "to catch up on how life has changed",
        "Two old friends are catching up after a long time.",
        "Describe how your life used to be.",
        "It's been five years! What did you use to do in your free time?", "warm"),
      sc("Simone", "a colleague talking about the old office", "to compare how work used to be",
        "The company has changed a lot in recent years.",
        "Describe how things used to be.",
        "You worked here years ago. What did you use to do?", "curious"),
      sc("Emil", "a local showing you the changed town", "to describe how the area has changed",
        "A local is pointing out how the town used to look.",
        "Describe how your own town used to be.",
        "This street was different ten years ago. What did your town use to be like?", "nostalgic"),
      sc("Mrs. Aguilar", "your teacher", "to practise past habits",
        "The class is comparing past and present lives.",
        "Describe past habits.",
        "What did you use to do that you do not do any more?", "encouraging"),
      sc("Mr. Nakamura", "the examiner", "to check 'used to'",
        "The examiner asks how your life has changed.",
        "Describe past habits accurately.",
        "How was your life different a few years ago? What did you use to do?", "neutral"),
    ],
  },

  {
    id: "a2-what-do-you-think",
    topic: "giving an opinion and reacting to one",
    objectives: [
      "Give an opinion clearly.",
      "Agree or disagree without being rude.",
    ],
    goal: "Have a friendly disagreement about something everyday.",
    target: "giving opinions, agreeing and disagreeing",
    correction: "Model the softened disagreement and let the learner respond again.",
    summary: "You learned to give an opinion and to agree or disagree politely.",
    minutes: 7,
    points: [
      {
        form: "I think so",
        claims: [
          "'I think so' agrees with what was just said without repeating it.",
          "'I don't think so' is the usual negative, rather than 'I think not'.",
        ],
        ex: ["I think so, yes.", "I don't think so, actually."],
      },
      {
        form: "you're right",
        claims: [
          "'You're right' and 'exactly' agree strongly.",
          "'That's a good point' agrees with part of what was said.",
        ],
        ex: ["You're right, I didn't think of that.", "That's a good point."],
      },
      {
        form: "I don't agree",
        claims: [
          "Soften disagreement with 'I'm not sure' or 'I see what you mean, but'.",
          "A bare 'you are wrong' sounds harsh in most conversations.",
        ],
        ex: ["I don't agree, I'm afraid.", "I see what you mean, but I think it's different."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I think so / I don't think so
      sit("p1", "Your friend asks: 'Is the museum free today?' You believe it is, but you are not completely sure. What do you say?", [
        "I think so.",
        "I think yes so.",
        "I think it so.",
      ]),
      sit("p1", "Your friend asks: 'Is it far?' You believe it is NOT far. What do you say?", [
        "I don't think so.",
        "I think not so.",
        "I don't think it.",
      ]),
      lc("p1", "I don't think so, actually.", ["I don't think so, honestly.", "I think so, actually."]),
      // p2 — you're right
      fc("p2", "You're ___, I didn't think of that.", ["right", "true", "correct me"]),
      chat("p2", ["We should leave early because of the traffic.", null], [
        "You're right, let's go at seven.",
        "You're true, let's go at seven.",
        "You right, let's go at seven.",
      ]),
      spk("p2", "You're right, I didn't think of that."),
      // p3 — I don't agree (kibarca)
      sit("p3", "Your colleague says the meeting was great. You think it was too long. You want to disagree politely. What do you say?", [
        "I see what you mean, but it was too long.",
        "You are wrong, it was too long.",
        "I see what you mean, it was great.",
      ]),
      fc("p3", "I don't ___, I'm afraid.", ["agree", "agreed", "agreeing"]),
      la("p3", "I see what you mean, but I don't agree.", ["agrees"]),
      // karışık
      chat("mix", ["Cities are better than villages.", null], [
        "You're right about the jobs, but I don't agree about the noise.",
        "You're right about the jobs, but I don't agreed about the noise.",
        "You right about the jobs, but I don't agree about the noise.",
      ]),
      spk("mix", "I see what you mean, but I don't think so."),
    ],
    success: "The learner gives an opinion and responds politely to another one.",
    quiz: [
      qmcq("Which reply agrees?", [
        "That's a good point.",
        "That makes no sense.",
        "I have no idea.",
      ], 0),
      qfill("I ___ think so, actually. (do not)", ["don't"]),
      qmcq("Which reply disagrees politely?", [
        "I'm not sure about that.",
        "You are wrong.",
        "Stop talking about it.",
      ], 0),
    ],
    scenes: [
      sc("Barbara", "a friend with strong opinions", "to argue a point with you over coffee",
        "Two friends are having a light disagreement.",
        "Give your opinion and respond to theirs.",
        "I think the old days were better. Do you agree?", "provocative"),
      sc("Ivan", "a colleague in a team discussion", "to reach a shared view on a small decision",
        "The team disagrees about a small process change.",
        "State your view and respond to others.",
        "I think we should work from home on Fridays. What do you think?", "open"),
      sc("Zainab", "someone you meet at a dinner", "to discuss a light topic",
        "A friendly dinner conversation turns to opinions.",
        "Give and respond to opinions.",
        "I think big cities are the best places to live. Do you agree?", "sociable"),
      sc("Mr. Steiner", "your teacher", "to practise opinion language",
        "The class is debating an everyday topic.",
        "Give your opinion and respond politely.",
        "Is it better to live in a city or in the countryside? What do you think?", "encouraging"),
      sc("Ms. Coelho", "the examiner", "to check opinion language",
        "The examiner states an opinion for you to respond to.",
        "Agree or disagree politely with reasons.",
        "I believe everyone should learn two languages at school. Do you agree?", "neutral"),
    ],
  },

  {
    id: "a2-boring-or-bored",
    topic: "the difference between -ing and -ed describing words",
    objectives: [
      "Use -ing words for the thing that causes the feeling.",
      "Use -ed words for the person who feels it.",
    ],
    goal: "Describe both a film and your reaction to it.",
    target: "-ed and -ing adjective pairs",
    correction: "Contrast the two forms in one sentence and let the learner choose again.",
    summary: "You learned that -ing describes the thing and -ed describes the person.",
    minutes: 8,
    points: [
      {
        form: "it was boring",
        claims: [
          "The -ing form describes the thing that causes the feeling.",
          "A film, a book or a job can be boring, interesting or tiring.",
        ],
        ex: ["The film was boring.", "That was a tiring journey."],
      },
      {
        form: "I was bored",
        claims: [
          "The -ed form describes the person who has the feeling.",
          "Saying 'I am boring' means other people find you dull.",
        ],
        ex: ["I was bored after ten minutes.", "We were all tired by the end."],
      },
      {
        form: "really interesting",
        claims: [
          "The same pair works for many words: interesting and interested, surprising and surprised.",
          "'Really' and 'quite' can go before either form.",
        ],
        ex: ["The talk was really interesting.", "I was very interested in the second part."],
      },
    ],
    ex: [],
    drills: [
      // p1 — -ing: the thing
      fc("p1", "The film was very long and slow. It was ___.", ["boring", "bored", "bore"]),
      sit("p1", "The book had lots of new ideas. You liked it. What do you say?", [
        "It was really interesting.",
        "It was really interested.",
        "It was really interest.",
      ]),
      arr("p1", "That was a tiring day.", ["tired"]),
      lc("p1", "The film was boring.", ["The film was amazing.", "The match was boring."]),
      // p2 — -ed: the person
      fc("p2", "The film did not interest me. After ten minutes, I felt ___.", ["bored", "boring", "bore"]),
      chat("p2", ["How did you feel at the end of the trip?", null], ["I was really tired.", "I was really tiring.", "I really tired."]),
      spk("p2", "I was bored after ten minutes."),
      // p3 — interesting / interested, surprising / surprised
      fc("p3", "I was very ___ in the second part of the talk.", ["interested", "interesting", "interest"]),
      sit("p3", "Your friend told you some news. You didn't expect it at all. How did you feel?", [
        "I was surprised.",
        "I was surprising.",
        "I surprised.",
      ]),
      la("p3", "The talk was really interesting.", ["interested"]),
      // karışık
      chat("mix", ["How was the museum?", null], [
        "It was really interesting, but I was tired at the end.",
        "It was really interested, but I was tired at the end.",
        "It was really interesting, but I tired at the end.",
      ]),
      spk("mix", "The film was boring and I was bored."),
    ],
    success: "The learner uses both forms correctly in the same answer.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "We were all tired by the end.",
        "We were all tiring by the end.",
        "We were all tire by the end.",
      ], 0),
      qfill("That was a ___ journey, eight hours on a bus. (tire)", ["tiring"]),
      qmcq("Which sentence is correct?", [
        "I was surprised by the ending.",
        "I was surprising by the ending.",
        "I was surprise by the ending.",
      ], 0),
    ],
    scenes: [
      sc("Nikoletta", "a friend who saw the same film", "to compare reactions to it",
        "Two friends saw the same film and disagree about it.",
        "Describe the film and your reaction.",
        "I loved the film! What did you think of it?", "eager"),
      sc("Piotr", "a colleague back from a conference", "to compare notes on the sessions",
        "Two colleagues attended the same event.",
        "Describe the sessions and your reactions.",
        "Three days of talks! Were they interesting?", "reflective"),
      sc("Hana", "a fellow guest at a cultural evening", "to talk about the performance",
        "You both attended a local performance.",
        "Describe it and your reaction.",
        "That was a long show. How was it for you?", "curious"),
      sc("Mrs. Weber", "your teacher", "to practise the adjective pair",
        "The class is describing films and reactions.",
        "Use both forms correctly.",
        "Tell me about a film you saw. Was it interesting?", "encouraging"),
      sc("Mr. Ozturk", "the examiner", "to check the adjective pair",
        "The examiner asks about a recent experience.",
        "Describe the event and your reaction.",
        "Could you tell me about a film or event you saw recently?", "neutral"),
    ],
  },

  {
    id: "a2-a-film-worth-watching",
    topic: "recommending something",
    objectives: [
      "Recommend a film or a book and say what it is about.",
      "Give a reason someone should try it.",
    ],
    goal: "Convince a friend to watch or read something.",
    target: "recommending and justifying",
    correction: "Model the recommendation and let the learner recommend in their own words.",
    summary: "You practised recommending something, saying what it is about and why it is worth it.",
    minutes: 7,
    points: [
      {
        form: "it's about",
        claims: [
          "'It's about' introduces the subject in one or two sentences.",
          "Keep it short: too much detail spoils the story.",
        ],
        ex: ["It's about a family that moves to another country.", "It's about how cities change."],
      },
      {
        form: "you should watch",
        claims: [
          "'You should watch' or 'you should read' makes a direct recommendation.",
          "'It's worth watching' is a softer way of saying the same thing.",
        ],
        ex: ["You should watch it before the sequel comes out.", "It's worth reading, even if it's long."],
      },
      {
        form: "I'd recommend it",
        claims: [
          "'I'd recommend it' can stand alone or be followed by 'to' plus a person.",
          "Add 'if you like ...' to help the other person judge.",
        ],
        ex: ["I'd recommend it to anyone.", "I'd recommend it if you like true stories."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it's about
      fc("p1", "It's ___ a family that moves to Canada.", ["about", "of", "on"]),
      sit("p1", "Your friend asks about a book. It is the story of a dog that finds its way home. What do you say?", [
        "It's about a dog that finds its way home.",
        "It's about a dog who it finds its way home.",
        "It's of a dog that finds its way home.",
      ]),
      lc("p1", "It's about two sisters.", ["It's about two cities.", "It's for two sisters."]),
      // p2 — you should watch
      fc("p2", "You ___ watch it. It's great!", ["should", "should to", "shoulds"]),
      arr("p2", "You should read this book.", ["reading"]),
      spk("p2", "You should watch it."),
      // p3 — I'd recommend it
      chat("p3", ["Is the book good?", null], [
        "Yes, I'd recommend it to anyone.",
        "Yes, I'd recommend it anyone.",
        "Yes, I'd recommend to it anyone.",
      ]),
      fc("p3", "I'd recommend it ___ you like funny films.", ["if", "what", "so"]),
      la("p3", "I'd recommend it to my friends.", ["recommends"]),
      // karışık
      chat("mix", ["What should I watch tonight?", null], [
        "You should watch Star Road. It's about a girl who travels in space.",
        "You should to watch Star Road. It's about a girl who travels in space.",
        "You should watch Star Road. It's about a girl which travels in space.",
      ]),
      sit("mix", "You loved a book about a chef in Paris. Your friend likes cooking. What do you say?", [
        "It's about a chef in Paris. I'd recommend it if you like cooking.",
        "It's about a chef in Paris. I'd recommend it if you likes cooking.",
        "It's of a chef in Paris. I'd recommend it if you like cooking.",
      ]),
    ],
    success: "The learner recommends something with a summary and a reason.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "It's worth reading, even if it's long.",
        "It's worth to read, even if it's long.",
        "It's worth read, even if it's long.",
      ], 0),
      qfill("It's ___ how cities change over time.", ["about"]),
      qmcq("Which sentence gives a reason to try it?", [
        "I'd recommend it if you like true stories.",
        "I saw it in the cinema.",
        "It is two hours long.",
      ], 0),
    ],
    scenes: [
      sc("Lorenzo", "a friend with nothing to watch", "to get a recommendation from you",
        "A friend cannot decide what to watch tonight.",
        "Recommend something and explain why.",
        "I can't choose a film. What should I watch?", "bored"),
      sc("Ndidi", "a colleague on a long commute", "to find something for the journey",
        "A colleague wants something to read on a long trip.",
        "Recommend something with reasons.",
        "I have a long train trip tomorrow. What should I read?", "practical"),
      sc("Jonas", "a fellow traveller swapping books", "to trade recommendations",
        "Travellers are exchanging books at a hostel.",
        "Recommend one and explain why.",
        "I've finished my book. Can you recommend a good one?", "easy-going"),
      sc("Ms. Bergqvist", "your teacher", "to practise recommending",
        "The class is recommending books and films.",
        "Recommend something with a summary and reason.",
        "Recommend something to the class. What is it about?", "encouraging"),
      sc("Mr. Castellano", "the examiner", "to check recommendation language",
        "The examiner asks for a recommendation.",
        "Recommend clearly with a reason.",
        "Could you recommend a film or book to me and tell me why?", "neutral"),
    ],
  },
];
