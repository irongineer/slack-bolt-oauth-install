import Workspace from '../model/Workspace';
import dynamodb from '../../dynamodb';

const workspaceTable = 'InstallWorkspace-MuscleApp';

export const putWorkspace = async (workspace: Workspace): Promise<void> => {
  try {
    await dynamodb.doc
      .put({
        TableName: workspaceTable,
        Item: workspace,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getWorkspaceByKey = async (
  teamId: string,
): Promise<Workspace | undefined> => {
  const ret = await dynamodb.doc
    .get({
      TableName: workspaceTable,
      Key: { teamId },
      ConsistentRead: true,
    })
    .promise();
  return ret.Item as Workspace | undefined;
};
