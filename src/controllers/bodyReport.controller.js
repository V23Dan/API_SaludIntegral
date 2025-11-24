import BodyReport from "../models/bodyReport.js";
import User from "../models/User.js";
import { calcularEdad } from "../utils/ageCalculate.js";
import PhysicalData from "../models/physicalData.js";
import {
  calcularIMC,
  clasificarIMC,
  calcularPorcentajeGrasa,
  clasificarGrasa,
  determinarSomatotipo,
} from "../utils/bodyReportUtils.js";

export const crearReporte = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { observaciones } = req.body;

    const datosFisicos = await PhysicalData.findOne({ usuario: usuarioId });

    if (!datosFisicos) {
      return res.status(404).json({
        message: "No se encontraron datos físicos para el usuario",
      });
    }
    let edad = calcularEdad(datosFisicos.fechaNacimiento);


    const imc = calcularIMC(datosFisicos.peso, datosFisicos.altura);

    const clasificacionIMC = clasificarIMC(imc);

    const porcentajeGrasaCorporal = calcularPorcentajeGrasa(
      imc,
      edad,
      datosFisicos.sexo
    );
    const clasificacionGrasa = clasificarGrasa(
      porcentajeGrasaCorporal,
      datosFisicos.sexo
    );

    const somatotipo = determinarSomatotipo(
      imc,
      porcentajeGrasaCorporal,
      datosFisicos.sexo
    );

    const nuevoReporte = new BodyReport({
      usuario: usuarioId,
      imc: parseFloat(imc.toFixed(2)),
      clasificacionIMC,
      porcentajeGrasaCorporal: parseFloat(porcentajeGrasaCorporal.toFixed(2)),
      clasificacionGrasa,
      metodoDeCalculo: "Fórmula de Deurenberg",
      observaciones: observaciones || "",
      somatotipo,
      datosFisicos: datosFisicos._id,
    });
    console.log("Datos del reporte: ", nuevoReporte);

    const reporteGuardado = await nuevoReporte.save();

    const reporteCompleto = await BodyReport.findById(reporteGuardado._id)
      .populate("datosFisicos")
      .populate("usuario", "nombre apellido correo");

    res.status(201).json({
      message: "Reporte corporal creado exitosamente",
      reporte: reporteCompleto,
    });
  } catch (error) {
    console.error("Error al crear reporte:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const obtenerReportesUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const reportes = await BodyReport.aggregate([
      {
        $match: { usuario: usuarioId },
      },
      {
        $addFields: {
          datosFisicosObjectId: { $toObjectId: "$datosFisicos" },
        },
      },
      {
        $lookup: {
          from: "physicaldatas",
          localField: "datosFisicosObjectId",
          foreignField: "_id",
          as: "datosFisicos",
          pipeline: [
            {
              $project: {
                sexo: 1,
                altura: 1,
                peso: 1,
                edad: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
          pipeline: [
            {
              $project: {
                nombre: 1,
                apellido: 1,
                correo: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          datosFisicos: { $arrayElemAt: ["$datosFisicos", 0] },
          usuario: { $arrayElemAt: ["$usuario", 0] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      message: "Reportes obtenidos exitosamente",
      reportes,
      total: reportes.length,
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const obtenerReportePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const reporte = await BodyReport.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          usuario: usuarioId,
        },
      },
      {
        $addFields: {
          datosFisicosObjectId: { $toObjectId: "$datosFisicos" },
        },
      },
      {
        $lookup: {
          from: "physicaldatas",
          localField: "datosFisicosObjectId",
          foreignField: "_id",
          as: "datosFisicos",
          pipeline: [
            {
              $project: {
                sexo: 1,
                altura: 1,
                peso: 1,
                edad: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
          pipeline: [
            {
              $project: {
                nombre: 1,
                apellido: 1,
                correo: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          datosFisicos: { $arrayElemAt: ["$datosFisicos", 0] },
          usuario: { $arrayElemAt: ["$usuario", 0] },
        },
      },
    ]);

    if (!reporte || reporte.length === 0) {
      return res.status(404).json({
        message: "Reporte no encontrado",
      });
    }

    res.status(200).json({
      message: "Reporte obtenido exitosamente",
      reporte: reporte[0],
    });
  } catch (error) {
    console.error("Error al obtener reporte:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const obtenerUltimoReporte = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const ultimoReporte = await BodyReport.aggregate([
      {
        $match: { usuario: usuarioId },
      },
      {
        $addFields: {
          datosFisicosObjectId: { $toObjectId: "$datosFisicos" },
        },
      },
      {
        $lookup: {
          from: "physicaldatas",
          localField: "datosFisicosObjectId",
          foreignField: "_id",
          as: "datosFisicos",
          pipeline: [
            {
              $project: {
                sexo: 1,
                altura: 1,
                peso: 1,
                edad: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
          pipeline: [
            {
              $project: {
                nombre: 1,
                apellido: 1,
                correo: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          datosFisicos: { $arrayElemAt: ["$datosFisicos", 0] },
          usuario: { $arrayElemAt: ["$usuario", 0] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (!ultimoReporte || ultimoReporte.length === 0) {
      return res.status(404).json({
        message: "No se encontraron reportes para el usuario",
      });
    }

    res.status(200).json({
      message: "Último reporte obtenido exitosamente",
      reporte: ultimoReporte[0],
    });
  } catch (error) {
    console.error("Error al obtener último reporte:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const reporte = await BodyReport.findOneAndDelete({
      _id: id,
      usuario: usuarioId,
    });

    if (!reporte) {
      return res.status(404).json({
        message: "Reporte no encontrado",
      });
    }

    res.status(200).json({
      message: "Reporte eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar reporte:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const calcularSoloIMC = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const datosFisicos = await PhysicalData.findOne({ usuario: usuarioId });

    if (!datosFisicos) {
      return res.status(404).json({
        message: "No se encontraron datos físicos para el usuario",
      });
    }

    const imc = calcularIMC(datosFisicos.peso, datosFisicos.altura);
    const clasificacionIMC = clasificarIMC(imc);

    res.status(200).json({
      message: "IMC calculado exitosamente",
      imc: parseFloat(imc.toFixed(2)),
      clasificacionIMC,
      datosFisicos: {
        peso: datosFisicos.peso,
        altura: datosFisicos.altura,
      },
    });
  } catch (error) {
    console.error("Error al calcular IMC:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const calcularSoloGrasaCorporal = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const datosFisicos = await PhysicalData.findOne({ usuario: usuarioId });
    let edad = calcularEdad(datosFisicos.fechaNacimiento);

    if (!datosFisicos) {
      return res.status(404).json({
        message: "No se encontraron datos físicos para el usuario",
      });
    }

    const imc = calcularIMC(datosFisicos.peso, datosFisicos.altura);
    const porcentajeGrasaCorporal = calcularPorcentajeGrasa(
      imc,
      edad,
      datosFisicos.sexo
    );
    const clasificacionGrasa = clasificarGrasa(
      porcentajeGrasaCorporal,
      datosFisicos.sexo
    );

    res.status(200).json({
      message: "Porcentaje de grasa corporal calculado exitosamente",
      porcentajeGrasaCorporal: parseFloat(porcentajeGrasaCorporal.toFixed(2)),
      clasificacionGrasa,
      metodoDeCalculo: "Fórmula de Deurenberg",
      datosFisicos: {
        peso: datosFisicos.peso,
        altura: datosFisicos.altura,
        edad: datosFisicos.edad,
        sexo: datosFisicos.sexo,
      },
    });
  } catch (error) {
    console.error("Error al calcular grasa corporal:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
