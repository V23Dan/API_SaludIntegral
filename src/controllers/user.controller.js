import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PhysicalData from "../models/physicalData.js";
import RolUser from "../models/RolUser.js";
import BodyReport from "../models/bodyReport.js";
import Routine from "../models/routine.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import Activity from "../models/Activity.js";
import Diet from "../models/Diet.js";

dotenv.config();

export const getUserInfo = async (req, res) => {
  try {
    const user = req.userData;

    return res.status(200).json({
      success: true,
      message: "Información del usuario obtenida correctamente",
      user,
    });
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = req.userData;

    const { _id, nombre, apellido, correo, pass, tipoUsuario, roles } =
      req.body;

    const updateData = {};

    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;

    if (correo && correo !== user.correo) {
      const emailExists = await User.findOne({ correo });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "El correo electrónico ya está en uso" });
      }
      updateData.correo = correo;
    }

    if (pass) {
      updateData.pass = pass;
    }

    if (tipoUsuario) updateData.tipoUsuario = tipoUsuario;
    if (roles) updateData.roles = roles;

    const updatedUser = await User.findByIdAndUpdate(user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-pass");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.userData;

    //eliminar rutinas
    await Routine.deleteMany({ usuario: user.id }).session(session);

    // Eliminar reportes corporales
    await BodyReport.deleteMany({ usuario: user.id }).session(session);

    // Eliminar datos físicos
    await PhysicalData.findOneAndDelete({
      usuario: user.id,
    }).session(session);

    // Eliminar roles de usuario
    await RolUser.findOneAndDelete({
      usuario: user.id,
    }).session(session);

    //Eliminar conversaciones del usuario
    await Conversation.deleteMany({ usuario: user.id }).session(session);

    //Eliminar actividades
    await Activity.deleteMany({ usuario: user.id }).session(session);

    //Eliminar dietas
    await Diet.deleteMany({ usuario: user.id }).session(session);

    // Eliminar usuario
    const deletedUser = await User.findByIdAndDelete(user.id, { session });

    if (!deletedUser) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Si todo sale bien, confirmar la transacción
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Usuario y datos asociados eliminados exitosamente",
    });
  } catch (error) {
    // Si hay error, revertir la transacción
    await session.abortTransaction();

    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario y sus datos asociados",
      error: error.message,
    });
  } finally {
    // Terminar la sesión
    session.endSession();
  }
};
