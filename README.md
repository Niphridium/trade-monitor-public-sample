# Trade Monitor · Public Synthetic Sample

A small, interactive example of a market-surveillance review: select an event, inspect its minute on a price-and-volume chart, and check the calculation against the generated source values.

**Every price and volume is synthetic.** `DEMO/USDT` is a fictitious market. This repository contains an independent demonstration, not the full local application or its database.

## Try it

Open `index.html` in a browser. No installation, account, API key or exchange connection is required. English and Russian are available. JSON evidence download was checked in Chrome on macOS; other browser versions have not been exhaustively tested.

The default fixture contains 96 one-minute candles, three review events and five individual signals:

- R04: quote volume at least 5 times the median of the previous 20 minutes. The current minute is excluded from the median.
- R05: at least 80% of quote volume attributed to either the buying or selling initiating side.

The sample groups simultaneous signals by minute. Both calculations remain visible in the evidence panel. You can change the thresholds and download the selected synthetic evidence as JSON, including its previous 20 minutes.

These are two illustrative rules. A signal does not identify a trader, establish intent or prove market abuse. Tests verify this fixture's calculations and behavior; they do not establish detection accuracy. No regulatory approval or vendor affiliation is claimed.

## Check the calculations

With Node.js installed:

```sh
node --test tests/*.cjs
```

`model.js` generates the fixed fixture from a deterministic seed. The tests cover reproducibility, warm-up, current-minute exclusion, threshold boundaries, grouping and evidence export. Synthetic values use JavaScript numbers and are intended for demonstration, not financial accounting.

## Privacy

No employer, customer, account or actual exchange data is included. The page has no application backend, telemetry, external scripts, fonts or automatic market requests. It generates data in the browser. Opening the public website still sends normal web requests to its hosting provider. See [PRIVACY.md](PRIVACY.md).

Independent personal project. MIT licensed.
