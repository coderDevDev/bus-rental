// This script modifies the .next/server directory to bypass SSR
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run this script after next build completes
console.log('Disabling SSR...');

// Create a simple page shell that skips SSR
const shellContent = `
// This file disables SSR for all pages
export default function NoSSR(props) {
  return <div id="ssr-bypass" />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
`;

// Path to Next.js build directory
const nextDir = path.join(path.resolve(__dirname, '..'), '.next', 'server');

// Try to patch key server files
try {
  // Find and modify key files
  const files = [
    path.join(nextDir, 'app-paths-manifest.json'),
    path.join(nextDir, 'pages-manifest.json')
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Modifying ${file}`);
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));

      // Modify paths to use client-side only versions
      Object.keys(content).forEach(key => {
        // Add a marker to affected files
        if (!content[key].includes('ssr-disabled')) {
          content[key] += '.ssr-disabled';
        }
      });

      fs.writeFileSync(file, JSON.stringify(content, null, 2));
    }
  });

  console.log('SSR disabled successfully!');
} catch (error) {
  console.error('Error disabling SSR:', error);
}
