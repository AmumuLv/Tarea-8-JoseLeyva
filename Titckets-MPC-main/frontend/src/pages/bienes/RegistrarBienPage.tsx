import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Monitor, Laptop, Printer, Keyboard, Mouse, Volume2, Wifi, Package,
  Search, Loader2, ArrowLeft, ArrowRight, Check, Eye,
  Cpu, MemoryStick, Globe, Network, Shield, Zap, Palette,
  Layers, Disc, MapPin, Tag, Hash, User, Users, Building2, Info,
  Landmark, Briefcase, FileText,
} from 'lucide-react';
import type { TipoBien, BienStats } from '../../api/bienApi';
import { createBien, updateBien, getBien, getTiposBienes, getBienStats } from '../../api/bienApi';
import { getAreas } from '../../api/areaApi';
import { getSedes } from '../../api/sedesApi';
import toast from '../../utils/notify';
import { getErrorMessage, getValidationErrors } from '../../api/axios';

/* ─── Icons & Config ─── */

const TIPO_ICONOS: Record<string, any> = {
  'Computadora de Escritorio': Monitor,
  'Laptop': Laptop,
  'Impresora': Printer,
  'Monitor': Monitor,
  'Teclado': Keyboard,
  'Mouse': Mouse,
  'Parlantes': Volume2,
  'Equipo de Red': Wifi,
  'Otro': Package,
};

const TIPO_DESCRIPCIONES: Record<string, string> = {
  'Computadora de Escritorio': 'Equipos de escritorio, CPU, torre, all in one',
  'Laptop': 'Computadoras portátiles de cualquier marca',
  'Impresora': 'Impresoras láser, inyección, fotocopiadoras',
  'Monitor': 'Monitores, pantallas LED, LCD, curvas',
  'Teclado': 'Teclados alámbricos, inalámbricos, mecánicos',
  'Mouse': 'Mouse ópticos, inalámbricos, con cable',
  'Parlantes': 'Parlantes, barras de sonido, audífonos',
  'Equipo de Red': 'Routers, switches, access points, módems',
  'Otro': 'Otros dispositivos no contemplados',
};

const TIPO_COLORS: Record<string, { bg: string; text: string }> = {
  'Computadora de Escritorio': { bg: 'bg-blue-100', text: 'text-blue-600' },
  'Laptop': { bg: 'bg-sky-100', text: 'text-sky-600' },
  'Impresora': { bg: 'bg-purple-100', text: 'text-purple-600' },
  'Monitor': { bg: 'bg-amber-100', text: 'text-amber-600' },
  'Teclado': { bg: 'bg-orange-100', text: 'text-orange-600' },
  'Mouse': { bg: 'bg-rose-100', text: 'text-rose-600' },
  'Parlantes': { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  'Equipo de Red': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  'Otro': { bg: 'bg-teal-100', text: 'text-teal-600' },
};

const AREA_COLORS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-purple-500 to-purple-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-pink-500 to-pink-600',
];

const AREA_ICONS = [Building2, Users, Landmark, Briefcase, FileText, Globe, Shield, Zap, Users];

/* ─── Field Specs ─── */

interface CampoSpec {
  campo: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select';
  options?: string[];
}

interface SeccionSpec {
  titulo: string;
  icono: any;
  campos: CampoSpec[];
}

const CAMPOS_POR_TIPO: Record<string, SeccionSpec[]> = {
  'Computadora de Escritorio': [
    {
      titulo: 'Procesador',
      icono: Cpu,
      campos: [
        { campo: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i7-12700' },
        { campo: 'generacion_procesador', label: 'Generación', placeholder: 'Ej: 12th Gen' },
      ],
    },
    {
      titulo: 'Memoria y Almacenamiento',
      icono: MemoryStick,
      campos: [
        { campo: 'memoria_ram', label: 'Memoria RAM', placeholder: 'Ej: 16 GB' },
        { campo: 'tipo_ram', label: 'Tipo de RAM', type: 'select', options: ['DDR3', 'DDR4', 'DDR5'] },
        { campo: 'ranuras_ram', label: 'Ranuras RAM', placeholder: 'Ej: 2' },
        { campo: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 512 GB' },
        { campo: 'tipo_almacenamiento', label: 'Tipo Almacenamiento', type: 'select', options: ['SSD', 'HDD', 'NVMe'] },
        { campo: 'capacidad_almacenamiento', label: 'Capacidad', placeholder: 'Ej: 512 GB' },
      ],
    },
    {
      titulo: 'Gráficos y Placa',
      icono: Palette,
      campos: [
        { campo: 'tarjeta_grafica', label: 'Tarjeta Gráfica', placeholder: 'Ej: NVIDIA RTX 3060' },
        { campo: 'memoria_video', label: 'Memoria de Video', placeholder: 'Ej: 12 GB' },
        { campo: 'placa_madre', label: 'Placa Madre', placeholder: 'Ej: ASUS PRIME B660' },
      ],
    },
    {
      titulo: 'Sistema y Red',
      icono: Globe,
      campos: [
        { campo: 'sistema_operativo', label: 'Sistema Operativo', placeholder: 'Ej: Windows 11 Pro' },
        { campo: 'arquitectura_so', label: 'Arquitectura', type: 'select', options: ['32 bits', '64 bits'] },
        { campo: 'nombre_equipo', label: 'Nombre del Equipo', placeholder: 'Ej: PC-OTIC-001' },
        { campo: 'direccion_ip', label: 'Dirección IP', placeholder: '192.168.1.100' },
        { campo: 'direccion_mac', label: 'Dirección MAC', placeholder: 'AA:BB:CC:DD:EE:FF' },
        { campo: 'dominio', label: 'Dominio (opc.)', placeholder: 'Ej: MUNICASMA' },
      ],
    },
    {
      titulo: 'Seguridad y Energía',
      icono: Shield,
      campos: [
        { campo: 'antivirus', label: 'Antivirus', placeholder: 'Ej: Windows Defender' },
        { campo: 'fuente_poder', label: 'Fuente de Poder (opc.)', placeholder: 'Ej: 500W' },
      ],
    },
  ],
  'Laptop': [
    {
      titulo: 'Procesador',
      icono: Cpu,
      campos: [
        { campo: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i5-1335U' },
        { campo: 'generacion', label: 'Generación', placeholder: 'Ej: 13th Gen' },
      ],
    },
    {
      titulo: 'Memoria y Almacenamiento',
      icono: MemoryStick,
      campos: [
        { campo: 'memoria_ram', label: 'Memoria RAM', placeholder: 'Ej: 16 GB' },
        { campo: 'tipo_ram', label: 'Tipo de RAM', type: 'select', options: ['DDR3', 'DDR4', 'DDR5'] },
        { campo: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 512 GB' },
        { campo: 'tipo_disco', label: 'Tipo de Disco', type: 'select', options: ['SSD', 'HDD', 'NVMe'] },
      ],
    },
    {
      titulo: 'Pantalla y Gráficos',
      icono: Monitor,
      campos: [
        { campo: 'tamano_pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 14 pulgadas' },
        { campo: 'resolucion', label: 'Resolución', placeholder: 'Ej: 1920x1080' },
        { campo: 'tarjeta_grafica', label: 'Tarjeta Gráfica', placeholder: 'Ej: Intel Iris Xe' },
      ],
    },
    {
      titulo: 'Sistema y Red',
      icono: Globe,
      campos: [
        { campo: 'sistema_operativo', label: 'Sistema Operativo', placeholder: 'Ej: Windows 11 Home' },
        { campo: 'direccion_ip', label: 'Dirección IP', placeholder: '192.168.1.100' },
        { campo: 'direccion_mac', label: 'Dirección MAC', placeholder: 'AA:BB:CC:DD:EE:FF' },
        { campo: 'nombre_equipo', label: 'Nombre del Equipo', placeholder: 'Ej: LAP-OTIC-001' },
      ],
    },
    {
      titulo: 'Batería',
      icono: Zap,
      campos: [
        { campo: 'estado_bateria', label: 'Estado Batería', type: 'select', options: ['Buena', 'Regular', 'Mala', 'Sin batería'] },
        { campo: 'capacidad_bateria', label: 'Capacidad (opc.)', placeholder: 'Ej: 54 Wh' },
        { campo: 'cargador_original', label: 'Cargador Original', type: 'select', options: ['Sí', 'No'] },
      ],
    },
  ],
  'Monitor': [
    {
      titulo: 'Pantalla',
      icono: Monitor,
      campos: [
        { campo: 'tamano_pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 24 pulgadas' },
        { campo: 'resolucion', label: 'Resolución', placeholder: 'Ej: 1920x1080' },
        { campo: 'tipo_panel', label: 'Tipo de Panel', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED'] },
        { campo: 'frecuencia', label: 'Frecuencia (Hz)', placeholder: 'Ej: 75 Hz' },
        { campo: 'relacion_aspecto', label: 'Relación de Aspecto', placeholder: 'Ej: 16:9' },
      ],
    },
    {
      titulo: 'Conectividad y Extras',
      icono: Network,
      campos: [
        { campo: 'entradas_video', label: 'Entradas de Video', placeholder: 'Ej: HDMI, VGA, DisplayPort' },
        { campo: 'altavoces_integrados', label: 'Altavoces Integrados', type: 'select', options: ['Sí', 'No'] },
        { campo: 'base_ajustable', label: 'Base Ajustable', type: 'select', options: ['Sí', 'No'] },
      ],
    },
  ],
  'Impresora': [
    {
      titulo: 'Tecnología',
      icono: Printer,
      campos: [
        { campo: 'tecnologia', label: 'Tecnología', type: 'select', options: ['Láser', 'Inyección de Tinta', 'Matricial', 'Plotter'] },
        { campo: 'color_monocromatico', label: 'Color / Mono', type: 'select', options: ['Color', 'Monocromática'] },
      ],
    },
    {
      titulo: 'Conectividad',
      icono: Network,
      campos: [
        { campo: 'conectividad', label: 'Conectividad', placeholder: 'Ej: USB, WiFi, Ethernet' },
        { campo: 'direccion_ip', label: 'Dirección IP', placeholder: '192.168.1.100' },
        { campo: 'direccion_mac', label: 'Dirección MAC', placeholder: 'AA:BB:CC:DD:EE:FF' },
      ],
    },
    {
      titulo: 'Rendimiento',
      icono: Zap,
      campos: [
        { campo: 'resolucion_impresion', label: 'Resolución Impresión', placeholder: 'Ej: 1200x1200 dpi' },
        { campo: 'velocidad_impresion', label: 'Velocidad', placeholder: 'Ej: 30 ppm' },
        { campo: 'duplex_automatico', label: 'Dúplex Automático', type: 'select', options: ['Sí', 'No'] },
      ],
    },
    {
      titulo: 'Tóner / Cartucho',
      icono: Disc,
      campos: [
        { campo: 'nivel_toner', label: 'Nivel de Tóner', placeholder: 'Ej: 80%' },
        { campo: 'modelo_cartucho', label: 'Modelo Cartucho', placeholder: 'Ej: HP 305A' },
      ],
    },
  ],
  'Equipo de Red': [
    {
      titulo: 'Información del Equipo',
      icono: Wifi,
      campos: [
        { campo: 'tipo_equipo_red', label: 'Tipo de Equipo', type: 'select', options: ['Router', 'Switch', 'Access Point', 'Módem', 'Firewall', 'Otro'] },
        { campo: 'numero_puertos', label: 'Número de Puertos', placeholder: 'Ej: 24' },
        { campo: 'velocidad_puertos', label: 'Velocidad Puertos', placeholder: 'Ej: 1 Gbps' },
      ],
    },
    {
      titulo: 'Red',
      icono: Globe,
      campos: [
        { campo: 'direccion_ip', label: 'Dirección IP', placeholder: '192.168.1.1' },
        { campo: 'direccion_mac', label: 'Dirección MAC', placeholder: 'AA:BB:CC:DD:EE:FF' },
        { campo: 'firmware', label: 'Firmware', placeholder: 'Ej: v3.2.1' },
        { campo: 'vlan', label: 'VLAN', placeholder: 'Ej: 10,20,30' },
      ],
    },
    {
      titulo: 'Instalación',
      icono: Layers,
      campos: [
        { campo: 'poe', label: 'PoE', type: 'select', options: ['Sí', 'No'] },
        { campo: 'rack', label: 'Rack', type: 'select', options: ['Sí', 'No'] },
      ],
    },
  ],
  'Mouse': [
    {
      titulo: 'Especificaciones',
      icono: Mouse,
      campos: [
        { campo: 'tipo_mouse', label: 'Tipo', type: 'select', options: ['Óptico', 'Láser'] },
        { campo: 'conexion', label: 'Conexión', type: 'select', options: ['USB', 'Bluetooth', 'Inalámbrico', 'PS/2'] },
        { campo: 'dpi', label: 'DPI', placeholder: 'Ej: 1600 DPI' },
        { campo: 'cantidad_botones', label: 'Cantidad Botones', placeholder: 'Ej: 3' },
      ],
    },
  ],
  'Teclado': [
    {
      titulo: 'Especificaciones',
      icono: Keyboard,
      campos: [
        { campo: 'tipo_teclado', label: 'Tipo', type: 'select', options: ['Mecánico', 'Membrana', 'Scissor'] },
        { campo: 'conexion', label: 'Conexión', type: 'select', options: ['USB', 'Bluetooth', 'Inalámbrico', 'PS/2'] },
        { campo: 'retroiluminacion', label: 'Retroiluminación', type: 'select', options: ['Sí', 'No'] },
      ],
    },
  ],
  'Parlantes': [
    {
      titulo: 'Especificaciones',
      icono: Volume2,
      campos: [
        { campo: 'potencia', label: 'Potencia', placeholder: 'Ej: 20W RMS' },
        { campo: 'canales', label: 'Canales', type: 'select', options: ['2.0', '2.1', '5.1', '7.1'] },
        { campo: 'conectividad_parlantes', label: 'Conectividad', placeholder: 'Ej: Bluetooth, USB, Jack 3.5mm' },
        { campo: 'alimentacion', label: 'Alimentación', type: 'select', options: ['USB', 'Batería', 'Corriente Directa'] },
      ],
    },
  ],
  'Otro': [
    {
      titulo: 'Especificaciones Generales',
      icono: Package,
      campos: [
        { campo: 'tipo_equipo', label: 'Tipo de Equipo', placeholder: 'Describe el tipo de equipo' },
        { campo: 'especificaciones_generales', label: 'Especificaciones', placeholder: 'Detalla las especificaciones técnicas' },
      ],
    },
  ],
};

/* ─── Helpers ─── */

const validateIP = (v: string) => !v || /^(\d{1,3}\.){3}\d{1,3}$/.test(v);
const validateMAC = (v: string) => !v || /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(v);

/* ─── Types ─── */

interface FormState {
  tipo_bien_id: number | null;
  area_id: number | null;
  sede_id: number | null;
  estado: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  codigo_patrimonial: string;
  ubicacion: string;
  observaciones: string;
  especificaciones: { campo: string; valor: string }[];
}

const INITIAL_FORM: FormState = {
  tipo_bien_id: null,
  area_id: null,
  sede_id: null,
  estado: 'operativo',
  marca: '',
  modelo: '',
  numero_serie: '',
  codigo_patrimonial: '',
  ubicacion: '',
  observaciones: '',
  especificaciones: [],
};

const STEPS = [
  { label: 'Tipo de Bien', sub: 'Seleccionar categoría' },
  { label: 'Área Propietaria', sub: 'Asignar responsable' },
  { label: 'Información General', sub: 'Datos del equipo' },
  { label: 'Confirmación', sub: 'Revisar información' },
];

/* ─── Component ─── */

export default function RegistrarBienPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id && !isNaN(Number(id));
  const [step, setStep] = useState(0);
  const [codigoBien, setCodigoBien] = useState('');
  const [tipos, setTipos] = useState<TipoBien[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [_stats, setStats] = useState<BienStats | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [slideDir, setSlideDir] = useState<'next' | 'back'>('next');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    Promise.all([
      getTiposBienes().then(r => setTipos(r.data ?? r)),
      getAreas().then(r => setAreas(r.data?.data ?? r.data ?? r)),
      getSedes({ per_page: 100 }).then(r => setSedes((r.data?.data ?? r.data ?? r).filter((s: any) => s.estado === 'activo'))),
      getBienStats().then(r => setStats(r.data ?? r)),
    ]).catch((err) => {
      if (err?.response?.status !== 403) {
        toast.error(getErrorMessage(err));
      }
    });
  }, []);

  useEffect(() => {
    if (!esEdicion) return;
    getBien(Number(id))
      .then((r) => {
        const b = r.data;
        setCodigoBien(b.codigo || '');
        setForm({
          tipo_bien_id: b.tipo_bien_id ?? null,
          area_id: b.area_id ?? null,
          sede_id: b.sede_id ?? null,
          estado: b.estado || 'operativo',
          marca: b.marca || '',
          modelo: b.modelo || '',
          numero_serie: b.numero_serie || '',
          codigo_patrimonial: b.codigo_patrimonial || '',
          ubicacion: b.ubicacion || '',
          observaciones: b.observaciones || '',
          especificaciones: (b.especificaciones || []).map((e: any) => ({ campo: e.campo, valor: e.valor || '' })),
        });
      })
      .catch((err) => {
        if (err?.response?.status !== 403) toast.error(getErrorMessage(err));
        navigate('/bienes');
      });
  }, [esEdicion, id, navigate]);

  const tipoNombre = useMemo(() => tipos.find(t => t.id === form.tipo_bien_id)?.nombre || '', [tipos, form.tipo_bien_id]);
  const selectedArea = useMemo(() => areas.find((a: any) => a.id === form.area_id), [areas, form.area_id]);
  const selectedSede = useMemo(() => sedes.find((s: any) => s.id === form.sede_id), [sedes, form.sede_id]);
  const secciones = useMemo(() => CAMPOS_POR_TIPO[tipoNombre] || [], [tipoNombre]);

  const filteredAreas = useMemo(() => {
    if (!areaSearch) return areas;
    const q = areaSearch.toLowerCase();
    return areas.filter((a: any) => a.nombre?.toLowerCase().includes(q));
  }, [areas, areaSearch]);

  const getEspecValor = (campo: string) => form.especificaciones.find(e => e.campo === campo)?.valor || '';
  const toggleEspec = (campo: string, valor: string) => {
    const exist = form.especificaciones.find(e => e.campo === campo);
    if (exist) {
      setForm({ ...form, especificaciones: form.especificaciones.map(e => e.campo === campo ? { ...e, valor } : e) });
    } else {
      setForm({ ...form, especificaciones: [...form.especificaciones, { campo, valor }] });
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const goNext = () => {
    if (step === 0 && !form.tipo_bien_id) { toast.error('Selecciona un tipo de bien'); return; }
    if (step === 1 && !form.area_id) { toast.error('Selecciona un área propietaria'); return; }
    if (step === 2) {
      if (!form.marca.trim()) { toast.error('La marca es obligatoria'); return; }
      if (!form.sede_id) { toast.error('La sede es obligatoria'); return; }
      const ip = form.especificaciones.find(e => e.campo === 'direccion_ip')?.valor;
      const mac = form.especificaciones.find(e => e.campo === 'direccion_mac')?.valor;
      if (ip && !validateIP(ip)) { toast.error('Formato de IP inválido (ej: 192.168.1.100)'); return; }
      if (mac && !validateMAC(mac)) { toast.error('Formato de MAC inválido (ej: AA:BB:CC:DD:EE:FF)'); return; }
    }
    setSlideDir('next');
    setFieldErrors(null);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setSlideDir('back');
    setFieldErrors(null);
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors(null);
    try {
      const payload = {
        tipo_bien_id: form.tipo_bien_id,
        area_id: form.area_id,
        sede_id: form.sede_id,
        estado: form.estado,
        marca: form.marca || null,
        modelo: form.modelo || null,
        numero_serie: form.numero_serie || null,
        codigo_patrimonial: form.codigo_patrimonial || null,
        ubicacion: form.ubicacion || null,
        observaciones: form.observaciones || null,
        especificaciones: form.especificaciones.filter(e => e.campo),
      };
      if (esEdicion) {
        await updateBien(Number(id), payload);
        toast.success('Bien actualizado correctamente');
      } else {
        await createBien(payload);
        toast.success('Bien registrado correctamente');
      }
      navigate('/bienes');
    } catch (e) {
      const errors = getValidationErrors(e);
      setFieldErrors(errors);
      if (!errors) toast.error(getErrorMessage(e));
    } finally { setSaving(false); }
  };

  const TipoIcon = form.tipo_bien_id ? (TIPO_ICONOS[tipoNombre] || Package) : Package;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{esEdicion ? 'Editar Bien' : 'Registrar Nuevo Bien'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{esEdicion ? 'Modifica los datos del bien tecnológico.' : 'Sigue los pasos para registrar un nuevo bien tecnológico en el inventario.'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          Oficina de Tecnologías de Información y Comunicaciones
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL: Stepper ─── */}
        <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col p-6">
          <div className="flex-1 space-y-1">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                      isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 my-1 transition-colors duration-300 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-semibold transition-colors ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              );
            })}
            {/* Completed state */}
            <div className="flex items-start gap-3 mt-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                step === STEPS.length ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-300'
              }`}>
                <Check className="w-4 h-4" />
              </div>
              <div className="pt-1">
                <p className={`text-sm font-semibold ${step === STEPS.length ? 'text-green-600' : 'text-gray-300'}`}>{esEdicion ? 'Edición lista' : 'Registro completado'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{esEdicion ? 'Guarda los cambios para continuar' : 'Bien registrado correctamente'}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Progreso del registro</span>
              <span className="text-lg font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Vas en el paso {step + 1} de {STEPS.length}</p>
          </div>
        </div>

        {/* ─── CENTER PANEL: Step Content ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div key={step} className={`animate-${slideDir === 'next' ? 'fadeSlideInRight' : 'fadeSlideInLeft'}`}>

              {/* STEP 0: Tipo de Bien */}
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">1. Selecciona el tipo de bien</h2>
                  <p className="text-gray-500 mb-6">Elige la categoría que mejor describa el activo tecnológico que vas a registrar.</p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {tipos.map(t => {
                      const Icon = TIPO_ICONOS[t.nombre] || Package;
                      const selected = form.tipo_bien_id === t.id;
                      return (
                        <button key={t.id} onClick={() => setForm({ ...form, tipo_bien_id: t.id })}
                          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                            selected
                              ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}>
                          {selected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className={`w-14 h-14 rounded-full ${TIPO_COLORS[t.nombre]?.bg || 'bg-gray-100'} flex items-center justify-center mb-3`}>
                            <Icon className={`w-7 h-7 ${TIPO_COLORS[t.nombre]?.text || 'text-gray-500'}`} />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{t.nombre}</h3>
                          <p className="text-xs text-gray-400 mt-1">{TIPO_DESCRIPCIONES[t.nombre] || ''}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1: Área Propietaria */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">2. Selecciona el área propietaria</h2>
                  <p className="text-gray-500 mb-6">Elige la área que será responsable de este bien.</p>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={areaSearch} onChange={e => setAreaSearch(e.target.value)}
                      placeholder="Buscar área por nombre..."
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAreas.map((a: any, idx: number) => {
                      const selected = form.area_id === a.id;
                      const colorIdx = idx % AREA_COLORS.length;
                      return (
                        <button key={a.id} onClick={() => setForm({ ...form, area_id: a.id })}
                          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                            selected
                              ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}>
                          {selected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AREA_COLORS[colorIdx]} flex items-center justify-center mb-3`}>
                            {(() => { const I = AREA_ICONS[idx % AREA_ICONS.length]; return <I className="w-6 h-6 text-white" />; })()}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{a.nombre}</h3>
                          <p className="text-xs text-gray-400 mt-1">{a.total_bienes ?? a.bienes_count ?? 0} bienes registrados</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Información General + Specs */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">3. Información del bien</h2>
                    <p className="text-gray-500">Completa los datos generales y las especificaciones técnicas del equipo.</p>
                  </div>

                  {/* Información General */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Información General</h3>
                        <p className="text-xs text-gray-400">Datos básicos del equipo</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
                        <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option value="operativo">Operativo</option>
                          <option value="mantenimiento">En Mantenimiento</option>
                          <option value="inactivo">Inactivo</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Marca <span className="text-red-500">*</span></label>
                        <input type="text" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })}
                          placeholder="Ej: Dell, HP, Lenovo..."
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Modelo</label>
                        <input type="text" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })}
                          placeholder="Ej: OptiPlex 7090"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Número de Serie</label>
                        <input type="text" value={form.numero_serie} onChange={e => setForm({ ...form, numero_serie: e.target.value })}
                          placeholder="Opcional"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Código Patrimonial</label>
                        <input type="text" value={form.codigo_patrimonial} onChange={e => setForm({ ...form, codigo_patrimonial: e.target.value })}
                          placeholder="Opcional"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Sede <span className="text-red-500">*</span></label>
                        <select value={form.sede_id ?? ''} onChange={e => setForm({ ...form, sede_id: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option value="" disabled>Seleccionar sede</option>
                          {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Detalle de ubicación</label>
                        <input type="text" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                          placeholder="Ej: Oficina principal - Segundo piso"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Especificaciones Técnicas */}
                  {secciones.map((seccion, idx) => {
                    const SeccionIcon = seccion.icono;
                    return (
                      <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6"
                        style={{ animation: `fadeSlideInRight 0.3s ease ${idx * 0.05}s both` }}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <SeccionIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{seccion.titulo}</h3>
                            <p className="text-xs text-gray-400">Especificaciones técnicas</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {seccion.campos.map(c => {
                            const isIP = c.campo === 'direccion_ip';
                            const isMAC = c.campo === 'direccion_mac';
                            const val = getEspecValor(c.campo);
                            const hasError = (isIP && val && !validateIP(val)) || (isMAC && val && !validateMAC(val));
                            return (
                              <div key={c.campo}>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">{c.label}</label>
                                {c.type === 'select' ? (
                                  <select value={val} onChange={e => toggleEspec(c.campo, e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                                    <option value="">Seleccionar...</option>
                                    {c.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                ) : (
                                  <input type="text" value={val} onChange={e => toggleEspec(c.campo, e.target.value)}
                                    placeholder={c.placeholder}
                                    className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:border-transparent placeholder:text-gray-300 transition-all ${
                                      hasError ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-blue-500'
                                    }`} />
                                )}
                                {hasError && (
                                  <p className="text-[10px] text-red-500 mt-1">
                                    {isIP ? 'Formato: 192.168.1.100' : 'Formato: AA:BB:CC:DD:EE:FF'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Observaciones */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Observaciones</h3>
                        <p className="text-xs text-gray-400">Notas adicionales sobre el bien</p>
                      </div>
                    </div>
                    <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
                      rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-300 transition-all"
                      placeholder="Notas adicionales sobre el bien..." />
                  </div>
                </div>
              )}

              {/* STEP 3: Confirmación */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">4. Confirma la información</h2>
                  <p className="text-gray-500 mb-6">Revisa los datos antes de registrar el bien.</p>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                      <div className={`w-14 h-14 rounded-full ${TIPO_COLORS[tipoNombre]?.bg || 'bg-gray-100'} flex items-center justify-center`}>
                        <TipoIcon className={`w-7 h-7 ${TIPO_COLORS[tipoNombre]?.text || 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{tipoNombre}</h3>
                        <p className="text-sm text-gray-500">{form.marca} {form.modelo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Área</p>
                        <p className="font-medium text-gray-800">{selectedArea?.nombre || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          form.estado === 'operativo' ? 'bg-green-100 text-green-700' :
                          form.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                          form.estado === 'inactivo' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{form.estado === 'operativo' ? 'Operativo' : form.estado === 'mantenimiento' ? 'En Mantenimiento' : form.estado === 'inactivo' ? 'Inactivo' : 'Baja'}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Marca</p>
                        <p className="font-medium text-gray-800">{form.marca || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Modelo</p>
                        <p className="font-medium text-gray-800">{form.modelo || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Número de Serie</p>
                        <p className="font-medium text-gray-800">{form.numero_serie || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Código Patrimonial</p>
                        <p className="font-medium text-gray-800">{form.codigo_patrimonial || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Sede</p>
                        <p className="font-medium text-gray-800">{selectedSede?.nombre || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Detalle de ubicación</p>
                        <p className="font-medium text-gray-800">{form.ubicacion || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Responsable</p>
                        <p className="font-medium text-gray-800">Por asignar</p>
                      </div>
                    </div>

                    {form.especificaciones.filter(e => e.valor).length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Especificaciones</h4>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                          {form.especificaciones.filter(e => e.valor).map(e => (
                            <div key={e.campo} className="flex justify-between">
                              <span className="text-gray-500 capitalize">{e.campo.replace(/_/g, ' ')}</span>
                              <span className="font-medium text-gray-800">{e.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.observaciones && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Observaciones</h4>
                        <p className="text-sm text-gray-600">{form.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation errors summary */}
          {fieldErrors && Object.keys(fieldErrors).length > 0 && (
            <div className="mx-8 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700 mb-1">Revisa los siguientes datos:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {Array.from(new Set(Object.values(fieldErrors))).map((msg, i) => (
                  <li key={i} className="text-sm text-red-600">{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom navigation */}
          <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
            <button onClick={goBack} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            <button onClick={() => navigate('/bienes')}
              className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-all">
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {esEdicion ? 'Guardar Cambios' : 'Registrar Bien'}
              </button>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: Preview ─── */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700">Vista previa del bien</h3>
          </div>

          {/* Device image placeholder */}
          <div className={`w-full aspect-[4/3] rounded-2xl mb-5 flex items-center justify-center transition-all duration-300 ${
            form.tipo_bien_id ? `${TIPO_COLORS[tipoNombre]?.bg || 'bg-gray-100'}` : 'bg-gray-100'
          }`}>
            <TipoIcon className={`w-16 h-16 transition-all duration-300 ${form.tipo_bien_id ? TIPO_COLORS[tipoNombre]?.text || 'text-gray-500' : 'text-gray-300'}`} />
          </div>

          <div className="space-y-4 text-sm flex-1">
            {/* Tipo */}
            <div>
              <p className="text-xs text-gray-400">Tipo de bien</p>
              <p className={`font-semibold ${form.tipo_bien_id ? 'text-gray-900' : 'text-gray-300'}`}>
                {tipoNombre || 'Sin seleccionar'}
              </p>
            </div>

            {/* Marca + Modelo */}
            {(form.marca || form.modelo) && (
              <div>
                <p className="text-xs text-gray-400">Modelo</p>
                <p className="font-semibold text-gray-900">{form.marca} {form.modelo}</p>
              </div>
            )}

            {/* Estado */}
            <div>
              <p className="text-xs text-gray-400">Estado</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                form.estado === 'operativo' ? 'bg-green-100 text-green-700' :
                form.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                form.estado === 'inactivo' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {form.estado === 'operativo' ? 'Operativo' : form.estado === 'mantenimiento' ? 'En Mantenimiento' : form.estado === 'inactivo' ? 'Inactivo' : 'Baja'}
              </span>
            </div>

            {/* Área */}
            {selectedArea && (
              <div>
                <p className="text-xs text-gray-400">Área seleccionada</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs leading-tight">{selectedArea.nombre}</p>
                    <p className="text-[10px] text-blue-600">{selectedArea.siglas || selectedArea.codigo || ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sede */}
            {selectedSede && (
              <div>
                <p className="text-xs text-gray-400">Sede</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-medium text-gray-800 text-xs">{selectedSede.nombre}{form.ubicacion ? ` - ${form.ubicacion}` : ''}</p>
                </div>
              </div>
            )}

            {/* Código interno */}
            <div>
              <p className="text-xs text-gray-400">Código interno</p>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 text-xs">{esEdicion && codigoBien ? codigoBien : 'Se generará automáticamente'}</p>
                </div>
              </div>
            </div>

            {/* Responsable */}
            <div>
              <p className="text-xs text-gray-400">Responsable</p>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="font-medium text-gray-400 text-xs">Por asignar</p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600">La información se irá completando conforme avances en el registro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
