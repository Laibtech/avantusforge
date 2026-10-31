import os
from PIL import Image
import numpy as np
from rembg import new_session, remove

print("Initializing lightweight u2netp session (only ~4.7MB)...")
session = new_session("u2netp")

path1 = r"C:\Users\Abc\.gemini\antigravity-ide\brain\4784e7cd-2c1d-4f6f-bc5a-d5b28c66042c\.user_uploaded\media_1790746626205.jpg"
path2 = r"C:\Users\Abc\.gemini\antigravity-ide\brain\4784e7cd-2c1d-4f6f-bc5a-d5b28c66042c\.user_uploaded\media_1790746931985.jpg"

out1 = r"c:\Users\Abc\Downloads\avantus\public\images\slider-custom-software.png"
out2 = r"c:\Users\Abc\Downloads\avantus\public\images\slider-ecommerce.png"

# Process Image 1
print("Processing Image 1...")
img1 = Image.open(path1).convert("RGB")
arr1 = np.array(img1)

# Clean up stray left edge letters (x < 35) by filling with background color
bg_color = arr1[0, 0]
arr1[:, :35] = bg_color
img1_clean = Image.fromarray(arr1)

print("Removing background from Image 1...")
result1 = remove(img1_clean, session=session)
result1.save(out1, "PNG")
print(f"Saved Image 1 to {out1}, size: {result1.size}")

# Process Image 2
print("Processing Image 2...")
img2 = Image.open(path2).convert("RGB")
print("Removing background from Image 2...")
result2 = remove(img2, session=session)
result2.save(out2, "PNG")
print(f"Saved Image 2 to {out2}, size: {result2.size}")

print("ALL_DONE_SUCCESSFULLY")
