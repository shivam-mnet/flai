import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../Interact.css'; // Importing CSS for basic styling

const Interact = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [intro, setIntro] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch chat history from backend
    axios.get('http://localhost:3668/suggestions')
      .then(response => {
        const suggestions = JSON.parse(response.data.suggestions);
        setIntro([...suggestions]);
      })
      .catch(error => {
        console.error('Failed to fetch chat history:', error);
      });
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { question: input, answer: null };
    setChatHistory([...chatHistory, newMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await axios.post('http://localhost:3668/query', { question: input, topic: 'topic', history: chatHistory});
      console.log(response.data);
      console.log("chat-hist-after-response", chatHistory);
      const newQuery = { question: input, answer: response.data.answer };
      setChatHistory((prev) => {
        prev = prev.slice(0, -1);
        return [...prev, newQuery];
      });
    } catch (err) {
      console.error('Failed to get response from backend:', err);
      const updatedChatHistory = chatHistory.map(msg =>
        msg.question === input ? { ...msg, answer: 'Error: Failed to get response' } : msg
      );
      setChatHistory(updatedChatHistory);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-history">
        <div className="intro">
          {intro.map((entry, index) => (
            <div key={index} className="chat-bubble">
              <div className="intro">{entry}</div>
            </div>
          ))}
        </div>
        {chatHistory.map((entry, index) => (
          <div key={index} className="chat-bubble">
            <div className="question">{entry.question}</div>
            <div className="answer">{<ReactMarkdown>{entry.answer}</ReactMarkdown> || (loading && <div>Loading...</div>)}</div>
          </div>
        ))}
      </div>
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your question..."
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? <div className="loader"></div> : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Interact;