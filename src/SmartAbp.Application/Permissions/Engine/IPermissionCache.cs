using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.Permissions.Engine;

namespace SmartAbp.Application.Permissions.Engine
{
    public interface IPermissionCache
    {
        Task<List<EffectivePermission>> GetOrCreateAsync(string key, Func<Task<List<EffectivePermission>>> factory);
        void Remove(string key);
    }
}