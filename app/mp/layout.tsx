export default function MPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)]">
      {/* Sidebar removed as navigation is now handled globally in GlobalHeader */}
      {children}
    </div>
  );
}
