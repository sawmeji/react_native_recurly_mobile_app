<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly Expo app. The following changes were made:

- **Environment variables**: Created `.env` with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST`. Added `.env` to `.gitignore` coverage.
- **`app.config.js`**: Converted `app.json` to `app.config.js` to support dynamic environment variables. Added `extra.posthogProjectToken` and `extra.posthogHost` fields sourced from `.env`.
- **`app/_layout.tsx`**: Added manual screen tracking using `usePathname` and `useGlobalSearchParams` from Expo Router. Screen changes are captured via `posthog.screen()`. Configured `PostHogProvider` with `autocapture` options (touch capture enabled, manual screen tracking).
- **`app/(tabs)/index.tsx`**: Added `subscription_expanded` and `subscription_collapsed` event tracking when users tap subscription cards, with properties for `subscription_id`, `subscription_name`, `category`, and `billing`.
- **`app/(tabs)/subscriptions/[id].tsx`**: Added `subscription_details_viewed` event on mount with the `subscription_id` property.

Auth events (`user_signed_in`, `user_sign_in_failed`, `user_signed_up`, `user_sign_up_failed`, `user_signed_out`) and user identification were already in place in `sign-in.tsx`, `sign-up.tsx`, and `settings.tsx`.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in with email and password | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | User sign-in attempt failed with an error | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completes email verification and account creation | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | User sign-up attempt failed with an error | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User expands a subscription card to view details | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User collapses an expanded subscription card | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User opens the subscription detail screen | `app/(tabs)/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/405615/dashboard/1533298)
- **Auth conversion funnel (Sign-up → Sign-in)**: [pogzgEyt](https://us.posthog.com/project/405615/insights/pogzgEyt)
- **Subscription engagement over time**: [jXv1cNvh](https://us.posthog.com/project/405615/insights/jXv1cNvh)
- **Sign-in failures over time**: [qqpaJP3Z](https://us.posthog.com/project/405615/insights/qqpaJP3Z)
- **Daily active users (sign-ins)**: [WKQkZT87](https://us.posthog.com/project/405615/insights/WKQkZT87)
- **Sign-out rate (churn signal)**: [vrKPFQEX](https://us.posthog.com/project/405615/insights/vrKPFQEX)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
