import { useEffect, useState } from "react"

type DamageEntry = {
  id: number
  text: string
}

export default function DamageLog({ entries }: { entries: DamageEntry[] }) {

  return (
    <div className="absolute top-6 left-6 flex flex-col gap-2">
      {entries.map(e => (
        <div
          key={e.id}
          className="bg-black/60 text-white px-24 py-2 rounded-lg text-3xl animate-fade"
        >
          {e.text}
        </div>
      ))}
    </div>
  )
}