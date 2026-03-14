type PlayerCharacterProps = {
    name: string
    sprite: string
    className?: string
  }
  
  export default function PlayerCharacter({
    name,
    sprite,
    className = ""
  }: PlayerCharacterProps) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <p className="text-white font-semibold text-lg mb-1 drop-shadow">
          {name}
        </p>
  
        <img
          src={sprite}
          alt={name}
          className="w-24 select-none pointer-events-none"
        />
      </div>
    )
  }