// scripts/generate-icons.mjs
// Gera os ícones PWA (PNG puro, sem dependências externas) a partir do
// motivo "cesta" sobre fundo roxo usado no logo atual. Script descartável —
// pode ser removido após a geração ou reaproveitado se o logo mudar.
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ROXO = [0x3c, 0x2a, 0x6e, 255]
const WHITE = [255, 255, 255, 255]

const CRC_TABLE = (() => {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 6 // color type RGBA
  const ihdr = chunk('IHDR', ihdrData)

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw, { level: 9 }))
  const iend = chunk('IEND', Buffer.alloc(0))
  return Buffer.concat([signature, ihdr, idat, iend])
}

function makeCanvas(size, color) {
  const buf = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = color[0]
    buf[i * 4 + 1] = color[1]
    buf[i * 4 + 2] = color[2]
    buf[i * 4 + 3] = color[3]
  }
  return buf
}

function fillRoundedRect(buf, size, x, y, w, h, r, color) {
  for (let j = Math.floor(y); j < Math.ceil(y + h); j++) {
    for (let i = Math.floor(x); i < Math.ceil(x + w); i++) {
      if (i < 0 || j < 0 || i >= size || j >= size) continue
      let inside = true
      const left = i < x + r
      const right = i > x + w - r
      const top = j < y + r
      const bottom = j > y + h - r
      if ((left || right) && (top || bottom)) {
        const cx = left ? x + r : x + w - r
        const cy = top ? y + r : y + h - r
        const dx = i + 0.5 - cx
        const dy = j + 0.5 - cy
        if (dx * dx + dy * dy > r * r) inside = false
      }
      if (inside) {
        const idx = (j * size + i) * 4
        buf[idx] = color[0]
        buf[idx + 1] = color[1]
        buf[idx + 2] = color[2]
        buf[idx + 3] = color[3]
      }
    }
  }
}

// Desenha o ícone de "cesta" (lid + corpo + faixa) num canvas size x size,
// fundo roxo sólido, marca branca centralizada ocupando markScale do canvas.
function drawIcon(size, markScale) {
  const canvas = makeCanvas(size, ROXO)
  const unit = (size * markScale) / 100
  const offsetX = (size - 100 * unit) / 2
  const offsetY = (size - 100 * unit) / 2
  const m = (v) => v * unit

  // Tampa/alça
  fillRoundedRect(canvas, size, offsetX + m(22), offsetY + m(8), m(56), m(12), m(4), WHITE)
  // Corpo da cesta
  fillRoundedRect(canvas, size, offsetX + m(8), offsetY + m(28), m(84), m(58), m(8), WHITE)
  // Faixa (separa o corpo em duas seções)
  fillRoundedRect(canvas, size, offsetX + m(8), offsetY + m(48), m(84), m(8), 0, ROXO)

  return canvas
}

const root = path.join(__dirname, '..')
const iconsDir = path.join(root, 'public', 'icons')
const appDir = path.join(root, 'src', 'app')
fs.mkdirSync(iconsDir, { recursive: true })

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), encodePNG(192, 192, drawIcon(192, 0.62)))
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), encodePNG(512, 512, drawIcon(512, 0.62)))
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), encodePNG(512, 512, drawIcon(512, 0.42)))
fs.writeFileSync(path.join(appDir, 'icon.png'), encodePNG(256, 256, drawIcon(256, 0.62)))
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), encodePNG(180, 180, drawIcon(180, 0.62)))

console.log('Ícones gerados em public/icons, src/app/icon.png e src/app/apple-icon.png')
