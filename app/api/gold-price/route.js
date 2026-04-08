import { NextResponse } from "next/server";

const TROY_OZ_TO_GRAMS = 31.1035;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    // Try live price first (works for current date or as fallback)
    const liveResult = await fetchLiveGoldPrice();

    // If a specific historical date was requested, try historical source
    if (date) {
      const histResult = await fetchHistoricalGoldPrice(date);
      if (histResult) return NextResponse.json(histResult);
      // If historical fails but live worked, return live with a note
      if (liveResult) {
        return NextResponse.json({
          ...liveResult,
          note: "Using current price (historical unavailable for " + date + ")",
        });
      }
    }

    if (liveResult) return NextResponse.json(liveResult);

    return NextResponse.json({ error: "Could not fetch gold price" }, { status: 502 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch gold price" }, { status: 500 });
  }
}

async function fetchLiveGoldPrice() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.price) {
      return {
        pricePerGram: Math.round((data.price / TROY_OZ_TO_GRAMS) * 100) / 100,
        pricePerOz: data.price,
        date: new Date().toISOString().split("T")[0],
        source: "gold-api.com",
      };
    }
    return null;
  } catch (e) {
    // Live gold price fetch failed — falling through to null
    return null;
  }
}

async function fetchHistoricalGoldPrice(targetDate) {
  try {
    const controller1 = new AbortController();
    const timeout1 = setTimeout(() => controller1.abort(), 10000);
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 10000);

    // Try exact date from NBP
    let nbpRes = null;
    try {
      nbpRes = await fetch(
        "https://api.nbp.pl/api/cenyzlota/" + targetDate + "?format=json",
        { signal: controller1.signal }
      );
    } catch (e) {
      nbpRes = null;
    }
    clearTimeout(timeout1);

    let goldPricePLN = null;

    if (nbpRes && nbpRes.ok) {
      try {
        const nbpData = await nbpRes.json();
        if (Array.isArray(nbpData) && nbpData.length > 0 && nbpData[0].cena) {
          goldPricePLN = nbpData[0].cena;
        }
      } catch (e) {
        // JSON parse failed
      }
    }

    // If exact date failed (weekend/holiday), try range
    if (!goldPricePLN) {
      try {
        const d = new Date(targetDate);
        const startDate = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startStr = startDate.toISOString().split("T")[0];
        const controller3 = new AbortController();
        const timeout3 = setTimeout(() => controller3.abort(), 10000);
        const rangeRes = await fetch(
          "https://api.nbp.pl/api/cenyzlota/" + startStr + "/" + targetDate + "?format=json",
          { signal: controller3.signal }
        );
        clearTimeout(timeout3);
        if (rangeRes && rangeRes.ok) {
          const rangeData = await rangeRes.json();
          if (Array.isArray(rangeData) && rangeData.length > 0) {
            goldPricePLN = rangeData[rangeData.length - 1].cena;
          }
        }
      } catch (e) {
        // range fetch failed
      }
    }

    // Get USD/PLN exchange rate
    let plnPerUsd = null;
    try {
      const fxRes = await fetch(
        "https://api.frankfurter.dev/v1/" + targetDate + "?base=USD&symbols=PLN",
        { signal: controller2.signal }
      );
      clearTimeout(timeout2);
      if (fxRes && fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData && fxData.rates && fxData.rates.PLN) {
          plnPerUsd = fxData.rates.PLN;
        }
      }
    } catch (e) {
      // fx fetch failed
    }
    clearTimeout(timeout2);

    if (goldPricePLN && plnPerUsd) {
      const pricePerGram = Math.round((goldPricePLN / plnPerUsd) * 100) / 100;
      return {
        pricePerGram: pricePerGram,
        pricePerOz: Math.round(pricePerGram * TROY_OZ_TO_GRAMS * 100) / 100,
        date: targetDate,
        source: "nbp.pl",
      };
    }

    return null;
  } catch (e) {
    // Historical gold price fetch failed — falling through to null
    return null;
  }
}
