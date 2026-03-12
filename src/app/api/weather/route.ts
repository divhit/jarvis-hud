import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://wttr.in/Vancouver?format=j1', {
      headers: { 'User-Agent': 'curl/7.0' },
      next: { revalidate: 600 }, // cache 10 minutes server-side
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Weather service unavailable' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const cc = data.current_condition?.[0];

    if (!cc) {
      return NextResponse.json(
        { error: 'Invalid weather data' },
        { status: 502 }
      );
    }

    const weatherDesc = cc.weatherDesc?.[0]?.value || 'Unknown';

    // Map weather descriptions to emoji icons
    const desc = weatherDesc.toLowerCase();
    let icon = '🌤';
    if (desc.includes('sunny') || desc.includes('clear')) icon = '☀️';
    else if (desc.includes('cloud') && desc.includes('part')) icon = '⛅';
    else if (desc.includes('overcast') || desc.includes('cloudy')) icon = '☁️';
    else if (desc.includes('rain') || desc.includes('drizzle')) icon = '🌧';
    else if (desc.includes('snow') || desc.includes('blizzard')) icon = '🌨';
    else if (desc.includes('thunder') || desc.includes('storm')) icon = '⛈';
    else if (desc.includes('fog') || desc.includes('mist')) icon = '🌫';

    return NextResponse.json({
      temp: parseInt(cc.temp_C, 10),
      condition: weatherDesc,
      humidity: parseInt(cc.humidity, 10),
      wind: parseInt(cc.windspeedKmph, 10),
      feelsLike: parseInt(cc.FeelsLikeC, 10),
      uvIndex: parseInt(cc.uvIndex, 10),
      icon,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}
