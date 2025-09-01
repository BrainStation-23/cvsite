
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting weekly score card calculation...')

    // Get current date and calculate the week range
    const currentDate = new Date()
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    console.log(`Calculating for week: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`)

    // Create a CTE to get prioritized resource planning entries (one per employee)
    const prioritizedResourcesQuery = `
      WITH prioritized_resources AS (
        SELECT 
          rp.*,
          bt.name as bill_type_name,
          bt.is_billable,
          bt.non_billed,
          bt.is_support,
          ROW_NUMBER() OVER (
            PARTITION BY rp.profile_id 
            ORDER BY bt.is_billable DESC, rp.billing_percentage DESC NULLS LAST
          ) as priority_rank
        FROM resource_planning rp
        LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
        WHERE rp.engagement_complete = false
      )
      SELECT * FROM prioritized_resources WHERE priority_rank = 1
    `

    const { data: prioritizedResources, error: resourceError } = await supabaseClient
      .rpc('execute_sql', { query: prioritizedResourcesQuery })

    if (resourceError) {
      console.error('Error fetching prioritized resources:', resourceError)
      throw resourceError
    }

    console.log(`Found ${prioritizedResources?.length || 0} unique active resources`)

    // Calculate counts based on prioritized resources
    let billedCount = 0
    let nonBilledCount = 0
    let supportCount = 0
    
    const nonBilledDistribution: { [key: string]: number } = {}
    const billableDistribution: { [key: string]: number } = {}
    const supportDistribution: { [key: string]: number } = {}

    prioritizedResources?.forEach((resource: any) => {
      const billTypeName = resource.bill_type_name || 'Unknown'
      
      if (resource.is_support) {
        supportCount++
        supportDistribution[billTypeName] = (supportDistribution[billTypeName] || 0) + 1
      } else if (resource.is_billable) {
        billedCount++
        billableDistribution[billTypeName] = (billableDistribution[billTypeName] || 0) + 1
      } else if (resource.non_billed) {
        nonBilledCount++
        nonBilledDistribution[billTypeName] = (nonBilledDistribution[billTypeName] || 0) + 1
      }
    })

    // Calculate utilization rate
    const totalResources = billedCount + nonBilledCount + supportCount
    const utilizationRate = totalResources > 0 ? billedCount / totalResources : 0

    console.log(`Calculated counts - Billed: ${billedCount}, Non-billed: ${nonBilledCount}, Support: ${supportCount}`)
    console.log(`Utilization rate: ${utilizationRate}`)

    // Convert distributions to arrays
    const nonBilledDistributionArray = Object.entries(nonBilledDistribution).map(([bill_type_name, count]) => ({
      bill_type_name,
      count
    }))

    const billableDistributionArray = Object.entries(billableDistribution).map(([bill_type_name, count]) => ({
      bill_type_name,
      count
    }))

    const supportDistributionArray = Object.entries(supportDistribution).map(([bill_type_name, count]) => ({
      bill_type_name,
      count
    }))

    // Create the JSONB record
    const jsonbRecord = {
      timestamp: currentDate.toISOString(),
      non_billed_distribution: nonBilledDistributionArray,
      billable_distribution: billableDistributionArray,
      support_distribution: supportDistributionArray
    }

    // Insert the weekly score card record
    const { data: insertData, error: insertError } = await supabaseClient
      .from('weekly_score_card')
      .insert({
        timestamp: currentDate.toISOString(),
        billed_count: billedCount,
        non_billed_count: nonBilledCount,
        utilization_rate: utilizationRate,
        jsonb_record: jsonbRecord
      })
      .select()

    if (insertError) {
      console.error('Error inserting weekly score card:', insertError)
      throw insertError
    }

    console.log('Weekly score card calculation completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: insertData,
        message: 'Weekly score card calculated and stored successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in calculate-weekly-score-card:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
