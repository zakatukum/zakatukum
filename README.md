# Zakatukum — Your Zakat Calculator

A modern, comprehensive zakat calculator built with Next.js and React. Calculate precise zakat on wealth, investments, livestock, agriculture, and more.

## Features

- **Multi-language Support**: English, Arabic, Urdu, Turkish, Malay, Indonesian, French, Spanish, German, Bengali
- **Comprehensive Calculations**:
  - Cash and liquid assets
  - Gold and jewelry
  - Investments and stocks
  - Business inventory
  - Debts and liabilities
  - Livestock (camels, cattle, sheep/goats)
  - Agricultural produce
  - Mining and minerals
  - Rental income
- **Hijri Calendar Integration**: Automatic conversion between Gregorian and Hijri dates
- **Multi-year Tracking**: Track zakat obligations across multiple years
- **Payment Tracking**: Monitor zakat payments with multiple distribution methods
- **Zakat Directory**: Pre-configured list of verified zakat-receiving organizations
- **Bank Integration**: Support for bank account linking (via Plaid)
- **RTL Support**: Automatic right-to-left text direction for Arabic
- **Charts and Analytics**: Visual representations of zakat calculations using Recharts
- **Print-Friendly**: Generate printable zakat summaries
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Project Structure

```
zakatukum/
├── app/
│   ├── layout.js              # Root layout with metadata and fonts
│   ├── page.js                # Main page component
│   ├── globals.css            # Global styles and resets
│   └── favicon.ico
├── components/
│   └── ZakatukumApp.jsx       # Main zakat calculator component
├── public/                    # Static assets
├── package.json
├── next.config.js
├── jsconfig.json
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd zakatukum
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Production Build

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (ES6+)
- **UI Components**: React Hooks (useState, useEffect, useCallback)
- **Charts**: Recharts for data visualization
- **Styling**: Inline CSS and global CSS
- **Fonts**: Inter (UI), Noto Naskh Arabic (Arabic text)
- **Linting**: ESLint with Next.js configuration

## Key Components

### ZakatukumApp.jsx
The main component containing:
- Dashboard with summary calculations
- Asset input forms for all zakat categories
- Multi-year zakat tracking
- Payment and distribution tracking
- Organization directory
- Bank connection interface
- Charts and analytics views
- Settings and user profile sections

### Utilities

- **Hijri Date Conversion**: Converts between Gregorian and Hijri calendars
- **Number Formatting**: Currency and percentage formatting for display
- **Internationalization**: Multi-language support with translation dictionary

## Configuration

### Customizing Organizations

Edit the `ORGS` array in `ZakatukumApp.jsx` to add or modify zakat-receiving organizations:

```javascript
const ORGS = [
  {
    id: 1,
    name: "Organization Name",
    desc: "Description",
    flag: "🇦🇪",
    method: "stripe" | "wire",
    cat: "Category"
  },
  // ... more organizations
];
```

### Adding Languages

Add translations to the `TRANSLATIONS` object in `ZakatukumApp.jsx`:

```javascript
const TRANSLATIONS = {
  "key": { en: "English", ar: "العربية", ur: "اردو", /* ... other languages */ }
};
```

## Supported Languages

- English (en)
- Arabic (ar)
- Urdu (ur)
- Turkish (tr)
- Malay (ms)
- Indonesian (id)
- French (fr)
- Spanish (es)
- German (de)
- Bengali (bn)

## Data Persistence

Currently, the application uses React state managed by the component. For production use, consider implementing:

- Local storage for client-side persistence
- Backend API for server-side data storage
- User authentication system
- Database integration

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Recharts for efficient data visualization
- React.useCallback for memoized callbacks
- Responsive design for mobile optimization
- Optimized font loading with Google Fonts

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

## Acknowledgments

- Inspired by the Islamic community's need for accurate zakat calculations
- Built with accessibility and usability in mind
- Dedicated to promoting Islamic financial literacy
