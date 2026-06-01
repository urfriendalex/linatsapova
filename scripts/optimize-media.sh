#!/usr/bin/env bash
set -euo pipefail

SOURCE_ROOT="${1:-/Users/tobeurdeath/Desktop/project-screens/project-media-organized/lina-tsapova}"
OUTPUT_ROOT="${2:-$SOURCE_ROOT/optimized}"

if ! command -v magick >/dev/null; then
  echo "ImageMagick is required. Install it with: brew install imagemagick" >&2
  exit 1
fi

for category in Md Ph; do
  source_dir="$SOURCE_ROOT/$category"
  output_dir="$OUTPUT_ROOT/$category"
  mkdir -p "$output_dir"

  find "$source_dir" -type f \( \
    -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.tif' -o -iname '*.tiff' \
  \) -print0 | while IFS= read -r -d '' source_file; do
    filename="$(basename "${source_file%.*}")"
    output_file="$output_dir/$filename.jpg"
    echo "Optimizing $category/$(basename "$source_file")"
    magick "$source_file" \
      -auto-orient \
      -resize '2400x2400>' \
      -strip \
      -colorspace sRGB \
      -interlace Plane \
      -quality 84 \
      "$output_file"
  done
done

echo "Optimized media written to $OUTPUT_ROOT"
