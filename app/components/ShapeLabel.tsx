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
        border border-[var(--glass-border)]
        bg-[var(--glass-bg)]
        backdrop-blur-xl
        text-[var(--text-tertiary)] text-[12px]
        hover:text-[var(--accent)] hover:border-[rgba(var(--accent-rgb),0.3)]
        transition-all duration-500
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
