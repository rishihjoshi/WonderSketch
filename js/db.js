/* global Dexie */

const db = new Dexie("WonderSketchDB");

db.version(1).stores({
  favorites: "id, category, name",
  progress: "lessonId, completedAt",
  challenges: "date, completed",
  customImages: "++id, createdAt",
});

export async function toggleFavorite(template) {
  const existing = await db.favorites.get(template.id);
  if (existing) {
    await db.favorites.delete(template.id);
    return false;
  }
  await db.favorites.put(template);
  return true;
}

export async function isFavorite(id) {
  return !!(await db.favorites.get(id));
}

export async function getFavorites() {
  return db.favorites.toArray();
}

export async function markLessonComplete(lessonId) {
  await db.progress.put({ lessonId, completedAt: Date.now() });
}

export async function getCompletedLessons() {
  return db.progress.toArray();
}

export async function isLessonComplete(lessonId) {
  return !!(await db.progress.get(lessonId));
}

export async function recordChallenge(dateStr) {
  await db.challenges.put({ date: dateStr, completed: true });
}

export async function isChallengeDone(dateStr) {
  const row = await db.challenges.get(dateStr);
  return !!(row && row.completed);
}

export async function getChallengeHistory(limit = 14) {
  const all = await db.challenges.toArray();
  return all.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

export async function saveCustomImage(blob, name) {
  return db.customImages.add({ blob, name, createdAt: Date.now() });
}

export async function getCustomImages() {
  return db.customImages.toArray();
}

export async function clearAllData() {
  await db.delete();
}

export default db;
