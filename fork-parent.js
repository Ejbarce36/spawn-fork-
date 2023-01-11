import crypto from 'node:crypto'
import fs from 'node:fs'
import { fork } from 'child_process'
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

const child = fork('fork-child.js')
const file = fs.readFileSync('file.txt', 'utf8')

child.send(JSON.stringify({ publicKey, file }))

let encrypted = ''
child.stdout.on('data', (data) => {
  encrypted += data

  try {
    const decrypted = crypto.privateDecrypt(
      { key: privateKey, passphrase: 'secure-passphrase' },
      encrypted,
    )

    //    Compare the original hash and the decrypted hash
    if (file === decrypted) {
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
