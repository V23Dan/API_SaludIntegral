import User from "../models/User.js";
import PhysicalData from "../models/physicalData.js";
import { calcularEdad } from "../utils/ageCalculate.js";

export const registerPhysicalData = async (req, res) => {
  try {
    const user = req.userData;

    const existingData = await PhysicalData.findOne({ usuario: user._id });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message: "Ya has registrado tus datos físicos.",
      });
    }

    const {
      sexo,
      altura,
      peso,
      fechaNacimiento,
      nivelActividad,
      experiencia,
      objetivos,
      condicionesMedicas,
      alergias,
    } = req.body;

    console.log("Datos recibidos para registro:", req.body);
    
    const newPhysicalData = new PhysicalData({
      sexo,
      altura,
      peso,
      fechaNacimiento,
      nivelActividad,
      experiencia,
      objetivos,
      condicionesMedicas,
      alergias,
      usuario: user._id,
    });

    const savedData = await newPhysicalData.save();

    user.datosFisicos = savedData._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Datos físicos registrados exitosamente.",
      data: savedData,
    });
  } catch (error) {
    console.error("Error al registrar datos físicos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const newMedicalCondition = async (req, res) => {
  try{
    const {nuevaCondicion} = req.body;
    const user = req.userData;

    const existingData = await PhysicalData.findOne({ usuario: user._id });
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Datos físicos del usuario no encontrados",
      });
    }

    const pushCondicionesMedicas = await PhysicalData.findOneAndUpdate({usuario: user._id},
      {$push: {condicionesMedicas: nuevaCondicion}},
      {new: true}
    );

    res.status(201).json({
      success: true,
      message: "Nueva condicion agregada.",
      data: pushCondicionesMedicas,
    });
  }catch(error){
    console.error("Error al registrar nueva condicion: ", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  } 
};

export const getPhysicalData = async (req, res) => {
  try {
    const user = req.userData;

    const data = await PhysicalData.findOne({ usuario: user._id });
    console.log("Datos fisicos del usuario: ", data);

    let edad = calcularEdad(data.fechaNacimiento);

    data.edad = edad;

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Datos físicos no encontrados" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error al consultar datos físicos:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

export const updatePhysicalData = async (req, res) => {
  try {
    const user = req.userData;

    const { altura, peso, nivelActividad, experiencia, objetivos, condicionesMedicas, alergias } = req.body;

    const updatedData = await PhysicalData.findOneAndUpdate(
      { usuario: user._id },
      {
        altura,
        peso,
        nivelActividad,
        experiencia,
        objetivos,
        condicionesMedicas,
        alergias,
      },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Datos físicos no encontrados para actualizar",
      });
    }

    res.status(200).json({
      success: true,
      message: "Datos físicos actualizados exitosamente",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error al actualizar datos físicos:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};
