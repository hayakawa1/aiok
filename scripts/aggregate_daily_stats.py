#!/usr/bin/env python3
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import sys
import os

# プロジェクトのルートディレクトリをPYTHONPATHに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import DailyUserRequestStats, TotalUserRequestStats, db

def aggregate_daily_stats():
    """日次集計を実行する"""
    try:
        app = create_app()
        with app.app_context():
            # 昨日の日付を取得
            yesterday = (datetime.now(ZoneInfo('UTC')) - timedelta(days=1)).date()

            # 日次集計を実行
            DailyUserRequestStats.aggregate_daily_stats(yesterday)
            print(f'日次集計が完了しました: {yesterday}')

            # 総合計を更新
            # 既存の総合計をリセット
            db.session.query(TotalUserRequestStats).delete()
            
            # 全ての日次データを集計して総合計を作成
            daily_stats = db.session.query(
                DailyUserRequestStats.user_id,
                DailyUserRequestStats.role,
                DailyUserRequestStats.status,
                db.func.sum(DailyUserRequestStats.count).label('total_count'),
                db.func.sum(DailyUserRequestStats.total_amount).label('final_total_amount'),
                db.func.min(DailyUserRequestStats.created_at).label('first_occurrence'),
                db.func.max(DailyUserRequestStats.created_at).label('last_occurrence')
            ).group_by(
                DailyUserRequestStats.user_id,
                DailyUserRequestStats.role,
                DailyUserRequestStats.status
            ).all()

            # 新しい総合計レコードを作成
            for stats in daily_stats:
                total_stats = TotalUserRequestStats(
                    user_id=stats.user_id,
                    role=stats.role,
                    status=stats.status,
                    count=int(stats.total_count),  # 明示的に整数型に変換
                    total_amount=int(stats.final_total_amount),  # 明示的に整数型に変換
                    first_occurrence=stats.first_occurrence,
                    last_occurrence=stats.last_occurrence
                )
                db.session.add(total_stats)

            db.session.commit()
            print(f'総合計の更新が完了しました: {yesterday}')

    except Exception as e:
        print(f'集計処理でエラーが発生しました: {str(e)}')
        db.session.rollback()

if __name__ == '__main__':
    aggregate_daily_stats()
