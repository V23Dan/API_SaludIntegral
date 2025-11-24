import mongoose from "mongoose";
import User from "../models/User.js";
import Rol from "../models/Rol.js";
import jwt from "jsonwebtoken";

const secretKey = "clave-secreta";

export const registerUser = async (req, res) => {
  try {
    const { _id, nombre, apellido, correo, pass, tipoUsuario, roles } =
      req.body;

    const countUser = await User.countDocuments({});
    let assignedRoles = [];

    if (roles && Array.isArray(roles) && roles.length > 0) {
      assignedRoles = await Rol.find({ name: { $in: roles } });
    } else {
      if (countUser === 0) {
        const adminRole = await Rol.findOne({ name: "admin" });
        if (adminRole) {
          assignedRoles = [adminRole];
        }
      } else {
        const userRole = await Rol.findOne({ name: "user" });
        if (userRole) {
          assignedRoles = [userRole];
        }
      }
    }

    if (!assignedRoles || assignedRoles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se pudieron encontrar los roles para asignar al usuario",
      });
    }

    const roleIds = assignedRoles.map((role) => role._id);

    console.log("Roles encontrados:", assignedRoles);
    console.log("IDs de roles asignados:", roleIds);

    const newUser = new User({
      _id,
      nombre,
      apellido,
      correo,
      pass,
      tipoUsuario,
      roles: roleIds,
    });

    console.log("Usuario para agregar: ", newUser);

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      usuario: newUser,
    });
  } catch (error) {
    console.log("Error: ", error);

    res.status(400).json({
      success: false,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { correo, pass } = req.body;
  console.log("Datos recibidos del login", req.body);

  try {
    const existingUser = await User.findOne({ correo });
    console.log("Uuario encontrado con correo: ", existingUser.correo);

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Correo o contraseña incorrectos",
      });
    }

    if (pass !== existingUser.pass) {
      return res
        .status(400)
        .json({ message: "Documento o contraseña incorrectos" });
    }

    const inforUser = {
      id: existingUser.id,
      documento: existingUser.documento,
    };

    const token = jwt.sign(inforUser, secretKey, { expiresIn: "1d" });

    res.cookie("authToken", token, {
      httpOnly: true, 
      secure: false, 
      sameSite: "lax", 
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ token });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error al loguear usuario",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logout exitoso" });
};

export const isLogin = (req, res) => {
  const token = req.cookies.authToken; // Obtener el token de las cookies

  if (!token) {
    console.log("No se recibió token, usuario no autenticado");
    return res.status(401).json({ message: "Usuario no autenticado" });
  } else {
    console.log("Usuario autenticado");
    return res.status(200).json({ message: "Usuario autenticado" });
  }
};
