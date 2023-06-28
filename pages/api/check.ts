// pages/api/check.js
import {
  isValidUrl,
  isValidNoHttpUrl,
  fetchRyonaBlockedList,
  extractHrefFromTable,
  fetchLemmyBlockedInstances,
} from "../../utils";

import { NextApiRequest, NextApiResponse } from "next";

export default async function Check(req: NextApiRequest, res: NextApiResponse) {
  try {
    const hostname = req.query.hostname as string;

    const validatedUrl = isValidUrl(hostname)
      ? hostname
      : isValidNoHttpUrl(hostname)
      ? "https://" + hostname
      : null;
    if (!validatedUrl) {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }
    const ryonaHtml = await fetchRyonaBlockedList(hostname);
    const blockedByInstances = extractHrefFromTable(ryonaHtml);

    const lemmyJson = await fetchLemmyBlockedInstances(hostname);

    if (!lemmyJson?.federated_instances) {
      res.status(200).json({ error: "Not a Lemmy instance" });
      return;
    }

    const blocksInstances = lemmyJson?.federated_instances?.blocked
      ? lemmyJson.federated_instances.blocked.map((instance) => instance.domain)
      : [];

    res.status(200).json({ blockedByInstances, blocksInstances });
  } catch (err) {
    console.error(err);
    res.status(200).json({ error: "Internal Server Error", err });
  }
}
