import { NextResponse } from "next/server";

// Gold price API route - fetches gold price per gram in USD
// Tries multiple free sources for reliability
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // optional: YYYY-MM-DD format

  try {
    // Source 1: GoldAPI.io (free tier - no key needed for basic XAU/USD)
    const goldApiResult = await tryGoldApi(date);
    if (goldApiResult) return NextResponse.json(goldApiResult);

    // Source 2: metals.dev free API
    const metalsResult = await tryMetalsDev(date);
    if (metalsResult) return NextResponse.json(metalsResult);

    // Source 3: frankfurter.app (ECB rates - XAU via EUR conversion)
    const fallbackResult = await tryGoldPriceOrg();
    if (fallbackResult) return NextResponse.json(fallbackResult);

    return NextResponse.json(
      { error: "Could not fetch gold price from any source" },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gold price", details: error.message },
      { status: 500 }
    );
  }
}

const TROY_OZ_TO_GRAMS = 31.1035;

async function tryGoldApi(date) {
  try {
    // gold-api.com free endpoint (no auth needed for basic)
    const dateParam = date ? `/${date.replace(/-/g, "")}` : "";
    const res = await fetch(`https://www.goldapi.io/api/XAU/USD${dateParam}`, {
      headers: {
        "x-access-token": "goldapi-demo",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.price_gram_24k) {
      return {
        pricePerGram: Math.round(data.price_gram_24k * 100) / 100,
        pricePerOz: data.price,
        date: date || new Date().toISOString().split("T")[0],
        source: "goldapi.io",
      };
    }
    if (data.price) {
      return {
        pricePerGram: Math.round((data.price / TROY_OZ_TO_GRAMS) * 100) / 100,
        pricePerOz: data.price,
        date: date || new Date().toISOString().split("T")[0],
        source: "goldapi.io",
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function tryMetalsDev(date) {
  try {
    const url = date
      ? `https://api.metals.dev/v1/timeseries?api_key=demo&start_date=${date}&end_date=${date}&base=USD&metals=gold`
      : `https://api.metals.dev/v1/latest?api_key=demo&base=USD&metals=gold`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();

    let pricePerOz = null;
    if (data.metals && data.metals.gold) {
      pricePerOz = data.metals.gold;
    } else if (data.rates && data.rates.gold) {
      pricePerOz = data.rates.gold;
    }

    if (pricePerOz) {
      return {
        pricePerGram: Math.round((pricePerOz / TROY_OZ_TO_GRAMS) * 100) / 100,
        pricePerOz,
        date: date || new Date().toISOString().split("T")[0],
        source: "metals.dev",
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function tryGoldPriceOrg() {
  try {
    const res = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.items && data.items[0] && data.items[0].xauPrice) {
      const pricePerOz = data.items[0].xauPrice;
      return {
        pricePerGram: Math.round((pricePerOz / TROY_OZ_TO_GRAMS) * 100) / 100,
        pricePerOz,
        date: new Date().toISOString().split("T")[0],
        source: "goldprice.org",
      };
    }
    return null;
  } catch {
    return null;
  }
}
