export async function GET(_request: Request) {
  return new Response("Hello, this is the posts API endpoint!");
}

export async function POST(_request: Request) {
  return new Response("Post created successfully!");
}
