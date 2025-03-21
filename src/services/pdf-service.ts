export async function getTextFromPDFService(url: string) {
  const PDF_SERVICE_URL =
    process.env.PDF_SERVICE_URL || "http://localhost:3001/api/v1/extract";

  try {
    console.log("Calling PDF service for:", url);
    const response = await fetch(PDF_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `PDF service error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    if (!data.success || !data.text) {
      throw new Error("PDF service returned an error");
    }

    console.log(`Successfully extracted ${data.textLength} characters of text`);
    return data.text;
  } catch (error) {
    console.error("PDF extraction service error:", error);
    return null;
  }
}
