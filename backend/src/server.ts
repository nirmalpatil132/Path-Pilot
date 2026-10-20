import { app } from './app.js'
import { config } from './config/env.js'

app.listen(config.port, () => {
  console.log(`[PathPilot API] Server running on port ${config.port} (${config.nodeEnv})`)
  console.log(`[PathPilot API] Allowed CORS origin: ${config.frontendUrl}`)
})
