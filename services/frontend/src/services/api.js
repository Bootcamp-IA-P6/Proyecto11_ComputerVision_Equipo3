/**
 * Servicio de API - Todas las llamadas a la API FastAPI centralizadas aquí
 * 
 * Base URL configurable mediante variable de entorno VITE_API_URL
 * Fallback a localhost:8000 para desarrollo local
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Sube un archivo de vídeo para análisis de detección de logos
 * @param {File} file - Archivo de vídeo .mp4
 * @returns {Promise<Object>} - Respuesta con video_id y detecciones
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/detect/video`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene el informe completo de un vídeo procesado
 * @param {number|string} videoId - ID del vídeo
 * @returns {Promise<Object>} - Informe con detecciones y estadísticas
 */
export async function getVideoReport(videoId) {
  const response = await fetch(`${API_URL}/videos/${videoId}/report`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene la URL completa para una imagen crop
 * @param {string} cropPath - Ruta relativa del crop (ej: "storage/crops/nike_2.50.jpg")
 * @returns {string} - URL completa
 */
export function getCropImageUrl(cropPath) {
  if (!cropPath) return null;
  // Si ya es una URL completa, devolverla tal cual
  if (cropPath.startsWith('http')) return cropPath;
  return `${API_URL}/${cropPath}`;
}

/**
 * Guarda un vídeo en el historial local (localStorage)
 * @param {Object} videoData - Datos del vídeo {video_id, video_name, timestamp, brandCount}
 */
export function saveToHistory(videoData) {
  const history = getHistory();
  // Evitar duplicados
  const exists = history.find(v => v.video_id === videoData.video_id);
  if (exists) return;
  
  history.unshift(videoData);
  // Mantener solo los últimos 50 vídeos
  const trimmed = history.slice(0, 50);
  localStorage.setItem('logoDetectionHistory', JSON.stringify(trimmed));
}

/**
 * Obtiene el historial de vídeos procesados desde localStorage
 * @returns {Array} - Lista de vídeos procesados
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem('logoDetectionHistory');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Limpia todo el historial de vídeos
 */
export function clearHistory() {
  localStorage.removeItem('logoDetectionHistory');
}
