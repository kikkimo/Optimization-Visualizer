#!/bin/bash
# ==============================================================================
# @FileName: start.sh
# @Description: 数学优化问题演示项目启动脚本 - 支持开发和生产模式
# @Author: FangYi
# @Date: 2025-08-14
# @Version: 1.0.0
# ==============================================================================

set -euo pipefail

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # 无颜色

# 项目信息
PROJECT_NAME="Optimization Visualizer"
PROJECT_VERSION="1.0.0"
DEFAULT_PORT=3000
CUSTOM_PORT=""
DEV_MODE=false
CLEAR_CACHE=false

# 全局变量
PACKAGE_MANAGER=""
INSTALL_CMD=""
BUILD_CMD=""
DEV_CMD=""
PREVIEW_CMD=""

# 退出时执行的清理操作
trap cleanup EXIT

# ------------------------------------------------------------------
# 函数：cleanup
# 描述：在脚本退出时执行清理工作
# 参数：无
# 返回：无
# ------------------------------------------------------------------
function cleanup() {
    if [ "$DEV_MODE" = true ]; then
        echo -e "${CYAN}[INFO] 清理并退出脚本...${NC}"
    fi
}

# ------------------------------------------------------------------
# 函数：print_banner
# 描述：打印项目启动横幅
# 参数：无
# 返回：无
# ------------------------------------------------------------------
function print_banner() {
    echo -e "${PURPLE}======================================================${NC}"
    echo -e "${PURPLE}  📊 ${PROJECT_NAME}${NC}"
    echo -e "${PURPLE}  版本: ${PROJECT_VERSION}${NC}"
    echo -e "${PURPLE}  功能: 交互式优化算法演示平台${NC}"
    if [ "$DEV_MODE" = true ]; then
        echo -e "${PURPLE}  模式: 开发模式 (详细日志)${NC}"
    else
        echo -e "${PURPLE}  模式: 生产模式 (优化性能)${NC}"
    fi
    echo -e "${PURPLE}======================================================${NC}"
    echo ""
}

# ------------------------------------------------------------------
# 函数：print_usage
# 描述：打印使用说明
# 参数：无
# 返回：无
# ------------------------------------------------------------------
function print_usage() {
    echo -e "${CYAN}使用方法:${NC}"
    echo -e "  ${GREEN}./start.sh${NC}                    # 生产模式启动 (优化性能)"
    echo -e "  ${GREEN}./start.sh --dev${NC}              # 开发模式启动 (详细日志)"
    echo -e "  ${GREEN}./start.sh --port 3210${NC}        # 指定端口启动"
    echo -e "  ${GREEN}./start.sh --port 3210 --dev${NC}  # 指定端口开发模式"
    echo -e "  ${GREEN}./start.sh --clear${NC}            # 清理缓存并重新编译"
    echo ""
    echo -e "${CYAN}参数说明:${NC}"
    echo -e "  ${YELLOW}--dev${NC}      : 开发模式 (热重载、详细日志、源码映射)"
    echo -e "  ${YELLOW}--port PORT${NC}: 指定端口号 (如果被占用则启动失败)"
    echo -e "  ${YELLOW}--clear${NC}    : 清理缓存 (删除缓存文件，强制重新编译)"
    echo -e "  ${YELLOW}--help${NC}     : 显示帮助信息"
    echo ""
    echo -e "${CYAN}缓存清理范围:${NC}"
    echo -e "  ${YELLOW}├─ node_modules/.cache/${NC} (各种构建缓存)"
    echo -e "  ${YELLOW}├─ dist/${NC} (构建输出目录)"
    echo -e "  ${YELLOW}├─ .vite/${NC} (Vite开发缓存)"
    echo -e "  ${YELLOW}└─ package manager cache${NC} (npm/pnpm/yarn缓存)"
    echo ""
}

# ------------------------------------------------------------------
# 函数：parse_arguments
# 描述：解析命令行参数
# 参数：所有命令行参数 ($@)
# 返回：无
# ------------------------------------------------------------------
function parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev)
                DEV_MODE=true
                shift
                ;;
            --clear)
                CLEAR_CACHE=true
                shift
                ;;
            --port)
                if [[ -z "$2" ]] || [[ "$2" =~ ^-- ]]; then
                    echo -e "${RED}[ERROR] --port 参数需要指定端口号${NC}"
                    print_usage
                    exit 1
                fi
                if ! [[ "$2" =~ ^[0-9]+$ ]] || [ "$2" -lt 1 ] || [ "$2" -gt 65535 ]; then
                    echo -e "${RED}[ERROR] 端口号必须是 1-65535 之间的数字: $2${NC}"
                    exit 1
                fi
                CUSTOM_PORT="$2"
                shift 2
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                echo -e "${RED}[ERROR] 未知参数: $1${NC}"
                print_usage
                exit 1
                ;;
        esac
    done
}

# ------------------------------------------------------------------
# 函数：check_node_version
# 描述：检查Node.js版本是否满足要求
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function check_node_version() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR] Node.js未安装，请先安装Node.js 18+${NC}"
        return 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo -e "${RED}[ERROR] Node.js版本过低，当前版本: $(node -v)，要求版本: 18+${NC}"
        return 1
    fi
    
    if [ "$DEV_MODE" = true ]; then
        echo -e "${GREEN}[SUCCESS] Node.js版本检查通过: $(node -v)${NC}"
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：check_package_manager
# 描述：检查并选择包管理器 (优先使用npm)
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function check_package_manager() {
    if command -v npm &> /dev/null; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${CYAN}[INFO] 使用 npm 作为包管理器${NC}"
        fi
        PACKAGE_MANAGER="npm"
        INSTALL_CMD="npm install"
        BUILD_CMD="npm run build"
        DEV_CMD="npm run dev"
        PREVIEW_CMD="npm run preview"
    elif command -v pnpm &> /dev/null; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${CYAN}[INFO] 使用 pnpm 作为包管理器${NC}"
        fi
        PACKAGE_MANAGER="pnpm"
        INSTALL_CMD="pnpm install"
        BUILD_CMD="pnpm run build"
        DEV_CMD="pnpm run dev"
        PREVIEW_CMD="pnpm run preview"
    elif command -v yarn &> /dev/null; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${CYAN}[INFO] 使用 yarn 作为包管理器${NC}"
        fi
        PACKAGE_MANAGER="yarn"
        INSTALL_CMD="yarn install"
        BUILD_CMD="yarn build"
        DEV_CMD="yarn dev"
        PREVIEW_CMD="yarn preview"
    else
        echo -e "${RED}[ERROR] 未找到可用的包管理器 (npm/pnpm/yarn)${NC}"
        return 1
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：find_available_port
# 描述：从指定端口开始查找可用端口
# 参数：$1 - 起始端口号
# 返回：输出可用端口号
# ------------------------------------------------------------------
function check_port_available() {
    local port=$1
    local force_check=${2:-false}
    
    # 使用netstat检查端口占用 (Windows兼容)
    if command -v netstat &> /dev/null; then
        if netstat -an | grep -q ":$port "; then
            return 1  # 端口被占用
        fi
    # 或者使用lsof (Linux/Mac)
    elif command -v lsof &> /dev/null; then
        if lsof -i :$port &> /dev/null; then
            return 1  # 端口被占用
        fi
    # 或者尝试连接测试
    else
        if timeout 1 bash -c "</dev/tcp/localhost/$port" &> /dev/null; then
            return 1  # 端口被占用
        fi
    fi
    
    return 0  # 端口可用
}

function find_available_port() {
    local start_port=${1:-$DEFAULT_PORT}
    
    # 如果指定了自定义端口，只检查该端口
    if [[ -n "$CUSTOM_PORT" ]]; then
        if check_port_available "$CUSTOM_PORT"; then
            echo "$CUSTOM_PORT"
            return 0
        else
            echo -e "${RED}[ERROR] 指定的端口 $CUSTOM_PORT 已被占用，启动失败${NC}" >&2
            echo -e "${YELLOW}[HINT] 请选择其他端口或停止占用该端口的程序${NC}" >&2
            return 1
        fi
    fi
    
    # 自动查找可用端口
    local port=$start_port
    local max_attempts=20
    
    while [ $max_attempts -gt 0 ]; do
        if check_port_available "$port"; then
            echo $port
            return 0
        fi
        
        port=$((port + 1))
        max_attempts=$((max_attempts - 1))
        
        if [ "$DEV_MODE" = true ]; then
            echo -e "${YELLOW}[INFO] 端口 $((port - 1)) 被占用，尝试端口 $port${NC}" >&2
        fi
    done
    
    echo -e "${RED}[ERROR] 无法找到可用端口 (尝试范围: $start_port-$port)${NC}" >&2
    return 1
}

# ------------------------------------------------------------------
# 函数：clear_cache
# 描述：清理项目编译缓存
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function clear_cache() {
    echo -e "${CYAN}[INFO] 开始清理项目缓存...${NC}"
    
    local cleared_items=0
    
    # 清理 dist 目录
    if [ -d "dist" ]; then
        echo -e "${YELLOW}[INFO] 清理构建输出目录 dist/${NC}"
        rm -rf dist/
        cleared_items=$((cleared_items + 1))
    fi
    
    # 清理 Vite 缓存
    if [ -d "node_modules/.vite" ]; then
        echo -e "${YELLOW}[INFO] 清理 Vite 开发缓存 node_modules/.vite/${NC}"
        rm -rf node_modules/.vite/
        cleared_items=$((cleared_items + 1))
    fi
    
    # 清理其他常见缓存目录
    local cache_dirs=("node_modules/.cache" ".next" ".nuxt" "out" "build")
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${YELLOW}[INFO] 清理缓存目录 $dir/${NC}"
            rm -rf "$dir/"
            cleared_items=$((cleared_items + 1))
        fi
    done
    
    # 清理包管理器缓存
    echo -e "${YELLOW}[INFO] 清理 $PACKAGE_MANAGER 缓存...${NC}"
    case "$PACKAGE_MANAGER" in
        "npm")
            npm cache clean --force &> /dev/null || echo -e "${YELLOW}[WARN] npm 缓存清理失败${NC}"
            ;;
        "pnpm")
            pnpm store prune &> /dev/null || echo -e "${YELLOW}[WARN] pnpm 缓存清理失败${NC}"
            ;;
        "yarn")
            yarn cache clean &> /dev/null || echo -e "${YELLOW}[WARN] yarn 缓存清理失败${NC}"
            ;;
    esac
    cleared_items=$((cleared_items + 1))
    
    # 清理临时文件
    local temp_patterns=("*.log" "*.tmp" ".DS_Store" "Thumbs.db")
    for pattern in "${temp_patterns[@]}"; do
        if ls $pattern 1> /dev/null 2>&1; then
            echo -e "${YELLOW}[INFO] 清理临时文件 $pattern${NC}"
            rm -f $pattern
            cleared_items=$((cleared_items + 1))
        fi
    done
    
    if [ $cleared_items -gt 0 ]; then
        echo -e "${GREEN}[SUCCESS] 缓存清理完成，共清理了 $cleared_items 项${NC}"
        echo -e "${CYAN}[INFO] 接下来将重新安装依赖和构建项目...${NC}"
    else
        echo -e "${GREEN}[SUCCESS] 没有发现需要清理的缓存文件${NC}"
    fi
    
    return 0
}

# ------------------------------------------------------------------
# 函数：install_dependencies
# 描述：安装项目依赖
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function install_dependencies() {
    if [ "$DEV_MODE" = true ]; then
        echo -e "${CYAN}[INFO] 正在检查项目依赖...${NC}"
    fi
    
    # 检查是否需要安装依赖
    local need_install=false
    
    # 如果清理缓存，强制重新安装
    if [ "$CLEAR_CACHE" = true ]; then
        need_install=true
        echo -e "${CYAN}[INFO] 缓存已清理，将重新安装所有依赖${NC}"
    elif [ ! -d "node_modules" ]; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${YELLOW}[WARN] node_modules 目录不存在${NC}"
        fi
        need_install=true
    elif [ "package.json" -nt "node_modules" ] 2>/dev/null; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${YELLOW}[WARN] package.json 已更新，需要重新安装依赖${NC}"
        fi
        need_install=true
    elif [ ! -f "node_modules/.package-lock.json" ] && [ ! -f "node_modules/.pnpm-lock.yaml" ] && [ ! -f "node_modules/.yarn-integrity" ]; then
        if [ "$DEV_MODE" = true ]; then
            echo -e "${YELLOW}[WARN] 依赖完整性检查失败${NC}"
        fi
        need_install=true
    fi
    
    if [ "$need_install" = true ]; then
        echo -e "${CYAN}[INFO] 开始安装依赖...${NC}"
        if [ "$DEV_MODE" = false ]; then
            echo -e "${YELLOW}[INFO] 正在安装依赖，请稍候...${NC}"
        fi
        
        # 安装策略
        if [ "$PACKAGE_MANAGER" = "npm" ]; then
            if [ "$DEV_MODE" = true ]; then
                echo -e "${CYAN}[INFO] 执行: npm install${NC}"
                npm install || {
                    echo -e "${YELLOW}[WARN] 常规安装失败，尝试清理缓存...${NC}"
                    npm cache clean --force
                    npm install || {
                        echo -e "${RED}[ERROR] 依赖安装失败${NC}"
                        return 1
                    }
                }
            else
                npm install --silent || {
                    npm cache clean --force
                    npm install --silent || {
                        echo -e "${RED}[ERROR] 依赖安装失败${NC}"
                        return 1
                    }
                }
            fi
        else
            $INSTALL_CMD || {
                echo -e "${RED}[ERROR] 依赖安装失败${NC}"
                return 1
            }
        fi
        
        echo -e "${GREEN}[SUCCESS] 依赖安装完成${NC}"
    else
        if [ "$DEV_MODE" = true ]; then
            echo -e "${GREEN}[SUCCESS] 依赖已是最新，跳过安装${NC}"
        fi
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：build_project
# 描述：构建项目 (仅生产模式)
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function build_project() {
    if [ "$DEV_MODE" = false ]; then
        echo -e "${CYAN}[INFO] 开始构建项目...${NC}"
        
        # 检查是否需要重新构建
        local need_build=false
        
        # 如果清理了缓存，强制重新构建
        if [ "$CLEAR_CACHE" = true ]; then
            need_build=true
            echo -e "${CYAN}[INFO] 缓存已清理，将重新构建项目${NC}"
        elif [ ! -d "dist" ]; then
            need_build=true
        elif find src -type f -newer dist -print -quit | grep -q .; then
            need_build=true
        fi
        
        if [ "$need_build" = true ]; then
            echo -e "${YELLOW}[INFO] 正在构建，请稍候...${NC}"
            $BUILD_CMD || {
                echo -e "${RED}[ERROR] 项目构建失败${NC}"
                return 1
            }
            echo -e "${GREEN}[SUCCESS] 项目构建完成${NC}"
        else
            echo -e "${GREEN}[SUCCESS] 构建文件已是最新，跳过构建${NC}"
        fi
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：print_startup_info
# 描述：打印启动信息
# 参数：$1 - 端口号, $2 - 模式
# 返回：无
# ------------------------------------------------------------------
function print_startup_info() {
    local port=$1
    local mode=$2
    
    echo ""
    echo -e "${BLUE}======================================================${NC}"
    if [ "$mode" = "dev" ]; then
        echo -e "${BLUE}  🚀 开发服务器启动完成${NC}"
    else
        echo -e "${BLUE}  🌟 预览服务器启动完成${NC}"
    fi
    echo -e "${BLUE}======================================================${NC}"
    echo -e "${GREEN}  本地访问地址: http://localhost:${port}${NC}"
    echo -e "${GREEN}  网络访问地址: http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1"):${port}${NC}"
    echo ""
    echo -e "${CYAN}  📋 功能特性:${NC}"
    echo -e "${CYAN}  ├─ 📊 Nine种优化算法演示 (BA、Kalman、SGM等)${NC}"
    echo -e "${CYAN}  ├─ 🎯 三种演示模式 (Storyboard/Replay/Compute)${NC}"
    echo -e "${CYAN}  ├─ 🎨 3D可视化 + 交互式参数调节${NC}"
    echo -e "${CYAN}  ├─ 📱 响应式设计 + 平滑动画效果${NC}"
    echo -e "${CYAN}  └─ ⚡ 离线支持 (Service Worker)${NC}"
    echo ""
    if [ "$mode" = "dev" ]; then
        echo -e "${YELLOW}  🛠️  开发模式特性:${NC}"
        echo -e "${YELLOW}  ├─ 热重载 (修改代码自动刷新)${NC}"
        echo -e "${YELLOW}  ├─ 详细错误信息和日志${NC}"
        echo -e "${YELLOW}  └─ 源码映射 (便于调试)${NC}"
    else
        echo -e "${YELLOW}  🚀 生产模式特性:${NC}"
        echo -e "${YELLOW}  ├─ 代码压缩和优化${NC}"
        echo -e "${YELLOW}  ├─ 资源缓存和预加载${NC}"
        echo -e "${YELLOW}  └─ 最佳性能表现${NC}"
    fi
    echo ""
    echo -e "${YELLOW}  ⚠️  注意事项:${NC}"
    echo -e "${YELLOW}  ├─ 复杂3D场景可能需要较好的GPU支持${NC}"
    echo -e "${YELLOW}  ├─ 建议使用现代浏览器 (Chrome 90+, Firefox 88+)${NC}"
    echo -e "${YELLOW}  └─ 按 Ctrl+C 停止服务器${NC}"
    echo -e "${BLUE}======================================================${NC}"
    echo ""
}

# ------------------------------------------------------------------
# 函数：start_dev_server
# 描述：启动开发服务器
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function start_dev_server() {
    if [[ -n "$CUSTOM_PORT" ]]; then
        echo -e "${CYAN}[INFO] 检查指定端口 $CUSTOM_PORT...${NC}"
    else
        echo -e "${CYAN}[INFO] 正在查找可用端口...${NC}"
    fi
    
    local port
    port=$(find_available_port $DEFAULT_PORT)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    if [ "$DEV_MODE" = true ]; then
        echo -e "${CYAN}[INFO] 使用端口: ${port}${NC}"
        echo -e "${CYAN}[INFO] 正在启动开发服务器...${NC}"
    fi
    
    # 显示启动信息
    print_startup_info "$port" "dev"
    
    # 启动开发服务器
    if [ "$PACKAGE_MANAGER" = "npm" ]; then
        npm run dev -- --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 开发服务器启动失败${NC}"
            return 1
        }
    elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run dev --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 开发服务器启动失败${NC}"
            return 1
        }
    elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn dev --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 开发服务器启动失败${NC}"
            return 1
        }
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：start_preview_server
# 描述：启动预览服务器 (生产模式)
# 参数：无
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function start_preview_server() {
    if [[ -n "$CUSTOM_PORT" ]]; then
        echo -e "${CYAN}[INFO] 检查指定端口 $CUSTOM_PORT...${NC}"
    else
        echo -e "${CYAN}[INFO] 正在查找可用端口...${NC}"
    fi
    
    local port
    port=$(find_available_port $DEFAULT_PORT)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    echo -e "${CYAN}[INFO] 正在启动预览服务器...${NC}"
    
    # 显示启动信息
    print_startup_info "$port" "preview"
    
    # 启动预览服务器
    if [ "$PACKAGE_MANAGER" = "npm" ]; then
        npm run preview -- --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 预览服务器启动失败${NC}"
            return 1
        }
    elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run preview --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 预览服务器启动失败${NC}"
            return 1
        }
    elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn preview --port $port --host 0.0.0.0 || {
            echo -e "${RED}[ERROR] 预览服务器启动失败${NC}"
            return 1
        }
    fi
    return 0
}

# ------------------------------------------------------------------
# 函数：main
# 描述：脚本主函数
# 参数：所有命令行参数 ($@)
# 返回：成功返回0，失败返回非零状态码
# ------------------------------------------------------------------
function main() {
    # 解析参数
    parse_arguments "$@"
    
    # 打印启动横幅
    print_banner
    
    # 环境检查
    check_node_version
    check_package_manager
    
    # 如果需要清理缓存
    if [ "$CLEAR_CACHE" = true ]; then
        clear_cache
        echo -e "${GREEN}[INFO] 缓存清理完成，继续后续操作...${NC}"
    fi
    
    # 安装依赖
    install_dependencies
    
    # 如果仅仅是清理缓存，不启动服务器
    if [ "$CLEAR_CACHE" = true ] && [ "$DEV_MODE" = false ]; then
        echo -e "${GREEN}[SUCCESS] 缓存清理和依赖安装完成！${NC}"
        echo -e "${CYAN}[INFO] 使用以下命令启动服务器:${NC}"
        echo -e "  ${GREEN}./start.sh --dev${NC}  # 开发模式"
        echo -e "  ${GREEN}./start.sh${NC}        # 生产模式"
        return 0
    fi
    
    if [ "$DEV_MODE" = true ]; then
        # 开发模式：启动开发服务器
        start_dev_server
    else
        # 生产模式：构建项目并启动预览服务器
        build_project
        start_preview_server
    fi
    
    return 0
}

# 执行主函数
main "$@"