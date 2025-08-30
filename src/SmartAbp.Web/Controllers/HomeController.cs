using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Web.Controllers;

public class HomeController : AbpController
{
    public IActionResult Index()
    {
        return View();
    }
}