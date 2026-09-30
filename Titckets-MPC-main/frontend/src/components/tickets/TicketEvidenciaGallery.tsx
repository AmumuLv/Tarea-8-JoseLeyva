import { useState, useRef } from 'react'
import { Camera, Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadEvidencia, deleteEvidencia } from '../../api/ticketApi'
import { formatFileSize } from '../../utils/formatters'
import toast from '../../utils/notify'
import { getErrorMessage } from '../../api/axios'
import Modal from '../ui/Modal'

interface Evidencia {
  id: number
  nombre_original: string
  ruta: string
  tamano?: number
  descripcion?: string
  created_at: string
  usuario?: { nombres?: string; apellidos?: string; name?: string }
}

interface TicketEvidenciaGalleryProps {
  ticketId: number
  evidencias: Evidencia[]
  canUpload?: boolean
  canDelete?: boolean
  onRefresh: () => void
}

export default function TicketEvidenciaGallery({ ticketId, evidencias, canUpload = true, canDelete = true, onRefresh }: TicketEvidenciaGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, JPEG, PNG y WEBP')
      return
    }

    if (file.size > maxSize) {
      toast.error('El archivo no puede superar 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('evidencia', file)

    try {
      await uploadEvidencia(ticketId, formData)
      toast.success('Evidencia subida correctamente')
      onRefresh()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, JPEG, PNG y WEBP')
      return
    }

    if (file.size > maxSize) {
      toast.error('El archivo no puede superar 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('evidencia', file)

    try {
      await uploadEvidencia(ticketId, formData)
      toast.success('Evidencia subida correctamente')
      onRefresh()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await deleteEvidencia(ticketId, id)
      toast.success('Evidencia eliminada')
      onRefresh()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setDeleting(null)
    }
  }

  const imageUrl = (ruta: string) => `/storage/${ruta}`

  return (
    <div>
      {canUpload && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Arrastra una imagen o haz clic para seleccionar
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                JPG, JPEG, PNG, WEBP. Máx. 5MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {evidencias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Camera className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No hay evidencias fotográficas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {evidencias.map((ev) => (
            <div key={ev.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={imageUrl(ev.ruta)}
                  alt={ev.nombre_original}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  onClick={() => setPreviewImage(imageUrl(ev.ruta))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewImage(imageUrl(ev.ruta)) }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ev.id) }}
                      disabled={deleting === ev.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting === ev.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{ev.nombre_original}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                  <span>{ev.tamano ? formatFileSize(ev.tamano) : ''}</span>
                  <span>{ev.usuario?.nombres ? `${ev.usuario.nombres} ${ev.usuario.apellidos}` : ev.usuario?.name}</span>
                </div>
                {ev.descripcion && (
                  <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 truncate italic">{ev.descripcion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Vista previa" size="xl" hideHeader>
        <div className="flex items-center justify-center">
          {previewImage && <img src={previewImage} alt="Evidencia" className="max-h-[70vh] w-full rounded-xl object-contain" />}
        </div>
      </Modal>
    </div>
  )
}
