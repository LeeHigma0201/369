import { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
  { id: "top", label: "Top Stories" },
  { id: "tech", label: "Technology" },
  { id: "ev", label: "EV & Energy" },
  { id: "business", label: "Business" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
  { id: "world", label: "World" },
  { id: "local", label: "Louisville" },
];

const BIAS_INFO = {
  left: { label: "Left", color: "#3a6fa0" },
  "center-left": { label: "C-Left", color: "#6a9bc4" },
  center: { label: "Center", color: "#7a7a7a" },
  "center-right": { label: "C-Right", color: "#c47a3a" },
  right: { label: "Right", color: "#a04a3a" },
};

const ANNO_STYLE = {
  "fact-check": { color: "#2d7d46", icon: "\u2713", label: "Fact Check" },
  opinion: { color: "#b8860b", icon: "\u25b3", label: "Opinion Flag" },
  context: { color: "#5a6e8a", icon: "\u25cf", label: "Context" },
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

async function fetchNews(query, category) {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, category }),
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

function Article({ article, featured, expanded, onToggle }) {
  const bias = BIAS_INFO[article.bias] || BIAS_INFO.center;
  return (
    <div onClick={onToggle} style={{ cursor: "pointer" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#6b6560",
          }}
        >
          {article.source}
        </span>
        <span
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 9,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: 600,
            padding: "2px 8px",
            background: bias.color,
            color: "#fff",
            borderRadius: 1,
          }}
        >
          {bias.label}
        </span>
        {article.isBreaking && (
          <span
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#c0392b",
            }}
          >
            Breaking
          </span>
        )}
        <span
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 12,
            color: "#9b9590",
          }}
        >
          {article.time} &middot; {article.readTime} min
        </span>
      </div>

      <h2
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: featured ? 28 : 20,
          fontWeight: 500,
          lineHeight: 1.25,
          color: "#1a1a1a",
          margin: "0 0 6px",
          letterSpacing: -0.3,
        }}
      >
        {article.title}
      </h2>

      <p
        style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#6b6560",
          fontWeight: 300,
          margin: 0,
        }}
      >
        {article.summary}
      </p>

      {article.annotations?.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {article.annotations.map((a, j) => {
            const s = ANNO_STYLE[a.type] || ANNO_STYLE.context;
            return (
              <span
                key={j}
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  padding: "3px 10px",
                  borderRadius: 1,
                  border: `1px solid ${s.color}33`,
                  background: `${s.color}08`,
                  color: s.color,
                }}
              >
                {s.icon} {a.label}
              </span>
            );
          })}
        </div>
      )}

      <p
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontStyle: "italic",
          fontSize: 13,
          color: "#9b9590",
          marginTop: 8,
        }}
      >
        {expanded ? "Collapse \u2191" : "Read & annotate \u2193"}
      </p>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: "#ffffff",
            border: "1px solid #e8e2dc",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 17,
              lineHeight: 1.8,
              color: "#1a1a1a",
            }}
          >
            {(article.fullText || "").split(/\n\n/).map((p, k) => (
              <p key={k} style={{ marginBottom: 16 }}>
                {p}
              </p>
            ))}
          </div>

          {article.annotations?.length > 0 && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid #e8e2dc",
              }}
            >
              <div
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#9b9590",
                  marginBottom: 12,
                }}
              >
                Editorial Annotations
              </div>
              {article.annotations.map((a, j) => {
                const s = ANNO_STYLE[a.type] || ANNO_STYLE.context;
                return (
                  <div
                    key={j}
                    style={{
                      marginBottom: 10,
                      fontFamily: "'Source Sans 3', sans-serif",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#6b6560",
                    }}
                  >
                    <strong style={{ color: s.color, fontWeight: 600 }}>
                      {s.icon} {s.label} &mdash; {a.label}:
                    </strong>{" "}
                    {a.detail}
                  </div>
                );
              })}
            </div>
          )}

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-block",
                marginTop: 16,
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 13,
                color: "#c4642a",
                textDecoration: "none",
                borderBottom: "1px solid #c4642a",
                paddingBottom: 1,
              }}
            >
              Read at {article.source} &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function WallsNewsPlus() {
  const [category, setCategory] = useState("top");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(-1);
  const [error, setError] = useState(false);

  const load = useCallback(async (query, cat) => {
    setLoading(true);
    setError(false);
    setExpandedIdx(-1);
    try {
      const result = await fetchNews(query, cat);
      setArticles(result || []);
    } catch (e) {
      console.error(e);
      setError(true);
      setArticles([]);
    }
    setLoading(false);
  }, []);

  const loadCategory = useCallback(
    (id) => {
      setCategory(id);
      setSearchMode(false);
      const label = CATEGORIES.find((c) => c.id === id)?.label || id;
      load(null, label);
    },
    [load]
  );

  const doSearch = useCallback(() => {
    if (!searchInput.trim()) return;
    setSearchMode(true);
    setSearchQuery(searchInput.trim());
    load(searchInput.trim(), null);
  }, [searchInput, load]);

  const clearSearch = useCallback(() => {
    setSearchMode(false);
    setSearchInput("");
    loadCategory("top");
  }, [loadCategory]);

  useEffect(() => {
    loadCategory("top");
  }, []);

  const ss = {
    sans: "'Source Sans 3', 'Helvetica Neue', sans-serif",
    serif: "'Newsreader', Georgia, serif",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0EB",
        color: "#1a1a1a",
        fontFamily: ss.sans,
      }}
    >
      <style>{`
        @keyframes slide { 0%{left:-40%} 100%{left:100%} }
        input:focus { border-color: #c4642a !important; }
        nav::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Masthead */}
      <header
        style={{
          textAlign: "center",
          padding: "32px 24px 0",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: ss.sans,
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#9b9590",
            fontWeight: 500,
          }}
        >
          {today}
        </div>
        <h1
          style={{
            fontFamily: ss.serif,
            fontSize: 42,
            fontWeight: 600,
            letterSpacing: -0.5,
            color: "#1a1a1a",
            margin: "8px 0 4px",
            lineHeight: 1.1,
          }}
        >
          Walls News+
        </h1>
        <p
          style={{
            fontFamily: ss.serif,
            fontStyle: "italic",
            fontSize: 15,
            color: "#6b6560",
            fontWeight: 300,
          }}
        >
          Annotated. Transparent. Free.
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: 12,
            fontFamily: ss.sans,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "#2d7d46",
            fontWeight: 600,
            padding: "4px 16px",
            border: "1px solid #2d7d4633",
            borderRadius: 2,
          }}
        >
          Saving $12.99 / month
        </span>
      </header>

      <hr
        style={{
          border: "none",
          borderTop: "3px double #d4cec8",
          margin: "24px auto",
          maxWidth: 680,
        }}
      />

      {/* Search */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto 20px",
          padding: "0 24px",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search any topic\u2026"
            style={{
              width: "100%",
              padding: "14px 48px 14px 20px",
              border: "1px solid #d4cec8",
              borderRadius: 2,
              background: "#ffffff",
              fontFamily: ss.serif,
              fontSize: 16,
              fontStyle: "italic",
              color: "#1a1a1a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={doSearch}
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              fontSize: 20,
              color: "#c4642a",
              cursor: "pointer",
              padding: "8px 12px",
              fontFamily: ss.serif,
            }}
          >
            &crarr;
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav
        style={{
          maxWidth: 680,
          margin: "0 auto 24px",
          padding: "0 24px",
          display: "flex",
          overflowX: "auto",
          borderBottom: "1px solid #d4cec8",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => loadCategory(c.id)}
            style={{
              fontFamily: ss.sans,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: !searchMode && category === c.id ? 600 : 500,
              color: !searchMode && category === c.id ? "#c4642a" : "#9b9590",
              background: "none",
              border: "none",
              borderBottom:
                !searchMode && category === c.id
                  ? "2px solid #c4642a"
                  : "2px solid transparent",
              padding: "10px 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              position: "relative",
              bottom: -1,
            }}
          >
            {c.label}
          </button>
        ))}
      </nav>

      {/* Search results bar */}
      {searchMode && (
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto 20px",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: ss.serif,
              fontStyle: "italic",
              fontSize: 15,
              color: "#6b6560",
            }}
          >
            Showing results for{" "}
            <strong style={{ color: "#c4642a", fontStyle: "normal" }}>
              {searchQuery}
            </strong>
          </span>
          <button
            onClick={clearSearch}
            style={{
              fontFamily: ss.sans,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#9b9590",
              background: "none",
              border: "1px solid #d4cec8",
              padding: "5px 12px",
              cursor: "pointer",
              borderRadius: 2,
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Bias legend */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto 24px",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: ss.sans,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#9b9590",
            fontWeight: 600,
          }}
        >
          Bias
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {Object.entries(BIAS_INFO).map(([key, { label, color }]) => (
            <span
              key={key}
              style={{
                fontFamily: ss.sans,
                fontSize: 9,
                letterSpacing: 0.5,
                fontWeight: 500,
                padding: "2px 8px",
                background: `${color}15`,
                color,
                borderRadius: 1,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 120,
                height: 2,
                background: "#e8e2dc",
                margin: "0 auto",
                borderRadius: 1,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "40%",
                  height: "100%",
                  background: "#c4642a",
                  animation: "slide 1.2s ease-in-out infinite",
                }}
              />
            </div>
            <p
              style={{
                fontFamily: ss.serif,
                fontStyle: "italic",
                fontSize: 16,
                color: "#9b9590",
                marginTop: 16,
              }}
            >
              {searchMode
                ? `Searching "${searchQuery}"\u2026`
                : "Reading the wires\u2026"}
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p
              style={{
                fontFamily: ss.serif,
                fontStyle: "italic",
                color: "#9b9590",
                fontSize: 15,
              }}
            >
              Something went wrong. Try again.
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p
              style={{
                fontFamily: ss.serif,
                fontStyle: "italic",
                color: "#9b9590",
                fontSize: 15,
              }}
            >
              No stories found. Try a different search.
            </p>
          </div>
        ) : (
          articles.map((a, i) => (
            <div key={i}>
              <Article
                article={a}
                featured={i === 0}
                expanded={expandedIdx === i}
                onToggle={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
              />
              {i < articles.length - 1 && (
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #e8e2dc",
                    margin: "20px 0",
                  }}
                />
              )}
            </div>
          ))
        )}
      </main>

      {/* Colophon */}
      <footer
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "32px 24px",
          textAlign: "center",
          borderTop: "3px double #d4cec8",
        }}
      >
        <p
          style={{
            fontFamily: ss.serif,
            fontStyle: "italic",
            fontSize: 13,
            color: "#9b9590",
            lineHeight: 1.7,
          }}
        >
          AI-curated news with bias annotations and fact-checking.
          <br />
          Built for reading, not scrolling.
          <br />
          <span style={{ color: "#c4642a", fontStyle: "normal" }}>
            &diams;
          </span>{" "}
          The Walls Family
        </p>
      </footer>
    </div>
  );
}
