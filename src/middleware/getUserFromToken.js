import User from "../models/User.js";

export const userFromToken = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "El usuario no esta en autenticado" });
    }

    const userAuth = await User.findById(req.user.id).select("-password");

    if (!userAuth) {
      return res.status(404).json({ message: "Usuario no encontrado en BD" });
    }

    req.userData = userAuth;
    next();
  } catch (error) {
    console.log("Error al extraer usuario del token: ", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};
