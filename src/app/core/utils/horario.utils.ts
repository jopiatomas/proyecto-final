/**
 * Verifica si un restaurante está abierto basándose en sus horarios de apertura y cierre
 * @param horaApertura - Horario de apertura en formato "HH:mm"
 * @param horaCierre - Horario de cierre en formato "HH:mm"
 * @returns true si el restaurante está abierto, false si está cerrado
 */
export function isRestauranteAbierto(horaApertura?: string, horaCierre?: string): boolean {
  if (!horaApertura || !horaCierre) {
    // Si no tiene horarios definidos, asumimos que está abierto
    return true;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Parsear horarios
  const [aperturaHour, aperturaMinute] = horaApertura.split(':').map(Number);
  const [cierreHour, cierreMinute] = horaCierre.split(':').map(Number);

  const aperturaInMinutes = aperturaHour * 60 + aperturaMinute;
  const cierreInMinutes = cierreHour * 60 + cierreMinute;

  // Caso 1: Horario normal (ej: 09:00 - 22:00)
  if (aperturaInMinutes < cierreInMinutes) {
    return currentTimeInMinutes >= aperturaInMinutes && currentTimeInMinutes < cierreInMinutes;
  }

  // Caso 2: Horario que cruza medianoche (ej: 22:00 - 02:00)
  return currentTimeInMinutes >= aperturaInMinutes || currentTimeInMinutes < cierreInMinutes;
}

/**
 * Formatea un horario en formato "HH:mm" a un formato legible
 * @param horario - Horario en formato "HH:mm"
 * @returns Horario formateado (ej: "09:00 AM")
 */
export function formatearHorario(horario?: string): string {
  if (!horario) return '';

  const [hour, minute] = horario.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
