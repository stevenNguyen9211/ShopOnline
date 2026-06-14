export type User = {
  id: string
  displayName: string
  password: string
}

export const users: User[] = [
  { id: 'minh', displayName: 'Minh Nguyễn', password: '123' },
  { id: 'lan', displayName: 'Lan Trần', password: '123' },
  { id: 'hung', displayName: 'Hùng Phạm', password: '123' },
]

export function findByCredentials(username: string, password: string): User | undefined {
  return users.find((u) => u.id === username && u.password === password)
}
