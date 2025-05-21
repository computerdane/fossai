create table if not exists person (
    id bigint primary key generated always as identity,
    created_at timestamp not null default now(),
    active boolean not null default false,
    first_name text not null,
    email text unique not null,
    login_code numeric(6, 0),
    login_code_expires_at timestamp not null default now()
);

create table if not exists chat (
    id bigint primary key generated always as identity,
    person_id bigint not null references person(id),
    created_at timestamp not null default now(),
    title text not null
);

do $$ begin
    create type message_role as enum ('user', 'assistant');
exception
    when duplicate_object then null;
end $$;

create table if not exists message (
    id bigint primary key generated always as identity,
    chat_id bigint not null references chat(id),
    created_at timestamp not null default now(),
    role message_role not null,
    model text,
    content text not null
);

create table if not exists refresh_token (
    id bigint primary key generated always as identity,
    person_id bigint not null references person(id),
    expires_at timestamp not null default now()
);
