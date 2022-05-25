import { expressjwt as jwt, GetVerificationKey } from "express-jwt";
import jwks from "jwks-rsa";

export const authenticated = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://bartender.us.auth0.com/.well-known/jwks.json",
  }) as GetVerificationKey,
  audience: "https://api.bartender.dev.vitormariano.com",
  issuer: "https://bartender.us.auth0.com/",
  algorithms: ["RS256"],
});
