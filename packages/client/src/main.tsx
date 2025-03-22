import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import MazeMap from "./components/Map.tsx";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

const mappings = [
  { prefix: "/gstatic/{subdomain}", target: "{subdomain}.gstatic.com" },
  { prefix: "/gapis/{subdomain}", target: "{subdomain}.googleapis.com" },
  { prefix: "/mazemap/{subdomain}", target: "{subdomain}.mazemap.com" },
  { prefix: "/mapbox/{subdomain}", target: "{subdomain}.mapbox.com" },
  { prefix: "/mazemap", target: "mazemap.com" },
  { prefix: "/mapbox", target: "mapbox.com" },
];

patchUrlMappings(mappings);

const originalWorker = Worker;
window.Worker = class extends originalWorker {
  constructor(scriptURL: string | URL, options: WorkerOptions | undefined) {
    // Inline script to fetch and modify the worker script
    const patchingScript = `
              const SUBSTITUTION_REGEX = /\\{([a-z]+)\\}/g;
function regexFromTarget(target) {
  const regexString = target.replace(
    SUBSTITUTION_REGEX,
    (match, name) => \`(?<\${name}>[\\w-]+)\`
  );
  return new RegExp(\`\${regexString}(/|$)\`);
}

const PROXY_PREFIX = "/.proxy";

function matchAndRewriteURL({ originalURL, prefix, prefixHost, target }) {
  // coerce url with filler https protocol so we can retrieve host and pathname from target
  const targetURL = new URL(\`https://\${target}\`);
  // Depending on the environment, the URL constructor may turn \`{\` and \`}\` into \`%7B\` and \`%7D\`, respectively
  const targetRegEx = regexFromTarget(
    targetURL.host.replace(/%7B/g, "{").replace(/%7D/g, "}")
  );
  const match = originalURL.toString().match(targetRegEx);
  // Null match indicates that this target is not relevant
  if (match == null) return originalURL;
  const newURL = new URL(originalURL.toString());
  newURL.host = prefixHost;
  newURL.pathname = prefix.replace(SUBSTITUTION_REGEX, (_, matchName) => {
    const replaceValue = match.groups?.[matchName];
    if (replaceValue == null) throw new Error("Misconfigured route.");
    return replaceValue;
  });

  // Append the original path
  newURL.pathname +=
    newURL.pathname === "/"
      ? originalURL.pathname.slice(1)
      : originalURL.pathname;
  // prepend /.proxy/ to path if using discord activities proxy
  if (
    (newURL.hostname.includes("discordsays.com") ||
      newURL.hostname.includes("discordsez.com")) &&
    !newURL.pathname.startsWith(PROXY_PREFIX)
  ) {
    newURL.pathname = PROXY_PREFIX + newURL.pathname;
  }
  // Remove the target's path from the new url path
  newURL.pathname = newURL.pathname.replace(targetURL.pathname, "");
  // Add a trailing slash if original url had it, and if it doesn't already have one or if matches filename regex
  if (originalURL.pathname.endsWith("/") && !newURL.pathname.endsWith("/")) {
    newURL.pathname += "/";
  }
  return newURL;
}

function attemptRemap({ url, mappings }) {
  const newURL = new URL(url.toString());
  if (
    (newURL.hostname.includes("discordsays.com") ||
      newURL.hostname.includes("discordsez.com")) &&
    // Only apply proxy prefix once
    !newURL.pathname.startsWith(PROXY_PREFIX)
  ) {
    newURL.pathname = PROXY_PREFIX + newURL.pathname;
  }
  for (const mapping of mappings) {
    const mapped = matchAndRewriteURL({
      originalURL: newURL,
      prefix: mapping.prefix,
      target: mapping.target,
      prefixHost: "1334400846607155301.discordsays.com",
    });
    if (mapped != null && mapped?.toString() !== url.toString()) {
      return mapped;
    }
  }
  return newURL;
}

function absoluteURL(
  url,
  protocol = "https:",
  host = "1334400846607155301.discordsays.com",
) {
  // If the first arg is a complete url, it will ignore the second arg
  // This call structure lets us set relative urls to have a full url with the proper protocol and host
  return new URL(url, \`\${protocol}//\${host}\`);
}

const fetchImpl = self.fetch;
// fetch is a duplex, but this is consistent
self.fetch = function (
  input,
  init
) {
  // If fetch has Request as input, we need to resolve any stream
  // before we create a new request with the mapped url
  if (input instanceof Request) {
    const newUrl = attemptRemap({ url: absoluteURL(input.url), mappings: ${JSON.stringify(mappings)} });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { url, ...newInit } = (init ?? {});
    Object.keys(Request.prototype).forEach((value) => {
      if (value === "url") return;
      try {
        // @ts-expect-error
        newInit[value] = input[value];
      } catch (ex) {
        console.warn(\`Remapping fetch request key "\${value}" failed\`, ex);
      }
    });

    return new Promise((resolve, reject) => {
      try {
        input.blob().then((blob) => {
          if (
            input.method.toUpperCase() !== "HEAD" &&
            input.method.toUpperCase() !== "GET" &&
            blob.size > 0
          ) {
            newInit.body = blob;
          }

          resolve(fetchImpl(new Request(newUrl, newInit)));
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  // Assuming a generic url or string
  const remapped = attemptRemap({
    url: input instanceof URL ? input : absoluteURL(input),
    mappings,
  });
  return fetchImpl(remapped, init);
};
  
              (async () => {
                  const response = await fetchImpl(${JSON.stringify(
                    scriptURL
                  )});
                  const scriptText = await response.text();
                  eval(scriptText); // Execute the original script
              })();
          `;

    // Create a blob URL from the patched script
    const blob = new Blob([patchingScript], { type: "application/javascript" });
    super(URL.createObjectURL(blob), options);
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="map" element={<MazeMap />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
