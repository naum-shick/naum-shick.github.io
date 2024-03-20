: GET IMAGE MAGIC FROM https://imagemagick.org/script/download.php
for %%f in (*.jpg) do "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" convert  "%%f" -resize 256x256 "..\Avatar\%%f"