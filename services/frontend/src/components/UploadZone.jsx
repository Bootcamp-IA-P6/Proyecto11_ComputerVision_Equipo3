import { useCallback, useState } from 'react'
import { Upload, FileVideo, X } from 'lucide-react'

export default function UploadZone({ file, onFileSelect, onFileRemove, error }) {
  const [isDragging, setIsDragging] = useState(false)

  const validateAndSelect = useCallback(
    (f) => {
      if (!f.name.toLowerCase().endsWith('.mp4')) {
        onFileSelect(null, 'Solo se aceptan archivos .mp4')
        return
      }
      if (f.size > 500 * 1024 * 1024) {
        onFileSelect(null, 'El archivo no puede superar los 500MB')
        return
      }
      onFileSelect(f, null)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) validateAndSelect(droppedFile)
    },
    [validateAndSelect]
  )

  const handleFileInput = useCallback(
    (e) => {
      const selectedFile = e.target.files[0]
      if (selectedFile) validateAndSelect(selectedFile)
    },
    [validateAndSelect]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className="w-full">
      {!file ? (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`upload-zone flex flex-col items-center justify-center py-14 px-6 cursor-pointer ${
            isDragging ? 'upload-zone-active' : ''
          }`}
        >
          <input
            type="file"
            accept=".mp4,video/mp4"
            onChange={handleFileInput}
            className="hidden"
          />
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${
              isDragging
                ? 'bg-brand-green/20 scale-110'
                : 'bg-brand-green/10'
            }`}
          >
            <Upload
              className={`w-8 h-8 transition-colors ${
                isDragging ? 'text-brand-green' : 'text-slate-400'
              }`}
            />
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu vídeo aquí'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            o haz clic para seleccionar un archivo
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/30 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
            <FileVideo className="w-3.5 h-3.5" />
            <span>Solo .mp4 · máx. 500MB</span>
          </div>
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 dark:bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-brand-green/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileVideo className="w-6 h-6 text-brand-green" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-sm text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · Listo para analizar
              </p>
            </div>
          </div>
          <button
            onClick={onFileRemove}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
            title="Eliminar archivo"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  )
}
