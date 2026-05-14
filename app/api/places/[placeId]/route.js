import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { placeId } = params;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,formatted_phone_number,website,formatted_address&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || 'Place not found' }, { status: 404 });
    }

    return NextResponse.json(data.result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}