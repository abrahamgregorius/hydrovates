import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/login')
      } else {
        setUser(data.user)
      }
    })
  }, [navigate])

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020817' }}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Hydrovates Dashboard</h1>
        <p className="text-white/40 text-sm mb-6">Welcome, {user.email}</p>
        <button
          onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
          className="text-[13px] font-semibold text-[#020817] py-2 px-3 rounded-lg"
          style={{ background: '#00d4ff' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
