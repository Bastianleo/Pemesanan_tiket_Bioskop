import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Clapperboard / Cinema ticket symbol */}
            <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="2"
                fill="#E50914"
                stroke="#DC2626"
            />
            <path
                d="M7 3v18"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="2 2"
            />
            <circle
                cx="14"
                cy="12"
                r="3.5"
                fill="#141E33"
                stroke="#F59E0B"
                strokeWidth="1.5"
            />
            <polygon
                points="13 10.5 16 12 13 13.5 13 10.5"
                fill="#FFFFFF"
                stroke="none"
            />
        </svg>
    );
}
