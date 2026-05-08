// ============================================================
// ui/Modales.js
// ============================================================

const Modales = {

    _callbackCobrar:  null,
    _callbackALista:  null,
    _callbackCancelar: null,
    _callbackEliminarSinCobrar: null,
    _callbackConfirmar: null,
    _resumenActual:   null,
    _mesaActual:      null,

    // ── Modal principal de cobro ───────────────────────────
    abrirCobro(mesa, resumen, { onCobrar, onALista, onCancelar, onEliminarSinCobrar }) {
        this._callbackCobrar   = onCobrar;
        this._callbackALista   = onALista;
        this._callbackCancelar = onCancelar || null;
        this._callbackEliminarSinCobrar = onEliminarSinCobrar || null;
        this._resumenActual    = resumen;
        this._mesaActual       = mesa;

        document.getElementById('modal-mesa-nombre').textContent = `Mesa ${resumen.numero}`;
        document.getElementById('modal-tiempo').textContent = resumen.tiempoFormato || '--:--:--';

        const totalEl = document.getElementById('modal-total');
        if (totalEl) totalEl.textContent = resumen.totalPagar.toFixed(2);

        // Sección extra según tipo de mesa
        const seccionExtra = document.getElementById('seccion-input-lista');
        const inputExtra   = document.getElementById('input-nombre-lista');
        const labelExtra   = seccionExtra.querySelector('label');
        
        const totalOriginal = resumen.totalPagar;
        inputExtra.oninput = null;

        if (mesa.tipo === 'poker') {
            seccionExtra.classList.remove('oculto');
            if (labelExtra) labelExtra.textContent = 'Monto manual a cobrar (S/):';
            inputExtra.placeholder = 'Ej. 50';
            inputExtra.type = 'number';
            inputExtra.min  = '0';
            inputExtra.step = '0.50';
            inputExtra.onkeydown = (e) => { if (['e','E','+','-'].includes(e.key)) e.preventDefault(); };
            inputExtra.value = '';
            
            inputExtra.oninput = (e) => {
                if (parseFloat(e.target.value) < 0) e.target.value = 0;
                const nuevoMonto = parseFloat(e.target.value);
                const totalEl = document.getElementById('modal-total');
                if (totalEl) {
                    if (!isNaN(nuevoMonto) && nuevoMonto >= 0) {
                        totalEl.textContent = nuevoMonto.toFixed(2);
                    } else {
                        totalEl.textContent = totalOriginal.toFixed(2);
                    }
                }
            };

        } else if (mesa.tipo === 'cartas') {
            seccionExtra.classList.add('oculto');
        } else {
            seccionExtra.classList.remove('oculto');
            if (labelExtra) labelExtra.textContent = 'Nombre del cliente para enviar a lista:';
            inputExtra.placeholder = 'Ej. Juan Pérez';
            inputExtra.type = 'text';
            inputExtra.value = '';
        }

        // Desglose de jugadores (solo cartas)
        const desglose = document.getElementById('modal-desglose-cartas');
        if (desglose) {
            if (mesa.tipo === 'cartas' && resumen.jugadores?.length > 0) {
                desglose.classList.remove('oculto');
                desglose.innerHTML = `
                    <p style="color:var(--texto-muted);font-size:0.85rem;font-weight:600;margin-bottom:8px;">
                        <i class="fa-solid fa-users"></i> Desglose por jugador
                    </p>
                    ${resumen.jugadores.map(j => `
                        <div class="jugador-cobro-item">
                            <span><i class="fa-solid fa-user"></i> ${j.nombre}</span>
                            <strong>S/ ${j.deuda.toFixed(2)}</strong>
                        </div>
                    `).join('')}
                `;
            } else {
                desglose.classList.add('oculto');
                desglose.innerHTML = '';
            }
        }

        const btnEliminarSinCobrar = document.getElementById('btn-eliminar-sin-cobrar');
        if (btnEliminarSinCobrar) {
            btnEliminarSinCobrar.style.display = onEliminarSinCobrar ? '' : 'none';
        }

        document.getElementById('modal-cobro').classList.remove('oculto');
    },

    cerrar() {
        document.getElementById('modal-cobro').classList.add('oculto');
        const inputExtra = document.getElementById('input-nombre-lista');
        if (inputExtra) {
            inputExtra.value = '';
            inputExtra.type  = 'text';
        }
        this._callbackCobrar   = null;
        this._callbackALista   = null;
        this._callbackCancelar = null;
        this._callbackEliminarSinCobrar = null;
        this._resumenActual    = null;
        this._mesaActual       = null;
    },

    // ── Modal genérico de confirmación (Con botones dinámicos) ──
    abrirConfirmacion(titulo, mensaje, onAceptar, opciones = {}) {
        this._callbackConfirmar = onAceptar;
        document.getElementById('modal-confirm-titulo').innerHTML = titulo;
        document.getElementById('modal-confirm-mensaje').innerHTML = mensaje;
        
        // 👇 NOTA: Ahora los botones pueden cambiar su texto y color según el modal que lo llame
        const btnCancelar = document.getElementById('btn-confirm-cancelar');
        const btnAceptar = document.getElementById('btn-confirm-aceptar');

        if (btnCancelar) {
            btnCancelar.innerHTML = opciones.textoCancelar || 'Cancelar';
            btnCancelar.style.backgroundColor = opciones.colorCancelar || ''; 
            btnCancelar.style.color = opciones.colorTextoCancelar || ''; 
        }

        if (btnAceptar) {
            btnAceptar.innerHTML = opciones.textoAceptar || 'Sí, confirmar';
            btnAceptar.style.backgroundColor = opciones.colorAceptar || ''; 
            btnAceptar.style.borderColor = opciones.colorAceptar || ''; 
        }

        document.getElementById('modal-confirmacion').classList.remove('oculto');
    },

    cerrarConfirmacion() {
        document.getElementById('modal-confirmacion').classList.add('oculto');
        this._callbackConfirmar = null;
    },

    registrarEventos() {
        // Eventos Modal de Cobro
        document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
            if (this._callbackCancelar) this._callbackCancelar();
            this.cerrar();
        });

        document.getElementById('btn-cancelar-cobro')?.addEventListener('click', () => {
            if (this._callbackCancelar) this._callbackCancelar();
            this.cerrar();
        });

        document.getElementById('btn-eliminar-sin-cobrar')?.addEventListener('click', () => {
            if (this._callbackEliminarSinCobrar && this._resumenActual) {
                this._callbackEliminarSinCobrar(this._resumenActual);
            }
            this.cerrar();
        });

        document.getElementById('btn-cobrar-ahora')?.addEventListener('click', () => {
            if (!this._callbackCobrar || !this._resumenActual) return;

            if (this._mesaActual?.tipo === 'poker') {
                const inputExtra = document.getElementById('input-nombre-lista');
                const montoManual = parseFloat(inputExtra?.value);
                if (!isNaN(montoManual) && montoManual >= 0) {
                    this._resumenActual.totalPagar = montoManual;
                }
            }

            this._callbackCobrar(this._resumenActual);
            this.cerrar();
        });

        document.getElementById('btn-agregar-lista')?.addEventListener('click', () => {
            if (!this._callbackALista || !this._resumenActual) return;
            const inputExtra = document.getElementById('input-nombre-lista');
            const nombre = inputExtra?.value.trim();
            this._callbackALista(this._resumenActual, nombre);
            this.cerrar();
        });

        // Eventos Modal Genérico de Confirmación
        document.getElementById('btn-confirm-cancelar')?.addEventListener('click', () => {
            this.cerrarConfirmacion();
        });

        document.getElementById('btn-confirm-aceptar')?.addEventListener('click', () => {
            if (this._callbackConfirmar) this._callbackConfirmar();
            this.cerrarConfirmacion();
        });
    },
};

export default Modales;