export const subscribe = async (priceId: string) => {
  try {
    const response = await fetch(`/api/protected/subscription/${priceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.url) {
      throw new Error("Invalid response from subscription API");
    }

    window.location.assign(data.url);
  } catch (err) {
    throw new Error((err as Error).message);
  }
};
