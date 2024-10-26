import { createContext } from 'react';
import { User } from '../api/users';

export const UsersContext = createContext<User[]>([]);
