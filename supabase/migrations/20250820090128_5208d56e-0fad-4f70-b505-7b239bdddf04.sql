
-- Add foreign key constraint between bill_types and resource_types
ALTER TABLE bill_types 
ADD CONSTRAINT fk_bill_types_resource_type 
FOREIGN KEY (resource_type) REFERENCES resource_types(id);

-- Create index for better query performance
CREATE INDEX idx_bill_types_resource_type ON bill_types(resource_type);
