import { TEMPLATES } from "./templates.js";
import { todayString } from "./storage.js";

const PROMPTS = [
  "Draw it in under 10 minutes — focus on overall shape, not details.",
  "Trace it once, then redraw it freehand from memory.",
  "Add your own color scheme once the line work is done.",
  "Try drawing it from a different angle than shown.",
  "Combine it with another template in the same scene.",
];

function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodaysChallenge(dateStr = todayString()) {
  const seed = hashStringToInt(dateStr);
  const template = TEMPLATES[seed % TEMPLATES.length];
  const prompt = PROMPTS[seed % PROMPTS.length];
  return {
    date: dateStr,
    template,
    prompt,
  };
}

export function computeStreak(history, dateStr = todayString()) {
  const done = new Set(history.filter((h) => h.completed).map((h) => h.date));
  let streak = 0;
  const [year, month, day] = dateStr.split("-").map(Number);
  let cursor = new Date(year, month - 1, day);

  while (done.has(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
