import Routine from "../models/routine.js";
import User from "../models/User.js";

export const createRoutine = async (req, res) => {
  try {
    const user = req.userData;

    const { nombre, dificultad, duracion, ejercicios, fechaCreacion } =
      req.body;
    console.log("Datos traidos desde el front: ", req.body);

    const newRoutine = new Routine({
      nombre,
      dificultad,
      fechaCreacion,
      duracion,
      ejercicios,
      usuario: user._id,
    });

    console.log("Datos de la nueva rutina creados en el objeto");
    const savedRoutine = await newRoutine.save();
    console.log("Resultado de guardar rutina", savedRoutine);
    res.status(201).json(savedRoutine);
  } catch (error) {
    console.error("Error completo:", error);
    res
      .status(500)
      .json({ message: "Error al crear la rutina", error: error.message });
  }
};

export const getSortedRutinas = async (req, res) => {
  try {
    const result = await Routine.aggregate([
      { $match: { usuario: req.userData.id } },
      { $sort: { duracion: 1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al ordenar", error });
  }
};

export const getMatchedByDificultad = async (req, res) => {
  try {
    const dificultad = req.query.dificultad;
    const result = await Routine.aggregate([
      { $match: { usuario: req.userData.id, dificultad } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar por dificultad", error });
  }
};

export const getLimitedRutinas = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const result = await Routine.aggregate([
      { $match: { usuario: req.userData.id } },
      { $limit: limit },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error en limitación", error });
  }
};

export const getUnwindEjercicios = async (req, res) => {
  try {
    const result = await Routine.aggregate([
      { $match: { usuario: req.userData.id } },
      { $unwind: "$ejercicios" },
      { $project: { nombre: 1, dificultad: 1, ejercicio: "$ejercicios" } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error en unwind", error });
  }
};