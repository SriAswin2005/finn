// PDF fonts can split a calendar year ("2nd November, 202 6"). Compare
// that date as its four-digit year without repairing the original quotation.
// Only a complete day/month date may join these digits; financial cells may not.
export function citationNumberText(text) {
  return text.replace(/\b((?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?[,]?\s+)((?:19|20)\d?[ \t]+\d{1,2})\b/gi,
    (whole, date, year) => { const digits = year.replace(/[ \t]/g, ''); return digits.length === 4 ? date + digits : whole; });
}
