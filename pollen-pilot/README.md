# Pollen pilot

This isolated experiment does not replace the production Node build or change deployed URLs.

Install Racket and Pollen (`raco pkg install --auto pollen`), then run from this directory:

```sh
raco pollen render index.html.pm
```

Inspect `index.html` with `style.css`. The initial page is a smoke fixture, not migrated chapter content. Colors and layout are provisional values from the existing book design contract, subject to verification against the current family standard. Preserve chapter URLs and all existing features before switching production. Author: 吉人; public account: TurLamAI.
