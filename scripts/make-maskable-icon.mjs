// scripts/make-maskable-icon.mjs
// Gera um ícone maskable seguro a partir do ícone "sangria total" (512x512,
// sem margem), reduzindo o desenho e centralizando num canvas do mesmo
// tamanho preenchido com a cor de fundo — cria a margem de segurança que o
// Android exige (área central ~65-70%) sem perder nitidez (sem upscale).
// Script descartável, sem dependências externas (zlib do Node só).
import zlib from 'node:zlib'
import fs from 'node:fs'

const SRC = 'public/icons/Iphoneicon_512x512.png'
const OUT = 'public/icons/icon-maskable-512.png'
const SCALE = 0.62 // desenho ocupa 62% do canvas -> ~19% de margem de cada lado

function readChunks(buf) {
  let offset = 8
  const chunks = []
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.slice(offset + 8, offset + 8 + len)
    chunks.push({ type, data })
    offset += 8 + len + 4
  }
  return chunks
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function unfilter(raw, w, h) {
  const stride = w * 4
  const out = Buffer.alloc(stride * h)
  for (let y = 0; y < h; y++) {
    const filterType = raw[y * (stride + 1)]
    const srcRow = y * (stride + 1) + 1
    const dstRow = y * stride
    for (let x = 0; x < stride; x++) {
      const raw_x = raw[srcRow + x]
      const a = x >= 4 ? out[dstRow + x - 4] : 0
      const b = y > 0 ? out[dstRow - stride + x] : 0
      const c = y > 0 && x >= 4 ? out[dstRow - stride + x - 4] : 0
      let val
      if (filterType === 0) val = raw_x
      else if (filterType === 1) val = raw_x + a
      else if (filterType === 2) val = raw_x + b
      else if (filterType === 3) val = raw_x + Math.floor((a + b) / 2)
      else if (filterType === 4) val = raw_x + paeth(a, b, c)
      else throw new Error('unknown filter ' + filterType)
      out[dstRow + x] = val & 0xff
    }
  }
  return out
}

function decodePNG(path) {
  const buf = fs.readFileSync(path)
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  const chunks = readChunks(buf)
  const idat = Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data))
  const raw = zlib.inflateSync(idat)
  const rgba = unfilter(raw, w, h)
  return { w, h, rgba }
}

function samplePixel(rgba, w, x, y) {
  const i = (y * w + x) * 4
  return [rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]]
}

function bilinear(rgba, w, h, sx, sy) {
  const x0 = Math.floor(sx), y0 = Math.floor(sy)
  const x1 = Math.min(x0 + 1, w - 1), y1 = Math.min(y0 + 1, h - 1)
  const fx = sx - x0, fy = sy - y0
  const p00 = samplePixel(rgba, w, x0, y0)
  const p10 = samplePixel(rgba, w, x1, y0)
  const p01 = samplePixel(rgba, w, x0, y1)
  const p11 = samplePixel(rgba, w, x1, y1)
  const out = [0, 0, 0, 0]
  for (let c = 0; c < 4; c++) {
    const top = p00[c] * (1 - fx) + p10[c] * fx
    const bot = p01[c] * (1 - fx) + p11[c] * fx
    out[c] = Math.round(top * (1 - fy) + bot * fy)
  }
  return out
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
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
  ihdrData[8] = 8
  ihdrData[9] = 6
  const ihdr = chunk('IHDR', ihdrData)
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw, { level: 9 }))
  const iend = chunk('IEND', Buffer.alloc(0))
  return Buffer.concat([signature, ihdr, idat, iend])
}

const { w, h, rgba } = decodePNG(SRC)
console.log(`Fonte: ${SRC} (${w}x${h})`)

// Cor de fundo: a fonte tem uma margem transparente bem fina nos cantos
// (não é sangria total), então amostra um ponto interno, claramente opaco.
const [bgR, bgG, bgB] = samplePixel(rgba, w, Math.round(w / 2), Math.round(h * 0.15))
console.log(`Cor de fundo detectada: rgb(${bgR},${bgG},${bgB})`)

const size = 512
const innerSize = Math.round(size * SCALE)
const offset = Math.round((size - innerSize) / 2)

const out = Buffer.alloc(size * size * 4)
// Preenche o canvas inteiro com a cor de fundo
for (let i = 0; i < size * size; i++) {
  out[i * 4] = bgR
  out[i * 4 + 1] = bgG
  out[i * 4 + 2] = bgB
  out[i * 4 + 3] = 255
}
// A fonte tem uma margem transparente fina nos cantos (~14px em 512) — corta
// essa faixa antes de reamostrar, pra não sobrar um contorno fantasma.
const CROP = 16
const cropW = w - CROP * 2
const cropH = h - CROP * 2

// Reamostra a arte original (já sem a margem) pro tamanho reduzido e cola centralizada
for (let y = 0; y < innerSize; y++) {
  for (let x = 0; x < innerSize; x++) {
    const sx = CROP + (x / innerSize) * (cropW - 1)
    const sy = CROP + (y / innerSize) * (cropH - 1)
    const [r, g, b, a] = bilinear(rgba, w, h, sx, sy)
    const dstX = offset + x
    const dstY = offset + y
    const di = (dstY * size + dstX) * 4
    // alpha-blend sobre o fundo (a arte de origem já é opaca, mas por segurança)
    const alpha = a / 255
    out[di] = Math.round(r * alpha + bgR * (1 - alpha))
    out[di + 1] = Math.round(g * alpha + bgG * (1 - alpha))
    out[di + 2] = Math.round(b * alpha + bgB * (1 - alpha))
    out[di + 3] = 255
  }
}

fs.writeFileSync(OUT, encodePNG(size, size, out))
console.log(`Gerado: ${OUT} (${size}x${size}, arte a ${Math.round(SCALE * 100)}% do canvas)`)
