import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 40 40"
          fill="none"
        >
          {/* Outer ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="#22D3EE"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Inner arc - solid */}
          <path
            d="M14 20C14 16.5 16.5 14 20 14C23.5 14 26 16.5 26 20"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
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
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
