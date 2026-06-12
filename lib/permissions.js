export const ROLES = ["member", "coach", "records_keeper", "chairman"];

export const ROLE_LABELS = {
  member: "Member",
  coach: "Coach",
  records_keeper: "Records keeper",
  chairman: "Chairman",
};

const PERMISSIONS = {
  manageMembers: ["chairman"],
  manageClubDetails: ["chairman"],
  manageRecords: ["chairman", "records_keeper"],
  manageTournaments: ["chairman", "records_keeper"],
};

export function can(role, permission) {
  return (PERMISSIONS[permission] ?? []).includes(role);
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}
