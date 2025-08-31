import { BASE_URL } from "@/constants";

export interface League {
  id: string;
  name: string;
  code: string;
  image: string;
  memberCount: number;
  status: "active" | "inactive";
  role: string;
  joinedAt: string;
}

export async function fetchUserLeagues(fetchWithAuth: (url: string, options: RequestInit) => Promise<Response>): Promise<League[]> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/leagues/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch leagues");
    }

    const data = await response.json();
    return data.leagues || [];
  } catch (error) {
    console.error("Error fetching user leagues:", error);
    throw error;
  }
}