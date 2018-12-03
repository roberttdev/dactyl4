--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Name: get_ancestry(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_ancestry(root_id integer) RETURNS TABLE(id integer, parent_id integer, name character varying, extension character varying)
    LANGUAGE sql
    AS $_$
      WITH RECURSIVE ancestry(id, parent_id, name, extension) AS (
        SELECT id, parent_id, name, extension
        FROM groups
        WHERE id = $1
        UNION ALL
        SELECT C.id, C.parent_id, C.name, C.extension
        FROM ancestry P
        INNER JOIN groups C on P.parent_id = C.id
      )

      SELECT * from ancestry ORDER BY id ASC
      $_$;


--
-- Name: get_descendants(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_descendants(group_id integer) RETURNS TABLE(group_id integer)
    LANGUAGE sql
    AS $_$
        WITH RECURSIVE descendants(group_id) AS (
          SELECT id AS group_id
          FROM groups
          WHERE id=$1
          UNION ALL
          SELECT id AS group_id
          FROM descendants D
          INNER JOIN groups G on G.parent_id = D.group_id
        )

      SELECT * from descendants ORDER BY group_id ASC
      $_$;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE accounts (
    id integer NOT NULL,
    first_name character varying(40),
    last_name character varying(40),
    email character varying(100),
    hashed_password character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    identities hstore,
    language character varying(3),
    document_language character varying(3),
    disabled boolean
);


--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE accounts_id_seq OWNED BY accounts.id;


--
-- Name: annotation_notes; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE annotation_notes (
    id integer NOT NULL,
    document_id integer,
    note text,
    addressed boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    group_id integer,
    iteration integer,
    annotation_id integer
);


--
-- Name: annotation_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE annotation_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: annotation_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE annotation_notes_id_seq OWNED BY annotation_notes.id;


--
-- Name: annotations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE annotations (
    id integer NOT NULL,
    organization_id integer,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    access integer,
    title text NOT NULL,
    content text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    moderation_approval boolean,
    templated boolean DEFAULT false,
    iteration integer,
    match_id integer,
    match_strength integer,
    is_graph_data boolean,
    highlight_id integer,
    group_id integer,
    qa_approved_by integer,
    based_on integer
);


--
-- Name: annotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE annotations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: annotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE annotations_id_seq OWNED BY annotations.id;


--
-- Name: app_constants; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE app_constants (
    id integer NOT NULL,
    key character varying(255),
    value character varying(255)
);


--
-- Name: app_constants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE app_constants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_constants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE app_constants_id_seq OWNED BY app_constants.id;


--
-- Name: collaborations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE collaborations (
    id integer NOT NULL,
    project_id integer NOT NULL,
    account_id integer NOT NULL,
    creator_id integer
);


--
-- Name: collaborations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE collaborations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collaborations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE collaborations_id_seq OWNED BY collaborations.id;


--
-- Name: docdata; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE docdata (
    id integer NOT NULL,
    document_id integer NOT NULL,
    data hstore
);


--
-- Name: docdata_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE docdata_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: docdata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE docdata_id_seq OWNED BY docdata.id;


--
-- Name: document_reviewers; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE document_reviewers (
    id integer NOT NULL,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: document_reviewers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE document_reviewers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_reviewers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE document_reviewers_id_seq OWNED BY document_reviewers.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE documents (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    access integer NOT NULL,
    page_count integer DEFAULT 0 NOT NULL,
    title character varying(1000) NOT NULL,
    slug character varying(255) NOT NULL,
    source character varying(1000),
    language character varying(3),
    description text,
    calais_id character varying(40),
    publication_date date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    related_article text,
    detected_remote_url text,
    remote_url text,
    publish_at timestamp without time zone,
    text_changed boolean DEFAULT false NOT NULL,
    hit_count integer DEFAULT 0 NOT NULL,
    public_note_count integer DEFAULT 0 NOT NULL,
    reviewer_count integer DEFAULT 0 NOT NULL,
    file_size integer DEFAULT 0 NOT NULL,
    char_count integer DEFAULT 0 NOT NULL,
    original_extension character varying(255),
    file_hash text,
    study text,
    status integer,
    de_one_id integer,
    de_two_id integer,
    qc_id integer,
    qa_id integer,
    de_one_complete boolean,
    de_two_complete boolean,
    qa_note text,
    iteration integer,
    repository_id integer
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE documents_id_seq OWNED BY documents.id;


--
-- Name: entities; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE entities (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    access integer NOT NULL,
    kind character varying(40) NOT NULL,
    value character varying(255) NOT NULL,
    relevance double precision DEFAULT 0.0 NOT NULL,
    calais_id character varying(40),
    occurrences text
);


--
-- Name: entities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE entities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE entities_id_seq OWNED BY entities.id;


--
-- Name: entity_dates; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE entity_dates (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    access integer NOT NULL,
    date date NOT NULL,
    occurrences text
);


--
-- Name: entity_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE entity_dates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE entity_dates_id_seq OWNED BY entity_dates.id;


--
-- Name: featured_reports; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE featured_reports (
    id integer NOT NULL,
    url character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    organization character varying(255) NOT NULL,
    article_date date NOT NULL,
    writeup text NOT NULL,
    present_order integer DEFAULT 0,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: featured_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE featured_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: featured_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE featured_reports_id_seq OWNED BY featured_reports.id;


--
-- Name: file_status_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE file_status_histories (
    id integer NOT NULL,
    status integer NOT NULL,
    "user" integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: file_status_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE file_status_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_status_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE file_status_histories_id_seq OWNED BY file_status_histories.id;


--
-- Name: graphs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE graphs (
    id integer NOT NULL,
    document_id integer,
    graph_json text,
    iteration integer,
    account_id integer,
    highlight_id integer,
    group_id integer,
    created_by integer,
    based_on integer
);


--
-- Name: graphs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE graphs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: graphs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE graphs_id_seq OWNED BY graphs.id;


--
-- Name: group_templates; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE group_templates (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    help_url text
);


--
-- Name: group_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE group_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE group_templates_id_seq OWNED BY group_templates.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE groups (
    id integer NOT NULL,
    name text NOT NULL,
    parent_id integer,
    template_id integer,
    document_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    extension text,
    account_id integer,
    base boolean DEFAULT false,
    iteration integer,
    qa_approved_by integer,
    canon boolean,
    is_graph_data boolean
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE groups_id_seq OWNED BY groups.id;


--
-- Name: highlights; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE highlights (
    id integer NOT NULL,
    document_id integer,
    location text,
    page_number integer,
    image_link text
);


--
-- Name: highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE highlights_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE highlights_id_seq OWNED BY highlights.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE memberships (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    role integer NOT NULL,
    "default" boolean DEFAULT false,
    concealed boolean DEFAULT false
);


--
-- Name: memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE memberships_id_seq OWNED BY memberships.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE organizations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    demo boolean DEFAULT false NOT NULL,
    language character varying(3),
    document_language character varying(3)
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE organizations_id_seq OWNED BY organizations.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE pages (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    access integer NOT NULL,
    page_number integer NOT NULL,
    text text NOT NULL,
    start_offset integer,
    end_offset integer
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE pages_id_seq OWNED BY pages.id;


--
-- Name: pending_memberships; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE pending_memberships (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    organization_name character varying(255) NOT NULL,
    usage character varying(255) NOT NULL,
    editor character varying(255),
    website character varying(255),
    validated boolean DEFAULT false NOT NULL,
    notes text,
    organization_id integer,
    fields hstore,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: pending_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE pending_memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pending_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE pending_memberships_id_seq OWNED BY pending_memberships.id;


--
-- Name: processing_jobs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE processing_jobs (
    id integer NOT NULL,
    account_id integer NOT NULL,
    cloud_crowd_id integer NOT NULL,
    title character varying(255) NOT NULL,
    document_id integer
);


--
-- Name: processing_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE processing_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: processing_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE processing_jobs_id_seq OWNED BY processing_jobs.id;


--
-- Name: project_memberships; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE project_memberships (
    id integer NOT NULL,
    project_id integer NOT NULL,
    document_id integer NOT NULL
);


--
-- Name: project_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE project_memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE project_memberships_id_seq OWNED BY project_memberships.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE projects (
    id integer NOT NULL,
    account_id integer,
    title character varying(255),
    description text,
    hidden boolean DEFAULT false NOT NULL
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE projects_id_seq OWNED BY projects.id;


--
-- Name: remote_urls; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE remote_urls (
    id integer NOT NULL,
    document_id integer NOT NULL,
    url character varying(255) NOT NULL,
    hits integer DEFAULT 0 NOT NULL
);


--
-- Name: remote_urls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE remote_urls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: remote_urls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE remote_urls_id_seq OWNED BY remote_urls.id;


--
-- Name: repositories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE repositories (
    id integer NOT NULL,
    repo_name character varying(255),
    disabled boolean
);


--
-- Name: repositories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE repositories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: repositories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE repositories_id_seq OWNED BY repositories.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE reviews (
    id integer NOT NULL,
    document_id integer,
    qc_id integer,
    de_one_id integer,
    de_one_rating integer,
    de_two_id integer,
    de_two_rating integer,
    qc_note text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    qa_id integer,
    qc_rating integer,
    iteration integer,
    qa_note text
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reviews_id_seq OWNED BY reviews.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: sections; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE sections (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    account_id integer NOT NULL,
    document_id integer NOT NULL,
    title text NOT NULL,
    page_number integer NOT NULL,
    access integer NOT NULL
);


--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE sections_id_seq OWNED BY sections.id;


--
-- Name: security_keys; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE security_keys (
    id integer NOT NULL,
    securable_type character varying(40) NOT NULL,
    securable_id integer NOT NULL,
    key character varying(40)
);


--
-- Name: security_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE security_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: security_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE security_keys_id_seq OWNED BY security_keys.id;


--
-- Name: subtemplate_fields; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE subtemplate_fields (
    id integer NOT NULL,
    subtemplate_id integer NOT NULL,
    field_id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: subtemplate_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE subtemplate_fields_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtemplate_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE subtemplate_fields_id_seq OWNED BY subtemplate_fields.id;


--
-- Name: subtemplates; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE subtemplates (
    id integer NOT NULL,
    template_id integer NOT NULL,
    sub_name text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: subtemplates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE subtemplates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtemplates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE subtemplates_id_seq OWNED BY subtemplates.id;


--
-- Name: template_fields; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE template_fields (
    id integer NOT NULL,
    template_id integer NOT NULL,
    field_name text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: template_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE template_fields_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: template_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE template_fields_id_seq OWNED BY template_fields.id;


--
-- Name: view_only_accesses; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE view_only_accesses (
    id integer NOT NULL,
    document_id integer,
    account_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: view_only_accesses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE view_only_accesses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: view_only_accesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE view_only_accesses_id_seq OWNED BY view_only_accesses.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY accounts ALTER COLUMN id SET DEFAULT nextval('accounts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY annotation_notes ALTER COLUMN id SET DEFAULT nextval('annotation_notes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY annotations ALTER COLUMN id SET DEFAULT nextval('annotations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY app_constants ALTER COLUMN id SET DEFAULT nextval('app_constants_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY collaborations ALTER COLUMN id SET DEFAULT nextval('collaborations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY docdata ALTER COLUMN id SET DEFAULT nextval('docdata_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_reviewers ALTER COLUMN id SET DEFAULT nextval('document_reviewers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents ALTER COLUMN id SET DEFAULT nextval('documents_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY entities ALTER COLUMN id SET DEFAULT nextval('entities_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY entity_dates ALTER COLUMN id SET DEFAULT nextval('entity_dates_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY featured_reports ALTER COLUMN id SET DEFAULT nextval('featured_reports_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY file_status_histories ALTER COLUMN id SET DEFAULT nextval('file_status_histories_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY graphs ALTER COLUMN id SET DEFAULT nextval('graphs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY group_templates ALTER COLUMN id SET DEFAULT nextval('group_templates_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY groups ALTER COLUMN id SET DEFAULT nextval('groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY highlights ALTER COLUMN id SET DEFAULT nextval('highlights_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships ALTER COLUMN id SET DEFAULT nextval('memberships_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN id SET DEFAULT nextval('organizations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY pages ALTER COLUMN id SET DEFAULT nextval('pages_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY pending_memberships ALTER COLUMN id SET DEFAULT nextval('pending_memberships_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY processing_jobs ALTER COLUMN id SET DEFAULT nextval('processing_jobs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY project_memberships ALTER COLUMN id SET DEFAULT nextval('project_memberships_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY remote_urls ALTER COLUMN id SET DEFAULT nextval('remote_urls_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY repositories ALTER COLUMN id SET DEFAULT nextval('repositories_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reviews ALTER COLUMN id SET DEFAULT nextval('reviews_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY sections ALTER COLUMN id SET DEFAULT nextval('sections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY security_keys ALTER COLUMN id SET DEFAULT nextval('security_keys_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY subtemplate_fields ALTER COLUMN id SET DEFAULT nextval('subtemplate_fields_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY subtemplates ALTER COLUMN id SET DEFAULT nextval('subtemplates_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY template_fields ALTER COLUMN id SET DEFAULT nextval('template_fields_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY view_only_accesses ALTER COLUMN id SET DEFAULT nextval('view_only_accesses_id_seq'::regclass);


--
-- Name: accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: annotation_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY annotation_notes
    ADD CONSTRAINT annotation_notes_pkey PRIMARY KEY (id);


--
-- Name: annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY annotations
    ADD CONSTRAINT annotations_pkey PRIMARY KEY (id);


--
-- Name: app_constants_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY app_constants
    ADD CONSTRAINT app_constants_pkey PRIMARY KEY (id);


--
-- Name: collaborations_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY collaborations
    ADD CONSTRAINT collaborations_pkey PRIMARY KEY (id);


--
-- Name: docdata_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY docdata
    ADD CONSTRAINT docdata_pkey PRIMARY KEY (id);


--
-- Name: document_reviewers_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY document_reviewers
    ADD CONSTRAINT document_reviewers_pkey PRIMARY KEY (id);


--
-- Name: documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: entities_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: entity_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY entity_dates
    ADD CONSTRAINT entity_dates_pkey PRIMARY KEY (id);


--
-- Name: featured_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY featured_reports
    ADD CONSTRAINT featured_reports_pkey PRIMARY KEY (id);


--
-- Name: file_status_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY file_status_histories
    ADD CONSTRAINT file_status_histories_pkey PRIMARY KEY (id);


--
-- Name: graphs_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY graphs
    ADD CONSTRAINT graphs_pkey PRIMARY KEY (id);


--
-- Name: group_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY group_templates
    ADD CONSTRAINT group_templates_pkey PRIMARY KEY (id);


--
-- Name: groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY highlights
    ADD CONSTRAINT highlights_pkey PRIMARY KEY (id);


--
-- Name: memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pending_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY pending_memberships
    ADD CONSTRAINT pending_memberships_pkey PRIMARY KEY (id);


--
-- Name: processing_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY processing_jobs
    ADD CONSTRAINT processing_jobs_pkey PRIMARY KEY (id);


--
-- Name: project_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY project_memberships
    ADD CONSTRAINT project_memberships_pkey PRIMARY KEY (id);


--
-- Name: projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: qc_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY reviews
    ADD CONSTRAINT qc_reviews_pkey PRIMARY KEY (id);


--
-- Name: remote_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY remote_urls
    ADD CONSTRAINT remote_urls_pkey PRIMARY KEY (id);


--
-- Name: repositories_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY repositories
    ADD CONSTRAINT repositories_pkey PRIMARY KEY (id);


--
-- Name: sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: security_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY security_keys
    ADD CONSTRAINT security_keys_pkey PRIMARY KEY (id);


--
-- Name: subtemplate_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY subtemplate_fields
    ADD CONSTRAINT subtemplate_fields_pkey PRIMARY KEY (id);


--
-- Name: subtemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY subtemplates
    ADD CONSTRAINT subtemplates_pkey PRIMARY KEY (id);


--
-- Name: template_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY template_fields
    ADD CONSTRAINT template_fields_pkey PRIMARY KEY (id);


--
-- Name: view_only_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY view_only_accesses
    ADD CONSTRAINT view_only_accesses_pkey PRIMARY KEY (id);


--
-- Name: foo2; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX foo2 ON documents USING btree (organization_id);


--
-- Name: index_accounts_on_email; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX index_accounts_on_email ON accounts USING btree (email);


--
-- Name: index_accounts_on_identites; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_accounts_on_identites ON accounts USING gin (identities);


--
-- Name: index_annotations_on_document_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_annotations_on_document_id ON annotations USING btree (document_id);


--
-- Name: index_docdata_on_data; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_docdata_on_data ON docdata USING gin (data);


--
-- Name: index_documents_on_access; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_documents_on_access ON documents USING btree (access);


--
-- Name: index_documents_on_account_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_documents_on_account_id ON documents USING btree (account_id);


--
-- Name: index_documents_on_file_hash; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_documents_on_file_hash ON documents USING btree (file_hash);


--
-- Name: index_documents_on_hit_count; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_documents_on_hit_count ON documents USING btree (hit_count);


--
-- Name: index_documents_on_public_note_count; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_documents_on_public_note_count ON documents USING btree (public_note_count);


--
-- Name: index_group_document; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_group_document ON groups USING btree (document_id);


--
-- Name: index_labels_on_account_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_labels_on_account_id ON projects USING btree (account_id);


--
-- Name: index_memberships_on_account_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_memberships_on_account_id ON memberships USING btree (account_id);


--
-- Name: index_memberships_on_organization_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_memberships_on_organization_id ON memberships USING btree (organization_id);


--
-- Name: index_metadata_dates_on_document_id_and_date; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX index_metadata_dates_on_document_id_and_date ON entity_dates USING btree (document_id, date);


--
-- Name: index_metadata_on_document_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_metadata_on_document_id ON entities USING btree (document_id);


--
-- Name: index_metadata_on_kind; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_metadata_on_kind ON entities USING btree (kind);


--
-- Name: index_organizations_on_name; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX index_organizations_on_name ON organizations USING btree (name);


--
-- Name: index_organizations_on_slug; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX index_organizations_on_slug ON organizations USING btree (slug);


--
-- Name: index_pages_on_document_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_pages_on_document_id ON pages USING btree (document_id);


--
-- Name: index_pages_on_page_number; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_pages_on_page_number ON pages USING btree (page_number);


--
-- Name: index_pages_on_start_offset_and_end_offset; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_pages_on_start_offset_and_end_offset ON pages USING btree (start_offset, end_offset);


--
-- Name: index_parent_group; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_parent_group ON groups USING btree (parent_id);


--
-- Name: index_processing_jobs_on_account_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_processing_jobs_on_account_id ON processing_jobs USING btree (account_id);


--
-- Name: index_project_memberships_on_document_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_project_memberships_on_document_id ON project_memberships USING btree (document_id);


--
-- Name: index_project_memberships_on_project_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_project_memberships_on_project_id ON project_memberships USING btree (project_id);


--
-- Name: index_sections_on_document_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_sections_on_document_id ON sections USING btree (document_id);


--
-- Name: index_status; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_status ON documents USING btree (status);


--
-- Name: index_template_used; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_template_used ON groups USING btree (template_id);


--
-- Name: unique_schema_migrations; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX unique_schema_migrations ON schema_migrations USING btree (version);


--
-- PostgreSQL database dump complete
--

SET search_path TO public;

INSERT INTO schema_migrations (version) VALUES ('1');

INSERT INTO schema_migrations (version) VALUES ('20100108163304');

INSERT INTO schema_migrations (version) VALUES ('20100108172251');

INSERT INTO schema_migrations (version) VALUES ('20100109025746');

INSERT INTO schema_migrations (version) VALUES ('20100109035508');

INSERT INTO schema_migrations (version) VALUES ('20100112143144');

INSERT INTO schema_migrations (version) VALUES ('20100114170350');

INSERT INTO schema_migrations (version) VALUES ('20100120194128');

INSERT INTO schema_migrations (version) VALUES ('20100120205426');

INSERT INTO schema_migrations (version) VALUES ('20100125165305');

INSERT INTO schema_migrations (version) VALUES ('20100208131000');

INSERT INTO schema_migrations (version) VALUES ('20100208151651');

INSERT INTO schema_migrations (version) VALUES ('20100212130932');

INSERT INTO schema_migrations (version) VALUES ('20100218193708');

INSERT INTO schema_migrations (version) VALUES ('20100219175757');

INSERT INTO schema_migrations (version) VALUES ('20100301200857');

INSERT INTO schema_migrations (version) VALUES ('20100304154343');

INSERT INTO schema_migrations (version) VALUES ('20100316001441');

INSERT INTO schema_migrations (version) VALUES ('20100317145034');

INSERT INTO schema_migrations (version) VALUES ('20100317181051');

INSERT INTO schema_migrations (version) VALUES ('20100401192921');

INSERT INTO schema_migrations (version) VALUES ('20100413132825');

INSERT INTO schema_migrations (version) VALUES ('20100607182008');

INSERT INTO schema_migrations (version) VALUES ('20100624142442');

INSERT INTO schema_migrations (version) VALUES ('20100625143140');

INSERT INTO schema_migrations (version) VALUES ('20100630131224');

INSERT INTO schema_migrations (version) VALUES ('20100701132413');

INSERT INTO schema_migrations (version) VALUES ('20100823172339');

INSERT INTO schema_migrations (version) VALUES ('20100928204710');

INSERT INTO schema_migrations (version) VALUES ('20101025202334');

INSERT INTO schema_migrations (version) VALUES ('20101028194006');

INSERT INTO schema_migrations (version) VALUES ('20101101192020');

INSERT INTO schema_migrations (version) VALUES ('20101103173409');

INSERT INTO schema_migrations (version) VALUES ('20101110170100');

INSERT INTO schema_migrations (version) VALUES ('20101207203607');

INSERT INTO schema_migrations (version) VALUES ('20101209175540');

INSERT INTO schema_migrations (version) VALUES ('20101214171909');

INSERT INTO schema_migrations (version) VALUES ('20110111192934');

INSERT INTO schema_migrations (version) VALUES ('20110113204915');

INSERT INTO schema_migrations (version) VALUES ('20110114143536');

INSERT INTO schema_migrations (version) VALUES ('20110207212034');

INSERT INTO schema_migrations (version) VALUES ('20110216180521');

INSERT INTO schema_migrations (version) VALUES ('20110217161649');

INSERT INTO schema_migrations (version) VALUES ('20110217171353');

INSERT INTO schema_migrations (version) VALUES ('20110224153154');

INSERT INTO schema_migrations (version) VALUES ('20110303200824');

INSERT INTO schema_migrations (version) VALUES ('20110303202721');

INSERT INTO schema_migrations (version) VALUES ('20110304213500');

INSERT INTO schema_migrations (version) VALUES ('20110308170707');

INSERT INTO schema_migrations (version) VALUES ('20110310000919');

INSERT INTO schema_migrations (version) VALUES ('20110429150927');

INSERT INTO schema_migrations (version) VALUES ('20110502200512');

INSERT INTO schema_migrations (version) VALUES ('20110505172648');

INSERT INTO schema_migrations (version) VALUES ('20110512193718');

INSERT INTO schema_migrations (version) VALUES ('20110603223356');

INSERT INTO schema_migrations (version) VALUES ('20111026200513');

INSERT INTO schema_migrations (version) VALUES ('20120131180323');

INSERT INTO schema_migrations (version) VALUES ('20120927202457');

INSERT INTO schema_migrations (version) VALUES ('20121108160450');

INSERT INTO schema_migrations (version) VALUES ('20130107193641');

INSERT INTO schema_migrations (version) VALUES ('20130108201748');

INSERT INTO schema_migrations (version) VALUES ('20130109194211');

INSERT INTO schema_migrations (version) VALUES ('20130327170939');

INSERT INTO schema_migrations (version) VALUES ('20130716200416');

INSERT INTO schema_migrations (version) VALUES ('20140226151713');

INSERT INTO schema_migrations (version) VALUES ('20140301191427');

INSERT INTO schema_migrations (version) VALUES ('20140301191704');

INSERT INTO schema_migrations (version) VALUES ('20140301192243');

INSERT INTO schema_migrations (version) VALUES ('20140301192400');

INSERT INTO schema_migrations (version) VALUES ('20140417132052');

INSERT INTO schema_migrations (version) VALUES ('20140417171446');

INSERT INTO schema_migrations (version) VALUES ('20140429184510');

INSERT INTO schema_migrations (version) VALUES ('20140430200314');

INSERT INTO schema_migrations (version) VALUES ('20140604213826');

INSERT INTO schema_migrations (version) VALUES ('20140604220150');

INSERT INTO schema_migrations (version) VALUES ('20140605190022');

INSERT INTO schema_migrations (version) VALUES ('20140701175538');

INSERT INTO schema_migrations (version) VALUES ('20140704154025');

INSERT INTO schema_migrations (version) VALUES ('20140730203154');

INSERT INTO schema_migrations (version) VALUES ('20140813163126');

INSERT INTO schema_migrations (version) VALUES ('20140814194013');

INSERT INTO schema_migrations (version) VALUES ('20140904170250');

INSERT INTO schema_migrations (version) VALUES ('20140905183032');

INSERT INTO schema_migrations (version) VALUES ('20140911183140');

INSERT INTO schema_migrations (version) VALUES ('20140911185636');

INSERT INTO schema_migrations (version) VALUES ('20140919173300');

INSERT INTO schema_migrations (version) VALUES ('20140925203205');

INSERT INTO schema_migrations (version) VALUES ('20140929133607');

INSERT INTO schema_migrations (version) VALUES ('20141010155400');

INSERT INTO schema_migrations (version) VALUES ('20141010180742');

INSERT INTO schema_migrations (version) VALUES ('20141014200020');

INSERT INTO schema_migrations (version) VALUES ('20150107191612');

INSERT INTO schema_migrations (version) VALUES ('20150325205011');

INSERT INTO schema_migrations (version) VALUES ('20150429175735');

INSERT INTO schema_migrations (version) VALUES ('20150529205731');

INSERT INTO schema_migrations (version) VALUES ('20150609172330');

INSERT INTO schema_migrations (version) VALUES ('20150708200432');

INSERT INTO schema_migrations (version) VALUES ('20150716201936');

INSERT INTO schema_migrations (version) VALUES ('20160615194758');

INSERT INTO schema_migrations (version) VALUES ('20160624200630');

INSERT INTO schema_migrations (version) VALUES ('20160816190855');

INSERT INTO schema_migrations (version) VALUES ('20161013165748');

INSERT INTO schema_migrations (version) VALUES ('20180209200510');

INSERT INTO schema_migrations (version) VALUES ('20180607144042');

INSERT INTO schema_migrations (version) VALUES ('20180628170547');

INSERT INTO schema_migrations (version) VALUES ('20180813125257');

INSERT INTO schema_migrations (version) VALUES ('20181011194517');

