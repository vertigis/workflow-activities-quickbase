export interface ApiService {
  url: string;
  hostName: string;
  access_token: string;
  token_type: "QB-USER-TOKEN" | "QB-TEMP-TOKEN";
}
