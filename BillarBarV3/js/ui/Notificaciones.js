// ============================================================
// ui/Notificaciones.js
//
// Gestiona el panel "Registro de eventos" (lista de avisos).
// Se extrajo de la clase UI original para tener responsabilidad
// única: solo sabe mostrar notificaciones.
// ============================================================

const Notificaciones = {

    // Tipos válidos: 'info' | 'cobro' | 'pausa' | 'alerta'
    agregar(mensaje, tipo = 'info') {
        const lista = document.getElementById('lista-avisos');
        if (!lista) return;

        const hora = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit', minute: '2-digit',
        });

        const li = document.createElement('li');
        li.className = `aviso-item aviso-${tipo}`;
        li.innerHTML = `
            <span>${mensaje}</span>
            <span class="aviso-hora"><i class="fa-regular fa-clock"></i> ${hora}</span>
        `;
        lista.prepend(li);
    },
};

export default Notificaciones;