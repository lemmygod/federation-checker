export interface GetFederatedInstancesResponse {
  federated_instances: FederatedInstances;
}

export interface FederatedInstances {
  linked: Instance[];
  allowed: Instance[];
  blocked: Instance[];
}

export interface Instance {
  id: number;
  domain: string;
  published: Date;
  updated: Date;
  software?: Software;
  version?: string;
}

export enum Software {
  Akkoma = "akkoma",
  Ecko = "ecko",
  Fedibird = "fedibird",
  GuppeGroups = "Guppe Groups",
  Hometown = "hometown",
  Lemmy = "lemmy",
  Mastodon = "mastodon",
  Peertube = "peertube",
  Pleroma = "pleroma",
}
