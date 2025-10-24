using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.DatabaseInfo;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    /// <summary>
    /// 数据库信息控制器
    /// ABP平台底层增强：通过标准RESTful API暴露数据库适配功能
    /// </summary>
    [RemoteService]
    [Route("api/database-info")]
    public class DatabaseInfoController : AbpControllerBase, IDatabaseInfoAppService
    {
        private readonly IDatabaseInfoAppService _databaseInfoAppService;

        public DatabaseInfoController(IDatabaseInfoAppService databaseInfoAppService)
        {
            _databaseInfoAppService = databaseInfoAppService;
        }

        /// <summary>
        /// 获取当前数据库信息
        /// GET /api/database-info/current
        /// </summary>
        [HttpGet("current")]
        public async Task<DatabaseInfoDto> GetCurrentDatabaseInfoAsync()
        {
            return await _databaseInfoAppService.GetCurrentDatabaseInfoAsync();
        }

        /// <summary>
        /// 获取指定数据库类型的信息
        /// GET /api/database-info/{databaseType}
        /// </summary>
        [HttpGet("{databaseType}")]
        public async Task<DatabaseInfoDto> GetDatabaseInfoAsync(string databaseType)
        {
            return await _databaseInfoAppService.GetDatabaseInfoAsync(databaseType);
        }

        /// <summary>
        /// 测试数据库连接
        /// POST /api/database-info/test-connection
        /// </summary>
        [HttpPost("test-connection")]
        public async Task<DatabaseInfoDto> TestConnectionAsync([FromBody] string connectionString)
        {
            return await _databaseInfoAppService.TestConnectionAsync(connectionString);
        }

        /// <summary>
        /// 获取数据库字段类型映射
        /// GET /api/database-info/field-type/{csharpType}?maxLength=100
        /// </summary>
        [HttpGet("field-type/{csharpType}")]
        public async Task<string> GetDatabaseFieldTypeAsync(string csharpType, [FromQuery] int? maxLength = null)
        {
            return await _databaseInfoAppService.GetDatabaseFieldTypeAsync(csharpType, maxLength);
        }
    }
}
