const CONFIG = {
    WHATSAPP_NUMBER: '543518697090',
    NEGOCIO: 'Bros Burger y Lomos',
    COSTO_DELIVERY: 1000
};

const STORAGE_CLIENTE_KEY = 'datos_cliente';
let sweetAlertPromise = null;

function obtenerRutaConfig() {
    return window.location.pathname.includes('/pages/') ? '../files/config.json' : 'files/config.json';
}

function obtenerRutaProductos() {
    return window.location.pathname.includes('/pages/') ? '../files/productos.json' : 'files/productos.json';
}

async function cargarConfiguracion() {
    try {
        const respuesta = await fetch(obtenerRutaConfig(), { cache: 'no-store' });
        if (!respuesta.ok) return;
        const configRemota = await respuesta.json();
        Object.assign(CONFIG, configRemota);
    } catch {
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(obtenerRutaProductos(), { cache: 'no-store' });
        if (!respuesta.ok) return;
        const datos = await respuesta.json();

        if (Array.isArray(datos.hamburguesas)) hamburguesas = datos.hamburguesas;
        if (Array.isArray(datos.lomos)) lomos = datos.lomos;
        if (Array.isArray(datos.sandwiches)) sandwiches = datos.sandwiches;
        if (Array.isArray(datos.pizzas)) pizzas = datos.pizzas;
        if (Array.isArray(datos.papas)) papas = datos.papas;
        if (Array.isArray(datos.empanadas)) empanadas = datos.empanadas;
        if (Array.isArray(datos.vegetarianos)) vegetarianos = datos.vegetarianos;
        if (Array.isArray(datos.aderezos)) aderezos = datos.aderezos;
        if (Array.isArray(datos.bebidas)) bebidas = datos.bebidas;
        if (Array.isArray(datos.wraps)) wraps = datos.wraps;
        if (Array.isArray(datos.promos)) promos = datos.promos;
    } catch {
    }
}

function obtenerCostoDelivery() {
    const costo = Number(CONFIG.COSTO_DELIVERY);
    return Number.isFinite(costo) ? costo : 2000;
}

function cargarSweetAlert() {
    if (window.Swal) {
        return Promise.resolve(window.Swal);
    }

    if (sweetAlertPromise) {
        return sweetAlertPromise;
    }

    sweetAlertPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        script.onload = () => resolve(window.Swal || null);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
    });

    return sweetAlertPromise;
}

function obtenerLogoFallbackDataUri() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="Logo Bros"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f32b15"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs><rect width="200" height="200" rx="18" fill="url(#g)"/><text x="50%" y="56%" font-family="Segoe UI, Arial, sans-serif" font-size="56" text-anchor="middle" fill="#ffffff" font-weight="700">B</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function configurarLogoFallback() {
    const fallbackLogo = obtenerLogoFallbackDataUri();

    document.querySelectorAll('.logo-img').forEach((img) => {
        const aplicarFallback = () => {
            if (img.dataset.fallbackApplied === 'true') return;
            img.dataset.fallbackApplied = 'true';
            img.src = fallbackLogo;
        };

        img.addEventListener('error', aplicarFallback);

        if (img.complete && img.naturalWidth === 0) {
            aplicarFallback();
        }
    });

    const icono = document.querySelector('link[rel~="icon"]');
    if (icono) {
        icono.addEventListener('error', () => {
            icono.href = fallbackLogo;
            icono.type = 'image/svg+xml';
        });
    }
}

class Carrito {
    constructor() {
        this.items = this.cargarDelStorage();
    }

    cargarDelStorage() {
        const datos = localStorage.getItem('carrito');
        return datos ? JSON.parse(datos) : [];
    }

    guardarEnStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarContador();
    }

    agregar(producto) {
        const itemExistente = this.items.find(item => item.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad += producto.cantidad || 1;
        } else {
            this.items.push({
                ...producto,
                cantidad: producto.cantidad || 1
            });
        }

        this.guardarEnStorage();
        return true;
    }

    actualizar(id, cantidad) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (cantidad <= 0) {
                this.eliminar(id);
            } else {
                item.cantidad = cantidad;
                this.guardarEnStorage();
            }
        }
    }

    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardarEnStorage();
    }

    vaciar() {
        this.items = [];
        this.guardarEnStorage();
    }

    obtener() {
        return this.items;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    actualizarContador() {
        const contadores = document.querySelectorAll('#contador-carrito');
        const total = this.getTotalItems();
        contadores.forEach(contador => {
            contador.textContent = total;
        });
    }
}

const carrito = new Carrito();

function estaAbierto() {
    const ahora = new Date();
    // getDay(): 0=dom, 1=lun, 2=mar, 3=mie, 4=jue, 5=vie, 6=sab
    const dia = ahora.getDay();
    const hora = ahora.getHours();
    const min = ahora.getMinutes();
    const minutos = hora * 60 + min;

    const mediodiaAbre  = 12 * 60;       // 12:00
    const mediodiaTeile = 15 * 60;       // 15:00
    const nocheAbre     = 20 * 60;       // 20:00
    const nocheTeile12  = 24 * 60;       // 00:00 (medianoche)
    const nocheTeile1   = 25 * 60;       // 01:00

    const turnoMediodia = minutos >= mediodiaAbre && minutos < mediodiaTeile;
    const turnoNoche12  = minutos >= nocheAbre && minutos < nocheTeile12;
    const turnoNoche1   = minutos >= nocheAbre && minutos < nocheTeile1;

    if (dia === 2 || dia === 3 || dia === 4) {
        // Martes a jueves: 12-15 y 20-00
        return turnoMediodia || turnoNoche12;
    }
    if (dia === 5 || dia === 6) {
        // Viernes y sábado: 12-15 y 20-01
        return turnoMediodia || turnoNoche1;
    }
    if (dia === 0) {
        // Domingo: 20-00
        return turnoNoche12;
    }
    // Lunes: cerrado
    return false;
}

function mostrarCartelCerrado() {
    if (document.getElementById('overlay-cerrado')) return;

    const overlay = document.createElement('div');
    overlay.id = 'overlay-cerrado';
    overlay.innerHTML = `
        <div class="cerrado-box">
            <div class="cerrado-icono">🍔</div>
            <h2>¡Ahora estamos cerrados!</h2>
            <p>Podés ver el menú y preparar tu pedido, pero enviarlo solo durante nuestro horario de atención.</p>
            <div class="cerrado-horarios">
                <h3>📅 Horarios de atención</h3>
                <table>
                    <tr><td><strong>Martes a Jueves</strong></td><td>12:00 – 15:00 hs</td></tr>
                    <tr><td></td>                               <td>20:00 – 00:00 hs</td></tr>
                    <tr><td><strong>Viernes y Sábado</strong></td><td>12:00 – 15:00 hs</td></tr>
                    <tr><td></td>                               <td>20:00 – 01:00 hs</td></tr>
                    <tr><td><strong>Domingo</strong></td>       <td>20:00 – 00:00 hs</td></tr>
                    <tr><td><strong>Lunes</strong></td>         <td>Cerrado</td></tr>
                </table>
            </div>
            <button onclick="document.getElementById('overlay-cerrado').remove()">Ver el Menú igual</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

document.addEventListener('DOMContentLoaded', () => {
    configurarLogoFallback();
    carrito.actualizarContador();
    if (!estaAbierto()) mostrarCartelCerrado();
});

function agregarAlCarrito(producto) {
    carrito.agregar(producto);
    mostrarAlerta('✓ Producto agregado al carrito', 'exito');
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(alerta, container.firstChild);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function generarMensajeWhatsApp(cliente) {
    let mensaje = `Hola, soy *${cliente.nombre}*\n\n`;
    mensaje += `📱 Teléfono: ${cliente.telefono}\n`;
    if (cliente.email) mensaje += `📧 Email: ${cliente.email}\n`;
    if (cliente.direccion) mensaje += `🏠 Dirección: ${cliente.direccion}\n`;
    mensaje += `🚚 Modalidad: ${cliente.delivery ? `Delivery (+$${obtenerCostoDelivery()})` : 'Retiro en local'}\n`;
    if (cliente.notas) mensaje += `📝 Notas: ${cliente.notas}\n`;
    mensaje += `\n*PEDIDO:*\n`;
    mensaje += `${'='.repeat(40)}\n`;

    carrito.obtener().forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre} x${item.cantidad}\n`;
        mensaje += `   Precio: $${(item.precio * item.cantidad).toFixed(2)}\n`;
    });

    mensaje += `${'='.repeat(40)}\n`;
    const subtotal = carrito.getTotal();
    const delivery = cliente.delivery ? obtenerCostoDelivery() : 0;
    const total = subtotal + delivery;
    
    if (delivery > 0) {
        mensaje += `Subtotal: $${subtotal.toFixed(2)}\n`;
        mensaje += `Delivery: $${delivery.toFixed(2)}\n`;
        mensaje += `${'='.repeat(40)}\n`;
    }
    mensaje += `*TOTAL: $${total.toFixed(2)}*\n`;
    mensaje += `\n¡Gracias por tu pedido en ${CONFIG.NEGOCIO}!`;

    return encodeURIComponent(mensaje);
}

function enviarPorWhatsApp(cliente) {
    const mensaje = generarMensajeWhatsApp(cliente);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensaje}`;
    window.open(url, '_blank');
}

let hamburguesas = [];

let lomos = [];

let sandwiches = [];

let pizzas = [];

let papas = [];

let empanadas = [];

let vegetarianos = [];

let aderezos = [];

let bebidas = [];

let wraps = [];

let promos = [];

function renderizarHamburguesas() {
    const grid = document.getElementById('grid-hamburguesas');
    if (!grid) return;
    
    grid.innerHTML = hamburguesas.map(ham => `
        <div class="producto-card">
            <div class="producto-imagen">${ham.id === 'ham1' ? '<img src="../files/hamburguesa_clasica_simple.png" alt="Hamburguesa Clásica Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham2' ? '<img src="../files/hamburguesa_clasica_doble.png" alt="Hamburguesa Clásica Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham3' ? '<img src="../files/hamburguesa_clasica_triple.png" alt="Hamburguesa Clásica Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham4' ? '<img src="../files/hamburguesa_completa_simple.png" alt="Hamburguesa Completa Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham5' ? '<img src="../files/hamburguesa_completa_doble.png" alt="Hamburguesa Completa Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham6' ? '<img src="../files/hamburguesa_completa_triple.png" alt="Hamburguesa Completa Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham7' ? '<img src="../files/hamburguesa_cheese_simple.png" alt="Hamburguesa Cheese Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham8' ? '<img src="../files/hamburguesa_cheese_doble.png" alt="Hamburguesa Cheese Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham9' ? '<img src="../files/hamburguesa_cheese_triple.png" alt="Hamburguesa Cheese Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham10' ? '<img src="../files/hamburguesa_americana_simple.png" alt="Hamburguesa Americana Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham11' ? '<img src="../files/hamburguesa_americana_doble.png" alt="Hamburguesa Americana Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham12' ? '<img src="../files/hamburguesa_americana_triple.png" alt="Hamburguesa Americana Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham13' ? '<img src="../files/hamburguesa_provo_simple.png" alt="Hamburguesa Provo Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham14' ? '<img src="../files/hamburguesa_provo_doble.png" alt="Hamburguesa Provo Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham15' ? '<img src="../files/hamburguesa_provo_triple.png" alt="Hamburguesa Provo Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham16' ? '<img src="../files/hamburguesa_mex_simple.png" alt="Hamburguesa Mex Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham17' ? '<img src="../files/hamburguesa_mex_doble.png" alt="Hamburguesa Mex Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham18' ? '<img src="../files/hamburguesa_mex_triple.png" alt="Hamburguesa Mex Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham19' ? '<img src="../files/hamburguesa_blue_simple.png" alt="Hamburguesa Blue Simple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham20' ? '<img src="../files/hamburguesa_blue_doble.png" alt="Hamburguesa Blue Doble" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham21' ? '<img src="../files/hamburguesa_blue_triple.png" alt="Hamburguesa Blue Triple" style="width: 100%; height: 100%; object-fit: cover;">' : ham.id === 'ham22' ? '<img src="../files/hamburguesa_gulabros.png" alt="La Gula Bros" style="width: 100%; height: 100%; object-fit: cover;">' : ham.emoji}</div>
            <div class="producto-info">
                <h3>${ham.nombre}</h3>
                <p class="producto-descripcion">${ham.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${ham.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${ham.id}',
                        nombre: '${ham.nombre}',
                        precio: ${ham.precio},
                        emoji: '${ham.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarLomos() {
    const grid = document.getElementById('grid-lomos');
    if (!grid) return;
    
    grid.innerHTML = lomos.map(lomo => `
        <div class="producto-card">
            <div class="producto-imagen">${lomo.id === 'lomo1' ? '<img src="../files/Lomo completo.png" alt="Lomo Completo" style="width: 100%; height: 100%; object-fit: cover;">' : lomo.id === 'lomo2' ? '<img src="../files/Lomo_americano.png" alt="Lomo Americano" style="width: 100%; height: 100%; object-fit: cover;">' : lomo.id === 'lomo3' ? '<img src="../files/lomo_azul.png" alt="Lomo Azul" style="width: 100%; height: 100%; object-fit: cover;">' : lomo.id === 'lomo4' ? '<img src="../files/lomo_mex.png" alt="Lomo Mex" style="width: 100%; height: 100%; object-fit: cover;">' : lomo.id === 'lomo5' ? '<img src="../files/lomo_vegetariano.png" alt="Lomo Vegetariano" style="width: 100%; height: 100%; object-fit: cover;">' : lomo.emoji}</div>
            <div class="producto-info">
                <h3>${lomo.nombre}</h3>
                <p class="producto-descripcion">${lomo.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${lomo.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${lomo.id}',
                        nombre: '${lomo.nombre}',
                        precio: ${lomo.precio},
                        emoji: '${lomo.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarSandwiches() {
    const grid = document.getElementById('grid-sandwiches');
    if (!grid) return;
    
    grid.innerHTML = sandwiches.map(item => {
        const imagen = item.imagen
            ? `<img src="${item.imagen}" alt="${item.nombre}" style="width: 100%; height: 100%; object-fit: ${item.id === 'sand2' ? 'contain' : 'cover'}; ${item.id === 'sand2' ? 'background: #fff; padding: 10px;' : ''}">`
            : item.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${item.nombre}</h3>
                <p class="producto-descripcion">${item.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${item.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${item.id}',
                        nombre: '${item.nombre}',
                        precio: ${item.precio},
                        emoji: '${item.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarPizzas() {
    const grid = document.getElementById('grid-pizzas');
    if (!grid) return;
    
    grid.innerHTML = pizzas.map(item => {
        const imagen = item.imagen
            ? `<img src="${item.imagen}" alt="${item.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : item.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${item.nombre}</h3>
                <p class="producto-descripcion">${item.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${item.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${item.id}',
                        nombre: '${item.nombre}',
                        precio: ${item.precio},
                        emoji: '${item.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarPapas() {
    const grid = document.getElementById('grid-papas');
    if (!grid) return;
    
    grid.innerHTML = papas.map(papa => {
        const imagen = papa.imagen
            ? `<img src="${papa.imagen}" alt="${papa.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : papa.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${papa.nombre}</h3>
                <p class="producto-descripcion">${papa.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${papa.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${papa.id}',
                        nombre: '${papa.nombre}',
                        precio: ${papa.precio},
                        emoji: '${papa.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarEmpanadas() {
    const grid = document.getElementById('grid-empanadas');
    if (!grid) return;
    
    grid.innerHTML = empanadas.map(emp => {
        const imagen = emp.imagen
            ? `<img src="${emp.imagen}" alt="${emp.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : emp.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${emp.nombre}</h3>
                <p class="producto-descripcion">${emp.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${emp.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${emp.id}',
                        nombre: '${emp.nombre}',
                        precio: ${emp.precio},
                        emoji: '${emp.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarVegetarianos() {
    const grid = document.getElementById('grid-vegetariano');
    if (!grid) return;
    
    grid.innerHTML = vegetarianos.map(veg => {
        const imagen = veg.imagen
            ? `<img src="${veg.imagen}" alt="${veg.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : veg.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${veg.nombre}</h3>
                <p class="producto-descripcion">${veg.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${veg.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${veg.id}',
                        nombre: '${veg.nombre}',
                        precio: ${veg.precio},
                        emoji: '${veg.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarAderezos() {
    const grid = document.getElementById('grid-aderezos');
    if (!grid) return;
    
    grid.innerHTML = aderezos.map(aderezo => {
        const imagen = aderezo.imagen
            ? `<img src="${aderezo.imagen}" alt="${aderezo.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : aderezo.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${aderezo.nombre}</h3>
                <p class="producto-descripcion">${aderezo.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${aderezo.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${aderezo.id}',
                        nombre: '${aderezo.nombre}',
                        precio: ${aderezo.precio},
                        emoji: '${aderezo.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarBebidas() {
    const grid = document.getElementById('grid-bebidas');
    if (!grid) return;
    
    grid.innerHTML = bebidas.map(beb => {
        const imagen = beb.imagen
            ? `<img src="${beb.imagen}" alt="${beb.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
            : beb.emoji;

        return `
        <div class="producto-card">
            <div class="producto-imagen">${imagen}</div>
            <div class="producto-info">
                <h3>${beb.nombre}</h3>
                <p class="producto-descripcion">${beb.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${beb.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${beb.id}',
                        nombre: '${beb.nombre}',
                        precio: ${beb.precio},
                        emoji: '${beb.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderizarWraps() {
    const grid = document.getElementById('grid-wraps');
    if (!grid) return;
    
    grid.innerHTML = wraps.map(wrap => `
        <div class="producto-card">
            <div class="producto-imagen">${wrap.emoji}</div>
            <div class="producto-info">
                <h3>${wrap.nombre}</h3>
                <p class="producto-descripcion">${wrap.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${wrap.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${wrap.id}',
                        nombre: '${wrap.nombre}',
                        precio: ${wrap.precio},
                        emoji: '${wrap.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarPromos() {
    const grid = document.getElementById('grid-promos');
    if (!grid) return;

    const promosVisibles = promos.filter(promo => promo.visible !== false);
    
    grid.innerHTML = promosVisibles.map(promo => `
        <div class="producto-card">
            <div class="producto-imagen">${promo.imagen ? `<img src="${promo.imagen}" alt="${promo.nombre}" style="width:100%;height:100%;object-fit:cover;">` : promo.emoji}</div>
            <div class="producto-info">
                <h3>${promo.nombre}</h3>
                <p class="producto-descripcion">${promo.descripcion}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${promo.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito({
                        id: '${promo.id}',
                        nombre: '${promo.nombre}',
                        precio: ${promo.precio},
                        emoji: '${promo.emoji}'
                    })">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function actualizarCarrito() {
    const items = carrito.obtener();

    if (items.length === 0) {
        const carritoVacio = document.getElementById('carrito-vacio');
        const carritoContenido = document.getElementById('carrito-contenido');
        if (carritoVacio) carritoVacio.style.display = 'block';
        if (carritoContenido) carritoContenido.style.display = 'none';
        return;
    }

    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    if (carritoVacio) carritoVacio.style.display = 'none';
    if (carritoContenido) carritoContenido.style.display = 'block';

    const tabla = document.getElementById('tabla-items');
    if (tabla) {
        tabla.innerHTML = items.map(item => `
            <tr>
                <td>${item.emoji} ${item.nombre}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>
                    <div class="cantidad">
                        <button type="button" onclick="disminuirCantidad('${item.id}')" style="width: 30px; padding: 5px; background: #ecf0f1; border: none; cursor: pointer;">-</button>
                        <input type="number" value="${item.cantidad}" min="1" onchange="carrito.actualizar('${item.id}', parseInt(this.value)); actualizarCarrito();" style="width: 60px; text-align: center;">
                        <button type="button" onclick="aumentarCantidad('${item.id}')" style="width: 30px; padding: 5px; background: #ecf0f1; border: none; cursor: pointer;">+</button>
                    </div>
                </td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td>
                    <button type="button" class="btn-eliminar" onclick="carrito.eliminar('${item.id}'); actualizarCarrito();">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    const subtotal = carrito.getTotal();
    const deliveryCheck = document.getElementById('delivery');
    const delivery = deliveryCheck && deliveryCheck.checked ? obtenerCostoDelivery() : 0;
    const total = subtotal + delivery;
    
    const subtotalEl = document.getElementById('subtotal');
    const envioEl = document.getElementById('envio');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (envioEl) envioEl.textContent = delivery > 0 ? `$${delivery.toFixed(2)}` : 'Retiro en local';
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function aumentarCantidad(id) {
    const item = carrito.obtener().find(i => i.id === id);
    if (item) {
        carrito.actualizar(id, item.cantidad + 1);
        actualizarCarrito();
    }
}

function disminuirCantidad(id) {
    const item = carrito.obtener().find(i => i.id === id);
    if (item && item.cantidad > 1) {
        carrito.actualizar(id, item.cantidad - 1);
        actualizarCarrito();
    }
}

async function vaciarCarrito() {
    const SwalRef = await cargarSweetAlert();

    if (!SwalRef) {
        mostrarAlerta('⚠️ No se pudo abrir la confirmación. Intenta nuevamente.', 'error');
        return;
    }

    const resultado = await SwalRef.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
        carrito.vaciar();
        actualizarCarrito();
    }
}

function mostrarFormulario() {
    if (carrito.obtener().length === 0) {
        mostrarAlerta('⚠️ Tu carrito está vacío', 'error');
        return;
    }
    document.querySelector('.formulario-cliente').scrollIntoView({ behavior: 'smooth' });
}

function leerDatosClienteGuardados() {
    const datos = localStorage.getItem(STORAGE_CLIENTE_KEY);
    if (!datos) return null;
    try {
        return JSON.parse(datos);
    } catch {
        return null;
    }
}

function obtenerDatosClienteFormulario() {
    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');
    const direccion = document.getElementById('direccion');
    const delivery = document.getElementById('delivery');
    const notas = document.getElementById('notas');

    if (!nombre || !telefono || !email || !direccion || !delivery || !notas) {
        return null;
    }

    return {
        nombre: nombre.value,
        telefono: telefono.value,
        email: email.value,
        direccion: direccion.value,
        delivery: delivery.checked,
        notas: notas.value
    };
}

function guardarDatosClienteParciales() {
    const datos = obtenerDatosClienteFormulario();
    if (!datos) return;
    localStorage.setItem(STORAGE_CLIENTE_KEY, JSON.stringify(datos));
}

function precargarFormularioCliente() {
    const datos = leerDatosClienteGuardados();
    if (!datos) return;

    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');
    const direccion = document.getElementById('direccion');
    const delivery = document.getElementById('delivery');
    const notas = document.getElementById('notas');

    if (nombre) nombre.value = datos.nombre || '';
    if (telefono) telefono.value = datos.telefono || '';
    if (email) email.value = datos.email || '';
    if (direccion) direccion.value = datos.direccion || '';
    if (delivery) delivery.checked = Boolean(datos.delivery);
    if (notas) notas.value = datos.notas || '';
}

function configurarAutoguardadoFormulario() {
    const campos = ['nombre', 'telefono', 'email', 'direccion', 'notas'];
    campos.forEach((idCampo) => {
        const campo = document.getElementById(idCampo);
        if (campo) {
            campo.addEventListener('input', guardarDatosClienteParciales);
        }
    });

    const delivery = document.getElementById('delivery');
    if (delivery) {
        delivery.addEventListener('change', guardarDatosClienteParciales);
    }
}

function enviarPedido(event) {
    event.preventDefault();

    if (!estaAbierto()) {
        mostrarCartelCerrado();
        return;
    }

    const cliente = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        direccion: document.getElementById('direccion').value,
        delivery: document.getElementById('delivery').checked,
        notas: document.getElementById('notas').value
    };

    if (!cliente.nombre || !cliente.telefono) {
        mostrarAlerta('⚠️ Por favor completa nombre y teléfono', 'error');
        return;
    }

    if (carrito.obtener().length === 0) {
        mostrarAlerta('⚠️ Tu carrito está vacío', 'error');
        return;
    }

    enviarPorWhatsApp(cliente);

    setTimeout(() => {
        carrito.vaciar();
        const formulario = document.querySelector('form');
        if (formulario) formulario.reset();
        localStorage.removeItem(STORAGE_CLIENTE_KEY);
        actualizarCarrito();
        mostrarAlerta('✓ Pedido enviado por WhatsApp. ¡Gracias por tu compra!', 'exito');
    }, 500);
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarConfiguracion();
    await cargarProductos();
    carrito.actualizarContador();
    await cargarSweetAlert();
    
    renderizarHamburguesas();
    renderizarLomos();
    renderizarSandwiches();
    renderizarPizzas();
    renderizarPapas();
    renderizarEmpanadas();
    renderizarVegetarianos();
    renderizarAderezos();
    renderizarBebidas();
    renderizarWraps();
    renderizarPromos();

    precargarFormularioCliente();
    configurarAutoguardadoFormulario();
    
    if (document.getElementById('carrito-vacio') || document.getElementById('carrito-contenido')) {
        actualizarCarrito();
    }
});
