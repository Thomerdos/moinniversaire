/**
 * Script to sync photos from a Google Photos album
 * 
 * Required environment variables:
 * - SERVICE_ACCOUNT_KEY: JSON key file content for Google Service Account
 * - GOOGLE_PHOTOS_ALBUM_ID: ID of the album to sync
 * - GOOGLE_USER_EMAIL: Email of the user whose photos to access (for domain-wide delegation)
 * 
 * IMPORTANT: Google Photos Library API requires domain-wide delegation for service accounts.
 * This only works with Google Workspace accounts, not personal Gmail accounts.
 * 
 * Setup instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select an existing one
 * 3. Enable the "Photos Library API"
 * 4. Create a Service Account and download the JSON key
 * 5. In Google Workspace Admin Console:
 *    - Go to Security > API Controls > Domain-wide delegation
 *    - Add a new API client with the service account's Client ID
 *    - Add scope: https://www.googleapis.com/auth/photoslibrary.readonly
 * 6. Add the service account JSON as the SERVICE_ACCOUNT_KEY secret
 * 7. Add the target user's email as GOOGLE_USER_EMAIL secret
 * 8. Add the album ID as GOOGLE_PHOTOS_ALBUM_ID secret
 * 
 * For personal Gmail accounts, use OAuth 2.0 instead (see docs/GOOGLE_PHOTOS_SETUP.md)
 */

import { google } from 'googleapis';
import fs from 'fs';

const {
  SERVICE_ACCOUNT_KEY,
  GOOGLE_PHOTOS_ALBUM_ID,
  GOOGLE_USER_EMAIL
} = process.env;

// Check for required environment variables
const requiredEnvVars = ['SERVICE_ACCOUNT_KEY', 'GOOGLE_PHOTOS_ALBUM_ID', 'GOOGLE_USER_EMAIL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.log(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('Creating placeholder photos-data.json for development...');
  
  // Create a placeholder file for development
  const placeholderData = {
    photos: [],
    lastSync: new Date().toISOString(),
    message: 'Configure Google Photos API credentials to sync real photos'
  };
  
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/photos-data.json', JSON.stringify(placeholderData, null, 2));
  console.log('Created public/photos-data.json with placeholder data');
  process.exit(0);
}

// Parse service account credentials
let serviceAccountCredentials;
try {
  serviceAccountCredentials = JSON.parse(SERVICE_ACCOUNT_KEY);
} catch (error) {
  console.error('Failed to parse SERVICE_ACCOUNT_KEY JSON:', error.message);
  process.exit(1);
}

// Initialize JWT client with domain-wide delegation
const auth = new google.auth.JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  scopes: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
  subject: GOOGLE_USER_EMAIL // Impersonate this user (requires domain-wide delegation)
});

// Google Photos API base URL
const PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

async function getAccessToken() {
  const { token } = await auth.getAccessToken();
  return token;
}

async function fetchAlbumPhotos(albumId, accessToken) {
  const photos = [];
  let pageToken = null;

  do {
    const body = {
      albumId: albumId,
      pageSize: 100
    };
    
    if (pageToken) {
      body.pageToken = pageToken;
    }

    const response = await fetch(`${PHOTOS_API_BASE}/mediaItems:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.mediaItems) {
      for (const item of data.mediaItems) {
        // Only include photos (not videos)
        if (item.mimeType && item.mimeType.startsWith('image/')) {
          photos.push({
            id: item.id,
            title: item.filename || '',
            date: item.mediaMetadata?.creationTime,
            width: parseInt(item.mediaMetadata?.width) || 1200,
            height: parseInt(item.mediaMetadata?.height) || 900,
            // Use baseUrl with dimension parameters for thumbnails and full images
            thumbnail: `${item.baseUrl}=w400-h300-c`,
            src: `${item.baseUrl}=w2048-h2048`
          });
        }
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return photos;
}

async function main() {
  console.log('Starting Google Photos sync...');
  
  try {
    const accessToken = await getAccessToken();
    console.log('Successfully obtained access token');
    
    const photos = await fetchAlbumPhotos(GOOGLE_PHOTOS_ALBUM_ID, accessToken);
    console.log(`Found ${photos.length} photos in album`);
    
    // Create the data file with photo URLs
    // Note: Google Photos URLs are temporary and need to be refreshed
    // The workflow runs daily to ensure URLs stay valid
    const photosData = {
      photos: photos,
      lastSync: new Date().toISOString(),
      albumId: GOOGLE_PHOTOS_ALBUM_ID
    };
    
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/photos-data.json', JSON.stringify(photosData, null, 2));
    
    console.log('Successfully synced photos data');
    console.log(`Wrote ${photos.length} photos to public/photos-data.json`);
    
  } catch (error) {
    console.error('Error syncing photos:', error.message);
    process.exit(1);
  }
}

main();
