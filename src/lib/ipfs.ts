/**
 * IPFS Utilities
 * Functions to fetch, upload, and process IPFS data via Pinata
 */

// Pinata Configuration from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY_URL || "https://azure-fantastic-loon-956.mypinata.cloud/ipfs";
// Fallback to Pinata public gateway if dedicated gateway fails
const PINATA_PUBLIC_GATEWAY = "https://gateway.pinata.cloud/ipfs";

// API endpoint
const PINATA_API = "https://api.pinata.cloud";

export interface PropertyMetadata {
    title: string;
    description: string;
    location: string;
    location_country: string;
    location_city: string;
    images: string[]; // IPFS URLs like ipfs://...
    amenities: string[];
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
}

/**
 * Convert IPFS URI to HTTP URL
 * Handles both formats:
 * - ipfs://QmXxx... -> https://gateway.pinata.cloud/ipfs/QmXxx...
 * - QmXxx... (bare hash) -> https://gateway.pinata.cloud/ipfs/QmXxx...
 * 
 * Uses the configured gateway (dedicated Pinata gateway) with fallback to public gateway
 */
export function ipfsToHttp(ipfsUri: string, useFallback: boolean = false): string {
    if (!ipfsUri) {
        console.warn('⚠️ ipfsToHttp: Empty IPFS URI provided');
        return '';
    }

    let hash: string;
    
    // Remove ipfs:// prefix if present
    if (ipfsUri.startsWith('ipfs://')) {
        hash = ipfsUri.replace('ipfs://', '');
    } else if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
        // If it's already an HTTP URL, return as is
        return ipfsUri;
    } else {
        // Otherwise, treat it as a bare IPFS hash
        hash = ipfsUri;
    }

    // Choose gateway (use fallback if requested, otherwise use configured gateway)
    const gateway = useFallback ? PINATA_PUBLIC_GATEWAY : IPFS_GATEWAY;
    
    // Ensure gateway URL doesn't have trailing slash, and hash doesn't have leading slash
    const cleanGateway = gateway.endsWith('/') ? gateway.slice(0, -1) : gateway;
    const cleanHash = hash.startsWith('/') ? hash.slice(1) : hash;
    
    const httpUrl = `${cleanGateway}/${cleanHash}`;
    
    if (!useFallback) {
        console.log(`🖼️ Converting IPFS URI: ${ipfsUri.substring(0, 50)}... -> ${httpUrl}`);
    }
    
    return httpUrl;
}

/**
 * Fetch metadata from IPFS with retry logic
 */
export async function fetchIPFSMetadata(ipfsUri: string): Promise<PropertyMetadata | null> {
    try {
        const httpUrl = ipfsToHttp(ipfsUri);
        console.log('📥 Fetching IPFS metadata from:', httpUrl);

        const response = await fetch(httpUrl, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch IPFS metadata:', response.status, response.statusText);
            return null;
        }

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Response is not JSON, got content-type:', contentType);
            const text = await response.text();
            console.error('Response preview:', text.substring(0, 200));
            return null;
        }

        const metadata = await response.json();
        console.log('✅ IPFS metadata fetched:', metadata);

        return metadata;
    } catch (error) {
        console.error('Error fetching IPFS metadata:', error);
        return null;
    }
}

/**
 * Get image URL from IPFS
 * Converts ipfs:// URIs to HTTP gateway URLs
 */
export function getIPFSImageUrl(ipfsUri: string): string {
    if (!ipfsUri) {
        console.warn('⚠️ getIPFSImageUrl: Empty IPFS URI provided');
        return '';
    }
    
    const httpUrl = ipfsToHttp(ipfsUri);
    
    // Log for debugging
    if (httpUrl) {
        console.log(`🖼️ Image URL conversion: ${ipfsUri.substring(0, 50)}... -> ${httpUrl.substring(0, 80)}...`);
    }
    
    return httpUrl;
}

/**
 * Upload JSON metadata to Pinata IPFS
 * @param metadata - The metadata object to upload
 * @param name - Optional name for the pin
 * @returns IPFS hash (e.g., "QmXxx...")
 */
export async function uploadMetadataToIPFS(
    metadata: PropertyMetadata,
    name?: string
): Promise<string> {
    // Check for authentication
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
        throw new Error(
            'Pinata authentication not configured. Add either:\n' +
            '- VITE_PINATA_JWT (recommended), or\n' +
            '- VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY\n' +
            'to your .env file'
        );
    }

    try {
        // Prepare headers - prefer JWT over API key/secret
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (PINATA_JWT) {
            headers['Authorization'] = `Bearer ${PINATA_JWT}`;
        } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
            headers['pinata_api_key'] = PINATA_API_KEY;
            headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
        }

        const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: name || `property-${metadata.title.replace(/\s+/g, '-').toLowerCase()}`,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata metadata upload failed:', response.status, errorText);
            throw new Error(`Failed to upload metadata to IPFS: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Metadata uploaded to IPFS:', data.IpfsHash);
        
        return data.IpfsHash;
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        throw error;
    }
}

/**
 * Upload image file to Pinata IPFS
 * @param file - The image file to upload
 * @returns IPFS URI in format "ipfs://QmXxx..."
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
    // Check for authentication
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
        throw new Error(
            'Pinata authentication not configured. Add either:\n' +
            '- VITE_PINATA_JWT (recommended), or\n' +
            '- VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY\n' +
            'to your .env file'
        );
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const metadata = JSON.stringify({
            name: file.name,
        });
        formData.append('pinataMetadata', metadata);

        // Prepare headers - prefer JWT over API key/secret
        const headers: HeadersInit = {};

        if (PINATA_JWT) {
            headers['Authorization'] = `Bearer ${PINATA_JWT}`;
        } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
            headers['pinata_api_key'] = PINATA_API_KEY;
            headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
        }

        const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata image upload failed:', response.status, errorText);
            throw new Error(`Failed to upload image to IPFS: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Image uploaded to IPFS:', data.IpfsHash);
        
        // Return as ipfs:// URI
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw error;
    }
}

/**
 * Upload multiple images to IPFS
 * @param images - Array of image files to upload
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Array of IPFS URIs in format "ipfs://QmXxx..."
 */
export async function uploadImagesToIPFS(
    images: File[],
    onProgress?: (progress: number) => void
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
        console.log(`📤 Uploading image ${i + 1}/${images.length}...`);
        
        const ipfsUrl = await uploadImageToIPFS(images[i]);
        uploadedUrls.push(ipfsUrl);

        // Report progress if callback provided
        if (onProgress) {
            const progress = ((i + 1) / images.length) * 100;
            onProgress(progress);
        }
    }

    console.log('📸 All images uploaded:', uploadedUrls);
    return uploadedUrls;
}