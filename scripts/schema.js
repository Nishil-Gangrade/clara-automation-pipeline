// scripts/schema.js

function createEmptyAccountMemo(accountId) {
  return {
    account_id: accountId,
    company_name: "",
    industry: "",
    crm_system: "",
    business_hours: {
      days: [],
      start_time: "",
      end_time: "",
      timezone: ""
    },
    office_address: "",
    services_supported: [],
    emergency_definition: [],
    emergency_routing_rules: {
      primary_contact: "",
      fallback_sequence: [],
      transfer_timeout_seconds: null
    },
    non_emergency_routing_rules: {
      screen_calls: true,
      preferred_numbers_bypass: []
    },
    call_transfer_rules: {
      screen_before_transfer: true,
      confirm_before_transfer: true,
      fallback_if_transfer_fails: ""
    },
    integration_constraints: [],
    after_hours_flow_summary: "",
    office_hours_flow_summary: "",
    questions_or_unknowns: [],
    notes: ""
  };
}

module.exports = {
  createEmptyAccountMemo
};