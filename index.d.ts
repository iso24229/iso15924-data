export type Iso15924Name = { en?: string; fr?: string } & Record<string, string | undefined>;

export interface Iso15924Entry {
  code: string;
  number: number | string;
  name: Iso15924Name;
  pva?: string;
  age?: string;
  dateIntroduced?: string;
}

export const codes: Record<string, Iso15924Entry>;

export const manifest: {
  source: string;
  fetchedAt: string;
  codeCount: number;
  codes: string[];
};

export const version: string;
