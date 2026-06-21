export interface PublicStructuredDataProps {
  readonly documents: readonly Record<string, unknown>[];
}

export function PublicStructuredData({
  documents,
}: PublicStructuredDataProps): React.JSX.Element | null {
  if (documents.length === 0) {
    return null;
  }

  return (
    <>
      {documents.map((document, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(document) }}
          key={`json-ld-${index}`}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
