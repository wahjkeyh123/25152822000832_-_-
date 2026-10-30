"""把生成图的品红底抠成透明 PNG。"""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\wahjkeyh123\.cursor\projects\d-java-code-WebGame\assets")
DST = Path(r"D:\java\code\WebGame\assets\images\shop")
NAMES = [
    "shop-console", "shop-park", "shop-workbook", "shop-frame",
    "shop-telescope", "shop-paint", "shop-football", "shop-musicbox",
    "shop-lawyer", "shop-doctor", "shop-architect", "shop-coder",
    "shop-actor", "shop-chef", "shop-teacher",
]


def is_magenta(r, g, b):
    """生成图底是品红到玫红，R 高、G 很低、B 中高。"""
    if r < 175 or g > 90 or b < 75:
        return False
    if r - g < 85:
        return False
    return True


def key_file(src, dst):
    im = Image.open(src).convert("RGBA")
    pixels = im.load()
    width, height = im.size
    clear = bytearray(width * height)
    stack = []

    def consider(x, y):
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if clear[index]:
            return
        r, g, b, _a = pixels[x, y]
        if not is_magenta(r, g, b):
            return
        clear[index] = 1
        stack.append((x, y))

    for x in range(width):
        consider(x, 0)
        consider(x, height - 1)
    for y in range(height):
        consider(0, y)
        consider(width - 1, y)
    while stack:
        x, y = stack.pop()
        consider(x - 1, y)
        consider(x + 1, y)
        consider(x, y - 1)
        consider(x, y + 1)

    for y in range(height):
        for x in range(width):
            if clear[y * width + x]:
                pixels[x, y] = (0, 0, 0, 0)

    for _pass in range(5):
        kill = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a < 8:
                    continue
                open_n = 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        open_n += 1
                        continue
                    if pixels[nx, ny][3] < 8:
                        open_n += 1
                if not open_n:
                    continue
                if is_magenta(r, g, b) or (min(r, b) >= 170 and g <= 190 and abs(r - b) <= 70):
                    kill.append((x, y))
        for x, y in kill:
            pixels[x, y] = (0, 0, 0, 0)

    # 轮廓去品红溢色
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                continue
            open_n = 0
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if nx < 0 or ny < 0 or nx >= width or ny >= height or pixels[nx, ny][3] < 8:
                    open_n += 1
            if not open_n:
                continue
            spill = max(0, min(r, b) - g)
            if spill > 12:
                cut = min(spill, 80)
                pixels[x, y] = (max(0, r - cut), min(255, g + cut // 3), max(0, b - cut), a)

    bbox = im.getbbox()
    if bbox:
        pad = 6
        x0, y0, x1, y1 = bbox
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(width, x1 + pad), min(height, y1 + pad)))
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "PNG")
    return im.size


def main():
    DST.mkdir(parents=True, exist_ok=True)
    for name in NAMES:
        src = SRC / f"{name}.jpg"
        dst = DST / f"{name}.png"
        size = key_file(src, dst)
        print(f"{name} {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
