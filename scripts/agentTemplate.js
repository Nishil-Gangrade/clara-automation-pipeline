// scripts/agentTemplate.js

function createAgentSpec(accountMemo, version) {
  const {
    account_id,
    business_hours,
    emergency_routing_rules
  } = accountMemo;

  const agentName = `${account_id}_retell_agent_${version}`;

  const systemPrompt = `
You are a professional AI call agent for ${accountMemo.company_name || "a service business"}.

You must follow structured routing logic.

-------------------------
BUSINESS HOURS FLOW
-------------------------
1. Greet the caller professionally.
2. Ask for the purpose of the call.
3. Collect caller name and phone number.
4. Determine if request is emergency or non-emergency.
5. If routing is required, initiate transfer.
6. If transfer fails:
   - Inform caller politely.
   - Assure follow-up.
7. Confirm next steps clearly.
8. Ask: "Is there anything else I can help you with today?"
9. Close the call professionally.

-------------------------
AFTER HOURS FLOW
-------------------------
1. Greet the caller.
2. Ask for purpose of the call.
3. Confirm whether it is an emergency.
4. If emergency:
   - Immediately collect name.
   - Collect phone number.
   - Collect service address.
   - Attempt transfer.
   - If transfer fails:
       Apologize and assure urgent follow-up.
5. If non-emergency:
   - Collect necessary details.
   - Inform caller follow-up will occur during business hours.
6. Ask: "Is there anything else I can assist you with?"
7. Close the call politely.

Rules:
- Do not mention internal tools.
- Do not mention system logic.
- Only collect necessary information.
- Keep responses clear and professional.
`;

  return {
    agent_name: agentName,
    version: version,
    voice_style: "Professional and calm",
    key_variables: {
      timezone: business_hours.timezone,
      business_days: business_hours.days,
      start_time: business_hours.start_time,
      end_time: business_hours.end_time,
      emergency_primary_contact: emergency_routing_rules.primary_contact
    },
    call_transfer_protocol: {
      transfer_timeout_seconds:
        emergency_routing_rules.transfer_timeout_seconds || 60,
      fallback_message:
        "We are unable to complete the transfer at this moment. Our team will follow up shortly."
    },
    fallback_protocol: {
      apology_required: true,
      confirm_callback_number: true
    },
    system_prompt: systemPrompt
  };
}

module.exports = { createAgentSpec };