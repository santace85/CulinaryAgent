import { Recipe } from "../types";

export const POPULAR_FALLBACK_RECIPES: Recipe[] = [
  {
    id: "popular_1",
    title: "Zesty Lemon Herb Chicken Sheet Pan Dinner",
    summary:
      "A bright, crowd-pleasing sheet pan meal with juicy chicken thighs, tender potatoes, and crisp green beans in a lemon herb glaze.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    servings: 4,
    difficulty: "Easy",
    calories: 530,
    cuisine: "American",
    dietaryTags: ["Family Friendly", "One-Pan", "High-Protein"],
    ingredients: [
      {
        id: "f1_i1",
        name: "Bone-in Chicken Thighs",
        amount: 6,
        unit: "pieces",
        category: "Meat & Seafood",
      },
      {
        id: "f1_i2",
        name: "Baby Potatoes",
        amount: 600,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f1_i3",
        name: "Fresh Green Beans",
        amount: 250,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f1_i4",
        name: "Lemon Juice & Zest",
        amount: 2,
        unit: "tbsp",
        category: "Produce",
      },
      {
        id: "f1_i5",
        name: "Garlic",
        amount: 4,
        unit: "cloves",
        category: "Produce",
      },
      {
        id: "f1_i6",
        name: "Olive Oil",
        amount: 3,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Prep the Sheet Pan",
        instruction:
          "Preheat oven to 425°F (220°C). Toss potatoes in oil, lemon zest, salt, and pepper on a sheet pan.",
        timerSeconds: 0,
      },
      {
        stepNumber: 2,
        title: "Season the Chicken",
        instruction:
          "Rub chicken thighs with garlic, lemon juice, rosemary, and smoked paprika. Nestle them among the potatoes.",
        timerSeconds: 0,
      },
      {
        stepNumber: 3,
        title: "Roast Until Crispy",
        instruction:
          "Roast for 20 minutes, then add green beans and continue baking until chicken is golden and cooked through.",
        timerSeconds: 1200,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Chicken Thighs",
        substitute: "Boneless Chicken Breasts",
        ratioOrNote: "Use same weight, reduce roast time by 5-7 minutes.",
        reason: "Lean protein swap",
      },
    ],
    chefNotes:
      "Let the chicken rest for 5 minutes before serving so the juices stay locked in.",
    drinkPairing: "A chilled Sauvignon Blanc or sparkling lemonade.",
    nutritionalInfo: { protein: "34g", carbs: "27g", fat: "28g", fiber: "5g" },
  },
  {
    id: "popular_2",
    title: "Creamy Mushroom & Spinach One-Pot Orzo",
    summary:
      "A rich, silky one-pot orzo with sautéed mushrooms, garlic, and baby spinach finished with Parmesan and fresh thyme.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: "Easy",
    calories: 460,
    cuisine: "Italian",
    dietaryTags: ["Vegetarian", "One-Pot", "Comfort Food"],
    ingredients: [
      {
        id: "f2_i1",
        name: "Orzo Pasta",
        amount: 300,
        unit: "g",
        category: "Pantry & Spices",
      },
      {
        id: "f2_i2",
        name: "Cremini or Button Mushrooms",
        amount: 250,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f2_i3",
        name: "Baby Spinach",
        amount: 120,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f2_i4",
        name: "Vegetable Broth",
        amount: 900,
        unit: "ml",
        category: "Pantry & Spices",
      },
      {
        id: "f2_i5",
        name: "Parmesan Cheese",
        amount: 60,
        unit: "g",
        category: "Dairy & Eggs",
      },
      {
        id: "f2_i6",
        name: "Garlic",
        amount: 3,
        unit: "cloves",
        category: "Produce",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Sauté the Mushrooms",
        instruction:
          "Cook mushrooms, garlic, and shallot in olive oil until the mushrooms release their juices and begin to brown.",
        timerSeconds: 300,
      },
      {
        stepNumber: 2,
        title: "Simmer the Orzo",
        instruction:
          "Add orzo and broth, bring to a simmer, stirring occasionally until the pasta is tender and liquid is almost absorbed.",
        timerSeconds: 900,
      },
      {
        stepNumber: 3,
        title: "Finish with Greens",
        instruction:
          "Stir in spinach, Parmesan, lemon zest, and a splash of cream for a glossy finish.",
        timerSeconds: 120,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Parmesan Cheese",
        substitute: "Nutritional Yeast",
        ratioOrNote: "2 tbsp for cheesy flavor",
        reason: "Vegan-friendly",
      },
    ],
    chefNotes:
      "This dish is great for weeknights and reheats beautifully the next day.",
    drinkPairing:
      "A glass of crisp Pinot Grigio or sparkling water with lemon.",
    nutritionalInfo: { protein: "12g", carbs: "62g", fat: "18g", fiber: "4g" },
  },
  {
    id: "popular_3",
    title: "Thai Green Curry with Tofu & Vegetables",
    summary:
      "A fragrant Thai green curry loaded with crispy tofu, bell peppers, snap peas, and bamboo shoots in a creamy coconut broth.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 18,
    servings: 4,
    difficulty: "Medium",
    calories: 510,
    cuisine: "Thai",
    dietaryTags: ["Vegan", "Gluten-Free", "Comfort Food"],
    ingredients: [
      {
        id: "f3_i1",
        name: "Extra-Firm Tofu",
        amount: 400,
        unit: "g",
        category: "Meat & Seafood",
      },
      {
        id: "f3_i2",
        name: "Thai Green Curry Paste",
        amount: 3,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "f3_i3",
        name: "Coconut Milk",
        amount: 400,
        unit: "ml",
        category: "Dairy & Eggs",
      },
      {
        id: "f3_i4",
        name: "Bell Peppers",
        amount: 2,
        unit: "whole",
        category: "Produce",
      },
      {
        id: "f3_i5",
        name: "Snap Peas",
        amount: 150,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f3_i6",
        name: "Thai Basil",
        amount: 15,
        unit: "g",
        category: "Produce",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Brown the Tofu",
        instruction:
          "Pan-fry cubed tofu until golden and crisp, then set aside.",
        timerSeconds: 300,
      },
      {
        stepNumber: 2,
        title: "Build the Curry",
        instruction:
          "Sauté curry paste with garlic and ginger, then stir in coconut milk and simmer.",
        timerSeconds: 240,
      },
      {
        stepNumber: 3,
        title: "Add Veggies & Serve",
        instruction:
          "Add vegetables to the sauce, cook until tender-crisp, then finish with tofu and basil.",
        timerSeconds: 180,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Tofu",
        substitute: "Chickpeas or Tempeh",
        ratioOrNote: "1:1 ratio",
        reason: "Protein alternative",
      },
    ],
    chefNotes:
      "For a brighter curry, add a squeeze of lime juice right before serving.",
    drinkPairing: "Thai iced tea or jasmine tea.",
    nutritionalInfo: { protein: "18g", carbs: "36g", fat: "32g", fiber: "6g" },
  },
  {
    id: "popular_4",
    title: "Pan-Seared Steak with Chimichurri and Roasted Veggies",
    summary:
      "A hearty steak dinner with bright herb chimichurri and caramelized roasted carrots, potatoes, and red onion.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2,
    difficulty: "Medium",
    calories: 640,
    cuisine: "Argentinian",
    dietaryTags: ["High-Protein", "Low-Carb Option"],
    ingredients: [
      {
        id: "f4_i1",
        name: "Ribeye or Sirloin Steak",
        amount: 500,
        unit: "g",
        category: "Meat & Seafood",
      },
      {
        id: "f4_i2",
        name: "Fresh Parsley & Cilantro",
        amount: 30,
        unit: "g",
        category: "Produce",
      },
      {
        id: "f4_i3",
        name: "Garlic",
        amount: 3,
        unit: "cloves",
        category: "Produce",
      },
      {
        id: "f4_i4",
        name: "Red Wine Vinegar",
        amount: 2,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "f4_i5",
        name: "Mixed Root Vegetables",
        amount: 450,
        unit: "g",
        category: "Produce",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Roast the Veggies",
        instruction:
          "Toss vegetables with olive oil, salt, and pepper, then roast at 425°F (220°C) until caramelized.",
        timerSeconds: 1800,
      },
      {
        stepNumber: 2,
        title: "Cook the Steak",
        instruction:
          "Season steak with salt and pepper. Sear in a hot pan until desired doneness, then rest.",
        timerSeconds: 600,
      },
      {
        stepNumber: 3,
        title: "Make Chimichurri",
        instruction:
          "Blend parsley, cilantro, garlic, vinegar, and olive oil into a bright herb sauce.",
        timerSeconds: 180,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Ribeye Steak",
        substitute: "Flank Steak or Skirt Steak",
        ratioOrNote: "Use same weight, slice thinly across the grain.",
        reason: "More affordable cut",
      },
    ],
    chefNotes:
      "Serve the steak sliced and spoon chimichurri over the top for the best flavor.",
    drinkPairing: "A bold Malbec or dark beer.",
    nutritionalInfo: { protein: "45g", carbs: "22g", fat: "36g", fiber: "5g" },
  },
  {
    id: "popular_5",
    title: "No-Bake Peanut Butter Chocolate Smoothie Bowl",
    summary:
      "A creamy breakfast bowl made with bananas, peanut butter, cocoa, and crunchy granola for a deliciously simple start to the day.",
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: "Easy",
    calories: 380,
    cuisine: "American",
    dietaryTags: ["Vegetarian", "Gluten-Free Option", "Quick"],
    ingredients: [
      {
        id: "f5_i1",
        name: "Frozen Banana",
        amount: 2,
        unit: "whole",
        category: "Produce",
      },
      {
        id: "f5_i2",
        name: "Peanut Butter",
        amount: 3,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "f5_i3",
        name: "Unsweetened Cocoa Powder",
        amount: 1,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "f5_i4",
        name: "Almond Milk",
        amount: 120,
        unit: "ml",
        category: "Dairy & Eggs",
      },
      {
        id: "f5_i5",
        name: "Granola or Nuts",
        amount: 30,
        unit: "g",
        category: "Pantry & Spices",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Blend the Base",
        instruction:
          "Blend frozen bananas, peanut butter, cocoa, and almond milk until thick and creamy.",
        timerSeconds: 90,
      },
      {
        stepNumber: 2,
        title: "Assemble the Bowl",
        instruction:
          "Spoon smoothie into bowls and top with granola, fresh berries, and a drizzle of peanut butter.",
        timerSeconds: 60,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Peanut Butter",
        substitute: "Almond Butter or Tahini",
        ratioOrNote: "1:1 ratio",
        reason: "Nut-free or flavor swap",
      },
    ],
    chefNotes:
      "Use ripe bananas and freeze them first for the creamiest texture without ice.",
    drinkPairing: "Iced coffee or a cold latte.",
    nutritionalInfo: { protein: "10g", carbs: "42g", fat: "18g", fiber: "6g" },
  },
];
