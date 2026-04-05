"use client";

import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { getSupabase } from "@/lib/supabase";

// ─── Hijri Date Utilities ───
const HIJRI_EPOCH = 1948439.5;
function gregorianToJDN(y, m, d) { if (m <= 2) { y--; m += 12; } const A = Math.floor(y / 100); const B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
function jdnToHijri(jdn) { const l = Math.floor(jdn - HIJRI_EPOCH) + 10632; const n = Math.floor((l - 1) / 10631); const l2 = l - 10631 * n + 354; const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238); const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29; const m = Math.floor((24 * l3) / 709); const d = l3 - Math.floor((709 * m) / 24); const y2 = 30 * n + j - 30; return { year: y2, month: m, day: d }; }
const HIJRI_MONTHS = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Ula","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhul Qi'dah","Dhul Hijjah"];
function getHijriString(date) { const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()); const h = jdnToHijri(jdn); return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} AH`; }

// ─── Currency Definitions (40 major currencies) ───
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", flag: "🇬🇧" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA", flag: "🇸🇦" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE", flag: "🇦🇪" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", locale: "ar-QA", flag: "🇶🇦" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", locale: "ar-KW", flag: "🇰🇼" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "د.ب", locale: "ar-BH", flag: "🇧🇭" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع", locale: "ar-OM", flag: "🇴🇲" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", locale: "en-PK", flag: "🇵🇰" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN", flag: "🇮🇳" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "bn-BD", flag: "🇧🇩" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID", flag: "🇮🇩" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY", flag: "🇲🇾" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR", flag: "🇹🇷" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", locale: "ar-EG", flag: "🇪🇬" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", locale: "ar-MA", flag: "🇲🇦" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG", flag: "🇳🇬" },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA", flag: "🇿🇦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", locale: "en-KE", flag: "🇰🇪" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR", flag: "🇰🇷" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH", flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", locale: "pl-PL", flag: "🇵🇱" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", locale: "es-MX", flag: "🇲🇽" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", locale: "es-AR", flag: "🇦🇷" },
  { code: "COP", name: "Colombian Peso", symbol: "$", locale: "es-CO", flag: "🇨🇴" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", locale: "ar-IQ", flag: "🇮🇶" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", locale: "ar-JO", flag: "🇯🇴" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", locale: "ar-LB", flag: "🇱🇧" },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س", locale: "ar-SD", flag: "🇸🇩" },
  { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH", flag: "🇹🇭" },
];

// Group currencies by region for the dropdown
const CURRENCY_GROUPS = {
  "Gulf & Middle East": ["SAR", "AED", "QAR", "KWD", "BHD", "OMR", "IQD", "JOD", "LBP", "EGP"],
  "South & Southeast Asia": ["PKR", "INR", "BDT", "IDR", "MYR", "SGD", "THB"],
  "Americas": ["USD", "CAD", "BRL", "MXN", "ARS", "COP"],
  "Europe": ["EUR", "GBP", "CHF", "TRY", "SEK", "NOK", "DKK", "PLN"],
  "Africa": ["NGN", "ZAR", "KES", "MAD", "SDG"],
  "East Asia & Pacific": ["JPY", "CNY", "KRW", "AUD"],
};

// Placeholder formatters (will be overridden inside component with actual currency)
let fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
let fmtFull = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n || 0);
let fmtShort = (n) => { if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `$${(n/1000).toFixed(1)}K`; return fmt(n); };

// ─── Data (add your own values) ───
// Hijri year calculation helper
function getHijriYear(gregYear) {
  const jdn = gregorianToJDN(gregYear, 6, 15); // mid-year
  const h = jdnToHijri(jdn);
  return h.year;
}

// ─── Country-specific Data ───
const COUNTRIES = [
  { code: "GLOBAL", name: "International / Global", flag: "🌍", region: "Global" },
  { code: "US", name: "United States", flag: "🇺🇸", region: "Americas" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "Americas" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", region: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "Gulf" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "Gulf" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "Gulf" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", region: "Gulf" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", region: "Gulf" },
  { code: "OM", name: "Oman", flag: "🇴🇲", region: "Gulf" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", region: "Middle East" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", region: "Middle East" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", region: "Middle East" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", region: "Middle East" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", region: "Middle East" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "Africa" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", region: "Africa" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "Africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "Africa" },
  { code: "SD", name: "Sudan", flag: "🇸🇩", region: "Africa" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", region: "Africa" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", region: "Africa" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", region: "South Asia" },
  { code: "IN", name: "India", flag: "🇮🇳", region: "South Asia" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", region: "South Asia" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", region: "Southeast Asia" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", region: "Southeast Asia" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Southeast Asia" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Pacific" },
];

// Country → default currency mapping
const COUNTRY_CURRENCY = {
  GLOBAL: "USD", US: "USD", CA: "CAD", GB: "GBP", DE: "EUR", FR: "EUR", SE: "SEK", NO: "NOK", NL: "EUR",
  SA: "SAR", AE: "AED", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR",
  IQ: "IQD", JO: "JOD", LB: "LBP", PS: "USD", TR: "TRY",
  EG: "EGP", MA: "MAD", NG: "NGN", ZA: "ZAR", SD: "SDG", SO: "USD", KE: "KES",
  PK: "PKR", IN: "INR", BD: "BDT", MY: "MYR", ID: "IDR", SG: "SGD", AU: "AUD",
};

const COUNTRY_BANKS = {
  GLOBAL: ["Any Bank (Manual Entry)"],
  US: ["Chase", "Bank of America", "Wells Fargo", "Citi", "US Bank", "Capital One", "PNC", "TD Bank"],
  CA: ["RBC", "TD Canada Trust", "BMO", "Scotiabank", "CIBC", "National Bank"],
  GB: ["HSBC UK", "Barclays", "Lloyds", "NatWest", "Monzo", "Starling Bank", "Revolut"],
  DE: ["Deutsche Bank", "Commerzbank", "DKB", "ING Germany", "N26", "Sparkasse"],
  FR: ["BNP Paribas", "Société Générale", "Crédit Agricole", "CIC", "Boursorama"],
  SE: ["Swedbank", "SEB", "Nordea", "Handelsbanken", "Danske Bank"],
  NO: ["DNB", "Nordea Norway", "SpareBank 1", "Handelsbanken Norway"],
  NL: ["ING", "ABN AMRO", "Rabobank", "SNS Bank", "Bunq"],
  SA: ["Al Rajhi Bank", "National Commercial Bank (NCB)", "Riyad Bank", "SABB", "Alinma Bank", "Bank AlJazira"],
  AE: ["Emirates NBD", "Abu Dhabi Commercial Bank", "Mashreq Bank", "FAB", "Dubai Islamic Bank", "RAK Bank"],
  QA: ["Qatar National Bank (QNB)", "Commercial Bank of Qatar", "Doha Bank", "Qatar Islamic Bank", "Masraf Al Rayan"],
  KW: ["National Bank of Kuwait", "Kuwait Finance House", "Burgan Bank", "Gulf Bank", "Boubyan Bank"],
  BH: ["Bank of Bahrain", "National Bank of Bahrain", "Al Salam Bank", "Ithmaar Bank", "Ahli United Bank"],
  OM: ["Bank Muscat", "National Bank of Oman", "Bank Dhofar", "Oman Arab Bank", "Sohar International"],
  IQ: ["Rafidain Bank", "Rasheed Bank", "Trade Bank of Iraq", "Kurdistan International Bank"],
  JO: ["Arab Bank", "Housing Bank", "Jordan Ahli Bank", "Bank of Jordan", "Cairo Amman Bank"],
  LB: ["Bank Audi", "Blom Bank", "Byblos Bank", "Fransabank", "Bank of Beirut"],
  PS: ["Bank of Palestine", "Palestine Islamic Bank", "Arab Islamic Bank", "Cairo Amman Bank Palestine"],
  TR: ["Ziraat Bankası", "İş Bankası", "Garanti BBVA", "Yapı Kredi", "QNB Finansbank", "Kuveyt Türk", "Albaraka Türk"],
  EG: ["National Bank of Egypt", "Banque Misr", "CIB Egypt", "QNB Alahli", "Faisal Islamic Bank"],
  MA: ["Attijariwafa Bank", "BMCE Bank", "Banque Populaire", "CIH Bank", "Crédit du Maroc"],
  NG: ["GTBank", "Zenith Bank", "Access Bank", "First Bank Nigeria", "UBA", "Jaiz Bank"],
  ZA: ["FNB", "Standard Bank", "Absa", "Nedbank", "Capitec", "Al Baraka Bank SA"],
  SD: ["Bank of Khartoum", "Faisal Islamic Bank Sudan", "Omdurman National Bank", "Blue Nile Mashreq Bank"],
  SO: ["Dahabshiil Bank", "Premier Bank Somalia", "Salaam Somali Bank", "IBS Bank"],
  KE: ["KCB", "Equity Bank", "Cooperative Bank", "Standard Chartered Kenya", "Gulf African Bank"],
  PK: ["Meezan Bank", "HBL", "UBL", "MCB", "Allied Bank", "Bank Alfalah", "Faysal Bank", "Bank Islami"],
  IN: ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Bank of Baroda"],
  BD: ["Islami Bank Bangladesh", "Dutch-Bangla Bank", "BRAC Bank", "Southeast Bank", "Al-Arafah Islami Bank"],
  MY: ["Maybank", "CIMB", "Public Bank", "Bank Islam", "AmBank", "RHB Bank", "Bank Muamalat"],
  ID: ["Bank Mandiri", "BCA", "BRI", "BNI", "Bank Syariah Indonesia", "CIMB Niaga"],
  SG: ["DBS", "OCBC", "UOB", "Standard Chartered Singapore", "Maybank Singapore"],
  AU: ["Commonwealth Bank", "ANZ", "Westpac", "NAB", "Macquarie", "ING Australia"],
};

const COUNTRY_ORGS = {
  GLOBAL: [
    { id: 1, name: "Islamic Relief Worldwide", desc: "Global programs in 40+ countries", flag: "🌍", method: "wire", cat: "Relief" },
    { id: 2, name: "Muslim Aid International", desc: "Islamic humanitarian organization", flag: "🌍", method: "wire", cat: "Relief" },
    { id: 3, name: "Muslim Hands", desc: "International Islamic development charity", flag: "🌍", method: "wire", cat: "Relief" },
    { id: 4, name: "Palestine Red Crescent", desc: "Medical & humanitarian services in Palestine", flag: "🇵🇸", method: "wire", cat: "Medical" },
    { id: 5, name: "Penny Appeal", desc: "Islamic charity — education, orphans, water", flag: "🌍", method: "wire", cat: "Education" },
    { id: 6, name: "Human Appeal", desc: "Islamic relief, development & orphan sponsorship", flag: "🌍", method: "wire", cat: "Relief" },
  ],
  US: [
    { id: 101, name: "Islamic Relief USA", desc: "Nationwide relief, zakat-verified", flag: "🇺🇸", method: "stripe", cat: "Relief" },
    { id: 102, name: "ICNA Relief", desc: "Domestic poverty relief, food pantries", flag: "🇺🇸", method: "stripe", cat: "Poverty" },
    { id: 103, name: "Zakat Foundation of America", desc: "Dedicated zakat distribution across US", flag: "🇺🇸", method: "stripe", cat: "Zakat" },
    { id: 104, name: "Helping Hand (HHRD)", desc: "Global humanitarian, orphan care", flag: "🇺🇸", method: "stripe", cat: "Relief" },
    { id: 105, name: "Muslim Aid USA", desc: "Refugee support, emergency aid", flag: "🇺🇸", method: "stripe", cat: "Refugee" },
    { id: 106, name: "CAIR", desc: "Civil rights and community welfare", flag: "🇺🇸", method: "stripe", cat: "Community" },
  ],
  CA: [
    { id: 201, name: "Islamic Relief Canada", desc: "Canadian zakat distribution", flag: "🇨🇦", method: "stripe", cat: "Relief" },
    { id: 202, name: "Human Concern International", desc: "Humanitarian aid, Canada-based", flag: "🇨🇦", method: "stripe", cat: "Relief" },
    { id: 203, name: "National Zakat Foundation Canada", desc: "Local zakat collection and distribution", flag: "🇨🇦", method: "stripe", cat: "Zakat" },
    { id: 204, name: "Muslim Welfare Canada", desc: "Community support services", flag: "🇨🇦", method: "stripe", cat: "Community" },
  ],
  GB: [
    { id: 301, name: "Islamic Relief UK", desc: "Largest Muslim charity in UK", flag: "🇬🇧", method: "stripe", cat: "Relief" },
    { id: 302, name: "Muslim Aid UK", desc: "Poverty relief and education", flag: "🇬🇧", method: "stripe", cat: "Relief" },
    { id: 303, name: "National Zakat Foundation UK", desc: "UK-focused zakat distribution", flag: "🇬🇧", method: "stripe", cat: "Zakat" },
    { id: 304, name: "Muslim Hands", desc: "International development charity", flag: "🇬🇧", method: "stripe", cat: "Relief" },
    { id: 305, name: "Interpal", desc: "Palestine focused humanitarian", flag: "🇬🇧", method: "stripe", cat: "Relief" },
  ],
  SA: [
    { id: 401, name: "Saudi Red Crescent", desc: "National humanitarian services", flag: "🇸🇦", method: "wire", cat: "Relief" },
    { id: 402, name: "King Salman Humanitarian Aid", desc: "Royal relief center", flag: "🇸🇦", method: "wire", cat: "Relief" },
    { id: 403, name: "Ehsan Platform", desc: "Official Saudi donation platform", flag: "🇸🇦", method: "wire", cat: "Zakat" },
    { id: 404, name: "International Islamic Relief Org", desc: "Makkah-based international charity", flag: "🇸🇦", method: "wire", cat: "Relief" },
  ],
  AE: [
    { id: 501, name: "Emirates Red Crescent", desc: "UAE national humanitarian body", flag: "🇦🇪", method: "wire", cat: "Relief" },
    { id: 502, name: "Dubai Cares", desc: "Education in developing countries", flag: "🇦🇪", method: "wire", cat: "Education" },
    { id: 503, name: "Zakat Fund UAE", desc: "Official UAE zakat authority", flag: "🇦🇪", method: "wire", cat: "Zakat" },
    { id: 504, name: "Sharjah Charity International", desc: "Humanitarian programs", flag: "🇦🇪", method: "wire", cat: "Relief" },
  ],
  QA: [
    { id: 601, name: "Qatar Charity", desc: "Global development & education", flag: "🇶🇦", method: "wire", cat: "Education" },
    { id: 602, name: "Qatar Red Crescent", desc: "National humanitarian services", flag: "🇶🇦", method: "wire", cat: "Relief" },
    { id: 603, name: "Eid Charity (RAF)", desc: "Relief and development globally", flag: "🇶🇦", method: "wire", cat: "Relief" },
  ],
  PK: [
    { id: 701, name: "Edhi Foundation", desc: "Healthcare, orphanages, ambulances", flag: "🇵🇰", method: "wire", cat: "Healthcare" },
    { id: 702, name: "Al Khidmat Foundation", desc: "Disaster relief, medical camps", flag: "🇵🇰", method: "wire", cat: "Relief" },
    { id: 703, name: "JDC Foundation", desc: "Community development, welfare", flag: "🇵🇰", method: "wire", cat: "Community" },
    { id: 704, name: "Saylani Welfare Trust", desc: "Largest food kitchen, education", flag: "🇵🇰", method: "wire", cat: "Welfare" },
    { id: 705, name: "Akhuwat Foundation", desc: "Interest-free microfinance", flag: "🇵🇰", method: "wire", cat: "Finance" },
    { id: 706, name: "Shaukat Khanum Hospital", desc: "Cancer treatment for underprivileged", flag: "🇵🇰", method: "wire", cat: "Healthcare" },
  ],
  IN: [
    { id: 801, name: "Zakat Foundation of India", desc: "Education, healthcare, empowerment", flag: "🇮🇳", method: "wire", cat: "Zakat" },
    { id: 802, name: "Islamic Relief India", desc: "Humanitarian aid and development", flag: "🇮🇳", method: "wire", cat: "Relief" },
    { id: 803, name: "Mercy Mission India", desc: "Community welfare, education", flag: "🇮🇳", method: "wire", cat: "Education" },
    { id: 804, name: "Association of Muslim Professionals", desc: "Skills & livelihood programs", flag: "🇮🇳", method: "wire", cat: "Community" },
  ],
  BD: [
    { id: 901, name: "Islamic Relief Bangladesh", desc: "Disaster response, education", flag: "🇧🇩", method: "wire", cat: "Relief" },
    { id: 902, name: "Muslim Aid Bangladesh", desc: "Community development programs", flag: "🇧🇩", method: "wire", cat: "Community" },
    { id: 903, name: "Center for Zakat Management", desc: "Professional zakat distribution", flag: "🇧🇩", method: "wire", cat: "Zakat" },
  ],
  TR: [
    { id: 1001, name: "IHH Humanitarian Relief", desc: "Global aid from Turkey", flag: "🇹🇷", method: "wire", cat: "Relief" },
    { id: 1002, name: "Diyanet Foundation", desc: "Official religious affairs foundation", flag: "🇹🇷", method: "wire", cat: "Zakat" },
    { id: 1003, name: "Türk Kızılay (Red Crescent)", desc: "Turkish national humanitarian", flag: "🇹🇷", method: "wire", cat: "Relief" },
    { id: 1004, name: "Deniz Feneri", desc: "Social aid and development", flag: "🇹🇷", method: "wire", cat: "Welfare" },
  ],
  EG: [
    { id: 1101, name: "Misr El Kheir Foundation", desc: "Largest Egyptian development NGO", flag: "🇪🇬", method: "wire", cat: "Relief" },
    { id: 1102, name: "Egyptian Red Crescent", desc: "National humanitarian services", flag: "🇪🇬", method: "wire", cat: "Relief" },
    { id: 1103, name: "Orman Association", desc: "Community welfare since 1960", flag: "🇪🇬", method: "wire", cat: "Community" },
    { id: 1104, name: "Resala Charity", desc: "Youth-led volunteering and aid", flag: "🇪🇬", method: "wire", cat: "Community" },
  ],
  MY: [
    { id: 1201, name: "Lembaga Zakat Selangor", desc: "State zakat authority (Selangor)", flag: "🇲🇾", method: "wire", cat: "Zakat" },
    { id: 1202, name: "Pusat Pungutan Zakat (PPZ)", desc: "Federal Territories zakat center", flag: "🇲🇾", method: "wire", cat: "Zakat" },
    { id: 1203, name: "Islamic Relief Malaysia", desc: "Malaysian humanitarian programs", flag: "🇲🇾", method: "wire", cat: "Relief" },
    { id: 1204, name: "Global Peace Mission", desc: "Relief and disaster response", flag: "🇲🇾", method: "wire", cat: "Relief" },
  ],
  ID: [
    { id: 1301, name: "BAZNAS", desc: "National zakat agency of Indonesia", flag: "🇮🇩", method: "wire", cat: "Zakat" },
    { id: 1302, name: "Dompet Dhuafa", desc: "Social enterprise and humanitarian", flag: "🇮🇩", method: "wire", cat: "Relief" },
    { id: 1303, name: "Rumah Zakat", desc: "Empowerment-based zakat distribution", flag: "🇮🇩", method: "wire", cat: "Zakat" },
    { id: 1304, name: "Lazismu (Muhammadiyah)", desc: "Zakat through Muhammadiyah network", flag: "🇮🇩", method: "wire", cat: "Zakat" },
  ],
  NG: [
    { id: 1401, name: "Muslim Corpers Association", desc: "Community welfare, youth empowerment", flag: "🇳🇬", method: "wire", cat: "Community" },
    { id: 1402, name: "Zakat & Sadaqat Foundation", desc: "Zakat distribution across Nigeria", flag: "🇳🇬", method: "wire", cat: "Zakat" },
    { id: 1403, name: "Muslim Aid Nigeria", desc: "Education and poverty relief", flag: "🇳🇬", method: "wire", cat: "Relief" },
  ],
  ZA: [
    { id: 1501, name: "South African National Zakah Fund", desc: "National zakat collection body", flag: "🇿🇦", method: "wire", cat: "Zakat" },
    { id: 1502, name: "Africa Muslims Agency", desc: "Community development programs", flag: "🇿🇦", method: "wire", cat: "Community" },
    { id: 1503, name: "Islamic Relief South Africa", desc: "Humanitarian programs in Southern Africa", flag: "🇿🇦", method: "wire", cat: "Relief" },
    { id: 1504, name: "Gift of the Givers", desc: "Largest African disaster response NGO", flag: "🇿🇦", method: "wire", cat: "Relief" },
  ],
  AU: [
    { id: 1601, name: "National Zakat Foundation Australia", desc: "Australian zakat collection", flag: "🇦🇺", method: "stripe", cat: "Zakat" },
    { id: 1602, name: "Islamic Relief Australia", desc: "Australian humanitarian programs", flag: "🇦🇺", method: "stripe", cat: "Relief" },
    { id: 1603, name: "Human Appeal Australia", desc: "Emergency relief and development", flag: "🇦🇺", method: "stripe", cat: "Relief" },
  ],
};

// Fallback: countries without specific orgs use GLOBAL
const getCountryOrgs = (countryCode) => COUNTRY_ORGS[countryCode] || COUNTRY_ORGS.GLOBAL;
const getCountryBanks = (countryCode) => COUNTRY_BANKS[countryCode] || COUNTRY_BANKS.GLOBAL;

const CONNECTED_BANKS = [];

const CONNECTED_ACCOUNTS = [];

const PIE_COLORS = ["#1B5E20", "#2E7D32", "#43A047", "#66BB6A", "#81C784", "#A5D6A7"];

// ─── Internationalization (i18n) ───
const TRANSLATIONS = {
  "dashboard": { en: "Dashboard", ar: "لوحة التحكم", ur: "ڈیش بورڈ", tr: "Kontrol Paneli", ms: "Papan Pemimpin", id: "Dasbor", fr: "Tableau de Bord", es: "Panel de Control", de: "Kontrollzentrum", bn: "ড্যাশবোর্ড" },
  "calculator": { en: "Calculator", ar: "حاسبة", ur: "کیلکولیٹر", tr: "Hesaplayıcı", ms: "Kalkulator", id: "Kalkulator", fr: "Calculatrice", es: "Calculadora", de: "Rechner", bn: "ক্যালকুলেটর" },
  "accounts": { en: "Accounts", ar: "الحسابات", ur: "اکاؤنٹس", tr: "Hesaplar", ms: "Akaun", id: "Akun", fr: "Comptes", es: "Cuentas", de: "Konten", bn: "অ্যাকাউন্ট" },
  "payments": { en: "Payments", ar: "الدفعات", ur: "ادائیگیاں", tr: "Ödemeler", ms: "Pembayaran", id: "Pembayaran", fr: "Paiements", es: "Pagos", de: "Zahlungen", bn: "পেমেন্ট" },
  "pay_zakat": { en: "Pay Zakat", ar: "دفع الزكاة", ur: "زکوۃ ادا کریں", tr: "Zakat Ödeme", ms: "Bayar Zakat", id: "Bayar Zakat", fr: "Payer la Zakat", es: "Pagar Zakat", de: "Zakat zahlen", bn: "জাকাত প্রদান করুন" },
  "livestock": { en: "Livestock", ar: "الماشية", ur: "مویشی", tr: "Canlı Hayvan", ms: "Ternakan", id: "Ternak", fr: "Bétail", es: "Ganadería", de: "Vieh", bn: "গবাদি পশু" },
  "agriculture": { en: "Agriculture", ar: "الزراعة", ur: "زراعت", tr: "Tarım", ms: "Pertanian", id: "Pertanian", fr: "Agriculture", es: "Agricultura", de: "Landwirtschaft", bn: "কৃষি" },
  "mining": { en: "Mining & Minerals", ar: "التعدين والمعادن", ur: "کھان کنی اور معادن", tr: "Madencilik ve Mineraller", ms: "Perlombongan dan Mineral", id: "Pertambangan dan Mineral", fr: "Exploitation minière et minéraux", es: "Minería y Minerales", de: "Bergbau und Mineralien", bn: "খনন এবং খনিজ" },
  "rental": { en: "Rental Income", ar: "دخل الإيجار", ur: "کرائے کی آمدنی", tr: "Kira Geliri", ms: "Pendapatan Sewa", id: "Pendapatan Sewa", fr: "Revenu Locatif", es: "Ingresos por Alquiler", de: "Mieteinnahmen", bn: "ভাড়া আয়" },
  "precise_zakat_calculation": { en: "Precise Zakat Calculation", ar: "حساب الزكاة الدقيق", ur: "درست زکوۃ کا حساب", tr: "Kesin Zakat Hesaplaması", ms: "Pengiraan Zakat Tepat", id: "Perhitungan Zakat Presisi", fr: "Calcul Zakat Précis", es: "Cálculo Preciso de Zakat", de: "Genaue Zakatberechnung", bn: "সঠিক জাকাত গণনা" },
  "total_wealth": { en: "Total Wealth", ar: "إجمالي الثروة", ur: "کل دولت", tr: "Toplam Servet", ms: "Jumlah Kekayaan", id: "Total Kekayaan", fr: "Richesse Totale", es: "Riqueza Total", de: "Gesamtvermögen", bn: "মোট সম্পদ" },
  "zakat_due": { en: "Zakat Due (2.5%)", ar: "الزكاة المستحقة (2.5%)", ur: "واجب زکوۃ (2.5%)", tr: "Vadesi Gelen Zakat (2.5%)", ms: "Zakat Terhutang (2.5%)", id: "Zakat Jatuh Tempo (2.5%)", fr: "Zakat Due (2.5%)", es: "Zakat Vencida (2.5%)", de: "Fällige Zakat (2,5%)", bn: "বাকি জাকাত (2.5%)" },
  "total_paid": { en: "Total Paid", ar: "إجمالي المدفوع", ur: "کل ادا کردہ", tr: "Toplam Ödenen", ms: "Jumlah Dibayar", id: "Total Dibayar", fr: "Total Payé", es: "Total Pagado", de: "Gesamtzahlung", bn: "মোট প্রদত্ত" },
  "remaining": { en: "Remaining", ar: "المتبقي", ur: "باقی", tr: "Kalan", ms: "Baki", id: "Tersisa", fr: "Restant", es: "Restante", de: "Verbleibend", bn: "অবশিষ্ট" },
  "on_zakatable_assets": { en: "On zakatable assets", ar: "على الأصول الخاضعة للزكاة", ur: "زکوۃ کے قابل اثاثے پر", tr: "Zakat Kapsamındaki Varlıklar Üzerinde", ms: "Atas Aset Berzakat", id: "Pada Aset Zakat", fr: "Sur les actifs zakatable", es: "Sobre activos zakatable", de: "Auf Zakat-fähigen Vermögenswerten", bn: "জাকাতযোগ্য সম্পদের উপর" },
  "complete": { en: "complete", ar: "كامل", ur: "مکمل", tr: "tamamlanmış", ms: "selesai", id: "selesai", fr: "complet", es: "completar", de: "Fertig", bn: "সম্পূর্ণ" },
  "still_owed": { en: "Still owed", ar: "لا يزال مستحقاً", ur: "ابھی بھی قرض", tr: "Hala borçlu", ms: "Masih berhutang", id: "Masih terhutang", fr: "Encore dû", es: "Aún adeudado", de: "Noch geschuldet", bn: "এখনও দেওয়া হয়েছে" },
  "overpaid": { en: "Overpaid — extra sadaqah!", ar: "مدفوع بإفراط - صدقة إضافية!", ur: "زیادہ ادائیگی - اضافی صدقہ!", tr: "Fazla Ödendi - fazladan sadaka!", ms: "Bayaran Berlebihan — sadakah tambahan!", id: "Pembayaran Berlebihan - sedekah tambahan!", fr: "Trop payé - sadaqah supplémentaire!", es: "Pagado en exceso - ¡sadaqah adicional!", de: "Überbezahlt - zusätzliches Sadaqah!", bn: "অতিপ্রদত্ত - অতিরিক্ত সদকা!" },
  "fully_paid": { en: "Fully paid", ar: "مدفوع بالكامل", ur: "مکمل طور پر ادا", tr: "Tamamen ödendi", ms: "Dibayar penuh", id: "Dibayar penuh", fr: "Entièrement payé", es: "Pagado completamente", de: "Vollständig bezahlt", bn: "সম্পূর্ণভাবে প্রদত্ত" },
  "navigation": { en: "Navigation", ar: "الملاحة", ur: "نیویگیشن", tr: "Navigasyon", ms: "Navigasi", id: "Navigasi", fr: "Navigation", es: "Navegación", de: "Navigation", bn: "নেভিগেশন" },
  "current_year": { en: "Current Year", ar: "السنة الحالية", ur: "موجودہ سال", tr: "Cari Yıl", ms: "Tahun Semasa", id: "Tahun Saat Ini", fr: "Année Courante", es: "Año Actual", de: "Aktuelles Jahr", bn: "বর্তমান বছর" },
  "your_name": { en: "Your Name", ar: "اسمك", ur: "آپ کا نام", tr: "Senin Adın", ms: "Nama Anda", id: "Nama Anda", fr: "Votre Nom", es: "Tu Nombre", de: "Ihr Name", bn: "আপনার নাম" },
  "profile_settings": { en: "Profile & Settings", ar: "الملف الشخصي والإعدادات", ur: "پروفائل اور ترتیبات", tr: "Profil ve Ayarlar", ms: "Profil & Tetapan", id: "Profil & Pengaturan", fr: "Profil et paramètres", es: "Perfil y configuración", de: "Profil & Einstellungen", bn: "প্রোফাইল এবং সেটিংস" },
  "security_2fa": { en: "Security (2FA)", ar: "الأمان (2FA)", ur: "سیکیورٹی (2FA)", tr: "Güvenlik (2FA)", ms: "Keamanan (2FA)", id: "Keamanan (2FA)", fr: "Sécurité (2FA)", es: "Seguridad (2FA)", de: "Sicherheit (2FA)", bn: "নিরাপত্তা (2FA)" },
  "billing": { en: "Billing", ar: "الفواتير", ur: "بلنگ", tr: "Faturalandırma", ms: "Pengebilan", id: "Penagihan", fr: "Facturation", es: "Facturación", de: "Abrechnung", bn: "বিলিং" },
  "connected_banks": { en: "Connected Banks", ar: "البنوك المتصلة", ur: "منسلک بینک", tr: "Bağlı Bankalar", ms: "Bank Bersambung", id: "Bank Terhubung", fr: "Banques Connectées", es: "Bancos Conectados", de: "Verbundene Banken", bn: "সংযুক্ত ব্যাংক" },
  "sign_out": { en: "Sign Out", ar: "تسجيل الخروج", ur: "سائن آؤٹ", tr: "Oturumu Kapat", ms: "Log Keluar", id: "Keluar", fr: "Se Déconnecter", es: "Cerrar Sesión", de: "Abmelden", bn: "সাইন আউট" },
  "gold_jewelry": { en: "Gold & Jewelry", ar: "الذهب والمجوهرات", ur: "سونا اور زیورات", tr: "Altın ve Mücevher", ms: "Emas dan Perhiasan", id: "Emas dan Perhiasan", fr: "Or et Bijoux", es: "Oro y Joyas", de: "Gold und Schmuck", bn: "সোনা এবং গহনা" },
  "cash_home": { en: "Cash at Home", ar: "النقد في المنزل", ur: "گھر میں نقد", tr: "Evde Nakit", ms: "Tunai di Rumah", id: "Tunai di Rumah", fr: "Espèces à la Maison", es: "Dinero en Casa", de: "Bargeld zu Hause", bn: "বাড়িতে নগদ অর্থ" },
  "investments": { en: "Investments", ar: "الاستثمارات", ur: "سرمایہ کاری", tr: "Yatırımlar", ms: "Pelaburan", id: "Investasi", fr: "Investissements", es: "Inversiones", de: "Investitionen", bn: "বিনিয়োগ" },
  "business_inventory": { en: "Business Inventory", ar: "جرد الأعمال", ur: "کاروباری انوینٹری", tr: "İşletme Envanteri", ms: "Inventori Perniagaan", id: "Inventaris Bisnis", fr: "Inventaire Commercial", es: "Inventario Comercial", de: "Geschäftsinventar", bn: "ব্যবসায়িক ইনভেন্টরি" },
  "debts_owed": { en: "Debts Owed to You", ar: "الديون المستحقة لك", ur: "آپ کو قرض", tr: "Size Borclu Borçlar", ms: "Hutang yang Terhutang kepada Anda", id: "Utang yang Terhutang kepada Anda", fr: "Dettes qui vous sont dues", es: "Deudas que te deben", de: "Schulden, die dir geschuldet werden", bn: "আপনার কাছে বাকি ঋণ" },
  "other_assets": { en: "Other Zakatable Assets", ar: "الأصول الأخرى الخاضعة للزكاة", ur: "دیگر زکوۃ کے قابل اثاثے", tr: "Diğer Zakat Kapsamındaki Varlıklar", ms: "Aset Berzakat Lain", id: "Aset Zakat Lainnya", fr: "Autres actifs zakatable", es: "Otros activos zakatable", de: "Andere zakat-fähige Vermögenswerte", bn: "অন্যান্য জাকাতযোগ্য সম্পদ" },
  "zakat_calc_summary": { en: "Zakat Calculation Summary", ar: "ملخص حساب الزكاة", ur: "زکوۃ کے حساب کا خلاصہ", tr: "Zakat Hesaplama Özeti", ms: "Ringkasan Pengiraan Zakat", id: "Ringkasan Perhitungan Zakat", fr: "Résumé du calcul de la zakat", es: "Resumen del cálculo de la zakat", de: "Zusammenfassung der Zakatberechnung", bn: "জাকাত গণনা সারসংক্ষেপ" },
  "pay_zakat_btn": { en: "Pay Zakat →", ar: "دفع الزكاة →", ur: "زکوۃ ادا کریں →", tr: "Zakat Ödeme →", ms: "Bayar Zakat →", id: "Bayar Zakat →", fr: "Payer la Zakat →", es: "Pagar Zakat →", de: "Zakat zahlen →", bn: "জাকাত প্রদান করুন →" },
  "year_overview": { en: "Year", ar: "السنة", ur: "سال", tr: "Yıl", ms: "Tahun", id: "Tahun", fr: "Année", es: "Año", de: "Jahr", bn: "বছর" },
  "ah_suffix": { en: "AH", ar: "هـ", ur: "ہ", tr: "H", ms: "H", id: "H", fr: "H", es: "H", de: "H", bn: "হ" },
  "livestock_zakat": { en: "Livestock Zakat", ar: "زكاة الماشية", ur: "مویشی کا زکوۃ", tr: "Canlı Hayvan Zakat", ms: "Zakat Ternakan", id: "Zakat Ternak", fr: "Zakat du Bétail", es: "Zakat de Ganadería", de: "Vieh-Zakat", bn: "গবাদি পশুর জাকাত" },
  "agricultural_zakat": { en: "Agricultural Zakat", ar: "زكاة المحاصيل", ur: "زراعی زکوۃ", tr: "Tarımsal Zakat", ms: "Zakat Pertanian", id: "Zakat Pertanian", fr: "Zakat Agricole", es: "Zakat Agrícola", de: "Landwirtschaftliche Zakat", bn: "কৃষি জাকাত" },
  "mining_zakat": { en: "Mining & Minerals", ar: "التعدين والمعادن", ur: "کھان کنی اور معادن کا زکوۃ", tr: "Madencilik ve Mineraller Zakat", ms: "Zakat Perlombongan dan Mineral", id: "Zakat Pertambangan dan Mineral", fr: "Zakat d'Exploitation Minière et Minéraux", es: "Zakat de Minería y Minerales", de: "Zakat für Bergbau und Mineralien", bn: "খনন এবং খনিজ জাকাত" },
  "rental_zakat": { en: "Rental Income Zakat", ar: "زكاة دخل الإيجار", ur: "کرائے کی آمدنی کا زکوۃ", tr: "Kira Geliri Zakat", ms: "Zakat Pendapatan Sewa", id: "Zakat Pendapatan Sewa", fr: "Zakat du Revenu Locatif", es: "Zakat de Ingresos por Alquiler", de: "Zakat der Mieteinnahmen", bn: "ভাড়া আয়ের জাকাত" },
  "report": { en: "Report", ar: "تقرير", ur: "رپورٹ", tr: "Rapor", ms: "Laporan", id: "Laporan", fr: "Rapport", es: "Reporte", de: "Bericht", bn: "প্রতিবেদন" },
  "connect_bank": { en: "Connect Bank", ar: "ربط البنك", ur: "بینک سے جڑیں", tr: "Banka Bağlan", ms: "Sambungkan Bank", id: "Sambungkan Bank", fr: "Connecter la Banque", es: "Conectar Banco", de: "Bank verbinden", bn: "ব্যাংক সংযুক্ত করুন" },
  "connect_account": { en: "Connect Account", ar: "ربط الحساب", ur: "اکاؤنٹ سے جڑیں", tr: "Hesabı Bağla", ms: "Sambungkan Akaun", id: "Sambungkan Akun", fr: "Connecter le Compte", es: "Conectar Cuenta", de: "Konto verbinden", bn: "অ্যাকাউন্ট সংযুক্ত করুন" },
  "item": { en: "Item", ar: "عنصر", ur: "چیز", tr: "Öğe", ms: "Item", id: "Item", fr: "Article", es: "Artículo", de: "Element", bn: "বস্তু" },
  "weight": { en: "Weight", ar: "الوزن", ur: "وزن", tr: "Ağırlık", ms: "Berat", id: "Berat", fr: "Poids", es: "Peso", de: "Gewicht", bn: "ওজন" },
  "net_gold": { en: "Net Gold", ar: "صافي الذهب", ur: "خالص سونا", tr: "Net Altın", ms: "Emas Bersih", id: "Emas Bersih", fr: "Or Net", es: "Oro Neto", de: "Nettogold", bn: "নিট সোনা" },
  "value": { en: "Value", ar: "القيمة", ur: "قیمت", tr: "Değer", ms: "Nilai", id: "Nilai", fr: "Valeur", es: "Valor", de: "Wert", bn: "মূল্য" },
  "zakat": { en: "Zakat", ar: "الزكاة", ur: "زکوۃ", tr: "Zakat", ms: "Zakat", id: "Zakat", fr: "Zakat", es: "Zakat", de: "Zakat", bn: "জাকাত" },
  "recipient": { en: "Recipient", ar: "المستقبل", ur: "وصول کنندہ", tr: "Alıcı", ms: "Penerima", id: "Penerima", fr: "Destinataire", es: "Destinatario", de: "Empfänger", bn: "প্রাপক" },
  "amount": { en: "Amount", ar: "كمية", ur: "رقم", tr: "Miktar", ms: "Jumlah", id: "Jumlah", fr: "Montant", es: "Cantidad", de: "Betrag", bn: "পরিমাণ" },
  "method": { en: "Method", ar: "الطريقة", ur: "طریقہ", tr: "Yöntem", ms: "Kaedah", id: "Metode", fr: "Méthode", es: "Método", de: "Methode", bn: "পদ্ধতি" },
  "candles": { en: "Camels", ar: "الإبل", ur: "اونٹ", tr: "Develer", ms: "Unta", id: "Unta", fr: "Chameaux", es: "Camellos", de: "Kamele", bn: "উট" },
  "cattle": { en: "Cattle", ar: "الماشية", ur: "گائے", tr: "Sığır", ms: "Lembu", id: "Sapi", fr: "Bovins", es: "Ganado", de: "Rinder", bn: "গরু" },
  "sheep": { en: "Sheep/Goats", ar: "الأغنام/الماعز", ur: "بھیڑیں/بکریاں", tr: "Koyun/Keçi", ms: "Biri Domba/Kambing", id: "Domba/Kambing", fr: "Moutons/Chèvres", es: "Ovejas/Cabras", de: "Schafe/Ziegen", bn: "ভেড়া/ছাগল" },
  "add_year": { en: "Add Year", ar: "إضافة سنة", ur: "سال شامل کریں", tr: "Yıl Ekle", ms: "Tambah Tahun", id: "Tambah Tahun", fr: "Ajouter une année", es: "Añadir año", de: "Jahr hinzufügen", bn: "বছর যোগ করুন" },
  "gregorian_year": { en: "Gregorian Year", ar: "السنة الميلادية", ur: "میلادی سال", tr: "Miladi Yıl", ms: "Tahun Gregorian", id: "Tahun Gregorian", fr: "Année grégorienne", es: "Año gregoriano", de: "Gregorianisches Jahr", bn: "গ্রেগরিয়ান বছর" },
  "hijri_year": { en: "Hijri Year", ar: "السنة الهجرية", ur: "ہجری سال", tr: "Hicri Yıl", ms: "Tahun Hijrah", id: "Tahun Hijri", fr: "Année hijri", es: "Año hijri", de: "Hijri-Jahr", bn: "হিজরি বছর" },
  "no_data_yet": { en: "No data for this year yet", ar: "لا توجد بيانات لهذه السنة حتى الآن", ur: "اب تک اس سال کے لیے کوئی ڈیٹا نہیں", tr: "Bu yıl için henüz veri yok", ms: "Belum ada data untuk tahun ini", id: "Belum ada data untuk tahun ini", fr: "Pas encore de données pour cette année", es: "Sin datos para este año todavía", de: "Noch keine Daten für dieses Jahr", bn: "এই বছরের জন্য এখনও কোন ডেটা নেই" },
  "cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ کریں", tr: "İptal", ms: "Batal", id: "Batal", fr: "Annuler", es: "Cancelar", de: "Abbrechen", bn: "বাতিল করুন" },
};


// ─── Madhab (School of Thought) Definitions ───
const MADHABS = [
  { id: "hanafi", name: "Hanafi", nameAr: "حنفي", desc: "Imam Abu Hanifa (d. 767 CE)" },
  { id: "maliki", name: "Maliki", nameAr: "مالكي", desc: "Imam Malik ibn Anas (d. 795 CE)" },
  { id: "shafii", name: "Shafi'i", nameAr: "شافعي", desc: "Imam Al-Shafi'i (d. 820 CE)" },
  { id: "hanbali", name: "Hanbali", nameAr: "حنبلي", desc: "Imam Ahmad ibn Hanbal (d. 855 CE)" },
  { id: "jafari", name: "Ja'fari (Shia Twelver)", nameAr: "جعفري", desc: "Imam Ja'far al-Sadiq (d. 765 CE)" },
  { id: "zaydi", name: "Zaydi (Shia)", nameAr: "زيدي", desc: "Imam Zayd ibn Ali (d. 740 CE)" },
  { id: "salafi", name: "Salafi / Ahl al-Hadith", nameAr: "سلفي / أهل الحديث", desc: "Follows direct textual evidence" },
];

// Madhab-specific zakat rules
const MADHAB_RULES = {
  hanafi: {
    jewelryZakatable: true,      // All gold/silver jewelry is zakatable, even if worn
    goldNisabGrams: 87.48,       // 20 mithqal = 87.48g
    silverNisabGrams: 612.36,    // 200 dirhams = 612.36g
    agriculturalNisab: 0,        // Abu Hanifa: no minimum nisab for crops
    allCropsZakatable: true,     // Zakat on ALL produce from land
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true, // On net savings from rental
    cryptoZakatable: true,
    notes: [
      "Gold/silver jewelry is zakatable even if worn regularly",
      "Agricultural zakat applies to all crops — no minimum nisab (Abu Hanifa's view)",
      "Deduct debts from total assets before calculating zakat",
    ],
  },
  maliki: {
    jewelryZakatable: false,     // No zakat on personal-use jewelry (within reason)
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,      // 5 wasq (653 kg) — staple foods only
    allCropsZakatable: false,    // Only on staple foods (grains, dates, etc.)
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true,
    cryptoZakatable: true,
    notes: [
      "Personal-use jewelry is exempt from zakat (within customary amounts)",
      "Agricultural zakat only on staple foods — nisab is 653 kg (5 wasq)",
      "Debts owed to others can be deducted from zakatable wealth",
    ],
  },
  shafii: {
    jewelryZakatable: false,
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,
    allCropsZakatable: false,    // Only storable staple crops
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true,
    cryptoZakatable: true,
    notes: [
      "Personal-use jewelry is exempt from zakat",
      "Agricultural zakat on storable staple crops only — nisab is 653 kg",
      "Only immediate debts due within the year are deductible",
    ],
  },
  hanbali: {
    jewelryZakatable: false,
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,
    allCropsZakatable: false,    // Storable staple foods
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true,
    cryptoZakatable: true,
    notes: [
      "Personal-use jewelry is exempt from zakat (majority view in the school)",
      "Agricultural zakat on crops that can be stored and are staple foods",
      "All debts can reduce zakatable wealth",
    ],
  },
  jafari: {
    jewelryZakatable: false,     // No zakat on jewelry in personal use
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,
    allCropsZakatable: false,    // Only wheat, barley, dates, raisins
    businessInventoryRate: 0,    // No zakat on trade goods — khums applies instead
    tradeGoodsZakatable: false,
    rentalIncomeZakatable: false,// Khums applies, not zakat
    cryptoZakatable: false,      // Falls under khums
    hasKhums: true,
    khumsRate: 0.2,              // 20% on annual surplus
    notes: [
      "Zakat applies only to: gold, silver, wheat, barley, dates, raisins, camels, cattle, sheep",
      "No zakat on business inventory or trade goods — khums (20%) applies to annual surplus",
      "Khums is due on all surplus income after annual expenses",
      "Personal-use jewelry is exempt from zakat",
    ],
  },
  zaydi: {
    jewelryZakatable: true,      // Similar to Hanafi on jewelry
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,
    allCropsZakatable: true,     // All agricultural produce
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true,
    cryptoZakatable: true,
    notes: [
      "Gold/silver jewelry is zakatable (similar to Hanafi position)",
      "Agricultural zakat applies to all crops with a nisab of 653 kg",
      "Trade goods and business inventory are zakatable at 2.5%",
    ],
  },
  salafi: {
    jewelryZakatable: true,      // Follow hadith evidence — zakat on all gold/silver
    goldNisabGrams: 85,
    silverNisabGrams: 595,
    agriculturalNisab: 653,
    allCropsZakatable: true,     // Broad interpretation — all produce from the earth
    businessInventoryRate: 0.025,
    tradeGoodsZakatable: true,
    rentalIncomeZakatable: true,
    cryptoZakatable: true,
    notes: [
      "Zakat is due on ALL gold and silver, including jewelry (based on hadith evidence)",
      "Agricultural zakat on all produce of the earth — nisab of 653 kg for grains",
      "Follows direct textual evidence from Quran and Sahih hadith",
    ],
  },
};

export default function ZakatukumPreview() {
  // Get Supabase client (lazy init — ensures env vars are available at runtime)
  const supabase = getSupabase();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); // true while checking session on mount
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [session, setSession] = useState(null);

  const [view, setView] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [madhab, setMadhab] = useState("hanafi");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("GLOBAL");

  // Currency-aware formatters
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  fmt = (n) => { try { return new Intl.NumberFormat(currencyInfo.locale, { style: "currency", currency: currencyInfo.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0); } catch { return `${currencyInfo.symbol}${Math.round(n || 0).toLocaleString()}`; } };
  fmtFull = (n) => { try { return new Intl.NumberFormat(currencyInfo.locale, { style: "currency", currency: currencyInfo.code, minimumFractionDigits: 2 }).format(n || 0); } catch { return `${currencyInfo.symbol}${(n || 0).toFixed(2)}`; } };
  fmtShort = (n) => { const s = currencyInfo.symbol; if (n >= 1000000) return `${s}${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `${s}${(n/1000).toFixed(1)}K`; return fmt(n); };

  // Initialize with current year
  const currentGreg = new Date().getFullYear();
  const currentHijri = getHijriYear(currentGreg);
  const defaultYearKey = `${currentGreg}-${currentHijri}`;

  const emptyYearData = {
    goldPrice: 0,
    cash: 0,
    inv: 0,
    gold: 0,
    paid: 0,
    due: 0,
    goldItems: [],
    investments: [],
    payments: [],
    connectedAccounts: [],
    manualEntries: {
      cashHome: "",
      goldItems: [],
      debtsOwed: [{ person: "", amount: "", expectedDate: "" }],
      businessInventory: "",
      otherAssets: [{ description: "", value: "" }],
    },
    livestock: { camels: 0, cattle: 0, sheep: 0 },
    agriculture: { cropType: "", weight: 0, unit: "kg", irrigated: true, marketValue: 0 },
    mining: { minerals: 0, rikaz: 0 },
    rental: { monthlyIncome: 0, expenses: 0, months: 12 },
  };

  const [yearlyData, setYearlyData] = useState({
    [defaultYearKey]: { ...emptyYearData }
  });
  const [selectedYear, setSelectedYear] = useState(defaultYearKey);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("card");
  const [orgSearch, setOrgSearch] = useState("");
  const [showPlaid, setShowPlaid] = useState(false);
  const [plaidStep, setPlaidStep] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(0);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [retirementOptions, setRetirementOptions] = useState({});
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  // ─── Check session on mount & listen for auth changes ───
  useEffect(() => {
    if (!supabase) { setAuthChecking(false); return; }
    // Check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        setSession(s);
        setUserId(s.user.id);
        setUserEmail(s.user.email);
        setUserName(s.user.user_metadata?.name || s.user.email?.split("@")[0] || "User");
        // Load profile preferences
        supabase.from("profiles").select("*").eq("id", s.user.id).single().then(({ data: profile }) => {
          if (profile) {
            if (profile.country) setCountry(profile.country);
            if (profile.currency) setCurrency(profile.currency);
            if (profile.madhab) setMadhab(profile.madhab);
            if (profile.lang) setLang(profile.lang);
          }
        });
        setIsLoggedIn(true);
      }
      setAuthChecking(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        setSession(s);
        setUserId(s.user.id);
        setUserEmail(s.user.email);
        setUserName(s.user.user_metadata?.name || s.user.email?.split("@")[0] || "User");
        setIsLoggedIn(true);
      } else {
        setSession(null);
        setUserId(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Load zakat data from Supabase when logged in ───
  useEffect(() => {
    if (!isLoggedIn || !session || !supabase) return;
    const loadData = async () => {
      const { data, error } = await supabase
        .from("zakat_years")
        .select("*")
        .order("hijri_year", { ascending: false });
      if (data && data.length > 0) {
        const loaded = {};
        data.forEach(row => {
          const key = `${row.greg_year}-${row.hijri_year}`;
          loaded[key] = {
            goldPrice: 0,
            cash: Number(row.cash) || 0,
            inv: 0,
            gold: Number(row.gold_grams) || 0,
            paid: 0,
            due: Number(row.total_zakat) || 0,
            goldItems: [],
            investments: row.investments || [],
            payments: [],
            connectedAccounts: [],
            manualEntries: {
              cashHome: String(Number(row.cash) || ""),
              goldItems: [],
              debtsOwed: [{ person: "", amount: String(Number(row.debts_owed) || ""), expectedDate: "" }],
              businessInventory: String(Number(row.business_inventory) || ""),
              otherAssets: [{ description: "", value: "" }],
            },
            livestock: row.livestock || { camels: 0, cattle: 0, sheep: 0 },
            agriculture: row.agriculture || { cropType: "", weight: 0, unit: "kg", irrigated: true, marketValue: 0 },
            mining: { minerals: Number(row.mining_value) || 0, rikaz: 0 },
            rental: row.rental || { monthlyIncome: 0, expenses: 0, months: 12 },
            _dbId: row.id, // track database row id
          };
        });
        setYearlyData(prev => ({ ...prev, ...loaded }));
      }
    };
    loadData();
  }, [isLoggedIn, session]);

  // ─── Auto-save zakat data to Supabase (debounced) ───
  const saveToSupabase = useCallback(async (yearKey, data) => {
    if (!session || !userId || !supabase) return;
    const [greg, hijri] = yearKey.split("-").map(Number);
    if (!greg || !hijri) return;
    const payload = {
      hijri_year: hijri,
      greg_year: greg,
      cash: Number(data.cash) || 0,
      savings: Number(data.manualEntries?.cashHome) || 0,
      gold_grams: Number(data.gold) || 0,
      gold_value: Number(data.goldItems?.reduce?.((s, i) => s + (Number(i.value) || 0), 0)) || 0,
      investments: data.investments || [],
      business_inventory: Number(data.manualEntries?.businessInventory) || 0,
      rental: data.rental || {},
      agriculture: data.agriculture || {},
      livestock: data.livestock || {},
      mining_value: Number(data.mining?.minerals) || 0,
      debts_owed: Number(data.manualEntries?.debtsOwed?.[0]?.amount) || 0,
      total_zakat: Number(data.due) || 0,
      total_assets: Number(data.cash) + Number(data.inv) + Number(data.gold) || 0,
    };
    await supabase.from("zakat_years").upsert(
      { ...payload, user_id: userId },
      { onConflict: "user_id,hijri_year" }
    );
  }, [session, userId]);

  // Save whenever yearlyData changes (with debounce)
  useEffect(() => {
    if (!isLoggedIn || !session) return;
    const timer = setTimeout(() => {
      const data = yearlyData[selectedYear];
      if (data) saveToSupabase(selectedYear, data);
    }, 2000); // 2 second debounce
    return () => clearTimeout(timer);
  }, [yearlyData, selectedYear, isLoggedIn, session, saveToSupabase]);

  // ─── Auth handler (real Supabase auth) ───
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!authEmail || !authPassword) { setAuthError("Please fill in all fields"); setAuthLoading(false); return; }
    if (authMode === "signup" && !authName) { setAuthError("Please enter your name"); setAuthLoading(false); return; }
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters"); setAuthLoading(false); return; }

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { name: authName, country, currency, madhab },
          },
        });
        if (error) throw error;
        if (data.session) {
          // Auto-confirmed (email confirmation disabled) — save profile prefs
          await supabase.from("profiles").upsert({
            id: data.user.id,
            name: authName,
            email: authEmail,
            country,
            currency,
            madhab,
            lang,
          });
          setUserName(authName);
          setUserEmail(authEmail);
        } else {
          setAuthError("Check your email to confirm your account, then sign in.");
          setAuthLoading(false);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setUserName(data.user.user_metadata?.name || authEmail.split("@")[0]);
        setUserEmail(authEmail);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed");
    }
    setAuthLoading(false);
  };

  // ─── Social login (Google / Apple via Supabase OAuth) ───
  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setAuthError(error.message);
  };

  // ─── Logout ───
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setSession(null);
    setUserId(null);
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setShowUserMenu(false);
    setView("dashboard");
  };

  // ─── Save profile preferences when they change ───
  useEffect(() => {
    if (!userId || !supabase) return;
    const timer = setTimeout(() => {
      supabase.from("profiles").update({ country, currency, madhab, lang }).eq("id", userId);
    }, 1000);
    return () => clearTimeout(timer);
  }, [country, currency, madhab, lang, userId]);

  // Get current madhab rules
  const madhabRules = MADHAB_RULES[madhab];
  const currentMadhab = MADHABS.find(m => m.id === madhab);

  // Translation helper
  const t = (key) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.en || key;

  // Helper to get current year's data
  const currentYearData = yearlyData[selectedYear] || emptyYearData;

  // Helper to update a field in the current year
  const updateCurrentYear = (field, value) => {
    setYearlyData(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [field]: value,
      }
    }));
  };

  // Helper to update nested fields in manualEntries
  const updateManualEntry = (field, value) => {
    setYearlyData(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        manualEntries: {
          ...prev[selectedYear].manualEntries,
          [field]: value,
        }
      }
    }));
  };

  // Helper to update nested fields like livestock, agriculture, etc.
  const updateNestedField = (parentField, field, value) => {
    setYearlyData(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [parentField]: {
          ...prev[selectedYear][parentField],
          [field]: value,
        }
      }
    }));
  };

  // Format year display
  const formatYearDisplay = (yearKey) => {
    const [greg, hijri] = yearKey.split("-");
    return `${greg} / ${hijri} AH`;
  };

  const totalWealth = currentYearData.cash + currentYearData.inv + currentYearData.gold;
  const zakatDue = currentYearData.due || 0;
  const totalPaid = currentYearData.paid || 0;
  const remaining = zakatDue - totalPaid;
  const hijriToday = getHijriString(new Date());

  // Build dashboard data from all years
  const dashData = Object.entries(yearlyData)
    .map(([key, data]) => {
      const [greg, hijri] = key.split("-");
      return {
        year: key,
        shortYear: hijri,
        gregYear: greg,
        ...data,
        totalWealth: data.cash + data.inv + data.gold,
        remaining: (data.due || 0) - (data.paid || 0),
      };
    })
    .sort((a, b) => parseInt(a.gregYear) - parseInt(b.gregYear));

  const categorySummaries = {
    banking: { emoji: "🏦", name: "Banking", accounts: CONNECTED_ACCOUNTS.filter(a => a.category === "banking"), color: "#1565C0" },
    investments: { emoji: "📈", name: "Investments", accounts: CONNECTED_ACCOUNTS.filter(a => a.category === "investments"), color: "#6A1B9A" },
    retirement: { emoji: "🏛️", name: "Retirement", accounts: CONNECTED_ACCOUNTS.filter(a => a.category === "retirement"), color: "#E65100" },
    crypto: { emoji: "₿", name: "Crypto", accounts: CONNECTED_ACCOUNTS.filter(a => a.category === "crypto"), color: "#F57F17" },
    credit: { emoji: "💳", name: "Credit & Loans", accounts: CONNECTED_ACCOUNTS.filter(a => a.category === "credit"), color: "#C62828" },
  };

  const calculateCategoryBalance = (cat) => {
    const accts = categorySummaries[cat].accounts;
    return accts.reduce((sum, a) => sum + a.balance, 0);
  };

  const calculateRetirementZakatable = (accountId) => {
    const acct = CONNECTED_ACCOUNTS.find(a => a.id === accountId);
    if (!acct || acct.category !== "retirement") return 0;
    const option = retirementOptions[accountId];
    if (option === "Full balance") return acct.balance;
    if (option === "Employer match only") return acct.balance * 0.15;
    if (option === "Vested amount only") return acct.balance * 0.8;
    return 0;
  };

  const calculateLivestockZakat = () => {
    let total = 0;
    const { sheep, cattle, camels } = currentYearData.livestock;
    // Simplified calculation: show counts as values for display
    total += sheep * 0.025; // Placeholder for sheep calculation
    total += cattle * 0.025;
    total += camels * 0.025;
    return total;
  };

  const calculateAgriculturalZakat = () => {
    const { weight, marketValue, irrigated } = currentYearData.agriculture;
    const nisab = madhabRules.agriculturalNisab;
    if (nisab > 0 && weight < nisab) return 0; // Below nisab (Hanafi has 0 = no minimum)
    const rate = irrigated ? 0.05 : 0.1;
    return parseFloat(marketValue || 0) * rate;
  };

  const calculateMiningZakat = () => {
    const { minerals, rikaz } = currentYearData.mining;
    const mineralsZakat = parseFloat(minerals || 0) * 0.025;
    const rikazZakat = parseFloat(rikaz || 0) * 0.2;
    return mineralsZakat + rikazZakat;
  };

  const calculateRentalZakat = () => {
    const { monthlyIncome, expenses, months } = currentYearData.rental;
    const monthly = parseFloat(monthlyIncome || 0) - parseFloat(expenses || 0);
    const annual = monthly * (parseFloat(months || 12));
    return annual * 0.025;
  };

  const calculateTotalAssets = () => {
    let total = 0;
    total += calculateCategoryBalance("banking");
    total += calculateCategoryBalance("investments");
    categorySummaries.retirement.accounts.forEach(a => {
      total += calculateRetirementZakatable(a.id);
    });
    total += calculateCategoryBalance("crypto");
    total += parseFloat(currentYearData.manualEntries.cashHome || 0);
    total += currentYearData.manualEntries.goldItems.reduce((s, g) => s + (parseFloat(g.value) || 0), 0);
    total += currentYearData.manualEntries.debtsOwed.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    total += parseFloat(currentYearData.manualEntries.businessInventory || 0);
    total += currentYearData.manualEntries.otherAssets.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
    total += calculateAgriculturalZakat() / 0.025; // Add value equivalent
    total += calculateMiningZakat() / 0.025;
    total += calculateRentalZakat() / 0.025;
    return total;
  };

  const calculateLiabilities = () => {
    let total = 0;
    categorySummaries.credit.accounts.forEach(a => {
      if (a.type === "Credit Card") total += Math.abs(a.balance);
      if (a.type === "Mortgage" && a.monthlyPayment) total += a.monthlyPayment;
      if (a.type === "Student Loan" && a.annualPayment) total += a.annualPayment / 12;
    });
    return total;
  };

  const totalAssetsComputed = calculateTotalAssets();
  const totalLiabilities = calculateLiabilities();
  const netZakatable = totalAssetsComputed - totalLiabilities;
  const zakatComputedDue = netZakatable * 0.025;
  // Khums calculation for Ja'fari/Shia
  const khumsApplicable = madhabRules.hasKhums || false;
  const khumsDue = khumsApplicable ? Math.max(0, netZakatable) * (madhabRules.khumsRate || 0.2) : 0;

  const wealthBreakdown = [
    { name: "Banking", value: calculateCategoryBalance("banking") },
    { name: "Investments", value: calculateCategoryBalance("investments") },
    { name: "Retirement", value: categorySummaries.retirement.accounts.reduce((s, a) => s + calculateRetirementZakatable(a.id), 0) },
    { name: "Crypto", value: calculateCategoryBalance("crypto") },
    { name: "Gold & Jewelry", value: currentYearData.manualEntries.goldItems.reduce((s, g) => s + (parseFloat(g.value) || 0), 0) },
    { name: "Cash at Home", value: parseFloat(currentYearData.manualEntries.cashHome || 0) },
  ].filter(d => d.value > 0);

  const countryOrgs = getCountryOrgs(country);
  const countryBanks = getCountryBanks(country);
  const countryInfo = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];
  const filteredOrgs = countryOrgs.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    o.desc.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const openPay = (org) => { setSelectedOrg(org); setPayAmount(remaining > 0 ? Math.min(remaining, 1000).toString() : "500"); setPayStep(0); setShowPayModal(true); };

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const S = {
    page: { minHeight: "100vh", background: "#f0f4f0", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    header: { background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: { width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
    logoText: { margin: 0, fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.5 },
    logoSub: { margin: 0, fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5, textTransform: "uppercase" },
    headerRight: { display: "flex", alignItems: "center", gap: 10 },
    yearSelect: { padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    headerBtn: { padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
    avatar: { width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", border: "2px solid rgba(255,255,255,0.3)", position: "relative" },
    nav: { width: 190, padding: "16px 10px", flexShrink: 0, background: "#fff", borderRight: "1px solid #e8e8e8", minHeight: "calc(100vh - 60px)" },
    navBtn: (active) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 2, borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, background: active ? "#e8f5e9" : "transparent", color: active ? "#1B5E20" : "#777", transition: "all 0.15s", textAlign: "left" }),
    main: { flex: 1, padding: "20px 28px 40px", minWidth: 0, maxWidth: 1200 },
    card: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" },
    cardHeader: (color) => ({ padding: "12px 18px", background: color || "#1B5E20", display: "flex", justifyContent: "space-between", alignItems: "center" }),
    cardTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: 0.3 },
    cardBody: { padding: "14px 18px" },
    th: { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e8f5e9", color: "#2e7d32", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
    td: { padding: "7px 10px", borderBottom: "1px solid #f5f5f5", fontSize: 13 },
    input: { width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa", boxSizing: "border-box" },
    numInput: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
    greenBtn: { padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(27,94,32,0.3)" },
    stripeBtn: { padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #635BFF, #7C3AED)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,91,255,0.3)" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: 16, width: 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  };

  const MetricCard = ({ label, value, color, sub, borderColor }) => (
    <div style={{ ...S.card, borderLeft: `4px solid ${borderColor || color}`, padding: "16px 18px" }}>
      <p style={{ margin: 0, fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ margin: "5px 0 0", fontSize: 24, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</p>
      {sub && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#999" }}>{sub}</p>}
    </div>
  );

  const SectionCard = ({ title, color, children, action }) => (
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={S.cardHeader(color)}>
        <h3 style={S.cardTitle}>{title}</h3>
        {action}
      </div>
      <div style={S.cardBody}>{children}</div>
    </div>
  );

  // ─── LOADING STATE (checking session) ───
  if (authChecking) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #0D3B0E 0%, #1B5E20 30%, #2E7D32 60%, #388E3C 100%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 }}>☪</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" }}>Zakatukum <span style={{ fontFamily: "'Noto Naskh Arabic', 'Traditional Arabic', serif", fontSize: 22, fontWeight: 600, opacity: 0.85 }}>زكاتكم</span></h1>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ─── LOGIN / SIGNUP PAGE ───
  if (!isLoggedIn) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #0D3B0E 0%, #1B5E20 30%, #2E7D32 60%, #388E3C 100%)" }}>
        <div style={{ width: "100%", maxWidth: 440, margin: "0 20px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 }}>☪</div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Zakatukum <span style={{ fontFamily: "'Noto Naskh Arabic', 'Traditional Arabic', serif", fontSize: 24, fontWeight: 600, opacity: 0.85 }}>زكاتكم</span></h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Precise Zakat Calculation</p>
          </div>

          {/* Auth Card */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, background: "#f5f5f5", padding: 3 }}>
              {["login", "signup"].map(mode => (
                <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: authMode === mode ? "#fff" : "transparent", color: authMode === mode ? "#1B5E20" : "#999", boxShadow: authMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth}>
              {authMode === "signup" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Full Name</label>
                  <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Your full name" style={{ ...S.input, padding: "12px 14px", fontSize: 15 }} />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" style={{ ...S.input, padding: "12px 14px", fontSize: 15 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" style={{ ...S.input, padding: "12px 14px", fontSize: 15 }} />
              </div>

              {authMode === "signup" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>School of Thought (Madhab)</label>
                  <select value={madhab} onChange={e => setMadhab(e.target.value)} style={{ ...S.input, padding: "12px 14px", fontSize: 14, cursor: "pointer" }}>
                    <optgroup label="Sunni Schools">
                      <option value="hanafi">Hanafi — حنفي</option>
                      <option value="maliki">Maliki — مالكي</option>
                      <option value="shafii">Shafi'i — شافعي</option>
                      <option value="hanbali">Hanbali — حنبلي</option>
                    </optgroup>
                    <optgroup label="Shia Schools">
                      <option value="jafari">Ja'fari (Twelver) — جعفري</option>
                      <option value="zaydi">Zaydi — زيدي</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="salafi">Salafi / Ahl al-Hadith — أهل الحديث</option>
                    </optgroup>
                  </select>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#888" }}>{MADHABS.find(m => m.id === madhab)?.desc} — Zakat calculations will follow this school's rulings</p>
                </div>
              )}

              {authMode === "signup" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Country</label>
                  <select value={country} onChange={e => { const c = e.target.value; setCountry(c); if (COUNTRY_CURRENCY[c]) setCurrency(COUNTRY_CURRENCY[c]); }} style={{ ...S.input, padding: "12px 14px", fontSize: 14, cursor: "pointer" }}>
                    <option value="GLOBAL">🌍 International / Global</option>
                    {Object.entries(COUNTRIES.reduce((groups, c) => { if (c.code !== "GLOBAL") { (groups[c.region] = groups[c.region] || []).push(c); } return groups; }, {})).map(([region, countries]) => (
                      <optgroup key={region} label={region}>
                        {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#888" }}>Shows local banks and zakat charities for your country</p>
                </div>
              )}

              {authError && <p style={{ margin: "0 0 16px", fontSize: 13, color: "#C62828", fontWeight: 600 }}>{authError}</p>}

              <button type="submit" disabled={authLoading} style={{ ...S.greenBtn, width: "100%", padding: "14px 0", fontSize: 16, borderRadius: 10, opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {authMode === "login" && (
              <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "#888" }}>
                <span style={{ cursor: "pointer", color: "#1B5E20", fontWeight: 600 }}>Forgot password?</span>
              </p>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              <span style={{ fontSize: 12, color: "#bbb" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            </div>

            {/* Social Login */}
            <div style={{ display: "flex", gap: 10 }}>
              {[["google", "Google", "G"], ["apple", "Apple", ""]].map(([provider, name, icon]) => (
                <button key={provider} onClick={() => handleSocialLogin(provider)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#333" }}>
                  <span style={{ fontSize: 16 }}>{icon}</span> {name}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{...S.page, direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>☪</div>
          <div>
            <h1 style={S.logoText}>Zakatukum <span style={{ fontFamily: "'Noto Naskh Arabic', 'Traditional Arabic', serif", fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 6 }}>زكاتكم</span></h1>
            <p style={S.logoSub}>{t("precise_zakat_calculation")}</p>
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{hijriToday}</span>
          <select value={lang} onChange={e => setLang(e.target.value)} style={S.yearSelect}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="ur">اردو</option>
            <option value="tr">Türkçe</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="bn">বাংলা</option>
          </select>
          <select value={country} onChange={e => { const c = e.target.value; setCountry(c); if (COUNTRY_CURRENCY[c]) setCurrency(COUNTRY_CURRENCY[c]); }} style={{ ...S.yearSelect, maxWidth: 120 }}>
            <option value="GLOBAL">🌍 Global</option>
            {Object.entries(COUNTRIES.reduce((groups, c) => { if (c.code !== "GLOBAL") { (groups[c.region] = groups[c.region] || []).push(c); } return groups; }, {})).map(([region, countries]) => (
              <optgroup key={region} label={region}>
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </optgroup>
            ))}
          </select>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...S.yearSelect, maxWidth: 130 }}>
            {Object.entries(CURRENCY_GROUPS).map(([group, codes]) => (
              <optgroup key={group} label={group}>
                {codes.map(code => { const c = CURRENCIES.find(x => x.code === code); return c ? <option key={code} value={code}>{c.flag} {code}</option> : null; })}
              </optgroup>
            ))}
          </select>
          <select value={madhab} onChange={e => setMadhab(e.target.value)} style={{ ...S.yearSelect, maxWidth: 150 }}>
            <optgroup label="Sunni">
              <option value="hanafi">Hanafi</option>
              <option value="maliki">Maliki</option>
              <option value="shafii">Shafi'i</option>
              <option value="hanbali">Hanbali</option>
            </optgroup>
            <optgroup label="Shia">
              <option value="jafari">Ja'fari</option>
              <option value="zaydi">Zaydi</option>
            </optgroup>
            <optgroup label="Other">
              <option value="salafi">Salafi</option>
            </optgroup>
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={S.yearSelect}>
            {Object.keys(yearlyData).sort((a, b) => parseInt(b.split("-")[0]) - parseInt(a.split("-")[0])).map(yearKey => (
              <option key={yearKey} value={yearKey} style={{ color: "#000" }}>{formatYearDisplay(yearKey)}</option>
            ))}
          </select>
          <button onClick={() => setShowAddYearModal(true)} style={S.headerBtn}>+ {t("add_year")}</button>
          <button style={S.headerBtn}>🖨 {t("report")}</button>
          <div style={S.avatar} onClick={() => setShowUserMenu(!showUserMenu)}>
            {userName ? userName.charAt(0).toUpperCase() : "?"}
            {showUserMenu && (
              <div style={{ position: "absolute", top: 40, right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", width: 240, zIndex: 100, overflow: "hidden" }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#333" }}>{userName || t("your_name")}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#999" }}>{userEmail || "email@example.com"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#1B5E20", fontWeight: 600 }}>{currentMadhab?.name} — {currentMadhab?.nameAr}</p>
                </div>
                {[["profile_settings", false], ["security_2fa", false], ["billing", false], ["connected_banks", false], ["sign_out", true]].map(([key, isLast]) => (
                  <div key={key} onClick={() => { if (isLast) handleLogout(); }} style={{ padding: "10px 18px", fontSize: 13, color: isLast ? "#C62828" : "#555", cursor: "pointer", borderTop: isLast ? "1px solid #f0f0f0" : "none" }}
                    onMouseEnter={e => e.target.style.background = "#f5f5f5"} onMouseLeave={e => e.target.style.background = "transparent"}>
                    {t(key)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <nav style={{...S.nav, direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
          <div style={{ padding: "8px 14px 16px", borderBottom: "1px solid #f0f0f0", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("navigation")}</p>
          </div>
          {[
            { id: "dashboard", icon: "📊", label: t("dashboard") },
            { id: "calculator", icon: "🧮", label: t("calculator") },
            { id: "accounts", icon: "🏦", label: t("accounts") },
            { id: "payments", icon: "📋", label: t("payments") },
            { id: "pay", icon: "💳", label: t("pay_zakat") },
            { id: "livestock", icon: "🐄", label: t("livestock") },
            { id: "agriculture", icon: "🌾", label: t("agriculture") },
            { id: "mining", icon: "⛏️", label: t("mining") },
            { id: "rental", icon: "🏠", label: t("rental") },
          ].map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setShowUserMenu(false); }} style={S.navBtn(view === n.id)}>
              <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
            </button>
          ))}
          <div style={{ marginTop: 20, padding: "14px", background: "#e8f5e9", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#1B5E20", textTransform: "uppercase" }}>{t("current_year")}</p>
            <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 800, color: "#1B5E20" }}>{formatYearDisplay(selectedYear)}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#2E7D32" }}>{t("zakat_due")}: {fmtFull(zakatDue)}</p>
            <button onClick={() => setShowAddYearModal(true)} style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, border: "1px solid #2E7D32", background: "#fff", color: "#1B5E20", fontSize: 11, fontWeight: 600, cursor: "pointer", width: "100%" }}>+ {t("add_year")}</button>
          </div>
        </nav>

        <main style={S.main} onClick={() => setShowUserMenu(false)}>
          {view === "dashboard" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("dashboard")}</h2>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#999" }}>Year {formatYearDisplay(selectedYear)} — Overview</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setView("pay")} style={S.greenBtn}>{t("pay_zakat_btn")}</button>
                </div>
              </div>

              {/* Madhab Info Banner */}
              <div style={{ ...S.card, padding: "14px 18px", marginBottom: 16, background: "linear-gradient(135deg, #FFF8E1, #FFF3C4)", borderLeft: "4px solid #F9A825" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#E65100" }}>📖 {currentMadhab?.name} School ({currentMadhab?.nameAr})</p>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#795548" }}>{currentMadhab?.desc}</p>
                    {madhabRules.notes.slice(0, 2).map((note, i) => (
                      <p key={i} style={{ margin: "3px 0 0", fontSize: 11, color: "#888" }}>• {note}</p>
                    ))}
                    {khumsApplicable && <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 700, color: "#C62828" }}>Khums (20%) on annual surplus also applies — {fmt(khumsDue)}</p>}
                  </div>
                  <select value={madhab} onChange={e => setMadhab(e.target.value)} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #e0c97f", background: "#fff", fontSize: 12, cursor: "pointer", color: "#333", flexShrink: 0 }}>
                    {MADHABS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {CONNECTED_ACCOUNTS.length > 0 && (
                <div style={{ ...S.card, padding: "12px 16px", marginBottom: 16, background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)", borderLeft: "4px solid #2E7D32" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1B5E20" }}>💡 Your accounts are connected! Balances auto-sync from {CONNECTED_ACCOUNTS.length} linked accounts. <span onClick={() => setView("accounts")} style={{ cursor: "pointer", color: "#0D47A1", textDecoration: "underline" }}>Go to Accounts →</span></p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                <MetricCard label={t("total_wealth")} value={fmt(totalWealth)} color="#1B5E20" sub={`${t("gold_jewelry")}: ${fmt(currentYearData.gold)}`} borderColor="#1B5E20" />
                <MetricCard label={t("zakat_due")} value={fmt(zakatDue)} color="#F9A825" sub={t("on_zakatable_assets")} borderColor="#F9A825" />
                <MetricCard label={t("total_paid")} value={fmt(totalPaid)} color="#2E7D32" sub={`${zakatDue > 0 ? Math.min(100, (totalPaid / zakatDue * 100)).toFixed(0) : 0}% ${t("complete")}`} borderColor="#2E7D32" />
                <MetricCard label={t("remaining")} value={fmt(Math.max(0, remaining))} color={remaining > 0 ? "#C62828" : "#2E7D32"} sub={remaining <= 0 ? t("overpaid") : t("still_owed")} borderColor={remaining > 0 ? "#C62828" : "#2E7D32"} />
              </div>

              <div style={{ ...S.card, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Zakat Payment Progress — {formatYearDisplay(selectedYear)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32" }}>{zakatDue > 0 ? Math.min(100, (totalPaid / zakatDue * 100)).toFixed(1) : 0}%</span>
                </div>
                <div style={{ height: 14, background: "#e8f5e9", borderRadius: 7, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${zakatDue > 0 ? Math.min(100, totalPaid / zakatDue * 100) : 0}%`, background: totalPaid >= zakatDue ? "linear-gradient(90deg, #2E7D32, #1B5E20)" : "linear-gradient(90deg, #66BB6A, #2E7D32)", borderRadius: 7, transition: "width 0.8s ease" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                <SectionCard title="Wealth Growth Over Time" color="#1B5E20">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={dashData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="shortYear" fontSize={11} tick={{ fill: "#999" }} />
                      <YAxis fontSize={11} tickFormatter={fmtShort} tick={{ fill: "#999" }} />
                      <Tooltip formatter={v => fmt(v)} labelFormatter={l => `Hijri ${l}`} contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0" }} />
                      <Line type="monotone" dataKey="totalWealth" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 3, fill: "#1B5E20" }} name="Total Wealth" />
                      <Line type="monotone" dataKey="gold" stroke="#F9A825" strokeWidth={1.5} dot={{ r: 2 }} name="Gold Value" />
                    </LineChart>
                  </ResponsiveContainer>
                </SectionCard>

                <SectionCard title="Asset Breakdown" color="#2E7D32">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={wealthBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                        {wealthBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>

              <SectionCard title="Zakat Due vs Paid — All Years" color="#2E7D32">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="shortYear" fontSize={11} tick={{ fill: "#999" }} />
                    <YAxis fontSize={11} tickFormatter={fmtShort} tick={{ fill: "#999" }} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="due" fill="#F9A825" name="Due" radius={[4,4,0,0]} />
                    <Bar dataKey="paid" fill="#2E7D32" name="Paid" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              <SectionCard title="Year-over-Year Summary" color="#1B5E20">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Year", "Gold $/gm", "Gold Value", "Cash", "Investments", "Total", "Due", "Paid", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {dashData.slice().reverse().map((r, i) => (
                        <tr key={r.year} style={i % 2 === 0 ? { background: "#fafafa" } : {}} onMouseEnter={e => e.currentTarget.style.background="#e8f5e9"} onMouseLeave={e => e.currentTarget.style.background = i%2===0?"#fafafa":"transparent"}>
                          <td style={{ ...S.td, fontWeight: 700, color: "#1B5E20", cursor: "pointer" }} onClick={() => { setSelectedYear(r.year); setView("calculator"); }}>{formatYearDisplay(r.year)}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>${r.goldPrice}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{fmt(r.gold)}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{fmt(r.cash)}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{fmt(r.inv)}</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(r.totalWealth)}</td>
                          <td style={{ ...S.td, textAlign: "right", color: "#F9A825", fontWeight: 700 }}>{fmt(r.due)}</td>
                          <td style={{ ...S.td, textAlign: "right", color: "#2E7D32" }}>{fmt(r.paid)}</td>
                          <td style={{ ...S.td, textAlign: "center" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: r.paid >= r.due ? "#C8E6C9" : "#FFF3E0", color: r.paid >= r.due ? "#1B5E20" : "#E65100" }}>
                              {r.paid >= r.due ? "✓ Paid" : `${fmt(r.due - r.paid)} left`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}

          {view === "calculator" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("calculator")}</h2>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#999" }}>{formatYearDisplay(selectedYear)} — Enter your assets to calculate zakat</p>
              <div style={{ padding: "10px 14px", marginBottom: 16, borderRadius: 8, background: "#FFF8E1", border: "1px solid #FFE082", fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: "#E65100" }}>📖 {currentMadhab?.name}:</span>{" "}
                <span style={{ color: "#795548" }}>
                  {madhabRules.jewelryZakatable ? "Personal-use jewelry IS zakatable" : "Personal-use jewelry is EXEMPT"} •{" "}
                  {madhabRules.allCropsZakatable ? "All crops are zakatable" : "Only staple crops are zakatable"} •{" "}
                  Nisab: {madhabRules.goldNisabGrams}g gold
                  {khumsApplicable && " • Khums (20%) applies on surplus"}
                </span>
              </div>

              {CONNECTED_ACCOUNTS.length > 0 && (
                <div style={{ ...S.card, padding: "12px 16px", marginBottom: 16, background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)", borderLeft: "4px solid #2E7D32" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1B5E20" }}>💡 Your accounts are connected! Balances auto-sync from {CONNECTED_ACCOUNTS.length} linked accounts. <span onClick={() => setView("accounts")} style={{ cursor: "pointer", color: "#0D47A1", textDecoration: "underline" }}>Go to Accounts →</span></p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ ...S.card, padding: "14px 18px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Gold Price ({currencyInfo.symbol}/gram)</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input value={currentYearData.goldPrice} onChange={e => updateCurrentYear("goldPrice", parseFloat(e.target.value) || 0)} style={{ ...S.input, ...S.numInput, flex: 1, fontSize: 20, fontWeight: 700, color: "#1B5E20", background: "#FFF8E1" }} />
                    <button style={{ ...S.headerBtn, background: "#e8f5e9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>⟳ Live</button>
                  </div>
                </div>
                <div style={{ ...S.card, padding: "14px 18px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Lock Date</label>
                  <input type="date" style={{ ...S.input, marginTop: 6, fontSize: 15, fontWeight: 600 }} />
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>{hijriToday}</p>
                </div>
                <div style={{ ...S.card, padding: "14px 18px", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", color: "#fff" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{t("zakat_due")}</label>
                  <p style={{ margin: "6px 0 2px", fontSize: 28, fontWeight: 800 }}>{fmt(zakatDue)}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#FFD54F" }}>{remaining > 0 ? `${fmt(remaining)} ${t("remaining")}` : `${t("fully_paid")} ✓`}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <SectionCard title={t("gold_jewelry")} color="#F9A825" action={<span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>7 items</span>}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>{[t("item"), t("weight"), t("net_gold"), t("value"), t("zakat")].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {(currentYearData.goldItems || []).map((g, i) => (
                          <tr key={i}>
                            <td style={{ ...S.td, fontSize: 12 }}>{g.name}</td>
                            <td style={{ ...S.td, textAlign: "right", fontSize: 12 }}>{g.wt}g</td>
                            <td style={{ ...S.td, textAlign: "right", fontSize: 12, color: "#1B5E20", fontWeight: 600 }}>{g.net}g</td>
                            <td style={{ ...S.td, textAlign: "right", fontSize: 12 }}>{fmt(g.net * currentYearData.goldPrice)}</td>
                            <td style={{ ...S.td, textAlign: "right", fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>{fmt(g.net * currentYearData.goldPrice * 0.025)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: "#e8f5e9" }}>
                          <td style={{ ...S.td, fontWeight: 700, color: "#1B5E20" }}>TOTAL</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{(currentYearData.goldItems || []).reduce((s,g) => s+g.wt, 0).toFixed(1)}g</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{(currentYearData.goldItems || []).reduce((s,g) => s+g.net, 0).toFixed(1)}g</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(currentYearData.gold)}</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 700, color: "#1B5E20" }}>{fmt(currentYearData.gold * 0.025)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </SectionCard>

                  <SectionCard title={t("business_inventory")} color="#6D4C41">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div><span style={{ fontSize: 12, color: "#888" }}>{t("business_inventory")}: </span><span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>$0</span></div>
                      <div><span style={{ fontSize: 12, color: "#888" }}>{t("zakat")}: </span><span style={{ fontSize: 16, fontWeight: 700, color: "#1B5E20" }}>$0</span></div>
                    </div>
                  </SectionCard>
                </div>

                <div>
                  <SectionCard title={t("cash_home")} color="#1565C0">
                    <p style={{ margin: 0, fontSize: 13, color: "#999", textAlign: "center", padding: "16px 0" }}>No bank accounts added yet. Connect accounts or add manually.</p>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", marginTop: 4, borderTop: "2px solid #e8f5e9", fontWeight: 700, color: "#1B5E20" }}>
                      <span>TOTAL</span><span>{fmt(currentYearData.cash)}</span>
                    </div>
                  </SectionCard>

                  <SectionCard title={t("investments")} color="#6A1B9A" action={<span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{(currentYearData.investments || []).length} holdings</span>}>
                    {(currentYearData.investments || []).map((inv, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                        <span style={{ color: "#555" }}>{inv.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(inv.val)}</span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#E8F5E9", color: "#2E7D32", fontWeight: 600 }}>✓</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", marginTop: 4, borderTop: "2px solid #e8f5e9", fontWeight: 700, color: "#1B5E20" }}>
                      <span>TOTAL</span><span>{fmt(currentYearData.inv)}</span>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32, #388E3C)", borderRadius: 16, padding: "24px 28px", marginTop: 16, color: "#fff" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, opacity: 0.9 }}>{t("zakat_calc_summary").toUpperCase()}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[[t("gold_jewelry"), currentYearData.gold], [t("cash_home"), currentYearData.cash], [t("investments"), currentYearData.inv], [t("debts_owed"), 0], ["Less: Liabilities", 0], [t("business_inventory"), 0]].map(([l, v], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", fontSize: 13 }}>
                      <span style={{ opacity: 0.75 }}>{l}</span><span style={{ fontWeight: 700 }}>{fmt(v)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "2px solid rgba(255,255,255,0.25)" }}>
                  <div><p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Total Zakatable Wealth</p><p style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 800 }}>{fmt(totalWealth)}</p></div>
                  <div style={{ textAlign: "right" }}><p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{t("zakat_due")}</p><p style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 800, color: "#FFD54F" }}>{fmt(zakatDue)}</p></div>
                </div>
              </div>
            </div>
          )}

          {view === "accounts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("accounts")}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#999" }}>{CONNECTED_ACCOUNTS.length} accounts connected</p>
                  </div>
                  <button onClick={() => { setShowConnectModal(true); setConnectStep(0); }} style={S.greenBtn}>+ {t("connect_account")}</button>
                </div>

                {Object.entries(categorySummaries).filter(([_, cat]) => cat.accounts.length > 0).map(([catKey, cat]) => (
                  <div key={catKey} style={{ ...S.card, marginBottom: 16, overflow: "hidden" }}>
                    <div onClick={() => toggleCategoryExpand(catKey)} style={{ ...S.cardHeader(cat.color), cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                        <h3 style={S.cardTitle}>{cat.name}</h3>
                        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{cat.accounts.length} account{cat.accounts.length > 1 ? 's' : ''}</div>
                      </div>
                      <span style={{ fontSize: 20, marginLeft: 8, transform: expandedCategories[catKey] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                    </div>
                    <div style={{ padding: "16px 18px", background: "#f9f9f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "2px solid #e8e8e8" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>Balance</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: cat.color }}>{fmt(calculateCategoryBalance(catKey))}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#E8F5E9", color: "#1B5E20" }}>🔗 Synced</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#f5f5f5", color: "#666" }}>2 min ago</span>
                      </div>

                      {expandedCategories[catKey] && (
                        <div style={{ marginTop: 12, borderTop: "1px solid #e8e8e8", paddingTop: 12 }}>
                          {cat.accounts.map(acct => (
                            <div key={acct.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, color: "#333" }}>{acct.institution} {acct.type}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: acct.balance >= 0 ? "#1B5E20" : "#C62828" }}>{fmt(acct.balance)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999" }}>
                                <span>****{acct.mask}</span>
                                <span>Synced {acct.lastSync}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <SectionCard title="Cash at Home" color="#1B5E20">
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4, display: "block" }}>Amount ({currency})</label>
                    <input
                      value={currentYearData.manualEntries.cashHome}
                      onChange={e => updateManualEntry("cashHome", e.target.value)}
                      style={{ ...S.input, ...S.numInput }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>💰 Cash kept at home or in safe</p>
                </SectionCard>

                <SectionCard title="Gold & Jewelry" color="#F9A825">
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                    <thead><tr>{["Item", "Weight(g)", "Purity", "Value"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {currentYearData.manualEntries.goldItems.map((item, i) => (
                        <tr key={i} style={i % 2 === 0 ? { background: "#fafafa" } : {}}>
                          <td style={S.td}>{item.name}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{item.weight.toFixed(2)}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{item.purity}%</td>
                          <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button style={{ ...S.greenBtn, fontSize: 12, padding: "6px 12px" }}>+ Add Row</button>
                </SectionCard>

                <SectionCard title="Debts Owed to You" color="#2E7D32">
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                    <thead><tr>{["Person/Entity", "Amount", "Expected Date"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {currentYearData.manualEntries.debtsOwed.map((debt, i) => (
                        <tr key={i} style={i % 2 === 0 ? { background: "#fafafa" } : {}}>
                          <td style={S.td}><input placeholder="Name" value={debt.person} onChange={e => { const updated = [...currentYearData.manualEntries.debtsOwed]; updated[i] = { ...updated[i], person: e.target.value }; updateManualEntry("debtsOwed", updated); }} style={{ ...S.input, padding: "4px 6px", fontSize: 12 }} /></td>
                          <td style={S.td}><input placeholder="$0" value={debt.amount} onChange={e => { const updated = [...currentYearData.manualEntries.debtsOwed]; updated[i] = { ...updated[i], amount: e.target.value }; updateManualEntry("debtsOwed", updated); }} style={{ ...S.input, ...S.numInput, padding: "4px 6px", fontSize: 12 }} /></td>
                          <td style={S.td}><input type="date" value={debt.expectedDate} onChange={e => { const updated = [...currentYearData.manualEntries.debtsOwed]; updated[i] = { ...updated[i], expectedDate: e.target.value }; updateManualEntry("debtsOwed", updated); }} style={{ ...S.input, padding: "4px 6px", fontSize: 12 }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button style={{ ...S.greenBtn, fontSize: 12, padding: "6px 12px" }}>+ Add Row</button>
                </SectionCard>

                <SectionCard title="Business Inventory" color="#6D4C41">
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4, display: "block" }}>Business Stock Value (USD)</label>
                    <input
                      value={currentYearData.manualEntries.businessInventory}
                      onChange={e => updateManualEntry("businessInventory", e.target.value)}
                      style={{ ...S.input, ...S.numInput }}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Other Zakatable Assets" color="#5B4B8A">
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                    <thead><tr>{["Description", "Value"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {currentYearData.manualEntries.otherAssets.map((asset, i) => (
                        <tr key={i} style={i % 2 === 0 ? { background: "#fafafa" } : {}}>
                          <td style={S.td}><input placeholder="Description" value={asset.description} onChange={e => { const updated = [...currentYearData.manualEntries.otherAssets]; updated[i] = { ...updated[i], description: e.target.value }; updateManualEntry("otherAssets", updated); }} style={{ ...S.input, padding: "4px 6px", fontSize: 12 }} /></td>
                          <td style={S.td}><input placeholder="$0" value={asset.value} onChange={e => { const updated = [...currentYearData.manualEntries.otherAssets]; updated[i] = { ...updated[i], value: e.target.value }; updateManualEntry("otherAssets", updated); }} style={{ ...S.input, ...S.numInput, padding: "4px 6px", fontSize: 12 }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button style={{ ...S.greenBtn, fontSize: 12, padding: "6px 12px" }}>+ Add Row</button>
                </SectionCard>
              </div>

              <div style={{ position: "sticky", top: 20, height: "fit-content" }}>
                <div style={{ ...S.card, padding: "16px", background: "linear-gradient(135deg, #F5F5F5, #FAFAFA)", borderLeft: "4px solid #1B5E20" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: "#1B5E20", textTransform: "uppercase", letterSpacing: 0.5 }}>Zakat Calculation</h3>

                  <div style={{ fontSize: 11, color: "#666", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #ddd" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600 }}>ASSETS</p>
                    {[
                      ["Banking", fmt(calculateCategoryBalance("banking")), "🔗"],
                      ["Investments", fmt(calculateCategoryBalance("investments")), "🔗"],
                      ["Retirement", fmt(categorySummaries.retirement.accounts.reduce((s, a) => s + calculateRetirementZakatable(a.id), 0)), "🔗"],
                      ["Crypto", fmt(calculateCategoryBalance("crypto")), "🔗"],
                      ["Gold & Jewelry", fmt(currentYearData.manualEntries.goldItems.reduce((s, g) => s + (parseFloat(g.value) || 0), 0)), "✏️"],
                      ["Cash at Home", fmt(parseFloat(currentYearData.manualEntries.cashHome || 0)), "✏️"],
                      ["Debts Owed to You", fmt(currentYearData.manualEntries.debtsOwed.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0)), "✏️"],
                      ["Business Inventory", fmt(parseFloat(currentYearData.manualEntries.businessInventory || 0)), "✏️"],
                      ["Other Assets", fmt(currentYearData.manualEntries.otherAssets.reduce((s, o) => s + (parseFloat(o.value) || 0), 0)), "✏️"],
                    ].map(([label, value, icon]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, fontSize: 11 }}>
                        <span style={{ color: "#666" }}>{label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                          <span style={{ fontSize: 10 }}>{icon}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #ddd", fontSize: 12, fontWeight: 700, color: "#1B5E20" }}>
                      <span>Total Assets</span>
                      <span>{fmt(totalAssetsComputed)}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "#666", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #ddd" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600 }}>LIABILITIES</p>
                    {[
                      ["Credit Cards", fmt(categorySummaries.credit.accounts.filter(a => a.type === "Credit Card").reduce((s, a) => s + Math.abs(a.balance), 0))],
                      ["Mortgage (monthly)", fmt(categorySummaries.credit.accounts.filter(a => a.type === "Mortgage").reduce((s, a) => s + (a.monthlyPayment || 0), 0))],
                      ["Student Loans (monthly)", fmt(categorySummaries.credit.accounts.filter(a => a.type === "Student Loan").reduce((s, a) => s + ((a.annualPayment || 0) / 12), 0))],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                        <span style={{ color: "#666" }}>{label}</span>
                        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #ddd", fontSize: 12, fontWeight: 700, color: "#C62828" }}>
                      <span>Total Liabilities</span>
                      <span>-{fmt(totalLiabilities)}</span>
                    </div>
                  </div>

                  <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, marginBottom: 12, borderLeft: "3px solid #2E7D32" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, color: "#666", fontWeight: 600 }}>NET ZAKATABLE WEALTH</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1B5E20" }}>{fmt(netZakatable)}</p>
                  </div>

                  <div style={{ fontSize: 11, color: "#666", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #ddd" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Nisab Threshold</span>
                      <span style={{ fontWeight: 600 }}>$5,256</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span>Status</span>
                      <span style={{ fontWeight: 600, color: netZakatable >= 5256 ? "#2E7D32" : "#999" }}>
                        {netZakatable >= 5256 ? "✓ Above Nisab" : "Below Nisab"}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)", padding: "12px", borderRadius: 8, color: "#fff", textAlign: "center" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, opacity: 0.8 }}>ZAKAT DUE (2.5%)</p>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{fmt(zakatComputedDue)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "payments" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>Payment Tracker</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Track all your zakat distributions for {selectedYear.replace("-"," / ")} AH</p>

              <div style={{ ...S.card, padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32" }}>{zakatDue > 0 ? Math.min(100,(totalPaid/zakatDue*100)).toFixed(1) : 0}%</span>
                </div>
                <div style={{ height: 14, background: "#e8f5e9", borderRadius: 7, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${zakatDue > 0 ? Math.min(100, totalPaid/zakatDue*100) : 0}%`, background: "linear-gradient(90deg, #66BB6A, #1B5E20)", borderRadius: 7 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#888" }}>
                  <span>Paid: {fmt(totalPaid)}</span><span style={{ color: remaining > 0 ? "#C62828" : "#2E7D32", fontWeight: 600 }}>{remaining > 0 ? `Remaining: ${fmt(remaining)}` : "Fully Paid ✓"}</span>
                </div>
              </div>

              <SectionCard title="Payments" color="#1B5E20" action={<button style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>+ Add</button>}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Recipient", "Amount", "Method", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {currentYearData.payments.map((p, i) => (
                      <tr key={i} onMouseEnter={e => e.currentTarget.style.background="#fafafa"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        <td style={{ ...S.td, fontWeight: 600 }}>{p.to}</td>
                        <td style={{ ...S.td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(p.amt)}</td>
                        <td style={S.td}><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#f5f5f5", color: "#666" }}>Manual</span></td>
                        <td style={S.td}><span style={{ padding: "3px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "#C8E6C9", color: "#1B5E20" }}>PAID</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>
            </div>
          )}

          {view === "pay" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("pay_zakat")}</h2>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#999" }}>Send zakat directly to verified organizations {country === "GLOBAL" ? "worldwide" : `in ${countryInfo.name}`}</p>
              <div style={{ padding: "10px 14px", marginBottom: 16, borderRadius: 8, background: "#E3F2FD", border: "1px solid #90CAF9", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><span style={{ fontWeight: 700, color: "#1565C0" }}>{countryInfo.flag} {countryInfo.name}</span> — Showing {countryOrgs.length} verified organizations and {countryBanks.length} local banks</span>
                <select value={country} onChange={e => { const c = e.target.value; setCountry(c); if (COUNTRY_CURRENCY[c]) setCurrency(COUNTRY_CURRENCY[c]); }} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #90CAF9", background: "#fff", fontSize: 11, cursor: "pointer" }}>
                  <option value="GLOBAL">🌍 Global</option>
                  {COUNTRIES.filter(c => c.code !== "GLOBAL").map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>

              <SectionCard title={t("connected_banks")} color="#1565C0" action={<button onClick={() => { setPlaidStep(0); setShowPlaid(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>+ {t("connect_bank")}</button>}>
                <div style={{ display: "flex", gap: 12 }}>
                  {CONNECTED_BANKS.map((b, i) => (
                    <div key={i} style={{ flex: 1, padding: "12px 16px", background: "#f8f9fa", borderRadius: 10, border: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏦</div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#333" }}>{b.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>{b.type} ****{b.mask}</p>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#2E7D32", fontSize: 16 }}>✓</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div style={{ marginBottom: 16 }}>
                <input placeholder="Search organizations..." value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
                  style={{ ...S.input, padding: "12px 18px", fontSize: 15, borderRadius: 12, border: "2px solid #e0e0e0", width: 400 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {filteredOrgs.map(org => (
                  <div key={org.id} style={{ ...S.card, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "box-shadow 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{org.flag}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{org.name}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{org.desc}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: org.method === "stripe" ? "#EDE7F6" : "#E3F2FD", color: org.method === "stripe" ? "#635BFF" : "#1565C0", fontWeight: 700 }}>
                          {org.method === "stripe" ? "💳 Stripe" : "🏦 Wire"}
                        </span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#E8F5E9", color: "#1B5E20", fontWeight: 700 }}>✓ Zakat Verified</span>
                      </div>
                    </div>
                    <button onClick={() => openPay(org)} style={{ ...S.greenBtn, fontSize: 13, padding: "8px 18px", whiteSpace: "nowrap" }}>Pay →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "livestock" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("livestock_zakat")}</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>{t("livestock")} — {formatYearDisplay(selectedYear)}</p>

              <SectionCard title={t("livestock")} color="#8B4513">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{t("candles")}</label>
                    <input type="number" value={currentYearData.livestock.camels} onChange={e => updateNestedField("livestock", "camels", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{t("cattle")}</label>
                    <input type="number" value={currentYearData.livestock.cattle} onChange={e => updateNestedField("livestock", "cattle", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{t("sheep")}</label>
                    <input type="number" value={currentYearData.livestock.sheep} onChange={e => updateNestedField("livestock", "sheep", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ background: "#f5f5f5", padding: "16px 18px", borderRadius: 8, fontSize: 13, color: "#555" }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#1B5E20" }}>Nisab Reference Guide</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid #e0e0e0" }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#8B4513" }}>Sheep / Goats</p>
                      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                        <thead><tr><th style={{ textAlign: "left", padding: "2px 0", color: "#888", fontWeight: 600 }}>Count</th><th style={{ textAlign: "right", padding: "2px 0", color: "#888", fontWeight: 600 }}>Zakat Due</th></tr></thead>
                        <tbody>
                          {[["40 – 120", "1 sheep"], ["121 – 200", "2 sheep"], ["201 – 399", "3 sheep"], ["400+", "1 per 100"]].map(([r, z], i) => (
                            <tr key={i}><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0" }}>{r}</td><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0", textAlign: "right", fontWeight: 600, color: "#333" }}>{z}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid #e0e0e0" }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#8B4513" }}>Cattle</p>
                      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                        <thead><tr><th style={{ textAlign: "left", padding: "2px 0", color: "#888", fontWeight: 600 }}>Count</th><th style={{ textAlign: "right", padding: "2px 0", color: "#888", fontWeight: 600 }}>Zakat Due</th></tr></thead>
                        <tbody>
                          {[["30 – 39", "1 calf (1 yr)"], ["40 – 59", "1 calf (2 yr)"], ["60 – 69", "2 calves (1 yr)"], ["70+", "Proportional"]].map(([r, z], i) => (
                            <tr key={i}><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0" }}>{r}</td><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0", textAlign: "right", fontWeight: 600, color: "#333" }}>{z}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid #e0e0e0" }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#8B4513" }}>Camels</p>
                      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                        <thead><tr><th style={{ textAlign: "left", padding: "2px 0", color: "#888", fontWeight: 600 }}>Count</th><th style={{ textAlign: "right", padding: "2px 0", color: "#888", fontWeight: 600 }}>Zakat Due</th></tr></thead>
                        <tbody>
                          {[["5 – 9", "1 sheep"], ["10 – 14", "2 sheep"], ["15 – 19", "3 sheep"], ["20 – 24", "4 sheep"], ["25 – 35", "1 camel (1 yr)"], ["36 – 45", "1 camel (2 yr)"], ["46 – 60", "1 camel (3 yr)"], ["61 – 75", "1 camel (4 yr)"], ["76 – 90", "2 camels (2 yr)"], ["91 – 120", "2 camels (3 yr)"]].map(([r, z], i) => (
                            <tr key={i}><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0" }}>{r}</td><td style={{ padding: "3px 0", borderTop: "1px solid #f0f0f0", textAlign: "right", fontWeight: 600, color: "#333" }}>{z}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#888" }}>Below minimum nisab = no zakat due. Livestock must be free-grazing (sa'imah) for the majority of the year.</p>
                </div>
              </SectionCard>
            </div>
          )}

          {view === "agriculture" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("agricultural_zakat")}</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>{t("agriculture")} — {formatYearDisplay(selectedYear)}</p>

              <SectionCard title={t("agriculture")} color="#558B2F">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Crop Type</label>
                    <input type="text" value={currentYearData.agriculture.cropType} onChange={e => updateNestedField("agriculture", "cropType", e.target.value)} placeholder="e.g., Wheat, Rice, Dates" style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{t("weight")}</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <input type="number" value={currentYearData.agriculture.weight} onChange={e => updateNestedField("agriculture", "weight", parseFloat(e.target.value) || 0)} style={{ ...S.input, flex: 1 }} />
                      <select value={currentYearData.agriculture.unit} onChange={e => updateNestedField("agriculture", "unit", e.target.value)} style={{ ...S.input, flex: 0.5 }}>
                        <option>kg</option>
                        <option>tons</option>
                        <option>bushels</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Market {t("value")}</label>
                    <input type="number" value={currentYearData.agriculture.marketValue} onChange={e => updateNestedField("agriculture", "marketValue", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Type</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="radio" checked={currentYearData.agriculture.irrigated} onChange={() => updateNestedField("agriculture", "irrigated", true)} />
                        <span>Irrigated (5%)</span>
                      </label>
                      <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="radio" checked={!currentYearData.agriculture.irrigated} onChange={() => updateNestedField("agriculture", "irrigated", false)} />
                        <span>Rain-fed (10%)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#f5f5f5", padding: "12px 14px", borderRadius: 8, fontSize: 13 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Nisab ({currentMadhab?.name}): {madhabRules.agriculturalNisab > 0 ? `${madhabRules.agriculturalNisab} kg (5 wasq) minimum` : "No minimum nisab (all produce is zakatable)"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555" }}>Applies to: {madhabRules.allCropsZakatable ? "All crops and produce" : "Staple foods only (grains, dates, etc.)"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555" }}>Zakat Rate: {currentYearData.agriculture.irrigated ? "5% (irrigated)" : "10% (rain-fed)"} | Calculated: {fmt(calculateAgriculturalZakat())}</p>
                </div>
              </SectionCard>
            </div>
          )}

          {view === "mining" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("mining_zakat")}</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Mining & Minerals — {formatYearDisplay(selectedYear)}</p>

              <SectionCard title="Mining & Minerals" color="#424242">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Minerals & Extracted Resources ({t("value")})</label>
                    <input type="number" value={currentYearData.mining.minerals} onChange={e => updateNestedField("mining", "minerals", parseFloat(e.target.value) || 0)} placeholder="Minerals value" style={{ ...S.input, marginTop: 6 }} />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Zakat: {fmt((currentYearData.mining.minerals || 0) * 0.025)} (2.5%)</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Rikaz (Buried Treasure / Found Wealth) - {t("value")}</label>
                    <input type="number" value={currentYearData.mining.rikaz} onChange={e => updateNestedField("mining", "rikaz", parseFloat(e.target.value) || 0)} placeholder="Rikaz value" style={{ ...S.input, marginTop: 6 }} />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Zakat: {fmt((currentYearData.mining.rikaz || 0) * 0.2)} (20% - Khums)</p>
                  </div>
                </div>
                <div style={{ background: "#f5f5f5", padding: "12px 14px", borderRadius: 8, fontSize: 13 }}>
                  <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>Total Mining Zakat Due: {fmt(calculateMiningZakat())}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#555" }}>Minerals: Standard zakat (2.5%) | Rikaz: Special zakat (20% - Khums)</p>
                </div>
              </SectionCard>
            </div>
          )}

          {view === "rental" && (
            <div style={{direction: lang === "ar" || lang === "ur" ? "rtl" : "ltr"}}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1B5E20" }}>{t("rental_zakat")}</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Rental Income — {formatYearDisplay(selectedYear)}</p>

              <SectionCard title="Rental Income" color="#0288D1">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Monthly Income</label>
                    <input type="number" value={currentYearData.rental.monthlyIncome} onChange={e => updateNestedField("rental", "monthlyIncome", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Monthly Expenses</label>
                    <input type="number" value={currentYearData.rental.expenses} onChange={e => updateNestedField("rental", "expenses", parseFloat(e.target.value) || 0)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Months (Period)</label>
                    <input type="number" value={currentYearData.rental.months} onChange={e => updateNestedField("rental", "months", parseFloat(e.target.value) || 12)} style={{ ...S.input, marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ background: "#f5f5f5", padding: "12px 14px", borderRadius: 8, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Monthly Net (Income - Expenses):</span>
                    <span style={{fontWeight: 700}}>{fmt((currentYearData.rental.monthlyIncome - currentYearData.rental.expenses))}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Annual Net (for {currentYearData.rental.months} months):</span>
                    <span style={{fontWeight: 700}}>{fmt((currentYearData.rental.monthlyIncome - currentYearData.rental.expenses) * currentYearData.rental.months)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
                    <span style={{fontWeight: 600}}>Zakat Due (2.5%):</span>
                    <span style={{fontWeight: 700, color: "#1B5E20"}}>{fmt(calculateRentalZakat())}</span>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#666" }}>Note: Zakat applies to net rental savings. Property itself is not zakatable unless held for sale.</p>
                </div>
              </SectionCard>
            </div>
          )}
        </main>
      </div>

      {showPayModal && (
        <div style={S.overlay} onClick={() => setShowPayModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            {payStep === 0 && (
              <div>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1B5E20" }}>{t("pay_zakat")}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>To: {selectedOrg?.flag} {selectedOrg?.name}</p>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase" }}>{t("amount")} (USD)</label>
                  <input value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ ...S.input, ...S.numInput, marginTop: 6, fontSize: 24, fontWeight: 800, color: "#1B5E20", padding: "12px 16px" }} />
                  <p style={{ margin: "6px 0 16px", fontSize: 12, color: "#999" }}>Remaining zakat: {fmtFull(Math.max(0, remaining))}</p>

                  <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("method")}</label>
                  {selectedOrg?.method === "stripe" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[["card", "💳", "Credit / Debit Card", "Visa, Mastercard, Amex"], ["ach", "🏦", "Bank Transfer (ACH)", "Direct from your bank"]].map(([id, icon, title, sub]) => (
                        <div key={id} onClick={() => setPayMethod(id)} style={{ padding: "12px 16px", borderRadius: 10, border: `2px solid ${payMethod === id ? "#635BFF" : "#e0e0e0"}`, background: payMethod === id ? "#F5F3FF" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 22 }}>{icon}</span>
                          <div><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{title}</p><p style={{ margin: 0, fontSize: 11, color: "#999" }}>{sub}</p></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 16px", borderRadius: 10, border: "2px solid #1565C0", background: "#E3F2FD" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🏦 International Wire Transfer</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#666" }}>We'll show you the bank details to send from your bank</p>
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowPayModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => setPayStep(1)} style={selectedOrg?.method === "stripe" ? S.stripeBtn : S.greenBtn}>
                    {selectedOrg?.method === "stripe" ? "Continue to Checkout →" : "View Wire Details →"}
                  </button>
                </div>
              </div>
            )}

            {payStep === 1 && selectedOrg?.method === "stripe" && (
              <div>
                <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #635BFF, #7C3AED)", color: "#fff" }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Secure Checkout</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>${payAmount}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.8 }}>to {selectedOrg.name}</p>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>Card Number</label>
                    <input placeholder="4242 4242 4242 4242" style={{ ...S.input, marginTop: 4 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>Expiry</label><input placeholder="MM / YY" style={{ ...S.input, marginTop: 4 }} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>CVC</label><input placeholder="123" style={{ ...S.input, marginTop: 4 }} /></div>
                  </div>
                  <button onClick={() => setPayStep(2)} style={{ ...S.stripeBtn, width: "100%", padding: "14px", fontSize: 16 }}>Pay ${payAmount}</button>
                  <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 11, color: "#999" }}>🔒 Secured by <span style={{ color: "#635BFF", fontWeight: 700 }}>Stripe</span></p>
                </div>
              </div>
            )}

            {payStep === 1 && selectedOrg?.method === "wire" && (
              <div>
                <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #1565C0, #1976D2)", color: "#fff" }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Wire Transfer Details</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>{selectedOrg.flag} {selectedOrg.name}</p>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  {[["Bank", "Bank Name"], ["Account Name", selectedOrg.name], ["IBAN", "XXXX-XXXX-XXXX-XXXX"], ["SWIFT/BIC", "XXXXXXXXX"], ["Currency", "USD"], ["Reference", "Zakat Donation — Zakatukum"]].map(([k, v], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 13, color: "#888" }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button style={{ ...S.greenBtn, flex: 1, textAlign: "center" }}>📋 Copy All Details</button>
                    <button onClick={() => setPayStep(2)} style={{ ...S.greenBtn, flex: 1, textAlign: "center", background: "linear-gradient(135deg, #1565C0, #1976D2)" }}>✓ Mark as Sent</button>
                  </div>
                  <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 11, color: "#999" }}>Typical delivery: 2-5 business days</p>
                </div>
              </div>
            )}

            {payStep === 2 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>✓</div>
                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#1B5E20" }}>Payment Recorded!</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>May Allah accept your zakat</p>
                <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "16px 20px", textAlign: "left", marginBottom: 20 }}>
                  {[["Amount", `$${payAmount}`], ["Recipient", selectedOrg?.name], ["Method", selectedOrg?.method === "stripe" ? "Stripe" : "Wire Transfer"], ["Confirmation", `ZAK-${Date.now().toString(36).toUpperCase()}`], ["Date", new Date().toLocaleDateString()]].map(([k, v], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 4 ? "1px solid #e8e8e8" : "none", fontSize: 13 }}>
                      <span style={{ color: "#888" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button style={{ ...S.headerBtn, color: "#333", border: "1px solid #ddd" }}>🖨 Print Receipt</button>
                  <button onClick={() => setShowPayModal(false)} style={S.greenBtn}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddYearModal && (
        <div style={S.overlay} onClick={() => setShowAddYearModal(false)}>
          <div style={{ ...S.modal, width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#333" }}>{t("add_year")}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Add a new year to your zakat tracker</p>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase" }}>{t("gregorian_year")}</label>
              <input
                type="number"
                value={newYearInput}
                onChange={e => setNewYearInput(e.target.value)}
                placeholder="e.g., 2025"
                style={{ ...S.input, marginBottom: 16, fontSize: 15 }}
              />
              {newYearInput && (
                <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{t("hijri_year")}</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1B5E20" }}>{getHijriYear(parseInt(newYearInput) || 0)} AH</p>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddYearModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>{t("cancel")}</button>
                <button
                  onClick={() => {
                    const gregYear = parseInt(newYearInput);
                    if (gregYear && gregYear > 1900 && gregYear < 2100) {
                      const hijriYear = getHijriYear(gregYear);
                      const yearKey = `${gregYear}-${hijriYear}`;
                      if (!yearlyData[yearKey]) {
                        setYearlyData(prev => ({
                          ...prev,
                          [yearKey]: { ...emptyYearData }
                        }));
                        setSelectedYear(yearKey);
                      }
                      setNewYearInput("");
                      setShowAddYearModal(false);
                    }
                  }}
                  style={{ ...S.greenBtn, flex: 1 }}
                >
                  {t("add_year")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <div style={S.overlay} onClick={() => setShowConnectModal(false)}>
          <div style={{ ...S.modal, width: 500 }} onClick={e => e.stopPropagation()}>
            {connectStep === 0 && (
              <div>
                <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#333" }}>Connect Account</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Step 1 of 5 — Choose account type</p>
                </div>
                <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[["banking", "🏦 Banking"], ["investments", "📈 Investments"], ["retirement", "🏛️ Retirement"], ["crypto", "₿ Crypto"], ["credit", "💳 Credit & Loans"], ["realestate", "🏠 Real Estate"]].map(([type, label]) => (
                    <button key={type} onClick={() => { setSelectedAccountType(type); setConnectStep(1); }} style={{ padding: "16px", borderRadius: 10, border: "2px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#1B5E20"; e.currentTarget.style.background = "#f5f5f5"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fff"; }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {connectStep === 1 && (
              <div>
                <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#333" }}>Select Institution</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Step 2 of 5 — Search for your bank</p>
                </div>
                <div style={{ padding: "24px" }}>
                  <input placeholder="Search institutions..." style={{ ...S.input, marginBottom: 12, padding: "10px 14px" }} />
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#1565C0", fontWeight: 600 }}>{countryInfo.flag} Banks in {countryInfo.name}</p>
                  {countryBanks.map((b, i) => (
                    <div key={i} onClick={() => { setSelectedInstitution(b); setConnectStep(2); }} style={{ padding: "12px 14px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }} onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏦</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connectStep === 2 && (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🏦</div>
                <h3 style={{ margin: "0 0 16px" }}>Sign in to {selectedInstitution}</h3>
                <input placeholder="Username" style={{ ...S.input, marginBottom: 10 }} />
                <input placeholder="Password" type="password" style={{ ...S.input, marginBottom: 16 }} />
                <button onClick={() => setConnectStep(3)} style={{ ...S.greenBtn, width: "100%" }}>Login</button>
              </div>
            )}

            {connectStep === 3 && (
              <div>
                <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#333" }}>Select Accounts</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Step 4 of 5 — Choose which accounts to link</p>
                </div>
                <div style={{ padding: "20px 24px", maxHeight: 300, overflowY: "auto" }}>
                  {[["Checking", "****XXXX", "$0"], ["Savings", "****XXXX", "$0"], ["Money Market", "****XXXX", "$0"]].map(([type, mask, bal], i) => (
                    <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16, cursor: "pointer" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{type}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#999" }}>{mask}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1B5E20" }}>{bal}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setConnectStep(2)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", fontSize: 14, cursor: "pointer" }}>Back</button>
                  <button onClick={() => setConnectStep(4)} style={S.greenBtn}>Continue</button>
                </div>
              </div>
            )}

            {connectStep === 4 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>✓</div>
                <h3 style={{ margin: "0 0 8px", color: "#1B5E20" }}>Accounts Connected!</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>3 accounts from {selectedInstitution} are now linked</p>
                <button onClick={() => setShowConnectModal(false)} style={S.greenBtn}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPlaid && (
        <div style={S.overlay} onClick={() => setShowPlaid(false)}>
          <div style={{ ...S.modal, width: 420 }} onClick={e => e.stopPropagation()}>
            {plaidStep === 0 && (
              <div>
                <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#333" }}>Connect Your Bank</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Securely link via Plaid</p>
                </div>
                <div style={{ padding: "16px 24px" }}>
                  <input placeholder="Search your bank..." style={{ ...S.input, marginBottom: 12, padding: "10px 14px" }} />
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#1565C0", fontWeight: 600 }}>{countryInfo.flag} Banks in {countryInfo.name}</p>
                  {countryBanks.slice(0, 6).map((b, i) => (
                    <div key={i} onClick={() => setPlaidStep(1)} style={{ padding: "12px 14px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }} onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏦</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plaidStep === 1 && (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🏦</div>
                <h3 style={{ margin: "0 0 16px" }}>Sign in to your bank</h3>
                <input placeholder="Username" style={{ ...S.input, marginBottom: 10 }} />
                <input placeholder="Password" type="password" style={{ ...S.input, marginBottom: 16 }} />
                <button onClick={() => setPlaidStep(2)} style={{ ...S.greenBtn, width: "100%" }}>Connect</button>
              </div>
            )}
            {plaidStep === 2 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>✓</div>
                <h3 style={{ margin: "0 0 8px", color: "#1B5E20" }}>Bank Connected!</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>Your account is now linked for payments</p>
                <button onClick={() => setShowPlaid(false)} style={S.greenBtn}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
