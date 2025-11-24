import mongoose from "mongoose";

const physicalDataSchema = new mongoose.Schema(
  {
    sexo: {
      type: String,
      required: true,
    },
    altura: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    peso: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    edad: {
      type: Number,
      required: false,
    },
    nivelActividad: {
      type: String,
      required: true,
      enum: ["sedentario", "ligero", "moderado", "activo", "muy activo"],
    },
    experiencia: {
      type: String,
      required: true,
      enum: ["principiante", "intermedio", "avanzado"],
    },
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
    condicionesMedicas: [
      {
        type: String,
        required: false,
      },
    ],
    alergias: [
      {
        type: String,
        required: false,
      },
    ],
    usuario: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const PhysicalData = mongoose.model("PhysicalData", physicalDataSchema);
export default PhysicalData;
