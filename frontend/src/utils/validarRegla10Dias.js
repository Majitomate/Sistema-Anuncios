const diasHabilesEntre = (inicio, fin) => {
  let count = 0;
  const actual = new Date(inicio);
  actual.setHours(0, 0, 0, 0);
  const limite = new Date(fin);
  limite.setHours(0, 0, 0, 0);
  while (actual <= limite) {
    const dia = actual.getDay(); // 0=Dom, 6=Sáb
    if (dia !== 0 && dia !== 6) count++;
    actual.setDate(actual.getDate() + 1);
  }
  return count;
};

export const validarRegla10Dias = (formData) => {
  const { tipo, prioridad, esPermanente, fechaInicio, fechaFin } = formData;
  if (esPermanente || !fechaInicio || !fechaFin) return null;

  const requiere =
    String(tipo).toLowerCase() === 'votacion'  ||
    String(tipo).toLowerCase() === 'votación'  ||
    String(prioridad) === '3';

  if (!requiere) return null;

  const dias = diasHabilesEntre(fechaInicio, fechaFin);
  if (dias < 10) {
    return `Los anuncios de votación o prioridad alta requieren al menos 10 días hábiles de vigencia. Vigencia actual: ${dias} día(s) hábil(es).`;
  }
  return null;
};