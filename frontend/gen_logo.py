import base64

svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="120" rx="30" fill="url(#grad1)" />
  <circle cx="70" cy="60" r="35" fill="url(#grad2)" />
  <path d="M55 60 L70 40 L85 60 L70 80 Z" fill="#ffffff" />
  <path d="M60 60 L70 50 L80 60 L70 70 Z" fill="#22c55e" />
  <text x="120" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-2">Bharat<tspan fill="#22c55e">Go</tspan></text>
</svg>"""

encoded = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
output = f'export const logoSvgBase64 = "data:image/svg+xml;base64,{encoded}";'

with open('src/constants/logo.js', 'w', encoding='utf-8') as f:
    f.write(output)

print('Generated logo.js successfully!')
