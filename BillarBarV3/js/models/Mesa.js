// ============================================================
// models/Mesa.js  — v5 (Bloques de tiempo para billar)
// ============================================================

class Mesa {
    constructor(numero, tipo, precioHora = 8) {
        this.numero         = numero;
        this.tipo           = tipo;      
        this.nombreCustom   = `Mesa ${numero}`; 
        this.estado         = 'libre';   
        this.precioHora     = precioHora;

        this.inicioTimestamp        = null;
        this.finTimestamp           = null;
        this.ultimoInicio           = null;
        this.milisegundosAcumulados = 0;
        this.totalManualPoker       = 0;
        this.jugadoresCartas        = [];

        // Modo de cobro (solo aplica a billar)
        // 0 = corrido, 30 = media hora, 60 = hora
        this.intervaloMinutos = (tipo === 'billar') ? 30 : 0;
        this.siguientePausaMs = 0;

        // Para modo bloques (solo billar)
        this.bloquesComprados = 0;
        this.modoBloque       = (tipo === 'billar'); // solo billar arranca en modo bloque
    }

    // ── Jugadores de cartas ────────────────────────────────

    agregarJugadorCarta(nombre) {
        if (this.tipo !== 'cartas') return;
        if (this.estado === 'libre') this.iniciar();

        this.jugadoresCartas.push({
            id:                  Date.now(),
            nombre:              nombre,
            tiempoMesaAlEntrar:  this.obtenerTiempoActualMs(),
            entradaTimestamp:    Date.now(), 
            cobrado:             false,      
        });
    }

    calcularDeudaJugador(jugador) {
        if (!this.inicioTimestamp) return 0;
        
        let tiempoJugadoMs;
        
        if (jugador.tiempoMesaAlEntrar !== undefined) {
            tiempoJugadoMs = this.obtenerTiempoActualMs() - jugador.tiempoMesaAlEntrar;
        } else {
            tiempoJugadoMs = this.obtenerTiempoActualMs();
        }
        
        const horasJugadas = tiempoJugadoMs / 3600000;
        let horasCompletas = Math.floor(horasJugadas);
        
        if (horasCompletas < 1) {
            horasCompletas = 1;
        }
        
        return horasCompletas * 1.00;
    }

    eliminarJugador(id) {
        this.jugadoresCartas = this.jugadoresCartas.filter(j => j.id !== id);
        if (this.jugadoresCartas.length === 0) {
            this.limpiarMesa();
        }
    }

    // ── Control de tiempo ──────────────────────────────────

    iniciar() {
        if (this.estado !== 'libre') return;
        this.estado          = 'jugando';
        this.inicioTimestamp = Date.now();
        this.ultimoInicio    = Date.now();
        
        // Si es billar en modo bloque, el primer bloque inicia automáticamente
        if (this.tipo === 'billar' && this.modoBloque && this.intervaloMinutos > 0) {
            this.bloquesComprados = 1; // El primer bloque ya está "comprado" al iniciar
            this.siguientePausaMs = this.bloquesComprados * this.intervaloMinutos * 60000;
        } else if (this.intervaloMinutos > 0 && !this.modoBloque) {
            // Modo corrido con auto-pausa
            this.siguientePausaMs = this.intervaloMinutos * 60000;
        }
    }

    pausar() {
        if (this.estado !== 'jugando') return;
        this.estado = 'pausada';
        this.milisegundosAcumulados += (Date.now() - this.ultimoInicio);
        this.ultimoInicio = null;
    }

    reanudar() {
        if (this.estado !== 'pausada') return;
        this.estado       = 'jugando';
        this.ultimoInicio = Date.now();
    }

    // ── Sumar bloques de tiempo (para billar en modo bloque) ──
    sumarBloque(cantidadBloques = 1) {
        if (this.tipo !== 'billar' || !this.modoBloque) return false;
        if (this.estado === 'libre') return false;

        this.bloquesComprados += cantidadBloques;
        this.siguientePausaMs = this.bloquesComprados * this.intervaloMinutos * 60000;

        // Si estaba pausada (tiempo agotado), reanudar
        if (this.estado === 'pausada') {
            this.reanudar();
        }
        return true;
    }

    // ── Quitar último bloque ──
    quitarBloque() {
        if (this.tipo !== 'billar' || !this.modoBloque) return false;
        if (this.estado === 'libre') return false;

        // No permitir quitar si solo queda 1 bloque o si el tiempo ya superó los bloques actuales - 1
        const tiempoActualMs = this.obtenerTiempoActualMs();
        const minBloques = Math.ceil(tiempoActualMs / (this.intervaloMinutos * 60000));
        if (this.bloquesComprados <= minBloques) return false; // No se puede quitar, ya se usó ese tiempo

        this.bloquesComprados -= 1;
        this.siguientePausaMs = this.bloquesComprados * this.intervaloMinutos * 60000;
        return true;
    }

    // ── Calcular tiempo restante del bloque actual ──
    obtenerTiempoRestanteMs() {
        if (!this.modoBloque || this.intervaloMinutos === 0) return null;
        const tiempoActual = this.obtenerTiempoActualMs();
        const restante = this.siguientePausaMs - tiempoActual;
        return restante > 0 ? restante : 0;
    }

    // ── Verificar si el bloque actual se agotó ──
    verificarAutoPausa() {
        if (this.estado !== 'jugando') return false;
        // Solo aplica a billar en modo bloque
        if (this.tipo !== 'billar' || !this.modoBloque || this.intervaloMinutos === 0) return false;
        if (this.bloquesComprados === 0) return false;

        if (this.obtenerTiempoActualMs() >= this.siguientePausaMs) {
            this.pausar();
            return true;
        }
        return false;
    }

    // ── Configurar modo de cobro ──────────────────────────
    configurarTimer(minutos) {
        const val = (minutos === 'corrido') ? 0 : Number(minutos);
        this.intervaloMinutos = val;

        if (val === 0) {
            // Modo corrido puro
            this.modoBloque     = false;
            this.siguientePausaMs = 0;
            this.bloquesComprados = 0;
        } else {
            // Modo bloques
            this.modoBloque = true;

            if (this.estado !== 'libre') {
                // Si ya está jugando, recalcular los bloques en base al tiempo ya transcurrido
                const tiempoActualMs = this.obtenerTiempoActualMs();
                const bloquesUsados = Math.ceil(tiempoActualMs / (val * 60000));
                this.bloquesComprados = Math.max(bloquesUsados, 1);
                this.siguientePausaMs = this.bloquesComprados * val * 60000;
            } else {
                this.bloquesComprados = 0;
                this.siguientePausaMs = 0;
            }
        }
    }

    // ── Snapshots y Finalización ────────────────────────────

    finalizar() {
        if (this.estado === 'libre') return null;

        if (this.estado === 'jugando') this.pausar();

        this.finTimestamp   = Date.now();
        const tiempoTotalMs = this.milisegundosAcumulados;

        let totalPagar;
        if (this.tipo === 'poker') {
            totalPagar = this.totalManualPoker || 0;
        } else if (this.tipo === 'cartas') {
            totalPagar = this.jugadoresCartas.reduce(
                (suma, j) => suma + this.calcularDeudaJugador(j), 0
            );
        } else {
            totalPagar = this.calcularTotal();
        }

        return {
            numero:             this.numero,
            tipo:               this.tipo,
            precioHora:         this.precioHora,
            nombreCustom:       this.nombreCustom, 
            tiempoTotalMinutos: tiempoTotalMs / 60000,
            horaInicioFormato:  this.formatearHora(this.inicioTimestamp),
            horaFinFormato:     this.formatearHora(this.finTimestamp),
            totalPagar:         totalPagar,
            jugadores:          this.tipo === 'cartas'
                ? this.jugadoresCartas.map(j => ({
                    nombre: j.nombre,
                    deuda:  this.calcularDeudaJugador(j),
                  }))
                : [],
        };
    }

    confirmarFin() {
        this.limpiarMesa();
    }

    // ── Cálculos ───────────────────────────────────────────

    obtenerTiempoActualMs() {
        let total = this.milisegundosAcumulados;
        if (this.estado === 'jugando' && this.ultimoInicio) {
            total += (Date.now() - this.ultimoInicio);
        }
        return total;
    }

    calcularTotal() {
        if (this.tipo === 'cartas') {
            return this.jugadoresCartas.reduce(
                (suma, j) => suma + this.calcularDeudaJugador(j), 0
            );
        }
        if (this.tipo === 'poker') return this.totalManualPoker || 0;

        // BILLAR modo bloque:
        // Precio proporcional al tamaño del bloque (media hora = precioHora/2).
        // El precio sube en tiempo real dentro del bloque actual,
        // y al terminar cada bloque queda fijo en su precio proporcional.
        if (this.modoBloque && this.intervaloMinutos > 0) {
            const precioPorBloque = this.precioHora * (this.intervaloMinutos / 60);
            const tiempoActualMs = this.obtenerTiempoActualMs();
            const bloquesPorTiempo = Math.floor(tiempoActualMs / (this.intervaloMinutos * 60000));
            // Bloques completados = cuántos bloques enteros ya pasaron en tiempo real
            const bloquesCompletados = Math.min(bloquesPorTiempo, this.bloquesComprados - 1);
            const cobradoFijo = bloquesCompletados * precioPorBloque;
            // El bloque actual sube en tiempo real
            const inicioUltimoBloque = bloquesCompletados * this.intervaloMinutos * 60000;
            const tiempoEnBloqueActual = Math.min(
                Math.max(0, tiempoActualMs - inicioUltimoBloque),
                this.intervaloMinutos * 60000
            );
            const corrienteActual = (tiempoEnBloqueActual / (this.intervaloMinutos * 60000)) * precioPorBloque;
            return cobradoFijo + corrienteActual;
        }

        // BILLAR modo corrido: precio sube en tiempo real segundo a segundo
        return (this.obtenerTiempoActualMs() / 3600000) * this.precioHora;
    }

    calcularTotalConMs(ms) {
        return (ms / 3600000) * this.precioHora;
    }

    actualizarPrecio(nuevoPrecio) {
        const parsed = parseFloat(nuevoPrecio);
        if (!isNaN(parsed) && parsed >= 0) this.precioHora = parsed;
    }

    // ── Utilidades ─────────────────────────────────────────

    formatearHora(timestamp) {
        if (!timestamp) return '--:--';
        return new Date(timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    }

    limpiarMesa() {
        this.estado                 = 'libre';
        this.inicioTimestamp        = null;
        this.finTimestamp           = null;
        this.ultimoInicio           = null;
        this.milisegundosAcumulados = 0;
        this.totalManualPoker       = 0;
        this.jugadoresCartas        = [];
        
        // Resetear modo bloque solo para billar
        this.intervaloMinutos = (this.tipo === 'billar') ? 30 : 0;
        this.siguientePausaMs = 0;
        this.bloquesComprados = 0;
        this.modoBloque       = (this.tipo === 'billar');
        
        this.nombreCustom = `Mesa ${this.numero}`; 
    }
}

export default Mesa;
