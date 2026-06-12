export const CATEGORIES = [
  "Anime",
  "Animals",
  "Flowers",
  "Vehicles",
  "Calligraphy",
  "Tattoo",
  "Kids",
  "Faces",
  "Scenery",
  "Fantasy",
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
  { id: "flower-sunflower", category: "Flowers", name: "Sunflower", file: "flower-sunflower.svg" },
  { id: "flower-tulip", category: "Flowers", name: "Tulip", file: "flower-tulip.svg" },
  { id: "scenery-eiffel", category: "Scenery", name: "Eiffel Tower", file: "scenery-eiffel.svg" },
  { id: "scenery-sunset", category: "Scenery", name: "Sunset", file: "scenery-sunset.svg" },
  { id: "fantasy-unicorn", category: "Fantasy", name: "Unicorn", file: "fantasy-unicorn.svg" },
  { id: "fantasy-butterfly", category: "Fantasy", name: "Butterfly", file: "fantasy-butterfly.svg" },
  { id: "fantasy-rainbow", category: "Fantasy", name: "Rainbow", file: "fantasy-rainbow.svg" },
  { id: "fantasy-cupcake", category: "Fantasy", name: "Cupcake", file: "fantasy-cupcake.svg" },
  { id: "fantasy-heart", category: "Fantasy", name: "Heart", file: "fantasy-heart.svg" },
  { id: "fantasy-crown", category: "Fantasy", name: "Crown", file: "fantasy-crown.svg" },
  { id: "faces-girl-front", category: "Faces", name: "Girl Portrait", file: "faces-girl-front.svg" },
  { id: "faces-side-profile-detailed", category: "Faces", name: "Detailed Profile", file: "faces-side-profile-detailed.svg" },
  { id: "faces-eye-study", category: "Faces", name: "Eye Study", file: "faces-eye-study.svg" },
  { id: "faces-girl-pigtails", category: "Faces", name: "Girl with Pigtails", file: "faces-girl-pigtails.svg" },
  { id: "scenery-eiffel-detailed", category: "Scenery", name: "Eiffel Tower (Detailed)", file: "scenery-eiffel-detailed.svg" },
  { id: "faces-girl-ponytail", category: "Faces", name: "Girl with Ponytail", file: "faces-girl-ponytail.svg" },
  { id: "scenery-eiffel-ultra", category: "Scenery", name: "Eiffel Tower (Ultra Detailed)", file: "scenery-eiffel-ultra.svg" },
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
