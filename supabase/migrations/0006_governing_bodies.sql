-- National governing bodies (one per World Archery member country), and the
-- club fields needed to link clubs to a governing body and review them.

create table public.governing_bodies (
  id uuid primary key default gen_random_uuid(),
  country text not null unique,
  country_code text,
  -- Display name. Defaults to the country name; can be edited later to the
  -- federation's actual brand (e.g. "Archery GB" for Great Britain).
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.governing_bodies enable row level security;

create policy "Governing bodies are viewable by everyone"
  on public.governing_bodies for select
  using (true);

insert into public.governing_bodies (country, country_code, name) values
  ('Albania', 'AL', 'Albania'),
  ('Algeria', 'DZ', 'Algeria'),
  ('Andorra', 'AD', 'Andorra'),
  ('Argentina', 'AR', 'Argentina'),
  ('Armenia', 'AM', 'Armenia'),
  ('American Samoa', 'AS', 'American Samoa'),
  ('Australia', 'AU', 'Australia'),
  ('Austria', 'AT', 'Austria'),
  ('Azerbaijan', 'AZ', 'Azerbaijan'),
  ('Bahamas', 'BS', 'Bahamas'),
  ('Bangladesh', 'BD', 'Bangladesh'),
  ('Barbados', 'BB', 'Barbados'),
  ('Belgium', 'BE', 'Belgium'),
  ('Benin', 'BJ', 'Benin'),
  ('Bermuda', 'BM', 'Bermuda'),
  ('Belarus', 'BY', 'Belarus'),
  ('Bhutan', 'BT', 'Bhutan'),
  ('Bosnia-Herzegovina', 'BA', 'Bosnia-Herzegovina'),
  ('Brazil', 'BR', 'Brazil'),
  ('British Virgin Islands', 'VG', 'British Virgin Islands'),
  ('Bulgaria', 'BG', 'Bulgaria'),
  ('Cameroon', 'CM', 'Cameroon'),
  ('Central African Republic', 'CF', 'Central African Republic'),
  ('Cambodia', 'KH', 'Cambodia'),
  ('Canada', 'CA', 'Canada'),
  ('Chad', 'TD', 'Chad'),
  ('Chile', 'CL', 'Chile'),
  ('China', 'CN', 'China'),
  ('Colombia', 'CO', 'Colombia'),
  ('Comoros', 'KM', 'Comoros'),
  ('Costa Rica', 'CR', 'Costa Rica'),
  ('Cote d''Ivoire', 'CI', 'Cote d''Ivoire'),
  ('Croatia', 'HR', 'Croatia'),
  ('Cuba', 'CU', 'Cuba'),
  ('Cyprus', 'CY', 'Cyprus'),
  ('Czech Republic', 'CZ', 'Czech Republic'),
  ('DR Congo', 'CD', 'DR Congo'),
  ('Denmark', 'DK', 'Denmark'),
  ('Dominica', 'DM', 'Dominica'),
  ('Dominican Republic', 'DO', 'Dominican Republic'),
  ('Ecuador', 'EC', 'Ecuador'),
  ('Egypt', 'EG', 'Egypt'),
  ('El Salvador', 'SV', 'El Salvador'),
  ('Eritrea', 'ER', 'Eritrea'),
  ('Estonia', 'EE', 'Estonia'),
  ('Falkland Islands', 'FK', 'Falkland Islands'),
  ('Faroe Islands', 'FO', 'Faroe Islands'),
  ('Fiji', 'FJ', 'Fiji'),
  ('Finland', 'FI', 'Finland'),
  ('France', 'FR', 'France'),
  ('Gabon', 'GA', 'Gabon'),
  ('Georgia', 'GE', 'Georgia'),
  ('Germany', 'DE', 'Germany'),
  ('Ghana', 'GH', 'Ghana'),
  ('Great Britain', 'GB', 'Great Britain'),
  ('Greece', 'GR', 'Greece'),
  ('Guatemala', 'GT', 'Guatemala'),
  ('Guinea', 'GN', 'Guinea'),
  ('Haiti', 'HT', 'Haiti'),
  ('Honduras', 'HN', 'Honduras'),
  ('Hong Kong (China)', 'HK', 'Hong Kong (China)'),
  ('Hungary', 'HU', 'Hungary'),
  ('Iceland', 'IS', 'Iceland'),
  ('India', 'IN', 'India'),
  ('Indonesia', 'ID', 'Indonesia'),
  ('Iran', 'IR', 'Iran'),
  ('Iraq', 'IQ', 'Iraq'),
  ('Ireland', 'IE', 'Ireland'),
  ('Israel', 'IL', 'Israel'),
  ('Italy', 'IT', 'Italy'),
  ('Japan', 'JP', 'Japan'),
  ('Kazakhstan', 'KZ', 'Kazakhstan'),
  ('Kenya', 'KE', 'Kenya'),
  ('Kiribati', 'KI', 'Kiribati'),
  ('Kosovo', 'XK', 'Kosovo'),
  ('Kuwait', 'KW', 'Kuwait'),
  ('Kyrgyzstan', 'KG', 'Kyrgyzstan'),
  ('Laos', 'LA', 'Laos'),
  ('Latvia', 'LV', 'Latvia'),
  ('Lebanon', 'LB', 'Lebanon'),
  ('Libya', 'LY', 'Libya'),
  ('Liechtenstein', 'LI', 'Liechtenstein'),
  ('Lithuania', 'LT', 'Lithuania'),
  ('Luxembourg', 'LU', 'Luxembourg'),
  ('Macau', 'MO', 'Macau'),
  ('Macedonia', 'MK', 'Macedonia'),
  ('Malawi', 'MW', 'Malawi'),
  ('Malaysia', 'MY', 'Malaysia'),
  ('Malta', 'MT', 'Malta'),
  ('Mauritania', 'MR', 'Mauritania'),
  ('Mauritius', 'MU', 'Mauritius'),
  ('Mexico', 'MX', 'Mexico'),
  ('Moldova', 'MD', 'Moldova'),
  ('Monaco', 'MC', 'Monaco'),
  ('Montenegro', 'ME', 'Montenegro'),
  ('Mongolia', 'MN', 'Mongolia'),
  ('Morocco', 'MA', 'Morocco'),
  ('Myanmar', 'MM', 'Myanmar'),
  ('Namibia', 'NA', 'Namibia'),
  ('Nepal', 'NP', 'Nepal'),
  ('Netherlands', 'NL', 'Netherlands'),
  ('New Zealand', 'NZ', 'New Zealand'),
  ('Nicaragua', 'NI', 'Nicaragua'),
  ('Niger', 'NE', 'Niger'),
  ('Nigeria', 'NG', 'Nigeria'),
  ('Norfolk Island', 'NF', 'Norfolk Island'),
  ('North Korea', 'KP', 'North Korea'),
  ('Norway', 'NO', 'Norway'),
  ('Pakistan', 'PK', 'Pakistan'),
  ('Palau', 'PW', 'Palau'),
  ('Panama', 'PA', 'Panama'),
  ('Papua New Guinea', 'PG', 'Papua New Guinea'),
  ('Paraguay', 'PY', 'Paraguay'),
  ('Peru', 'PE', 'Peru'),
  ('Philippines', 'PH', 'Philippines'),
  ('Poland', 'PL', 'Poland'),
  ('Portugal', 'PT', 'Portugal'),
  ('Puerto Rico', 'PR', 'Puerto Rico'),
  ('Qatar', 'QA', 'Qatar'),
  ('Romania', 'RO', 'Romania'),
  ('Russia', 'RU', 'Russia'),
  ('Rwanda', 'RW', 'Rwanda'),
  ('Saint Kitts and Nevis', 'KN', 'Saint Kitts and Nevis'),
  ('Samoa', 'WS', 'Samoa'),
  ('San Marino', 'SM', 'San Marino'),
  ('Saudi Arabia', 'SA', 'Saudi Arabia'),
  ('Senegal', 'SN', 'Senegal'),
  ('Serbia', 'RS', 'Serbia'),
  ('Sierra Leone', 'SL', 'Sierra Leone'),
  ('Singapore', 'SG', 'Singapore'),
  ('Slovakia', 'SK', 'Slovakia'),
  ('Slovenia', 'SI', 'Slovenia'),
  ('Somalia', 'SO', 'Somalia'),
  ('South Africa', 'ZA', 'South Africa'),
  ('South Korea', 'KR', 'South Korea'),
  ('Spain', 'ES', 'Spain'),
  ('Sri Lanka', 'LK', 'Sri Lanka'),
  ('Sudan', 'SD', 'Sudan'),
  ('Suriname', 'SR', 'Suriname'),
  ('Sweden', 'SE', 'Sweden'),
  ('Switzerland', 'CH', 'Switzerland'),
  ('Tahiti', 'PF', 'Tahiti'),
  ('Chinese Taipei (Taiwan)', 'TW', 'Chinese Taipei (Taiwan)'),
  ('Tajikistan', 'TJ', 'Tajikistan'),
  ('Thailand', 'TH', 'Thailand'),
  ('Togo', 'TG', 'Togo'),
  ('Tonga', 'TO', 'Tonga'),
  ('Trinidad and Tobago', 'TT', 'Trinidad and Tobago'),
  ('Tunisia', 'TN', 'Tunisia'),
  ('Turkey', 'TR', 'Turkey'),
  ('Uganda', 'UG', 'Uganda'),
  ('Ukraine', 'UA', 'Ukraine'),
  ('United States', 'US', 'United States'),
  ('Uruguay', 'UY', 'Uruguay'),
  ('Uzbekistan', 'UZ', 'Uzbekistan'),
  ('Vanuatu', 'VU', 'Vanuatu'),
  ('Venezuela', 'VE', 'Venezuela'),
  ('Vietnam', 'VN', 'Vietnam'),
  ('US Virgin Islands', 'VI', 'US Virgin Islands'),
  ('Zimbabwe', 'ZW', 'Zimbabwe');

-- Link clubs to a governing body and add the fields needed for the
-- claim/verification review flow.
alter table public.clubs
  add column governing_body_id uuid references public.governing_bodies (id),
  add column affiliation_number text,
  add column status text not null default 'pending' check (status in ('pending', 'verified', 'rejected'));

create index clubs_governing_body_id_idx on public.clubs (governing_body_id);

-- Grandfather in clubs that already existed before this verification flow.
update public.clubs set status = 'verified';

-- Platform admins can review and verify pending clubs.
alter table public.profiles
  add column platform_admin boolean not null default false;

create policy "Platform admins can update any club"
  on public.clubs for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and platform_admin
    )
  );
