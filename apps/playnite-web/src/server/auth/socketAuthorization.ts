import { IdentityService } from '.'

const authenticateSocket = async (fn) => async (ws, req) => {
  try {
    const encodedCreds = req.headers['authorization']
      ?.replace('Basic ', '')
      ?.trim()

    const [username, password] = Buffer.from(encodedCreds || '', 'base64')
      .toString('utf-8')
      .split(':')

    if (!username || !password) {
      ws.close(400, 'Authentication required')
      return
    }

    const identityService = new IdentityService(
      process.env.SECRET,
      process.env.HOST ?? 'localhost',
    )
    await identityService.authenticate({
      username,
      password,
    })
  } catch (err) {
    ws.close(401, `Authentication failed: ${err}`)
    return
  }

  fn(ws, req)
}

export { authenticateSocket }
