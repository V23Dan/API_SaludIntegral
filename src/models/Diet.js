import mongoose from "mongoose";

const DietSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    objetivos: [
      {
        type: String,
        required: true,
        enum: [
          "perder peso",
          "ganar masa muscular",
          "mejorar resistencia",
          "mantener salud general",
        ],
      },
    ],

    nutritionSummary: {
      totalCalories: { type: Number, required: true },
      totalProtein: { type: Number, required: true },
      totalCarbs: { type: Number, required: true },
      totalFats: { type: Number, required: true },
    },
    meals: [
      {
        name: { type: String, required: true },
        foods: [{ type: String, required: true }],
        calories: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Diet = mongoose.model("Diet", DietSchema);
export default Diet;
