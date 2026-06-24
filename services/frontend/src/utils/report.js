export function processDetections(detections) {
  const brandMap = {}

  detections.forEach((det) => {
    const brand = det.brand_name
    const duration = (det.end_time || 0) - (det.start_time || 0)

    if (!brandMap[brand]) {
      brandMap[brand] = {
        brand_name: brand,
        total_time: 0,
        detections: [],
        confidences: [],
        crop_path: det.crop_path,
      }
    }

    brandMap[brand].total_time += duration
    brandMap[brand].detections.push(det)
    brandMap[brand].confidences.push(det.confidence || 0)
  })

  const maxEndTime = Math.max(...detections.map((d) => d.end_time || 0), 0)

  return Object.values(brandMap).map((brand) => ({
    ...brand,
    percentage: maxEndTime > 0 ? (brand.total_time / maxEndTime) * 100 : 0,
    avg_confidence:
      brand.confidences.reduce((a, b) => a + b, 0) / brand.confidences.length,
    detections_count: brand.detections.length,
  }))
}

export function calculateTotalDuration(detections) {
  if (!detections?.length) return 0
  return Math.max(...detections.map((d) => d.end_time || 0))
}

export function buildReport(videoId, videoName, detections) {
  const brands = processDetections(detections || [])
  return {
    video_id: videoId,
    video_name: videoName,
    brands,
    detections: detections || [],
    total_duration: calculateTotalDuration(detections),
    avg_confidence:
      detections?.length > 0
        ? detections.reduce((a, d) => a + (d.confidence || 0), 0) / detections.length
        : 0,
  }
}
