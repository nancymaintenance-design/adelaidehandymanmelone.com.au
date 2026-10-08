"""Create approved photograph derivatives. Production build requires no Python/Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
assets = root / 'src/assets/images'
destination = assets / 'responsive'
destination.mkdir(exist_ok=True)
manifest = {}
for folder in ('intake', 'cases'):
    for source in sorted((assets / folder).glob('*')):
        if folder == 'intake' and source.suffix.lower() != '.png':
            continue
        if source.suffix.lower() not in ('.png', '.jpg', '.jpeg'):
            continue
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            width, height = image.size
            variants = []
            avif_variants = []
            detail_variants = []
            for size in sorted(set(min(width, value) for value in (480, 960, 1440))):
                name = f'{source.stem}-{size}.webp'
                resized = image.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
                if not (destination / name).exists():
                    resized.save(destination / name, 'WEBP', quality=82, method=6)
                variants.append({'src': f'/assets/images/responsive/{name}', 'width': size})
                avif_name = f'{source.stem}-{size}.avif'
                if not (destination / avif_name).exists():
                    resized.save(destination / avif_name, 'AVIF', quality=60, speed=6)
                avif_variants.append({'src': f'/assets/images/responsive/{avif_name}', 'width': size})
                if folder == 'cases':
                    detail_name = f'{source.stem}-{size}-detail.webp'
                    resized.save(destination / detail_name, 'WEBP', lossless=True, method=6)
                    detail_variants.append({'src': f'/assets/images/responsive/{detail_name}', 'width': size})
            public = f'/assets/images/{"cases/" if folder == "cases" else ""}{source.name}'
            manifest[public] = {'width': width, 'height': height, 'variants': variants, 'avifVariants': avif_variants}
            if detail_variants:
                manifest[public]['detailVariants'] = detail_variants
(assets / 'responsive-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Prepared responsive WebP and AVIF versions of {len(manifest)} approved photographs.')
