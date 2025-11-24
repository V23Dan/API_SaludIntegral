import mongoose from "mongoose";

const bodyReportSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      ref: "User",
      required: true,
    },
    imc: {
      type: Number,
      required: true,
    },
    clasificacionIMC: {
      type: String,
      required: true,
    },
    porcentajeGrasaCorporal: {
      type: Number,
      required: true,
    },
    clasificacionGrasa: {
      type: String, 
      required: true,
    },
    metodoDeCalculo: {
      type: String, 
    },
    observaciones: {
      type: String,
    },
    somatotipo: {
        type: String,
        required: true,
    },
    datosFisicos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhysicalData",
    },
  },
  {
    timestamps: true, 
  }
);

const BodyReport = mongoose.model("BodyReport", bodyReportSchema);
export default BodyReport;
