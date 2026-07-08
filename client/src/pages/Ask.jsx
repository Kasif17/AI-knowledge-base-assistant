import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import { useDocuments } from "../hooks/useDocuments";
import { askQuestionRequest } from "../services/conversationService";
import { getErrorMessage } from "../api/axiosClient";
import ChatMessage from "../components/ChatMessage";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

const Ask = () => {
  const location = useLocation();
  const { documents, loading: docsLoading } = useDocuments({ page: 1, limit: 50 });
  const readyDocuments = useMemo(
    () => documents.filter((d) => d.status === "ready"),
    [documents]
  );

  const [selectedDocId, setSelectedDocId] = useState(location.state?.documentId || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (location.state?.documentId) {
      setSelectedDocId(location.state.documentId);
    }
  }, [location.state]);

  useEffect(() => {
    setMessages([]); // switching documents starts a fresh visible thread
  }, [selectedDocId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, asking]);

  const selectedDoc = readyDocuments.find((d) => d._id === selectedDocId);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      toast.error("Choose a document first");
      return;
    }
    if (!question.trim()) return;

    const askedQuestion = question.trim();
    setQuestion("");
    setAsking(true);

    try {
      const res = await askQuestionRequest(selectedDocId, askedQuestion);
      setMessages((prev) => [...prev, { ...res.data.conversation, question: askedQuestion }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          question: askedQuestion,
          answer: getErrorMessage(err),
          createdAt: new Date().toISOString(),
          failed: true,
        },
      ]);
      toast.error("The AI couldn't answer that question");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow mb-1">Ask</p>
        <h1 className="font-display text-3xl font-semibold">Ask your documents</h1>
      </div>

      <div className="card p-4">
        <label className="text-sm font-medium block mb-1.5" htmlFor="doc-select">
          Document
        </label>
        {docsLoading ? (
          <Spinner label="Loading documents..." />
        ) : readyDocuments.length === 0 ? (
          <Alert type="info">
            No documents are ready to query yet. Upload one from the Documents page first.
          </Alert>
        ) : (
          <select
            id="doc-select"
            className="input-field"
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            <option value="" disabled>
              Select a document
            </option>
            {readyDocuments.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="card flex flex-col h-[60vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          {!selectedDocId ? (
            <EmptyState
              icon={<FiMessageSquare />}
              title="Pick a document to start"
              description="Your conversation will appear here once you ask a question."
            />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<FiMessageSquare />}
              title={`Ask something about "${selectedDoc?.title}"`}
              description='Try: "What is the leave policy?" or "Summarize this document."'
            />
          ) : (
            messages.map((msg, i) => (
              <ChatMessage
                key={msg._id || msg.id || i}
                question={msg.question}
                answer={msg.answer}
                createdAt={msg.createdAt}
                failed={msg.failed}
              />
            ))
          )}
          {asking && <Spinner label="Thinking..." />}
        </div>

        <form onSubmit={handleAsk} className="border-t border-ink/10 p-3 flex gap-2">
          <input
            className="input-field"
            placeholder={
              selectedDocId ? "Ask a question about this document..." : "Select a document first"
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!selectedDocId || asking}
          />
          <button
            type="submit"
            className="btn-primary flex items-center gap-1.5 shrink-0"
            disabled={!selectedDocId || asking || !question.trim()}
          >
            <FiSend size={15} /> Ask
          </button>
        </form>
      </div>
    </div>
  );
};

export default Ask;
