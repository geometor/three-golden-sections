`#!/usr/bin/env bash

# remove comments
# remove clipPaths

sed \
  -e '15a <style>' \
  -e '15r css/construction.css' \
  -e '15a </style>' \
  -e '1,2d' \
  -e '/^$/d' \
  -e 's/<!--.*-->//' \
  -e '/<clipPath/,/<\/clipPath>/d' \
  -e 's/\s*clip-path="url(.*)"//' \
  -e 's/stroke-linejoin="round"\s*//' \
  -e 's/stroke-opacity="1.0000"\s*//' \
  -e 's/stroke-linecap="butt"\s*//' \
  -e 's/stroke-linecap="round"\s*//' \
  -e 's/layer0/base/' \
  -e 's/layer7/graphics/' \
  -e 's/layer8/sections/' \
  -e 's/layer9/points/' \
  -e 's/ fill-opacity="1.0000" font-style="normal" font-family="Helvetica" font-weight="normal" stroke="none" fill="#ffcc66" font-size="12.000" x="0" y="0"//' \
  -e '
    # remove font glyphs
    /<defs>/ , /<\/defs>/  d
    ' \
  harmonics/harmonics-07.svg > harmonics/harmonics-07-pre.svg

# points *******************************************************************
sed  \
  -e 's/fill="none" stroke="#000000"/class="point top"/' \
  -e 's/fill-opacity="1.0000" fill-rule="nonzero" stroke="none" fill="#ffffff"/class="point bottom"/' \
  harmonics/harmonics-07-pre.svg > harmonics/harmonics-07-pre2.svg

sed  '
  # create one group around each point set
  /<\/g>.*/ {
    N
    N
    N
	  s/<\/g>.*\n<g>\n<g class="point top">/<\/g>\n<g class="point top">/
	}
  ' \
  harmonics/harmonics-07-pre2.svg > harmonics/harmonics-07-pre3.svg

sed -i '
  # create id for points
  /<g>.*/ {
    N
    N
    N
    N
	  s/<g>.*\n<g class="point bottom">\n\(\s*<path.*>\n\)<title>Point \(.*\)<\/title>/<g id="pt-\2">\n<g class="point bottom">\n\1<title>Point \2<\/title>/
	}
  ' \
  harmonics/harmonics-07-pre3.svg

# segments *******************************************************************
sed  \
  -e 's/stroke-width=".*" fill="none" stroke-opacity=".*" stroke="#\(.*\)"/class="segment \1"/' \
  harmonics/harmonics-07-pre3.svg > harmonics/harmonics-07-pre4.svg

sed -i '
  # create one group around segment and text
  /<\/g>.*/ {
    N
    N
    N
	  s/<\/g>.*\n<g>\n<g transform=\(.*\)>/<\/g>\n<g transform=\1>/
	}
  ' \
  harmonics/harmonics-07-pre4.svg


sed -i '
  # create id for segments
  /<g>.*/ {
    N
    N
    N
    N
	  s/<g>.*\n\(<g.*>\n\)\(\s*<path.*>\n\)<title>Segment \(.*\)<\/title>/<g id="sg-\3">\n\1\2<title>Segment \3<\/title>/
	}
  ' \
  harmonics/harmonics-07-pre4.svg

sed -i '
  # create section scale a, b, a+b etc
  /<g class="segment\(.*\)">.*/ {
    N
    N
    N
    N
    N
    N
    N
	  s/<g class="segment\(.*\)">.*\n\(\s*<path.*>\n\)\(<title.*>\n\)\(<desc.*>\n\)<\/g>.*\n\(<g.*\n\)<text>\(.*\)<\/text>/<g class="segment\1 \6">\n\2\3\4<\/g>\n\5<text>\6<\/text>/
	}
  ' \
  harmonics/harmonics-07-pre4.svg

# lines & circles
sed  \
  -e 's/stroke-dasharray="1.0000,3.0000" fill="none" stroke="#\(.*\)"/class="line \1"/' \
  -e 's/stroke-dasharray="5.0000,4.0000" fill="none" stroke="#\(.*\)"/class="circle \1"/' \
  -e 's/ fill-opacity="1.0000" font-style="normal" font-family="Helvetica" font-weight="normal" stroke="none" fill="#ffcc66" font-size="12.000" x="0" y="0"//' \
  harmonics/harmonics-07-pre4.svg > harmonics/harmonics-07-pre5.svg

sed -i '
  # remove font glyphs
  /<defs>/ , /<\/defs>/  d
  ' \
  harmonics/harmonics-07-pre5.svg > harmonics/harmonics-07-clean.svg


  # s/<g class="segment section">.*\n\(\s*<path.*>\n\)\(<title.*>\n\)\(<desc.*>\n\)</g>.*\n\(<g.*\n\)<text>\(.*\)<\/text>/<g class="segment section \5">\n\1\n\2\n\3<\g>\n\4\n<text>\5<\/text>/


# sed '
#   /<\/g>.*/ {
#     N
#     N
# 	  #s/<\/g>.*\n<g>\n<g class="point top">/<g class="point top">/
# 	  s/<\/g>/test/
# 	}
#   ' \
#   > harmonics/harmonics-07-clean3.svg
# sed \
  # -e '/<\/g>/ , /<g class="point top">/  c "test" ' \

  # -e 's/<\/g>\s*\n<g>\n<g class="point top">/<g class="point top">/' \
  # -e 's/<\/g>\s*\n\<g>\n\<g class="point top">/<g class="point top">/' \
`
