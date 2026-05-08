// ============================================================
// ui/Dashboard.js  — v2
//
// Cambios vs v1:
//  - renderizarMesas: usa clase "seleccionada" (no "mesa-seleccionada")
//    para alinearse con el CSS existente (.mesa-card.seleccionada)
//  - renderizarJugadoresCartas: muestra hora de entrada y deuda
//    con botón de cobro individual
//  - renderizarHistorial: límite de 5 sesiones + botón "Ver más"
//    + botón eliminar individual por sesión
//  - actualizarPanelLateral: muestra hora de inicio de la mesa
//  - Precio inicial en input-precio refleja precioHora real de la mesa
// ============================================================

const Dashboard = {

    _historialExpandido: false,

    // ── Formateo ───────────────────────────────────────────

    formatearTiempoCorto(ms) {
        if (!ms || ms < 0) return '00:00';
        const totalSeg = Math.floor(ms / 1000);
        const m = Math.floor(totalSeg / 60);
        const s = totalSeg % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    formatearTiempo(ms) {
        if (!ms || ms < 0) return '00:00:00';
        const totalSeg = Math.floor(ms / 1000);
        const h = Math.floor(totalSeg / 3600);
        const m = Math.floor((totalSeg % 3600) / 60);
        const s = totalSeg % 60;
        return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
    },

    formatearHoraCorta(timestamp) {
        if (!timestamp) return '--:--';
        return new Date(timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    },

    // ── Grid de mesas ──────────────────────────────────────

renderizarMesas(mesas) {
        const contenedor = document.getElementById('contenedor-mesas');
        if (!contenedor) return;

        const iconos = {
            billar: 'fa-circle-dot fa-lg',
            poker:  'fa-chess',
            cartas: 'fa-dice',
        };

        const etiquetaEstado = {
            libre:   { txt: 'LIBRE',   cls: 'badge libre'   },
            jugando: { txt: 'JUGANDO', cls: 'badge jugando' },
            pausada: { txt: 'PAUSADA', cls: 'badge pausada' },
        };

        contenedor.innerHTML = mesas.map(mesa => {
            const tiempoStr   = this.formatearTiempo(mesa.obtenerTiempoActualMs());
            const totalActual = mesa.calcularTotal().toFixed(2);
            const icono       = iconos[mesa.tipo] || 'fa-table';
            const badge       = etiquetaEstado[mesa.estado];

            const etiquetaBtn = {
                libre:   '<i class="fa-solid fa-play"></i> Iniciar',
                jugando: '<i class="fa-solid fa-pause"></i> Pausar',
                pausada: '<i class="fa-solid fa-rotate-right"></i> Reanudar',
            }[mesa.estado];

            const infoExtra = mesa.tipo === 'cartas' && mesa.jugadoresCartas.length > 0
                ? `<div class="mesa-jugadores">
                     <i class="fa-solid fa-users"></i> ${mesa.jugadoresCartas.length} jugador(es)
                   </div>`
                : '';

            // Info de bloques: se inyecta como elemento vacío, lo rellena actualizarTiempoYDinero
            const infoBloques = (mesa.tipo === 'billar' && mesa.modoBloque && mesa.intervaloMinutos > 0 && mesa.estado !== 'libre')
                ? `<div class="info-bloques-card" style="font-size:0.75rem; color:var(--texto-muted); margin-top:2px;"></div>`
                : '';

            // BOTÓN DE PAPELERA: Solo se muestra si es de cartas y está libre
            const botonEliminar = mesa.tipo === 'cartas' && mesa.estado === 'libre' 
                ? `<button class="btn-eliminar-mesa" data-numero="${mesa.numero}" title="Eliminar mesa" style="background: transparent; border: none; color: var(--texto-muted); cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-trash"></i></button>` 
                : '';

            return `
                <div class="mesa-card estado-${mesa.estado}" data-numero="${mesa.numero}">
                    <div class="mesa-card-header">
                        <span style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--texto-muted);">
                            <i class="fa-solid ${icono}"></i>
                            ${mesa.tipo.charAt(0).toUpperCase() + mesa.tipo.slice(1)}
                            ${mesa.tipo === 'billar' ? `· S/${mesa.precioHora}/h` : ''}
                        </span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${botonEliminar}
                            <span class="${badge.cls}">${badge.txt}</span>
                        </div>
                    </div>
                    <!-- AQUÍ PONEMOS EL NOMBRE PERSONALIZADO -->
                    <div style="font-size:1.1rem;font-weight:700;color:var(--texto-claro);">
                        ${mesa.nombreCustom || `Mesa ${mesa.numero}`}
                    </div>
                    <div class="mesa-card-body">
                        <div class="dato-destacado">
                            <i class="fa-regular fa-clock"></i> ${tiempoStr}
                        </div>
                        <div class="dato-destacado" style="color:var(--color-libre);">
                            <i class="fa-solid fa-sack-dollar"></i> S/ ${totalActual}
                        </div>
                        ${infoExtra}
                        ${infoBloques}
                    </div>
                    <div class="mesa-card-footer" style="margin-top:auto;">
                        <button class="btn-accion-mesa btn-pequeno btn-verde" data-numero="${mesa.numero}">
                            ${etiquetaBtn}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Stats
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('stat-total',    mesas.length);
        set('stat-libres',   mesas.filter(m => m.estado === 'libre').length);
        set('stat-ocupadas', mesas.filter(m => m.estado === 'jugando').length);
        set('stat-pausadas', mesas.filter(m => m.estado === 'pausada').length);
    },
    // ── Panel lateral ──────────────────────────────────────

    actualizarPanelLateral(mesa) {
        if (!mesa) return;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        set('lbl-nombre', mesa.nombreCustom || `Mesa ${mesa.numero}`);
        set('lbl-modalidad', mesa.tipo.charAt(0).toUpperCase() + mesa.tipo.slice(1));
        set('lbl-estado',    mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1));
        set('lbl-tiempo',    this.formatearTiempo(mesa.obtenerTiempoActualMs()));
        set('lbl-precio',    mesa.calcularTotal().toFixed(2));

        // Precio/hora dinámico en panel lateral
        const lblPrecioHora = document.getElementById('lbl-precio-hora');
        const rowPrecioHora = document.getElementById('row-precio-hora');
        if (lblPrecioHora && rowPrecioHora) {
            if (mesa.tipo === 'billar') {
                lblPrecioHora.textContent = `S/ ${mesa.precioHora}/h`;
                rowPrecioHora.style.display = '';
            } else if (mesa.tipo === 'cartas') {
                lblPrecioHora.textContent = 'S/ 1.00 (Entrada)';
                rowPrecioHora.style.display = '';
            } else {
                rowPrecioHora.style.display = 'none';
            }
        }

        // --- MODO DE COBRO Y BLOQUES ---
        const rowModoCobro = document.getElementById('row-modo-cobro');
        const lblModo = document.getElementById('lbl-modo-display');
        const selectModo = document.getElementById('modo-cobro');
        const grupoSumar = document.getElementById('grupo-sumar-tiempo');

        if (mesa.tipo === 'billar') {
            let textoModo = 'Corrido';
            if (mesa.modoBloque && mesa.intervaloMinutos === 30) textoModo = 'Bloques · Media hora';
            if (mesa.modoBloque && mesa.intervaloMinutos === 60) textoModo = 'Bloques · 1 Hora';
            
            if (lblModo) lblModo.textContent = textoModo;
            if (rowModoCobro) rowModoCobro.style.display = '';
            
            if (selectModo) {
                selectModo.value = mesa.intervaloMinutos === 0 ? 'corrido' : mesa.intervaloMinutos.toString();
            }

            // Mostrar/ocultar controles de bloques
            const esModoBloque = mesa.modoBloque && mesa.intervaloMinutos > 0;
            if (grupoSumar) grupoSumar.style.display = esModoBloque ? '' : 'none';

            // Actualizar info de bloques
            const lblBloques = document.getElementById('lbl-bloques-count');
            const lblRestante = document.getElementById('lbl-tiempo-restante');
            if (lblBloques) lblBloques.textContent = mesa.bloquesComprados || 0;
            if (lblRestante) {
                const restanteMs = mesa.obtenerTiempoRestanteMs ? mesa.obtenerTiempoRestanteMs() : null;
                lblRestante.textContent = restanteMs !== null ? this.formatearTiempoCorto(restanteMs) : '--:--';
                lblRestante.style.color = (restanteMs !== null && restanteMs < 60000)
                    ? 'var(--color-pausada)' : 'var(--color-libre)';
            }
        } else {
            if (rowModoCobro) rowModoCobro.style.display = 'none';
            if (grupoSumar) grupoSumar.style.display = 'none';
        }
        // --- FIN MODO DE COBRO ---

        // Hora de inicio
        const lblInicio = document.getElementById('lbl-inicio');
        if (lblInicio) {
            lblInicio.textContent = mesa.inicioTimestamp
                ? this.formatearHoraCorta(mesa.inicioTimestamp)
                : '--:--';
        }

        // Botón control
        const btnControl = document.getElementById('btn-control-tiempo');
        if (btnControl) {
            if (mesa.estado === 'jugando') {
                btnControl.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
                btnControl.className = 'btn-accion btn-amarillo';
            } else if (mesa.estado === 'pausada') {
                btnControl.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Reanudar';
                btnControl.className = 'btn-accion btn-verde';
            } else {
                btnControl.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
                btnControl.className = 'btn-accion btn-verde';
            }
        }

        // Mostrar panel correcto por modalidad
        ['controles-billar', 'controles-poker', 'controles-cartas'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('oculto');
        });
        const panelActivo = document.getElementById(`controles-${mesa.tipo}`);
        if (panelActivo) panelActivo.classList.remove('oculto');

        if (mesa.tipo === 'billar') {
            const inputPrecio = document.getElementById('input-precio');
            if (inputPrecio) inputPrecio.value = mesa.precioHora;
            this._actualizarDivision(mesa);
        }

        if (mesa.tipo === 'poker') {
            const inputPoker = document.getElementById('input-total-poker');
            const preview    = document.getElementById('lbl-total-poker-preview');
            if (inputPoker) inputPoker.value = mesa.totalManualPoker || '';
            if (preview) preview.textContent = `S/ ${(mesa.totalManualPoker || 0).toFixed(2)}`;
        }

        if (mesa.tipo === 'cartas') {
            this.renderizarJugadoresCartas(mesa);
        }
    },

_actualizarDivision(mesa) {
        const inputPersonas = document.getElementById('input-personas');
        const lblDividido   = document.getElementById('lbl-monto-dividido');
        if (!inputPersonas || !lblDividido) return;

        let personas = parseInt(inputPersonas.value);
        if (isNaN(personas) || personas < 1) personas = 1;

        const total    = mesa.calcularTotal();
        const porPers  = (total / personas).toFixed(2);
        
        lblDividido.textContent = `S/ ${porPers}`;
    },

    // ── Select ─────────────────────────────────────────────

    refrescarSelect(mesas) {
        const select = document.getElementById('select-mesa');
        if (!select) return;
        select.innerHTML = mesas.map(m =>
            `<option value="${m.numero}">Mesa ${m.numero} · ${m.tipo}</option>`
        ).join('');
    },

    sincronizarSelect(numero) {
        const select = document.getElementById('select-mesa');
        if (select) select.value = numero;
    },

    marcarSeleccionada(numero) {
        document.querySelectorAll('.mesa-card').forEach(card => {
            // CSS usa .mesa-card.seleccionada (sin prefijo "mesa-")
            card.classList.toggle('seleccionada', parseInt(card.dataset.numero) === numero);
        });
    },

    // ── Tiempo real ────────────────────────────────────────

    actualizarTiempoYDinero(mesas, mesaSeleccionada) {
        mesas.forEach(mesa => {
            const card = document.querySelector(`.mesa-card[data-numero="${mesa.numero}"]`);
            if (!card) return;
            const items = card.querySelectorAll('.dato-destacado');
            if (items[0]) items[0].innerHTML =
                `<i class="fa-regular fa-clock"></i> ${this.formatearTiempo(mesa.obtenerTiempoActualMs())}`;
            if (items[1]) items[1].innerHTML =
                `<i class="fa-solid fa-sack-dollar"></i> S/ ${mesa.calcularTotal().toFixed(2)}`;

            // Actualizar info de bloques en la tarjeta (sin parpadeo: solo textContent)
            if (mesa.tipo === 'billar' && mesa.modoBloque && mesa.intervaloMinutos > 0 && mesa.estado !== 'libre') {
                let infoEl = card.querySelector('.info-bloques-card');
                if (!infoEl) {
                    infoEl = document.createElement('div');
                    infoEl.className = 'info-bloques-card';
                    infoEl.style.cssText = 'font-size:0.75rem; color:var(--texto-muted); margin-top:2px;';
                    // Estructura fija: icono + texto separados para no tocar el DOM con innerHTML cada segundo
                    infoEl.innerHTML = '<i class="fa-solid fa-cubes-stacked"></i> <span class="ib-bloques"></span> · <span class="ib-restante" style="font-family:monospace;"></span> restante';
                    card.querySelector('.mesa-card-body')?.appendChild(infoEl);
                }
                const restanteMs = mesa.obtenerTiempoRestanteMs ? mesa.obtenerTiempoRestanteMs() : null;
                const restanteStr = restanteMs !== null ? this.formatearTiempoCorto(restanteMs) : '--:--';
                const colorRestante = (restanteMs !== null && restanteMs < 60000) ? 'var(--color-pausada)' : 'var(--color-libre)';
                const spnBloques  = infoEl.querySelector('.ib-bloques');
                const spnRestante = infoEl.querySelector('.ib-restante');
                if (spnBloques)  spnBloques.textContent  = `${mesa.bloquesComprados} bloque(s)`;
                if (spnRestante) { spnRestante.textContent = restanteStr; spnRestante.style.color = colorRestante; }
            }
        });

        // Actualizar tiempo restante del bloque en panel lateral (sin parpadeo)
        if (mesaSeleccionada && mesaSeleccionada.tipo === 'billar' && mesaSeleccionada.modoBloque) {
            const lblRestante = document.getElementById('lbl-tiempo-restante');
            const lblBloques  = document.getElementById('lbl-bloques-count');
            if (lblRestante) {
                const restanteMs = mesaSeleccionada.obtenerTiempoRestanteMs
                    ? mesaSeleccionada.obtenerTiempoRestanteMs() : null;
                const nuevoTexto  = restanteMs !== null ? this.formatearTiempoCorto(restanteMs) : '--:--';
                const nuevoColor  = (restanteMs !== null && restanteMs < 60000) ? 'var(--color-pausada)' : 'var(--color-libre)';
                if (lblRestante.textContent !== nuevoTexto) lblRestante.textContent = nuevoTexto;
                if (lblRestante.style.color  !== nuevoColor) lblRestante.style.color  = nuevoColor;
            }
            if (lblBloques) {
                const txt = String(mesaSeleccionada.bloquesComprados || 0);
                if (lblBloques.textContent !== txt) lblBloques.textContent = txt;
            }
        }
    },

    // ── Historial ──────────────────────────────────────────

    renderizarHistorial(sesiones, onEliminar) {
        const tbody   = document.getElementById('tabla-historial');
        const btnVerMas = document.getElementById('btn-ver-mas-historial');
        if (!tbody) return;

        if (!sesiones || sesiones.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align:center;color:var(--texto-muted);padding:20px;">
                    No hay sesiones registradas
                </td></tr>`;
            if (btnVerMas) btnVerMas.style.display = 'none';
            return;
        }

        const limite = this._historialExpandido ? sesiones.length : 5;
        const visibles = sesiones.slice(0, limite);

        tbody.innerHTML = visibles.map(s => {
            const minutos  = Math.floor(s.tiempoTotalMinutos || 0);
            const h        = Math.floor(minutos / 60);
            const min      = minutos % 60;
            const duracion = s.tiempoFormato || `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
            const jugadoresHtml = s.jugadores?.length > 0
                ? `<small style="color:var(--texto-muted);">${s.jugadores.map(j => j.nombre).join(', ')}</small>`
                : '';

            return `
                <tr>
                    <td>Mesa ${s.numero}</td>
                    <td>${s.tipo?.charAt(0).toUpperCase() + s.tipo?.slice(1) || '--'}
                        ${jugadoresHtml}</td>
                    <td>${s.horaInicioFormato || '--'}</td>
                    <td>${s.horaFinFormato   || '--'}</td>
                    <td>${duracion}</td>
                    <td><strong style="color:var(--color-libre);">S/ ${(s.totalPagar || 0).toFixed(2)}</strong></td>
                    <td>
                        <button class="btn-eliminar-sesion btn-pequeno btn-rojo-outline"
                                data-sesion-id="${s.id}"
                                title="Eliminar esta sesión"
                                style="padding:3px 8px;font-size:0.75rem;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Evento eliminar individual (delegación)
        tbody.querySelectorAll('.btn-eliminar-sesion').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.sesionId);
                if (onEliminar) onEliminar(id);
            });
        });

        // Botón "Ver más / Ver menos"
        if (btnVerMas) {
            if (sesiones.length > 5) {
                btnVerMas.style.display = '';
                btnVerMas.textContent   = this._historialExpandido
                    ? '▲ Ver menos'
                    : `▼ Ver más (${sesiones.length - 5} más)`;
            } else {
                btnVerMas.style.display = 'none';
            }
        }
    },

    actualizarIngresos(total) {
        const el = document.getElementById('stat-ingresos');
        if (el) el.textContent = `S/ ${total.toFixed(2)}`;
    },

    // ── Jugadores de cartas ────────────────────────────────

    renderizarJugadoresCartas(mesa, onCobrarIndividual) {
        const lista     = document.getElementById('lista-jugadores-cartas');
        const sinJugMsg = document.getElementById('txt-sin-jugadores');
        if (!lista) return;

        if (!mesa.jugadoresCartas || mesa.jugadoresCartas.length === 0) {
            lista.querySelectorAll('.jugador-item').forEach(el => el.remove());
            if (sinJugMsg) sinJugMsg.style.display = '';
            return;
        }
        if (sinJugMsg) sinJugMsg.style.display = 'none';

        const idsActuales = new Set(mesa.jugadoresCartas.map(j => String(j.id)));

        // Eliminar jugadores que ya no están en la mesa
        lista.querySelectorAll('.jugador-item').forEach(el => {
            if (!idsActuales.has(el.dataset.jugId)) el.remove();
        });

        mesa.jugadoresCartas.forEach(jugador => {
            const deuda   = mesa.calcularDeudaJugador(jugador).toFixed(2);
            const entrada = this.formatearHoraCorta(jugador.entradaTimestamp);
            let li = lista.querySelector(`.jugador-item[data-jug-id="${jugador.id}"]`);

            if (!li) {
                // Crear el nodo solo si no existe — evita parpadeo total
                li = document.createElement('li');
                li.className     = 'jugador-item aviso-item aviso-info';
                li.dataset.jugId = jugador.id;
                li.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                        <div>
                            <span><i class="fa-solid fa-user"></i> <strong>${jugador.nombre}</strong></span>
                            <small style="color:var(--texto-muted);display:block;">
                                <i class="fa-regular fa-clock"></i> Entrada: ${entrada}
                            </small>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <strong class="deuda-jugador" style="color:var(--color-libre);font-family:monospace;">S/ ${deuda}</strong>
                            
                            <button class="btn-cobrar-jugador btn-pequeno btn-verde"
                                    data-jug-id="${jugador.id}"
                                    title="Cobrar y retirar jugador"
                                    style="padding:3px 8px;font-size:0.75rem;">
                                <i class="fa-solid fa-hand-holding-dollar"></i>
                            </button>

                            <button class="btn-eliminar-jugador btn-pequeno btn-rojo-outline"
                                    data-jug-id="${jugador.id}"
                                    title="Eliminar por error (Sin cobrar)"
                                    style="padding:3px 8px;font-size:0.75rem; border: none;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                lista.appendChild(li);

                // Evento registrado una sola vez al crear el nodo
                if (onCobrarIndividual) {
                    li.querySelector('.btn-cobrar-jugador')?.addEventListener('click', () => {
                        onCobrarIndividual(jugador.id);
                    });
                }
            } else {
                // Solo actualizar el número de deuda sin destruir el DOM
                const deudaEl = li.querySelector('.deuda-jugador');
                if (deudaEl && deudaEl.textContent !== `S/ ${deuda}`) {
                    deudaEl.textContent = `S/ ${deuda}`;
                }
            }
        });
    },
};

export default Dashboard;