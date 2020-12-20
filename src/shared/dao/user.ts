import User from '../model/User';
import dynamodb from '../../dynamodb';

const userTable = 'InstallUser-MuscleApp';

export const putUser = async (user: User): Promise<void> => {
  try {
    await dynamodb.doc
      .put({
        TableName: userTable,
        Item: user,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserByKey = async (
  teamId: string,
  userId: string,
): Promise<User | undefined> => {
  const ret = await dynamodb.doc
    .get({
      TableName: userTable,
      Key: { teamId, userId },
      ConsistentRead: true,
    })
    .promise();
  return ret.Item as User | undefined;
};
