#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重新生成卡片上的二维码矩阵。

改了 GAME.qrUrl 之后，用它把新的矩阵贴回 js/app.js。

    pip install qrcode
    python3 tools/qr.py https://your-site.com

输出两行常量，替换掉 js/app.js 里的 QR_TARGET 和 CARD_QR 即可。
"""
import sys

try:
    import qrcode
except ImportError:
    sys.exit('缺少 qrcode，请先安装：pip install qrcode')

url = sys.argv[1] if len(sys.argv) > 1 else 'https://game.workagentpro.com'

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=0)
qr.add_data(url)
qr.make(fit=True)
rows = [''.join('1' if v else '0' for v in row) for row in qr.get_matrix()]

print("const QR_TARGET = '%s';" % url)
print('const CARD_QR = [')
for row in rows:
    print("  '%s'," % row)
print('];')
print('')
print('/* %d x %d，共 %d 个模块 */' % (len(rows), len(rows[0]), len(rows) * len(rows[0])), file=sys.stderr)
