-- Independent Root & Rise records. No browser role may query this table directly.
create table public.rr_counsel_requests (
  id uuid primary key,
  owner_hash text not null check (owner_hash ~ '^[a-f0-9]{64}$'),
  reply_hash text not null check (reply_hash ~ '^[a-f0-9]{64}$'),
  source_hash text not null,
  plant_id text not null check (plant_id in ('albino-syngonium','prayer-plant','pothos','snake-plant','cactus','tiny-cactus','propagation-station','monstera')),
  request_text text not null check (char_length(request_text) between 1 and 7000),
  response_text text check (char_length(response_text) between 1 and 12000),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  answered_at timestamptz
);
alter table public.rr_counsel_requests enable row level security;
create policy "No direct browser access" on public.rr_counsel_requests for all to anon, authenticated using (false) with check (false);
revoke all on public.rr_counsel_requests from public, anon, authenticated;
grant select,insert,update,delete on public.rr_counsel_requests to service_role;
create index rr_counsel_owner_plant_date on public.rr_counsel_requests(owner_hash,plant_id,created_at desc);
create index rr_counsel_source_date on public.rr_counsel_requests(source_hash,created_at desc);
create index rr_counsel_created on public.rr_counsel_requests(created_at);

-- Invoker only: accessible solely to the Edge Function's service role.
create function public.rr_create_counsel(p_id uuid,p_owner text,p_reply text,p_source text,p_plant text,p_text text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare existing public.rr_counsel_requests;
begin
  perform pg_advisory_xact_lock(82741602);
  select * into existing from public.rr_counsel_requests where id=p_id;
  if found then
    if existing.owner_hash=p_owner and existing.reply_hash=p_reply and existing.plant_id=p_plant and existing.request_text=p_text then return p_id; end if;
    raise exception 'Request conflict';
  end if;
  if (select count(*) from public.rr_counsel_requests where created_at > now()-interval '1 day') >= 200
    or (select count(*) from public.rr_counsel_requests where owner_hash=p_owner and created_at > now()-interval '1 day') >= 20
    or (select count(*) from public.rr_counsel_requests where source_hash=p_source and created_at > now()-interval '1 day') >= 40 then
    raise exception 'Daily request limit';
  end if;
  insert into public.rr_counsel_requests(id,owner_hash,reply_hash,source_hash,plant_id,request_text)
  values(p_id,p_owner,p_reply,p_source,p_plant,p_text);
  return p_id;
end $$;
revoke all on function public.rr_create_counsel(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.rr_create_counsel(uuid,text,text,text,text,text) to service_role;
