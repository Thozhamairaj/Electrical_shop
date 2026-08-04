CREATE TABLE IF NOT EXISTS public."Reviews" (
    id SERIAL PRIMARY KEY,
    "userId" character varying(255) NOT NULL REFERENCES public."Users"("clerkId") ON DELETE CASCADE,
    "productId" integer NOT NULL REFERENCES public."Products"(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "reviewTitle" character varying(120) NOT NULL,
    "reviewText" text NOT NULL,
    "verifiedPurchase" boolean NOT NULL DEFAULT false,
    "helpfulVotes" integer NOT NULL DEFAULT 0 CHECK ("helpfulVotes" >= 0),
    "trustLevel" character varying(50),
    "trustReason" text,
    status character varying(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE ("userId", "productId")
);

CREATE INDEX IF NOT EXISTS "Reviews_productId_idx" ON public."Reviews" ("productId");
CREATE INDEX IF NOT EXISTS "Reviews_userId_idx" ON public."Reviews" ("userId");
CREATE INDEX IF NOT EXISTS "Reviews_status_idx" ON public."Reviews" (status);
CREATE INDEX IF NOT EXISTS "Reviews_createdAt_idx" ON public."Reviews" ("createdAt" DESC);

CREATE TABLE IF NOT EXISTS public."ReviewHelpfulVotes" (
    id SERIAL PRIMARY KEY,
    "reviewId" integer NOT NULL REFERENCES public."Reviews"(id) ON DELETE CASCADE,
    "userId" character varying(255) NOT NULL REFERENCES public."Users"("clerkId") ON DELETE CASCADE,
    "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE ("reviewId", "userId")
);

CREATE OR REPLACE FUNCTION public.refresh_product_review_stats(target_product_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    review_count integer;
    avg_rating numeric(10,2);
BEGIN
    SELECT COUNT(*)::integer, ROUND(AVG(rating)::numeric, 2)
    INTO review_count, avg_rating
    FROM public."Reviews"
    WHERE "productId" = target_product_id
      AND status = 'Approved';

    UPDATE public."Products"
    SET rating = CASE WHEN review_count > 0 THEN avg_rating ELSE NULL END,
        reviews = COALESCE(review_count, 0),
        "updatedAt" = NOW()
    WHERE id = target_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_product_review_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.refresh_product_review_stats(OLD."productId");
        RETURN OLD;
    END IF;

    PERFORM public.refresh_product_review_stats(NEW."productId");

    IF TG_OP = 'UPDATE' AND OLD."productId" IS DISTINCT FROM NEW."productId" THEN
        PERFORM public.refresh_product_review_stats(OLD."productId");
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "reviews_sync_product_stats" ON public."Reviews";
CREATE TRIGGER "reviews_sync_product_stats"
AFTER INSERT OR UPDATE OR DELETE ON public."Reviews"
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_review_stats();