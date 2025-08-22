import { PinataSDK } from 'pinata';
import fs from 'fs';
import path from 'path';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT_TOKEN
});

async function deployToPinata() {
  try {
    console.log('📤 Starting Pinata deployment...');
    
    // Debug: Check if token is available (don't log the full token for security)
    if (!process.env.PINATA_JWT_TOKEN) {
      throw new Error('PINATA_JWT_TOKEN environment variable is not set');
    }
    
    const tokenLength = process.env.PINATA_JWT_TOKEN.length;
    const tokenStart = process.env.PINATA_JWT_TOKEN.substring(0, 10);
    console.log(`🔑 Token available: ${tokenStart}... (length: ${tokenLength})`);
    
    // JWT tokens should have 3 segments separated by dots
    const segments = process.env.PINATA_JWT_TOKEN.split('.');
    if (segments.length !== 3) {
      throw new Error(`Invalid JWT token format. Expected 3 segments, got ${segments.length}`);
    }
    
    // Check if build directory exists
    if (!fs.existsSync('build')) {
      throw new Error('Build directory not found. Please run npm run build first.');
    }
    
    console.log('📁 Build directory found, preparing files for upload...');
    
    // Recursively get all files from the build directory
    function getAllFiles(dirPath, arrayOfFiles = []) {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          // Create relative path from build directory
          const relativePath = path.relative('build', fullPath);
          arrayOfFiles.push({
            path: relativePath,
            content: fs.readFileSync(fullPath)
          });
        }
      });
      
      return arrayOfFiles;
    }
    
    const files = getAllFiles('build');
    console.log(`📦 Found ${files.length} files to upload`);
    
    // Convert files to File objects for Pinata SDK
    const fileObjects = files.map(file => {
      return new File([file.content], file.path, {
        type: getMimeType(file.path)
      });
    });
     
    console.log('🔄 Uploading files to Pinata using fileArray method...');
    
    // Upload type set to public (private doesn't support fileArray)
    const uploadType = 'public';
    console.log(`🔐 Upload type: ${uploadType}`);
    
    // Upload using fileArray method
    const upload = await pinata.upload[uploadType].fileArray(fileObjects)
      .name('clocktower-frontend')
      .keyvalues({
        deployed: new Date().toISOString()
      });
    
    console.log('✅ Upload successful!');
    console.log(`📋 CID: ${upload.cid}`);
    console.log(`📊 Size: ${upload.size} bytes`);
    console.log(`📁 Files: ${upload.number_of_files}`);
    
    // Output the CID for GitHub Actions
    console.log(`::set-output name=ipfs_hash::${upload.cid}`);
    
    return upload.cid;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Helper function to determine MIME type based on file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run the deployment
deployToPinata();
