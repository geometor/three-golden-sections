#!/usr/bin/env bash

sed \
  -e '15a <style>' \
  -e '15r css/construction.css' \
  -e '15a </style>' \
  -e '1,2d' \
  -e '/^$/d' \
  -e 's/<!--.*-->//' \
  -e '/width=".*cm"/d' \
  -e '/height=".*cm"/d' \
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
  -e 's/stroke-width=".*" fill="none" stroke-opacity=".*" stroke="#\(.*\)"/class="segment s-\1"/' \
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

# lines ************************************************
sed  \
  -e 's/stroke-dasharray="1.0000,3.0000" fill="none" stroke="#\(.*\)"/class="line s-\1"/' \
  harmonics/harmonics-07-pre4.svg > harmonics/harmonics-07-pre5.svg

sed -i \
-e '
  # create id for lines
  /<g>.*/ {
    N
    N
    N
    N
    s/<g>.*\n\s*<g class="line\(.*\)">.*\n\(\s*<path.*>\n\)<title>Line \(.*\)<\/title>/<g id="i-\3">\n<g class="line\1">\n\2<title>Line \3<\/title>/
  }
  ' \
  harmonics/harmonics-07-pre5.svg

# circles
sed  \
  -e 's/stroke-dasharray="5.0000,4.0000" fill="none" stroke="#\(.*\)"/class="circle s-\1"/' \
  harmonics/harmonics-07-pre5.svg > harmonics/harmonics-07-pre6.svg

sed -i \
  -e '
    # create id for circles
    /<g>.*/ {
      N
      N
      N
      N
      s/<g>.*\n\s*<g class="circle\(.*\)">.*\n\(\s*<path.*>\n\)<title>Circle \(.*\)<\/title>/<g id="c-\3">\n<g class="circle\1">\n\2<title>Circle \3<\/title>/
    }
    ' \
  harmonics/harmonics-07-pre6.svg

sed  \
  -e 's/fill-opacity=".*" fill-rule="evenodd" stroke="none" fill="#\(.*\)"/class="polygon s-\1"/' \
  harmonics/harmonics-07-pre6.svg > harmonics/harmonics-07-clean.svg

sed -i \
  -e '
    # create id for polygons
    /<g>.*/ {
      N
      N
      N
      N
      s/<g>.*\n\s*<g class="polygon\(.*\)">.*\n\(\s*<path.*>\n\)<title>\(.*\) \(.*\)<\/title>/<g id="y-\4">\n<g class="polygon\1">\n\2<title>\3 \4<\/title>/
    }
    ' \
  harmonics/harmonics-07-clean.svg
