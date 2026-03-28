import client from './client';

export const getMyTeams       = ()           => client.get('/api/teams');
export const getTeamById      = (id)         => client.get(`/api/teams/${id}`);
export const createTeam       = (data)       => client.post('/api/teams', data);
export const updateTeam       = (id, data)   => client.put(`/api/teams/${id}`, data);
export const deleteTeam       = (id)         => client.delete(`/api/teams/${id}`);
export const removeMember     = (teamId, userId) =>
    client.delete(`/api/teams/${teamId}/members/${userId}`);

// Invitations
export const inviteToTeam       = (teamId, data) => client.post(`/api/teams/${teamId}/invite`, data);
export const getTeamInvitations = (teamId)       => client.get(`/api/teams/${teamId}/invitations`);
export const getMyInvitations   = ()             => client.get('/api/invitations');
export const acceptInvitation   = (id)           => client.post(`/api/invitations/${id}/accept`);
export const declineInvitation  = (id)           => client.post(`/api/invitations/${id}/decline`);
