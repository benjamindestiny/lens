export async function GET() {
  return Response.json({
    id: "demo-user",
    email: "student@example.com",
    plan: "free",
    usage: {
      documents_used: 1,
      documents_limit: 2,
      lessons_used: 3,
      lessons_limit: 5,
    },
  });
}
