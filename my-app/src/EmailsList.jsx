import React, { useState, useEffect } from "react";

export default function EmailsList({ token, user, categoryId, categoryName }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("categoryName", categoryName);

  // Fetch emails from backend API when token/user changes
  useEffect(() => {
    if (!token || !user) return;

    async function fetchEmails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:4000/api/emails", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching emails: ${response.statusText}`);
        }
        const data = await response.json();
        setEmails(data);
      } catch (err) {
        setError(err.message || "Error fetching emails");
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();
  }, [token, user]);

  // EmailsList.jsx
  useEffect(() => {
    async function fetchEmailsByCategory() {
      const res = await fetch(
        `http://localhost:4000/api/categories/${categoryId}/emails/${categoryName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setEmails(data);
    }
    if (categoryId) fetchEmailsByCategory();
  }, [categoryId, token]);

  return (
    <div>
      <h3>Your Emails</h3>
      {loading && <p>Loading emails...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && emails.length === 0 && <p>No emails found.</p>}

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {emails.map((email) => (
          <li
            key={email.id}
            style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}
          >
            <strong>{email.snippet}</strong>
            <br />
            Email ID : <strong>{email.id || "(No id)"}</strong>
            <br />
            Thread ID: <strong>{email.threadId || "(No threadId)"}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
