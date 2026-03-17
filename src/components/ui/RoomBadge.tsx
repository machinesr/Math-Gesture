interface RoomBadgeProps {
  pin: string;
}

// room badge for username step, showing the room PIN with a green "live" dot.

export default function RoomBadge({ pin }: RoomBadgeProps) {
  return (
    <div className="mg-badge">
      <span className="mg-badge__dot" />
      Room {pin}
    </div>
  );
}
