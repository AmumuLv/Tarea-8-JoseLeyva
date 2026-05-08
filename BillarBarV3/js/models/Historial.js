// ============================================================
// models/Historial.js  — v2
//
// Cambios vs v1:
//  - agregarSesion: asigna id único a cada sesión (para borrado individual)
//  - eliminarSesion(id): borra una sola sesión y persiste
//  - obtenerIngresosTotales: suma solo sesiones con totalPagar válido
// ============================================================

import Storage from '../core/Storage.js';

class Historial {
    constructor() {
        this.sesiones = Storage.cargarHistorial();
    }

    agregarSesion(resumen) {
        // Asignar id único si no tiene
        if (!resumen.id) {
            resumen.id = Date.now();
        }
        this.sesiones.unshift(resumen);
        Storage.guardarHistorial(this.sesiones);
    }

    eliminarSesion(id) {
        this.sesiones = Storage.borrarSesion(id);
    }

    obtenerIngresosTotales() {
        return this.sesiones.reduce((total, s) => {
            const val = parseFloat(s.totalPagar);
            return total + (isNaN(val) ? 0 : val);
        }, 0);
    }

    limpiar() {
        this.sesiones = [];
        Storage.borrarHistorial();
    }
}

export default Historial;
