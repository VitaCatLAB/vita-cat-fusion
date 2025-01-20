#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

# 进度条函数
show_progress() {
    local message=$1
    local progress_bar_length=50
    printf "${YELLOW}%s" "$message"
    for ((i=0; i<=progress_bar_length; i++)); do
        sleep 0.1
        printf "█"
    done
    printf "${NC}\n"
}

# 设置默认参数
compress_dist=true

# 处理脚本参数
if [ "$1" == "--compress-contents" ]; then
    compress_dist=false
fi

# 设置环境变量
export NODE_ENV=production
export NODE_OPTIONS=--max-old-space-size=8192

# 执行构建
show_progress "正在构建项目..."
pnpm vite build

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败!${NC}"
    exit 1
fi

# 确定压缩方式
if [ "$compress_dist" = true ]; then
    show_progress "正在压缩 dist 文件夹..."
    if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
        zip -r dist.zip dist/
    elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
        powershell -Command "Compress-Archive -Path dist/* -DestinationPath dist.zip"
    else
        echo -e "${RED}不支持的操作系统: $OSTYPE${NC}"
        exit 1
    fi
else
    show_progress "正在压缩 dist 文件夹中的内容..."
    if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
        zip -r dist.zip dist/*
    elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
        powershell -Command "Compress-Archive -Path dist/* -DestinationPath dist.zip"
    else
        echo -e "${RED}不支持的操作系统: $OSTYPE${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}构建并压缩完成!${NC}"
