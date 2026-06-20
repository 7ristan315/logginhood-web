-- Classification thresholds stored in DB so records keepers can update them
-- without a code deploy. thresholds[] maps to LBL = [IA3,IA2,IA1,IB3,IB2,IB1,IMB,IGMB]
-- NULL in the array means that classification is not available for that combination.

CREATE TABLE IF NOT EXISTS classification_thresholds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bow_type     text NOT NULL,    -- 'Recurve','Compound','Barebow','Longbow'
  age_category text NOT NULL,    -- 'Senior','50+','U18','U16','U15','U14','U12'
  gender       text NOT NULL,    -- 'men','women'
  round_name   text NOT NULL,
  thresholds   integer[] NOT NULL, -- 8 values [IA3,IA2,IA1,IB3,IB2,IB1,IMB,IGMB]
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bow_type, age_category, gender, round_name)
);

ALTER TABLE classification_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read"   ON classification_thresholds FOR SELECT USING (true);
CREATE POLICY "auth_write"    ON classification_thresholds FOR ALL USING (auth.role() = 'authenticated');

-- Seed from classification.js
INSERT INTO classification_thresholds (bow_type, age_category, gender, round_name, thresholds) VALUES
  -- RECURVE Senior men
  ('Recurve','Senior','men','Portsmouth',          ARRAY[378,437,483,518,546,566,582,593]),
  ('Recurve','Senior','men','Bray I',              ARRAY[134,172,205,232,252,268,280,289]),
  ('Recurve','Senior','men','Bray II',             ARRAY[156,191,221,243,260,274,284,292]),
  ('Recurve','Senior','men','WA 18m',              ARRAY[272,347,413,466,506,537,560,578]),
  ('Recurve','Senior','men','WA 25m',              ARRAY[283,357,420,470,508,538,561,578]),
  ('Recurve','Senior','men','Stafford',            ARRAY[368,453,523,578,620,653,678,697]),
  ('Recurve','Senior','men','Vegas (Triple Face)', ARRAY[181,263,357,442,501,537,560,578]),
  ('Recurve','Senior','men','Vegas 300',           ARRAY[134,172,205,232,252,268,280,289]),
  ('Recurve','Senior','men','Worcester',           ARRAY[149,188,221,247,267,282,293,299]),
  -- RECURVE Senior women
  ('Recurve','Senior','women','Portsmouth',          ARRAY[331,399,454,496,528,553,572,586]),
  ('Recurve','Senior','women','Bray I',              ARRAY[108,146,183,215,239,258,272,283]),
  ('Recurve','Senior','women','Bray II',             ARRAY[131,168,202,229,249,265,278,287]),
  ('Recurve','Senior','women','WA 18m',              ARRAY[221,297,371,432,480,517,545,567]),
  ('Recurve','Senior','women','WA 25m',              ARRAY[232,308,380,438,484,519,546,567]),
  ('Recurve','Senior','women','Stafford',            ARRAY[307,397,478,543,594,632,662,685]),
  ('Recurve','Senior','women','Vegas (Triple Face)', ARRAY[137,206,294,387,465,515,545,567]),
  ('Recurve','Senior','women','Vegas 300',           ARRAY[108,146,183,215,239,258,272,283]),
  ('Recurve','Senior','women','Worcester',           ARRAY[122,162,200,231,255,273,286,296]),
  -- RECURVE 50+ men
  ('Recurve','50+','men','Portsmouth', ARRAY[316,387,444,488,522,549,569,583]),
  ('Recurve','50+','men','Bray I',     ARRAY[101,139,176,209,235,254,270,281]),
  ('Recurve','50+','men','WA 18m',     ARRAY[206,282,357,421,472,511,540,563]),
  ('Recurve','50+','men','Worcester',  ARRAY[114,154,193,225,250,270,284,294]),
  -- RECURVE 50+ women
  ('Recurve','50+','women','Portsmouth', ARRAY[265,341,407,460,501,532,556,574]),
  ('Recurve','50+','women','Bray I',     ARRAY[79,113,152,188,218,242,260,274]),
  ('Recurve','50+','women','WA 18m',     ARRAY[162,231,308,380,439,486,521,549]),
  ('Recurve','50+','women','Worcester',  ARRAY[90,128,168,205,234,257,275,288]),
  -- RECURVE U18 men
  ('Recurve','U18','men','Portsmouth', ARRAY[250,326,395,450,493,526,552,571]),
  ('Recurve','U18','men','Bray I',     ARRAY[73,106,144,181,213,238,257,271]),
  ('Recurve','U18','men','WA 18m',     ARRAY[149,216,292,366,429,477,515,544]),
  ('Recurve','U18','men','Worcester',  ARRAY[84,120,160,198,229,253,272,286]),
  -- RECURVE U18 women
  ('Recurve','U18','women','Portsmouth', ARRAY[201,276,350,415,466,505,536,559]),
  ('Recurve','U18','women','Bray I',     ARRAY[55,83,118,157,192,222,244,262]),
  ('Recurve','U18','women','WA 18m',     ARRAY[113,170,241,318,389,446,491,525]),
  ('Recurve','U18','women','Worcester',  ARRAY[64,95,133,173,209,238,260,277]),
  -- RECURVE U16
  ('Recurve','U16','men','Portsmouth',  ARRAY[187,260,336,403,457,498,530,555]),
  ('Recurve','U16','men','WA 18m',      ARRAY[104,157,226,302,375,436,483,519]),
  ('Recurve','U16','women','Portsmouth',ARRAY[145,211,286,360,423,472,510,539]),
  ('Recurve','U16','women','WA 18m',    ARRAY[77,120,179,251,328,397,453,496]),
  -- RECURVE U15
  ('Recurve','U15','men',  'Portsmouth',ARRAY[134,196,271,346,411,463,503,534]),
  ('Recurve','U15','women','Portsmouth',ARRAY[134,196,271,346,411,463,503,534]),
  -- RECURVE U14
  ('Recurve','U14','men',  'Portsmouth',ARRAY[92,141,206,281,355,419,469,508]),
  ('Recurve','U14','women','Portsmouth',ARRAY[92,141,206,281,355,419,469,508]),
  -- RECURVE U12
  ('Recurve','U12','men',  'Portsmouth',ARRAY[62,98,149,215,291,364,426,475]),
  ('Recurve','U12','women','Portsmouth',ARRAY[62,98,149,215,291,364,426,475]),

  -- COMPOUND Senior men
  ('Compound','Senior','men','Portsmouth', ARRAY[472,508,532,549,560,571,583,594]),
  ('Compound','Senior','men','Bray I',     ARRAY[200,228,248,263,273,280,286,292]),
  ('Compound','Senior','men','WA 18m',     ARRAY[403,458,498,527,546,560,571,583]),
  ('Compound','Senior','men','Vegas 300',  ARRAY[201,230,252,269,281,290,297,300]),
  ('Compound','Senior','men','Worcester',  ARRAY[217,246,267,283,294,300,NULL,NULL]::integer[]),
  -- COMPOUND Senior women
  ('Compound','Senior','women','Portsmouth', ARRAY[449,491,521,541,555,566,577,589]),
  ('Compound','Senior','women','Bray I',     ARRAY[182,215,239,256,268,277,283,289]),
  ('Compound','Senior','women','WA 18m',     ARRAY[369,432,480,514,538,553,565,577]),
  ('Compound','Senior','women','Vegas 300',  ARRAY[183,216,242,261,275,286,294,299]),
  ('Compound','Senior','women','Worcester',  ARRAY[200,233,257,276,289,298,NULL,NULL]::integer[]),
  -- COMPOUND 50+ men
  ('Compound','50+','men','Portsmouth', ARRAY[437,482,515,537,552,563,574,586]),
  ('Compound','50+','men','WA 18m',     ARRAY[350,418,469,507,533,550,563,574]),
  ('Compound','50+','men','Vegas 300',  ARRAY[174,209,236,257,272,284,292,298]),
  -- COMPOUND 50+ women
  ('Compound','50+','women','Portsmouth', ARRAY[408,461,500,527,545,558,568,580]),
  ('Compound','50+','women','WA 18m',     ARRAY[311,386,446,490,521,542,557,568]),
  ('Compound','50+','women','Vegas 300',  ARRAY[154,192,223,247,265,278,288,295]),
  -- COMPOUND U18
  ('Compound','U18','men',  'Portsmouth', ARRAY[400,450,490,518,538,554,567,578]),
  ('Compound','U18','women','Portsmouth', ARRAY[360,415,460,495,520,540,556,568]),

  -- BAREBOW Senior men
  ('Barebow','Senior','men','Portsmouth', ARRAY[331,387,433,472,503,528,549,565]),
  ('Barebow','Senior','men','Bray I',     ARRAY[108,139,169,197,220,239,254,267]),
  ('Barebow','Senior','men','WA 18m',     ARRAY[221,282,343,397,443,480,511,535]),
  ('Barebow','Senior','men','Vegas 300',  ARRAY[108,139,169,197,220,239,254,267]),
  ('Barebow','Senior','men','Worcester',  ARRAY[122,154,186,213,236,255,270,281]),
  -- BAREBOW Senior women
  ('Barebow','Senior','women','Portsmouth', ARRAY[276,336,391,437,475,505,530,550]),
  ('Barebow','Senior','women','Bray I',     ARRAY[83,111,141,172,199,222,240,256]),
  ('Barebow','Senior','women','WA 18m',     ARRAY[170,226,287,347,401,446,483,513]),
  ('Barebow','Senior','women','Worcester',  ARRAY[95,125,157,188,215,238,256,271]),
  -- BAREBOW 50+ men
  ('Barebow','50+','men','Portsmouth', ARRAY[276,336,391,437,475,505,530,550]),
  ('Barebow','50+','men','WA 18m',     ARRAY[170,226,287,347,401,446,483,513]),
  -- BAREBOW 50+ women
  ('Barebow','50+','women','Portsmouth', ARRAY[220,281,341,395,440,477,508,532]),
  ('Barebow','50+','women','WA 18m',     ARRAY[127,174,231,292,352,405,450,486]),
  -- BAREBOW U18
  ('Barebow','U18','men',  'Portsmouth', ARRAY[200,270,340,400,450,490,522,548]),
  ('Barebow','U18','women','Portsmouth', ARRAY[160,225,295,360,415,460,497,525]),

  -- LONGBOW Senior men
  ('Longbow','Senior','men','Portsmouth', ARRAY[127,178,240,306,369,423,466,501]),
  ('Longbow','Senior','men','Bray I',     ARRAY[32,48,69,96,128,162,192,218]),
  ('Longbow','Senior','men','WA 18m',     ARRAY[66,98,142,197,261,328,389,439]),
  ('Longbow','Senior','men','Worcester',  ARRAY[38,55,79,109,144,178,209,234]),
  -- LONGBOW Senior women
  ('Longbow','Senior','women','Portsmouth', ARRAY[84,123,174,235,301,364,419,463]),
  ('Longbow','Senior','women','Bray I',     ARRAY[21,31,47,67,94,126,159,190]),
  ('Longbow','Senior','women','WA 18m',     ARRAY[43,64,95,138,192,256,323,384]),
  ('Longbow','Senior','women','Worcester',  ARRAY[24,36,54,77,107,141,176,207]),
  -- LONGBOW 50+ men
  ('Longbow','50+','men','Portsmouth', ARRAY[90,130,183,245,311,373,426,469]),
  ('Longbow','50+','men','WA 18m',     ARRAY[46,68,101,145,202,266,333,393]),
  -- LONGBOW 50+ women
  ('Longbow','50+','women','Portsmouth', ARRAY[58,87,127,178,240,306,369,423]),
  ('Longbow','50+','women','WA 18m',     ARRAY[29,44,66,98,142,197,261,328]),
  -- LONGBOW U18
  ('Longbow','U18','men',  'Portsmouth', ARRAY[80,120,170,230,295,358,413,458]),
  ('Longbow','U18','women','Portsmouth', ARRAY[55,85,125,175,235,300,360,415])

ON CONFLICT (bow_type, age_category, gender, round_name)
  DO UPDATE SET thresholds = EXCLUDED.thresholds, updated_at = now();
