from PIL import Image

img = Image.open(r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-nav.png")
print(f"Mode: {img.mode}")
print(f"Size: {img.size}")

pixels = img.load()
w, h = img.size

# Check corners
print(f"\nCorner pixels (R,G,B,A):")
print(f"Top-left (0,0): {pixels[0, 0]}")
print(f"Top-right ({w-1},0): {pixels[w-1, 0]}")
print(f"Bottom-left (0,{h-1}): {pixels[0, h-1]}")
print(f"Bottom-right ({w-1},{h-1}): {pixels[w-1, h-1]}")

# Check middle of top edge
print(f"Top-middle ({w//2},0): {pixels[w//2, 0]}")

# Count transparent pixels
transparent = 0
total = w * h
for y in range(h):
    for x in range(w):
        if pixels[x, y][3] == 0:
            transparent += 1

print(f"\nTransparent pixels: {transparent}/{total} ({100*transparent/total:.1f}%)")
