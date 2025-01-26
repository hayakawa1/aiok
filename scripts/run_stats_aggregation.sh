#!/bin/bash
cd /var/www/aiok
source venv/bin/activate
python scripts/aggregate_daily_stats.py
