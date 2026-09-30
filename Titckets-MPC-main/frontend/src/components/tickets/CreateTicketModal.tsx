import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Monitor, Printer, Wifi, Mail, Shield, Layout, Phone, MoreHorizontal,
  Upload, X, FileImage, ArrowLeft, Check, Loader2, ChevronRight, Building2,
} from 'lucide-react'
import Modal from '../ui/Modal'
import { CATEGORIAS_NUEVAS, type CategoriaIncidencia } from '../../utils/constants'
import { getAreas } from '../../api/areaApi'
import toast from '../../utils/notify'
import { getErrorMessage, getValidationErrors } from '../../api/axios'

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Monitor, Printer, Wifi, Mail, Shield, Layout, Phone, MoreHorizontal,
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; selectedBg: string; selectedBorder: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-600',   selectedBg: 'bg-blue-100',   selectedBorder: 'border-blue-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', selectedBg: 'bg-purple-100', selectedBorder: 'border-purple-500' },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-600',   selectedBg: 'bg-cyan-100',   selectedBorder: 'border-cyan-500' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-600',  selectedBg: 'bg-amber-100',  selectedBorder: 'border-amber-500' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    selectedBg: 'bg-red-100',    selectedBorder: 'border-red-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', selectedBg: 'bg-indigo-100', selectedBorder: 'border-indigo-500' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-600',   selectedBg: 'bg-teal-100',   selectedBorder: 'border-teal-500' },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-600',   selectedBg: 'bg-gray-100',   selectedBorder: 'border-gray-500' },
}

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { titulo: string; descripcion: string; categoria: string; incidencia: string; area_id?: number; files: File[] }) => Promise<void>
  canSelectArea?: boolean
  isAreaUser?: boolean
  userAreaId?: number
}

export default function CreateTicketModal({ isOpen, onClose, onSubmit, canSelectArea, isAreaUser, userAreaId }: CreateTicketModalProps) {
  const [step, setStep] = useState(1)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaIncidencia | null>(null)
  const [selectedIncidencia, setSelectedIncidencia] = useState('')
  const [customIncidencia, setCustomIncidencia] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [areas, setAreas] = useState<any[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)
  const [areasLoading, setAreasLoading] = useState(false)
  const [areasSearch, setAreasSearch] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  const needsAreaSelection = canSelectArea

  useEffect(() => {
    if (isOpen && needsAreaSelection) {
      setAreasLoading(true)
      getAreas({ per_page: 200 })
        .then(res => setAreas(res.data?.data || res.data || []))
        .catch((err) => {
          if (err?.response?.status !== 403) {
            toast.error(getErrorMessage(err))
          }
        })
        .finally(() => setAreasLoading(false))
    }
  }, [isOpen, needsAreaSelection])

  useEffect(() => {
    if (isOpen && isAreaUser && userAreaId) {
      setSelectedAreaId(userAreaId)
    }
  }, [isOpen, isAreaUser, userAreaId])

  const filteredAreas = areas.filter((a: any) =>
    a.nombre?.toLowerCase().includes(areasSearch.toLowerCase())
  )

  const reset = () => {
    setStep(1)
    setSelectedCategoria(null)
    setSelectedIncidencia('')
    setCustomIncidencia('')
    setDescripcion('')
    setFiles([])
    setSubmitting(false)
    setSelectedAreaId(isAreaUser && userAreaId ? userAreaId : null)
    setAreasSearch('')
    setFieldErrors(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSelectCategoria = (cat: CategoriaIncidencia) => {
    setSelectedCategoria(cat)
    setSelectedIncidencia('')
    setCustomIncidencia('')
    setStep(2)
  }

  const handleSelectIncidencia = (incidencia: string) => {
    setSelectedIncidencia(incidencia)
    if (incidencia !== 'Otro') {
      setCustomIncidencia('')
    }
  }

  const handleNext = () => {
    if (needsAreaSelection && step === 2 && selectedAreaId) {
      setStep(3)
    } else if (!needsAreaSelection && step === 2 && selectedIncidencia) {
      setStep(3)
    } else if (needsAreaSelection && step === 3 && selectedIncidencia) {
      setStep(4)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const permitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const valid: File[] = []
    let rechazados = 0
    arr.forEach(f => {
      if (f.size > 5 * 1024 * 1024 || !permitidos.includes(f.type)) {
        rechazados++
        return
      }
      valid.push(f)
    })
    if (rechazados > 0) {
      toast.error('Archivos descartados: solo imágenes JPG, PNG o WEBP hasta 5MB')
    }
    setFiles(prev => [...prev, ...valid].slice(0, 5))
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const getIncidenciaFinal = () => {
    if (selectedIncidencia === 'Otro' && customIncidencia.trim()) {
      return customIncidencia.trim()
    }
    return selectedIncidencia
  }

  const canSubmit = () => {
    const inc = getIncidenciaFinal()
    if (needsAreaSelection) {
      return selectedCategoria && inc && descripcion.trim() && selectedAreaId
    }
    return selectedCategoria && inc && descripcion.trim()
  }

  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return
    const incidencia = getIncidenciaFinal()!
    const titulo = `${selectedCategoria!.label} - ${incidencia}`
    setSubmitting(true)
    setFieldErrors(null)
    try {
      await onSubmit({
        titulo,
        descripcion: descripcion.trim(),
        categoria: selectedCategoria!.id,
        incidencia,
        area_id: selectedAreaId || undefined,
        files,
      })
      reset()
    } catch (err) {
      setFieldErrors(getValidationErrors(err))
      setSubmitting(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const stepLabels = needsAreaSelection
    ? ['Categoría', 'Área', 'Incidencia', 'Detalle']
    : ['Categoría', 'Incidencia', 'Detalle']

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Ticket"
      subtitle="Registra una nueva incidencia o solicitud"
      size="lg"
      hideHeader
    >
      <div className="space-y-6">
        {/* Header with steps */}
        <div className="flex items-center gap-4">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Crear Ticket</h2>
            <p className="text-sm text-gray-500">Registra una nueva incidencia o solicitud</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const isActive = needsAreaSelection ? step === stepNum : (step === stepNum || (step === 3 && stepNum === 4))
            const isCompleted = needsAreaSelection ? step > stepNum : (step > stepNum || (step === 3 && stepNum < 4))
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isActive
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-current/10">
                      {stepNum}
                    </span>
                  )}
                  {label}
                </div>
                {i < stepLabels.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-gray-300" />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">¿Con qué necesita ayuda?</h3>
              <p className="text-sm text-gray-500">Seleccione el tipo de problema</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIAS_NUEVAS.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || Monitor
                const colors = COLOR_MAP[cat.color] || COLOR_MAP.gray
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategoria(cat)}
                    className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                      selectedCategoria?.id === cat.id
                        ? `${colors.selectedBg} ${colors.selectedBorder}`
                        : `${colors.bg} ${colors.border} hover:${colors.selectedBg}`
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Area Selection (for Tecnico/Admin) */}
        {needsAreaSelection && step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Seleccione el Área</h3>
                <p className="text-sm text-gray-500">Área para la cual se registra la incidencia</p>
              </div>
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={areasSearch}
                onChange={(e) => setAreasSearch(e.target.value)}
                placeholder="Buscar área..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2">
              {areasLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Cargando áreas...
                </div>
              ) : filteredAreas.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No se encontraron áreas
                </div>
              ) : (
                filteredAreas.map((area: any) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      selectedAreaId === area.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedAreaId === area.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAreaId === area.id && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700">{area.nombre}</span>
                      {area.siglas && (
                        <span className="ml-2 text-xs text-gray-400">({area.siglas})</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {fieldErrors?.area_id && (
              <p className="text-sm text-red-600">{fieldErrors.area_id}</p>
            )}

            {selectedAreaId && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 (Area User) or Step 3 (Tecnico/Admin): Incidence */}
        {((!needsAreaSelection && step === 2) || (needsAreaSelection && step === 3)) && selectedCategoria && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">¿Qué está ocurriendo?</h3>
                <p className="text-sm text-gray-500">{selectedCategoria.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCategoria.incidencias.map((inc) => (
                <button
                  key={inc}
                  onClick={() => handleSelectIncidencia(inc)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                    selectedIncidencia === inc
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedIncidencia === inc
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedIncidencia === inc && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{inc}</span>
                </button>
              ))}
            </div>

            {selectedIncidencia === 'Otro' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customIncidencia}
                  onChange={(e) => setCustomIncidencia(e.target.value)}
                  placeholder="Describa el problema..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  autoFocus
                />
              </div>
            )}

            {selectedIncidencia && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 (Area User) or Step 4 (Tecnico/Admin): Description + Files */}
        {((!needsAreaSelection && step === 3) || (needsAreaSelection && step === 4)) && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Detalle del problema</h3>
                <p className="text-sm text-gray-500">Describa brevemente la incidencia</p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <span className="text-xs text-gray-500">Resumen:</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedCategoria?.label} — {getIncidenciaFinal()}
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); if (fieldErrors) setFieldErrors(null); }}
                rows={4}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors?.descripcion ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
                placeholder="Describa brevemente el problema o agregue información que ayude al técnico a comprender la incidencia."
              />
              {fieldErrors?.descripcion && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.descripcion}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adjuntar evidencia <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                />
                <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 font-medium">
                  Arrastre archivos aquí o haga clic para seleccionarlos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WEBP — Máximo 5 MB por archivo (hasta 5 archivos)
                </p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <FileImage className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Crear Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
