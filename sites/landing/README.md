# GlotMate site

The public pages the app links to: Privacy Policy (`/privacy`), Terms (`/terms`) and account deletion
(`/delete-account`), plus a small home page. Built from the GlotCast landing skeleton (same brand tokens).

Standalone on purpose: it is NOT an npm workspace of the monorepo (own `yarn.lock`, own `Dockerfile`, port 5070).

    yarn install && yarn dev

`NEXT_PUBLIC_SITE_URL` sets the public address (default https://glotmate.com). The mobile app points at these
pages with `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_URL`.
