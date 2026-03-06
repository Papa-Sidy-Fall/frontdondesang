export interface MessageContactDto {
  id: string;
  nom: string;
  email: string;
  role: string;
  hospitalName: string | null;
  ville: string | null;
}

export interface ConversationDto {
  id: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  participants: Array<{
    userId: string;
    nom: string;
    email: string;
    role: string;
    hospitalName: string | null;
  }>;
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
}
