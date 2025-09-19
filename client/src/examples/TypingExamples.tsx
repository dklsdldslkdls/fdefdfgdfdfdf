import { useEffect, useState } from "react";
import {
  useMessageSimulation,
  useActiveConversation,
} from "@/hooks/MessagesProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TypingExamples() {
  const [customMessage, setCustomMessage] = useState("");
  const [customUserId, setCustomUserId] = useState("user456");
  const [customUserName, setCustomUserName] = useState("Bob");

  const {
    simulateIncomingMessage,
    simulateTypingThenMessage,
    simulateExternalUserTyping,
    simulateRealisticTyping,
    simulateRandomTypingPause,
    simulateNewUserConversation,
  } = useMessageSimulation();

  const currentConvo = useActiveConversation();

  // Demo automatico all'avvio
  useEffect(() => {
    if (currentConvo.activeConversationId) {
      // Avvia una demo automatica dopo 2 secondi
      setTimeout(() => {
        demoRealisticConversation();
      }, 2000);
    }
  }, [currentConvo.activeConversationId]);

  const demoRealisticConversation = () => {
    const conversationId = currentConvo.activeConversationId;
    if (!conversationId) return;

    // Sequenza realistica di messaggi con typing
    simulateRealisticTyping(
      conversationId,
      "demo_user",
      "Emma",
      [
        "Hey! 👋",
        "How's your day going?",
        "I just finished that project we talked about",
        "Want to grab coffee later? ☕",
      ],
      1000,
    );
  };

  const handleSimpleTyping = () => {
    if (!currentConvo.activeConversationId) return;

    simulateExternalUserTyping(
      currentConvo.activeConversationId,
      customUserId,
      customUserName,
      3000, // 3 secondi di typing
    );
  };

  const handleTypingThenMessage = () => {
    if (!currentConvo.activeConversationId || !customMessage) return;

    simulateTypingThenMessage(
      currentConvo.activeConversationId,
      customUserId,
      customUserName,
      customMessage,
      2000, // 2 secondi di typing
    );

    setCustomMessage("");
  };

  const handleRealisticTyping = () => {
    if (!currentConvo.activeConversationId) return;

    const messages = [
      "This is a realistic typing simulation",
      "It calculates typing speed based on message length",
      "And adds natural pauses between messages",
      "Pretty cool, right? 😎",
    ];

    simulateRealisticTyping(
      currentConvo.activeConversationId,
      customUserId,
      customUserName,
      messages,
      500,
    );
  };

  const handleRandomPauseTyping = () => {
    if (!currentConvo.activeConversationId) return;

    simulateRandomTypingPause(
      currentConvo.activeConversationId,
      customUserId,
      customUserName,
      "This message simulates realistic typing with random pauses... just like when someone stops to think while typing!",
    );
  };

  const handleNewUserConversation = () => {
    simulateNewUserConversation(
      "New User",
      "new_user_" + Date.now(),
      "Hello! I'm a new user joining the conversation.",
    );
  };

  const handleInstantMessage = () => {
    if (!currentConvo.activeConversationId || !customMessage) return;

    simulateIncomingMessage(
      currentConvo.activeConversationId,
      customUserId,
      customUserName,
      customMessage,
    );

    setCustomMessage("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          🎭 Typing Simulation Examples
        </h2>
        <div className="space-y-4">
          {/* User Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <Input
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                User Name
              </label>
              <Input
                value={customUserName}
                onChange={(e) => setCustomUserName(e.target.value)}
                placeholder="Enter user name"
              />
            </div>
          </div>

          {/* Custom Message Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Message
            </label>
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a custom message"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleSimpleTyping}
              variant="outline"
              className="w-full"
            >
              ⌨️ Just Typing (3s)
            </Button>

            <Button
              onClick={handleTypingThenMessage}
              disabled={!customMessage}
              className="w-full"
            >
              ⌨️➡️💬 Type Then Send
            </Button>

            <Button
              onClick={handleRealisticTyping}
              variant="outline"
              className="w-full"
            >
              🤖 Realistic Sequence
            </Button>

            <Button
              onClick={handleRandomPauseTyping}
              variant="outline"
              className="w-full"
            >
              ⏸️ Random Pauses
            </Button>

            <Button
              onClick={handleInstantMessage}
              disabled={!customMessage}
              variant="secondary"
              className="w-full"
            >
              ⚡ Instant Message
            </Button>

            <Button
              onClick={handleNewUserConversation}
              variant="secondary"
              className="w-full"
            >
              👤➕ New User Chat
            </Button>
          </div>

          {/* Status Info */}
          {currentConvo.activeConversationId && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">
                Current Conversation Status:
              </h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>ID:</strong> {currentConvo.activeConversationId}
                </p>
                <p>
                  <strong>Messages:</strong> {currentConvo.messages.length}
                </p>
                <p>
                  <strong>Typing Users:</strong>{" "}
                  {currentConvo.typingUsers.length}
                </p>
                {currentConvo.isTyping && (
                  <p className="text-blue-600">
                    <strong>👀 Currently typing:</strong>{" "}
                    {currentConvo.typingUsers.map((u) => u.userName).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Usage Examples */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Usage Tips:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                <strong>Just Typing:</strong> Mostra solo l'indicatore senza
                inviare messaggi
              </li>
              <li>
                <strong>Type Then Send:</strong> Mostra typing per alcuni
                secondi poi invia il messaggio
              </li>
              <li>
                <strong>Realistic Sequence:</strong> Simula una conversazione
                naturale con più messaggi
              </li>
              <li>
                <strong>Random Pauses:</strong> Aggiunge pause casuali durante
                la digitazione
              </li>
              <li>
                <strong>Instant Message:</strong> Invia un messaggio
                immediatamente senza typing
              </li>
              <li>
                <strong>New User Chat:</strong> Crea una nuova conversazione con
                un messaggio iniziale
              </li>
            </ul>
          </div>

          {/* Code Examples */}
          <div className="mt-6 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
            <h3 className="font-semibold mb-2 text-white">📋 Code Examples:</h3>
            <pre className="whitespace-pre-wrap">{`
// Typing semplice
simulateExternalUserTyping(conversationId, "user123", "Alice", 3000);

// Typing poi messaggio
simulateTypingThenMessage(conversationId, "user123", "Alice", "Hello!", 2000);

// Sequenza realistica
simulateRealisticTyping(conversationId, "user123", "Alice", [
  "Hey!",
  "How are you?",
  "Want to chat?"
], 1000);

// Typing con pause casuali
simulateRandomTypingPause(conversationId, "user123", "Alice", "Long message...");
            `}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingExamples;
