// ============================================================
// core/Storage.js  — v2
//
// Cambios vs v1:
//  - guardarEstadoMesas: incluye timerLimiteMs, alertaDisparada,
//    totalManualPoker y entradaTimestamp de jugadoresCartas
//  - guardarHistorial / cargarHistorial: sin cambios (ya funcionaba)
//  - borrarSesion(id): elimina una sesión individual del historial
// ============================================================

const Storage = {

    // ── Historial ──────────────────────────────────────────

    guardarHistorial(sesiones) {
        localStorage.setItem('billarbar_historial', JSON.stringify(sesiones));
    },

    cargarHistorial() {
        try {
            const datos = localStorage.getItem('billarbar_historial');
            return datos ? JSON.parse(datos) : [];
        } catch {
            return [];
        }
    },

    borrarHistorial() {
        localStorage.removeItem('billarbar_historial');
    },

    // Elimina una sesión por su id único
    borrarSesion(id) {
        const sesiones = this.cargarHistorial().filter(s => s.id !== id);
        this.guardarHistorial(sesiones);
        return sesiones;
    },

    // ── Estado de mesas ────────────────────────────────────

    guardarEstadoMesas(mesas) {
        const snapshot = mesas.map(m => ({
            numero:                  m.numero,
            tipo:                    m.tipo,
            precioHora:              m.precioHora,
            estado:                  m.estado,
            inicioTimestamp:         m.inicioTimestamp,
            ultimoInicio:            m.ultimoInicio,
            milisegundosAcumulados:  m.milisegundosAcumulados,
            totalManualPoker:        m.totalManualPoker,
            timerLimiteMs:           m.timerLimiteMs,
            alertaDisparada:         m.alertaDisparada,
            jugadoresCartas:         m.jugadoresCartas,   // incluye entradaTimestamp
        }));
        localStorage.setItem('billarbar_mesas', JSON.stringify(snapshot));
    },

    cargarEstadoMesas() {
        try {
            const datos = localStorage.getItem('billarbar_mesas');
            return datos ? JSON.parse(datos) : null;
        } catch {
            return null;
        }
    },

    borrarEstadoMesas() {
        localStorage.removeItem('billarbar_mesas');
    },
};

export default Storage;
