#!/bin/bash

# PHP Sync Script / PHP 同步脚本
# This script copies PHP code from production directory to GitHub repo and commits

# PHP 源代码目录（生产环境）
PHP_SOURCE="/var/www/web/myapp"
# GitHub 目录
GITHUB_DIR="/home/quqiufeng/my-ant-design-pro"
PHP_DEST="$GITHUB_DIR/php"

echo "=========================================="
echo "PHP Sync Script / PHP 同步脚本"
echo "=========================================="

# 检查源目录是否存在
if [ ! -d "$PHP_SOURCE" ]; then
    echo "Error: Source directory not found: $PHP_SOURCE"
    exit 1
fi

# 同步 PHP 代码（排除日志和临时文件）
echo "Syncing PHP code from $PHP_SOURCE to $PHP_DEST..."
rsync -av --exclude='*.log' --exclude='writable/' "$PHP_SOURCE/" "$PHP_DEST/"

# 进入 GitHub 目录
cd "$GITHUB_DIR"

# 检查是否有改动
if git diff --quiet php/ 2>/dev/null; then
    echo "No changes in PHP code, skipping commit."
    echo "=========================================="
    exit 0
fi

# 添加 PHP 目录到 git
git add php/

# 获取变更统计
PHP_FILES=$(git diff --cached --name-only | wc -l)
echo "Changed files: $PHP_FILES"

# 获取提交消息
COMMIT_MSG="Sync PHP code - $(date '+%Y-%m-%d %H:%M:%S')"
echo "Commit message: $COMMIT_MSG"

# 提交
git commit -m "$COMMIT_MSG"

# 推送到 GitHub
echo "Pushing to GitHub..."
git push origin main

echo "=========================================="
echo "PHP sync completed successfully!"
echo "=========================================="
