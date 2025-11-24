import mongoose from "mongoose";

const RoutineSchema = new mongoose.Schema({
  nombre: String,
  dificultad: String,
  duracion: Number,
  ejercicios: [
    {
      nombre: String,
      repeticiones: Number,
      series: Number,
      descanso: Number,
    },
  ],
  usuario: {
    type: String,
    ref: "User",
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Routine", RoutineSchema);