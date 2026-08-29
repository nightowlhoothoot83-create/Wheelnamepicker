# WheelNamePicker

Final AdSense correction branch: `repair/lock-single-adg-logo-20260825`

The duplicate footer-logo issue remains resolved. This branch is limited to the final measured readiness corrections.

Completed in this pass:
- clean-route repairs for `/coin-toss`, `/dice-roller` and `/lucky-dip`
- homepage meta description shortened to the recommended range
- Ascension Digital Group footer logo made more prominent without restructuring the footer
- hero Wheel logo converted to a display-sized WebP and kept eager/high-priority as the LCP image
- ecosystem/footer logos converted from multi-megabyte originals to small display-sized WebP assets
- below-the-fold ecosystem assets lazy-loaded with async decoding and intrinsic sizing
- VentraIP banner optimized and lazy-loaded
- long-lived cache headers added for static image assets
- integrity validator updated to recognise the approved optimized ADG logo while still enforcing exactly one homepage ADG logo
- existing substantive wheel/use-case/FAQ content retained; no generic content added

Verification: Indexing integrity passes on the corrected branch. Production remains unchanged until explicit approval.
