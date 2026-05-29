'use client'
// src/components/admin/SignOutButton.tsx
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}
      className="text-xs px-3 py-1.5 rounded-lg font-medium"
      style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
      Sair
    </button>
  )
}
