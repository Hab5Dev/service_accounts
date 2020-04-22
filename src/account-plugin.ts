import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import readline from 'readline'
import Account from './account-schema'

export const ROLE_NAME = 'Authentication'

/**
 * The plugin properties
 */
interface Props {
  /**
   * The MongoURI
   * @memberof AccountPlugin
   * @type {String}
   */
  mongoURI: string,
}

/**
 * The Account Service Plugin
 * @param {Object} props
 * @param {String} options.mongoURI
 */
export default function AccountServicePlugin (props: Props) {
  /// Create a MongoDB connection
  const connection = mongoose.createConnection(props.mongoURI);
  /// Default hash salt size
  const defaultSaltSize = 10

  /// MongoDB connected callback
  connection.on('connected', () => {
    console.log(`Mongoose opened a connection to: ${props.mongoURI}`)
  })

  /// MongoDB connection failed callback
  connection.on('error', () => {
    console.error(`Mongoose couldn't connect to: ${props.mongoURI}`)
    throw new Error(`Mongoose couldn't connect to: ${props.mongoURI}`)
  })

  /// Helper for windows to support SIGINT event
  if (process.platform === 'win32') {
    const readlineHandler = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
 
    readlineHandler.on('SIGINT', () => {
      // @ts-ignore
      process.emit('SIGINT')
    })
  }

  /// MicroService Signal Interrupt handler
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose closed the connection due to application SIGINT request.')
    })
  })

  /// Hash a password using bcrypt
  const hash = (password: any, callback: any) => {
    return bcrypt.hash(password, defaultSaltSize, callback)
  }

  /// Verify a hashed password
  const verify = (password: string, hash: string, callback: any) => {
    return bcrypt.compare(password, hash, callback)
  }

  /// Create a new Account
  // @ts-ignore
  this.add({ role: ROLE_NAME, cmd: 'create' }, (request, response) => {
    return Account.find({
      email: request.email,
      username: request.username
    }, (err, accounts) => {
      if (err) {
        return response(err)
      }

      if (accounts.length > 0) {
        return response(null, {
          result: 'The account username or email already exists.'
        })
      }

      return hash(request.password, (err: Error, hashed: string) => {
        if (err) {
          return response(err)
        }

        request.password = hashed
        return Account.create(request, (err: Error, _account: any) => {
          if (err) {
            return response(err)
          }

          return response(null, {
            result: 'success'
          })
        })
      })
    })
  })

  /// Authenticate an Account
  // @ts-ignore
  this.add({ role: ROLE_NAME, cmd: 'authenticate' }, (request, response) => {
    return Account.findOne({
      email: request.email,
      username: request.username
    }, (err: Error, account: any) => {
      if (err) {
        return response(err)
      }

      return verify(request.password, account.password, (err: Error, result: Boolean) => {
        if (err) {
          return response(err)
        }

        return response(null, {
          result: result ? account._id : 'The account credentials did not match any existing records.'
        })
      })
    })
  })
}
