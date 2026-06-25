const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function intervalsToDetections(intervals = []) {
  return intervals.map((item) => ({
    brand_name: item.brand_name,
    start_time: item.start_time,
    end_time: item.end_time,
    confidence: item.avg_confidence ?? item.confidence ?? 0,
    crop_path: item.crop_path ?? null,
    bounding_box: item.bounding_box ?? null,
  }))
}

export function normalizeVideoResponse(data) {
  const detections =
    data.detections?.length > 0
      ? data.detections
      : intervalsToDetections(data.intervals)

  return {
    video_id: data.video_id,
    video_name: data.video_name ?? data.filename,
    duration_seconds: data.duration_seconds,
    frames_analyzed: data.frames_analyzed,
    processing_time_s: data.processing_time_s,
    total_brands: data.total_brands ?? detections.length,
    detections,
    frame_detections: data.frame_detections ?? [],
  }
}

async function parseError(response) {
  const error = await response.json().catch(() => ({}))
  const detail = error.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  return `Error ${response.status}: ${response.statusText}`
}

export async function checkApiHealth() {
  const response = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) })
  if (!response.ok) throw new Error('API no disponible')
  return response.json()
}

export async function uploadVideo(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/detect/video`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error(await parseError(response))
  return normalizeVideoResponse(await response.json())
}

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/detect/image`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}

export async function getVideoReport(videoId) {
  const response = await fetch(`${API_URL}/videos/${videoId}/report`)

  if (!response.ok) throw new Error(await parseError(response))
  return normalizeVideoResponse(await response.json())
}

export function getCropImageUrl(cropPath) {
  if (!cropPath) return null
  if (cropPath.startsWith('http')) return cropPath
  const path = cropPath.startsWith('/') ? cropPath.slice(1) : cropPath
  return `${API_URL}/${path}`
}

const HISTORY_KEY = 'logoDetectionHistory'

export function saveToHistory(videoData) {
  const history = getHistory()
  const { frame_detections: _frames, ...rest } = videoData
  const entry = {
    ...rest,
    timestamp: videoData.timestamp ?? Date.now(),
  }

  const idx = history.findIndex((v) => v.video_id === entry.video_id)
  if (idx >= 0) {
    history[idx] = { ...history[idx], ...entry }
  } else {
    history.unshift(entry)
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
}

export function getHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getHistoryItem(videoId) {
  return getHistory().find((v) => String(v.video_id) === String(videoId))
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export { API_URL }
