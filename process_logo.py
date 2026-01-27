from PIL import Image
import os

# Load the logo
logo_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\3.jpg"
output_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-clean.png"

img = Image.open(logo_path)
print(f"Original size: {img.size}")

# Convert to RGBA for transparency
img = img.convert("RGBA")
pixels = img.load()

width, height = img.size

# Find the content bounds (skip black bars)
top = 0
bottom = height - 1
left = 0
right = width - 1

# Find top bound (skip black)
for y in range(height):
    row_has_content = False
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if not (r < 30 and g < 30 and b < 30):  # Not black
            row_has_content = True
            break
    if row_has_content:
        top = y
        break

# Find bottom bound (skip black)
for y in range(height - 1, -1, -1):
    row_has_content = False
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if not (r < 30 and g < 30 and b < 30):  # Not black
            row_has_content = True
            break
    if row_has_content:
        bottom = y
        break

print(f"Content bounds: top={top}, bottom={bottom}")

# Crop to remove black bars
img_cropped = img.crop((0, top, width, bottom + 1))
print(f"Cropped size: {img_cropped.size}")

# Now make white/near-white pixels transparent
pixels_cropped = img_cropped.load()
width_c, height_c = img_cropped.size

for y in range(height_c):
    for x in range(width_c):
        r, g, b, a = pixels_cropped[x, y]
        # If pixel is white or near-white, make it transparent
        if r > 240 and g > 240 and b > 240:
            pixels_cropped[x, y] = (r, g, b, 0)
        # Also handle any remaining black edges
        elif r < 20 and g < 20 and b < 20:
            pixels_cropped[x, y] = (r, g, b, 0)

# Save as PNG with transparency
img_cropped.save(output_path, "PNG")
print(f"Saved clean logo to: {output_path}")

# Also create a smaller version for navbar
img_small = img_cropped.copy()
# Resize to fit nicely in navbar (height around 50-60px)
new_height = 60
ratio = new_height / img_cropped.size[1]
new_width = int(img_cropped.size[0] * ratio)
img_small = img_cropped.resize((new_width, new_height), Image.LANCZOS)
small_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-navbar.png"
img_small.save(small_path, "PNG")
print(f"Saved navbar logo to: {small_path} ({new_width}x{new_height})")
