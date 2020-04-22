import seneca from 'seneca'
import dotenv from 'dotenv'
import AccountServicePlugin, { ROLE_NAME as AccountServicePluginRole } from './account-plugin'

/// Initialize the Account Service
const AccountService = seneca()
/// Initialize the .env Variables
dotenv.config()

/// Register the Account Plugin
AccountService.use(AccountServicePlugin, {
  mongoURI: process.env.MONGO_URI || `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DATA}`
})

/// Register the Account Plugin to the SenecaMesh
AccountService.use('mesh', {
  auto: true,
  pin: `role:${AccountServicePluginRole},cmd:*`
})
