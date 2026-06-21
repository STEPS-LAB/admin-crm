import { publicApiSuccess } from "@/lib/api/publicApiResponse";
import { getPublicApiHealth } from "@/services/publicApiService";

export async function GET(): Promise<Response> {
  const data = await getPublicApiHealth();
  return publicApiSuccess(data);
}
