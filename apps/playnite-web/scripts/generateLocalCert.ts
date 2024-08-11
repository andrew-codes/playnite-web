import fs from 'fs'
import sh from 'shelljs'

sh.exec('mkdir -p ./cert')
if (fs.existsSync('./cert/server.key') && fs.existsSync('./cert/server.cert')) {
  sh.exit(0)
}
sh.exec(
  `openssl req -nodes -new -x509 -keyout ./cert/server.key -out ./cert/server.cert -subj "/C=US/ST=State/L=City/O=company/OU=Com/CN=localhost"`,
)
