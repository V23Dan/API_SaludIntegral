export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento || !(fechaNacimiento instanceof Date)) {
    throw new Error("Fecha de nacimiento inválida");
  }

  const hoy = new Date();

  if (fechaNacimiento > hoy) {
    throw new Error("La fecha de nacimiento no puede ser en el futuro");
  }

  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  let mesDif = hoy.getMonth() - fechaNacimiento.getMonth();

  if (
    mesDif < 0 ||
    (mesDif === 0 && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
};
