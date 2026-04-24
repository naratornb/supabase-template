"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase/client";

type UserRow = {
  id: string;
  username: string;
  role: string;
  email?: string;
  status?: string;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [role, setRole] = useState("member");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isAdmin = role === "admin";

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!isMounted) {
        return;
      }
      setRole((session?.user?.app_metadata?.role as string) || "member");
    };

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setRole((session?.user?.app_metadata?.role as string) || "member");
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const payload = await response.json();
      setUsers(payload.users || []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to fetch users."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setEditEmail("");
      setEditStatus("active");
      setEditCreatedAt("");
      setSaveError("");
      return;
    }

    setEditEmail(selectedUser.email || "");
    setEditStatus(selectedUser.status || "active");
    setEditCreatedAt(selectedUser.createdAt || "");
    setSaveError("");
  }, [selectedUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch(`${API_URL}/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: editEmail,
          status: editStatus,
          createdAt: editCreatedAt,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save user changes.");
      }

      await loadUsers();
      setSelectedUser(null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayUsers = useMemo(() => users, [users]);

  return (
    <div className="bg-surface-alt font-body-base text-text-primary h-screen flex overflow-hidden">
      <nav className="bg-slate-50 text-slate-900 font-sans text-[13px] font-medium h-full w-64 border-r border-slate-200 flex flex-col gap-1 p-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-sm">
              token
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold leading-tight">
              Project Alpha
            </span>
            <span className="text-text-secondary text-[11px] leading-tight">
              Authentication
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button className="bg-slate-200 text-slate-900 rounded-md px-3 py-2 flex items-center gap-3 transition-transform active:scale-[0.99]">
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>Users</span>
          </button>
          <button className="text-slate-600 px-3 py-2 flex items-center gap-3 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Auth Logs</span>
          </button>
          <button className="text-slate-600 px-3 py-2 flex items-center gap-3 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">security</span>
            <span>Policies</span>
          </button>
          <button className="text-slate-600 px-3 py-2 flex items-center gap-3 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white text-slate-900 text-sm tracking-tight border-b border-slate-200 flex justify-between items-center w-full px-6 h-16 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="text-xl font-bold tracking-tighter text-slate-900">
              Supabase Admin
            </div>
            <div className="relative max-w-md w-full hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                search
              </span>
              <input
                className="w-full h-9 pl-9 pr-3 bg-surface-alt border border-border-subtle rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="Search resources..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-text-secondary font-medium">
                <kbd className="px-1.5 py-0.5 border border-border-subtle rounded bg-surface-main">
                  ⌘
                </kbd>
                <kbd className="px-1.5 py-0.5 border border-border-subtle rounded bg-surface-main">
                  K
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 border-r border-border-subtle pr-4">
              <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded transition-colors">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded transition-colors relative">
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-active rounded-full border-2 border-white" />
              </button>
            </div>
            <button
              className="font-medium text-sm hover:text-text-secondary transition-colors"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
              <div>
                <h1 className="font-h2 text-h2 text-text-primary mb-1">
                  User Management
                </h1>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Manage access, roles, and user lifecycle events.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                    filter_list
                  </span>
                  <input
                    className="w-full h-9 pl-9 pr-3 bg-surface-main border border-border-subtle rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                    placeholder="Filter by email or ID..."
                    type="text"
                  />
                </div>
                <button
                  className="h-9 px-3 flex items-center gap-2 bg-surface-main border border-border-subtle rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  onClick={loadUsers}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    refresh
                  </span>
                  Refresh
                </button>
                <button className="h-9 px-4 flex items-center gap-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Invite User
                </button>
              </div>
            </div>

            <div className="bg-surface-main border border-border-subtle rounded-lg shadow-sm overflow-hidden flex flex-col animate-fade-up animate-stagger-1">
              <div className="overflow-x-auto relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border-subtle">
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary">
                        Username / ID
                      </th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary">
                        Role
                      </th>
                      {isAdmin ? (
                        <>
                          <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary">
                            Email Address
                          </th>
                          <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary">
                            Status
                          </th>
                          <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary">
                            Created At
                          </th>
                          <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary text-right">
                            Actions
                          </th>
                        </>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="font-table-data text-table-data text-text-primary">
                    {isLoading ? (
                      <tr>
                        <td
                          className="py-6 px-4 text-text-secondary"
                          colSpan={isAdmin ? 6 : 2}
                        >
                          Loading users...
                        </td>
                      </tr>
                    ) : null}
                    {errorMessage ? (
                      <tr>
                        <td
                          className="py-6 px-4 text-status-error"
                          colSpan={isAdmin ? 6 : 2}
                        >
                          {errorMessage}
                        </td>
                      </tr>
                    ) : null}
                    {!isLoading && !errorMessage && displayUsers.length === 0 ? (
                      <tr>
                        <td
                          className="py-6 px-4 text-text-secondary"
                          colSpan={isAdmin ? 6 : 2}
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : null}
                    {!isLoading && !errorMessage
                      ? displayUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-border-subtle hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant font-medium text-xs">
                                  {user.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.username}
                                  </span>
                                  <span className="text-xs text-text-secondary font-mono">
                                    {user.id.slice(0, 8)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-variant text-on-surface-variant border border-border-subtle">
                                {user.role}
                              </span>
                            </td>
                            {isAdmin ? (
                              <>
                                <td className="py-3 px-4 text-text-secondary">
                                  {user.email}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        user.status === "suspended"
                                          ? "bg-text-secondary"
                                          : user.status === "invited"
                                            ? "bg-status-pending"
                                            : "bg-status-active"
                                      }`}
                                    />
                                    <span className="text-sm">
                                      {user.status || "active"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-text-secondary text-sm">
                                  {user.createdAt || "-"}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    className="ml-1 text-sm font-medium text-text-secondary hover:text-primary transition-colors border border-transparent hover:border-border-subtle px-2 py-1 rounded bg-transparent hover:bg-white shadow-sm hover:shadow-none opacity-0 group-hover:opacity-100"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    Edit
                                  </button>
                                </td>
                              </>
                            ) : null}
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-border-subtle p-3 flex items-center justify-between bg-surface-main">
                <span className="font-body-sm text-body-sm text-text-secondary pl-2">
                  Showing {displayUsers.length} result
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 text-text-secondary hover:text-primary disabled:opacity-50 transition-colors rounded"
                    disabled
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      chevron_left
                    </span>
                  </button>
                  <button className="p-1.5 text-text-secondary hover:text-primary transition-colors rounded">
                    <span className="material-symbols-outlined text-[20px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 bg-transparent text-slate-500 text-xs border-t border-border-subtle pt-6 pb-2 flex justify-between items-center w-full max-w-[1200px] mx-auto">
            <div>© 2024 Supabase Prototype. Built for administrative efficiency.</div>
            <div className="flex gap-4">
              <button className="hover:text-slate-900 transition-colors duration-200">
                Documentation
              </button>
              <button className="hover:text-slate-900 transition-colors duration-200">
                Support
              </button>
              <button className="hover:text-slate-900 transition-colors duration-200">
                API Status
              </button>
            </div>
          </footer>
        </main>
      </div>

      {isAdmin && selectedUser ? (
        <div className="fixed inset-0 z-50 flex pointer-events-none">
          <div className="absolute inset-0 bg-black/10" />
          <aside className="pointer-events-auto ml-auto w-[400px] h-full bg-surface-main border-l border-border-subtle shadow-[0_0_40px_rgba(0,0,0,0.12)] flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="h-16 px-6 border-b border-border-subtle flex items-center justify-between bg-surface-main shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant font-medium text-xs">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="font-table-data text-table-data text-text-primary leading-tight">
                    Edit User
                  </h2>
                  <span className="text-xs text-text-secondary font-mono leading-tight">
                    {selectedUser.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <button
                className="p-1.5 text-text-secondary hover:text-primary hover:bg-slate-50 rounded transition-colors"
                onClick={() => setSelectedUser(null)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              <section className="flex flex-col gap-4">
                <h3 className="font-label-caps text-label-caps text-text-secondary border-b border-border-subtle pb-2">
                  Identity &amp; Access
                </h3>
                <div className="flex flex-col gap-1.5">
                  <label className="font-table-data text-[13px] text-text-primary">
                    Email Address
                  </label>
                  <input
                    className="w-full h-9 px-3 bg-surface-main border border-border-subtle rounded text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                    type="email"
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-table-data text-[13px] text-text-primary">
                    Status
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-surface-main border border-border-subtle rounded text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none"
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-table-data text-[13px] text-text-primary">
                    Created At
                  </label>
                  <input
                    className="w-full h-9 px-3 bg-surface-main border border-border-subtle rounded text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                    type="text"
                    value={editCreatedAt}
                    onChange={(event) => setEditCreatedAt(event.target.value)}
                  />
                </div>
              </section>

              {saveError ? (
                <p className="text-sm text-status-error">{saveError}</p>
              ) : null}

              <section className="flex flex-col gap-3 mt-4 bg-surface-alt p-4 rounded-lg border border-border-subtle">
                <h3 className="font-label-caps text-label-caps text-text-secondary mb-1">
                  System Metadata
                </h3>
                <div className="flex justify-between items-center py-1 border-b border-border-subtle/50">
                  <span className="text-[13px] text-text-secondary">User ID</span>
                  <span className="font-mono text-[13px] text-text-primary">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-text-secondary">Role</span>
                  <span className="text-[13px] font-medium text-text-primary flex items-center gap-1">
                    {selectedUser.role}
                  </span>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-border-subtle bg-surface-main shrink-0 sticky bottom-0 z-10 flex gap-3">
              <button
                className="flex-1 h-9 flex items-center justify-center border border-border-subtle rounded text-sm font-medium text-text-primary hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-9 flex items-center justify-center bg-primary text-on-primary rounded text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
