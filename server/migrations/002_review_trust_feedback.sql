CREATE TABLE IF NOT EXISTS public."ReviewTrustFeedback" (
    id SERIAL PRIMARY KEY,
    "reviewId" integer NOT NULL REFERENCES public."Reviews"(id) ON DELETE CASCADE,
    "userId" character varying(255) NOT NULL,
    "predictedTrustLevel" character varying(100),
    "predictedTrustScore" numeric(5,4),
    feedback character varying(20) NOT NULL CHECK (feedback IN ('helpful', 'not_helpful')),
    reason character varying(255),
    "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE ("reviewId", "userId")
);

CREATE INDEX IF NOT EXISTS "ReviewTrustFeedback_reviewId_idx" ON public."ReviewTrustFeedback" ("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewTrustFeedback_userId_idx" ON public."ReviewTrustFeedback" ("userId");
