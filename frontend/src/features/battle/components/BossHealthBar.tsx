import { getStage } from '../../../shared/constants/stages';

type BossHealthBarProps = {
  hp: number;
  maxHp: number;
  stage: number;
};

export default function BossHealthBar({ hp, maxHp, stage }: BossHealthBarProps) {
  const percent = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0;
  const enemyName = getStage(stage).name;

  return (
    <div className="bg-black p-1 rounded-lg w-full max-w-[clamp(220px,82vw,760px)] md:max-w-[clamp(320px,42vw,760px)] shadow-2xl">
      <div className="h-[clamp(1.75rem,3.5vh,3.5rem)] md:h-[clamp(2.25rem,4vh,3.5rem)] relative rounded overflow-hidden bg-red-900/50 border border-red-500/30">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
        {/* Changed to containerType: "size" to track height as well as width */}
        <div
          className="absolute inset-0 px-2 flex items-center justify-center overflow-hidden"
          style={{ containerType: 'size' }}
        >
          {/* text-[min(8cqi,75cqh)] ensures the text maxes out at 75% of the bar's height or 8% of its width, never overflowing */}
          <span className="text-white font-bold tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap tabular-nums text-[min(8cqi,75cqh)]">
            {enemyName} {Math.max(0, hp)}/{maxHp}
          </span>
        </div>
      </div>
    </div>
  );
}
