import React from 'react'

export const PlaceholderIcon = ({ type, size = 64, color = '#3b82f6' }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }

  switch (type) {
    case 'optimization':
      return (
        <svg {...commonProps}>
          <circle cx="32" cy="16" r="4" fill={color} opacity="0.8" />
          <circle cx="20" cy="32" r="4" fill={color} opacity="0.6" />
          <circle cx="44" cy="32" r="4" fill={color} opacity="0.6" />
          <circle cx="32" cy="48" r="4" fill={color} />
          <path d="M32 20L20 28M44 28L32 20M20 36L32 44M32 44L44 36" stroke={color} strokeWidth="2" opacity="0.7" />
        </svg>
      )

    case 'algorithm':
      return (
        <svg {...commonProps}>
          <rect x="8" y="16" width="48" height="32" rx="4" fill={color} opacity="0.2" />
          <rect x="12" y="20" width="8" height="8" fill={color} />
          <rect x="28" y="20" width="8" height="8" fill={color} />
          <rect x="44" y="20" width="8" height="8" fill={color} />
          <rect x="12" y="36" width="8" height="8" fill={color} opacity="0.7" />
          <rect x="28" y="36" width="8" height="8" fill={color} opacity="0.7" />
          <rect x="44" y="36" width="8" height="8" fill={color} opacity="0.7" />
        </svg>
      )

    case 'data':
      return (
        <svg {...commonProps}>
          <ellipse cx="32" cy="20" rx="20" ry="8" fill={color} opacity="0.3" />
          <ellipse cx="32" cy="32" rx="20" ry="8" fill={color} opacity="0.5" />
          <ellipse cx="32" cy="44" rx="20" ry="8" fill={color} />
          <path d="M52 20v24c0 4.4-9 8-20 8s-20-3.6-20-8V20" stroke={color} strokeWidth="2" fill="none" />
        </svg>
      )

    case 'chart':
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="48" height="48" rx="4" fill={color} opacity="0.1" />
          <path d="M12 48L20 36L28 40L36 24L44 32L52 16" stroke={color} strokeWidth="3" fill="none" />
          <circle cx="20" cy="36" r="3" fill={color} />
          <circle cx="28" cy="40" r="3" fill={color} />
          <circle cx="36" cy="24" r="3" fill={color} />
          <circle cx="44" cy="32" r="3" fill={color} />
        </svg>
      )

    case '3d':
      return (
        <svg {...commonProps}>
          <path d="M32 8L52 20L32 32L12 20L32 8Z" fill={color} opacity="0.8" />
          <path d="M12 20L32 32V56L12 44V20Z" fill={color} opacity="0.5" />
          <path d="M32 32L52 20V44L32 56V32Z" fill={color} />
        </svg>
      )

    default:
      return (
        <svg {...commonProps}>
          <rect x="12" y="12" width="40" height="40" rx="20" fill={color} opacity="0.8" />
          <text x="32" y="38" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">?</text>
        </svg>
      )
  }
}

export const PlaceholderImage = ({ width, height, color = '#374151', text = 'Image Placeholder' }) => {
  return (
    <div 
      className="flex items-center justify-center border-2 border-dashed border-gray-600 text-gray-400"
      style={{ 
        width: width || '100%', 
        height: height || '200px',
        backgroundColor: color + '20',
        borderColor: color
      }}
    >
      <div className="text-center">
        <svg className="mx-auto mb-2" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  )
}

export const PlaceholderColorBlock = ({ width = '100%', height = '200px', color = '#3b82f6', label }) => {
  return (
    <div 
      className="flex items-center justify-center text-white font-medium rounded"
      style={{ 
        width, 
        height, 
        backgroundColor: color,
        opacity: 0.8
      }}
    >
      {label && <span>{label}</span>}
    </div>
  )
}

export default { PlaceholderIcon, PlaceholderImage, PlaceholderColorBlock }