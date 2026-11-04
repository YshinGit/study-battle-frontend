import { useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo.png'

export function Logo({ size = 56 }: { size?: number }) {
  const navigate = useNavigate()
  return (
    <img
      src={logo}
      alt="Study Battle"
      width={size}
      height={size}
      className="cursor-pointer transition hover:scale-105 drop-shadow-[0_0_18px_rgba(191,168,98,0.35)]"
      onClick={() => navigate('/')}
    />
  )
}