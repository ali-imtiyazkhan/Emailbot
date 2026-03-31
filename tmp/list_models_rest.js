import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    console.log("Supported Models:");
    response.data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (err) {
    console.error("Error fetching models:", err.response?.data || err.message);
  }
}

checkModels();
