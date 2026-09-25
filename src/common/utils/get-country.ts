import axios from "axios";

export async function getCountry(ip: string): Promise<string> {
  try {
    const result = await axios.get(
      `https://ipapi.co/${ip}/json/`
    );

    return result.data.country_code;
  } catch (error) {
    throw error;
  }
}