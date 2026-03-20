'use client';

interface ShapeLabelProps {
  shapeName: string;
  onClick: () => void;
}

export default function ShapeLabel({ shapeName, onClick }: ShapeLabelProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-4 right-4 md:bottom-6 md:right-6
        z-10 px-3 py-1.5
        rounded-full
        border border-white/[0.08]
        bg-white/[0.03]
        backdrop-blur-xl
        text-white/40 text-[12px]
        hover:text-[#c0d8f0] hover:border-[#c0d8f0]/30
        transition-all duration-300
        cursor-pointer
        capitalize
        animate-panel-in
      "
      style={{ fontFamily: 'var(--font-mono)', animationDelay: '1.2s' }}
      title="Click to morph shape"
    >
      {shapeName}
    </button>
  );
}
