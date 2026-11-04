const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generarCodigoSala(len = 6): string {
  let out = ''
  for (let i = 0; i < len; i++) out += ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  return out
}

export const AVATARES = ['◆','●','▲','■','★','✦','✧','◈','◉','❖']
export function avatarAleatorio() {
  return AVATARES[Math.floor(Math.random() * AVATARES.length)]
}

export function uuid(): string {
  return crypto.randomUUID()
}