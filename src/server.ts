import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  default: {
    fetch: (request: Request) => Promise<Response> | Response;
  };
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import(
      "@tanstack/react-start/server-entry"
    ) as Promise<ServerEntry>;
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const entry = await getServerEntry();
    const response = await entry.default.fetch(request);
    return response;
  } catch (error) {
    console.error(consumeLastCapturedError() ?? error);
    return brandedErrorResponse();
  }
}