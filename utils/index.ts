import cheerio from "cheerio";

import { GetFederatedInstancesResponse } from "../types";

export async function fetchRyonaBlockedList(domain: string) {
  const response = await fetch(`https://fba.ryona.agency/?domain=${domain}`);

  const html = await response.text();
  return html;
}

export function isValidUrl(url: string) {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(url);
}

export function isValidNoHttpUrl(url: string) {
  const httpUrl = "https://" + url;
  return isValidUrl(httpUrl);
}

export async function fetchLemmyBlockedInstances(domain: string) {
  const apiUrl = `https://${domain}/api/v3/federated_instances`;
  const rawResponse = await fetch(apiUrl).catch((err) => console.error(err));
  if (!rawResponse) return {} as GetFederatedInstancesResponse;
  try {
    const jsonResponse: GetFederatedInstancesResponse =
      await rawResponse.json();
    return jsonResponse;
  } catch (err) {
    console.error(err);
    return {} as GetFederatedInstancesResponse;
  }
}

export function extractHrefFromTable(html: string) {
  const $ = cheerio.load(html);
  const hrefs = [] as string[];

  $("table tr td:first-child b a").each((_, link) => {
    const href = $(link).attr("href");
    href && hrefs.push(new URL(href).hostname);
  });

  return hrefs;
}

export function validateUrl(url: string) {
  if (!isValidUrl(url)) {
    if (!isValidNoHttpUrl(url)) {
      return null;
    }
    return "https://" + url;
  } else {
    return url;
  }
}

export async function fetchInstances(hostname: string) {
  // get ryona blocks
  const ryonaHtml = await fetchRyonaBlockedList(hostname);
  const blockedByInstances = extractHrefFromTable(ryonaHtml);
  // get lemmy blocks
  const lemmyJson = await fetchLemmyBlockedInstances(hostname);
  // check if it even exists, it could very well not even be a lemmy instance and instead an empty object
  if (!lemmyJson?.federated_instances)
    return { blockedByInstances, blocksInstances: [] };
  const blocksInstances = lemmyJson?.federated_instances?.blocked
    ? lemmyJson.federated_instances.blocked.map((instance) => instance.domain)
    : [];
  return { blockedByInstances, blocksInstances };
}
