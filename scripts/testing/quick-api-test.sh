#!/bin/bash

# ============================================================================
# 低代码生成器快速API测试脚本
# 用于快速验证后端API是否正常工作
# ============================================================================

set -e

API_BASE="http://localhost:44379/api/code-generator"
TEST_PASSED=0
TEST_FAILED=0
TEST_TOTAL=0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 低代码生成器快速API测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# 测试辅助函数
# ============================================================================

test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=${5:-200}
    
    TEST_TOTAL=$((TEST_TOTAL + 1))
    
    echo -n "[$TEST_TOTAL] $test_name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_BASE$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (${status_code})"
        TEST_PASSED=$((TEST_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (期望: $expected_status, 实际: $status_code)"
        echo -e "   ${YELLOW}响应: ${body:0:100}${NC}"
        TEST_FAILED=$((TEST_FAILED + 1))
        return 1
    fi
}

# ============================================================================
# 基础连接测试
# ============================================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段1: 基础API连接测试${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查后端服务是否运行
if ! curl -s -f -o /dev/null "http://localhost:44379/health"; then
    echo -e "${RED}❌ 后端服务未运行！${NC}"
    echo -e "${YELLOW}请先启动后端服务:${NC}"
    echo -e "   cd src/SmartAbp.Web"
    echo -e "   dotnet run"
    exit 1
fi

test_api "获取连接字符串列表" "GET" "/connection-strings"
test_api "获取菜单树" "GET" "/menus"
test_api "获取Schema版本清单" "GET" "/schema-version-manifest"

# ============================================================================
# 模块验证测试
# ============================================================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段2: 模块验证功能测试${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

VALID_MODULE='{
  "systemName": "TestSystem",
  "name": "TestModule",
  "displayName": "测试模块",
  "description": "API测试用模块",
  "version": "1.0.0",
  "architecturePattern": "Crud",
  "namespace": "TestSystem.TestModule",
  "author": "API Test",
  "databaseInfo": {
    "connectionStringName": "Default",
    "provider": "SqlServer"
  },
  "featureManagement": {
    "isEnabled": true,
    "defaultPolicy": "RequiresAuthentication"
  },
  "frontend": {
    "parentId": "",
    "routePrefix": "testmodule"
  },
  "generateMobilePages": false,
  "dependencies": [],
  "entities": [{
    "name": "TestEntity",
    "displayName": "测试实体",
    "description": "测试用实体"
  }]
}'

test_api "验证有效模块配置" "POST" "/validate" "$VALID_MODULE"
test_api "模拟运行代码生成" "POST" "/dry-run" "$VALID_MODULE"

# ============================================================================
# 核心代码生成测试
# ============================================================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段3: 核心代码生成功能测试${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -n "[$((TEST_TOTAL + 1))] 生成模块代码 ... "
TEST_TOTAL=$((TEST_TOTAL + 1))

response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/generate-module" \
    -H "Content-Type: application/json" \
    -d "$VALID_MODULE" 2>/dev/null)

status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (${status_code})"
    TEST_PASSED=$((TEST_PASSED + 1))
    
    # 解析生成结果
    file_count=$(echo "$body" | grep -o '"generatedFiles":\[' | wc -l)
    if [ $file_count -gt 0 ]; then
        echo -e "   ${GREEN}✓ 生成了代码文件${NC}"
    fi
else
    echo -e "${RED}❌ FAIL${NC} (期望: 200, 实际: $status_code)"
    echo -e "   ${YELLOW}响应: ${body:0:200}${NC}"
    TEST_FAILED=$((TEST_FAILED + 1))
fi

# ============================================================================
# 错误处理测试
# ============================================================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段4: 错误处理测试${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

INVALID_MODULE='{
  "systemName": "",
  "name": "",
  "displayName": ""
}'

test_api "拒绝无效模块配置" "POST" "/validate" "$INVALID_MODULE" 400

INCOMPLETE_MODULE='{
  "systemName": "Test"
}'

test_api "拒绝不完整模块配置" "POST" "/generate-module" "$INCOMPLETE_MODULE" 400

# ============================================================================
# UI配置测试
# ============================================================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段5: UI配置功能测试${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

UI_CONFIG='{
  "displayName": "测试实体",
  "fields": [{
    "name": "Name",
    "displayName": "名称",
    "editable": true,
    "visible": true,
    "required": true,
    "controlType": "input"
  }]
}'

test_api "保存UI配置" "POST" "/ui-config?module=TestModule&entity=TestEntity" "$UI_CONFIG"
test_api "获取UI配置" "GET" "/ui-config?module=TestModule&entity=TestEntity"

# ============================================================================
# 数据库反查测试（可选）
# ============================================================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}阶段6: 数据库反查测试（可选）${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DB_REQUEST='{
  "connectionStringName": "Default",
  "provider": "SqlServer",
  "schema": "dbo"
}'

# 这个测试可能失败（如果数据库未配置），但不影响整体测试
echo -n "[$((TEST_TOTAL + 1))] 数据库反查 ... "
TEST_TOTAL=$((TEST_TOTAL + 1))

response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/introspect-db" \
    -H "Content-Type: application/json" \
    -d "$DB_REQUEST" 2>/dev/null)

status_code=$(echo "$response" | tail -n 1)

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (${status_code})"
    TEST_PASSED=$((TEST_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (数据库可能未配置)"
fi

# ============================================================================
# 测试结果汇总
# ============================================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PASS_RATE=$(( TEST_PASSED * 100 / TEST_TOTAL ))

echo -e "总测试数: $TEST_TOTAL"
echo -e "${GREEN}✅ 通过: $TEST_PASSED${NC}"
echo -e "${RED}❌ 失败: $TEST_FAILED${NC}"
echo -e "通过率: $PASS_RATE%"

echo ""

if [ $TEST_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 所有测试通过！低代码生成器API工作正常！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ 测试失败！请检查失败的测试项！${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi

