//Metodos para calcular IMC, porcentaje de grasa y somatotipo
export const calcularIMC = (peso, altura) => {
  if (!peso || !altura) throw new Error("Peso o altura no definidos");

  const pesoNum = Number(peso.toString());
  const alturaNum = Number(altura.toString());

  const alturaEnMetros = alturaNum / 100;
  if (alturaEnMetros === 0) throw new Error("Altura no puede ser 0");

  return pesoNum / (alturaEnMetros * alturaEnMetros) / 10000;
};

export const clasificarIMC = (imc) => {
  if (imc < 18.5) return "Bajo peso";
  if (imc >= 18.5 && imc < 25) return "Peso normal";
  if (imc >= 25 && imc < 30) return "Sobrepeso";
  if (imc >= 30 && imc < 35) return "Obesidad grado I";
  if (imc >= 35 && imc < 40) return "Obesidad grado II";
  return "Obesidad grado III";
};

export const calcularPorcentajeGrasa = (imc, edad, sexo) => {
  let porcentajeGrasa;
  if (sexo.toLowerCase() === "masculino" || sexo.toLowerCase() === "hombre") {
    porcentajeGrasa = 1.2 * imc + 0.23 * edad - 16.2;
  } else {
    porcentajeGrasa = 1.2 * imc + 0.23 * edad - 5.4;
  }
  return Math.max(0, porcentajeGrasa);
};

export const clasificarGrasa = (porcentajeGrasa, sexo) => {
  if (sexo.toLowerCase() === "masculino" || sexo.toLowerCase() === "hombre") {
    if (porcentajeGrasa < 6) return "Esencial";
    if (porcentajeGrasa >= 6 && porcentajeGrasa < 14) return "Atlético";
    if (porcentajeGrasa >= 14 && porcentajeGrasa < 18) return "Fitness";
    if (porcentajeGrasa >= 18 && porcentajeGrasa < 25) return "Promedio";
    return "Obeso";
  } else {
    if (porcentajeGrasa < 16) return "Esencial";
    if (porcentajeGrasa >= 16 && porcentajeGrasa < 20) return "Atlético";
    if (porcentajeGrasa >= 20 && porcentajeGrasa < 25) return "Fitness";
    if (porcentajeGrasa >= 25 && porcentajeGrasa < 32) return "Promedio";
    return "Obeso";
  }
};

export const determinarSomatotipo = (imc, porcentajeGrasa, sexo) => {
  if (imc < 18.5) return "Ectomorfo";
  if (imc >= 18.5 && imc < 25) {
    const limiteGrasa = sexo.toLowerCase() === "masculino" ? 15 : 23;
    return porcentajeGrasa < limiteGrasa ? "Ectomorfo-Mesomorfo" : "Mesomorfo";
  }
  if (imc >= 25 && imc < 30) return "Mesomorfo-Endomorfo";
  return "Endomorfo";
};
