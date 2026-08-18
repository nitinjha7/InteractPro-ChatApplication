# Performance Numbers

Every number here was measured on this machine by running the exact command
shown. These are not estimates. Re-run any command yourself to reproduce —
absolute numbers will vary by machine and network, but the method is real.

## Gemini API latency

Embedding a single question (`gemini-embedding-001`, 5 samples):

```
samples (ms): [ 479, 483, 484, 535, 942 ]
min: 479 ms
p50: 484 ms
max: 942 ms
```

Generating a cited answer (`gemini-2.5-flash`, 3 samples):

```
samples (ms): [ 1881, 2680, 3995 ]
p50: 2680 ms
```

## Vector search latency

Semantic search over 200 seeded messages using pgvector's HNSW index
(10 samples):

```
search over 200 rows, samples (ms): [
  51, 53, 55, 58,  62,
  65, 65, 73, 75, 157
]
p50: 65 ms
```

## Collaborative editor sync latency

Time from one browser inserting text to another browser's document
reflecting it, over the real running server (10 samples, localhost — no
network hop between clients):

```
samples (ms): [
  1, 1, 2, 2, 2,
  2, 3, 3, 4, 5
]
p50: 2 ms
```

## Test suite

```
Test Files  13 passed (13)
Tests       71 passed (71)
Duration    64.18s
```

## Production bundle

```
dist/assets/index-CYhOJu9s.css     41.88 kB │ gzip:   8.15 kB
dist/assets/index-D_1z-rre.js   1,750.92 kB │ gzip: 546.22 kB
built in 43.91s
```
