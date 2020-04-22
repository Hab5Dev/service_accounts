import mongoose, { Schema } from 'mongoose'

/// Helper for validating an account email address using Regex
const validateEmail = (email: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)

/// The Account Schema
const AccountSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: [validateEmail, 'Please provide a valid email address'],
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    min: [5, 'The username must be more then ({MIN}) characters'],
    max: [45, 'The username must be less then ({MAX}) characters'],
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  }
})

export default mongoose.models.Account || mongoose.model('Account', AccountSchema)
