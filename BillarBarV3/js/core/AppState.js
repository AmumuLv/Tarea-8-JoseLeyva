// ============================================================
// core/AppState.js  — v2
//
// Cambios vs v1:
//  - Restaura timerLimiteMs y alertaDisparada desde snapshot
//  - Restaura entradaTimestamp de jugadoresCartas (nuevo campo)
//  - Precio por defecto: 8 (alineado con Mesa.js)
//  - agregarMesaCartas: precio 0 correcto para cartas
// ============================================================

import Storage from './Storage.js';
import Mesa    from '../models/Mesa.js';

const AppState = {

    mesas:            [],
    mesaSeleccionada: null,

    inicializar() {
        const estadoGuardado = Storage.cargarEstadoMesas();

        if (estadoGuardado && estadoGuardado.length > 0) {
            this.mesas = estadoGuardado.map(snap => {
                const mesa = new Mesa(snap.numero, snap.tipo, snap.precioHora ?? 8);

                mesa.estado                 = snap.estado;
                mesa.inicioTimestamp        = snap.inicioTimestamp;
                mesa.ultimoInicio           = snap.ultimoInicio;
                mesa.milisegundosAcumulados = snap.milisegundosAcumulados;
                mesa.totalManualPoker       = snap.totalManualPoker ?? 0;
                mesa.nombreCustom           = snap.nombreCustom ?? `Mesa ${snap.numero}`;

                // Propiedades de modo bloque (solo billar)
                const esBillar = snap.tipo === 'billar';
                mesa.intervaloMinutos  = snap.intervaloMinutos  ?? (esBillar ? 30 : 0);
                mesa.modoBloque        = snap.modoBloque        !== undefined ? snap.modoBloque : esBillar;
                mesa.bloquesComprados  = snap.bloquesComprados  ?? 0;
                mesa.siguientePausaMs  = snap.siguientePausaMs  ?? 0;

                // Restaurar jugadores conservando entradaTimestamp
                mesa.jugadoresCartas = (snap.jugadoresCartas || []).map(j => ({
                    id:               j.id,
                    nombre:           j.nombre,
                    tiempoMesaAlEntrar: j.tiempoMesaAlEntrar ?? 0,
                    entradaTimestamp: j.entradaTimestamp ?? Date.now(),
                    cobrado:          j.cobrado ?? false,
                }));

                return mesa;
            });
        } else {
            // Primera vez: 7 mesas de billar + 1 de póker
            for (let i = 1; i <= 7; i++) {
                this.mesas.push(new Mesa(i, 'billar', 8));
            }
            this.mesas.push(new Mesa(8, 'poker', 0));
        }

        this.mesaSeleccionada = this.mesas[0];
    },
    
    eliminarMesa(numero) {
        this.mesas = this.mesas.filter(m => m.numero !== numero);
        this.persistir();
    },

    buscarMesa(numero) {
        return this.mesas.find(m => m.numero === numero);
    },

    seleccionarMesa(numero) {
        const mesa = this.buscarMesa(numero);
        if (mesa) this.mesaSeleccionada = mesa;
        return mesa;
    },

    agregarMesaCartas() {
        const nuevoNumero = this.mesas.length + 1;
        const nueva = new Mesa(nuevoNumero, 'cartas', 0);
        this.mesas.push(nueva);
        this.persistir();
        return nueva;
    },

    persistir() {
        Storage.guardarEstadoMesas(this.mesas);
    },
};

export default AppState;
