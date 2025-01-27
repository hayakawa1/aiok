import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// 環境変数を最初に読み込む
config({ path: path.resolve(process.cwd(), '.env') });

import { checkNSFW } from './nsfw';

async function generateHTML() {
  try {
    const folderPath = path.resolve(process.cwd(), 'testimg');
    const files = fs.readdirSync(folderPath);
    
    // HTMLのヘッダー部分
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>NSFW Check Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .image-cell { width: 200px; }
        .image-cell img { max-width: 200px; max-height: 200px; object-fit: contain; }
        .score-cell { width: 80px; }
      </style>
    </head>
    <body>
      <h1>NSFW Check Results</h1>
      <table>
        <tr>
          <th>File Name</th>
          <th>Sexual Activity</th>
          <th>Sexual Display</th>
          <th>Erotica</th>
          <th>Very Suggestive</th>
          <th>Suggestive</th>
          <th>Offensive</th>
          <th>None</th>
          <th>Image</th>
        </tr>
    `;

    // すべての画像をチェック
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        const filePath = path.join(folderPath, file);
        const result = await checkNSFW(filePath);
        const response = result.apiResponse;

        // 各画像の結果を行として追加
        html += `
        <tr>
          <td>${file}</td>
          <td class="score-cell">${response.nudity.sexual_activity.toFixed(3)}</td>
          <td class="score-cell">${response.nudity.sexual_display.toFixed(3)}</td>
          <td class="score-cell">${response.nudity.erotica.toFixed(3)}</td>
          <td class="score-cell">${response.nudity.very_suggestive.toFixed(3)}</td>
          <td class="score-cell">${response.nudity.suggestive.toFixed(3)}</td>
          <td class="score-cell">${response.offensive.prob.toFixed(3)}</td>
          <td class="score-cell">${response.nudity.none.toFixed(3)}</td>
          <td class="image-cell"><img src="${file}" alt="${file}"></td>
        </tr>
        `;
      }
    }

    // HTMLのフッター部分
    html += `
      </table>
    </body>
    </html>
    `;

    // HTMLファイルを保存
    const outputPath = path.join(folderPath, 'results.html');
    fs.writeFileSync(outputPath, html);
    console.log(`結果を${outputPath}に保存しました`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// HTMLを生成
generateHTML();

jest.mock('axios');
jest.mock('fs');

describe('checkNSFW', () => {
  beforeEach(() => {
    // 環境変数の設定
    process.env.SIGHTENGINE_API_USER = 'test-user';
    process.env.SIGHTENGINE_API_SECRET = 'test-secret';

    // モックのリセット
    jest.clearAllMocks();

    // axiosのモック設定
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'success',
        nudity: {
          sexual_activity: 0.1,
          sexual_display: 0.1,
          erotica: 0.1,
          very_suggestive: 0.1,
          suggestive: 0.1,
          none: 0.9
        },
        offensive: {
          prob: 0.1
        }
      }
    });

    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        status: 'success',
        nudity: {
          sexual_activity: 0.1,
          sexual_display: 0.1,
          erotica: 0.1,
          very_suggestive: 0.1,
          suggestive: 0.1,
          none: 0.9
        },
        offensive: {
          prob: 0.1
        }
      }
    });
  });

  test('URLを使用して正常にチェックできる', async () => {
    const result = await checkNSFW('https://example.com/image.jpg');

    expect(axios.get).toHaveBeenCalled();
    expect(result.isNSFW).toBe(false);
    expect(result.details).toEqual({
      nudity: expect.any(Number),
      offensive: 0.1,
      suggestive: 0.1
    });
  });

  test('ローカルファイルを使用して正常にチェックできる', async () => {
    (fs.createReadStream as jest.Mock).mockReturnValue('mock-stream');

    const result = await checkNSFW('./test.jpg');

    expect(axios.post).toHaveBeenCalled();
    expect(result.isNSFW).toBe(false);
    expect(result.details).toEqual({
      nudity: expect.any(Number),
      offensive: 0.1,
      suggestive: 0.1
    });
  });

  test('NSFWコンテンツを検出できる', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'success',
        nudity: {
          sexual_activity: 0.8,
          sexual_display: 0.8,
          erotica: 0.8,
          very_suggestive: 0.8,
          suggestive: 0.8,
          none: 0.1
        },
        offensive: {
          prob: 0.8
        }
      }
    });

    const result = await checkNSFW('https://example.com/nsfw.jpg');

    expect(result.isNSFW).toBe(true);
    expect(result.details.nudity).toBeGreaterThan(0.6);
  });

  test('APIエラーの場合は例外を投げる', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'failure',
        error: {
          message: 'API Error'
        }
      }
    });

    await expect(checkNSFW('https://example.com/error.jpg')).rejects.toThrow('API Error');
  });

  test('認証情報が設定されていない場合は例外を投げる', async () => {
    process.env.SIGHTENGINE_API_USER = '';
    process.env.SIGHTENGINE_API_SECRET = '';

    await expect(checkNSFW('https://example.com/image.jpg')).rejects.toThrow('Sightengine credentials are not set in environment variables');
  });
}); 