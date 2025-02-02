import { google } from "googleapis";
import { googleEmailConfig } from "./types";
const OAuth2 = google.auth.OAuth2;
const id = googleEmailConfig.clientId;
const secret = googleEmailConfig.clientSecret;

const myOAuth2Client = new OAuth2(id, secret);
export default myOAuth2Client;
