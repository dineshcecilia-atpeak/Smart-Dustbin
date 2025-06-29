async function handler() {
  try {
    const readings = await sql`
      SELECT * FROM bin_readings 
      ORDER BY timestamp DESC
    `;

    return { readings };
  } catch (error) {
    return { error: "Failed to fetch bin readings" };
  }
}