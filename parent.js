import crypto from 'node:crypto'
import fs from 'node:fs'
import { spawn } from 'child_process'
// this code generate a private & public key
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'secure-passphrase',
  },
})

console.time('time')
const used = process.memoryUsage().heapUsed / 1024 / 1024

const child = spawn('node', ['child.js'])
const file = fs.readFileSync('file.txt', 'utf8')

child.stdin.write(JSON.stringify({ publicKey, file }))

child.stdout.on('data', (encrypted) => {
  try {
    const decrypted = crypto.privateDecrypt(
      { key: privateKey, passphrase: 'secure-passphrase' },
      encrypted,
    )

    if (file === decrypted.toString()) {
      console.log('The decrypted file is the same as the original file')
    } else {
      console.log('The decrypted file is not the same as the original file')
    }
    const total = process.memoryUsage().heapTotal / 1024 / 1024
    console.log(`memoryUsage: ${total - used} mb`)
    console.timeEnd('time')
    child.stdin.end()
  } catch (error) {
    console.error(error)
  }
})
