// DbContextConfiguration.template.cs
// This template will generate the Fluent API configuration for the entity in the DbContext.
// It will handle primary keys, relationships (HasOne, HasMany, HasForeignKey), and other constraints.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;
using {{ Namespace }}.{{ ModuleName }};

namespace {{ Namespace }}.EntityFrameworkCore
{
    public class {{ EntityName }}Configuration : IEntityTypeConfiguration<{{ EntityName }}>
    {
        public void Configure(EntityTypeBuilder<{{ EntityName }}> builder)
        {
            builder.ToTable("{{ TableName }}");

            builder.ConfigureByConvention(); 

            // Relationships Configuration
            {{#each Relationships}}
            {{#if (eq Type 'OneToMany')}}
            builder.HasMany(x => x.{{TargetNavigationProperty}})
                   .WithOne()
                   .HasForeignKey(x => x.{{ForeignKeyProperty}})
                   .IsRequired({{#if IsRequired}}true{{else}}false{{/if}})
                   .OnDelete(DeleteBehavior.{{OnDeleteAction}});
            {{/if}}
            {{#if (eq Type 'ManyToOne')}}
            builder.HasOne(x => x.{{TargetNavigationProperty}})
                   .WithMany()
                   .HasForeignKey(x => x.{{ForeignKeyProperty}})
                   .IsRequired({{#if IsRequired}}true{{else}}false{{/if}})
                   .OnDelete(DeleteBehavior.{{OnDeleteAction}});
            {{/if}}
            {{#if (eq Type 'OneToOne')}}
            builder.HasOne(x => x.{{TargetNavigationProperty}})
                   .WithOne()
                   .HasForeignKey<{{TargetEntity}}>(x => x.{{ForeignKeyProperty}})
                   .IsRequired({{#if IsRequired}}true{{else}}false{{/if}})
                   .OnDelete(DeleteBehavior.{{OnDeleteAction}});
            {{/if}}
            {{#if (eq Type 'ManyToMany')}}
            builder.HasMany(x => x.{{TargetNavigationProperty}})
                   .WithMany(x => x.{{SourceNavigationProperty}})
                   .UsingEntity(j => j.ToTable("{{JoinTableName}}"));
            {{/if}}
            {{/each}}

            // Indexes Configuration
            {{#each Indexes}}
            builder.HasIndex(x => new { {{#each Columns}}x.{{this}}{{#unless @last}}, {{/unless}}{{/each}} })
                   {{#if IsUnique}}.IsUnique(){{/if}};
            {{/each}}
        }
    }
}
