import { GetServerSideProps, NextPage } from "next";
import { prisma } from "../../db";

interface UserInfoViewModel {
    readonly id: string;
    readonly username: string;
    readonly email: string;
    readonly bio: string | null;
}

interface ProfilePageProps {
    readonly statusCode: number;
    readonly userInfo: UserInfoViewModel;
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const profileId = params?.id!.toString().toLowerCase() ?? "";
  let statusCode = 200;
  if (!profileId) {
    return {
        redirect: {
          destination: '/404',
        },
        props: {},
      };
  }
  const userProfile = await prisma.userProfile.findUnique({
    where: {
      username: profileId,
    },
  });
  if (!userProfile) {
    return {
        redirect: {
          destination: '/404',
        },
        props: {},
      };
  }
  const userInfo: UserInfoViewModel = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      bio: userProfile.bio
  };

  console.log(userInfo)

  return {
    props: { userInfo, statusCode },
  };
};

const Profile: NextPage<ProfilePageProps> = ({ userInfo }) => {
  return <div>Hello {userInfo.username}</div>;
};

export default Profile;
