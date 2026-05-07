create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  role text not null check (role in ('admin', 'teacher', 'parent')),
  display_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_admin_profile
  on public.profiles ((role))
  where role = 'admin';

create table if not exists public.school_classes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  monthly_fee numeric(10,2) not null default 0 check (monthly_fee >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete restrict,
  parent_user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  parent_phone text not null,
  enrollment_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_classes (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.school_classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, class_id)
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token text unique not null,
  platform text default 'web',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.school_classes(id) on delete restrict,
  attendance_date date not null,
  session text not null check (session in ('Morning', 'Afternoon')),
  status text not null check (status in ('Present', 'Absent')),
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date, session)
);

create table if not exists public.fee_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  cycle_start date not null,
  amount numeric(10,2) not null default 0 check (amount >= 0),
  status text not null default 'Unpaid' check (status in ('Paid', 'Unpaid')),
  marked_paid_by uuid references public.profiles(id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, cycle_start)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete cascade,
  title text not null,
  subject text not null,
  drive_url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  type text not null,
  message text not null,
  fcm_status text not null default 'queued',
  fcm_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_students_class_id on public.students(class_id);
create index if not exists idx_students_parent_user_id on public.students(parent_user_id);
create index if not exists idx_attendance_date_class on public.attendance_logs(attendance_date, class_id);
create index if not exists idx_fee_records_status on public.fee_records(status);
create index if not exists idx_notes_class_id on public.notes(class_id);
create index if not exists idx_notifications_student_created on public.notifications(student_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.school_classes enable row level security;
alter table public.students enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.device_tokens enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.fee_records enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;
