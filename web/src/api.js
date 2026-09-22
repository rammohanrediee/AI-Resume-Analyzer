const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch (error) {
    throw new ApiError('The analysis service is unavailable. Start the backend and try again.', { cause: error })
  }

  if (!response.ok) {
    let message = 'The request could not be completed.'
    try {
      const payload = await response.json()
      message = payload.error?.message || message
    } catch {
      // Keep a stable client-safe message when an intermediary returns non-JSON.
    }
    throw new ApiError(message)
  }
  return response
}

export async function extractResume(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await request('/api/v1/documents/extract', {
    method: 'POST',
    body: formData,
  })
  return (await response.json()).data
}

export async function analyzeResume(payload) {
  const response = await request('/api/v1/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return (await response.json()).data
}

export async function downloadReport(payload) {
  const response = await request('/api/v1/reports/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    body: JSON.stringify(payload),
  })
  return response.blob()
}
