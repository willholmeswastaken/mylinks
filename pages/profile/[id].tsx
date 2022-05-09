import { GetServerSideProps, NextPage } from "next";
import { prisma } from "../../db";
import { UserInfoViewModel } from "../../models/UserInfoViewModel";

interface ProfilePageProps {
  readonly userInfo: UserInfoViewModel;
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const profileId = params?.id!.toString().toLowerCase() ?? "";
  if (!profileId) return redirectNotFound();

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      username: profileId,
    },
  });
  if (!userProfile) return redirectNotFound();

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
