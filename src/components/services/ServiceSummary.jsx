export default function ServiceSummary({ title, description, className = "" }) {
  return (
    <article className={`rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5 ${className}`}>
      <h1 className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">
        {title || "Service title"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description || "No description available."}
      </p>
    </article>
  );
}
