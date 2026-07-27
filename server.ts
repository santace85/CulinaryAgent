import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const HOSTNAME = "localhost";

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Recipe Generation Endpoint
app.post("/api/recipe", async (req, res) => {
  try {
    const { prompt, dietary, servings, cookTimeMax } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A recipe prompt is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "GEMINI_API_KEY is not set. Returning rich fallback recipe.",
      );
      return res.json({
        recipe: getFallbackRecipe(prompt, dietary, servings),
        isFallback: true,
      });
    }

    const systemInstruction = `You are CulinaryAgent AI, a world-class professional chef and culinary scientist.
Your task is to generate complete, structured, highly accurate cooking recipes formatted strictly as JSON.
When given a user query, generate a detailed recipe with:
1. Precise metric or standard measurements for every ingredient.
2. Categorized ingredients ('Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Spices', 'Bakery', 'Other').
3. Step-by-step clear instructions with explicit time durations in seconds where applicable (e.g., 600 for 10 mins).
4. Practical ingredient substitutions for common allergies or missing pantry items.
5. Chef tips, calorie counts, and nutrition metrics per serving.`;

    const userPrompt = `Generate a cooking recipe for: "${prompt}".
${dietary && dietary.length ? `Dietary preferences/restrictions: ${dietary.join(", ")}.` : ""}
${servings ? `Target servings: ${servings}.` : ""}
${cookTimeMax ? `Maximum cook time limit: ${cookTimeMax} minutes.` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            prepTimeMinutes: { type: Type.INTEGER },
            cookTimeMinutes: { type: Type.INTEGER },
            servings: { type: Type.INTEGER },
            difficulty: {
              type: Type.STRING,
              enum: ["Easy", "Medium", "Advanced"],
            },
            calories: { type: Type.INTEGER },
            cuisine: { type: Type.STRING },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: [
                      "Produce",
                      "Dairy & Eggs",
                      "Meat & Seafood",
                      "Pantry & Spices",
                      "Bakery",
                      "Other",
                    ],
                  },
                  notes: { type: Type.STRING },
                  optional: { type: Type.BOOLEAN },
                },
                required: ["id", "name", "amount", "unit", "category"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  timerSeconds: { type: Type.INTEGER },
                  tip: { type: Type.STRING },
                  technique: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "instruction"],
              },
            },
            substitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalIngredient: { type: Type.STRING },
                  substitute: { type: Type.STRING },
                  ratioOrNote: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["originalIngredient", "substitute", "ratioOrNote"],
              },
            },
            chefNotes: { type: Type.STRING },
            nutritionalInfo: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
                fiber: { type: Type.STRING },
              },
            },
          },
          required: [
            "title",
            "summary",
            "prepTimeMinutes",
            "cookTimeMinutes",
            "servings",
            "difficulty",
            "cuisine",
            "ingredients",
            "steps",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text content received from Gemini model");
    }

    const recipeData = JSON.parse(text);
    if (!recipeData.id) {
      recipeData.id = "recipe_" + Date.now();
    }

    return res.json({ recipe: recipeData, isFallback: false });
  } catch (error: any) {
    console.error("Error generating recipe with Gemini:", error);
    // Graceful fallback if error or quota limit
    return res.json({
      recipe: getFallbackRecipe(req.body.prompt || "Healthy Delicious Meal"),
      error: error.message || "Failed to generate AI recipe",
      isFallback: true,
    });
  }
});

// Quick Ingredient Substitution AI endpoint
app.post("/api/substitute", async (req, res) => {
  try {
    const { ingredient, recipeContext } = req.body;
    if (!ingredient) {
      return res.status(400).json({ error: "Ingredient name is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        substitutions: getFallbackSubstitutions(ingredient),
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Suggest 3 top culinary substitutes for "${ingredient}" ${
        recipeContext ? `in the context of making ${recipeContext}` : ""
      }. Provide ratio, taste impact, and best usage.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalIngredient: { type: Type.STRING },
              substitute: { type: Type.STRING },
              ratioOrNote: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: [
              "originalIngredient",
              "substitute",
              "ratioOrNote",
              "reason",
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ substitutions: parsed });
  } catch (err: any) {
    console.error("Error fetching substitutions:", err);
    return res.json({
      substitutions: getFallbackSubstitutions(req.body.ingredient),
    });
  }
});

// Fallback recipes generator
function getFallbackRecipe(
  query: string,
  dietary?: string[],
  targetServings?: number,
) {
  const q = query.toLowerCase();

  if (q.includes("pasta") || q.includes("spaghetti") || q.includes("italian")) {
    return {
      id: "recipe_creamy_garlic_tuscan_pasta",
      title: "Creamy Garlic Tuscan Spinach Pasta",
      summary:
        "A rich, velvety Italian pasta tossed with sun-dried tomatoes, tender spinach, and freshly grated Parmesan in a garlic cream sauce.",
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: targetServings || 4,
      difficulty: "Easy",
      calories: 520,
      cuisine: "Italian",
      dietaryTags: ["Vegetarian", "Quick 20-Min"],
      ingredients: [
        {
          id: "i1",
          name: "Penne or Fettuccine Pasta",
          amount: 350,
          unit: "g",
          category: "Pantry & Spices",
        },
        {
          id: "i2",
          name: "Heavy Cream",
          amount: 200,
          unit: "ml",
          category: "Dairy & Eggs",
          notes: "Or coconut cream for dairy-free",
        },
        {
          id: "i3",
          name: "Garlic cloves",
          amount: 4,
          unit: "minced",
          category: "Produce",
        },
        {
          id: "i4",
          name: "Fresh Baby Spinach",
          amount: 120,
          unit: "g",
          category: "Produce",
        },
        {
          id: "i5",
          name: "Sun-dried Tomatoes in oil",
          amount: 75,
          unit: "g",
          category: "Pantry & Spices",
          notes: "Drained & sliced",
        },
        {
          id: "i6",
          name: "Grated Parmesan Cheese",
          amount: 60,
          unit: "g",
          category: "Dairy & Eggs",
        },
        {
          id: "i7",
          name: "Extra Virgin Olive Oil",
          amount: 2,
          unit: "tbsp",
          category: "Pantry & Spices",
        },
        {
          id: "i8",
          name: "Italian Seasoning & Red Pepper Flakes",
          amount: 1,
          unit: "tsp",
          category: "Pantry & Spices",
        },
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Boil Pasta",
          instruction:
            "Bring a large pot of salted water to a rolling boil. Add pasta and cook according to package directions until al dente.",
          timerSeconds: 540,
          tip: "Reserve 1/2 cup of starchy pasta water before draining!",
        },
        {
          stepNumber: 2,
          title: "Sauté Aromatics",
          instruction:
            "In a large skillet over medium heat, add olive oil, minced garlic, and sliced sun-dried tomatoes. Sauté until fragrant.",
          timerSeconds: 120,
          tip: "Keep garlic on medium-low heat so it turns golden without burning.",
        },
        {
          stepNumber: 3,
          title: "Simmer Cream Sauce",
          instruction:
            "Pour in heavy cream, Italian seasoning, and red pepper flakes. Bring to a gentle simmer for 3-4 minutes until slightly thickened.",
          timerSeconds: 240,
          technique: "Simmering",
        },
        {
          stepNumber: 4,
          title: "Wilt Spinach & Combine",
          instruction:
            "Stir in baby spinach and grated Parmesan until spinach is wilted and cheese melts. Toss with drained pasta, adding pasta water as needed for gloss.",
          timerSeconds: 180,
          tip: "Garnish with fresh basil leaves and extra Parmesan before serving.",
        },
      ],
      substitutions: [
        {
          originalIngredient: "Heavy Cream",
          substitute: "Full-Fat Coconut Milk + 1 tsp lemon juice",
          ratioOrNote: "1:1 ratio",
          reason: "Dairy-Free or Vegan option",
        },
        {
          originalIngredient: "Parmesan Cheese",
          substitute: "Nutritional Yeast",
          ratioOrNote: "2 tbsp for cheesy flavor",
          reason: "Vegan substitute",
        },
        {
          originalIngredient: "Penne Pasta",
          substitute: "Gluten-Free Brown Rice Pasta or Chickpea Penne",
          ratioOrNote: "1:1 ratio",
          reason: "Gluten-Free alternative",
        },
      ],
      chefNotes:
        "This dish comes together in under 20 minutes! For added protein, toss in grilled chicken breast or sautéed jumbo shrimp.",
      nutritionalInfo: {
        protein: "16g",
        carbs: "62g",
        fat: "24g",
        fiber: "5g",
      },
    };
  }

  return {
    id: "recipe_lemon_herb_chicken_bowl",
    title: "Lemon Herb Grilled Chicken Buddha Bowl",
    summary:
      "A vibrant, nutrient-dense Mediterranean style bowl with juicy herb chicken, fluffy quinoa, crisp cucumbers, cherry tomatoes, and zesty tzatziki.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 18,
    servings: targetServings || 2,
    difficulty: "Easy",
    calories: 460,
    cuisine: "Mediterranean",
    dietaryTags: ["High-Protein", "Gluten-Free", "Low-Carb Options"],
    ingredients: [
      {
        id: "i1",
        name: "Boneless Chicken Breast or Thighs",
        amount: 400,
        unit: "g",
        category: "Meat & Seafood",
      },
      {
        id: "i2",
        name: "Cooked Quinoa or Brown Rice",
        amount: 250,
        unit: "g",
        category: "Pantry & Spices",
      },
      {
        id: "i3",
        name: "Fresh Lemon (Juice & Zest)",
        amount: 1,
        unit: "whole",
        category: "Produce",
      },
      {
        id: "i4",
        name: "Extra Virgin Olive Oil",
        amount: 2,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "i5",
        name: "Dried Oregano & Garlic Powder",
        amount: 1,
        unit: "tbsp",
        category: "Pantry & Spices",
      },
      {
        id: "i6",
        name: "English Cucumber & Cherry Tomatoes",
        amount: 200,
        unit: "g",
        category: "Produce",
        notes: "Diced & halved",
      },
      {
        id: "i7",
        name: "Greek Yogurt Tzatziki Sauce",
        amount: 4,
        unit: "tbsp",
        category: "Dairy & Eggs",
      },
      {
        id: "i8",
        name: "Kalamata Olives & Feta Cheese",
        amount: 50,
        unit: "g",
        category: "Dairy & Eggs",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Marinate Chicken",
        instruction:
          "Coat chicken with olive oil, lemon juice, lemon zest, garlic powder, oregano, salt, and black pepper. Let rest for 10 minutes.",
        timerSeconds: 600,
        tip: "Marinating in lemon juice tenderizes the poultry fibers.",
      },
      {
        stepNumber: 2,
        title: "Sear Chicken",
        instruction:
          "Heat a skillet or grill pan over medium-high heat. Sear chicken for 6-7 minutes per side until golden and internal temperature reaches 165°F (74°C).",
        timerSeconds: 420,
        technique: "Pan Searing",
      },
      {
        stepNumber: 3,
        title: "Assemble Bowl",
        instruction:
          "Divide cooked quinoa into bowls. Slice cooked chicken into strips and arrange alongside diced cucumber, tomatoes, olives, and crumbled feta.",
        timerSeconds: 180,
      },
      {
        stepNumber: 4,
        title: "Drizzle & Serve",
        instruction:
          "Top with a generous dollop of tzatziki sauce and garnish with fresh parsley or dill.",
        timerSeconds: 60,
      },
    ],
    substitutions: [
      {
        originalIngredient: "Chicken Breast",
        substitute: "Firm Tofu or Crispy Chickpeas",
        ratioOrNote: "Press tofu and pan sear for 10 mins",
        reason: "Vegetarian / Vegan swap",
      },
      {
        originalIngredient: "Greek Tzatziki",
        substitute: "Tahini Lemon Dressing or Hummus",
        ratioOrNote: "2 tbsp tahini + 1 tbsp water + lemon",
        reason: "Dairy-Free substitute",
      },
    ],
    chefNotes:
      "Great for meal prep! Pack sauce separately and keep veggies crisp until ready to eat.",
    nutritionalInfo: { protein: "42g", carbs: "38g", fat: "16g", fiber: "6g" },
  };
}

function getFallbackSubstitutions(ingredient: string) {
  const ing = (ingredient || "").toLowerCase();
  if (ing.includes("butter")) {
    return [
      {
        originalIngredient: "Butter",
        substitute: "Coconut Oil (Solid)",
        ratioOrNote: "1:1 ratio",
        reason: "Dairy-free substitute with similar baking consistency.",
      },
      {
        originalIngredient: "Butter",
        substitute: "Mashed Avocado or Applesauce",
        ratioOrNote: "1:1 in quick breads/muffins",
        reason: "Low-fat health alternative.",
      },
      {
        originalIngredient: "Butter",
        substitute: "Extra Virgin Olive Oil",
        ratioOrNote: "3/4 cup oil per 1 cup butter",
        reason: "Savory cooking swap.",
      },
    ];
  }
  if (ing.includes("egg")) {
    return [
      {
        originalIngredient: "Egg (1 whole)",
        substitute: "Flax Egg (1 tbsp ground flaxseed + 3 tbsp water)",
        ratioOrNote: "Let rest 5 mins until gelled",
        reason: "Best for baking muffins, cookies, and pancakes.",
      },
      {
        originalIngredient: "Egg (1 whole)",
        substitute: "Mashed Banana or Applesauce",
        ratioOrNote: "1/4 cup per egg",
        reason: "Sweet baking binder.",
      },
      {
        originalIngredient: "Egg (1 whole)",
        substitute: "Silken Tofu",
        ratioOrNote: "1/4 cup blended silken tofu",
        reason: "Moist baking & savory quiches.",
      },
    ];
  }
  return [
    {
      originalIngredient: ingredient,
      substitute: "Greek Yogurt or Sour Cream",
      ratioOrNote: "1:1 ratio",
      reason: "Rich texture & slight tang.",
    },
    {
      originalIngredient: ingredient,
      substitute: "Olive Oil + Lemon Juice",
      ratioOrNote: "1 tbsp oil + 1 tsp lemon",
      reason: "Acidity and fat balance.",
    },
  ];
}

// Server Listener Function
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOSTNAME, () => {
    console.log(`CulinaryAgent AI Server listening on ${HOSTNAME}:${PORT}`);
  });
}

startServer();
