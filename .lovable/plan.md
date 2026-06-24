# Errika Wedding Planner — Architecture Blueprint (Revision v2)

Applies REV 1–7 to the approved blueprint. Sections below replace the corresponding parts of v1; everything else stands.

---

## 1. Updated ERD

```text
auth.users
  └── profiles ── user_roles ── app_role

package_categories ───< packages >─── package_tag_mappings >─── package_tags
                          │
                          ├── package_media
                          ├── package_videos
                          ├── package_benefits
                          ├── package_faqs
                          └── package_rules         (recommendation engine)

portfolio_categories ───< portfolio_category_mappings >─── portfolios
                                                              ├── portfolio_media
                                                              ├── portfolio_videos
                                                              └── portfolio_story

testimonials        (video_url replaces youtube_id)
blog_categories ──< blog_posts >── blog_post_tags ── tags
leads ── lead_activities          (+ utm_source/medium/campaign/content/term)
media_assets
site_settings       (expanded keys: branding, social, analytics, seo defaults)
audit_logs
```

## 2. Updated Database Tables

New / changed tables only. All new tables ship with `GRANT` + `ENABLE RLS` + policies in the same migration. Public-facing tables get narrow `anon SELECT` policies; admin writes gated by `has_role()`.

### REV 1 — Package Categories (new)
- **package_categories** `(id uuid pk, slug text unique, name text, description text null, sort_order int, is_active bool default true, created_by, updated_by, timestamps)`
- **packages**: add `category_id uuid not null references package_categories(id) on delete restrict`. Drop any hardcoded category enum.
- Seed: Wedding Minang, Wedding Gedung, Wedding Aula & Rumah, Paket Lainnya.

### REV 2 — Package Tags (new)
- **package_tags** `(id uuid pk, slug unique, name text, color text null, sort_order int, is_active bool)`
- **package_tag_mappings** `(package_id fk, tag_id fk, PRIMARY KEY(package_id, tag_id))`
- Seed: Best Seller, Promo, Premium, Favorit.
- Indexes: `(tag_id)`, `(package_id)` for fast filtering.

### REV 3 — Portfolio Multi-Category (changed)
- Remove `portfolios.category_id`.
- **portfolio_category_mappings** `(portfolio_id fk, category_id fk references portfolio_categories(id), PRIMARY KEY(portfolio_id, category_id))`.
- Add view `v_portfolios_public` exposing aggregated `categories[]` for list rendering.

### REV 4 — Testimonial Video URL (changed)
- **testimonials**: drop `youtube_id`, add `video_url text null`.
- Validation (zod + DB check): URL must match YouTube watch / youtu.be / YouTube Shorts patterns. Client embed component parses URL → renders correct embed (standard or Shorts).
- Future video providers require no schema change.

### REV 5 — Lead UTM Attribution (changed)
- **leads**: add `utm_source text`, `utm_medium text`, `utm_campaign text`, `utm_content text`, `utm_term text` (all nullable, indexed individually plus composite `(utm_source, utm_campaign)`).
- Intake endpoint `/api/public/leads` accepts UTMs from query params, cookies (`_utm` first-touch + last-touch), or hidden form fields.
- Add view `v_lead_attribution` aggregating leads × UTM × status for CRM analytics.

### REV 6 — Package Recommendation Rules (new)
- **package_rules** `(id uuid pk, package_id fk references packages(id) on delete cascade, min_guests int null, max_guests int null, venue_type text null, wedding_type text null, budget_min_idr bigint null, budget_max_idr bigint null, priority int default 100, is_active bool default true, notes text, timestamps)`
- A package can have multiple rule rows (different venue/budget combos).
- Lookup enums (small reference tables, CMS-editable):
  - **venue_types** `(id, slug, name)` — e.g. gedung, aula, rumah, outdoor.
  - **wedding_types** `(id, slug, name)` — e.g. minang, nasional, intimate.
- `package_rules.venue_type` / `wedding_type` store slugs (text) to keep matching flexible; reference tables drive CMS dropdowns.

### REV 7 — Site Settings (expanded)
Keep `site_settings (key pk, value jsonb, updated_by, updated_at)`. Document required keys (each a single row, `value` is jsonb):

| key                  | value shape                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `branding`           | `{ website_name, logo_url, favicon_url, tagline }`                    |
| `contact`            | `{ whatsapp_number, whatsapp_default_message, email, address }`       |
| `social`             | `{ instagram_url, facebook_url, tiktok_url, youtube_url }`            |
| `location`           | `{ google_maps_url, lat, lng }`                                       |
| `analytics`          | `{ ga4_id, gtm_id, meta_pixel_id, meta_capi_token (secret ref) }`     |
| `seo_defaults`       | `{ title, description, og_image_url, twitter_handle, keywords[] }`    |
| `feature_flags`      | `{ show_promo_banner, enable_budget_calculator, ... }`                |

- Public-safe keys readable by `anon` (branding, social, location, seo_defaults, analytics IDs). Secrets (CAPI token) stored in Supabase secrets, never in `site_settings`.
- Server-side helper `getSiteSetting(key)` cached at the edge; invalidated on CMS write.

## 3. Updated Relationship Diagram

```text
package_categories 1──N packages N──M package_tags          (via package_tag_mappings)
                              │
                              ├── 1──N package_media
                              ├── 1──N package_videos
                              ├── 1──N package_benefits
                              ├── 1──N package_faqs
                              └── 1──N package_rules         ── venue_types / wedding_types (slug lookup)

portfolio_categories N──M portfolios                         (via portfolio_category_mappings)
                              ├── 1──N portfolio_media
                              ├── 1──N portfolio_videos
                              └── 1──1 portfolio_story

testimonials (video_url)         blog_categories 1──N blog_posts N──M tags

leads (+ utm_*)  1──N lead_activities
                  └── N──1 packages (package_interest_id, optional)

site_settings (jsonb key/value)    audit_logs    media_assets
```

## 4. Updated CMS Architecture Impact

New / changed CMS surfaces (admin-side only; no UI built in this phase):

- **Package Categories module** (`/admin/packages/categories`): list, create, edit, archive, sort. Delete blocked when referenced packages exist (FK `on delete restrict`); CMS surfaces a "reassign packages first" guard.
- **Package Tags module** (`/admin/packages/tags`): CRUD + color + sort. Tag picker (multi-select) integrated into Package editor; writes to `package_tag_mappings`.
- **Package editor** gains: Category single-select, Tags multi-select, Rules tab (REV 6) with repeatable rule rows (guests range, venue type, wedding type, budget range, priority).
- **Portfolio editor**: Category field changes from single-select to **multi-select**; writes to `portfolio_category_mappings`. List view filters become OR-match across selected categories.
- **Testimonial editor**: `youtube_id` field replaced by `video_url` with live preview (auto-detects YouTube standard vs Shorts).
- **Leads / CRM**: lead detail shows full UTM block; CRM list adds filters by `utm_source`, `utm_campaign`; new "Attribution" report tab driven by `v_lead_attribution`.
- **Settings module** (`/admin/settings`) expands into tabbed editor:
  - Branding · Contact · Social · Location · Analytics · SEO Defaults · Feature Flags
  - Each tab is a typed form (zod) writing one `site_settings` row. Logo/favicon use MediaPicker. Phone number normalized to E.164 for WhatsApp deep link.
- **Role matrix update**:
  - `super_admin`: full CRUD on categories, tags, rules, settings.
  - `content_admin`: CRUD on categories, tags, rules, packages, portfolio, testimonials, blog; read-only on Settings → Analytics & SEO Defaults (write on Branding/Social/Contact requires super_admin).
  - `sales_admin`: read-only on content; CRUD on leads incl. UTM filters.
  - `wedding_planner`: unchanged.
- **Audit logs** extended to cover writes on the new tables (`package_categories`, `package_tags`, `package_tag_mappings`, `portfolio_category_mappings`, `package_rules`, `site_settings`).
- **Caching**: site_settings reads cached (60s edge cache + on-write invalidation); category/tag lists cached per request via TanStack Query.

## 5. Updated Budget Calculator Architecture

Database-driven; no hardcoded recommendations.

**Inputs collected from user:**
- `guest_count` (int)
- `venue_type` (slug from `venue_types`)
- `wedding_type` (slug from `wedding_types`)
- `budget_idr` (single number) OR `budget_min_idr` + `budget_max_idr`
- Optional: `wedding_date`, `contact` (phone) for lead capture

**Server function**: `recommendPackages(input)` (`createServerFn`, public — no auth).

**Matching algorithm (SQL, executed in Postgres):**
```text
SELECT p.*, pr.priority,
       /* score: higher = better match */
       (
         CASE WHEN pr.min_guests IS NULL OR input.guest_count >= pr.min_guests THEN 1 ELSE 0 END +
         CASE WHEN pr.max_guests IS NULL OR input.guest_count <= pr.max_guests THEN 1 ELSE 0 END +
         CASE WHEN pr.venue_type   IS NULL OR pr.venue_type   = input.venue_type   THEN 2 ELSE 0 END +
         CASE WHEN pr.wedding_type IS NULL OR pr.wedding_type = input.wedding_type THEN 2 ELSE 0 END +
         CASE WHEN pr.budget_min_idr IS NULL OR input.budget_idr >= pr.budget_min_idr THEN 1 ELSE 0 END +
         CASE WHEN pr.budget_max_idr IS NULL OR input.budget_idr <= pr.budget_max_idr THEN 1 ELSE 0 END
       ) AS match_score
FROM package_rules pr
JOIN packages p ON p.id = pr.package_id
WHERE p.status = 'published'
  AND pr.is_active = true
  /* hard filters: budget never exceeded if rule defines a max */
  AND (pr.budget_max_idr IS NULL OR input.budget_idr <= pr.budget_max_idr * 1.15)
ORDER BY match_score DESC, pr.priority ASC, p.sort_order ASC
LIMIT 5;
```

- Implemented as SQL function `fn_recommend_packages(jsonb input)` returning ranked package rows, callable by `anon`.
- Returns 3–5 packages with `match_score` + matched rule snippet for "why recommended" UI badges.
- **Fallback**: if zero matches, return top 3 published packages by `sort_order` flagged `is_fallback = true`.
- **Lead capture**: result page form posts to `/api/public/leads` with `source='calculator'`, `package_interest_id`, computed `budget_min/max`, UTMs from cookies (REV 5), then redirects to WhatsApp deep link prefilled with recommended package name (number from `site_settings.contact.whatsapp_number`).
- **Analytics**: GTM events `calculator_started`, `calculator_completed`, `recommendation_clicked`, `whatsapp_clicked` — also written as `lead_activities` rows.
- **Admin tooling**: Rules tab on package editor enables non-technical editing; "Test calculator" tool in CMS lets admins simulate inputs and preview ranked results before publishing.

---

Revision v2 ready. Implementation work and migration ordering remain on the existing sprint plan; new tables land in Sprint 1, CMS surfaces in Sprint 2, Budget Calculator engine in Sprint 4.
