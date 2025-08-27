#!/bin/bash

# deploy.sh - 从本地机器运行的自动化部署脚本
set -e # 遇到任何错误立即退出脚本

# ============ 配置区域 ============
# 请修改以下变量以匹配你的服务器信息
TARGET_SERVER="root@47.239.125.226" # 服务器登录用户名和IP
APP_NAME="admin-web"
APP_DIR="/opt/admin/$APP_NAME"                  # 服务器上项目存放的绝对路径
# ==================================

echo "🚀 开始部署 $APP_NAME 到 $TARGET_SERVER"

# 第1步：检查本地是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
  echo "❌ 错误：本地工作区有未提交的更改，请先提交或暂存后再部署。"
  exit 1
fi

echo "✅ 本地工作区是干净的。"

# 第2步：打包
echo "开始打包..."
pnpm install
pnpm build

# 第3步：上传打包文件
echo "上传打包文件..."
ssh $TARGET_SERVER "mkdir -p $APP_DIR"
scp -r ./dist $TARGET_SERVER:$APP_DIR

# 第3步：通过SSH在服务器上执行部署命令
echo "🔁 在服务器上执行部署任务..."
ssh $TARGET_SERVER << EOF
  set -e
  cd $APP_DIR
  cd ../

  echo “--- 构建Docker镜像（利用缓存加速） ---”
  # --build 参数强制重新构建镜像
  docker compose build nginx

  echo “--- 切换容器服务 ---”
  docker compose down nginx
  docker compose up -d nginx

  echo “--- 检查应用状态 ---”
  docker compose ps
EOF

# 第3步：部署完成
echo "🎉 部署脚本执行完毕！"
