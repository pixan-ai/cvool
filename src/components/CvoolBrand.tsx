export function CvoolBrand() {
  return (
    <>
      <span className="text-ink-900">cv</span>
      <span className="text-accent">ool</span>
    </>
  );
}

export function CvoolText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(CVool|cvool|\{cvool\})/gi);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^(cvool|\{cvool\})$/i.test(part) ? <CvoolBrand key={i} /> : <span key={i}>{part}</span>
      )}
    </span>
  );
}
