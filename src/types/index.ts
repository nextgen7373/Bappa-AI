export type Sender = 'user' | 'bappa'
export interface Message { id: string; sender: Sender; text: string; createdAt: number }
