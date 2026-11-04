export type Row = {
  nickname: string; aciertos: number; total: number; extras: number
  puntaje: number; multPromedio: number; vecesX3: number; esTop3: boolean
}

export function exportarResultados(rows: Row[], nombre = 'study-battle-resultados.csv') {
  const header = [
    'nickname','aciertos','total_preguntas','nota_conocimiento',
    'extras_participacion','nota_sugerida','puntaje_final',
    'multiplicador_promedio','veces_x3','es_top3'
  ]
  const body = rows.map(r => {
    const notaConoc = Math.round((r.aciertos / r.total) * 20)
    const notaSug = r.esTop3 ? Math.min(20, notaConoc + r.extras) : ''
    return [
      r.nickname, r.aciertos, r.total, notaConoc, r.extras, notaSug,
      r.puntaje, r.multPromedio.toFixed(2), r.vecesX3, r.esTop3 ? 'SI' : 'NO'
    ].join(',')
  })
  const csv = [header.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  URL.revokeObjectURL(url)
}