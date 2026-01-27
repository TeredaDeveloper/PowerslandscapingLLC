from PIL import Image
import os

# Load original
logo_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\3.jpg"
img = Image.open(logo_path).convert("RGBA")
pixels = img.load()
width, height = img.size

# Find content bounds (skip black bars)
top, bottom = 0, height - 1
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if not (r < 30 and g < 30 and b < 30):
            top = y
            break
    else:
        continue
    break

for y in range(height - 1, -1, -1):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if not (r < 30 and g < 30 and b < 30):
            bottom = y
            break
    else:
        continue
    break

# Crop
img = img.crop((0, top, width, bottom + 1))
pixels = img.load()
width, height = img.size
print(f"Cropped: {width}x{height}")

# AGGRESSIVE: Make ALL white-ish and black pixels transparent
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Is it grayscale (white/gray/black background)?
        is_gray = abs(r - g) < 15 and abs(g - b) < 15 and abs(r - b) < 15
        
        # White/light gray
        if is_gray and r > 180:
            pixels[x, y] = (0, 0, 0, 0)
        # Black
        elif r < 25 and g < 25 and b < 25:
            pixels[x, y] = (0, 0, 0, 0)

output_dir = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos"

# Save 20% larger versions
# Navbar (72px height)
ratio = 72 / height
img_nav = img.resize((int(width * ratio), 72), Image.LANCZOS)
img_nav.save(os.path.join(output_dir, "logo-nav.png"), "PNG")
print(f"Saved logo-nav.png")

# Footer (84px height)
ratio = 84 / height
img_footer = img.resize((int(width * ratio), 84), Image.LANCZOS)
img_footer.save(os.path.join(output_dir, "logo-footer.png"), "PNG")
print(f"Saved logo-footer.png")

print("Done!")
