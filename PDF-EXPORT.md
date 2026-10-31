# ATLAS MAX — PDF export update

- Export PDF in the header downloads a real `.pdf` file of the **currently selected** workbench.
- The PDF includes equipment name, class, goal, occupancy, modeled adjacency count, marked supercharged positions, a color-coded slot grid, an installed-module index with row and column locations, and warnings for ungenerated/stale layouts.
- Corvette exports additionally list the selected construction parts, quantities and planning zones.
- The report uses local `pdf-export.js`; no third-party network resource or server is required.
- The new **Backup JSON** button preserves the previous all-equipment editable export. **Import** still consumes JSON, not PDF.
- PDF scores and construction entries are planning aids, not guaranteed No Man's Sky stats. Report colors distinguish families; purple still marks supercharged slots.
- The generator uses standard PDF fonts and safely transliterates unsupported Unicode characters for portability.

## Validation

Run JavaScript syntax checks for all `.js` files. Generate sample PDF builds for the standard five categories, Corvette, a long Corvette manifest, and an empty layout. Validate PDF signatures and open rendered pages in a PDF renderer. Check real browser download behavior and verify a JSON backup is still generated.
