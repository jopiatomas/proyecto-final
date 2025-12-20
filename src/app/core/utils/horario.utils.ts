/**
 * Verifica si el restaurante está actualmente abierto
 * @param horaApertura Hora de apertura en formato "HH:mm"
 * @param horaCierre Hora de cierre en formato "HH:mm"
 * @returns true si está abierto, false si está cerrado
 */
export function estaAbierto(horaApertura?: string, horaCierre?: string): boolean {
  if (!horaApertura || !horaCierre) {
    return false;
  }

  try {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    const [aperturaHora, aperturaMin] = horaApertura.split(':').map(Number);
    const [cierreHora, cierreMin] = horaCierre.split(':').map(Number);

    const minutosApertura = aperturaHora * 60 + aperturaMin;
    const minutosCierre = cierreHora * 60 + cierreMin;

    // Si el cierre es después de medianoche (ej: 02:00)
    if (minutosCierre < minutosApertura) {
      return horaActual >= minutosApertura || horaActual <= minutosCierre;
    }

    return horaActual >= minutosApertura && horaActual <= minutosCierre;
  } catch (error) {
    console.error('Error al verificar horario:', error);
    return false;
  }
}

// Alias para compatibilidad
export const isRestauranteAbierto = estaAbierto;

/**
 * Formatea una hora de formato "HH:mm" a un formato más legible
 * @param hora Hora en formato "HH:mm" (ej: "14:30")
 * @returns Hora formateada (ej: "2:30 PM")
 */
export function formatearHorario(hora?: string): string {
  if (!hora) {
    return 'No especificado';
  }

  try {
    const [horas, minutos] = hora.split(':').map(Number);

    if (isNaN(horas) || isNaN(minutos)) {
      return hora;
    }

    const periodo = horas >= 12 ? 'PM' : 'AM';
    const hora12 = horas % 12 || 12;

    return `${hora12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  } catch (error) {
    console.error('Error al formatear horario:', error);
    return hora;
  }
}
