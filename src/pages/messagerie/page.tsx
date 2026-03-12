import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  createConversation,
  getConversationMessages,
  getConversations,
  getMessageContacts,
  sendConversationMessage,
} from "../../services/message-api";
import { clearSession, getAccessToken } from "../../services/auth-storage";
import { getCurrentUser } from "../../services/auth-api";
import { ApiError } from "../../services/http-client";
import type { ConversationDto, ConversationMessageDto, MessageContactDto } from "../../types/message";

interface DirectMessageNavigationState {
  prefillContact?: MessageContactDto;
}

export default function MessageriePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ConversationMessageDto[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [newConversationContactId, setNewConversationContactId] = useState("");
  const [newConversationSubject, setNewConversationSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pendingDirectContactId = searchParams.get("contactId") ?? "";
  const navigationState = (location.state as DirectMessageNavigationState | null) ?? null;
  const prefillContact = navigationState?.prefillContact ?? null;

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );
  const selectableContacts = useMemo(() => {
    if (currentRole === "DONOR") {
      return contacts;
    }

    return contacts.filter((contact) => contact.role === "HOSPITAL");
  }, [contacts, currentRole]);

  const loadBaseData = async () => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const profile = await getCurrentUser(token);
      setCurrentRole(profile.role);

      const [contactsResponse, conversationsResponse] = await Promise.all([
        getMessageContacts(),
        getConversations(),
      ]);

      setContacts(contactsResponse.contacts);
      setConversations(conversationsResponse.conversations);

      if (!selectedConversationId && conversationsResponse.conversations.length > 0) {
        setSelectedConversationId(conversationsResponse.conversations[0].id);
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearSession();
        navigate("/connexion-donneur", { replace: true });
        return;
      }

      setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger la messagerie");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      newConversationContactId &&
      !selectableContacts.some((contact) => contact.id === newConversationContactId)
    ) {
      setNewConversationContactId("");
    }
  }, [newConversationContactId, selectableContacts]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await getConversationMessages(selectedConversationId);
        setMessages(response.messages);
      } catch (caughtError) {
        setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger les messages");
      }
    };

    void loadMessages();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!pendingDirectContactId || loading) {
      return;
    }

    let cancelled = false;

    const openDirectConversation = async () => {
      try {
        setError("");

        const created = await createConversation({
          participantUserId: pendingDirectContactId,
          subject: prefillContact
            ? `Conversation ${prefillContact.hospitalName ?? prefillContact.nom}`
            : undefined,
        });

        const refreshed = await getConversations();

        if (cancelled) {
          return;
        }

        setConversations(refreshed.conversations);
        setSelectedConversationId(created.conversationId);
        setSearchParams((params) => {
          const next = new URLSearchParams(params);
          next.delete("contactId");
          return next;
        }, { replace: true });
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Ouverture de la conversation impossible"
        );
      }
    };

    void openDirectConversation();

    return () => {
      cancelled = true;
    };
  }, [loading, pendingDirectContactId, prefillContact, setSearchParams]);

  const handleCreateConversation = async (event: React.FormEvent) => {
    event.preventDefault();

    const participantUserId = newConversationContactId;

    if (!participantUserId) {
      setError("Choisissez un contact.");
      return;
    }

    try {
      setError("");
      const created = await createConversation({
        participantUserId,
        subject: newConversationSubject || undefined,
      });

      setNewConversationSubject("");
      setNewConversationContactId("");

      await loadBaseData();
      setSelectedConversationId(created.conversationId);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Création de conversation impossible");
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedConversationId || !messageBody.trim()) {
      return;
    }

    try {
      setError("");
      await sendConversationMessage(selectedConversationId, messageBody.trim());
      setMessageBody("");

      const response = await getConversationMessages(selectedConversationId);
      setMessages(response.messages);

      const refreshed = await getConversations();
      setConversations(refreshed.conversations);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Envoi impossible");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Retour
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          {currentRole !== "DONOR" && (
            <p className="mb-3 text-sm text-gray-600">
              Pour envoyer un message a un donneur, utilisez l'icone message depuis la gestion des donneurs.
            </p>
          )}
          <form
            onSubmit={handleCreateConversation}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <select
              value={newConversationContactId}
              onChange={(event) => setNewConversationContactId(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">
                {currentRole === "DONOR" ? "Hôpital / CNTS" : "Hôpital / CNTS"}
              </option>
              {selectableContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.hospitalName ?? contact.nom}
                </option>
              ))}
            </select>
            <input
              value={newConversationSubject}
              onChange={(event) => setNewConversationSubject(event.target.value)}
              placeholder="Sujet (optionnel)"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button type="submit" className="bg-red-600 text-white rounded-lg px-3 py-2 font-semibold">
              Créer conversation
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 lg:col-span-1 h-[70vh] overflow-auto">
            <h2 className="font-semibold mb-3">Conversations</h2>
            {loading && <p className="text-sm text-gray-500">Chargement...</p>}
            {!loading && conversations.length === 0 && <p className="text-sm text-gray-500">Aucune conversation</p>}
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selectedConversationId === conversation.id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{conversation.subject}</div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{conversation.lastMessage ?? "Aucun message"}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleString("fr-FR")
                      : "-"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 lg:col-span-2 h-[70vh] flex flex-col">
            <div className="border-b border-gray-200 pb-3 mb-3">
              <h2 className="font-semibold text-gray-900">
                {selectedConversation?.subject ?? "Sélectionnez une conversation"}
              </h2>
            </div>

            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {message.senderName} ({message.senderRole}) · {new Date(message.createdAt).toLocaleString("fr-FR")}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.body}</p>
                </div>
              ))}
              {selectedConversationId && messages.length === 0 && (
                <p className="text-sm text-gray-500">Aucun message pour le moment.</p>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-200 mt-3 flex gap-2">
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                disabled={!selectedConversationId}
              />
              <button
                type="submit"
                className="bg-red-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                disabled={!selectedConversationId || !messageBody.trim()}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
