-- Run this in your Supabase SQL Editor

-- Table: sessions (Stores active classroom sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at BIGINT NOT NULL
);

-- Table: submissions (Stores text/image items sent by students)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'image')),
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    timestamp BIGINT NOT NULL
);

-- Table: participants (Stores students who joined the session)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    joined_at BIGINT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Disable RLS policies temporarily for easy anonymous access, OR set them up properly
-- Note for Smart Board: since students join without an account, we need open INSERT policies for submissions/participants.
-- Hosts need to be able to create sessions and read all matching row data.

-- Sessions
DROP POLICY IF EXISTS "Anyone can read active sessions" ON public.sessions;
CREATE POLICY "Anyone can read active sessions" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create sessions" ON public.sessions;
CREATE POLICY "Authenticated users can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can update their sessions" ON public.sessions;
CREATE POLICY "Hosts can update their sessions" ON public.sessions FOR UPDATE USING (auth.uid() = host_id);

-- Submissions
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.submissions;
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read submissions" ON public.submissions;
CREATE POLICY "Anyone can read submissions" ON public.submissions FOR SELECT USING (true);

-- Participants
DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read participants" ON public.participants;
CREATE POLICY "Anyone can read participants" ON public.participants FOR SELECT USING (true);

-- Enable realtime broadcasts for the tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.participants;
