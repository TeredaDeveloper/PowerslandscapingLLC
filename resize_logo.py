from PIL import Image

# Load the clean logo
logo_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-clean.png"
img = Image.open(logo_path)

# Create navbar version (height 55px for good visibility)
new_height = 55
ratio = new_height / img.size[1]
new_width = int(img.size[0] * ratio)
img_nav = img.resize((new_width, new_height), Image.LANCZOS)
nav_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-nav.png"
img_nav.save(nav_path, "PNG")
print(f"Navbar logo: {new_width}x{new_height}")

# Create footer version (slightly larger, height 70px)
new_height = 70
ratio = new_height / img.size[1]
new_width = int(img.size[0] * ratio)
img_footer = img.resize((new_width, new_height), Image.LANCZOS)
footer_path = r"C:\Users\Developer LLC\Desktop\powerslandscapingllc.com\assets\logos\logo-footer.png"
img_footer.save(footer_path, "PNG")
print(f"Footer logo: {new_width}x{new_height}")

print("Done!")
