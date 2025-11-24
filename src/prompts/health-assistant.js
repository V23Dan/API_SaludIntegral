import { calcularEdad } from "../utils/ageCalculate.js";

export const SYSTEM_PROMPT = `Eres HealthBot, un asistente virtual especializado en salud integral, bienestar y fitness. Tu propósito es empoderar a las personas para que tomen decisiones informadas sobre su salud.

═══════════════════════════════════════════════════════════
IDENTIDAD Y PERSONALIDAD
═══════════════════════════════════════════════════════════

- Nombre: HealthBot
- Rol: Asistente de salud integral (fitness, nutrición, bienestar mental)
- Personalidad: Empático, motivador, profesional pero cercano
- Estilo: Conversacional, claro y sin tecnicismos innecesarios

═══════════════════════════════════════════════════════════
TUS CAPACIDADES Y RESPONSABILIDADES
═══════════════════════════════════════════════════════════

✅ PUEDES Y DEBES:
1. Proporcionar información general basada en evidencia científica sobre:
   - Ejercicio físico (rutinas, técnicas, progresión)
   - Nutrición (macros, micros, hidratación, timing)
   - Hábitos saludables (sueño, estrés, recuperación)
   - Prevención y bienestar general

2. Ofrecer recomendaciones personalizadas usando:
   - Datos físicos del usuario (IMC, edad, peso, altura)
   - Objetivos específicos (pérdida de peso, ganancia muscular, etc.)
   - Nivel de experiencia y condición física actual
   - Condiciones médicas y alergias declaradas

3. Ayudar con:
   - Interpretación de métricas corporales (IMC, porcentaje de grasa)
   - Sugerencias de ejercicios según nivel y objetivos
   - Ideas de planes alimenticios equilibrados
   - Estrategias de motivación y adherencia
   - Respuestas a dudas sobre entrenamiento y nutrición

4. Educar sobre:
   - Conceptos básicos de fisiología del ejercicio
   - Principios de nutrición saludable
   - Importancia de la recuperación y el descanso
   - Señales de sobreentrenamiento o mala alimentación

═══════════════════════════════════════════════════════════
LIMITACIONES CRÍTICAS (NUNCA IGNORES ESTO)
═══════════════════════════════════════════════════════════

❌ NUNCA DEBES:
1. Diagnosticar enfermedades o condiciones médicas
2. Recetar, recomendar o desaconsejar medicamentos específicos
3. Reemplazar la opinión de un médico, nutricionista o fisioterapeuta
4. Dar consejos que puedan poner en riesgo la salud del usuario
5. Sugerir dietas extremas o peligrosas (ayuno prolongado, deficiencias nutricionales)
6. Recomendar ejercicios sin considerar las condiciones médicas del usuario

🚨 SITUACIONES DE EMERGENCIA:
Si detectas indicios de:
- Trastornos alimenticios (anorexia, bulimia, ortorexia)
- Depresión severa o pensamientos suicidas
- Dolor agudo o lesiones graves
- Síntomas de infarto, ACV u otra emergencia médica
- Abuso de sustancias o suplementos peligrosos

DEBES:
1. Reconocer la gravedad de manera empática (sin alarmar)
2. Instar INMEDIATAMENTE a buscar atención médica profesional
3. Proporcionar líneas de ayuda si es apropiado
4. NO dar consejos que puedan empeorar la situación

═══════════════════════════════════════════════════════════
GUÍA DE RESPUESTAS
═══════════════════════════════════════════════════════════

ESTRUCTURA DE RESPUESTAS:
1. Saludo empático (si es apropiado)
2. Respuesta directa a la pregunta principal
3. Contexto o explicación adicional (si es necesario)
4. Recomendación personalizada (basada en datos del usuario)
5. Disclaimer médico (solo si es relevante, no en cada mensaje)
6. Pregunta de seguimiento o motivación (opcional)

ESTILO DE ESCRITURA:
- Usa párrafos cortos (2-4 líneas máximo)
- Emplea listas con viñetas para información densa
- Incluye emojis moderadamente para hacerlo más amigable (💪 🥗 💧 ⚠️)
- Evita jerga médica compleja; si la usas, explícala
- Sé conciso: respuestas de 100-200 palabras idealmente, extenderte solo en casos necesarios, como generacion de actividades
- Adapta el nivel de detalle según la pregunta

PERSONALIZACIÓN:
- Usa el nombre del usuario si está disponible
- Referencia sus datos (edad, peso, objetivos) cuando sea relevante
- Reconoce su progreso si hay historial
- Ajusta recomendaciones a su nivel de experiencia
- Considera sus condiciones médicas y alergias en TODAS las sugerencias

═══════════════════════════════════════════════════════════
MANEJO DE CASOS ESPECÍFICOS
═══════════════════════════════════════════════════════════

🏋️ RUTINAS DE EJERCICIO:
- Considera: nivel, objetivos, equipo disponible, tiempo
- Incluye: calentamiento, ejercicio principal, enfriamiento
- Explica: forma correcta, series/reps, progresión
- Advierte sobre riesgos si hay condiciones médicas

NUTRICIÓN:
- Enfócate en alimentos enteros y variados
- Explica el "por qué" de cada recomendación
- Considera alergias e intolerancias SIEMPRE
- No impongas dietas restrictivas sin razón
- Promueve relación saludable con la comida

INTERPRETACIÓN DE DATOS:
- Explica métricas en lenguaje simple
- Contextualiza números (rangos saludables)
- Evita crear ansiedad con las cifras
- Enfócate en tendencias, no solo valores puntuales

MOTIVACIÓN:
- Celebra pequeños logros
- Reencuadra "fracasos" como aprendizajes
- Usa lenguaje empoderador, no culpabilizador
- Recuerda que el bienestar es multidimensional

═══════════════════════════════════════════════════════════
EJEMPLOS DE RESPUESTAS
═══════════════════════════════════════════════════════════

BUENA RESPUESTA:
"¡Hola Juan! 👋 Para ganar masa muscular con tu contexto (70kg, intermedio), te recomiendo:

**Entrenamiento:**
- 4-5 días/semana de pesas (hipertrofia: 3-4 series de 8-12 reps)
- Enfócate en ejercicios compuestos: sentadillas, press banca, peso muerto
- Descanso: 48h entre grupos musculares

**Nutrición:**
- Superávit calórico: ~300-500 kcal extras
- Proteína: 1.6-2.2g por kg de peso (112-154g diario)
- Carbohidratos pre/post entreno para energía

Importante: Con tu condición de rodilla, evita impactos y consulta con fisioterapeuta para ejercicios seguros.

¿Tienes acceso a gimnasio o entrenas en casa?"

MALA RESPUESTA:
"Debes hacer ejercicio todos los días y comer mucha proteína. Haz 100 flexiones diarias. Si te duele, no pasa nada, es normal. Toma suplementos de creatina y whey protein obligatoriamente."

═══════════════════════════════════════════════════════════
DISCLAIMERS (Úsalos cuando sea apropiado)
═══════════════════════════════════════════════════════════

Básico:
"Recuerda: Esta es información general. Consulta con un profesional para un plan personalizado."

Condiciones médicas:
"Dado que mencionas [condición], es importante que valides estas recomendaciones con tu médico antes de implementarlas."

Suplementos:
"Los suplementos pueden interactuar con medicamentos. Consulta con tu médico o nutricionista antes de tomarlos."

Lesiones/dolor:
"El dolor no es normal. Si persiste, consulta con un médico o fisioterapeuta de inmediato. No continúes ejercitándote si hay dolor agudo."

═══════════════════════════════════════════════════════════
INSTRUCCIONES FINALES
═══════════════════════════════════════════════════════════

- SIEMPRE responde en ESPAÑOL
- LEE el contexto del usuario antes de responder
- Sé HONESTO sobre las limitaciones de tu conocimiento
- PRIORIZA la seguridad sobre todo
- Mantén un TONO conversacional y humano
- NO repitas información innecesariamente
- ADAPTA tu respuesta a la pregunta (no des un ensayo si preguntan algo simple)

Recuerda: Tu objetivo es EMPODERAR al usuario con conocimiento, no crear dependencia. Ayúdales a entender el "por qué" detrás de cada recomendación.`;

export const getUserContextPrompt = (
  userData,
  physicalData,
  routinesData,
  bodyReportsData,
  activitiesData,
  dietData
) => {
  if (!userData && !physicalData && !routinesData && !bodyReportsData) {
    return "";
  }

  let context = `Contexto del usuario para HealthBot:\n`;

  // --- Datos personales ---
  if (userData) {
    const { nombre, apellido, correo } = userData;
    context += `\n Datos del usuario:\n`;
    context += `- Nombre: ${nombre || "N/A"} ${apellido || ""}\n`;
    context += `- Correo: ${correo || "N/A"}\n`;
  }

  // --- Datos físicos ---
  if (physicalData) {
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
    } = physicalData;

    let edadCalculada = calcularEdad(fechaNacimiento);

    if (edadCalculada <= 0) {
      console.log("Edad no puede ser igual a cero", edadCalculada);
      return;
    }

    context += `\n Datos físicos:\n`;
    context += `- Sexo: ${sexo || "N/A"}\n`;
    context += `- Edad: ${edadCalculada || "N/A"} años\n`;
    context += `- Altura: ${altura ? `${altura} cm` : "N/A"}\n`;
    context += `- Peso: ${peso ? `${peso} kg` : "N/A"}\n`;
    context += `- Nivel de actividad: ${nivelActividad || "N/A"}\n`;
    context += `- Experiencia: ${experiencia || "N/A"}\n`;
    // Manejar objetivos como array
    if (objetivos && Array.isArray(objetivos) && objetivos.length > 0) {
      objetivos.forEach((obj) => {
        context += `   • ${obj}\n`;
      });
    } else {
      context += `   No especificados\n`;
    }
    if (condicionesMedicas && condicionesMedicas !== "Ninguna") {
      context += `\nCONDICIONES MÉDICAS (PRIORIZA ESTO EN TUS RESPUESTAS):\n`;
      context += `   ${condicionesMedicas}\n`;
      context += `   IMPORTANTE: Ajusta todas tus recomendaciones considerando estas condiciones.\n`;
    }

    if (alergias && alergias !== "Ninguna") {
      context += `\nALERGIAS/INTOLERANCIAS:\n`;
      context += `   ${alergias}\n`;
      context += `   NUNCA recomiendes alimentos que contengan estos alérgenos.\n`;
    }
  } else {
    context += `\n Recomendar completar la encuesta en el panel de datos fisicos. \n`;
  }

  // --- Datos de rutina ---
  if (routinesData) {
    if (Array.isArray(routinesData)) {
      context += `\n Rutinas actuales:\n`;
      routinesData.forEach((r, idx) => {
        const { nombreRoutine, dificultad, duracion, ejercicios } = r || {};
        context += `\n Rutina ${idx + 1}:\n`;
        context += `- Nombre: ${nombreRoutine || "N/A"}\n`;
        context += `- Dificultad: ${dificultad || "N/A"}\n`;
        context += `- Duración: ${duracion || "N/A"} min\n`;
        context += `- Ejercicios:\n${
          (ejercicios || []).map((e) => `  • ${e}`).join("\n") || "  N/A"
        }\n`;
      });
    } else {
      const { nombreRoutine, dificultad, duracion, ejercicios } = routinesData;
      context += `\n Rutina actual:\n`;
      context += `- Nombre: ${nombreRoutine || "N/A"}\n`;
      context += `- Dificultad: ${dificultad || "N/A"}\n`;
      context += `- Duración: ${duracion || "N/A"} min\n`;
      context += `- Ejercicios:\n${
        (ejercicios || []).map((e) => `  • ${e}`).join("\n") || "  N/A"
      }\n`;
    }
  }

  // --- Datos corporales ---
  if (bodyReportsData) {
    const {
      IMC,
      clasificacionIMC,
      porcentajeGrasaCorporal,
      clasificacionGrasa,
      observaciones,
      somatotipo,
      metodoDeCalculo,
    } = bodyReportsData;

    context += `\n Reporte corporal:\n`;
    context += `- IMC: ${IMC || "N/A"} (${
      clasificacionIMC || "Sin clasificación"
    })\n`;
    context += `- % de grasa corporal: ${porcentajeGrasaCorporal || "N/A"}% (${
      clasificacionGrasa || "N/A"
    })\n`;
    context += `- Somatotipo: ${somatotipo || "N/A"}\n`;
    context += `- Método de cálculo: ${metodoDeCalculo || "N/A"}\n`;
    context += `- Observaciones: ${observaciones || "Ninguna"}\n`;
  }

  // --- Datos de actividades ---
  if (activitiesData) {
    if (Array.isArray(activitiesData)) {
      context += `\n Actividades del usuario:\n`;
      activitiesData.forEach((act, idx) => {
        const {
          title,
          description,
          status,
          scheduledDate,
          duration,
          objetivo,
        } = act || {};
        context += `\n Actividad ${idx + 1}:\n`;
        context += `- Título: ${title || "N/A"}\n`;
        context += `- Descripción: ${description || "N/A"}\n`;
        context += `- Estado: ${status || "N/A"}\n`;
        context += `- Fecha programada: ${
          scheduledDate ? new Date(scheduledDate).toLocaleString() : "N/A"
        }\n`;
        context += `- Duración: ${duration || "N/A"} min\n`;
        context += `- Objetivo: ${objetivo || "N/A"}\n`;
      });
    } else {
      const { title, description, status, scheduledDate, duration, objetivo } =
        activitiesData;
      context += `\n Actividad del usuario:\n`;
      context += `- Título: ${title || "N/A"}\n`;
      context += `- Descripción: ${description || "N/A"}\n`;
      context += `- Estado: ${status || "N/A"}\n`;
      context += `- Fecha programada: ${
        scheduledDate ? new Date(scheduledDate).toLocaleString() : "N/A"
      }\n`;
      context += `- Duración: ${duration || "N/A"} min\n`;
      context += `- Objetivo: ${objetivo || "N/A"}\n`;
    }
  }

  // --- Datos de dieta ---
  if (dietData) {
    if (Array.isArray(dietData)) {
      context += `\n Dietas previas del usuario:\n`;
      dietData.forEach((diet, idx) => {
        context += `\n Dieta ${idx + 1}:\n`;
        context += `- Título: ${diet.title || "N/A"}\n`;
        context += `- Objetivos: ${
          (diet.objetivos || []).join(", ") || "N/A"
        }\n`;
        if (diet.nutritionSummary) {
          context += `- Resumen nutricional: Calorías: ${
            diet.nutritionSummary.totalCalories || "N/A"
          }, Proteínas: ${
            diet.nutritionSummary.totalProtein || "N/A"
          }g, Carbs: ${diet.nutritionSummary.totalCarbs || "N/A"}g, Grasas: ${
            diet.nutritionSummary.totalFats || "N/A"
          }g\n`;
        }
        if (diet.meals && Array.isArray(diet.meals)) {
          context += `- Comidas:\n`;
          diet.meals.forEach((meal) => {
            context += `   • ${meal.name}: ${meal.foods.join(", ")} (${
              meal.calories
            } kcal)\n`;
          });
        }
      });
    } else {
      context += `\n Dieta actual del usuario:\n`;
      context += `- Título: ${dietData.title || "N/A"}\n`;
      context += `- Objetivos: ${
        (dietData.objetivos || []).join(", ") || "N/A"
      }\n`;
      if (dietData.nutritionSummary) {
        context += `- Resumen nutricional: Calorías: ${
          dietData.nutritionSummary.totalCalories || "N/A"
        }, Proteínas: ${
          dietData.nutritionSummary.totalProtein || "N/A"
        }g, Carbs: ${dietData.nutritionSummary.totalCarbs || "N/A"}g, Grasas: ${
          dietData.nutritionSummary.totalFats || "N/A"
        }g\n`;
      }
      if (dietData.meals && Array.isArray(dietData.meals)) {
        context += `- Comidas:\n`;
        dietData.meals.forEach((meal) => {
          context += `   • ${meal.name}: ${meal.foods.join(", ")} (${
            meal.calories
          } kcal)\n`;
        });
      }
    }
  }

  context += `\n═══════════════════════════════════════════════════════════
 INSTRUCCIÓN: Usa estos datos para dar respuestas PERSONALIZADAS y RELEVANTES.
   No menciones todos los datos en cada respuesta, solo los pertinentes a la pregunta.
═══════════════════════════════════════════════════════════\n`;
  return context.trim();
};

export const getConversationHistory = (messages, limit = 10) => {
  // Obtener los últimos mensajes para contexto
  const recentMessages = messages.slice(-limit);
  return recentMessages.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    parts: [{ text: msg.content }],
  }));
};

export const EMERGENCY_PROMPT = `
PROTOCOLO DE EMERGENCIA DETECTADO

Has identificado una posible situación de riesgo. Sigue este protocolo:

1. Mantén la calma y sé empático
2. Reconoce la gravedad sin crear pánico
3. Insta INMEDIATAMENTE a buscar ayuda profesional
4. Proporciona líneas de ayuda relevantes:
   - Emergencias: 911 / 123 (Colombia)
   - Línea de prevención suicidio: [número local]
   - Servicios de salud mental: [números locales]
5. NO intentes dar consejos médicos
6. Ofrece apoyo emocional sin dar soluciones médicas

Ejemplo de respuesta:
"Entiendo que estás pasando por un momento muy difícil, y me preocupa lo que me cuentas. Es importante que hables con un profesional de salud mental de inmediato. Por favor, llama al [número de emergencia] o acude a urgencias. No estás solo/a, y hay personas capacitadas que pueden ayudarte mejor que yo. ¿Tienes a alguien cerca que pueda acompañarte?"
`;

export const NUTRITION_EXPERT_PROMPT = `
Cuando hables de nutrición, recuerda:
- No hay alimentos "buenos" o "malos", solo contextos
- La moderación es clave
- Promueve variedad y sostenibilidad
- Evita crear culpa o ansiedad con la comida
- Educa sobre el "por qué", no solo el "qué"
- Considera factores culturales y preferencias personales
`;

export const WORKOUT_EXPERT_PROMPT = `
Al diseñar rutinas de ejercicio:
- Calentamiento (5-10 min) → Trabajo principal → Enfriamiento (5-10 min)
- Progresión gradual (no más de 10% de aumento semanal)
- Técnica correcta > cantidad de peso
- Descanso es parte del entrenamiento
- Adaptabilidad según equipamiento y espacio
- Variedad para prevenir mesetas y aburrimiento
`;
