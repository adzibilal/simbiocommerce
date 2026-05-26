import { getContactMessages, markContactRead, deleteContactMessage } from "@/app/actions/contact";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Contact Messages | Admin",
};

export default async function ContactMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Contact Messages</h1>
        <p className="text-dark-4 text-sm mt-1">{messages.length} message{messages.length !== 1 ? "s" : ""} total</p>
      </div>

      <div className="bg-white rounded-xl shadow-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-dark-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-40">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1">
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Message</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className={`border-b border-gray-3 last:border-0 ${msg.status === "unread" ? "bg-blue/5" : ""}`}>
                    <td className="py-3 px-4 font-medium text-dark">
                      {msg.firstName} {msg.lastName}
                      {msg.phone && <div className="text-xs text-dark-4 mt-0.5">{msg.phone}</div>}
                    </td>
                    <td className="py-3 px-4 text-dark-2">{msg.email}</td>
                    <td className="py-3 px-4 text-dark-2">{msg.subject || "-"}</td>
                    <td className="py-3 px-4 text-dark-2 max-w-[240px]">
                      <p className="line-clamp-2">{msg.message}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        msg.status === "unread"
                          ? "bg-blue/10 text-blue"
                          : msg.status === "replied"
                          ? "bg-green/10 text-green"
                          : "bg-gray-2 text-dark-4"
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-dark-4 whitespace-nowrap">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {msg.status === "unread" && (
                          <form action={async () => {
                            "use server";
                            await markContactRead(msg.id);
                          }}>
                            <button
                              type="submit"
                              title="Mark as read"
                              className="p-1.5 rounded hover:bg-blue/10 text-blue transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          </form>
                        )}
                        <form action={async () => {
                          "use server";
                          await deleteContactMessage(msg.id);
                        }}>
                          <button
                            type="submit"
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red/10 text-red transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
