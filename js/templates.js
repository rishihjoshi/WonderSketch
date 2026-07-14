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
  "Landmarks",
  "Patterns",
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const TEMPLATES = [
  { id: "anime-face", category: "Anime", name: "Anime Face", file: "anime-face.svg", difficulty: "Medium" },
  { id: "anime-eyes", category: "Anime", name: "Anime Eyes", file: "anime-eyes.svg", difficulty: "Easy" },
  { id: "animal-cat", category: "Animals", name: "Cat", file: "animal-cat.svg", difficulty: "Medium" },
  { id: "animal-dog", category: "Animals", name: "Dog", file: "animal-dog.svg", difficulty: "Medium" },
  { id: "flower-rose", category: "Flowers", name: "Rose", file: "flower-rose.svg", difficulty: "Easy" },
  { id: "flower-daisy", category: "Flowers", name: "Daisy", file: "flower-daisy.svg", difficulty: "Medium" },
  { id: "vehicle-car", category: "Vehicles", name: "Car", file: "vehicle-car.svg", difficulty: "Easy" },
  { id: "vehicle-bike", category: "Vehicles", name: "Motorbike", file: "vehicle-bike.svg", difficulty: "Easy" },
  { id: "calligraphy-flourish", category: "Calligraphy", name: "Flourish", file: "calligraphy-flourish.svg", difficulty: "Easy" },
  { id: "tattoo-tribal", category: "Tattoo", name: "Tribal", file: "tattoo-tribal.svg", difficulty: "Easy" },
  { id: "tattoo-rose", category: "Tattoo", name: "Rose Tattoo", file: "tattoo-rose.svg", difficulty: "Medium" },
  { id: "kids-star", category: "Kids", name: "Star", file: "kids-star.svg", difficulty: "Easy" },
  { id: "kids-house", category: "Kids", name: "House", file: "kids-house.svg", difficulty: "Easy" },
  { id: "faces-portrait", category: "Faces", name: "Portrait", file: "faces-portrait.svg", difficulty: "Medium" },
  { id: "faces-profile", category: "Faces", name: "Profile", file: "faces-profile.svg", difficulty: "Easy" },
  { id: "flower-sunflower", category: "Flowers", name: "Sunflower", file: "flower-sunflower.svg", difficulty: "Medium" },
  { id: "flower-tulip", category: "Flowers", name: "Tulip", file: "flower-tulip.svg", difficulty: "Easy" },
  { id: "scenery-eiffel", category: "Scenery", name: "Eiffel Tower", file: "scenery-eiffel.svg", difficulty: "Medium" },
  { id: "scenery-sunset", category: "Scenery", name: "Sunset", file: "scenery-sunset.svg", difficulty: "Easy" },
  { id: "fantasy-unicorn", category: "Fantasy", name: "Unicorn", file: "fantasy-unicorn.svg", difficulty: "Medium" },
  { id: "fantasy-butterfly", category: "Fantasy", name: "Butterfly", file: "fantasy-butterfly.svg", difficulty: "Medium" },
  { id: "fantasy-rainbow", category: "Fantasy", name: "Rainbow", file: "fantasy-rainbow.svg", difficulty: "Easy" },
  { id: "fantasy-cupcake", category: "Fantasy", name: "Cupcake", file: "fantasy-cupcake.svg", difficulty: "Easy" },
  { id: "fantasy-heart", category: "Fantasy", name: "Heart", file: "fantasy-heart.svg", difficulty: "Easy" },
  { id: "fantasy-crown", category: "Fantasy", name: "Crown", file: "fantasy-crown.svg", difficulty: "Easy" },
  { id: "faces-girl-front", category: "Faces", name: "Girl Portrait", file: "faces-girl-front.svg", difficulty: "Medium" },
  { id: "faces-side-profile-detailed", category: "Faces", name: "Detailed Profile", file: "faces-side-profile-detailed.svg", difficulty: "Medium" },
  { id: "faces-eye-study", category: "Faces", name: "Eye Study", file: "faces-eye-study.svg", difficulty: "Medium" },
  { id: "faces-girl-pigtails", category: "Faces", name: "Girl with Pigtails", file: "faces-girl-pigtails.svg", difficulty: "Hard" },
  { id: "scenery-eiffel-detailed", category: "Scenery", name: "Eiffel Tower (Detailed)", file: "scenery-eiffel-detailed.svg", difficulty: "Hard" },
  { id: "faces-girl-ponytail", category: "Faces", name: "Girl with Ponytail", file: "faces-girl-ponytail.svg", difficulty: "Hard" },
  { id: "scenery-eiffel-ultra", category: "Scenery", name: "Eiffel Tower (Ultra Detailed)", file: "scenery-eiffel-ultra.svg", difficulty: "Hard" },
  { id: "landmark-bigben", category: "Landmarks", name: "Big Ben", file: "landmark-bigben.svg", difficulty: "Medium" },
  { id: "landmark-statue-liberty", category: "Landmarks", name: "Statue of Liberty", file: "landmark-statue-liberty.svg", difficulty: "Easy" },
  { id: "landmark-taj-mahal", category: "Landmarks", name: "Taj Mahal", file: "landmark-taj-mahal.svg", difficulty: "Medium" },
  { id: "landmark-golden-gate", category: "Landmarks", name: "Golden Gate Bridge", file: "landmark-golden-gate.svg", difficulty: "Medium" },
  { id: "landmark-pisa", category: "Landmarks", name: "Leaning Tower of Pisa", file: "landmark-pisa.svg", difficulty: "Medium" },
  { id: "landmark-burj-khalifa", category: "Landmarks", name: "Burj Khalifa", file: "landmark-burj-khalifa.svg", difficulty: "Easy" },
  { id: "landmark-opera-house", category: "Landmarks", name: "Sydney Opera House", file: "landmark-opera-house.svg", difficulty: "Medium" },
  { id: "landmark-colosseum", category: "Landmarks", name: "Colosseum", file: "landmark-colosseum.svg", difficulty: "Medium" },
  { id: "landmark-pyramids", category: "Landmarks", name: "Pyramids of Giza", file: "landmark-pyramids.svg", difficulty: "Easy" },
  { id: "landmark-castle", category: "Landmarks", name: "Castle", file: "landmark-castle.svg", difficulty: "Medium" },
  { id: "landmark-lighthouse", category: "Landmarks", name: "Lighthouse", file: "landmark-lighthouse.svg", difficulty: "Easy" },
  { id: "landmark-windmill", category: "Landmarks", name: "Windmill", file: "landmark-windmill.svg", difficulty: "Medium" },
  { id: "animal-cat-ultra", category: "Animals", name: "Cat (Ultra Detailed)", file: "animal-cat-ultra.svg", difficulty: "Hard" },
  { id: "animal-dog-ultra", category: "Animals", name: "Dog (Ultra Detailed)", file: "animal-dog-ultra.svg", difficulty: "Hard" },
  { id: "animal-horse-ultra", category: "Animals", name: "Horse (Ultra Detailed)", file: "animal-horse-ultra.svg", difficulty: "Hard" },
  { id: "vehicle-car-ultra", category: "Vehicles", name: "Car (Ultra Detailed)", file: "vehicle-car-ultra.svg", difficulty: "Hard" },
  { id: "vehicle-airplane", category: "Vehicles", name: "Airplane", file: "vehicle-airplane.svg", difficulty: "Medium" },
  { id: "vehicle-sailboat", category: "Vehicles", name: "Sailboat", file: "vehicle-sailboat.svg", difficulty: "Easy" },
  { id: "fantasy-dragon-ultra", category: "Fantasy", name: "Dragon (Ultra Detailed)", file: "fantasy-dragon-ultra.svg", difficulty: "Hard" },
  { id: "nature-tree-ultra", category: "Scenery", name: "Tree (Ultra Detailed)", file: "nature-tree-ultra.svg", difficulty: "Hard" },
  { id: "nature-mountain-ultra", category: "Scenery", name: "Mountain Range (Ultra Detailed)", file: "nature-mountain-ultra.svg", difficulty: "Hard" },
  { id: "animal-owl-ultra", category: "Animals", name: "Owl (Ultra Detailed)", file: "animal-owl-ultra.svg", difficulty: "Hard" },
  { id: "animal-elephant-ultra", category: "Animals", name: "Elephant (Ultra Detailed)", file: "animal-elephant-ultra.svg", difficulty: "Hard" },
  { id: "flower-rose-ultra", category: "Flowers", name: "Rose (Ultra Detailed)", file: "flower-rose-ultra.svg", difficulty: "Hard" },
  { id: "flower-orchid", category: "Flowers", name: "Orchid", file: "flower-orchid.svg", difficulty: "Medium" },
  { id: "vehicle-train", category: "Vehicles", name: "Steam Train", file: "vehicle-train.svg", difficulty: "Medium" },
  { id: "vehicle-motorcycle-ultra", category: "Vehicles", name: "Motorcycle (Ultra Detailed)", file: "vehicle-motorcycle-ultra.svg", difficulty: "Hard" },
  { id: "fantasy-mermaid", category: "Fantasy", name: "Mermaid", file: "fantasy-mermaid.svg", difficulty: "Medium" },
  { id: "fantasy-phoenix", category: "Fantasy", name: "Phoenix", file: "fantasy-phoenix.svg", difficulty: "Hard" },
  { id: "kids-robot", category: "Kids", name: "Robot", file: "kids-robot.svg", difficulty: "Easy" },
  { id: "pattern-mandala-lotus", category: "Patterns", name: "Lotus Mandala", file: "pattern-mandala-lotus.svg", difficulty: "Hard" },
  { id: "pattern-mandala-star", category: "Patterns", name: "Star Mandala", file: "pattern-mandala-star.svg", difficulty: "Hard" },
  { id: "flower-dahlia-detailed", category: "Flowers", name: "Dahlia (Detailed)", file: "flower-dahlia-detailed.svg", difficulty: "Hard" },
  { id: "fantasy-butterfly-detailed", category: "Fantasy", name: "Butterfly (Detailed)", file: "fantasy-butterfly-detailed.svg", difficulty: "Hard" },
];

export function getTemplateUrl(template) {
  return `assets/templates/${template.file}`;
}

export function getTemplatesByCategory(category) {
  if (!category || category === "All") return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
}

export function filterTemplates(category, difficulty) {
  let list = getTemplatesByCategory(category);
  if (difficulty && difficulty !== "All") {
    list = list.filter((t) => t.difficulty === difficulty);
  }
  return list;
}

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id);
}
