
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Designation {
  id: string;
  name: string;
}

export const useDesignations = () => {
  return useQuery({
    queryKey: ["designations"],
    queryFn: async (): Promise<Designation[]> => {
      const { data, error } = await supabase
        .from("designations")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching designations:", error);
        throw error;
      }

      // Ensure we return an array of objects with id and name properties
      return data || [];
    },
  });
};
