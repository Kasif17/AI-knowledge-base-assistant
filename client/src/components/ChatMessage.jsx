import { FiUser, FiFeather } from "react-icons/fi";
import { formatDateTime } from "../utils/formatDate";

const ChatMessage = ({ question, answer, createdAt, failed }) => (
  <div className="space-y-3">
    <div className="flex justify-end">
      <div className="flex items-start gap-2 max-w-[85%] flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center shrink-0">
          <FiUser size={13} />
        </div>
        <div className="bg-ink text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
          {question}
        </div>
      </div>
    </div>

    <div className="flex justify-start">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <FiFeather size={13} />
        </div>
        <div>
          <div
            className={
              failed
                ? "bg-clay-soft text-clay rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                : "bg-white border border-ink/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
            }
          >
            {answer}
          </div>
          {createdAt && (
            <p className="text-xs text-ink/35 mt-1 ml-1">{formatDateTime(createdAt)}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ChatMessage;
