const BACKEND = 'https://study-battle-backend.onrender.com'

export type GeneratedQuestion = {
  text: string
  options: string[]
  correct_idx: number
  justification: string
}

export async function generateQuestions(text: string, max = 8): Promise<GeneratedQuestion[]> {
  const res = await fetch(`${BACKEND}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, max_questions: max }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'No se pudieron generar las preguntas.')
  }
  const data = await res.json()
  return data.questions as GeneratedQuestion[]
}