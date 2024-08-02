// these are mapped types from the API
export type User = {
  email: string;
  firstName?: string;
  lastName?: string;
  permissions?: UserPermissions; // if no permissions, they don't have an org
  picture?: string;
  disabled: false;
  super_admin: boolean;
}

export type UserPermissions = {
  organizationId?: string;
  id: string;
  role: string; // TODO: make this an enum
}

// API user response
// const example = {
//   "email": "string",
//   "first_name": "string",
//   "last_name": "string",
//   "disabled": true,
//   "permissions": {
//     "organization_id": "string",
//     "user_id": "string",
//     "disabled": false,
//     "role": "admin",
//     "id": "string",
//     "created_at": "2024-07-30T14:11:01.740Z",
//     "created_by_id": "string",
//     "modified_at": "2024-07-30T14:11:01.740Z",
//     "modified_by_id": "string",
//     "deleted_at": "2024-07-30T14:11:01.740Z",
//     "deleted_by_id": "string"
//   },
//   "title": "string",
//   "team": "string",
//   "phone": "string",
//   "location": "string",
//   "timezone": "string",
//   "bio": "string",
//   "picture": "string",
//   "id": "string",
//   "created_at": "2024-07-30T14:11:01.740Z",
//   "created_by_id": "string",
//   "modified_at": "2024-07-30T14:11:01.740Z",
//   "modified_by_id": "string",
//   "deleted_at": "2024-07-30T14:11:01.740Z",
//   "deleted_by_id": "string",
//   "super_admin": false
// }
