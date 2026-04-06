import { useEffect, useState } from "react"

type DamageEntry = {
  id: number
  text: string
}

export default function DamageLog({ entries }: { entries: DamageEntry[] }) {

  return (
    <div className="absolute top-[clamp(1rem,2vh,2rem)] left-[clamp(1rem,2vw,2rem)] flex flex-col gap-[clamp(0.25rem,0.75vh,0.75rem)]">
      {entries.map(e => (
        <div
          key={e.id}
          className="bg-black/60 text-white px-[clamp(1rem,1.5vw,2rem)] py-[clamp(0.375rem,0.75vh,0.75rem)] rounded-lg text-[clamp(0.875rem,1.25vw,1.5rem)] animate-fade"
        >
          {e.text}
        </div>
      ))}
    </div>
  )
}