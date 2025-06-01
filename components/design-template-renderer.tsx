import React from "react"

export default function DesignTemplateRenderer({ template }: { template: any }) {
  if (!template || typeof template !== "object") return null;

  // Helper to render sections
  const renderSection = (title: string, content: any) => (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontWeight: "bold", fontSize: 20 }}>{title}</h2>
      {typeof content === "string" ? (
        <p>{content}</p>
      ) : Array.isArray(content) ? (
        <ul>{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
      ) : typeof content === "object" ? (
        <pre style={{ background: "#f5f5f5", padding: 8 }}>{JSON.stringify(content, null, 2)}</pre>
      ) : null}
    </section>
  );

  return (
    <div>
      {template.metadata && renderSection("Metadata", template.metadata)}
      {template.executive_summary && renderSection("Executive Summary", template.executive_summary)}
      {template.goals && renderSection("Goals", template.goals.goals_list)}
      {template.proposed_architecture && renderSection("Proposed Architecture", template.proposed_architecture)}
      {template.detailed_design && renderSection("Detailed Design", template.detailed_design)}
      {template.api_contracts && renderSection("API Contracts", template.api_contracts)}
      {template.security_considerations && renderSection("Security Considerations", template.security_considerations)}
      {/* Add more sections as needed */}
    </div>
  );
}
