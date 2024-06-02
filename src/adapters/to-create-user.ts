import { CreateUser } from '../models/create-user'
import { CreateUserDto } from '../models/create-user-dto'

export const toCreateUser = (user: CreateUserDto): CreateUser => {
  return {
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
  }
}
