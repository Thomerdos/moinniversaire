/**
 * Script to sync photos from a Google Photos album using OAuth 2.0
 * 
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: OAuth 2.0 Client ID
 * - GOOGLE_CLIENT_SECRET: OAuth 2.0 Client Secret
 * - GOOGLE_REFRESH_TOKEN: Refresh token for the authorized user
 * - GOOGLE_PHOTOS_ALBUM_ID: ID of the album to sync
 * 
 * See docs/GOOGLE_PHOTOS_SETUP.md for detailed setup instructions
 */

import { google } from 'googleapis';
import fs from 'fs';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_PHOTOS_ALBUM_ID
} = process.env;

// Check for required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_PHOTOS_ALBUM_ID'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
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

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN
});

// Google Photos API base URL
const PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

async function getAccessToken() {
  const { token } = await oauth2Client.getAccessToken();
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
