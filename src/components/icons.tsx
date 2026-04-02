export function VercelTriangle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 76 65"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

export function VercelLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VercelTriangle className="h-5 w-5" />
      <span className="text-lg font-semibold tracking-tight">Vercel</span>
    </div>
  );
}

export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 3L11 8L6 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 8.667V12.667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.667 14H3.333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.667V5.333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.333 4H7.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 2H14V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.667 9.333L14 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0L9.796 6.204L16 8L9.796 9.796L8 16L6.204 9.796L0 8L6.204 6.204L8 0Z" />
    </svg>
  );
}

export function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M1.5 8h13" />
      <path d="M8 1.5c1.657 2.17 2.5 4.17 2.5 6.5s-.843 4.33-2.5 6.5c-1.657-2.17-2.5-4.17-2.5-6.5s.843-4.33 2.5-6.5z" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V4L8 1z" />
    </svg>
  );
}

export function BuildingIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="5" height="12" rx="1" />
      <rect x="9" y="6" width="5" height="8" rx="1" />
      <path d="M4 5h1M4 7h1M4 9h1M11 9h1M11 11h1" />
    </svg>
  );
}

// Framework icons
export function NextjsIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 180" fill="none">
      <mask
        id="mask0"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="180"
        height="180"
      >
        <circle cx="90" cy="90" r="90" fill="white" />
      </mask>
      <g mask="url(#mask0)">
        <circle cx="90" cy="90" r="90" fill="black" stroke="white" strokeWidth="6" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#paint0)"
        />
        <rect x="115" y="54" width="12" height="72" fill="url(#paint1)" />
      </g>
      <defs>
        <linearGradient id="paint0" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint1" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SvelteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 98.1 118" fill="none">
      <path
        d="M91.8 15.6C80.9-.5 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.1 1.8 43.8c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.5-4 7.5-4.8 11.8-1.6 8.7.2 17.8 5.2 25.2 10.9 16.1 32.6 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.3-21 1.3-7.3.2-14.8-3.3-21.3 2.4-3.5 4-7.5 4.8-11.8 1.6-8.8-.2-17.8-5.4-25.2z"
        fill="#FF3E00"
      />
      <path
        d="M40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.9.6 3.8 2 5.1 2.2 2.1 5.6 2.6 8.3 1.2l27.5-17.5c1.4-.9 2.3-2.3 2.6-3.9.3-1.6-.1-3.3-1.2-4.5-2.2-2.1-5.6-2.6-8.3-1.2l-10.5 6.7c-6.6 4.2-15.5 3.1-20.8-2.6-3.2-4.4-4.4-9.9-3.5-15.3.9-5.2 4.1-9.8 8.6-12.6l27.5-17.5c6.6-4.2 15.5-3.1 20.8 2.6 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.5 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.9-.6-3.8-2-5.1-2.2-2.1-5.6-2.6-8.3-1.2L24.5 59.3c-1.4.9-2.3 2.3-2.6 3.9-.3 1.6.1 3.3 1.2 4.5 2.2 2.1 5.6 2.6 8.3 1.2l10.5-6.7c6.6-4.2 15.5-3.1 20.8 2.6 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.8-8.6 12.6l-27.5 17.5c-2.3 1.5-5 2.3-7.7 2.5-.5.1-1 .1-1.5.2z"
        fill="white"
      />
    </svg>
  );
}

export function ReactIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="6" fill="#61DAFB" />
      <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61DAFB" strokeWidth="2" fill="none" />
      <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(120 50 50)" />
    </svg>
  );
}

export function NuxtIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 298" fill="none">
      <path d="M227.921 82.074L166.423 0L0 298H99.138L227.921 82.074Z" fill="#00DC82" />
      <path d="M301.455 107.074L400 298H202.91L301.455 107.074Z" fill="#00DC82" opacity="0.6" />
    </svg>
  );
}

export function AstroIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 85 107" fill="none">
      <path
        d="M27.5893 91.1365C22.7555 86.7546 21.3489 77.7851 23.3691 70.5765C27.7565 77.2043 34.5538 80.3598 42.1992 81.4492C54.1681 83.1957 65.6773 81.3037 75.7491 74.4492C76.9138 73.6538 78.0009 72.7478 79.2265 71.7424C80.5781 76.0384 80.5765 80.3085 79.1686 84.4308C76.5462 91.8962 71.23 96.5943 64.1125 99.3854C60.0438 100.963 55.8047 102.071 51.5867 103.219C45.1654 104.96 39.8595 108.026 36.413 113.835C35.9402 114.657 35.5148 115.508 34.9659 116.546L27.5893 91.1365Z"
        fill="white"
      />
      <path
        d="M27.5893 91.1365C22.7555 86.7546 21.3489 77.7851 23.3691 70.5765C27.7565 77.2043 34.5538 80.3598 42.1992 81.4492C54.1681 83.1957 65.6773 81.3037 75.7491 74.4492C76.9138 73.6538 78.0009 72.7478 79.2265 71.7424C80.5781 76.0384 80.5765 80.3085 79.1686 84.4308C76.5462 91.8962 71.23 96.5943 64.1125 99.3854C60.0438 100.963 55.8047 102.071 51.5867 103.219C45.1654 104.96 39.8595 108.026 36.413 113.835C35.9402 114.657 35.5148 115.508 34.9659 116.546L27.5893 91.1365Z"
        fill="url(#astro-gradient)"
      />
      <path
        d="M0.5 69.5C4.5 54 18 18 42.5 0.5C42.5 0.5 38.5 25.5 42 39C45.5 52.5 58.5 60 58.5 60L27.5 91.5L0.5 69.5Z"
        fill="white"
      />
      <defs>
        <linearGradient id="astro-gradient" x1="57" y1="65" x2="35" y2="117" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D83333" />
          <stop offset="1" stopColor="#F041FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PythonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 110" fill="none">
      <path
        d="M54.5 2C42.5 2 37 7 37 16v10h18v4H24c-10 0-18 7.5-18 20s6 20 16 20h8v-11c0-10 8-18 18-18h20c8 0 14-6 14-14V16c0-8-6.5-14-14.5-14H54.5z"
        fill="url(#py1)"
      />
      <path
        d="M55.5 108c12 0 17.5-5 17.5-14V84H55v-4h31c10 0 18-7.5 18-20s-6-20-16-20h-8v11c0 10-8 18-18 18H42c-8 0-14 6-14 14v17c0 8 6.5 14 14.5 14h13z"
        fill="url(#py2)"
      />
      <circle cx="45" cy="12" r="4" fill="white" opacity="0.7" />
      <circle cx="65" cy="98" r="4" fill="white" opacity="0.7" />
      <defs>
        <linearGradient id="py1" x1="19" y1="2" x2="72" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#387EB8" />
          <stop offset="1" stopColor="#366994" />
        </linearGradient>
        <linearGradient id="py2" x1="38" y1="60" x2="91" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD43B" />
          <stop offset="1" stopColor="#FFE873" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
    </svg>
  );
}

export function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
    </svg>
  );
}
