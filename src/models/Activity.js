import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pendiente", "completado", "fallido"],
      default: "pendiente",
    },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number },
    objetivo: {
      type: String,
      required: true,
      enum: [
        "perder peso",
        "ganar masa muscular",
        "mejorar resistencia",
        "mantener salud general",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("Activity", ActivitySchema);
export default Activity;
