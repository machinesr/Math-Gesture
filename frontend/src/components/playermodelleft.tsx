type PlayerCharacterProps = {
  name: string
  sprite: string
}

export default function PlayerCharacter({ name, sprite }: PlayerCharacterProps) {

  return (
    <div className="flex flex-col items-center">

      <p className="text-white font-semibold text-lg drop-shadow mb-2">
        {name}
      </p>

      <img
        src={sprite}
        alt={name}
        className="w-32 select-none pointer-events-none"
      />

    </div>
  )
}