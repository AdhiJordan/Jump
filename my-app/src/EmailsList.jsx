import React, { useState, useEffect } from "react";

export default function EmailsList({ token, user, categoryId, categoryName }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Fetch emails from backend API (you can adjust which fetch to use)
  useEffect(() => {
    if (!token || !user) return;

    async function fetchEmailsByCategory() {
      setLoading(true);
      setError(null);
      try {
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
        if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
        const data = await res.json();
        setEmails(data);
        setSelectedEmails([]); // Clear selection on new data load
      } catch (err) {
        setError(err.message || "Error fetching emails");
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) fetchEmailsByCategory();
  }, [categoryId, categoryName, token, user]);

  // Toggle checkbox selection for each email
  const toggleSelectEmail = (emailId) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  // Select or deselect all emails
  const toggleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]); // Deselect all
    } else {
      const allEmailIds = emails.map((email) => email.id);
      setSelectedEmails(allEmailIds); // Select all email IDs
    }
  };

  // Handle unsubscribe button click
  // Handle unsubscribe button click
  async function handleUnsubscribe() {
    if (selectedEmails.length === 0) {
      alert("Select emails first to unsubscribe");
      return;
    }
    try {
      // Map selected emails to an array of their ids only
      const emailIds = selectedEmails.map((email) => email.id);

      const response = await fetch("http://localhost:4000/api/unsubscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailIds }), // Sending only ids
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Unsubscribe successful", data);
        alert("Unsubscribe requests sent");
        // Optionally clear selection or refresh emails list
        setSelectedEmails([]);
      } else {
        console.error("Unsubscribe failed", data.error);
        alert("Unsubscribe failed: " + data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: " + error.message);
    }
  }

  return (
    <div>
      <h3>Your Emails</h3>
      {loading && <p>Loading emails...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && emails.length === 0 && <p>No emails found.</p>}

      {emails.length > 0 && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedEmails.length === emails.length}
              onChange={toggleSelectAll}
            />{" "}
            Select All
          </label>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {emails.map((email) => (
              <li
                key={email.id}
                style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={selectedEmails.some((e) => e.id === email.id)}
                    onChange={() => toggleSelectEmail(email)}
                  />{" "}
                  <strong>{email.snippet || "(No snippet)"}</strong>
                </label>
                <br />
                Email ID: <strong>{email.id || "(No id)"}</strong>
                <br />
                Thread ID: <strong>{email.threadId || "(No threadId)"}</strong>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUnsubscribe}
            disabled={selectedEmails.length === 0}
          >
            Unsubscribe Selected
          </button>
        </div>
      )}
    </div>
  );
}
