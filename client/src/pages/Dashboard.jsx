import { Link } from "react-router-dom";
import { FiFileText, FiMessageSquare, FiUploadCloud, FiClock } from "react-icons/fi";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import { formatRelativeTime } from "../utils/formatDate";
import { FILE_TYPE_LABELS } from "../types";

const Dashboard = () => {
  const { metrics, recentUploads, recentChats, loading, error } = useDashboard();

  return (
    <div className="space-y-8">
      <div>
        <p className="label-eyebrow mb-1">Overview</p>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      </div>

      {loading && <Spinner label="Loading your dashboard..." />}
      {error && <Alert type="error">{error}</Alert>}

      {metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Total documents"
              value={metrics.totalDocuments}
              icon={<FiFileText />}
            />
            <StatCard
              label="Questions asked"
              value={metrics.totalQuestions}
              icon={<FiMessageSquare />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold">Recent uploads</h2>
                <Link to="/documents" className="text-sm text-accent font-medium">
                  View all
                </Link>
              </div>
              {recentUploads.length === 0 ? (
                <EmptyState
                  icon={<FiUploadCloud />}
                  title="No documents yet"
                  description="Upload your first document to get started."
                  action={
                    <Link to="/documents" className="btn-primary text-sm inline-block">
                      Upload a document
                    </Link>
                  }
                />
              ) : (
                <div className="card divide-y divide-ink/10">
                  {recentUploads.map((doc) => (
                    <div key={doc._id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <p className="text-xs text-ink/45">
                          {FILE_TYPE_LABELS[doc.fileType]} - {formatRelativeTime(doc.createdAt)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-soft text-accent-dark capitalize shrink-0">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold">Recent chats</h2>
                <Link to="/history" className="text-sm text-accent font-medium">
                  View all
                </Link>
              </div>
              {recentChats.length === 0 ? (
                <EmptyState
                  icon={<FiMessageSquare />}
                  title="No questions yet"
                  description="Ask a question about one of your documents."
                  action={
                    <Link to="/ask" className="btn-primary text-sm inline-block">
                      Ask a question
                    </Link>
                  }
                />
              ) : (
                <div className="card divide-y divide-ink/10">
                  {recentChats.map((chat) => (
                    <div key={chat._id} className="p-4">
                      <p className="font-medium text-sm truncate">{chat.question}</p>
                      <p className="text-xs text-ink/45 mt-1 flex items-center gap-1.5">
                        <FiClock size={11} />
                        {chat.document?.title} - {formatRelativeTime(chat.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
