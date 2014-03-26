using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;

namespace Webapp.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
			var compilation = System.Web.Configuration.WebConfigurationManager.GetSection("system.web/compilation") as CompilationSection;
			ViewBag.isDebug = compilation != null && compilation.Debug;

            return View();
        }
	}
}