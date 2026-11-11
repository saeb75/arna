/** C1 · Ünite 5-7 — Building an Argument · Narrative Craft · Precision (20 ders).
 *
 *  Ünite 5'te HİÇ gramer dersi yok ve bu kasıtlı: argüman kurmak bir yapı sorunu
 *  değil, sıralama sorunu. Adımı işaretlemek, ödün vermek, nedensellik iddiasını
 *  ölçülü tutmak, karşı görüşü DÜRÜSTÇE kurmak, itirazı önceden karşılamak.
 *  Ünite baskı altında savunmayla kapanıyor.
 *
 *  Ünite 6 anlatı zanaatı: tek gramer dersi devrik açılış (`little did they know`),
 *  gerisi tempo, ayıklama ve başkasının sözünü canlı aktarma. Aynı hikâye iki kez
 *  anlatılıyor — bu ünitenin sınavı o.
 *
 *  Ünite 7 kesinlik: karıştırılan kelime çiftleri, onay ölçeği, iddiaya ne kadar
 *  mesafe koyacağın, eğilim ifade etme, ve doğru kelimeyi ARARKEN konuşmayı
 *  sürdürebilmek. Son ders aynı içeriği üç register'da veriyor.
 *
 *  Oyun bloğu (drills, 10 Kas 2026): her derste 11 madde — her öğretim maddesine 3
 *  + 2 gerçek karışık. C1'de çeldiriciler çoğunlukla BİÇİM hatasıdır: işlev seçtiren
 *  maddede yanlış şık durumla açıkça çelişir (dsl.ts kural 13).
 *
 *  PARTİ 1 İNCELEMESİNDEN: öğretim örnekleri TAM CÜMLE olur; örnek cevap kendi
 *  kriterini karşılar; "üç ifadeye cevap ver" diyen görev o ifadeleri VERİR;
 *  iddialar kanıtlanabilir olur (etki iddiası değil, kullanım iddiası).
 */
import { arr, chat, err, fc, la, lc, qfill, qmcq, sc, sit, spk, type Authored } from "./dsl.js";

export const C1_U5_7: Authored[] = [
  // --- Ünite 5 · Building an Argument ----------------------------------------
  {
    id: "c1-given-that-it-follows",
    topic: "signalling the steps of an argument",
    objectives: [
      "Mark the premise and the conclusion of a step.",
      "Make the logical move visible to the listener.",
    ],
    goal: "Take a listener through your reasoning one step at a time.",
    target: "signalling logical steps",
    correction: "Model the step marker and let the learner move to the next step.",
    summary: "You learned to mark each step of an argument so the reasoning can be followed.",
    minutes: 8,
    points: [
      {
        form: "given that",
        claims: [
          "'Given that' introduces a premise the speaker treats as established, or assumes for the argument.",
          "It does not prove the premise; it sets it aside so the reasoning can proceed.",
        ],
        ex: ["Given that the deadline is fixed, we must cut scope.", "Given that nobody objected, we proceeded."],
      },
      {
        form: "it follows that",
        claims: [
          "'It follows that' presents the conclusion as following directly from what has been established.",
          "If the listener can accept the premise but reasonably reject the conclusion, the phrase is too strong: state the missing premise first.",
        ],
        ex: ["It follows that we need a second option.", "It follows that the original plan will not work."],
      },
      {
        form: "which means that",
        claims: [
          "'Which means that' draws a consequence without claiming logical necessity.",
          "It is the softer of the two and fits most everyday reasoning.",
        ],
        ex: ["The budget is frozen, which means that hiring stops.", "She has resigned, which means that we are short-staffed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — given that
      fc("p1", "___ that the deadline is fixed, we must cut scope.", ["Given", "Giving", "Give"]),
      sit("p1", "Your team agrees the office closes in May. You build on that fact to say the move must start now. What do you say?", [
        "Given that the office closes in May, we must start the move now.",
        "Given than the office closes in May, we must start the move now.",
        "Giving that the office closes in May, we must start the move now.",
      ]),
      lc("p1", "Given that nobody objected, we proceeded.", ["Nobody objected, so we waited.", "Given the chance, nobody would object."]),
      // p2 — it follows that
      fc("p2", "We must start now, only five people are available, and the plan needs ten. It ___ that we need a smaller plan.", ["follows", "follow", "following"]),
      err("p2", "It follows than we need a second option.", "than", "that"),
      chat("p2", ["Production must continue, our only supplier has just closed, and we can't make the parts ourselves.", null], [
        "It follows that we need a new supplier.",
        "It follow that we need a new supplier.",
        "It follows than we need a new supplier.",
      ]),
      // p3 — which means that
      fc("p3", "She has resigned, ___ that we are short-staffed.", ["which means", "which mean", "what means"]),
      la("p3", "The budget is frozen, which means that hiring stops.", ["mean"]),
      spk("p3", "She has resigned, which means that we are short-staffed."),
      // karışık
      chat("mix", ["Prices go up next week, and we are booking this trip either way. Why book today?", null], [
        "Given that prices go up next week, it follows that waiting until then will cost more.",
        "Given that prices go up next week, it follow that waiting until then will cost more.",
        "Giving that prices go up next week, it follows that waiting until then will cost more.",
      ]),
      sit("mix", "Everyone accepts that the shop closes at six. It is five now, the walk takes an hour, and you must get there by six. You build on that and say the next step is forced. Which is correct?", [
        "Given that the shop closes at six, it follows that we must leave now.",
        "Given that the shop closes at six, it follows than we must leave now.",
        "Giving that the shop closes at six, it follows that we must leave now.",
      ]),
    ],
    success: "The learner marks premises and conclusions so the steps can be followed.",
    quiz: [
      qmcq("Which phrase marks a premise?", ["Given that", "It follows that", "Which means that"], 0),
      qfill("It ___ that the original plan will not work. (follow)", ["follows"]),
      qmcq("When is 'it follows that' too strong?", [
        "when the premise can be accepted but the conclusion rejected",
        "when the sentence is long",
        "when there are two premises",
      ], 0),
    ],
    scenes: [
      sc("Rasheed", "a friend who disagrees with your conclusion", "to see where the reasoning goes",
        "A friend accepts your facts but not your conclusion.",
        "Show the steps between them.",
        "You say we should book the trip today because prices go up next week. I accept the prices, not your conclusion. Can you take me through your reasoning step by step?", "engaged"),
      sc("Halima", "a colleague reviewing a proposal", "to check the reasoning behind a proposal",
        "A proposal's reasoning must be made explicit.",
        "Mark each step.",
        "Your proposal says we should hire two more people. I cannot see how you got there. Can you walk me through the steps?", "rigorous"),
      sc("Anders", "a visa officer", "to follow a request that must be justified",
        "A visa extension must be justified step by step to an official.",
        "Make each step visible.",
        "You want to stay two more months. I need the reasoning, not just the request. Can you take me through it?", "procedural"),
      sc("Professor Osei", "your tutor", "to practise explicit reasoning",
        "The seminar is examining argument structure.",
        "Signal each logical step.",
        "The university wants to cut the library's opening hours to save money. Can you argue for or against it, step by step?", "probing"),
      sc("Ms. Reyes", "the examiner", "to check argument structure",
        "The examiner asks for a reasoned position.",
        "Mark each step clearly.",
        "Could you argue a position and show me each step of the reasoning?", "neutral"),
    ],
  },

  {
    id: "c1-granted-however",
    topic: "conceding in order to strengthen",
    objectives: [
      "Concede a point genuinely before answering it.",
      "Return to your own case without dismissing theirs.",
    ],
    goal: "Give ground on one point to hold ground on the main one.",
    target: "concession as an argumentative move",
    correction: "Model the concession and let the learner return to their own case.",
    summary: "You learned to concede a point genuinely in order to strengthen your own.",
    minutes: 8,
    points: [
      {
        form: "granted that",
        claims: [
          "'Granted that' accepts a point without accepting the conclusion drawn from it.",
          "A concession that costs you nothing is usually spotted as a tactic.",
        ],
        ex: ["Granted that the cost is high, the alternative is higher.", "Granted that it is unusual, it is not unprecedented."],
      },
      {
        form: "I'll admit that",
        claims: [
          "'I'll admit that' concedes a point openly; whether it truly weakens your case depends on what you concede.",
          "Conceding a real weakness makes the rest of the case more credible.",
        ],
        ex: ["I'll admit that the evidence is thin.", "I'll admit that we underestimated the timeline."],
      },
      {
        form: "that notwithstanding",
        claims: [
          "'That notwithstanding' returns to your case after the concession.",
          "It is formal; 'even so' does the same work in ordinary speech.",
        ],
        ex: ["That notwithstanding, the case still holds.", "That notwithstanding, I would proceed."],
      },
    ],
    ex: [],
    drills: [
      // p1 — granted that
      fc("p1", "___ that the cost is high, the alternative is higher.", ["Granted", "Grant", "Grants"]),
      sit("p1", "A friend says your plan is expensive. You accept that point, but not their conclusion. What do you say?", [
        "Granted that it is expensive, it still saves money over time.",
        "Granted than it is expensive, it still saves money over time.",
        "Grants that it is expensive, it still saves money over time.",
      ]),
      lc("p1", "Granted that it is risky, it is worth trying.", ["It is risky, so it is not worth trying.", "Grant me one more day to try."]),
      // p2 — I'll admit that
      fc("p2", "I'll ___ that we underestimated the timeline.", ["admit", "admitted", "admitting"]),
      sit("p2", "Your report's evidence comes from only two small surveys. You want to concede that real weakness. What do you say?", [
        "I'll admit that the evidence is thin.",
        "I'll admit that nothing is ever certain.",
        "I'll admit that some people always complain.",
      ]),
      spk("p2", "I'll admit that the first version was too slow."),
      // p3 — that notwithstanding
      fc("p3", "The risks are real. That ___, I would still proceed.", ["notwithstanding", "notwithstand", "notwithstandings"]),
      chat("p3", ["So you accept the plan has a weak point?", null], [
        "I do. That notwithstanding, the case still holds.",
        "I do. That notwithstand, the case still holds.",
        "I do. That notwithstandings, the case still holds.",
      ]),
      la("p3", "That notwithstanding, I would proceed.", ["notwithstand"]),
      // karışık
      chat("mix", ["Your project is late and over budget. Why continue?", null], [
        "I'll admit that it is late. That notwithstanding, it is nearly finished.",
        "I'll admitted that it is late. That notwithstanding, it is nearly finished.",
        "I'll admit that it is late. That notwithstand, it is nearly finished.",
      ]),
      sit("mix", "A colleague says your plan is risky. You agree that it is risky, then return to your case. Which is correct?", [
        "I'll admit that it's risky. That notwithstanding, it's our best option.",
        "I'll admit than it's risky. That notwithstanding, it's our best option.",
        "I'll admit that it's risky. That notwithstandingly, it's our best option.",
      ]),
    ],
    success: "The learner concedes a real point and returns to the main case.",
    quiz: [
      qmcq("Which phrase returns to your case?", [
        "That notwithstanding,",
        "Granted that,",
        "I'll admit that,",
      ], 0),
      qfill("___ that it is unusual, it is not unprecedented. (grant)", ["Granted"]),
      qmcq("Why concede a real weakness?", [
        "It makes the rest of the case more credible.",
        "It shortens the argument.",
        "It is required in formal English.",
      ], 0),
    ],
    scenes: [
      sc("Ottoline", "a friend who has spotted a flaw", "to see whether you will admit the flaw",
        "A friend has found a genuine weakness in your position.",
        "Concede it and return to your case.",
        "You want to buy a car, but cars cost far more than buses. That is a fair point, isn't it? So why buy one?", "direct"),
      sc("Viktor", "a sceptical board member", "to hear an honest case",
        "A board member is testing whether you will oversell.",
        "Concede the real weakness.",
        "Every proposal has a weak point. What is yours?", "testing"),
      sc("Selin", "a travel agent checking your plan", "to see whether you will admit the weak point",
        "A travel agent has spotted a weakness in your road-trip plan.",
        "Concede it and return to your plan.",
        "Driving the whole coast in four days is exhausting. What do you say to that?", "frank"),
      sc("Mr. Achebe", "your tutor", "to practise concession",
        "The seminar is examining concessive argument.",
        "Concede genuinely and return.",
        "Your proposal is expensive, and that weakens your case. What do you concede before you defend it?", "probing"),
      sc("Ms. Berger", "the examiner", "to check concessive argument",
        "The examiner challenges a position.",
        "Concede fairly and return to the case.",
        "Your position has an obvious weakness. Will you acknowledge it?", "neutral"),
    ],
  },

  {
    id: "c1-correlation-and-cause",
    topic: "being careful about causal claims",
    objectives: [
      "Reject a causal claim without rejecting the evidence.",
      "Offer an alternative explanation for the same pattern.",
    ],
    goal: "Challenge a causal claim without dismissing the data.",
    target: "distinguishing correlation from cause",
    correction: "Model the careful rejection and let the learner challenge the claim again.",
    summary: "You learned to challenge a causal claim while accepting the evidence behind it.",
    minutes: 8,
    points: [
      {
        form: "that doesn't prove",
        claims: [
          "'That doesn't prove' rejects the inference, not the observation.",
          "Separating the two keeps the disagreement narrow and answerable.",
        ],
        ex: ["That doesn't prove the policy caused it.", "That doesn't prove one led to the other."],
      },
      {
        form: "it may simply reflect",
        claims: [
          "'It may simply reflect' offers a rival explanation for the same pattern.",
          "An alternative explanation shows the pattern is compatible with more than one cause.",
        ],
        ex: ["It may simply reflect who was asked.", "It may simply reflect the time of year."],
      },
      {
        form: "correlation isn't causation",
        claims: [
          "'Correlation isn't causation' names the error but does not explain why it applies here.",
          "A plausible alternative shows why the pattern alone does not establish causation.",
        ],
        ex: ["Correlation isn't causation, after all.", "Correlation isn't causation, as we both know."],
      },
    ],
    ex: [],
    drills: [
      // p1 — that doesn't prove
      fc("p1", "The numbers rose after the policy, but that ___ prove the policy caused it.", ["doesn't", "don't", "isn't"]),
      sit("p1", "Sales rose after the new logo. You accept the figures but reject the idea that the logo caused the rise. What do you say?", [
        "The figures are right, but that doesn't prove the logo caused it.",
        "The figures are wrong, so the logo did nothing.",
        "The figures are right, so the logo caused it.",
      ]),
      lc("p1", "That doesn't prove one led to the other.", ["That proves one led to the other.", "That doesn't matter to the others."]),
      // p2 — it may simply reflect
      fc("p2", "The survey looks positive, but it may simply ___ who was asked.", ["reflect", "reflects", "reflected"]),
      chat("p2", ["Complaints doubled in December. The new staff must be worse.", null], [
        "It may simply reflect the holiday season.",
        "It may simply reflects the holiday season.",
        "It may simple reflect the holiday season.",
      ]),
      spk("p2", "It may simply reflect the weather."),
      // p3 — correlation isn't causation
      fc("p3", "Correlation isn't ___, after all.", ["causation", "causing", "caused"]),
      la("p3", "Correlation isn't causation, after all.", ["cause"]),
      sit("p3", "A friend says ice cream sales and sunburn rise together, so ice cream causes sunburn. You name the error. What do you say?", [
        "Correlation isn't causation.",
        "Correlation isn't causing.",
        "Correlations isn't causation.",
      ]),
      // karışık
      chat("mix", ["People who own dogs are healthier. So dogs make people healthy.", null], [
        "That doesn't prove it. It may simply reflect who can afford a dog.",
        "That doesn't prove it. It may simply reflects who can afford a dog.",
        "That don't prove it. It may simply reflect who can afford a dog.",
      ]),
      sit("mix", "Your manager says staff who work from home are more productive, so home working causes it. You name the error and offer another cause. What do you say?", [
        "Correlation isn't causation. It may simply reflect who chose to work from home.",
        "Correlation isn't causation. It may simply reflected who chose to work from home.",
        "Correlation isn't causing. It may simply reflect who chose to work from home.",
      ]),
    ],
    success: "The learner rejects a causal inference while accepting the evidence.",
    quiz: [
      qmcq("Which sentence rejects the inference, not the data?", [
        "That doesn't prove one led to the other.",
        "Those figures are simply wrong.",
        "Nobody should trust that survey.",
      ], 0),
      qfill("It may simply ___ the time of year. (reflect)", ["reflect"]),
      qmcq("Why offer an alternative explanation?", [
        "It shows the pattern alone does not establish causation.",
        "It is required by formal argument.",
        "It makes the objection shorter.",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend convinced by a headline", "to reconsider a causal claim",
        "A friend has accepted a causal claim from a headline.",
        "Challenge the inference, not the data.",
        "The numbers went up right after the policy. That proves it, surely?", "confident"),
      sc("Owen", "a colleague presenting results", "to test the causal claim in a report",
        "A report claims a cause from a correlation.",
        "Challenge it carefully.",
        "Our report says sales rose because of the new website, since both went up in March. Are you doubting the data?", "defensive"),
      sc("Priya", "a hotel manager", "to hear what you think caused the rise",
        "A hotel manager credits a new rooftop bar for more bookings.",
        "Separate correlation from cause.",
        "Bookings went up right after we opened the rooftop bar. The bar brought the guests, didn't it?", "proud"),
      sc("Professor Anand", "your tutor", "to practise causal reasoning",
        "The seminar is examining inference from data.",
        "Reject the inference carefully.",
        "A study says students who sleep more get better grades. What can, and can't, we conclude from that?", "probing"),
      sc("Mr. Larsen", "the examiner", "to check careful reasoning",
        "The examiner asserts a causal link.",
        "Challenge it without rejecting the data.",
        "People who read more earn more. So reading makes people rich. Do you agree?", "neutral"),
    ],
  },

  {
    id: "c1-the-counterargument",
    topic: "stating the opposing view fairly",
    objectives: [
      "State an opposing view in its strongest form.",
      "Answer it after stating it, not before.",
    ],
    goal: "Present the case against your position honestly.",
    target: "constructing a fair counterargument",
    correction: "Model the fair statement of the opposing view and let the learner answer it.",
    summary: "You learned to state the opposing view fairly before answering it.",
    minutes: 8,
    points: [
      {
        form: "one might argue",
        claims: [
          "'One might argue' introduces the opposing case in neutral language.",
          "Stating it weakly is easy to spot and damages your credibility.",
        ],
        ex: ["One might argue that the cost outweighs the benefit.", "One might argue the opposite entirely."],
      },
      {
        form: "critics would say",
        claims: [
          "'Critics would say' attributes the objection to a general opposing group.",
          "To avoid a straw man, the objection must still be one critics actually make.",
        ],
        ex: ["Critics would say this rewards failure.", "Critics would say we have tried this before."],
      },
      {
        form: "against that",
        claims: [
          "'Against that' marks the point where you begin your answer.",
          "Answering before the objection is fully stated looks evasive.",
        ],
        ex: ["Against that, the evidence points the other way.", "Against that, the cost of inaction is higher."],
      },
    ],
    ex: [],
    drills: [
      // p1 — one might argue
      fc("p1", "One might ___ that the cost outweighs the benefit.", ["argue", "argues", "arguing"]),
      sit("p1", "You support a four-day week. You introduce the opposing case in neutral language. What do you say?", [
        "One might argue that it would hurt customers.",
        "Only a fool would argue that it would hurt customers.",
        "Nobody could seriously argue that it would hurt customers.",
      ]),
      spk("p1", "One might argue that it is too early."),
      // p2 — critics would say
      fc("p2", "Critics would ___ this rewards failure.", ["say", "says", "said"]),
      chat("p2", ["What will opponents of the plan say?", null], [
        "Critics would say we have tried this before.",
        "Critics would says we have tried this before.",
        "Critic would say we have tried this before.",
      ]),
      lc("p2", "Critics would say this rewards failure.", ["Critics say this is a failure.", "We should reward success, not failure."]),
      // p3 — against that
      fc("p3", "Critics would say it is expensive. ___ that, the cost of doing nothing is higher.", ["Against", "Again", "Along"]),
      sit("p3", "You have stated the objection fully. Now you begin your answer. What do you say?", [
        "Against that, the evidence points the other way.",
        "Against to that, the evidence points the other way.",
        "Against that, the evidence point the other way.",
      ]),
      la("p3", "Against that, the cost of inaction is higher.", ["again"]),
      // karışık
      chat("mix", ["Make the case against your own plan, then answer it.", null], [
        "Critics would say it is too slow. Against that, it is far cheaper.",
        "Critics would say it is too slow. Against that, it far cheaper.",
        "Critics would says it is too slow. Against that, it is far cheaper.",
      ]),
      sit("mix", "You want to state an objection neutrally and then answer it. Which is correct?", [
        "One might argue that it is risky. Against that, doing nothing is riskier.",
        "One might argues that it is risky. Against that, doing nothing is riskier.",
        "One might argue that it is risky. Against of that, doing nothing is riskier.",
      ]),
    ],
    success: "The learner states the opposing case fairly and then answers it.",
    quiz: [
      qmcq("Which phrase marks the start of your answer?", ["Against that,", "One might argue", "Critics would say"], 0),
      qfill("One might ___ the opposite entirely. (argue)", ["argue"]),
      qmcq("Why state the objection at its strongest?", [
        "A weak version damages your credibility.",
        "It makes the argument longer.",
        "It is grammatically required.",
      ], 0),
    ],
    scenes: [
      sc("Kwabena", "a friend testing your fairness", "to see whether you can state the other side",
        "A friend suspects you are caricaturing the opposition.",
        "State the opposing case fairly.",
        "You love working from home. Can you give me the best case against it, without mocking it?", "challenging"),
      sc("Simone", "a colleague preparing for a hard meeting", "to prepare for objections",
        "A meeting will contain strong opposition.",
        "Rehearse the opposing case.",
        "Tomorrow we propose closing the office on Fridays, and finance will fight it. What will they actually say?", "strategic"),
      sc("Emil", "a fellow traveller", "to hear the other side fairly",
        "Two travellers are choosing between the night train and a flight.",
        "State the case for the option you oppose, then answer it.",
        "You want the night train and I want to fly. What is the strongest case for flying, before you answer it?", "amiable"),
      sc("Mrs. Aguilar", "your tutor", "to practise counterargument",
        "The seminar is examining fair representation.",
        "State the opposing case at its strongest.",
        "Your opponent says the plan will hurt small businesses. How would you state that objection fairly and then answer it?", "probing"),
      sc("Mr. Nakamura", "the examiner", "to check fair argument",
        "The examiner asks you to argue against yourself.",
        "State the counterargument fairly.",
        "Could you make the strongest case against your own view?", "neutral"),
    ],
  },

  {
    id: "c1-anticipating-objections",
    topic: "pre-empting the reply you expect",
    objectives: [
      "Raise an objection before the other person does.",
      "Answer it without sounding defensive.",
    ],
    goal: "Disarm an objection by raising it yourself.",
    target: "pre-empting objections",
    correction: "Model the pre-emptive move and let the learner raise their own objection.",
    summary: "You practised raising an objection yourself before the other person could.",
    minutes: 8,
    points: [
      {
        form: "you might object that",
        claims: [
          "'You might object that' raises the objection in the other person's voice.",
          "Raising it first shows you have considered it rather than missed it.",
        ],
        ex: ["You might object that this has been tried.", "You might object that the sample is small."],
      },
      {
        form: "some will say",
        claims: [
          "'Some will say' raises a common objection without attributing it to the listener.",
          "This avoids putting words in the other person's mouth.",
        ],
        ex: ["Some will say it is too early.", "Some will say the risk is unacceptable."],
      },
      {
        form: "I'd answer that by",
        claims: [
          "'I'd answer that by pointing to...' gives the answer a shape before the content.",
          "Announcing the shape of the answer stops it sounding improvised.",
        ],
        ex: ["I'd answer that by pointing to the pilot.", "I'd answer that by separating the two cases."],
      },
    ],
    ex: [],
    drills: [
      // p1 — you might object that
      fc("p1", "You might ___ that this has been tried before.", ["object", "objects", "objecting"]),
      chat("p1", ["Tell me your plan, and the doubt you expect from me.", null], [
        "We start with one site. You might object that the sample is small.",
        "We start with one site. You might objected that the sample is small.",
        "We start with one site. You might object than the sample is small.",
      ]),
      lc("p1", "You might object that the sample is small.", ["You might expect the sample to be small.", "You must buy a bigger sample."]),
      // p2 — some will say
      sit("p2", "You raise a common objection without saying that the listener holds it. What do you say?", [
        "Some will say it is too early.",
        "You clearly think it is too early.",
        "You are going to say it is too early.",
      ]),
      fc("p2", "Some will ___ it costs too much.", ["say", "says", "saying"]),
      spk("p2", "Some will say the plan is too ambitious."),
      // p3 — I'd answer that by
      fc("p3", "I'd answer that ___ pointing to the pilot.", ["by", "with", "for"]),
      sit("p3", "Someone says your sample is small. You announce the shape of your answer before the content. What do you say?", [
        "I'd answer that by pointing to the three other sites.",
        "I'd answer that by point to the three other sites.",
        "I'd answer that by to point to the three other sites.",
      ]),
      la("p3", "I'd answer that by separating the two cases.", ["separate"]),
      // karışık
      chat("mix", ["Will people accept your plan?", null], [
        "Some will say it is too expensive. I'd answer that by showing the savings.",
        "Some will say it is too expensive. I'd answer that by show the savings.",
        "Some will says it is too expensive. I'd answer that by showing the savings.",
      ]),
      sit("mix", "You raise the listener's likely objection yourself, then answer it. Which is correct?", [
        "You might object that it is slow. I'd answer that by pointing to the results.",
        "You might object that it is slow. I'd answer that by pointed to the results.",
        "You might objecting that it is slow. I'd answer that by pointing to the results.",
      ]),
    ],
    success: "The learner raises and answers at least two expected objections.",
    quiz: [
      qmcq("Why raise an objection yourself?", [
        "It shows you have considered it rather than missed it.",
        "It makes the proposal shorter.",
        "It prevents the other person from speaking.",
      ], 0),
      qfill("Some ___ say the risk is unacceptable. (will)", ["will"]),
      qmcq("What does announcing the shape of an answer do?", [
        "It stops the answer sounding improvised.",
        "It shortens the answer.",
        "It makes the objection disappear.",
      ], 0),
    ],
    scenes: [
      sc("Ingeborg", "a friend who always finds the flaw", "to have her objections answered first",
        "A friend reliably spots the weakness in any plan.",
        "Raise the objections before she does.",
        "You want to move our book club online, and I always find the flaw. Which objections do you expect from me?", "wry"),
      sc("Rashid", "a decision-maker with limited time", "to hear a proposal with its risks",
        "A proposal must survive scrutiny in one hearing.",
        "Pre-empt the objections.",
        "You want a four-day week for the team. I have ten minutes and a lot of doubts. Where do you want to start?", "brisk"),
      sc("Cecilia", "a tour group leader", "to hear a route change with its risks",
        "A tour leader is deciding whether to change the group's route.",
        "Raise and answer the likely objections.",
        "You want the group to skip the museum and see the coast instead. What will people say against it, and how will you answer?", "impartial"),
      sc("Mr. Steiner", "your tutor", "to practise pre-emption",
        "The seminar is examining anticipatory argument.",
        "Raise and answer objections.",
        "You want to expand the pilot, but I may say the sample is too small. How would you deal with that before I raise it?", "probing"),
      sc("Ms. Coelho", "the examiner", "to check anticipatory argument",
        "The examiner will object to whatever you propose.",
        "Pre-empt the objections.",
        "Propose something. What am I about to object to?", "neutral"),
    ],
  },

  {
    id: "c1-a-structured-case",
    topic: "arguing from opening to conclusion",
    objectives: [
      "Number the parts of an argument out loud.",
      "Close by tying the parts together.",
    ],
    goal: "Argue a position from a clear opening to a clear conclusion.",
    target: "structuring an extended argument",
    correction: "Model the structural marker and let the learner move to the next part.",
    summary: "You practised structuring an extended argument from opening to conclusion.",
    minutes: 8,
    points: [
      {
        form: "my first point",
        claims: [
          "Numbering the parts shows that the case has an order and that more is coming.",
          "It also makes it obvious if you never reach the second point.",
        ],
        ex: ["My first point is about cost.", "My first point concerns timing."],
      },
      {
        form: "which brings me to",
        claims: [
          "'Which brings me to' links one part to the next rather than just stopping.",
          "The link shows how the parts connect; the content still has to do the arguing.",
        ],
        ex: ["Which brings me to the second issue.", "Which brings me to my main concern."],
      },
      {
        form: "for these reasons",
        claims: [
          "'For these reasons' ties the parts to the conclusion.",
          "A conclusion that does not refer back to the parts leaves them unused.",
        ],
        ex: ["For these reasons, I would delay.", "For these reasons, the proposal should be rejected."],
      },
    ],
    ex: [],
    drills: [
      // p1 — my first point
      fc("p1", "My ___ point is about cost.", ["first", "firsts", "firstly"]),
      sit("p1", "You are about to make a case in three parts. You start so the listener knows more is coming. What do you say?", [
        "My first point concerns timing.",
        "My first point concern timing.",
        "My firsts point concerns timing.",
      ]),
      lc("p1", "My first point is about cost.", ["My last point is about cost.", "My first job was in a cafe."]),
      // p2 — which brings me to
      fc("p2", "That covers the cost, ___ brings me to the second issue.", ["which", "what", "who"]),
      chat("p2", ["So that's the cost. What's next?", null], [
        "Which brings me to the second problem: timing.",
        "Which bring me to the second problem: timing.",
        "Which brings me at the second problem: timing.",
      ]),
      spk("p2", "Which brings me to the second issue."),
      // p3 — for these reasons
      fc("p3", "For these ___, the proposal should be rejected.", ["reasons", "reason", "reasoning"]),
      sit("p3", "You have made three points. Now you tie them to your conclusion. What do you say?", [
        "For these reasons, I would delay.",
        "For this reasons, I would delay.",
        "For these reasons, I would delayed.",
      ]),
      la("p3", "For these reasons, the proposal should be rejected.", ["reject"]),
      // karışık
      chat("mix", ["Can you give me the case for a new printer, in parts?", null], [
        "My first point is that it costs less to run, which brings me to its second advantage: speed.",
        "My first point is that it costs less to run, which bring me to its second advantage: speed.",
        "My firsts point is that it costs less to run, which brings me to its second advantage: speed.",
      ]),
      lc("mix", "My first point is cost, which brings me to the second point: speed.", ["My first point is speed, which brings me to the second point: cost.", "My first point is cost, so let me stop there."]),
    ],
    success: "The learner structures an argument and ties the parts to the conclusion.",
    quiz: [
      qmcq("Why number the parts?", [
        "It shows the case has an order and that more is coming.",
        "It makes the argument shorter.",
        "It is required in formal English.",
      ], 0),
      qfill("Which ___ me to my main concern. (bring)", ["brings"]),
      qmcq("What happens if the conclusion ignores the parts?", [
        "The parts are left unused.",
        "The grammar becomes incorrect.",
        "The argument becomes shorter.",
      ], 0),
    ],
    scenes: [
      sc("Marisol", "a friend who loses the thread", "to follow a long argument",
        "A friend has trouble following long arguments.",
        "Structure it so the parts are obvious.",
        "You think we should move to a smaller flat. Last time you lost me halfway. Can you give me the case in parts?", "patient"),
      sc("Hendrik", "a manager hearing a case", "to be persuaded by a structured case",
        "A manager wants a case, not a ramble.",
        "Structure the argument.",
        "You want us to replace the old printers. Give me the case in parts, not as a story. Where do you start?", "exacting"),
      sc("Nala", "a hotel manager", "to hear an organised complaint",
        "You want a refund after a stay with no hot water and a noisy room.",
        "Argue from opening to conclusion.",
        "You would like a refund for your stay. How is your case organised?", "formal"),
      sc("Professor Villanueva", "your tutor", "to practise extended argument",
        "The seminar is examining argument architecture.",
        "Structure and conclude.",
        "You want the department to replace its printers. Could you give me two connected points and then your conclusion?", "probing"),
      sc("Ms. Sorensen", "the examiner", "to check extended argument",
        "The examiner asks for a structured case.",
        "Structure it and tie it together.",
        "Could you argue a position in three connected parts?", "neutral"),
    ],
  },

  {
    id: "c1-defending-under-pressure",
    topic: "holding up when challenged hard",
    objectives: [
      "Distinguish a real objection from a misreading.",
      "Restate a position without repeating it word for word.",
    ],
    goal: "Hold your position when it is attacked directly.",
    target: "defending an argument under pressure",
    correction: "Model the separation of misreading from objection and let the learner defend again.",
    summary: "You practised holding a position under direct challenge.",
    minutes: 8,
    points: [
      {
        form: "I stand by that",
        claims: [
          "'I stand by that' refuses to retreat without escalating the exchange.",
          "It works only if you then give a reason; alone it sounds stubborn.",
        ],
        ex: ["I stand by that, and here is why.", "I stand by the figure I gave."],
      },
      {
        form: "that misses my point",
        claims: [
          "'That misses my point' names a misreading rather than a disagreement.",
          "Answering a misreading as though it were an objection concedes ground you never lost.",
        ],
        ex: ["That misses my point, which was about timing.", "That misses what I actually claimed."],
      },
      {
        form: "let me clarify",
        claims: [
          "'Let me clarify' restates the position in different words.",
          "Repeating the same words rarely resolves a misunderstanding.",
        ],
        ex: ["Let me clarify what I mean by that.", "Let me clarify the distinction."],
      },
    ],
    ex: [],
    drills: [
      // p1 — I stand by that
      fc("p1", "I ___ by that, and here is why.", ["stand", "stands", "standing"]),
      sit("p1", "A journalist asks you to take back a figure you gave. You refuse, and you will give a reason. What do you say first?", [
        "I stand by that, and here is why.",
        "I stands by that, and here is why.",
        "I stand by that, and here why is.",
      ]),
      lc("p1", "I stand by the figure I gave.", ["I can't stand the figure I gave.", "I stood by the window and waited."]),
      // p2 — that misses my point
      sit("p2", "Someone says you claimed the plan can never work. You only said it would not work this year. What do you say?", [
        "That misses my point, which was about this year.",
        "That is a fair objection, and I accept it.",
        "I stand by that: it can never work.",
      ]),
      fc("p2", "That ___ my point, which was about timing.", ["misses", "miss", "missing"]),
      chat("p2", ["So you're saying nobody should ever try?", null], [
        "That misses my point. I said not this year.",
        "That miss my point. I said not this year.",
        "That misses my point. I said not these year.",
      ]),
      // p3 — let me clarify
      fc("p3", "Let me ___ the distinction.", ["clarify", "clarifies", "clarifying"]),
      spk("p3", "Let me clarify what I actually claimed."),
      la("p3", "Let me clarify the distinction.", ["clarified"]),
      // karışık
      chat("mix", ["This has failed everywhere. And you're saying we should still do it?", null], [
        "That misses my point. Let me clarify: I said we should test it first.",
        "That misses my point. Let me clarifying: I said we should test it first.",
        "That missing my point. Let me clarify: I said we should test it first.",
      ]),
      sit("mix", "Someone thinks you said twenty percent. You said ten. You correct them and keep your figure. What do you say?", [
        "Let me clarify: I said ten percent, and I stand by that.",
        "Let me clarify: I said ten percent, and I stands by that.",
        "Let me clarifies: I said ten percent, and I stand by that.",
      ]),
    ],
    success: "The learner separates a misreading from an objection and holds the position.",
    quiz: [
      qmcq("Why is 'I stand by that' weak on its own?", [
        "Without a reason it sounds stubborn.",
        "It is grammatically incomplete.",
        "It concedes the argument.",
      ], 0),
      qfill("Let me ___ what I mean by that. (clarify)", ["clarify"]),
      qmcq("What goes wrong if you answer a misreading as an objection?", [
        "You concede ground you never lost.",
        "You run out of time.",
        "You repeat yourself.",
      ], 0),
    ],
    scenes: [
      sc("Gustavo", "a friend attacking your view head on", "to break your position",
        "A friend is pressing hard and partly misreading you.",
        "Separate the misreading from the objection.",
        "You are basically saying nobody should ever try. Aren't you?", "forceful"),
      sc("Priyanka", "a hostile questioner at work", "to expose a weakness",
        "A questioner is looking for a weakness rather than an answer.",
        "Hold the position and clarify.",
        "Flexible hours have failed everywhere they have been tried. Why would we do it here?", "aggressive"),
      sc("Bram", "a hostel owner", "to get you to withdraw a review",
        "A hostel owner is pressing you about your online review.",
        "Hold the position without escalating.",
        "Your review says the rooms were dirty. So you admit you made it all up?", "persistent"),
      sc("Mrs. Farrow", "your tutor", "to practise defence under pressure",
        "The seminar is examining argument under challenge.",
        "Defend without escalating.",
        "You said the plan would not work this year, but I heard that it could never work. What did you actually mean?", "probing"),
      sc("Mr. Ibrahim", "the examiner", "to check composure under challenge",
        "The examiner attacks your position directly.",
        "Defend it calmly.",
        "I think your entire position collapses under scrutiny. Well?", "neutral"),
    ],
  },

  // --- Ünite 6 · Narrative Craft ---------------------------------------------
  {
    id: "c1-little-did-they-know",
    topic: "inverted openers that hint at what is coming",
    objectives: [
      "Open with an inversion that signals dramatic irony.",
      "Position the reader ahead of the characters.",
    ],
    goal: "Signal to your listener that something is about to go wrong.",
    target: "narrative inversion",
    correction: "Rebuild the inverted opener and let the learner set up their own story.",
    summary: "You learned to open a story with an inversion that hints at what is coming.",
    minutes: 9,
    points: [
      {
        form: "little did they know",
        claims: [
          "'Little did they know' tells the listener something the characters do not know.",
          "It creates dramatic irony: the listener is now ahead of the story.",
        ],
        ex: ["Little did they know it was the last time.", "Little did we know what was coming."],
      },
      {
        form: "unbeknown to them",
        claims: [
          "'Unbeknown to them' does the same job in a more literary register.",
          "'Unbeknownst' is an accepted variant of the same word.",
        ],
        ex: ["Unbeknown to them, the road was closed.", "Unbeknown to us, the meeting had moved."],
      },
      {
        form: "what nobody realised",
        claims: [
          "'What nobody realised was...' delays the revelation to the end of the sentence.",
          "Because it is a what-clause, it does not need inversion.",
        ],
        ex: ["What nobody realised was how late it was.", "What nobody realised was that he had already left."],
      },
    ],
    ex: [],
    drills: [
      // p1 — little did they know
      fc("p1", "Little ___ they know it was the last time.", ["did", "does", "was"]),
      arr("p1", "Little did we know what was coming.", ["do"]),
      sit("p1", "You are telling a story. You want the listener to know something the people in it did not. Which opening is correct?", [
        "Little did they know the bridge was closed.",
        "Little they knew the bridge was closed.",
        "Little did they knew the bridge was closed.",
      ]),
      // p2 — unbeknown to them
      fc("p2", "___ to the guests, the chef had already left.", ["Unbeknownst", "Unbeknowns", "Unbeknowing"]),
      chat("p2", ["Did the hotel tell you about the strike?", null], [
        "No. Unbeknown to us, the staff had walked out.",
        "No. Unbeknown for us, the staff had walked out.",
        "No. Unbeknown to us, the staff had walk out.",
      ]),
      lc("p2", "Unbeknown to them, the road was closed.", ["As they knew, the road was closed.", "Unbeknown to them, the shop was open."]),
      // p3 — what nobody realised
      fc("p3", "What nobody realised ___ how late it was.", ["was", "were", "did"]),
      sit("p3", "You want to delay the surprise to the end of the sentence, without inversion. Which is correct?", [
        "What nobody realised was that he had already left.",
        "What did nobody realise was that he had already left.",
        "What nobody realised it was that he had already left.",
      ]),
      spk("p3", "What nobody realised was that the door was open."),
      // karışık
      chat("mix", ["How does your story start?", null], [
        "Little did they know the road was shut. Unbeknown to them, so was the bridge.",
        "Little they did know the road was shut. Unbeknown to them, so was the bridge.",
        "Little did they know the road was shut. Unbeknown for them, so was the bridge.",
      ]),
      sit("mix", "Which sentence correctly uses two of these openers?", [
        "Little did we know that, unbeknown to the driver, the road was closed.",
        "Little we did know that, unbeknown to the driver, the road was closed.",
        "Little did we know that, unbeknown for the driver, the road was closed.",
      ]),
    ],
    success: "The learner opens a narrative with dramatic irony.",
    quiz: [
      qmcq("What does 'little did they know' create?", [
        "dramatic irony",
        "a change of tense",
        "a formal register",
      ], 0),
      qmcq("Which opener is correct?", [
        "Unbeknown to us, the meeting had moved.",
        "Unbeknown for us, the meeting had moved.",
        "Unbeknowing to us, the meeting had moved.",
      ], 0),
      qmcq("Which sentence needs no inversion?", [
        "What nobody realised was how late it was.",
        "Little did anyone realise how late it was.",
        "Never had anyone realised how late it was.",
      ], 0),
    ],
    scenes: [
      sc("Zofia", "a friend who loves a good build-up", "to be kept in suspense",
        "A friend enjoys a story that builds.",
        "Open with dramatic irony.",
        "Tell me the story of your worst holiday, with a proper build-up. How does it start?", "expectant"),
      sc("Ravi", "a colleague at a retrospective", "to understand what nobody saw coming",
        "A retrospective is describing what nobody knew at the time.",
        "Signal what was hidden.",
        "Nobody saw the system crash coming. Can you take us back to that morning?", "reflective"),
      sc("Elif", "a fellow traveller telling stories", "to hear a story told well",
        "Travellers are telling stories over a long evening.",
        "Open with dramatic irony.",
        "It is your turn to tell a travel story with a twist. How does it begin?", "settled"),
      sc("Professor Kimura", "your tutor", "to practise narrative openings",
        "The seminar is examining narrative technique.",
        "Open with dramatic irony.",
        "Begin a story about a quiet village the night before a storm. How would you open it so that I know more than the villagers?", "probing"),
      sc("Ms. Bianchi", "the examiner", "to check narrative technique",
        "The examiner asks for a story opening.",
        "Create dramatic irony.",
        "Could you begin a story so I know something the characters do not?", "neutral"),
    ],
  },

  {
    id: "c1-pacing-a-story",
    topic: "speeding up and slowing down",
    objectives: [
      "Compress a long dull stretch into one clause.",
      "Slow down at the moment that matters.",
    ],
    goal: "Control the speed of a story so the important part lands.",
    target: "narrative pacing",
    correction: "Model the pacing shift and let the learner speed up or slow down their own story.",
    summary: "You learned to compress the dull parts and slow down at the moment that matters.",
    minutes: 8,
    points: [
      {
        form: "for weeks nothing",
        claims: [
          "'For weeks nothing happened' compresses a long stretch into one clause.",
          "Time spent on a dull stretch is time taken from the important part.",
        ],
        ex: ["For weeks nothing happened at all.", "For months nothing changed."],
      },
      {
        form: "and then out of nowhere",
        claims: [
          "'And then, out of nowhere' marks a sudden turn; slowing down comes from the detail you add after it.",
          "Expand the moment with immediate actions or sensory detail to make it feel slow.",
        ],
        ex: ["And then, out of nowhere, the phone rang.", "And then out of nowhere it stopped."],
      },
      {
        form: "then everything shifted",
        claims: [
          "'Then everything shifted' names the turning point without detailing it yet.",
          "Naming the turn before describing it buys the listener's attention.",
        ],
        ex: ["Then everything shifted at once.", "Then everything shifted, and quickly."],
      },
    ],
    ex: [],
    drills: [
      // p1 — for weeks nothing
      fc("p1", "For weeks ___ happened, and then the letter came.", ["nothing", "anything", "nobody"]),
      sit("p1", "Your story has a long, dull month before the main event. You want to cover it in one clause. What do you say?", [
        "For weeks nothing happened.",
        "Every day for weeks, I will tell you what happened.",
        "First I went to work, then I came home, then I went to work again.",
      ]),
      spk("p1", "For weeks nothing happened at all."),
      // p2 — and then out of nowhere
      fc("p2", "And then, out of ___, the phone rang.", ["nowhere", "anywhere", "somewhere"]),
      chat("p2", ["So you were waiting at the station. What happened?", null], [
        "And then, out of nowhere, a man grabbed my bag.",
        "And then, out of the nowhere, a man grabbed my bag.",
        "And then, out of nowhere, a man grab my bag.",
      ]),
      lc("p2", "And then out of nowhere it stopped.", ["And then, now and then, it stopped.", "And then it stopped at the end of the road."]),
      // p3 — then everything shifted
      fc("p3", "It was a normal Tuesday. Then everything ___.", ["shifted", "shifting", "shift"]),
      sit("p3", "You want to name the turning point before you describe it. What do you say?", [
        "Then everything shifted at once.",
        "Then everything shift at once.",
        "Then everythings shifted at once.",
      ]),
      la("p3", "Then everything shifted, and quickly.", ["shift"]),
      // karışık
      chat("mix", ["Tell me about your first job, quickly.", null], [
        "For weeks nothing happened. Then everything shifted.",
        "For weeks nothing happened. Then everything shifting.",
        "For weeks anything happened. Then everything shifted.",
      ]),
      sit("mix", "You compress a long wait, then mark a sudden turn. Which is correct?", [
        "For months nothing changed. And then, out of nowhere, the letter came.",
        "For months nothing changed. And then, out of nowhere, the letter come.",
        "For months nothing changed. And then, out of anywhere, the letter came.",
      ]),
    ],
    success: "The learner compresses one stretch and slows down at the turn.",
    quiz: [
      qmcq("Why compress a dull stretch?", [
        "Time on it is taken from the important part.",
        "It is grammatically simpler.",
        "It avoids the past tense.",
      ], 0),
      qfill("For months ___ changed at all. (nothing)", ["nothing"]),
      qmcq("What does naming the turn before describing it do?", [
        "It buys the listener's attention.",
        "It shortens the story.",
        "It removes the need for detail.",
      ], 0),
    ],
    scenes: [
      sc("Njeri", "a friend hearing a long story", "to stay engaged through a long story",
        "A story has a long slow middle and a sharp turn.",
        "Pace it so the turn lands.",
        "You are telling me about your year abroad. Can we get to the good bit quickly?", "impatient"),
      sc("Konstantin", "a colleague at a leaving speech", "to hear an anecdote that lands",
        "An anecdote must land in a short speech.",
        "Pace it for effect.",
        "It is a colleague's leaving party, and you have two minutes for one story about her. How does it go?", "amused"),
      sc("Sanne", "a fellow traveller round a fire", "to be told a story well",
        "A long evening and a good story.",
        "Pace it deliberately.",
        "We have all night by this fire. What is your story about a long wait that ended suddenly?", "relaxed"),
      sc("Mr. Delacroix", "your tutor", "to practise pacing",
        "The seminar is examining narrative rhythm.",
        "Control the pace deliberately.",
        "Tell me about a long, boring wait that ended suddenly. How would you pace it?", "probing"),
      sc("Ms. Grimaldi", "the examiner", "to check narrative control",
        "The examiner asks for a paced story.",
        "Compress and slow down deliberately.",
        "Could you tell me a story where nothing happens, then everything does?", "neutral"),
    ],
  },

  {
    id: "c1-the-detail-that-matters",
    topic: "choosing what to include",
    objectives: [
      "Signal which detail the listener needs.",
      "Cut what does not serve the point.",
    ],
    goal: "Tell a story without burying the point in detail.",
    target: "selecting narrative detail",
    correction: "Model the selecting phrase and let the learner cut their own story down.",
    summary: "You learned to select the detail that matters and cut the rest.",
    minutes: 8,
    points: [
      {
        form: "what you need to know",
        claims: [
          "'What you need to know is...' tells the listener which detail carries the story.",
          "It gives permission to forget everything else.",
        ],
        ex: ["What you need to know is that he had the only key.", "What you need to know is the timing."],
      },
      {
        form: "I'll spare you",
        claims: [
          "'I'll spare you the details' cuts a stretch while acknowledging it existed.",
          "Cutting openly is better than trailing off mid-story.",
        ],
        ex: ["I'll spare you the paperwork.", "I'll spare you the three hours in between."],
      },
      {
        form: "here's the part",
        claims: [
          "'Here's the part that matters' focuses attention just before the payoff.",
          "It works best used once; twice, the listener stops believing the first.",
        ],
        ex: ["Here's the part that matters.", "Here's the part I still think about."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what you need to know
      fc("p1", "___ you need to know is that he had the only key.", ["What", "That", "Which"]),
      sit("p1", "Your story has many details, but only one carries it: she had already left. What do you say?", [
        "What you need to know is that she had already left.",
        "What you need to know are that she had already left.",
        "What you need know is that she had already left.",
      ]),
      lc("p1", "What you need to know is the timing.", ["What you need is more time.", "You need to know what time it is."]),
      // p2 — I'll spare you
      fc("p2", "I'll ___ you the paperwork.", ["spare", "spares", "sparing"]),
      chat("p2", ["How did the visa process go?", null], [
        "I'll spare you the details. It took three months.",
        "I'll spare you of the details. It took three months.",
        "I'll spared you the details. It took three months.",
      ]),
      spk("p2", "I'll spare you the long version."),
      // p3 — here's the part
      fc("p3", "Here's the part that ___.", ["matters", "matter", "mattering"]),
      sit("p3", "You are about to tell the payoff of your story. You want to focus attention just before it. What do you say?", [
        "Here's the part that matters.",
        "Here's the parts that matters.",
        "Here the part that matters.",
      ]),
      la("p3", "Here's the part I still think about.", ["thinks"]),
      // karışık
      chat("mix", ["I've only got a minute. What happened at the meeting?", null], [
        "I'll spare you the first hour. What you need to know is that we lost the client.",
        "I'll spare you the first hour. What you need to know are that we lost the client.",
        "I'll spare you for the first hour. What you need to know is that we lost the client.",
      ]),
      sit("mix", "You cut a long stretch openly, then focus on the payoff. Which is correct?", [
        "I'll spare you the paperwork. Here's the part that matters.",
        "I'll spare you the paperwork. Here's the part that matter.",
        "I'll sparing you the paperwork. Here's the part that matters.",
      ]),
    ],
    success: "The learner cuts openly and marks the significant detail.",
    quiz: [
      qmcq("Why cut openly rather than trail off?", [
        "Trailing off leaves the listener unsure what was skipped.",
        "It is grammatically required.",
        "It makes the story longer.",
      ], 0),
      qfill("I'll ___ you the three hours in between. (spare)", ["spare"]),
      qmcq("Why use 'here's the part that matters' only once?", [
        "A second use makes the listener doubt the first.",
        "It is only correct once per story.",
        "It cannot open a sentence twice.",
      ], 0),
    ],
    scenes: [
      sc("Camille", "a friend short of time", "to get the story in two minutes",
        "A friend has two minutes and you have a long story.",
        "Cut it down and mark the key detail.",
        "I have to leave in two minutes. What happened at your job interview, in the short version?", "rushed"),
      sc("Stefan", "a colleague needing the essentials", "to get only what is relevant",
        "A colleague needs the relevant facts, not the narrative.",
        "Select the detail that matters.",
        "I am taking over your client tomorrow. What do I actually need to know about the problem with them?", "practical"),
      sc("Rosa", "a fellow guest at a hostel dinner", "to enjoy a well-told anecdote",
        "A travel anecdote over dinner must not outstay its welcome.",
        "Cut and mark the payoff.",
        "Tell us about a time you got lost on a trip. What happened?", "expectant"),
      sc("Mrs. Chen", "your tutor", "to practise selection",
        "The seminar is examining narrative economy.",
        "Select and cut deliberately.",
        "Tell me about your last group project, but I only have thirty seconds. Which detail do I need?", "probing"),
      sc("Mr. Ferreira", "the examiner", "to check narrative economy",
        "The examiner asks for a compact story.",
        "Cut openly and mark the key detail.",
        "Could you tell me a story in under a minute?", "neutral"),
    ],
  },

  {
    id: "c1-bringing-people-to-life",
    topic: "reporting speech vividly",
    objectives: [
      "Report speech in the present for immediacy.",
      "Convey reaction without quoting words.",
    ],
    goal: "Make the people in your story sound like people.",
    target: "vivid reported speech",
    correction: "Model the vivid report and let the learner bring their own character to life.",
    summary: "You learned to report speech and reaction vividly inside a story.",
    minutes: 8,
    points: [
      {
        form: "and he goes",
        claims: [
          "'And he goes' is informal spoken narrative for 'and he said'.",
          "The present tense inside a past story creates immediacy; it is not an error.",
        ],
        ex: ["And he goes, completely straight-faced, \"No.\"", "And she goes, \"Well, that is that.\""],
      },
      {
        form: "she just looked",
        claims: [
          "'She just looked at me' reports a reaction without any words at all.",
          "Silence often carries more than reported speech does.",
        ],
        ex: ["She just looked at me.", "He just looked at the floor."],
      },
      {
        form: "you could see it",
        claims: [
          "'You could see it on her face' reports what was visible rather than said.",
          "It invites the listener to picture the moment instead of being told about it.",
        ],
        ex: ["You could see it on her face.", "You could see the relief on his face."],
      },
    ],
    ex: [],
    drills: [
      // p1 — and he goes
      fc("p1", "We asked to borrow his car. And he ___, completely straight-faced, \"No.\"", ["goes", "leaves", "sleeps"]),
      sit("p1", "You are retelling a funny exchange to a friend, informally. You want the line to feel immediate. What do you say?", [
        "And she goes, \"Well, that is that.\"",
        "She had stated that it was the end of the matter.",
        "And she goes to the door.",
      ]),
      lc("p1", "And he goes, \"No way.\"", ["And he leaves without a word.", "And then he says yes."]),
      // p2 — she just looked
      fc("p2", "She just ___ at me.", ["looked", "look", "looking"]),
      chat("p2", ["What did your boss say when you told him?", null], [
        "Nothing. He just looked at his shoes.",
        "Nothing. He just look at his shoes.",
        "Nothing. He just looked his shoes.",
      ]),
      spk("p2", "She just looked at me."),
      // p3 — you could see it
      fc("p3", "You could ___ it on her face.", ["see", "saw", "seen"]),
      sit("p3", "You want to report what was visible, not what was said, and let the listener picture it. What do you say?", [
        "You could see it on her face.",
        "You could saw it on her face.",
        "You can seen it on her face.",
      ]),
      la("p3", "You could see the relief on his face.", ["saw"]),
      // karışık
      chat("mix", ["What happened when you told her the news?", null], [
        "She just looked at me. You could see it on her face.",
        "She just looked at me. You could seen it on her face.",
        "She just look at me. You could see it on her face.",
      ]),
      sit("mix", "You retell a moment: one line of speech, then a silent reaction. Which is correct?", [
        "And he goes, \"No.\" She just looked at him.",
        "And he goes, \"No.\" She just looked him.",
        "And he goes home. She just looked at him.",
      ]),
    ],
    success: "The learner reports speech vividly and conveys a wordless reaction.",
    quiz: [
      qmcq("Why is the present tense used inside a past story?", [
        "It creates immediacy and is not an error.",
        "It is required after 'and'.",
        "The story must be in the present.",
      ], 0),
      qfill("He just ___ at the floor. (look)", ["looked"]),
      qmcq("What does reporting a look achieve?", [
        "It invites the listener to picture the moment.",
        "It shortens the story.",
        "It avoids reported speech rules.",
      ], 0),
    ],
    scenes: [
      sc("Yusuf", "a friend who was not there", "to feel like they were there",
        "An exchange your friend missed needs retelling.",
        "Bring the people to life.",
        "I missed the big argument at the party. What did they actually say?", "eager"),
      sc("Ottoline", "a colleague hearing about a meeting", "to picture how the meeting went",
        "A tense meeting must be described.",
        "Report speech and reaction vividly.",
        "I missed the budget meeting, and the notes say nothing. What was it actually like in there?", "curious"),
      sc("Noor", "a fellow traveller swapping encounters", "to hear a good encounter story",
        "Travellers are describing memorable encounters.",
        "Bring the people to life.",
        "Have you ever met someone unforgettable on a trip? What did they say?", "delighted"),
      sc("Mr. Halvorsen", "your tutor", "to practise vivid reporting",
        "The seminar is examining reported speech in narrative.",
        "Report vividly.",
        "Retell an argument you once saw between two people. What did they say, and how did they react?", "probing"),
      sc("Ms. Cardoso", "the examiner", "to check narrative liveliness",
        "The examiner asks for a retold exchange.",
        "Report speech and reaction vividly.",
        "Could you retell a conversation so I can hear the people in it?", "neutral"),
    ],
  },

  {
    id: "c1-a-story-that-lands",
    topic: "telling an anecdote that gets a reaction",
    objectives: [
      "Aim an anecdote at a specific reaction.",
      "Close it without explaining the point.",
    ],
    goal: "Tell a story that gets the reaction you were aiming for.",
    target: "landing an anecdote",
    correction: "Model the closing line and let the learner land their own story.",
    summary: "You practised telling an anecdote that gets the reaction you intended.",
    minutes: 8,
    points: [
      {
        form: "you had to be there",
        claims: [
          "'You had to be there' acknowledges that a retelling cannot capture the moment itself.",
          "Used before the end, it often signals that you do not trust the story; used after it, it is usually affectionate.",
        ],
        ex: ["You had to be there, honestly.", "I know, you had to be there."],
      },
      {
        form: "I'll never forget it",
        claims: [
          "'I'll never forget it' tells the listener the story mattered to you.",
          "Said at the end, it closes the story on its emotional point.",
        ],
        ex: ["I'll never forget it.", "I'll never forget the look on his face."],
      },
      {
        form: "still makes me laugh",
        claims: [
          "'It still makes me laugh' cues the reaction without demanding it.",
          "Explaining why something was funny usually weakens it, especially after the punchline.",
        ],
        ex: ["It still makes me laugh now.", "That still makes me laugh."],
      },
    ],
    ex: [],
    drills: [
      // p1 — you had to be there
      fc("p1", "You had to ___ there, honestly.", ["be", "been", "being"]),
      sit("p1", "You have just finished a funny story, and your friend is only smiling politely. You close it affectionately. What do you say?", [
        "I know, you had to be there.",
        "I know, you had be there.",
        "I know, you had to been there.",
      ]),
      lc("p1", "You had to be there, honestly.", ["You had to leave early, honestly.", "You have to go there one day."]),
      // p2 — I'll never forget it
      fc("p2", "I'll never ___ it.", ["forget", "forgot", "forgetting"]),
      chat("p2", ["So he really answered the wrong phone?", null], [
        "He did. I'll never forget it.",
        "He did. I'll never forgot it.",
        "He did. I'll never forgetting it.",
      ]),
      spk("p2", "I'll never forget that night."),
      // p3 — still makes me laugh
      fc("p3", "It still ___ me laugh now.", ["makes", "make", "making"]),
      sit("p3", "You end a funny story. You want to cue a laugh without explaining the joke. What do you say?", [
        "It still makes me laugh.",
        "It was funny because he had the wrong phone, you see.",
        "Let me explain why that is funny.",
      ]),
      la("p3", "That still makes me laugh.", ["make"]),
      // karışık
      chat("mix", ["Wait, he was in the wrong meeting the whole time?", null], [
        "The whole time. I'll never forget it. It still makes me laugh.",
        "The whole time. I'll never forget it. It still make me laugh.",
        "The whole time. I'll never forgot it. It still makes me laugh.",
      ]),
      sit("mix", "You finish a funny story and close it in two short lines, without explaining it. Which is correct?", [
        "I'll never forget it. You had to be there.",
        "I'll never forget it. You had to being there.",
        "I'll never forgot it. You had to be there.",
      ]),
    ],
    success: "The learner lands an anecdote without explaining it.",
    quiz: [
      qmcq("What usually happens if you explain why something was funny?", [
        "The humour is weakened.",
        "The story becomes clearer.",
        "The listener laughs harder.",
      ], 0),
      qfill("I'll never ___ the look on his face. (forget)", ["forget"]),
      qmcq("When does 'you had to be there' weaken a story?", [
        "when used before you have finished it",
        "when used at the very end",
        "when used with a past tense",
      ], 0),
    ],
    scenes: [
      sc("Beatriz", "a friend who wants cheering up", "to be genuinely amused",
        "A friend has had a bad day and needs a story.",
        "Aim the anecdote at a laugh.",
        "I need something ridiculous today. Have you got one?", "flat"),
      sc("Andres", "a colleague at an informal lunch", "to hear a good work story",
        "An informal lunch invites anecdotes.",
        "Land the story.",
        "Lunch is quiet today. Has anything funny ever happened to you at work?", "encouraging"),
      sc("Selin", "a fellow guest at a long dinner", "to enjoy a well-aimed story",
        "A dinner table expects a story.",
        "Aim and land it.",
        "Everyone at this table has told a funny travel story except you. What is yours?", "expectant"),
      sc("Mr. Achebe", "your tutor", "to practise landing an anecdote",
        "The seminar is examining anecdote structure.",
        "Land the story without explaining it.",
        "Tell me a funny story, and finish it without explaining the joke. How does it end?", "probing"),
      sc("Ms. Lindberg", "the examiner", "to check anecdote delivery",
        "The examiner asks for an amusing anecdote.",
        "Land it without explanation.",
        "Could you tell me a short, funny story from your own life?", "neutral"),
    ],
  },

  {
    id: "c1-retelling-for-effect",
    topic: "the same story for two audiences",
    objectives: [
      "Give a compressed version of a story.",
      "Change the emphasis for a different listener.",
    ],
    goal: "Tell one story two ways for two different listeners.",
    target: "adapting a story to its audience",
    correction: "Model the compressed version and let the learner produce the other.",
    summary: "You practised telling one story two ways for two different audiences.",
    minutes: 8,
    points: [
      {
        form: "short version is",
        claims: [
          "'The short version is...' offers compression before the listener asks for it.",
          "Offering it first signals you know their time is limited.",
        ],
        ex: ["The short version is that nobody checked.", "The short version is we lost a week."],
      },
      {
        form: "long story short",
        claims: [
          "'Long story short' compresses a story, often mid-telling when you sense the listener drifting.",
          "Using it and then continuing at length is a common and noticeable failure.",
        ],
        ex: ["Long story short, it worked.", "Long story short, we started again."],
      },
      {
        form: "to put it another way",
        claims: [
          "'To put it another way' changes the framing for a listener who did not follow.",
          "It reframes rather than repeats, which is what makes it useful.",
        ],
        ex: ["To put it another way, we ran out of time.", "To put it another way, nobody owned it."],
      },
    ],
    ex: [],
    drills: [
      // p1 — short version is
      fc("p1", "The short version ___ that nobody checked.", ["is", "are", "be"]),
      sit("p1", "Your manager has thirty seconds. You offer the compressed story before they ask. What do you say?", [
        "The short version is we lost a week.",
        "The short versions is we lost a week.",
        "The short version are we lost a week.",
      ]),
      lc("p1", "The short version is we lost a week.", ["The short version is two weeks long.", "We lost the short version last week."]),
      // p2 — long story short
      fc("p2", "Long story ___, we started again.", ["short", "shortly", "shorter"]),
      chat("p2", ["So what happened with the supplier?", "Well, first they called, then the price changed, then the manager left, then...", "Sorry, I'm losing track.", null], [
        "Long story short, we found a new one.",
        "Long story shortly, we found a new one.",
        "Long stories short, we found a new one.",
      ]),
      spk("p2", "Long story short, we started again."),
      // p3 — to put it another way
      fc("p3", "To put it ___ way, we ran out of time.", ["another", "other", "others"]),
      sit("p3", "Your listener did not follow. You reframe rather than repeat. What do you say?", [
        "To put it another way, nobody owned it.",
        "To putting it another way, nobody owned it.",
        "To put it another ways, nobody owned it.",
      ]),
      la("p3", "To put it another way, we ran out of time.", ["other"]),
      // karışık
      chat("mix", ["I didn't follow your story about the project.", null], [
        "Long story short, we were late. To put it another way, we missed the deadline.",
        "Long story short, we were late. To put it other way, we missed the deadline.",
        "Long story shortly, we were late. To put it another way, we missed the deadline.",
      ]),
      sit("mix", "Your boss wants one sentence. Then a colleague who didn't follow wants it reframed. Which is correct?", [
        "The short version is we lost a week. To put it another way, we are behind.",
        "The short version are we lost a week. To put it another way, we are behind.",
        "The short version is we lost a week. To putting it another way, we are behind.",
      ]),
    ],
    success: "The learner compresses for one audience and reframes for another.",
    quiz: [
      qmcq("What is the common failure with 'long story short'?", [
        "continuing at length afterwards",
        "using it at the end",
        "using it with a past tense",
      ], 0),
      qfill("Long story ___, it worked in the end. (short)", ["short"]),
      qmcq("What does 'to put it another way' do?", [
        "It reframes rather than repeats.",
        "It repeats the same words slowly.",
        "It ends the conversation.",
      ], 0),
    ],
    scenes: [
      sc("Teodor", "a friend who missed your story", "to catch up quickly",
        "A friend missed most of your story about a cancelled flight.",
        "Compress it, then reframe it if needed.",
        "I missed most of your story about the cancelled flight. Can you give me the short version?", "settled"),
      sc("Marguerite", "a manager between meetings", "to get the essentials in one line",
        "A manager has thirty seconds.",
        "Compress it to a sentence.",
        "I have thirty seconds before my next call. What happened with the supplier?", "rushed"),
      sc("Arjun", "a fellow traveller who did not follow", "to finally understand",
        "A fellow traveller did not follow your story about a missed ferry.",
        "Reframe rather than repeat.",
        "I did not follow your story about the ferry at all. Can you try again, differently?", "confused"),
      sc("Mrs. Osei", "your tutor", "to practise audience adaptation",
        "The seminar is examining audience design.",
        "Compress and reframe.",
        "Tell me about a mistake at work twice: once for a busy boss, once for a confused new colleague. How would each version go?", "probing"),
      sc("Mr. Kovacs", "the examiner", "to check audience adaptation",
        "The examiner asks for two versions.",
        "Compress and reframe.",
        "Could you tell me an event twice, for two different listeners?", "neutral"),
    ],
  },

  // --- Ünite 7 · Precision and Nuance ----------------------------------------
  {
    id: "c1-imply-and-infer",
    topic: "commonly confused word pairs",
    objectives: [
      "Distinguish imply from infer.",
      "Correct a confusion without embarrassing anyone.",
    ],
    goal: "Use commonly confused pairs correctly and correct them tactfully.",
    target: "commonly confused pairs",
    correction: "State the distinction and let the learner use the right word.",
    summary: "You learned to distinguish imply from infer and to correct the confusion tactfully.",
    minutes: 8,
    points: [
      {
        form: "what I'm implying",
        claims: [
          "The speaker implies; the meaning is put into the words by the person speaking.",
          "'What I'm implying' is therefore about your own intention.",
        ],
        ex: ["What I'm implying is that nobody checked.", "I'm not implying anything of the sort."],
      },
      {
        form: "what you inferred",
        claims: [
          "The listener infers; the meaning is taken out of the words by the person hearing.",
          "'What you inferred' is about their reading, not your intention.",
        ],
        ex: ["What you inferred is not what I meant.", "You inferred more than I said."],
      },
      {
        form: "there's a difference",
        claims: [
          "'There's a difference between X and Y' corrects without accusing anyone of error.",
          "Correcting a word choice directly can derail the discussion it belongs to.",
        ],
        ex: ["There's a difference between implying and inferring.", "There's a difference worth keeping."],
      },
    ],
    ex: [],
    drills: [
      // p1 — what I'm implying
      fc("p1", "What I'm ___ is that nobody checked.", ["implying", "imply", "implies"]),
      sit("p1", "You want to say what you meant by your own words. Which is correct?", [
        "What I'm implying is that we need more time.",
        "What you inferred is that we need more time.",
        "What I'm imply is that we need more time.",
      ]),
      spk("p1", "I'm not implying anything of the sort."),
      // p2 — what you inferred
      fc("p2", "My friend read criticism into my words. I told her, \"What you ___ is not what I meant.\"", ["inferred", "inferring", "inference"]),
      chat("p2", ["So your email was calling me careless.", null], [
        "No. What you inferred is not what I meant.",
        "No. What my email inferred is not what I meant.",
        "No. What you inferred are not what I meant.",
      ]),
      lc("p2", "You inferred more than I said.", ["You implied more than I said.", "You offered more than I asked."]),
      // p3 — there's a difference
      fc("p3", "There's a ___ between implying and inferring.", ["difference", "different", "differ"]),
      sit("p3", "A colleague used 'infer' when they meant 'imply'. You correct it without accusing them. What do you say?", [
        "There's a difference between implying and inferring, and it matters here.",
        "You used the wrong word, obviously.",
        "That is simply incorrect English.",
      ]),
      la("p3", "There's a difference worth keeping.", ["different"]),
      // karışık
      chat("mix", ["You implied I was lazy!", null], [
        "That's what you inferred. What I'm implying is that we need help.",
        "That's what my words inferred. What I'm implying is that we need help.",
        "That's what you inferred. What I'm imply is that we need help.",
      ]),
      sit("mix", "Someone confuses the two words. You correct them gently and state your own meaning. Which is correct?", [
        "There's a difference. What I'm implying is narrower than what you inferred.",
        "There's a difference. What my words inferred is narrower than what you inferred.",
        "There's a different. What I'm implying is narrower than what you inferred.",
      ]),
    ],
    success: "The learner distinguishes the pair and corrects tactfully.",
    quiz: [
      qmcq("Which sentence is correct?", [
        "You inferred more than I said.",
        "You implied more than I said, from my words.",
        "You inferred it into my words.",
      ], 0),
      qfill("What I'm ___ is not what you heard. (imply)", ["implying"]),
      qmcq("Why correct a word choice indirectly?", [
        "A direct correction can derail the discussion.",
        "Indirect corrections are more accurate.",
        "It is grammatically required.",
      ], 0),
    ],
    scenes: [
      sc("Ilse", "a friend who has read too much into you", "to correct a misreading",
        "A friend has taken more from your words than you put in.",
        "Correct the reading tactfully.",
        "So you are saying I was wrong the whole time?", "hurt"),
      sc("Tomasz", "a colleague after a tense email", "to clear up a misreading",
        "An email has been read as an accusation.",
        "Separate meaning from reading.",
        "Your email implied I dropped the ball. Did it not?", "defensive"),
      sc("Aiko", "a tour guide", "to clear up a misreading",
        "A tour guide took your comment about the tour as a complaint.",
        "Separate your meaning from her reading, tactfully.",
        "You called my tour 'interesting'. You implied it was boring, didn't you?", "hurt"),
      sc("Professor Novak", "your tutor", "to practise precision",
        "The seminar is examining confused pairs.",
        "Distinguish and correct tactfully.",
        "In class someone said, 'From the report, I implied that sales fell.' Is that right, and how would you correct it kindly?", "probing"),
      sc("Ms. Alvarez", "the examiner", "to check precision",
        "The examiner uses one of the pair loosely.",
        "Correct it tactfully.",
        "Someone wrote: 'Your email inferred that I was late.' Is that right, and how would you correct it politely?", "neutral"),
    ],
  },

  {
    id: "c1-degrees-of-approval",
    topic: "the scale of approval",
    objectives: [
      "Place an assessment on the scale from adequate to excellent.",
      "Damn with faint praise deliberately.",
    ],
    goal: "Say exactly how good something is.",
    target: "calibrating approval",
    correction: "Model the calibrated assessment and let the learner place their own.",
    summary: "You learned to place an assessment precisely on the scale of approval.",
    minutes: 8,
    points: [
      {
        form: "perfectly decent",
        claims: [
          "'Perfectly decent' means adequate; in context it often frames the thing as acceptable but not exceptional.",
          "In this collocation 'perfectly' tends to mark the limit of the praise rather than raise it.",
        ],
        ex: ["It was perfectly decent.", "The food was perfectly decent, if unremarkable."],
      },
      {
        form: "genuinely outstanding",
        claims: [
          "'Genuinely' stresses that the praise is sincere; it is optional.",
          "It helps when the listener might suspect you are only being polite.",
        ],
        ex: ["The second half was genuinely outstanding.", "It was genuinely outstanding work."],
      },
      {
        form: "not without merit",
        claims: [
          "'Not without merit' often suggests limited approval, especially in evaluations: it concedes some value.",
          "Double negatives of this kind usually lower rather than raise the assessment.",
        ],
        ex: ["The proposal is not without merit.", "It was not without merit, but it was not enough."],
      },
    ],
    ex: [],
    drills: [
      // p1 — perfectly decent
      fc("p1", "The food was ___ decent, if unremarkable.", ["perfectly", "perfect", "perfection"]),
      sit("p1", "You thought the hotel was fine: nothing wrong, nothing special. What do you say?", [
        "It was perfectly decent.",
        "It was genuinely outstanding.",
        "It was perfect decent.",
      ]),
      lc("p1", "It was perfectly decent.", ["It was perfectly dreadful.", "It wasn't decent at all."]),
      // p2 — genuinely outstanding
      fc("p2", "The second half was ___ outstanding.", ["genuinely", "genuine", "genuineness"]),
      sit("p2", "A colleague's work was excellent, and you want it clear that you are not just being polite. What do you say?", [
        "It was genuinely outstanding work.",
        "It was perfectly decent work.",
        "It was not without merit.",
      ]),
      spk("p2", "The second half was genuinely outstanding."),
      // p3 — not without merit
      fc("p3", "The proposal is not without ___.", ["merit", "meriting", "merited"]),
      chat("p3", ["So, what did you think of my plan? Be diplomatic.", null], [
        "It's not without merit, but it needs work.",
        "It's not with merit, but it needs work.",
        "It has no merit at all.",
      ]),
      la("p3", "The proposal is not without merit.", ["meriting"]),
      // karışık
      sit("mix", "You rank two talks: the first was fine, the second excellent. Which is correct?", [
        "The first was perfectly decent; the second was genuinely outstanding.",
        "The first was genuinely outstanding; the second was perfectly decent.",
        "The first was perfect decent; the second was genuinely outstanding.",
      ]),
      chat("mix", ["How would you describe the three proposals?", null], [
        "One is genuinely outstanding; the other two are not without merit.",
        "One is genuine outstanding; the other two are not without merit.",
        "One is genuinely outstanding; the other two are not with merit.",
      ]),
    ],
    success: "The learner places at least two assessments precisely on the scale.",
    quiz: [
      qmcq("What does 'perfectly' tend to do in 'perfectly decent'?", [
        "It marks the limit of the praise.",
        "It raises the praise considerably.",
        "It makes the praise sarcastic.",
      ], 0),
      qfill("It was ___ without merit, but not enough. (not)", ["not"]),
      qmcq("What does 'genuinely' add?", [
        "It stresses that the praise is sincere.",
        "It is grammatically required before adjectives.",
        "It makes the sentence formal.",
      ], 0),
    ],
    scenes: [
      sc("Ravenna", "a friend who performed", "to hear an honest assessment",
        "A friend performed and wants your real view.",
        "Calibrate the praise honestly.",
        "You came to my concert last night. Be honest: was it any good?", "nervous"),
      sc("Idris", "a colleague reviewing submissions", "to rank submissions accurately",
        "Several submissions must be ranked.",
        "Calibrate each assessment.",
        "We have three job applications: one weak, one fine, one excellent. How would you describe each of them?", "exacting"),
      sc("Solveig", "a fellow traveller", "to hear a precise verdict",
        "A fellow traveller asks your verdict on the restaurant you both tried.",
        "Place the assessment precisely.",
        "I need more than 'quite good'. Where does last night's restaurant sit for you?", "precise"),
      sc("Professor Adeyemi", "your tutor", "to practise calibration",
        "The seminar is examining evaluative language.",
        "Calibrate assessments precisely.",
        "A colleague's talk was fine but forgettable. How would you describe it honestly but kindly?", "probing"),
      sc("Ms. Whitlock", "the examiner", "to check evaluative precision",
        "The examiner asks for an assessment.",
        "Calibrate it precisely.",
        "Could you assess something you saw recently, precisely?", "neutral"),
    ],
  },

  {
    id: "c1-hedged-and-blunt",
    topic: "distance between yourself and a claim",
    objectives: [
      "Increase the distance between yourself and a claim.",
      "Drop the hedges when directness is needed.",
    ],
    goal: "Choose how much you commit to what you are saying.",
    target: "hedging and directness",
    correction: "Contrast the hedged and blunt versions and let the learner choose.",
    summary: "You learned to control how much distance you put between yourself and a claim.",
    minutes: 9,
    points: [
      {
        form: "it would appear",
        claims: [
          "'It would appear that' creates more distance than a direct assertion.",
          "Overusing it can read as evasion rather than caution.",
        ],
        ex: ["It would appear that nobody was informed.", "It would appear the figures were wrong."],
      },
      {
        form: "one could argue",
        claims: [
          "'One could argue' presents a view tentatively, without fully committing you to it.",
          "It raises a view without attributing it to you, which keeps the discussion open.",
        ],
        ex: ["One could argue the opposite.", "One could argue that the decision was premature."],
      },
      {
        form: "quite frankly",
        claims: [
          "'Quite frankly' signals candour and that directness is coming.",
          "Overuse makes it lose force or sound confrontational.",
        ],
        ex: ["Quite frankly, it will not work.", "Quite frankly, I disagree."],
      },
    ],
    ex: [],
    drills: [
      // p1 — it would appear
      fc("p1", "It would ___ that nobody was informed.", ["appear", "appears", "appearing"]),
      sit("p1", "You are writing to a client. You think the invoice is wrong, but you want some distance from the claim. What do you write?", [
        "It would appear that the invoice is wrong.",
        "Quite frankly, the invoice is wrong.",
        "It would appears that the invoice is wrong.",
      ]),
      lc("p1", "It would appear the figures were wrong.", ["It would appear the figures were right.", "It will appear in the papers tonight."]),
      // p2 — one could argue
      fc("p2", "One ___ argue the opposite.", ["could", "coulds", "could to"]),
      chat("p2", ["Was the decision right?", null], [
        "One could argue that we moved too fast.",
        "One could argues that we moved too fast.",
        "One could argue than we moved too fast.",
      ]),
      spk("p2", "One could argue the opposite."),
      // p3 — quite frankly
      fc("p3", "___ frankly, it will not work.", ["Quite", "Quiet", "Quit"]),
      sit("p3", "A friend asks your real view, and you want to be completely direct. What do you say?", [
        "Quite frankly, I disagree.",
        "It would appear that I may disagree.",
        "One could argue that I disagree.",
      ]),
      la("p3", "Quite frankly, it will not work.", ["frank"]),
      // karışık
      chat("mix", ["Give me your view cautiously first, then bluntly.", null], [
        "It would appear the plan failed. Quite frankly, it was never going to work.",
        "It would appear the plan failed. Quite frank, it was never going to work.",
        "It would appears the plan failed. Quite frankly, it was never going to work.",
      ]),
      sit("mix", "You raise a view without owning it, then say what you really think. Which is correct?", [
        "One could argue that it was bad luck. Quite frankly, it was bad planning.",
        "One could argued that it was bad luck. Quite frankly, it was bad planning.",
        "One could argue that it was bad luck. Quiet frankly, it was bad planning.",
      ]),
    ],
    success: "The learner varies the distance between themselves and a claim deliberately.",
    quiz: [
      qmcq("What is the risk of overusing 'it would appear'?", [
        "It reads as evasion rather than caution.",
        "It becomes grammatically incorrect.",
        "It sounds too informal.",
      ], 0),
      qfill("One ___ argue that the decision was premature. (can)", ["could"]),
      qmcq("What is the risk of overusing 'quite frankly'?", [
        "It loses force or starts to sound confrontational.",
        "It becomes grammatically incorrect.",
        "It changes the tense of the verb.",
      ], 0),
    ],
    scenes: [
      sc("Marek", "a friend asking for your real view", "to get past the hedging",
        "A friend senses you are hedging.",
        "Move from hedged to direct.",
        "You have been very diplomatic about the boss's new plan. What do you actually think?", "probing"),
      sc("Renata", "a colleague in a minuted meeting", "to hear a view that can be recorded",
        "A meeting is being minuted and wording matters.",
        "Hedge appropriately, then be direct.",
        "This meeting is minuted. How would you like your view on the budget cuts noted?", "careful"),
      sc("Kofi", "a travel writer", "to get an attributable quote",
        "A travel writer wants a quote about a hotel you stayed at.",
        "Control the distance deliberately.",
        "You stayed at the new hotel by the harbour. Can I quote your opinion of it, or shall we say 'sources'?", "persistent"),
      sc("Mrs. Nowak", "your tutor", "to practise hedging",
        "The seminar is examining epistemic distance.",
        "Vary the distance deliberately.",
        "Give me your view on a four-day school week, first cautiously and then bluntly. How would each version sound?", "probing"),
      sc("Mr. Delacroix", "the examiner", "to check hedging control",
        "The examiner asks for an opinion.",
        "Vary the distance deliberately.",
        "Could you give me the same view cautiously and then bluntly?", "neutral"),
    ],
  },

  {
    id: "c1-tends-to-has-a-habit-of",
    topic: "describing tendencies",
    objectives: [
      "Describe a tendency without claiming it is invariable.",
      "Signal disapproval through the choice of expression.",
    ],
    goal: "Describe what usually happens with the right degree of commitment.",
    target: "expressing tendencies",
    correction: "Model the tendency expression and let the learner describe their own.",
    summary: "You learned to describe tendencies with the right degree of commitment.",
    minutes: 9,
    points: [
      {
        form: "tends to",
        claims: [
          "'Tends to' describes a pattern without claiming it holds every time.",
          "It is neutral: it carries no approval or disapproval on its own.",
        ],
        ex: ["The system tends to slow down in the afternoon.", "He tends to arrive late."],
      },
      {
        form: "has a habit of",
        claims: [
          "'Has a habit of' usually carries mild disapproval.",
          "The same fact stated with 'tends to' sounds neutral by comparison.",
        ],
        ex: ["He has a habit of interrupting.", "She has a habit of leaving things until the last minute."],
      },
      {
        form: "more often than not",
        claims: [
          "'More often than not' means in a majority of cases, without specifying the proportion.",
          "It states a majority explicitly, where 'usually' is read very differently by different listeners.",
        ],
        ex: ["More often than not, it works.", "More often than not, nobody replies."],
      },
    ],
    ex: [],
    drills: [
      // p1 — tends to
      fc("p1", "The system ___ to slow down in the afternoon.", ["tends", "tend", "tending"]),
      sit("p1", "Your colleague starts late most days, but not every day. You describe it neutrally. What do you say?", [
        "She tends to start late.",
        "She always starts late.",
        "She tends starting late.",
      ]),
      lc("p1", "The system tends to slow down in the afternoon.", ["The system is slow every afternoon without fail.", "The team tends to leave in the afternoon."]),
      // p2 — has a habit of
      fc("p2", "He has a ___ of interrupting.", ["habit", "habits", "habitual"]),
      sit("p2", "Your flatmate leaves dishes in the sink. You want the WORDS themselves, not your tone, to add mild disapproval. Which sentence does that?", [
        "She has a habit of leaving dishes in the sink.",
        "She tends to leave dishes in the sink.",
        "She has a habit to leave dishes in the sink.",
      ]),
      arr("p2", "He has a habit of interrupting.", ["interrupt"]),
      // p3 — more often than not
      fc("p3", "More often than ___, nobody replies.", ["not", "no", "none"]),
      chat("p3", ["Does the bus come on time?", null], [
        "More often than not, it's late.",
        "More often than no, it's late.",
        "More often that not, it's late.",
      ]),
      spk("p3", "More often than not, it works."),
      // karışık
      sit("mix", "You describe a colleague: first a neutral pattern, then an annoying one. Which is correct?", [
        "She tends to work late, and she has a habit of skipping lunch.",
        "She tends to work late, and she has a habit to skip lunch.",
        "She tend to work late, and she has a habit of skipping lunch.",
      ]),
      chat("mix", ["What's he like to work with?", null], [
        "More often than not, he's helpful, but he has a habit of interrupting.",
        "More often than not, he's helpful, but he has a habit for interrupting.",
        "More often then not, he's helpful, but he has a habit of interrupting.",
      ]),
    ],
    success: "The learner describes tendencies with appropriate commitment and attitude.",
    quiz: [
      qmcq("Which explicitly indicates a majority of cases?", [
        "More often than not",
        "Usually",
        "Quite often",
      ], 0),
      qfill("He ___ to arrive late on Mondays. (tend)", ["tends"]),
      qmcq("What does 'tends to' carry?", [
        "no approval or disapproval on its own",
        "mild disapproval",
        "strong approval",
      ], 0),
    ],
    scenes: [
      sc("Bruna", "a friend asking about a mutual acquaintance", "to hear an honest but fair description",
        "A mutual acquaintance is being described.",
        "Describe tendencies with the right attitude.",
        "What is he actually like to work with?", "curious"),
      sc("Priya", "a manager writing a reference", "to word a reference fairly",
        "A reference must be honest without being damaging.",
        "Calibrate the attitude.",
        "I have to be truthful but fair. How would you put it?", "careful"),
      sc("Hugo", "a visitor asking about the local trains", "to understand how the trains behave",
        "A visitor asks you, a resident, about the local trains.",
        "Describe the tendency precisely.",
        "You have lived here a year. Do the trains here always run late, or just sometimes?", "curious"),
      sc("Mr. Boateng", "your tutor", "to practise tendency expressions",
        "The seminar is examining degrees of generalisation.",
        "Describe tendencies precisely.",
        "Describe a friend's habit, first neutrally and then so that your annoyance shows. How would you put it?", "probing"),
      sc("Ms. Aaltonen", "the examiner", "to check generalisation",
        "The examiner asks about patterns you have noticed.",
        "Describe them with the right commitment.",
        "Could you describe a pattern you have noticed, without overstating it?", "neutral"),
    ],
  },

  {
    id: "c1-almost-the-right-word",
    topic: "narrowing down to the exact term",
    objectives: [
      "Reject a near-miss word and keep searching.",
      "Keep the conversation moving while you search.",
    ],
    goal: "Find the exact word without stopping the conversation.",
    target: "searching for the precise word",
    correction: "Model the narrowing move and let the learner keep searching aloud.",
    summary: "You practised narrowing down to the exact word without losing the conversation.",
    minutes: 8,
    points: [
      {
        form: "not quite that",
        claims: [
          "'Not quite that' rejects a near-miss without dismissing the help.",
          "It keeps the other person offering rather than stopping.",
        ],
        ex: ["Not quite that, but close.", "Not quite that — something sharper."],
      },
      {
        form: "closer to",
        claims: [
          "'Closer to' moves towards the target by comparison rather than definition.",
          "Comparing is often faster than defining when you are searching.",
        ],
        ex: ["Closer to reluctant than unwilling.", "Closer to tired than bored."],
      },
      {
        form: "what I'm reaching for",
        claims: [
          "'What I'm reaching for is...' names the search itself and buys time.",
          "Naming the search is better than stopping mid-sentence.",
        ],
        ex: ["What I'm reaching for is something like resignation.", "What I'm reaching for is more specific."],
      },
    ],
    ex: [],
    drills: [
      // p1 — not quite that
      fc("p1", "Not quite ___, but close.", ["that", "than", "thats"]),
      sit("p1", "A friend offers 'anger' for your feeling. It is close but not right, and you want them to keep guessing. What do you say?", [
        "Not quite that, but close.",
        "Yes, exactly that.",
        "No. Stop guessing.",
      ]),
      lc("p1", "Not quite that, but close.", ["Not quite yet, but soon.", "That's quite close, but no."]),
      // p2 — closer to
      fc("p2", "It felt closer ___ relief than joy.", ["to", "than", "from"]),
      sit("p2", "Your friend suggests 'unwilling', but you mean something softer. You compare instead of defining. What do you say?", [
        "Closer to reluctant than unwilling.",
        "Closer than reluctant to unwilling.",
        "Close to reluctant than unwilling.",
      ]),
      spk("p2", "It's closer to sad than angry."),
      // p3 — what I'm reaching for
      fc("p3", "What I'm ___ for is a softer word.", ["reaching", "reach", "reached"]),
      sit("p3", "You can't find the word yet, but you don't want to stop speaking. What do you say?", [
        "What I'm reaching for is more specific.",
        "What I'm reaching to is more specific.",
        "What I reaching for is more specific.",
      ]),
      la("p3", "What I'm reaching for is something like resignation.", ["reach"]),
      // karışık
      chat("mix", ["Frustrated? Is that the word?", null], [
        "Not quite that. Closer to disappointed than angry.",
        "Not quite that. Closer from disappointed than angry.",
        "Not quite than. Closer to disappointed than angry.",
      ]),
      sit("mix", "You reject a word and then name your search to buy time. Which is correct?", [
        "Not quite that. What I'm reaching for is a gentler word.",
        "Not quite that. What I'm reaching at is a gentler word.",
        "Not quiet that. What I'm reaching for is a gentler word.",
      ]),
    ],
    success: "The learner searches aloud without losing the conversation.",
    quiz: [
      qmcq("Why name the search itself?", [
        "It is better than stopping mid-sentence.",
        "It is grammatically required.",
        "It ends the conversation politely.",
      ], 0),
      qfill("___ to tired than bored, I think. (close)", ["Closer"]),
      qmcq("What does 'not quite that' preserve?", [
        "the other person's willingness to keep offering",
        "the grammatical subject",
        "the formality of the exchange",
      ], 0),
    ],
    scenes: [
      sc("Ingrid", "a friend helping you find a word", "to help you land on the right word",
        "You are struggling to name something precisely.",
        "Reject near-misses and keep searching.",
        "Angry? Frustrated? Can you give me something to work with?", "helpful"),
      sc("Owen", "a colleague drafting wording", "to find the right term for a document",
        "A document needs exactly the right term.",
        "Narrow it down aloud.",
        "We need one word for how customers feel about the price rise, and 'angry' is too strong. What are we actually trying to say?", "focused"),
      sc("Camille", "an interpreter helping you", "to convey a shade of meaning",
        "An interpreter needs the precise shade you mean.",
        "Narrow it down.",
        "You told the hotel manager you were 'upset'. That word has several shades. Which one do you mean?", "precise"),
      sc("Ms. Kowalski", "your tutor", "to practise lexical searching",
        "The seminar is examining vocabulary precision.",
        "Search aloud without stopping.",
        "Describe how it feels to move to a new city. If the first word you find is wrong, how do you keep going?", "probing"),
      sc("Mr. Ozturk", "the examiner", "to check fluency under lexical strain",
        "The examiner asks about something hard to name.",
        "Keep speaking while you search.",
        "Could you describe a feeling you have never found the word for?", "neutral"),
    ],
  },

  {
    id: "c1-describing-something-complicated",
    topic: "an accurate account of something messy",
    objectives: [
      "Acknowledge that a situation has several layers.",
      "Give a compact summary after the complexity.",
    ],
    goal: "Describe something genuinely complicated without oversimplifying it.",
    target: "describing complexity accurately",
    correction: "Model the layering sentence and let the learner describe the complexity.",
    summary: "You practised describing something complicated without flattening it.",
    minutes: 8,
    points: [
      {
        form: "there are several layers",
        claims: [
          "'There are several layers to this' warns the listener not to expect one cause.",
          "The warning protects an accurate answer from sounding evasive.",
        ],
        ex: ["There are several layers to this.", "There are several layers, and they interact."],
      },
      {
        form: "it's tangled up with",
        claims: [
          "'It's tangled up with' names a connection you cannot separate cleanly.",
          "Admitting the tangle is more accurate than pretending it is separable.",
        ],
        ex: ["It's tangled up with a much older dispute.", "It's tangled up with funding."],
      },
      {
        form: "in short",
        claims: [
          "In this lesson, 'in short' delivers a compact summary after the detail, not instead of it.",
          "In a written brief, an executive summary may reasonably come first.",
        ],
        ex: ["In short, nobody owns the decision.", "In short, it is unresolved."],
      },
    ],
    ex: [],
    drills: [
      // p1 — there are several layers
      fc("p1", "There are several ___ to this.", ["layers", "layer", "layered"]),
      sit("p1", "A friend wants one cause for a messy problem. You warn them that there isn't one. What do you say?", [
        "There are several layers to this.",
        "There is one simple cause.",
        "It is all very simple, really.",
      ]),
      lc("p1", "There are several layers, and they interact.", ["There is only one reason, and it's simple.", "There were several delays, and they added up."]),
      // p2 — it's tangled up with
      fc("p2", "The delay is ___ up with a much older dispute.", ["tangled", "tangle", "tangles"]),
      chat("p2", ["Can't we just fix the funding and move on?", null], [
        "Not really. It's tangled up with an old dispute.",
        "Not really. It's tangle up with an old dispute.",
        "Not really. It's tangled up to an old dispute.",
      ]),
      spk("p2", "It's tangled up with a much older dispute."),
      // p3 — in short
      fc("p3", "___ short, nobody owns the decision.", ["In", "On", "At"]),
      sit("p3", "You have explained all the details. Now you close with a compact summary. What do you say?", [
        "In short, it is unresolved.",
        "On short, it is unresolved.",
        "In shortly, it is unresolved.",
      ]),
      la("p3", "In short, nobody owns the decision.", ["own"]),
      // karışık
      chat("mix", ["Why has the project stalled?", null], [
        "There are several layers: funding is disputed, and two teams share control. In short, nobody owns it.",
        "There are several layers: funding is disputed, and two teams share control. On short, nobody owns it.",
        "There are several layers: funding is disputed, and two teams share control. In shortly, nobody owns it.",
      ]),
      sit("mix", "You name a connection you cannot separate, then sum up at the end. Which is correct?", [
        "It's tangled up with funding and an old dispute. In short, it's stuck.",
        "It's tangled up from funding and an old dispute. In short, it's stuck.",
        "It's tangled up with funding and an old dispute. In shortly, it's stuck.",
      ]),
    ],
    success: "The learner preserves the complexity and closes with a summary.",
    quiz: [
      qmcq("Why warn about layers first?", [
        "It protects an accurate answer from sounding evasive.",
        "It shortens the explanation.",
        "It avoids the passive voice.",
      ], 0),
      qfill("It's ___ up with funding, unfortunately. (tangle)", ["tangled"]),
      qmcq("Why does 'in short' come last here?", [
        "It closes the account rather than replacing it.",
        "It cannot open a sentence.",
        "It requires a past tense before it.",
      ], 0),
    ],
    scenes: [
      sc("Rashid", "a friend expecting a simple answer", "to understand why there is no simple answer",
        "A friend wants a one-line answer to something complicated.",
        "Preserve the complexity and summarise.",
        "Just tell me who is at fault. It cannot be that complicated?", "impatient"),
      sc("Halima", "a new colleague joining a messy project", "to understand a tangled situation",
        "A new colleague needs the real picture.",
        "Describe the layers and summarise.",
        "Everyone tells me a different version. What is actually going on?", "bewildered"),
      sc("Anders", "a visa officer", "to grasp a complicated case",
        "A visa officer needs an accurate account of a complicated situation.",
        "Describe accurately without evasion.",
        "Your visa, your job and your flat all changed at once. Take your time. What happened?", "patient"),
      sc("Professor Osei", "your tutor", "to practise describing complexity",
        "The seminar is examining accurate description.",
        "Preserve complexity and summarise.",
        "Why do so many young adults move back in with their parents? Can you explain it without oversimplifying?", "probing"),
      sc("Ms. Reyes", "the examiner", "to check descriptive accuracy",
        "The examiner asks about something complicated.",
        "Preserve complexity and close with a summary.",
        "Could you describe a complicated situation without oversimplifying it?", "neutral"),
    ],
  },

  {
    id: "c1-choosing-the-register",
    topic: "the same content at three levels",
    objectives: [
      "Deliver one message at three levels of formality.",
      "Judge which level a situation needs.",
    ],
    goal: "Say the same thing formally, casually and somewhere between.",
    target: "controlling register deliberately",
    correction: "Give one version and let the learner produce the other two.",
    summary: "You practised delivering one message at three levels of formality.",
    minutes: 8,
    points: [
      {
        form: "formally I'd say",
        claims: [
          "The formal version avoids contractions and colloquialisms; clear verbs still beat unnecessary nominalisation.",
          "'I am unable to attend' rather than 'I can't come'.",
        ],
        ex: ["Formally I'd say: I am unable to attend.", "Formally I'd say we are unable to proceed."],
      },
      {
        form: "casually it's just",
        claims: [
          "The casual version uses contractions, phrasal verbs and short sentences.",
          "'I can't make it' carries the same information with a different social meaning.",
        ],
        ex: ["Casually it's just: I can't make it.", "Casually it's just: we're not going ahead."],
      },
      {
        form: "somewhere in between",
        claims: [
          "The middle register is where most professional communication actually sits.",
          "Choosing the extreme when the middle fits is itself a register error.",
        ],
        ex: ["Somewhere in between: I'm afraid I can't attend.", "Somewhere in between works best here."],
      },
    ],
    ex: [],
    drills: [
      // p1 — formally I'd say
      fc("p1", "___ I'd say: I am unable to attend.", ["Formally", "Formal", "Formality"]),
      sit("p1", "You must decline a board invitation in the most formal way. Which is correct?", [
        "I am unable to attend.",
        "I can't make it.",
        "Can't come, sorry!",
      ]),
      lc("p1", "Formally I'd say we are unable to proceed.", ["Formally, we are ready to proceed.", "Frankly, I'd say we should stop."]),
      // p2 — casually it's just
      fc("p2", "Casually it's ___: I can't make it.", ["just", "justly", "justice"]),
      sit("p2", "You are texting a close friend that you can't come tonight. Which version fits?", [
        "Can't make it tonight, sorry!",
        "I regret that I am unable to attend this evening.",
        "I am afraid that attendance is not possible.",
      ]),
      spk("p2", "Casually it's just: I can't make it."),
      // p3 — somewhere in between
      fc("p3", "Somewhere in ___ works best here.", ["between", "among", "middle"]),
      sit("p3", "On the work chat, you tell a colleague from another team that you can't come to their meeting. Which register fits best?", [
        "I'm afraid I can't attend.",
        "I regret to inform you that attendance will not be possible.",
        "Nah, can't come.",
      ]),
      la("p3", "Somewhere in between works best here.", ["among"]),
      // karışık
      chat("mix", ["How would you decline the invitation formally, and then casually?", null], [
        "Formally I'd say I am unable to attend. Casually it's just: can't make it.",
        "Formally I'd say I can't make it. Casually it's just: I am unable to attend.",
        "Formal I'd say I am unable to attend. Casually it's just: can't make it.",
      ]),
      sit("mix", "You give the same refusal in the middle register and then the casual one. Which is correct?", [
        "Somewhere in between: I'm afraid I can't. Casually it's just: can't make it.",
        "Somewhere in between: can't make it. Casually it's just: I'm afraid I can't.",
        "Somewhere in among: I'm afraid I can't. Casually it's just: can't make it.",
      ]),
    ],
    success: "The learner delivers one message at three distinct levels.",
    quiz: [
      qmcq("Where does most professional communication sit?", [
        "in the middle register",
        "at the most formal end",
        "at the most casual end",
      ], 0),
      qfill("___ it's just: we're not going ahead. (casual)", ["Casually"]),
      qmcq("What is itself a register error?", [
        "choosing the extreme when the middle fits",
        "using contractions in speech",
        "using full forms in writing",
      ], 0),
    ],
    scenes: [
      sc("Fatima", "a friend learning English with you", "to see the three levels side by side",
        "A friend cannot judge which level to use.",
        "Demonstrate all three.",
        "How do I know which version to use? Show me all three?", "confused"),
      sc("Viktor", "a colleague drafting three messages", "to send the right version to each audience",
        "The same news goes to three different audiences.",
        "Produce all three versions.",
        "Same message, three audiences. How do we word each?", "practical"),
      sc("Ana Lucia", "a host curious about English register", "to understand how English shifts",
        "A host is curious how English changes with formality.",
        "Demonstrate the three levels.",
        "Is English very different when you are being formal?", "curious"),
      sc("Professor Tremblay", "your tutor", "to practise register control",
        "The seminar is examining register.",
        "Deliver one message at three levels.",
        "Decline a dinner invitation from a board member, a colleague and a close friend. How would each version sound?", "probing"),
      sc("Mr. Eriksen", "the examiner", "to check register control",
        "The examiner asks for three versions.",
        "Deliver all three cleanly.",
        "Could you decline an invitation formally, casually and in between?", "neutral"),
    ],
  },
];
