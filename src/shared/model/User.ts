import { Installation } from '@slack/bolt';

export const scopes = ['users.profile:write']; // Specify Slack user scopes to request when users install your app.
export type Scopes = typeof scopes[number];

export default interface User {
  teamId: string;
  userId: string;
  tenantId: string;
  sub: string;
  token: string;
  scopes: Scopes[];
}

interface UserInstallation {
  id: string;
  token: string;
  scopes: string[];
}

interface BuildPutUserParams {
  tenantId: string;
  sub: string;
  installation: Installation;
}

export const buildPutUserParams = ({
  tenantId,
  sub,
  installation,
}: BuildPutUserParams): User => {
  const teamId = installation.team?.id;
  const userId = installation.user.id;
  if (!teamId) {
    throw new Error('Not support Org installation!');
  }
  return {
    teamId,
    userId,
    tenantId,
    sub,
    token: installation.user?.token || '',
    scopes: installation.user?.scopes || [],
  };
};

export const buildUserInstallation = ({
  userId,
  token,
  scopes,
}: User): UserInstallation => {
  return { id: userId, token, scopes };
};
