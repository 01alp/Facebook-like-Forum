import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { ChatContext } from "../store/chat-context";
import { WebSocketContext } from "../store/websocket-context";
import EmojiPicker from "emoji-picker-react";

function ChatWindow() {
  const { currentChat } = useContext(ChatContext);
  const { newChatMsgObj } = useContext(WebSocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatWindowRef = useRef(null);
  const currUserId = localStorage.getItem("user_id");

  // Get previous chat messages when opening chat with some user
  useEffect(() => {
    if (currentChat.recipientId) {
      fetchChatHistory();
    }
  }, [currentChat]);

  // Show new chat message when receiving it via ws
  useEffect(() => {
    if (newChatMsgObj) {
      setMessages((prevMessages) =>
        Array.isArray(prevMessages)
          ? [...prevMessages, newChatMsgObj]
          : [newChatMsgObj]
      );
    }
  }, [newChatMsgObj]);

  // Scroll to the end of chat when new message is added to view
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("http://localhost:8080/getChatHistory", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: currentChat.recipientId,
          group_chat: currentChat.groupChat,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const chatHistory = await response.json();
      setMessages(chatHistory.messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() === "") {
      return;
    }
    sendNewMessage();
    setNewMessage("");
  };

  const sendNewMessage = async () => {
    try {
      const response = await fetch("http://localhost:8080/chatMessage", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_chat: currentChat.groupChat,
          sender_id: +localStorage.getItem("user_id"),
          sender_fname: localStorage.getItem("fname"),
          user_recipient_id: currentChat.groupChat
            ? null
            : currentChat.recipientId,
          group_id: currentChat.groupChat ? currentChat.recipientId : null,
          message: newMessage,
          createdat: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const sentMessage = await response.json();
      setMessages((prevMessages) =>
        Array.isArray(prevMessages)
          ? [...prevMessages, sentMessage.message]
          : [sentMessage.message]
      );
    } catch (error) {
      console.error("Error sending new chat message:", error);
    }
  };
  const showEmojiPickerHandler = useCallback((e) => {
    e.preventDefault();
    console.log("toggle emoji picker");
    setShowEmojiPicker((val) => !val);
  }, []);
  const emojiClickHandler = (emojiObj) => {
    setNewMessage((prevInput) => {
      console.log("emo ob", emojiObj);
      return prevInput + emojiObj.emoji;
    });
  };

  return (
    <div
      className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-8 col-xxl-9"
      style={{
        padding: 5,
        boxShadow: "3px 3px 5px 5px var(--bs-body-color)",
      }}
    >
      {/* Start: ChatWrapper */}
      <div
        ref={chatWindowRef}
        style={{
          color: "var(--bs-body-bg)",
          overflowY: "auto",
          height: 450,
        }}
      >
        {/* Start: chatBox */}
        <div className="d-flex flex-column" style={{ margin: 5, padding: 5 }}>
          {/* Start: messageWrapper */}
          {messages ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="border rounded-5"
                style={{
                  margin: 5,
                  boxShadow: "3px 3px 5px 5px var(--bs-body-color)",
                  marginBottom: 15,
                  padding: 5,
                  color: "rgb(0, 0, 0)",
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "45%",
                  ...(message.sender_id == currUserId
                    ? { alignSelf: "flex-end" }
                    : { alignSelf: "flex-start" }),
                }}
              >
                {/* Start: UserName */}
                <div
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 10,
                    borderBottomWidth: 2,
                    borderBottomStyle: "inset",
                    background: "var(--bs-primary)",
                    marginRight: 20,
                    marginLeft: 20,
                    color: "var(--bs-body-bg)",
                  }}
                >
                  {message.sender_id == currUserId ? (
                    <span>You</span>
                  ) : (
                    <span>{message.sender_fname}</span>
                  )}
                </div>
                {/* End: UserName */}
                {/* Start: message */}
                <div
                  className="d-flex"
                  style={{
                    padding: 10,
                    paddingTop: 3,
                    paddingBottom: 3,
                    margin: 0,
                  }}
                >
                  <span>{message.message}&nbsp;</span>
                </div>
                {/* End: message */}
              </div>
            ))
          ) : (
            <p style={{ color: "black" }}>No messages to display</p>
          )}
          {/* End: messageWrapper */}
        </div>
        {/* End: chatBox */}
      </div>
      {/* End: ChatWrapper */}
      {/* Start: messageForm */}
      <div style={{ margin: 5, padding: 5 }}>
        {showEmojiPicker && (
          <div
            style={{ marginLeft: 5, marginBottom: 100, bottom: "20%" }}
            className="d-flex align-items-sm-center position-absolute"
          >
            <EmojiPicker onEmojiClick={emojiClickHandler} width={300} />
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="d-flex justify-content-start flex-wrap align-items-md-center align-items-lg-center"
          style={{
            borderStyle: "inset",
            borderRadius: 10,
            margin: 5,
            padding: 5,
          }}
        >
          {/* Start: textArea */}
          <div style={{ width: "70%" }}>
            <textarea
              className="form-control"
              placeholder="Send message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>
          {/* End: textArea */}
          <div className="d-flex align-items-sm-center">
            {/* Start: Smiley */}
            <div
              style={{ marginLeft: 5, marginRight: 5 }}
              onClick={showEmojiPickerHandler}
            >
              <i
                className="far fa-smile"
                style={{
                  fontSize: 32,
                  color: "var(--bs-yellow)",
                }}
              />
            </div>
            {/* End: Smiley */}
            {/* Start: button */}
            <div>
              <button className="btn btn-primary btn-sm" type="submit">
                <i className="far fa-paper-plane" style={{ fontSize: 24 }} />
              </button>
            </div>
            {/* End: button */}
          </div>
        </form>
      </div>
      {/* End: messageForm */}
    </div>
  );
}

export default ChatWindow;
