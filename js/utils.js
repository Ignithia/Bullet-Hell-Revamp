export function drawBackground(color, assets, y1, y2) {
  background(color);
  if (assets.backgroundLayer1 && assets.backgroundLayer2) {
    if (
      assets.backgroundLayer1.width > 0 &&
      assets.backgroundLayer1.height > 0 &&
      assets.backgroundLayer2.width > 0 &&
      assets.backgroundLayer2.height > 0
    ) {
      imageMode(CORNER);
      image(assets.backgroundLayer1, 0, y1, width, height);
      image(assets.backgroundLayer1, 0, y1 - height, width, height);
      image(assets.backgroundLayer1, 0, y1 - height * 2, width, height);
      image(assets.backgroundLayer2, 0, y2, width, height);
      image(assets.backgroundLayer2, 0, y2 - height, width, height);
      imageMode(CENTER);
      y1 += 1;
      y2 += 1;
      if (y1 >= height + 1000) y1 = 0;
      if (y2 >= height + 1000) y2 = 0;
    } else {
      console.error(
        "Background layers have invalid dimensions:",
        assets.backgroundLayer1,
        assets.backgroundLayer2
      );
    }
  } else {
    console.error(
      "Background layers are not loaded:",
      assets.backgroundLayer1,
      assets.backgroundLayer2
    );
  }
}

export function drawText(
  textStr,
  x,
  y,
  size,
  vertical,
  horizontal,
  color = [255]
) {
  window.fill(...color);
  window.textAlign(vertical, horizontal);
  window.textSize(size);
  window.text(textStr, x, y);
}
