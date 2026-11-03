import type { RoleplaySpec } from "@glotmate/contracts";
import { AIRPORT_BAG_DROP } from "./airport-bag-drop.js";
import { CAFE_DIETARY } from "./cafe-dietary.js";
import { CALLING_IN_SICK } from "./calling-in-sick.js";
import { COMPLAINT_REFUND } from "./complaint-refund.js";
import { DEADLINE_EXTENSION } from "./deadline-extension.js";
import { DELIVERY_WRONG } from "./delivery-wrong.js";
import { DOCTOR_APPOINTMENT } from "./doctor-appointment.js";
import { FIRST_DAY_OFFICE } from "./first-day-office.js";
import { FLAT_VIEWING } from "./flat-viewing.js";
import { FRIEND_FOOD_TRUCK } from "./friend-food-truck.js";
import { GYM_CANCEL } from "./gym-cancel.js";
import { HAIRCUT } from "./haircut.js";
import { HOTEL_CHECKIN } from "./hotel-checkin.js";
import { LEAKY_CEILING } from "./leaky-ceiling.js";
import { MARKET_STALL } from "./market-stall.js";
import { NEW_NEIGHBOUR } from "./new-neighbour.js";
import { NEW_PHONE } from "./new-phone.js";
import { NOISY_NEIGHBOUR } from "./noisy-neighbour.js";
import { PHARMACY } from "./pharmacy.js";
import { RESTAURANT_ORDER } from "./restaurant-order.js";
import { RETURN_CLOTHES } from "./return-clothes.js";
import { SALARY_REVIEW } from "./salary-review.js";
import { TRAIN_TICKET } from "./train-ticket.js";
import { WEEKEND_PLANS } from "./weekend-plans.js";

/**
 * REPO KATALOĞU — tohumlamanın okuduğu tek liste.
 *
 * Sekiz kategori × üç senaryo. İki pilot başta durur (incelenebilirlik ve
 * test-roleplay-lint referansı), gerisi kategori sırasıyla. Sıra yalnız
 * tohumlama çıktısını etkiler; keşifteki sıralama DB'den gelir.
 */
export const ROLEPLAY_SOURCES: ReadonlyArray<{ slug: string; spec: RoleplaySpec }> = [
  // Pilotlar
  RESTAURANT_ORDER,
  COMPLAINT_REFUND,
  // Eating out
  CAFE_DIETARY,
  DELIVERY_WRONG,
  // Travel
  TRAIN_TICKET,
  HOTEL_CHECKIN,
  AIRPORT_BAG_DROP,
  // Shopping
  MARKET_STALL,
  RETURN_CLOTHES,
  NEW_PHONE,
  // Work
  FIRST_DAY_OFFICE,
  DEADLINE_EXTENSION,
  SALARY_REVIEW,
  // Health
  PHARMACY,
  DOCTOR_APPOINTMENT,
  CALLING_IN_SICK,
  // Social
  NEW_NEIGHBOUR,
  WEEKEND_PLANS,
  FRIEND_FOOD_TRUCK,
  // Housing
  FLAT_VIEWING,
  LEAKY_CEILING,
  NOISY_NEIGHBOUR,
  // Services
  HAIRCUT,
  GYM_CANCEL,
];
