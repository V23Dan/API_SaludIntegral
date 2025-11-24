import app from "./app.js";
import mongoose from "mongoose";
import { crearRolesIniciales } from "./src/controllers/rol.controller.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vdalvareza:admin123@bddnosql.m4cjz.mongodb.net/SaludIntegral";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  
      socketTimeoutMS: 45000,          
      retryWrites: true,               
      w: "majority",                 
    });

    console.log(" MongoDB Atlas conectado exitosamente");

    await crearRolesIniciales();
    console.log("Roles iniciales verificados/creados");

  } catch (error) {
    console.error("Error conectando a MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose conectado a la base de datos");
});

mongoose.connection.on("error", (err) => {
  console.error("Error de conexión de Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose desconectado de la base de datos");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Conexión a MongoDB cerrada por terminación de la aplicación");
    process.exit(0);
  } catch (error) {
    console.error("Error al cerrar la conexión:", error);
    process.exit(1);
  }
});

const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log("API iniciada y lista para usar");
      console.log("-----------------------------------");
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`El puerto ${PORT} está en uso`);
      } else {
        console.error("Error del servidor:", error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
};

startServer();