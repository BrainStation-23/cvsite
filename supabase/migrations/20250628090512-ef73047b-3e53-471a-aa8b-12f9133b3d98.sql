
-- Create resource_types table for platform settings
CREATE TABLE public.resource_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on name to prevent duplicates
ALTER TABLE public.resource_types ADD CONSTRAINT resource_types_name_unique UNIQUE (name);

-- Create index for faster name lookups
CREATE INDEX idx_resource_types_name ON public.resource_types (name);
