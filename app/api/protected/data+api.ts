import { withAuth } from "@/utils/middleware";

const mockDate = {
  secretMessage: "This is protected date",
  timestamp: new Date().toISOString(),
};

export const GET = withAuth(async (req, user) => {
  return Response.json({
    data: mockDate,
    user: {
      name: user.name,
      email: user.email,
    },
  });
});
