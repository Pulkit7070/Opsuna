import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #0A0A0A 0%, #171717 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 40 40"
          fill="none"
        >
          {/* Outer ring with gradient effect */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#grad)"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Inner arc - solid */}
          <path
            d="M14 20C14 16.5 16.5 14 20 14C23.5 14 26 16.5 26 20"
            stroke="url(#grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Inner arc - dashed */}
          <path
            d="M26 20C26 23.5 23.5 26 20 26C16.5 26 14 23.5 14 20"
            stroke="url(#grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 3"
          />
          {/* Central dot */}
          <circle cx="20" cy="20" r="3" fill="#22D3EE" />
          {/* Action arrow */}
          <path
            d="M28 12L31 9M31 9L28 9M31 9L31 12"
            stroke="#22D3EE"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
