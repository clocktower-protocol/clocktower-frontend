import { Address } from 'viem';

export interface AccountDetails {
  provider: Address | undefined,
  timestamp: number,
  description: string,
  company: string,
  url: string,
  domain: string,
  email: string,
  misc: string
}

export interface Events {

}
