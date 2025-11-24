//Limitar respuestas que puede recibir el usuario

// Almacenamiento en memoria de las peticiones
const requestStore = new Map();

// Configuración
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10; // 10 mensajes por minuto

export const rateLimiter = (req, res, next) => {
  try {
    const user = req.userData;
    const userId = user.id;
    const now = Date.now();

    // Obtener o inicializar el registro del usuario
    if (!requestStore.has(userId)) {
      requestStore.set(userId, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    const userRecord = requestStore.get(userId);
    const timePassed = now - userRecord.startTime;

    // Si ha pasado la ventana de tiempo, resetear contador
    if (timePassed > WINDOW_MS) {
      requestStore.set(userId, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    // Si está dentro de la ventana, incrementar contador
    userRecord.count += 1;

    // Si excede el límite, rechazar petición
    if (userRecord.count > MAX_REQUESTS) {
      const remainingTime = Math.ceil((WINDOW_MS - timePassed) / 1000);

      return res.status(429).json({
        success: false,
        message: `Demasiados mensajes. Por favor espera ${remainingTime} segundos.`,
        retryAfter: remainingTime,
      });
    }

    next();
  } catch (error) {
    console.error("[RATE LIMITER ERROR]", error);
    next(); // En caso de error, permitir la petición
  }
};

// Limpieza periódica del store (ejecutar cada 5 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [userId, record] of requestStore.entries()) {
    if (now - record.startTime > WINDOW_MS * 2) {
      requestStore.delete(userId);
    }
  }
}, 5 * 60 * 1000);

export default rateLimiter;
