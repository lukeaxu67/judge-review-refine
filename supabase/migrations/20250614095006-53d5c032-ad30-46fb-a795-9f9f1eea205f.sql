
-- 创建标注数据表
CREATE TABLE public.annotation_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 任务标识
  taskhash TEXT NOT NULL,
  filename TEXT NOT NULL,
  dimension TEXT NOT NULL,
  case_id INTEGER NOT NULL,
  
  -- 用户标识
  fingerprint TEXT NOT NULL,
  account TEXT,
  
  -- 时间戳
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- 被评测对象1
  target1 JSONB,
  target1_other01 TEXT,
  target1_other02 TEXT,
  target1_other03 TEXT,
  target1_other04 TEXT,
  target1_other05 TEXT,
  target1_other06 TEXT,
  target1_other07 TEXT,
  target1_other08 TEXT,
  target1_other09 TEXT,
  target1_other10 TEXT,
  
  -- 被评测对象2
  target2 JSONB,
  target2_other01 TEXT,
  target2_other02 TEXT,
  target2_other03 TEXT,
  target2_other04 TEXT,
  target2_other05 TEXT,
  target2_other06 TEXT,
  target2_other07 TEXT,
  target2_other08 TEXT,
  target2_other09 TEXT,
  target2_other10 TEXT,
  
  -- LLM判断结果
  llm_judgement TEXT,
  llm_reasoning TEXT,
  llm_other01 TEXT,
  llm_other02 TEXT,
  llm_other03 TEXT,
  llm_other04 TEXT,
  llm_other05 TEXT,
  llm_other06 TEXT,
  llm_other07 TEXT,
  llm_other08 TEXT,
  llm_other09 TEXT,
  llm_other10 TEXT,
  
  -- 人类专家操作
  human_action TEXT CHECK (human_action IN ('Skip', 'Agree', 'Disagree')),
  human_judgement TEXT,
  human_reasoning TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX idx_annotation_data_taskhash ON public.annotation_data(taskhash);
CREATE INDEX idx_annotation_data_fingerprint ON public.annotation_data(fingerprint);
CREATE INDEX idx_annotation_data_filename ON public.annotation_data(filename);
CREATE INDEX idx_annotation_data_timestamp ON public.annotation_data(timestamp);

-- 由于没有账号体系，暂时不启用 RLS，所有数据公开可访问
-- ALTER TABLE public.annotation_data ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（由于使用浏览器指纹而非用户认证）
-- CREATE POLICY "Allow all access to annotation_data" 
--   ON public.annotation_data 
--   FOR ALL 
--   USING (true);
