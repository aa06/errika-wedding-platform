
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','content_admin','sales_admin','wedding_planner');
CREATE TYPE public.publish_status AS ENUM ('draft','published','archived');
CREATE TYPE public.testimonial_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.testimonial_type AS ENUM ('video','photo','text');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','booked','lost');
CREATE TYPE public.lead_source AS ENUM ('whatsapp','form','calculator','portfolio','package','other');
CREATE TYPE public.lead_activity_type AS ENUM ('note','call','whatsapp','status_change','assignment');

-- ============ UTILS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES + has_role ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','content_admin','sales_admin','wedding_planner')
  );
$$;

-- profiles policies (needs has_role)
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- user_roles policies
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "user_roles_super_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- auto-create profile + (no role) on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ MEDIA ASSETS ============
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime TEXT,
  width INT, height INT, size_bytes BIGINT,
  alt TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_assets_public_read" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "media_assets_admin_write" ON public.media_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  row_id TEXT,
  action TEXT NOT NULL, -- INSERT|UPDATE|DELETE
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_super_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

-- generic audit trigger (foundation; attach later per table)
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN _row_id := COALESCE(OLD.id::text, NULL);
  ELSE _row_id := COALESCE(NEW.id::text, NULL); END IF;
  INSERT INTO public.audit_logs (actor_id, table_name, row_id, action, diff)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    _row_id,
    TG_OP,
    CASE TG_OP
      WHEN 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
      WHEN 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      WHEN 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
    END
  );
  RETURN COALESCE(NEW, OLD);
END; $$;

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_super_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LOOKUP: venue_types, wedding_types ============
CREATE TABLE public.venue_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.venue_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venue_types TO authenticated;
GRANT ALL ON public.venue_types TO service_role;
ALTER TABLE public.venue_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_types_public_read" ON public.venue_types FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "venue_types_admin_write" ON public.venue_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.wedding_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wedding_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_types TO authenticated;
GRANT ALL ON public.wedding_types TO service_role;
ALTER TABLE public.wedding_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wedding_types_public_read" ON public.wedding_types FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "wedding_types_admin_write" ON public.wedding_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

-- ============ PACKAGE CATEGORIES ============
CREATE TABLE public.package_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_categories TO authenticated;
GRANT ALL ON public.package_categories TO service_role;
ALTER TABLE public.package_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_cat_public_read" ON public.package_categories FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "pkg_cat_admin_write" ON public.package_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_pkg_cat_updated BEFORE UPDATE ON public.package_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PACKAGES ============
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.package_categories(id) ON DELETE RESTRICT,
  normal_price_idr BIGINT NOT NULL CHECK (normal_price_idr >= 0),
  promo_price_idr BIGINT CHECK (promo_price_idr IS NULL OR promo_price_idr >= 0),
  promo_label TEXT,
  promo_starts_at TIMESTAMPTZ,
  promo_ends_at TIMESTAMPTZ,
  thumbnail_url TEXT,
  status public.publish_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_packages_status ON public.packages(status);
CREATE INDEX idx_packages_category ON public.packages(category_id);
CREATE INDEX idx_packages_sort ON public.packages(sort_order);
GRANT SELECT ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read" ON public.packages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "packages_admin_read" ON public.packages FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));
CREATE POLICY "packages_content_write" ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PACKAGE TAGS ============
CREATE TABLE public.package_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_tags TO authenticated;
GRANT ALL ON public.package_tags TO service_role;
ALTER TABLE public.package_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_tags_public_read" ON public.package_tags FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "pkg_tags_admin_write" ON public.package_tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.package_tag_mappings (
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.package_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, tag_id)
);
CREATE INDEX idx_pkg_tag_map_tag ON public.package_tag_mappings(tag_id);
GRANT SELECT ON public.package_tag_mappings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_tag_mappings TO authenticated;
GRANT ALL ON public.package_tag_mappings TO service_role;
ALTER TABLE public.package_tag_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_tag_map_public_read" ON public.package_tag_mappings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pkg_tag_map_admin_write" ON public.package_tag_mappings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

-- ============ PACKAGE CHILDREN ============
CREATE TABLE public.package_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pkg_media_pkg ON public.package_media(package_id);
GRANT SELECT ON public.package_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_media TO authenticated;
GRANT ALL ON public.package_media TO service_role;
ALTER TABLE public.package_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_media_public_read" ON public.package_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pkg_media_admin_write" ON public.package_media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.package_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pkg_videos_pkg ON public.package_videos(package_id);
GRANT SELECT ON public.package_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_videos TO authenticated;
GRANT ALL ON public.package_videos TO service_role;
ALTER TABLE public.package_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_videos_public_read" ON public.package_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pkg_videos_admin_write" ON public.package_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.package_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_pkg_benefits_pkg ON public.package_benefits(package_id);
GRANT SELECT ON public.package_benefits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_benefits TO authenticated;
GRANT ALL ON public.package_benefits TO service_role;
ALTER TABLE public.package_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_benefits_public_read" ON public.package_benefits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pkg_benefits_admin_write" ON public.package_benefits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.package_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_pkg_faqs_pkg ON public.package_faqs(package_id);
GRANT SELECT ON public.package_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_faqs TO authenticated;
GRANT ALL ON public.package_faqs TO service_role;
ALTER TABLE public.package_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_faqs_public_read" ON public.package_faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pkg_faqs_admin_write" ON public.package_faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

-- ============ PACKAGE RULES (recommendation engine) ============
CREATE TABLE public.package_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  min_guests INT,
  max_guests INT,
  venue_type TEXT,
  wedding_type TEXT,
  budget_min_idr BIGINT,
  budget_max_idr BIGINT,
  priority INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pkg_rules_pkg ON public.package_rules(package_id);
CREATE INDEX idx_pkg_rules_active ON public.package_rules(is_active);
GRANT SELECT ON public.package_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_rules TO authenticated;
GRANT ALL ON public.package_rules TO service_role;
ALTER TABLE public.package_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pkg_rules_public_read" ON public.package_rules FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "pkg_rules_admin_write" ON public.package_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_pkg_rules_updated BEFORE UPDATE ON public.package_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PORTFOLIO CATEGORIES + PORTFOLIOS ============
CREATE TABLE public.portfolio_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_categories TO authenticated;
GRANT ALL ON public.portfolio_categories TO service_role;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_cat_public_read" ON public.portfolio_categories FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "pf_cat_admin_write" ON public.portfolio_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  cover_url TEXT,
  status public.publish_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_portfolios_status ON public.portfolios(status);
GRANT SELECT ON public.portfolios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT ALL ON public.portfolios TO service_role;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolios_public_read" ON public.portfolios FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "portfolios_admin_read" ON public.portfolios FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
CREATE POLICY "portfolios_content_write" ON public.portfolios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_portfolios_updated BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.portfolio_category_mappings (
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.portfolio_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (portfolio_id, category_id)
);
CREATE INDEX idx_pf_cat_map_cat ON public.portfolio_category_mappings(category_id);
GRANT SELECT ON public.portfolio_category_mappings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_category_mappings TO authenticated;
GRANT ALL ON public.portfolio_category_mappings TO service_role;
ALTER TABLE public.portfolio_category_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_cat_map_public_read" ON public.portfolio_category_mappings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pf_cat_map_admin_write" ON public.portfolio_category_mappings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_pf_media_pf ON public.portfolio_media(portfolio_id);
GRANT SELECT ON public.portfolio_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_media TO authenticated;
GRANT ALL ON public.portfolio_media TO service_role;
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_media_public_read" ON public.portfolio_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pf_media_admin_write" ON public.portfolio_media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.portfolio_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_pf_videos_pf ON public.portfolio_videos(portfolio_id);
GRANT SELECT ON public.portfolio_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_videos TO authenticated;
GRANT ALL ON public.portfolio_videos TO service_role;
ALTER TABLE public.portfolio_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_videos_public_read" ON public.portfolio_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pf_videos_admin_write" ON public.portfolio_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.portfolio_story (
  portfolio_id UUID PRIMARY KEY REFERENCES public.portfolios(id) ON DELETE CASCADE,
  masalah TEXT,
  solusi TEXT,
  hasil TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_story TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_story TO authenticated;
GRANT ALL ON public.portfolio_story TO service_role;
ALTER TABLE public.portfolio_story ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_story_public_read" ON public.portfolio_story FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pf_story_admin_write" ON public.portfolio_story FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_pf_story_updated BEFORE UPDATE ON public.portfolio_story
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  event_type TEXT,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  type public.testimonial_type NOT NULL,
  content TEXT,
  media_url TEXT,
  video_url TEXT,
  status public.testimonial_status NOT NULL DEFAULT 'pending',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_testimonials_status ON public.testimonials(status);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "testimonials_admin_read" ON public.testimonials FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
CREATE POLICY "testimonials_admin_write" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BLOG ============
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_cat_public_read" ON public.blog_categories FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "blog_cat_admin_write" ON public.blog_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_public_read" ON public.tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags_admin_write" ON public.tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  content_md TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.publish_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  reading_minutes INT,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at DESC);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts_public_read" ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "blog_posts_admin_read" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
CREATE POLICY "blog_posts_admin_write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.blog_post_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX idx_blog_post_tags_tag ON public.blog_post_tags(tag_id);
GRANT SELECT ON public.blog_post_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_tags TO authenticated;
GRANT ALL ON public.blog_post_tags TO service_role;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_post_tags_public_read" ON public.blog_post_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "blog_post_tags_admin_write" ON public.blog_post_tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'));

-- ============ LEADS / CRM ============
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  wedding_date DATE,
  budget_min_idr BIGINT,
  budget_max_idr BIGINT,
  guest_count INT,
  venue_type TEXT,
  wedding_type TEXT,
  package_interest_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  source public.lead_source NOT NULL DEFAULT 'form',
  message TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_utm_source ON public.leads(utm_source);
CREATE INDEX idx_leads_utm_campaign ON public.leads(utm_campaign);
CREATE INDEX idx_leads_utm_combo ON public.leads(utm_source, utm_campaign);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_sales_read" ON public.leads FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'sales_admin')
    OR public.has_role(auth.uid(),'content_admin')
    OR (public.has_role(auth.uid(),'wedding_planner') AND assigned_to = auth.uid())
  );
CREATE POLICY "leads_sales_write" ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'sales_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'sales_admin'));
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type public.lead_activity_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_act_lead ON public.lead_activities(lead_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_act_read" ON public.lead_activities FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'sales_admin')
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.assigned_to = auth.uid())
  );
CREATE POLICY "lead_act_write" ON public.lead_activities FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'sales_admin')
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.assigned_to = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'sales_admin')
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.assigned_to = auth.uid())
  );

-- ============ SEED reference data ============
INSERT INTO public.package_categories (slug, name, sort_order) VALUES
  ('wedding-minang','Wedding Minang',1),
  ('wedding-gedung','Wedding Gedung',2),
  ('wedding-aula-rumah','Wedding Aula & Rumah',3),
  ('paket-lainnya','Paket Lainnya',4);

INSERT INTO public.package_tags (slug, name, color, sort_order) VALUES
  ('best-seller','Best Seller','#C6A46A',1),
  ('promo','Promo','#D8BE8A',2),
  ('premium','Premium','#2B2B2B',3),
  ('favorit','Favorit','#C6A46A',4);

INSERT INTO public.portfolio_categories (slug, name, sort_order) VALUES
  ('wedding-minang','Wedding Minang',1),
  ('wedding-gedung','Wedding Gedung',2),
  ('tenda-rumah','Tenda Rumah',3),
  ('rias-busana','Rias & Busana',4),
  ('catering','Catering',5),
  ('lainnya','Lainnya',6);

INSERT INTO public.blog_categories (slug, name, sort_order) VALUES
  ('tips-pernikahan','Tips Pernikahan',1),
  ('budget-wedding','Budget Wedding',2),
  ('wedding-checklist','Wedding Checklist',3),
  ('vendor-guide','Vendor Guide',4),
  ('adat-minang','Adat Minang',5),
  ('wo-vs-wp','WO vs WP',6),
  ('timeline-pernikahan','Timeline Pernikahan',7),
  ('venue-guide','Venue Guide',8),
  ('wedding-inspiration','Wedding Inspiration',9),
  ('kesalahan-pernikahan','Kesalahan Pernikahan',10);

INSERT INTO public.venue_types (slug, name, sort_order) VALUES
  ('gedung','Gedung',1),('aula','Aula',2),('rumah','Rumah',3),('outdoor','Outdoor',4);

INSERT INTO public.wedding_types (slug, name, sort_order) VALUES
  ('minang','Minang',1),('nasional','Nasional',2),('intimate','Intimate',3);

INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"website_name":"Errika Wedding Planner","tagline":"Wedding Planner & Organizer Jakarta","logo_url":null,"favicon_url":null}'::jsonb),
  ('contact',  '{"whatsapp_number":"","whatsapp_default_message":"Halo Errika, saya tertarik konsultasi wedding planner.","email":"","address":"Jakarta, Indonesia"}'::jsonb),
  ('social',   '{"instagram_url":"","facebook_url":"","tiktok_url":"","youtube_url":""}'::jsonb),
  ('location', '{"google_maps_url":"","lat":null,"lng":null}'::jsonb),
  ('analytics','{"ga4_id":"","gtm_id":"","meta_pixel_id":""}'::jsonb),
  ('seo_defaults','{"title":"Errika Wedding Planner & Organizer Jakarta","description":"Wedding planner & organizer terpercaya di Jakarta. Konsultasi gratis untuk pernikahan impian Anda.","og_image_url":"","twitter_handle":"","keywords":["wedding planner jakarta","wedding organizer jakarta","wedding minang"]}'::jsonb),
  ('feature_flags','{"show_promo_banner":true,"enable_budget_calculator":true}'::jsonb);
