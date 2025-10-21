# Phase 5: UniApp后端链路开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 5 - UniApp移动端后端完整链路开发
**工期**: 1周（5个工作日）
**负责人**: 后端架构师 + 1名后端开发
**依赖**: Phase 3（UniApp前端生成器）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 业务场景

**UniApp移动端后端需求**：
- MES移动端：产线数据API、设备巡检API、报修工单API、文件上传
- 智慧工地移动端：现场巡查API、安全检查API、问题上报API、照片上传

### 1.2 技术挑战

**移动端后端 vs Web后端差异**：

| 维度 | Web后端 | 移动端后端 | 差异程度 |
|------|---------|-----------|---------|
| **身份认证** | Cookie/Session | JWT Token | ⭐⭐⭐ 中 |
| **文件上传** | multipart/form-data | multipart/form-data + 大文件分片 | ⭐⭐⭐⭐ 高 |
| **离线数据同步** | 无 | 数据同步冲突解决 | ⭐⭐⭐⭐⭐ 极高 |
| **版本管理** | 无 | 移动端版本兼容性 | ⭐⭐⭐⭐ 高 |
| **推送通知** | 无 | APNs/FCM推送 | ⭐⭐⭐⭐ 高 |

### 1.3 Phase 5目标

**核心目标**：
1. ✅ 实现JWT认证和刷新机制
2. ✅ 实现文件上传服务（支持大文件分片）
3. ✅ 实现离线数据同步服务（冲突解决）
4. ✅ 实现移动端版本管理服务
5. ✅ 实现推送通知服务（可选）
6. ✅ 100%复用现有后端生成器（Domain/Service/Controller/DTO）

**成功标准**：
- JWT认证正常
- 文件上传支持100MB+大文件
- 离线数据同步正常
- 后端代码质量≥95分

---

## 🏗️ 二、技术架构设计

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│         Presentation Layer（呈现层）                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  MobileApiController（移动端专用API）            │  │
│  │  - AuthController（认证）                       │  │
│  │  - FileUploadController（文件上传）              │  │
│  │  - SyncController（离线同步）                    │  │
│  │  - VersionController（版本管理）                 │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 调用
┌──────────────────────────────────────────────────────┐
│         Application Layer（应用层）                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  MobileAuthService（移动端认证服务）             │  │
│  │  - JWT生成和验证                                │  │
│  │  - Token刷新                                    │  │
│  │  - 设备管理                                      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  OfflineDataSyncService（离线数据同步服务）      │  │
│  │  - 数据上传                                      │  │
│  │  - 冲突检测                                      │  │
│  │  - 冲突解决                                      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  FileUploadService（文件上传服务）               │  │
│  │  - 分片上传                                      │  │
│  │  - 断点续传                                      │  │
│  │  - 云存储集成（OSS/S3）                          │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 调用
┌──────────────────────────────────────────────────────┐
│         Domain Layer（领域层 - 100%复用现有）           │
│  ┌────────────────────────────────────────────────┐  │
│  │  MobileDeviceEntity（移动设备实体）              │  │
│  │  OfflineDataEntity（离线数据实体）               │  │
│  │  FileUploadEntity（文件上传实体）                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 持久化
┌──────────────────────────────────────────────────────┐
│         Infrastructure Layer（基础设施层）             │
│  ┌────────────────────────────────────────────────┐  │
│  │  SQL Server（关系型数据库）                      │  │
│  │  Redis（缓存 + Token黑名单）                     │  │
│  │  OSS/S3（对象存储）                             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 2.2 JWT认证流程

```
[移动端] → [AuthController.Login] → [MobileAuthService]
                                          ↓
                            生成JWT（AccessToken + RefreshToken）
                                          ↓
                            [移动端保存Token到本地存储]
                                          ↓
                            [后续请求携带AccessToken]
                                          ↓
                            [AccessToken过期 → 使用RefreshToken刷新]
```

### 2.3 离线数据同步流程

```
[移动端] → [离线操作] → [本地存储] → [网络恢复]
                                        ↓
                            [批量上传离线数据]
                                        ↓
                            [SyncController.SyncData]
                                        ↓
                            [冲突检测（版本号/时间戳）]
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    ↓                                       ↓
            [无冲突：直接保存]                    [有冲突：冲突解决策略]
                                                      ↓
                                          ┌───────────┴───────────┐
                                          ↓                       ↓
                                    [服务端优先]              [客户端优先]
```

---

## 💻 三、核心组件实现

### 3.1 JWT认证服务

```csharp
// src/SmartAbp.Application/Mobile/MobileAuthService.cs
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SmartAbp.Application.Mobile
{
    /// <summary>
    /// 移动端认证服务
    /// </summary>
    public class MobileAuthService : ApplicationService
    {
        private readonly IConfiguration _configuration;
        private readonly IDistributedCache _cache;
        private readonly IRepository<MobileDevice, Guid> _mobileDeviceRepository;
        
        public MobileAuthService(
            IConfiguration configuration,
            IDistributedCache cache,
            IRepository<MobileDevice, Guid> mobileDeviceRepository)
        {
            _configuration = configuration;
            _cache = cache;
            _mobileDeviceRepository = mobileDeviceRepository;
        }
        
        /// <summary>
        /// 登录
        /// </summary>
        public async Task<MobileLoginResultDto> LoginAsync(MobileLoginDto input)
        {
            // 1. 验证用户名密码（复用现有认证）
            // TODO: 调用ABP认证服务
            
            // 2. 生成JWT Token
            var accessToken = GenerateAccessToken(userId, userName);
            var refreshToken = GenerateRefreshToken(userId);
            
            // 3. 保存RefreshToken到Redis（30天过期）
            await _cache.SetStringAsync(
                $"RefreshToken:{userId}:{refreshToken}",
                userId.ToString(),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(30)
                }
            );
            
            // 4. 保存或更新移动设备信息
            await SaveOrUpdateDeviceAsync(userId, input.DeviceId, input.DeviceInfo);
            
            return new MobileLoginResultDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600, // 1小时
                TokenType = "Bearer"
            };
        }
        
        /// <summary>
        /// 刷新Token
        /// </summary>
        public async Task<MobileLoginResultDto> RefreshTokenAsync(string refreshToken)
        {
            // 1. 验证RefreshToken
            var userId = await ValidateRefreshTokenAsync(refreshToken);
            
            if (userId == null)
            {
                throw new UnauthorizedException("RefreshToken无效或已过期");
            }
            
            // 2. 生成新的AccessToken
            var newAccessToken = GenerateAccessToken(userId.Value, userName);
            
            // 3. （可选）生成新的RefreshToken（滚动刷新）
            var newRefreshToken = GenerateRefreshToken(userId.Value);
            
            // 4. 保存新的RefreshToken
            await _cache.SetStringAsync(
                $"RefreshToken:{userId}:{newRefreshToken}",
                userId.ToString(),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(30)
                }
            );
            
            // 5. 删除旧的RefreshToken
            await _cache.RemoveAsync($"RefreshToken:{userId}:{refreshToken}");
            
            return new MobileLoginResultDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresIn = 3600,
                TokenType = "Bearer"
            };
        }
        
        /// <summary>
        /// 生成AccessToken
        /// </summary>
        private string GenerateAccessToken(Guid userId, string userName)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, userName),
                new Claim("DeviceType", "Mobile")
            };
            
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"])
            );
            
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        /// <summary>
        /// 生成RefreshToken
        /// </summary>
        private string GenerateRefreshToken(Guid userId)
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }
        
        /// <summary>
        /// 验证RefreshToken
        /// </summary>
        private async Task<Guid?> ValidateRefreshTokenAsync(string refreshToken)
        {
            // 从Redis查找RefreshToken
            var keys = await _cache.GetKeysAsync($"RefreshToken:*:{refreshToken}");
            
            if (keys.Count == 0)
            {
                return null;
            }
            
            var userIdStr = await _cache.GetStringAsync(keys[0]);
            
            if (Guid.TryParse(userIdStr, out var userId))
            {
                return userId;
            }
            
            return null;
        }
        
        /// <summary>
        /// 保存或更新移动设备信息
        /// </summary>
        private async Task SaveOrUpdateDeviceAsync(Guid userId, string deviceId, DeviceInfoDto deviceInfo)
        {
            var device = await _mobileDeviceRepository
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceId == deviceId);
            
            if (device == null)
            {
                device = new MobileDevice
                {
                    UserId = userId,
                    DeviceId = deviceId,
                    DeviceType = deviceInfo.DeviceType,
                    DeviceModel = deviceInfo.DeviceModel,
                    OsVersion = deviceInfo.OsVersion,
                    AppVersion = deviceInfo.AppVersion,
                    LastLoginTime = DateTime.UtcNow
                };
                
                await _mobileDeviceRepository.InsertAsync(device);
            }
            else
            {
                device.DeviceType = deviceInfo.DeviceType;
                device.DeviceModel = deviceInfo.DeviceModel;
                device.OsVersion = deviceInfo.OsVersion;
                device.AppVersion = deviceInfo.AppVersion;
                device.LastLoginTime = DateTime.UtcNow;
                
                await _mobileDeviceRepository.UpdateAsync(device);
            }
        }
    }
}
```

### 3.2 离线数据同步服务

```csharp
// src/SmartAbp.Application/Mobile/OfflineDataSyncService.cs
namespace SmartAbp.Application.Mobile
{
    /// <summary>
    /// 离线数据同步服务
    /// </summary>
    public class OfflineDataSyncService : ApplicationService
    {
        private readonly IRepository<OfflineData, Guid> _offlineDataRepository;
        
        public OfflineDataSyncService(
            IRepository<OfflineData, Guid> offlineDataRepository)
        {
            _offlineDataRepository = offlineDataRepository;
        }
        
        /// <summary>
        /// 同步数据（批量）
        /// </summary>
        public async Task<SyncResultDto> SyncDataAsync(SyncRequestDto input)
        {
            var result = new SyncResultDto
            {
                SuccessCount = 0,
                FailedCount = 0,
                ConflictCount = 0,
                Conflicts = new List<ConflictDto>()
            };
            
            foreach (var item in input.Items)
            {
                try
                {
                    var syncResult = await SyncSingleItemAsync(item);
                    
                    if (syncResult.IsSuccess)
                    {
                        result.SuccessCount++;
                    }
                    else if (syncResult.HasConflict)
                    {
                        result.ConflictCount++;
                        result.Conflicts.Add(syncResult.Conflict);
                    }
                    else
                    {
                        result.FailedCount++;
                    }
                }
                catch (Exception ex)
                {
                    result.FailedCount++;
                    Logger.LogError(ex, "同步数据失败，ID: {ItemId}", item.Id);
                }
            }
            
            return result;
        }
        
        /// <summary>
        /// 同步单条数据
        /// </summary>
        private async Task<SingleSyncResult> SyncSingleItemAsync(OfflineDataItemDto item)
        {
            // 1. 查找服务端数据
            var serverData = await _offlineDataRepository.FirstOrDefaultAsync(d => d.Id == item.Id);
            
            // 2. 如果是新数据，直接保存
            if (serverData == null)
            {
                await CreateDataAsync(item);
                return SingleSyncResult.Success();
            }
            
            // 3. 检测冲突（版本号对比）
            if (serverData.Version > item.Version)
            {
                // 服务端数据更新 → 冲突
                return SingleSyncResult.Conflict(new ConflictDto
                {
                    ItemId = item.Id,
                    ClientVersion = item.Version,
                    ServerVersion = serverData.Version,
                    ClientData = item.Data,
                    ServerData = serverData.Data,
                    ConflictType = ConflictType.VersionMismatch
                });
            }
            
            // 4. 无冲突，更新数据
            await UpdateDataAsync(serverData, item);
            return SingleSyncResult.Success();
        }
        
        /// <summary>
        /// 解决冲突（策略模式）
        /// </summary>
        public async Task<ConflictResolutionResultDto> ResolveConflictAsync(
            ConflictResolutionDto input)
        {
            var serverData = await _offlineDataRepository.GetAsync(input.ItemId);
            
            switch (input.Strategy)
            {
                case ConflictResolutionStrategy.ClientWins:
                    // 客户端优先：使用客户端数据覆盖服务端
                    await UpdateDataAsync(serverData, input.ClientData);
                    return ConflictResolutionResultDto.Success();
                
                case ConflictResolutionStrategy.ServerWins:
                    // 服务端优先：客户端放弃修改
                    return ConflictResolutionResultDto.Success();
                
                case ConflictResolutionStrategy.Merge:
                    // 合并：智能合并客户端和服务端数据
                    var mergedData = MergeData(serverData.Data, input.ClientData);
                    await UpdateDataAsync(serverData, mergedData);
                    return ConflictResolutionResultDto.Success();
                
                default:
                    throw new NotSupportedException($"不支持的冲突解决策略：{input.Strategy}");
            }
        }
    }
}
```

### 3.3 文件上传服务

```csharp
// src/SmartAbp.Application/Mobile/FileUploadService.cs
namespace SmartAbp.Application.Mobile
{
    /// <summary>
    /// 文件上传服务
    /// </summary>
    public class FileUploadService : ApplicationService
    {
        private readonly IRepository<FileUpload, Guid> _fileUploadRepository;
        private readonly IBlobContainer _blobContainer;
        
        public FileUploadService(
            IRepository<FileUpload, Guid> fileUploadRepository,
            IBlobContainer blobContainer)
        {
            _fileUploadRepository = fileUploadRepository;
            _blobContainer = blobContainer;
        }
        
        /// <summary>
        /// 初始化分片上传
        /// </summary>
        public async Task<InitChunkUploadResultDto> InitChunkUploadAsync(
            InitChunkUploadDto input)
        {
            var fileUpload = new FileUpload
            {
                FileName = input.FileName,
                FileSize = input.FileSize,
                TotalChunks = input.TotalChunks,
                UploadedChunks = 0,
                Status = UploadStatus.Uploading,
                UserId = CurrentUser.Id.Value
            };
            
            await _fileUploadRepository.InsertAsync(fileUpload);
            
            return new InitChunkUploadResultDto
            {
                UploadId = fileUpload.Id,
                ChunkSize = 1024 * 1024 // 1MB
            };
        }
        
        /// <summary>
        /// 上传分片
        /// </summary>
        public async Task<UploadChunkResultDto> UploadChunkAsync(
            Guid uploadId,
            int chunkIndex,
            Stream chunkStream)
        {
            // 1. 查找上传记录
            var fileUpload = await _fileUploadRepository.GetAsync(uploadId);
            
            // 2. 保存分片到临时存储
            var chunkKey = $"chunks/{uploadId}/{chunkIndex}";
            await _blobContainer.SaveAsync(chunkKey, chunkStream);
            
            // 3. 更新上传记录
            fileUpload.UploadedChunks++;
            await _fileUploadRepository.UpdateAsync(fileUpload);
            
            // 4. 检查是否所有分片都已上传
            if (fileUpload.UploadedChunks >= fileUpload.TotalChunks)
            {
                // 合并分片
                var filePath = await MergeChunksAsync(fileUpload);
                
                fileUpload.FilePath = filePath;
                fileUpload.Status = UploadStatus.Completed;
                await _fileUploadRepository.UpdateAsync(fileUpload);
                
                return new UploadChunkResultDto
                {
                    IsCompleted = true,
                    FilePath = filePath
                };
            }
            
            return new UploadChunkResultDto
            {
                IsCompleted = false,
                UploadedChunks = fileUpload.UploadedChunks,
                TotalChunks = fileUpload.TotalChunks
            };
        }
        
        /// <summary>
        /// 合并分片
        /// </summary>
        private async Task<string> MergeChunksAsync(FileUpload fileUpload)
        {
            var uploadId = fileUpload.Id;
            var totalChunks = fileUpload.TotalChunks;
            
            using var mergedStream = new MemoryStream();
            
            for (int i = 0; i < totalChunks; i++)
            {
                var chunkKey = $"chunks/{uploadId}/{i}";
                var chunkStream = await _blobContainer.GetAsync(chunkKey);
                
                await chunkStream.CopyToAsync(mergedStream);
                
                // 删除分片
                await _blobContainer.DeleteAsync(chunkKey);
            }
            
            // 保存合并后的文件
            mergedStream.Position = 0;
            var finalKey = $"uploads/{uploadId}/{fileUpload.FileName}";
            await _blobContainer.SaveAsync(finalKey, mergedStream);
            
            return finalKey;
        }
    }
}
```

### 3.4 移动端Controller

```csharp
// src/SmartAbp.HttpApi/Controllers/MobileAuthController.cs
[ApiController]
[Route("api/mobile/auth")]
public class MobileAuthController : ControllerBase
{
    private readonly MobileAuthService _authService;
    
    public MobileAuthController(MobileAuthService authService)
    {
        _authService = authService;
    }
    
    /// <summary>
    /// 登录
    /// </summary>
    [HttpPost("login")]
    public async Task<MobileLoginResultDto> LoginAsync(MobileLoginDto input)
    {
        return await _authService.LoginAsync(input);
    }
    
    /// <summary>
    /// 刷新Token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<MobileLoginResultDto> RefreshTokenAsync(RefreshTokenDto input)
    {
        return await _authService.RefreshTokenAsync(input.RefreshToken);
    }
    
    /// <summary>
    /// 登出
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task LogoutAsync()
    {
        await _authService.LogoutAsync();
    }
}
```

---

## 📝 四、开发步骤（5天详细计划）

### Day 1：JWT认证服务开发（1天）

**任务清单**：
1. 创建MobileAuthService
2. 实现登录逻辑
3. 实现Token刷新逻辑
4. 实现设备管理
5. 单元测试

**验收标准**：
- ✅ JWT认证正常
- ✅ Token刷新正常

### Day 2：离线数据同步服务开发（1天）

**任务清单**：
1. 创建OfflineDataSyncService
2. 实现批量同步逻辑
3. 实现冲突检测
4. 实现冲突解决
5. 单元测试

**验收标准**：
- ✅ 数据同步正常
- ✅ 冲突解决正常

### Day 3：文件上传服务开发（1天）

**任务清单**：
1. 创建FileUploadService
2. 实现分片上传逻辑
3. 实现断点续传
4. 实现文件合并
5. 集成测试

**验收标准**：
- ✅ 分片上传正常
- ✅ 支持100MB+大文件

### Day 4：移动端Controller开发（1天）

**任务清单**：
1. 创建MobileAuthController
2. 创建SyncController
3. 创建FileUploadController
4. API文档生成

**验收标准**：
- ✅ 所有API正常工作
- ✅ API文档完整

### Day 5：完整测试和文档（1天）

**任务清单**：
1. 完整集成测试
2. 性能测试
3. 文档更新

**验收标准**：
- ✅ 所有测试通过
- ✅ 文档完整

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| JWT认证 | 登录、Token刷新、登出正常 | 集成测试 |
| 离线数据同步 | 数据同步、冲突解决正常 | 集成测试 |
| 文件上传 | 分片上传、断点续传正常 | 集成测试 |

### 5.2 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 登录响应时间 | <500ms | 性能测试 |
| 文件上传速度 | ≥5MB/s | 性能测试 |
| 数据同步时间 | <2秒/100条 | 性能测试 |

---

## 🧪 六、测试方案

### 6.1 单元测试

```csharp
[Fact]
public async Task MobileAuthService_Login_Success()
{
    var service = new MobileAuthService(...);
    var result = await service.LoginAsync(new MobileLoginDto
    {
        UserName = "test",
        Password = "123456",
        DeviceId = "device-001"
    });
    
    Assert.NotNull(result.AccessToken);
    Assert.NotNull(result.RefreshToken);
}
```

### 6.2 集成测试

**测试步骤**：
```bash
# 1. 登录
POST /api/mobile/auth/login
{
  "userName": "test",
  "password": "123456",
  "deviceId": "device-001"
}

# 2. 使用AccessToken调用API
GET /api/mobile/production-line
Authorization: Bearer {AccessToken}

# 3. 刷新Token
POST /api/mobile/auth/refresh-token
{
  "refreshToken": "{RefreshToken}"
}
```

---

## 📦 七、交付清单

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/SmartAbp.Application/Mobile/MobileAuthService.cs` | JWT认证服务 | ✅ 新增 |
| `src/SmartAbp.Application/Mobile/OfflineDataSyncService.cs` | 离线数据同步服务 | ✅ 新增 |
| `src/SmartAbp.Application/Mobile/FileUploadService.cs` | 文件上传服务 | ✅ 新增 |
| `src/SmartAbp.HttpApi/Controllers/MobileAuthController.cs` | 移动端认证Controller | ✅ 新增 |

---

## 🎯 八、成功指标

- ✅ JWT认证完整实现
- ✅ 离线数据同步正常
- ✅ 文件上传支持100MB+大文件
- ✅ 后端代码质量≥95分

**Phase 5 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ UniApp移动端后端链路完整

---

## 🎉 全部5个阶段开发方案完成

**总计工期**：6周（30个工作日）

| 阶段 | 工期 | 核心内容 |
|------|------|---------|
| Phase 1 | 1周 | 低代码引擎核心重构 |
| Phase 2 | 2周 | Dashboard生成器开发 |
| Phase 3 | 2周 | UniApp生成器开发 |
| Phase 4 | 1周 | Dashboard后端链路开发 |
| Phase 5 | 1周 | UniApp后端链路开发 |

**下一步**：按照Phase 1→Phase 2→Phase 3→Phase 4→Phase 5顺序执行开发

