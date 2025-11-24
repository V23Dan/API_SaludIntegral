import mongoose from "mongoose";
import rol from "../models/Rol.js";
import user from "../models/User.js";


export const crearRolesIniciales = async (req, res) => {
  try {
    const roles = ["admin", "user"];
    for (let role of roles) {
      const existe = await rol.findOne({ name: role });
      if (!existe) {
        await new rol({ name: role }).save();
      }
    }
  } catch (error) {
    console.log("Error al crear roles: ", error);
  }
};
