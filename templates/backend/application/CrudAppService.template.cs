/*
 * AI_TEMPLATE_INFO: {"version":"1.2","type":"C#","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: Generates a standard ABP Application Service with CRUD operations.
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.Permissions;
using SmartAbp.Domain.Entities;
using SmartAbp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Entities;
using Volo.Abp;

namespace SmartAbp.Application.Services
{
    [Authorize]
    public class {{entityName}}AppService : CrudAppService<
        {{entityName}},
        {{entityName}}Dto,
        {{primaryKeyType}},
        Get{{entityName}}ListDto,
        {{entityName}}CreateDto,
        {{entityName}}UpdateDto>, I{{entityName}}AppService
    {
        private readonly IRepository<{{entityName}}, {{primaryKeyType}}> _{{entityName}}Repository;

        public {{entityName}}AppService(IRepository<{{entityName}}, {{primaryKeyType}}> repository) : base(repository)
        {
            _{{entityName}}Repository = repository;
            GetPolicyName = {{permissionGroupName}}Permissions.{{entityNamePlural}}.Default;
            GetListPolicyName = {{permissionGroupName}}Permissions.{{entityNamePlural}}.Default;
            CreatePolicyName = {{permissionGroupName}}Permissions.{{entityNamePlural}}.Create;
            UpdatePolicyName = {{permissionGroupName}}Permissions.{{entityNamePlural}}.Update;
            DeletePolicyName = {{permissionGroupName}}Permissions.{{entityNamePlural}}.Delete;
        }

        protected override async Task<IQueryable<{{entityName}}>> CreateFilteredQueryAsync(Get{{entityName}}ListDto input)
        {
            var queryable = await Repository.GetQueryableAsync();
            return queryable
                .WhereIf(!input.Filter.IsNullOrWhiteSpace(), e => e.Name.Contains(input.Filter));
        }

        public override async Task<{{entityName}}Dto> CreateAsync({{entityName}}CreateDto input)
        {
            await CheckCreatePolicyAsync();
            await CheckNameAsync(input.Name);
            var entity = ObjectMapper.Map<{{entityName}}CreateDto, {{entityName}}>(input);
            await Repository.InsertAsync(entity, autoSave: true);
            return ObjectMapper.Map<{{entityName}}, {{entityName}}Dto>(entity);
        }

        public override async Task<{{entityName}}Dto> UpdateAsync({{primaryKeyType}} id, {{entityName}}UpdateDto input)
        {
            await CheckUpdatePolicyAsync();
            await CheckNameAsync(input.Name, id);
            var entity = await GetEntityByIdAsync(id);
            ObjectMapper.Map(input, entity);
            await Repository.UpdateAsync(entity, autoSave: true);
            return ObjectMapper.Map<{{entityName}}, {{entityName}}Dto>(entity);
        }

        protected virtual async Task CheckNameAsync(string name, {{primaryKeyType}}? id = null)
        {
            var existed = await _{{entityName}}Repository.FindAsync(e => e.Name == name && (id == null || !e.Id.Equals(id)));
            if (existed != null)
            {
                throw new UserFriendlyException(L["DuplicateNameMessage", name]);
            }
        }
    }
}
