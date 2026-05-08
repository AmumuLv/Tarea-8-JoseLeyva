// ============================================================
// BILLARBAR — login.js
// Módulo de autenticación: Login · Registro · Cambiar contraseña
//
// Responsabilidades:
//   - Navegación entre vistas (sin recargar página)
//   - Toggle mostrar/ocultar contraseña
//   - Validaciones de campos
//   - Indicador de fortaleza de contraseña
//   - Toast de notificaciones
//   - Simulación de envío (listo para conectar con backend)
// ============================================================

'use strict';

// ── Utilidades DOM ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const q = sel => document.querySelector(sel);

// ── Estado de vista activa ────────────────────────────────────
let vistaActual = 'login'; // 'login' | 'registro' | 'cambiar'

// ── 1. NAVEGACIÓN ENTRE VISTAS ────────────────────────────────

/**
 * Cambia la vista activa de la card de autenticación.
 * @param {'login'|'registro'|'cambiar'} destino
 */
function cambiarVista(destino) {
    const vistas = document.querySelectorAll('.auth-view');
    vistas.forEach(v => v.classList.remove('active'));

    const vista = $(`view-${destino}`);
    if (!vista) return;

    vista.classList.add('active');
    vistaActual = destino;

    // Limpiar errores y valores al cambiar vista
    limpiarFormulario(`form-${destino}`);
}

// Botones de navegación
$('ir-registro')  ?.addEventListener('click', () => cambiarVista('registro'));
$('ir-cambiar')   ?.addEventListener('click', () => cambiarVista('cambiar'));
$('volver-login') ?.addEventListener('click', () => cambiarVista('login'));
$('volver-login-2')?.addEventListener('click', () => cambiarVista('login'));
$('ir-cambiar-login')?.addEventListener('click', () => cambiarVista('login'));

// ── 2. MOSTRAR / OCULTAR CONTRASEÑA ──────────────────────────

document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input    = $(targetId);
        if (!input) return;

        const esPassword = input.type === 'password';
        input.type = esPassword ? 'text' : 'password';

        const icono = btn.querySelector('i');
        icono.className = esPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';

        // Efecto visual sutil
        btn.style.color = esPassword ? 'var(--color-principal)' : '';
    });
});

// ── 3. INDICADOR DE FORTALEZA DE CONTRASEÑA ──────────────────

function evaluarFortaleza(valor) {
    if (!valor) return { nivel: 0, texto: '', color: '' };

    let puntos = 0;
    if (valor.length >= 6)  puntos++;
    if (valor.length >= 10) puntos++;
    if (/[A-Z]/.test(valor)) puntos++;
    if (/[0-9]/.test(valor)) puntos++;
    if (/[^A-Za-z0-9]/.test(valor)) puntos++;

    if (puntos <= 1) return { nivel: 20,  texto: 'Débil',   color: 'var(--color-ocupada)' };
    if (puntos <= 2) return { nivel: 45,  texto: 'Regular', color: '#f59e0b' };
    if (puntos <= 3) return { nivel: 70,  texto: 'Buena',   color: 'var(--color-principal)' };
    return              { nivel: 100, texto: 'Fuerte',  color: 'var(--color-libre)' };
}

$('reg-password')?.addEventListener('input', e => {
    const { nivel, texto, color } = evaluarFortaleza(e.target.value);
    const fill  = $('strength-fill');
    const label = $('strength-label');
    if (fill)  { fill.style.width = `${nivel}%`; fill.style.backgroundColor = color; }
    if (label) { label.textContent = texto; label.style.color = color; }
});

// ── 4. FEEDBACK VISUAL EN INPUTS ──────────────────────────────

/**
 * Marca un input como válido o inválido y muestra/oculta error.
 */
function marcarCampo(inputId, errorId, esValido, mensaje = '') {
    const input = $(inputId);
    const error = $(errorId);
    if (!input) return;

    input.classList.toggle('valid',   esValido);
    input.classList.toggle('invalid', !esValido);

    if (error) error.textContent = esValido ? '' : mensaje;
}

/**
 * Limpia estados visuales de un formulario.
 */
function limpiarFormulario(formId) {
    const form = $(formId);
    if (!form) return;
    form.querySelectorAll('.auth-input').forEach(input => {
        input.classList.remove('valid', 'invalid');
        input.value = '';
    });
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    // Reset fortaleza
    const fill  = $('strength-fill');
    const label = $('strength-label');
    if (fill)  fill.style.width = '0%';
    if (label) label.textContent = '';
    // Reset toggle-pass
    form.querySelectorAll('.toggle-pass').forEach(btn => {
        const input = $(btn.dataset.target);
        if (input) input.type = 'password';
        const icono = btn.querySelector('i');
        if (icono) icono.className = 'fa-regular fa-eye';
        btn.style.color = '';
    });
}

// ── 5. VALIDACIONES ───────────────────────────────────────────

const Validar = {
    requerido(val)  { return val.trim().length > 0; },
    email(val)      { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); },
    telefono(val)   { return /^\d{7,15}$/.test(val.trim()); },
    dni(val)        { return /^\d{8}$/.test(val.trim()); },
    password(val)   { return val.length >= 6; },
    coincide(a, b)  { return a === b; },
};

// ── 6. FORMULARIO: LOGIN ──────────────────────────────────────

$('form-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;

    const usuario  = $('login-usuario').value;
    const password = $('login-password').value;

    if (!Validar.requerido(usuario)) {
        marcarCampo('login-usuario', 'err-login-usuario', false, 'Ingresa tu usuario o correo');
        ok = false;
    } else {
        marcarCampo('login-usuario', 'err-login-usuario', true);
    }

    if (!Validar.requerido(password)) {
        marcarCampo('login-password', 'err-login-password', false, 'Ingresa tu contraseña');
        ok = false;
    } else {
        marcarCampo('login-password', 'err-login-password', true);
    }

    if (!ok) return;

    // ── Verificar credenciales en localStorage ──
    const btn = e.target.querySelector('.btn-primary');
    iniciarCarga(btn);

    await simularPeticion(900);

    const cuentas = JSON.parse(localStorage.getItem('bb_cuentas') || '[]');
    const encontrado = cuentas.find(c =>
        (c.correo === usuario.trim() || c.usuario === usuario.trim()) &&
        c.password === password
    );

    // Modo demo: si no hay cuentas, acepta admin/admin
    const esModoDemo = cuentas.length === 0 &&
        (usuario.trim().toLowerCase() === 'admin');

    if (!encontrado && !esModoDemo) {
        detenerCarga(btn, '<i class="fa-solid fa-right-to-bracket"></i> Iniciar sesión');
        marcarCampo('login-usuario', 'err-login-usuario', false, 'Usuario o contraseña incorrectos');
        marcarCampo('login-password', 'err-login-password', false, ' ');
        mostrarToast('Credenciales incorrectas', 'error');
        return;
    }

    const sesion = encontrado || {
        nombres: 'Admin',
        apellidos: '',
        correo: 'admin@billarbar.com',
        usuario: 'admin',
        telefono: '',
        dni: '',
    };
    localStorage.setItem('bb_sesion', JSON.stringify(sesion));

    detenerCarga(btn, '<i class="fa-solid fa-right-to-bracket"></i> Iniciar sesión');
    mostrarToast('¡Bienvenido, ' + sesion.nombres + '! Redirigiendo...', 'success');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});

// ── 7. FORMULARIO: REGISTRO ───────────────────────────────────

$('form-registro')?.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;

    const campos = [
        { id: 'reg-nombres',   errId: 'err-reg-nombres',   fn: Validar.requerido,  msg: 'Ingresa tus nombres' },
        { id: 'reg-apellidos', errId: 'err-reg-apellidos', fn: Validar.requerido,  msg: 'Ingresa tus apellidos' },
        { id: 'reg-telefono',  errId: 'err-reg-telefono',  fn: Validar.telefono,   msg: 'Teléfono inválido (7-15 dígitos)' },
        { id: 'reg-dni',       errId: 'err-reg-dni',       fn: Validar.dni,        msg: 'DNI debe tener 8 dígitos' },
        { id: 'reg-correo',    errId: 'err-reg-correo',    fn: Validar.email,      msg: 'Correo inválido' },
        { id: 'reg-password',  errId: 'err-reg-password',  fn: Validar.password,   msg: 'Mínimo 6 caracteres' },
    ];

    campos.forEach(({ id, errId, fn, msg }) => {
        const val = $(id)?.value ?? '';
        const valido = fn(val);
        marcarCampo(id, errId, valido, msg);
        if (!valido) ok = false;
    });

    // Confirmar contraseña
    const pass    = $('reg-password')?.value  ?? '';
    const confirm = $('reg-confirm')?.value   ?? '';
    if (!Validar.coincide(pass, confirm)) {
        marcarCampo('reg-confirm', 'err-reg-confirm', false, 'Las contraseñas no coinciden');
        ok = false;
    } else if (Validar.requerido(confirm)) {
        marcarCampo('reg-confirm', 'err-reg-confirm', true);
    }

    if (!ok) return;

    // ── Simulación ────────────────────────────────────────────
    const btn = e.target.querySelector('.btn-primary');
    iniciarCarga(btn);
    await simularPeticion(1400);
    detenerCarga(btn, '<i class="fa-solid fa-user-check"></i> Crear cuenta');

    // Guardar cuenta nueva
    const cuentas = JSON.parse(localStorage.getItem('bb_cuentas') || '[]');
    cuentas.push({
        nombres:   $('reg-nombres').value.trim(),
        apellidos: $('reg-apellidos').value.trim(),
        telefono:  $('reg-telefono').value.trim(),
        dni:       $('reg-dni').value.trim(),
        correo:    $('reg-correo').value.trim(),
        usuario:   $('reg-correo').value.trim(),
        password:  $('reg-password').value,
    });
    localStorage.setItem('bb_cuentas', JSON.stringify(cuentas));

    mostrarToast('¡Cuenta creada! Ya puedes iniciar sesión.', 'success');
    setTimeout(() => cambiarVista('login'), 1500);
});

// ── 8. FORMULARIO: CAMBIAR CONTRASEÑA ────────────────────────

$('form-cambiar')?.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;

    const actual   = $('cambiar-actual')?.value  ?? '';
    const nueva    = $('cambiar-nueva')?.value   ?? '';
    const confirm  = $('cambiar-confirm')?.value ?? '';

    if (!Validar.requerido(actual)) {
        marcarCampo('cambiar-actual', 'err-cambiar-actual', false, 'Ingresa tu contraseña actual');
        ok = false;
    } else {
        marcarCampo('cambiar-actual', 'err-cambiar-actual', true);
    }

    if (!Validar.password(nueva)) {
        marcarCampo('cambiar-nueva', 'err-cambiar-nueva', false, 'Mínimo 6 caracteres');
        ok = false;
    } else {
        marcarCampo('cambiar-nueva', 'err-cambiar-nueva', true);
    }

    if (!Validar.coincide(nueva, confirm)) {
        marcarCampo('cambiar-confirm', 'err-cambiar-confirm', false, 'Las contraseñas no coinciden');
        ok = false;
    } else if (Validar.requerido(confirm)) {
        marcarCampo('cambiar-confirm', 'err-cambiar-confirm', true);
    }

    if (nueva && actual && nueva === actual) {
        marcarCampo('cambiar-nueva', 'err-cambiar-nueva', false, 'La nueva contraseña debe ser diferente');
        ok = false;
    }

    if (!ok) return;

    const btn = e.target.querySelector('.btn-primary');
    iniciarCarga(btn);
    await simularPeticion(1200);
    detenerCarga(btn, '<i class="fa-solid fa-shield-halved"></i> Actualizar contraseña');

    // Actualizar contraseña en localStorage si hay sesión activa
    const sesionActual = JSON.parse(localStorage.getItem('bb_sesion') || 'null');
    if (sesionActual) {
        const cuentas = JSON.parse(localStorage.getItem('bb_cuentas') || '[]');
        const idx = cuentas.findIndex(c => c.correo === sesionActual.correo);
        if (idx !== -1) {
            cuentas[idx].password = nueva;
            localStorage.setItem('bb_cuentas', JSON.stringify(cuentas));
        }
    }

    mostrarToast('Contraseña actualizada correctamente.', 'success');
    setTimeout(() => cambiarVista('login'), 1500);
});

// ── 9. HELPERS ────────────────────────────────────────────────

/**
 * Muestra estado de carga en un botón.
 */
function iniciarCarga(btn) {
    if (!btn) return;
    btn._textoOriginal = btn.innerHTML;
    btn.innerHTML = 'Procesando';
    btn.classList.add('btn-loading');
}

/**
 * Restaura el botón tras la carga.
 */
function detenerCarga(btn, textoHtml) {
    if (!btn) return;
    btn.classList.remove('btn-loading');
    btn.innerHTML = textoHtml || btn._textoOriginal || 'Enviar';
}

/**
 * Simula latencia de red (dev/demo).
 * En producción reemplaza esto con fetch() real.
 */
function simularPeticion(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── 10. TOAST ─────────────────────────────────────────────────

let _toastTimer = null;

/**
 * Muestra un toast flotante.
 * @param {string} mensaje
 * @param {'success'|'error'|'info'} tipo
 * @param {number} duracion ms
 */
function mostrarToast(mensaje, tipo = 'info', duracion = 2800) {
    const toast   = $('auth-toast');
    const msgEl   = $('toast-msg');
    const iconEl  = toast?.querySelector('.toast-icon');
    if (!toast || !msgEl) return;

    clearTimeout(_toastTimer);
    toast.classList.remove('visible', 'success', 'error', 'info');

    // Icono según tipo
    const iconos = {
        success: 'fa-solid fa-circle-check',
        error:   'fa-solid fa-circle-xmark',
        info:    'fa-solid fa-circle-info',
    };
    if (iconEl) iconEl.className = `toast-icon ${iconos[tipo] || iconos.info}`;

    msgEl.textContent = mensaje;
    toast.classList.add(tipo);

    // Forzar reflow para reiniciar animación
    void toast.offsetWidth;
    toast.classList.add('visible');

    _toastTimer = setTimeout(() => toast.classList.remove('visible'), duracion);
}

// ── 11. FEEDBACK EN TIEMPO REAL (blur) ────────────────────────
// Valida al perder foco para no molestar mientras el usuario escribe.

function agregarValidacionBlur(inputId, errId, fn, msg) {
    const input = $(inputId);
    if (!input) return;
    input.addEventListener('blur', () => {
        if (input.value.length > 0) {
            marcarCampo(inputId, errId, fn(input.value), msg);
        }
    });
    // Al empezar a escribir, quitar estado inválido
    input.addEventListener('input', () => {
        if (input.classList.contains('invalid') && input.value.length > 0) {
            input.classList.remove('invalid');
            const err = $(errId);
            if (err) err.textContent = '';
        }
    });
}

// Login
agregarValidacionBlur('login-usuario',  'err-login-usuario',  Validar.requerido, 'Campo requerido');
agregarValidacionBlur('login-password', 'err-login-password', Validar.requerido, 'Campo requerido');

// Registro
agregarValidacionBlur('reg-nombres',   'err-reg-nombres',   Validar.requerido, 'Ingresa tus nombres');
agregarValidacionBlur('reg-apellidos', 'err-reg-apellidos', Validar.requerido, 'Ingresa tus apellidos');
agregarValidacionBlur('reg-telefono',  'err-reg-telefono',  Validar.telefono,  'Teléfono inválido');
agregarValidacionBlur('reg-dni',       'err-reg-dni',       Validar.dni,       'DNI debe tener 8 dígitos');
agregarValidacionBlur('reg-correo',    'err-reg-correo',    Validar.email,     'Correo inválido');
agregarValidacionBlur('reg-password',  'err-reg-password',  Validar.password,  'Mínimo 6 caracteres');

// Confirmar contraseña en tiempo real
$('reg-confirm')?.addEventListener('input', e => {
    const pass = $('reg-password')?.value ?? '';
    if (e.target.value.length > 0) {
        marcarCampo(
            'reg-confirm', 'err-reg-confirm',
            Validar.coincide(pass, e.target.value),
            'Las contraseñas no coinciden'
        );
    }
});

// Cambiar contraseña
agregarValidacionBlur('cambiar-actual',   'err-cambiar-actual',   Validar.requerido, 'Campo requerido');
agregarValidacionBlur('cambiar-nueva',    'err-cambiar-nueva',    Validar.password,  'Mínimo 6 caracteres');
agregarValidacionBlur('cambiar-confirm',  'err-cambiar-confirm',  Validar.requerido, 'Campo requerido');

$('cambiar-confirm')?.addEventListener('input', e => {
    const nueva = $('cambiar-nueva')?.value ?? '';
    if (e.target.value.length > 0) {
        marcarCampo(
            'cambiar-confirm', 'err-cambiar-confirm',
            Validar.coincide(nueva, e.target.value),
            'Las contraseñas no coinciden'
        );
    }
});

// ── 12. EXPORTAR para integración con backend ─────────────────
// Si usas módulos ES6, descomenta:
// export { mostrarToast, cambiarVista };