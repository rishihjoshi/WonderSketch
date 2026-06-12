export const CATEGORIES = [
  "Anime",
  "Animals",
  "Flowers",
  "Vehicles",
  "Calligraphy",
  "Tattoo",
  "Kids",
  "Faces",
];

export const TEMPLATES = [
  { id: "anime-face", category: "Anime", name: "Anime Face", file: "anime-face.svg" },
  { id: "anime-eyes", category: "Anime", name: "Anime Eyes", file: "anime-eyes.svg" },
  { id: "animal-cat", category: "Animals", name: "Cat", file: "animal-cat.svg" },
  { id: "animal-dog", category: "Animals", name: "Dog", file: "animal-dog.svg" },
  { id: "flower-rose", category: "Flowers", name: "Rose", file: "flower-rose.svg" },
  { id: "flower-daisy", category: "Flowers", name: "Daisy", file: "flower-daisy.svg" },
  { id: "vehicle-car", category: "Vehicles", name: "Car", file: "vehicle-car.svg" },
  { id: "vehicle-bike", category: "Vehicles", name: "Motorbike", file: "vehicle-bike.svg" },
  { id: "calligraphy-flourish", category: "Calligraphy", name: "Flourish", file: "calligraphy-flourish.svg" },
  { id: "tattoo-tribal", category: "Tattoo", name: "Tribal", file: "tattoo-tribal.svg" },
  { id: "tattoo-rose", category: "Tattoo", name: "Rose Tattoo", file: "tattoo-rose.svg" },
  { id: "kids-star", category: "Kids", name: "Star", file: "kids-star.svg" },
  { id: "kids-house", category: "Kids", name: "House", file: "kids-house.svg" },
  { id: "faces-portrait", category: "Faces", name: "Portrait", file: "faces-portrait.svg" },
  { id: "faces-profile", category: "Faces", name: "Profile", file: "faces-profile.svg" },
];

export function getTemplateUrl(template) {
  return `assets/templates/${template.file}`;
}

export function getTemplatesByCategory(category) {
  if (!category || category === "All") return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id);
}
