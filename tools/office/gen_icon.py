# -*- coding: utf-8 -*-
"""Օֆիսի իկոնը՝ մաքուր Python-ով (ոչ մի գրադարան)։

Նկարում ա չաթի պղպջակ երեք կետով՝ UI-ի գույներով, ու գրում
office.ico (16/32/48 BMP + 256 PNG)։  Վերագեներացնել՝

    py tools/office/gen_icon.py
"""
import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))

BG = (0x1C, 0x18, 0x24, 255)      # մուգ մանուշակ — UI-ի sidebar-ը
ACCENT = (0xC8, 0x95, 0x6D, 255)  # պղնձագույն accent
DOT = (0x14, 0x12, 0x1A, 255)


def in_rrect(x, y, x0, y0, x1, y1, r):
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def in_tri(x, y, a, b, c):
    def side(p, q):
        return (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])
    s1, s2, s3 = side(a, b), side(b, c), side(c, a)
    return (s1 >= 0 and s2 >= 0 and s3 >= 0) or (s1 <= 0 and s2 <= 0 and s3 <= 0)


def scene(x, y):
    """Գույնը 256x256 կոորդինատում (x,y float)։"""
    color = (0, 0, 0, 0)
    if in_rrect(x, y, 10, 10, 246, 246, 56):
        color = BG
    if in_rrect(x, y, 46, 58, 210, 166, 30) or in_tri(x, y, (74, 158), (74, 210), (120, 162)):
        color = ACCENT
    for cx in (92, 128, 164):
        if (x - cx) ** 2 + (y - 112) ** 2 <= 12 ** 2:
            color = DOT
    return color


def render(size, ss=3):
    """size x size RGBA՝ ss x ss supersampling-ով։"""
    px = bytearray()
    step = 256.0 / size / ss
    for j in range(size):
        for i in range(size):
            r = g = b = a = 0
            for sj in range(ss):
                for si in range(ss):
                    c = scene((i * ss + si + 0.5) * step, (j * ss + sj + 0.5) * step)
                    r += c[0]; g += c[1]; b += c[2]; a += c[3]
            n = ss * ss
            px += bytes((r // n, g // n, b // n, a // n))
    return bytes(px)


def to_png(size, rgba):
    def chunk(tag, data):
        raw = tag + data
        return struct.pack(">I", len(data)) + raw + struct.pack(">I", zlib.crc32(raw))
    rows = b""
    stride = size * 4
    for j in range(size):
        rows += b"\x00" + rgba[j * stride:(j + 1) * stride]
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(rows, 9))
            + chunk(b"IEND", b""))


def to_bmp_entry(size, rgba):
    """ICO-ի ներսի BMP՝ BGRA bottom-up + դատարկ AND դիմակ։"""
    header = struct.pack("<IiiHHIIiiII", 40, size, size * 2, 1, 32, 0, 0, 0, 0, 0, 0)
    body = b""
    stride = size * 4
    for j in range(size - 1, -1, -1):
        row = rgba[j * stride:(j + 1) * stride]
        for i in range(size):
            r, g, b, a = row[i * 4:i * 4 + 4]
            body += bytes((b, g, r, a))
    mask_stride = ((size + 31) // 32) * 4
    body += b"\x00" * (mask_stride * size)
    return header + body


def main():
    entries = []
    for size in (16, 32, 48):
        entries.append((size, to_bmp_entry(size, render(size, ss=4))))
    entries.append((256, to_png(256, render(256))))

    ico = struct.pack("<HHH", 0, 1, len(entries))
    offset = 6 + 16 * len(entries)
    body = b""
    for size, data in entries:
        ico += struct.pack("<BBBBHHII", size % 256, size % 256, 0, 0, 1, 32,
                           len(data), offset)
        offset += len(data)
        body += data
    path = os.path.join(HERE, "office.ico")
    with open(path, "wb") as fh:
        fh.write(ico + body)
    print("gvvec: %s (%d bytes)" % (path, len(ico + body)))


if __name__ == "__main__":
    main()
