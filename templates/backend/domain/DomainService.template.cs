/*
 * AI_TEMPLATE_INFO: {"version":"1.0","type":"C#","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 生成DDD领域服务，用于处理跨聚合根的复杂业务逻辑。
 * USAGE_GUIDE:
 * 1. 替换 {{domainName}} 为领域服务名 (如 'OrderManager')。
 * 2. 替换 {{primaryEntity}} 为主要操作的实体名 (如 'Order')。
 */
using System.Threading.Tasks;
using Volo.Abp.Domain.Services;

namespace SmartAbp.Domain.Services
{
    public class {{domainName}} : DomainService, I{{domainName}}
    {
        // Example: private readonly IRepository<OtherEntity, Guid> _otherEntityRepository;

        public {{domainName}}(/* IRepository<OtherEntity, Guid> otherEntityRepository */)
        {
            // _otherEntityRepository = otherEntityRepository;
        }

        /// <summary>
        /// Example of a complex business logic method.
        /// This method might interact with multiple aggregates or external services.
        /// </summary>
        /// <param name="entity">The primary entity to operate on.</param>
        public async Task Process{{primaryEntity}}Async({{primaryEntity}} entity)
        {
            // 1. Validate the state of the entity.
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            // 2. Perform some complex business rules that don't naturally fit within the entity itself.
            // For example, checking inventory levels from another microservice before confirming an order.

            // 3. Interact with other repositories if necessary.
            // var otherEntity = await _otherEntityRepository.FindAsync(entity.OtherEntityId);
            // if (otherEntity == null) {
            //     throw new BusinessException("Some business error.");
            // }

            // 4. Update the state of the primary entity.
            // entity.SetAsProcessed();

            // 5. Raise domain events.
            // AddDistributedEvent(new {{primaryEntity}}ProcessedEvent(entity.Id));

            await Task.CompletedTask;
        }
    }

    public interface I{{domainName}} : IDomainService
    {
        Task Process{{primaryEntity}}Async({{primaryEntity}} entity);
    }
}
