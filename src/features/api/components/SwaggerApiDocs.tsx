"use client";

import { useEffect, useId } from "react";

export interface SwaggerApiDocsProps {
  readonly specUrl: string;
}

declare global {
  interface Window {
    SwaggerUIBundle?: (config: Record<string, unknown>) => void;
  }
}

const SWAGGER_UI_VERSION = "5.21.0";

export function SwaggerApiDocs({ specUrl }: SwaggerApiDocsProps): React.JSX.Element {
  const containerId = useId().replace(/:/g, "");

  useEffect(() => {
    const stylesheetId = "swagger-ui-stylesheet";
    const scriptId = "swagger-ui-script";

    if (!document.getElementById(stylesheetId)) {
      const link = document.createElement("link");
      link.id = stylesheetId;
      link.rel = "stylesheet";
      link.href = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`;
      document.head.appendChild(link);
    }

    const mountSwagger = (): void => {
      const container = document.getElementById(containerId);

      if (!container || !window.SwaggerUIBundle) {
        return;
      }

      window.SwaggerUIBundle({
        dom_id: `#${containerId}`,
        url: specUrl,
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true,
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
      });
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      mountSwagger();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`;
    script.async = true;
    script.onload = mountSwagger;
    document.body.appendChild(script);
  }, [containerId, specUrl]);

  return (
    <div
      id={containerId}
      className="min-h-[70vh] overflow-hidden rounded-lg border bg-background [&_.swagger-ui]:bg-background"
    />
  );
}
