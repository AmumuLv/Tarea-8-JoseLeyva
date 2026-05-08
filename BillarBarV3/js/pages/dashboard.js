// ============================================================
// js/pages/dashboard.js  — v2.2 (Diseño limpio y Fix Historial)
// ============================================================

import AppState       from '../core/AppState.js';
import Historial      from '../models/Historial.js';
import DashboardUI    from '../ui/Dashboard.js';
import Modales        from '../ui/Modales.js';
import Notificaciones from '../ui/Notificaciones.js';
import Mesa           from '../models/Mesa.js'; 

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Inicialización ────────────────────────────────────
    AppState.inicializar();
    const historial = new Historial();

    _renderizarTodo();
    Modales.registrarEventos();
    Notificaciones.agregar('Sistema BILLARBAR iniciado', 'info');

    // ── 2. Funciones Principales (Cerebro del sistema) ───────

    function _renderizarTodo() {
        DashboardUI.renderizarMesas(AppState.mesas);
        DashboardUI.refrescarSelect(AppState.mesas);
        DashboardUI.actualizarPanelLateral(AppState.mesaSeleccionada);
        DashboardUI.marcarSeleccionada(AppState.mesaSeleccionada.numero);
        DashboardUI.sincronizarSelect(AppState.mesaSeleccionada.numero);
        DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
        DashboardUI.actualizarIngresos(historial.obtenerIngresosTotales());

        if (AppState.mesaSeleccionada?.tipo === 'cartas') {
            DashboardUI.renderizarJugadoresCartas(AppState.mesaSeleccionada, _cobrarJugadorIndividual);
        }
    }

    function refrescarVista() {
        DashboardUI.renderizarMesas(AppState.mesas);
        DashboardUI.actualizarPanelLateral(AppState.mesaSeleccionada);
        DashboardUI.marcarSeleccionada(AppState.mesaSeleccionada.numero);
        DashboardUI.sincronizarSelect(AppState.mesaSeleccionada.numero);
        AppState.persistir();
    }

    function accionarMesa(mesa) {
        if (mesa.estado === 'libre') {
            if (mesa.tipo === 'cartas' && (!mesa.jugadoresCartas || mesa.jugadoresCartas.length === 0)) {
                Notificaciones.agregar('<i class="fa-solid fa-triangle-exclamation"></i> Añade al menos un jugador para iniciar la mesa.', 'alerta');
                return;
            }

            mesa.iniciar();
            Notificaciones.agregar(`${mesa.nombreCustom || 'Mesa '+mesa.numero} iniciada`, 'info');
        } else if (mesa.estado === 'jugando') {
            mesa.pausar();
            Notificaciones.agregar(`${mesa.nombreCustom || 'Mesa '+mesa.numero} pausada`, 'pausa');
        } else if (mesa.estado === 'pausada') {
            mesa.reanudar();
            Notificaciones.agregar(`${mesa.nombreCustom || 'Mesa '+mesa.numero} reanudada`, 'info');
        }
        refrescarVista();
    }

    function finalizarMesa(mesa) {
        if (mesa.estado === 'libre') {
            Notificaciones.agregar('La mesa ya está libre', 'alerta');
            return;
        }

        const tiempoMs = mesa.obtenerTiempoActualMs();
        const resumen  = mesa.finalizar(); 
        if (!resumen) return;

        resumen.tiempoFormato = DashboardUI.formatearTiempo(tiempoMs);

        Modales.abrirCobro(mesa, resumen, {
            onCobrar(res) {
                mesa.confirmarFin();
                historial.agregarSesion(res);
                DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
                DashboardUI.actualizarIngresos(historial.obtenerIngresosTotales());
                Notificaciones.agregar(
                    `<i class="fa-solid fa-file-invoice-dollar"></i> Cobro: S/ ${res.totalPagar.toFixed(2)} — ${res.nombreCustom || 'Mesa '+res.numero}`, 
                    'exito'
                );
                refrescarVista();
            },
            onALista(res, nombreCliente) {
                mesa.confirmarFin();
                historial.agregarSesion(res);
                DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
                DashboardUI.actualizarIngresos(historial.obtenerIngresosTotales());
                Notificaciones.agregar(
                    `<i class="fa-solid fa-address-book"></i> ${res.nombreCustom || 'Mesa '+res.numero} → lista · ${nombreCliente || 'cliente'}`, 
                    'info'
                );
                refrescarVista();
            },
            onEliminarSinCobrar(res) {
                Modales.abrirConfirmacion(
                    '<span><i class="fa-solid fa-ban"></i> Anular sesión</span>',
                    `¿Deseas liberar la <strong>${res.nombreCustom || 'Mesa '+res.numero}</strong> sin registrar el cobro?<br>
                    <small style="color: var(--texto-muted); margin-top: 5px; display: block;">
                        Esta acción limpiará la mesa y no se guardará nada en el historial.
                    </small>`,
                    () => {
                        mesa.confirmarFin();
                        AppState.persistir();
                        DashboardUI.renderizarMesas(AppState.mesas);
                        Notificaciones.agregar(
                            `<i class="fa-solid fa-trash-can"></i> ${res.nombreCustom || 'Mesa '+res.numero} anulada sin cargos.`, 
                            'alerta'
                        );
                        refrescarVista();
                    }
                );
            },
            onCancelar() {
                mesa.reanudar();
                refrescarVista();
                Notificaciones.agregar(
                    `<i class="fa-solid fa-play"></i> ${mesa.nombreCustom || 'Mesa '+mesa.numero} reanudada`, 
                    'pausa'
                );
            }
        });

        refrescarVista();
    }

    function _cobrarJugadorIndividual(jugadorId) {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa || mesa.tipo !== 'cartas') return;
        const jugador = mesa.jugadoresCartas.find(j => j.id === jugadorId);
        if (!jugador) return;

        const deuda = mesa.calcularDeudaJugador(jugador);
        const tiempoJugadoMs = mesa.obtenerTiempoActualMs() - (jugador.tiempoMesaAlEntrar || 0);

        const resumenJugador = {
            numero: `${mesa.nombreCustom || 'Mesa '+mesa.numero} (Individual: ${jugador.nombre})`,
            tiempoFormato: DashboardUI.formatearTiempo(tiempoJugadoMs),
            totalPagar: deuda,
            jugadores: [{ nombre: jugador.nombre, deuda }] 
        };

        Modales.abrirCobro(mesa, resumenJugador, {
            onCobrar: () => {
                const sesion = {
                    numero: mesa.numero,
                    tipo: 'cartas',
                    tiempoTotalMinutos: tiempoJugadoMs / 60000,
                    horaInicioFormato: DashboardUI.formatearHoraCorta(jugador.entradaTimestamp),
                    horaFinFormato: DashboardUI.formatearHoraCorta(Date.now()),
                    tiempoFormato: DashboardUI.formatearTiempo(tiempoJugadoMs),
                    totalPagar: deuda,
                    jugadores: [{ nombre: jugador.nombre, deuda }],
                    notas: 'Cobro individual',
                };
                historial.agregarSesion(sesion);
                mesa.eliminarJugador(jugadorId);
                _actualizarPostAccionCartas();
                Notificaciones.agregar(`<i class="fa-solid fa-check"></i> Cobro individual: ${jugador.nombre}`, 'exito');
            },
            onEliminarSinCobrar: () => _eliminarJugadorSinCobrar(jugadorId),
            onCancelar: () => {}
        });
    }

    function _eliminarJugadorSinCobrar(jugadorId) {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa) return;
        const jugador = mesa.jugadoresCartas.find(j => j.id === jugadorId);
        if (!jugador) return;

        Modales.abrirConfirmacion(
            '<span><i class="fa-solid fa-user-minus"></i> Retirar jugador</span>',
            `¿Retirar a <strong>${jugador.nombre}</strong> sin cobrar?<br><small>No se registrará en el historial.</small>`,
            () => {
                mesa.eliminarJugador(jugadorId);
                _actualizarPostAccionCartas();
                Notificaciones.agregar(`Jugador ${jugador.nombre} retirado`, 'info');
            }
        );
    }

    function _actualizarPostAccionCartas() {
        AppState.persistir();
        DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
        DashboardUI.actualizarIngresos(historial.obtenerIngresosTotales());
        DashboardUI.renderizarJugadoresCartas(AppState.mesaSeleccionada, _cobrarJugadorIndividual);
        refrescarVista();
    }

    function _eliminarSesion(id) {
        Modales.abrirConfirmacion(
            '<span><i class="fa-solid fa-eraser"></i> Eliminar sesión</span>',
            '¿Borrar este registro permanentemente?',
            () => {
                historial.eliminarSesion(id);
                DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
                DashboardUI.actualizarIngresos(historial.obtenerIngresosTotales());
                Notificaciones.agregar('Registro eliminado', 'info');
            }
        );
    }

    // ── 3. Eventos (Escuchadores) ─────────────────────────────

    // 👇 NOTA FIX: Restauración del botón "Ver más" del historial que dejó de funcionar
    document.getElementById('btn-ver-mas-historial')?.addEventListener('click', () => {
        DashboardUI._historialExpandido = !DashboardUI._historialExpandido;
        DashboardUI.renderizarHistorial(historial.sesiones, _eliminarSesion);
    });

    document.getElementById('contenedor-mesas')?.addEventListener('click', (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar-mesa');
        if (btnEliminar) {
            e.stopPropagation();
            const num = parseInt(btnEliminar.dataset.numero);
            Modales.abrirConfirmacion(
                '<span><i class="fa-solid fa-trash-can"></i> Eliminar Mesa</span>',
                `¿Estás seguro de eliminar esta mesa?<br><small style="color:var(--texto-muted);">Esta acción no se puede deshacer.</small>`,
                () => {
                    AppState.eliminarMesa(num);
                    if (AppState.mesaSeleccionada?.numero === num) {
                        AppState.mesaSeleccionada = AppState.mesas[0]; 
                    }
                    refrescarVista();
                    Notificaciones.agregar(`Mesa eliminada con éxito`, 'info');
                }
            );
            return;
        }

        const btnAccion = e.target.closest('.btn-accion-mesa');
        if (btnAccion) {
            e.stopPropagation();
            const mesa = AppState.buscarMesa(parseInt(btnAccion.dataset.numero));
            if (mesa) accionarMesa(mesa);
            return;
        }

        const card = e.target.closest('.mesa-card');
        if (card) {
            const mesa = AppState.seleccionarMesa(parseInt(card.dataset.numero));
            if (mesa) refrescarVista();
        }
    });

    document.getElementById('select-mesa')?.addEventListener('change', (e) => {
        const mesa = AppState.seleccionarMesa(parseInt(e.target.value));
        if (mesa) refrescarVista();
    });

    document.getElementById('lista-jugadores-cartas')?.addEventListener('click', (e) => {
        const btnCobrar = e.target.closest('.btn-cobrar-jugador');
        if (btnCobrar) return _cobrarJugadorIndividual(parseInt(btnCobrar.dataset.jugId));

        const btnEliminar = e.target.closest('.btn-eliminar-jugador');
        if (btnEliminar) return _eliminarJugadorSinCobrar(parseInt(btnEliminar.dataset.jugId));
    });

    document.getElementById('btn-control-tiempo')?.addEventListener('click', () => {
        if (AppState.mesaSeleccionada) accionarMesa(AppState.mesaSeleccionada);
    });

    document.getElementById('btn-finalizar')?.addEventListener('click', () => {
        if (AppState.mesaSeleccionada) finalizarMesa(AppState.mesaSeleccionada);
    });

    document.getElementById('btn-guardar-precio')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        const input = document.getElementById('input-precio');
        if (!mesa || !input) return;
        mesa.actualizarPrecio(input.value);
        AppState.persistir();
        DashboardUI.actualizarPanelLateral(mesa);
        Notificaciones.agregar(`Precio actualizado: ${mesa.nombreCustom || 'Mesa '+mesa.numero}`, 'info');
    });

    document.getElementById('btn-limpiar-historial')?.addEventListener('click', () => {
        Modales.abrirConfirmacion(
            '<span><i class="fa-solid fa-triangle-exclamation"></i> Vaciado de Caja</span>',
            '¿Deseas purgar todo el historial? Esta acción es irreversible.',
            () => {
                historial.limpiar();
                DashboardUI.renderizarHistorial([], _eliminarSesion);
                DashboardUI.actualizarIngresos(0);
                Notificaciones.agregar('Historial vaciado', 'alerta');
            }
        );
    });

    document.getElementById('btn-agregar-jugador')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        const input = document.getElementById('input-nombre-jugador');
        if (!mesa || !input) return;
        const nombre = input.value.trim();
        if (!nombre || mesa.jugadoresCartas.length >= 6) return;
        mesa.agregarJugadorCarta(nombre);
        input.value = '';
        _actualizarPostAccionCartas();
    });

    document.getElementById('input-personas')?.addEventListener('input', () => {
        if (AppState.mesaSeleccionada && AppState.mesaSeleccionada.tipo === 'billar') {
            DashboardUI._actualizarDivision(AppState.mesaSeleccionada);
        }
    });

    // ========================================================
    // NUEVOS EVENTOS: NOMBRES, TIEMPO Y MESAS DE CARTAS
    // ========================================================

    document.getElementById('btn-editar-nombre')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa) return; 
        
        Modales.abrirConfirmacion(
            '<span><i class="fa-solid fa-pen-to-square"></i> Renombrar Mesa</span>',
            `Escribe un nuevo identificador para esta mesa:<br>
            <input type="text" id="input-nuevo-nombre" class="input-dark" value="${mesa.nombreCustom || 'Mesa '+mesa.numero}" style="margin-top: 15px; width: 100%; text-align: center; font-size: 1.1rem; padding: 10px;">`,
            () => {
                const input = document.getElementById('input-nuevo-nombre');
                if (input && input.value.trim() !== "") {
                    mesa.nombreCustom = input.value.trim(); 
                    AppState.persistir();                   
                    refrescarVista();                       
                    Notificaciones.agregar('Nombre actualizado', 'info');
                }
            }
        );
    });

    document.getElementById('btn-guardar-modo')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        const selectModo = document.getElementById('modo-cobro');
        if (!mesa || !selectModo) return;
        
        const val = selectModo.value;
        const minutos = val === 'corrido' ? 0 : parseInt(val);
        
        mesa.configurarTimer(minutos);
        AppState.persistir();
        
        DashboardUI.actualizarPanelLateral(mesa);
        refrescarVista();
        
        const mensaje = minutos === 0
            ? 'Modo corrido configurado'
            : `Modo bloques de ${minutos} min configurado`;
        Notificaciones.agregar(`${mensaje} para ${mesa.nombreCustom || 'Mesa '+mesa.numero}`, 'info');
    });

    // ── Sumar bloques de tiempo ──────────────────────────────
    function _sumarBloque(cantidadBloques) {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa || mesa.tipo !== 'billar') return;
        if (mesa.estado === 'libre') {
            Notificaciones.agregar('Inicia la mesa primero antes de agregar tiempo.', 'alerta');
            return;
        }
        const ok = mesa.sumarBloque(cantidadBloques);
        if (ok) {
            const min = mesa.intervaloMinutos * cantidadBloques;
            AppState.persistir();
            DashboardUI.actualizarPanelLateral(mesa);
            refrescarVista();
            Notificaciones.agregar(
                `<i class="fa-solid fa-plus"></i> +${min} min añadidos a ${mesa.nombreCustom || 'Mesa '+mesa.numero}`,
                'info'
            );
        }
    }

    document.getElementById('btn-sumar-media')?.addEventListener('click', () => _sumarBloque(1));
    document.getElementById('btn-sumar-hora')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa) return;
        // Si está en modo media hora, sumar 2 bloques = 1 hora. Si es hora, sumar 1 bloque.
        const bloques = mesa.intervaloMinutos === 30 ? 2 : 1;
        _sumarBloque(bloques);
    });

    document.getElementById('btn-quitar-bloque')?.addEventListener('click', () => {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa || mesa.tipo !== 'billar') return;
        const ok = mesa.quitarBloque();
        if (ok) {
            AppState.persistir();
            DashboardUI.actualizarPanelLateral(mesa);
            refrescarVista();
            Notificaciones.agregar(
                `<i class="fa-solid fa-minus"></i> Bloque quitado — ${mesa.nombreCustom || 'Mesa '+mesa.numero}`,
                'alerta'
            );
        } else {
            Notificaciones.agregar('No se puede quitar: el tiempo ya fue consumido.', 'alerta');
        }
    });

    document.getElementById('btn-agregar-cartas')?.addEventListener('click', () => {
        const maxNumero = AppState.mesas.length > 0 ? Math.max(...AppState.mesas.map(m => m.numero)) : 0;
        const nuevaMesa = new Mesa(maxNumero + 1, 'cartas', 1);
        
        AppState.mesas.push(nuevaMesa);
        AppState.persistir();
        refrescarVista();
        Notificaciones.agregar(`${nuevaMesa.nombreCustom} añadida con éxito.`, 'info');
    });

    // Poker: guardar monto en tiempo real al escribir
    document.getElementById('input-total-poker')?.addEventListener('input', (e) => {
        const mesa = AppState.mesaSeleccionada;
        if (!mesa || mesa.tipo !== 'poker') return;
        const val = parseFloat(e.target.value);
        mesa.totalManualPoker = (!isNaN(val) && val >= 0) ? val : 0;
        const preview = document.getElementById('lbl-total-poker-preview');
        if (preview) preview.textContent = `S/ ${mesa.totalManualPoker.toFixed(2)}`;
        AppState.persistir();
    });

    // ── 4. Loop de Tiempo Real ────────────────────────────────
    setInterval(() => {
        if (DashboardUI.actualizarTiempoYDinero) {
            DashboardUI.actualizarTiempoYDinero(AppState.mesas, AppState.mesaSeleccionada);
        }
        
        if (AppState.mesaSeleccionada) {
            const mesa = AppState.mesaSeleccionada;
            const lblTiempo = document.getElementById('lbl-tiempo');
            if (lblTiempo) lblTiempo.textContent = DashboardUI.formatearTiempo(mesa.obtenerTiempoActualMs());
            const lblPrecio = document.getElementById('lbl-precio');
            if (lblPrecio) lblPrecio.textContent = mesa.calcularTotal().toFixed(2);
            
            if (mesa.tipo === 'billar') DashboardUI._actualizarDivision(mesa);
            if (mesa.tipo === 'cartas') DashboardUI.renderizarJugadoresCartas(mesa, _cobrarJugadorIndividual);
        }

        let requiereRefresco = false;
        AppState.mesas.forEach(mesa => {
            if (mesa.verificarAutoPausa && mesa.verificarAutoPausa()) {
                if (mesa.estado === 'jugando') mesa.pausar();
                AppState.persistir();

                // 👇 NOTA FIX: El modal ahora tiene botones personalizados ("Dejar Continuar" y "Mantener Pausada")
                Modales.abrirConfirmacion(
                    '<span style="color: var(--color-pausada);"><i class="fa-solid fa-clock"></i> Bloque terminado</span>',
                    `<div style="text-align: center; margin-top: 15px; font-size: 1.15rem; color: var(--texto-claro);">
                        El bloque de tiempo de la <strong>${mesa.nombreCustom || 'Mesa '+mesa.numero}</strong> ha terminado.<br>
                        <small style="color:var(--texto-muted); display:block; margin-top:8px;">Agrega más tiempo o cobra la mesa.</small>
                    </div>`,
                    () => {
                        mesa.reanudar();
                        AppState.persistir();
                        refrescarVista(); 
                        Notificaciones.agregar(`▶️ ${mesa.nombreCustom || 'Mesa '+mesa.numero} continúa jugando`, 'info');
                    },
                    {
                        textoAceptar: '<i class="fa-solid fa-play"></i> Dejar Continuar',
                        colorAceptar: '#28a745', // Un color verde fresco y profesional para continuar
                        textoCancelar: '<i class="fa-solid fa-pause"></i> Mantener Pausada',
                        colorCancelar: '#343a40', // Gris oscuro para la pausa
                        colorTextoCancelar: '#ffffff'
                    }
                );
                
                Notificaciones.agregar(`⏱ ${mesa.nombreCustom || 'Mesa '+mesa.numero}: Tiempo agotado`, 'alerta');
                requiereRefresco = true;
            }
        });

        if (requiereRefresco) {
            refrescarVista();
        }
    }, 1000);
});