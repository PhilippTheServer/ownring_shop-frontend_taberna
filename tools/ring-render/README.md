# Ring render

Renders the OwnRing R02 (size 11, 20.6 mm inner diameter) with three.js in headless Chrome and exports the pictures in `public/img/`. Nothing here ships to the browser: the page only loads the finished WebP files.

```bash
cd tools/ring-render
./shoot.sh hero 1800 hero.png
./shoot.sh inside 1800 inside.png
uv run --with pillow python export.py ../../public/img
```

`render.html` holds the geometry (a lathe of the ring's cross-section, the sensor window and charging pads), the materials and the lights; `?view=hero|inside|side` picks the camera. Needs Google Chrome and network access to cdn.jsdelivr.net for three.js.
