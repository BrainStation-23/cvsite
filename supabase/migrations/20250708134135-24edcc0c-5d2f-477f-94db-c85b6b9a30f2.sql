
-- Remove resource_type_id column and add bill_type and engagement_start_date columns to resource_planning table
ALTER TABLE public.resource_planning 
DROP COLUMN IF EXISTS resource_type_id;

ALTER TABLE public.resource_planning 
ADD COLUMN bill_type_id uuid REFERENCES public.bill_types(id),
ADD COLUMN engagement_start_date date;
