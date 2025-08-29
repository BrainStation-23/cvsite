
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OdooEmployee {
  employeeId: string;
  name: string | null;
  workEmail : string | null;
  joiningDate: string | null;
  careerStartDate: string | null;
  dateOfBirth: string | null;
  sbu: {
    name: string;
  } | null;
  parent: {
    user: {
      email: string;
    };
  } | null;
}

interface OdooEmployeesResponse {
  data: {
    allEmployees: OdooEmployee[][];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Odoo employees sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const odooApiKey = Deno.env.get('ODOO_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GraphQL query to fetch employees from Odoo with new date fields
    const graphqlQuery = {
      query: `
        query AllEmployees {
          allEmployees {
            employeeId
            name
            workEmail
            joiningDate
            careerStartDate
            dateOfBirth
            sbu {
              name
            }
            parent {
              user {
                email
              }
            }
          }
        }
      `
    };

    console.log('Fetching employees from Odoo GraphQL API...');

    // Fetch employees from Odoo GraphQL API
    const odooResponse = await fetch('https://erp.brainstation-23.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': odooApiKey
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!odooResponse.ok) {
      throw new Error(`Odoo API request failed: ${odooResponse.status} ${odooResponse.statusText}`);
    }

    const odooData: OdooEmployeesResponse = await odooResponse.json();
    console.log(`Fetched ${odooData.data.allEmployees.length} employee records from Odoo`);

    // Flatten and pre-process the employee data
    const processedEmployees = odooData.data.allEmployees
      .flat() // Flatten the nested arrays
      .filter(employee => 
        employee.employeeId && 
        employee.user?.email // Only process employees with email
      )
      .map(employee => ({
        employeeId: employee.employeeId,
        email: employee.workEmail,
        name: employee.name || '',
        managerEmail: employee.parent?.user?.email || null,
        sbuName: employee.sbu?.name || null,
        joiningDate: employee.joiningDate || null,
        careerStartDate: employee.careerStartDate || null,
        dateOfBirth: employee.dateOfBirth || null
      }));

    console.log(`Pre-processed ${processedEmployees.length} valid employees, calling bulk sync function...`);

    // Call the bulk sync RPC function
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'bulk_sync_odoo_employees',
      { employees_data: processedEmployees }
    );

    if (syncError) {
      throw new Error(`Bulk sync function failed: ${syncError.message}`);
    }

    console.log('Bulk sync completed successfully:', syncResult);

    // Return the result from the RPC function
    return new Response(JSON.stringify({
      success: true,
      message: 'Employee sync completed successfully',
      stats: {
        total_fetched: odooData.data.allEmployees.flat().length,
        valid_employees: processedEmployees.length,
        ...syncResult.stats
      },
      not_found_employees: syncResult.not_found_employees || [],
      error_employees: syncResult.error_employees || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
