# POC for OAuth TMI BFF

This repository contains a POC for the `Token Mediating and session Information Backend For Frontend` draft [https://github.com/b---c/oauth-token-bff](https://github.com/b---c/oauth-token-bff)

- A web app that does OIDC login using `express-openid-connect`
- An API protected with `express-oauth2-bearer`

The Web app also exposes the `/.well-known/bff-*` endpoints that are used by an authenticated frontend to access an API directly.

```shell
$ npm install
$ npm start
App listening on http://localhost:3000
API listening on http://localhost:3001
```
