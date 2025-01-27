import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export async function checkNSFW(input: string | Buffer): Promise<{
  isNSFW: boolean;
  details: {
    nudity: number;
    offensive: number;
    suggestive: number;
  };
  apiResponse: {
    status: string;
    nudity: {
      sexual_activity: number;
      sexual_display: number;
      erotica: number;
      very_suggestive: number;
      suggestive: number;
      none: number;
    };
    offensive: {
      prob: number;
    };
  };
}> {
  try {
    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      throw new Error('Sightengine credentials are not set in environment variables');
    }

    console.log('Using credentials:', {
      api_user: process.env.SIGHTENGINE_API_USER,
      api_secret: process.env.SIGHTENGINE_API_SECRET?.slice(0, 5) + '...',
    });

    let response;
    
    if (typeof input === 'string') {
      // URLの場合
      if (input.startsWith('http')) {
        response = await axios.get('https://api.sightengine.com/1.0/check.json', {
          params: {
            url: input,
            models: 'nudity-2.1,offensive',
            api_user: process.env.SIGHTENGINE_API_USER,
            api_secret: process.env.SIGHTENGINE_API_SECRET,
          }
        });
      } else {
        // ローカルファイルパスの場合
        const formData = new FormData();
        formData.append('media', fs.createReadStream(input));
        formData.append('models', 'nudity-2.1,offensive');
        formData.append('api_user', process.env.SIGHTENGINE_API_USER);
        formData.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

        response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
          headers: formData.getHeaders(),
        });
      }
    } else {
      // Bufferの場合
      const formData = new FormData();
      formData.append('media', input, { filename: 'image.jpg' });
      formData.append('models', 'nudity-2.1,offensive');
      formData.append('api_user', process.env.SIGHTENGINE_API_USER);
      formData.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

      response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
        headers: formData.getHeaders(),
      });
    }

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (response.data.status === 'failure') {
      throw new Error(`API Error: ${response.data.error.message}`);
    }

    const details = {
      nudity: 1 - (response.data.nudity.none || 0),
      offensive: response.data.offensive.prob || 0,
      suggestive: Math.max(
        response.data.nudity.suggestive || 0,
        response.data.nudity.erotica || 0,
        response.data.nudity.sexual_display || 0
      ),
    };

    // nudityが0.6以上、またはsuggestiveが0.7以上の場合にNSFWと判定
    const isNSFW = details.nudity >= 0.6 || details.suggestive >= 0.7;

    return {
      isNSFW,
      details,
      apiResponse: response.data
    };
  } catch (error) {
    console.error('Error checking NSFW content:', error);
    throw error;
  }
} 