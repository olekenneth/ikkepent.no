'use client';

interface AdSlotProps {
  slot: string;
  className?: string;
}

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  return (
    <div
      data-ad-slot={slot}
      className={`ad-slot hidden ${className}`}
      aria-hidden="true"
    />
  );
}
