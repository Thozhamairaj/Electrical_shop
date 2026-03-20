--
-- PostgreSQL database dump
--

\restrict 26Ak26yIS269yeY6Y9tbWK1aWJOAxhTvvL6JuqOnRLevO760cQSc1EQT4xvxTpp

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Orders_paymentStatus; Type: TYPE; Schema: public; Owner: raj
--

CREATE TYPE public."enum_Orders_paymentStatus" AS ENUM (
    'pending',
    'paid',
    'failed'
);



--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: raj
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admins; Type: TABLE; Schema: public; Owner: raj
--

CREATE TABLE public."Admins" (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    name character varying(255),
    "isActive" boolean DEFAULT true,
    "lastLogin" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);



--
-- Name: Admins_id_seq; Type: SEQUENCE; Schema: public; Owner: raj
--

CREATE SEQUENCE public."Admins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: Admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raj
--

ALTER SEQUENCE public."Admins_id_seq" OWNED BY public."Admins".id;


--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: raj
--

CREATE TABLE public."CartItems" (
    pk integer NOT NULL,
    "userId" character varying(255) NOT NULL,
    "userEmail" character varying(255),
    "userName" character varying(255),
    "productId" integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    "originalPrice" numeric(10,2),
    image character varying(255),
    category character varying(255),
    rating numeric(3,2),
    reviews integer,
    quantity integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);



--
-- Name: CartItems_pk_seq; Type: SEQUENCE; Schema: public; Owner: raj
--

CREATE SEQUENCE public."CartItems_pk_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: CartItems_pk_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raj
--

ALTER SEQUENCE public."CartItems_pk_seq" OWNED BY public."CartItems".pk;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: raj
--

CREATE TABLE public."Orders" (
    id integer NOT NULL,
    "userId" character varying(255) NOT NULL,
    "userEmail" character varying(255),
    "userName" character varying(255),
    "userPhone" character varying(255),
    items json NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status public."enum_Orders_status" DEFAULT 'pending'::public."enum_Orders_status",
    "paymentStatus" public."enum_Orders_paymentStatus" DEFAULT 'pending'::public."enum_Orders_paymentStatus",
    "razorpayOrderId" character varying(255),
    "razorpayPaymentId" character varying(255),
    "razorpaySignature" character varying(255),
    "shippingAddress" text,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);



--
-- Name: COLUMN "Orders"."userId"; Type: COMMENT; Schema: public; Owner: raj
--

COMMENT ON COLUMN public."Orders"."userId" IS 'Clerk user ID';


--
-- Name: COLUMN "Orders".items; Type: COMMENT; Schema: public; Owner: raj
--

COMMENT ON COLUMN public."Orders".items IS 'Snapshot of cart items at time of order';


--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: raj
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raj
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: Products; Type: TABLE; Schema: public; Owner: raj
--

CREATE TABLE public."Products" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    "originalPrice" numeric(10,2),
    description text,
    image character varying(255),
    category character varying(255),
    rating numeric(3,2),
    reviews integer DEFAULT 0,
    stock integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);



--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: raj
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raj
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: raj
--

CREATE TABLE public."Users" (
    "clerkId" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    "phoneNumber" character varying(255),
    address text,
    "profileImageUrl" character varying(255),
    "lastLogin" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);



--
-- Name: Admins id; Type: DEFAULT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins" ALTER COLUMN id SET DEFAULT nextval('public."Admins_id_seq"'::regclass);


--
-- Name: CartItems pk; Type: DEFAULT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."CartItems" ALTER COLUMN pk SET DEFAULT nextval('public."CartItems_pk_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- Data for Name: Admins; Type: TABLE DATA; Schema: public; Owner: raj
--

COPY public."Admins" (id, username, email, "passwordHash", name, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
1	admin	raj@gmail.com	$2b$12$sw02E3rSFVaG/ZRT.xx2pucBRStLqCY/sNhxiBOVl/YRAJ3YL6yAC	Shop Administrator	t	2026-03-20 15:22:56.946086+05:30	2026-03-18 01:59:08.484+05:30	2026-03-18 01:59:20.707+05:30
\.


--
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: raj
--

COPY public."CartItems" (pk, "userId", "userEmail", "userName", "productId", name, price, "originalPrice", image, category, rating, reviews, quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: raj
--

COPY public."Orders" (id, "userId", "userEmail", "userName", "userPhone", items, "totalAmount", status, "paymentStatus", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature", "shippingAddress", notes, "createdAt", "updatedAt") FROM stdin;
2	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":20,"name":"Ceiling Fan with Built-in Light","price":200.75,"originalPrice":240.9,"description":"Brighten your space with high-quality Ceiling Fan with Light.","image":"/Images_SVH/Ceiling Fan with Light.webp","category":"lighting","rating":4.7,"reviews":406,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	200.75	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:14:02.04393+05:30	2026-03-18 06:14:19.341004+05:30
1	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"pk":20,"userId":"user_39r717XIDYKbgcYVOTHXni8Ijea","userEmail":null,"userName":null,"productId":4,"name":"16A Switch1","price":"160.96","originalPrice":null,"image":"/Images_SVH/16A Switch1.jpg","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-18T00:33:23.208Z","updatedAt":"2026-03-18T00:33:23.208Z","id":4},{"pk":21,"userId":"user_39r717XIDYKbgcYVOTHXni8Ijea","userEmail":null,"userName":null,"productId":2,"name":"16A Curtain Switch","price":"160.69","originalPrice":null,"image":"/Images_SVH/16A Curtain Switch.jpg","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-18T00:33:23.211Z","updatedAt":"2026-03-18T00:33:23.211Z","id":2}]	371.65	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:04:53.133841+05:30	2026-03-18 06:14:52.146857+05:30
3	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":20,"name":"Ceiling Fan with Light","price":200.75,"originalPrice":240.9,"description":"Brighten your space with high-quality Ceiling Fan with Light.","image":"/Images_SVH/Ceiling Fan with Light.webp","category":"lighting","rating":4.7,"reviews":406,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	250.75	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:16:25.969741+05:30	2026-03-18 06:16:38.18777+05:30
4	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":84,"name":"PhilipsFullGlowLEDSurfacelight6W","price":216.18,"originalPrice":259.42,"description":"Brighten your space with high-quality PhilipsFullGlowLEDSurfacelight6W.","image":"/Images_SVH/PhilipsFullGlowLEDSurfacelight6W.webp","category":"lighting","rating":5,"reviews":52,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	266.18	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:20:03.728049+05:30	2026-03-18 06:20:18.682607+05:30
5	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":14,"name":"Brass Elbow Fitting","price":80.55,"originalPrice":96.66,"description":"Durable and reliable BrassElbow for plumbing projects.","image":"/Images_SVH/BrassElbow.png","category":"pipes","rating":3.7,"reviews":450,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	80.55	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:23:31.285177+05:30	2026-03-18 06:23:48.847447+05:30
6	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":34,"name":"Electrical Safety Gloves","price":241.73,"originalPrice":290.08,"description":"Stay protected on the job with our Electrical Safety Gloves.","image":"/Images_SVH/Electrical Safety Gloves.jpg","category":"safety","rating":4.4,"reviews":298,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	291.73	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:29:12.849147+05:30	2026-03-18 06:29:12.849147+05:30
7	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":14,"name":"Brass Elbow Fitting","price":80.55,"originalPrice":96.66,"description":"Durable and reliable BrassElbow for plumbing projects.","image":"/Images_SVH/BrassElbow.png","category":"pipes","rating":3.7,"reviews":450,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	80.55	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:29:36.395429+05:30	2026-03-18 06:29:36.395429+05:30
8	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":162,"name":"Electrical Wiring Cables","price":55,"originalPrice":66,"description":"High-quality newCables2 for your electrical and plumbing needs.","image":"/Images_SVH/newCables2.png","category":"wiring","rating":3.9,"reviews":170,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	55.00	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:34:37.915582+05:30	2026-03-18 06:34:37.915582+05:30
9	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":60,"name":"Microtek Inverter","price":5939.66,"originalPrice":7127.59,"description":"High-quality Microtek Inverter for your electrical and plumbing needs.","image":"/Images_SVH/Microtek Inverter.webp","category":"power","rating":4.7,"reviews":358,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	5939.66	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:40:29.696031+05:30	2026-03-18 06:40:29.696031+05:30
10	user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	\N	[{"id":155,"name":"FRLS PVC Conduit Pipe","price":42.45,"originalPrice":50.94,"description":"High-quality frls-pvc-conduit-pipe for your electrical and plumbing needs.","image":"/Images_SVH/frls-pvc-conduit-pipe.webp","category":"wiring","rating":4.2,"reviews":284,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	42.45	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 06:41:17.499701+05:30	2026-03-18 06:41:17.499701+05:30
11	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"id":149,"name":"Work Safety Gloves","price":275.32,"originalPrice":330.38,"description":"Stay protected on the job with our Work Safety Gloves.","image":"/Images_SVH/Work Safety Gloves.jpg","category":"safety","rating":4.2,"reviews":416,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	325.32	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 11:22:10.957013+05:30	2026-03-18 11:22:10.957013+05:30
12	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"pk":34,"userId":"user_39r6NKzWrvNO1fdxlqmz5qpD7fl","userEmail":null,"userName":null,"productId":146,"name":"Wall Lantern Light","price":"823.94","originalPrice":null,"image":"/Images_SVH/Wall Lantern Light.webp","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-18T05:58:00.577Z","updatedAt":"2026-03-18T05:58:00.577Z","id":146},{"id":66,"name":"PVC T Joint","price":89.47,"originalPrice":107.36,"description":"Durable and reliable PVC T Joint for plumbing projects.","image":"/Images_SVH/PVC T Joint.jpg","category":"pipes","rating":4,"reviews":434,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	913.41	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 11:57:29.243724+05:30	2026-03-18 11:57:29.243724+05:30
13	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"id":3,"name":"16A Switch","price":145.23,"originalPrice":174.28,"description":"High-quality 16A Switch for your electrical and plumbing needs.","image":"/Images_SVH/16A Switch.jpg","category":"switches","rating":4,"reviews":400,"stock":50,"specs":{"material":"Premium Grade","warranty":"1 Year","origin":"India","certification":"ISI Certified"},"quantity":1}]	145.23	confirmed	paid	\N	\N	\N	To be collected		2026-03-18 12:00:29.415424+05:30	2026-03-18 12:00:29.415424+05:30
14	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"id":27,"name":"Diverters & Flush Valves","price":528.24,"originalPrice":633.89,"description":"Premium Diverters & Flush Valves for a modern bathroom experience.","image":"/Images_SVH/Diverters & Flush Valves.png","category":"bathroom","rating":3.7,"reviews":378,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	528.24	confirmed	paid	\N	\N	\N	To be collected		2026-03-19 22:34:13.55156+05:30	2026-03-19 22:34:13.55156+05:30
15	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"id":146,"name":"Wall Lantern Light","price":823.94,"originalPrice":988.73,"description":"Durable and weather-resistant Wall Lantern Light for outdoor use.","image":"/Images_SVH/Wall Lantern Light.webp","category":"outdoor","rating":4.9,"reviews":174,"stock":49,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	823.94	confirmed	paid	\N	\N	\N	To be collected		2026-03-19 22:34:54.715475+05:30	2026-03-19 22:34:54.715475+05:30
16	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"pk":42,"userId":"user_39r6NKzWrvNO1fdxlqmz5qpD7fl","userEmail":null,"userName":null,"productId":76,"name":"Philips Round LED Ceiling Light","price":"186.70","originalPrice":null,"image":"/Images_SVH/Philips Round LED Ceiling Light.webp","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-19T17:16:29.910Z","updatedAt":"2026-03-19T17:16:29.910Z","id":76},{"id":70,"name":"Philips LED Downlight","price":175.43,"originalPrice":210.52,"description":"Brighten your space with high-quality Philips LED Downlight.","image":"/Images_SVH/Philips LED Downlight.webp","category":"lighting","rating":3.5,"reviews":310,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-17T20:29:36.296Z","quantity":1}]	412.13	confirmed	paid	\N	\N	\N	To be collected		2026-03-19 22:49:48.909736+05:30	2026-03-19 22:49:48.909736+05:30
17	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"pk":55,"userId":"user_39r6NKzWrvNO1fdxlqmz5qpD7fl","userEmail":null,"userName":null,"productId":3,"name":"16A Switch","price":"145.23","originalPrice":null,"image":"/Images_SVH/16A Switch.jpg","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-19T18:19:28.490Z","updatedAt":"2026-03-19T18:19:28.490Z","id":3},{"pk":56,"userId":"user_39r6NKzWrvNO1fdxlqmz5qpD7fl","userEmail":null,"userName":null,"productId":4,"name":"16A Switch1","price":"160.96","originalPrice":null,"image":"/Images_SVH/16A Switch1.jpg","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-19T18:19:28.492Z","updatedAt":"2026-03-19T18:19:28.492Z","id":4},{"pk":57,"userId":"user_39r6NKzWrvNO1fdxlqmz5qpD7fl","userEmail":null,"userName":null,"productId":2,"name":"16A Curtain Switch","price":"160.69","originalPrice":null,"image":"/Images_SVH/16A Curtain Switch.jpg","category":null,"rating":null,"reviews":null,"quantity":1,"createdAt":"2026-03-19T18:19:28.494Z","updatedAt":"2026-03-19T18:19:28.494Z","id":2},{"id":15,"name":"BrassFTA","price":100,"originalPrice":130,"description":"High-quality BrassFTA for your electrical and plumbing needs.","image":"/Images_SVH/BrassFTA.png","category":"electrical","rating":5,"reviews":495,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-19T18:26:47.710Z","quantity":1}]	566.88	confirmed	paid	\N	\N	\N	To be collected		2026-03-20 00:03:16.725109+05:30	2026-03-20 00:03:16.725109+05:30
18	user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	[{"id":109,"name":"Safety Helmet with Face Shield","price":340,"originalPrice":410,"description":"Stay protected on the job with our Safety Helmet with Face Shield.","image":"/Images_SVH/Safety Helmet with Face Shield.jpg","category":"safety","rating":5,"reviews":140,"stock":50,"createdAt":"2026-03-17T20:29:36.296Z","updatedAt":"2026-03-19T18:26:47.710Z","quantity":1}]	390.00	confirmed	paid	\N	\N	\N	To be collected		2026-03-20 15:22:42.480593+05:30	2026-03-20 15:22:42.480593+05:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: raj
--

COPY public."Products" (id, name, price, "originalPrice", description, image, category, rating, reviews, stock, "createdAt", "updatedAt") FROM stdin;
3	16A Switch	150.00	170.00	High-quality 16A Switch for your electrical and plumbing needs.	/Images_SVH/16A Switch.jpg	switches	4.00	400	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
109	Safety Helmet with Face Shield	340.00	410.00	Stay protected on the job with our Safety Helmet with Face Shield.	/Images_SVH/Safety Helmet with Face Shield.jpg	safety	5.00	140	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
1	1 Way Switch	120.00	140.00	High-quality 1 Way Switch for your electrical and plumbing needs.	/Images_SVH/1 Way Switch.jpg	switches	4.50	84	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
41	Faucet - Aquatic	540.00	650.00	Premium Faucet - Aquatic for a modern bathroom experience.	/Images_SVH/Faucet - Aquatic.png	bathroom	3.50	75	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
79	PhilipsAstraSpot Generation2 integrated	210.00	250.00	Brighten your space with high-quality PhilipsAstraSpot Generation2 integrated.	/Images_SVH/PhilipsAstraSpot_Generation2_integrated.webp	lighting	3.90	253	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
114	SilentProEnso Silkwhite  1stAngle	100.00	120.00	High-quality SilentProEnso Silkwhite  1stAngle for your electrical and plumbing needs.	/Images_SVH/SilentProEnso_Silkwhite__1stAngle.webp	electrical	4.40	191	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
5	2 Step Fan Regulator	1720.00	2060.00	Keep cool with our energy-efficient 2 Step Fan Regulator.	/Images_SVH/2 Step Fan Regulator.jpg	fans	4.90	487	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
6	2 Way Switch	150.00	180.00	High-quality 2 Way Switch for your electrical and plumbing needs.	/Images_SVH/2 Way Switch.jpg	switches	4.50	261	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
7	Aqua Gold UPVC Pipes	90.00	110.00	Durable and reliable Aqua Gold UPVC Pipes for plumbing projects.	/Images_SVH/Aqua Gold UPVC Pipes.png	pipes	4.10	227	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
8	Aquatic Series - Taps	470.00	570.00	Premium Aquatic Series - Taps for a modern bathroom experience.	/Images_SVH/Aquatic Series - Taps.png	bathroom	3.90	190	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
150	YStrainer	110.00	140.00	High-quality YStrainer for your electrical and plumbing needs.	/Images_SVH/YStrainer.png	electrical	4.30	141	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
9	Arteor-product	90.00	110.00	High-quality Arteor-product for your electrical and plumbing needs.	/Images_SVH/Arteor-product.jpg	electrical	5.00	37	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
10	BallVolve	80.00	100.00	High-quality BallVolve for your electrical and plumbing needs.	/Images_SVH/BallVolve.png	electrical	3.60	199	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
11	Blank Switch Plate	140.00	170.00	High-quality Blank Switch Plate for your electrical and plumbing needs.	/Images_SVH/Blank Switch Plate.jpg	switches	4.80	293	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
12	BlindFlange	90.00	100.00	Durable and reliable BlindFlange for plumbing projects.	/Images_SVH/BlindFlange.png	pipes	4.30	186	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
13	Borewell Submersible Pump	3470.00	4160.00	High-quality Borewell Submersible Pump for your electrical and plumbing needs.	/Images_SVH/Borewell Submersible Pump.png	pumps	3.70	246	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
16	BrassMTA	90.00	110.00	High-quality BrassMTA for your electrical and plumbing needs.	/Images_SVH/BrassMTA.png	electrical	3.80	166	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
17	BrassTee	90.00	110.00	Durable and reliable BrassTee for plumbing projects.	/Images_SVH/BrassTee.png	pipes	3.80	150	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
18	Bypass Bend	90.00	110.00	Durable and reliable Bypass Bend for plumbing projects.	/Images_SVH/Bypass Bend.png	pipes	4.20	176	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
19	CLASSIC SERIES (AQUAKRAFT)	90.00	110.00	High-quality CLASSIC SERIES (AQUAKRAFT) for your electrical and plumbing needs.	/Images_SVH/CLASSIC SERIES (AQUAKRAFT).png	electrical	3.80	37	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
21	Ceiling Fan	1240.00	1490.00	Keep cool with our energy-efficient Ceiling Fan.	/Images_SVH/Ceiling Fan.webp	fans	4.70	421	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
22	Centrifugal Water Pump	3860.00	4630.00	High-quality Centrifugal Water Pump for your electrical and plumbing needs.	/Images_SVH/Centrifugal Water Pump.png	pumps	4.80	489	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
23	Circuit Test Plug (New)	90.00	110.00	High-quality Circuit Test Plug (New) for your electrical and plumbing needs.	/Images_SVH/Circuit Test Plug (New).png	electrical	4.10	17	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
24	Coupler	90.00	100.00	Durable and reliable Coupler for plumbing projects.	/Images_SVH/Coupler.png	pipes	3.60	215	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
25	Cross Tee	110.00	140.00	Durable and reliable Cross Tee for plumbing projects.	/Images_SVH/Cross Tee.png	pipes	3.70	227	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
26	Curtain Switch	120.00	150.00	High-quality Curtain Switch for your electrical and plumbing needs.	/Images_SVH/Curtain Switch.jpg	switches	3.90	178	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
28	Domestic Water Pump	4560.00	5470.00	High-quality Domestic Water Pump for your electrical and plumbing needs.	/Images_SVH/Domestic Water Pump.png	pumps	4.80	409	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
29	Doorbell Switch	120.00	150.00	High-quality Doorbell Switch for your electrical and plumbing needs.	/Images_SVH/Doorbell Switch.jpg	switches	4.10	173	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
30	Doorbell Switch1	130.00	160.00	High-quality Doorbell Switch1 for your electrical and plumbing needs.	/Images_SVH/Doorbell Switch1.jpg	switches	3.80	435	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
31	Double Switch Plate	170.00	200.00	High-quality Double Switch Plate for your electrical and plumbing needs.	/Images_SVH/Double Switch Plate.jpg	switches	4.10	126	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
32	Elbow 45°	90.00	110.00	Durable and reliable Elbow 45° for plumbing projects.	/Images_SVH/Elbow 45°.png	pipes	3.50	170	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
33	Elbow 90°	110.00	130.00	Durable and reliable Elbow 90° for plumbing projects.	/Images_SVH/Elbow 90°.png	pipes	4.60	356	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
35	EndCap	110.00	140.00	High-quality EndCap for your electrical and plumbing needs.	/Images_SVH/EndCap.png	electrical	3.60	204	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
36	Equal Tee	100.00	120.00	Durable and reliable Equal Tee for plumbing projects.	/Images_SVH/Equal Tee.png	pipes	3.70	204	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
37	Fan Regulator (70W)	1280.00	1540.00	Keep cool with our energy-efficient Fan Regulator (70W).	/Images_SVH/Fan Regulator (70W).jpg	fans	3.90	113	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
38	Fan Speed Dimmer	1420.00	1710.00	Keep cool with our energy-efficient Fan Speed Dimmer.	/Images_SVH/Fan Speed Dimmer.jpg	fans	4.40	130	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
39	Fan Speed Regulator	1600.00	1920.00	Keep cool with our energy-efficient Fan Speed Regulator.	/Images_SVH/Fan Speed Regulator.jpg	fans	4.00	70	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
40	Faucet - Aquakraft - Health Faucets	460.00	550.00	Premium Faucet - Aquakraft - Health Faucets for a modern bathroom experience.	/Images_SVH/Faucet - Aquakraft - Health Faucets.png	bathroom	4.80	369	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
34	Electrical Safety Gloves	240.00	290.00	Stay protected on the job with our Electrical Safety Gloves.	/Images_SVH/Electrical Safety Gloves.jpg	safety	4.40	298	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
20	Ceiling Fan with Light	200.00	240.00	Brighten your space with high-quality Ceiling Fan with Light.	/Images_SVH/Ceiling Fan with Light.webp	lighting	4.70	406	46	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
27	Diverters & Flush Valves	530.00	630.00	Premium Diverters & Flush Valves for a modern bathroom experience.	/Images_SVH/Diverters & Flush Valves.png	bathroom	3.70	378	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
14	BrassElbow	80.00	100.00	Durable and reliable BrassElbow for plumbing projects.	/Images_SVH/BrassElbow.png	pipes	3.70	450	47	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
42	Female Threaded Elbow (Plastic)	110.00	130.00	Durable and reliable Female Threaded Elbow (Plastic) for plumbing projects.	/Images_SVH/Female Threaded Elbow (Plastic).png	pipes	4.50	61	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
43	Flame Retardant (FR) Grade (90Mtr) Silver	100.00	120.00	High-quality Flame Retardant (FR) Grade (90Mtr) Silver for your electrical and plumbing needs.	/Images_SVH/Flame Retardant (FR) Grade (90Mtr) Silver.png	electrical	4.70	100	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
44	FlangeAdapter	110.00	140.00	Durable and reliable FlangeAdapter for plumbing projects.	/Images_SVH/FlangeAdapter.png	pipes	4.30	162	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
45	Flush Tank	480.00	580.00	Premium Flush Tank for a modern bathroom experience.	/Images_SVH/Flush Tank.png	bathroom	4.20	146	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
46	Hand Shower	520.00	620.00	Premium Hand Shower for a modern bathroom experience.	/Images_SVH/Hand Shower.png	bathroom	3.80	185	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
47	IMAGNO 410	110.00	130.00	High-quality IMAGNO 410 for your electrical and plumbing needs.	/Images_SVH/IMAGNO_410.webp	electrical	4.30	303	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
48	Indicator Switch	170.00	200.00	High-quality Indicator Switch for your electrical and plumbing needs.	/Images_SVH/Indicator Switch.jpg	switches	4.50	454	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
2	16A Curtain Switch	160.00	190.00	High-quality 16A Curtain Switch for your electrical and plumbing needs.	/Images_SVH/16A Curtain Switch.jpg	switches	3.50	429	47	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
15	BrassFTA	100.00	130.00	High-quality BrassFTA for your electrical and plumbing needs.	/Images_SVH/BrassFTA.png	electrical	5.00	495	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
49	Industrial Water Pump	3990.00	4790.00	High-quality Industrial Water Pump for your electrical and plumbing needs.	/Images_SVH/Industrial Water Pump.png	pumps	4.10	238	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
50	Instant Water Heater	80.00	100.00	High-quality Instant Water Heater for your electrical and plumbing needs.	/Images_SVH/Instant Water Heater.webp	electrical	4.00	51	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
51	Inverter Battery with UPS	5930.00	7110.00	High-quality Inverter Battery with UPS for your electrical and plumbing needs.	/Images_SVH/Inverter Battery with UPS.png	power	3.60	187	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
52	LED Strip Light	190.00	220.00	Brighten your space with high-quality LED Strip Light.	/Images_SVH/LED Strip Light.webp	lighting	4.10	129	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
53	LightPineWood Ceiling Fan	190.00	230.00	Brighten your space with high-quality LightPineWood Ceiling Fan.	/Images_SVH/LightPineWood_Ceiling Fan.webp	lighting	4.50	153	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
54	Luminous Inverter Battery	5630.00	6760.00	High-quality Luminous Inverter Battery for your electrical and plumbing needs.	/Images_SVH/Luminous Inverter Battery.png	power	4.20	118	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
55	MARVEL SERIES-Milk White QT	110.00	140.00	High-quality MARVEL SERIES-Milk White QT for your electrical and plumbing needs.	/Images_SVH/MARVEL SERIES-Milk White QT.png	electrical	4.40	373	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
56	MURPHY SERIES QT	100.00	120.00	High-quality MURPHY SERIES QT for your electrical and plumbing needs.	/Images_SVH/MURPHY SERIES QT.png	electrical	4.60	481	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
57	Male Threaded Adapter M.T.A. (Plastic)	100.00	120.00	Durable and reliable Male Threaded Adapter M.T.A. (Plastic) for plumbing projects.	/Images_SVH/Male Threaded Adapter M.T.A. (Plastic).png	pipes	4.00	236	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
58	Medium Bodied (uPVC) Tube	90.00	110.00	Durable and reliable Medium Bodied (uPVC) Tube for plumbing projects.	/Images_SVH/Medium Bodied (uPVC) Tube.png	pipes	4.00	220	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
59	Microtek Battery	4170.00	5010.00	High-quality Microtek Battery for your electrical and plumbing needs.	/Images_SVH/Microtek Battery.webp	power	3.70	130	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
61	OTHER TAPS	420.00	500.00	Premium OTHER TAPS for a modern bathroom experience.	/Images_SVH/OTHER TAPS.png	bathroom	4.50	459	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
62	Outdoor Spot Lights	980.00	1180.00	Durable and weather-resistant Outdoor Spot Lights for outdoor use.	/Images_SVH/Outdoor Spot Lights.webp	outdoor	4.60	315	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
63	PVC Ball Valve	80.00	100.00	Durable and reliable PVC Ball Valve for plumbing projects.	/Images_SVH/PVC Ball Valve.jpg	pipes	4.30	479	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
64	PVC Pipe End Cap	90.00	110.00	Durable and reliable PVC Pipe End Cap for plumbing projects.	/Images_SVH/PVC Pipe End Cap.jpg	pipes	3.60	235	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
65	PVC Reducer Pipe Fitting	90.00	100.00	Durable and reliable PVC Reducer Pipe Fitting for plumbing projects.	/Images_SVH/PVC Reducer Pipe Fitting.jpg	pipes	4.30	260	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
67	PVC T Pipe Connector	120.00	140.00	Durable and reliable PVC T Pipe Connector for plumbing projects.	/Images_SVH/PVC T Pipe Connector.jpg	pipes	4.90	367	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
68	PVC Union Pipe Fitting	110.00	130.00	Durable and reliable PVC Union Pipe Fitting for plumbing projects.	/Images_SVH/PVC Union Pipe Fitting.jpg	pipes	4.90	307	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
69	PVC Y Joint	100.00	120.00	Durable and reliable PVC Y Joint for plumbing projects.	/Images_SVH/PVC Y Joint.jpg	pipes	3.90	308	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
71	Philips LED Panel Light	200.00	240.00	Brighten your space with high-quality Philips LED Panel Light.	/Images_SVH/Philips LED Panel Light.webp	lighting	3.80	70	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
72	Philips LED Surface Light	190.00	230.00	Brighten your space with high-quality Philips LED Surface Light.	/Images_SVH/Philips LED Surface Light.webp	lighting	4.40	110	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
73	Philips LED T-Bulb Light	220.00	270.00	Brighten your space with high-quality Philips LED T-Bulb Light.	/Images_SVH/Philips LED T-Bulb Light.webp	lighting	3.50	38	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
74	Philips LED Tube Light Box	180.00	220.00	Brighten your space with high-quality Philips LED Tube Light Box.	/Images_SVH/Philips LED Tube Light Box.webp	lighting	4.90	143	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
75	Philips LED Tube Light	230.00	270.00	Brighten your space with high-quality Philips LED Tube Light.	/Images_SVH/Philips LED Tube Light.webp	lighting	4.70	290	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
77	Philips Smart LED Bulb	200.00	230.00	Brighten your space with high-quality Philips Smart LED Bulb.	/Images_SVH/Philips Smart LED Bulb.webp	lighting	3.90	68	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
78	PhilipsAceSaverLEDBulb3	190.00	230.00	Brighten your space with high-quality PhilipsAceSaverLEDBulb3.	/Images_SVH/PhilipsAceSaverLEDBulb3.webp	lighting	4.70	238	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
66	PVC T Joint	90.00	110.00	Durable and reliable PVC T Joint for plumbing projects.	/Images_SVH/PVC T Joint.jpg	pipes	4.00	434	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
76	Philips Round LED Ceiling Light	190.00	220.00	Brighten your space with high-quality Philips Round LED Ceiling Light.	/Images_SVH/Philips Round LED Ceiling Light.webp	lighting	4.90	483	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
70	Philips LED Downlight	180.00	210.00	Brighten your space with high-quality Philips LED Downlight.	/Images_SVH/Philips LED Downlight.webp	lighting	3.50	310	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
80	PhilipsAuraStyledgeLEDDownlight	230.00	280.00	Brighten your space with high-quality PhilipsAuraStyledgeLEDDownlight.	/Images_SVH/PhilipsAuraStyledgeLEDDownlight.webp	lighting	5.00	456	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
81	PhilipsFilamentLEDBulb E27base A60bulb	240.00	280.00	Brighten your space with high-quality PhilipsFilamentLEDBulb E27base A60bulb.	/Images_SVH/PhilipsFilamentLEDBulb_E27base_A60bulb.webp	lighting	3.70	80	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
82	PhilipsFilamentLEDCandle E27base	190.00	230.00	Brighten your space with high-quality PhilipsFilamentLEDCandle E27base.	/Images_SVH/PhilipsFilamentLEDCandle_E27base.webp	lighting	4.40	81	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
83	PhilipsFullGlowLEDMetalSurfacelight	220.00	260.00	Brighten your space with high-quality PhilipsFullGlowLEDMetalSurfacelight.	/Images_SVH/PhilipsFullGlowLEDMetalSurfacelight.webp	lighting	4.60	300	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
85	PhilipsFullGlowStrikerLEDSurfacelight	210.00	250.00	Brighten your space with high-quality PhilipsFullGlowStrikerLEDSurfacelight.	/Images_SVH/PhilipsFullGlowStrikerLEDSurfacelight.webp	lighting	4.90	491	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
86	PhilipsG9bulb-5W	170.00	200.00	Brighten your space with high-quality PhilipsG9bulb-5W.	/Images_SVH/PhilipsG9bulb-5W.webp	lighting	4.50	46	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
87	PhilipsMotionSensingBulb	220.00	260.00	Brighten your space with high-quality PhilipsMotionSensingBulb.	/Images_SVH/PhilipsMotionSensingBulb.webp	lighting	4.20	349	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
88	PhilipsPrimeNeoRecessedLEDDownlight	230.00	270.00	Brighten your space with high-quality PhilipsPrimeNeoRecessedLEDDownlight.	/Images_SVH/PhilipsPrimeNeoRecessedLEDDownlight.webp	lighting	3.90	153	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
89	PhilipsStarBrightLEDTubelightcopy	210.00	250.00	Brighten your space with high-quality PhilipsStarBrightLEDTubelightcopy.	/Images_SVH/PhilipsStarBrightLEDTubelightcopy.webp	lighting	4.20	73	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
90	PhilipsStarFitLEDDownlight3	190.00	230.00	Brighten your space with high-quality PhilipsStarFitLEDDownlight3.	/Images_SVH/PhilipsStarFitLEDDownlight3.webp	lighting	3.60	414	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
91	PhilipsUltraGlowLEDDownlight 0bf4781a-be5f-422d-b259-622765a83679 (1)	190.00	230.00	Brighten your space with high-quality PhilipsUltraGlowLEDDownlight 0bf4781a-be5f-422d-b259-622765a83679 (1).	/Images_SVH/PhilipsUltraGlowLEDDownlight_0bf4781a-be5f-422d-b259-622765a83679 (1).webp	lighting	4.00	473	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
92	PhilipsUltraGlowLEDDownlight 0bf4781a-be5f-422d-b259-622765a83679	190.00	230.00	Brighten your space with high-quality PhilipsUltraGlowLEDDownlight 0bf4781a-be5f-422d-b259-622765a83679.	/Images_SVH/PhilipsUltraGlowLEDDownlight_0bf4781a-be5f-422d-b259-622765a83679.webp	lighting	4.40	88	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
93	Philips Full GloW LED Bulb 9W LED Bulb 600 lm 2700K B22 base Diffused Warm White 8d1eb493-1f7c-4ad8-8093-4be0b70c22a4	210.00	260.00	Brighten your space with high-quality Philips Full GloW LED Bulb 9W LED Bulb 600 lm 2700K B22 base Diffused Warm White 8d1eb493-1f7c-4ad8-8093-4be0b70c22a4.	/Images_SVH/Philips_Full_GloW_LED_Bulb_9W_LED_Bulb_600_lm_2700K_B22_base_Diffused_Warm_White_8d1eb493-1f7c-4ad8-8093-4be0b70c22a4.webp	lighting	4.90	71	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
94	Photo Ball-Valve Plastic-Orange-Handle	110.00	130.00	Durable and reliable Photo Ball-Valve Plastic-Orange-Handle for plumbing projects.	/Images_SVH/Photo_Ball-Valve_Plastic-Orange-Handle.jpg	pipes	3.90	40	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
95	Pipe Clip (Plastic)	110.00	130.00	Durable and reliable Pipe Clip (Plastic) for plumbing projects.	/Images_SVH/Pipe Clip (Plastic).png	pipes	4.10	154	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
96	Pipes	110.00	130.00	Durable and reliable Pipes for plumbing projects.	/Images_SVH/Pipes.png	pipes	4.40	372	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
97	PlainBallVolve	110.00	130.00	High-quality PlainBallVolve for your electrical and plumbing needs.	/Images_SVH/PlainBallVolve.png	electrical	4.80	100	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
98	Plastic Water Tank	2920.00	3500.00	High-quality Plastic Water Tank for your electrical and plumbing needs.	/Images_SVH/Plastic Water Tank.jpg	tanks	3.70	454	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
99	Power Socket	130.00	150.00	High-quality Power Socket for your electrical and plumbing needs.	/Images_SVH/Power Socket.jpg	switches	3.50	338	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
100	Primer	80.00	100.00	Durable and reliable Primer for plumbing projects.	/Images_SVH/Primer.png	pipes	4.00	168	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
101	Pvc-Reducer-Fitting Plumbing-Component	100.00	120.00	Durable and reliable Pvc-Reducer-Fitting Plumbing-Component for plumbing projects.	/Images_SVH/Pvc-Reducer-Fitting_Plumbing-Component.jpg	pipes	4.60	98	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
102	ReduceBush	90.00	110.00	Durable and reliable ReduceBush for plumbing projects.	/Images_SVH/ReduceBush.png	pipes	4.80	348	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
103	Reducer	110.00	130.00	Durable and reliable Reducer for plumbing projects.	/Images_SVH/Reducer.png	pipes	4.70	49	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
104	Reducing Bush	100.00	120.00	Durable and reliable Reducing Bush for plumbing projects.	/Images_SVH/Reducing Bush.png	pipes	4.90	301	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
105	Reducing Tee	110.00	140.00	Durable and reliable Reducing Tee for plumbing projects.	/Images_SVH/Reducing Tee.png	pipes	4.80	446	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
106	Rotary Dimmer Switch	1550.00	1860.00	Keep cool with our energy-efficient Rotary Dimmer Switch.	/Images_SVH/Rotary Dimmer Switch.jpg	fans	4.00	122	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
107	Rubber Lubricant	120.00	140.00	Durable and reliable Rubber Lubricant for plumbing projects.	/Images_SVH/Rubber Lubricant.png	pipes	4.80	221	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
108	Safety Glasses	350.00	430.00	Stay protected on the job with our Safety Glasses.	/Images_SVH/Safety Glasses.jpg	safety	4.20	314	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
110	Safety Helmet	330.00	400.00	Stay protected on the job with our Safety Helmet.	/Images_SVH/Safety Helmet.jpg	safety	4.90	456	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
111	Safety Kit (PPE Set)	320.00	380.00	Stay protected on the job with our Safety Kit (PPE Set).	/Images_SVH/Safety Kit (PPE Set).jpg	safety	4.80	49	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
112	Sanitary Ware	570.00	680.00	Premium Sanitary Ware for a modern bathroom experience.	/Images_SVH/Sanitary Ware.png	bathroom	4.30	124	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
113	Showers	480.00	570.00	Premium Showers for a modern bathroom experience.	/Images_SVH/Showers.png	bathroom	4.10	414	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
115	SilentproBlossomsmart Denimblue 1 angle 1	100.00	120.00	High-quality SilentproBlossomsmart Denimblue 1 angle 1 for your electrical and plumbing needs.	/Images_SVH/SilentproBlossomsmart_Denimblue_1_angle_1.webp	electrical	3.80	190	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
116	Siltank Covers (Lids) (Black)	2620.00	3150.00	High-quality Siltank Covers (Lids) (Black) for your electrical and plumbing needs.	/Images_SVH/Siltank Covers (Lids) (Black).png	tanks	4.80	415	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
117	Siltank Covers (Lids) (Green)	2810.00	3370.00	High-quality Siltank Covers (Lids) (Green) for your electrical and plumbing needs.	/Images_SVH/Siltank Covers (Lids) (Green).png	tanks	4.20	74	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
118	Siltank Covers (Lids) (White)	2790.00	3350.00	High-quality Siltank Covers (Lids) (White) for your electrical and plumbing needs.	/Images_SVH/Siltank Covers (Lids) (White).png	tanks	4.90	56	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
119	Smart Water Heater	90.00	110.00	High-quality Smart Water Heater for your electrical and plumbing needs.	/Images_SVH/Smart Water Heater.webp	electrical	4.70	74	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
120	SnowWhite Ceiling Fan	1210.00	1450.00	Keep cool with our energy-efficient SnowWhite Ceiling Fan.	/Images_SVH/SnowWhite_Ceiling Fan.webp	fans	4.10	232	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
121	Striker-Surface	90.00	110.00	High-quality Striker-Surface for your electrical and plumbing needs.	/Images_SVH/Striker-Surface.webp	electrical	3.90	357	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
122	Submersible Pump	3430.00	4120.00	High-quality Submersible Pump for your electrical and plumbing needs.	/Images_SVH/Submersible Pump.png	pumps	3.60	253	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
123	TVolvePipe	100.00	120.00	Durable and reliable TVolvePipe for plumbing projects.	/Images_SVH/TVolvePipe.png	pipes	4.50	222	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
124	Table Fan	1660.00	1990.00	Keep cool with our energy-efficient Table Fan.	/Images_SVH/Table Fan.webp	fans	4.50	91	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
125	Tabs	90.00	110.00	High-quality Tabs for your electrical and plumbing needs.	/Images_SVH/Tabs.png	electrical	4.00	352	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
126	TailPiece	90.00	110.00	Durable and reliable TailPiece for plumbing projects.	/Images_SVH/TailPiece.png	pipes	4.10	490	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
127	TankConnector	100.00	120.00	Durable and reliable TankConnector for plumbing projects.	/Images_SVH/TankConnector.png	pipes	4.60	83	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
128	Three Layer Overhead Water Tanks (threaded Type Cover White Colour)	2520.00	3020.00	High-quality Three Layer Overhead Water Tanks (threaded Type Cover White Colour) for your electrical and plumbing needs.	/Images_SVH/Three Layer Overhead Water Tanks (threaded Type Cover White Colour).png	tanks	3.80	92	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
129	Three Layer Overhead Water Tanks - (Threaded Type cover - Green colour)	2720.00	3270.00	High-quality Three Layer Overhead Water Tanks - (Threaded Type cover - Green colour) for your electrical and plumbing needs.	/Images_SVH/Three Layer Overhead Water Tanks - (Threaded Type cover - Green colour).png	tanks	3.60	322	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
130	Two Layer Overhead Water Tank (Threaded Type cover - Black colour)	2960.00	3550.00	High-quality Two Layer Overhead Water Tank (Threaded Type cover - Black colour) for your electrical and plumbing needs.	/Images_SVH/Two Layer Overhead Water Tank (Threaded Type cover - Black colour).png	tanks	4.30	187	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
131	UPS Inverter	4540.00	5450.00	High-quality UPS Inverter for your electrical and plumbing needs.	/Images_SVH/UPS Inverter.webp	power	3.80	170	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
132	Union(threaded)	120.00	140.00	Durable and reliable Union(threaded) for plumbing projects.	/Images_SVH/Union(threaded).png	pipes	4.10	499	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
133	UnionPipe	100.00	120.00	Durable and reliable UnionPipe for plumbing projects.	/Images_SVH/UnionPipe.png	pipes	4.10	109	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
134	V-Guard Electric Water Heater	90.00	100.00	High-quality V-Guard Electric Water Heater for your electrical and plumbing needs.	/Images_SVH/V-Guard Electric Water Heater.webp	electrical	4.30	95	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
135	V-Guard Instant Geyser	90.00	100.00	High-quality V-Guard Instant Geyser for your electrical and plumbing needs.	/Images_SVH/V-Guard Instant Geyser.webp	electrical	3.80	183	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
136	V-Guard Instant Water Heater	120.00	140.00	High-quality V-Guard Instant Water Heater for your electrical and plumbing needs.	/Images_SVH/V-Guard Instant Water Heater.webp	electrical	3.80	186	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
137	V-Guard Storage Water Heater	80.00	100.00	High-quality V-Guard Storage Water Heater for your electrical and plumbing needs.	/Images_SVH/V-Guard Storage Water Heater.webp	electrical	4.20	135	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
138	V-Guard Voltage Stabilizer	5880.00	7060.00	High-quality V-Guard Voltage Stabilizer for your electrical and plumbing needs.	/Images_SVH/V-Guard Voltage Stabilizer.webp	power	3.80	25	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
139	V-Guard Water Heater	90.00	100.00	High-quality V-Guard Water Heater for your electrical and plumbing needs.	/Images_SVH/V-Guard Water Heater.webp	electrical	4.80	108	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
140	V-Guard Water-Heater Zeno	110.00	130.00	High-quality V-Guard Water-Heater Zeno for your electrical and plumbing needs.	/Images_SVH/V-Guard_Water-Heater_Zeno.webp	electrical	4.10	265	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
141	VOLTINO GRANDI DIDI PLUS	110.00	130.00	High-quality VOLTINO GRANDI DIDI PLUS for your electrical and plumbing needs.	/Images_SVH/VOLTINO_GRANDI_DIDI_PLUS.webp	electrical	4.50	166	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
142	VOLTINO MAX DIGI	90.00	100.00	High-quality VOLTINO MAX DIGI for your electrical and plumbing needs.	/Images_SVH/VOLTINO_MAX_DIGI.webp	electrical	4.40	467	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
143	WHITE-BGArtboard-1	80.00	100.00	High-quality WHITE-BGArtboard-1 for your electrical and plumbing needs.	/Images_SVH/WHITE-BGArtboard-1.webp	electrical	3.70	276	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
144	WHITE DIVINO-DG	110.00	130.00	High-quality WHITE DIVINO-DG for your electrical and plumbing needs.	/Images_SVH/WHITE_DIVINO-DG.webp	electrical	3.80	125	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
145	WHITE DIVINO	120.00	140.00	High-quality WHITE DIVINO for your electrical and plumbing needs.	/Images_SVH/WHITE_DIVINO.webp	electrical	3.60	100	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
147	Wall Light Fixture	220.00	260.00	Brighten your space with high-quality Wall Light Fixture.	/Images_SVH/Wall Light Fixture.webp	lighting	3.90	473	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
148	Wall Light Set	190.00	230.00	Brighten your space with high-quality Wall Light Set.	/Images_SVH/Wall Light Set.webp	lighting	3.90	201	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
151	bldc-fan	1460.00	1760.00	Keep cool with our energy-efficient bldc-fan.	/Images_SVH/bldc-fan.png	fans	4.90	418	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
152	ceiling-fan	1240.00	1490.00	Keep cool with our energy-efficient ceiling-fan.	/Images_SVH/ceiling-fan.png	fans	4.40	493	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
153	electrical-junction-box	50.00	70.00	High-quality electrical-junction-box for your electrical and plumbing needs.	/Images_SVH/electrical-junction-box.webp	wiring	4.60	334	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
154	exhaust-fan	1270.00	1530.00	Keep cool with our energy-efficient exhaust-fan.	/Images_SVH/exhaust-fan.png	fans	4.40	198	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
156	inverter-1	4590.00	5500.00	High-quality inverter-1 for your electrical and plumbing needs.	/Images_SVH/inverter-1.webp	power	4.20	295	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
157	led-bulbs-pack	200.00	230.00	Brighten your space with high-quality led-bulbs-pack.	/Images_SVH/led-bulbs-pack.png	lighting	3.80	361	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
158	led-panel-light	200.00	240.00	Brighten your space with high-quality led-panel-light.	/Images_SVH/led-panel-light.png	lighting	3.60	418	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
159	living now thumbnail	90.00	100.00	High-quality living now thumbnail for your electrical and plumbing needs.	/Images_SVH/living_now_thumbnail.jpg	electrical	3.90	39	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
160	long-bend	110.00	140.00	Durable and reliable long-bend for plumbing projects.	/Images_SVH/long-bend.webp	pipes	3.90	197	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
161	microtek-super-power-ups	4820.00	5780.00	High-quality microtek-super-power-ups for your electrical and plumbing needs.	/Images_SVH/microtek-super-power-ups.webp	power	4.70	193	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
163	philip 14w	120.00	140.00	High-quality philip 14w for your electrical and plumbing needs.	/Images_SVH/philip_14w.png	electrical	4.30	52	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
164	philip 22w	120.00	140.00	High-quality philip 22w for your electrical and plumbing needs.	/Images_SVH/philip_22w.png	electrical	4.80	87	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
165	pvc-bend	80.00	100.00	Durable and reliable pvc-bend for plumbing projects.	/Images_SVH/pvc-bend.webp	pipes	4.20	230	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
166	pvc-electrical-bend	110.00	130.00	Durable and reliable pvc-electrical-bend for plumbing projects.	/Images_SVH/pvc-electrical-bend.webp	pipes	4.70	140	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
167	pvc-electrical-fittings	100.00	120.00	High-quality pvc-electrical-fittings for your electrical and plumbing needs.	/Images_SVH/pvc-electrical-fittings.webp	electrical	3.70	359	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
168	pvc-pipe-bend	90.00	110.00	Durable and reliable pvc-pipe-bend for plumbing projects.	/Images_SVH/pvc-pipe-bend.webp	pipes	4.10	70	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
169	pvc-pipe-coupler	90.00	110.00	Durable and reliable pvc-pipe-coupler for plumbing projects.	/Images_SVH/pvc-pipe-coupler.webp	pipes	3.90	342	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
170	rigid-pvc-pipe	80.00	100.00	Durable and reliable rigid-pvc-pipe for plumbing projects.	/Images_SVH/rigid-pvc-pipe.webp	pipes	4.40	431	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
171	slimline25W	100.00	130.00	High-quality slimline25W for your electrical and plumbing needs.	/Images_SVH/slimline25W.png	electrical	3.60	181	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
172	smart-switch	120.00	150.00	High-quality smart-switch for your electrical and plumbing needs.	/Images_SVH/smart-switch.png	switches	4.80	147	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
173	smartfilamentbulb	170.00	200.00	Brighten your space with high-quality smartfilamentbulb.	/Images_SVH/smartfilamentbulb.webp	lighting	3.80	104	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
174	streetLightGM	1190.00	1430.00	Durable and weather-resistant streetLightGM for outdoor use.	/Images_SVH/streetLightGM.png	outdoor	4.30	104	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
175	suction-pipe	100.00	130.00	Durable and reliable suction-pipe for plumbing projects.	/Images_SVH/suction-pipe.webp	pipes	3.70	299	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
176	supremeMeter	100.00	120.00	High-quality supremeMeter for your electrical and plumbing needs.	/Images_SVH/supremeMeter.png	electrical	3.90	442	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
177	threadedReducingBush	100.00	120.00	Durable and reliable threadedReducingBush for plumbing projects.	/Images_SVH/threadedReducingBush.png	pipes	3.90	361	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
178	upvc-elbow	80.00	100.00	Durable and reliable upvc-elbow for plumbing projects.	/Images_SVH/upvc-elbow.webp	pipes	4.70	258	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
179	white-t-shape-pvc-elbow	100.00	120.00	Durable and reliable white-t-shape-pvc-elbow for plumbing projects.	/Images_SVH/white-t-shape-pvc-elbow.jpg	pipes	4.40	129	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
180	yolo 15w	110.00	140.00	High-quality yolo 15w for your electrical and plumbing needs.	/Images_SVH/yolo_15w.png	electrical	4.10	329	50	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
146	Wall Lantern Light	820.00	990.00	Durable and weather-resistant Wall Lantern Light for outdoor use.	/Images_SVH/Wall Lantern Light.webp	outdoor	4.90	174	48	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
84	PhilipsFullGlowLEDSurfacelight6W	220.00	260.00	Brighten your space with high-quality PhilipsFullGlowLEDSurfacelight6W.	/Images_SVH/PhilipsFullGlowLEDSurfacelight6W.webp	lighting	5.00	52	48	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
162	newCables2	60.00	70.00	High-quality newCables2 for your electrical and plumbing needs.	/Images_SVH/newCables2.png	wiring	3.90	170	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
60	Microtek Inverter	5940.00	7130.00	High-quality Microtek Inverter for your electrical and plumbing needs.	/Images_SVH/Microtek Inverter.webp	power	4.70	358	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
155	frls-pvc-conduit-pipe	40.00	50.00	High-quality frls-pvc-conduit-pipe for your electrical and plumbing needs.	/Images_SVH/frls-pvc-conduit-pipe.webp	wiring	4.20	284	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
149	Work Safety Gloves	280.00	330.00	Stay protected on the job with our Work Safety Gloves.	/Images_SVH/Work Safety Gloves.jpg	safety	4.20	416	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
4	16A Switch1	160.00	190.00	High-quality 16A Switch1 for your electrical and plumbing needs.	/Images_SVH/16A Switch1.jpg	switches	4.30	259	49	2026-03-18 01:59:36.296+05:30	2026-03-19 23:56:47.710485+05:30
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: raj
--

COPY public."Users" ("clerkId", email, name, "phoneNumber", address, "profileImageUrl", "lastLogin", "createdAt", "updatedAt") FROM stdin;
user_39r6NKzWrvNO1fdxlqmz5qpD7fl	thozhamairajc.23aim@kongu.edu	Thozhamai	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zOUZFa016ckZjUzhVWnFmQTVBamZ4VlExTVMiLCJyaWQiOiJ1c2VyXzM5cjZOS3pXcnZOTzFmZHhscW16NXFwRDdmbCIsImluaXRpYWxzIjoiVCJ9	2026-03-20 15:24:00.491878+05:30	2026-03-18 06:41:58.371664+05:30	2026-03-20 15:24:00.491878+05:30
user_39r717XIDYKbgcYVOTHXni8Ijea	thozhamairaj@gmail.com	Thozhamairaj C	+919080459028		https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zOUZFa016ckZjUzhVWnFmQTVBamZ4VlExTVMiLCJyaWQiOiJ1c2VyXzM5cjcxN1hJRFlLYmdjWVZPVEhYbmk4SWplYSIsImluaXRpYWxzIjoiVEMifQ	2026-03-18 06:39:40.416872+05:30	2026-03-18 01:49:03.137+05:30	2026-03-18 06:39:40.416872+05:30
\.


--
-- Name: Admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raj
--

SELECT pg_catalog.setval('public."Admins_id_seq"', 1, true);


--
-- Name: CartItems_pk_seq; Type: SEQUENCE SET; Schema: public; Owner: raj
--

SELECT pg_catalog.setval('public."CartItems_pk_seq"', 68, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raj
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 18, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raj
--

SELECT pg_catalog.setval('public."Products_id_seq"', 1, false);


--
-- Name: Admins Admins_email_key; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_email_key" UNIQUE (email);


--
-- Name: Admins Admins_email_key1; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_email_key1" UNIQUE (email);


--
-- Name: Admins Admins_email_key2; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_email_key2" UNIQUE (email);


--
-- Name: Admins Admins_email_key3; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_email_key3" UNIQUE (email);


--
-- Name: Admins Admins_pkey; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_pkey" PRIMARY KEY (id);


--
-- Name: Admins Admins_username_key; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_username_key" UNIQUE (username);


--
-- Name: Admins Admins_username_key1; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_username_key1" UNIQUE (username);


--
-- Name: Admins Admins_username_key2; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_username_key2" UNIQUE (username);


--
-- Name: Admins Admins_username_key3; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_username_key3" UNIQUE (username);


--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (pk);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: raj
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("clerkId");


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--



--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--



--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: raj
--



--
-- PostgreSQL database dump complete
--

\unrestrict 26Ak26yIS269yeY6Y9tbWK1aWJOAxhTvvL6JuqOnRLevO760cQSc1EQT4xvxTpp

