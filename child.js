import process from 'node:process'
import crypto from 'node:crypto'

process.stdin.on('data', (data) => {
  const { publicKey, file } = JSON.parse(data)
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(file))
  process.stdout.write(encrypted)
})
