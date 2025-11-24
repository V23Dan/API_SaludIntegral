import AIConfig from "../config/AI.config.js";

async function testAI() {
  console.log("🧪 Probando conexión con Gemini API...\n");
  
  // Test 1: Verificar conexión
  await AIConfig.testConnection();
  
  console.log("\n✅ Todas las pruebas completadas!");
}

testAI().catch(console.error);