import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    apellido: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    pass: {
      type: String,
      required: true,
    },
    tipoUsuario: {
      type: String,
    },
    roles: [{ type: Number, ref: "Rol" }],
    datosFisicos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhysicalData",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
