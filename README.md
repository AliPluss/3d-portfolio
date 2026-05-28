# 3D Portfolio

A cinematic, high-performance 3D portfolio built with Next.js 14, Three.js, GSAP, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Environment Setup
Copy the `.env.local.example` file to create your own environment configuration:
```bash
cp .env.local.example .env.local
```

The frontend will gracefully fall back to sample data if no backend is provided. For full dynamic capabilities, you will need a MongoDB URI and a JWT secret.

### Development
To run the frontend locally:
```bash
npm run dev
```

To run both the Next.js frontend and Express backend concurrently (if configured):
```bash
npm run dev:all
```

## Production Deployment

### Vercel Deployment (Frontend)
This project is fully compatible with Vercel and optimized for the App Router.
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Configure your Environment Variables in Vercel (matching `.env.local`).
4. Set the Build Command to `npm run build` and Install Command to `npm install`.
5. Deploy.

### 3D Asset Optimization
The core 3D assets (`avatar.glb` and `avatar2.glb`) have been compressed using Draco (`gltf-pipeline`). The optimized files (`avatar.optimized.glb` and `avatar2.optimized.glb`) are used in production to drastically reduce load times. Original files remain in the `/public` directory as backups.

### Backend / API Note
The `/api/` endpoints configured in this repository point to an Express server (`http://localhost:5000` by default). 
- If deployed separately (e.g., to Render or Heroku), update `NEXT_PUBLIC_API_URL` to your production backend URL.
- If no backend is deployed, the Next.js frontend will automatically catch fetch errors and safely render high-quality fallback placeholder data.
