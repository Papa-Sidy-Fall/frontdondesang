import { getAccessToken } from "./auth-storage";
import { httpRequest } from "./http-client";
import type { ConversationDto, ConversationMessageDto, MessageContactDto } from "../types/message";

function requireToken(): string {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing auth token");
  }

  return token;
}

export function getMessageContacts(): Promise<{ contacts: MessageContactDto[]; total: number }> {
  return httpRequest<{ contacts: MessageContactDto[]; total: number }>("/api/v1/messages/contacts", {
    method: "GET",
    token: requireToken(),
  });
}

export function getConversations(): Promise<{ conversations: ConversationDto[]; total: number }> {
  return httpRequest<{ conversations: ConversationDto[]; total: number }>("/api/v1/messages/conversations", {
    method: "GET",
    token: requireToken(),
  });
}

export function createConversation(payload: {
  participantUserId: string;
  subject?: string;
}): Promise<{ conversationId: string }> {
  return httpRequest<{ conversationId: string }>("/api/v1/messages/conversations", {
    method: "POST",
    token: requireToken(),
    body: JSON.stringify(payload),
  });
}

export function getConversationMessages(
  conversationId: string,
  limit = 100
): Promise<{ messages: ConversationMessageDto[]; total: number }> {
  return httpRequest<{ messages: ConversationMessageDto[]; total: number }>(
    `/api/v1/messages/conversations/${conversationId}/messages?limit=${limit}`,
    {
      method: "GET",
      token: requireToken(),
    }
  );
}

export function sendConversationMessage(
  conversationId: string,
  body: string
): Promise<{ message: string }> {
  return httpRequest<{ message: string }>(`/api/v1/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    token: requireToken(),
    body: JSON.stringify({ body }),
  });
}
