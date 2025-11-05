import { NextRequest, NextResponse } from 'next/server';

// Server-side only - API key NOT exposed to client
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export async function GET(request: NextRequest) {
  // Validate API key is configured
  if (!ALCHEMY_API_KEY) {
    console.error('ALCHEMY_API_KEY is not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');

  // Validate required parameters
  if (!contractAddress || !tokenId) {
    return NextResponse.json(
      { error: 'Missing required parameters: contractAddress and tokenId' },
      { status: 400 }
    );
  }

  // Validate contract address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    return NextResponse.json(
      { error: 'Invalid contract address format' },
      { status: 400 }
    );
  }

  // Validate tokenId is a number
  if (!/^\d+$/.test(tokenId)) {
    return NextResponse.json(
      { error: 'Invalid tokenId format' },
      { status: 400 }
    );
  }

  try {
    // Call Alchemy API server-side
    const alchemyUrl = `https://story-aeneid.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`;

    const response = await fetch(alchemyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Alchemy API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch metadata: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the metadata with caching headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cache in browser and CDN for 1 hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        // Allow CORS for local development
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Failed to fetch metadata from Alchemy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Support OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
