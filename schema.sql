--
-- PostgreSQL database dump
--

\restrict Y2GaRRnHNWVH2DPpwCOqg2nHia1EuCpufbm6tAGqDRFiT59ooCmdJ2sQgxHITsH

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assinatura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assinatura (
    plano character varying(20) DEFAULT 'gratuito'::character varying NOT NULL,
    alterado_em timestamp without time zone DEFAULT now() NOT NULL,
    empresa_id integer NOT NULL
);


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresas (
    id integer NOT NULL,
    nome character varying(150) NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: empresas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empresas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: empresas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empresas_id_seq OWNED BY public.empresas.id;


--
-- Name: movimentacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimentacoes (
    id integer NOT NULL,
    produto_id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(20) NOT NULL,
    quantidade integer NOT NULL,
    observacao character varying(255),
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    valor_total numeric(10,2),
    empresa_id integer NOT NULL,
    CONSTRAINT movimentacoes_quantidade_check CHECK ((quantidade > 0)),
    CONSTRAINT movimentacoes_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['entrada'::character varying, 'saida'::character varying])::text[])))
);


--
-- Name: movimentacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movimentacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movimentacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movimentacoes_id_seq OWNED BY public.movimentacoes.id;


--
-- Name: produtos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    nome character varying(150) NOT NULL,
    sku character varying(50) NOT NULL,
    categoria character varying(100) NOT NULL,
    quantidade integer DEFAULT 0 NOT NULL,
    preco numeric(10,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    estoque_minimo integer DEFAULT 5 NOT NULL,
    empresa_id integer NOT NULL,
    descricao text,
    unidade_medida character varying(20) DEFAULT 'un'::character varying NOT NULL,
    codigo_barras character varying(50),
    CONSTRAINT produtos_estoque_minimo_check CHECK ((estoque_minimo >= 0)),
    CONSTRAINT produtos_preco_check CHECK ((preco >= (0)::numeric)),
    CONSTRAINT produtos_quantidade_check CHECK ((quantidade >= 0))
);


--
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    perfil character varying(20) DEFAULT 'funcionario'::character varying NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    empresa_id integer NOT NULL,
    pode_cadastrar_produtos boolean DEFAULT false NOT NULL,
    codigo_recuperacao_hash text,
    codigo_recuperacao_expira_em timestamp with time zone,
    codigo_recuperacao_tentativas integer DEFAULT 0 NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: empresas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id SET DEFAULT nextval('public.empresas_id_seq'::regclass);


--
-- Name: movimentacoes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes ALTER COLUMN id SET DEFAULT nextval('public.movimentacoes_id_seq'::regclass);


--
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: assinatura assinatura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura
    ADD CONSTRAINT assinatura_pkey PRIMARY KEY (empresa_id);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: movimentacoes movimentacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_empresa_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_empresa_sku_key UNIQUE (empresa_id, sku);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: produtos_empresa_codigo_barras_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX produtos_empresa_codigo_barras_key ON public.produtos USING btree (empresa_id, codigo_barras) WHERE (codigo_barras IS NOT NULL);


--
-- Name: assinatura assinatura_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura
    ADD CONSTRAINT assinatura_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: movimentacoes movimentacoes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: movimentacoes movimentacoes_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: movimentacoes movimentacoes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: produtos produtos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: usuarios usuarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Y2GaRRnHNWVH2DPpwCOqg2nHia1EuCpufbm6tAGqDRFiT59ooCmdJ2sQgxHITsH

