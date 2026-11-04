export const PUNTOS = {
  1: { acierto: +100, fallo: -50  },
  2: { acierto: +200, fallo: -100 },
  3: { acierto: +300, fallo: -200 },
} as const

export type Multiplicador = 1 | 2 | 3

export function calcularDelta(mult: Multiplicador, correcta: boolean): number {
  return correcta ? PUNTOS[mult].acierto : PUNTOS[mult].fallo
}

export function calcularNota(aciertos: number, total: number): number {
  if (total === 0) return 0
  return Math.round((aciertos / total) * 20)
}

export function calcularExtras(o: {
  participo: boolean
  esTop1: boolean
  esTop3: boolean
  ganoAudacia: boolean
  todasCorrectas: boolean
}): number {
  let e = 0
  if (o.participo) e += 1
  if (o.esTop3 && !o.esTop1) e += 1
  if (o.esTop1) e += 2
  if (o.ganoAudacia) e += 1
  if (o.todasCorrectas) e += 1
  return Math.min(e, 4)
}