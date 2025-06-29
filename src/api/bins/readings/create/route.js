async function handler({
  fillLevel,
  collectionStatus = "Normal",
  systemStatus = "All Systems Operational",
  timestamp = new Date().toISOString(),
}) {
  try {
    const reading = await sql`
      INSERT INTO bin_readings 
        (fill_level, timestamp, collection_status, system_status)
      VALUES 
        (${fillLevel}, ${timestamp}, ${collectionStatus}, ${systemStatus})
      RETURNING *
    `;

    return { reading: reading[0] };
  } catch (error) {
    return { error: "Failed to create bin reading" };
  }
}