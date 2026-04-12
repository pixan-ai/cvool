export function FaviconIcon({ size = "w-5 h-5" }: { size?: string }) {
  return (
    <svg className={`${size} shrink-0`} viewBox="0 0 16 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" fill="#99bbee" />
      <circle cx="8" cy="20" r="6.5" fill="#4466cc" />
    </svg>
  );
}
