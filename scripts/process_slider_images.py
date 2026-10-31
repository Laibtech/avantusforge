import os
import sys
import numpy as np
from PIL import Image, ImageFilter

def process_image(src_path, dst_path, wipe_left_px=0, model_name='u2net'):
    import rembg
    print(f"Processing {src_path} with {model_name}...")
    orig = Image.open(src_path).convert('RGB')
    
    # If there are cut-off artifacts on the far left (like image 1 has cut-off letters at x < 40),
    # replace that strip with the background color before rembg
    if wipe_left_px > 0:
        arr = np.array(orig)
        bg_col = arr[10, wipe_left_px + 10]
        arr[:, :wipe_left_px] = bg_col
        orig = Image.fromarray(arr)
        print(f"Wiped left {wipe_left_px}px with background color {bg_col}")

    session = rembg.new_session(model_name)
    # Use alpha matting post-processing if beneficial, or standard u2net
    res = rembg.remove(
        orig,
        session=session,
        alpha_matting=False,
        post_process_mask=True
    )
    
    # Analyze the result
    res_arr = np.array(res)
    alpha = res_arr[:, :, 3]
    total_solid = np.sum(alpha > 200)
    print(f"Done! Result shape: {res_arr.shape}, solid pixels (alpha > 200): {total_solid}")

    # Check if laptop screen dark pixels are preserved
    orig_arr = np.array(orig)
    dark_pixels = np.all(orig_arr < 60, axis=2)
    dark_count = np.sum(dark_pixels)
    dark_preserved = np.sum(dark_pixels & (alpha > 128))
    print(f"Original dark pixels: {dark_count}, Preserved in output: {dark_preserved} ({dark_preserved/max(dark_count, 1)*100:.1f}%)")
    
    # Save output
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    res.save(dst_path, 'PNG', optimize=True)
    print(f"Saved to {dst_path}")

if __name__ == '__main__':
    img1 = r"C:\Users\Abc\.gemini\antigravity-ide\brain\4784e7cd-2c1d-4f6f-bc5a-d5b28c66042c\.user_uploaded\media_1790746626205.jpg"
    img2 = r"C:\Users\Abc\.gemini\antigravity-ide\brain\4784e7cd-2c1d-4f6f-bc5a-d5b28c66042c\.user_uploaded\media_1790746931985.jpg"
    
    out1 = r"c:\Users\Abc\Downloads\avantus\public\images\slider-custom-software.png"
    out2 = r"c:\Users\Abc\Downloads\avantus\public\images\slider-ecommerce.png"
    
    # Image 1 has chopped letters at x < 40
    process_image(img1, out1, wipe_left_px=42)
    process_image(img2, out2, wipe_left_px=0)
