import mongoose from "mongoose";

const rolUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rol: { type: mongoose.Schema.Types.ObjectId, ref: "Rol", required: true },
});

const RolUser = mongoose.model("RolUser", rolUserSchema);

export default RolUser;
