import { SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";
import { GetServerSideProps, NextPage } from "next";
import { prisma } from "../../db";
import { UserInfoViewModel } from "../../models/UserInfoViewModel";
import { sqsClient } from "../../sqsClient";

interface ProfilePageProps {
  readonly userInfo: UserInfoViewModel;
}

interface VisitMessage {
    readonly UserProfileId: string;
	readonly VisitMetadata: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const profileId = params?.id!.toString().toLowerCase() ?? "";
  if (!profileId) return redirectNotFound();

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      username: profileId,
    },
  });
  if (!userProfile) return redirectNotFound();

  try {
      const visit: VisitMessage = { UserProfileId: userProfile.id, VisitMetadata: ''};
      console.log('Sending message');
      const messageResult: SendMessageCommandOutput = await sqsClient.send(new SendMessageCommand({ MessageBody: JSON.stringify(visit), QueueUrl: process.env.AWS_SQS_PROFILE_VISIT_QUEUE_URL}))
      console.log(`Sent message with id ${messageResult.MessageId}`);
  } catch(err) {
      console.error(err);
  }

  const userInfo: UserInfoViewModel = {
    id: userProfile.id,
    username: userProfile.username,
    email: userProfile.email,
    bio: userProfile.bio,
  };

  return {
    props: { userInfo },
  };
};

const redirectNotFound = () => ({
  redirect: {
    destination: "/404",
  },
  props: {},
});

const Profile: NextPage<ProfilePageProps> = ({ userInfo }) => {
  return <div>Hello {userInfo.username}</div>;
};

export default Profile;
