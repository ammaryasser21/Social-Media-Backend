
export type GetParams = {
  key: string;
};

export type SetParams = {
  key: string;
  value: unknown;
  ttl?: number;
};

export type DeleteParams = {
  key: string;
};

export type DeleteManyParams = {
  keys: string[];
};

export type ExistsParams = {
  key: string;
};

export type ExpireParams = {
  key: string;
  seconds: number;
};

export type TokenParams = {
  userId: string;
  tokenSigniture: string;
};

export type SetTokenParams = TokenParams & {
  value: unknown;
  ttl?: number;
};

export type KeysParams = {
  prefix: string;
};
