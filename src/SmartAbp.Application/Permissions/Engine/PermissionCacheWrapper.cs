using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using SmartAbp.Permissions.Engine;

namespace SmartAbp.Application.Permissions.Engine
{
    public class PermissionCacheWrapper : IPermissionCache
    {
        private readonly IMemoryCache _cache;
        private readonly MemoryCacheEntryOptions _cacheOptions;

        public PermissionCacheWrapper(IMemoryCache cache)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            
            _cacheOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(15),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
            };
        }

        public async Task<List<EffectivePermission>> GetOrCreateAsync(string key, Func<Task<List<EffectivePermission>>> factory)
        {
            return await _cache.GetOrCreateAsync(key, async entry =>
            {
                entry.SetOptions(_cacheOptions);
                return await factory();
            });
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
        }
    }
}