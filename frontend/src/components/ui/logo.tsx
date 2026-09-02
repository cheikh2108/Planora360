export function Logo({ variant = 'dark', className = 'h-16 w-auto' }: { variant?: 'dark' | 'light'; className?: string }) {
  const textColor = variant === 'dark' ? '#FFFFFF' : '#1E3A5F';

  return (
    <svg className={className} viewBox="0 0 720 168" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap'); text { font-family: 'Montserrat', Arial, sans-serif; }`}
      </style>

      {/* Cercle doré */}
      <circle cx="84" cy="84" r="58" fill="none" stroke="#C5A572" strokeWidth="2.5"/>

      {/* Point doré */}
      <circle cx="104" cy="84" r="11" fill="#C5A572"/>

      {/* Lettre P */}
      <path d="M 66 50 L 66 118 M 66 50 L 94 50 C 104 50 110 56 110 66 C 110 76 104 82 94 82 L 66 82"
            stroke={textColor} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* PLANORA */}
      <text x="178" y="106" fontSize="70" fontWeight="700" fill={textColor} letterSpacing="-2">PLANORA</text>

      {/* 360 */}
      <text x="605" y="106" fontSize="70" fontWeight="700" fill="#C5A572" letterSpacing="-2">360</text>

      {/* Sous-titre */}
      <text x="178" y="138" fontSize="20" fontWeight="400" fill={textColor} opacity={variant === 'dark' ? '0.9' : '0.8'}>
        Planifier - Suivre - Performer
      </text>
    </svg>
  );
}

export function LogoIcon({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="84" cy="84" r="58" fill="none" stroke="#C5A572" strokeWidth="2.5"/>
      <circle cx="104" cy="84" r="11" fill="#C5A572"/>
      <path d="M 66 50 L 66 118 M 66 50 L 94 50 C 104 50 110 56 110 66 C 110 76 104 82 94 82 L 66 82"
            stroke="#1E3A5F" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
