import { NextResponse } from "next/server";

// Gold price API route — server-side proxy to free gold price APIs
// Avoids CORS issues by fetching from Next.js API route
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // optional: YYYY-MM-DD

  try {
    // For live/current price: use gold-api.com (free, no key, returns USD/oz)
    // For historical date: use Polish National Bank (free, returns PLN/gram) + Frankfurter (PLN→USD)
    if (!date || date === new Date().toISOString().split("T")[0]) {
      const liveResult = await fetchLiveGoldPrice();
      if (liveResult) return NextResponse.json(liveResult);
    }

    // Historical or live fallback: NBP + Frankfurter
    const historicalResult = await fetchHistoricalGoldPrice(date);
    if (historicalResult) return NextResponse.json(historicalResult);

    // Last resort: try live from gold-api.com even for historical requests
    const liveResult = await fetchLiveGoldPrice();
    if (liveResult) return NextResponse.json({ ...liveResult, note: "Live price (historical unavailable)" });

    return NextResponse.json({ error: "Could not fetch gold price from any source" }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gold price", details: error.message }, { status: 500 });
  }
}

const TROY_OZ_TO_GRAMS = 31.1035;

// Source 1: gold-api.com — free, no API key, returns live XAU/USD per troy oz
async function fetchLiveGoldPrice() {
  try {
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.price) {
      return {
        pricePerGram: Math.round((data.price / TROY_OZ_TO_GRAMS) * 100) / 100,
        pricePerOz: data.price,
        date: new Date().toISOString().split("T")[0],
        source: "gold-api.com",
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Source 2: Polish National Bank (NBP) for historical gold price per gram in PLN
// + Frankfurter API for USD/PLN exchange rate → convert to USD/gram
async function fetchHistoricalGoldPrice(date) {
  try {
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Fetch gold price in PLN/gram from NBP and USD/PLN rate in parallel
    const [nbpRes, fxRes] = await Promise.all([
      fetch(`https://api.nbp.pl/api/cenyzlota/${targetDate}?format=json`, {
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
      fetch(`https://api.frankfurter.dev/v1/${targetDate}?base=USD&symbols=PLN`, {
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
    ]);

    // If exact date fails (weekend/holiday), try a range to get closest date
    let goldPricePLN = null;
    if (nbpRes && nbpRes.ok) {
      const nbpData = await nbpRes.json();
      if (Array.isArray(nbpData) && nbpData[0] && nbpData[0].cena) {
        goldPricePLN = nbpData[0].cena;
      }
    } else {
      // Try fetching a range (last 5 business days before the date)
      const d = new Date(targetDate);
      const startDate = new Date(d);
      startDate.setDate(d.getDate() - 7);
      const startStr = startDate.toISOString().split("T")[0];
      const rangeRes = await fetch(
        `https://api.nbp.pl/api/cenyzlota/${startStr}/${targetDate}?format=json`,
        { signal: AbortSignal.timeout(8000) }
      ).catch(() => null);
      if (rangeRes && rangeRes.ok) {
        const rangeData = await rangeRes.json();
        if (Array.isArray(rangeData) && rangeData.length > 0) {
          goldPricePLN = rangeData[rangeData.length - 1].cena; // most recent
        }
      }
    }

    let plnPerUsd = null;
    if (fxRes && fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData.rates && fxData.rates.PLN) {
        plnPerUsd = fxData.rates.PLN;
      }
    }

    if (goldPricePLN && plnPerUsd) {
      const pricePerGram = Math.round((goldPricePLN / plnPerUsd) * 100) / 100;
      return {
        pricePerGram,
        pricePerOz: Math.round(pricePerGram * TROY_OZ_TO_GRAMS * 100) / 100,
        date: targetDate,
        source: "nbp.pl",
      };
    }
    return null;
  } catch {
    return null;
  }
}
