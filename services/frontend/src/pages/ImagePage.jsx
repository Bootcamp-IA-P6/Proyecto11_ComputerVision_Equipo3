import { useState, useCallback, useRef } from 'react'
import { ImageIcon, Loader2, AlertCircle, Target } from 'lucide-react'
import { uploadImage } from '../services/api'
import ImagePreview from '../components/ImagePreview'

export default function ImagePage() {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback((selected) => {
    if (!selected?.type.startsWith('image/')) {
      setError('Selecciona una imagen válida (JPG, PNG, WebP)')
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError(null)
  }, [])

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await uploadImage(file)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Detección en imagen
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Analiza una imagen estática y visualiza los logos detectados con sus bounding boxes.
        </p>
      </div>

      <div className="card-minimal p-6 space-y-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="upload-zone w-full py-16 flex flex-col items-center gap-3"
          >
            <ImageIcon className="w-10 h-10 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Seleccionar imagen
            </span>
          </button>
        ) : (
          <div className="space-y-4">
            {result?.detections?.length > 0 ? (
              <ImagePreview imageUrl={preview} detections={result.detections} />
            ) : (
              <img src={preview} alt="Vista previa" className="rounded-2xl w-full max-h-[420px] object-contain" />
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary text-sm">
                Cambiar imagen
              </button>
              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                {loading ? 'Analizando...' : 'Detectar logos'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="card-minimal p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            {result.total} detección{result.total !== 1 ? 'es' : ''} en {result.filename}
          </h2>
          {result.detections?.length === 0 ? (
            <p className="text-sm text-slate-500">No se detectaron logos en esta imagen.</p>
          ) : (
            <ul className="space-y-2">
              {result.detections.map((det, i) => (
                <li
                  key={`${det.brand_name}-${i}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{det.brand_name}</span>
                  <span className="text-brand-green font-semibold tabular-nums">
                    {(det.confidence * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
