import mongoose from "mongoose";

const rolSchema = new mongoose.Schema(
  {
    _id: {
      type: Number, 
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


rolSchema.pre("save", async function (next) {
  if (!this._id) { 
    const lastRol = await mongoose.model("Rol").findOne().sort({ _id: -1 });
    this._id = lastRol ? lastRol._id + 1 : 1; 
  }
  next();
});

const Rol = mongoose.model("Rol", rolSchema);
export default Rol;
